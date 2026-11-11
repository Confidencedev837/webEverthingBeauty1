import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';


const ScrollProgressBar: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 260,
    damping: 32,
    restDelta: 0.001
  });

  return (
    <motion.div
      style={{ scaleX, willChange: 'transform' }}
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 h-[2.5px] z-[9999] origin-left pointer-events-none bg-gradient-to-r from-brand-interactive via-brand-accent to-[#D946EF] shadow-[0_0_12px_rgba(108,53,166,0.5)] transform-gpu"
    />
  );
};

export default ScrollProgressBar;
