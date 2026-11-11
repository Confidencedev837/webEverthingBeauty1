'use client';

import React, { ElementType } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { RevealProps, MOTION_EASE, DEFAULT_DURATION, DEFAULT_Y_OFFSET } from './types';

/**
 * <Reveal>
 * Standalone scroll-reveal wrapper that animates an individual element
 * as soon as it enters the viewport.
 * 
 * - Animate only transform (translateY) and opacity for 60fps+ rendering
 * - Automatically respects `prefers-reduced-motion`
 * - Triggers once only ({ once: true })
 */
export const Reveal: React.FC<RevealProps> = ({
  children,
  delay = 0,
  y = DEFAULT_Y_OFFSET,
  duration = DEFAULT_DURATION,
  as: Component = 'div',
  className = '',
  amount = 0.2,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const MotionComponent = motion(Component as ElementType);

  // If user requests reduced motion, show content instantly without offset
  if (shouldReduceMotion) {
    return <Component className={className}>{children}</Component>;
  }

  return (
    <MotionComponent
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{
        duration,
        delay,
        ease: MOTION_EASE,
      }}
      className={className}
    >
      {children}
    </MotionComponent>
  );
};

export default Reveal;

