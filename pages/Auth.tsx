import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User as UserIcon,
  Briefcase,
  Mail,
  Phone,
  Lock,
  MapPin,
  Scissors,
  Check,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Calendar,
  AlertCircle,
  Eye,
  EyeOff,
  KeyRound,
  ChevronLeft,
  Store,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { supabase } from '../lib/supabase';
import { humanizeError } from '../services/errorFormatter';
import { CANONICAL_SERVICE_CATEGORIES } from '../constants';

type AuthView = 'login' | 'signup' | 'forgot' | 'onboarding';

const NIGERIAN_STATES = [
  'Lagos', 'FCT - Abuja', 'Rivers', 'Oyo', 'Edo', 'Delta', 'Anambra', 'Enugu',
  'Abia', 'Adamawa', 'Akwa Ibom', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River',
  'Ebonyi', 'Ekiti', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi',
  'Kogi', 'Kwara', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Plateau', 'Sokoto',
  'Taraba', 'Yobe', 'Zamfara'
];

const POPULAR_SPECIALTIES = CANONICAL_SERVICE_CATEGORIES;

const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

const Auth: React.FC = () => {
  const { user, profile, loading: authLoading, signIn, signInWithGoogle, signUp, completeProfile } = useAuth();
  const navigate = useNavigate();

  const [view, setView] = useState<AuthView>('login');
  const [userType, setUserType] = useState<'customer' | 'agent'>('customer');
  const [agentStep, setAgentStep] = useState<1 | 2>(1);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  const isLogin = view === 'login';
  const [fullName, setFullName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('Lagos');
  const [specificArea, setSpecificArea] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [yearsExp, setYearsExp] = useState('3');
  const [serviceDelivery, setServiceDelivery] = useState<'doorstep' | 'in_shop'>('doorstep');
  const [bio, setBio] = useState('');

  // Step-wise submission progress states
  const [submitProgress, setSubmitProgress] = useState(0);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Auto-detect returning Google OAuth user or un-onboarded profile
  useEffect(() => {
    if (!authLoading && user) {
      if (profile?.user_type) {
        if (profile.user_type === 'admin') navigate('/admin/dashboard');
        else if (profile.user_type === 'agent') navigate('/agent/dashboard');
        else navigate('/');
      } else {
        const savedIntent = sessionStorage.getItem('eb_auth_intent_role');
        if (savedIntent === 'agent' || savedIntent === 'customer') {
          setUserType(savedIntent);
        }
        if (user.user_metadata?.full_name && !fullName) {
          setFullName(user.user_metadata.full_name);
        }
        setView('onboarding');
      }
    }
  }, [user, profile, authLoading, navigate]);

  // Google OAuth Trigger
  const handleGoogleAuth = async () => {
    setErrorMsg(null);
    setGoogleLoading(true);
    try {
      const res = await signInWithGoogle(userType);
      if (!res.success) {
        setErrorMsg(humanizeError(res.error, 'Failed to authenticate with Google.'));
        setGoogleLoading(false);
      }
    } catch (err: any) {
      setErrorMsg(humanizeError(err, 'An error occurred during Google sign-in.'));
      setGoogleLoading(false);
    }
  };

  // Agent Step 1 Validation
  const validateAgentStep1 = () => {
    if (!fullName.trim()) {
      setErrorMsg('Please enter your legal full name.');
      return false;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return false;
    }
    if (!phone.trim()) {
      setErrorMsg('Please enter your active WhatsApp phone number.');
      return false;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return false;
    }
    setErrorMsg(null);
    return true;
  };

  // Agent Step 1 Proceed
  const handleAgentStep1Continue = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateAgentStep1()) {
      setAgentStep(2);
    }
  };

  // Standard Email/Password Submission
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // If agent on Step 1, proceed to Step 2
    if (!isLogin && userType === 'agent' && agentStep === 1) {
      if (validateAgentStep1()) {
        setAgentStep(2);
      }
      return;
    }

    if (!isLogin && userType === 'agent') {
      if (!specialization.trim()) {
        setErrorMsg('Please select or specify your primary craft specialization.');
        return;
      }
    }

    setLoading(true);
    setSubmitProgress(14);
    setSubmitSuccess(false);

    const progressInterval = setInterval(() => {
      setSubmitProgress((prev) => {
        if (prev < 48) return prev + Math.floor(Math.random() * 14 + 10);
        if (prev < 75) return prev + Math.floor(Math.random() * 8 + 6);
        if (prev < 90) return prev + Math.floor(Math.random() * 4 + 2);
        if (prev < 97) return prev + 1;
        return prev;
      });
    }, 60);

    try {
      if (isLogin) {
        const res = await signIn(email, password);
        if (res.success) {
          clearInterval(progressInterval);
          setSubmitProgress(100);
          setSubmitSuccess(true);
          await new Promise((r) => setTimeout(r, 650));
          if (res.role === UserRole.ADMIN) navigate('/admin/dashboard');
          else if (res.role === UserRole.AGENT) navigate('/agent/dashboard');
          else navigate('/');
        } else {
          clearInterval(progressInterval);
          setSubmitProgress(0);
          setErrorMsg(humanizeError(res.error, 'Failed to sign in. Please verify your credentials.'));
          setLoading(false);
        }
      } else {
        const formattedLocation = specificArea.trim()
          ? `${specificArea.trim()}, ${location}`
          : location;
        const formattedName = brandName.trim()
          ? `${fullName.trim()} (${brandName.trim()})`
          : fullName.trim();

        const res = await signUp(email, password, {
          fullName: formattedName,
          userType,
          phone: phone.trim(),
          location: formattedLocation,
          specialization: userType === 'agent' ? specialization.trim() : undefined,
          yearsExp: userType === 'agent' ? parseInt(yearsExp) || 0 : undefined,
          serviceType: userType === 'agent' ? serviceDelivery : undefined,
          bio: userType === 'agent' ? bio.trim() : undefined
        });

        if (res.success) {
          clearInterval(progressInterval);
          setSubmitProgress(100);
          setSubmitSuccess(true);
          await new Promise((r) => setTimeout(r, 750));
          if (res.role === UserRole.AGENT) navigate('/agent/dashboard');
          else navigate('/');
        } else {
          clearInterval(progressInterval);
          setSubmitProgress(0);
          setErrorMsg(humanizeError(res.error, 'Failed to register account.'));
          setLoading(false);
        }
      }
    } catch (err: any) {
      clearInterval(progressInterval);
      setSubmitProgress(0);
      setErrorMsg(humanizeError(err, 'An unexpected authentication error occurred.'));
      setLoading(false);
    }
  };

  // Step-wise Onboarding Submission for Google Users
  const handleCompleteOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('Please provide your WhatsApp phone number for booking updates.');
      return;
    }
    if (userType === 'agent' && !specialization.trim()) {
      setErrorMsg('Please select or specify your beauty craft specialization.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSubmitProgress(15);
    setSubmitSuccess(false);

    const progressInterval = setInterval(() => {
      setSubmitProgress((prev) => {
        if (prev < 48) return prev + Math.floor(Math.random() * 14 + 10);
        if (prev < 75) return prev + Math.floor(Math.random() * 8 + 6);
        if (prev < 90) return prev + Math.floor(Math.random() * 4 + 2);
        if (prev < 97) return prev + 1;
        return prev;
      });
    }, 60);

    try {
      const formattedLocation = specificArea.trim()
        ? `${specificArea.trim()}, ${location}`
        : location;
      const formattedName = brandName.trim()
        ? `${fullName.trim()} (${brandName.trim()})`
        : fullName.trim();

      const res = await completeProfile({
        fullName: formattedName,
        userType,
        phone: phone.trim(),
        location: formattedLocation,
        specialization: userType === 'agent' ? specialization.trim() : undefined,
        yearsExp: userType === 'agent' ? parseInt(yearsExp) || 0 : undefined,
        serviceType: userType === 'agent' ? serviceDelivery : undefined,
        bio: userType === 'agent' ? bio.trim() : undefined
      });

      if (res.success) {
        clearInterval(progressInterval);
        setSubmitProgress(100);
        setSubmitSuccess(true);
        sessionStorage.removeItem('eb_auth_intent_role');

        await new Promise((r) => setTimeout(r, 750));

        if (res.role === UserRole.AGENT) {
          navigate('/agent/dashboard');
        } else {
          navigate('/');
        }
      } else {
        clearInterval(progressInterval);
        setSubmitProgress(0);
        setErrorMsg(humanizeError(res.error, 'Failed to complete profile.'));
        setLoading(false);
      }
    } catch (err: any) {
      clearInterval(progressInterval);
      setSubmitProgress(0);
      setErrorMsg(humanizeError(err, 'An unexpected error occurred.'));
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setErrorMsg('Please enter your email address');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), {
        redirectTo: `${window.location.origin}/#/reset-password`,
      });
      if (error) {
        setErrorMsg(humanizeError(error, 'Failed to send password reset email.'));
        setLoading(false);
        return;
      }
      setLoading(false);
      setForgotSuccess(true);
    } catch (err: any) {
      setErrorMsg(humanizeError(err, 'Failed to send password reset email.'));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-brand-background dark:bg-[#0D0D0D] pt-20">
      {/* Brand Showcase Side (Desktop) */}
      <div className="hidden lg:flex w-1/2 bg-brand-interactive relative overflow-hidden items-center justify-center p-20 text-white">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=1000&auto=format&fit=crop"
            className="w-full h-full object-cover opacity-60 grayscale"
            alt="Everything Beauty Background"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-brand-interactive via-brand-interactive/85 to-[#1a062b]/90" />
        </div>
        <div className="relative z-10 max-w-lg">
          <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
            <h1 className="text-7xl font-serif font-black mb-8 leading-tight tracking-tight">
              Everything <br />
              <span className="italic opacity-85">Beauty.</span>
            </h1>
            <p className="text-xl font-medium leading-relaxed mb-10 opacity-90">
              The premier on-demand beauty marketplace in Nigeria. Connecting verified specialists directly with doorstep clients.
            </p>
            <div className="space-y-6">
              {[
                'Vetted, verified beauty specialists only',
                'Transparent, upfront pricing in Nigerian Naira (₦)',
                'Escrow-secured cashless client bookings',
                'Real-time WhatsApp appointment updates'
              ].map((benefit, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="flex items-center space-x-4"
                >
                  <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shrink-0">
                    <Check className="w-5 h-5 stroke-[2.8]" />
                  </div>
                  <span className="text-base font-bold tracking-tight">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Interactive Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-16 overflow-y-auto">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">
            {/* ── FORGOT PASSWORD VIEW ── */}
            {view === 'forgot' && (
              <motion.div
                key="forgot"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
              >
                <button
                  onClick={() => {
                    setView('login');
                    setForgotSuccess(false);
                    setErrorMsg(null);
                  }}
                  className="flex items-center space-x-2 text-sm font-black text-[#6C757D] hover:text-brand-interactive transition-colors mb-8 group cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  <span>Back to Login</span>
                </button>

                {forgotSuccess ? (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                    <div className="w-20 h-20 rounded-3xl bg-green-500/10 border border-green-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-6">
                      <Check className="w-10 h-10 stroke-[2.5]" />
                    </div>
                    <h2 className="text-3xl font-serif font-bold text-[#1A1A1A] dark:text-white mb-3">
                      Check your inbox
                    </h2>
                    <p className="text-base text-[#6C757D] dark:text-[#A0A0A0] font-medium leading-relaxed mb-8">
                      We sent a secure password reset link to<br />
                      <span className="text-brand-interactive font-black">{forgotEmail}</span>
                    </p>
                    <p className="text-sm text-[#6C757D] font-medium">
                      Did not receive it?{' '}
                      <button
                        onClick={() => setForgotSuccess(false)}
                        className="text-brand-interactive font-black hover:underline cursor-pointer"
                      >
                        Resend
                      </button>
                    </p>
                  </motion.div>
                ) : (
                  <>
                    <div className="mb-8">
                      <div className="w-14 h-14 rounded-2xl bg-brand-interactive/10 flex items-center justify-center mb-5 text-brand-interactive">
                        <KeyRound className="w-7 h-7" />
                      </div>
                      <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#1A1A1A] dark:text-white mb-2">
                        Forgot Password?
                      </h2>
                      <p className="text-sm sm:text-base text-[#6C757D] dark:text-[#A0A0A0] font-medium">
                        Enter your registered email and we will send you a reset link.
                      </p>
                    </div>

                    {errorMsg && (
                      <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-2xl flex items-center space-x-3 text-red-600 dark:text-red-400 text-sm">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <span>{errorMsg}</span>
                      </div>
                    )}

                    <form onSubmit={handleForgotPassword} className="space-y-6">
                      <Input
                        icon={<Mail />}
                        label="Email Address"
                        type="email"
                        placeholder="yourname@gmail.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        required
                      />
                      <button
                        type="submit"
                        disabled={loading}
                        className="tactile-3d w-full py-4 bg-brand-interactive text-white rounded-2xl font-black text-base hover:bg-brand-interactive/90 transition-all shadow-lg shadow-brand-interactive/25 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60"
                      >
                        {loading ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <span>Send Reset Link</span>
                            <ArrowRight className="w-5 h-5" />
                          </>
                        )}
                      </button>
                    </form>
                  </>
                )}
              </motion.div>
            )}

            {/* ── STEP-WISE ONBOARDING VIEW (FOR GOOGLE USERS) ── */}
            {view === 'onboarding' && (
              <motion.div
                key="onboarding"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-xl bg-brand-interactive/10 dark:bg-brand-interactive/20 text-brand-interactive text-xs font-black uppercase tracking-wider mb-2.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Quick Profile Setup</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-serif font-black text-[#1A1A1A] dark:text-white mb-2">
                    Welcome, {fullName ? fullName.split(' ')[0] : 'there'}!
                  </h2>
                  <p className="text-sm sm:text-base text-[#6C757D] dark:text-[#A0A0A0] font-medium max-w-sm mx-auto">
                    Just a few quick details to personalize your Nigerian beauty experience.
                  </p>
                </div>

                {errorMsg && (
                  <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-2xl flex items-center space-x-3 text-red-600 dark:text-red-400 text-sm">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleCompleteOnboarding} className="space-y-5">
                  {/* Account Type Selector Cards */}
                  <div>
                    <label className="text-xs font-black text-[#6C757D] uppercase tracking-wider block mb-2">
                      Choose Your Account Type
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div
                        onClick={() => setUserType('customer')}
                        className={`tactile-3d p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                          userType === 'customer'
                            ? 'bg-brand-interactive/10 dark:bg-brand-interactive/20 border-brand-interactive shadow-md'
                            : 'bg-brand-surface/40 dark:bg-[#1A1A1A] border-[#E9ECEF] dark:border-[#2D2D2D] hover:border-brand-interactive/30'
                        }`}
                      >
                        <div className="flex items-center space-x-3 mb-1.5">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                              userType === 'customer'
                                ? 'bg-brand-interactive text-white'
                                : 'bg-black/5 dark:bg-white/5 text-[#6C757D]'
                            }`}
                          >
                            <UserIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-[#1A1A1A] dark:text-white">Customer</h4>
                            <span className="text-[10px] font-bold text-brand-interactive uppercase tracking-wider">Book Services</span>
                          </div>
                        </div>
                        <p className="text-[11px] text-[#6C757D] dark:text-[#A0A0A0] leading-snug">
                          Discover and book verified doorstep stylists and appointments across Nigeria.
                        </p>
                      </div>

                      <div
                        onClick={() => setUserType('agent')}
                        className={`tactile-3d p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                          userType === 'agent'
                            ? 'bg-brand-interactive/10 dark:bg-brand-interactive/20 border-brand-interactive shadow-md'
                            : 'bg-brand-surface/40 dark:bg-[#1A1A1A] border-[#E9ECEF] dark:border-[#2D2D2D] hover:border-brand-interactive/30'
                        }`}
                      >
                        <div className="flex items-center space-x-3 mb-1.5">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                              userType === 'agent'
                                ? 'bg-brand-interactive text-white'
                                : 'bg-black/5 dark:bg-white/5 text-[#6C757D]'
                            }`}
                          >
                            <Briefcase className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-[#1A1A1A] dark:text-white">Beauty Specialist</h4>
                            <span className="text-[10px] font-bold text-brand-interactive uppercase tracking-wider">Offer Services</span>
                          </div>
                        </div>
                        <p className="text-[11px] text-[#6C757D] dark:text-[#A0A0A0] leading-snug">
                          List your craft, receive bookings from paying clients, and grow your brand.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Shared Details */}
                  <Input
                    icon={<UserIcon />}
                    label="Personal Full Name"
                    placeholder="e.g. Amaka Okafor"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />

                  {userType === 'agent' && (
                    <Input
                      icon={<Briefcase />}
                      label="Brand / Business Name (Optional)"
                      placeholder="e.g. Glitz Glam Studio"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                    />
                  )}

                  <Input
                    icon={<Phone />}
                    label="WhatsApp Phone Number"
                    type="tel"
                    placeholder="+234 800 000 0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />

                  {/* Location Area & State */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-[#6C757D] flex items-center space-x-2 tracking-[0.15em] uppercase">
                        <span className="text-brand-interactive"><MapPin className="w-4 h-4" /></span>
                        <span>State</span>
                      </label>
                      <select
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full p-4 bg-brand-surface dark:bg-[#1A1A1A] border border-[#E9ECEF] dark:border-[#2D2D2D] focus:border-brand-interactive rounded-2xl outline-none font-semibold text-sm appearance-none text-[#1A1A1A] dark:text-white"
                      >
                        {NIGERIAN_STATES.map((state) => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-[#6C757D] flex items-center space-x-2 tracking-[0.15em] uppercase">
                        <span className="text-brand-interactive"><MapPin className="w-4 h-4" /></span>
                        <span>Area / District</span>
                      </label>
                      <input
                        type="text"
                        value={specificArea}
                        onChange={(e) => setSpecificArea(e.target.value)}
                        placeholder="e.g. Lekki Phase 1, Wuse 2"
                        className="w-full p-4 bg-brand-surface dark:bg-[#1A1A1A] border border-[#E9ECEF] dark:border-[#2D2D2D] focus:border-brand-interactive rounded-2xl outline-none font-semibold text-sm text-[#1A1A1A] dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Specialist-Specific Details */}
                  {userType === 'agent' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-5 pt-1"
                    >
                      <div className="space-y-2">
                        <label className="text-xs font-black text-[#6C757D] flex items-center space-x-2 tracking-[0.15em] uppercase">
                          <span className="text-brand-interactive"><Scissors className="w-4 h-4" /></span>
                          <span>Primary Craft / Specialization</span>
                        </label>
                        <input
                          type="text"
                          value={specialization}
                          onChange={(e) => setSpecialization(e.target.value)}
                          placeholder="e.g. Bridal Makeup, Knotless Braids, Fade Cuts"
                          className="w-full p-4 bg-brand-surface dark:bg-[#1A1A1A] border border-[#E9ECEF] dark:border-[#2D2D2D] focus:border-brand-interactive rounded-2xl outline-none font-semibold text-sm text-[#1A1A1A] dark:text-white"
                        />
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {POPULAR_SPECIALTIES.map((spec) => (
                            <button
                              key={spec}
                              type="button"
                              onClick={() => setSpecialization(spec)}
                              className="px-2.5 py-1 rounded-xl bg-brand-surface dark:bg-[#222] border border-[#E9ECEF] dark:border-[#333] hover:border-brand-interactive text-[11px] font-bold text-[#1A1A1A] dark:text-white cursor-pointer"
                            >
                              {spec}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="space-y-2">
                          <label className="text-xs font-black text-[#6C757D] flex items-center space-x-2 tracking-[0.15em] uppercase">
                            <span className="text-brand-interactive"><Calendar className="w-4 h-4" /></span>
                            <span>Years of Experience</span>
                          </label>
                          <select
                            value={yearsExp}
                            onChange={(e) => setYearsExp(e.target.value)}
                            className="w-full p-3.5 bg-brand-surface dark:bg-[#1A1A1A] border border-[#E9ECEF] dark:border-[#2D2D2D] focus:border-brand-interactive rounded-2xl outline-none font-semibold text-sm text-[#1A1A1A] dark:text-white"
                          >
                            <option value="1">1 year</option>
                            <option value="2">2 years</option>
                            <option value="3">3 years</option>
                            <option value="5">5+ years</option>
                            <option value="8">8+ years</option>
                            <option value="10">10+ years</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-black text-[#6C757D] flex items-center space-x-2 tracking-[0.15em] uppercase">
                            <span className="text-brand-interactive"><Store className="w-4 h-4" /></span>
                            <span>Service Delivery</span>
                          </label>
                          <select
                            value={serviceDelivery}
                            onChange={(e) => setServiceDelivery(e.target.value as 'doorstep' | 'in_shop')}
                            className="w-full p-3.5 bg-brand-surface dark:bg-[#1A1A1A] border border-[#E9ECEF] dark:border-[#2D2D2D] focus:border-brand-interactive rounded-2xl outline-none font-semibold text-sm text-[#1A1A1A] dark:text-white"
                          >
                            <option value="doorstep">Doorstep Service (Travel to Client)</option>
                            <option value="in_shop">Studio / Salon Visit</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-black text-[#6C757D] flex items-center space-x-2 tracking-[0.15em] uppercase">
                          <span className="text-brand-interactive"><FileText className="w-4 h-4" /></span>
                          <span>Professional Bio / Craft Pitch (Optional)</span>
                        </label>
                        <textarea
                          rows={2}
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Tell clients about your technique, hygiene standards, and style..."
                          className="w-full p-3.5 bg-brand-surface dark:bg-[#1A1A1A] border border-[#E9ECEF] dark:border-[#2D2D2D] focus:border-brand-interactive rounded-2xl outline-none font-semibold text-xs sm:text-sm text-[#1A1A1A] dark:text-white placeholder:text-[#888]"
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Completion Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className={`tactile-3d relative overflow-hidden w-full py-4 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center space-x-2.5 cursor-pointer disabled:opacity-90 transition-all duration-300 ${
                      submitSuccess
                        ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/30'
                        : 'bg-brand-interactive text-white shadow-lg shadow-brand-interactive/30 hover:bg-brand-interactive/90'
                    }`}
                  >
                    {loading && !submitSuccess && (
                      <div
                        className="absolute bottom-0 left-0 h-1.5 bg-white/70 transition-all duration-150 ease-out"
                        style={{ width: `${submitProgress}%` }}
                      />
                    )}

                    {submitSuccess ? (
                      <motion.div
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                        className="flex items-center space-x-2 text-white font-black"
                      >
                        <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
                          <Check className="w-4 h-4 stroke-[3.5] text-white" />
                        </div>
                        <span>Profile Complete!</span>
                      </motion.div>
                    ) : loading ? (
                      <div className="flex items-center space-x-2 text-white">
                        <CheckCircle2 className="w-5 h-5 stroke-[2.2] animate-spin" />
                        <span>Finalizing Setup... {submitProgress}%</span>
                      </div>
                    ) : (
                      <>
                        <span>Finish & Enter Marketplace</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {/* ── STANDARD LOGIN / SIGNUP VIEW ── */}
            {view !== 'forgot' && view !== 'onboarding' && (
              <motion.div
                key={view}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
              >
                {/* Header with grounded, realistic, role-tailored text */}
                <div className="text-center mb-6">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black text-[#1A1A1A] dark:text-white mb-2.5 tracking-tight">
                    {isLogin
                      ? 'Welcome Back'
                      : userType === 'agent'
                      ? agentStep === 1
                        ? 'Join Nigeria’s Elite Specialists'
                        : 'Your Specialist Profile'
                      : 'Experience Doorstep Beauty'}
                  </h2>
                  <p className="text-sm sm:text-base text-[#6C757D] dark:text-[#A0A0A0] font-medium max-w-sm mx-auto leading-relaxed">
                    {isLogin
                      ? 'Continue to your appointments, favorite artists, and saved looks.'
                      : userType === 'agent'
                      ? agentStep === 1
                        ? 'Step 1 of 2: Create your specialist login and WhatsApp contact.'
                        : 'Step 2 of 2: Tell clients about your craft, location, and coverage.'
                      : 'Book verified beauty specialists delivered straight to your home or studio across Nigeria.'}
                  </p>
                </div>

                {errorMsg && (
                  <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-2xl flex items-center space-x-3 text-red-600 dark:text-red-400 text-sm">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Role Switcher for Signup */}
                {!isLogin && (
                  <div className="relative flex p-1.5 bg-brand-surface dark:bg-[#1A1A1A] rounded-2xl shadow-inner border border-[#E9ECEF] dark:border-[#2D2D2D] mb-5">
                    <div
                      className={`absolute inset-1.5 w-[calc(50%-6px)] bg-brand-interactive rounded-xl transition-all duration-300 shadow-md ${
                        userType === 'agent' ? 'translate-x-full' : ''
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setUserType('customer');
                        setAgentStep(1);
                        setErrorMsg(null);
                      }}
                      className={`relative z-10 flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl transition-colors font-bold text-xs sm:text-sm cursor-pointer ${
                        userType === 'customer' ? 'text-white' : 'text-[#6C757D]'
                      }`}
                    >
                      <UserIcon className="w-4 h-4" />
                      <span>Customer</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUserType('agent');
                        setErrorMsg(null);
                      }}
                      className={`relative z-10 flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl transition-colors font-bold text-xs sm:text-sm cursor-pointer ${
                        userType === 'agent' ? 'text-white' : 'text-[#6C757D]'
                      }`}
                    >
                      <Briefcase className="w-4 h-4" />
                      <span>Beauty Agent</span>
                    </button>
                  </div>
                )}

                {/* Google Sign In Button (Shown on Login and on Step 1 of Signup) */}
                {(isLogin || (!isLogin && agentStep === 1)) && (
                  <>
                    <button
                      type="button"
                      onClick={handleGoogleAuth}
                      disabled={googleLoading}
                      className="tactile-3d w-full py-3.5 sm:py-4 px-5 rounded-2xl bg-white dark:bg-[#1A1A1A] border border-[#E9ECEF] dark:border-[#2D2D2D] hover:border-brand-interactive/50 text-[#1A1A1A] dark:text-white font-bold text-xs sm:text-sm flex items-center justify-center space-x-3 shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-70"
                    >
                      {googleLoading ? (
                        <div className="w-5 h-5 border-2 border-brand-interactive/30 border-t-brand-interactive rounded-full animate-spin" />
                      ) : (
                        <>
                          <GoogleIcon />
                          <span>
                            {isLogin
                              ? 'Sign in with Google'
                              : userType === 'agent'
                              ? 'Join as Agent with Google'
                              : 'Sign up with Google'}
                          </span>
                        </>
                      )}
                    </button>

                    {/* Divider */}
                    <div className="relative my-5">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-[#E9ECEF] dark:border-[#262626]" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase tracking-wider">
                        <span className="bg-brand-background dark:bg-[#0D0D0D] px-4 text-[#888] font-bold">
                          Or continue with email
                        </span>
                      </div>
                    </div>
                  </>
                )}

                <form onSubmit={handleAuth} className="space-y-4">
                  {/* ================= CUSTOMER SIGNUP: FAST 1-STEP ================= */}
                  {!isLogin && userType === 'customer' && (
                    <>
                      <Input
                        icon={<UserIcon />}
                        label="Full Name"
                        placeholder="e.g. Chinelo Adebayo"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                      <Input
                        icon={<Mail />}
                        label="Email Address"
                        type="email"
                        placeholder="yourname@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                      <Input
                        icon={<Phone />}
                        label="WhatsApp Phone Number"
                        type="tel"
                        placeholder="+234 800 000 0000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />

                      <div className="space-y-2">
                        <label className="text-xs font-black text-[#6C757D] flex items-center space-x-2 tracking-[0.15em] uppercase">
                          <span className="text-brand-interactive"><MapPin className="w-4 h-4" /></span>
                          <span>City / State</span>
                        </label>
                        <select
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="w-full p-4 bg-brand-surface dark:bg-[#1A1A1A] border border-[#E9ECEF] dark:border-[#2D2D2D] focus:border-brand-interactive rounded-2xl outline-none transition-all font-semibold text-sm appearance-none text-[#1A1A1A] dark:text-white"
                        >
                          {NIGERIAN_STATES.map((state) => (
                            <option key={state} value={state}>{state}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <PasswordInput
                          label="Password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          show={showPassword}
                          onToggle={() => setShowPassword((v) => !v)}
                          required
                        />
                      </div>
                    </>
                  )}

                  {/* ================= BEAUTY AGENT SIGNUP: 2-STEP WIZARD ================= */}
                  {!isLogin && userType === 'agent' && (
                    <>
                      {/* Step Indicator */}
                      <div className="flex items-center justify-between px-1 mb-2">
                        <span className="text-xs font-black uppercase tracking-wider text-brand-interactive">
                          Step {agentStep} of 2
                        </span>
                        <div className="flex space-x-1.5">
                          <div className={`h-1.5 w-8 rounded-full ${agentStep >= 1 ? 'bg-brand-interactive' : 'bg-black/10 dark:bg-white/10'}`} />
                          <div className={`h-1.5 w-8 rounded-full ${agentStep === 2 ? 'bg-brand-interactive' : 'bg-black/10 dark:bg-white/10'}`} />
                        </div>
                      </div>

                      {/* AGENT STEP 1: IDENTITY & CREDENTIALS */}
                      {agentStep === 1 && (
                        <motion.div
                          key="agent-step-1"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className="space-y-4"
                        >
                          <Input
                            icon={<UserIcon />}
                            label="Personal Full Name"
                            placeholder="e.g. Amaka Okafor"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                          />

                          <Input
                            icon={<Briefcase />}
                            label="Brand / Business Name (Optional)"
                            placeholder="e.g. Glitz Glam Studio"
                            value={brandName}
                            onChange={(e) => setBrandName(e.target.value)}
                          />

                          <Input
                            icon={<Mail />}
                            label="Email Address"
                            type="email"
                            placeholder="yourname@gmail.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />

                          <Input
                            icon={<Phone />}
                            label="WhatsApp Phone Number"
                            type="tel"
                            placeholder="+234 800 000 0000"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                          />

                          <div className="space-y-1">
                            <PasswordInput
                              label="Create Password"
                              placeholder="••••••••"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              show={showPassword}
                              onToggle={() => setShowPassword((v) => !v)}
                              required
                            />
                          </div>
                        </motion.div>
                      )}

                      {/* AGENT STEP 2: LOCATION, CRAFT & COVERAGE */}
                      {agentStep === 2 && (
                        <motion.div
                          key="agent-step-2"
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="space-y-4"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <label className="text-xs font-black text-[#6C757D] flex items-center space-x-2 tracking-[0.15em] uppercase">
                                <span className="text-brand-interactive"><MapPin className="w-4 h-4" /></span>
                                <span>Operating State</span>
                              </label>
                              <select
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full p-3.5 bg-brand-surface dark:bg-[#1A1A1A] border border-[#E9ECEF] dark:border-[#2D2D2D] focus:border-brand-interactive rounded-2xl outline-none font-semibold text-sm appearance-none text-[#1A1A1A] dark:text-white"
                              >
                                {NIGERIAN_STATES.map((state) => (
                                  <option key={state} value={state}>{state}</option>
                                ))}
                              </select>
                            </div>

                            <div className="space-y-2">
                              <label className="text-xs font-black text-[#6C757D] flex items-center space-x-2 tracking-[0.15em] uppercase">
                                <span className="text-brand-interactive"><MapPin className="w-4 h-4" /></span>
                                <span>Area / District</span>
                              </label>
                              <input
                                type="text"
                                value={specificArea}
                                onChange={(e) => setSpecificArea(e.target.value)}
                                placeholder="e.g. Lekki Phase 1, Wuse 2"
                                className="w-full p-3.5 bg-brand-surface dark:bg-[#1A1A1A] border border-[#E9ECEF] dark:border-[#2D2D2D] focus:border-brand-interactive rounded-2xl outline-none font-semibold text-sm text-[#1A1A1A] dark:text-white"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-black text-[#6C757D] flex items-center space-x-2 tracking-[0.15em] uppercase">
                              <span className="text-brand-interactive"><Scissors className="w-4 h-4" /></span>
                              <span>Primary Craft / Specialization</span>
                            </label>
                            <input
                              type="text"
                              value={specialization}
                              onChange={(e) => setSpecialization(e.target.value)}
                              placeholder="e.g. Bridal Makeup, Knotless Braids, Fade Cuts"
                              className="w-full p-3.5 bg-brand-surface dark:bg-[#1A1A1A] border border-[#E9ECEF] dark:border-[#2D2D2D] focus:border-brand-interactive rounded-2xl outline-none font-semibold text-sm text-[#1A1A1A] dark:text-white"
                              required
                            />
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {POPULAR_SPECIALTIES.map((spec) => (
                                <button
                                  key={spec}
                                  type="button"
                                  onClick={() => setSpecialization(spec)}
                                  className="px-2.5 py-1 rounded-xl bg-brand-surface dark:bg-[#222] border border-[#E9ECEF] dark:border-[#333] hover:border-brand-interactive text-[11px] font-bold text-[#1A1A1A] dark:text-white cursor-pointer"
                                >
                                  {spec}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <label className="text-xs font-black text-[#6C757D] flex items-center space-x-2 tracking-[0.15em] uppercase">
                                <span className="text-brand-interactive"><Calendar className="w-4 h-4" /></span>
                                <span>Years of Exp.</span>
                              </label>
                              <select
                                value={yearsExp}
                                onChange={(e) => setYearsExp(e.target.value)}
                                className="w-full p-3.5 bg-brand-surface dark:bg-[#1A1A1A] border border-[#E9ECEF] dark:border-[#2D2D2D] focus:border-brand-interactive rounded-2xl outline-none font-semibold text-sm text-[#1A1A1A] dark:text-white"
                              >
                                <option value="1">1 year</option>
                                <option value="2">2 years</option>
                                <option value="3">3 years</option>
                                <option value="5">5+ years</option>
                                <option value="8">8+ years</option>
                                <option value="10">10+ years</option>
                              </select>
                            </div>

                            <div className="space-y-2">
                              <label className="text-xs font-black text-[#6C757D] flex items-center space-x-2 tracking-[0.15em] uppercase">
                                <span className="text-brand-interactive"><Store className="w-4 h-4" /></span>
                                <span>Service Delivery</span>
                              </label>
                              <select
                                value={serviceDelivery}
                                onChange={(e) => setServiceDelivery(e.target.value as 'doorstep' | 'in_shop')}
                                className="w-full p-3.5 bg-brand-surface dark:bg-[#1A1A1A] border border-[#E9ECEF] dark:border-[#2D2D2D] focus:border-brand-interactive rounded-2xl outline-none font-semibold text-sm text-[#1A1A1A] dark:text-white"
                              >
                                <option value="doorstep">Doorstep (Travel to Client)</option>
                                <option value="in_shop">Studio / Salon Visit</option>
                              </select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-black text-[#6C757D] flex items-center space-x-2 tracking-[0.15em] uppercase">
                              <span className="text-brand-interactive"><FileText className="w-4 h-4" /></span>
                              <span>Short Bio / Client Pitch</span>
                            </label>
                            <textarea
                              rows={2}
                              value={bio}
                              onChange={(e) => setBio(e.target.value)}
                              placeholder="Tell clients about your technique, hygiene standards, and style..."
                              className="w-full p-3.5 bg-brand-surface dark:bg-[#1A1A1A] border border-[#E9ECEF] dark:border-[#2D2D2D] focus:border-brand-interactive rounded-2xl outline-none font-semibold text-xs sm:text-sm text-[#1A1A1A] dark:text-white placeholder:text-[#888]"
                            />
                          </div>
                        </motion.div>
                      )}
                    </>
                  )}

                  {/* ================= LOGIN FORM ================= */}
                  {isLogin && (
                    <>
                      <Input
                        icon={<Mail />}
                        label="Email Address"
                        type="email"
                        placeholder="yourname@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />

                      <div className="space-y-1">
                        <PasswordInput
                          label="Password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          show={showPassword}
                          onToggle={() => setShowPassword((v) => !v)}
                          required
                        />
                        <div className="text-right pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setView('forgot');
                              setErrorMsg(null);
                            }}
                            className="text-xs text-brand-interactive font-black hover:underline cursor-pointer"
                          >
                            Forgot password?
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {/* ================= BUTTON CONTROLS ================= */}
                  {!isLogin && userType === 'agent' && agentStep === 1 ? (
                    <button
                      type="button"
                      onClick={handleAgentStep1Continue}
                      className="tactile-3d w-full py-4 bg-brand-interactive text-white rounded-2xl font-black text-sm sm:text-base hover:bg-brand-interactive/90 transition-all shadow-lg shadow-brand-interactive/30 flex items-center justify-center space-x-2.5 cursor-pointer"
                    >
                      <span>Continue to Specialist Profile</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  ) : (
                    <div className="flex items-center space-x-3 pt-2">
                      {!isLogin && userType === 'agent' && agentStep === 2 && (
                        <button
                          type="button"
                          onClick={() => {
                            setAgentStep(1);
                            setErrorMsg(null);
                          }}
                          disabled={loading}
                          className="tactile-3d px-5 py-4 rounded-2xl bg-white dark:bg-[#1A1A1A] border border-[#E9ECEF] dark:border-[#2D2D2D] text-xs font-bold text-[#1A1A1A] dark:text-white flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>Back</span>
                        </button>
                      )}

                      <button
                        type="submit"
                        disabled={loading}
                        className={`tactile-3d relative overflow-hidden flex-1 py-4 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center space-x-2.5 cursor-pointer disabled:opacity-90 transition-all duration-300 ${
                          submitSuccess
                            ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/30'
                            : 'bg-brand-interactive text-white shadow-lg shadow-brand-interactive/30 hover:bg-brand-interactive/90'
                        }`}
                      >
                        {loading && !submitSuccess && (
                          <div
                            className="absolute bottom-0 left-0 h-1.5 bg-white/70 transition-all duration-150 ease-out"
                            style={{ width: `${submitProgress}%` }}
                          />
                        )}

                        {submitSuccess ? (
                          <motion.div
                            initial={{ scale: 0.6, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                            className="flex items-center space-x-2 text-white font-black"
                          >
                            <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
                              <Check className="w-4 h-4 stroke-[3.5] text-white" />
                            </div>
                            <span>
                              {isLogin
                                ? 'Welcome Back!'
                                : userType === 'agent'
                                ? 'Agent Account Ready!'
                                : 'Account Created!'}
                            </span>
                          </motion.div>
                        ) : loading ? (
                          <div className="flex items-center space-x-2 text-white">
                            <CheckCircle2 className="w-5 h-5 stroke-[2.2] animate-spin" />
                            <span>
                              {isLogin ? 'Signing In...' : 'Creating Account...'} {submitProgress}%
                            </span>
                          </div>
                        ) : (
                          <>
                            <span>
                              {isLogin
                                ? 'Sign In Now'
                                : userType === 'agent'
                                ? 'Complete Specialist Registration'
                                : 'Create My Account'}
                            </span>
                            <ArrowRight className="w-5 h-5" />
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  <div className="text-center pt-3">
                    <p className="text-[#6C757D] font-medium text-sm">
                      {isLogin ? "Don't have an account yet?" : 'Already a registered member?'}
                      <button
                        type="button"
                        onClick={() => {
                          setView(isLogin ? 'signup' : 'login');
                          setAgentStep(1);
                          setErrorMsg(null);
                        }}
                        className="ml-2 text-brand-interactive font-black hover:underline cursor-pointer"
                      >
                        {isLogin ? 'Sign Up' : 'Sign In'}
                      </button>
                    </p>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const Input: React.FC<{
  icon: React.ReactNode;
  label: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}> = ({ icon, label, type = 'text', placeholder, value, onChange, required }) => (
  <div className="space-y-2">
    <label className="text-xs font-black text-[#6C757D] flex items-center space-x-2 tracking-[0.15em] uppercase">
      <span className="text-brand-interactive">{icon}</span>
      <span>{label}</span>
    </label>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full p-4 bg-brand-surface dark:bg-[#1A1A1A] border border-[#E9ECEF] dark:border-[#2D2D2D] focus:border-brand-interactive rounded-2xl outline-none transition-all font-semibold text-sm text-[#1A1A1A] dark:text-white placeholder:text-[#888]"
    />
  </div>
);

const PasswordInput: React.FC<{
  label: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  show: boolean;
  onToggle: () => void;
  required?: boolean;
}> = ({ label, placeholder, value, onChange, show, onToggle, required }) => (
  <div className="space-y-2">
    <label className="text-xs font-black text-[#6C757D] flex items-center space-x-2 tracking-[0.15em] uppercase">
      <span className="text-brand-interactive"><Lock className="w-4 h-4" /></span>
      <span>{label}</span>
    </label>
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full p-4 pr-12 bg-brand-surface dark:bg-[#1A1A1A] border border-[#E9ECEF] dark:border-[#2D2D2D] focus:border-brand-interactive rounded-2xl outline-none transition-all font-semibold text-sm text-[#1A1A1A] dark:text-white placeholder:text-[#888]"
      />
      <button
        type="button"
        onClick={onToggle}
        tabIndex={-1}
        aria-label={show ? 'Hide password' : 'Show password'}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6C757D] hover:text-brand-interactive transition-colors p-1 cursor-pointer"
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  </div>
);

export default Auth;
