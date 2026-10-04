import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Star, Users, Calendar, MessageSquare, Grid, Award, Instagram, Twitter, Linkedin, Phone, MapPin, CheckCircle, AlertCircle, Play, User } from 'lucide-react';
import { Agent, Service, VerificationStatus } from '../types';
import { getAgentById, getServices, isVideoUrl } from '../services/supabaseService';
import BookingModal from '../components/BookingModal';

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
          <p className="text-sm text-[#6C757D] mb-6">{error || 'This professional profile does not exist or has been removed.'}</p>
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
      <div className="relative h-64 md:h-96 overflow-hidden bg-gray-900">
        {agent.banner ? (
          <img src={agent.banner} className="w-full h-full object-cover" alt={agent.name} />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-rosePink/20 via-black to-black" />
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
              <div className="flex flex-col items-center text-center mb-6 sm:mb-8">
                <div className="relative mb-4 sm:mb-6">
                  {agent.image ? (
                    <img src={agent.image} className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 sm:border-8 border-white dark:border-[#1A1A1A] shadow-xl" alt={agent.name} />
                  ) : (
                    <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-rosePink/10 text-rosePink flex items-center justify-center border-4 sm:border-8 border-white dark:border-[#1A1A1A] shadow-xl">
                      <User className="w-16 h-16" />
                    </div>
                  )}
                  {agent.verificationStatus === VerificationStatus.VERIFIED && (
                    <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 w-8 h-8 sm:w-10 sm:h-10 bg-green-500 text-white rounded-full flex items-center justify-center border-2 sm:border-4 border-white dark:border-[#1A1A1A] shadow-lg" title="Verified Professional">
                      <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold mb-1 text-[#1A1A1A] dark:text-white">{agent.name}</h1>
                <p className="text-rosePink font-bold mb-3 sm:mb-4 uppercase tracking-widest text-xs">{agent.specialty}</p>
                <div className="flex items-center space-x-2 bg-rosePink/10 px-3 sm:px-4 py-2 rounded-full mb-6 sm:mb-8">
                  <Star className={`w-4 h-4 ${agent.rating > 0 ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`} />
                  <span className="font-bold text-rosePink">{agent.rating > 0 ? agent.rating : 'New'}</span>
                  {agent.reviews > 0 && (
                    <span className="text-rosePink/70 text-sm">({agent.reviews} reviews)</span>
                  )}
                </div>

                {services.length > 0 && (
                  <button 
                    onClick={() => setSelectedServiceForBooking(services[0])}
                    className="w-full py-3 sm:py-4 bg-rosePink text-white rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base shadow-lg shadow-rosePink/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center space-x-2"
                  >
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Book Service</span>
                  </button>
                )}
              </div>

              <div className="space-y-4 sm:space-y-6 pt-6 sm:pt-8 border-t border-[#E9ECEF] dark:border-[#2D2D2D]">
                <div>
                  <h4 className="text-xs font-bold text-[#6C757D] uppercase tracking-widest mb-3 sm:mb-4">Verified Profile</h4>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="p-3 sm:p-4 bg-[#F8F9FA] dark:bg-[#252525] rounded-xl sm:rounded-2xl text-center">
                      <div className="text-lg sm:text-xl font-serif font-bold text-rosePink">{agent.experience}y</div>
                      <div className="text-[10px] text-[#6C757D] uppercase font-bold">Experience</div>
                    </div>
                    <div className="p-3 sm:p-4 bg-[#F8F9FA] dark:bg-[#252525] rounded-xl sm:rounded-2xl text-center">
                      <div className="text-lg sm:text-xl font-serif font-bold text-rosePink">{services.length}</div>
                      <div className="text-[10px] text-[#6C757D] uppercase font-bold">Active Services</div>
                    </div>
                  </div>
                </div>

                {agent.location && (
                  <div>
                    <h4 className="text-xs font-bold text-[#6C757D] uppercase tracking-widest mb-2">Location & Coverage</h4>
                    <div className="flex items-center space-x-3 text-sm text-[#1A1A1A] dark:text-white">
                      <MapPin className="w-5 h-5 text-rosePink flex-shrink-0" />
                      <span>{agent.location}</span>
                    </div>
                  </div>
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
                  <span>About Me</span>
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
                      className="group flex p-3 sm:p-4 bg-white dark:bg-[#1A1A1A] rounded-xl sm:rounded-[1.5rem] border border-[#E9ECEF] dark:border-[#2D2D2D] hover:border-rosePink transition-all shadow-sm"
                    >
                      {service.image ? (
                        <img src={service.image} className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl object-cover mr-3 sm:mr-4" alt={service.name} />
                      ) : (
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl bg-rosePink/10 text-rosePink flex items-center justify-center mr-3 sm:mr-4 font-bold text-xs">
                          {service.category}
                        </div>
                      )}
                      <div className="flex-grow">
                        <h4 className="font-bold text-base sm:text-lg mb-1 group-hover:text-rosePink transition-colors text-[#1A1A1A] dark:text-white">{service.name}</h4>
                        <div className="text-rosePink font-bold">₦{service.price.toLocaleString()}</div>
                        <div className="flex items-center mt-2 text-xs text-[#6C757D]">
                          <Star className={`w-3 h-3 mr-1 ${service.rating > 0 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                          <span>{service.rating > 0 ? service.rating : 'New'} ({service.reviewCount})</span>
                        </div>
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
                        <div className="relative w-full h-full bg-black">
                          <video src={item.url} className="w-full h-full object-cover" controls={false} />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <Play className="w-8 h-8 text-white" />
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
