import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  Home, 
  LayoutGrid, 
  Users, 
  Info, 
  MessageSquare, 
  User as UserIcon,
  LogOut,
  ShieldCheck
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
  const { user, currentUser, role, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getDashboardPath = () => {
    if (role === UserRole.ADMIN) return '/admin/dashboard';
    if (role === UserRole.AGENT) return '/agent/dashboard';
    return '/customer/dashboard';
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
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/90 dark:bg-[#0D0D0D]/90 backdrop-blur-md shadow-sm border-b border-black/5 dark:border-white/5' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform overflow-hidden">
                <img src="/logo.jpg" alt="Everything Beauty Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-xl md:text-2xl font-serif font-bold tracking-tighter text-brand-primary dark:text-white">
                Everything<span className="text-brand-interactive ml-1">Beauty</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `text-sm font-bold transition-colors hover:text-brand-interactive ${
                      isActive ? 'text-brand-interactive' : 'text-[#6C757D] dark:text-[#B0B0B0]'
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3 md:space-x-4">
              <ThemeToggle mode={themeMode} onToggle={toggleTheme} />

              {user ? (
                <div className="flex items-center space-x-3">
                  <Link
                    to={getDashboardPath()}
                    className="flex items-center space-x-2.5 px-3.5 py-2 bg-brand-interactive/10 hover:bg-brand-interactive/20 text-brand-interactive rounded-xl md:rounded-2xl transition-all border border-brand-interactive/20"
                  >
                    <img
                      src={currentUser?.avatar && currentUser.avatar.trim() !== '' ? currentUser.avatar : `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#6C35A6" /><text x="50%" y="50%" fill="white" font-family="sans-serif" font-size="40" font-weight="bold" text-anchor="middle" dominant-baseline="central">${currentUser?.name ? currentUser.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}</text></svg>`)}`}
                      alt={currentUser?.name}
                      className="w-7 h-7 rounded-full object-cover border border-brand-interactive/30"
                      onError={(e) => { e.currentTarget.src = `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#6C35A6" /><text x="50%" y="50%" fill="white" font-family="sans-serif" font-size="40" font-weight="bold" text-anchor="middle" dominant-baseline="central">${currentUser?.name ? currentUser.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}</text></svg>`)}`; }}
                    />
                    <div className="hidden sm:flex flex-col text-left">
                      <span className="text-xs font-bold leading-tight max-w-[100px] truncate">{currentUser?.name}</span>
                      <span className="text-[9px] font-black text-[#6C757D]">{role.toLowerCase()}</span>
                    </div>
                  </Link>

                  <button
                    onClick={handleSignOut}
                    title="Sign Out"
                    className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl text-[#6C757D] hover:text-brand-interactive transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
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

      {/* --- BOTTOM NAVIGATION (Mobile Only) --- */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#0D0D0D]/95 backdrop-blur-xl border-t border-[#E9ECEF] dark:border-[#2D2D2D] pb-safe shadow-lg">
        <div className="flex justify-around items-center h-16 px-3">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full space-y-1 transition-all ${
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
              `flex flex-col items-center justify-center w-full h-full space-y-1 transition-all ${
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
              `flex flex-col items-center justify-center w-full h-full space-y-1 transition-all ${
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
                `flex flex-col items-center justify-center w-full h-full space-y-1 transition-all ${
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
                `flex flex-col items-center justify-center w-full h-full space-y-1 transition-all ${
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