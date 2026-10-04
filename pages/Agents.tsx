import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Star, ShieldCheck, MapPin, Award, ArrowRight, Sparkles, Briefcase, Users, ChevronLeft, ChevronRight, ArrowUp, RefreshCw, AlertCircle, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Agent } from '../types';
import { getAgents } from '../services/supabaseService';

const Agents: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [sortBy, setSortBy] = useState('relevance');
  const [currentPage, setCurrentPage] = useState(1);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const ITEMS_PER_PAGE = 12;

  const loadData = async () => {
    setLoading(true);
    setError(null);
    const res = await getAgents();
    if (res.error) {
      setError(res.error);
    } else {
      setAgents(res.data);
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

  // Derive specializations dynamically from real registered agents
  const specializations = useMemo(() => {
    const unique = Array.from(new Set(agents.map(a => a.specialty).filter(Boolean)));
    return ['All', ...unique];
  }, [agents]);

  const filteredAgents = useMemo(() => {
    return agents.filter(agent => {
      const searchLower = search.toLowerCase();
      const matchesSearch = 
        agent.name.toLowerCase().includes(searchLower) ||
        agent.specialty.toLowerCase().includes(searchLower) ||
        agent.bio.toLowerCase().includes(searchLower) ||
        agent.location.toLowerCase().includes(searchLower);
      const matchesSpecialty = selectedSpecialty === 'All' || agent.specialty.toLowerCase() === selectedSpecialty.toLowerCase();
      return matchesSearch && matchesSpecialty;
    }).sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'experience') return b.experience - a.experience;
      return 0;
    });
  }, [agents, search, selectedSpecialty, sortBy]);

  const paginatedAgents = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAgents.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAgents, currentPage]);

  const totalPages = Math.ceil(filteredAgents.length / ITEMS_PER_PAGE) || 1;

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
    <div className="pt-16 sm:pt-20 md:pt-24 pb-12 sm:pb-16 md:pb-24 min-h-screen bg-[#F8F9FA] dark:bg-[#0D0D0D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <header className="mb-8 sm:mb-12 md:mb-16 text-center lg:text-left flex flex-col lg:flex-row items-center justify-between gap-8 sm:gap-10 md:gap-12">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center px-4 py-2 bg-rosePink/10 text-rosePink rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 shadow-sm"
            >
              <Users className="w-4 h-4 mr-2" /> Elite Professionals
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-serif font-bold mb-4 sm:mb-6 leading-tight text-[#1A1A1A] dark:text-white"
            >
              Meet Verified <span className="text-rosePink italic">Beauty</span> Specialists
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
            <div className="p-4 sm:p-6 md:p-8 bg-white dark:bg-[#1A1A1A] rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] shadow-lg sm:shadow-xl border border-transparent hover:border-rosePink/20 transition-all text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-serif font-black text-rosePink mb-1 sm:mb-2">{agents.length}</div>
              <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[#6C757D]">Active Artists</div>
            </div>
            <div className="p-4 sm:p-6 md:p-8 bg-rosePink text-white rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] shadow-lg sm:shadow-xl shadow-rosePink/20 transition-all text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-serif font-black mb-1 sm:mb-2">
                {averageRating > 0 ? `${averageRating} ★` : 'Top Rated'}
              </div>
              <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest opacity-80">Quality Standard</div>
            </div>
          </motion.div>
        </header>

        {/* Error Alert */}
        {error && (
          <div className="mb-8 p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3 text-red-600 dark:text-red-400">
              <AlertCircle className="w-6 h-6 flex-shrink-0" />
              <span className="font-medium text-sm">Error querying artists: {error}</span>
            </div>
            <button
              onClick={loadData}
              className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-red-700 transition-all flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Search & Filter Bar */}
        <section className="mb-8 sm:mb-12 md:mb-16 bg-[#F8F9FA] dark:bg-[#0D0D0D] pb-4">
          <div className="space-y-3 sm:space-y-4 md:space-y-6">
            {/* Search Bar */}
            <div className="relative group">
              <Search className="absolute left-3 sm:left-4 md:left-6 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-[#6C757D] group-focus-within:text-rosePink transition-colors" />
              <input
                type="text"
                placeholder="Search beauty specialists by name, specialty, location..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 sm:pl-12 md:pl-14 pr-3 sm:pr-4 py-3 sm:py-3.5 bg-white dark:bg-[#1A1A1A] border-2 border-transparent focus:border-rosePink rounded-xl md:rounded-2xl outline-none transition-all shadow-lg text-sm md:text-base font-medium text-[#1A1A1A] dark:text-white"
              />
            </div>

            {/* Sort & Filter Controls */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center space-x-3 bg-white dark:bg-[#1A1A1A] px-4 py-2 rounded-full shadow-md border border-rosePink/20">
                <div className="bg-rosePink/10 p-1.5 rounded-full">
                  <MapPin className="w-4 h-4 text-rosePink" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-black text-[#6C757D] tracking-widest leading-none mb-0.5">Filter & Sort</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent text-[#1A1A1A] dark:text-white outline-none cursor-pointer font-bold text-xs sm:text-sm hover:text-rosePink transition-colors appearance-none pr-4"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="rating">Highest Rated</option>
                    <option value="experience">Most Experienced</option>
                  </select>
                </div>
              </div>

              <div className="text-xs text-[#6C757D] font-bold">
                Showing <span className="text-rosePink font-black">{filteredAgents.length}</span> artists
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
                      className={`px-3 sm:px-5 md:px-8 py-2 sm:py-3 md:py-4 rounded-xl md:rounded-[1.5rem] text-sm font-black transition-all whitespace-nowrap ${
                        selectedSpecialty.toLowerCase() === spec.toLowerCase() 
                          ? 'bg-rosePink text-white shadow-lg' 
                          : 'text-[#6C757D] hover:text-rosePink'
                      }`}
                    >
                      {spec}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Agents Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-96 bg-white dark:bg-[#1A1A1A] rounded-3xl animate-pulse p-8 border border-[#E9ECEF] dark:border-[#2D2D2D] flex flex-col items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-white/5 mb-4" />
                <div className="h-4 bg-gray-200 dark:bg-white/5 rounded w-1/2 mb-2" />
                <div className="h-3 bg-gray-200 dark:bg-white/5 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 md:gap-8 lg:gap-10 mb-12">
            {filteredAgents.length > 0 ? (
              paginatedAgents.map((agent, idx) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  viewport={{ once: true }}
                  className="group relative bg-white dark:bg-[#1A1A1A] rounded-3xl md:rounded-[3rem] overflow-hidden border border-[#E9ECEF] dark:border-[#2D2D2D] hover:border-rosePink transition-all duration-500 shadow-lg sm:shadow-xl hover:shadow-2xl hover:-translate-y-2 flex flex-col justify-between"
                >
                  {/* Banner Area */}
                  <div className="relative h-32 sm:h-40 overflow-hidden bg-gray-900">
                    {agent.banner ? (
                      <img src={agent.banner} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-rosePink/20 via-black to-black" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#1A1A1A] via-transparent to-transparent" />
                  </div>

                  {/* Profile Info Overlay */}
                  <div className="px-4 sm:px-6 md:px-10 pb-6 sm:pb-8 md:pb-10 -mt-12 sm:-mt-16 relative z-10 text-center flex-grow flex flex-col justify-between">
                    <div>
                      <div className="relative inline-block mb-4 sm:mb-5">
                        {agent.image ? (
                          <img
                            src={agent.image}
                            className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl md:rounded-[2rem] object-cover border-4 border-white dark:border-[#1A1A1A] shadow-xl transition-transform duration-500 group-hover:scale-105"
                            alt={agent.name}
                          />
                        ) : (
                          <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl md:rounded-[2rem] bg-rosePink/10 text-rosePink flex items-center justify-center border-4 border-white dark:border-[#1A1A1A] shadow-xl mx-auto">
                            <User className="w-10 h-10" />
                          </div>
                        )}
                        {agent.verificationStatus === 'VERIFIED' && (
                          <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 text-white rounded-xl flex items-center justify-center border-2 border-white dark:border-[#1A1A1A] shadow-lg">
                            <ShieldCheck className="w-4 h-4" />
                          </div>
                        )}
                      </div>

                      <h3 className="text-2xl md:text-3xl font-serif font-bold mb-1 group-hover:text-rosePink transition-colors text-[#1A1A1A] dark:text-white line-clamp-1">{agent.name}</h3>
                      <div className="text-rosePink font-black uppercase tracking-[0.15em] text-[10px] sm:text-[11px] mb-4 flex items-center justify-center">
                        <Award className="w-3.5 h-3.5 mr-1" /> {agent.specialty}
                      </div>

                      <div className="grid grid-cols-3 gap-2 mb-6">
                        <div className="text-center">
                          <div className="text-base font-black text-[#1A1A1A] dark:text-white flex items-center justify-center">
                            <Star className={`w-3.5 h-3.5 mr-0.5 ${agent.rating > 0 ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`} />
                            {agent.rating > 0 ? agent.rating : 'New'}
                          </div>
                          <div className="text-[9px] text-[#6C757D] font-bold uppercase tracking-wider">Rating</div>
                        </div>
                        <div className="text-center border-x border-[#E9ECEF] dark:border-[#2D2D2D]">
                          <div className="text-base font-black text-[#1A1A1A] dark:text-white">{agent.experience}y</div>
                          <div className="text-[9px] text-[#6C757D] font-bold uppercase tracking-wider">Experience</div>
                        </div>
                        <div className="text-center">
                          <div className="text-base font-black text-[#1A1A1A] dark:text-white">{agent.services.length}</div>
                          <div className="text-[9px] text-[#6C757D] font-bold uppercase tracking-wider">Services</div>
                        </div>
                      </div>
                    </div>

                    <Link
                      to={`/agent/${agent.id}`}
                      className="w-full py-3.5 md:py-4 bg-[#F8F9FA] dark:bg-[#0D0D0D] text-[#1A1A1A] dark:text-white rounded-2xl font-black text-xs hover:bg-rosePink hover:text-white transition-all flex items-center justify-center gap-2 group/btn shadow-inner mt-auto"
                    >
                      <span>View Artist Profile</span>
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-16 sm:py-24 md:py-32 text-center bg-white dark:bg-[#1A1A1A] rounded-3xl md:rounded-[4rem] border border-[#E9ECEF] dark:border-[#2D2D2D] p-8 shadow-lg">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-rosePink/10 rounded-full flex items-center justify-center mx-auto mb-6 text-rosePink">
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
                    className="px-6 py-3 bg-rosePink text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-rosePink/20 hover:scale-105 transition-all"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Join CTA for Agents */}
        <section className="mt-16 sm:mt-24 md:mt-32 p-6 sm:p-10 md:p-16 lg:p-24 bg-rosePink rounded-[3rem] md:rounded-[4rem] lg:rounded-[5rem] text-white relative overflow-hidden shadow-xl shadow-rosePink/30">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-white/10 -skew-x-12 translate-x-32 hidden md:block" />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 items-center gap-8 sm:gap-12 md:gap-16">
            <div>
              <motion.div {...fadeInUp} className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-white/20 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-4 sm:mb-6 md:mb-8 border border-white/30">
                <Briefcase className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" /> Elite Expansion
              </motion.div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-serif font-bold mb-4 sm:mb-6 md:mb-8 leading-tight">Are you an elite <br /> beauty artist?</h2>
              <p className="text-sm sm:text-lg md:text-xl lg:text-2xl text-white/80 mb-6 sm:mb-8 md:mb-12 font-medium leading-relaxed">
                Join our vetted community and receive bookings from high-end clientele nationwide with zero hassle.
              </p>
              <Link to="/auth" className="inline-flex items-center px-6 sm:px-8 md:px-10 lg:px-12 py-3 sm:py-4 md:py-5 lg:py-6 bg-white text-rosePink rounded-2xl md:rounded-[2rem] font-black text-sm sm:text-base md:text-lg lg:text-xl hover:bg-[#F8F9FA] transition-all transform hover:scale-105 shadow-xl">
                Become a Partner <Sparkles className="ml-2 sm:ml-3 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
              </Link>
            </div>
            <div className="hidden lg:flex justify-center">
              <div className="relative w-80 h-80">
                <div className="absolute inset-0 bg-white/10 rounded-full animate-ping" />
                <div className="absolute inset-4 bg-white/20 rounded-full animate-pulse" />
                <div className="absolute inset-12 bg-white rounded-full flex items-center justify-center shadow-2xl">
                  <Sparkles className="w-24 h-24 text-rosePink" />
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
            className="fixed bottom-8 right-8 z-50 p-4 bg-rosePink text-white rounded-full shadow-[0_10px_20px_rgba(255,138,157,0.4)] hover:bg-[#E57B8D] transition-all transform hover:-translate-y-1"
          >
            <ArrowUp className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Agents;
