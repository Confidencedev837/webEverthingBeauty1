import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, ChevronRight, Play, Video as VideoIcon, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Service } from '../types';
import { isVideoUrl } from '../services/supabaseService';

interface ServiceCardProps {
  service: Service;
  index: number;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, index }) => {
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
      className="group bg-white dark:bg-[#1A1A1A] rounded-3xl overflow-hidden border border-[#E9ECEF] dark:border-[#2D2D2D] hover:border-rosePink transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-2 flex flex-col h-full"
    >
      <Link to={`/services/${service.id}`} className="relative h-56 overflow-hidden block bg-gray-950">
        {hasVideo && videoSrc && !videoError ? (
          <div className="relative w-full h-full">
            <video
              src={videoSrc}
              poster={primaryImage}
              preload="metadata"
              muted
              playsInline
              onError={() => setVideoError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            {/* Video Indicator Badge */}
            <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/70 backdrop-blur-md rounded-lg text-white text-[10px] font-black uppercase tracking-wider flex items-center space-x-1.5 shadow-md">
              <VideoIcon className="w-3 h-3 text-rosePink animate-pulse" />
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
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-rosePink/20 via-black to-black text-rosePink p-6 text-center">
            <span className="font-serif font-bold text-lg text-white mb-1">{service.name}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-rosePink/80">{service.category}</span>
          </div>
        )}

        <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 dark:bg-[#1A1A1A]/90 backdrop-blur-md rounded-full text-[10px] font-bold tracking-wider uppercase text-rosePink shadow-sm">
          {service.category}
        </div>
      </Link>
      
      <div className="p-6 flex flex-col flex-grow">
        <Link to={`/services/${service.id}`}>
          <h3 className="text-xl font-serif font-bold mb-2 group-hover:text-rosePink transition-colors line-clamp-1">{service.name}</h3>
        </Link>
        <p className="text-sm text-[#6C757D] dark:text-[#B0B0B0] line-clamp-2 mb-4">
          {service.description || 'Professional on-demand beauty treatment.'}
        </p>
        
        <div className="flex items-center justify-between mt-auto mb-6">
          <div className="flex items-center text-sm">
            <Star className={`w-4 h-4 mr-1 ${service.rating > 0 ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`} />
            <span className="font-bold text-[#1A1A1A] dark:text-white mr-1">
              {service.rating > 0 ? service.rating : 'New'}
            </span>
            {service.reviewCount > 0 && (
              <span className="text-[#6C757D]">({service.reviewCount})</span>
            )}
          </div>
          <div className="text-lg font-bold text-rosePink">
            ₦{service.price.toLocaleString()}
          </div>
        </div>

        <Link 
          to={`/agent/${service.agentId}`}
          className="flex items-center p-3 rounded-2xl bg-[#F8F9FA] dark:bg-[#252525] border border-transparent hover:border-rosePink/20 transition-all group/agent"
        >
          {service.agentImage ? (
            <img src={service.agentImage} className="w-10 h-10 rounded-full object-cover mr-3 border-2 border-white dark:border-[#1A1A1A]" alt={service.agentName} />
          ) : (
            <div className="w-10 h-10 rounded-full bg-rosePink/10 text-rosePink flex items-center justify-center mr-3 font-bold text-xs border border-rosePink/20">
              <User className="w-4 h-4" />
            </div>
          )}
          <div className="flex-grow">
            <div className="text-xs font-bold text-[#1A1A1A] dark:text-white truncate max-w-[130px]">{service.agentName}</div>
            <div className="text-[10px] text-[#6C757D] dark:text-[#B0B0B0] truncate max-w-[130px]">{service.agentSpecialty}</div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#6C757D] group-hover/agent:text-rosePink transition-colors" />
        </Link>

        <Link 
          to={`/services/${service.id}?book=true`}
          className="mt-4 w-full py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm flex items-center justify-center hover:bg-rosePink dark:hover:bg-rosePink dark:hover:text-white transition-colors"
        >
          Book Now
        </Link>
      </div>
    </motion.div>
  );
};

export default ServiceCard;
