import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, ChevronRight, Play, Video as VideoIcon, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Service } from '../types';
import { isVideoUrl } from '../services/supabaseService';

interface ServiceCardProps {
  service: Service;
  index: number;
  onBook?: (service: Service) => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, index, onBook }) => {
  const [videoError, setVideoError] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Check if service has any video in its gallery or primary image
  const videoItem = service.gallery?.find(item => item.type === 'video' || isVideoUrl(item.url));
  const hasVideo = Boolean(videoItem) || isVideoUrl(service.image);
  const videoSrc = videoItem?.url || (isVideoUrl(service.image) ? service.image : null);

  // Determine image display
  const primaryImage = service.image && !isVideoUrl(service.image) ? service.image : (videoItem?.thumbnail || '');

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      viewport={{ once: true }}
      className="group bg-brand-background dark:bg-[#1A1A1A] rounded-3xl overflow-hidden border border-[#E9ECEF] dark:border-[#2D2D2D] hover:border-brand-interactive transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-2 flex flex-col h-full"
    >
      <Link to={`/services/${service.id}`} className="relative h-56 app-service-img-h overflow-hidden block bg-gray-950">
        {hasVideo && videoSrc && !videoError ? (
          <div className="relative w-full h-full">
            <video
              src={videoSrc}
              poster={primaryImage || undefined}
              preload="none"
              muted
              playsInline
              onError={() => setVideoError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            {/* Video Indicator Badge */}
            <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/70 backdrop-blur-md rounded-lg text-white text-[10px] font-black flex items-center space-x-1.5 shadow-md">
              <VideoIcon className="w-3 h-3 text-brand-interactive animate-pulse" />
              <span>Video</span>
            </div>
          </div>
        ) : primaryImage && !imgError ? (
          <img 
            src={primaryImage} 
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

        <div className="absolute top-4 left-4 px-3 py-1 bg-white/95 dark:bg-[#1A1A1A]/95 backdrop-blur-md rounded-xl text-[10px] font-bold text-brand-interactive shadow-md border border-brand-interactive/20">
          {service.category}
        </div>
      </Link>
      
      <div className="p-6 app-card-inner-pad flex flex-col flex-grow">
        <Link to={`/services/${service.id}`}>
          <h3 className="text-xl font-serif font-bold mb-2 group-hover:text-brand-interactive transition-colors line-clamp-1 app-card-title">{service.name}</h3>
        </Link>
        <p className="text-sm text-[#6C757D] dark:text-[#B0B0B0] line-clamp-2 mb-4 app-card-desc">
          {service.description || 'Professional on-demand beauty treatment.'}
        </p>
        
        <div className="flex items-center justify-between mt-auto mb-6">
          <div className="flex items-center text-sm app-card-meta">
            <Star className={`w-4 h-4 mr-1 ${(service?.rating ?? 0) > 0 ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`} />
            <span className="font-bold text-[#1A1A1A] dark:text-white mr-1">
              {(service?.rating ?? 0) > 0 ? service.rating : 'New'}
            </span>
            {(service?.reviewCount ?? 0) > 0 && (
              <span className="text-[#6C757D]">({service.reviewCount})</span>
            )}
          </div>
          <div className="text-lg font-black text-[#111111] dark:text-white tracking-tight app-card-price">
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
