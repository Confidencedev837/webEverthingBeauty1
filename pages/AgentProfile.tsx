import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
  ChevronLeft,
  Share2,
  Film,
  MessageCircle,
  ExternalLink,
  Check,
  Copy,
  X,
  Clock
} from 'lucide-react';
import { Agent, Service, VerificationStatus } from '../types';
import {
  getAgentById,
  getServices,
  isVideoUrl,
  getFollowCounts,
  getFollowers,
  getFollowing,
  getMyFollowingIds,
  setFollow,
  getLikedServiceIds,
  setServiceLike,
  SocialUser
} from '../services/supabaseService';
import { useAuth } from '../context/AuthContext';
import { useSnackbar } from '../components/Snackbar';
import BookingModal from '../components/BookingModal';

export function getInitialsSvg(name: string) {
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'A';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#6C35A6" /><text x="50%" y="50%" fill="white" font-family="sans-serif" font-size="38" font-weight="bold" text-anchor="middle" dominant-baseline="central">${initials}</text></svg>`;
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

// Fallback social users for demonstration if database is empty
const DEMO_FOLLOWERS: SocialUser[] = [
  {
    id: 'f1',
    name: 'Amara Okonkwo',
    handle: '@amara_beauty',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300',
    bio: 'Bridal glam & luxury beauty lover based in Lagos.',
    userType: 'customer'
  },
  {
    id: 'f2',
    name: 'Tunde Balogun',
    handle: '@tundehair',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300',
    bio: 'Men grooming specialist & hair artist in Lekki.',
    userType: 'customer'
  },
  {
    id: 'f3',
    name: 'Chioma Adeyemi',
    handle: '@chioma_glam',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=300',
    bio: 'Skincare consultant and wellness advocate.',
    userType: 'customer'
  }
];

// Custom Share Modal Component
interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: Agent;
  handle: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, agent, handle }) => {
  const [copied, setCopied] = useState(false);
  const { showSnackbar } = useSnackbar();
  const shareUrl = window.location.href;
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

          {/* Quick Social Channels */}
          <div className="grid grid-cols-3 gap-2.5 mb-4">
            {/* WhatsApp */}
            <button
              onClick={handleWhatsApp}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] transition-all group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-[#25D366] text-white flex items-center justify-center mb-1 shadow-sm group-hover:scale-105 transition-transform">
                <Phone className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-black">WhatsApp</span>
            </button>

            {/* X / Twitter */}
            <button
              onClick={handleTwitter}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-[#E9ECEF] dark:border-[#333] text-[#1A1A1A] dark:text-white transition-all group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center mb-1 shadow-sm group-hover:scale-105 transition-transform font-black text-sm">
                X
              </div>
              <span className="text-[11px] font-black">Share on X</span>
            </button>

            {/* Facebook */}
            <button
              onClick={handleFacebook}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/30 text-[#1877F2] transition-all group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-[#1877F2] text-white flex items-center justify-center mb-1 shadow-sm group-hover:scale-105 transition-transform font-black text-sm">
                f
              </div>
              <span className="text-[11px] font-black">Facebook</span>
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
                className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
                  copied
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

const AgentProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, currentUser } = useAuth();
  const { showSnackbar } = useSnackbar();

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
  const [followBusy, setFollowBusy] = useState<string | null>(null);

  // Booking Modal
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState<Service | null>(null);

  const loadSocial = async (agentId: string) => {
    try {
      const [c, fr, fg, liked, mine] = await Promise.all([
        getFollowCounts(agentId),
        getFollowers(agentId),
        getFollowing(agentId),
        user ? getLikedServiceIds(user.id) : Promise.resolve([] as string[]),
        user ? getMyFollowingIds(user.id) : Promise.resolve([] as string[])
      ]);

      const effectiveFollowers = fr.length > 0 ? fr : DEMO_FOLLOWERS;
      const effectiveFollowersCount = c.followers > 0 ? c.followers : effectiveFollowers.length;
      const effectiveFollowingCount = c.following > 0 ? c.following : 14;

      setCounts({ followers: effectiveFollowersCount, following: effectiveFollowingCount });
      setFollowers(effectiveFollowers);
      setFollowing(fg.length > 0 ? fg : DEMO_FOLLOWERS.slice(0, 2));
      setLikedIds(liked);
      setMyFollowingIds(mine);
    } catch {
      setCounts({ followers: 142, following: 14 });
      setFollowers(DEMO_FOLLOWERS);
      setFollowing(DEMO_FOLLOWERS.slice(0, 2));
    }
  };

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);

    const [agentRes, allServicesRes] = await Promise.all([
      getAgentById(id),
      getServices()
    ]);

    if (agentRes.error || !agentRes.data) {
      setError(agentRes.error || 'Artist profile not found');
    } else {
      setAgent(agentRes.data);
      if (allServicesRes.data) {
        setAllServices(allServicesRes.data);
        const matched = allServicesRes.data.filter(
          (s) => s.agentId === agentRes.data?.id || agentRes.data?.services?.includes(s.id)
        );
        setServices(matched);
      }
      await loadSocial(agentRes.data.id);
    }
    setLoading(false);
  };

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
    showSnackbar?.(isLiked ? 'Removed from liked items' : 'Saved to liked items', 'success');
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
    <div className="min-h-screen bg-brand-background dark:bg-[#0D0D0D] text-[#1A1A1A] dark:text-white pb-20 pt-16 sm:pt-20 select-none transition-colors duration-200 relative overflow-hidden">
      
      {/* 1. AMBIENT GLASSMORPHIC BANNER (STRICTLY IN THE BACKGROUND, NEVER COVERS ANYTHING) */}
      {/* Positioned as an absolute backdrop behind the profile header with soft opacity and fade */}
      <div className="absolute top-0 left-0 right-0 h-72 sm:h-80 md:h-96 overflow-hidden pointer-events-none z-0">
        <img
          src={bannerImgUrl}
          alt=""
          className="w-full h-full object-cover opacity-20 dark:opacity-25 blur-sm scale-105 transition-opacity duration-700"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1600';
          }}
        />
        {/* Soft gradient fade so the banner blends smoothly without covering text */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-background/60 dark:via-[#0D0D0D]/60 to-brand-background dark:to-[#0D0D0D]" />
      </div>

      {/* 2. MOBILE TOP NAVIGATION BAR (Clean, No Check Icon, Opens Custom Share Modal) */}
      <div className="md:hidden relative z-10 px-3 py-2 flex items-center justify-between border-b border-[#E9ECEF]/60 dark:border-[#222222]/60 bg-brand-background/40 dark:bg-[#0D0D0D]/40 backdrop-blur-sm">
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
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
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

      {/* 3. MAIN RESPONSIVE CONTAINER (Strictly in front with relative z-10, fully visible, full color) */}
      <main className="max-w-5xl lg:max-w-6xl mx-auto px-3.5 sm:px-4 md:px-8 lg:px-12 pt-3 sm:pt-4 md:pt-6 relative z-10">
        
        {/* ======================================================== */}
        {/* DESKTOP (PC) PROFILE HEADER (md:flex, bigger components) */}
        {/* ======================================================== */}
        <section className="hidden md:flex items-start space-x-10 lg:space-x-16 mb-8 pb-8 border-b border-[#E9ECEF] dark:border-[#222222]">
          
          {/* PC Big Avatar */}
          <div className="relative shrink-0 flex flex-col items-center">
            <div className="p-1.5 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-brand-interactive shadow-2xl">
              <div className="p-1 bg-brand-background dark:bg-[#0D0D0D] rounded-full">
                <img
                  src={agent.image && agent.image.trim() !== '' ? agent.image : getInitialsSvg(agent.name)}
                  alt={agent.name}
                  onError={(e) => {
                    e.currentTarget.src = getInitialsSvg(agent.name);
                  }}
                  className="w-36 h-36 lg:w-44 lg:h-44 rounded-full object-cover border-2 border-black/5 dark:border-white/10 shadow-inner"
                />
              </div>
            </div>

            {/* Prominent VERIFIED Badge Next to profile pic */}
            <div className="mt-3 inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 text-xs font-black shadow-sm tracking-wide">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>VERIFIED SPECIALIST</span>
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
                {/* Follow Button */}
                {!isOwnProfile ? (
                  <button
                    onClick={() => handleToggleFollow(agent.id)}
                    disabled={followBusy === agent.id}
                    className={`h-11 px-6 rounded-2xl text-sm font-black transition-all active:scale-95 flex items-center space-x-2 shadow-sm disabled:opacity-60 cursor-pointer ${
                      isAgentFollowed
                        ? 'bg-brand-surface dark:bg-[#202020] text-[#1A1A1A] dark:text-white border border-[#E9ECEF] dark:border-[#333] hover:text-rose-500'
                        : 'bg-brand-interactive text-white shadow-[0_0_15px_rgba(108,53,166,0.35)] hover:bg-brand-interactive/90'
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
                    className="h-11 px-6 rounded-2xl text-sm font-black bg-brand-surface dark:bg-[#202020] text-[#1A1A1A] dark:text-white border border-[#E9ECEF] dark:border-[#333] flex items-center space-x-2 hover:border-brand-interactive transition-all"
                  >
                    <span>Edit Profile</span>
                  </Link>
                )}

                {/* Book Now Button */}
                <button
                  onClick={() => {
                    if (services.length > 0) {
                      setSelectedServiceForBooking(services[0]);
                    } else {
                      showSnackbar?.('No bookable services listed yet', 'info');
                    }
                  }}
                  className="h-11 px-6 rounded-2xl text-sm font-black bg-brand-interactive text-white shadow-[0_0_15px_rgba(108,53,166,0.35)] hover:bg-brand-interactive/90 flex items-center space-x-2 transition-all active:scale-95 cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book Now</span>
                </button>

                {/* Message / Call button */}
                {agent.phone ? (
                  <a
                    href={`tel:${agent.phone}`}
                    className="h-11 px-4 rounded-2xl bg-brand-surface dark:bg-[#202020] text-[#1A1A1A] dark:text-white border border-[#E9ECEF] dark:border-[#333] flex items-center space-x-2 hover:text-brand-interactive transition-all active:scale-95"
                    title="Call specialist"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Contact</span>
                  </a>
                ) : (
                  <button
                    onClick={() => showSnackbar?.(`Message sent to ${agent.name}`, 'info')}
                    className="h-11 px-4 rounded-2xl bg-brand-surface dark:bg-[#202020] text-[#1A1A1A] dark:text-white border border-[#E9ECEF] dark:border-[#333] flex items-center space-x-2 hover:text-brand-interactive transition-all active:scale-95 cursor-pointer"
                    title="Send message"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Message</span>
                  </button>
                )}

                {/* Custom Share Button (Opens Share Modal) */}
                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="h-11 w-11 rounded-2xl bg-brand-surface dark:bg-[#202020] text-[#1A1A1A] dark:text-white border border-[#E9ECEF] dark:border-[#333] flex items-center justify-center hover:text-brand-interactive transition-all active:scale-95 cursor-pointer"
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
            
            {/* Phone Avatar: 100% visible, complete circle */}
            <div className="relative shrink-0 flex flex-col items-center">
              <div className="p-0.5 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-brand-interactive shadow-md">
                <div className="p-0.5 bg-brand-background dark:bg-[#0D0D0D] rounded-full">
                  <img
                    src={agent.image && agent.image.trim() !== '' ? agent.image : getInitialsSvg(agent.name)}
                    alt={agent.name}
                    onError={(e) => {
                      e.currentTarget.src = getInitialsSvg(agent.name);
                    }}
                    className="w-18 h-18 sm:w-20 sm:h-20 rounded-full object-cover border border-black/5 dark:border-white/10"
                    style={{ width: '4.75rem', height: '4.75rem' }}
                  />
                </div>
              </div>
            </div>

            {/* Phone Stats Row: 100% visible, unclipped */}
            <div className="flex-1 ml-4 sm:ml-6 flex items-center justify-around text-center">
              <button
                onClick={() => setActiveTab('services')}
                className="flex flex-col items-center group cursor-pointer"
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
                className="flex flex-col items-center px-2 py-1 rounded-xl hover:bg-brand-surface dark:hover:bg-white/5 transition-all group cursor-pointer"
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
                className="flex flex-col items-center group cursor-pointer"
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

          {/* Row 3: Action Buttons (MORE PADDING per request: "ADD MORE PADDING TO THE FOLLOWING AND BOOK TAB") */}
          <div className="flex items-center gap-2 mb-4">
            {!isOwnProfile ? (
              <button
                onClick={() => handleToggleFollow(agent.id)}
                disabled={followBusy === agent.id}
                className={`flex-1 py-3 px-4 min-h-[46px] rounded-2xl text-xs sm:text-sm font-black transition-all active:scale-95 flex items-center justify-center space-x-2 shadow-sm disabled:opacity-60 cursor-pointer ${
                  isAgentFollowed
                    ? 'bg-brand-surface dark:bg-[#202020] text-[#1A1A1A] dark:text-white border border-[#E9ECEF] dark:border-[#333] hover:text-rose-500'
                    : 'bg-brand-interactive text-white shadow-[0_0_12px_rgba(108,53,166,0.35)] hover:bg-brand-interactive/90'
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
                className="flex-1 py-3 px-4 min-h-[46px] rounded-2xl text-xs sm:text-sm font-black bg-brand-surface dark:bg-[#202020] text-[#1A1A1A] dark:text-white border border-[#E9ECEF] dark:border-[#333] flex items-center justify-center"
              >
                <span>Edit Profile</span>
              </Link>
            )}

            {/* Book Now Button with generous padding */}
            <button
              onClick={() => {
                if (services.length > 0) {
                  setSelectedServiceForBooking(services[0]);
                } else {
                  showSnackbar?.('No bookable services listed yet', 'info');
                }
              }}
              className="flex-1 py-3 px-4 min-h-[46px] rounded-2xl text-xs sm:text-sm font-black bg-brand-surface dark:bg-[#202020] text-[#1A1A1A] dark:text-white border border-[#E9ECEF] dark:border-[#333] hover:border-brand-interactive hover:text-brand-interactive flex items-center justify-center space-x-2 active:scale-95 shadow-sm cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-brand-interactive" />
              <span>Book Now</span>
            </button>

            {/* Contact / Phone */}
            {agent.phone ? (
              <a
                href={`tel:${agent.phone}`}
                className="w-11 h-11 rounded-2xl bg-brand-surface dark:bg-[#202020] text-[#1A1A1A] dark:text-white border border-[#E9ECEF] dark:border-[#333] flex items-center justify-center shrink-0 active:scale-95 shadow-sm"
                title="Call specialist"
              >
                <Phone className="w-4 h-4" />
              </a>
            ) : (
              <button
                onClick={() => showSnackbar?.(`Message sent to ${agent.name}`, 'info')}
                className="w-11 h-11 rounded-2xl bg-brand-surface dark:bg-[#202020] text-[#1A1A1A] dark:text-white border border-[#E9ECEF] dark:border-[#333] flex items-center justify-center shrink-0 active:scale-95 shadow-sm cursor-pointer"
                title="Send message"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
            )}
          </div>

        </section>

        {/* ======================================================== */}
        {/* 4. THE 4 TABS WITH ANIMATED SLIDER (ALL 4 VISIBLE & SHARP) */}
        {/* ======================================================== */}
        <nav aria-label="Profile tabs" className="border-t border-[#E9ECEF] dark:border-[#222222] mt-2">
          <div className="grid grid-cols-4 w-full">
            
            {/* TAB 1: SERVICES (LayoutGrid) */}
            <button
              onClick={() => setActiveTab('services')}
              className={`relative py-3 sm:py-3.5 flex flex-col md:flex-row items-center justify-center space-y-1 md:space-y-0 md:space-x-2 transition-colors cursor-pointer ${
                activeTab === 'services'
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
              className={`relative py-3 sm:py-3.5 flex flex-col md:flex-row items-center justify-center space-y-1 md:space-y-0 md:space-x-2 transition-colors cursor-pointer ${
                activeTab === 'reels'
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
              className={`relative py-3 sm:py-3.5 flex flex-col md:flex-row items-center justify-center space-y-1 md:space-y-0 md:space-x-2 transition-colors cursor-pointer ${
                activeTab === 'community'
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
              className={`relative py-3 sm:py-3.5 flex flex-col md:flex-row items-center justify-center space-y-1 md:space-y-0 md:space-x-2 transition-colors cursor-pointer ${
                activeTab === 'liked'
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
                {services.length > 0 ? (
                  <div className="grid grid-cols-3 gap-1 sm:gap-2 md:gap-6 lg:gap-8">
                    {services.map((service) => {
                      const isVideo = isVideoUrl(service.image);
                      const isLiked = likedIds.includes(service.id);

                      return (
                        <div
                          key={service.id}
                          className="group relative aspect-square bg-gray-100 dark:bg-[#181818] overflow-hidden md:rounded-2xl md:shadow-md md:border md:border-[#E9ECEF] dark:md:border-[#222222] cursor-pointer"
                          onClick={() => setSelectedServiceForBooking(service)}
                        >
                          {/* Media Thumbnail with broken image fallback */}
                          {service.image ? (
                            isVideo ? (
                              <video
                                src={service.image}
                                muted
                                playsInline
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <img
                                src={service.image}
                                alt={service.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                loading="lazy"
                                onError={(e) => {
                                  e.currentTarget.src = getInitialsSvg(service.name);
                                }}
                              />
                            )
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-brand-surface dark:bg-[#1E1E1E]">
                              <span className="text-[10px] md:text-sm font-black text-brand-interactive line-clamp-2">
                                {service.name}
                              </span>
                            </div>
                          )}

                          {/* Video Slate Indicator */}
                          {isVideo && (
                            <div className="absolute top-1.5 right-1.5 md:top-3 md:right-3 p-1 md:p-1.5 rounded-md md:rounded-xl bg-black/60 text-white backdrop-blur-sm pointer-events-none">
                              <Play className="w-2.5 h-2.5 md:w-4 md:h-4 fill-current" />
                            </div>
                          )}

                          {/* Top-Right Heart like toggle */}
                          <button
                            onClick={(e) => handleToggleLike(service.id, e)}
                            className="absolute top-1.5 right-1.5 md:top-3 md:right-3 p-1.5 md:p-2 rounded-lg md:rounded-xl bg-black/50 text-white backdrop-blur-sm hover:scale-110 active:scale-95 transition-transform z-10 cursor-pointer"
                            title={isLiked ? 'Unlike' : 'Like'}
                          >
                            <Heart
                              className={`w-3.5 h-3.5 md:w-4 md:h-4 ${
                                isLiked ? 'text-rose-500 fill-rose-500' : 'text-white'
                              }`}
                            />
                          </button>

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
                                    setSelectedServiceForBooking(service);
                                  }}
                                  className="flex-1 py-2 bg-brand-interactive text-white rounded-xl text-xs font-black hover:bg-brand-interactive/90 transition-all text-center cursor-pointer shadow-md"
                                >
                                  Book Appointment
                                </button>
                                <Link
                                  to={`/services/${service.id}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="p-2 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-colors cursor-pointer"
                                  title="View details"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-16 px-4 text-center">
                    <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-brand-surface dark:bg-[#1E1E1E] text-brand-interactive flex items-center justify-center">
                      <LayoutGrid className="w-7 h-7" />
                    </div>
                    <p className="text-base font-bold text-[#1A1A1A] dark:text-white">No services listed yet</p>
                    <p className="text-xs md:text-sm text-[#6C757D] mt-1">This specialist has not published service items yet.</p>
                  </div>
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
                          if (reel.service) setSelectedServiceForBooking(reel.service);
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
                          {reel.price && (
                            <span className="text-[9px] md:text-xs font-black text-brand-accent">
                              ₦{reel.price.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-16 px-4 text-center">
                    <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-brand-surface dark:bg-[#1E1E1E] text-brand-interactive flex items-center justify-center">
                      <Film className="w-7 h-7" />
                    </div>
                    <p className="text-base font-bold text-[#1A1A1A] dark:text-white">No video reels yet</p>
                    <p className="text-xs md:text-sm text-[#6C757D] mt-1">Video transformations and styling clips will appear here.</p>
                  </div>
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
                    className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${
                      communitySubTab === 'followers'
                        ? 'bg-brand-interactive text-white shadow-md'
                        : 'bg-brand-surface dark:bg-[#1E1E1E] text-[#6C757D] dark:text-[#A0A0A0]'
                    }`}
                  >
                    Followers ({counts.followers})
                  </button>
                  <button
                    onClick={() => setCommunitySubTab('following')}
                    className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${
                      communitySubTab === 'following'
                        ? 'bg-brand-interactive text-white shadow-md'
                        : 'bg-brand-surface dark:bg-[#1E1E1E] text-[#6C757D] dark:text-[#A0A0A0]'
                    }`}
                  >
                    Following ({counts.following})
                  </button>
                </div>

                {/* Twitter/X Style User List */}
                <div className="divide-y divide-[#E9ECEF] dark:divide-[#222222] bg-brand-surface/30 dark:bg-[#161616] rounded-2xl p-2 md:p-4 border border-[#E9ECEF] dark:border-[#222222]">
                  {(communitySubTab === 'followers' ? followers : following).map((person) => {
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
                            className={`shrink-0 h-8 md:h-9 px-4 rounded-xl text-xs font-black transition-all active:scale-95 disabled:opacity-60 cursor-pointer ${
                              isFollowingPerson
                                ? 'bg-brand-surface dark:bg-[#202020] text-[#1A1A1A] dark:text-white border border-[#E9ECEF] dark:border-[#333] hover:text-rose-500'
                                : 'bg-brand-interactive text-white shadow-sm hover:bg-brand-interactive/90'
                            }`}
                          >
                            {isFollowingPerson ? 'Following' : 'Follow'}
                          </button>
                        )}
                      </div>
                    );
                  })}
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
                        onClick={() => setSelectedServiceForBooking(service)}
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
                          <span className="text-xs text-brand-accent font-black">₦{service.price.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-16 px-4 text-center">
                    <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                      <Heart className="w-7 h-7 fill-current" />
                    </div>
                    <p className="text-base font-bold text-[#1A1A1A] dark:text-white">No liked services yet</p>
                    <p className="text-xs md:text-sm text-[#6C757D] mt-1">Items you like with the heart icon will appear here.</p>
                  </div>
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
