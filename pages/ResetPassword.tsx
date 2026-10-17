import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, Check, AlertCircle, KeyRound, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasValidSession, setHasValidSession] = useState<boolean | null>(null);

  useEffect(() => {
    // 1. Check if user already has an active session from recovery link
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (session) {
        setHasValidSession(true);
      } else {
        // Check if there is an access_token in the URL hash
        const hash = window.location.hash;
        if (hash && (hash.includes('access_token') || hash.includes('type=recovery'))) {
          setHasValidSession(true);
        } else {
          // Listen for recovery event
          const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
              setHasValidSession(true);
            }
          });
          // Short delay before concluding link is expired if no session arrives
          const timer = setTimeout(() => {
            setHasValidSession((prev) => (prev === null ? false : prev));
          }, 2000);

          return () => {
            authListener.subscription.unsubscribe();
            clearTimeout(timer);
          };
        }
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setHasValidSession(true);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      setIsSuccess(true);
      setLoading(false);

      // Auto redirect to auth after 3.5 seconds
      setTimeout(() => {
        navigate('/auth');
      }, 3500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update password');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-background dark:bg-[#0D0D0D] px-4 py-20">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2.5 mb-4 group">
            <div className="w-10 h-10 rounded-xl bg-brand-interactive text-white flex items-center justify-center font-serif font-black text-xl shadow-md group-hover:scale-105 transition-transform">
              EB
            </div>
            <span className="font-serif font-black text-2xl tracking-tight text-[#1A1A1A] dark:text-white">
              Everything Beauty
            </span>
          </Link>
        </div>

        {/* Card Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white dark:bg-[#161616] rounded-3xl p-6 sm:p-8 border border-[#E9ECEF] dark:border-[#262626] shadow-xl relative overflow-hidden"
        >
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-interactive/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          {isSuccess ? (
            /* Success State */
            <div className="text-center py-6">
              <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-md shadow-emerald-500/10">
                <Check className="w-10 h-10 stroke-[2.5]" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#1A1A1A] dark:text-white mb-3">
                Password Updated!
              </h2>
              <p className="text-sm text-[#6C757D] dark:text-[#A0A0A0] leading-relaxed mb-6">
                Your new password has been securely saved in Supabase. You can now use it to log in to your account.
              </p>
              <Link
                to="/auth"
                className="w-full py-3.5 bg-brand-interactive hover:bg-brand-interactive/90 text-white rounded-2xl font-black text-sm flex items-center justify-center space-x-2 shadow-md shadow-brand-interactive/25 active:scale-95 transition-all"
              >
                <span>Go to Login Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : hasValidSession === false ? (
            /* Invalid or Expired Link State */
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-black text-[#1A1A1A] dark:text-white mb-2">
                Reset Link Expired
              </h2>
              <p className="text-xs sm:text-sm text-[#6C757D] dark:text-[#A0A0A0] leading-relaxed mb-6">
                This password reset link is invalid or has expired. Please request a fresh reset link from the login page.
              </p>
              <Link
                to="/auth"
                className="w-full py-3.5 bg-brand-interactive hover:bg-brand-interactive/90 text-white rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-md shadow-brand-interactive/25 active:scale-95 transition-all"
              >
                <span>Request New Reset Link</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            /* New Password Form */
            <>
              <div className="mb-6">
                <div className="w-12 h-12 rounded-2xl bg-brand-interactive/10 text-brand-interactive flex items-center justify-center mb-4">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#1A1A1A] dark:text-white mb-2">
                  Create New Password
                </h1>
                <p className="text-xs sm:text-sm text-[#6C757D] dark:text-[#A0A0A0]">
                  Enter your new password below to regain full access to your account.
                </p>
              </div>

              {errorMsg && (
                <div className="mb-5 p-3.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-2xl flex items-center space-x-2.5 text-red-600 dark:text-red-400 text-xs font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-4">
                {/* New Password */}
                <div>
                  <label className="block text-xs font-bold text-[#1A1A1A] dark:text-[#CCC] mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6C757D]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      required
                      className="w-full pl-10 pr-10 py-3 rounded-2xl bg-brand-surface dark:bg-[#202020] border border-[#E9ECEF] dark:border-[#2D2D2D] text-sm text-[#1A1A1A] dark:text-white placeholder-[#999] focus:outline-none focus:border-brand-interactive transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#6C757D] hover:text-[#1A1A1A] dark:hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-bold text-[#1A1A1A] dark:text-[#CCC] mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6C757D]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                      required
                      className="w-full pl-10 pr-10 py-3 rounded-2xl bg-brand-surface dark:bg-[#202020] border border-[#E9ECEF] dark:border-[#2D2D2D] text-sm text-[#1A1A1A] dark:text-white placeholder-[#999] focus:outline-none focus:border-brand-interactive transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#6C757D] hover:text-[#1A1A1A] dark:hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Password strength hint */}
                <div className="flex items-center space-x-1.5 text-[11px] text-[#6C757D] pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-interactive" />
                  <span>Encrypted and secured by Supabase Auth</span>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 py-3.5 bg-brand-interactive hover:bg-brand-interactive/90 text-white rounded-2xl font-black text-sm shadow-md shadow-brand-interactive/25 active:scale-95 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Update Password</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPassword;
