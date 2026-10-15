import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  Star, 
  ShieldCheck, 
  CheckCircle, 
  XCircle, 
  Copy, 
  ExternalLink, 
  Plus, 
  Briefcase, 
  ChevronRight, 
  AlertCircle, 
  LayoutGrid,
  MapPin,
  Phone,
  Pencil
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Booking, BookingStatus, Service, VerificationStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { getBookingsForUser, getServices, updateBookingStatus } from '../services/supabaseService';

const AgentHome: React.FC = () => {
  const { user, currentUser, profile } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const agentId = user?.id;
  const isPendingVerification = currentUser?.verificationStatus === VerificationStatus.PENDING;

  const loadData = async () => {
    if (!agentId) return;
    setLoading(true);
    const [bookingsRes, servicesRes] = await Promise.all([
      getBookingsForUser(agentId, 'agent'),
      getServices()
    ]);

    if (bookingsRes.data) setBookings(bookingsRes.data);
    if (servicesRes.data) {
      setServices(servicesRes.data.filter(s => s.agentId === agentId));
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [agentId]);

  // Handle booking status update
  const handleUpdateStatus = async (bookingId: string, newStatus: BookingStatus) => {
    setUpdatingId(bookingId);
    const ok = await updateBookingStatus(bookingId, newStatus);
    if (ok) {
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
    }
    setUpdatingId(null);
  };

  // Metrics
  const metrics = useMemo(() => {
    const completed = bookings.filter(b => b.status === BookingStatus.COMPLETED);
    const confirmed = bookings.filter(b => b.status === BookingStatus.CONFIRMED);
    const pending = bookings.filter(b => b.status === BookingStatus.PENDING);
    const totalEarnings = completed.reduce((acc, curr) => acc + (curr.price || 0), 0);

    return {
      totalBookings: bookings.length,
      completedCount: completed.length,
      pendingCount: pending.length,
      confirmedCount: confirmed.length,
      totalEarnings,
      activeServices: services.length
    };
  }, [bookings, services]);

  // Today's & Upcoming Bookings
  const todayBookings = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return bookings.filter(b => b.date === todayStr);
  }, [bookings]);

  const upcomingBookings = useMemo(() => {
    return bookings.filter(
      b => b.status === BookingStatus.PENDING || b.status === BookingStatus.CONFIRMED
    );
  }, [bookings]);

  // Share profile link
  const profileUrl = `${window.location.origin}/#/agent/${agentId}`;
  const handleCopyProfileLink = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="pt-20 sm:pt-24 pb-28 min-h-screen bg-brand-surface dark:bg-[#0D0D0D] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* --- 1. AGENT HERO & VERIFICATION BANNER --- */}
        <section className="pt-4 pb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img
                  src={currentUser?.avatar || `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#6C35A6" /><text x="50%" y="50%" fill="white" font-family="sans-serif" font-size="40" font-weight="bold" text-anchor="middle" dominant-baseline="central">${currentUser?.name?.slice(0, 2).toUpperCase() || 'AG'}</text></svg>`)}`}
                  alt={currentUser?.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl object-cover border-2 border-brand-interactive shadow-lg"
                />
                <div className="absolute -bottom-1 -right-1 p-1.5 bg-brand-interactive text-white rounded-xl shadow-md border border-white dark:border-[#1A1A1A]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl sm:text-3xl font-serif font-black text-[#1A1A1A] dark:text-white">
                    {currentUser?.name}
                  </h1>
                  <span className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase bg-brand-interactive/10 text-brand-interactive border border-brand-interactive/20 shadow-[0_0_10px_rgba(108,53,166,0.15)]">
                    Pro Agent
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#6C757D] dark:text-[#A0A0A0] mt-0.5">
                  {profile?.specialization || 'Beauty Professional'} • {profile?.location || 'Nigeria'}
                </p>
              </div>
            </div>

            {/* Quick Actions Header Buttons */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              <Link
                to="/agent/dashboard?tab=profile"
                className="px-3.5 py-2.5 rounded-2xl bg-white dark:bg-[#1A1A1A] border border-[#E9ECEF] dark:border-[#2D2D2D] hover:border-brand-interactive text-xs font-bold text-[#1A1A1A] dark:text-white flex items-center space-x-1.5 shadow-sm transition-all"
              >
                <Pencil className="w-3.5 h-3.5 text-brand-interactive" />
                <span>Edit Profile</span>
              </Link>

              <button
                onClick={handleCopyProfileLink}
                className="px-3.5 py-2.5 rounded-2xl bg-white dark:bg-[#1A1A1A] border border-[#E9ECEF] dark:border-[#2D2D2D] hover:border-brand-interactive text-xs font-bold text-[#1A1A1A] dark:text-white flex items-center space-x-1.5 shadow-sm transition-all"
              >
                <Copy className="w-3.5 h-3.5 text-brand-interactive" />
                <span>{copied ? 'Copied!' : 'Share Portfolio'}</span>
              </button>

              <Link
                to="/agent/dashboard"
                className="px-4 py-2.5 rounded-2xl bg-brand-interactive text-white text-xs font-black hover:bg-brand-interactive/90 flex items-center space-x-1.5 shadow-md shadow-brand-interactive/25 transition-all"
              >
                <span>Studio</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Pending Verification Notice */}
          {isPendingVerification && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start space-x-3 mb-6"
            >
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800 dark:text-amber-300">
                <span className="font-bold">Verification in progress: </span>
                Your credentials and profile are being reviewed by our trust & safety team. You can still customize your portfolio and manage listings.
              </div>
            </motion.div>
          )}

          {/* --- 2. EARNINGS & PERFORMANCE SNAPSHOT --- */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-8">
            <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#161616] border border-[#E9ECEF] dark:border-[#2D2D2D] shadow-sm">
              <div className="flex items-center justify-between text-[#6C757D] text-xs font-bold mb-2">
                <span>Completed Payouts</span>
                <div className="w-7 h-7 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-black text-[#1A1A1A] dark:text-white">
                ₦{metrics.totalEarnings.toLocaleString()}
              </div>
              <div className="text-[10px] text-green-500 font-bold mt-1">
                {metrics.completedCount} completed sessions
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#161616] border border-[#E9ECEF] dark:border-[#2D2D2D] shadow-sm">
              <div className="flex items-center justify-between text-[#6C757D] text-xs font-bold mb-2">
                <span>Pending Requests</span>
                <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-black text-[#1A1A1A] dark:text-white">
                {metrics.pendingCount}
              </div>
              <div className="text-[10px] text-amber-500 font-bold mt-1">
                Requires action
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#161616] border border-[#E9ECEF] dark:border-[#2D2D2D] shadow-sm">
              <div className="flex items-center justify-between text-[#6C757D] text-xs font-bold mb-2">
                <span>Active Services</span>
                <div className="w-7 h-7 rounded-xl bg-brand-interactive/10 text-brand-interactive flex items-center justify-center">
                  <Briefcase className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-black text-[#1A1A1A] dark:text-white">
                {metrics.activeServices}
              </div>
              <div className="text-[10px] text-brand-interactive font-bold mt-1">
                Live in catalogue
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#161616] border border-[#E9ECEF] dark:border-[#2D2D2D] shadow-sm">
              <div className="flex items-center justify-between text-[#6C757D] text-xs font-bold mb-2">
                <span>Customer Rating</span>
                <div className="w-7 h-7 rounded-xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-black text-[#1A1A1A] dark:text-white">
                4.9 <span className="text-xs font-normal text-[#6C757D]">/ 5.0</span>
              </div>
              <div className="text-[10px] text-[#6C757D] font-bold mt-1">
                Based on verified clients
              </div>
            </div>
          </div>
        </section>

        {/* --- 3. UPCOMING & TODAY'S SCHEDULE --- */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center space-x-1.5 text-xs font-bold text-brand-interactive uppercase tracking-wider">
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>Client Bookings</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-black text-[#1A1A1A] dark:text-white">
                Schedule & Action Items
              </h2>
            </div>
            <Link
              to="/agent/dashboard"
              className="text-xs font-bold text-brand-interactive hover:underline flex items-center space-x-1"
            >
              <span>Manage all ({bookings.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {upcomingBookings.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {upcomingBookings.slice(0, 5).map((booking) => (
                <motion.div
                  key={booking.id}
                  whileHover={{ y: -2 }}
                  className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#161616] border border-[#E9ECEF] dark:border-[#2D2D2D] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start sm:items-center space-x-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-brand-interactive/10 text-brand-interactive flex items-center justify-center font-bold text-sm shrink-0">
                      {booking.customerAvatar ? (
                        <img 
                          src={booking.customerAvatar} 
                          alt={booking.customerName} 
                          className="w-full h-full rounded-2xl object-cover" 
                        />
                      ) : (
                        booking.customerName.slice(0, 2).toUpperCase()
                      )}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm sm:text-base text-[#1A1A1A] dark:text-white">
                          {booking.customerName}
                        </span>
                        <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                          booking.status === BookingStatus.CONFIRMED 
                            ? 'bg-green-500/10 text-green-500 border border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.15)]' 
                            : 'bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                      <div className="text-xs font-medium text-brand-interactive">
                        {booking.serviceName} • ₦{booking.price?.toLocaleString()}
                      </div>
                      <div className="flex items-center space-x-3 text-[11px] text-[#6C757D] dark:text-[#A0A0A0] mt-1">
                        <span className="flex items-center">
                          <CalendarIcon className="w-3 h-3 mr-1" />
                          {booking.date} at {booking.time}
                        </span>
                        <span>•</span>
                        <span className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {booking.address || 'Client Location'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex items-center space-x-2 self-end sm:self-center">
                    {booking.status === BookingStatus.PENDING && (
                      <button
                        onClick={() => handleUpdateStatus(booking.id, BookingStatus.CONFIRMED)}
                        disabled={updatingId === booking.id}
                        className="px-3.5 py-1.5 rounded-xl bg-green-500 text-white text-xs font-black hover:bg-green-600 active:scale-95 transition-all shadow-sm flex items-center space-x-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Accept</span>
                      </button>
                    )}

                    {booking.status === BookingStatus.CONFIRMED && (
                      <button
                        onClick={() => handleUpdateStatus(booking.id, BookingStatus.COMPLETED)}
                        disabled={updatingId === booking.id}
                        className="px-3.5 py-1.5 rounded-xl bg-brand-interactive text-white text-xs font-black hover:bg-brand-interactive/90 active:scale-95 transition-all shadow-sm flex items-center space-x-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Complete</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleUpdateStatus(booking.id, BookingStatus.CANCELLED)}
                      disabled={updatingId === booking.id}
                      className="px-3 py-1.5 rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500/10 text-xs font-bold transition-all"
                    >
                      Decline
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-white dark:bg-[#161616] rounded-3xl border border-[#E9ECEF] dark:border-[#2D2D2D]">
              <CalendarIcon className="w-8 h-8 text-[#6C757D] mx-auto mb-2 opacity-50" />
              <h3 className="font-bold text-sm text-[#1A1A1A] dark:text-white">
                No active bookings right now
              </h3>
              <p className="text-xs text-[#6C757D] mt-1">
                Share your portfolio link to attract bookings from clients nearby!
              </p>
            </div>
          )}
        </section>

        {/* --- 4. YOUR ACTIVE SERVICES STRIP --- */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center space-x-1.5 text-xs font-bold text-brand-interactive uppercase tracking-wider">
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Catalogue</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-black text-[#1A1A1A] dark:text-white">
                Your Published Services
              </h2>
            </div>
            <Link
              to="/agent/dashboard"
              className="px-3.5 py-1.5 bg-brand-interactive text-white text-xs font-black rounded-xl hover:bg-brand-interactive/90 flex items-center space-x-1 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Service</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                className="p-4 rounded-3xl bg-white dark:bg-[#161616] border border-[#E9ECEF] dark:border-[#2D2D2D] shadow-sm flex flex-col justify-between"
              >
                <div className="flex items-start space-x-3 mb-3">
                  <img
                    src={service.image || 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?q=80&w=400'}
                    alt={service.name}
                    className="w-16 h-16 rounded-2xl object-cover shrink-0"
                  />
                  <div>
                    <span className="text-[10px] font-black uppercase text-brand-interactive bg-brand-interactive/10 px-2.5 py-1 rounded-xl border border-brand-interactive/20 shadow-[0_0_8px_rgba(108,53,166,0.12)]">
                      {service.category}
                    </span>
                    <h4 className="font-bold text-sm text-[#1A1A1A] dark:text-white mt-1 line-clamp-1">
                      {service.name}
                    </h4>
                    <span className="text-sm font-black text-brand-interactive">
                      ₦{service.price?.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E9ECEF] dark:border-[#262626] flex items-center justify-between text-xs">
                  <span className="text-[#6C757D]">{service.durationMins || 60} mins</span>
                  <Link
                    to="/agent/dashboard"
                    className="text-brand-interactive font-bold hover:underline"
                  >
                    Edit in Dashboard
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default AgentHome;
