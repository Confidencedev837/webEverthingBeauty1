import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User, UserRole, VerificationStatus } from '../types';
import { mapVerificationStatus } from '../services/supabaseService';

interface AuthContextType {
  user: any | null;
  currentUser: User | null;
  role: UserRole;
  profile: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string; role?: UserRole }>;
  signUp: (email: string, password: string, profileData: {
    fullName: string;
    userType: 'customer' | 'agent';
    phone?: string;
    location?: string;
    specialization?: string;
    yearsExp?: number;
    serviceType?: string;
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
        if (userType === 'admin') setRole(UserRole.ADMIN);
        else if (userType === 'agent') setRole(UserRole.AGENT);
        else setRole(UserRole.CUSTOMER);
      }
    } catch (err) {
      console.error('Error fetching profile from Supabase:', err);
    }
  };

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
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
        return { success: false, error: error.message };
      }

      if (data.user) {
        setUser(data.user);
        await fetchProfile(data.user.id);
        const userType = profile?.user_type?.toLowerCase();
        const targetRole = userType === 'admin' ? UserRole.ADMIN : (userType === 'agent' ? UserRole.AGENT : UserRole.CUSTOMER);
        return { success: true, role: targetRole };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Login request failed' };
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
        return { success: false, error: error.message };
      }

      if (data.user) {
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
            service_type: profileData.serviceType || 'hybrid',
            verification_status: profileData.userType === 'agent' ? 'pending' : 'verified',
            email: email,
            updated_at: new Date().toISOString()
          });

        if (profileErr) {
          console.warn('Profile sync notice:', profileErr.message);
        }

        setUser(data.user);
        await fetchProfile(data.user.id);
        const assignedRole = profileData.userType === 'agent' ? UserRole.AGENT : UserRole.CUSTOMER;
        return { success: true, role: assignedRole };
      }

      return { success: true, role: profileData.userType === 'agent' ? UserRole.AGENT : UserRole.CUSTOMER };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Registration failed' };
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
        signUp,
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
