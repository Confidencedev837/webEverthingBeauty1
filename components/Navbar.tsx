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
  ShieldCheck,
  Sparkles
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
    { name: 'About', path: '/about', icon: <Info className="w-5 h-5" /> },
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
              <div className="w-10 h-10 bg-rosePink rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform">
                <span className="text-white font-serif font-bold text-xl italic">EB</span>
              </div>
              <span className="text-xl md:text-2xl font-serif font-bold tracking-tighter text-[#1A1A1A] dark:text-white">
                Everything<span className="text-rosePink ml-2">Beauty</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `text-sm font-bold uppercase tracking-widest transition-colors hover:text-rosePink ${
                      isActive ? 'text-rosePink' : 'text-[#6C757D] dark:text-[#B0B0B0]'
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
                    className="flex items-center space-x-2.5 px-3.5 py-2 bg-rosePink/10 hover:bg-rosePink/20 text-rosePink rounded-xl md:rounded-2xl transition-all border border-rosePink/20"
                  >
                    {currentUser?.avatar ? (
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="w-7 h-7 rounded-full object-cover border border-rosePink/30"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-rosePink/20 text-rosePink flex items-center justify-center font-bold text-xs">
                        <UserIcon className="w-4 h-4" />
                      </div>
                    )}
                    <div className="hidden sm:flex flex-col text-left">
                      <span className="text-xs font-bold leading-tight max-w-[100px] truncate">{currentUser?.name}</span>
                      <span className="text-[9px] uppercase font-black text-[#6C757D] tracking-wider">{role.toLowerCase()}</span>
                    </div>
                  </Link>

                  <button
                    onClick={handleSignOut}
                    title="Sign Out"
                    className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl text-[#6C757D] hover:text-rosePink transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <>
                  <Link 
                    to="/auth" 
                    className="hidden md:block text-sm font-bold text-[#1A1A1A] dark:text-white hover:text-rosePink transition-colors"
                  >
                    Log In
                  </Link>
                  <Link 
                    to="/auth" 
                    className="p-2 md:px-5 md:py-2.5 bg-rosePink text-white rounded-xl md:rounded-2xl font-bold text-sm shadow-lg shadow-rosePink/20 hover:scale-105 active:scale-95 transition-all flex items-center space-x-1.5"
                  >
                    <Sparkles className="w-4 h-4 md:hidden" />
                    <span className="hidden md:inline">Join Elite</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* --- BOTTOM NAVIGATION (Mobile Only) --- */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-[#0D0D0D]/90 backdrop-blur-lg border-t border-[#E9ECEF] dark:border-[#2D2D2D] pb-safe">
        <div className="flex justify-around items-center h-16 px-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                  isActive ? 'text-rosePink' : 'text-[#6C757D] dark:text-[#B0B0B0]'
                }`
              }
            >
              {link.icon}
              <span className="text-[10px] font-bold uppercase tracking-tighter">
                {link.name}
              </span>
            </NavLink>
          ))}
          {user && (
            <NavLink
              to={getDashboardPath()}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                  isActive ? 'text-rosePink' : 'text-[#6C757D] dark:text-[#B0B0B0]'
                }`
              }
            >
              <UserIcon className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-tighter">Dashboard</span>
            </NavLink>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;