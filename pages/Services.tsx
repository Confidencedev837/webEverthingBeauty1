import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, MapPin, ChevronLeft, ChevronRight, ArrowUp, RefreshCw, AlertCircle, X, Compass, Tag, Heart, Bookmark } from 'lucide-react';
import { Service, Agent } from '../types';
import { getServices, getAgents, getFavoriteServiceIds, getLikedServiceIds } from '../services/supabaseService';
import { searchServicesIntelligently } from '../services/intelligentSearch';
import { useAuth } from '../context/AuthContext';
import ServiceCard from '../components/ServiceCard';
import IntelligentSearchBar from '../components/IntelligentSearchBar';
import { smoothScrollTo } from '../components/SmoothScroll';

const Services: React.FC = () => {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [specialFilter, setSpecialFilter] = useState<'all' | 'favorites' | 'liked'>('all');
  const [userFavIds, setUserFavIds] = useState<string[]>([]);
  const [userLikedIds, setUserLikedIds] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState(500000);
  const [sortBy, setSortBy] = useState('relevance');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  const loadData = async () => {
    if (services.length === 0) {
      setLoading(true);
    }
    setError(null);
    const targetUserId = user?.id || 'guest_user';
    const [servRes, agentRes, favIds, likedIds] = await Promise.all([
      getServices(),
      getAgents(),
      getFavoriteServiceIds(targetUserId),
      getLikedServiceIds(targetUserId)
    ]);
    if (servRes.error) {
      setError(servRes.error);
    } else {
      setServices(servRes.data);
    }
    if (agentRes.data) {
      setAgents(agentRes.data);
    }
    setUserFavIds(favIds || []);
    setUserLikedIds(likedIds || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();

    // SWR: Silently accept background data refreshes without freezing UI
    const onCacheUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<{ key: string; data: any }>;
      if (customEvent.detail?.key === 'services:all' && customEvent.detail.data) {
        setServices(customEvent.detail.data);
      }
      if (customEvent.detail?.key === 'agents:all' && customEvent.detail.data) {
        setAgents(customEvent.detail.data);
      }
    };

    const targetUserId = user?.id || 'guest_user';
    const onFavsUpdated = () => {
      getFavoriteServiceIds(targetUserId).then(setUserFavIds);
    };
    const onLikesUpdated = () => {
      getLikedServiceIds(targetUserId).then(setUserLikedIds);
    };

    window.addEventListener('eb:cache-updated', onCacheUpdated);
    window.addEventListener('eb:favorites-updated', onFavsUpdated);
    window.addEventListener('eb:likes-updated', onLikesUpdated);
    return () => {
      window.removeEventListener('eb:cache-updated', onCacheUpdated);
      window.removeEventListener('eb:favorites-updated', onFavsUpdated);
      window.removeEventListener('eb:likes-updated', onLikesUpdated);
    };
  }, [user]);

  // Derive categories dynamically from Supabase services
  const categories = useMemo(() => {
    const unique = Array.from(new Set((services || []).map(s => s?.category).filter(Boolean)));
    return ['All', ...unique];
  }, [services]);

  const isSearchActive = search.trim().length > 0;

  // Real-time intelligent search evaluation
  const intelligentResult = useMemo(() => {
    if (isSearchActive) {
      const res = searchServicesIntelligently(services || [], search, priceRange);
      if (specialFilter === 'favorites') {
        res.matches = res.matches.filter(s => userFavIds.includes(s.id));
      } else if (specialFilter === 'liked') {
        res.matches = res.matches.filter(s => userLikedIds.includes(s.id));
      }
      return res;
    }
    const matched = (services || []).filter(service => {
      if (!service) return false;
      if (specialFilter === 'favorites' && !userFavIds.includes(service.id)) return false;
      if (specialFilter === 'liked' && !userLikedIds.includes(service.id)) return false;
      const sCat = (service.category || '').toLowerCase();
      const matchesCategory = selectedCategory === 'All' || sCat === (selectedCategory || '').toLowerCase();
      const matchesPrice = (service.price ?? 0) <= priceRange;
      return matchesCategory && matchesPrice;
    });
    return {
      matches: matched,
      isFallback: false,
      detectedCategory: null,
      suggestedQueries: [] as string[],
      message: null as string | null
    };
  }, [services, search, isSearchActive, selectedCategory, priceRange, specialFilter, userFavIds, userLikedIds]);

  const sortedServices = useMemo(() => {
    const list = [...(intelligentResult?.matches || [])];
    if (sortBy === 'price_low') return list.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    if (sortBy === 'price_high') return list.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    if (sortBy === 'rating') return list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    return list;
  }, [intelligentResult?.matches, sortBy]);

  const paginatedServices = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedServices.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedServices, currentPage]);

  const totalPages = Math.ceil(sortedServices.length / ITEMS_PER_PAGE) || 1;

  return (
    <div className="pt-20 sm:pt-24 md:pt-32 pb-12 sm:pb-16 md:pb-24 min-h-screen bg-brand-surface dark:bg-[#0D0D0D]">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <header className="mb-6 sm:mb-8 md:mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-3 sm:mb-4 text-[#1A1A1A] dark:text-white"
          >
            Verified Beauty Services
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm sm:text-base text-[#6C757D] dark:text-[#B0B0B0] max-w-2xl"
          >
            Connected directly to elite beauty agents across Nigeria. Live availability and upfront pricing.
          </motion.p>
        </header>



        {/* Filters & Search */}
        <section className="mb-6 sm:mb-8 md:mb-12 bg-brand-surface dark:bg-[#0D0D0D] pb-4">
          {/* Centered Intelligent Search Bar with live autocomplete & instant preview */}
          <div className="mb-6 sm:mb-8 px-3 sm:px-4">
            <IntelligentSearchBar
              value={search}
              onChange={(val) => {
                setSearch(val);
                setCurrentPage(1);
              }}
              services={services}
              agents={agents}
              placeholder="Search services, hairstyles, glam, pro name, lagos, abuja..."
            />
          </div>

          {/* Active Search Strip or Animated Filter Controls */}
          {isSearchActive ? (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between px-3 sm:px-4 max-w-2xl mx-auto mb-2"
            >
              <div className="flex items-center space-x-2 text-xs font-bold text-[#6C757D] dark:text-[#A0A0A0]">
                <span className="w-2 h-2 rounded-full bg-brand-interactive animate-ping" />
                <span>
                  {intelligentResult.isFallback ? (
                    <>
                      Related suggestions for <span className="text-[#1A1A1A] dark:text-white font-black">"{search}"</span>
                    </>
                  ) : (
                    <>
                      <span className="text-brand-interactive font-black">{sortedServices.length}</span> live results for{' '}
                      <span className="text-[#1A1A1A] dark:text-white font-black">"{search}"</span>
                    </>
                  )}
                </span>
              </div>
              <button
                onClick={() => setSearch('')}
                className="text-xs font-black text-brand-interactive hover:underline flex items-center space-x-1 cursor-pointer bg-brand-interactive/10 px-3 py-1.5 rounded-xl transition-all active:scale-95"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear & show filters</span>
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                {/* Special Filter Tabs: All / Favorites / Liked - No bounding box, bouncy sliding pill */}
                <div className="flex items-center gap-1 sm:gap-2 w-fit">
                  <button
                    onClick={() => { setSpecialFilter('all'); setCurrentPage(1); }}
                    className={`relative px-3.5 sm:px-4 py-2 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold transition-colors cursor-pointer select-none active:scale-95 ${
                      specialFilter === 'all'
                        ? 'text-white'
                        : 'text-[#6C757D] dark:text-[#A0A0A0] hover:text-[#1A1A1A] dark:hover:text-white'
                    }`}
                  >
                    {specialFilter === 'all' && (
                      <motion.div
                        layoutId="specialFilterPill"
                        className="absolute inset-0 bg-brand-interactive rounded-xl sm:rounded-2xl shadow-md shadow-brand-interactive/30"
                        transition={{
                          type: "spring",
                          stiffness: 450,
                          damping: 26,
                          mass: 0.8
                        }}
                      />
                    )}
                    <span className="relative z-10 font-black">All Services</span>
                  </button>

                  <button
                    onClick={() => { setSpecialFilter('favorites'); setCurrentPage(1); }}
                    className={`relative px-3.5 sm:px-4 py-2 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold transition-colors flex items-center space-x-1.5 cursor-pointer select-none active:scale-95 ${
                      specialFilter === 'favorites'
                        ? 'text-white'
                        : 'text-[#6C757D] dark:text-[#A0A0A0] hover:text-amber-500'
                    }`}
                  >
                    {specialFilter === 'favorites' && (
                      <motion.div
                        layoutId="specialFilterPill"
                        className="absolute inset-0 bg-amber-500 rounded-xl sm:rounded-2xl shadow-md shadow-amber-500/30"
                        transition={{
                          type: "spring",
                          stiffness: 450,
                          damping: 26,
                          mass: 0.8
                        }}
                      />
                    )}
                    <Bookmark className={`w-3.5 h-3.5 relative z-10 ${specialFilter === 'favorites' ? 'fill-current' : ''}`} />
                    <span className="relative z-10 font-black">Favorites ({userFavIds.length})</span>
                  </button>

                  <button
                    onClick={() => { setSpecialFilter('liked'); setCurrentPage(1); }}
                    className={`relative px-3.5 sm:px-4 py-2 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold transition-colors flex items-center space-x-1.5 cursor-pointer select-none active:scale-95 ${
                      specialFilter === 'liked'
                        ? 'text-white'
                        : 'text-[#6C757D] dark:text-[#A0A0A0] hover:text-rose-500'
                    }`}
                  >
                    {specialFilter === 'liked' && (
                      <motion.div
                        layoutId="specialFilterPill"
                        className="absolute inset-0 bg-rose-500 rounded-xl sm:rounded-2xl shadow-md shadow-rose-500/30"
                        transition={{
                          type: "spring",
                          stiffness: 450,
                          damping: 26,
                          mass: 0.8
                        }}
                      />
                    )}
                    <Heart className={`w-3.5 h-3.5 relative z-10 ${specialFilter === 'liked' ? 'fill-current' : ''}`} />
                    <span className="relative z-10 font-black">Liked ({userLikedIds.length})</span>
                  </button>
                </div>

                <div className="flex items-center space-x-4">
                  {/* Sort Control */}
                  <div className="flex items-center space-x-3 bg-brand-background dark:bg-[#1A1A1A] px-4 py-2.5 rounded-2xl shadow-md border border-brand-interactive/20 w-fit">
                    <div className="bg-brand-interactive/10 p-1.5 rounded-xl shadow-inner">
                      <MapPin className="w-4 h-4 text-brand-interactive" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-[#6C757D] leading-none mb-0.5">Order by</span>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-transparent text-[#1A1A1A] dark:text-white outline-none cursor-pointer font-bold text-xs sm:text-sm hover:text-brand-interactive transition-colors appearance-none pr-4"
                      >
                        <option value="relevance">Relevance & Popularity</option>
                        <option value="rating">Top Rated</option>
                        <option value="price_low">Price: Low to High</option>
                        <option value="price_high">Price: High to Low</option>
                      </select>
                    </div>
                  </div>

                  <div className="text-xs text-[#6C757D] font-bold hidden md:block">
                    Showing <span className="text-brand-interactive font-black">{sortedServices.length}</span> services
                  </div>
                </div>
              </div>

              {/* Category Filters - No bounding box, bouncy sliding pill */}
              {categories.length > 1 && (
                <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 pt-1 scrollbar-hide">
                  {categories.map((cat) => {
                    const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
                    return (
                      <button
                        key={cat}
                        onClick={() => {
                          setSelectedCategory(cat);
                          setCurrentPage(1);
                        }}
                        className={`relative px-4 sm:px-5 py-2 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold transition-colors whitespace-nowrap cursor-pointer select-none active:scale-95 ${
                          isSelected
                            ? 'text-white'
                            : 'text-[#6C757D] dark:text-[#A0A0A0] hover:text-[#1A1A1A] dark:hover:text-white'
                        }`}
                      >
                        {isSelected && (
                          <motion.div
                            layoutId="activeCategoryPill"
                            className="absolute inset-0 bg-brand-interactive rounded-xl sm:rounded-2xl shadow-md shadow-brand-interactive/30"
                            transition={{
                              type: "spring",
                              stiffness: 450,
                              damping: 26,
                              mass: 0.8
                            }}
                          />
                        )}
                        <span className="relative z-10 font-black">{cat}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </section>

        {/* Intelligent Zero-Dead-End Fallback Banner */}
        {isSearchActive && intelligentResult.isFallback && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#161616] border border-brand-interactive/30 shadow-[0_4px_20px_rgba(108,53,166,0.1)] max-w-3xl mx-auto"
          >
            <div className="flex items-start space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-brand-interactive/10 text-brand-interactive flex items-center justify-center shrink-0">
                <Compass className="w-5 h-5 text-brand-interactive" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-black text-[#1A1A1A] dark:text-white">
                  No exact match for "{search}"
                </h4>
                <p className="text-xs sm:text-sm text-[#6C757D] dark:text-[#A0A0A0] mt-0.5">
                  {intelligentResult.message}
                </p>
              </div>
            </div>

            {intelligentResult.suggestedQueries.length > 0 && (
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-[#6C757D] dark:text-[#888] block mb-2">
                  Did you mean:
                </span>
                <div className="flex flex-wrap gap-2">
                  {intelligentResult.suggestedQueries.map((query) => (
                    <button
                      key={query}
                      onClick={() => {
                        setSearch(query);
                        setCurrentPage(1);
                      }}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-brand-surface dark:bg-[#202020] text-[#1A1A1A] dark:text-white border border-[#E2E8F0] dark:border-[#333] hover:border-brand-interactive hover:text-brand-interactive transition-all shadow-sm active:scale-95 cursor-pointer flex items-center space-x-1.5"
                    >
                      <Tag className="w-3 h-3 text-brand-interactive" />
                      <span>{query}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-12">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-80 bg-brand-background dark:bg-[#1A1A1A] rounded-3xl animate-pulse border border-[#E9ECEF] dark:border-[#2D2D2D] p-6 flex flex-col justify-between">
                <div className="w-full h-44 bg-gray-200 dark:bg-white/5 rounded-2xl mb-4" />
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-white/5 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 dark:bg-white/5 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 dark:bg-white/5 rounded w-1/4 mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8 mb-12">
            {sortedServices.length > 0 ? (
              paginatedServices.map((service, idx) => (
                <ServiceCard key={service.id} service={service} index={idx} />
              ))
            ) : (
              <div className="col-span-full py-16 sm:py-24 md:py-32 text-center bg-brand-background dark:bg-[#1A1A1A] rounded-3xl border border-[#E9ECEF] dark:border-[#2D2D2D] p-8 shadow-xl">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-brand-surface dark:bg-brand-interactive/10 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 text-brand-interactive shadow-[0_0_15px_rgba(108,53,166,0.2)]">
                  <Search className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
                <h3 className="text-xl sm:text-2xl font-serif font-bold mb-2">No services found</h3>
                <p className="text-sm sm:text-base text-[#6C757D] px-4 max-w-md mx-auto">
                  {services.length === 0
                    ? 'No beauty services are currently listed in the database. Check back soon.'
                    : 'Try adjusting your search criteria or explore another category.'}
                </p>
                {services.length > 0 && (
                  <button
                    onClick={() => {
                      setSearch('');
                      setSelectedCategory('All');
                    }}
                    className="mt-6 px-6 py-3 bg-brand-interactive text-white rounded-xl text-xs font-bold shadow-lg shadow-brand-interactive/20 hover:scale-105 transition-all cursor-pointer"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Pagination Controls */}
        {sortedServices.length > ITEMS_PER_PAGE && (
          <div className="flex items-center justify-center gap-4 mb-16">
            <button
              onClick={() => {
                setCurrentPage(prev => Math.max(prev - 1, 1));
                smoothScrollTo(300, { duration: 0.9 });
              }}
              disabled={currentPage === 1}
              className="p-3 rounded-2xl bg-brand-background dark:bg-[#1A1A1A] text-[#1A1A1A] dark:text-white shadow-md border border-[#E9ECEF] dark:border-[#2D2D2D] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-brand-interactive hover:text-white hover:shadow-[0_0_15px_rgba(108,53,166,0.3)] transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <span className="font-black text-lg text-[#6C757D] px-4">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => {
                setCurrentPage(prev => Math.min(prev + 1, totalPages));
                smoothScrollTo(300, { duration: 0.9 });
              }}
              disabled={currentPage === totalPages}
              className="p-3 rounded-2xl bg-brand-background dark:bg-[#1A1A1A] text-[#1A1A1A] dark:text-white shadow-md border border-[#E9ECEF] dark:border-[#2D2D2D] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-brand-interactive hover:text-white hover:shadow-[0_0_15px_rgba(108,53,166,0.3)] transition-all"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Services;
