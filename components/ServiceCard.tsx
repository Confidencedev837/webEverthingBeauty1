import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Star, ChevronRight, ChevronLeft, Play, Video as VideoIcon, User, Heart, Bookmark, Layers, Clock, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Service } from '../types';
import { 
  isVideoUrl, 
  setServiceLike, 
  setServiceFavorite, 
  getLikedServiceIds, 
  getFavoriteServiceIds, 
  getServiceLikeCount 
} from '../services/supabaseService';
import { useAuth } from '../context/AuthContext';
import { useSnackbar } from './Snackbar';

interface ServiceCardProps {
  service: Service;
  index: number;
  onBook?: (service: Service) => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, index, onBook }) => {
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();
  const [videoError, setVideoError] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [isLiked, setIsLiked] = useState(Boolean(service.isLiked));
  const [isFavorite, setIsFavorite] = useState(Boolean(service.isFavorite));
  const [likesCount, setLikesCount] = useState<number>(service.likesCount ?? 0);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const targetUserId = user?.id || 'guest_user';
    getServiceLikeCount(service.id).then(setLikesCount);
    getLikedServiceIds(targetUserId).then((ids) => setIsLiked(ids.includes(service.id)));
    getFavoriteServiceIds(targetUserId).then((ids) => setIsFavorite(ids.includes(service.id)));

    const onLikesUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<{ serviceId: string; like: boolean }>;
      if (customEvent.detail?.serviceId === service.id) {
        setIsLiked(customEvent.detail.like);
        getServiceLikeCount(service.id).then(setLikesCount);
      }
    };
    const onFavsUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<{ serviceId: string; favorite: boolean }>;
      if (customEvent.detail?.serviceId === service.id) {
        setIsFavorite(customEvent.detail.favorite);
      }
    };

    window.addEventListener('eb:likes-updated', onLikesUpdated);
    window.addEventListener('eb:favorites-updated', onFavsUpdated);
    return () => {
      window.removeEventListener('eb:likes-updated', onLikesUpdated);
      window.removeEventListener('eb:favorites-updated', onFavsUpdated);
    };
  }, [service.id, user]);

  const handleToggleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const targetUserId = user?.id || 'guest_user';
    const nextState = !isLiked;
    setIsLiked(nextState);
    setLikesCount((prev) => Math.max(0, prev + (nextState ? 1 : -1)));

    const res = await setServiceLike(targetUserId, service.id, nextState);
    if (!res.success) {
      setIsLiked(!nextState);
      setLikesCount((prev) => Math.max(0, prev + (nextState ? -1 : 1)));
      showSnackbar(res.error || 'Could not update like', 'error');
      return;
    }
    showSnackbar(nextState ? `Liked "${service.name}"!` : `Removed like from "${service.name}".`, 'success');
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const targetUserId = user?.id || 'guest_user';
    const nextState = !isFavorite;
    setIsFavorite(nextState);

    const res = await setServiceFavorite(targetUserId, service.id, nextState);
    if (!res.success) {
      setIsFavorite(!nextState);
      showSnackbar(res.error || 'Could not update favorites', 'error');
      return;
    }
    showSnackbar(
      nextState ? `Saved "${service.name}" to Favorites!` : `Removed "${service.name}" from favorites.`,
      'success'
    );
  };

  // Collect all video media items for this service
  const videoList = useMemo(() => {
    const list: { url: string; thumbnail?: string }[] = [];
    if (service.image && isVideoUrl(service.image)) {
      list.push({ url: service.image });
    }
    if (service.gallery && service.gallery.length > 0) {
      service.gallery.forEach((item) => {
        if ((item.type === 'video' || isVideoUrl(item.url)) && !list.some((v) => v.url === item.url)) {
          list.push({ url: item.url, thumbnail: item.thumbnail });
        }
      });
    }
    return list;
  }, [service.image, service.gallery]);

  const [currentVideoIdx, setCurrentVideoIdx] = useState(0);
  const hasMultipleVideos = videoList.length > 1;
  const currentVideo = videoList[currentVideoIdx] || videoList[0];
  const hasVideo = videoList.length > 0;
  const videoSrc = currentVideo?.url || null;

  // Determine image display
  const primaryImage =
    service.image && !isVideoUrl(service.image)
      ? service.image
      : currentVideo?.thumbnail || videoList[0]?.thumbnail || '';

  // Auto-play video when scrolled past/into the viewport
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const card = cardRef.current;
    const video = videoRef.current;
    if (!card || !video || !hasVideo) return;

    let isMounted = true;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!isMounted) return;
          if (entry.isIntersecting) {
            // Card is scrolled into view -> auto-play muted video smoothly
            video
              .play()
              .then(() => {
                if (isMounted) setIsPlaying(true);
              })
              .catch(() => {
                // Autoplay policy prevented playback until user interaction
              });
          } else {
            // Card scrolled past or out of view -> pause video to save CPU/battery
            video.pause();
            if (isMounted) setIsPlaying(false);
          }
        });
      },
      {
        threshold: 0.35,
      }
    );

    observer.observe(card);

    return () => {
      isMounted = false;
      observer.disconnect();
    };
  }, [hasVideo, videoSrc]);

  // Ensure playback continues when cycling between multiple videos if in view
  useEffect(() => {
    if (videoRef.current && isPlaying) {
      videoRef.current.play().catch(() => {});
    }
  }, [currentVideoIdx, isPlaying]);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      viewport={{ once: true }}
      className="group relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/40 dark:border-white/10 hover:border-brand-interactive/50 dark:hover:border-brand-interactive/50 transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.45)] hover:shadow-[0_16px_40px_rgba(108,53,166,0.22)] hover:-translate-y-1.5 flex flex-col h-full transform-gpu mb-4 sm:mb-6 md:mb-8 bg-gray-950"
    >
      {/* 1. MEDIA CONTAINER (Underlying Layer extending behind the card) */}
      <div className="relative aspect-[4/3] overflow-hidden block bg-gray-950">
        <Link to={`/services/${service.id}`} className="absolute inset-0 block">
          {hasVideo && videoSrc && !videoError ? (
            <div className="relative w-full h-full">
              <video
                ref={videoRef}
                src={videoSrc}
                poster={primaryImage || undefined}
                preload="metadata"
                muted
                loop={!hasMultipleVideos}
                playsInline
                onEnded={() => {
                  if (hasMultipleVideos) {
                    setCurrentVideoIdx((prev) => (prev + 1) % videoList.length);
                  }
                }}
                onError={() => setVideoError(true)}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />

              {/* Multiple Video Story-Style Progress Bars */}
              {hasMultipleVideos && (
                <div className="absolute top-2.5 right-14 flex items-center space-x-1 z-20">
                  {videoList.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setCurrentVideoIdx(i);
                      }}
                      className={`h-1 rounded-full transition-all duration-300 ${
                        i === currentVideoIdx
                          ? 'w-4 bg-brand-interactive shadow-md'
                          : 'w-1.5 bg-white/60 hover:bg-white'
                      }`}
                      aria-label={`View video clip ${i + 1}`}
                      title={`Video clip ${i + 1} of ${videoList.length}`}
                    />
                  ))}
                </div>
              )}

              {/* Carousel navigation arrows for multiple videos on hover */}
              {hasMultipleVideos && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCurrentVideoIdx((prev) => (prev > 0 ? prev - 1 : videoList.length - 1));
                    }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-black/60 hover:bg-black/85 backdrop-blur-md text-white border border-white/20 opacity-0 group-hover:opacity-100 transition-all z-20 shadow-md active:scale-95 cursor-pointer"
                    aria-label="Previous video"
                    title="Previous video"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCurrentVideoIdx((prev) => (prev < videoList.length - 1 ? prev + 1 : 0));
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-black/60 hover:bg-black/85 backdrop-blur-md text-white border border-white/20 opacity-0 group-hover:opacity-100 transition-all z-20 shadow-md active:scale-95 cursor-pointer"
                    aria-label="Next video"
                    title="Next video"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          ) : primaryImage && !imgError ? (
            <img 
              src={primaryImage} 
              loading="lazy"
              decoding="async"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              alt={service.name} 
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-brand-interactive/20 via-black to-black text-brand-interactive p-4 text-center">
              <span className="font-serif font-bold text-sm text-white mb-0.5">{service.name}</span>
              <span className="text-[10px] font-black text-brand-interactive/80">{service.category}</span>
            </div>
          )}
        </Link>

        {/* Rating Chip - Floating Top Left */}
        <div className="absolute top-3 left-3 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md text-white flex items-center space-x-1.5 shadow-lg border border-white/15 pointer-events-none z-10">
          <Star className={`w-5 h-5 ${(service?.rating ?? 0) > 0 ? 'text-amber-400 fill-amber-400' : 'text-white/60'}`} />
          <span className="text-sm font-black tracking-tight text-white">
            {(service?.rating ?? 0) > 0 ? service.rating : 'New'}
          </span>
          {(service?.reviewCount ?? 0) > 0 && (
            <span className="text-xs font-semibold text-white/80">({service.reviewCount})</span>
          )}
        </div>

        {/* Quick Actions (Like & Favorite) - Floating Top Right */}
        <div className="absolute top-3 right-3 flex items-center space-x-2 z-20">
          <button
            type="button"
            onClick={handleToggleLike}
            title={isLiked ? "Unlike service" : "Like service"}
            aria-label={isLiked ? "Unlike service" : "Like service"}
            className="p-2.5 rounded-full bg-black/65 hover:bg-black/85 backdrop-blur-md text-white border border-white/20 transition-transform active:scale-90 cursor-pointer shadow-md"
          >
            <Heart className={`w-6 h-6 transition-colors ${
              isLiked ? 'fill-rose-500 text-rose-500' : 'text-white'
            }`} />
          </button>
          <button
            type="button"
            onClick={handleToggleFavorite}
            title={isFavorite ? "Remove from Favorites" : "Save to Favorites"}
            aria-label={isFavorite ? "Remove from Favorites" : "Save to Favorites"}
            className="p-2.5 rounded-full bg-black/65 hover:bg-black/85 backdrop-blur-md text-white border border-white/20 transition-transform active:scale-90 cursor-pointer shadow-md"
          >
            <Bookmark className={`w-6 h-6 transition-colors ${
              isFavorite ? 'fill-amber-500 text-amber-500' : 'text-white'
            }`} />
          </button>
        </div>

      </div>
      
      {/* 2. GLASSMORPHIC BOTTOM HALF - Frosted glass layer with underlying media blurred behind it */}
      <div className="relative -mt-6 sm:-mt-8 z-10 bg-white/50 dark:bg-[#121212]/55 backdrop-blur-2xl rounded-t-3xl border-t border-white/60 dark:border-white/10 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.35)] p-5 sm:p-6 flex flex-col flex-grow justify-between gap-5">
        <div className="space-y-3.5">
          {/* Category & Specialist Info */}
          <div className="flex items-center justify-between gap-2.5 pb-1 min-w-0">
            {service.category && (
              <span className="text-[11px] sm:text-xs font-black uppercase tracking-[0.2em] text-brand-interactive dark:text-brand-accent truncate shrink-0 max-w-[38%]">
                {service.category}
              </span>
            )}

            {/* Specialist Profile Pic & Name (with long-name limit & avatar overflow safeguard) */}
            {(() => {
              const agentName = service?.agentName || 'Specialist';
              const isLongName = agentName.length > 14;

              return (
                <Link 
                  to={`/agent/${service?.agentId || ''}`}
                  className="flex items-center space-x-2.5 min-w-0 shrink max-w-[62%] justify-end group/agent"
                  title={agentName}
                >
                  {/* If the name is too long, show ONLY the name so it doesn't push the profile pic too far */}
                  {!isLongName && (
                    service?.agentImage ? (
                      <img 
                        src={service.agentImage} 
                        className="w-[44px] h-[44px] sm:w-[48px] sm:h-[48px] rounded-full object-cover border-2 border-white dark:border-[#2D2D2D] shadow-sm shrink-0 group-hover/agent:scale-105 transition-transform" 
                        alt={agentName} 
                      />
                    ) : (
                      <div className="w-[44px] h-[44px] sm:w-[48px] sm:h-[48px] rounded-full bg-brand-surface dark:bg-[#252525] text-brand-interactive flex items-center justify-center font-bold border border-brand-interactive/20 shrink-0">
                        <User className="w-5 h-5" />
                      </div>
                    )
                  )}
                  <span className="text-[15px] sm:text-[17.5px] font-bold text-[#1A1A1A] dark:text-white truncate group-hover/agent:text-brand-interactive transition-colors">
                    {agentName}
                  </span>
                </Link>
              );
            })()}
          </div>

          {/* Title */}
          <Link to={`/services/${service.id}`} className="block">
            <h3 className="text-[24px] sm:text-[27.5px] md:text-[30.5px] font-serif font-bold group-hover:text-brand-interactive transition-colors line-clamp-1 tracking-tight leading-snug text-[#1A1A1A] dark:text-white">
              {service.name}
            </h3>
          </Link>

          {/* Description snippet with LinkedIn-style inline "...read more" expansion */}
          {service.description && (
            <div className="text-[17px] sm:text-[18.5px] text-[#6C757D] dark:text-[#A0A0A0] leading-relaxed font-normal">
              {isExpanded || service.description.length <= 75 ? (
                <span>{service.description}</span>
              ) : (
                <span>
                  {service.description.slice(0, 75)}...{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsExpanded(true);
                    }}
                    className="font-bold text-brand-interactive hover:underline cursor-pointer inline focus:outline-none"
                  >
                    ...read more
                  </button>
                </span>
              )}
              {isExpanded && service.description.length > 75 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsExpanded(false);
                  }}
                  className="ml-1 text-xs font-bold text-brand-interactive hover:underline cursor-pointer inline focus:outline-none"
                >
                  (show less)
                </button>
              )}
            </div>
          )}

          {/* Price & Duration */}
          <div className="flex items-baseline justify-between gap-3 pt-2">
            <div className="text-[20.3px] sm:text-[22.6px] md:text-[27px] font-black text-[#111111] dark:text-white tracking-tight">
              ₦{(service?.price ?? 0).toLocaleString()}
            </div>
            <div className="flex items-center space-x-1.5 text-xs sm:text-sm font-bold text-amber-500 dark:text-amber-400">
              <Clock className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
              <span>{service.durationMins || 45} mins</span>
            </div>
          </div>
        </div>

        {/* 3. BOOK NOW BUTTON */}
        <div className="pt-4 border-t border-[#E9ECEF]/70 dark:border-[#262626]">
          {onBook ? (
            <button 
              type="button"
              onClick={() => onBook(service)}
              className="w-full py-3.5 sm:py-4 px-8 bg-gradient-to-r from-[#6C35A6] to-[#7B3DB8] text-white rounded-2xl sm:rounded-full font-black text-xs sm:text-sm flex items-center justify-center space-x-2.5 shadow-[0_6px_22px_rgba(108,53,166,0.38)] hover:shadow-[0_8px_26px_rgba(108,53,166,0.5)] border-t border-white/20 transition-all active:scale-[0.98] cursor-pointer"
            >
              <Calendar className="w-4 h-4 shrink-0" />
              <span>Book Now</span>
            </button>
          ) : (
            <Link 
              to={`/services/${service.id}?book=true`}
              className="w-full py-3.5 sm:py-4 px-8 bg-gradient-to-r from-[#6C35A6] to-[#7B3DB8] text-white rounded-2xl sm:rounded-full font-black text-xs sm:text-sm flex items-center justify-center space-x-2.5 shadow-[0_6px_22px_rgba(108,53,166,0.38)] hover:shadow-[0_8px_26px_rgba(108,53,166,0.5)] border-t border-white/20 transition-all active:scale-[0.98] text-center"
            >
              <Calendar className="w-4 h-4 shrink-0" />
              <span>Book Now</span>
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ServiceCard;
