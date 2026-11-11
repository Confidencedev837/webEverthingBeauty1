'use client';

import React, { ElementType } from 'react';
import { motion, useReducedMotion, Variants } from 'framer-motion';
import { RevealItemProps, MOTION_EASE, DEFAULT_DURATION, DEFAULT_Y_OFFSET } from './types';

/**
 * <RevealItem>
 * A modular child element placed inside <RevealGroup>. It inherits
 * the parent's staggered animation trigger and translates upward into view.
 * 
 * - Only animates transform and opacity for smooth 60fps performance
 * - Accepts customizable `as` tag (e.g. h1, p, span, li, article)
 * - Automatically complies with `prefers-reduced-motion`
 */
export const RevealItem: React.FC<RevealItemProps> = ({
  children,
  y = DEFAULT_Y_OFFSET,
  duration = DEFAULT_DURATION,
  as: Component = 'div',
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion();
  const MotionComponent = motion(Component as ElementType);

  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : y,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0 : duration,
        ease: MOTION_EASE,
      },
    },
  };

  return (
    <MotionComponent variants={itemVariants} className={className}>
      {children}
    </MotionComponent>
  );
};

export default RevealItem;

