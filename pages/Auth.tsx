import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User as UserIcon, Briefcase, Mail, Phone, Lock, MapPin, Scissors, Check, ArrowRight, Calendar, AlertCircle, Eye, EyeOff, KeyRound, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

type AuthView = 'login' | 'signup' | 'forgot';

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River",
  "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe", "Imo", "Jigawa", "Kaduna",
  "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo",
  "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
];

const Auth: React.FC = () => {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const [view, setView] = useState<AuthView>('login');
  const [userType, setUserType] = useState<'customer' | 'agent'>('customer');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  const isLogin = view === 'login';
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('Lagos');
  const [specialization, setSpecialization] = useState('');
  const [yearsExp, setYearsExp] = useState('3');
  const [serviceType, setServiceType] = useState('hybrid');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    try {
      if (isLogin) {
        const res = await signIn(email, password);
        if (res.success) {
          if (res.role === UserRole.ADMIN) navigate('/admin/dashboard');
          else navigate('/');
        } else {
          setErrorMsg(res.error || 'Failed to sign in. Please verify your credentials.');
        }
      } else {
        const res = await signUp(email, password, {
          fullName, userType, phone, location,
          specialization: userType === 'agent' ? specialization : undefined,
          yearsExp: userType === 'agent' ? parseInt(yearsExp) || 0 : undefined,
          serviceType: userType === 'agent' ? serviceType : undefined
        });
        if (res.success) {
          navigate('/');
        } else {
          setErrorMsg(res.error || 'Failed to register account.');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setForgotSuccess(true);
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.4 }
  };

  return (
    <div className="min-h-screen flex bg-brand-background dark:bg-[#0D0D0D] pt-20">
      {/* Brand Side */}
      <div className="hidden lg:flex w-1/2 bg-brand-interactive relative overflow-hidden items-center justify-center p-24 text-white">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=1000&auto=format&fit=crop" className="w-full h-full object-cover opacity-70 grayscale" alt="Background" />
          <div className="absolute inset-0 bg-gradient-to-br from-brand-interactive via-brand-interactive/80 to-black/40" />
        </div>
        <div className="relative z-10 max-w-xl">
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-8xl font-serif font-bold mb-10 leading-tight tracking-tighter">Everything <br /> <span className="italic opacity-80">Beauty.</span></h1>
            <p className="text-2xl font-medium leading-relaxed mb-12 opacity-90">
              The gold standard for on-demand beauty services in Nigeria. Connect directly with verified artists.
            </p>
            <div className="space-y-8">
              {[
                'Elite, verified professionals only',
                'Transparent, upfront pricing',
                'Secured, cashless transformations',
                'Real-time verified booking'
              ].map((benefit, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -30, y: 28, z: 5 }}
                  animate={{ opacity: 1, x: 0, y: 0, z: 0 }}
                  transition={{ delay: 0.9 + (i * 0.1) }}
                  className="flex items-center space-x-6"
                >
                  <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                    <Check className="w-6 h-6" />
                  </div>
                  <span className="text-xl font-bold tracking-tight">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-20 overflow-y-auto">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">

          {/* ── FORGOT PASSWORD VIEW ── */}
          {view === 'forgot' && (
            <motion.div key="forgot" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
              <button onClick={() => { setView('login'); setForgotSuccess(false); setErrorMsg(null); }} className="flex items-center space-x-2 text-sm font-black text-[#6C757D] hover:text-brand-interactive transition-colors mb-10 group">
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /><span>Back to Login</span>
              </button>
              {forgotSuccess ? (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
                  <div className="w-24 h-24 rounded-3xl bg-green-100 dark:bg-green-900/30 border border-green-500/20 shadow-[0_0_25px_rgba(34,197,94,0.35)] flex items-center justify-center mx-auto mb-8"><Check className="w-12 h-12 text-green-500" /></div>
                  <h2 className="text-4xl font-serif font-bold text-[#1A1A1A] dark:text-white mb-4">Check your inbox</h2>
                  <p className="text-lg text-[#6C757D] dark:text-[#B0B0B0] font-medium leading-relaxed mb-8">We sent a reset link to<br /><span className="text-brand-interactive font-black">{forgotEmail}</span></p>
                  <p className="text-sm text-[#6C757D] font-medium">Did not receive it? <button onClick={() => setForgotSuccess(false)} className="text-brand-interactive font-black hover:underline">Resend</button></p>
                </motion.div>
              ) : (
                <>
                  <div className="mb-10">
                    <div className="w-16 h-16 rounded-2xl bg-brand-interactive/10 flex items-center justify-center mb-6"><KeyRound className="w-8 h-8 text-brand-interactive" /></div>
                    <h2 className="text-5xl font-serif font-bold text-[#1A1A1A] dark:text-white mb-3">Forgot Password?</h2>
                    <p className="text-lg text-[#6C757D] dark:text-[#B0B0B0] font-medium">No worries. Enter your email and we will send a reset link.</p>
                  </div>
                  {errorMsg && <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-2xl flex items-center space-x-3 text-red-600 dark:text-red-400 text-sm"><AlertCircle className="w-5 h-5 flex-shrink-0" /><span>{errorMsg}</span></div>}
                  <form onSubmit={handleForgotPassword} className="space-y-6">
                    <Input icon={<Mail />} label="Email Address" type="email" placeholder="yourname@gmail.com" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required />
                    <button type="submit" disabled={loading} className="w-full py-4 sm:py-5 bg-brand-interactive text-white rounded-2xl font-black text-lg hover:bg-brand-interactive/90 transition-all transform hover:scale-[1.02] shadow-[0_15px_30px_rgba(108,53,166,0.3)] active:scale-95 flex items-center justify-center space-x-3">
                      {loading ? <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" /> : <><span>Send Reset Link</span><ArrowRight className="w-6 h-6" /></>}
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          )}

          {/* ── LOGIN / SIGNUP VIEW ── */}
          {view !== 'forgot' && (
          <motion.div key={view} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
          <div className="text-center mb-10">
            <h2 className="text-5xl font-serif font-bold text-[#1A1A1A] dark:text-white mb-4">
              {isLogin ? 'Welcome Back' : 'Create an Account'}
            </h2>
            <p className="text-xl text-[#6C757D] dark:text-[#B0B0B0] font-medium">
              {isLogin ? 'Access your personalized beauty suite' : 'Sign up to get started'}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-2xl flex items-center space-x-3 text-red-600 dark:text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!isLogin && (
            <div className="relative flex p-2 bg-brand-surface dark:bg-[#1A1A1A] rounded-[2rem] shadow-inner border border-[#E9ECEF] dark:border-[#2D2D2D] mb-8">
              <div className={`absolute inset-2 w-[calc(50%-8px)] bg-brand-interactive rounded-[1.5rem] transition-all duration-500 shadow-lg ${userType === 'agent' ? 'translate-x-full' : ''}`} />
              <button type="button" onClick={() => setUserType('customer')} className={`relative z-10 flex-1 flex items-center justify-center space-x-3 py-4 rounded-[1.5rem] transition-colors duration-500 font-black text-sm ${userType === 'customer' ? 'text-white' : 'text-[#6C757D]'}`}>
                <UserIcon className="w-5 h-5" /><span>Customer</span>
              </button>
              <button type="button" onClick={() => setUserType('agent')} className={`relative z-10 flex-1 flex items-center justify-center space-x-3 py-4 rounded-[1.5rem] transition-colors duration-500 font-black text-sm ${userType === 'agent' ? 'text-white' : 'text-[#6C757D]'}`}>
                <Briefcase className="w-5 h-5" /><span>Beauty Agent</span>
              </button>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-6">
              {!isLogin && (
                <>
                  <Input 
                    icon={<UserIcon />} 
                    label="Full Name" 
                    placeholder="Jane Doe" 
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
                    label="Phone Number" 
                    type="tel" 
                    placeholder="+234 800 000 0000" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />

                  {/* City/State Selection */}
                  <div className="space-y-3">
                    <label className="text-xs font-black text-[#6C757D] flex items-center space-x-2 tracking-[0.15em]">
                      <span className="text-brand-interactive"><MapPin className="w-4 h-4" /></span>
                      <span>City / State</span>
                    </label>
                    <select 
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full p-4 bg-brand-surface dark:bg-[#1A1A1A] border-2 border-transparent focus:border-brand-interactive rounded-2xl outline-none transition-all font-medium text-base shadow-inner appearance-none text-[#1A1A1A] dark:text-white"
                    >
                      {NIGERIAN_STATES.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>

                  {userType === 'agent' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-6 pt-2"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <Input 
                          icon={<Calendar />} 
                          label="Years of Exp." 
                          type="number" 
                          placeholder="5" 
                          value={yearsExp}
                          onChange={(e) => setYearsExp(e.target.value)}
                        />
                        <div className="space-y-3">
                          <label className="text-xs font-black text-[#6C757D] flex items-center space-x-2 tracking-[0.15em]">
                            <span className="text-brand-interactive"><Briefcase className="w-4 h-4" /></span>
                            <span>Service Type</span>
                          </label>
                          <select 
                            value={serviceType}
                            onChange={(e) => setServiceType(e.target.value)}
                            className="w-full p-4 bg-brand-surface dark:bg-[#1A1A1A] border-2 border-transparent focus:border-brand-interactive rounded-2xl outline-none transition-all font-medium text-sm shadow-inner appearance-none text-[#1A1A1A] dark:text-white"
                          >
                            <option value="mobile">Mobile (Travel to client)</option>
                            <option value="studio">In-Studio</option>
                            <option value="hybrid">Hybrid</option>
                          </select>
                        </div>
                      </div>

                      <Input
                        icon={<Scissors />}
                        label="Specialization"
                        placeholder="Bridal Makeup, Hair Styling, Barbing"
                        value={specialization}
                        onChange={(e) => setSpecialization(e.target.value)}
                      />
                    </motion.div>
                  )}
                </>
              )}

              {isLogin && (
                <Input
                  icon={<Mail />}
                  label="Email"
                  type="email"
                  placeholder="yourname@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              )}

              <div className="space-y-1">
                <PasswordInput
                  label="Password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  show={showPassword}
                  onToggle={() => setShowPassword(v => !v)}
                  required
                />
                {isLogin && (
                  <div className="text-right pt-1">
                    <button type="button" onClick={() => { setView('forgot'); setErrorMsg(null); }} className="text-sm text-brand-interactive font-black hover:underline">Forgot password?</button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 sm:py-5 bg-brand-interactive text-white rounded-2xl font-black text-lg hover:bg-brand-interactive/90 transition-all transform hover:scale-[1.02] shadow-[0_15px_30px_rgba(108,53,166,0.3)] active:scale-95 flex items-center justify-center space-x-3"
              >
                {loading ? (
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{isLogin ? 'Log In' : 'Create Account'}</span>
                    <ArrowRight className="w-6 h-6" />
                  </>
                )}
              </button>



              <div className="text-center mt-8">
                <p className="text-[#6C757D] font-medium text-lg">
                  {isLogin ? "Don't have an account?" : "Already a member?"}
                  <button
                    type="button"
                    onClick={() => { setView(isLogin ? 'signup' : 'login'); setErrorMsg(null); }}
                    className="ml-3 text-brand-interactive font-black hover:underline"
                  >
                    {isLogin ? 'Sign Up' : 'Log In'}
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
  <div className="space-y-3">
    <label className="text-xs font-black text-[#6C757D] flex items-center space-x-2 tracking-[0.15em]">
      <span className="text-brand-interactive">{icon}</span>
      <span>{label}</span>
    </label>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full p-4 bg-brand-surface dark:bg-[#1A1A1A] border-2 border-transparent focus:border-brand-interactive rounded-2xl outline-none transition-all font-medium text-base shadow-inner text-[#1A1A1A] dark:text-white placeholder:text-[#ADB5BD]"
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
  <div className="space-y-3">
    <label className="text-xs font-black text-[#6C757D] flex items-center space-x-2 tracking-[0.15em]">
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
        className="w-full p-4 pr-14 bg-brand-surface dark:bg-[#1A1A1A] border-2 border-transparent focus:border-brand-interactive rounded-2xl outline-none transition-all font-medium text-base shadow-inner text-[#1A1A1A] dark:text-white placeholder:text-[#ADB5BD]"
      />
      <button
        type="button"
        onClick={onToggle}
        tabIndex={-1}
        aria-label={show ? 'Hide password' : 'Show password'}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6C757D] hover:text-brand-interactive transition-colors p-1"
      >
        {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
  </div>
);

export default Auth;
