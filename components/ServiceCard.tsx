import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Star, ChevronRight, ChevronLeft, Play, Video as VideoIcon, User, Heart, Bookmark, Layers } from 'lucide-react';
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
      className="group bg-brand-background dark:bg-[#1A1A1A] rounded-3xl overflow-hidden border border-[#E9ECEF] dark:border-[#2D2D2D] hover:border-brand-interactive transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-2 flex flex-col h-full transform-gpu"
    >
      <Link to={`/services/${service.id}`} className="relative h-56 app-service-img-h overflow-hidden block bg-gray-950">
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
              <div className="absolute top-3 right-3 flex items-center space-x-1.5 z-20">
                {videoList.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCurrentVideoIdx(i);
                    }}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === currentVideoIdx
                        ? 'w-5 bg-brand-interactive shadow-md'
                        : 'w-2 bg-white/60 hover:bg-white'
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
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 hover:bg-black/85 backdrop-blur-md text-white border border-white/20 opacity-0 group-hover:opacity-100 transition-all z-20 shadow-md active:scale-95 cursor-pointer"
                  aria-label="Previous video"
                  title="Previous video"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentVideoIdx((prev) => (prev < videoList.length - 1 ? prev + 1 : 0));
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 hover:bg-black/85 backdrop-blur-md text-white border border-white/20 opacity-0 group-hover:opacity-100 transition-all z-20 shadow-md active:scale-95 cursor-pointer"
                  aria-label="Next video"
                  title="Next video"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Video Indicator Badge - Shows multiple count or single badge */}
            <div className="absolute bottom-3 right-3 z-10">
              {hasMultipleVideos ? (
                <div className="px-2.5 py-1 bg-black/75 backdrop-blur-md rounded-xl text-white text-[11px] font-black flex items-center space-x-1.5 shadow-lg border border-white/20">
                  <Layers className="w-3.5 h-3.5 text-brand-interactive" />
                  <span>{currentVideoIdx + 1}/{videoList.length} Videos</span>
                </div>
              ) : (
                <div className="px-2.5 py-1 bg-black/70 backdrop-blur-md rounded-lg text-white text-[10px] font-black flex items-center space-x-1.5 shadow-md border border-white/10">
                  <VideoIcon className="w-3 h-3 text-brand-interactive animate-pulse" />
                  <span>Video</span>
                </div>
              )}
            </div>
          </div>
        ) : primaryImage && !imgError ? (
          <img 
            src={primaryImage} 
            loading="lazy"
            decoding="async"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
            alt={service.name} 
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-brand-interactive/20 via-black to-black text-brand-interactive p-6 text-center">
            <span className="font-serif font-bold text-lg text-white mb-1">{service.name}</span>
            <span className="text-[10px] font-black text-brand-interactive/80">{service.category}</span>
          </div>
        )}

        {/* Rating Overlay on Image - Luxury Faceted Gem Shape (Zero rounded box) */}
        <div className="absolute top-3.5 left-3.5 px-3 py-1.5 facet-gem-tag text-white flex items-center space-x-1.5 shadow-lg">
          <Star className={`w-4 h-4 ${(service?.rating ?? 0) > 0 ? 'text-amber-400 fill-amber-400' : 'text-white/60'}`} />
          <span className="text-xs font-black tracking-tight text-white">
            {(service?.rating ?? 0) > 0 ? service.rating : 'New'}
          </span>
          {(service?.reviewCount ?? 0) > 0 && (
            <span className="text-[11px] font-semibold text-white/80">({service.reviewCount})</span>
          )}
        </div>
      </Link>
      
      <div className="p-6 sm:p-7 app-card-inner-pad flex flex-col flex-grow">
        {/* Category Kicker - Spaced out, clean uppercase typography (No rounded box) */}
        {service.category && (
          <div className="mb-2.5">
            <span className="text-xs sm:text-sm font-black uppercase tracking-[0.22em] text-brand-interactive dark:text-brand-accent">
              {service.category}
            </span>
          </div>
        )}

        {/* Title & Quick Actions (Like & Favorite) - Clean icons without wrapping boxes */}
        <div className="flex items-start justify-between gap-4 mb-3.5">
          <Link to={`/services/${service.id}`} className="flex-1 min-w-0 pr-1">
            <h3 className="text-2xl sm:text-[30px] md:text-[34px] font-serif font-black group-hover:text-brand-interactive transition-colors line-clamp-1 app-card-title tracking-tight leading-snug">
              {service.name}
            </h3>
          </Link>

          {/* Quick Actions - Clean icons with generous breathing space, no bounding boxes */}
          <div className="flex items-center gap-3.5 sm:gap-4 shrink-0 pt-1">
            {/* Like Button */}
            <button
              type="button"
              onClick={handleToggleLike}
              title={isLiked ? "Unlike service" : "Like service"}
              aria-label={isLiked ? "Unlike service" : "Like service"}
              className="p-2 sm:p-2.5 flex items-center space-x-1.5 transition-transform duration-200 active:scale-90 cursor-pointer group/like focus:outline-none"
            >
              <Heart className={`w-5 h-5 sm:w-6 sm:h-6 transition-all duration-200 ${
                isLiked 
                  ? 'fill-rose-500 text-rose-500 scale-110 drop-shadow-sm' 
                  : 'text-[#6C757D] dark:text-[#9E9E9E] group-hover/like:text-rose-500 group-hover/like:scale-110'
              }`} />
              <span className={`text-base font-black transition-colors ${
                isLiked ? 'text-rose-500' : 'text-[#6C757D] dark:text-[#9E9E9E] group-hover/like:text-rose-500'
              }`}>
                {likesCount}
              </span>
            </button>

            {/* Favorite Button */}
            <button
              type="button"
              onClick={handleToggleFavorite}
              title={isFavorite ? "Remove from Favorites" : "Save to Favorites"}
              aria-label={isFavorite ? "Remove from Favorites" : "Save to Favorites"}
              className="p-2 sm:p-2.5 flex items-center justify-center transition-transform duration-200 active:scale-90 cursor-pointer group/fav focus:outline-none"
            >
              <Bookmark className={`w-5 h-5 sm:w-6 sm:h-6 transition-all duration-200 ${
                isFavorite 
                  ? 'fill-amber-500 text-amber-500 scale-110 drop-shadow-sm' 
                  : 'text-[#6C757D] dark:text-[#9E9E9E] group-hover/fav:text-amber-500 group-hover/fav:scale-110'
              }`} />
            </button>
          </div>
        </div>

        {/* Description - Much Larger typography with expandable Read More */}
        <div className="mb-6">
          <p className={`text-lg sm:text-[21px] md:text-[22px] text-[#2C2C2C] dark:text-[#E0E0E0] leading-relaxed font-medium app-card-desc ${isExpanded ? '' : 'line-clamp-2'}`}>
            {service.description || 'Professional on-demand beauty treatment.'}
          </p>
          {(service.description?.length ?? 0) > 75 && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="mt-2 text-sm sm:text-base font-black text-brand-interactive dark:text-brand-accent hover:underline cursor-pointer flex items-center gap-1 active:scale-95 transition-transform"
            >
              <span>{isExpanded ? 'Show less' : 'Read more'}</span>
            </button>
          )}
        </div>
        
        {/* Price & Duration Row - Especially Larger Price */}
        <div className="flex items-center justify-between mt-auto mb-6">
          <div className="flex items-center space-x-1.5 text-base sm:text-lg font-bold text-[#6C757D] dark:text-[#B0B0B0]">
            {service.durationMins ? (
              <span>~{service.durationMins} mins</span>
            ) : service.agentLocation ? (
              <span>{service.agentLocation}</span>
            ) : (
              <span>Verified Specialist</span>
            )}
          </div>
          <div className="text-3xl sm:text-[38px] md:text-[42px] font-black text-[#111111] dark:text-white tracking-tight app-card-price">
            ₦{(service?.price ?? 0).toLocaleString()}
          </div>
        </div>

        <Link 
          to={`/agent/${service?.agentId || ''}`}
          className="flex items-center p-3 rounded-2xl bg-brand-surface dark:bg-[#252525] border border-transparent hover:border-brand-interactive/20 transition-all group/agent"
        >
          {service?.agentImage ? (
            <div className="p-[2px] rounded-full bg-gradient-to-tr from-[#32104D] via-[#6C35A6] to-[#F43F5E] shadow-sm mr-3 shrink-0">
              <img src={service.agentImage} className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-[#1A1A1A]" alt={service.agentName || ''} />
            </div>
          ) : (
            <div className="p-[2px] rounded-full bg-gradient-to-tr from-[#32104D] via-[#6C35A6] to-[#F43F5E] shadow-sm mr-3 shrink-0">
              <div className="w-10 h-10 rounded-full bg-brand-surface dark:bg-[#252525] text-brand-interactive flex items-center justify-center font-bold text-xs border border-brand-interactive/20">
                <User className="w-4 h-4" />
              </div>
            </div>
          )}
          <div className="flex-grow">
            <div className="text-xs font-bold text-[#1A1A1A] dark:text-white truncate max-w-[130px]">{service?.agentName || 'Verified Specialist'}</div>
            <div className="text-[10px] text-[#6C757D] dark:text-[#B0B0B0] truncate max-w-[130px]">{service?.agentSpecialty || service?.category || 'Beauty Specialist'}</div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#6C757D] group-hover/agent:text-brand-interactive transition-colors" />
        </Link>

        {onBook ? (
          <button 
            type="button"
            onClick={() => onBook(service)}
            className="mt-4 w-full py-3 bg-brand-interactive text-white rounded-xl font-black text-sm flex items-center justify-center hover:bg-brand-interactive/90 transition-all shadow-md shadow-brand-interactive/25 active:scale-[0.98] btn-mobile-scale"
          >
            Book Now
          </button>
        ) : (
          <Link 
            to={`/services/${service.id}?book=true`}
            className="mt-4 w-full py-3 bg-brand-interactive text-white rounded-xl font-black text-sm flex items-center justify-center hover:bg-brand-interactive/90 transition-all shadow-md shadow-brand-interactive/25 active:scale-[0.98] btn-mobile-scale"
          >
            Book Now
          </Link>
        )}
      </div>
    </motion.div>
  );
};

export default ServiceCard;
