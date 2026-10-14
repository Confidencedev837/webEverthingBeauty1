import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, ExternalLink, Sparkles, Share2, Star } from 'lucide-react';
import { Service } from '../../types';

interface ServiceShareModalProps {
  service: Partial<Service> | null;
  isOpen: boolean;
  onClose: () => void;
}

const ServiceShareModal: React.FC<ServiceShareModalProps> = ({ service, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !service) return null;

  // Generate direct shareable link
  const serviceId = service.id || '';
  const shareUrl = `${window.location.origin}/#/services/${serviceId}`;
  const serviceTitle = service.name || 'New Beauty Service';
  const priceStr = service.price ? `₦${Number(service.price).toLocaleString()}` : '';

  const shareText = `Check out my new service "${serviceTitle}" on Everything Beauty (${priceStr}): ${shareUrl}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleInstagramShare = () => {
    // Copy link first so the agent can paste in bio or story sticker
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    // Open Instagram in a new tab
    window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
        />

        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-white dark:bg-[#161616] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E9ECEF] dark:border-[#2D2D2D] z-10 overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-[#6C757D] hover:text-[#1A1A1A] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header with celebratory icon */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-green-500/10 text-green-500 border border-green-500/20 flex items-center justify-center mx-auto mb-3 shadow-sm">
              <Sparkles className="w-7 h-7 text-brand-interactive animate-pulse" />
            </div>
            <h3 className="text-2xl font-serif font-black text-[#1A1A1A] dark:text-white">
              Service Published Live!
            </h3>
            <p className="text-xs sm:text-sm text-[#6C757D] dark:text-[#A0A0A0] mt-1">
              Your service is now discoverable in the catalogue.
            </p>
          </div>

          {/* Service Summary Card */}
          <div className="flex items-center space-x-3.5 p-3.5 rounded-2xl bg-brand-surface dark:bg-[#202020] border border-[#E9ECEF] dark:border-[#2D2D2D] mb-5">
            {service.image ? (
              <img
                src={service.image}
                alt={service.name}
                className="w-14 h-14 rounded-xl object-cover shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-brand-interactive/10 text-brand-interactive font-black text-xs flex items-center justify-center shrink-0">
                EB
              </div>
            )}
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-black uppercase text-brand-interactive">
                {service.category || 'Beauty'}
              </span>
              <h4 className="font-bold text-sm text-[#1A1A1A] dark:text-white truncate">
                {service.name}
              </h4>
              <div className="text-xs font-black text-brand-interactive mt-0.5">
                {priceStr}
              </div>
            </div>
          </div>

          {/* Pro Advice Callout */}
          <div className="p-3.5 rounded-2xl bg-brand-interactive/5 border border-brand-interactive/20 mb-6">
            <div className="flex items-start space-x-2.5">
              <div className="p-1 rounded-lg bg-brand-interactive/10 text-brand-interactive shrink-0 mt-0.5">
                <Share2 className="w-3.5 h-3.5" />
              </div>
              <p className="text-xs text-[#1A1A1A] dark:text-[#E0E0E0] leading-relaxed">
                <span className="font-bold text-brand-interactive">Pro Tip: </span>
                Share your new service on WhatsApp and Instagram right away! Professionals who share within the first hour get up to <strong>3x more bookings</strong> from their network.
              </p>
            </div>
          </div>

          {/* Direct Link & Copy */}
          <div className="mb-6">
            <label className="block text-[11px] font-black uppercase tracking-wider text-[#6C757D] mb-1.5">
              Direct Service Link
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-brand-surface dark:bg-[#1E1E1E] border border-[#E9ECEF] dark:border-[#2D2D2D] text-xs font-mono text-[#1A1A1A] dark:text-[#CCC] outline-none select-all truncate"
              />
              <button
                onClick={handleCopy}
                className="px-4 py-2.5 rounded-xl bg-brand-interactive text-white text-xs font-black flex items-center space-x-1.5 hover:bg-brand-interactive/90 active:scale-95 transition-all shadow-md shadow-brand-interactive/20 shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-white" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* WhatsApp & Instagram Share Buttons with Official Colors */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* WhatsApp Share Button */}
            <button
              onClick={handleWhatsAppShare}
              className="w-full py-3 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-black text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg shadow-[#25D366]/25 hover:scale-[1.02] active:scale-95 transition-all"
            >
              {/* WhatsApp Official SVG Icon */}
              <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.997.545 1.761.815 2.796.815 3.183 0 5.769-2.587 5.77-5.766.001-3.18-2.585-5.766-5.77-5.766zm9.969 5.766c0 5.485-4.464 9.949-9.969 9.949-1.748 0-3.385-.453-4.819-1.246l-5.212 1.359 1.385-5.064c-.9-1.492-1.423-3.238-1.423-5.098 0-5.485 4.464-9.949 9.969-9.949 5.505 0 9.969 4.464 9.969 9.949z" />
              </svg>
              <span>WhatsApp</span>
            </button>

            {/* Instagram Share Button with Official Gradient */}
            <button
              onClick={handleInstagramShare}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-tr from-[#f09433] via-[#e6683c] via-[#dc2743] via-[#cc2366] to-[#bc1888] text-white font-black text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg shadow-[#dc2743]/25 hover:scale-[1.02] active:scale-95 transition-all"
            >
              {/* Instagram Official SVG Icon */}
              <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              <span>Instagram</span>
            </button>
          </div>

          <div className="text-center">
            <button
              onClick={onClose}
              className="text-xs text-[#6C757D] hover:text-[#1A1A1A] dark:hover:text-white font-bold transition-colors"
            >
              Done & Return to Studio
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ServiceShareModal;
