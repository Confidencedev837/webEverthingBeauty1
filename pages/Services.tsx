import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, MapPin, ChevronLeft, ChevronRight, ArrowUp, RefreshCw, AlertCircle } from 'lucide-react';
import { Service } from '../types';
import { getServices } from '../services/supabaseService';
import ServiceCard from '../components/ServiceCard';

const Services: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
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
    setLoading(true);
    setError(null);
    const res = await getServices();
    if (res.error) {
      setError(res.error);
    } else {
      setServices(res.data);
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
    const unique = Array.from(new Set(services.map(s => s.category).filter(Boolean)));
    return ['All', ...unique];
  }, [services]);

  const filteredServices = useMemo(() => {
    return services.filter(service => {
      const searchLower = search.toLowerCase();
      const matchesSearch = 
        service.name.toLowerCase().includes(searchLower) ||
        service.agentName.toLowerCase().includes(searchLower) ||
        service.category.toLowerCase().includes(searchLower) ||
        service.description.toLowerCase().includes(searchLower);
      const matchesCategory = selectedCategory === 'All' || service.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesPrice = service.price <= priceRange;
      return matchesSearch && matchesCategory && matchesPrice;
    }).sort((a, b) => {
      if (sortBy === 'price_low') return a.price - b.price;
      if (sortBy === 'price_high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0; // relevance
    });
  }, [services, search, selectedCategory, priceRange, sortBy]);

  const paginatedServices = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredServices.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredServices, currentPage]);

  const totalPages = Math.ceil(filteredServices.length / ITEMS_PER_PAGE) || 1;

  return (
    <div className="pt-20 sm:pt-24 md:pt-32 pb-12 sm:pb-16 md:pb-24 min-h-screen bg-[#F8F9FA] dark:bg-[#0D0D0D]">
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
        <section className="mb-6 sm:mb-8 md:mb-12 bg-[#F8F9FA] dark:bg-[#0D0D0D] pb-4">
          {/* Search Bar */}
          <div className="mb-3 sm:mb-4 relative">
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#6C757D]" />
            <input
              type="text"
              placeholder="Search services, artists, specialties..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 text-sm sm:text-base bg-white dark:bg-[#1A1A1A] border border-[#E9ECEF] dark:border-[#2D2D2D] rounded-xl sm:rounded-2xl outline-none focus:border-rosePink transition-all shadow-sm text-[#1A1A1A] dark:text-white"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            {/* Sort Control */}
            <div className="flex items-center space-x-3 bg-white dark:bg-[#1A1A1A] px-4 py-2 rounded-full shadow-sm border border-rosePink/20 w-fit">
              <div className="bg-rosePink/10 p-1.5 rounded-full">
                <MapPin className="w-4 h-4 text-rosePink" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-black text-[#6C757D] tracking-widest leading-none mb-0.5">Order by</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-[#1A1A1A] dark:text-white outline-none cursor-pointer font-bold text-xs sm:text-sm hover:text-rosePink transition-colors appearance-none pr-4"
                >
                  <option value="relevance">Relevance & Popularity</option>
                  <option value="rating">Top Rated</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                </select>
              </div>
            </div>

            <div className="text-xs text-[#6C757D] font-bold">
              Showing <span className="text-rosePink font-black">{filteredServices.length}</span> services
            </div>
          </div>

          {/* Category Filters */}
          {categories.length > 1 && (
            <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide">
              <div className="flex bg-white dark:bg-[#1A1A1A] p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border border-[#E9ECEF] dark:border-[#2D2D2D] shadow-sm">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setCurrentPage(1);
                    }}
                    className={`px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                      selectedCategory.toLowerCase() === cat.toLowerCase() 
                        ? 'bg-rosePink text-white shadow-md' 
                        : 'text-[#6C757D] hover:text-rosePink'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-12">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-80 bg-white dark:bg-[#1A1A1A] rounded-3xl animate-pulse border border-[#E9ECEF] dark:border-[#2D2D2D] p-6 flex flex-col justify-between">
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
            {filteredServices.length > 0 ? (
              paginatedServices.map((service, idx) => (
                <ServiceCard key={service.id} service={service} index={idx} />
              ))
            ) : (
              <div className="col-span-full py-16 sm:py-24 md:py-32 text-center bg-white dark:bg-[#1A1A1A] rounded-3xl border border-[#E9ECEF] dark:border-[#2D2D2D] p-8">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#FFE6EA] dark:bg-rosePink/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 text-rosePink">
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
                    onClick={() => { setSearch(''); setSelectedCategory('All'); }}
                    className="mt-6 px-6 py-3 bg-rosePink text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-rosePink/20 hover:scale-105 transition-all"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Pagination Controls */}
        {filteredServices.length > ITEMS_PER_PAGE && (
          <div className="flex items-center justify-center gap-4 mb-16">
            <button
              onClick={() => {
                setCurrentPage(prev => Math.max(prev - 1, 1));
                window.scrollTo({ top: 300, behavior: 'smooth' });
              }}
              disabled={currentPage === 1}
              className="p-3 rounded-full bg-white dark:bg-[#1A1A1A] text-[#1A1A1A] dark:text-white shadow-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-rosePink hover:text-white transition-all"
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
              className="p-3 rounded-full bg-white dark:bg-[#1A1A1A] text-[#1A1A1A] dark:text-white shadow-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-rosePink hover:text-white transition-all"
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
            className="fixed bottom-8 right-8 z-50 p-4 bg-rosePink text-white rounded-full shadow-[0_10px_20px_rgba(255,138,157,0.4)] hover:bg-[#E57B8D] hover:shadow-[0_15px_30px_rgba(255,138,157,0.5)] transition-all transform hover:-translate-y-1"
          >
            <ArrowUp className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Services;
