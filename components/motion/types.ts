import { ElementType, ReactNode } from 'react';

/**
 * Custom Cubic-Bezier easing curve for luxury, responsive motion.
 * Matches: cubic-bezier(0.22, 1, 0.36, 1)
 */
export const MOTION_EASE = [0.22, 1, 0.36, 1] as const;

export const DEFAULT_DURATION = 0.6;
export const DEFAULT_Y_OFFSET = 24;
export const DEFAULT_STAGGER = 0.1;
export const DEFAULT_GRID_STAGGER = 0.08;

export interface RevealProps {
  children: ReactNode;
  /** Custom delay in seconds before animating (default: 0) */
  delay?: number;
  /** Vertical starting offset in pixels (default: 24) */
  y?: number;
  /** Animation duration in seconds (default: 0.6) */
  duration?: number;
  /** HTML tag or element to render as (default: 'div') */
  as?: ElementType;
  /** Additional CSS class names */
  className?: string;
  /** Viewport intersection threshold to trigger animation (default: 0.2) */
  amount?: number;
}

export interface RevealGroupProps {
  children: ReactNode;
  /** Stagger time in seconds between each child reveal (default: 0.1) */
  stagger?: number;
  /** Initial delay in seconds before the first child starts animating (default: 0) */
  delayChildren?: number;
  /** HTML tag or element to render as (default: 'div') */
  as?: ElementType;
  /** Additional CSS class names */
  className?: string;
  /** Viewport intersection threshold to trigger group animation (default: 0.2) */
  amount?: number;
}

export interface RevealItemProps {
  children: ReactNode;
  /** Vertical starting offset in pixels (default: 24) */
  y?: number;
  /** Animation duration in seconds (default: 0.6) */
  duration?: number;
  /** HTML tag or element to render as (default: 'div') */
  as?: ElementType;
  /** Additional CSS class names */
  className?: string;
}

