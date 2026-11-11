import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';

let activeLenis: Lenis | null = null;

/**
 * Access the active Lenis instance anywhere in the application
 */
export const getLenis = () => activeLenis;

/**
 * Universal smooth scroll helper that leverages Lenis 120Hz physics
 * with graceful fallback to native smooth scroll.
 */
export const smoothScrollTo = (
  target: number | string | HTMLElement,
  options?: { offset?: number; duration?: number; immediate?: boolean }
) => {
  const lenis = activeLenis || (typeof window !== 'undefined' ? (window as any).lenis : null);
  if (lenis && typeof lenis.scrollTo === 'function') {
    lenis.scrollTo(target, {
      duration: options?.duration ?? 1.15,
      offset: options?.offset ?? 0,
      immediate: options?.immediate ?? false,
    });
  } else if (typeof window !== 'undefined') {
    if (typeof target === 'number') {
      window.scrollTo({
        top: target,
        behavior: options?.immediate ? 'auto' : 'smooth',
      });
    } else {
      const el = typeof target === 'string' ? document.querySelector(target) : target;
      if (el) {
        el.scrollIntoView({
          behavior: options?.immediate ? 'auto' : 'smooth',
          block: 'start',
        });
      }
    }
  }
};

/**
 * SmoothScroll component
 * Initializes high-precision 120Hz Lenis smooth scrolling engine.
 * Delivers Apple-grade inertia momentum, eliminates micro-stutters,
 * and maintains silky 120Hz refresh rates across desktop and mobile.
 */
const SmoothScroll: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pathname, hash } = useLocation();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    let lenisInstance: Lenis | null = null;
    let rafId: number | null = null;
    let resizeObserver: ResizeObserver | null = null;

    try {
      const LenisClass = Lenis || (window as any).Lenis;
      if (LenisClass) {
        lenisInstance = new LenisClass({
          duration: 1.15,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          orientation: 'vertical',
          gestureOrientation: 'vertical',
          smoothWheel: true,
          wheelMultiplier: 1.0,
          touchMultiplier: 1.25,
          syncTouch: false,
          autoResize: true,
        });

        lenisRef.current = lenisInstance;
        activeLenis = lenisInstance;
        (window as any).lenis = lenisInstance;

        const raf = (time: number) => {
          lenisInstance?.raf(time);
          rafId = requestAnimationFrame(raf);
        };
        rafId = requestAnimationFrame(raf);

        if (typeof ResizeObserver !== 'undefined') {
          resizeObserver = new ResizeObserver(() => {
            lenisInstance?.resize();
          });
          resizeObserver.observe(document.body);
        }
      }
    } catch (err) {
      console.warn('Lenis smooth scroll initialization notice:', err);
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (resizeObserver) resizeObserver.disconnect();
      if (lenisInstance) {
        lenisInstance.destroy();
        if (activeLenis === lenisInstance) activeLenis = null;
        (window as any).lenis = null;
        lenisRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (hash) {
      try {
        const id = hash.replace(/^#/, '');
        const target = document.getElementById(id) || document.querySelector(hash);
        if (target) {
          const timer = setTimeout(() => {
            smoothScrollTo(target as HTMLElement, { offset: -80, duration: 1.2 });
          }, 80);
          return () => clearTimeout(timer);
        }
      } catch {
        // Fallback gracefully
      }
    }

    const lenis = activeLenis || (typeof window !== 'undefined' ? (window as any).lenis : null);
    if (lenis && typeof lenis.scrollTo === 'function') {
      lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    }
  }, [pathname, hash]);

  return <>{children}</>;
};

export default SmoothScroll;
