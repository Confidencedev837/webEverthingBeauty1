import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, animate } from 'framer-motion';
import {
  ShieldCheck,
  Star,
  Users,
  Calendar,
  Award,
  Phone,
  MapPin,
  AlertCircle,
  Play,
  User,
  LayoutGrid,
  UserPlus,
  UserCheck,
  Heart,
  Bookmark,
  ChevronLeft,
  Share2,
  Film,
  Layers,
  MessageCircle,
  ExternalLink,
  Check,
  Copy,
  X,
  Clock,
  Rows3,
  Tag,
  ArrowRight,
  Volume2,
  VolumeX,
  CheckCircle2
} from 'lucide-react';
import { Agent, Service, VerificationStatus } from '../types';
import { smoothScrollTo } from '../components/SmoothScroll';
import { formatPhoneNumberForWhatsApp } from '../services/whatsappService';
import {
  getAgentById,
  getServices,
  getServicesByAgentId,
  isVideoUrl,
  getFollowCounts,
  getFollowers,
  getFollowing,
  getMyFollowingIds,
  setFollow,
  getLikedServiceIds,
  setServiceLike,
  getFavoriteServiceIds,
  setServiceFavorite,
  type SocialUser
} from '../services/supabaseService';
import { useAuth } from '../context/AuthContext';
import { useSnackbar } from '../components/Snackbar';
import BookingModal from '../components/BookingModal';
import LottieEmptyState from '../components/LottieEmptyState';

export function getInitialsSvg(name: string) {
  const initials = name
    ? name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()
    : 'A';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#6C35A6" /><text x="50%" y="50%" fill="white" font-family="sans-serif" font-size="38" font-weight="bold" text-anchor="middle" dominant-baseline="central">${initials}</text></svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

// 4 Profile Tabs
type ProfileTab = 'services' | 'reels' | 'community' | 'liked';

// Animated Counter Component for squircle follower/following stats
const AnimatedStatCount: React.FC<{ value: number }> = ({ value }) => {
  const [display, setDisplay] = useState(value);
  const [bump, setBump] = useState(0);
  const prev = React.useRef(value);

  useEffect(() => {
    if (prev.current === value) return;
    const controls = animate(prev.current, value, {
      duration: 0.5,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(Math.round(v))
    });
    prev.current = value;
    setBump((b) => b + 1);
    return () => controls.stop();
  }, [value]);

  return (
    <motion.span
      key={bump}
      initial={{ scale: bump === 0 ? 1 : 1.3, y: bump === 0 ? 0 : -3 }}
      animate={{ scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 450, damping: 16 }}
      className="inline-block tabular-nums font-black"
    >
      {display.toLocaleString()}
    </motion.span>
  );
};

// Real Social Media Brand SVGs
const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.031 2C6.516 2 2.025 6.49 2.025 12.006a10.02 10.02 0 0 0 1.583 5.424L2 22l4.707-1.545a9.98 9.98 0 0 0 5.324 1.551h.005c5.514 0 10.005-4.49 10.005-10.006C22.041 6.49 17.55 2 12.031 2zm0 18.326h-.004a8.27 8.27 0 0 1-4.223-1.157l-.303-.18-3.136 1.028 1.047-3.056-.197-.315a8.293 8.293 0 0 1-1.272-4.64c0-4.57 3.719-8.289 8.29-8.289 4.568 0 8.286 3.719 8.286 8.289 0 4.57-3.718 8.29-8.287 8.29zm4.544-6.208c-.249-.125-1.472-.727-1.7-.81-.229-.083-.395-.125-.561.125-.166.25-.644.81-.789.977-.145.166-.291.187-.54.062s-1.05-.387-2-1.234c-.739-.659-1.238-1.473-1.383-1.722-.145-.25-.015-.385.109-.509.112-.112.249-.291.374-.436.125-.145.166-.25.249-.416.083-.166.042-.312-.021-.437-.062-.125-.561-1.352-.769-1.851-.202-.486-.407-.42-.56-.428l-.478-.008c-.166 0-.436.062-.664.312-.229.25-.873.853-.873 2.08s.894 2.413 1.019 2.58c.125.166 1.76 2.687 4.263 3.768.595.257 1.06.41 1.423.526.598.19 1.142.163 1.572.099.48-.072 1.472-.602 1.68-1.185.207-.582.207-1.081.145-1.185-.062-.104-.228-.166-.477-.291z" />
  </svg>
);

const InstagramIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const XTwitterIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const FacebookIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

