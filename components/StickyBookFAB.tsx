import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Calendar, X, ChevronRight, Search, Star } from 'lucide-react';
import { Service } from '../types';

interface StickyBookFABProps {
  services: Service[];
  onSelectService: (service: Service) => void;
}

const StickyBookFAB: React.FC<StickyBookFABProps> = ({ services, onSelectService }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredServices = services
    .filter(s => 
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase()) ||
      s.agentName.toLowerCase().includes(search.toLowerCase())
    )
    .slice(0, 6);

  const handleBookItem = (service: Service) => {
    setIsOpen(false);
    onSelectService(service);
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.div
        initial={{ scale: 0, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25, delay: 0.2 }}
        className="fixed bottom-20 md:bottom-8 right-5 sm:right-8 z-40"
      >
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="relative group flex items-center space-x-2.5 px-5 py-3.5 sm:px-6 sm:py-4 rounded-2xl bg-brand-interactive hover:bg-brand-interactive/90 text-white font-black text-sm sm:text-base shadow-[0_8px_30px_rgba(108,53,166,0.45)] hover:shadow-[0_12px_40px_rgba(108,53,166,0.6)] transition-all border border-white/25"
        >
          {/* Subtle squircle glow aura */}
          <span className="absolute -inset-0.5 rounded-2xl bg-brand-interactive/40 animate-pulse blur-sm opacity-60 group-hover:opacity-100 pointer-events-none" />
          
          <div className="relative flex items-center justify-center w-7 h-7 rounded-xl bg-white/20 backdrop-blur-sm shadow-inner">
            <Zap className="w-4 h-4 text-amber-300 fill-amber-300 animate-pulse" />
          </div>
          <span className="relative tracking-tight font-black">Book Now</span>
        </motion.button>
      </motion.div>

      {/* Quick Pick Modal / Bottom Sheet */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0"
            />

            <motion.div
              initial={{ y: '100%', opacity: 0.5 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="relative w-full max-w-lg max-h-[85vh] bg-white dark:bg-[#141414] rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl border border-[#E9ECEF] dark:border-[#2D2D2D] p-5 sm:p-6 overflow-hidden flex flex-col z-10"
            >
              {/* Grab handle for gesture feeling on mobile */}
              <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-md mx-auto mb-4 sm:hidden" />

              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#E9ECEF] dark:border-[#2D2D2D]">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-brand-interactive/10 text-brand-interactive">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-serif font-black text-[#1A1A1A] dark:text-white">
                      Instant Booking
                    </h3>
                    <p className="text-xs text-[#6C757D] dark:text-[#A0A0A0]">
                      Pick a service — certified pros come to you
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-[#6C757D] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search input */}
              <div className="my-4 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6C757D]" />
                <input
                  type="text"
                  placeholder="What service do you need? (e.g. Braids, Glam)"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-brand-surface dark:bg-[#1F1F1F] rounded-xl text-sm border border-transparent focus:border-brand-interactive outline-none text-[#1A1A1A] dark:text-white placeholder-[#888]"
                  autoFocus
                />
              </div>

              {/* Service list */}
              <div className="overflow-y-auto space-y-2.5 pr-1 flex-1 max-h-[50vh]">
                {filteredServices.length > 0 ? (
                  filteredServices.map((s) => (
                    <motion.div
                      key={s.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleBookItem(s)}
                      className="group flex items-center justify-between p-3 rounded-2xl bg-brand-surface dark:bg-[#1E1E1E] hover:bg-brand-interactive/10 dark:hover:bg-brand-interactive/15 border border-transparent hover:border-brand-interactive/30 cursor-pointer transition-all shadow-sm"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        {s.image ? (
                          <img
                            src={s.image}
                            alt={s.name}
                            className="w-12 h-12 rounded-xl object-cover shrink-0 border border-black/5 dark:border-white/5"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-brand-interactive/20 text-brand-interactive flex items-center justify-center font-bold text-xs shrink-0">
                            {s.category.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-[#1A1A1A] dark:text-white truncate group-hover:text-brand-interactive transition-colors">
                            {s.name}
                          </h4>
                          <div className="flex items-center space-x-2 text-[11px] text-[#6C757D] dark:text-[#A0A0A0]">
                            <span>{s.category}</span>
                            <span>•</span>
                            <span className="flex items-center text-amber-500 font-bold">
                              <Star className="w-3 h-3 fill-amber-400 mr-0.5" />
                              {s.rating > 0 ? s.rating : '5.0'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0 pl-2">
                        <span className="text-sm font-black text-brand-interactive">
                          ₦{s.price.toLocaleString()}
                        </span>
                        <div className="w-7 h-7 rounded-xl bg-brand-interactive text-white flex items-center justify-center group-hover:translate-x-0.5 transition-transform shadow-sm">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="py-8 text-center text-sm text-[#6C757D]">
                    No services matched "{search}".
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default StickyBookFAB;
