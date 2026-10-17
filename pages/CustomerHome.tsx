import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  Star, 
  Clock, 
  Calendar,
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
  AlertCircle,
  X,
  Compass,
  Tag,
  User,
  Bell,
  Phone
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Service, Agent, Booking, BookingStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { getServices, getAgents, getBookingsForUser, isVideoUrl } from '../services/supabaseService';
import { searchServicesIntelligently, searchAgentsIntelligently } from '../services/intelligentSearch';
import ServiceCard from '../components/ServiceCard';
import BookingModal from '../components/BookingModal';
import Pagination from '../components/Pagination';
import StickyBookFAB from '../components/StickyBookFAB';
import IntelligentSearchBar from '../components/IntelligentSearchBar';
import UsernameTypewriter from '../components/UsernameTypewriter';
import HeroPsychologyTypewriter from '../components/HeroPsychologyTypewriter';

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
    if (services.length === 0 && agents.length === 0) {
      setLoading(true);
    }
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

  const navigate = useNavigate();
  const [searchTab, setSearchTab] = useState<'all' | 'services' | 'specialists'>('all');

  // Active or upcoming booking
  const upcomingBooking = useMemo(() => {
    return userBookings.find(
      b => b.status === BookingStatus.PENDING || b.status === BookingStatus.CONFIRMED
    );
  }, [userBookings]);

  // Assigned specialist details for the upcoming booking (for Bolt-style card)
  const assignedAgent = useMemo(() => {
    if (!upcomingBooking) return null;
    return agents.find(a => a.id === upcomingBooking.agentId) || null;
  }, [upcomingBooking, agents]);

  const isSearchActive = search.trim().length > 0;

  // Real-time intelligent search evaluation for services
  const intelligentResult = useMemo(() => {
    if (isSearchActive) {
      return searchServicesIntelligently(services, search);
    }
    const matched = services.filter(service => {
      const matchesCat =
        selectedCategory === 'All' ||
        (service.category || '').toLowerCase().includes(selectedCategory.toLowerCase()) ||
        selectedCategory.toLowerCase().includes((service.category || '').toLowerCase());
      return matchesCat;
    });
    return {
      matches: matched,
      isFallback: false,
      detectedCategory: null,
      suggestedQueries: [] as string[],
      message: null as string | null
    };
  }, [services, search, isSearchActive, selectedCategory]);

  const filteredServices = intelligentResult.matches;

  // Real-time intelligent search evaluation for agents
  const intelligentAgentsResult = useMemo(() => {
    if (isSearchActive) {
      return searchAgentsIntelligently(agents, search);
    }
    return {
      matches: [] as Agent[],
      isFallback: false,
      detectedCategory: null,
      suggestedQueries: [] as string[],
      message: null as string | null
    };
  }, [agents, search, isSearchActive]);

  const filteredAgents = intelligentAgentsResult.matches;

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

  const handleBookSpecialist = (agent: Agent) => {
    navigate(`/agent/${agent.id}?book=true#services`);
  };

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
              <div className="flex items-center space-x-2 text-xs font-bold text-brand-interactive mb-1 app-hero-badge">
                <MapPin className="w-3.5 h-3.5" />
                <span>On-Demand Beauty in {userLocation}</span>
              </div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-black text-[#1A1A1A] dark:text-white tracking-tight app-hero-title min-h-[3.2rem] sm:min-h-[3.8rem] flex items-center">
                <HeroPsychologyTypewriter
                  greeting={greeting}
                  userName={firstName}
                  onSelectPrompt={(category) => {
                    if (category) {
                      setSelectedCategory(category);
                      setCurrentPage(1);
                      window.scrollTo({ top: 480, behavior: 'smooth' });
                    }
                  }}
                />
              </h1>
              <p className="text-xs sm:text-sm text-[#6C757D] dark:text-[#A0A0A0] mt-1 app-hero-subtext">
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

          {/* Centered Search Bar with generous padding & multi-layer depth */}
          <div className="pt-2 pb-1 px-3 sm:px-4">
            <IntelligentSearchBar
              value={search}
              onChange={(val) => {
                setSearch(val);
                setCurrentPage(1);
              }}
              services={services}
              agents={agents}
              placeholder="Search by hair, makeup glam, lash tech, barber, or pro name..."
            />

            {isSearchActive && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between px-2 max-w-2xl mx-auto mt-3"
              >
                <div className="flex items-center space-x-2 text-xs font-bold text-[#6C757D] dark:text-[#A0A0A0]">
                  <span className="w-2 h-2 rounded-full bg-brand-interactive animate-ping" />
                  <span>
                    {intelligentResult.isFallback ? (
                      <>
                        Related recommendations for <span className="text-[#1A1A1A] dark:text-white font-black">"{search}"</span>
                      </>
                    ) : (
                      <>
                        <span className="text-brand-interactive font-black">{filteredServices.length}</span> live services found for{' '}
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
                  <span>Clear search</span>
                </button>
              </motion.div>
            )}
          </div>
        </section>

        {isSearchActive ? (
          /* =========================================================================
             X / LINKEDIN STYLE SOCIAL UNIFIED SEARCH FEED
             Direct Booking Focused • Instant 1-Tap Booking • Services & Agents Tabs
             ========================================================================= */
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="mb-16"
          >
            {/* 1. Search Result Metrics & Quick Clear */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#161616] border border-[#E2E8F0] dark:border-[#262626] shadow-sm">
              <div className="flex items-center space-x-2.5 text-xs sm:text-sm font-bold text-[#6C757D] dark:text-[#A0A0A0]">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-interactive animate-ping shrink-0" />
                <span>
                  {intelligentResult.isFallback ? (
                    <>
                      Related recommendations for <span className="text-[#1A1A1A] dark:text-white font-black">"{search}"</span>
                    </>
                  ) : (
                    <>
                      <span className="text-brand-interactive font-black">{filteredServices.length}</span> Services and{' '}
                      <span className="text-brand-interactive font-black">{filteredAgents.length}</span> Specialists found for{' '}
                      <span className="text-[#1A1A1A] dark:text-white font-black">"{search}"</span>
                    </>
                  )}
                </span>
              </div>
              <button
                onClick={() => setSearch('')}
                className="text-xs font-black text-brand-interactive hover:underline flex items-center space-x-1.5 cursor-pointer bg-brand-interactive/10 px-3.5 py-2 rounded-xl transition-all active:scale-95 self-start sm:self-auto shrink-0"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear & show home</span>
              </button>
            </div>

            {/* 2. Social-Style Segmented Navigation (X / LinkedIn style) */}
            <div className="flex items-center space-x-2 border-b border-[#E9ECEF] dark:border-[#262626] pb-3 mb-8 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setSearchTab('all')}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center space-x-2 whitespace-nowrap ${
                  searchTab === 'all'
                    ? 'bg-brand-interactive text-white shadow-md shadow-brand-interactive/20 font-black'
                    : 'text-[#6C757D] dark:text-[#A0A0A0] hover:text-[#1A1A1A] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <span>All Results</span>
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${
                  searchTab === 'all' ? 'bg-white/20 text-white' : 'bg-black/5 dark:bg-white/10 text-[#6C757D] dark:text-[#AAA]'
                }`}>
                  {filteredServices.length + filteredAgents.length}
                </span>
              </button>

              <button
                onClick={() => setSearchTab('services')}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center space-x-2 whitespace-nowrap ${
                  searchTab === 'services'
                    ? 'bg-brand-interactive text-white shadow-md shadow-brand-interactive/20 font-black'
                    : 'text-[#6C757D] dark:text-[#A0A0A0] hover:text-[#1A1A1A] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <span>Services</span>
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${
                  searchTab === 'services' ? 'bg-white/20 text-white' : 'bg-black/5 dark:bg-white/10 text-[#6C757D] dark:text-[#AAA]'
                }`}>
                  {filteredServices.length}
                </span>
              </button>

              <button
                onClick={() => setSearchTab('specialists')}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center space-x-2 whitespace-nowrap ${
                  searchTab === 'specialists'
                    ? 'bg-brand-interactive text-white shadow-md shadow-brand-interactive/20 font-black'
                    : 'text-[#6C757D] dark:text-[#A0A0A0] hover:text-[#1A1A1A] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <span>Specialists</span>
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${
                  searchTab === 'specialists' ? 'bg-white/20 text-white' : 'bg-black/5 dark:bg-white/10 text-[#6C757D] dark:text-[#AAA]'
                }`}>
                  {filteredAgents.length}
                </span>
              </button>
            </div>

            {/* 3. Intelligent Zero-Dead-End Fallback Banner */}
            {intelligentResult.isFallback && (
              <div className="mb-8 p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#161616] border border-brand-interactive/30 shadow-[0_4px_20px_rgba(108,53,166,0.1)] max-w-3xl mx-auto">
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
              </div>
            )}

            {/* 4. Tab Views */}
            {/* --- TAB: ALL --- */}
            {searchTab === 'all' && (
              <div className="space-y-12">
                {/* Specialists Section */}
                {filteredAgents.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-brand-interactive block">Verified Artists</span>
                        <h3 className="text-lg sm:text-xl font-serif font-black text-[#1A1A1A] dark:text-white">
                          Matching Specialists ({filteredAgents.length})
                        </h3>
                      </div>
                      {filteredAgents.length > 2 && (
                        <button
                          onClick={() => setSearchTab('specialists')}
                          className="text-xs font-bold text-brand-interactive hover:underline flex items-center space-x-1 cursor-pointer"
                        >
                          <span>See all {filteredAgents.length}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredAgents.slice(0, 4).map((agent) => (
                        <div
                          key={agent.id}
                          className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#161616] border border-[#E9ECEF] dark:border-[#262626] hover:border-brand-interactive/40 transition-all shadow-sm hover:shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden group"
                        >
                          {/* Translucent Banner Backdrop in that 15% sweet spot */}
                          {agent.banner && agent.banner.trim() !== '' && (
                            <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none z-0">
                              <img
                                src={agent.banner}
                                alt=""
                                className="w-full h-full object-cover opacity-15 dark:opacity-15 filter blur-[0.5px] scale-105 group-hover:scale-110 transition-transform duration-700"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-r from-white/96 via-white/92 to-white/98 dark:from-[#161616]/96 dark:via-[#161616]/92 dark:to-[#161616]/98 backdrop-blur-[1px]" />
                            </div>
                          )}

                          <div className="flex items-center space-x-3.5 min-w-0 relative z-10">
                            {/* Round circle avatar with brand Instagram gradient ring */}
                            <div className="relative shrink-0">
                              <div className="p-[2.5px] rounded-full bg-gradient-to-tr from-[#32104D] via-[#6C35A6] to-[#F43F5E] shadow-sm">
                                <div className="p-0.5 bg-white dark:bg-[#161616] rounded-full">
                                  <img
                                    src={agent.image || agent.avatar || `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#6C35A6" /><text x="50%" y="50%" fill="white" font-family="sans-serif" font-size="40" font-weight="bold" text-anchor="middle" dominant-baseline="central">${agent.name.slice(0, 2).toUpperCase()}</text></svg>`)}`}
                                    alt={agent.name}
                                    className="w-14 h-14 rounded-full object-cover"
                                  />
                                </div>
                              </div>
                              <div className="absolute -bottom-0.5 -right-0.5 p-0.5 bg-brand-interactive text-white rounded-full shadow-sm border border-white dark:border-[#161616]">
                                <ShieldCheck className="w-3 h-3" />
                              </div>
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-sm sm:text-base text-[#1A1A1A] dark:text-white truncate">
                                {agent.name}
                              </h4>
                              <p className="text-xs text-brand-interactive font-medium truncate">
                                {agent.specialty}
                              </p>
                              <div className="flex items-center space-x-2 text-[11px] text-[#6C757D] dark:text-[#888] mt-0.5">
                                <div className="flex items-center font-bold text-amber-500">
                                  <Star className="w-3 h-3 fill-current mr-0.5" />
                                  <span>{(agent.rating ?? 5.0).toFixed(1)}</span>
                                </div>
                                <span>•</span>
                                <span className="flex items-center truncate">
                                  <MapPin className="w-3 h-3 mr-0.5" />
                                  {agent.location || 'Nigeria'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E9ECEF] dark:border-[#222] relative z-10">
                            <button
                              onClick={() => handleBookSpecialist(agent)}
                              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-brand-interactive text-white text-xs font-black shadow-md shadow-brand-interactive/20 hover:bg-brand-interactive/90 active:scale-95 transition-all cursor-pointer whitespace-nowrap flex items-center justify-center space-x-1"
                            >
                              <Calendar className="w-3.5 h-3.5" />
                              <span>Book Now</span>
                            </button>
                            <Link
                              to={`/agent/${agent.id}`}
                              className="px-3 py-2.5 rounded-xl bg-brand-surface dark:bg-[#222] hover:bg-brand-interactive/10 text-xs font-bold text-[#6C757D] dark:text-[#A0A0A0] hover:text-brand-interactive transition-all text-center whitespace-nowrap"
                            >
                              Profile
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Services Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-brand-interactive block">Bookable Treatments</span>
                      <h3 className="text-lg sm:text-xl font-serif font-black text-[#1A1A1A] dark:text-white">
                        Available Services ({filteredServices.length})
                      </h3>
                    </div>
                  </div>

                  {filteredServices.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredServices.map((service, index) => (
                        <ServiceCard
                          key={service.id}
                          service={service}
                          index={index}
                          onBook={handleBookService}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-white dark:bg-[#161616] rounded-3xl border border-[#E9ECEF] dark:border-[#262626]">
                      <p className="text-sm text-[#6C757D]">No matching service treatments found.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* --- TAB: SERVICES ONLY --- */}
            {searchTab === 'services' && (
              <div>
                {filteredServices.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredServices.map((service, index) => (
                      <ServiceCard
                        key={service.id}
                        service={service}
                        index={index}
                        onBook={handleBookService}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white dark:bg-[#161616] rounded-3xl border border-[#E9ECEF] dark:border-[#262626]">
                    <p className="text-sm text-[#6C757D]">No services found matching "{search}".</p>
                  </div>
                )}
              </div>
            )}

            {/* --- TAB: SPECIALISTS ONLY --- */}
            {searchTab === 'specialists' && (
              <div>
                {filteredAgents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredAgents.map((agent) => (
                      <div
                        key={agent.id}
                        className="p-5 rounded-3xl bg-white dark:bg-[#161616] border border-[#E9ECEF] dark:border-[#262626] hover:border-brand-interactive/40 transition-all shadow-sm flex flex-col justify-between relative overflow-hidden group"
                      >
                        {/* Translucent Banner Backdrop at 15% */}
                        {agent.banner && agent.banner.trim() !== '' && (
                          <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none z-0">
                            <img
                              src={agent.banner}
                              alt=""
                              className="w-full h-full object-cover opacity-15 dark:opacity-15 filter blur-[0.5px] scale-105 group-hover:scale-110 transition-transform duration-700"
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-white/96 via-white/92 to-white/98 dark:from-[#161616]/96 dark:via-[#161616]/92 dark:to-[#161616]/98 backdrop-blur-[1px]" />
                          </div>
                        )}

                        <div className="flex items-start space-x-3.5 mb-4 relative z-10">
                          {/* Round circle avatar with brand Instagram gradient ring */}
                          <div className="relative shrink-0">
                            <div className="p-[2.5px] rounded-full bg-gradient-to-tr from-[#32104D] via-[#6C35A6] to-[#F43F5E] shadow-sm">
                              <div className="p-0.5 bg-white dark:bg-[#161616] rounded-full">
                                <img
                                  src={agent.image || agent.avatar || `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#6C35A6" /><text x="50%" y="50%" fill="white" font-family="sans-serif" font-size="40" font-weight="bold" text-anchor="middle" dominant-baseline="central">${agent.name.slice(0, 2).toUpperCase()}</text></svg>`)}`}
                                  alt={agent.name}
                                  className="w-14 h-14 rounded-full object-cover"
                                />
                              </div>
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 p-0.5 bg-brand-interactive text-white rounded-full shadow-sm border border-white dark:border-[#161616]">
                              <ShieldCheck className="w-3 h-3" />
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-base text-[#1A1A1A] dark:text-white truncate">
                                {agent.name}
                              </h4>
                              <div className="flex items-center text-xs font-black text-amber-500">
                                <Star className="w-3.5 h-3.5 fill-current mr-0.5" />
                                <span>{(agent.rating ?? 5.0).toFixed(1)}</span>
                              </div>
                            </div>
                            <div className="text-xs text-brand-interactive font-medium truncate">
                              {agent.specialty}
                            </div>
                            <div className="flex items-center space-x-2 text-[11px] text-[#6C757D] dark:text-[#888] mt-1">
                              <span className="flex items-center">
                                <MapPin className="w-3 h-3 mr-0.5" />
                                {agent.location || 'Nigeria'}
                              </span>
                              <span>•</span>
                              <span>{agent.experience || 3}+ yrs exp</span>
                            </div>
                          </div>
                        </div>

                        {agent.bio && (
                          <p className="text-xs text-[#6C757D] dark:text-[#A0A0A0] line-clamp-2 mb-4 relative z-10">
                            {agent.bio}
                          </p>
                        )}

                        <div className="pt-3 border-t border-[#E9ECEF] dark:border-[#222] flex items-center justify-between relative z-10">
                          <Link
                            to={`/agent/${agent.id}`}
                            className="text-xs font-bold text-[#6C757D] dark:text-[#A0A0A0] hover:text-brand-interactive transition-colors"
                          >
                            View Portfolio
                          </Link>

                          <button
                            onClick={() => handleBookSpecialist(agent)}
                            className="px-4 py-2 rounded-xl bg-brand-interactive text-white text-xs font-black shadow-md shadow-brand-interactive/20 hover:bg-brand-interactive/90 active:scale-95 transition-all cursor-pointer flex items-center space-x-1"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Book Now</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white dark:bg-[#161616] rounded-3xl border border-[#E9ECEF] dark:border-[#262626]">
                    <p className="text-sm text-[#6C757D]">No specialists found matching "{search}".</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        ) : (
          /* =========================================================================
             STANDARD HOME SECTIONS (Rendered when no search is active)
             ========================================================================= */
          <>
            {/* --- 2. UPCOMING BOOKING BANNER (Bolt-Style Dispatch Alert) --- */}
            {(upcomingBooking || (typeof window !== 'undefined' && window.location.search.includes('previewBooking'))) && (() => {
              const booking = upcomingBooking || {
                id: 'preview-bolt-1',
                serviceId: 'srv-1',
                serviceName: 'Knotless Box Braids (Waist Length)',
                serviceImage: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=600',
                customerId: 'cust-1',
                customerName: 'Chiamaka',
                customerAvatar: '',
                customerPhone: '+2348012345678',
                agentId: 'agent-1',
                agentName: 'Chioma Okafor',
                agentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400',
                date: 'Saturday, Oct 18',
                time: '2:30 PM',
                price: 25000,
                status: BookingStatus.CONFIRMED,
                address: '14 Admiralty Way, Lekki Phase 1, Lagos',
                notes: 'Please buzz apartment 4B at the gate.',
                createdAt: new Date().toISOString()
              };

              const agentInfo = assignedAgent || (booking.agentName ? {
                id: booking.agentId,
                name: booking.agentName,
                avatar: booking.agentAvatar,
                rating: 4.9,
                reviewsCount: 38,
                specialty: 'Master Braider & Stylist',
                phone: booking.customerPhone
              } : null);

              return (
                <motion.section
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-10 p-4 sm:p-6 rounded-3xl bg-white dark:bg-[#161616] border-2 border-brand-interactive/35 shadow-[0_8px_30px_rgba(108,53,166,0.12)] relative overflow-hidden app-upcoming-banner"
                >
                  {/* Bolt-Style Ambient Glow Decoration */}
                  <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-brand-interactive/15 via-purple-500/5 to-transparent rounded-full blur-3xl pointer-events-none -mr-24 -mt-24" />

                  {/* Bolt Alert Header Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E9ECEF] dark:border-[#262626]">
                    <div className="flex items-center space-x-3.5">
                      {/* Bell Icon in Glowing Squircle with active radar dot */}
                      <div className="app-banner-bell w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-brand-interactive/10 dark:bg-brand-interactive/25 flex items-center justify-center shrink-0 border border-brand-interactive/30 shadow-inner relative">
                        <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-brand-interactive dark:text-brand-accent animate-[bounce_2.8s_ease-in-out_infinite]" />
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#161616]" />
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping opacity-75" />
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-brand-interactive dark:text-brand-accent">
                            Appointment Alert
                          </span>
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-interactive animate-pulse" />
                          <span className="text-[11px] text-[#6C757D] dark:text-[#A0A0A0] hidden sm:inline">
                            Live Pro Booking
                          </span>
                        </div>
                        <h2 className="app-banner-title text-base sm:text-xl font-serif font-black text-[#1A1A1A] dark:text-white leading-tight">
                          {booking.serviceName}
                        </h2>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <div className="flex items-center space-x-2 self-start sm:self-center">
                      {booking.status === BookingStatus.CONFIRMED ? (
                        <span className="app-banner-badge px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center space-x-1.5 shadow-sm">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Confirmed & Scheduled</span>
                        </span>
                      ) : (
                        <span className="app-banner-badge px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center space-x-1.5 shadow-sm">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Awaiting Specialist</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bolt Dispatch Body: Service & Specialist Info */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 py-4 items-center">
                    {/* Left Col: Service Image & Scheduled Timing & Fare */}
                    <div className="lg:col-span-7 flex items-start space-x-3.5 sm:space-x-4">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-brand-interactive/10 shrink-0 border border-brand-interactive/25 shadow-md">
                        {booking.serviceImage ? (
                          <img
                            src={booking.serviceImage}
                            alt={booking.serviceName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-brand-interactive font-black text-sm">
                            EB
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Date, Time & Price chips */}
                        <div className="flex flex-wrap items-center gap-2 app-banner-meta">
                          <div className="flex items-center px-2.5 py-1 rounded-xl bg-brand-surface dark:bg-[#202020] text-xs font-bold text-[#1A1A1A] dark:text-white border border-[#E9ECEF] dark:border-[#2D2D2D] shadow-sm">
                            <CalendarIcon className="w-3.5 h-3.5 mr-1.5 text-brand-interactive" />
                            <span>{booking.date || 'Today'}</span>
                          </div>
                          <div className="flex items-center px-2.5 py-1 rounded-xl bg-brand-surface dark:bg-[#202020] text-xs font-bold text-[#1A1A1A] dark:text-white border border-[#E9ECEF] dark:border-[#2D2D2D] shadow-sm">
                            <Clock className="w-3.5 h-3.5 mr-1.5 text-brand-interactive" />
                            <span>{booking.time || '10:00 AM'}</span>
                          </div>
                          <div className="px-2.5 py-1 rounded-xl bg-black/5 dark:bg-white/10 text-[#111111] dark:text-white text-xs font-black border border-black/10 dark:border-white/10 shadow-sm">
                            ₦{(booking.price || 0).toLocaleString()}
                          </div>
                        </div>

                        {/* Destination Address */}
                        <div className="flex items-center text-xs text-[#6C757D] dark:text-[#A0A0A0] mt-2.5 app-banner-meta">
                          <MapPin className="w-3.5 h-3.5 mr-1.5 text-brand-interactive shrink-0" />
                          <span className="truncate font-medium">
                            Location: {booking.address || userLocation || 'Client Residence (Lagos)'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Col: Assigned Specialist (Bolt Driver Card style) */}
                    <div className="lg:col-span-5 bg-brand-surface dark:bg-[#1F1F1F] p-3 sm:p-3.5 rounded-2xl border border-brand-interactive/20 flex items-center justify-between gap-3 shadow-inner">
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="relative">
                          <img
                            src={
                              (agentInfo as any)?.avatar ||
                              (agentInfo as any)?.image ||
                              booking.agentAvatar ||
                              `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#6C35A6" /><text x="50%" y="50%" fill="white" font-family="sans-serif" font-size="40" font-weight="bold" text-anchor="middle" dominant-baseline="central">${((agentInfo as any)?.name || booking.agentName || 'EB').slice(0, 2).toUpperCase()}</text></svg>`)}`
                            }
                            alt={agentInfo?.name || booking.agentName || 'Specialist'}
                            className="w-11 h-11 rounded-2xl object-cover border-2 border-white dark:border-[#2A2A2A] shadow-sm shrink-0"
                          />
                          <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-[#1F1F1F]" />
                        </div>

                        <div className="min-w-0">
                          <div className="text-[10px] uppercase font-bold text-[#6C757D] dark:text-[#A0A0A0]">
                            Assigned Specialist
                          </div>
                          <div className="text-xs sm:text-sm font-bold text-[#1A1A1A] dark:text-white truncate">
                            {agentInfo?.name || booking.agentName || 'Verified Specialist'}
                          </div>
                          <div className="flex items-center text-[11px] text-amber-500 font-bold">
                            <Star className="w-3 h-3 fill-current mr-0.5" />
                            <span>{(agentInfo?.rating || 4.9).toFixed(1)}</span>
                            <span className="text-[#6C757D] dark:text-[#888] ml-1 font-normal">• Verified Pro</span>
                          </div>
                        </div>
                      </div>

                      {(agentInfo?.phone || booking.customerPhone) && (
                        <a
                          href={`tel:${agentInfo?.phone || booking.customerPhone}`}
                          className="p-2.5 rounded-xl bg-brand-interactive text-white hover:bg-brand-interactive/90 active:scale-95 transition-all shadow-md shrink-0 flex items-center justify-center cursor-pointer"
                          title="Call Specialist"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Bolt Reassurance & Action Bar */}
                  <div className="mt-2 pt-3 border-t border-[#E9ECEF] dark:border-[#262626] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <p className="text-[11px] text-[#6C757D] dark:text-[#A0A0A0]">
                      Your beauty specialist arrives fully equipped with sanitary kits. Please ensure gate clearance.
                    </p>

                    <div className="flex items-center space-x-2 shrink-0">
                      <Link
                        to="/customer/dashboard"
                        className="px-4 py-2.5 bg-brand-interactive hover:bg-brand-interactive/90 text-white text-xs font-black rounded-xl transition-all flex items-center space-x-1.5 shadow-md shadow-brand-interactive/25 active:scale-95 btn-mobile-scale"
                      >
                        <span>Manage Appointment</span>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </motion.section>
              );
            })()}

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
                    className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 border app-cat-pill ${
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
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-brand-interactive uppercase tracking-wider app-section-tag">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Instant Pick</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-serif font-black text-[#1A1A1A] dark:text-white app-section-title">
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
                    className="w-[280px] sm:w-[320px] app-quickstrip-card shrink-0 snap-start bg-white dark:bg-[#161616] rounded-3xl border border-[#E9ECEF] dark:border-[#2D2D2D] hover:border-brand-interactive transition-all shadow-md hover:shadow-xl hover:shadow-brand-interactive/10 flex flex-col overflow-hidden"
                  >
                    {/* Image / Header */}
                    <div className="relative h-44 overflow-hidden bg-gray-900">
                      {isVideoUrl(service.image) ? (
                        <div className="w-full h-full relative bg-gray-950 flex items-center justify-center">
                          <video
                            src={service.image}
                            preload="none"
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
                            <span className="px-2.5 py-1 bg-black/70 backdrop-blur-md rounded-lg text-white text-[10px] font-black flex items-center space-x-1.5 shadow-md">
                              <span>Video</span>
                            </span>
                          </div>
                        </div>
                      ) : (
                        <img
                          src={service.image || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=600'}
                          alt={service.name}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                      )}
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-xl text-[10px] font-black bg-white/95 dark:bg-black/95 backdrop-blur-md text-brand-interactive shadow-md border border-brand-interactive/25">
                        {service.category}
                      </div>
                      <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-xl text-xs font-black bg-black/75 backdrop-blur-md text-white shadow-md">
                        ₦{service.price.toLocaleString()}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-serif font-bold text-base text-[#1A1A1A] dark:text-white line-clamp-1 mb-1 app-card-title">
                        {service.name}
                      </h3>
                      <p className="text-xs text-[#6C757D] dark:text-[#A0A0A0] line-clamp-2 mb-3 app-card-desc">
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
                          className="px-3.5 py-1.5 rounded-xl bg-brand-interactive text-white text-xs font-black hover:bg-brand-interactive/90 active:scale-95 transition-all shadow-sm shadow-brand-interactive/20 cursor-pointer btn-mobile-scale"
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
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-brand-interactive uppercase tracking-wider app-section-tag">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified Professionals</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-serif font-black text-[#1A1A1A] dark:text-white app-section-title">
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
                    className="p-5 rounded-3xl bg-white dark:bg-[#161616] border border-[#E9ECEF] dark:border-[#2D2D2D] hover:border-brand-interactive/40 transition-all shadow-sm flex flex-col justify-between relative overflow-hidden group"
                  >
                    {/* Translucent Banner Backdrop in that 15% sweet spot */}
                    <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none z-0">
                      {agent.banner && agent.banner.trim() !== '' ? (
                        <img
                          src={agent.banner}
                          alt=""
                          className="w-full h-full object-cover opacity-15 dark:opacity-15 filter blur-[0.5px] scale-105 group-hover:scale-110 transition-transform duration-700"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-brand-interactive/10 via-purple-500/5 to-transparent" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-b from-white/96 via-white/92 to-white/98 dark:from-[#161616]/96 dark:via-[#161616]/92 dark:to-[#161616]/98 backdrop-blur-[1px]" />
                    </div>

                    <div className="flex items-start space-x-3.5 relative z-10">
                      {/* Round circle avatar with brand Instagram gradient ring */}
                      <div className="relative shrink-0">
                        <div className="p-[2.5px] rounded-full bg-gradient-to-tr from-[#32104D] via-[#6C35A6] to-[#F43F5E] shadow-sm">
                          <div className="p-0.5 bg-white dark:bg-[#161616] rounded-full">
                            <img
                              src={agent.image || agent.avatar || `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#6C35A6" /><text x="50%" y="50%" fill="white" font-family="sans-serif" font-size="40" font-weight="bold" text-anchor="middle" dominant-baseline="central">${agent.name.slice(0, 2).toUpperCase()}</text></svg>`)}`}
                              alt={agent.name}
                              className="w-14 h-14 app-agent-avatar rounded-full object-cover"
                            />
                          </div>
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 p-0.5 bg-brand-interactive text-white rounded-full shadow-[0_0_8px_rgba(108,53,166,0.4)] border border-white dark:border-[#161616]">
                          <ShieldCheck className="w-3 h-3" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-sm sm:text-base text-[#1A1A1A] dark:text-white truncate app-card-title">
                            {agent.name}
                          </h4>
                          <div className="flex items-center text-xs font-black text-amber-500">
                            <Star className="w-3.5 h-3.5 fill-current mr-0.5" />
                            <span>{(agent.rating ?? 5.0).toFixed(1)}</span>
                          </div>
                        </div>
                        <div className="text-xs text-brand-interactive font-medium truncate">
                          {agent.specialty}
                        </div>
                        <div className="flex items-center space-x-2 text-[11px] text-[#6C757D] dark:text-[#888] mt-1 app-card-meta">
                          <span className="flex items-center">
                            <MapPin className="w-3 h-3 mr-0.5" />
                            {agent.location || 'Lagos'}
                          </span>
                          <span>•</span>
                          <span>{agent.experience || 3}+ yrs exp</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#E9ECEF] dark:border-[#262626] flex items-center justify-between relative z-10">
                      <Link
                        to={`/agent/${agent.id}`}
                        className="text-xs font-bold text-[#6C757D] dark:text-[#A0A0A0] hover:text-brand-interactive transition-colors"
                      >
                        View Portfolio
                      </Link>

                      <button
                        onClick={() => handleBookSpecialist(agent)}
                        className="px-3.5 py-1.5 rounded-xl bg-brand-interactive hover:bg-brand-interactive/90 text-white text-xs font-black transition-all cursor-pointer btn-mobile-scale shadow-md shadow-brand-interactive/20 flex items-center space-x-1"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Book Now</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* --- 6. ALL SERVICES (TACTILE PAGINATION) --- */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-brand-interactive uppercase tracking-wider app-section-tag">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Curated Menu</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-serif font-black text-[#1A1A1A] dark:text-white app-section-title">
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
          </>
        )}

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
