import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, MapPin, ChevronLeft, ChevronRight, ArrowUp, RefreshCw, AlertCircle, X, Compass, Tag } from 'lucide-react';
import { Service, Agent } from '../types';
import { getServices, getAgents } from '../services/supabaseService';
import { searchServicesIntelligently } from '../services/intelligentSearch';
import ServiceCard from '../components/ServiceCard';
import IntelligentSearchBar from '../components/IntelligentSearchBar';

const Services: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState(500000);
  const [sortBy, setSortBy] = useState('relevance');
  const [currentPage, setCurrentPage] = useState(1);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const ITEMS_PER_PAGE = 12;

  const loadData = async () => {
    if (services.length === 0) {
      setLoading(true);
    }
    setError(null);
    const [servRes, agentRes] = await Promise.all([
      getServices(),
      getAgents()
    ]);
    if (servRes.error) {
      setError(servRes.error);
    } else {
      setServices(servRes.data);
    }
    if (agentRes.data) {
      setAgents(agentRes.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Derive categories dynamically from Supabase services
  const categories = useMemo(() => {
    const unique = Array.from(new Set((services || []).map(s => s?.category).filter(Boolean)));
    return ['All', ...unique];
  }, [services]);

  const isSearchActive = search.trim().length > 0;

  // Real-time intelligent search evaluation
  const intelligentResult = useMemo(() => {
    if (isSearchActive) {
      return searchServicesIntelligently(services || [], search, priceRange);
    }
    const matched = (services || []).filter(service => {
      if (!service) return false;
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
  }, [services, search, isSearchActive, selectedCategory, priceRange]);

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

                <div className="text-xs text-[#6C757D] font-bold">
                  Showing <span className="text-brand-interactive font-black">{sortedServices.length}</span> services
                </div>
              </div>

              {/* Category Filters */}
              {categories.length > 1 && (
                <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  <div className="flex bg-brand-background dark:bg-[#1A1A1A] p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border border-[#E9ECEF] dark:border-[#2D2D2D] shadow-sm">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setSelectedCategory(cat);
                          setCurrentPage(1);
                        }}
                        className={`px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                          selectedCategory.toLowerCase() === cat.toLowerCase()
                            ? 'bg-brand-interactive text-white shadow-md'
                            : 'text-[#6C757D] hover:text-brand-interactive'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
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
                window.scrollTo({ top: 300, behavior: 'smooth' });
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
                window.scrollTo({ top: 300, behavior: 'smooth' });
              }}
              disabled={currentPage === totalPages}
              className="p-3 rounded-2xl bg-brand-background dark:bg-[#1A1A1A] text-[#1A1A1A] dark:text-white shadow-md border border-[#E9ECEF] dark:border-[#2D2D2D] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-brand-interactive hover:text-white hover:shadow-[0_0_15px_rgba(108,53,166,0.3)] transition-all"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>

      {/* Floating Back to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-50 p-4 bg-brand-interactive text-white rounded-2xl shadow-[0_8px_25px_rgba(108,53,166,0.5)] hover:bg-brand-interactive/90 hover:shadow-[0_12px_35px_rgba(108,53,166,0.65)] transition-all transform hover:-translate-y-1 border border-white/20"
          >
            <ArrowUp className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Services;
