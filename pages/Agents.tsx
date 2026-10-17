import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Star, ShieldCheck, MapPin, Award, ArrowRight, Briefcase, Users, ChevronLeft, ChevronRight, ArrowUp, RefreshCw, AlertCircle, User, X, Compass, Tag, Calendar } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Agent, Service } from '../types';
import { getAgents, getServices } from '../services/supabaseService';
import { searchAgentsIntelligently } from '../services/intelligentSearch';
import LoadingState from '../components/LoadingState';
import IntelligentSearchBar from '../components/IntelligentSearchBar';
import BookingModal from '../components/BookingModal';

export function getInitialsSvg(name: string) {
  const initials = name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'A';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#6C35A6" /><text x="50%" y="50%" fill="white" font-family="sans-serif" font-size="40" font-weight="bold" text-anchor="middle" dominant-baseline="central">${initials}</text></svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

const Agents: React.FC = () => {
  const navigate = useNavigate();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [sortBy, setSortBy] = useState('relevance');
  const [currentPage, setCurrentPage] = useState(1);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState<Service | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const ITEMS_PER_PAGE = 12;

  const loadData = async () => {
    if (agents.length === 0) {
      setLoading(true);
    }
    setError(null);
    const [agentRes, servRes] = await Promise.all([
      getAgents(),
      getServices()
    ]);
    if (agentRes.error) {
      setError(agentRes.error);
    } else {
      setAgents(agentRes.data);
    }
    if (servRes.data) {
      setServices(servRes.data);
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

  const handleBookAgent = (agent: Agent) => {
    const agentService = services.find(s => s.agentId === agent.id);
    if (agentService) {
      setSelectedServiceForBooking(agentService);
      setIsBookingModalOpen(true);
    } else {
      navigate(`/agent/${agent.id}`);
    }
  };

  // Derive specializations dynamically from real registered agents
  const specializations = useMemo(() => {
    const unique = Array.from(new Set(agents.map(a => a.specialty).filter(Boolean)));
    return ['All', ...unique];
  }, [agents]);

  const isSearchActive = search.trim().length > 0;

  // Real-time intelligent search evaluation
  const intelligentResult = useMemo(() => {
    if (isSearchActive) {
      return searchAgentsIntelligently(agents, search);
    }
    const matched = agents.filter(agent => {
      const matchesSpecialty = selectedSpecialty === 'All' || agent.specialty.toLowerCase() === selectedSpecialty.toLowerCase();
      return matchesSpecialty;
    });
    return {
      matches: matched,
      isFallback: false,
      detectedCategory: null,
      suggestedQueries: [] as string[],
      message: null as string | null
    };
  }, [agents, search, isSearchActive, selectedSpecialty]);

  const sortedAgents = useMemo(() => {
    const list = [...intelligentResult.matches];
    if (sortBy === 'rating') return list.sort((a, b) => b.rating - a.rating);
    if (sortBy === 'experience') return list.sort((a, b) => b.experience - a.experience);
    return list;
  }, [intelligentResult.matches, sortBy]);

  const paginatedAgents = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedAgents.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedAgents, currentPage]);

  const totalPages = Math.ceil(sortedAgents.length / ITEMS_PER_PAGE) || 1;

  // Real aggregate stats calculated from loaded agents
  const averageRating = useMemo(() => {
    const rated = agents.filter(a => a.rating > 0);
    if (rated.length === 0) return 0;
    const sum = rated.reduce((acc, a) => acc + a.rating, 0);
    return Number((sum / rated.length).toFixed(1));
  }, [agents]);

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <div className="pt-16 sm:pt-20 md:pt-24 pb-12 sm:pb-16 md:pb-24 min-h-screen bg-brand-surface dark:bg-[#0D0D0D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <header className="mb-8 sm:mb-12 md:mb-16 text-center lg:text-left flex flex-col lg:flex-row items-center justify-between gap-8 sm:gap-10 md:gap-12">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center px-4 py-2 bg-brand-interactive/10 text-brand-interactive rounded-xl text-[10px] font-black tracking-[0.2em] mb-6 shadow-sm border border-brand-interactive/20 shadow-[0_0_15px_rgba(108,53,166,0.15)]"
            >
              <Users className="w-4 h-4 mr-2" /> Elite Professionals
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-serif font-bold mb-4 sm:mb-6 leading-tight text-[#1A1A1A] dark:text-white"
            >
              Meet Verified <span className="text-brand-interactive italic">Beauty</span> Specialists
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-base sm:text-lg md:text-xl text-[#6C757D] dark:text-[#B0B0B0] font-medium leading-relaxed"
            >
              Discover vetted, verified beauty experts across Nigeria ready to deliver transformative services to your doorstep.
            </motion.p>
          </div>

          {/* Real Metrics from Database */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 w-full lg:w-auto"
          >
            <div className="p-4 sm:p-6 md:p-8 bg-brand-background dark:bg-[#1A1A1A] rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] shadow-lg sm:shadow-xl border border-transparent hover:border-brand-interactive/20 transition-all text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-serif font-black text-brand-interactive mb-1 sm:mb-2">{agents.length}</div>
              <div className="text-[9px] sm:text-[10px] font-bold text-[#6C757D]">Active Artists</div>
            </div>
            <div className="p-4 sm:p-6 md:p-8 bg-brand-interactive text-white rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] shadow-lg sm:shadow-xl shadow-brand-interactive/20 transition-all text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-serif font-black mb-1 sm:mb-2 flex items-center justify-center space-x-1.5">
                <span>{averageRating > 0 ? averageRating : 'Top Rated'}</span>
                {averageRating > 0 && <Star className="w-5 h-5 sm:w-6 sm:h-6 fill-white text-white inline" />}
              </div>
              <div className="text-[9px] sm:text-[10px] font-bold opacity-80">Quality Standard</div>
            </div>
          </motion.div>
        </header>



        {/* Search & Filter Bar */}
        <section className="mb-8 sm:mb-12 md:mb-16 bg-brand-surface dark:bg-[#0D0D0D] pb-4">
          <div className="space-y-3 sm:space-y-4 md:space-y-6">
            {/* Centered Intelligent Search Bar with live autocomplete & instant preview */}
            <div className="mb-2 px-3 sm:px-4">
              <IntelligentSearchBar
                value={search}
                onChange={(val) => {
                  setSearch(val);
                  setCurrentPage(1);
                }}
                services={services}
                agents={agents}
                placeholder="Search beauty specialists by name, specialty, location..."
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
                        Related artists for <span className="text-[#1A1A1A] dark:text-white font-black">"{search}"</span>
                      </>
                    ) : (
                      <>
                        <span className="text-brand-interactive font-black">{sortedAgents.length}</span> live specialists for{' '}
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
                className="space-y-4"
              >
                {/* Sort & Filter Controls */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center space-x-3 bg-brand-background dark:bg-[#1A1A1A] px-4 py-2.5 rounded-2xl shadow-md border border-brand-interactive/20 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
                    <div className="bg-brand-interactive/10 p-2 rounded-xl text-brand-interactive">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-[#6C757D] leading-none mb-0.5">Filter & Sort</span>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-transparent text-[#1A1A1A] dark:text-white outline-none cursor-pointer font-bold text-xs sm:text-sm hover:text-brand-interactive transition-colors appearance-none pr-4"
                      >
                        <option value="relevance">Relevance</option>
                        <option value="rating">Highest Rated</option>
                        <option value="experience">Most Experienced</option>
                      </select>
                    </div>
                  </div>

                  <div className="text-xs text-[#6C757D] font-bold">
                    Showing <span className="text-brand-interactive font-black">{sortedAgents.length}</span> artists
                  </div>
                </div>

                {/* Specialty Filters */}
                {specializations.length > 1 && (
                  <div className="overflow-x-auto pb-2 scrollbar-hide">
                    <div className="flex bg-white/50 dark:bg-[#1A1A1A]/50 backdrop-blur-xl p-1 sm:p-1.5 md:p-2 rounded-2xl md:rounded-[2rem] border border-[#E9ECEF] dark:border-[#2D2D2D] shadow-lg sm:shadow-xl inline-flex min-w-full sm:min-w-0">
                      {specializations.map(spec => (
                        <button
                          key={spec}
                          onClick={() => {
                            setSelectedSpecialty(spec);
                            setCurrentPage(1);
                          }}
                          className={`px-3 sm:px-5 md:px-8 py-2 sm:py-3 md:py-4 rounded-xl md:rounded-[1.5rem] text-sm font-black transition-all whitespace-nowrap cursor-pointer ${
                            selectedSpecialty.toLowerCase() === spec.toLowerCase() 
                              ? 'bg-brand-interactive text-white shadow-lg' 
                              : 'text-[#6C757D] hover:text-brand-interactive'
                          }`}
                        >
                          {spec}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
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

        {/* Agents Grid */}
        {loading ? (
          <div className="mb-12">
            <LoadingState message="loading agents..." />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6 mb-12">
            {sortedAgents.length > 0 ? (
              paginatedAgents.map((agent, idx) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  viewport={{ once: true }}
                  className="group relative overflow-hidden bg-white dark:bg-[#161616] rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 border border-[#E9ECEF] dark:border-[#262626] hover:border-brand-interactive/50 dark:hover:border-brand-interactive/50 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(108,53,166,0.15)] dark:hover:shadow-[0_12px_32px_rgba(0,0,0,0.6)] hover:-translate-y-1 transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-5"
                >
                  {/* Translucent Banner Backdrop in that 15% sweet spot */}
                  <div className="absolute inset-0 rounded-2xl sm:rounded-3xl overflow-hidden pointer-events-none z-0">
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
                    {/* Glassmorphic Gradient Overlay so text is 100% visible and sharp */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/96 via-white/92 to-white/98 dark:from-[#161616]/96 dark:via-[#161616]/92 dark:to-[#161616]/98 backdrop-blur-[1px]" />
                  </div>

                  {/* Left: Round Avatar with Brand Instagram Gradient Ring */}
                  <div className="relative shrink-0 z-10">
                    <div className="p-[2.5px] rounded-full bg-gradient-to-tr from-[#32104D] via-[#6C35A6] to-[#F43F5E] shadow-md group-hover:shadow-[0_0_15px_rgba(244,63,94,0.35)] transition-all duration-300">
                      <div className="p-0.5 bg-white dark:bg-[#161616] rounded-full">
                        <div className="w-18 h-18 sm:w-20 sm:h-20 md:w-22 md:h-22 rounded-full overflow-hidden bg-brand-surface dark:bg-[#202020]">
                          <img
                            src={agent.image && agent.image.trim() !== '' ? agent.image : getInitialsSvg(agent.name)}
                            alt={agent.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => { e.currentTarget.src = getInitialsSvg(agent.name); }}
                          />
                        </div>
                      </div>
                    </div>
                    {agent.verificationStatus === 'VERIFIED' && (
                      <div 
                        className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-white dark:border-[#161616] shadow-sm"
                        title="Verified Specialist"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                    )}
                  </div>

                  {/* Middle: Details, Specialty, Bio, Stats */}
                  <div className="flex-1 min-w-0 space-y-2 z-10">
                    {/* Header Row: Name & Rating */}
                    <div className="flex items-center justify-between gap-2">
                      <Link 
                        to={`/agent/${agent.id}`}
                        className="text-base sm:text-lg md:text-xl font-serif font-bold text-[#1A1A1A] dark:text-white truncate group-hover:text-brand-interactive transition-colors"
                      >
                        {agent.name}
                      </Link>
                      
                      <div className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-black shrink-0">
                        <Star className={`w-3.5 h-3.5 ${agent.rating > 0 ? 'fill-current' : 'text-gray-300 dark:text-gray-600'}`} />
                        <span>{agent.rating > 0 ? agent.rating.toFixed(1) : 'New'}</span>
                      </div>
                    </div>

                    {/* Specialty & Location */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-black uppercase tracking-wider bg-brand-interactive/10 text-brand-interactive border border-brand-interactive/20">
                        {agent.specialty}
                      </span>
                      {agent.location && (
                        <span className="flex items-center text-xs text-[#6C757D] dark:text-[#A0A0A0]">
                          <MapPin className="w-3 h-3 text-brand-interactive mr-1 shrink-0" />
                          <span className="truncate max-w-[150px]">{agent.location}</span>
                        </span>
                      )}
                    </div>

                    {/* Bio Snippet */}
                    {agent.bio && (
                      <p className="text-xs text-[#6C757D] dark:text-[#B0B0B0] line-clamp-2 leading-relaxed">
                        {agent.bio}
                      </p>
                    )}

                    {/* Compact Inline Stats */}
                    <div className="flex items-center gap-3 pt-1 text-[11px] font-bold text-[#6C757D] dark:text-[#999]">
                      <span className="flex items-center space-x-1">
                        <Briefcase className="w-3 h-3 text-brand-interactive" />
                        <span>{agent.experience}y exp</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        <Award className="w-3 h-3 text-brand-interactive" />
                        <span>{agent.services?.length || 0} services</span>
                      </span>
                      {agent.completedBookings && agent.completedBookings > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-black">
                            {agent.completedBookings} completed
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions (Book Now + View Profile) */}
                  <div className="w-full sm:w-auto shrink-0 flex sm:flex-col items-center justify-between sm:justify-center gap-2 sm:pl-3 sm:border-l sm:border-[#E9ECEF] sm:dark:border-[#262626] z-10">
                    <button
                      onClick={() => navigate(`/agent/${agent.id}?book=true#services`)}
                      className="w-full sm:w-36 px-4 py-2.5 rounded-xl bg-brand-interactive text-white font-black text-xs hover:bg-brand-interactive/90 transition-all flex items-center justify-center space-x-1.5 shadow-md shadow-brand-interactive/25 active:scale-95 cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Book Now</span>
                    </button>
                    <Link
                      to={`/agent/${agent.id}`}
                      className="w-full sm:w-36 px-4 py-2 rounded-xl bg-brand-surface dark:bg-[#202020] text-[#1A1A1A] dark:text-white border border-[#E9ECEF] dark:border-[#333] hover:border-brand-interactive hover:text-brand-interactive font-bold text-xs transition-all flex items-center justify-center space-x-1 active:scale-95 cursor-pointer"
                    >
                      <span>View Profile</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-16 sm:py-24 md:py-32 text-center bg-brand-background dark:bg-[#1A1A1A] rounded-3xl md:rounded-[4rem] border border-[#E9ECEF] dark:border-[#2D2D2D] p-8 shadow-lg">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-brand-interactive/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-brand-interactive shadow-[0_0_20px_rgba(108,53,166,0.15)]">
                  <Search className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold mb-2">No beauty specialists found</h3>
                <p className="text-sm sm:text-base text-[#6C757D] dark:text-[#B0B0B0] max-w-md mx-auto mb-6">
                  {agents.length === 0 
                    ? 'No beauty professionals have registered yet.' 
                    : 'Try refining your search terms or selecting another specialization.'}
                </p>
                {agents.length > 0 && (
                  <button
                    onClick={() => { setSearch(''); setSelectedSpecialty('All'); }}
                    className="px-6 py-3 bg-brand-interactive text-white rounded-xl text-xs font-bold shadow-lg shadow-brand-interactive/20 hover:scale-105 transition-all"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Join CTA for Agents */}
        <section className="mt-16 sm:mt-24 md:mt-32 p-6 sm:p-10 md:p-16 lg:p-24 bg-brand-interactive rounded-[3rem] md:rounded-[4rem] lg:rounded-[5rem] text-white relative overflow-hidden shadow-xl shadow-brand-interactive/30">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-white/10 -skew-x-12 translate-x-32 hidden md:block" />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 items-center gap-8 sm:gap-12 md:gap-16">
            <div>
              <motion.div {...fadeInUp} className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-white/20 rounded-xl text-[9px] sm:text-[10px] font-black tracking-[0.15em] sm:tracking-[0.2em] mb-4 sm:mb-6 md:mb-8 border border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                <Briefcase className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" /> Elite Expansion
              </motion.div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-serif font-bold mb-4 sm:mb-6 md:mb-8 leading-tight">Are you an elite <br /> beauty artist?</h2>
              <p className="text-sm sm:text-lg md:text-xl lg:text-2xl text-white/80 mb-6 sm:mb-8 md:mb-12 font-medium leading-relaxed">
                Join our vetted community and receive bookings from high-end clientele nationwide with zero hassle.
              </p>
              <Link to="/auth" className="inline-flex items-center px-6 sm:px-8 md:px-10 lg:px-12 py-3 sm:py-4 md:py-5 lg:py-6 bg-brand-background text-brand-interactive rounded-2xl md:rounded-[2rem] font-black text-sm sm:text-base md:text-lg lg:text-xl hover:bg-brand-surface transition-all transform hover:scale-105 shadow-xl">
                Become a Partner <ArrowRight className="ml-2 sm:ml-3 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
              </Link>
            </div>
            <div className="hidden lg:flex justify-center">
              <div className="relative w-80 h-80 flex items-center justify-center">
                <div className="absolute inset-0 bg-white/10 rounded-3xl animate-pulse" />
                <div className="relative p-10 bg-brand-background rounded-3xl flex items-center justify-center shadow-2xl">
                  <Award className="w-24 h-24 text-brand-interactive" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Floating Back to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-50 p-4 bg-brand-interactive text-white rounded-2xl shadow-[0_10px_25px_rgba(108,53,166,0.45)] hover:bg-brand-interactive/90 transition-all transform hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(108,53,166,0.6)]"
          >
            <ArrowUp className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Booking Modal */}
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

export default Agents;
