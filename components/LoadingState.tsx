import React from 'react';
import { motion } from 'framer-motion';

interface LoadingStateProps {
  message?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] w-full gap-8">
      <div className="relative flex items-center justify-center w-32 h-32">
        {/* Outer dotted hollow halo that spins */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border-[3px] border-dotted border-rosePink/50"
        />
        {/* Inner dotted hollow halo that spins opposite */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute inset-2 rounded-full border-[2px] border-dotted border-rosePink/30"
        />
        
        {/* Center Logo in squircle with bounce/pulse */}
        <motion.div
          animate={{ 
            scale: [1, 0.85, 1],
            y: [0, -10, 0]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shadow-lg shadow-rosePink/30 z-10 bg-white"
        >
          <img src="/logo.jpg" alt="Everything Beauty Logo" className="w-full h-full object-cover" />
        </motion.div>
      </div>

      <motion.p 
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="text-[#6C757D] dark:text-[#B0B0B0] font-medium text-base sm:text-lg italic tracking-wider uppercase"
      >
        {message}
      </motion.p>
    </div>
  );
};

export default LoadingState;
