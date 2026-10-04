
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ThemeMode } from './types';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Services from './pages/Services';
import Agents from './pages/Agents';
import ServiceDetail from './pages/ServiceDetail';
import AgentProfile from './pages/AgentProfile';
import About from './pages/About';
import Contact from './pages/Contact';
import Legal from './pages/Legal';
import CustomerDashboard from './pages/CustomerDashboard';
import AgentDashboard from './pages/AgentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { AuthProvider } from './context/AuthContext';
import { SnackbarProvider } from './components/Snackbar';

const App: React.FC = () => {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('theme-mode');
    return (saved as ThemeMode) || ThemeMode.SYSTEM;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    const updateTheme = () => {
      if (themeMode === ThemeMode.DARK || (themeMode === ThemeMode.SYSTEM && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };
    updateTheme();
    localStorage.setItem('theme-mode', themeMode);

    if (themeMode === ThemeMode.SYSTEM) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => updateTheme();
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode(prev => {
      if (prev === ThemeMode.LIGHT) return ThemeMode.DARK;
      if (prev === ThemeMode.DARK) return ThemeMode.SYSTEM;
      return ThemeMode.LIGHT;
    });
  };

  return (
    <Router>
      <AuthProvider>
        <SnackbarProvider>
          <div className="min-h-screen transition-colors duration-300">
            <Navbar themeMode={themeMode} toggleTheme={toggleTheme} />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/services" element={<Services />} />
              <Route path="/agents" element={<Agents />} />
              <Route path="/services/:id" element={<ServiceDetail />} />
              <Route path="/agent/:id" element={<AgentProfile />} />
              <Route path="/agents/:id" element={<AgentProfile />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/terms" element={<Legal />} />
              <Route path="/privacy" element={<Legal />} />
              <Route path="/partner-agreement" element={<Legal />} />

              {/* New Dashboard Routes */}
              <Route path="/customer/dashboard" element={<CustomerDashboard />} />
              <Route path="/agent/dashboard" element={<AgentDashboard />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/login" element={<Auth />} />
            </Routes>
          </main>

          <footer className="py-12 sm:py-16 md:py-20 lg:py-24 bg-[#F8F9FA] dark:bg-[#111] border-t border-[#E9ECEF] dark:border-[#2D2D2D] relative z-30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Main Footer Flex Container */}
              <div className="flex flex-wrap gap-8 sm:gap-10 md:gap-12 lg:gap-16 mb-12 sm:mb-16 md:mb-20">

                {/* Brand Section - Takes full width on mobile, half on tablet, auto on desktop */}
                <div className="w-full sm:w-[calc(50%-1.25rem)] lg:w-auto lg:flex-[2]">
                  <div className="flex items-center space-x-2 sm:space-x-3 mb-6 sm:mb-8 md:mb-10">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-rosePink rounded-lg sm:rounded-xl md:rounded-[1.25rem] flex items-center justify-center shadow-xl sm:shadow-2xl shadow-rosePink/40">
                      <span className="text-white font-serif text-xl sm:text-2xl md:text-3xl font-black">EB</span>
                    </div>
                    <span className="text-2xl sm:text-3xl md:text-4xl font-serif font-black tracking-tighter">Everything Beauty</span>
                  </div>
                  <p className="text-[#6C757D] dark:text-[#B0B0B0] max-w-sm mb-8 sm:mb-10 md:mb-12 leading-relaxed text-sm sm:text-base md:text-lg lg:text-xl font-medium">
                    Defining the future of on-demand beauty services. Verified professionals, premium results, total convenience.
                  </p>
                  <div className="flex space-x-4 sm:space-x-5 md:space-x-6">
                    <InstagramIcon />
                    <TwitterIcon />
                    <LinkedInIcon />
                    <FacebookIcon />
                  </div>
                </div>

                {/* Platform Links */}
                <div className="w-[calc(50%-1rem)] sm:w-[calc(33.333%-1rem)] lg:w-auto lg:flex-1">
                  <h4 className="font-black mb-4 sm:mb-6 md:mb-8 lg:mb-10 uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[10px] sm:text-[11px] text-rosePink">Platform</h4>
                  <ul className="space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6 text-[#6C757D] dark:text-[#B0B0B0] font-bold text-xs sm:text-sm">
                    <li><Link to="/" className="hover:text-rosePink transition-all flex items-center">Home</Link></li>
                    <li><Link to="/services" className="hover:text-rosePink transition-all flex items-center">Services</Link></li>
                    <li><Link to="/agents" className="hover:text-rosePink transition-all flex items-center">Agents</Link></li>
                    <li><Link to="/about" className="hover:text-rosePink transition-all flex items-center">Founders</Link></li>
                    <li><Link to="/contact" className="hover:text-rosePink transition-all flex items-center">Contact</Link></li>
                  </ul>
                </div>

                {/* Support Links */}
                <div className="w-[calc(50%-1rem)] sm:w-[calc(33.333%-1rem)] lg:w-auto lg:flex-1">
                  <h4 className="font-black mb-4 sm:mb-6 md:mb-8 lg:mb-10 uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[10px] sm:text-[11px] text-rosePink">Support</h4>
                  <ul className="space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6 text-[#6C757D] dark:text-[#B0B0B0] font-bold text-xs sm:text-sm">
                    <li><Link to="/contact" className="hover:text-rosePink transition-all">Help Center</Link></li>
                    <li><Link to="/contact" className="hover:text-rosePink transition-all">Safety Center</Link></li>
                    <li><Link to="/auth" className="hover:text-rosePink transition-all">Agent FAQ</Link></li>
                    <li><Link to="/contact" className="hover:text-rosePink transition-all">Accessibility</Link></li>
                  </ul>
                </div>

                {/* Legal Links */}
                <div className="w-[calc(50%-1rem)] sm:w-[calc(33.333%-1rem)] lg:w-auto lg:flex-1">
                  <h4 className="font-black mb-4 sm:mb-6 md:mb-8 lg:mb-10 uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[10px] sm:text-[11px] text-rosePink">Legal Hub</h4>
                  <ul className="space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6 text-[#6C757D] dark:text-[#B0B0B0] font-bold text-xs sm:text-sm">
                    <li><Link to="/terms" className="hover:text-rosePink transition-all">Terms of Service</Link></li>
                    <li><Link to="/privacy" className="hover:text-rosePink transition-all">Privacy Policy</Link></li>
                    <li><Link to="/partner-agreement" className="hover:text-rosePink transition-all">Partner Agreement</Link></li>
                    <li><Link to="/terms" className="hover:text-rosePink transition-all">Cookie Policy</Link></li>
                  </ul>
                </div>
              </div>

              {/* Bottom Bar */}
              <div className="pt-6 sm:pt-8 md:pt-10 lg:pt-12 border-t border-[#E9ECEF] dark:border-[#2D2D2D] flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6 text-[#6C757D] text-[9px] sm:text-[10px] md:text-[11px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em]">
                <p className="text-center md:text-left">© {new Date().getFullYear()} Everything Beauty Marketplace. Elevating Standards.</p>
                <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 lg:gap-10">
                  <span className="hover:text-rosePink cursor-pointer transition-all">Sitemap</span>
                  <span className="hover:text-rosePink cursor-pointer transition-all">Global Security</span>
                  <Link to="/admin/dashboard" className="hover:text-rosePink cursor-pointer transition-all">Admin Access</Link>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </SnackbarProvider>
    </AuthProvider>
  </Router>
);
};

const InstagramIcon = () => (
  <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-[#6C757D] hover:text-rosePink transition-all transform hover:scale-110 cursor-pointer" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const TwitterIcon = () => (
  <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-[#6C757D] hover:text-rosePink transition-all transform hover:scale-110 cursor-pointer" fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-[#6C757D] hover:text-rosePink transition-all transform hover:scale-110 cursor-pointer" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-[#6C757D] hover:text-rosePink transition-all transform hover:scale-110 cursor-pointer" fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

export default App;
