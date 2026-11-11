import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  LayoutGrid, 
  Users, 
  Info, 
  MessageSquare, 
  User as UserIcon, 
  LogOut, 
  ChevronDown
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { ThemeMode, UserRole } from '../types';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  themeMode: ThemeMode;
  toggleTheme: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ themeMode, toggleTheme }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { user, currentUser, role, signOut } = useAuth();
  const navigate = useNavigate();

  // Close dropdown on route change
  useEffect(() => {
    setIsProfileMenuOpen(false);
  }, [location.pathname]);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const getInitialsSvg = (name: string): string => {
    const initials = name
      ? name.trim().split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
      : 'U';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#6C35A6" /><text x="50%" y="50%" fill="white" font-family="sans-serif" font-size="40" font-weight="bold" text-anchor="middle" dominant-baseline="central">${initials}</text></svg>`;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getDashboardPath = (): string => {
    if (role === UserRole.ADMIN) return '/admin/dashboard';
    if (role === UserRole.AGENT) return '/agent/dashboard';
    return '/customer/dashboard';
  };

  const handleHomeClick = () => {
    if (window.location.hash === '#/' || window.location.hash === '' || window.location.pathname === '/') {
      if ((window as any).lenis) {
        (window as any).lenis.scrollTo(0, { duration: 1.2 });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: <Home className="w-5 h-5" /> },
    { name: 'Services', path: '/services', icon: <LayoutGrid className="w-5 h-5" /> },
    { name: 'Agents', path: '/agents', icon: <Users className="w-5 h-5" /> },
    { name: 'FAQ', path: '/faq', icon: <MessageSquare className="w-5 h-5" /> },
    { name: 'Why EB?', path: '/about', icon: <Info className="w-5 h-5" /> },
    { name: 'Contact', path: '/contact', icon: <MessageSquare className="w-5 h-5" /> },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <>
      {/* --- TOP HEADER (Desktop & Mobile) --- */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/90 dark:bg-[#0D0D0D]/90 backdrop-blur-md shadow-sm border-b border-black/5 dark:border-white/5'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo */}
            <Link to="/" onClick={handleHomeClick} className="flex items-center space-x-2 group min-w-0">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 group-hover:rotate-3 transition-transform duration-300 overflow-hidden shrink-0">
                <img src="/logo.jpg" alt="Everything Beauty Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-xl md:text-2xl font-serif font-bold tracking-tighter text-brand-primary dark:text-white truncate">
                Everything<span className="text-brand-interactive ml-1">Beauty</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={link.path === '/' ? handleHomeClick : undefined}
                  className={({ isActive }) =>
                    `text-sm font-bold transition-all duration-200 hover:text-brand-interactive hover:-translate-y-0.5 ${
                      isActive ? 'text-brand-interactive font-extrabold' : 'text-[#6C757D] dark:text-[#B0B0B0]'
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 shrink-0">
              <ThemeToggle mode={themeMode} onToggle={toggleTheme} />

              {user ? (
                /* Unified Profile Pill with Dropdown Menu */
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center space-x-1.5 sm:space-x-2.5 p-1 sm:px-3 sm:py-1.5 rounded-full sm:rounded-2xl bg-brand-surface/80 dark:bg-[#1A1A1A] hover:bg-brand-interactive/10 dark:hover:bg-brand-interactive/20 border border-brand-interactive/20 dark:border-white/10 transition-all duration-200 cursor-pointer active:scale-95 group focus:outline-none"
                    aria-label="User account menu"
                    aria-expanded={isProfileMenuOpen}
                  >
                    {/* Pristine Round Avatar with Instagram-style Brand Ring */}
                    <div className="relative shrink-0 aspect-square">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 aspect-square rounded-full p-[2px] bg-gradient-to-tr from-[#32104D] via-[#6C35A6] to-[#F43F5E] shadow-sm group-hover:shadow-[0_0_10px_rgba(108,53,166,0.4)] transition-all duration-300 shrink-0">
                        <div className="w-full h-full p-0.5 bg-white dark:bg-[#161616] rounded-full aspect-square">
                          <div className="w-full h-full rounded-full overflow-hidden aspect-square bg-brand-surface dark:bg-[#202020]">
                            <img
                              src={
                                currentUser?.avatar && currentUser.avatar.trim() !== ''
                                  ? currentUser.avatar
                                  : getInitialsSvg(currentUser?.name || '')
                              }
                              alt={currentUser?.name || 'User Avatar'}
                              className="w-full h-full rounded-full object-cover object-center block shrink-0"
                              onError={(e) => {
                                e.currentTarget.src = getInitialsSvg(currentUser?.name || '');
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Text: Name + Role + Chevron */}
                    <div className="hidden sm:flex flex-col text-left pr-1 min-w-0">
                      <span className="text-xs font-bold leading-tight max-w-[90px] md:max-w-[120px] truncate text-[#1A1A1A] dark:text-white">
                        {currentUser?.name || 'Account'}
                      </span>
                      <span className="text-[9px] font-black tracking-wider uppercase text-brand-interactive dark:text-brand-accent">
                        {role.toLowerCase()}
                      </span>
                    </div>

                    <ChevronDown
                      className={`w-3.5 h-3.5 text-[#6C757D] dark:text-[#A0A0A0] transition-transform duration-300 hidden sm:block ${
                        isProfileMenuOpen ? 'rotate-180 text-brand-interactive' : ''
                      }`}
                    />
                  </button>

                  {/* Animated Luxury Dropdown Menu */}
                  <AnimatePresence>
                    {isProfileMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.94, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.94, y: 10 }}
                        transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                        className="absolute right-0 mt-2.5 w-60 sm:w-64 rounded-2xl bg-white/95 dark:bg-[#141414]/95 backdrop-blur-2xl border border-black/8 dark:border-white/10 shadow-[0_16px_48px_rgba(0,0,0,0.18)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.7)] p-2 z-50 overflow-hidden"
                      >
                        {/* Header snippet inside dropdown */}
                        <div className="px-3 py-2.5 rounded-xl bg-brand-surface/60 dark:bg-white/5 mb-1.5 flex items-center space-x-3">
                          <div className="w-10 h-10 aspect-square rounded-full p-[2px] bg-gradient-to-tr from-[#32104D] via-[#6C35A6] to-[#F43F5E] shrink-0">
                            <div className="w-full h-full p-0.5 bg-white dark:bg-[#161616] rounded-full aspect-square">
                              <img
                                src={
                                  currentUser?.avatar && currentUser.avatar.trim() !== ''
                                    ? currentUser.avatar
                                    : getInitialsSvg(currentUser?.name || '')
                                }
                                alt={currentUser?.name || 'User'}
                                className="w-full h-full rounded-full object-cover object-center block"
                                onError={(e) => {
                                  e.currentTarget.src = getInitialsSvg(currentUser?.name || '');
                                }}
                              />
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-[#1A1A1A] dark:text-white truncate">
                              {currentUser?.name || 'User'}
                            </p>
                            <p className="text-[11px] text-[#6C757D] dark:text-[#A0A0A0] truncate">
                              {currentUser?.email || `${role.toLowerCase()} account`}
                            </p>
                          </div>
                        </div>

                        {/* Navigation Options with Hover Micro-Interactions */}
                        <div className="space-y-0.5">
                          <Link
                            to={getDashboardPath()}
                            onClick={() => setIsProfileMenuOpen(false)}
                            className="group flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-[#1A1A1A] dark:text-white hover:bg-brand-interactive/10 hover:text-brand-interactive transition-all duration-150"
                          >
                            <LayoutGrid className="w-4 h-4 text-brand-interactive group-hover:scale-110 transition-transform duration-150" />
                            <span className="group-hover:translate-x-0.5 transition-transform duration-150">
                              My Dashboard
                            </span>
                          </Link>

                          {role === UserRole.AGENT && currentUser?.id && (
                            <Link
                              to={`/agent/${currentUser.id}`}
                              onClick={() => setIsProfileMenuOpen(false)}
                              className="group flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-[#1A1A1A] dark:text-white hover:bg-brand-interactive/10 hover:text-brand-interactive transition-all duration-150"
                            >
                              <UserIcon className="w-4 h-4 text-brand-interactive group-hover:scale-110 transition-transform duration-150" />
                              <span className="group-hover:translate-x-0.5 transition-transform duration-150">
                                View Public Profile
                              </span>
                            </Link>
                          )}
                        </div>

                        <div className="my-1.5 border-t border-black/5 dark:border-white/5" />

                        {/* Sign Out Action inside Dropdown */}
                        <button
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            handleSignOut();
                          }}
                          className="w-full group flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all duration-150 cursor-pointer text-left active:scale-[0.98]"
                        >
                          <LogOut className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform duration-150" />
                          <span className="group-hover:translate-x-0.5 transition-transform duration-150">
                            Sign Out
                          </span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Link
                    to="/auth"
                    className="hidden md:block text-sm font-bold text-[#1A1A1A] dark:text-white hover:text-brand-interactive transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/auth"
                    className="p-2 md:px-5 md:py-2.5 bg-brand-interactive text-white rounded-xl md:rounded-2xl font-bold text-sm shadow-lg shadow-brand-interactive/20 hover:scale-105 active:scale-95 transition-all flex items-center space-x-1.5"
                  >
                    <span className="md:hidden text-xs font-black">Join</span>
                    <span className="hidden md:inline">Join Elite</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* --- BOTTOM NAVIGATION (Mobile Only) with Micro-interactions --- */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#0D0D0D]/95 backdrop-blur-xl border-t border-[#E9ECEF] dark:border-[#2D2D2D] pb-safe shadow-lg">
        <div className="flex justify-around items-center h-16 px-3">
          <NavLink
            to="/"
            onClick={handleHomeClick}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-200 active:scale-90 ${
                isActive ? 'text-brand-interactive font-black scale-105' : 'text-[#6C757D] dark:text-[#A0A0A0]'
              }`
            }
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">Home</span>
          </NavLink>

          <NavLink
            to="/services"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-200 active:scale-90 ${
                isActive ? 'text-brand-interactive font-black scale-105' : 'text-[#6C757D] dark:text-[#A0A0A0]'
              }`
            }
          >
            <LayoutGrid className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">Services</span>
          </NavLink>

          <NavLink
            to="/agents"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-200 active:scale-90 ${
                isActive ? 'text-brand-interactive font-black scale-105' : 'text-[#6C757D] dark:text-[#A0A0A0]'
              }`
            }
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">Agents</span>
          </NavLink>

          {user ? (
            <NavLink
              to={getDashboardPath()}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-200 active:scale-90 ${
                  isActive ? 'text-brand-interactive font-black scale-105' : 'text-[#6C757D] dark:text-[#A0A0A0]'
                }`
              }
            >
              <UserIcon className="w-5 h-5" />
              <span className="text-[10px] tracking-tight">Dashboard</span>
            </NavLink>
          ) : (
            <NavLink
              to="/auth"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-200 active:scale-90 ${
                  isActive ? 'text-brand-interactive font-black scale-105' : 'text-[#6C757D] dark:text-[#A0A0A0]'
                }`
              }
            >
              <UserIcon className="w-5 h-5" />
              <span className="text-[10px] tracking-tight">Log In</span>
            </NavLink>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
