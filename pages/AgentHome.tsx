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
  Pencil,
  Check
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Booking, BookingStatus, Service, VerificationStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { useSnackbar } from '../components/Snackbar';
import { getBookingsForUser, getServices, updateBookingStatus } from '../services/supabaseService';

const AgentHome: React.FC = () => {
  const { user, currentUser, profile } = useAuth();
  const { showSnackbar } = useSnackbar();
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
      showSnackbar(
        newStatus === BookingStatus.CONFIRMED
          ? 'Booking confirmed and scheduled'
          : newStatus === BookingStatus.COMPLETED
            ? 'Booking marked as completed'
            : 'Booking request declined',
        'info'
      );
    } else {
      showSnackbar('Failed to update booking status. Please try again.', 'error');
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
    showSnackbar('Portfolio link copied to clipboard', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative pt-20 sm:pt-24 pb-28 min-h-screen bg-brand-surface dark:bg-[#0A0A0A] overflow-hidden transition-colors selection:bg-brand-interactive selection:text-white">

      {/* Atmospheric Iridescent Mesh Glows (Apple/iOS spatial depth) */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-36 left-1/2 -translate-x-1/2 w-[720px] sm:w-[1000px] h-[520px] bg-gradient-to-tr from-[#6C35A6]/18 via-[#F43F5E]/12 to-[#A78BCE]/15 rounded-full blur-[120px] dark:opacity-35 opacity-65" />
        <div className="absolute top-[35%] -right-40 w-[520px] h-[520px] bg-gradient-to-bl from-[#32104D]/14 via-[#6C35A6]/10 to-transparent rounded-full blur-[100px] dark:opacity-25 opacity-50" />
        <div className="absolute bottom-10 -left-40 w-[480px] h-[480px] bg-gradient-to-tr from-[#F43F5E]/10 via-[#6C35A6]/8 to-transparent rounded-full blur-[90px] dark:opacity-20 opacity-40" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* --- 1. AGENT HERO & ACTIONS BANNER --- */}
        <section className="pt-4 pb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center space-x-4 sm:space-x-5">

              {/* Profile Avatar: Complete Round, Iridescent Ring & Tactile iOS Feedback */}
              <div className="relative shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 p-[3px] rounded-full bg-gradient-to-tr from-[#32104D] via-[#6C35A6] to-[#F43F5E] shadow-[0_8px_24px_rgba(108,53,166,0.32)] hover:shadow-[0_12px_32px_rgba(244,63,94,0.45)] transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer">
                  <div className="w-full h-full p-0.5 bg-white dark:bg-[#0A0A0A] rounded-full aspect-square">
                    <img
                      src={currentUser?.avatar || `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#6C35A6" /><text x="50%" y="50%" fill="white" font-family="sans-serif" font-size="38" font-weight="bold" text-anchor="middle" dominant-baseline="central">${currentUser?.name?.slice(0, 2).toUpperCase() || 'AG'}</text></svg>`)}`}
                      alt={currentUser?.name || 'Specialist Profile'}
                      className="w-full h-full rounded-full object-cover aspect-square block"
                    />
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 p-1.5 bg-gradient-to-tr from-brand-interactive to-[#7B3DB8] text-white rounded-full shadow-md border-2 border-white dark:border-[#0A0A0A] flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black tracking-tight text-[#1A1A1A] dark:text-white">
                    {currentUser?.name}
                  </h1>
                  <span className="px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-interactive/10 text-brand-interactive border border-brand-interactive/25 backdrop-blur-md shadow-[0_0_12px_rgba(108,53,166,0.15)]">
                    Pro Agent
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-[#6C757D] dark:text-[#A0A0A0] mt-1">
                  {profile?.specialization || 'Beauty Professional'} • {profile?.location || 'Nigeria'}
                </p>
              </div>
            </div>

            {/* Quick Actions Header Buttons: Large Touch Target, Google Pills, Generous Padding & Tactile 3D Jiggle */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/agent/dashboard?tab=profile"
                className="tactile-3d px-5 py-3 sm:px-6 sm:py-3.5 rounded-full bg-white/80 dark:bg-[#161616]/80 backdrop-blur-xl border border-white/80 dark:border-white/10 hover:border-brand-interactive/50 text-xs sm:text-sm font-bold text-[#1A1A1A] dark:text-white flex items-center space-x-2 shadow-sm hover:shadow-[0_8px_20px_rgba(108,53,166,0.15)] cursor-pointer"
              >
                <Pencil className="w-4 h-4 text-brand-interactive" />
                <span>Edit Profile</span>
              </Link>

              <button
                onClick={handleCopyProfileLink}
                className="tactile-3d px-5 py-3 sm:px-6 sm:py-3.5 rounded-full bg-white/80 dark:bg-[#161616]/80 backdrop-blur-xl border border-white/80 dark:border-white/10 hover:border-brand-interactive/50 text-xs sm:text-sm font-bold text-[#1A1A1A] dark:text-white flex items-center space-x-2 shadow-sm hover:shadow-[0_8px_20px_rgba(108,53,166,0.15)] cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-brand-interactive" />
                    <span>Share Portfolio</span>
                  </>
                )}
              </button>

              <Link
                to="/agent/dashboard"
                className="tactile-3d px-6 py-3.5 sm:px-7 sm:py-3.5 rounded-full bg-gradient-to-r from-[#6C35A6] via-[#7B3DB8] to-[#9146E8] text-white text-xs sm:text-sm font-black flex items-center space-x-2 shadow-[0_8px_24px_rgba(108,53,166,0.35)] hover:shadow-[0_12px_32px_rgba(108,53,166,0.5)] border-t border-white/25 cursor-pointer"
              >
                <Briefcase className="w-4 h-4 text-white/90" />
                <span>Launch Studio</span>
                <ChevronRight className="w-4 h-4 text-white/80" />
              </Link>
            </div>
          </div>

          {/* Pending Verification Notice */}
          {isPendingVerification && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-[2rem] bg-amber-500/10 dark:bg-amber-500/15 backdrop-blur-xl border border-amber-500/30 flex items-start space-x-3.5 mb-8 shadow-[0_8px_25px_rgba(245,158,11,0.1)]"
            >
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
                <span className="font-bold">Verification in progress: </span>
                Your specialist credentials and portfolio are being reviewed by our trust &amp; safety team. You can still customize your offerings and manage listings.
              </div>
            </motion.div>
          )}

          {/* --- 2. EARNINGS & PERFORMANCE SNAPSHOT --- */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">

            <div className="p-5 sm:p-6 rounded-[2.2rem] bg-white/80 dark:bg-[#141414]/80 backdrop-blur-xl border border-white/90 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)] hover:border-brand-interactive/40 hover:shadow-[0_16px_35px_rgba(108,53,166,0.15)] hover:-translate-y-1 hover:scale-[1.02] transition-all duration-200 ease-out cursor-default">
              <div className="flex items-center justify-between text-[#6C757D] text-xs font-bold mb-3">
                <span>Completed Payouts</span>
                <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20 shadow-xs">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black tracking-tight text-[#1A1A1A] dark:text-white">
                ₦{metrics.totalEarnings.toLocaleString()}
              </div>
              <div className="text-[11px] text-emerald-500 font-bold mt-1.5 flex items-center space-x-1">
                <span>{metrics.completedCount} completed sessions</span>
              </div>
            </div>

            <div className="p-5 sm:p-6 rounded-[2.2rem] bg-white/80 dark:bg-[#141414]/80 backdrop-blur-xl border border-white/90 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)] hover:border-brand-interactive/40 hover:shadow-[0_16px_35px_rgba(108,53,166,0.15)] hover:-translate-y-1 hover:scale-[1.02] transition-all duration-200 ease-out cursor-default">
              <div className="flex items-center justify-between text-[#6C757D] text-xs font-bold mb-3">
                <span>Pending Requests</span>
                <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20 shadow-xs">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black tracking-tight text-[#1A1A1A] dark:text-white">
                {metrics.pendingCount}
              </div>
              <div className="text-[11px] text-amber-500 font-bold mt-1.5">
                Requires booking action
              </div>
            </div>

            <div className="p-5 sm:p-6 rounded-[2.2rem] bg-white/80 dark:bg-[#141414]/80 backdrop-blur-xl border border-white/90 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)] hover:border-brand-interactive/40 hover:shadow-[0_16px_35px_rgba(108,53,166,0.15)] hover:-translate-y-1 hover:scale-[1.02] transition-all duration-200 ease-out cursor-default">
              <div className="flex items-center justify-between text-[#6C757D] text-xs font-bold mb-3">
                <span>Active Services</span>
                <div className="w-9 h-9 rounded-2xl bg-brand-interactive/10 text-brand-interactive flex items-center justify-center border border-brand-interactive/20 shadow-xs">
                  <Briefcase className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black tracking-tight text-[#1A1A1A] dark:text-white">
                {metrics.activeServices}
              </div>
              <div className="text-[11px] text-brand-interactive font-bold mt-1.5">
                Live in client catalogue
              </div>
            </div>

            <div className="p-5 sm:p-6 rounded-[2.2rem] bg-white/80 dark:bg-[#141414]/80 backdrop-blur-xl border border-white/90 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)] hover:border-brand-interactive/40 hover:shadow-[0_16px_35px_rgba(108,53,166,0.15)] hover:-translate-y-1 hover:scale-[1.02] transition-all duration-200 ease-out cursor-default">
              <div className="flex items-center justify-between text-[#6C757D] text-xs font-bold mb-3">
                <span>Client Rating</span>
                <div className="w-9 h-9 rounded-2xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center border border-yellow-500/20 shadow-xs">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black tracking-tight text-[#1A1A1A] dark:text-white">
                4.9 <span className="text-sm font-normal text-[#6C757D]">/ 5.0</span>
              </div>
              <div className="text-[11px] text-[#6C757D] font-bold mt-1.5">
                Based on verified clients
              </div>
            </div>
          </div>
        </section>

        {/* --- 3. UPCOMING & TODAY'S SCHEDULE --- */}
        <section className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center space-x-1.5 text-xs font-black text-brand-interactive uppercase tracking-wider">
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>Client Bookings</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-[#1A1A1A] dark:text-white">
                Schedule & Action Items
              </h2>
            </div>
            <Link
              to="/agent/dashboard"
              className="px-4 py-2 rounded-full text-xs font-bold text-brand-interactive hover:bg-brand-interactive/10 flex items-center space-x-1 transition-all active:scale-95"
            >
              <span>Manage all ({bookings.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {upcomingBookings.length > 0 ? (
            <div className="space-y-4">
              {upcomingBookings.slice(0, 5).map((booking) => (
                <div
                  key={booking.id}
                  className="p-5 sm:p-6 rounded-[2.2rem] bg-white/85 dark:bg-[#151515]/85 backdrop-blur-xl border border-white/90 dark:border-white/10 shadow-sm hover:shadow-[0_16px_36px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_16px_36px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 hover:scale-[1.008] transition-all duration-200 ease-out flex flex-col sm:flex-row sm:items-center justify-between gap-5"
                >
                  <div className="flex items-start sm:items-center space-x-4">
                    <div className="w-14 h-14 rounded-full aspect-square bg-brand-interactive/10 text-brand-interactive flex items-center justify-center font-bold text-base shrink-0 overflow-hidden border border-black/5 dark:border-white/10 shadow-xs">
                      {booking.customerAvatar ? (
                        <img
                          src={booking.customerAvatar}
                          alt={booking.customerName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        booking.customerName.slice(0, 2).toUpperCase()
                      )}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2.5">
                        <span className="font-bold text-base sm:text-lg text-[#1A1A1A] dark:text-white">
                          {booking.customerName}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${booking.status === BookingStatus.CONFIRMED
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                            : 'bg-amber-500/10 text-amber-500 border border-amber-500/25 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                          }`}>
                          {booking.status}
                        </span>
                      </div>
                      <div className="text-xs sm:text-sm font-semibold text-brand-interactive mt-0.5">
                        {booking.serviceName} • ₦{booking.price?.toLocaleString()}
                      </div>
                      <div className="flex items-center space-x-3 text-xs text-[#6C757D] dark:text-[#A0A0A0] mt-1.5">
                        <span className="flex items-center">
                          <CalendarIcon className="w-3.5 h-3.5 mr-1" />
                          {booking.date} at {booking.time}
                        </span>
                        <span>•</span>
                        <span className="flex items-center">
                          <MapPin className="w-3.5 h-3.5 mr-1" />
                          {booking.address || 'Client Location'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tactile Action Buttons with Generous Padding */}
                  <div className="flex items-center space-x-2.5 self-end sm:self-center">
                    {booking.status === BookingStatus.PENDING && (
                      <button
                        onClick={() => handleUpdateStatus(booking.id, BookingStatus.CONFIRMED)}
                        disabled={updatingId === booking.id}
                        className="tactile-3d px-5 py-2.5 sm:px-6 sm:py-3 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs sm:text-sm font-bold shadow-[0_6px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_24px_rgba(16,185,129,0.45)] flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Accept Slot</span>
                      </button>
                    )}

                    {booking.status === BookingStatus.CONFIRMED && (
                      <button
                        onClick={() => handleUpdateStatus(booking.id, BookingStatus.COMPLETED)}
                        disabled={updatingId === booking.id}
                        className="tactile-3d px-5 py-2.5 sm:px-6 sm:py-3 rounded-full bg-gradient-to-r from-[#6C35A6] to-[#7B3DB8] text-white text-xs sm:text-sm font-bold shadow-[0_6px_20px_rgba(108,53,166,0.3)] hover:shadow-[0_8px_24px_rgba(108,53,166,0.45)] flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Complete Session</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleUpdateStatus(booking.id, BookingStatus.CANCELLED)}
                      disabled={updatingId === booking.id}
                      className="tactile-3d px-4 py-2.5 sm:px-5 sm:py-3 rounded-full border border-red-500/30 text-red-500 dark:text-red-400 hover:bg-red-500/10 hover:border-red-500/60 text-xs sm:text-sm font-bold cursor-pointer disabled:opacity-50"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center bg-white/80 dark:bg-[#151515]/80 backdrop-blur-xl rounded-[2.2rem] border border-white/90 dark:border-white/10 shadow-sm">
              <CalendarIcon className="w-10 h-10 text-[#6C757D] mx-auto mb-3 opacity-40" />
              <h3 className="font-bold text-base text-[#1A1A1A] dark:text-white">
                No active bookings right now
              </h3>
              <p className="text-xs sm:text-sm text-[#6C757D] dark:text-[#A0A0A0] mt-1 max-w-sm mx-auto">
                Share your specialist portfolio link to attract new appointments from nearby clients!
              </p>
            </div>
          )}
        </section>

        {/* --- 4. YOUR ACTIVE SERVICES STRIP --- */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center space-x-1.5 text-xs font-black text-brand-interactive uppercase tracking-wider">
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Catalogue</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-[#1A1A1A] dark:text-white">
                Your Published Services
              </h2>
            </div>
            <Link
              to="/agent/dashboard"
              className="tactile-3d px-5 py-2.5 sm:px-6 sm:py-3 rounded-full bg-gradient-to-r from-[#6C35A6] to-[#7B3DB8] text-white text-xs sm:text-sm font-black shadow-[0_6px_20px_rgba(108,53,166,0.3)] hover:shadow-[0_8px_24px_rgba(108,53,166,0.45)] flex items-center space-x-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Service</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4.5">
            {services.map((service) => (
              <div
                key={service.id}
                className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#161616] border border-[#E9ECEF] dark:border-[#262626] shadow-sm hover:shadow-md hover:border-brand-interactive/35 transition-all duration-200 flex flex-col justify-between"
              >
                <div className="flex items-center space-x-3.5 mb-3">
                  <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden shrink-0 bg-black/10 border border-black/5 dark:border-white/5">
                    <img
                      src={service.image || 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?q=80&w=400'}
                      alt={service.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-brand-interactive bg-brand-interactive/10 px-2.5 py-0.5 rounded-md border border-brand-interactive/20 inline-block">
                      {service.category}
                    </span>
                    <h4 className="font-bold text-sm sm:text-base text-[#1A1A1A] dark:text-white mt-1 truncate">
                      {service.name}
                    </h4>
                    <span className="text-sm sm:text-base font-black text-brand-interactive block mt-0.5">
                      ₦{service.price?.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-[#E9ECEF]/70 dark:border-[#262626] flex items-center justify-between text-xs">
                  <span className="text-[#6C757D] font-medium text-[11px]">{service.durationMins || 60} mins duration</span>
                  <Link
                    to="/agent/dashboard"
                    className="px-3 py-1 rounded-full bg-brand-interactive/10 hover:bg-brand-interactive text-brand-interactive hover:text-white font-bold text-xs transition-all active:scale-95"
                  >
                    Edit in Studio
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
