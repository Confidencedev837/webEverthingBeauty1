import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useAnimationControls, useMotionValueEvent } from 'framer-motion';
import { Star, Clock, MapPin, Heart, Bookmark, Share2, Check, ArrowRight, Calendar, Play, Pause, Volume2, VolumeX, Maximize, ChevronLeft, ChevronRight, MessageSquare, Send, AlertCircle, RefreshCw, User, X } from 'lucide-react';
import { Service, Review, ServiceGalleryItem } from '../types';
import {
  getServiceById,
  getReviewsForService,
  createReview,
  isVideoUrl,
  getCached,
  getLikedServiceIds,
  setServiceLike,
  getFavoriteServiceIds,
  setServiceFavorite,
  getServiceLikeCount
} from '../services/supabaseService';
import { useAuth } from '../context/AuthContext';
import { useSnackbar } from '../components/Snackbar';
import BookingModal from '../components/BookingModal';

const ServiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { user, currentUser } = useAuth();
  const { showSnackbar } = useSnackbar();
  const [service, setService] = useState<Service | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [hasNudged, setHasNudged] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoCurrentTime, setVideoCurrentTime] = useState('0:00');
  const [videoDuration, setVideoDuration] = useState('0:00');
  const [isMuted, setIsMuted] = useState(false);

  // Review submission state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  // Scroll-linked Shimmer Effect Controller
  const shimmerControls = useAnimationControls();
  const lastScrollY = useRef(0);
  const isShimmerRunning = useRef(false);

  const triggerShimmer = useCallback(() => {
    if (isShimmerRunning.current) return;
    isShimmerRunning.current = true;
    shimmerControls.set({ x: '-100%', opacity: 1 });
    shimmerControls.start({
      x: '100%',
      opacity: [0.2, 1, 1, 0.2],
      transition: { duration: 0.85, ease: [0.25, 0.46, 0.45, 0.94] }
    }).then(() => {
      setTimeout(() => {
        isShimmerRunning.current = false;
      }, 300);
    });
  }, [shimmerControls]);

  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (currentY) => {
    const delta = Math.abs(currentY - lastScrollY.current);
    // When the user scrolls up or down a little bit (>= 16px), trigger shimmer
    if (delta > 16 && !isShimmerRunning.current) {
      lastScrollY.current = currentY;
      triggerShimmer();
    }
  });

  const loadData = async () => {
    if (!id) return;
    const cached = getCached<Service>(`service:${id}`);
    if (!cached && (!service || service.id !== id)) {
      setLoading(true);
    }
    setError(null);
    const [serviceRes, reviewsRes] = await Promise.all([
      getServiceById(id),
      getReviewsForService(id)
    ]);

    if (serviceRes.error) {
      setError(serviceRes.error);
    } else {
      setService(serviceRes.data);
    }

    if (reviewsRes.data) {
      setReviews(reviewsRes.data);
    }

    // Load like count, liked status, and favorite status independently
    getServiceLikeCount(id).then(setLikesCount);
    const effectiveUserId = user?.id || 'guest_user';
    getLikedServiceIds(effectiveUserId).then((ids) => setIsLiked(ids.includes(id)));
    getFavoriteServiceIds(effectiveUserId).then((ids) => setIsFavorite(ids.includes(id)));

    setLoading(false);
  };

  useEffect(() => {
    loadData();

    // SWR: Listen for fresh background updates
    if (!id) return;
    const onCacheUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<{ key: string; data: any }>;
      if (customEvent.detail?.key === `service:${id}` && customEvent.detail.data) {
        setService(customEvent.detail.data);
      }
    };

    const onLikesUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<{ serviceId: string; like: boolean }>;
      if (customEvent.detail?.serviceId === id) {
        setIsLiked(customEvent.detail.like);
        getServiceLikeCount(id).then(setLikesCount);
      }
    };

    const onFavsUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<{ serviceId: string; favorite: boolean }>;
      if (customEvent.detail?.serviceId === id) {
        setIsFavorite(customEvent.detail.favorite);
      }
    };

    window.addEventListener('eb:cache-updated', onCacheUpdated);
    window.addEventListener('eb:likes-updated', onLikesUpdated);
    window.addEventListener('eb:favorites-updated', onFavsUpdated);
    return () => {
      window.removeEventListener('eb:cache-updated', onCacheUpdated);
      window.removeEventListener('eb:likes-updated', onLikesUpdated);
      window.removeEventListener('eb:favorites-updated', onFavsUpdated);
    };
  }, [id, user]);

  const handleToggleLike = async () => {
    if (!service) return;
    const targetUserId = user?.id || 'guest_user';
    const nextState = !isLiked;
    setIsLiked(nextState);
    setLikesCount((prev) => Math.max(0, prev + (nextState ? 1 : -1)));

    const res = await setServiceLike(targetUserId, service.id, nextState);
    if (!res.success) {
      setIsLiked(!nextState);
      setLikesCount((prev) => Math.max(0, prev + (nextState ? -1 : 1)));
      showSnackbar(res.error || 'Could not update like status', 'error');
      return;
    }
    showSnackbar(
      nextState ? 'Liked service! Thank you for the support.' : 'Removed like from service.',
      'success'
    );
  };

  const handleToggleFavorite = async () => {
    if (!service) return;
    const targetUserId = user?.id || 'guest_user';
    const nextState = !isFavorite;
    setIsFavorite(nextState);

    const res = await setServiceFavorite(targetUserId, service.id, nextState);
    if (!res.success) {
      setIsFavorite(!nextState);
      showSnackbar(res.error || 'Could not update favorite status', 'error');
      return;
    }
    showSnackbar(
      nextState
        ? 'Saved to Favorites! Access it anytime in your dashboard.'
        : 'Removed from your favorites.',
      'success'
    );
  };

  const handleShare = async () => {
    if (!service) return;
    const shareData = {
      title: service.name,
      text: `Check out ${service.name} on Everything Beauty`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          navigator.clipboard.writeText(window.location.href);
          showSnackbar('Service link copied to clipboard!', 'info');
        }
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      showSnackbar('Service link copied to clipboard!', 'info');
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => { });
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const cur = videoRef.current.currentTime;
    const dur = videoRef.current.duration;
    setVideoCurrentTime(formatTime(cur));
    if (dur && !isNaN(dur)) {
      setVideoDuration(formatTime(dur));
      setVideoProgress((cur / dur) * 100);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    videoRef.current.currentTime = pos * (videoRef.current.duration || 0);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const handleNextSlide = () => {
    if (!service) return;
    const mediaList = service.gallery && service.gallery.length > 0
      ? service.gallery
      : (service.image ? [{ type: isVideoUrl(service.image) ? 'video' : 'image', url: service.image }] : []);
    if (mediaList.length <= 1) return;
    setCurrentMediaIndex(prev => (prev === mediaList.length - 1 ? 0 : prev + 1));
  };

  const handlePrevSlide = () => {
    if (!service) return;
    const mediaList = service.gallery && service.gallery.length > 0
      ? service.gallery
      : (service.image ? [{ type: isVideoUrl(service.image) ? 'video' : 'image', url: service.image }] : []);
    if (mediaList.length <= 1) return;
    setCurrentMediaIndex(prev => (prev === 0 ? mediaList.length - 1 : prev - 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 45) {
      handleNextSlide();
    } else if (diff < -45) {
      handlePrevSlide();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  useEffect(() => {
    if (!loading && service) {
      const searchParams = new URLSearchParams(location.search);
      if (searchParams.get('book') === 'true') {
        setIsBookingOpen(true);
      }
    }
  }, [loading, service, location.search]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!service || !newComment.trim()) return;
    if (!user) {
      setReviewError('Please log in to submit a verified review.');
      return;
    }
    setSubmittingReview(true);
    setReviewError(null);

    const success = await createReview({
      customerId: user.id,
      serviceId: service.id,
      rating: newRating,
      comment: newComment
    });

    if (success) {
      setReviews(prev => [
        {
          id: 'new-' + Date.now(),
          userName: currentUser?.name || 'You',
          userAvatar: currentUser?.avatar || '',
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          rating: newRating,
          text: newComment,
          serviceName: service.name,
          serviceId: service.id,
          customerId: user.id
        },
        ...prev
      ]);
      setNewComment('');
      setShowReviewForm(false);
    } else {
      setReviewError('Failed to post review. Please try again.');
    }
    setSubmittingReview(false);
  };

  if (loading) {
    return (
      <div className="pt-24 pb-24 bg-brand-background dark:bg-[#0D0D0D] min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-6 bg-gray-200 dark:bg-white/5 rounded w-48 mb-8 animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-96 bg-gray-200 dark:bg-white/5 rounded-[2rem] animate-pulse" />
              <div className="h-8 bg-gray-200 dark:bg-white/5 rounded w-3/4 animate-pulse" />
              <div className="h-4 bg-gray-200 dark:bg-white/5 rounded w-1/2 animate-pulse" />
            </div>
            <div className="lg:col-span-1">
              <div className="h-80 bg-gray-200 dark:bg-white/5 rounded-[2.5rem] animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen pt-32 text-center bg-brand-background dark:bg-[#0D0D0D] px-4">
        <div className="max-w-md mx-auto p-8 bg-brand-background dark:bg-[#1A1A1A] rounded-3xl border border-[#E9ECEF] dark:border-[#2D2D2D] shadow-xl">
          <AlertCircle className="w-12 h-12 text-brand-interactive mx-auto mb-4" />
          <h2 className="text-2xl font-serif font-bold mb-2">Service not found</h2>
          <p className="text-sm text-[#6C757D] mb-6">This service record could not be found in the database.</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={loadData}
              className="px-6 py-2.5 bg-brand-interactive text-white rounded-xl text-xs font-bold"
            >
              Retry
            </button>
            <Link to="/services" className="px-6 py-2.5 bg-brand-surface dark:bg-[#252525] rounded-xl text-xs font-bold text-[#6C757D]">
              All Services
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const gallery: ServiceGalleryItem[] = service.gallery && service.gallery.length > 0
    ? service.gallery
    : (service.image ? [{ type: isVideoUrl(service.image) ? 'video' : 'image', url: service.image }] : []);
  const currentMedia = gallery[currentMediaIndex] || gallery[0];

  return (
    <div className="pt-24 pb-24 bg-brand-background dark:bg-[#0D0D0D] relative overflow-hidden">
      {/* Luxury Beauty Ambient Backdrop Mesh for Glassmorphic Layers */}
      <div className="glass-ambient-mesh" aria-hidden="true" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Breadcrumbs */}
        <nav className="flex space-x-2 text-sm text-[#6C757D] mb-8">
          <Link to="/services" className="hover:text-brand-interactive">Services</Link>
          <span>/</span>
          <span className="text-brand-interactive font-bold">{service.category}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="mb-8 group">
              {/* Main Media Viewer with Swipe & Click to Enlarge - Tall Luxury Portrait Aspect */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="relative h-[480px] sm:h-[580px] md:h-[660px] rounded-[2.5rem] overflow-hidden bg-black shadow-2xl select-none group"
              >
                <AnimatePresence mode='wait'>
                  <motion.div
                    key={currentMediaIndex}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.25}
                    onDragEnd={(_, info) => {
                      if (info.offset.x < -40 || info.velocity.x < -300) {
                        handleNextSlide();
                      } else if (info.offset.x > 40 || info.velocity.x > 300) {
                        handlePrevSlide();
                      }
                    }}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{
                      opacity: 1,
                      x: gallery.length > 1 && !hasNudged ? [0, -20, 14, -6, 0] : 0
                    }}
                    transition={{
                      opacity: { duration: 0.25 },
                      x: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 }
                    }}
                    onAnimationComplete={() => setHasNudged(true)}
                    className="w-full h-full flex items-center justify-center bg-black relative cursor-grab active:cursor-grabbing"
                  >
                    {currentMedia?.type === 'video' && !videoError ? (
                      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                        {/* Ambient Glassmorphic Video Background */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                          {currentMedia.thumbnail ? (
                            <img
                              src={currentMedia.thumbnail}
                              className="w-full h-full object-cover blur-3xl opacity-45 scale-125"
                              alt=""
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-tr from-brand-primary/40 via-black to-brand-interactive/30 blur-2xl" />
                          )}
                          <div className="absolute inset-0 bg-black/45 backdrop-blur-xl" />
                        </div>

                        {/* Video Element */}
                        <video
                          ref={videoRef}
                          src={currentMedia.url}
                          className="w-full h-full object-contain relative z-10 cursor-pointer"
                          poster={currentMedia.thumbnail || undefined}
                          playsInline
                          onTimeUpdate={handleTimeUpdate}
                          onEnded={() => setIsPlaying(false)}
                          onError={() => setVideoError(true)}
                          onClick={togglePlay}
                        />

                        {/* Center Glassmorphic Play/Pause Trigger */}
                        <button
                          type="button"
                          onClick={togglePlay}
                          aria-label={isPlaying ? 'Pause video' : 'Play video'}
                          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-16 h-16 sm:w-20 sm:h-20 rounded-3xl backdrop-blur-2xl bg-black/40 hover:bg-black/60 border border-white/30 text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 ${isPlaying ? 'opacity-0 hover:opacity-100' : 'opacity-100'
                            }`}
                        >
                          {isPlaying ? (
                            <Pause className="w-7 h-7 sm:w-8 sm:h-8 fill-current" />
                          ) : (
                            <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-current ml-1" />
                          )}
                        </button>

                        {/* Bottom Floating Glassmorphic Player Controls (Positioned comfortably above hero action buttons) */}
                        <div
                          className="absolute bottom-36 sm:bottom-40 left-4 right-4 sm:left-6 sm:right-6 z-30 pointer-events-auto"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="backdrop-blur-2xl bg-black/65 hover:bg-black/80 border border-white/25 rounded-2xl p-2.5 sm:p-3 shadow-2xl flex items-center space-x-3 text-white transition-all">
                            {/* Play / Pause Toggle */}
                            <button
                              type="button"
                              onClick={togglePlay}
                              className="p-1.5 sm:p-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white transition-all active:scale-95"
                            >
                              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                            </button>

                            {/* Scrub Bar */}
                            <div
                              className="flex-grow h-2 bg-white/20 hover:h-2.5 rounded-full overflow-hidden cursor-pointer relative transition-all"
                              onClick={handleSeek}
                            >
                              <div
                                className="h-full bg-gradient-to-r from-brand-accent to-brand-interactive rounded-full transition-all"
                                style={{ width: `${videoProgress}%` }}
                              />
                            </div>

                            {/* Time Display */}
                            <span className="text-[11px] sm:text-xs font-mono font-bold text-white/90 whitespace-nowrap">
                              {videoCurrentTime} / {videoDuration || '0:00'}
                            </span>

                            {/* Mute/Unmute */}
                            <button
                              type="button"
                              onClick={toggleMute}
                              className="p-1.5 sm:p-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white transition-all active:scale-95"
                            >
                              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                            </button>

                            {/* Fullscreen */}
                            <button
                              type="button"
                              onClick={toggleFullscreen}
                              className="p-1.5 sm:p-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white transition-all active:scale-95"
                            >
                              <Maximize className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : currentMedia?.url ? (
                      <div
                        onClick={() => setIsLightboxOpen(true)}
                        className="w-full h-full flex items-center justify-center cursor-zoom-in relative group/img"
                        title="Click to view full image"
                      >
                        <img
                          src={currentMedia.url}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-[1.02]"
                          alt={service.name}
                        />
                        {/* Hover Zoom Cue Badge */}
                        <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md text-white text-xs font-bold opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center space-x-1.5 shadow-lg border border-white/20 pointer-events-none">
                          <Maximize className="w-3.5 h-3.5 text-brand-interactive" />
                          <span>View Fullscreen</span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-brand-interactive p-6 text-center">
                        <span className="font-serif font-bold text-2xl text-white mb-2">{service.name}</span>
                        <span className="text-xs font-black text-brand-interactive">{service.category}</span>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Top-Right Standalone Glassmorphic Buttons (No outer wrapper box) */}
                <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 flex items-center space-x-2.5 sm:space-x-3">
                  {/* Standalone Like Button */}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleToggleLike(); }}
                    title={isLiked ? "Unlike service" : "Like service"}
                    className={`p-3 sm:p-3.5 backdrop-blur-xl rounded-2xl border transition-all duration-200 shadow-xl flex items-center space-x-2 active:scale-95 ${isLiked
                      ? 'bg-rose-950/60 border-rose-500/60 text-rose-400 shadow-rose-500/25'
                      : 'bg-black/45 hover:bg-black/65 border-white/25 hover:border-white/45 text-white hover:text-rose-400'
                      }`}
                  >
                    <Heart className={`w-5 h-5 sm:w-5.5 sm:h-5.5 ${isLiked ? 'fill-current text-rose-500' : ''}`} />
                    <span className="text-xs sm:text-sm font-black tracking-tight">{likesCount}</span>
                  </button>

                  {/* Standalone Favorite Button */}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleToggleFavorite(); }}
                    title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                    className={`p-3 sm:p-3.5 backdrop-blur-xl rounded-2xl border transition-all duration-200 shadow-xl flex items-center active:scale-95 ${isFavorite
                      ? 'bg-amber-950/60 border-amber-500/60 text-amber-400 shadow-amber-500/25'
                      : 'bg-black/45 hover:bg-black/65 border-white/25 hover:border-white/45 text-white hover:text-amber-400'
                      }`}
                  >
                    <Bookmark className={`w-5 h-5 sm:w-5.5 sm:h-5.5 ${isFavorite ? 'fill-current text-amber-500' : ''}`} />
                  </button>

                  {/* Standalone Share Button */}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleShare(); }}
                    title="Share service"
                    className="p-3 sm:p-3.5 bg-black/45 hover:bg-black/65 backdrop-blur-xl rounded-2xl border border-white/25 hover:border-white/45 text-white hover:text-brand-interactive transition-all duration-200 shadow-xl active:scale-95"
                  >
                    <Share2 className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
                  </button>
                </div>

                {/* Smooth Bottom Fade Gradient Mask - Blends portrait into page background without pushing content */}
                <div
                  className={`absolute inset-x-0 bottom-0 h-44 sm:h-52 bg-gradient-to-t pointer-events-none z-10 transition-colors duration-300 ${currentMedia?.type === 'video'
                      ? 'from-black/80 via-black/35 to-transparent'
                      : 'from-brand-background dark:from-[#0D0D0D] via-brand-background/85 dark:via-[#0D0D0D]/85 to-transparent'
                    }`}
                  aria-hidden="true"
                />

                {/* Animated Nudge Cue for Swipeable Gallery (Only on photo slides to avoid cluttering video playback) */}
                {gallery.length > 1 && currentMedia?.type !== 'video' && (
                  <div className="absolute bottom-28 sm:bottom-32 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="px-3.5 py-1.5 rounded-full bg-black/65 backdrop-blur-xl text-white text-[11px] font-bold border border-white/20 flex items-center space-x-2 shadow-xl"
                    >
                      <motion.div
                        animate={{ x: [-4, 4, -4] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                        className="flex items-center space-x-0.5 text-brand-accent"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <ChevronRight className="w-3.5 h-3.5" />
                      </motion.div>
                      <span>Swipe or click to view gallery</span>
                    </motion.div>
                  </div>
                )}

                {/* Glassmorphic Navigation Arrows */}
                {gallery.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); handlePrevSlide(); }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-3 backdrop-blur-xl bg-black/45 hover:bg-black/70 border border-white/25 text-white rounded-2xl transition-all shadow-xl hover:scale-105 active:scale-95 z-20"
                      aria-label="Previous slide"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleNextSlide(); }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 backdrop-blur-xl bg-black/45 hover:bg-black/70 border border-white/25 text-white rounded-2xl transition-all shadow-xl hover:scale-105 active:scale-95 z-20"
                      aria-label="Next slide"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
              </motion.div>

              {/* Hero Action Row: Thumbnail Strip on Left + Radiant Book Now Button on Right (Layered gracefully over faded portrait) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 -mt-24 sm:-mt-28 relative z-20 px-2 sm:px-4">
                {/* Thumbnail Strip */}
                {gallery.length > 1 ? (
                  <div className="flex space-x-3 overflow-x-auto pb-1 scrollbar-hide flex-1 min-w-0">
                    {gallery.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setCurrentMediaIndex(idx);
                          setIsPlaying(item.type === 'video');
                        }}
                        className={`relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 transition-all ${currentMediaIndex === idx
                          ? 'border-brand-interactive ring-2 ring-brand-interactive/40 shadow-lg'
                          : 'border-white/10 dark:border-white/5 opacity-70 hover:opacity-100'
                          }`}
                      >
                        {item.type === 'video' ? (
                          <div className="relative w-full h-full bg-black flex items-center justify-center text-white">
                            <Play className="w-6 h-6" />
                          </div>
                        ) : (
                          <img src={item.url} className="w-full h-full object-cover" alt="" />
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="hidden sm:flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-[#6C757D] dark:text-gray-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Instant Doorstep Appointment Available</span>
                  </div>
                )}

                {/* The Radiant Book Now Button - Right where circled by the user */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setIsBookingOpen(true)}
                  onMouseEnter={triggerShimmer}
                  className="relative overflow-hidden group shrink-0 py-4 sm:py-5 px-7 sm:px-10 rounded-[2.2rem] bg-gradient-to-r from-[#6C35A6] via-[#8238CA] to-[#32104D] text-white tracking-wide shadow-[0_16px_40px_rgba(108,53,166,0.5),inset_0_1px_1px_rgba(255,255,255,0.4)] hover:shadow-[0_20px_48px_rgba(108,53,166,0.65)] border border-white/35 active:outline-none transition-all flex items-center justify-between gap-6 sm:gap-9 cursor-pointer active:translate-y-0.5"
                >
                  {/* Dynamic Shimmer Light Sweep (triggers on scroll up/down and on hover) */}
                  <motion.span
                    animate={shimmerControls}
                    initial={{ x: '-100%' }}
                    className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none"
                  />
                  <div className="flex items-center gap-3.5">
                    <Calendar className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 text-white" />
                    <span className="font-black text-white text-base sm:text-lg">Book Appointment</span>
                  </div>
                  <span className="font-black text-white text-xl sm:text-2xl lg:text-[26px] tracking-tight leading-none">
                    ₦{service.price.toLocaleString()}
                  </span>
                </motion.button>
              </div>
            </div>

            <div className="mt-6 sm:mt-8 mb-12">
              {/* Category Kicker - Clean bold compact typography (No rounded box) */}
              {service.category && (
                <div className="mb-2">
                  <span className="text-xs sm:text-[13px] font-black uppercase tracking-[0.22em] text-brand-interactive dark:text-brand-accent">
                    {service.category}
                  </span>
                </div>
              )}

              {/* Title & Clean Quick Actions - Guaranteed single line on all screen sizes */}
              <div className="flex flex-row items-center justify-between gap-3 sm:gap-4 mb-3 w-full">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black tracking-tight text-[#1A1A1A] dark:text-white flex-1 min-w-0 line-clamp-1">
                  {service.name}
                </h1>

                {/* Clean Icons on the side with +23% touch padding and generous breathing space */}
                <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                  {/* Like Button */}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleToggleLike(); }}
                    title={isLiked ? "Unlike service" : "Like service"}
                    aria-label={isLiked ? "Unlike service" : "Like service"}
                    className="p-2 sm:p-2.5 flex items-center space-x-1.5 transition-transform duration-200 active:scale-90 cursor-pointer group/like focus:outline-none"
                  >
                    <Heart className={`w-5 h-5 transition-all duration-200 ${isLiked
                      ? 'fill-rose-500 text-rose-500 scale-110 drop-shadow-sm'
                      : 'text-[#6C757D] dark:text-[#9E9E9E] group-hover/like:text-rose-500 group-hover/like:scale-110'
                      }`} />
                    <span className={`text-sm font-black transition-colors ${isLiked ? 'text-rose-500' : 'text-[#6C757D] dark:text-[#9E9E9E] group-hover/like:text-rose-500'
                      }`}>
                      {likesCount}
                    </span>
                  </button>

                  {/* Bookmark Button */}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleToggleFavorite(); }}
                    title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                    aria-label={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                    className="p-2 sm:p-2.5 flex items-center justify-center transition-transform duration-200 active:scale-90 cursor-pointer group/fav focus:outline-none"
                  >
                    <Bookmark className={`w-5 h-5 transition-all duration-200 ${isFavorite
                      ? 'fill-amber-500 text-amber-500 scale-110 drop-shadow-sm'
                      : 'text-[#6C757D] dark:text-[#9E9E9E] group-hover/fav:text-amber-500 group-hover/fav:scale-110'
                      }`} />
                  </button>

                  {/* Share Button */}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleShare(); }}
                    title="Share service"
                    aria-label="Share service"
                    className="p-2 sm:p-2.5 flex items-center justify-center text-[#6C757D] dark:text-[#9E9E9E] hover:text-brand-interactive dark:hover:text-brand-accent transition-transform duration-200 active:scale-90 cursor-pointer group/share focus:outline-none"
                  >
                    <Share2 className="w-5 h-5 group-hover/share:scale-110 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Metadata Data Strip - Bold, compact, high-contrast typography without bounding boxes */}
              <div className="flex flex-wrap items-center gap-x-3.5 sm:gap-x-4 gap-y-2 mb-6 text-sm">
                {/* Rating */}
                <div className="flex items-center space-x-1.5">
                  <Star className={`w-4 h-4 shrink-0 ${service.rating > 0 ? 'text-amber-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`} />
                  <span className="font-black text-[#1A1A1A] dark:text-white tracking-tight">
                    {service.rating > 0 ? service.rating : 'New'}
                  </span>
                  <span className="text-xs font-semibold text-[#6C757D] dark:text-[#888]">
                    ({reviews.length} reviews)
                  </span>
                </div>

                {/* Divider */}
                {service.durationMins > 0 && (
                  <span className="text-gray-300 dark:text-[#333] font-black select-none text-xs">•</span>
                )}

                {/* Duration */}
                {service.durationMins > 0 && (
                  <div className="flex items-center space-x-1.5">
                    <Clock className="w-4 h-4 text-brand-interactive dark:text-brand-accent shrink-0" />
                    <span className="font-black tracking-tight text-[#1A1A1A] dark:text-white">
                      ~{service.durationMins} mins
                    </span>
                  </div>
                )}

                {/* Divider */}
                {service.agentLocation && (
                  <span className="text-gray-300 dark:text-[#333] font-black select-none text-xs">•</span>
                )}

                {/* State / Location */}
                {service.agentLocation && (
                  <div className="flex items-center space-x-1.5">
                    <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                    <span className="font-black tracking-tight text-[#1A1A1A] dark:text-white">
                      {service.agentLocation}
                    </span>
                  </div>
                )}
              </div>

              {/* Description - Larger typography with expandable Read More */}
              {service.description && (
                <div className="mb-8">
                  <div className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-interactive dark:text-brand-accent mb-2.5 flex items-center gap-2">
                    <span>Description</span>
                  </div>
                  <div className="rounded-2xl sm:rounded-3xl p-5 sm:p-6 bg-white/70 dark:bg-white/[0.05] backdrop-blur-xl border border-white/60 dark:border-white/10 border-l-4 !border-l-brand-interactive shadow-sm">
                    <p className={`text-base sm:text-lg lg:text-[19px] leading-relaxed text-[#2A2A2A] dark:text-[#E2DCE8] ${isDescExpanded ? '' : 'line-clamp-3 sm:line-clamp-4'}`}>
                      {service.description}
                    </p>
                    {service.description.length > 150 && (
                      <button
                        type="button"
                        onClick={() => setIsDescExpanded(!isDescExpanded)}
                        className="mt-3 text-xs sm:text-sm font-black text-brand-interactive dark:text-brand-accent hover:underline cursor-pointer flex items-center gap-1 active:scale-95 transition-transform"
                      >
                        <span>{isDescExpanded ? 'Show less' : 'Read more'}</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Features / What's Included */}
              {service.features && service.features.length > 0 && (
                <div className="mb-10">
                  <div className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-interactive dark:text-brand-accent mb-3">
                    What's Included
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {service.features.map((item, i) => (
                      <div
                        key={i}
                        className="p-3.5 rounded-2xl flex items-center space-x-3 bg-white/70 dark:bg-white/[0.05] backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-sm transition-transform hover:-translate-y-0.5"
                      >
                        <div className="w-6 h-6 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0 shadow-inner">
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        </div>
                        <span className="text-xs sm:text-sm font-semibold text-[#1A1A1A] dark:text-white">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews Section */}
              <section className="relative">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl sm:text-2xl font-serif font-black text-[#1B1420] dark:text-white">
                      Client Reviews
                    </h3>
                    <span className="glass-pill px-3 py-1 text-xs font-black text-brand-interactive dark:text-brand-accent">
                      {reviews.length}
                    </span>
                  </div>

                  {/* Clean Glass CTA Button */}
                  <button
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="glass-btn px-4 py-2 rounded-xl text-sm font-bold text-brand-interactive dark:text-brand-accent flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{showReviewForm ? 'Cancel Review' : 'Write a review'}</span>
                  </button>
                </div>

                {reviewError && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-500 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>{reviewError}</span>
                  </div>
                )}

                {/* Review Form - Exact Glassmorphic Spec */}
                <AnimatePresence>
                  {showReviewForm && (
                    <motion.form
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      onSubmit={handleReviewSubmit}
                      className="glass-panel mb-8 p-6 sm:p-7 space-y-5 relative z-10 overflow-hidden"
                    >
                      {/* Rating Row with Stars Tray */}
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <span className="text-base font-bold tracking-tight text-[#1B1420] dark:text-[#FDFBFF]">
                          Your Rating:
                        </span>
                        <div className="glass-pill px-3 py-1.5 flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setNewRating(star)}
                              className="w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 hover:scale-115 active:scale-95 cursor-pointer hover:bg-black/5 dark:hover:bg-white/10"
                              aria-label={`Rate ${star} stars`}
                            >
                              <Star className={`w-5 h-5 transition-all duration-200 ${star <= newRating
                                ? 'text-amber-400 fill-amber-400 drop-shadow-sm'
                                : 'text-gray-300 dark:text-gray-600 hover:text-amber-300'
                                }`} />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Frosted Glass Textarea */}
                      <div>
                        <textarea
                          required
                          placeholder="Share your genuine experience with this service..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="glass-input w-full p-4 sm:p-5 rounded-2xl text-base leading-relaxed text-[#1B1420] dark:text-[#FDFBFF] placeholder-[#6C757D] dark:placeholder-[#A0A0A0] outline-none transition-all h-28 resize-none"
                        />
                      </div>

                      {/* Submit Button */}
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={submittingReview}
                          className="px-6 py-3.5 min-h-[44px] rounded-2xl bg-brand-interactive hover:bg-brand-primary text-white font-bold text-base flex items-center space-x-2.5 shadow-md shadow-brand-interactive/20 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                        >
                          <Send className="w-4 h-4" />
                          <span>{submittingReview ? 'Submitting...' : 'Post Review'}</span>
                        </button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>

                <div className="space-y-4 sm:space-y-5">
                  {reviews.length > 0 ? (
                    reviews.map(review => (
                      <div key={review.id} className="glass-panel p-6 sm:p-7">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center space-x-3.5">
                            <div className="w-11 h-11 rounded-xl bg-brand-interactive/10 flex items-center justify-center text-brand-interactive font-bold overflow-hidden shadow-sm border border-brand-interactive/20">
                              {review.userAvatar ? (
                                <img src={review.userAvatar} className="w-full h-full object-cover" alt="" />
                              ) : (
                                <User className="w-5 h-5" />
                              )}
                            </div>
                            <div>
                              <div className="text-base font-bold text-[#1B1420] dark:text-[#FDFBFF]">{review.userName}</div>
                              <div className="text-xs font-medium text-[#6C757D] dark:text-[#A0A0A0] flex items-center mt-0.5">
                                <Calendar className="w-3.5 h-3.5 mr-1" /> {review.date}
                              </div>
                            </div>
                          </div>
                          <div className="flex text-amber-400">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-300 dark:text-gray-700'}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-base text-[#2E2436] dark:text-[#E2DCE8] leading-relaxed pl-1 font-medium">"{review.text}"</p>
                      </div>
                    ))
                  ) : (
                    <div className="glass-panel p-8 text-center text-[#6C757D] dark:text-[#A0A0A0]">
                      <p className="text-base font-medium">No client reviews yet. Be the first to book and share your feedback!</p>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>

          {/* Sidebar Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-5">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-5 sm:p-6 bg-brand-background dark:bg-[#1A1A1A] rounded-3xl border border-[#E9ECEF] dark:border-[#2D2D2D] shadow-lg"
              >
                <div className="mb-4">
                  <div className="text-[#6C757D] text-xs font-bold uppercase tracking-wider mb-1">Service Price</div>
                  <div className="text-3xl sm:text-4xl lg:text-[44px] font-serif font-black text-[#111111] dark:text-white tracking-tight">₦{service.price.toLocaleString()}</div>
                </div>

                <div className="space-y-2.5 mb-5">
                  <div className="flex items-center text-xs sm:text-sm p-2.5 rounded-xl bg-brand-surface dark:bg-[#222222]">
                    <Check className="w-3.5 h-3.5 text-brand-interactive mr-2.5 shrink-0" />
                    <span className="text-[#1A1A1A] dark:text-white">Expert consultation included</span>
                  </div>
                  <div className="flex items-center text-xs sm:text-sm p-2.5 rounded-xl bg-brand-surface dark:bg-[#222222]">
                    <Check className="w-3.5 h-3.5 text-brand-interactive mr-2.5 shrink-0" />
                    <span className="text-[#1A1A1A] dark:text-white">Direct on-demand scheduling</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsBookingOpen(true)}
                  className="w-full py-3.5 px-4 bg-brand-interactive text-white rounded-xl font-bold text-sm sm:text-base hover:bg-brand-interactive/90 transition-all shadow-md shadow-brand-interactive/20 active:scale-[0.98] flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book Appointment</span>
                </button>
              </motion.div>

              {service.agentId && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                  className="p-5 bg-brand-interactive/5 dark:bg-brand-interactive/10 rounded-3xl border border-brand-interactive/15"
                >
                  <div className="flex items-center mb-4">
                    {service.agentImage ? (
                      <div className="p-[2px] rounded-full bg-gradient-to-tr from-[#32104D] via-[#6C35A6] to-[#F43F5E] shadow-sm mr-3.5 shrink-0">
                        <img src={service.agentImage} className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-[#1A1A1A]" alt="" />
                      </div>
                    ) : (
                      <div className="p-[2px] rounded-full bg-gradient-to-tr from-[#32104D] via-[#6C35A6] to-[#F43F5E] shadow-sm mr-3.5 shrink-0">
                        <div className="w-12 h-12 rounded-full bg-brand-surface dark:bg-[#1A1A1A] text-brand-interactive flex items-center justify-center font-bold border-2 border-white dark:border-[#1A1A1A]">
                          <User className="w-6 h-6" />
                        </div>
                      </div>
                    )}
                    <div>
                      <div className="text-xs sm:text-[13px] font-black uppercase tracking-[0.16em] text-brand-interactive dark:text-brand-accent mb-0.5">Service by</div>
                      <div className="text-base sm:text-lg font-serif font-black text-[#1A1A1A] dark:text-white leading-snug">{service.agentName}</div>
                      <div className="text-xs font-bold text-[#6C757D] dark:text-[#A0A0A0]">{service.agentSpecialty}</div>
                    </div>
                  </div>
                  <Link to={`/agent/${service.agentId}`} className="flex items-center text-xs font-bold text-brand-interactive group">
                    View Full Artist Profile <ArrowRight className="ml-1.5 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox Image / Gallery Modal */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex flex-col justify-between p-4 sm:p-6"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Top Bar with Counter and Close Button */}
            <div className="flex items-center justify-between z-20">
              <div className="px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white text-xs font-mono font-bold border border-white/15">
                {currentMediaIndex + 1} / {gallery.length || 1}
              </div>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-xl transition-all active:scale-95 shadow-xl"
                aria-label="Close fullscreen"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Center Content with Full Image / Video & Drag Swipe */}
            <div className="flex-1 flex items-center justify-center p-2 relative overflow-hidden">
              <motion.div
                key={`lightbox-${currentMediaIndex}`}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.25}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -40 || info.velocity.x < -300) {
                    handleNextSlide();
                  } else if (info.offset.x > 40 || info.velocity.x > 300) {
                    handlePrevSlide();
                  }
                }}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className="max-w-full max-h-[82vh] flex items-center justify-center cursor-grab active:cursor-grabbing"
              >
                {currentMedia?.type === 'video' ? (
                  <video
                    src={currentMedia.url}
                    className="max-w-full max-h-[76vh] object-contain rounded-2xl shadow-2xl"
                    controls
                    autoPlay
                  />
                ) : (
                  <img
                    src={currentMedia?.url || ''}
                    className="max-w-full max-h-[78vh] object-contain rounded-2xl shadow-2xl select-none"
                    alt={service.name}
                  />
                )}
              </motion.div>

              {/* Lightbox Navigation Chevrons */}
              {gallery.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handlePrevSlide(); }}
                    className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-2xl bg-white/10 hover:bg-white/25 border border-white/20 text-white backdrop-blur-xl transition-all shadow-2xl active:scale-95 z-20"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleNextSlide(); }}
                    className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-2xl bg-white/10 hover:bg-white/25 border border-white/20 text-white backdrop-blur-xl transition-all shadow-2xl active:scale-95 z-20"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
                  </button>
                </>
              )}
            </div>

            {/* Bottom Gallery Thumbnail Strip */}
            {gallery.length > 1 && (
              <div className="flex justify-center items-center space-x-2.5 overflow-x-auto py-2 z-20">
                {gallery.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentMediaIndex(idx)}
                    className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${currentMediaIndex === idx
                      ? 'border-brand-interactive ring-2 ring-brand-interactive/50 scale-105'
                      : 'border-white/20 opacity-60 hover:opacity-100'
                      }`}
                  >
                    <img src={item.url} className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <BookingModal
        service={service}
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />
    </div>
  );
};

export default ServiceDetail;
