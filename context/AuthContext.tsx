import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User, UserRole, VerificationStatus } from '../types';
import { mapVerificationStatus } from '../services/supabaseService';
import { humanizeError } from '../services/errorFormatter';

interface AuthContextType {
  user: any | null;
  currentUser: User | null;
  role: UserRole;
  profile: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string; role?: UserRole }>;
  signInWithGoogle: (roleIntent?: 'customer' | 'agent') => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, profileData: {
    fullName: string;
    userType: 'customer' | 'agent';
    phone?: string;
    location?: string;
    specialization?: string;
    yearsExp?: number;
    serviceType?: string;
    bio?: string;
  }) => Promise<{ success: boolean; error?: string; role?: UserRole }>;
  completeProfile: (profileData: {
    fullName: string;
    userType: 'customer' | 'agent';
    phone: string;
    location: string;
    specialization?: string;
    yearsExp?: number;
    serviceType?: string;
    bio?: string;
  }) => Promise<{ success: boolean; error?: string; role?: UserRole }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [role, setRole] = useState<UserRole>(UserRole.CUSTOMER);
  const [loading, setLoading] = useState(true);

  // Derive a live User object from database session & profile
  const currentUser: User | null = user ? {
    id: user.id,
    name: profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
    email: user.email || '',
    role: role,
    avatar: profile?.avatar_url || '',
    phone: profile?.phone || '',
    address: profile?.location || '',
    verificationStatus: mapVerificationStatus(profile?.verification_status)
  } : null;

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (data) {
        setProfile(data);
        const userType = data.user_type?.toLowerCase();
        const targetRole = userType === 'admin' ? UserRole.ADMIN : (userType === 'agent' ? UserRole.AGENT : UserRole.CUSTOMER);
        setRole(targetRole);
        return { profile: data, role: targetRole };
      }
      return { profile: null, role: UserRole.CUSTOMER };
    } catch (err) {
      console.error('Error fetching profile from Supabase:', err);
      return { profile: null, role: UserRole.CUSTOMER };
    }
  };

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
        setRole(UserRole.CUSTOMER);
      }
      setLoading(false);
    });

    // Listen to real-time auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
        setRole(UserRole.CUSTOMER);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { success: false, error: humanizeError(error) };
      }

      if (data.user) {
        setUser(data.user);
        const profileRes = await fetchProfile(data.user.id);
        return { success: true, role: profileRes.role };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: humanizeError(err, 'Sign in request failed. Please check your network and try again.') };
    }
  };

  const signInWithGoogle = async (roleIntent: 'customer' | 'agent' = 'customer') => {
    try {
      sessionStorage.setItem('eb_auth_intent_role', roleIntent);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) {
        return { success: false, error: humanizeError(error) };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: humanizeError(err, 'Google sign-in request failed. Please try again.') };
    }
  };

  const completeProfile = async (profileData: {
    fullName: string;
    userType: 'customer' | 'agent';
    phone: string;
    location: string;
    specialization?: string;
    yearsExp?: number;
    serviceType?: string;
    bio?: string;
  }) => {
    if (!user?.id) {
      return { success: false, error: 'No active session found. Please sign in again.' };
    }

    try {
      // Normalize service_type for database constraint ('mobile' | 'studio' | 'hybrid' | null)
      let dbServiceType: 'mobile' | 'studio' | 'hybrid' | null = null;
      if (profileData.userType === 'agent') {
        const raw = (profileData.serviceType || '').toLowerCase();
        if (raw === 'in_shop' || raw === 'studio' || raw === 'salon') {
          dbServiceType = 'studio';
        } else if (raw === 'hybrid') {
          dbServiceType = 'hybrid';
        } else {
          dbServiceType = 'mobile';
        }
      } else {
        dbServiceType = null;
      }

      const updates: any = {
        id: user.id,
        user_type: profileData.userType,
        full_name: profileData.fullName.trim(),
        phone: profileData.phone.trim(),
        location: profileData.location,
        specialization: profileData.specialization?.trim() || '',
        years_exp: profileData.yearsExp || 0,
        service_type: dbServiceType,
        bio: profileData.bio?.trim() || '',
        verification_status: profileData.userType === 'agent' ? 'pending' : 'verified',
        email: user.email || '',
        avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url || '',
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(updates);

      if (error) {
        return { success: false, error: humanizeError(error) };
      }

      const targetRole = profileData.userType === 'agent' ? UserRole.AGENT : UserRole.CUSTOMER;
      setRole(targetRole);
      setProfile((prev: any) => ({ ...prev, ...updates }));
      await fetchProfile(user.id);
      return { success: true, role: targetRole };
    } catch (err: any) {
      return { success: false, error: humanizeError(err, 'Failed to complete profile. Please try again.') };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    profileData: {
      fullName: string;
      userType: 'customer' | 'agent';
      phone?: string;
      location?: string;
      specialization?: string;
      yearsExp?: number;
      serviceType?: string;
      bio?: string;
    }
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: profileData.fullName,
            user_type: profileData.userType
          }
        }
      });

      if (error) {
        return { success: false, error: humanizeError(error) };
      }

      if (data.user) {
        let dbServiceType: 'mobile' | 'studio' | 'hybrid' | null = null;
        if (profileData.userType === 'agent') {
          const raw = (profileData.serviceType || '').toLowerCase();
          if (raw === 'in_shop' || raw === 'studio' || raw === 'salon') {
            dbServiceType = 'studio';
          } else if (raw === 'hybrid') {
            dbServiceType = 'hybrid';
          } else {
            dbServiceType = 'mobile';
          }
        } else {
          dbServiceType = null;
        }

        const { error: profileErr } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            user_type: profileData.userType,
            full_name: profileData.fullName,
            phone: profileData.phone || '',
            location: profileData.location || '',
            specialization: profileData.specialization || '',
            years_exp: profileData.yearsExp || 0,
            service_type: dbServiceType,
            bio: profileData.bio || '',
            verification_status: profileData.userType === 'agent' ? 'pending' : 'verified',
            email: email,
            updated_at: new Date().toISOString()
          });

        if (profileErr) {
          console.error('[Everything Beauty System Error]:', profileErr);
        }

        setUser(data.user);
        await fetchProfile(data.user.id);
        const assignedRole = profileData.userType === 'agent' ? UserRole.AGENT : UserRole.CUSTOMER;
        return { success: true, role: assignedRole };
      }

      return { success: true, role: profileData.userType === 'agent' ? UserRole.AGENT : UserRole.CUSTOMER };
    } catch (err: any) {
      return { success: false, error: humanizeError(err, 'Registration failed. Please check your internet and try again.') };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setRole(UserRole.CUSTOMER);
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        currentUser,
        role,
        profile,
        loading,
        signIn,
        signInWithGoogle,
        signUp,
        completeProfile,
        signOut,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
