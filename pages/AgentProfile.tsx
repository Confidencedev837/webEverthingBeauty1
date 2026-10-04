import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Star, Users, Calendar, MessageSquare, Grid, Award, Instagram, Twitter, Linkedin, Phone, MapPin, CheckCircle, AlertCircle, Play, User } from 'lucide-react';
import { Agent, Service, VerificationStatus } from '../types';
import { getAgentById, getServices, isVideoUrl } from '../services/supabaseService';
import BookingModal from '../components/BookingModal';

export function getInitialsSvg(name: string) {
  const initials = name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'A';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#FF3366" /><text x="50%" y="50%" fill="white" font-family="sans-serif" font-size="40" font-weight="bold" text-anchor="middle" dominant-baseline="central">${initials}</text></svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

const AgentProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState<Service | null>(null);

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    const [agentRes, allServicesRes] = await Promise.all([
      getAgentById(id),
      getServices()
    ]);

    if (agentRes.error) {
      setError(agentRes.error);
    } else {
      setAgent(agentRes.data);
      if (agentRes.data && allServicesRes.data) {
        const matched = allServicesRes.data.filter(s => s.agentId === agentRes.data?.id || agentRes.data?.services?.includes(s.id));
        setServices(matched);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="pt-24 pb-24 bg-[#F8F9FA] dark:bg-[#0D0D0D] min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-64 md:h-80 bg-gray-200 dark:bg-white/5 rounded-3xl animate-pulse mb-12" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="h-96 bg-gray-200 dark:bg-white/5 rounded-3xl animate-pulse" />
            <div className="lg:col-span-2 h-96 bg-gray-200 dark:bg-white/5 rounded-3xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen pt-32 text-center bg-white dark:bg-[#0D0D0D] px-4">
        <div className="max-w-md mx-auto p-8 bg-white dark:bg-[#1A1A1A] rounded-3xl border border-[#E9ECEF] dark:border-[#2D2D2D] shadow-xl">
          <AlertCircle className="w-12 h-12 text-rosePink mx-auto mb-4" />
          <h2 className="text-2xl font-serif font-bold mb-2">Artist Profile Not Found</h2>
          <p className="text-sm text-[#6C757D] mb-6">This professional profile does not exist or has been removed.</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={loadData}
              className="px-6 py-2.5 bg-rosePink text-white rounded-xl text-xs font-bold uppercase tracking-wider"
            >
              Retry
            </button>
            <Link to="/agents" className="px-6 py-2.5 bg-[#F8F9FA] dark:bg-[#252525] rounded-xl text-xs font-bold uppercase tracking-wider text-[#6C757D]">
              All Specialists
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 bg-[#F8F9FA] dark:bg-[#0D0D0D]">
      {/* Banner */}
      <div className="relative h-64 md:h-96 overflow-hidden bg-gradient-to-r from-rosePink/20 via-rosePink/10 to-transparent">
        {agent.banner && agent.banner.trim() !== '' && (
          <img src={agent.banner} className="w-full h-full object-cover" alt={agent.name} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-20 sm:-mt-32 md:-mt-48 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
          {/* Left Column: Profile Card */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-[#1A1A1A] rounded-2xl sm:rounded-[2.5rem] shadow-2xl p-6 sm:p-8 border border-[#E9ECEF] dark:border-[#2D2D2D]"
            >
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4 sm:mb-6">
                  <img src={agent.image && agent.image.trim() !== '' ? agent.image : getInitialsSvg(agent.name)} className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 sm:border-8 border-white dark:border-[#1A1A1A] shadow-xl" alt={agent.name} onError={(e) => { e.currentTarget.src = getInitialsSvg(agent.name); }} />
                  {agent.verificationStatus === VerificationStatus.VERIFIED && (
                    <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 w-8 h-8 sm:w-10 sm:h-10 bg-green-500 text-white rounded-full flex items-center justify-center border-2 sm:border-4 border-white dark:border-[#1A1A1A] shadow-lg" title="Verified Professional">
                      <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold mb-1 text-[#1A1A1A] dark:text-white">{agent.name}</h1>
                <div className="flex items-center justify-center space-x-1.5 mb-4 text-xs sm:text-sm">
                  <span className="text-[#6C757D] font-medium uppercase tracking-widest text-[10px] sm:text-xs">Specialization:</span>
                  <span className="text-rosePink font-bold uppercase tracking-widest text-[10px] sm:text-xs">{agent.specialty}</span>
                </div>
                
                <div className="flex flex-wrap items-center justify-center gap-2 mb-6 sm:mb-8">
                  <div className="flex items-center space-x-1.5 bg-yellow-400/10 px-3 py-1.5 rounded-full">
                    <Star className={`w-4 h-4 ${agent.rating > 0 ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                    <span className="font-bold text-yellow-600 dark:text-yellow-500 text-xs sm:text-sm">{agent.rating > 0 ? agent.rating : 'New Agent'}</span>
                    {agent.reviews > 0 && <span className="text-yellow-600/70 dark:text-yellow-500/70 text-xs">({agent.reviews})</span>}
                  </div>
                  {agent.verificationStatus === VerificationStatus.VERIFIED && (
                    <div className="flex items-center space-x-1.5 bg-green-500/10 px-3 py-1.5 rounded-full">
                      <ShieldCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span className="font-bold text-green-600 dark:text-green-400 text-xs sm:text-sm">Verified</span>
                    </div>
                  )}
                </div>

                {/* Key Stats Row */}
                <div className="w-full grid grid-cols-3 gap-2 sm:gap-3 mb-6 sm:mb-8 border-y border-[#E9ECEF] dark:border-[#2D2D2D] py-5">
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-2xl sm:text-3xl font-serif font-black text-[#1A1A1A] dark:text-white mb-1">{agent.experience}<span className="text-rosePink text-lg sm:text-xl">y</span></span>
                    <span className="text-[9px] sm:text-[10px] text-[#6C757D] uppercase font-bold tracking-wider">Experience</span>
                  </div>
                  <div className="flex flex-col items-center justify-center border-x border-[#E9ECEF] dark:border-[#2D2D2D]">
                    <span className="text-2xl sm:text-3xl font-serif font-black text-[#1A1A1A] dark:text-white mb-1">{services.length}</span>
                    <span className="text-[9px] sm:text-[10px] text-[#6C757D] uppercase font-bold tracking-wider">Services</span>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <MapPin className="w-6 h-6 sm:w-7 sm:h-7 text-[#1A1A1A] dark:text-white mb-1.5" />
                    <span className="text-[9px] sm:text-[10px] text-[#6C757D] uppercase font-bold tracking-wider truncate w-full px-1">{agent.location || 'N/A'}</span>
                  </div>
                </div>

                {services.length > 0 && (
                  <button 
                    onClick={() => setSelectedServiceForBooking(services[0])}
                    className="w-full py-3.5 sm:py-4 bg-rosePink text-white rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base shadow-lg shadow-rosePink/20 hover:shadow-xl hover:shadow-rosePink/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center space-x-2"
                  >
                    <Calendar className="w-5 h-5" />
                    <span>Book Service</span>
                  </button>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column: Bio, Services, Portfolio */}
          <div className="lg:col-span-2 space-y-8 sm:space-y-12 pb-12 sm:pb-24">
            {/* About */}
            {agent.bio && (
              <section>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold mb-4 sm:mb-6 flex items-center space-x-2 sm:space-x-3 text-[#1A1A1A] dark:text-white">
                  <Users className="w-6 h-6 sm:w-8 sm:h-8 text-rosePink" />
                  <span>Bio</span>
                </h2>
                <div className="p-6 sm:p-8 bg-white dark:bg-[#1A1A1A] rounded-xl sm:rounded-[2rem] border border-[#E9ECEF] dark:border-[#2D2D2D] shadow-sm">
                  <p className="text-base sm:text-lg leading-relaxed text-[#6C757D] dark:text-[#B0B0B0] italic">
                    "{agent.bio}"
                  </p>
                </div>
              </section>
            )}

            {/* Services Offered */}
            <section>
              <div className="flex justify-between items-end mb-6 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl font-serif font-bold flex items-center space-x-2 sm:space-x-3 text-[#1A1A1A] dark:text-white">
                  <Grid className="w-6 h-6 sm:w-8 sm:h-8 text-rosePink" />
                  <span>Services by {agent.name}</span>
                </h2>
              </div>
              {services.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {services.map((service) => (
                    <Link
                      key={service.id}
                      to={`/services/${service.id}`}
                      className="group flex flex-col bg-white dark:bg-[#1A1A1A] rounded-[2rem] border border-[#E9ECEF] dark:border-[#2D2D2D] hover:border-rosePink transition-all duration-500 shadow-xl hover:shadow-2xl hover:-translate-y-2 overflow-hidden"
                    >
                      <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-rosePink/5">
                        {service.image ? (
                          <img src={service.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={service.name} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-rosePink tracking-widest uppercase text-sm">
                            {service.category}
                          </div>
                        )}
                        <div className="absolute top-4 right-4 bg-white/90 dark:bg-black/90 backdrop-blur-md px-4 py-2 rounded-2xl text-sm font-black text-[#1A1A1A] dark:text-white shadow-lg border border-white/20">
                          ₦{service.price.toLocaleString()}
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] uppercase tracking-widest font-bold text-rosePink bg-rosePink/10 px-3 py-1 rounded-full">{service.category}</span>
                          <div className="flex items-center text-xs bg-[#F8F9FA] dark:bg-[#252525] px-3 py-1 rounded-full">
                            <Star className={`w-3.5 h-3.5 mr-1.5 ${service.rating > 0 ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                            <span className="font-bold text-[#1A1A1A] dark:text-white">{service.rating > 0 ? service.rating : 'New'}</span>
                            {service.reviewCount > 0 && <span className="text-[#6C757D] ml-1">({service.reviewCount})</span>}
                          </div>
                        </div>
                        <h4 className="font-bold text-xl sm:text-2xl group-hover:text-rosePink transition-colors text-[#1A1A1A] dark:text-white line-clamp-1">{service.name}</h4>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-8 bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#E9ECEF] dark:border-[#2D2D2D] text-center text-[#6C757D]">
                  <p className="text-sm">This artist has not published any active services yet.</p>
                </div>
              )}
            </section>

            {/* Portfolio Gallery */}
            {agent.gallery && agent.gallery.length > 0 && (
              <section>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold mb-6 sm:mb-8 flex items-center space-x-2 sm:space-x-3 text-[#1A1A1A] dark:text-white">
                  <Grid className="w-6 h-6 sm:w-8 sm:h-8 text-rosePink" />
                  <span>Portfolio & Creations</span>
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                  {agent.gallery.map((item, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 0.98 }}
                      className="aspect-square rounded-xl sm:rounded-[2rem] overflow-hidden shadow-lg relative bg-gray-100 dark:bg-gray-800"
                    >
                      {item.type === 'video' || isVideoUrl(item.url) ? (
                        <div className="relative w-full h-full bg-black group/video">
                          <video src={item.url} autoPlay muted loop playsInline className="w-full h-full object-cover opacity-80 group-hover/video:opacity-100 transition-opacity" controls={false} />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <Play className="w-10 h-10 text-white/50 group-hover/video:text-white/80 transition-colors" />
                          </div>
                        </div>
                      ) : (
                        <img src={item.url} className="w-full h-full object-cover" alt="" />
                      )}
                    </motion.div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

      {selectedServiceForBooking && (
        <BookingModal
          service={selectedServiceForBooking}
          isOpen={true}
          onClose={() => setSelectedServiceForBooking(null)}
        />
      )}
    </div>
  );
};

export default AgentProfile;
