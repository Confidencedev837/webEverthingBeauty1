import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User as UserIcon, Briefcase, Mail, Phone, Lock, MapPin, Sparkles, Check, ChevronRight, ArrowRight, Upload, Calendar, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River",
  "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe", "Imo", "Jigawa", "Kaduna",
  "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo",
  "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
];

const Auth: React.FC = () => {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState<'customer' | 'agent'>('customer');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        // Handle login
        const res = await signIn(email, password);
        if (res.success) {
          if (res.role === UserRole.ADMIN) {
            navigate('/admin/dashboard');
          } else if (res.role === UserRole.AGENT) {
            navigate('/agent/dashboard');
          } else {
            navigate('/customer/dashboard');
          }
        } else {
          setErrorMsg(res.error || 'Failed to sign in. Please verify your credentials.');
        }
      } else {
        // Handle signup
        const res = await signUp(email, password, {
          fullName,
          userType,
          phone,
          location,
          specialization: userType === 'agent' ? specialization : undefined,
          yearsExp: userType === 'agent' ? parseInt(yearsExp) || 0 : undefined,
          serviceType: userType === 'agent' ? serviceType : undefined
        });

        if (res.success) {
          if (userType === 'agent') {
            navigate('/agent/dashboard');
          } else {
            navigate('/customer/dashboard');
          }
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

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.4 }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-[#0D0D0D] pt-20">
      {/* Brand Side */}
      <div className="hidden lg:flex w-1/2 bg-rosePink relative overflow-hidden items-center justify-center p-24 text-white">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=1000&auto=format&fit=crop" className="w-full h-full object-cover opacity-70 grayscale" alt="Background" />
          <div className="absolute inset-0 bg-gradient-to-br from-rosePink via-rosePink/80 to-black/40" />
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
            <div className="relative flex p-2 bg-[#F8F9FA] dark:bg-[#1A1A1A] rounded-[2rem] shadow-inner border border-[#E9ECEF] dark:border-[#2D2D2D] mb-8">
              <div
                className={`absolute inset-2 w-[calc(50%-8px)] bg-rosePink rounded-[1.5rem] transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) shadow-lg ${userType === 'agent' ? 'translate-x-full' : ''}`}
              />
              <button
                type="button"
                onClick={() => setUserType('customer')}
                className={`relative z-10 flex-1 flex items-center justify-center space-x-3 py-4 rounded-[1.5rem] transition-colors duration-500 font-black text-sm uppercase tracking-widest ${userType === 'customer' ? 'text-white' : 'text-[#6C757D]'}`}
              >
                <UserIcon className="w-5 h-5" />
                <span>Customer</span>
              </button>
              <button
                type="button"
                onClick={() => setUserType('agent')}
                className={`relative z-10 flex-1 flex items-center justify-center space-x-3 py-4 rounded-[1.5rem] transition-colors duration-500 font-black text-sm uppercase tracking-widest ${userType === 'agent' ? 'text-white' : 'text-[#6C757D]'}`}
              >
                <Briefcase className="w-5 h-5" />
                <span>Beauty Agent</span>
              </button>
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.form
              key={`${isLogin}-${userType}`}
              {...fadeInUp}
              onSubmit={handleAuth}
              className="space-y-6"
            >
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
                    placeholder="jane@everythingbeauty.com"
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
                    <label className="text-xs font-black text-[#6C757D] flex items-center space-x-2 uppercase tracking-[0.15em]">
                      <span className="text-rosePink"><MapPin className="w-4 h-4" /></span>
                      <span>City / State</span>
                    </label>
                    <select 
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full p-4 bg-[#F8F9FA] dark:bg-[#1A1A1A] border-2 border-transparent focus:border-rosePink rounded-2xl outline-none transition-all font-medium text-base shadow-inner appearance-none text-[#1A1A1A] dark:text-white"
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
                          <label className="text-xs font-black text-[#6C757D] flex items-center space-x-2 uppercase tracking-[0.15em]">
                            <span className="text-rosePink"><Briefcase className="w-4 h-4" /></span>
                            <span>Service Type</span>
                          </label>
                          <select 
                            value={serviceType}
                            onChange={(e) => setServiceType(e.target.value)}
                            className="w-full p-4 bg-[#F8F9FA] dark:bg-[#1A1A1A] border-2 border-transparent focus:border-rosePink rounded-2xl outline-none transition-all font-medium text-sm shadow-inner appearance-none text-[#1A1A1A] dark:text-white"
                          >
                            <option value="mobile">Mobile (Travel to client)</option>
                            <option value="studio">In-Studio</option>
                            <option value="hybrid">Hybrid</option>
                          </select>
                        </div>
                      </div>

                      <Input 
                        icon={<Sparkles />} 
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
                  placeholder="jane@everythingbeauty.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              )}

              <div className="space-y-1">
                <Input
                  icon={<Lock />}
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {isLogin && (
                  <div className="text-right">
                    <button type="button" className="text-sm text-rosePink font-black hover:underline uppercase tracking-widest">Forgot password?</button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 sm:py-5 bg-rosePink text-white rounded-2xl font-black text-lg hover:bg-[#E57B8D] transition-all transform hover:scale-[1.02] shadow-[0_15px_30px_rgba(255,138,157,0.3)] active:scale-95 flex items-center justify-center space-x-3"
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
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setErrorMsg(null);
                    }}
                    className="ml-3 text-rosePink font-black hover:underline uppercase tracking-wider"
                  >
                    {isLogin ? 'Sign Up' : 'Log In'}
                  </button>
                </p>
              </div>
            </motion.form>
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
    <label className="text-xs font-black text-[#6C757D] flex items-center space-x-2 uppercase tracking-[0.15em]">
      <span className="text-rosePink">{icon}</span>
      <span>{label}</span>
    </label>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full p-4 bg-[#F8F9FA] dark:bg-[#1A1A1A] border-2 border-transparent focus:border-rosePink rounded-2xl outline-none transition-all font-medium text-base shadow-inner text-[#1A1A1A] dark:text-white"
    />
  </div>
);

export default Auth;
