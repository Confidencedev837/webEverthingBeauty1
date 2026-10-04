
import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, useSpring, useTransform } from 'framer-motion';

interface StatBlockProps {
  number: number;
  label: string;
  suffix?: string;
  microTexts: string[];
  icon: React.ReactNode;
}

const StatBlock: React.FC<StatBlockProps> = ({ number, label, suffix = '', microTexts, icon }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  
  const springValue = useSpring(0, {
    stiffness: 40,
    damping: 20,
    duration: 2000,
  });

  const displayValue = useTransform(springValue, (latest) => 
    Math.floor(latest).toLocaleString() + suffix
  );

  const [microIndex, setMicroIndex] = useState(0);

  useEffect(() => {
    if (isInView) {
      springValue.set(number);
    }
  }, [isInView, springValue, number]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMicroIndex((prev) => (prev + 1) % microTexts.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [microTexts.length]);

  return (
    <div 
      ref={ref} 
      className="flex flex-col items-center text-center p-8 bg-white dark:bg-[#1A1A1A] rounded-[2.5rem] border border-[#E9ECEF] dark:border-rosePink/30 transition-all duration-500 hover:scale-105 shadow-xl hover:shadow-[0_0_40px_rgba(255,138,157,0.4)] dark:hover:shadow-[0_0_50px_rgba(255,138,157,0.25)] group"
    >
      <div className="text-rosePink mb-6 w-14 h-14 flex items-center justify-center bg-blushPink dark:bg-rosePink/10 rounded-2xl group-hover:rotate-12 transition-transform duration-300 shadow-[0_0_15px_rgba(255,138,157,0.3)]">
        {icon}
      </div>
      <motion.h3 className="text-4xl md:text-5xl font-bold text-rosePink mb-2 tracking-tight drop-shadow-[0_0_10px_rgba(255,138,157,0.3)]">
        <motion.span>{displayValue}</motion.span>
      </motion.h3>
      <p className="text-lg font-bold text-[#1A1A1A] dark:text-white mb-4 uppercase tracking-widest text-[10px]">
        {label}
      </p>
      <div className="h-12 overflow-hidden relative w-full border-t border-[#E9ECEF] dark:border-[#2D2D2D] pt-4">
        {microTexts.map((text, idx) => (
          <motion.p
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ 
              opacity: microIndex === idx ? 1 : 0, 
              y: microIndex === idx ? 0 : -10 
            }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="text-[11px] font-medium text-[#6C757D] dark:text-[#B0B0B0] absolute inset-0 flex items-center justify-center px-4 italic"
          >
            {text}
          </motion.p>
        ))}
      </div>
    </div>
  );
};

export default StatBlock;
