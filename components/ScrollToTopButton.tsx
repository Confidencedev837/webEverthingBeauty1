import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { smoothScrollTo } from './SmoothScroll';

/**
 * ScrollToTopButton
 * Floating tactile capsule button that appears when user scrolls down.
 * Positioned on the bottom-right with responsive clearance above the mobile bottom bar.
 * Uses Lenis 120Hz physics for a silky smooth glide to top.
 */
const ScrollToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let ticking = false;

    const checkScroll = (y: number) => {
      setIsVisible(y > 380);
    };

    const handleWindowScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          checkScroll(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleWindowScroll, { passive: true });

    // Also listen to Lenis instance if available
    const lenis = (window as any).lenis;
    const unsubscribeLenis = typeof lenis?.on === 'function'
      ? lenis.on('scroll', ({ scroll }: { scroll: number }) => {
          checkScroll(scroll);
        })
      : undefined;

    return () => {
      window.removeEventListener('scroll', handleWindowScroll);
      if (typeof unsubscribeLenis === 'function') {
        unsubscribeLenis();
      }
    };
  }, []);

  const scrollToTop = () => {
    smoothScrollTo(0, { duration: 1.15 });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.7, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.7, y: 15 }}
          whileHover={{ scale: 1.1, y: -3 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 420, damping: 26 }}
          onClick={scrollToTop}
          aria-label="Scroll to top"
          className="fixed bottom-24 right-4 sm:bottom-8 sm:right-8 z-40 w-11 h-11 sm:w-12 sm:h-12 aspect-square rounded-2xl bg-white/90 dark:bg-[#141414]/90 backdrop-blur-2xl border border-black/8 dark:border-white/15 shadow-[0_8px_30px_rgba(108,53,166,0.18)] hover:shadow-[0_14px_40px_rgba(108,53,166,0.35)] dark:hover:shadow-[0_14px_40px_rgba(108,53,166,0.5)] hover:border-brand-interactive/50 dark:hover:border-brand-interactive/50 text-brand-interactive dark:text-brand-accent transition-all duration-200 flex items-center justify-center cursor-pointer group active:outline-none focus:outline-none"
        >
          <ArrowUp className="w-5 h-5 group-hover:-translate-y-1 transition-transform duration-200 ease-out" />
          <span className="sr-only">Back to top</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTopButton;
