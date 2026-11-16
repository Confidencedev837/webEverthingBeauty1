// pages/NotFound.tsx - Clean Editorial Animated 404 Page with Tactile Stickers
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Compass, Home, Scissors, Tag, AlertCircle } from 'lucide-react';
import { getLastAgentId, getLastServiceId } from '../services/navigationState';

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const lastAgentId = getLastAgentId();
  const lastServiceId = getLastServiceId();

  const servicesPath = lastServiceId ? `/services/${lastServiceId}` : '/services';
  const agentsPath = lastAgentId ? `/agent/${lastAgentId}` : '/agents';

  return (
    <div className="min-h-screen bg-brand-background dark:bg-[#0D0D0D] text-[#1A1A1A] dark:text-white flex items-center justify-center px-4 py-20 relative overflow-hidden transition-colors duration-300">

      {/* Background ambient lighting - clean neutral glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-black/5 dark:bg-white/5 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Animated Stickers */}
      {/* Sticker 1: Top Left - Tactile Status Stamp */}
      <motion.div
        initial={{ y: -40, opacity: 0, rotate: -14 }}
        animate={{
          y: [0, -10, 0],
          opacity: 1,
          rotate: [-12, -16, -12]
        }}
        transition={{
          y: { repeat: Infinity, duration: 4.2, ease: "easeInOut" },
          rotate: { repeat: Infinity, duration: 5.5, ease: "easeInOut" }
        }}
        className="absolute top-16 left-6 sm:top-24 sm:left-16 z-10 pointer-events-none select-none"
      >
        <div className="px-4 py-2 rounded-2xl bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] font-black text-xs sm:text-sm tracking-wider uppercase shadow-xl border border-black/10 dark:border-white/20 transform -rotate-12 flex items-center space-x-2">
          <Tag className="w-3.5 h-3.5" />
          <span>Status: 404</span>
        </div>
      </motion.div>

      {/* Sticker 2: Top Right - Beauty Scissors Tactile Badge */}
      <motion.div
        initial={{ y: -30, opacity: 0, rotate: 20 }}
        animate={{
          y: [0, 12, 0],
          opacity: 1,
          rotate: [16, 22, 16]
        }}
        transition={{
          y: { repeat: Infinity, duration: 4.8, ease: "easeInOut" },
          rotate: { repeat: Infinity, duration: 6, ease: "easeInOut" }
        }}
        className="absolute top-20 right-6 sm:top-28 sm:right-20 z-10 pointer-events-none select-none"
      >
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-[#1A1A1A] dark:bg-[#1E1E1E] text-white flex items-center justify-center shadow-xl border-2 border-white/20 dark:border-white/10">
          <Scissors className="w-7 h-7 sm:w-8 sm:h-8" />
        </div>
      </motion.div>

      {/* Sticker 3: Bottom Left - Doorstep Certified Sticker */}
      <motion.div
        initial={{ y: 30, opacity: 0, rotate: 10 }}
        animate={{
          y: [0, -8, 0],
          opacity: 1,
          rotate: [8, 13, 8]
        }}
        transition={{
          y: { repeat: Infinity, duration: 5, ease: "easeInOut" },
          rotate: { repeat: Infinity, duration: 5.8, ease: "easeInOut" }
        }}
        className="absolute bottom-24 left-6 sm:bottom-28 sm:left-24 z-10 pointer-events-none select-none hidden sm:block"
      >
        <div className="px-4 py-2 rounded-2xl bg-amber-500/15 border-2 border-amber-500/30 text-amber-700 dark:text-amber-300 font-bold text-xs tracking-wide shadow-md">
          Doorstep Route Missing
        </div>
      </motion.div>

      {/* Sticker 4: Bottom Right - Compass Explorer Badge */}
      <motion.div
        initial={{ y: 30, opacity: 0, rotate: -14 }}
        animate={{
          y: [0, 10, 0],
          opacity: 1,
          rotate: [-11, -16, -11]
        }}
        transition={{
          y: { repeat: Infinity, duration: 4.6, ease: "easeInOut" },
          rotate: { repeat: Infinity, duration: 5.2, ease: "easeInOut" }
        }}
        className="absolute bottom-20 right-8 sm:bottom-24 sm:right-28 z-10 pointer-events-none select-none hidden sm:block"
      >
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border-2 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shadow-md">
          <Compass className="w-6 h-6" />
        </div>
      </motion.div>

      {/* Main Card Content */}
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 18 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 26 }}
        className="max-w-xl w-full text-center relative z-20"
      >
        {/* Giant Editorial 404 Headline - Clean Solid Typography (No Purple Gradient) */}
        <div className="relative inline-block mb-4">
          <span className="text-8xl sm:text-9xl md:text-[11.5rem] font-serif font-black tracking-tighter text-[#1A1A1A] dark:text-white leading-none select-none drop-shadow-sm">
            404
          </span>
          <span className="block text-xs font-black tracking-[0.28em] uppercase text-[#6C757D] dark:text-[#A0A0A0] mt-1">
            Page Not Found
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#1A1A1A] dark:text-white mb-3">
          Lost in the Beauty Lounge
        </h1>

        <p className="text-sm sm:text-base text-[#6C757D] dark:text-[#A0A0A0] max-w-md mx-auto mb-10 leading-relaxed font-medium">
          The doorstep service or specialist page you are looking for has been styled, relocated, or does not exist.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto px-6 py-3.5 bg-brand-surface dark:bg-[#1A1A1A] text-[#1A1A1A] dark:text-white rounded-2xl font-bold text-xs sm:text-sm border border-[#E9ECEF] dark:border-[#2D2D2D] hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-all flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>

          <Link
            to="/"
            className="w-full sm:w-auto px-6 py-3.5 bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] rounded-2xl font-bold text-xs sm:text-sm shadow-lg hover:opacity-90 active:scale-95 transition-all flex items-center justify-center space-x-2"
          >
            <Home className="w-4 h-4" />
            <span>Return Home</span>
          </Link>

          <Link
            to={servicesPath}
            className="w-full sm:w-auto px-6 py-3.5 bg-brand-background dark:bg-[#161616] text-[#1A1A1A] dark:text-white border-2 border-[#1A1A1A] dark:border-white rounded-2xl font-bold text-xs sm:text-sm hover:bg-[#1A1A1A] hover:text-white dark:hover:bg-white dark:hover:text-[#1A1A1A] active:scale-95 transition-all flex items-center justify-center space-x-2"
          >
            <Compass className="w-4 h-4" />
            <span>Explore Services</span>
          </Link>
        </div>

        {/* Quick footer breadcrumb */}
        <div className="mt-12 pt-8 border-t border-[#E9ECEF]/70 dark:border-[#222]">
          <p className="text-xs text-[#6C757D] dark:text-[#888]">
            Looking for verified specialists?{' '}
            <Link to={agentsPath} className="text-[#1A1A1A] dark:text-white font-bold underline hover:opacity-80 transition-opacity">
              Browse Specialists Directory
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
