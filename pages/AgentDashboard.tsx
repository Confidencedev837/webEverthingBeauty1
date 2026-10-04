import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { House, Briefcase, Calendar, TrendingUp, Star, User, Settings, LogOut, ShieldCheck, Clock, FileText, Upload, Plus, CheckCircle, XCircle, Trash2, Eye, Heart, DollarSign, Image as ImageIcon, Video, Menu, X, RefreshCw, AlertCircle } from 'lucide-react';
import { VerificationStatus, BookingStatus, Service, Booking } from '../types';
import { useAuth } from '../context/AuthContext';
import { getBookingsForUser, getServices, updateBookingStatus, createService, isVideoUrl } from '../services/supabaseService';
import { useNavigate, Link } from 'react-router-dom';

const AgentDashboard: React.FC = () => {
  const { user, currentUser, role, signOut, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [view, setView] = useState<'overview' | 'services' | 'bookings' | 'portfolio' | 'analytics'>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCreateServiceOpen, setIsCreateServiceOpen] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Service Form State
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceDuration, setNewServiceDuration] = useState('60');
  const [newServiceCategory, setNewServiceCategory] = useState('Makeup');
  const [newServiceDescription, setNewServiceDescription] = useState('');
  const [newServiceImageUrl, setNewServiceImageUrl] = useState('');
  const [isCreatingService, setIsCreatingService] = useState(false);

  const agentId = user?.id;
  const isPendingVerification = currentUser?.verificationStatus === VerificationStatus.PENDING;

  const loadData = async () => {
    if (!agentId) return;
    setLoading(true);
    setError(null);
    const [bookingsRes, allServicesRes] = await Promise.all([
      getBookingsForUser(agentId, 'agent'),
      getServices()
    ]);

    if (bookingsRes.data) {
      setBookings(bookingsRes.data);
    }
    if (allServicesRes.data) {
      const myServices = allServicesRes.data.filter(s => s.agentId === agentId);
      setServices(myServices);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (user) {
      loadData();
    }
  }, [user, authLoading]);

  const handleStatusChange = async (bookingId: string, newStatus: BookingStatus) => {
    const ok = await updateBookingStatus(bookingId, newStatus);
    if (ok) {
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
    }
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentId || !newServiceName || !newServicePrice) return;
    setIsCreatingService(true);

    const priceNum = parseFloat(newServicePrice) || 0;
    const durationNum = parseInt(newServiceDuration) || 60;
    const img = newServiceImageUrl ? [newServiceImageUrl] : [];

    const success = await createService({
      agentId: agentId,
      name: newServiceName,
      price: priceNum,
      category: newServiceCategory,
      description: newServiceDescription || '',
      durationMins: durationNum,
      imageUrl: img
    });

    if (success) {
      setIsCreateServiceOpen(false);
      setNewServiceName('');
      setNewServicePrice('');
      setNewServiceDescription('');
      setNewServiceImageUrl('');
      await loadData();
    }
    setIsCreatingService(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const pendingBookings = bookings.filter(b => b.status === BookingStatus.PENDING);
  const confirmedBookings = bookings.filter(b => b.status === BookingStatus.CONFIRMED);
  const completedBookings = bookings.filter(b => b.status === BookingStatus.COMPLETED);
  const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.price || 0), 0);

  // Calculate real average rating across agent services
  const averageRating = services.length > 0
    ? (services.reduce((sum, s) => sum + (s.rating || 0), 0) / services.length).toFixed(1)
    : '0.0';

  if (authLoading || (!user && !bookings.length)) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0D0D0D] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-rosePink/30 border-t-rosePink rounded-full animate-spin" />
      </div>
    );
  }

  if (isPendingVerification && !loading && bookings.length === 0 && services.length === 0) {
    return (
      <div className="min-h-screen pt-32 pb-24 bg-white dark:bg-[#0D0D0D]">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#F8F9FA] dark:bg-[#1A1A1A] p-16 rounded-[4rem] border border-orange-500/20 shadow-2xl text-center">
            <div className="w-24 h-24 bg-orange-500/10 text-orange-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 border border-orange-500/20 animate-pulse">
              <Clock className="w-12 h-12" />
            </div>
            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6">Verification in Review</h1>
            <p className="text-xl text-[#6C757D] dark:text-[#B0B0B0] max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
              Welcome, {currentUser?.name}. Your professional profile credentials have been submitted and are pending administrative verification.
            </p>
            <div className="flex justify-center gap-4">
              <button 
                onClick={() => setView('overview')}
                className="px-8 py-4 bg-rosePink text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-rosePink/20 hover:scale-105 transition-all"
              >
                Access Studio
              </button>
              <button 
                onClick={handleLogout}
                className="px-8 py-4 bg-gray-100 dark:bg-white/10 text-[#1A1A1A] dark:text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-gray-200 transition-all"
              >
                Sign Out
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (view) {
      case 'overview':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <AgentStatCard 
                label="Total Revenue" 
                value={`₦${totalRevenue.toLocaleString()}`} 
                highlightColor="text-green-500" 
              />
              <AgentStatCard 
                label="Average Rating" 
                value={Number(averageRating) > 0 ? `${averageRating} ★` : 'New Profile'} 
              />
              <AgentStatCard 
                label="Pending Requests" 
                value={pendingBookings.length.toString()} 
                highlight={pendingBookings.length > 0} 
              />
            </div>
            <section>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-serif font-bold">Recent Bookings</h2>
                {bookings.length > 0 && (
                  <button onClick={() => setView('bookings')} className="text-rosePink font-black text-xs uppercase tracking-widest hover:underline">
                    View All ({bookings.length})
                  </button>
                )}
              </div>
              <div className="space-y-4">
                {bookings.slice(0, 4).map(booking => (
                  <BookingRequestCard 
                    key={booking.id} 
                    booking={booking} 
                    onStatusChange={handleStatusChange} 
                    showActions={true} 
                  />
                ))}
                {bookings.length === 0 && (
                  <div className="p-12 text-center text-[#6C757D] bg-white dark:bg-[#1A1A1A] rounded-[2rem] border border-[#E9ECEF] dark:border-[#2D2D2D]">
                    <Calendar className="w-8 h-8 opacity-40 mx-auto mb-3" />
                    <h4 className="font-bold text-lg mb-1">No Booking Requests Yet</h4>
                    <p className="text-xs">Incoming client reservations will appear here in real time.</p>
                  </div>
                )}
              </div>
            </section>
          </>
        );
      case 'bookings':
        return (
          <section>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-serif font-bold">All Appointments ({bookings.length})</h2>
              <button 
                onClick={loadData} 
                className="p-3 bg-white dark:bg-[#1A1A1A] border border-[#E9ECEF] dark:border-[#2D2D2D] rounded-xl text-[#6C757D] hover:text-rosePink transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <div className="space-y-4">
              {bookings.length > 0 ? (
                bookings.map(booking => (
                  <BookingRequestCard 
                    key={booking.id} 
                    booking={booking} 
                    showActions={true} 
                    onStatusChange={handleStatusChange} 
                  />
                ))
              ) : (
                <div className="p-16 text-center text-[#6C757D] bg-white dark:bg-[#1A1A1A] rounded-[2rem] border border-[#E9ECEF] dark:border-[#2D2D2D]">
                  <p className="text-sm">No appointment records found.</p>
                </div>
              )}
            </div>
          </section>
        );
      case 'services':
        return (
          <section>
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-3xl font-serif font-bold">My Published Services</h2>
                <p className="text-sm text-[#6C757D]">Active services visible to prospective clients</p>
              </div>
              <button onClick={() => setIsCreateServiceOpen(true)} className="p-4 bg-rosePink text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center space-x-2 shadow-lg shadow-rosePink/20 hover:scale-105 transition-all">
                <Plus className="w-4 h-4" /> <span>Add New Service</span>
              </button>
            </div>
            {services.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {services.map(service => (
                  <div key={service.id} className="bg-white dark:bg-[#1A1A1A] p-6 rounded-[2.5rem] border border-[#E9ECEF] dark:border-[#2D2D2D] flex items-center gap-6 shadow-xl relative overflow-hidden group">
                    {service.image ? (
                      <img src={service.image} className="w-24 h-24 rounded-2xl object-cover" alt={service.name} />
                    ) : (
                      <div className="w-24 h-24 rounded-2xl bg-rosePink/10 text-rosePink flex items-center justify-center font-bold text-xs text-center p-2">
                        {service.category}
                      </div>
                    )}
                    <div className="flex-grow">
                      <span className="text-[10px] text-rosePink font-black uppercase tracking-widest">{service.category}</span>
                      <h4 className="text-xl font-serif font-bold mb-1">{service.name}</h4>
                      <div className="text-green-500 font-black text-lg">₦{service.price.toLocaleString()}</div>
                      <div className="flex gap-4 mt-3">
                        {service.durationMins > 0 && (
                          <div className="flex items-center text-xs text-[#6C757D]"><Clock className="w-3 h-3 mr-1" /> {service.durationMins}m</div>
                        )}
                        <div className="flex items-center text-xs text-[#6C757D]"><Star className="w-3 h-3 mr-1 text-yellow-400" /> {service.rating > 0 ? service.rating : 'New'}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-16 text-center text-[#6C757D] bg-white dark:bg-[#1A1A1A] rounded-[2.5rem] border border-[#E9ECEF] dark:border-[#2D2D2D]">
                <Briefcase className="w-10 h-10 opacity-40 mx-auto mb-3" />
                <h4 className="font-bold text-lg mb-1">No Services Published</h4>
                <p className="text-sm mb-6">Create and publish your beauty offerings to begin receiving customer bookings.</p>
                <button onClick={() => setIsCreateServiceOpen(true)} className="px-6 py-3 bg-rosePink text-white rounded-xl text-xs font-bold uppercase tracking-wider">
                  Create First Service
                </button>
              </div>
            )}
          </section>
        );
      case 'portfolio':
        return (
          <section>
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-3xl font-serif font-bold">Portfolio & Media</h2>
                <p className="text-sm text-[#6C757D]">Work showcased on your public specialist boutique</p>
              </div>
            </div>
            {profile?.gallery && Array.isArray(profile.gallery) && profile.gallery.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {profile.gallery.map((item: any, idx: number) => (
                  <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden group bg-black">
                    {item.type === 'video' || isVideoUrl(item.url) ? (
                      <video src={item.url} className="w-full h-full object-cover" />
                    ) : (
                      <img src={item.url} className="w-full h-full object-cover" alt="" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-16 text-center text-[#6C757D] bg-white dark:bg-[#1A1A1A] rounded-[2.5rem] border border-[#E9ECEF] dark:border-[#2D2D2D]">
                <ImageIcon className="w-10 h-10 opacity-40 mx-auto mb-3" />
                <h4 className="font-bold text-lg mb-1">No Portfolio Media Uploaded</h4>
                <p className="text-sm">Upload images or transformation videos to your profile to showcase your talent to clients.</p>
              </div>
            )}
          </section>
        );
      case 'analytics':
        return (
          <section>
            <h2 className="text-3xl font-serif font-bold mb-8">Performance Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="p-8 bg-white dark:bg-[#1A1A1A] rounded-[2.5rem] border border-[#E9ECEF] dark:border-[#2D2D2D] shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500"><Briefcase className="w-6 h-6" /></div>
                </div>
                <div className="text-4xl font-black mb-1">{services.length}</div>
                <div className="text-xs text-[#6C757D] font-bold uppercase tracking-widest">Active Services</div>
              </div>
              <div className="p-8 bg-white dark:bg-[#1A1A1A] rounded-[2.5rem] border border-[#E9ECEF] dark:border-[#2D2D2D] shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-rosePink/10 flex items-center justify-center text-rosePink"><Clock className="w-6 h-6" /></div>
                </div>
                <div className="text-4xl font-black mb-1">{pendingBookings.length}</div>
                <div className="text-xs text-[#6C757D] font-bold uppercase tracking-widest">Pending Requests</div>
              </div>
              <div className="p-8 bg-white dark:bg-[#1A1A1A] rounded-[2.5rem] border border-[#E9ECEF] dark:border-[#2D2D2D] shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500"><CheckCircle className="w-6 h-6" /></div>
                </div>
                <div className="text-4xl font-black mb-1">{completedBookings.length}</div>
                <div className="text-xs text-[#6C757D] font-bold uppercase tracking-widest">Completed Sessions</div>
              </div>
            </div>

            <h3 className="text-2xl font-serif font-bold mb-6">Service Overview</h3>
            <div className="bg-white dark:bg-[#1A1A1A] rounded-[2.5rem] border border-[#E9ECEF] dark:border-[#2D2D2D] p-8 overflow-hidden">
              {services.length > 0 ? (
                <table className="w-full text-left">
                  <thead className="border-b border-gray-100 dark:border-gray-800">
                    <tr>
                      <th className="pb-4 text-xs font-black uppercase tracking-widest text-[#6C757D]">Service Name</th>
                      <th className="pb-4 text-xs font-black uppercase tracking-widest text-[#6C757D]">Price</th>
                      <th className="pb-4 text-xs font-black uppercase tracking-widest text-[#6C757D]">Category</th>
                      <th className="pb-4 text-xs font-black uppercase tracking-widest text-[#6C757D]">Rating</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {services.map(s => (
                      <tr key={s.id} className="border-b border-gray-5 dark:border-gray-800/50 last:border-0 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                        <td className="py-4 font-bold max-w-[200px] truncate pr-4">{s.name}</td>
                        <td className="py-4 font-black text-green-500">₦{s.price.toLocaleString()}</td>
                        <td className="py-4 text-[#6C757D]">{s.category}</td>
                        <td className="py-4">{s.rating > 0 ? `${s.rating} ★` : 'New'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-8 text-[#6C757D]">No service data to analyze.</div>
              )}
            </div>
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0D0D0D] flex pt-20">
      {/* Mobile Menu Toggle */}
      <div className="lg:hidden fixed top-24 right-6 z-40">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-3 bg-white dark:bg-[#1A1A1A] rounded-full shadow-lg border border-[#E9ECEF] dark:border-[#2D2D2D]"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar - Desktop & Mobile */}
      <AnimatePresence>
        {(isMobileMenuOpen || window.innerWidth >= 1024) && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className={`
              fixed lg:sticky top-0 lg:top-20 left-0 h-full lg:h-[calc(100vh-80px)] z-50 lg:z-auto
              w-80 bg-white dark:bg-[#111] border-r border-[#E9ECEF] dark:border-[#2D2D2D] p-10 
              lg:flex flex-col shadow-2xl lg:shadow-none
              ${isMobileMenuOpen ? 'flex' : 'hidden lg:flex'}
            `}
          >
            {/* Mobile Header in Menu */}
            <div className="lg:hidden flex justify-between items-center mb-8">
              <div className="font-serif font-bold text-xl">Menu</div>
              <button onClick={() => setIsMobileMenuOpen(false)}><X className="w-6 h-6" /></button>
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
                <div className="font-bold text-lg leading-tight truncate max-w-[150px]">{currentUser?.name}</div>
                <div className="flex items-center text-[10px] text-green-500 font-black uppercase tracking-widest mt-1">
                  <ShieldCheck className="w-3 h-3 mr-1" /> 
                  {currentUser?.verificationStatus === VerificationStatus.VERIFIED ? 'Verified' : 'Pending Review'}
                </div>
              </div>
            </div>

            <nav className="flex-grow space-y-4">
              <SidebarItem icon={<House />} label="Overview" active={view === 'overview'} onClick={() => { setView('overview'); setIsMobileMenuOpen(false); }} />
              <SidebarItem icon={<Calendar />} label="Bookings" active={view === 'bookings'} onClick={() => { setView('bookings'); setIsMobileMenuOpen(false); }} />
              <SidebarItem icon={<Briefcase />} label="My Services" active={view === 'services'} onClick={() => { setView('services'); setIsMobileMenuOpen(false); }} />
              <SidebarItem icon={<ImageIcon />} label="Portfolio" active={view === 'portfolio'} onClick={() => { setView('portfolio'); setIsMobileMenuOpen(false); }} />
              <SidebarItem icon={<TrendingUp />} label="Analytics" active={view === 'analytics'} onClick={() => { setView('analytics'); setIsMobileMenuOpen(false); }} />
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

      <main className="flex-grow p-6 sm:p-12 overflow-y-auto w-full">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold">Agent Studio</h1>
            <p className="text-[#6C757D] font-medium hidden sm:block">Welcome back, {currentUser?.name}. Manage your appointments and services.</p>
          </div>
          <button 
            onClick={loadData}
            className="p-3 bg-white dark:bg-[#1A1A1A] border border-[#E9ECEF] dark:border-[#2D2D2D] rounded-xl text-[#6C757D] hover:text-rosePink transition-all"
            title="Refresh"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </header>

        {loading && bookings.length === 0 && services.length === 0 ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-white dark:bg-[#1A1A1A] rounded-[2.5rem] animate-pulse border border-[#E9ECEF] dark:border-[#2D2D2D]" />
              ))}
            </div>
            <div className="h-64 bg-white dark:bg-[#1A1A1A] rounded-[2rem] animate-pulse border border-[#E9ECEF] dark:border-[#2D2D2D]" />
          </div>
        ) : (
          renderContent()
        )}

        {/* Create Service Modal */}
        <AnimatePresence>
          {isCreateServiceOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCreateServiceOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-lg bg-white dark:bg-[#1A1A1A] rounded-[2rem] p-8 shadow-2xl z-10 border border-white/20">
                <h2 className="text-2xl font-serif font-bold mb-6">Create New Service</h2>
                <form onSubmit={handleCreateService} className="space-y-4">
                  <input 
                    type="text" 
                    placeholder="Service Name (e.g. Bridal Glam, Skin Detox)" 
                    value={newServiceName}
                    onChange={e => setNewServiceName(e.target.value)}
                    required
                    className="w-full p-4 bg-[#F8F9FA] dark:bg-[#0D0D0D] rounded-xl border border-transparent focus:border-rosePink outline-none text-[#1A1A1A] dark:text-white" 
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      type="number" 
                      placeholder="Price (₦)" 
                      value={newServicePrice}
                      onChange={e => setNewServicePrice(e.target.value)}
                      required
                      className="w-full p-4 bg-[#F8F9FA] dark:bg-[#0D0D0D] rounded-xl border border-transparent focus:border-rosePink outline-none text-[#1A1A1A] dark:text-white" 
                    />
                    <select
                      value={newServiceCategory}
                      onChange={e => setNewServiceCategory(e.target.value)}
                      className="w-full p-4 bg-[#F8F9FA] dark:bg-[#0D0D0D] rounded-xl border border-transparent focus:border-rosePink outline-none text-[#1A1A1A] dark:text-white"
                    >
                      <option value="Makeup">Makeup</option>
                      <option value="Hair">Hair Styling</option>
                      <option value="Barbing">Barbing</option>
                      <option value="Skincare">Skincare</option>
                      <option value="Nails">Nails</option>
                      <option value="Spa">Spa & Massage</option>
                    </select>
                  </div>
                  <input 
                    type="number" 
                    placeholder="Duration in mins (e.g. 60)" 
                    value={newServiceDuration}
                    onChange={e => setNewServiceDuration(e.target.value)}
                    className="w-full p-4 bg-[#F8F9FA] dark:bg-[#0D0D0D] rounded-xl border border-transparent focus:border-rosePink outline-none text-[#1A1A1A] dark:text-white" 
                  />
                  <input 
                    type="url" 
                    placeholder="Media Image or Video URL (optional)" 
                    value={newServiceImageUrl}
                    onChange={e => setNewServiceImageUrl(e.target.value)}
                    className="w-full p-4 bg-[#F8F9FA] dark:bg-[#0D0D0D] rounded-xl border border-transparent focus:border-rosePink outline-none text-[#1A1A1A] dark:text-white" 
                  />
                  <textarea 
                    placeholder="Detailed Description of the service..." 
                    value={newServiceDescription}
                    onChange={e => setNewServiceDescription(e.target.value)}
                    className="w-full p-4 bg-[#F8F9FA] dark:bg-[#0D0D0D] rounded-xl border border-transparent focus:border-rosePink outline-none h-28 resize-none text-[#1A1A1A] dark:text-white"
                  ></textarea>
                  <button 
                    type="submit" 
                    disabled={isCreatingService}
                    className="w-full py-4 bg-rosePink text-white rounded-xl font-bold shadow-lg shadow-rosePink/20 hover:scale-105 transition-all flex items-center justify-center disabled:opacity-50"
                  >
                    {isCreatingService ? 'Saving Service...' : 'Publish Service'}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

// --- Sub-components ---

const SidebarItem: React.FC<{ icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-5 p-4 rounded-2xl font-bold transition-all text-left ${active ? 'bg-rosePink text-white shadow-xl shadow-rosePink/30' : 'text-[#6C757D] hover:bg-[#F8F9FA] dark:hover:bg-[#1A1A1A] hover:text-[#1A1A1A] dark:hover:text-white'}`}>
    <span className="w-5 h-5">{icon}</span>
    <span className="text-sm">{label}</span>
  </button>
);

const AgentStatCard: React.FC<{ label: string, value: string, highlight?: boolean, highlightColor?: string }> = ({ label, value, highlight, highlightColor }) => (
  <div className={`bg-white dark:bg-[#1A1A1A] p-8 rounded-[2.5rem] shadow-xl border ${highlight ? 'border-rosePink shadow-rosePink/10' : 'border-[#E9ECEF] dark:border-[#2D2D2D]'}`}>
    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6C757D] mb-4">{label}</div>
    <div className={`text-3xl md:text-4xl font-serif font-black ${highlightColor ? highlightColor : highlight ? 'text-rosePink' : ''}`}>{value}</div>
  </div>
);

const BookingRequestCard: React.FC<{ 
  booking: Booking; 
  showActions?: boolean; 
  onStatusChange?: (id: string, status: BookingStatus) => void 
}> = ({ booking, showActions, onStatusChange }) => {
  const [updating, setUpdating] = useState(false);

  const handleAction = async (newStatus: BookingStatus) => {
    setUpdating(true);
    if (onStatusChange) {
      await onStatusChange(booking.id, newStatus);
    }
    setUpdating(false);
  };

  return (
    <div className="bg-white dark:bg-[#1A1A1A] p-6 lg:p-8 rounded-[2rem] border border-[#E9ECEF] dark:border-[#2D2D2D] shadow-lg flex flex-col md:flex-row items-center gap-6 group hover:border-rosePink/30 transition-all">
      {booking.customerAvatar ? (
        <img src={booking.customerAvatar} className="w-16 h-16 rounded-2xl object-cover" alt="" />
      ) : (
        <div className="w-16 h-16 rounded-2xl bg-rosePink/10 text-rosePink flex items-center justify-center font-bold">
          <User className="w-8 h-8" />
        </div>
      )}
      <div className="flex-grow text-center md:text-left">
        <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
          <h4 className="font-bold text-lg text-[#1A1A1A] dark:text-white">{booking.customerName}</h4>
          <span className="md:ml-2 text-[10px] bg-gray-100 dark:bg-white/10 px-2 py-1 rounded-lg text-gray-500 font-bold uppercase tracking-wider">#{booking.id.slice(0, 8)}</span>
        </div>
        <p className="text-sm text-rosePink font-bold mb-2">{booking.serviceName}</p>
        <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs text-[#6C757D]">
          <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> {booking.date || 'Flexible'}</span>
          <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {booking.time || 'Flexible'}</span>
          <span className="flex items-center font-black text-green-500"><DollarSign className="w-3 h-3 mr-1 text-green-500" /> ₦{booking.price.toLocaleString()}</span>
        </div>
        {booking.address && (
          <p className="text-xs text-[#6C757D] mt-2 font-medium">📍 {booking.address}</p>
        )}
      </div>

      {showActions && booking.status === BookingStatus.PENDING ? (
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <button 
            disabled={updating}
            onClick={() => handleAction(BookingStatus.CONFIRMED)} 
            className="flex-1 md:flex-none px-6 py-3 bg-green-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-green-600 transition-colors shadow-lg shadow-green-500/20"
          >
            {updating ? 'Updating...' : 'Accept'}
          </button>
          <button 
            disabled={updating}
            onClick={() => handleAction(BookingStatus.CANCELLED)} 
            className="flex-1 md:flex-none px-6 py-3 bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-gray-200 transition-colors"
          >
            Reject
          </button>
        </div>
      ) : showActions && booking.status === BookingStatus.CONFIRMED ? (
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-center">
          <div className="px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest bg-green-100 text-green-600 mb-2 sm:mb-0">Confirmed</div>
          <button 
            disabled={updating}
            onClick={() => handleAction(BookingStatus.COMPLETED)} 
            className="px-6 py-3 bg-rosePink text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-rosePink/90 transition-colors shadow-lg shadow-rosePink/20 flex items-center"
          >
            <CheckCircle className="w-4 h-4 mr-2" /> Mark Complete
          </button>
        </div>
      ) : (
        <div className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest relative overflow-hidden ${
          booking.status === BookingStatus.CONFIRMED ? 'bg-green-100 text-green-600' :
          booking.status === BookingStatus.COMPLETED ? 'bg-blue-100 text-blue-600' :
          booking.status === BookingStatus.CANCELLED ? 'bg-red-100 text-red-500' :
          'bg-yellow-100 text-yellow-700'
        }`}>
          <span className="relative z-10">{booking.status}</span>
        </div>
      )}
    </div>
  );
};

export default AgentDashboard;
