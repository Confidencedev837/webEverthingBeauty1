import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  Star, 
  Clock, 
  Calendar as CalendarIcon, 
  ChevronRight, 
  ChevronLeft, 
  SlidersHorizontal, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Award, 
  CheckCircle2, 
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Service, Agent, Booking, BookingStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { getServices, getAgents, getBookingsForUser } from '../services/supabaseService';
import ServiceCard from '../components/ServiceCard';
import BookingModal from '../components/BookingModal';
import Pagination from '../components/Pagination';
import StickyBookFAB from '../components/StickyBookFAB';

const QUICK_CATEGORIES = [
  'All',
  'Hair Styling',
  'Makeup Artistry',
  'Nails & Pedicure',
  'Skincare & Spa',
  'Barbering',
  'Lashes & Brows'
];

const CustomerHome: React.FC = () => {
  const { user, currentUser } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  // Active booking modal
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState<Service | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Horizontal Quick Strip scroll ref
  const quickStripRef = useRef<HTMLDivElement>(null);

  const loadData = async () => {
    setLoading(true);
    const [servicesRes, agentsRes, bookingsRes] = await Promise.all([
      getServices(),
      getAgents(),
      user ? getBookingsForUser(user.id, 'customer') : Promise.resolve({ data: [] })
    ]);

    if (servicesRes.data) setServices(servicesRes.data);
    if (agentsRes.data) setAgents(agentsRes.data);
    if (bookingsRes.data) setUserBookings(bookingsRes.data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Dynamic greeting based on time of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const firstName = currentUser?.name?.split(' ')[0] || 'Friend';
  const userLocation = currentUser?.address || 'Lagos, Nigeria';

  // Active or upcoming booking
  const upcomingBooking = useMemo(() => {
    return userBookings.find(
      b => b.status === BookingStatus.PENDING || b.status === BookingStatus.CONFIRMED
    );
  }, [userBookings]);

  // Filtered services for the full list
  const filteredServices = useMemo(() => {
    return services.filter(service => {
      const q = search.toLowerCase();
      const matchesSearch =
        service.name.toLowerCase().includes(q) ||
        service.agentName.toLowerCase().includes(q) ||
        service.category.toLowerCase().includes(q) ||
        service.description.toLowerCase().includes(q);

      const matchesCat =
        selectedCategory === 'All' ||
        service.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        selectedCategory.toLowerCase().includes(service.category.toLowerCase());

      return matchesSearch && matchesCat;
    });
  }, [services, search, selectedCategory]);

  // Paginated services for the main list
  const paginatedServices = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredServices.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredServices, currentPage]);

  const totalPages = Math.ceil(filteredServices.length / ITEMS_PER_PAGE) || 1;

  // Top agents (top-rated, verified or from user's state)
  const topAgents = useMemo(() => {
    return [...agents]
      .sort((a, b) => (b.rating || 5) - (a.rating || 5))
      .slice(0, 6);
  }, [agents]);

  // Horizontal Quick Strip scroll helper
  const scrollQuickStrip = (direction: 'left' | 'right') => {
    if (quickStripRef.current) {
      const offset = direction === 'left' ? -340 : 340;
      quickStripRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const handleBookService = (service: Service) => {
    setSelectedServiceForBooking(service);
    setIsBookingModalOpen(true);
  };

  const handleBookingSuccess = () => {
    setIsBookingModalOpen(false);
    // Reload bookings so active banner reflects the new booking
    if (user) {
      getBookingsForUser(user.id, 'customer').then(res => {
        if (res.data) setUserBookings(res.data);
      });
    }
  };

  return (
    <div className="pt-20 sm:pt-24 pb-28 min-h-screen bg-brand-surface dark:bg-[#0D0D0D] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* --- 1. WELCOME HERO & SEARCH BAR --- */}
        <section className="pt-4 pb-8 sm:pb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold text-brand-interactive mb-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>On-Demand Beauty in {userLocation}</span>
              </div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-black text-[#1A1A1A] dark:text-white tracking-tight">
                {greeting}, <span className="text-brand-interactive">{firstName}</span>
              </h1>
              <p className="text-xs sm:text-sm text-[#6C757D] dark:text-[#A0A0A0] mt-1">
                Top rated artists & stylists come to your door. Tap to book instantly.
              </p>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex items-center space-x-3 bg-white dark:bg-[#1A1A1A] p-2 sm:p-2.5 rounded-2xl border border-[#E9ECEF] dark:border-[#2D2D2D] shadow-sm w-fit">
              <div className="w-10 h-10 rounded-xl bg-brand-interactive/10 text-brand-interactive flex items-center justify-center font-bold">
                <Zap className="w-5 h-5 text-brand-interactive fill-brand-interactive" />
              </div>
              <div className="pr-2">
                <div className="text-xs font-black text-[#1A1A1A] dark:text-white">Instant Dispatch</div>
                <div className="text-[10px] text-[#6C757D] dark:text-[#888]">Verified & Insured Pros</div>
              </div>
            </div>
          </div>

          {/* Interactive Search Bar */}
          <div className="relative group max-w-3xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6C757D] group-focus-within:text-brand-interactive transition-colors" />
            <input
              type="text"
              placeholder="Search by hair, makeup glam, lash tech, barber, or pro name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-12 pr-4 py-3.5 sm:py-4 bg-white dark:bg-[#161616] border border-[#E9ECEF] dark:border-[#2D2D2D] rounded-2xl text-sm sm:text-base outline-none focus:border-brand-interactive focus:ring-4 focus:ring-brand-interactive/10 transition-all text-[#1A1A1A] dark:text-white shadow-sm"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#6C757D] hover:text-brand-interactive px-2 py-1 rounded-lg"
              >
                Clear
              </button>
            )}
          </div>
        </section>

        {/* --- 2. UPCOMING BOOKING BANNER (If exists) --- */}
        {upcomingBooking && (
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 p-4 sm:p-6 rounded-3xl bg-gradient-to-r from-brand-interactive/10 via-purple-500/10 to-brand-interactive/5 border border-brand-interactive/30 shadow-md relative overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-brand-interactive/20 shrink-0 border border-brand-interactive/30">
                  {upcomingBooking.serviceImage ? (
                    <img 
                      src={upcomingBooking.serviceImage} 
                      alt={upcomingBooking.serviceName} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-brand-interactive font-black">
                      EB
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-brand-interactive text-white shadow-[0_0_12px_rgba(108,53,166,0.35)] border border-white/20">
                      {upcomingBooking.status}
                    </span>
                    <span className="text-xs text-[#6C757D] dark:text-[#A0A0A0]">Upcoming Appointment</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#1A1A1A] dark:text-white">
                    {upcomingBooking.serviceName}
                  </h3>
                  <div className="flex items-center space-x-3 text-xs text-[#6C757D] dark:text-[#B0B0B0] mt-0.5">
                    <span className="flex items-center">
                      <CalendarIcon className="w-3.5 h-3.5 mr-1 text-brand-interactive" />
                      {upcomingBooking.date}
                    </span>
                    <span>•</span>
                    <span className="flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1 text-brand-interactive" />
                      {upcomingBooking.time}
                    </span>
                  </div>
                </div>
              </div>

              <Link
                to="/customer/dashboard"
                className="self-start sm:self-center px-4 py-2.5 bg-brand-interactive text-white text-xs font-black rounded-xl hover:bg-brand-interactive/90 transition-all flex items-center space-x-1.5 shadow-md shadow-brand-interactive/25"
              >
                <span>View Booking Details</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.section>
        )}

        {/* --- 3. CATEGORY PILLS (GESTURE SCROLL) -> GLOWING SQUIRCLES --- */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-4 mb-6 no-scrollbar touch-pan-x">
          {QUICK_CATEGORIES.map((cat) => {
            const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
            return (
              <motion.button
                key={cat}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => {
                  setSelectedCategory(cat);
                  setCurrentPage(1);
                }}
                className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 border ${
                  isActive
                    ? 'bg-brand-interactive text-white border-brand-interactive shadow-[0_0_15px_rgba(108,53,166,0.4)] font-black'
                    : 'bg-white dark:bg-[#1A1A1A] border-[#E9ECEF] dark:border-[#2D2D2D] text-[#1A1A1A] dark:text-[#CCC] shadow-sm hover:border-brand-interactive/50 hover:shadow-[0_0_12px_rgba(108,53,166,0.15)]'
                }`}
              >
                {cat}
              </motion.button>
            );
          })}
        </div>

        {/* --- 4. QUICK-PICK STRIP (HORIZONTAL SWIPE CARDS) --- */}
        <section className="mb-14">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center space-x-1.5 text-xs font-bold text-brand-interactive uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5" />
                <span>Instant Pick</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-black text-[#1A1A1A] dark:text-white">
                Book a Service
              </h2>
            </div>

            {/* Left & Right navigation chevrons for desktop */}
            <div className="hidden sm:flex items-center space-x-2">
              <button
                onClick={() => scrollQuickStrip('left')}
                className="w-9 h-9 rounded-2xl bg-white dark:bg-[#1A1A1A] border border-[#E9ECEF] dark:border-[#2D2D2D] flex items-center justify-center text-[#1A1A1A] dark:text-white shadow-sm hover:border-brand-interactive hover:shadow-[0_0_10px_rgba(108,53,166,0.2)] transition-all"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollQuickStrip('right')}
                className="w-9 h-9 rounded-2xl bg-white dark:bg-[#1A1A1A] border border-[#E9ECEF] dark:border-[#2D2D2D] flex items-center justify-center text-[#1A1A1A] dark:text-white shadow-sm hover:border-brand-interactive hover:shadow-[0_0_10px_rgba(108,53,166,0.2)] transition-all"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Horizontal Scroll Track */}
          <div
            ref={quickStripRef}
            className="flex items-stretch space-x-4 overflow-x-auto pb-4 snap-x snap-mandatory no-scrollbar touch-pan-x"
          >
            {services.slice(0, 8).map((service, idx) => (
              <motion.div
                key={service.id}
                whileHover={{ y: -4 }}
                className="w-[280px] sm:w-[320px] shrink-0 snap-start bg-white dark:bg-[#161616] rounded-3xl border border-[#E9ECEF] dark:border-[#2D2D2D] hover:border-brand-interactive transition-all shadow-md hover:shadow-xl hover:shadow-brand-interactive/10 flex flex-col overflow-hidden"
              >
                {/* Image / Header */}
                <div className="relative h-44 overflow-hidden bg-gray-900">
                  <img
                    src={service.image || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=600'}
                    alt={service.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-xl text-[10px] font-black bg-white/95 dark:bg-black/95 backdrop-blur-md text-brand-interactive shadow-md border border-brand-interactive/25">
                    {service.category}
                  </div>
                  <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-xl text-xs font-black bg-black/75 backdrop-blur-md text-white shadow-md">
                    ₦{service.price.toLocaleString()}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-serif font-bold text-base text-[#1A1A1A] dark:text-white line-clamp-1 mb-1">
                    {service.name}
                  </h3>
                  <p className="text-xs text-[#6C757D] dark:text-[#A0A0A0] line-clamp-2 mb-3">
                    {service.description || 'Verified luxury beauty treatment delivered to you.'}
                  </p>

                  <div className="mt-auto pt-3 border-t border-[#E9ECEF] dark:border-[#262626] flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-xl bg-brand-interactive/10 text-brand-interactive flex items-center justify-center font-bold text-[10px] shadow-inner">
                        {service.agentName?.slice(0, 2).toUpperCase() || 'EB'}
                      </div>
                      <span className="text-xs font-bold text-[#1A1A1A] dark:text-white truncate max-w-[110px]">
                        {service.agentName}
                      </span>
                    </div>

                    <button
                      onClick={() => handleBookService(service)}
                      className="px-3.5 py-1.5 rounded-xl bg-brand-interactive text-white text-xs font-black hover:bg-brand-interactive/90 active:scale-95 transition-all shadow-sm shadow-brand-interactive/20"
                    >
                      Book
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* --- 5. TOP AGENTS NEAR YOU (INLINE DISCOVERY) --- */}
        <section className="mb-14">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center space-x-1.5 text-xs font-bold text-brand-interactive uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Professionals</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-black text-[#1A1A1A] dark:text-white">
                Top Agents Near You
              </h2>
            </div>
            <Link
              to="/agents"
              className="text-xs font-bold text-brand-interactive hover:underline flex items-center space-x-1"
            >
              <span>View all agents</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {topAgents.map((agent) => (
              <motion.div
                key={agent.id}
                whileHover={{ y: -3 }}
                className="p-5 rounded-3xl bg-white dark:bg-[#161616] border border-[#E9ECEF] dark:border-[#2D2D2D] hover:border-brand-interactive/40 transition-all shadow-sm flex flex-col justify-between"
              >
                <div className="flex items-start space-x-3.5">
                  <div className="relative">
                    <img
                      src={agent.image || `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#6C35A6" /><text x="50%" y="50%" fill="white" font-family="sans-serif" font-size="40" font-weight="bold" text-anchor="middle" dominant-baseline="central">${agent.name.slice(0, 2).toUpperCase()}</text></svg>`)}`}
                      alt={agent.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-white dark:border-[#222] shadow-sm"
                    />
                    <div className="absolute -bottom-1 -right-1 p-0.5 bg-brand-interactive text-white rounded-lg shadow-[0_0_8px_rgba(108,53,166,0.4)]">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm sm:text-base text-[#1A1A1A] dark:text-white truncate">
                        {agent.name}
                      </h4>
                      <div className="flex items-center text-xs font-black text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-current mr-0.5" />
                        <span>{agent.rating > 0 ? agent.rating : '5.0'}</span>
                      </div>
                    </div>
                    <div className="text-xs text-brand-interactive font-medium truncate">
                      {agent.specialty}
                    </div>
                    <div className="flex items-center space-x-2 text-[11px] text-[#6C757D] dark:text-[#888] mt-1">
                      <span className="flex items-center">
                        <MapPin className="w-3 h-3 mr-0.5" />
                        {agent.location || 'Lagos'}
                      </span>
                      <span>•</span>
                      <span>{agent.experience || 3}+ yrs exp</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E9ECEF] dark:border-[#262626] flex items-center justify-between">
                  <Link
                    to={`/agent/${agent.id}`}
                    className="text-xs font-bold text-[#6C757D] dark:text-[#A0A0A0] hover:text-brand-interactive transition-colors"
                  >
                    View Portfolio
                  </Link>

                  <Link
                    to={`/agent/${agent.id}`}
                    className="px-3.5 py-1.5 rounded-xl bg-brand-interactive/10 hover:bg-brand-interactive text-brand-interactive hover:text-white text-xs font-black transition-all"
                  >
                    Book Agent
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* --- 6. ALL SERVICES (TACTILE PAGINATION) --- */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center space-x-1.5 text-xs font-bold text-brand-interactive uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5" />
                <span>Curated Menu</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-black text-[#1A1A1A] dark:text-white">
                All Available Services
              </h2>
            </div>
            <span className="text-xs font-bold text-[#6C757D]">
              Showing {paginatedServices.length} of {filteredServices.length}
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-80 rounded-3xl bg-gray-200 dark:bg-gray-800 animate-pulse"
                />
              ))}
            </div>
          ) : paginatedServices.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedServices.map((service, index) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  index={index}
                  onBook={handleBookService}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-[#141414] rounded-3xl border border-[#E9ECEF] dark:border-[#2D2D2D] shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-brand-interactive/10 text-brand-interactive flex items-center justify-center mx-auto mb-3 shadow-[0_0_15px_rgba(108,53,166,0.2)]">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-[#1A1A1A] dark:text-white mb-1">
                No services found
              </h3>
              <p className="text-xs text-[#6C757D] max-w-sm mx-auto mb-4">
                We couldn't find any services matching "{search}". Try searching for hair, nails, or lashes.
              </p>
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('All');
                }}
                className="px-4 py-2 bg-brand-interactive text-white rounded-xl text-xs font-black shadow-md"
              >
                Reset Search
              </button>
            </div>
          )}

          {/* Tactile Pagination Component */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 400, behavior: 'smooth' });
              }}
            />
          )}
        </section>

      </div>

      {/* --- 7. STICKY "BOOK NOW" FAB --- */}
      <StickyBookFAB
        services={services}
        onSelectService={handleBookService}
      />

      {/* --- 8. BOOKING MODAL ON HOME --- */}
      {selectedServiceForBooking && (
        <BookingModal
          service={selectedServiceForBooking}
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
        />
      )}
    </div>
  );
};

export default CustomerHome;