// Custom Share Modal Component
export const getAppBaseUrl = () => {
  if (typeof window === 'undefined') return 'https://everythingbeauty.app';
  const isLocal =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '0.0.0.0';
  return isLocal ? 'https://everythingbeauty.app' : window.location.origin;
};

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: Agent;
  handle: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, agent, handle }) => {
  const [copied, setCopied] = useState(false);
  const { showSnackbar } = useSnackbar();
  const shareUrl = `${getAppBaseUrl()}/#/agent/${agent.id}`;
  const shareText = `Check out ${agent.name} (${agent.specialty}) on Everything Beauty!`;

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    showSnackbar?.('Profile link copied to clipboard', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`, '_blank');
  };

  const handleInstagram = () => {
    navigator.clipboard.writeText(shareUrl);
    showSnackbar?.('Profile link copied! Share it on your Instagram Story or DM', 'success');
    window.open('https://www.instagram.com', '_blank');
  };

  const handleTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const handleFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-md bg-white dark:bg-[#141414] rounded-3xl shadow-2xl border border-[#E9ECEF] dark:border-[#2D2D2D] p-5 sm:p-6 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#E9ECEF] dark:border-[#252525]">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-brand-interactive/10 text-brand-interactive">
                <Share2 className="w-4 h-4" />
              </div>
              <h3 className="font-serif font-black text-base text-[#1A1A1A] dark:text-white">
                Share Specialist Profile
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-[#6C757D] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Profile Snapshot */}
          <div className="flex items-center space-x-3 my-4 p-3 rounded-2xl bg-brand-surface dark:bg-[#1C1C1C] border border-[#E9ECEF] dark:border-[#2A2A2A]">
            <img
              src={agent.image && agent.image.trim() !== '' ? agent.image : getInitialsSvg(agent.name)}
              alt={agent.name}
              className="w-12 h-12 rounded-full object-cover shrink-0 border border-black/10 dark:border-white/10"
              onError={(e) => {
                e.currentTarget.src = getInitialsSvg(agent.name);
              }}
            />
            <div className="min-w-0">
              <h4 className="font-bold text-sm text-[#1A1A1A] dark:text-white truncate">
                {agent.name}
              </h4>
              <p className="text-xs text-brand-interactive font-medium truncate">
                {agent.specialty || 'Beauty Professional'}
              </p>
              <p className="text-[11px] text-[#6C757D] dark:text-[#A0A0A0]">
                {handle}
              </p>
            </div>
          </div>

          {/* Quick Social Channels - Real Branded SVGs and Colors */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {/* WhatsApp */}
            <button
              onClick={handleWhatsApp}
              className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] transition-all group cursor-pointer shadow-sm active:scale-95"
            >
              <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center mb-1.5 shadow-sm group-hover:scale-110 transition-transform">
                <WhatsAppIcon className="w-5 h-5 fill-current" />
              </div>
              <span className="text-[11px] font-black tracking-tight text-[#1A1A1A] dark:text-white">WhatsApp</span>
            </button>

            {/* Instagram */}
            <button
              onClick={handleInstagram}
              className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-[#E1306C]/10 hover:bg-[#E1306C]/20 border border-[#E1306C]/30 text-[#E1306C] transition-all group cursor-pointer shadow-sm active:scale-95"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center mb-1.5 shadow-sm group-hover:scale-110 transition-transform">
                <InstagramIcon className="w-5 h-5 fill-current" />
              </div>
              <span className="text-[11px] font-black tracking-tight text-[#1A1A1A] dark:text-white">Instagram</span>
            </button>

            {/* X / Twitter */}
            <button
              onClick={handleTwitter}
              className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-[#E9ECEF] dark:border-[#333] text-[#1A1A1A] dark:text-white transition-all group cursor-pointer shadow-sm active:scale-95"
            >
              <div className="w-10 h-10 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center mb-1.5 shadow-sm group-hover:scale-110 transition-transform">
                <XTwitterIcon className="w-4 h-4 fill-current" />
              </div>
              <span className="text-[11px] font-black tracking-tight text-[#1A1A1A] dark:text-white">X</span>
            </button>

            {/* Facebook */}
            <button
              onClick={handleFacebook}
              className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/30 text-[#1877F2] transition-all group cursor-pointer shadow-sm active:scale-95"
            >
              <div className="w-10 h-10 rounded-xl bg-[#1877F2] text-white flex items-center justify-center mb-1.5 shadow-sm group-hover:scale-110 transition-transform">
                <FacebookIcon className="w-5 h-5 fill-current" />
              </div>
              <span className="text-[11px] font-black tracking-tight text-[#1A1A1A] dark:text-white">Facebook</span>
            </button>
          </div>

          {/* Copy Link Strip */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase tracking-wider text-[#6C757D] dark:text-[#A0A0A0]">
              Page Link
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 px-3 py-2.5 rounded-xl bg-brand-surface dark:bg-[#1C1C1C] text-xs text-[#1A1A1A] dark:text-white border border-[#E9ECEF] dark:border-[#2D2D2D] outline-none select-all truncate"
              />
              <button
                onClick={handleCopy}
                className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${copied
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'bg-brand-interactive text-white shadow-[0_0_12px_rgba(108,53,166,0.35)] hover:bg-brand-interactive/90'
                  }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// Auto-plays video tile when scrolled past/into viewport
const AutoPlayVideoTile: React.FC<{ src: string; poster?: string; muted?: boolean }> = ({ src, poster, muted = true }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = muted;
    }
  }, [muted]);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play().catch(() => { });
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.35 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [src]);

  return (
    <div ref={containerRef} className="w-full h-full">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        muted={muted}
        loop
        playsInline
        preload="metadata"
        className="w-full h-full object-cover"
      />
    </div>
  );
};

// Rich Instagram-Style Post Card for Services
interface InstagramServicePostCardProps {
  service: Service;
  agent: Agent;
  cleanHandle: string;
  isLiked: boolean;
  isFavorite: boolean;
  onToggleLike: (e: React.MouseEvent) => void;
  onToggleFavorite: (e: React.MouseEvent) => void;
  onBookService: (service: Service) => void;
  isNudged?: boolean;
}

const InstagramServicePostCard: React.FC<InstagramServicePostCardProps> = ({
  service,
  agent,
  cleanHandle,
  isLiked,
  isFavorite,
  onToggleLike,
  onToggleFavorite,
  onBookService,
  isNudged = false
}) => {
  const { showSnackbar } = useSnackbar();
  const [heartBurst, setHeartBurst] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  const isVideo = isVideoUrl(service.image);
  const galleryVideos = (service.gallery || []).filter(
    (item) => item.type === 'video' || isVideoUrl(item.url)
  );
  const firstVideoUrl = isVideo ? service.image : galleryVideos[0]?.url || null;
  const hasVideo = Boolean(firstVideoUrl);

  const handleMediaDoubleTap = (e: React.MouseEvent) => {
    setHeartBurst(true);
    setTimeout(() => setHeartBurst(false), 900);
    if (!isLiked) {
      onToggleLike(e);
    }
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${getAppBaseUrl()}/#/services/${service.id}`;
    navigator.clipboard.writeText(url);
    showSnackbar?.(`Direct link to "${service.name}" copied!`, 'success');
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!agent.phone) {
      showSnackbar?.(`Direct chat with ${agent.name} is currently unavailable.`, 'info');
      return;
    }
    const cleanPhone = formatPhoneNumberForWhatsApp(agent.phone);
    const msg = `Hello ${agent.name}, I want to book your "${service.name}" service (₦${service.price.toLocaleString()}) via Everything Beauty.`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <motion.article
      id={`post-service-${service.id}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white dark:bg-[#141414] rounded-3xl border transition-all duration-300 overflow-hidden ${isNudged
          ? 'border-brand-interactive shadow-[0_0_30px_rgba(108,53,166,0.25)] ring-2 ring-brand-interactive/50'
          : 'border-[#E9ECEF] dark:border-[#262626] shadow-[0_4px_24px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)]'
        }`}
    >
      {/* 1. POST HEADER (Instagram Style) */}
      <div className="px-4 py-3 sm:px-5 sm:py-3.5 flex items-center justify-between border-b border-[#E9ECEF]/70 dark:border-[#222222]">
        <div className="flex items-center space-x-3 min-w-0">
          {/* Avatar with Instagram Gradient Ring */}
          <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-[#32104D] via-[#6C35A6] to-[#F43F5E] shrink-0">
            <div className="w-full h-full p-0.5 bg-white dark:bg-[#141414] rounded-full overflow-hidden">
              <img
                src={agent.image && agent.image.trim() !== '' ? agent.image : getInitialsSvg(agent.name)}
                alt={agent.name}
                className="w-full h-full rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = getInitialsSvg(agent.name);
                }}
              />
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center space-x-1.5 flex-wrap">
              <span className="font-bold text-xs sm:text-sm text-[#1A1A1A] dark:text-white truncate">
                {cleanHandle}
              </span>
              <span className="text-[#8E8E8E] text-xs">•</span>
              <span className="text-xs font-semibold text-brand-interactive truncate">
                {service.category}
              </span>
            </div>
            <p className="text-[11px] text-[#6C757D] dark:text-[#A0A0A0] flex items-center space-x-1 truncate">
              <MapPin className="w-3 h-3 text-brand-interactive shrink-0" />
              <span className="truncate">{service.agentLocation || agent.location || 'Doorstep Service'}</span>
            </p>
          </div>
        </div>

        {/* Top Right: Clean Unboxed Duration (No rounded box) */}
        <div className="flex items-center space-x-1.5 shrink-0 text-amber-500 dark:text-amber-400 font-bold text-xs sm:text-sm">
          <Clock className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
          <span>{service.durationMins || 60}m</span>
        </div>
      </div>

      {/* 2. POST MEDIA (Double-Tap to Like with Floating Shopping Tag) */}
      <div
        className="relative aspect-square sm:aspect-[4/3] max-h-[500px] bg-black/5 dark:bg-black/40 overflow-hidden cursor-pointer select-none group"
        onDoubleClick={handleMediaDoubleTap}
      >
        {hasVideo && firstVideoUrl ? (
          <AutoPlayVideoTile
            src={firstVideoUrl}
            poster={!isVideo ? service.image : undefined}
            muted={isMuted}
          />
        ) : service.image ? (
          <img
            src={service.image}
            alt={service.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = getInitialsSvg(service.name);
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-brand-surface dark:bg-[#1E1E1E]">
            <span className="text-base font-black text-brand-interactive">
              {service.name}
            </span>
          </div>
        )}

        {/* Double-Tap Heart Burst Animation */}
        <AnimatePresence>
          {heartBurst && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.3, 1], opacity: [0, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.85, ease: 'easeOut' }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
            >
              <Heart className="w-24 h-24 text-rose-500 fill-rose-500 drop-shadow-[0_4px_20px_rgba(244,63,94,0.6)]" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Instagram Shopping Price Tag */}
        <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-md text-white text-xs font-black shadow-lg border border-white/20 flex items-center space-x-1.5 pointer-events-none z-10">
          <Tag className="w-3.5 h-3.5 text-brand-accent" />
          <span>₦{service.price.toLocaleString()}</span>
        </div>

        {/* Video Sound Toggle Button */}
        {hasVideo && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsMuted(!isMuted);
            }}
            className="absolute bottom-3 right-3 p-2 rounded-full bg-black/75 backdrop-blur-md text-white hover:bg-black/90 transition-colors z-10 cursor-pointer shadow-md border border-white/10"
            title={isMuted ? 'Unmute video' : 'Mute video'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* 3. INSTAGRAM ACTION TOOLKIT BAR */}
      <div className="px-4 py-3 sm:px-5 sm:py-3.5 flex items-center justify-between gap-3 border-b border-[#E9ECEF]/70 dark:border-[#222222]">
        <div className="flex items-center space-x-3.5">
          {/* Like */}
          <button
            type="button"
            onClick={onToggleLike}
            className="p-1 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 active:scale-90 transition-transform cursor-pointer"
            title={isLiked ? 'Unlike' : 'Like'}
          >
            <Heart
              className={`w-6 h-6 transition-colors ${isLiked ? 'text-rose-500 fill-rose-500' : 'text-[#1A1A1A] dark:text-white'
                }`}
            />
          </button>

          {/* WhatsApp / Chat */}
          <button
            type="button"
            onClick={handleWhatsApp}
            className="p-1 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 active:scale-90 transition-transform text-[#1A1A1A] dark:text-white hover:text-emerald-500 cursor-pointer"
            title="Chat on WhatsApp about this service"
          >
            <WhatsAppIcon className="w-5.5 h-5.5 fill-current" />
          </button>

          {/* Share */}
          <button
            type="button"
            onClick={handleShareClick}
            className="p-1 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 active:scale-90 transition-transform text-[#1A1A1A] dark:text-white hover:text-brand-interactive cursor-pointer"
            title="Share this service link"
          >
            <Share2 className="w-5.5 h-5.5" />
          </button>

          {/* Bookmark */}
          <button
            type="button"
            onClick={onToggleFavorite}
            className="p-1 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 active:scale-90 transition-transform cursor-pointer"
            title={isFavorite ? 'Remove from saved' : 'Save service'}
          >
            <Bookmark
              className={`w-6 h-6 transition-colors ${isFavorite ? 'text-amber-500 fill-amber-500' : 'text-[#1A1A1A] dark:text-white'
                }`}
            />
          </button>
        </div>

        {/* PRIMARY CONVERSION CTA: Book This Service Button (With generous padding & arranged typography) */}
        <button
          onClick={() => onBookService(service)}
          className="py-3 px-6 sm:py-3.5 sm:px-8 rounded-full bg-gradient-to-r from-[#6C35A6] to-[#7B3DB8] text-white text-xs sm:text-sm font-black tracking-wide flex items-center space-x-2.5 shadow-[0_6px_22px_rgba(108,53,166,0.38)] hover:shadow-[0_8px_26px_rgba(108,53,166,0.5)] border-t border-white/25 active:scale-[0.98] transition-all cursor-pointer shrink-0"
        >
          <Calendar className="w-4 h-4 shrink-0" />
          <span>Book This Service</span>
        </button>
      </div>

      {/* 4. CAPTION & SERVICE SPECS */}
      <div className="px-4 py-3 sm:px-5 sm:py-4 space-y-2.5">
        {/* Rating summary */}
        <div className="flex items-center space-x-2 text-xs font-black text-[#1A1A1A] dark:text-white">
          <span>{isLiked ? 'You and others liked this' : 'Verified Appointment Service'}</span>
          <span>•</span>
          <span className="flex items-center text-amber-500">
            <Star className="w-3.5 h-3.5 fill-current mr-1" />
            {service.rating > 0 ? service.rating.toFixed(1) : '5.0'} ({service.reviewCount || 1})
          </span>
        </div>

        {/* Caption */}
        <div>
          <p className="text-xs sm:text-sm leading-relaxed text-[#262626] dark:text-[#E0E0E0]">
            <span className="font-black text-[#1A1A1A] dark:text-white mr-1.5">{cleanHandle}</span>
            <span className="font-bold text-brand-interactive mr-1.5">{service.name}:</span>
            <span>
              {isExpanded || (service.description && service.description.length <= 130)
                ? service.description
                : `${(service.description || '').slice(0, 130)}...`}
            </span>
            {service.description && service.description.length > 130 && (
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="ml-1 text-xs font-bold text-[#6C757D] hover:text-brand-interactive cursor-pointer inline"
              >
                {isExpanded ? 'less' : 'more'}
              </button>
            )}
          </p>
        </div>

        {/* Clean Flat Feature Tags (No rounded boxes) */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-[11px] sm:text-xs">
          <span className="inline-flex items-center font-bold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Doorstep Available
          </span>
          <span className="text-gray-300 dark:text-[#444] font-black select-none">•</span>
          <span className="font-bold text-brand-interactive dark:text-brand-accent">
            Upfront Pricing
          </span>
          <span className="text-gray-300 dark:text-[#444] font-black select-none">•</span>
          <span className="font-bold text-brand-interactive dark:text-brand-accent">
            Live Availability
          </span>
        </div>

        {/* Link to Full Specs */}
        <div className="pt-2 border-t border-[#E9ECEF]/50 dark:border-[#222222]/50">
          <Link
            to={`/services/${service.id}`}
            className="text-xs font-bold text-brand-interactive hover:underline inline-flex items-center space-x-1"
          >
            <span>View complete service portfolio & reviews</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
};

const AgentProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, currentUser } = useAuth();
  const { showSnackbar } = useSnackbar();

  const servicesSectionRef = useRef<HTMLDivElement>(null);
  const [serviceViewMode, setServiceViewMode] = useState<'grid' | 'feed'>('grid');
  const [isBookingNudgeActive, setIsBookingNudgeActive] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  const [agent, setAgent] = useState<Agent | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active Tab: services | reels | community | liked
  const [activeTab, setActiveTab] = useState<ProfileTab>('services');
  const [communitySubTab, setCommunitySubTab] = useState<'followers' | 'following'>('followers');

  // Share Modal state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Social state
  const [counts, setCounts] = useState<{ followers: number; following: number }>({ followers: 0, following: 0 });
  const [followers, setFollowers] = useState<SocialUser[]>([]);
  const [following, setFollowing] = useState<SocialUser[]>([]);
  const [myFollowingIds, setMyFollowingIds] = useState<string[]>([]);
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [followBusy, setFollowBusy] = useState<string | null>(null);

  // Booking Modal
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState<Service | null>(null);

  // Categories derived for filtering
  const serviceCategories = useMemo(() => {
    const cats = new Set<string>();
    services.forEach((s) => {
      if (s.category && s.category.trim() !== '') {
        cats.add(s.category.trim());
      }
    });
    return ['all', ...Array.from(cats)];
  }, [services]);

  const filteredServices = useMemo(() => {
    if (selectedCategoryFilter === 'all') return services;
    return services.filter((s) => s.category?.toLowerCase() === selectedCategoryFilter.toLowerCase());
  }, [services, selectedCategoryFilter]);

  // Book Now action: redirects & smoothly scrolls to transformed Instagram-style services feed
  const handleBookNowClick = () => {
    if (services.length === 0) {
      showSnackbar?.('This specialist has not published any bookable services yet.', 'info');
      return;
    }
    setActiveTab('services');
    setServiceViewMode('feed');
    setIsBookingNudgeActive(true);

    requestAnimationFrame(() => {
      setTimeout(() => {
        if (servicesSectionRef.current) {
          servicesSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 80);
    });
  };

  // URL listener: supports /agent/:id?book=true and #services
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const shouldBook = searchParams.get('book') === 'true' || location.hash === '#services';
    if (shouldBook && services.length > 0 && !loading) {
      setActiveTab('services');
      setServiceViewMode('feed');
      setIsBookingNudgeActive(true);
      setTimeout(() => {
        servicesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, [location.search, location.hash, services.length, loading]);

  // Fast initial social metrics (counts + my follow status only)
  const loadSocialCounts = async (agentId: string) => {
    try {
      const [c, liked, favs, mine] = await Promise.all([
        getFollowCounts(agentId),
        user ? getLikedServiceIds(user.id) : Promise.resolve([] as string[]),
        user ? getFavoriteServiceIds(user.id) : Promise.resolve([] as string[]),
        user ? getMyFollowingIds(user.id) : Promise.resolve([] as string[])
      ]);

      setCounts({ followers: c.followers, following: c.following });
      setLikedIds(liked);
      setFavoriteIds(favs);
      setMyFollowingIds(mine);
    } catch {
      setCounts({ followers: 0, following: 0 });
    }
  };

  // Lazy-load detailed user list when Community tab is clicked
  const loadCommunityProfiles = async (agentId: string) => {
    try {
      const [fr, fg] = await Promise.all([
        getFollowers(agentId),
        getFollowing(agentId)
      ]);
      setFollowers(fr);
      setFollowing(fg);
    } catch {
      setFollowers([]);
      setFollowing([]);
    }
  };

  const loadData = async () => {
    if (!id) return;
    if (!agent || agent.id !== id) {
      setLoading(true);
    }
    setError(null);

    // Only query THIS specialist and their services (no full platform database scans!)
    const [agentRes, agentServicesRes] = await Promise.all([
      getAgentById(id),
      getServicesByAgentId(id)
    ]);

    if (agentRes.error || !agentRes.data) {
      setError(agentRes.error || 'Artist profile not found');
      setLoading(false);
    } else {
      setAgent(agentRes.data);
      setServices(agentServicesRes.data || []);
      setLoading(false);
      // Fast non-blocking social counts
      void loadSocialCounts(agentRes.data.id);
    }
  };

  // Stale-While-Revalidate: Listen for background fresh updates silently
  useEffect(() => {
    if (!id) return;
    const onCacheUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<{ key: string; data: any }>;
      if (customEvent.detail?.key === `agent:${id}` && customEvent.detail.data) {
        setAgent(customEvent.detail.data);
      }
      if (customEvent.detail?.key === `services:agent:${id}` && customEvent.detail.data) {
        setServices(customEvent.detail.data);
      }
    };
    window.addEventListener('eb:cache-updated', onCacheUpdated);
    return () => window.removeEventListener('eb:cache-updated', onCacheUpdated);
  }, [id]);

  // Lazy-load secondary tabs on demand
  useEffect(() => {
    if (activeTab === 'community' && followers.length === 0 && following.length === 0 && agent?.id) {
      void loadCommunityProfiles(agent.id);
    }
    if (activeTab === 'liked' && allServices.length === 0) {
      getServices().then(res => {
        if (res.data) setAllServices(res.data);
      });
    }
  }, [activeTab, agent?.id]);

  useEffect(() => {
    loadData();
  }, [id, user?.id]);

  const handleToggleFollow = async (targetId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    const isCurrentlyFollowing = myFollowingIds.includes(targetId);
    setFollowBusy(targetId);
    const res = await setFollow(user.id, targetId, !isCurrentlyFollowing);
    setFollowBusy(null);

    if (!res.success) {
      showSnackbar?.(res.error || 'Could not update follow status', 'error');
      return;
    }

    setMyFollowingIds((prev) =>
      isCurrentlyFollowing ? prev.filter((x) => x !== targetId) : [...prev, targetId]
    );

    if (agent && targetId === agent.id) {
      setCounts((c) => ({
        ...c,
        followers: Math.max(0, c.followers + (isCurrentlyFollowing ? -1 : 1))
      }));
      showSnackbar?.(
        isCurrentlyFollowing ? `Unfollowed ${agent.name}` : `You are now following ${agent.name}`,
        'success'
      );
    }
  };

  const handleToggleLike = async (serviceId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();

    if (!user) {
      navigate('/auth');
      return;
    }

    const isLiked = likedIds.includes(serviceId);
    const res = await setServiceLike(user.id, serviceId, !isLiked);

    if (!res.success) {
      showSnackbar?.(res.error || 'Could not update like', 'error');
      return;
    }

    setLikedIds((prev) =>
      isLiked ? prev.filter((item) => item !== serviceId) : [...prev, serviceId]
    );
    showSnackbar?.(isLiked ? 'Removed like from service' : 'Liked service! Thank you for the love', 'success');
  };

  const handleToggleFavorite = async (serviceId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();

    if (!user) {
      navigate('/auth');
      return;
    }

    const isFav = favoriteIds.includes(serviceId);
    const res = await setServiceFavorite(user.id, serviceId, !isFav);

    if (!res.success) {
      showSnackbar?.(res.error || 'Could not update favorites', 'error');
      return;
    }

    setFavoriteIds((prev) =>
      isFav ? prev.filter((item) => item !== serviceId) : [...prev, serviceId]
    );
    showSnackbar?.(isFav ? 'Removed service from favorites' : 'Saved service to favorites!', 'success');
  };

  // Video reels items
  const reelItems: { id: string; url: string; title: string; price?: number; service?: Service }[] = [];
  services.forEach((s) => {
    if (isVideoUrl(s.image)) {
      reelItems.push({ id: s.id, url: s.image, title: s.name, price: s.price, service: s });
    }
    if (s.gallery) {
      s.gallery.forEach((g, idx) => {
        if (g.type === 'video' || isVideoUrl(g.url)) {
          reelItems.push({ id: `${s.id}-g-${idx}`, url: g.url, title: s.name, price: s.price, service: s });
        }
      });
    }
  });
  if (agent?.gallery) {
    agent.gallery.forEach((g, idx) => {
      if (g.type === 'video' || isVideoUrl(g.url)) {
        reelItems.push({ id: `agent-g-${idx}`, url: g.url, title: `${agent.name} Portfolio` });
      }
    });
  }

  const likedServices = allServices.filter((s) => likedIds.includes(s.id));
  const isAgentFollowed = agent ? myFollowingIds.includes(agent.id) : false;
  const isOwnProfile = !!user && !!agent && user.id === agent.id;

  const cleanHandle = agent?.name
    ? '@' + agent.name.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 16)
    : '@beauty_specialist';

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-20 bg-brand-background dark:bg-[#0D0D0D]">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 space-y-6">
          <div className="flex items-center space-x-6 md:space-x-12">
            <div className="w-18 h-18 sm:w-20 sm:h-20 md:w-36 md:h-36 lg:w-40 lg:h-40 rounded-full bg-gray-200 dark:bg-white/10 animate-pulse shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="h-5 bg-gray-200 dark:bg-white/10 rounded-lg w-1/3 animate-pulse" />
              <div className="h-4 bg-gray-200 dark:bg-white/10 rounded-lg w-1/2 animate-pulse" />
              <div className="h-10 bg-gray-200 dark:bg-white/10 rounded-xl w-2/3 animate-pulse" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1 md:gap-6 pt-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 dark:bg-white/10 rounded-none md:rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen pt-28 pb-20 text-center bg-brand-background dark:bg-[#0D0D0D] px-4">
        <div className="max-w-md mx-auto p-6 md:p-8 bg-white dark:bg-[#1A1A1A] rounded-2xl md:rounded-3xl border border-[#E9ECEF] dark:border-[#2D2D2D] shadow-xl">
          <AlertCircle className="w-10 h-10 md:w-12 md:h-12 text-brand-interactive mx-auto mb-3" />
          <h2 className="text-xl md:text-2xl font-serif font-black mb-1.5 text-[#1A1A1A] dark:text-white">
            Specialist Not Found
          </h2>
          <p className="text-xs md:text-sm text-[#6C757D] mb-6">
            This professional profile is currently unavailable or has been moved.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={loadData}
              className="px-5 py-2.5 bg-brand-interactive text-white rounded-xl text-xs md:text-sm font-bold shadow-md hover:bg-brand-interactive/90 transition-all cursor-pointer"
            >
              Retry
            </button>
            <Link
              to="/agents"
              className="px-5 py-2.5 bg-brand-surface dark:bg-[#252525] rounded-xl text-xs md:text-sm font-bold text-[#1A1A1A] dark:text-white border border-[#E9ECEF] dark:border-[#2D2D2D]"
            >
              All Specialists
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const bannerImgUrl = agent.banner && agent.banner.trim() !== ''
    ? agent.banner
    : 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1600';

  return (
    <div className="min-h-screen bg-brand-background dark:bg-[#0D0D0D] text-[#1A1A1A] dark:text-white pb-20 pt-16 sm:pt-20 transition-colors duration-200">

      {/* 1. MOBILE TOP NAVIGATION BAR (Clean, solid frosted bar, isolated from banner, opens custom ShareModal) */}
      <div className="md:hidden sticky top-16 z-30 px-3.5 py-2.5 flex items-center justify-between border-b border-[#E9ECEF] dark:border-[#222222] bg-white/95 dark:bg-[#0D0D0D]/95 backdrop-blur-md shadow-xs">
        <button
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="p-1.5 -ml-1 text-[#1A1A1A] dark:text-white rounded-xl hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Clean Handle without check icon (as requested: "REMOVE THE CHECK ICON AT THE TOP") */}
        <div
          className="flex items-center space-x-1 min-w-0 px-2 cursor-pointer"
          onClick={() => smoothScrollTo(0, { duration: 1.0 })}
        >
          <span className="font-bold text-xs sm:text-sm tracking-tight truncate max-w-[200px]">
            {cleanHandle}
          </span>
        </div>

        {/* Share Button (triggers custom ShareModal) */}
        <button
          onClick={() => setIsShareModalOpen(true)}
          aria-label="Share profile"
          className="p-1.5 -mr-1 text-[#1A1A1A] dark:text-white rounded-xl hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
          title="Share profile"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* 2. PROFILE HERO HEADER CONTAINER WITH BACKGROUND BANNER */}
      <div className="relative overflow-hidden border-b border-[#E9ECEF]/80 dark:border-[#222222]/80">

        {/* Background Banner Image */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <img
            src={bannerImgUrl}
            alt=""
            className="w-full h-full object-cover object-center opacity-65 dark:opacity-60 scale-105 transition-opacity duration-500"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1600';
            }}
          />
          {/* Calibrated Translucent Glass Scrim: keeps the banner image visible behind without obscuring text */}
          <div className="absolute inset-0 bg-gradient-to-b from-brand-background/40 via-brand-background/70 to-brand-background dark:from-[#0D0D0D]/40 dark:via-[#0D0D0D]/70 dark:to-[#0D0D0D] backdrop-blur-[1px]" />
        </div>

        {/* Profile Content */}
        <div className="relative z-10 max-w-5xl lg:max-w-6xl mx-auto px-3.5 sm:px-4 md:px-8 lg:px-12 pt-3 sm:pt-5 pb-4 sm:pb-6">

          {/* ======================================================== */}
          {/* DESKTOP (PC) PROFILE HEADER (md:flex, bigger components) */}
          {/* ======================================================== */}
          <section className="hidden md:flex items-start space-x-10 lg:space-x-16 mb-8 pb-8 border-b border-[#E9ECEF] dark:border-[#222222]">

            {/* PC Big Avatar: Round circle with brand Instagram gradient ring */}
            <div className="relative shrink-0 flex flex-col items-center">
              <div className="w-36 h-36 lg:w-44 lg:h-44 aspect-square p-1 rounded-full bg-gradient-to-tr from-[#32104D] via-[#6C35A6] to-[#F43F5E] shadow-2xl hover:shadow-[0_0_25px_rgba(244,63,94,0.4)] transition-all">
                <div className="w-full h-full p-1 bg-white dark:bg-[#0D0D0D] rounded-full aspect-square">
                  <div className="w-full h-full rounded-full overflow-hidden aspect-square">
                    <img
                      src={agent.image && agent.image.trim() !== '' ? agent.image : getInitialsSvg(agent.name)}
                      alt={agent.name}
                      onError={(e) => {
                        e.currentTarget.src = getInitialsSvg(agent.name);
                      }}
                      className="w-full h-full rounded-full object-cover object-center block shadow-inner"
                    />
                  </div>
                </div>
              </div>

              {/* Prominent VERIFIED Badge Next to profile pic */}
              <div className="mt-3 inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 text-xs font-black shadow-sm tracking-wide">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>VERIFIED </span>
              </div>
            </div>

            {/* PC Right Details: Handle, Action Buttons, Stats, Name & Bio */}
            <div className="flex-1 min-w-0 space-y-5 pt-2">

              {/* Top Row: Handle + Action Buttons */}
              <div className="flex items-center flex-wrap gap-4">
                <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-[#1A1A1A] dark:text-white flex items-center gap-2">
                  <span>{cleanHandle}</span>
                </h1>

                <div className="flex items-center space-x-3 ml-auto">
                  {/* Follow Button with 3D tactile perspective skew & sideways jiggle */}
                  {!isOwnProfile ? (
                    <button
                      onClick={() => handleToggleFollow(agent.id)}
                      disabled={followBusy === agent.id}
                      className={`tactile-3d h-11 px-6 rounded-2xl text-sm font-black flex items-center space-x-2 disabled:opacity-60 cursor-pointer ${isAgentFollowed
                        ? 'bg-brand-surface dark:bg-[#1E1E1E] text-[#1A1A1A] dark:text-white border border-[#E9ECEF] dark:border-[#2D2D2D] hover:border-rose-500/50 hover:text-rose-500 shadow-sm'
                        : 'bg-gradient-to-r from-[#6C35A6] to-[#7B3DB8] text-white shadow-[0_4px_16px_rgba(108,53,166,0.35)] hover:shadow-[0_6px_22px_rgba(108,53,166,0.5)] border-t border-white/20'
                        }`}
                    >
                      {isAgentFollowed ? (
                        <>
                          <UserCheck className="w-4 h-4" />
                          <span>Following</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          <span>Follow</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <Link
                      to="/agent-dashboard"
                      className="tactile-3d h-11 px-6 rounded-2xl text-sm font-black bg-brand-surface dark:bg-[#1E1E1E] text-[#1A1A1A] dark:text-white border border-[#E9ECEF] dark:border-[#2D2D2D] flex items-center space-x-2 hover:border-brand-interactive shadow-sm"
                    >
                      <span>Edit Profile</span>
                    </Link>
                  )}

                  {/* Book Now Button with 3D tactile perspective skew & sideways jiggle */}
                  <button
                    onClick={handleBookNowClick}
                    className="tactile-3d h-11 px-6 rounded-2xl text-sm font-black bg-gradient-to-r from-[#6C35A6] to-[#7B3DB8] text-white shadow-[0_4px_16px_rgba(108,53,166,0.35)] hover:shadow-[0_6px_22px_rgba(108,53,166,0.5)] border-t border-white/20 flex items-center space-x-2 cursor-pointer"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Book Now</span>
                  </button>

                  {/* Message / Call button */}
                  {agent.phone ? (
                    <a
                      href={`tel:${agent.phone}`}
                      className="tactile-3d h-11 px-4 rounded-2xl bg-brand-surface dark:bg-[#1E1E1E] text-[#1A1A1A] dark:text-white border border-[#E9ECEF] dark:border-[#2D2D2D] flex items-center space-x-2 hover:border-brand-interactive hover:text-brand-interactive shadow-sm"
                      title="Call specialist"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Contact</span>
                    </a>
                  ) : (
                    <button
                      onClick={() => showSnackbar?.(`Message sent to ${agent.name}`, 'info')}
                      className="tactile-3d h-11 px-4 rounded-2xl bg-brand-surface dark:bg-[#1E1E1E] text-[#1A1A1A] dark:text-white border border-[#E9ECEF] dark:border-[#2D2D2D] flex items-center space-x-2 hover:border-brand-interactive hover:text-brand-interactive shadow-sm cursor-pointer"
                      title="Send message"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Message</span>
                    </button>
                  )}

                  {/* Custom Share Button (Opens Share Modal) */}
                  <button
                    onClick={() => setIsShareModalOpen(true)}
                    className="tactile-3d h-11 w-11 rounded-2xl bg-brand-surface dark:bg-[#202020] text-[#1A1A1A] dark:text-white border border-[#E9ECEF] dark:border-[#333] flex items-center justify-center hover:text-brand-interactive cursor-pointer"
                    title="Share profile"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Middle Row: Large Desktop Stats */}
              <div className="flex items-center space-x-12 text-base lg:text-lg">
                <button
                  onClick={() => setActiveTab('services')}
                  className="flex items-center space-x-2 cursor-pointer group"
                >
                  <span className="font-black text-[#1A1A1A] dark:text-white group-hover:text-brand-interactive transition-colors">
                    {services.length}
                  </span>
                  <span className="text-[#6C757D] dark:text-[#A0A0A0]">services</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('community');
                    setCommunitySubTab('followers');
                  }}
                  className="flex items-center space-x-2 cursor-pointer group px-3 py-1.5 rounded-xl hover:bg-brand-surface dark:hover:bg-white/5 transition-all"
                >
                  <span className="font-black text-brand-interactive">
                    <AnimatedStatCount value={counts.followers} />
                  </span>
                  <span className="text-[#6C757D] dark:text-[#A0A0A0] group-hover:text-brand-interactive transition-colors">
                    followers
                  </span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('community');
                    setCommunitySubTab('following');
                  }}
                  className="flex items-center space-x-2 cursor-pointer group"
                >
                  <span className="font-black text-[#1A1A1A] dark:text-white group-hover:text-brand-interactive transition-colors">
                    <AnimatedStatCount value={counts.following} />
                  </span>
                  <span className="text-[#6C757D] dark:text-[#A0A0A0]">following</span>
                </button>
              </div>

              {/* Bottom Row: Name, Specialty, Badges & Bio */}
              <div className="space-y-3">
                <div>
                  <h2 className="text-lg lg:text-xl font-serif font-black text-[#1A1A1A] dark:text-white">
                    {agent.name}
                  </h2>
                  <p className="text-sm font-semibold text-brand-interactive">
                    {agent.specialty || 'Beauty Professional'}
                  </p>
                </div>

                {/* Badges strip */}
                <div className="flex flex-wrap items-center gap-2">
                  {agent.rating > 0 ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-xl bg-amber-400/10 text-amber-500 dark:text-amber-400 text-xs font-black border border-[#E9ECEF] dark:border-[#2D2D2D] shadow-sm">
                      <Star className="w-3.5 h-3.5 fill-current mr-1.5" />
                      {agent.rating.toFixed(1)} {agent.reviews > 0 && `(${agent.reviews} reviews)`}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-xl bg-brand-surface dark:bg-[#1E1E1E] text-brand-interactive text-xs font-black border border-[#E9ECEF] dark:border-[#2D2D2D] shadow-sm">
                      Top Rated Specialist
                    </span>
                  )}

                  {agent.location && (
                    <span className="inline-flex items-center px-3 py-1 rounded-xl bg-brand-surface dark:bg-[#1E1E1E] text-[#6C757D] dark:text-[#C0C0C0] text-xs font-semibold border border-[#E9ECEF] dark:border-[#2D2D2D]">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-brand-interactive" />
                      {agent.location}
                    </span>
                  )}

                  {agent.experience > 0 && (
                    <span className="inline-flex items-center px-3 py-1 rounded-xl bg-brand-surface dark:bg-[#1E1E1E] text-[#6C757D] dark:text-[#C0C0C0] text-xs font-semibold border border-[#E9ECEF] dark:border-[#2D2D2D]">
                      <Award className="w-3.5 h-3.5 mr-1 text-brand-interactive" />
                      {agent.experience}+ years experience
                    </span>
                  )}
                </div>

                {/* PC Rich High-Contrast Bio in Squircle */}
                <div className="p-4 lg:p-5 rounded-2xl bg-brand-surface/80 dark:bg-[#181818] border border-[#E9ECEF] dark:border-[#2D2D2D] shadow-sm">
                  <p className="text-sm lg:text-base font-medium leading-relaxed text-[#1A1A1A] dark:text-[#F3F4F6]">
                    {agent.bio && agent.bio.trim() !== ''
                      ? agent.bio
                      : 'Certified beauty specialist providing on-demand appointments, editorial styling, and custom glam.'}
                  </p>
                </div>
              </div>

            </div>
          </section>

          {/* ========================================================== */}
          {/* MOBILE (PHONE) PROFILE HEADER (md:hidden) */}
          {/* ========================================================== */}
          <section className="md:hidden">

            {/* Row 1: Full Avatar (Uncovered) + 3 Stats */}
            <div className="flex items-center justify-between mb-3.5 pt-1">

              {/* Phone Avatar: 100% visible, complete round circle with brand Instagram gradient ring */}
              <div className="relative shrink-0 aspect-square">
                <div className="w-20 h-20 sm:w-24 sm:h-24 aspect-square rounded-full p-[3px] bg-gradient-to-tr from-[#32104D] via-[#6C35A6] to-[#F43F5E] shadow-[0_4px_20px_rgba(108,53,166,0.3)] shrink-0">
                  <div className="w-full h-full p-0.5 bg-white dark:bg-[#0D0D0D] rounded-full aspect-square">
                    <div className="w-full h-full rounded-full overflow-hidden aspect-square">
                      <img
                        src={agent.image && agent.image.trim() !== '' ? agent.image : getInitialsSvg(agent.name)}
                        alt={agent.name}
                        onError={(e) => {
                          e.currentTarget.src = getInitialsSvg(agent.name);
                        }}
                        className="w-full h-full rounded-full object-cover object-center block"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Phone Stats Row: 100% visible, unclipped */}
              <div className="flex-1 ml-4 sm:ml-6 flex items-center justify-around text-center">
                <button
                  onClick={() => setActiveTab('services')}
                  className="flex flex-col items-center group cursor-pointer transition-all duration-150 active:scale-90 hover:scale-105"
                >
                  <span className="text-sm sm:text-base font-black tracking-tight text-[#1A1A1A] dark:text-white">
                    {services.length}
                  </span>
                  <span className="text-[10px] sm:text-xs text-[#6C757D] dark:text-[#A0A0A0]">
                    Services
                  </span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('community');
                    setCommunitySubTab('followers');
                  }}
                  className="flex flex-col items-center px-2 py-1 rounded-xl hover:bg-brand-surface dark:hover:bg-white/5 transition-all duration-150 active:scale-90 hover:scale-105 group cursor-pointer"
                >
                  <span className="text-sm sm:text-base font-black tracking-tight text-brand-interactive">
                    <AnimatedStatCount value={counts.followers} />
                  </span>
                  <span className="text-[10px] sm:text-xs text-[#6C757D] dark:text-[#A0A0A0]">
                    Followers
                  </span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('community');
                    setCommunitySubTab('following');
                  }}
                  className="flex flex-col items-center group cursor-pointer transition-all duration-150 active:scale-90 hover:scale-105"
                >
                  <span className="text-sm sm:text-base font-black tracking-tight text-[#1A1A1A] dark:text-white">
                    <AnimatedStatCount value={counts.following} />
                  </span>
                  <span className="text-[10px] sm:text-xs text-[#6C757D] dark:text-[#A0A0A0]">
                    Following
                  </span>
                </button>
              </div>
            </div>

            {/* Row 2: Name + VERIFIED BADGE (As requested: "ADD A VERFIED BADTE NEXT TO THE PROFILE PIC THAT SAYS VERIFIED") */}
            <div className="mb-3.5 space-y-1.5">
              <div className="flex items-center space-x-2 flex-wrap">
                <span className="text-base font-black text-[#1A1A1A] dark:text-white">
                  {agent.name}
                </span>
                <span className="text-xs text-[#6C757D] dark:text-[#A0A0A0] font-medium">
                  • {agent.specialty || 'Beauty Professional'}
                </span>

                {/* Explicit Verified Badge next to name */}
                <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 text-[10px] font-black shadow-sm tracking-wide">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>VERIFIED</span>
                </div>
              </div>

              {/* Badges Row */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                {agent.rating > 0 ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-400/10 text-amber-500 text-[10px] font-black border border-[#E9ECEF] dark:border-[#2D2D2D]">
                    <Star className="w-2.5 h-2.5 fill-current mr-1" />
                    {agent.rating.toFixed(1)} {agent.reviews > 0 && `(${agent.reviews})`}
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-brand-surface dark:bg-[#1E1E1E] text-brand-interactive text-[10px] font-black border border-[#E9ECEF] dark:border-[#2D2D2D]">
                    Top Rated
                  </span>
                )}

                {agent.location && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-brand-surface dark:bg-[#1E1E1E] text-[#6C757D] dark:text-[#C0C0C0] text-[10px] font-semibold border border-[#E9ECEF] dark:border-[#2D2D2D]">
                    <MapPin className="w-2.5 h-2.5 mr-1 text-brand-interactive" />
                    {agent.location}
                  </span>
                )}

                {agent.experience > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-brand-surface dark:bg-[#1E1E1E] text-[#6C757D] dark:text-[#C0C0C0] text-[10px] font-semibold border border-[#E9ECEF] dark:border-[#2D2D2D]">
                    <Award className="w-2.5 h-2.5 mr-1 text-brand-interactive" />
                    {agent.experience}+ yrs
                  </span>
                )}
              </div>

              {/* High-Contrast Bio in Squircle */}
              <div className="mt-2 p-3 rounded-2xl bg-brand-surface/70 dark:bg-[#181818] border border-[#E9ECEF] dark:border-[#2D2D2D] shadow-sm">
                <p className="text-xs sm:text-sm font-medium leading-relaxed text-[#1A1A1A] dark:text-[#F3F4F6]">
                  {agent.bio && agent.bio.trim() !== ''
                    ? agent.bio
                    : 'Certified beauty specialist providing on-demand appointments, editorial styling, and custom glam.'}
                </p>
              </div>
            </div>

            {/* Row 3: Action Buttons with physical 3D tactile perspective skew & sideways jiggle */}
            <div className="flex items-center gap-2.5 mb-4">
              {!isOwnProfile ? (
                <button
                  onClick={() => handleToggleFollow(agent.id)}
                  disabled={followBusy === agent.id}
                  className={`tactile-3d flex-1 py-3 px-4 min-h-[48px] rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer ${isAgentFollowed
                    ? 'bg-brand-surface dark:bg-[#1E1E1E] text-[#1A1A1A] dark:text-white border border-[#E9ECEF] dark:border-[#2D2D2D] hover:border-rose-500/50 hover:text-rose-500 shadow-sm'
                    : 'bg-gradient-to-r from-[#6C35A6] to-[#7B3DB8] text-white shadow-[0_4px_16px_rgba(108,53,166,0.35)] hover:shadow-[0_6px_22px_rgba(108,53,166,0.5)] border-t border-white/20'
                    }`}
                >
                  {isAgentFollowed ? (
                    <>
                      <UserCheck className="w-4 h-4" />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Follow</span>
                    </>
                  )}
                </button>
              ) : (
                <Link
                  to="/agent-dashboard"
                  className="tactile-3d flex-1 py-3 px-4 min-h-[48px] rounded-2xl text-xs sm:text-sm font-black bg-brand-surface dark:bg-[#1E1E1E] text-[#1A1A1A] dark:text-white border border-[#E9ECEF] dark:border-[#2D2D2D] flex items-center justify-center shadow-sm"
                >
                  <span>Edit Profile</span>
                </Link>
              )}

              {/* Book Now Button with generous padding and physical 3D tactile feedback */}
              <button
                onClick={handleBookNowClick}
                className="tactile-3d flex-1 py-3 px-4 min-h-[48px] rounded-2xl text-xs sm:text-sm font-black bg-brand-surface dark:bg-[#1E1E1E] text-[#1A1A1A] dark:text-white border border-[#E9ECEF] dark:border-[#2D2D2D] hover:border-brand-interactive hover:text-brand-interactive flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-brand-interactive" />
                <span>Book Now</span>
              </button>

              {/* Contact / Phone with physical 3D tactile feedback */}
              {agent.phone ? (
                <a
                  href={`tel:${agent.phone}`}
                  className="tactile-3d w-12 h-12 rounded-2xl bg-brand-surface dark:bg-[#1E1E1E] text-[#1A1A1A] dark:text-white border border-[#E9ECEF] dark:border-[#2D2D2D] flex items-center justify-center shrink-0 hover:border-brand-interactive hover:text-brand-interactive shadow-sm"
                  title="Call specialist"
                >
                  <Phone className="w-4 h-4" />
                </a>
              ) : (
                <button
                  onClick={() => showSnackbar?.(`Message sent to ${agent.name}`, 'info')}
                  className="tactile-3d w-12 h-12 rounded-2xl bg-brand-surface dark:bg-[#1E1E1E] text-[#1A1A1A] dark:text-white border border-[#E9ECEF] dark:border-[#2D2D2D] flex items-center justify-center shrink-0 hover:border-brand-interactive hover:text-brand-interactive shadow-sm cursor-pointer"
                  title="Send message"
                >
                  <MessageCircle className="w-4 h-4" />
                </button>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* 3. MAIN CONTENT CONTAINER (Pure solid background for tabs and feeds) */}
      <main
        ref={servicesSectionRef}
        id="services-section"
        className="max-w-5xl lg:max-w-6xl mx-auto px-3.5 sm:px-4 md:px-8 lg:px-12 relative z-10 pt-2"
      >

        {/* ======================================================== */}
        {/* 4. THE 4 TABS WITH ANIMATED SLIDER (ALL 4 VISIBLE & SHARP) */}
        {/* ======================================================== */}
        <nav aria-label="Profile tabs" className="border-b border-[#E9ECEF] dark:border-[#222222]">
          <div className="grid grid-cols-4 w-full">

            {/* TAB 1: SERVICES (LayoutGrid) */}
            <button
              onClick={() => setActiveTab('services')}
              className={`relative py-3 sm:py-3.5 flex flex-col md:flex-row items-center justify-center space-y-1 md:space-y-0 md:space-x-2 transition-all duration-150 active:scale-95 hover:scale-105 cursor-pointer ${activeTab === 'services'
                ? 'text-brand-interactive font-black'
                : 'text-[#8E8E8E] dark:text-[#767676] hover:text-[#1A1A1A] dark:hover:text-white'
                }`}
              title="Services"
              aria-selected={activeTab === 'services'}
            >
              <LayoutGrid className="w-5 h-5 sm:w-5.5 sm:h-5.5 shrink-0" />
              <span className="hidden md:inline text-xs font-black uppercase tracking-widest">
                Services
              </span>
              {activeTab === 'services' && (
                <motion.div
                  layoutId="profileTabSlider"
                  className="absolute bottom-0 left-2 right-2 sm:left-4 sm:right-4 h-[3px] bg-brand-interactive rounded-full shadow-[0_0_10px_rgba(108,53,166,0.5)]"
                  transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                />
              )}
            </button>

            {/* TAB 2: REELS (Film) */}
            <button
              onClick={() => setActiveTab('reels')}
              className={`relative py-3 sm:py-3.5 flex flex-col md:flex-row items-center justify-center space-y-1 md:space-y-0 md:space-x-2 transition-all duration-150 active:scale-95 hover:scale-105 cursor-pointer ${activeTab === 'reels'
                ? 'text-brand-interactive font-black'
                : 'text-[#8E8E8E] dark:text-[#767676] hover:text-[#1A1A1A] dark:hover:text-white'
                }`}
              title="Reels"
              aria-selected={activeTab === 'reels'}
            >
              <Film className="w-5 h-5 sm:w-5.5 sm:h-5.5 shrink-0" />
              <span className="hidden md:inline text-xs font-black uppercase tracking-widest">
                Reels
              </span>
              {activeTab === 'reels' && (
                <motion.div
                  layoutId="profileTabSlider"
                  className="absolute bottom-0 left-2 right-2 sm:left-4 sm:right-4 h-[3px] bg-brand-interactive rounded-full shadow-[0_0_10px_rgba(108,53,166,0.5)]"
                  transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                />
              )}
            </button>

            {/* TAB 3: COMMUNITY / FOLLOWERS (Users) */}
            <button
              onClick={() => setActiveTab('community')}
              className={`relative py-3 sm:py-3.5 flex flex-col md:flex-row items-center justify-center space-y-1 md:space-y-0 md:space-x-2 transition-all duration-150 active:scale-95 hover:scale-105 cursor-pointer ${activeTab === 'community'
                ? 'text-brand-interactive font-black'
                : 'text-[#8E8E8E] dark:text-[#767676] hover:text-[#1A1A1A] dark:hover:text-white'
                }`}
              title="Community"
              aria-selected={activeTab === 'community'}
            >
              <Users className="w-5 h-5 sm:w-5.5 sm:h-5.5 shrink-0" />
              <span className="hidden md:inline text-xs font-black uppercase tracking-widest">
                Community
              </span>
              {activeTab === 'community' && (
                <motion.div
                  layoutId="profileTabSlider"
                  className="absolute bottom-0 left-2 right-2 sm:left-4 sm:right-4 h-[3px] bg-brand-interactive rounded-full shadow-[0_0_10px_rgba(108,53,166,0.5)]"
                  transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                />
              )}
            </button>

            {/* TAB 4: LIKED (Heart) */}
            <button
              onClick={() => setActiveTab('liked')}
              className={`relative py-3 sm:py-3.5 flex flex-col md:flex-row items-center justify-center space-y-1 md:space-y-0 md:space-x-2 transition-all duration-150 active:scale-95 hover:scale-105 cursor-pointer ${activeTab === 'liked'
                ? 'text-rose-500 font-black'
                : 'text-[#8E8E8E] dark:text-[#767676] hover:text-rose-500'
                }`}
              title="Liked"
              aria-selected={activeTab === 'liked'}
            >
              <Heart className={`w-5 h-5 sm:w-5.5 sm:h-5.5 shrink-0 ${activeTab === 'liked' ? 'fill-current' : ''}`} />
              <span className="hidden md:inline text-xs font-black uppercase tracking-widest">
                Liked
              </span>
              {activeTab === 'liked' && (
                <motion.div
                  layoutId="profileTabSlider"
                  className="absolute bottom-0 left-2 right-2 sm:left-4 sm:right-4 h-[3px] bg-rose-500 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.5)]"
                  transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                />
              )}
            </button>
          </div>
        </nav>

        {/* ======================================================== */}
        {/* 5. CONTENT FEED: 3-Column Square Tiles */}
        {/* ======================================================== */}
        <div className="pt-2 md:pt-6">
          <AnimatePresence mode="wait">

            {/* TAB 1: SERVICES */}
            {activeTab === 'services' && (
              <motion.div
                key="tab-services"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {/* 1. NUDGE TOOLKIT BANNER (when customer clicks Book Now or opens with ?book=true) */}
                <AnimatePresence>
                  {isBookingNudgeActive && (
                    <motion.div
                      initial={{ opacity: 0, y: -12, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -12, scale: 0.98 }}
                      className="mb-6 p-4 sm:p-5 rounded-2xl md:rounded-3xl bg-gradient-to-r from-brand-interactive/15 via-[#32104D]/10 to-brand-interactive/10 border border-brand-interactive/30 shadow-lg relative overflow-hidden"
                    >
                      <div className="flex items-start sm:items-center justify-between gap-3">
                        <div className="flex items-start sm:items-center space-x-3.5">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-brand-interactive text-white flex items-center justify-center shrink-0 shadow-md">
                            <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2 flex-wrap">
                              <h3 className="text-sm sm:text-base font-black text-[#1A1A1A] dark:text-white">
                                Choose Your Service
                              </h3>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-interactive text-white">
                                Booking Toolkit
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm text-[#4A4A4A] dark:text-[#CCCCCC] mt-0.5 font-medium leading-relaxed">
                              Explore {agent.name.split(' ')[0]}'s services below. Tap <span className="font-bold text-brand-interactive">"Book This Service"</span> on any post to schedule your appointment.
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setIsBookingNudgeActive(false)}
                          className="p-1.5 rounded-xl text-[#6C757D] hover:text-[#1A1A1A] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer shrink-0"
                          title="Dismiss guide"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {services.length > 0 ? (
                  <>
                    {/* View Switcher & Category Filter Bar */}
                    <div className="flex items-center justify-between gap-3 mb-5 pb-3 border-b border-[#E9ECEF]/70 dark:border-[#222222]/70">
                      {/* Categories (horizontal scrollable) */}
                      <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-1">
                        {serviceCategories.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setSelectedCategoryFilter(cat)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${selectedCategoryFilter === cat
                                ? 'bg-brand-interactive text-white shadow-sm'
                                : 'bg-brand-surface dark:bg-[#1A1A1A] text-[#6C757D] dark:text-[#A0A0A0] hover:text-[#1A1A1A] dark:hover:text-white'
                              }`}
                          >
                            {cat === 'all' ? `All Services (${services.length})` : cat}
                          </button>
                        ))}
                      </div>

                      {/* View Mode Toggle: Grid vs Post Feed */}
                      <div className="flex items-center space-x-1 bg-brand-surface dark:bg-[#1A1A1A] p-1 rounded-xl border border-[#E9ECEF] dark:border-[#262626] shrink-0">
                        <button
                          onClick={() => setServiceViewMode('feed')}
                          className={`p-1.5 rounded-lg text-xs font-black flex items-center space-x-1.5 transition-all cursor-pointer ${serviceViewMode === 'feed'
                              ? 'bg-brand-interactive text-white shadow-sm'
                              : 'text-[#6C757D] dark:text-[#A0A0A0] hover:text-[#1A1A1A] dark:hover:text-white'
                            }`}
                          title="Instagram Post Feed"
                        >
                          <Rows3 className="w-4 h-4" />
                          <span className="hidden sm:inline">Posts</span>
                        </button>
                        <button
                          onClick={() => setServiceViewMode('grid')}
                          className={`p-1.5 rounded-lg text-xs font-black flex items-center space-x-1.5 transition-all cursor-pointer ${serviceViewMode === 'grid'
                              ? 'bg-brand-interactive text-white shadow-sm'
                              : 'text-[#6C757D] dark:text-[#A0A0A0] hover:text-[#1A1A1A] dark:hover:text-white'
                            }`}
                          title="Grid View"
                        >
                          <LayoutGrid className="w-4 h-4" />
                          <span className="hidden sm:inline">Grid</span>
                        </button>
                      </div>
                    </div>

                    {/* Mode 1: Instagram Post Feed */}
                    {serviceViewMode === 'feed' ? (
                      <div className="max-w-xl mx-auto space-y-6 sm:space-y-8">
                        {filteredServices.map((service, idx) => (
                          <InstagramServicePostCard
                            key={service.id}
                            service={service}
                            agent={agent}
                            cleanHandle={cleanHandle}
                            isLiked={likedIds.includes(service.id)}
                            isFavorite={favoriteIds.includes(service.id)}
                            onToggleLike={(e) => handleToggleLike(service.id, e)}
                            onToggleFavorite={(e) => handleToggleFavorite(service.id, e)}
                            onBookService={(s) => navigate(`/book/${s.id}`)}
                            isNudged={isBookingNudgeActive && idx === 0}
                          />
                        ))}
                      </div>
                    ) : (
                      /* Mode 2: 3-Column Square Grid */
                      <div className="grid grid-cols-3 gap-1 sm:gap-2 md:gap-6 lg:gap-8">
                        {filteredServices.map((service) => {
                          const isVideo = isVideoUrl(service.image);
                          const isLiked = likedIds.includes(service.id);
                          const isFavorite = favoriteIds.includes(service.id);
                          const galleryVideos = (service.gallery || []).filter(
                            (item) => item.type === 'video' || isVideoUrl(item.url)
                          );
                          const videoCount = galleryVideos.length + (isVideo ? 1 : 0);
                          const firstVideoUrl = isVideo
                            ? service.image
                            : galleryVideos[0]?.url || null;
                          const hasAnyVideo = Boolean(firstVideoUrl);

                          return (
                            <div
                              key={service.id}
                              className="group relative aspect-square bg-gray-100 dark:bg-[#181818] overflow-hidden md:rounded-2xl md:shadow-md md:border md:border-[#E9ECEF] dark:md:border-[#222222] cursor-pointer"
                              onClick={() => {
                                setServiceViewMode('feed');
                                setTimeout(() => {
                                  document.getElementById(`post-service-${service.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }, 60);
                              }}
                            >
                              {/* Media Thumbnail with broken image fallback */}
                              {hasAnyVideo && firstVideoUrl ? (
                                <AutoPlayVideoTile
                                  src={firstVideoUrl}
                                  poster={!isVideo ? service.image : undefined}
                                />
                              ) : service.image ? (
                                <img
                                  src={service.image}
                                  alt={service.name}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                  loading="lazy"
                                  onError={(e) => {
                                    e.currentTarget.src = getInitialsSvg(service.name);
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-brand-surface dark:bg-[#1E1E1E]">
                                  <span className="text-[10px] md:text-sm font-black text-brand-interactive line-clamp-2">
                                    {service.name}
                                  </span>
                                </div>
                              )}

                              {/* Video Slate Indicator - Top Left */}
                              {videoCount > 1 ? (
                                <div className="absolute top-1.5 left-1.5 md:top-3 md:left-3 px-1.5 py-0.5 md:px-2 md:py-1 rounded-md md:rounded-xl bg-black/75 text-white backdrop-blur-md pointer-events-none z-10 flex items-center space-x-1 text-[9px] md:text-xs font-black border border-white/20 shadow-md">
                                  <Layers className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 text-brand-interactive" />
                                  <span>{videoCount}</span>
                                </div>
                              ) : hasAnyVideo ? (
                                <div className="absolute top-1.5 left-1.5 md:top-3 md:left-3 p-1 md:p-1.5 rounded-md md:rounded-xl bg-black/60 text-white backdrop-blur-sm pointer-events-none z-10 shadow-md">
                                  <Play className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 fill-current" />
                                </div>
                              ) : null}

                              {/* Top-Right Quick Actions: Like & Favorite */}
                              <div className="absolute top-1.5 right-1.5 md:top-3 md:right-3 flex items-center space-x-1 md:space-x-1.5 z-10">
                                <button
                                  type="button"
                                  onClick={(e) => handleToggleLike(service.id, e)}
                                  className="p-1.5 md:p-2 rounded-lg md:rounded-xl bg-black/50 text-white backdrop-blur-sm hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                                  title={isLiked ? 'Unlike' : 'Like'}
                                >
                                  <Heart
                                    className={`w-3.5 h-3.5 md:w-4 md:h-4 ${isLiked ? 'text-rose-500 fill-rose-500' : 'text-white'}`}
                                  />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => handleToggleFavorite(service.id, e)}
                                  className="p-1.5 md:p-2 rounded-lg md:rounded-xl bg-black/50 text-white backdrop-blur-sm hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                                  title={isFavorite ? 'Remove from Favorites' : 'Save to Favorites'}
                                >
                                  <Bookmark
                                    className={`w-3.5 h-3.5 md:w-4 md:h-4 ${isFavorite ? 'text-amber-500 fill-amber-500' : 'text-white'}`}
                                  />
                                </button>
                              </div>

                              {/* Price Overlay */}
                              <div className="absolute bottom-1.5 left-1.5 md:bottom-3 md:left-3 px-2 py-0.5 md:px-3 md:py-1 rounded-md md:rounded-xl bg-black/80 backdrop-blur-md text-[10px] md:text-xs font-black text-white shadow-sm pointer-events-none">
                                ₦{service.price >= 1000 ? `${(service.price / 1000).toFixed(0)}k` : service.price}
                              </div>

                              {/* PC Hover Overlay */}
                              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 lg:p-6 hidden md:flex flex-col justify-between text-white pointer-events-auto">
                                <span className="text-xs font-black uppercase tracking-wider text-brand-accent line-clamp-1">
                                  {service.category}
                                </span>
                                <div>
                                  <h4 className="text-base lg:text-lg font-bold line-clamp-2 mb-3">
                                    {service.name}
                                  </h4>
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setServiceViewMode('feed');
                                        setTimeout(() => {
                                          document.getElementById(`post-service-${service.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                        }, 60);
                                      }}
                                      className="flex-1 py-2 bg-brand-surface text-[#1A1A1A] rounded-xl text-xs font-black hover:bg-white transition-all text-center cursor-pointer shadow-md flex items-center justify-center space-x-1"
                                    >
                                      <span>View Post</span>
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/book/${service.id}`);
                                      }}
                                      className="px-3 py-2 bg-brand-interactive hover:bg-brand-interactive/90 rounded-xl text-xs font-bold text-white transition-colors cursor-pointer shadow-md"
                                      title="Book Appointment"
                                    >
                                      Book Now
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  <LottieEmptyState type="services" />
                )}
              </motion.div>
            )}

            {/* TAB 2: REELS / VIDEOS */}
            {activeTab === 'reels' && (
              <motion.div
                key="tab-reels"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {reelItems.length > 0 ? (
                  <div className="grid grid-cols-3 gap-1 sm:gap-2 md:gap-6 lg:gap-8">
                    {reelItems.map((reel) => (
                      <div
                        key={reel.id}
                        onClick={() => {
                          if (reel.service) {
                            navigate(`/services/${reel.service.id}`);
                          }
                        }}
                        className="group relative aspect-[9/16] md:aspect-square bg-black overflow-hidden md:rounded-2xl md:shadow-md cursor-pointer"
                      >
                        <video
                          src={reel.url}
                          muted
                          loop
                          autoPlay
                          playsInline
                          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                        />
                        <div className="absolute top-2 right-2 md:top-3 md:right-3 p-1.5 rounded-lg md:rounded-xl bg-black/60 text-white backdrop-blur-sm">
                          <Film className="w-3.5 h-3.5 md:w-5 md:h-5" />
                        </div>
                        <div className="absolute inset-x-0 bottom-0 p-2 md:p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent text-white">
                          <p className="text-[10px] md:text-sm font-bold line-clamp-1">{reel.title}</p>
                          <span className="text-[9px] md:text-xs font-black text-white bg-black/50 px-2 py-0.5 rounded-md border border-white/20">
                            ₦{reel.price.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <LottieEmptyState type="reels" />
                )}
              </motion.div>
            )}

            {/* TAB 3: COMMUNITY / FOLLOWERS (Twitter/X Style User Rows) */}
            {activeTab === 'community' && (
              <motion.div
                key="tab-community"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="max-w-2xl mx-auto space-y-4 pt-2"
              >
                {/* Sub-Tabs: Followers vs Following */}
                <div className="flex items-center space-x-2 border-b border-[#E9ECEF] dark:border-[#222222] pb-3">
                  <button
                    onClick={() => setCommunitySubTab('followers')}
                    className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${communitySubTab === 'followers'
                      ? 'bg-brand-interactive text-white shadow-md'
                      : 'bg-brand-surface dark:bg-[#1E1E1E] text-[#6C757D] dark:text-[#A0A0A0]'
                      }`}
                  >
                    Followers ({counts.followers})
                  </button>
                  <button
                    onClick={() => setCommunitySubTab('following')}
                    className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${communitySubTab === 'following'
                      ? 'bg-brand-interactive text-white shadow-md'
                      : 'bg-brand-surface dark:bg-[#1E1E1E] text-[#6C757D] dark:text-[#A0A0A0]'
                      }`}
                  >
                    Following ({counts.following})
                  </button>
                </div>

                {/* Twitter/X Style User List */}
                <div className="divide-y divide-[#E9ECEF] dark:divide-[#222222] bg-brand-surface/30 dark:bg-[#161616] rounded-2xl p-2 md:p-4 border border-[#E9ECEF] dark:border-[#222222]">
                  {(communitySubTab === 'followers' ? followers : following).length > 0 ? (
                    (communitySubTab === 'followers' ? followers : following).map((person) => {
                      const isFollowingPerson = myFollowingIds.includes(person.id);
                      const isMe = user?.id === person.id;

                      return (
                        <div
                          key={person.id}
                          className="py-3.5 flex items-start justify-between space-x-3"
                        >
                          <div className="flex items-start space-x-3 min-w-0">
                            <img
                              src={person.avatar && person.avatar.trim() !== '' ? person.avatar : getInitialsSvg(person.name)}
                              alt={person.name}
                              onError={(e) => {
                                e.currentTarget.src = getInitialsSvg(person.name);
                              }}
                              className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover shrink-0 border border-black/5 dark:border-white/10"
                            />
                            <div className="min-w-0">
                              <h4 className="text-xs md:text-sm font-bold text-[#1A1A1A] dark:text-white truncate">
                                {person.name}
                              </h4>
                              <p className="text-[11px] md:text-xs text-[#6C757D] dark:text-[#A0A0A0] truncate">
                                {person.handle}
                              </p>
                              {person.bio && (
                                <p className="text-xs md:text-sm text-[#444] dark:text-[#CCC] mt-1 line-clamp-2 leading-tight">
                                  {person.bio}
                                </p>
                              )}
                            </div>
                          </div>

                          {!isMe && (
                            <button
                              onClick={() => handleToggleFollow(person.id)}
                              disabled={followBusy === person.id}
                              className={`shrink-0 h-8 md:h-9 px-4 rounded-xl text-xs font-black transition-all duration-150 ease-out hover:scale-[1.03] hover:-translate-y-0.5 active:scale-[0.95] active:translate-y-0.5 disabled:opacity-60 cursor-pointer ${isFollowingPerson
                                ? 'bg-brand-surface dark:bg-[#1E1E1E] text-[#1A1A1A] dark:text-white border border-[#E9ECEF] dark:border-[#2D2D2D] hover:border-rose-500/50 hover:text-rose-500'
                                : 'bg-gradient-to-r from-[#6C35A6] to-[#7B3DB8] text-white shadow-sm hover:shadow-[0_4px_12px_rgba(108,53,166,0.4)]'
                                }`}
                            >
                              {isFollowingPerson ? 'Following' : 'Follow'}
                            </button>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <LottieEmptyState 
                      type="community" 
                      subType={communitySubTab}
                      description={
                        communitySubTab === 'followers'
                          ? `Be the first to follow ${agent?.name || 'this specialist'}`
                          : `${agent?.name || 'This specialist'} hasn't followed any accounts yet`
                      }
                    />
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB 4: LIKED SERVICES */}
            {activeTab === 'liked' && (
              <motion.div
                key="tab-liked"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {likedServices.length > 0 ? (
                  <div className="grid grid-cols-3 gap-1 sm:gap-2 md:gap-6 lg:gap-8">
                    {likedServices.map((service) => (
                      <div
                        key={service.id}
                        className="group relative aspect-square bg-gray-100 dark:bg-[#181818] overflow-hidden md:rounded-2xl md:shadow-md md:border md:border-[#E9ECEF] dark:md:border-[#222222] cursor-pointer"
                        onClick={() => navigate(`/services/${service.id}`)}
                      >
                        <img
                          src={service.image || getInitialsSvg(service.name)}
                          alt={service.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.src = getInitialsSvg(service.name);
                          }}
                        />

                        {/* Red Love / Heart Icon on top-right */}
                        <div className="absolute top-1.5 right-1.5 md:top-3 md:right-3 p-1.5 md:p-2 rounded-lg md:rounded-xl bg-black/60 backdrop-blur-md text-rose-500 shadow-md">
                          <Heart className="w-3.5 h-3.5 md:w-5 md:h-5 fill-current" />
                        </div>

                        {/* Price badge */}
                        <div className="absolute bottom-1.5 left-1.5 md:bottom-3 md:left-3 px-2 py-0.5 md:px-3 md:py-1 rounded-md md:rounded-xl bg-black/80 backdrop-blur-md text-[10px] md:text-xs font-black text-white shadow-sm">
                          ₦{service.price >= 1000 ? `${(service.price / 1000).toFixed(0)}k` : service.price}
                        </div>

                        {/* PC Hover Overlay */}
                        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 lg:p-6 hidden md:flex flex-col justify-end text-white">
                          <p className="text-base font-bold line-clamp-1">{service.name}</p>
                          <span className="text-xs text-white font-black bg-black/50 px-2 py-0.5 rounded-md border border-white/20">₦{service.price.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <LottieEmptyState type="liked" />
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </main>

      {/* 6. CUSTOM SHARE MODAL */}
      {agent && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          agent={agent}
          handle={cleanHandle}
        />
      )}

      {/* 7. QUICK BOOKING MODAL */}
      {selectedServiceForBooking && (
        <BookingModal
          service={selectedServiceForBooking}
          isOpen={true}
          onClose={() => setSelectedServiceForBooking(null)}
        />
      )}
    </div>
  );
};

export default AgentProfile;
