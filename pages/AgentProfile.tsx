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
  getServicesByAgentId,
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

      setCounts({ followers: c.followers, following: c.following });
      setFollowers(fr);
      setFollowing(fg);
      setLikedIds(liked);
      setMyFollowingIds(mine);
    } catch {
      setCounts({ followers: 0, following: 0 });
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

    const [agentRes, agentServicesRes, allServicesRes] = await Promise.all([
      getAgentById(id),
      getServicesByAgentId(id),
      getServices()
    ]);

    if (agentRes.error || !agentRes.data) {
      setError(agentRes.error || 'Artist profile not found');
      setLoading(false);
    } else {
      setAgent(agentRes.data);
      if (allServicesRes.data) {
        setAllServices(allServicesRes.data);
      }
      if (agentServicesRes.data && agentServicesRes.data.length > 0) {
        setServices(agentServicesRes.data);
      } else if (allServicesRes.data) {
        const matched = allServicesRes.data.filter(
          (s) => s.agentId === agentRes.data?.id || agentRes.data?.services?.includes(s.id)
        );
        setServices(matched);
      } else {
        setServices([]);
      }
      setLoading(false);
      // Load social metrics non-blockingly so specialist profile renders instantly
      loadSocial(agentRes.data.id);
    }
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
    <div className="min-h-screen bg-brand-background dark:bg-[#0D0D0D] text-[#1A1A1A] dark:text-white pb-20 pt-16 sm:pt-20 select-none transition-colors duration-200">
      
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
              <div className="p-1 rounded-full bg-gradient-to-tr from-[#32104D] via-[#6C35A6] to-[#F43F5E] shadow-2xl hover:shadow-[0_0_25px_rgba(244,63,94,0.4)] transition-all">
                <div className="p-1 bg-white dark:bg-[#0D0D0D] rounded-full">
                  <img
                    src={agent.image && agent.image.trim() !== '' ? agent.image : getInitialsSvg(agent.name)}
                    alt={agent.name}
                    onError={(e) => {
                      e.currentTarget.src = getInitialsSvg(agent.name);
                    }}
                    className="w-36 h-36 lg:w-44 lg:h-44 rounded-full object-cover shadow-inner"
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
            
            {/* Phone Avatar: 100% visible, complete round circle with brand Instagram gradient ring */}
            <div className="relative shrink-0 flex flex-col items-center">
              <div className="p-[2.5px] rounded-full bg-gradient-to-tr from-[#32104D] via-[#6C35A6] to-[#F43F5E] shadow-lg">
                <div className="p-0.5 bg-white dark:bg-[#0D0D0D] rounded-full">
                  <img
                    src={agent.image && agent.image.trim() !== '' ? agent.image : getInitialsSvg(agent.name)}
                    alt={agent.name}
                    onError={(e) => {
                      e.currentTarget.src = getInitialsSvg(agent.name);
                    }}
                    className="w-18 h-18 sm:w-20 sm:h-20 rounded-full object-cover"
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
      </div>
    </div>

    {/* 3. MAIN CONTENT CONTAINER (Pure solid background for tabs and feeds) */}
    <main className="max-w-5xl lg:max-w-6xl mx-auto px-3.5 sm:px-4 md:px-8 lg:px-12 relative z-10 pt-2">

      {/* ======================================================== */}
      {/* 4. THE 4 TABS WITH ANIMATED SLIDER (ALL 4 VISIBLE & SHARP) */}
      {/* ======================================================== */}
      <nav aria-label="Profile tabs" className="border-b border-[#E9ECEF] dark:border-[#222222]">
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
                          onClick={() => navigate(`/services/${service.id}`)}
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
                                    navigate(`/services/${service.id}`);
                                  }}
                                  className="flex-1 py-2 bg-brand-interactive text-white rounded-xl text-xs font-black hover:bg-brand-interactive/90 transition-all text-center cursor-pointer shadow-md flex items-center justify-center space-x-1.5"
                                >
                                  <span>View Details & Book</span>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedServiceForBooking(service);
                                  }}
                                  className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-bold text-white transition-colors cursor-pointer"
                                  title="Quick Book"
                                >
                                  Quick Book
                                </button>
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
                    })
                  ) : (
                    <div className="py-12 text-center text-[#6C757D] dark:text-[#A0A0A0]">
                      <Users className="w-10 h-10 mx-auto mb-2 text-[#ADB5BD] dark:text-[#555]" />
                      <p className="text-sm font-bold text-[#1A1A1A] dark:text-white">
                        {communitySubTab === 'followers' ? 'No followers yet' : 'Not following anyone yet'}
                      </p>
                      <p className="text-xs text-[#8E8E93] dark:text-[#777] mt-1">
                        {communitySubTab === 'followers'
                          ? `Be the first to follow ${agent?.name || 'this specialist'}`
                          : `${agent?.name || 'This specialist'} hasn't followed any accounts yet`}
                      </p>
                    </div>
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
