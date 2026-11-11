'use client';

import React, { ElementType } from 'react';
import { motion, useReducedMotion, Variants } from 'framer-motion';
import { RevealGroupProps, DEFAULT_STAGGER } from './types';

/**
 * <RevealGroup>
 * Orchestrating container that triggers its <RevealItem> children
 * sequentially from top to bottom via Framer Motion `staggerChildren`.
 * 
 * - Viewport detection triggers once ({ once: true, amount: 0.2 })
 * - Direct children with <RevealItem> inherit `hidden` and `visible` variants
 * - Respects prefers-reduced-motion to eliminate motion/delays when preferred
 */
export const RevealGroup: React.FC<RevealGroupProps> = ({
  children,
  stagger = DEFAULT_STAGGER,
  delayChildren = 0,
  as: Component = 'div',
  className = '',
  amount = 0.2,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const MotionComponent = motion(Component as ElementType);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : stagger,
        delayChildren: shouldReduceMotion ? 0 : delayChildren,
      },
    },
  };

  return (
    <MotionComponent
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      variants={containerVariants}
      className={className}
    >
      {children}
    </MotionComponent>
  );
};

export default RevealGroup;

