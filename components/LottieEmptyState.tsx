import React from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutGrid, 
  Film, 
  Play, 
  Users, 
  UserPlus, 
  Heart, 
  Sparkle, 
  ShoppingBag,
  Layers,
  Compass
} from 'lucide-react';

export type EmptyStateType = 'services' | 'reels' | 'community' | 'liked';

interface LottieEmptyStateProps {
  type: EmptyStateType;
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  subType?: 'followers' | 'following';
}

export const LottieEmptyState: React.FC<LottieEmptyStateProps> = ({
  type,
  title,
  description,
  actionText,
  onAction,
  subType
}) => {
  // ── Render Specific Looping Lottie Vector Composition ──
  const renderVisual = () => {
    switch (type) {
      case 'services':
        return (
          <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
            {/* Ambient Breathing Glow */}
            <motion.div
              animate={{
                scale: [1, 1.25, 1],
                opacity: [0.35, 0.65, 0.35],
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute inset-2 rounded-full bg-gradient-to-tr from-brand-interactive/30 to-purple-400/20 blur-2xl -z-10"
            />

            {/* Concentric Radiating Rings */}
            <motion.div
              animate={{
                scale: [0.85, 1.25, 0.85],
                opacity: [0.6, 0.15, 0.6],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute inset-0 rounded-full border border-brand-interactive/25 dark:border-brand-interactive/20 pointer-events-none"
            />
            <motion.div
              animate={{
                scale: [1.1, 0.9, 1.1],
                opacity: [0.15, 0.45, 0.15],
              }}
              transition={{
                duration: 4.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.5,
              }}
              className="absolute -inset-3 rounded-full border border-dashed border-brand-interactive/20 dark:border-brand-interactive/15 pointer-events-none"
            />

            {/* Orbiting Boutique Dot */}
            <motion.div
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="absolute inset-0 pointer-events-none"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-brand-interactive shadow-[0_0_10px_rgba(108,53,166,0.8)] -top-1 left-1/2 -translate-x-1/2" />
            </motion.div>

            {/* Floating Main Boutique Box */}
            <motion.div
              animate={{
                y: [0, -8, 0],
                rotate: [0, -2, 2, 0],
              }}
              transition={{
                duration: 3.8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-surface via-white to-brand-surface/70 dark:from-[#221c2b] dark:via-[#1a1522] dark:to-[#14101b] p-4 flex items-center justify-center border border-brand-interactive/30 dark:border-brand-interactive/25 shadow-[0_12px_28px_rgba(108,53,166,0.18)] dark:shadow-[0_12px_28px_rgba(0,0,0,0.5)] transform-gpu"
            >
              <LayoutGrid className="w-9 h-9 text-brand-interactive dark:text-brand-accent drop-shadow-sm" />

              {/* Mini corner tag */}
              <motion.div
                animate={{
                  scale: [1, 1.15, 1],
                }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-brand-interactive text-white flex items-center justify-center text-[10px] font-black shadow-md border-2 border-white dark:border-[#14101b]"
              >
                <ShoppingBag className="w-3 h-3 text-white" />
              </motion.div>
            </motion.div>
          </div>
        );

      case 'reels':
        return (
          <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
            {/* Ambient Radiant Halo */}
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.35, 0.7, 0.35],
              }}
              transition={{
                duration: 3.2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute inset-2 rounded-full bg-gradient-to-tr from-rose-500/30 to-amber-500/20 blur-2xl -z-10"
            />

            {/* Outer Rotating Film Gear Halo */}
            <motion.div
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 16,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="absolute inset-0 rounded-full border border-dashed border-rose-500/30 dark:border-rose-400/20 pointer-events-none"
            />

            {/* Looping Soundwave Equalizer Bars Floating Below */}
            <div className="absolute -bottom-2 flex items-end space-x-1.5 z-20">
              {[0.4, 0.9, 0.5, 1, 0.7, 0.3].map((heightScale, idx) => (
                <motion.div
                  key={idx}
                  animate={{
                    height: [4, 18 * heightScale, 6],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: idx * 0.16,
                    ease: 'easeInOut',
                  }}
                  className="w-1.5 rounded-full bg-gradient-to-t from-rose-500 to-amber-400 shadow-xs"
                />
              ))}
            </div>

            {/* Floating Video Reel Card */}
            <motion.div
              animate={{
                y: [0, -7, 0],
              }}
              transition={{
                duration: 3.2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-rose-50 via-white to-amber-50/50 dark:from-[#2a1720] dark:via-[#1e1117] dark:to-[#170c12] p-4 flex items-center justify-center border border-rose-500/30 dark:border-rose-500/25 shadow-[0_12px_28px_rgba(244,63,94,0.18)] dark:shadow-[0_12px_28px_rgba(0,0,0,0.5)] transform-gpu"
            >
              <Film className="w-9 h-9 text-rose-500 dark:text-rose-400 drop-shadow-sm" />

              {/* Pulsing Play Badge */}
              <motion.div
                animate={{
                  scale: [1, 1.22, 1],
                  boxShadow: [
                    '0 0 0 0 rgba(244,63,94,0.4)',
                    '0 0 0 8px rgba(244,63,94,0)',
                    '0 0 0 0 rgba(244,63,94,0)',
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center shadow-md border-2 border-white dark:border-[#170c12]"
              >
                <Play className="w-2.5 h-2.5 fill-white text-white ml-0.5" />
              </motion.div>
            </motion.div>
          </div>
        );

      case 'community':
        return (
          <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
            {/* Ambient Aura */}
            <motion.div
              animate={{
                scale: [1, 1.25, 1],
                opacity: [0.35, 0.65, 0.35],
              }}
              transition={{
                duration: 3.6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute inset-2 rounded-full bg-gradient-to-tr from-sky-500/30 to-indigo-500/20 blur-2xl -z-10"
            />

            {/* Orbiting Satellite Avatar 1 */}
            <motion.div
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 9,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="absolute inset-0 pointer-events-none"
            >
              <div className="w-7 h-7 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-md border-2 border-white dark:border-[#151a24] -top-2 left-1/2 -translate-x-1/2">
                <Users className="w-3.5 h-3.5" />
              </div>
            </motion.div>

            {/* Orbiting Satellite Avatar 2 */}
            <motion.div
              animate={{
                rotate: -360,
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="absolute inset-1 pointer-events-none"
            >
              <div className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-md border-2 border-white dark:border-[#151a24] -bottom-1 left-1/2 -translate-x-1/2">
                <UserPlus className="w-3 h-3" />
              </div>
            </motion.div>

            {/* Central Community Node */}
            <motion.div
              animate={{
                y: [0, -6, 0],
                scale: [1, 1.02, 1],
              }}
              transition={{
                duration: 3.4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-sky-50 via-white to-indigo-50/50 dark:from-[#17202d] dark:via-[#121822] dark:to-[#0f141d] p-4 flex items-center justify-center border border-sky-500/30 dark:border-sky-500/25 shadow-[0_12px_28px_rgba(14,165,233,0.18)] dark:shadow-[0_12px_28px_rgba(0,0,0,0.5)] transform-gpu"
            >
              <Users className="w-9 h-9 text-sky-500 dark:text-sky-400 drop-shadow-sm" />
            </motion.div>
          </div>
        );

      case 'liked':
        return (
          <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
            {/* Ambient Passion Glow */}
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.4, 0.75, 0.4],
              }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute inset-2 rounded-full bg-gradient-to-tr from-rose-500/35 to-pink-500/25 blur-2xl -z-10"
            />

            {/* Drifting Floating Micro-Hearts (Particle Effect) */}
            <motion.div
              animate={{
                y: [0, -28],
                x: [0, 8],
                opacity: [0, 0.9, 0],
                scale: [0.6, 1, 0.8],
              }}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                ease: 'easeOut',
                delay: 0.2,
              }}
              className="absolute top-4 left-6 text-rose-500 pointer-events-none"
            >
              <Heart className="w-4 h-4 fill-rose-500" />
            </motion.div>
            <motion.div
              animate={{
                y: [0, -32],
                x: [0, -10],
                opacity: [0, 0.85, 0],
                scale: [0.5, 0.9, 0.7],
              }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                ease: 'easeOut',
                delay: 1.1,
              }}
              className="absolute top-2 right-6 text-pink-500 pointer-events-none"
            >
              <Heart className="w-3.5 h-3.5 fill-pink-500" />
            </motion.div>

            {/* Floating Central Heart Card with Natural Heartbeat */}
            <motion.div
              animate={{
                scale: [1, 1.14, 1, 1.18, 1],
                y: [0, -5, 0],
              }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-rose-50 via-white to-pink-50/50 dark:from-[#2e151c] dark:via-[#210f14] dark:to-[#170a0e] p-4 flex items-center justify-center border border-rose-500/30 dark:border-rose-500/25 shadow-[0_12px_28px_rgba(244,63,94,0.22)] dark:shadow-[0_12px_28px_rgba(0,0,0,0.5)] transform-gpu"
            >
              <Heart className="w-9 h-9 fill-rose-500 text-rose-500 drop-shadow-sm" />
            </motion.div>
          </div>
        );
    }
  };

  return (
    <div className="py-14 sm:py-16 px-4 text-center select-none">
      {/* 1. ANIMATED LOTTIE VECTOR SCENE */}
      <div className="mb-5 flex items-center justify-center">
        {renderVisual()}
      </div>

      {/* 2. TYPOGRAPHY */}
      <h3 className="text-lg sm:text-xl font-serif font-black text-[#1A1A1A] dark:text-white tracking-tight">
        {title || (
          type === 'services' ? 'No services listed yet' :
          type === 'reels' ? 'No video reels yet' :
          type === 'community' ? (subType === 'followers' ? 'No followers yet' : 'Not following anyone yet') :
          'No liked services yet'
        )}
      </h3>

      <p className="text-xs sm:text-sm text-[#6C757D] dark:text-[#9E9E9E] mt-1.5 max-w-sm mx-auto leading-relaxed">
        {description || (
          type === 'services' ? 'This specialist has not published service items yet.' :
          type === 'reels' ? 'Video transformations and styling clips will appear here.' :
          type === 'community' ? (
            subType === 'followers' 
              ? 'Be the first to follow this specialist to stay updated with new treatments.' 
              : "This specialist hasn't followed any accounts yet."
          ) :
          'Services you like with the heart icon will appear in this collection.'
        )}
      </p>

      {/* 3. OPTIONAL ACTION BUTTON */}
      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 px-5 py-2.5 rounded-full bg-brand-interactive text-white font-bold text-xs shadow-md hover:bg-brand-interactive/90 transition-all active:scale-95 cursor-pointer"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default LottieEmptyState;

