import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { House, Calendar, Heart, User as UserIcon, CreditCard, Bell, LogOut, Search, MapPin, Clock, Star, ArrowRight, CheckCircle, XCircle, AlertCircle, RefreshCw, Sparkles, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { BookingStatus, Booking, Agent } from '../types';
import { useAuth } from '../context/AuthContext';
import { getBookingsForUser, updateBookingStatus, getAgents } from '../services/supabaseService';

const CustomerDashboard: React.FC = () => {
  const { user, currentUser, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [featuredAgents, setFeaturedAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    if (!user) return;
    setLoading(true);
    const [bookingsRes, agentsRes] = await Promise.all([
      getBookingsForUser(user.id, 'customer'),
      getAgents()
    ]);
    if (bookingsRes.data) {
      setBookings(bookingsRes.data);
    }
    if (agentsRes.data) {
      setFeaturedAgents(agentsRes.data.slice(0, 3));
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (user) {
      fetchDashboardData();
    }
  }, [user, authLoading]);

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    setCancellingId(bookingId);
    const ok = await updateBookingStatus(bookingId, BookingStatus.CANCELLED);
    if (ok) {
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: BookingStatus.CANCELLED } : b));
    }
    setCancellingId(null);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  // Filter bookings based on tab
  const activeBookings = bookings.filter(b =>
    b.status === BookingStatus.PENDING || b.status === BookingStatus.CONFIRMED
  );

  const historyBookings = bookings.filter(b =>
    b.status === BookingStatus.COMPLETED || b.status === BookingStatus.CANCELLED
  );

  const currentList = activeTab === 'active' ? activeBookings : historyBookings;

  if (authLoading || (!user && !bookings.length)) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0D0D0D] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-rosePink/30 border-t-rosePink rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0D0D0D] flex pt-20 relative">
      {/* Mobile Menu Toggle */}
      <div className="lg:hidden fixed top-24 right-6 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-3 bg-white dark:bg-[#1A1A1A] rounded-full shadow-lg border border-[#E9ECEF] dark:border-[#2D2D2D] text-rosePink"
        >
          {isMobileMenuOpen ? <XCircle className="w-6 h-6" /> : <div className="p-1"><div className="space-y-1"><div className="w-4 h-0.5 bg-current"></div><div className="w-4 h-0.5 bg-current"></div><div className="w-4 h-0.5 bg-current"></div></div></div>}
        </button>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {(isMobileMenuOpen || window.innerWidth >= 1024) && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className={`
              fixed lg:sticky top-0 lg:top-20 left-0 h-full lg:h-[calc(100vh-80px)] z-40 lg:z-auto
              w-80 bg-white dark:bg-[#111] border-r border-[#E9ECEF] dark:border-[#2D2D2D] p-10
              flex flex-col shadow-2xl lg:shadow-none
              ${isMobileMenuOpen ? 'block' : 'hidden lg:flex'}
            `}
          >
            {/* Mobile Header in Menu */}
            <div className="lg:hidden flex justify-between items-center mb-8">
              <div className="font-serif font-bold text-xl">Menu</div>
              <button onClick={() => setIsMobileMenuOpen(false)}><XCircle className="w-6 h-6 text-[#6C757D]" /></button>
            </div>

            <div className="flex items-center space-x-4 mb-16">
              {currentUser?.avatar ? (
                <img src={currentUser.avatar} className="w-14 h-14 rounded-2xl object-cover shadow-lg" alt="" />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-rosePink/10 text-rosePink flex items-center justify-center font-bold text-lg shadow-lg">
                  <User className="w-7 h-7" />
                </div>
              )}
              <div>
                <div className="font-bold text-lg leading-tight truncate max-w-[160px]">{currentUser?.name || 'Customer'}</div>
                <div className="text-xs text-[#6C757D] font-medium truncate max-w-[160px]">{currentUser?.email}</div>
              </div>
            </div>

            <nav className="flex-grow space-y-4">
              <SidebarItem icon={<House />} label="Overview" active />
              <SidebarItem icon={<Calendar />} label="My Bookings" onClick={() => setActiveTab('active')} />
              <SidebarItem icon={<Heart />} label="Explore Services" onClick={() => navigate('/services')} />
              <SidebarItem icon={<Sparkles />} label="Specialists" onClick={() => navigate('/agents')} />
            </nav>

            <button 
              onClick={handleLogout}
              className="flex items-center space-x-4 p-5 text-rosePink font-black uppercase tracking-widest text-[10px] hover:bg-rosePink/5 rounded-2xl transition-all mt-auto"
            >
              <LogOut className="w-5 h-5" />
              <span>Log Out</span>
            </button>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-grow p-6 sm:p-12 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-serif font-bold mb-2">My Bookings</h1>
            <p className="text-[#6C757D] font-medium">Track your appointments and schedule in real time.</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={fetchDashboardData}
              className="p-4 bg-white dark:bg-[#1A1A1A] border border-[#E9ECEF] dark:border-[#2D2D2D] rounded-2xl text-[#6C757D] hover:text-rosePink transition-all"
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <Link to="/services" className="px-10 py-5 bg-rosePink text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-rosePink/20 hover:scale-105 transition-all">
              Book New Service
            </Link>
          </div>
        </header>

        {/* Real Dynamic Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <StatCard 
            label="Completed Sessions" 
            value={historyBookings.filter(b => b.status === BookingStatus.COMPLETED).length.toString()} 
            color="bg-pink-400" 
          />
          <StatCard 
            label="Upcoming Appointments" 
            value={activeBookings.length.toString()} 
            color="bg-sky-400" 
          />
          <StatCard 
            label="Total Appointments" 
            value={bookings.length.toString()} 
            color="bg-orange-400" 
          />
        </div>

        {/* Bookings Section */}
        <section className="mb-16">
          {/* Tabs */}
          <div className="flex space-x-6 mb-8 border-b border-[#E9ECEF] dark:border-[#2D2D2D]">
            <button
              onClick={() => setActiveTab('active')}
              className={`pb-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'active' ? 'text-rosePink border-b-4 border-rosePink' : 'text-[#6C757D] hover:text-[#1A1A1A] dark:hover:text-white'
                }`}
            >
              Active / Upcoming ({activeBookings.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`pb-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'text-rosePink border-b-4 border-rosePink' : 'text-[#6C757D] hover:text-[#1A1A1A] dark:hover:text-white'
                }`}
            >
              History ({historyBookings.length})
            </button>
          </div>

          <div className="space-y-6">
            {loading ? (
              <div className="space-y-4">
                {[1, 2].map(i => (
                  <div key={i} className="h-36 bg-white dark:bg-[#1A1A1A] rounded-[2.5rem] animate-pulse border border-[#E9ECEF] dark:border-[#2D2D2D] p-6" />
                ))}
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {currentList.length > 0 ? (
                  currentList.map((booking, i) => (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-white dark:bg-[#1A1A1A] rounded-[2.5rem] p-8 shadow-xl border border-[#E9ECEF] dark:border-[#2D2D2D] hover:border-rosePink/20 transition-all group"
                    >
                      <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center">
                        {booking.serviceImage ? (
                          <img src={booking.serviceImage} className="w-24 h-24 rounded-[1.5rem] object-cover shadow-lg" alt="" />
                        ) : (
                          <div className="w-24 h-24 rounded-[1.5rem] bg-rosePink/10 text-rosePink flex items-center justify-center font-bold text-xs p-2 text-center">
                            {booking.serviceName}
                          </div>
                        )}

                        <div className="flex-grow">
                          <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-2">
                            <div>
                              <h3 className="text-xl font-serif font-bold mb-1">{booking.serviceName}</h3>
                              <p className="text-[#6C757D] font-bold text-xs uppercase tracking-widest">by {booking.agentName}</p>
                            </div>

                            {/* Status Badge */}
                            <div className={`mt-2 md:mt-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest inline-flex items-center self-start ${
                              booking.status === BookingStatus.CONFIRMED ? 'bg-green-100 text-green-600' :
                              booking.status === BookingStatus.PENDING ? 'bg-yellow-100 text-yellow-600' :
                              booking.status === BookingStatus.COMPLETED ? 'bg-blue-100 text-blue-600' :
                              'bg-red-100 text-red-500'
                            }`}>
                              {booking.status === BookingStatus.CONFIRMED && <CheckCircle className="w-3 h-3 mr-2" />}
                              {booking.status === BookingStatus.PENDING && <Clock className="w-3 h-3 mr-2" />}
                              {booking.status === BookingStatus.COMPLETED && <CheckCircle className="w-3 h-3 mr-2" />}
                              {booking.status === BookingStatus.CANCELLED && <XCircle className="w-3 h-3 mr-2" />}
                              {booking.status}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                            <div className="flex items-center space-x-3 text-sm font-medium p-3 bg-[#F8F9FA] dark:bg-[#252525] rounded-xl">
                              <Calendar className="w-4 h-4 text-rosePink" />
                              <span>{booking.date || 'Scheduled'}</span>
                            </div>
                            <div className="flex items-center space-x-3 text-sm font-medium p-3 bg-[#F8F9FA] dark:bg-[#252525] rounded-xl">
                              <Clock className="w-4 h-4 text-rosePink" />
                              <span>{booking.time || 'Flexible'}</span>
                            </div>
                            <div className="flex items-center space-x-3 text-sm font-medium p-3 bg-[#F8F9FA] dark:bg-[#252525] rounded-xl">
                              <span className="w-4 h-4 text-green-500 font-bold flex items-center justify-center">₦</span>
                              <span className="text-green-500 font-bold">{booking.price.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="w-full lg:w-auto flex flex-row lg:flex-col gap-3">
                          {booking.status === BookingStatus.PENDING && (
                            <button 
                              onClick={() => handleCancelBooking(booking.id)}
                              disabled={cancellingId === booking.id}
                              className="flex-1 lg:w-40 py-3 bg-[#F8F9FA] dark:bg-[#252525] rounded-xl text-xs font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all flex items-center justify-center"
                            >
                              {cancellingId === booking.id ? 'Cancelling...' : 'Cancel Request'}
                            </button>
                          )}
                          {booking.status === BookingStatus.CONFIRMED && (
                            <>
                              <Link 
                                to={`/agent/${booking.agentId}`}
                                className="flex-1 lg:w-40 py-3 bg-rosePink text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-rosePink/20 hover:scale-105 transition-all text-center"
                              >
                                View Artist
                              </Link>
                              <button 
                                onClick={() => handleCancelBooking(booking.id)}
                                disabled={cancellingId === booking.id}
                                className="flex-1 lg:w-40 py-3 bg-[#F8F9FA] dark:bg-[#252525] rounded-xl text-xs font-bold uppercase tracking-widest text-[#6C757D] hover:bg-gray-200 transition-all"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          {booking.status === BookingStatus.COMPLETED && (
                            <Link 
                              to={`/services/${booking.serviceId}`}
                              className="flex-1 lg:w-40 py-3 bg-white border-2 border-rosePink text-rosePink rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-rosePink hover:text-white transition-all flex items-center justify-center"
                            >
                              <Star className="w-3 h-3 mr-2" /> Rate & Review
                            </Link>
                          )}
                          {booking.status === BookingStatus.CANCELLED && (
                            <Link 
                              to="/services"
                              className="flex-1 lg:w-40 py-3 bg-[#F8F9FA] dark:bg-[#252525] rounded-xl text-xs font-bold uppercase tracking-widest text-rosePink hover:bg-rosePink hover:text-white transition-all text-center"
                            >
                              Book Again
                            </Link>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-20 text-[#6C757D] bg-white dark:bg-[#1A1A1A] rounded-3xl border border-[#E9ECEF] dark:border-[#2D2D2D] p-8">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-[#252525] rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-7 h-7 opacity-50" />
                    </div>
                    <h3 className="text-xl font-bold mb-1 text-[#1A1A1A] dark:text-white">No bookings in this category</h3>
                    <p className="text-sm">You do not have any active appointments under this filter.</p>
                  </div>
                )}
              </AnimatePresence>
            )}
          </div>
        </section>

        {/* Real Featured Specialists from Database */}
        {featuredAgents.length > 0 && (
          <section>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-serif font-bold">Featured Specialists</h2>
              <Link to="/agents" className="text-rosePink font-black text-xs uppercase tracking-widest hover:underline">
                View All
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredAgents.map(agent => (
                <div key={agent.id} className="bg-white dark:bg-[#1A1A1A] p-8 rounded-[2.5rem] shadow-lg border border-[#E9ECEF] dark:border-[#2D2D2D] text-center hover:scale-105 transition-all group flex flex-col justify-between">
                  <div>
                    {agent.image ? (
                      <img src={agent.image} className="w-24 h-24 rounded-[2rem] object-cover mx-auto mb-6 shadow-xl" alt={agent.name} />
                    ) : (
                      <div className="w-24 h-24 rounded-[2rem] bg-rosePink/10 text-rosePink flex items-center justify-center mx-auto mb-6 shadow-xl font-bold">
                        <User className="w-10 h-10" />
                      </div>
                    )}
                    <h4 className="text-xl font-bold mb-1">{agent.name}</h4>
                    <p className="text-xs text-[#6C757D] font-bold uppercase tracking-widest mb-6">{agent.specialty}</p>
                  </div>
                  <Link to={`/agent/${agent.id}`} className="inline-flex items-center justify-center text-rosePink font-black uppercase tracking-widest text-[10px] group-hover:translate-x-2 transition-transform">
                    View Artist Profile <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

const SidebarItem: React.FC<{ icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center space-x-5 p-5 rounded-2xl font-bold transition-all text-left ${active ? 'bg-rosePink text-white shadow-xl shadow-rosePink/30' : 'text-[#6C757D] hover:bg-[#F8F9FA] dark:hover:bg-[#1A1A1A] hover:text-[#1A1A1A] dark:hover:text-white'}`}>
    <span className="w-6 h-6">{icon}</span>
    <span className="text-sm">{label}</span>
  </button>
);

const StatCard: React.FC<{ label: string, value: string, color: string }> = ({ label, value, color }) => (
  <div className="bg-white dark:bg-[#1A1A1A] p-10 rounded-[2.5rem] shadow-xl border border-[#E9ECEF] dark:border-[#2D2D2D] relative overflow-hidden group">
    <div className={`absolute top-0 right-0 w-24 h-24 ${color} opacity-5 -translate-y-12 translate-x-12 rounded-full group-hover:scale-150 transition-transform duration-700`} />
    <div className="text-xs font-black uppercase tracking-[0.2em] text-[#6C757D] mb-4">{label}</div>
    <div className="text-4xl font-serif font-black">{value}</div>
  </div>
);

export default CustomerDashboard;
