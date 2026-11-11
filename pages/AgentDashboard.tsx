import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useReducedMotion } from 'framer-motion';

// ============================================================================
// SCROLL-LINKED STAT BOX TUNING CONSTANTS
// ============================================================================
/** Spring physics configuration for fast, ultra-responsive scroll tracking */
export const STAT_BOX_SPRING_CONFIG = {
  stiffness: 500,
  damping: 32,
  mass: 0.08
} as const;

/** Progress checkpoints: [entering viewport, peak scale point, exiting viewport] */
export const STAT_BOX_SCALE_INPUT: number[] = [0, 0.55, 1];

/** Scale multipliers corresponding to progress checkpoints: [at entry, at focal peak, after leaving top] */
export const STAT_BOX_SCALE_OUTPUT: number[] = [0.8, 1, 0.92];

/** Progress checkpoints for box opacity interpolation */
export const STAT_BOX_OPACITY_INPUT: number[] = [0, 0.2, 0.85, 1];

/** Opacity levels corresponding to progress checkpoints */
export const STAT_BOX_OPACITY_OUTPUT: number[] = [0.35, 1, 1, 0.5];

/** Scroll intersection target boundaries */
export const STAT_BOX_SCROLL_OFFSET: ['start end', 'end start'] = ['start end', 'end start'];
import { 
  House, 
  Briefcase, 
  Calendar, 
  TrendingUp, 
  Star, 
  User, 
  Settings, 
  LogOut, 
  ShieldCheck, 
  Clock, 
  FileText, 
  Upload, 
  Plus, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  DollarSign, 
  Image as ImageIcon, 
  Menu, 
  X, 
  RefreshCw, 
  AlertCircle,
  Pencil,
  MapPin,
  Share2,
  Lock,
  Unlock,
  MessageSquare,
  HelpCircle,
  Check,
  Building,
  CreditCard,
  Phone,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { 
  VerificationStatus, 
  BookingStatus, 
  Service, 
  Booking, 
  Review,
  AgentAvailability, 
  AgentBankDetails 
} from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  getBookingsForUser, 
  getServices, 
  updateBookingStatus, 
  getAgentAvailability,
  updateAgentAvailability,
  getAgentBankDetails,
  updateAgentBankDetails,
  getReviewsForAgent,
  AgentBankSecurityStatus
} from '../services/supabaseService';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CreateServiceModal from '../components/agent/CreateServiceModal';
import ServiceShareModal from '../components/agent/ServiceShareModal';
import AgentProfileEditor from '../components/agent/AgentProfileEditor';
import EditServiceModal from '../components/agent/EditServiceModal';
import BookingChatDrawer from '../components/BookingChatDrawer';
import { useSnackbar } from '../components/Snackbar';
import { dispatchBookingStatusUpdate, getWhatsAppUrl } from '../services/whatsappService';

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

const NIGERIAN_BANKS = [
  'Access Bank',
  'Guaranty Trust Bank (GTBank)',
  'Zenith Bank',
  'First Bank of Nigeria',
  'United Bank for Africa (UBA)',
  'Kuda Bank',
  'Moniepoint Microfinance Bank',
  'OPay Digital Services',
  'Stanbic IBTC Bank',
  'Fidelity Bank',
  'First City Monument Bank (FCMB)',
  'Sterling Bank',
  'Wema Bank / ALAT',
  'Union Bank of Nigeria',
  'Polaris Bank',
  'Providus Bank'
];

const springTransition = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 25
};

const AgentDashboard: React.FC = () => {
  const { user, currentUser, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showSnackbar } = useSnackbar();

  // Navigation tab
  const [view, setView] = useState<'overview' | 'bookings' | 'availability' | 'services' | 'payouts' | 'reviews' | 'profile'>(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'profile') return 'profile';
    if (tabParam === 'bookings') return 'bookings';
    if (tabParam === 'availability') return 'availability';
    if (tabParam === 'payouts') return 'payouts';
    if (tabParam === 'services') return 'services';
    return 'overview';
  });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Modals state
  const [isCreateServiceOpen, setIsCreateServiceOpen] = useState(false);
  const [createdServiceForShare, setCreatedServiceForShare] = useState<Partial<Service> | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Chat Drawer state
  const [activeChatBooking, setActiveChatBooking] = useState<Booking | null>(null);

  // Core Data State (100% live Supabase)
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [bookingFilter, setBookingFilter] = useState<'ALL' | BookingStatus>('ALL');
  
  // Availability state
  const [availability, setAvailability] = useState<AgentAvailability>({
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    startTime: '08:00 AM',
    endTime: '07:00 PM',
    bufferMinutes: 30,
    isEmergencyOff: false
  });
  const [savingSchedule, setSavingSchedule] = useState(false);

  // Bank security & details state
  const [bankStatus, setBankStatus] = useState<AgentBankSecurityStatus>({
    details: null,
    isLocked: true,
    daysRemaining: 20,
    daysElapsed: 0,
    createdAt: new Date().toISOString(),
    unlockDate: '20 days after signup'
  });
  const [bankForm, setBankForm] = useState<AgentBankDetails>({
    bankName: NIGERIAN_BANKS[0],
    accountNumber: '',
    accountName: ''
  });
  const [savingBank, setSavingBank] = useState(false);
  const [bankError, setBankError] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const agentId = user?.id;

  // Sync tab from query param if changed
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['overview', 'bookings', 'availability', 'services', 'payouts', 'reviews', 'profile'].includes(tabParam)) {
      setView(tabParam as any);
    }
  }, [searchParams]);

  // Load all live Supabase data
  const loadData = async () => {
    if (!agentId) return;
    setLoading(true);

    try {
      const [bookingsRes, allServicesRes, availData, bankSec, agentReviews] = await Promise.all([
        getBookingsForUser(agentId, 'agent', true),
        getServices(true),
        getAgentAvailability(agentId),
        getAgentBankDetails(agentId, user?.created_at),
        getReviewsForAgent(agentId)
      ]);

      if (bookingsRes.data) {
        setBookings(bookingsRes.data);
      }
      if (allServicesRes.data) {
        const myServices = allServicesRes.data.filter(s => s.agentId === agentId);
        setServices(myServices);
      }
      setAvailability(availData);
      setBankStatus(bankSec);
      if (bankSec.details) {
        setBankForm(bankSec.details);
      }
      setReviews(agentReviews);
    } catch (err) {
      console.error('Error loading agent dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (user) {
      loadData();
    }
  }, [user, authLoading]);

  // Status transitions
  const handleStatusChange = async (bookingId: string, newStatus: BookingStatus) => {
    const targetBooking = bookings.find(b => b.id === bookingId);
    const ok = await updateBookingStatus(bookingId, newStatus);
    if (ok) {
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
      showSnackbar(`Appointment status updated to ${newStatus}`, 'success');

      // Dispatch real-time WhatsApp alert to client
      if (targetBooking) {
        dispatchBookingStatusUpdate({
          bookingId: targetBooking.id,
          status: newStatus,
          customerName: targetBooking.customerName,
          customerPhone: targetBooking.customerPhone,
          agentName: targetBooking.agentName || currentUser?.name || 'Specialist',
          agentPhone: currentUser?.phone,
          serviceName: targetBooking.serviceName,
          date: targetBooking.date,
          time: targetBooking.time,
          address: targetBooking.address
        }).catch(() => {});
      }
    } else {
      showSnackbar('Failed to update status', 'error');
    }
  };

  // Toggle single day of the week
  const toggleDay = (day: string) => {
    setAvailability(prev => {
      const exists = prev.days.includes(day);
      const newDays = exists ? prev.days.filter(d => d !== day) : [...prev.days, day];
      return { ...prev, days: newDays };
    });
  };

  // Save Working Schedule
  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentId) return;
    setSavingSchedule(true);
    const ok = await updateAgentAvailability(agentId, availability);
    setSavingSchedule(false);
    if (ok) {
      showSnackbar('Working hours & calendar updated', 'success');
    } else {
      showSnackbar('Failed to save schedule changes', 'error');
    }
  };

  // Save Bank Details (with 20-day validation)
  const handleSaveBankDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentId) return;

    if (bankStatus.isLocked) {
      showSnackbar(`Security Hold: Bank details locked for ${bankStatus.daysRemaining} more days.`, 'info');
      return;
    }

    if (!bankForm.accountNumber || bankForm.accountNumber.trim().length !== 10) {
      setBankError('Nigerian NUBAN account number must be exactly 10 digits.');
      return;
    }

    if (!bankForm.accountName || bankForm.accountName.trim().length < 3) {
      setBankError('Please enter your full verified Account Holder Name.');
      return;
    }

    setSavingBank(true);
    setBankError(null);

    const res = await updateAgentBankDetails(agentId, bankForm, user?.created_at);
    setSavingBank(false);

    if (res.success) {
      showSnackbar('Bank payout account registered successfully', 'success');
      const updated = await getAgentBankDetails(agentId, user?.created_at);
      setBankStatus(updated);
    } else {
      setBankError(res.error || 'Failed to save payout details');
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  // Metrics
  const pendingBookings = bookings.filter(b => b.status === BookingStatus.PENDING);
  const confirmedBookings = bookings.filter(b => b.status === BookingStatus.CONFIRMED);
  const completedBookings = bookings.filter(b => b.status === BookingStatus.COMPLETED);
  const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.price || 0), 0);

  const averageRating = services.length > 0
    ? (services.reduce((sum, s) => sum + (s.rating || 0), 0) / services.length).toFixed(1)
    : '0.0';

  const filteredBookings = bookingFilter === 'ALL'
    ? bookings
    : bookings.filter(b => b.status === bookingFilter);

  if (authLoading || (!user && loading)) {
    return (
      <div className="min-h-screen bg-brand-surface dark:bg-[#0D0D0D] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-interactive/30 border-t-brand-interactive rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-surface dark:bg-[#0D0D0D] flex pt-20">
      {/* Mobile Menu Toggle */}
      <div className="lg:hidden fixed top-24 right-6 z-40">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-3 bg-brand-background dark:bg-[#1A1A1A] rounded-2xl shadow-xl border border-[#E9ECEF] dark:border-[#2D2D2D]"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </motion.button>
      </div>

      {/* Sidebar Navigation */}
      <AnimatePresence>
        {(isMobileMenuOpen || window.innerWidth >= 1024) && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={springTransition}
            className={`
              fixed lg:sticky top-0 lg:top-20 left-0 h-full lg:h-[calc(100vh-80px)] z-50 lg:z-auto
              w-80 bg-brand-background dark:bg-[#111111] border-r border-[#E9ECEF] dark:border-[#2D2D2D] p-6 sm:p-8 
              lg:flex flex-col shadow-2xl lg:shadow-none overflow-y-auto
              ${isMobileMenuOpen ? 'flex' : 'hidden lg:flex'}
            `}
          >
            {/* Mobile Header in Menu */}
            <div className="lg:hidden flex justify-between items-center mb-6">
              <span className="font-serif font-black text-xl">Specialist Studio</span>
              <button onClick={() => setIsMobileMenuOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Specialist Profile Card in Sidebar */}
            <div className="flex items-center space-x-4 mb-8 p-3 rounded-2xl bg-brand-surface dark:bg-white/5 border border-[#E9ECEF] dark:border-white/5">
              {currentUser?.avatar ? (
                <img src={currentUser.avatar} className="w-14 h-14 rounded-2xl object-cover shadow-md" alt="" />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-brand-interactive/10 text-brand-interactive flex items-center justify-center font-bold text-lg shadow-md">
                  <User className="w-7 h-7" />
                </div>
              )}
              <div className="overflow-hidden">
                <div className="font-bold text-sm sm:text-base leading-tight truncate text-[#1A1A1A] dark:text-white">
                  {currentUser?.name || 'Specialist'}
                </div>
                <div className="flex items-center text-[10px] text-green-500 font-black mt-1">
                  <ShieldCheck className="w-3 h-3 mr-1 shrink-0" />
                  <span>{currentUser?.verificationStatus === VerificationStatus.VERIFIED ? 'Verified Pro' : 'Pending Verification'}</span>
                </div>
              </div>
            </div>

            {/* Navigation links */}
            <nav className="flex-grow space-y-1.5">
              <SidebarItem 
                icon={<House />} 
                label="Command Center" 
                badge={pendingBookings.length > 0 ? `${pendingBookings.length}` : undefined}
                active={view === 'overview'} 
                onClick={() => { setView('overview'); setIsMobileMenuOpen(false); }} 
              />
              <SidebarItem 
                icon={<Calendar />} 
                label="Bookings Pipeline" 
                badge={bookings.length > 0 ? `${bookings.length}` : undefined}
                active={view === 'bookings'} 
                onClick={() => { setView('bookings'); setIsMobileMenuOpen(false); }} 
              />
              <SidebarItem 
                icon={<Clock />} 
                label="Working Hours & Days" 
                active={view === 'availability'} 
                onClick={() => { setView('availability'); setIsMobileMenuOpen(false); }} 
              />
              <SidebarItem 
                icon={<Briefcase />} 
                label="Services Boutique" 
                badge={services.length > 0 ? `${services.length}` : undefined}
                active={view === 'services'} 
                onClick={() => { setView('services'); setIsMobileMenuOpen(false); }} 
              />
              <SidebarItem 
                icon={<CreditCard />} 
                label="Payouts & Bank" 
                badge={bankStatus.isLocked ? `${bankStatus.daysRemaining}d` : 'Ready'}
                badgeColor={bankStatus.isLocked ? 'bg-amber-500/10 text-amber-500' : 'bg-green-500/10 text-green-500'}
                active={view === 'payouts'} 
                onClick={() => { setView('payouts'); setIsMobileMenuOpen(false); }} 
              />
              <SidebarItem 
                icon={<Star />} 
                label="Client Reviews" 
                badge={reviews.length > 0 ? `${reviews.length}` : undefined}
                active={view === 'reviews'} 
                onClick={() => { setView('reviews'); setIsMobileMenuOpen(false); }} 
              />
              <SidebarItem 
                icon={<Pencil />} 
                label="Profile Studio" 
                active={view === 'profile'} 
                onClick={() => { setView('profile'); setIsMobileMenuOpen(false); }} 
              />
            </nav>

            <motion.button 
              whileTap={{ scale: 0.96 }}
              onClick={handleLogout}
              className="flex items-center space-x-3 p-3.5 text-brand-interactive font-black text-xs hover:bg-brand-interactive/5 rounded-2xl transition-all mt-6"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </motion.button>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-grow p-4 sm:p-8 lg:p-12 overflow-y-auto w-full">
        {/* Top Header */}
        <header className="flex flex-wrap justify-between items-center gap-4 mb-8 sm:mb-10">
          <div>
            <h1 className="text-2xl sm:text-4xl font-serif font-black text-[#1A1A1A] dark:text-white">
              {view === 'overview' && `Welcome back, ${currentUser?.name || user?.user_metadata?.name || ''}`}
              {view === 'bookings' && 'Appointments Pipeline'}
              {view === 'availability' && 'Working Hours & Schedule'}
              {view === 'services' && 'Services Catalog'}
              {view === 'payouts' && 'Bank Payouts & Security'}
              {view === 'reviews' && 'Client Feedback & Reviews'}
              {view === 'profile' && 'Public Profile Studio'}
            </h1>
            {view !== 'overview' && (
              <p className="text-xs sm:text-sm text-[#6C757D] font-medium hidden sm:block mt-1">
                Welcome back, {currentUser?.name || user?.user_metadata?.name || ''}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {/* Quick emergency status indicator - Neumorphic Glass Effect */}
            <button
              type="button"
              onClick={() => setView('availability')}
              title="Click to view & edit appointment schedule"
              className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs font-black flex items-center space-x-2.5 transition-all duration-300 backdrop-blur-2xl cursor-pointer select-none active:scale-95 hover:scale-[1.02] ${
                availability.isEmergencyOff
                  ? 'bg-rose-500/[0.08] dark:bg-rose-500/[0.14] text-rose-600 dark:text-rose-400 border border-rose-500/30 dark:border-rose-400/25 shadow-[inset_0_1px_2px_rgba(255,255,255,0.7),0_8px_20px_-4px_rgba(244,63,94,0.22),0_2px_6px_rgba(0,0,0,0.04)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.18),inset_0_-1px_2px_rgba(0,0,0,0.5),0_10px_24px_-4px_rgba(0,0,0,0.5)]'
                  : 'bg-emerald-500/[0.08] dark:bg-emerald-500/[0.14] text-emerald-600 dark:text-emerald-400 border border-emerald-500/35 dark:border-emerald-400/25 shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_8px_20px_-4px_rgba(16,185,129,0.24),0_2px_6px_rgba(0,0,0,0.04)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),inset_0_-1px_2px_rgba(0,0,0,0.5),0_10px_24px_-4px_rgba(0,0,0,0.5)]'
              }`}
            >
              <span className="relative flex h-2.5 w-2.5 items-center justify-center shrink-0">
                {!availability.isEmergencyOff && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                )}
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    availability.isEmergencyOff
                      ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.9)]'
                      : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.95)]'
                  }`}
                />
              </span>
              <span className="tracking-tight">
                {availability.isEmergencyOff ? 'Unavailable Today' : 'Accepting Appointments'}
              </span>
            </button>

            <motion.button 
              whileTap={{ scale: 0.92 }}
              onClick={loadData}
              className="p-3 bg-brand-background dark:bg-[#1A1A1A] border border-[#E9ECEF] dark:border-[#2D2D2D] rounded-2xl text-[#6C757D] hover:text-brand-interactive transition-all shadow-sm"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </motion.button>
          </div>
        </header>

        {/* View Switcher Content */}
        {loading && bookings.length === 0 && services.length === 0 ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-brand-background dark:bg-[#1A1A1A] rounded-[2.5rem] animate-pulse border border-[#E9ECEF] dark:border-[#2D2D2D]" />
              ))}
            </div>
            <div className="h-64 bg-brand-background dark:bg-[#1A1A1A] rounded-[2rem] animate-pulse border border-[#E9ECEF] dark:border-[#2D2D2D]" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={springTransition}
            >
              {/* TAB 1: OVERVIEW */}
              {view === 'overview' && (
                <div className="space-y-10">
                  {/* KPI Cards with Scroll-Linked Scale Effect */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <ScrollScaleBox>
                      <StatSquircle 
                        label="Total Earnings" 
                        value={`₦${totalRevenue.toLocaleString()}`} 
                        highlightColor="text-green-500"
                        subtext="Completed appointments"
                      />
                    </ScrollScaleBox>
                    <ScrollScaleBox>
                      <StatSquircle 
                        label="Client Rating" 
                        value={Number(averageRating) > 0 ? averageRating : 'New'} 
                        hasStar={Number(averageRating) > 0}
                        subtext={`${reviews.length} verified reviews`}
                      />
                    </ScrollScaleBox>
                    <ScrollScaleBox>
                      <StatSquircle 
                        label="Pending Requests" 
                        value={pendingBookings.length.toString()} 
                        highlight={pendingBookings.length > 0}
                        subtext="Requires your action"
                      />
                    </ScrollScaleBox>
                    <ScrollScaleBox>
                      <StatSquircle 
                        label="Active Offerings" 
                        value={services.length.toString()} 
                        subtext="Published in boutique"
                      />
                    </ScrollScaleBox>
                  </div>

                  {/* Quick Action Banner */}
                  <div className="p-6 sm:p-8 bg-gradient-to-r from-[#32104D] via-[#6C35A6] to-[#A78BCE] rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                    <div className="relative z-10 max-w-xl">
                      <h2 className="text-2xl sm:text-3xl font-serif font-black mb-2">
                        Grow Your Beauty Business
                      </h2>
                      <p className="text-xs sm:text-sm text-white/80 leading-relaxed mb-6">
                        Set your exact availability calendar so clients never double-book you, publish high-converting beauty services, and manage in-app client chats safely.
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setIsCreateServiceOpen(true)}
                          className="px-6 py-3 bg-white text-[#32104D] rounded-2xl font-black text-xs shadow-lg hover:bg-gray-100 transition-all flex items-center space-x-2"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Publish New Service</span>
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setView('availability')}
                          className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold text-xs backdrop-blur-md transition-all flex items-center space-x-2 border border-white/20"
                        >
                          <Clock className="w-4 h-4" />
                          <span>Configure Hours</span>
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  {/* Upcoming / Recent Bookings */}
                  <section>
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#1A1A1A] dark:text-white">
                          Recent Appointment Requests
                        </h3>
                        <p className="text-xs text-[#6C757D]">Live client reservations awaiting service</p>
                      </div>
                      {bookings.length > 0 && (
                        <button 
                          onClick={() => setView('bookings')} 
                          className="text-brand-interactive font-black text-xs hover:underline flex items-center space-x-1"
                        >
                          <span>View Pipeline ({bookings.length})</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-4">
                      {bookings.slice(0, 4).map(b => (
                        <BookingCard 
                          key={b.id} 
                          booking={b} 
                          onStatusChange={handleStatusChange} 
                          onOpenChat={() => setActiveChatBooking(b)} 
                        />
                      ))}
                      {bookings.length === 0 && (
                        <div className="p-12 text-center text-[#6C757D] bg-brand-background dark:bg-[#1A1A1A] rounded-[2.5rem] border border-[#E9ECEF] dark:border-[#2D2D2D] shadow-sm">
                          <Calendar className="w-10 h-10 opacity-30 mx-auto mb-3" />
                          <h4 className="font-bold text-base sm:text-lg mb-1">No Active Bookings Yet</h4>
                          <p className="text-xs max-w-sm mx-auto">
                            When clients discover your services and book appointments, they will appear here in real time.
                          </p>
                        </div>
                      )}
                    </div>
                  </section>
                </div>
              )}

              {/* TAB 2: BOOKINGS PIPELINE */}
              {view === 'bookings' && (
                <div className="space-y-6">
                  {/* Status Filter Chips */}
                  <div className="flex flex-wrap gap-2.5">
                    {(['ALL', BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.COMPLETED, BookingStatus.CANCELLED] as const).map(f => (
                      <motion.button
                        key={f}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setBookingFilter(f)}
                        className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all border ${
                          bookingFilter === f
                            ? 'bg-brand-interactive text-white border-brand-interactive shadow-lg shadow-brand-interactive/20'
                            : 'bg-brand-background dark:bg-[#1A1A1A] border-[#E9ECEF] dark:border-[#2D2D2D] text-[#6C757D] hover:border-brand-interactive/40'
                        }`}
                      >
                        {f === 'ALL' ? `All Appointments (${bookings.length})` : `${f} (${bookings.filter(b => b.status === f).length})`}
                      </motion.button>
                    ))}
                  </div>

                  {/* Bookings List */}
                  <div className="space-y-4">
                    {filteredBookings.length > 0 ? (
                      filteredBookings.map(b => (
                        <BookingCard 
                          key={b.id} 
                          booking={b} 
                          onStatusChange={handleStatusChange} 
                          onOpenChat={() => setActiveChatBooking(b)} 
                        />
                      ))
                    ) : (
                      <div className="p-16 text-center text-[#6C757D] bg-brand-background dark:bg-[#1A1A1A] rounded-[2.5rem] border border-[#E9ECEF] dark:border-[#2D2D2D]">
                        <Calendar className="w-10 h-10 opacity-30 mx-auto mb-3" />
                        <h4 className="font-bold text-base mb-1">No appointments found in this view</h4>
                        <p className="text-xs">Adjust filters above to see different appointment statuses.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: AVAILABILITY & WORKING HOURS */}
              {view === 'availability' && (
                <div className="max-w-3xl space-y-8">
                  {/* Emergency Toggle Card */}
                  <div className={`p-6 sm:p-8 rounded-[2.5rem] border shadow-xl transition-all ${
                    availability.isEmergencyOff 
                      ? 'bg-red-500/5 border-red-500/20' 
                      : 'bg-brand-background dark:bg-[#1A1A1A] border-[#E9ECEF] dark:border-[#2D2D2D]'
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`w-3 h-3 rounded-full ${availability.isEmergencyOff ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`} />
                          <h3 className="font-serif font-black text-lg sm:text-xl text-[#1A1A1A] dark:text-white">
                            Emergency Pause / Away Today
                          </h3>
                        </div>
                        <p className="text-xs text-[#6C757D] leading-relaxed max-w-md">
                          Temporarily stop taking new customer bookings today without altering your standard weekly schedule.
                        </p>
                      </div>

                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setAvailability(prev => ({ ...prev, isEmergencyOff: !prev.isEmergencyOff }))}
                        className={`px-6 py-3.5 rounded-2xl text-xs font-black transition-all shadow-md ${
                          availability.isEmergencyOff
                            ? 'bg-red-500 text-white shadow-red-500/25'
                            : 'bg-brand-surface dark:bg-white/10 text-[#1A1A1A] dark:text-white hover:bg-gray-200'
                        }`}
                      >
                        {availability.isEmergencyOff ? 'Resume Accepting Bookings' : 'Set as Unavailable Today'}
                      </motion.button>
                    </div>
                  </div>

                  {/* Regular Schedule Form */}
                  <form onSubmit={handleSaveSchedule} className="p-6 sm:p-8 bg-brand-background dark:bg-[#1A1A1A] rounded-[2.5rem] border border-[#E9ECEF] dark:border-[#2D2D2D] shadow-xl space-y-8">
                    <div>
                      <h3 className="font-serif font-black text-xl text-[#1A1A1A] dark:text-white mb-1">
                        Weekly Operating Days
                      </h3>
                      <p className="text-xs text-[#6C757D] mb-4">
                        Tap each day you are available for client bookings. Days turned off will automatically be disabled on the booking calendar.
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
                        {DAYS_OF_WEEK.map(day => {
                          const isSelected = availability.days.includes(day);
                          return (
                            <motion.button
                              key={day}
                              type="button"
                              whileTap={{ scale: 0.92 }}
                              onClick={() => toggleDay(day)}
                              className={`p-3.5 rounded-2xl text-xs font-black flex flex-col items-center justify-center transition-all border ${
                                isSelected
                                  ? 'bg-[#6C35A6] text-white border-[#6C35A6] shadow-md shadow-[#6C35A6]/20'
                                  : 'bg-brand-surface dark:bg-white/5 text-[#6C757D] border-[#E9ECEF] dark:border-[#2D2D2D]'
                              }`}
                            >
                              <span>{day.slice(0, 3)}</span>
                              <div className="mt-1">
                                {isSelected ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5 opacity-40" />}
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Operating Hours */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-[#E9ECEF] dark:border-[#2D2D2D]">
                      <div>
                        <label className="block text-xs font-black text-[#6C757D] uppercase tracking-wider mb-2">
                          Opening Time
                        </label>
                        <select
                          value={availability.startTime}
                          onChange={(e) => setAvailability(prev => ({ ...prev, startTime: e.target.value }))}
                          className="w-full p-3.5 bg-brand-surface dark:bg-[#0D0D0D] border border-[#E9ECEF] dark:border-[#2D2D2D] rounded-2xl text-xs sm:text-sm font-bold text-[#1A1A1A] dark:text-white outline-none focus:border-brand-interactive transition-all"
                        >
                          {['07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM'].map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-black text-[#6C757D] uppercase tracking-wider mb-2">
                          Closing Time
                        </label>
                        <select
                          value={availability.endTime}
                          onChange={(e) => setAvailability(prev => ({ ...prev, endTime: e.target.value }))}
                          className="w-full p-3.5 bg-brand-surface dark:bg-[#0D0D0D] border border-[#E9ECEF] dark:border-[#2D2D2D] rounded-2xl text-xs sm:text-sm font-bold text-[#1A1A1A] dark:text-white outline-none focus:border-brand-interactive transition-all"
                        >
                          {['05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM', '10:00 PM'].map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Buffer Duration */}
                    <div className="pt-6 border-t border-[#E9ECEF] dark:border-[#2D2D2D]">
                      <label className="block text-xs font-black text-[#6C757D] uppercase tracking-wider mb-2">
                        Buffer Time Between Appointments
                      </label>
                      <p className="text-xs text-[#6C757D] mb-3">
                        Travel, sanitation, and setup window added between consecutive client sessions.
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[15, 30, 45, 60].map(mins => (
                          <motion.button
                            key={mins}
                            type="button"
                            whileTap={{ scale: 0.94 }}
                            onClick={() => setAvailability(prev => ({ ...prev, bufferMinutes: mins }))}
                            className={`p-3 rounded-2xl text-xs font-black border transition-all ${
                              availability.bufferMinutes === mins
                                ? 'bg-brand-interactive text-white border-brand-interactive shadow-md'
                                : 'bg-brand-surface dark:bg-white/5 border-[#E9ECEF] dark:border-[#2D2D2D] text-[#6C757D]'
                            }`}
                          >
                            {mins} Minutes
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="pt-6 border-t border-[#E9ECEF] dark:border-[#2D2D2D] flex justify-end">
                      <motion.button
                        type="submit"
                        disabled={savingSchedule}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-3.5 bg-brand-interactive text-white rounded-2xl font-black text-xs shadow-xl shadow-brand-interactive/25 hover:scale-105 active:scale-95 disabled:opacity-50 transition-all flex items-center space-x-2"
                      >
                        {savingSchedule ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            <span>Save Working Schedule</span>
                          </>
                        )}
                      </motion.button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 4: SERVICES BOUTIQUE */}
              {view === 'services' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#1A1A1A] dark:text-white">
                        My Published Services ({services.length})
                      </h3>
                      <p className="text-xs text-[#6C757D]">Offerings visible on your public specialist boutique</p>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsCreateServiceOpen(true)}
                      className="px-6 py-3 bg-brand-interactive text-white rounded-2xl font-black text-xs shadow-lg shadow-brand-interactive/20 hover:scale-105 active:scale-95 transition-all flex items-center space-x-2 self-start sm:self-auto"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Service</span>
                    </motion.button>
                  </div>

                  {services.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {services.map(s => (
                        <div 
                          key={s.id} 
                          className="bg-brand-background dark:bg-[#1A1A1A] rounded-[2.5rem] border border-[#E9ECEF] dark:border-[#2D2D2D] p-5 shadow-xl flex flex-col justify-between group hover:border-brand-interactive/40 transition-all"
                        >
                          <div>
                            <div className="relative aspect-video rounded-2xl overflow-hidden mb-4 bg-black/10">
                              {s.image ? (
                                <img src={s.image} alt={s.name} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center font-bold text-xs text-brand-interactive bg-brand-interactive/10">
                                  {s.category}
                                </div>
                              )}
                              <span className="absolute top-3 left-3 px-2.5 py-1 bg-black/70 backdrop-blur-md rounded-xl text-[10px] font-black text-white">
                                {s.category}
                              </span>
                            </div>

                            <h4 className="font-serif font-bold text-lg text-[#1A1A1A] dark:text-white mb-1">
                              {s.name}
                            </h4>
                            <div className="text-green-500 font-black text-xl mb-3">
                              ₦{s.price.toLocaleString()}
                            </div>

                            <div className="flex items-center space-x-4 text-xs text-[#6C757D] mb-4">
                              <span className="flex items-center">
                                <Clock className="w-3.5 h-3.5 mr-1 text-brand-interactive" />
                                {s.durationMins || 60} mins
                              </span>
                              <span className="flex items-center">
                                <Star className="w-3.5 h-3.5 mr-1 text-amber-500 fill-amber-500" />
                                {s.rating > 0 ? s.rating : 'New'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 pt-3 border-t border-[#E9ECEF] dark:border-[#2D2D2D]">
                            <motion.button
                              whileTap={{ scale: 0.94 }}
                              onClick={() => setEditingService(s)}
                              className="flex-1 py-2.5 bg-brand-surface dark:bg-white/5 hover:bg-brand-interactive/10 text-brand-interactive rounded-xl font-black text-xs transition-all flex items-center justify-center space-x-1.5"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              <span>Edit Service</span>
                            </motion.button>
                            <motion.button
                              whileTap={{ scale: 0.94 }}
                              onClick={() => {
                                setCreatedServiceForShare(s);
                                setIsShareModalOpen(true);
                              }}
                              className="p-2.5 bg-brand-surface dark:bg-white/5 hover:bg-black/5 text-[#6C757D] rounded-xl transition-all"
                              title="Share service link"
                            >
                              <Share2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-16 text-center text-[#6C757D] bg-brand-background dark:bg-[#1A1A1A] rounded-[2.5rem] border border-[#E9ECEF] dark:border-[#2D2D2D]">
                      <Briefcase className="w-12 h-12 opacity-30 mx-auto mb-3" />
                      <h4 className="font-bold text-lg mb-1">No Published Services</h4>
                      <p className="text-xs mb-6 max-w-sm mx-auto">
                        Publish your beauty specialties with pricing and duration so prospective clients can book your sessions.
                      </p>
                      <button
                        onClick={() => setIsCreateServiceOpen(true)}
                        className="px-6 py-3 bg-brand-interactive text-white rounded-2xl text-xs font-black shadow-lg"
                      >
                        Publish First Service
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: PAYOUTS & BANK SETUP WITH 20-DAY RULE */}
              {view === 'payouts' && (
                <div className="max-w-2xl space-y-8">
                  {/* 20-Day Security Status Banner */}
                  {bankStatus.isLocked ? (
                    <div className="p-6 sm:p-8 bg-amber-500/10 border-2 border-amber-500/30 rounded-[2.5rem] shadow-xl relative overflow-hidden">
                      <div className="flex items-start space-x-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/30">
                          <Lock className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-serif font-black text-xl text-amber-900 dark:text-amber-200">
                              Security Hold: 20-Day Verification Period
                            </h3>
                          </div>
                          <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed mt-1">
                            Bank payout account details cannot be registered until 20 days after your initial account registration. This strict security protocol protects client deposits, combats fraudulent account takeovers, and verifies appointment delivery integrity.
                          </p>
                        </div>
                      </div>

                      {/* Countdown Visual Progress Bar */}
                      <div className="mt-6 p-4 bg-amber-500/15 rounded-2xl space-y-2">
                        <div className="flex justify-between text-xs font-black text-amber-900 dark:text-amber-200">
                          <span>{bankStatus.daysElapsed} days elapsed</span>
                          <span>{bankStatus.daysRemaining} days remaining</span>
                        </div>
                        <div className="w-full h-3 bg-amber-500/20 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, Math.max(5, (bankStatus.daysElapsed / 20) * 100))}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className="h-full bg-amber-500 rounded-full"
                          />
                        </div>
                        <div className="text-[11px] text-amber-800 dark:text-amber-300 pt-1">
                          Estimated unlock date: <strong className="font-black">{bankStatus.unlockDate}</strong>
                        </div>
                      </div>

                      {/* User requirement: Small line of text directing to support for any issues */}
                      <div className="mt-5 pt-4 border-t border-amber-500/20 flex items-center space-x-2 text-xs text-amber-900 dark:text-amber-200 font-medium">
                        <HelpCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                        <span>
                          Have urgent payout questions or need priority verification? Please{' '}
                          <a 
                            href="mailto:support@everythingbeauty.ng?subject=Urgent Payout Assistance - Agent ID"
                            className="font-black underline hover:text-amber-700 dark:hover:text-amber-100"
                          >
                            contact support
                          </a>{' '}
                          or email support@everythingbeauty.ng for early review.
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 sm:p-8 bg-green-500/10 border-2 border-green-500/30 rounded-[2.5rem] shadow-xl flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-2xl bg-green-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-green-500/30">
                        <Unlock className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-serif font-black text-xl text-green-900 dark:text-green-200 mb-1">
                          Payout Registration Unlocked
                        </h3>
                        <p className="text-xs text-green-800 dark:text-green-300 leading-relaxed">
                          Your 20-day security probation is complete. You can now register or update your verified Nigerian bank account for automated booking payouts.
                        </p>
                        <p className="text-[11px] text-green-800/80 dark:text-green-300/80 mt-2">
                          For assistance, please contact support at support@everythingbeauty.ng.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Bank Details Form */}
                  <form onSubmit={handleSaveBankDetails} className="p-6 sm:p-8 bg-brand-background dark:bg-[#1A1A1A] rounded-[2.5rem] border border-[#E9ECEF] dark:border-[#2D2D2D] shadow-xl space-y-6">
                    <div>
                      <h3 className="font-serif font-black text-xl text-[#1A1A1A] dark:text-white mb-1">
                        Nigerian Bank Account (NUBAN)
                      </h3>
                      <p className="text-xs text-[#6C757D]">
                        Funds from completed client sessions will be disbursed directly to this account.
                      </p>
                    </div>

                    {bankError && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{bankError}</span>
                      </div>
                    )}

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-black text-[#6C757D] uppercase tracking-wider mb-2 flex items-center">
                          <Building className="w-3.5 h-3.5 mr-1 text-brand-interactive" />
                          Bank Name
                        </label>
                        <select
                          disabled={bankStatus.isLocked}
                          value={bankForm.bankName}
                          onChange={(e) => setBankForm(prev => ({ ...prev, bankName: e.target.value }))}
                          className="w-full p-3.5 bg-brand-surface dark:bg-[#0D0D0D] border border-[#E9ECEF] dark:border-[#2D2D2D] rounded-2xl text-xs sm:text-sm font-bold text-[#1A1A1A] dark:text-white outline-none focus:border-brand-interactive disabled:opacity-50 transition-all"
                        >
                          {NIGERIAN_BANKS.map(b => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-black text-[#6C757D] uppercase tracking-wider mb-2 flex items-center">
                          <CreditCard className="w-3.5 h-3.5 mr-1 text-brand-interactive" />
                          10-Digit NUBAN Account Number
                        </label>
                        <input
                          type="text"
                          disabled={bankStatus.isLocked}
                          maxLength={10}
                          placeholder="e.g. 0123456789"
                          value={bankForm.accountNumber}
                          onChange={(e) => setBankForm(prev => ({ ...prev, accountNumber: e.target.value.replace(/\D/g, '') }))}
                          className="w-full p-3.5 bg-brand-surface dark:bg-[#0D0D0D] border border-[#E9ECEF] dark:border-[#2D2D2D] rounded-2xl text-xs sm:text-sm font-black tracking-widest text-[#1A1A1A] dark:text-white outline-none focus:border-brand-interactive disabled:opacity-50 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black text-[#6C757D] uppercase tracking-wider mb-2 flex items-center">
                          <User className="w-3.5 h-3.5 mr-1 text-brand-interactive" />
                          Account Holder Full Name
                        </label>
                        <input
                          type="text"
                          disabled={bankStatus.isLocked}
                          placeholder="Must match your official bank registration"
                          value={bankForm.accountName}
                          onChange={(e) => setBankForm(prev => ({ ...prev, accountName: e.target.value }))}
                          className="w-full p-3.5 bg-brand-surface dark:bg-[#0D0D0D] border border-[#E9ECEF] dark:border-[#2D2D2D] rounded-2xl text-xs sm:text-sm font-bold text-[#1A1A1A] dark:text-white outline-none focus:border-brand-interactive disabled:opacity-50 transition-all"
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#E9ECEF] dark:border-[#2D2D2D] flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="text-[11px] text-[#6C757D]">
                        Contact support for any account issues or early authorization requests.
                      </div>

                      <motion.button
                        type="submit"
                        disabled={bankStatus.isLocked || savingBank}
                        whileTap={{ scale: 0.95 }}
                        className="w-full sm:w-auto px-8 py-3.5 bg-brand-interactive text-white rounded-2xl font-black text-xs shadow-xl shadow-brand-interactive/25 hover:scale-105 active:scale-95 disabled:opacity-40 transition-all flex items-center justify-center space-x-2"
                      >
                        {savingBank ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            <span>Save Bank Details</span>
                          </>
                        )}
                      </motion.button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 6: REVIEWS EXPLORER */}
              {view === 'reviews' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#1A1A1A] dark:text-white">
                      Verified Client Reviews ({reviews.length})
                    </h3>
                    <p className="text-xs text-[#6C757D]">Ratings submitted after appointment completion</p>
                  </div>

                  {reviews.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {reviews.map(r => (
                        <div key={r.id} className="p-6 bg-brand-background dark:bg-[#1A1A1A] rounded-[2.5rem] border border-[#E9ECEF] dark:border-[#2D2D2D] shadow-lg flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                {r.userAvatar ? (
                                  <img src={r.userAvatar} className="w-10 h-10 rounded-2xl object-cover" alt="" />
                                ) : (
                                  <div className="w-10 h-10 rounded-2xl bg-brand-interactive/10 text-brand-interactive flex items-center justify-center font-bold text-xs">
                                    {r.userName.charAt(0)}
                                  </div>
                                )}
                                <div>
                                  <h4 className="font-bold text-sm text-[#1A1A1A] dark:text-white leading-tight">
                                    {r.userName}
                                  </h4>
                                  <span className="text-[10px] text-brand-interactive font-bold">
                                    {r.serviceName}
                                  </span>
                                </div>
                              </div>
                              <span className="text-[10px] text-[#6C757D] font-medium">{r.date}</span>
                            </div>

                            <div className="flex items-center space-x-1 mb-2">
                              {[1, 2, 3, 4, 5].map(st => (
                                <Star
                                  key={st}
                                  className={`w-3.5 h-3.5 ${
                                    st <= r.rating
                                      ? 'text-amber-500 fill-amber-500'
                                      : 'text-gray-300 dark:text-gray-700'
                                  }`}
                                />
                              ))}
                            </div>

                            <p className="text-xs sm:text-sm text-[#6C757D] leading-relaxed">
                              "{r.text || 'Great appointment experience.'}"
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-16 text-center text-[#6C757D] bg-brand-background dark:bg-[#1A1A1A] rounded-[2.5rem] border border-[#E9ECEF] dark:border-[#2D2D2D]">
                      <Star className="w-10 h-10 opacity-30 mx-auto mb-3" />
                      <h4 className="font-bold text-base mb-1">No Client Reviews Yet</h4>
                      <p className="text-xs max-w-sm mx-auto">
                        Reviews will automatically populate once your clients complete their appointments.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 7: PROFILE STUDIO */}
              {view === 'profile' && (
                <AgentProfileEditor
                  services={services}
                  onOpenCreateService={() => setIsCreateServiceOpen(true)}
                  onProfileUpdated={loadData}
                />
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* MODAL 1: Create Service */}
        <CreateServiceModal
          agentId={agentId || ''}
          isOpen={isCreateServiceOpen}
          onClose={() => setIsCreateServiceOpen(false)}
          onSuccess={(newService) => {
            setIsCreateServiceOpen(false);
            setCreatedServiceForShare(newService);
            setIsShareModalOpen(true);
            loadData();
          }}
        />

        {/* MODAL 2: Edit Service */}
        <EditServiceModal
          service={editingService}
          isOpen={!!editingService}
          onClose={() => setEditingService(null)}
          onUpdated={loadData}
        />

        {/* MODAL 3: Share Service */}
        <ServiceShareModal
          service={createdServiceForShare}
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
        />

        {/* DRAWER: In-App Monitored Chat */}
        <BookingChatDrawer
          booking={activeChatBooking}
          isOpen={!!activeChatBooking}
          onClose={() => setActiveChatBooking(null)}
          currentUserId={agentId || ''}
          currentUserName={currentUser?.name || 'Specialist'}
          currentUserRole="AGENT"
        />
      </main>
    </div>
  );
};

// --- Sub-components with Spring Bounce & Squircle rules ---

const SidebarItem: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean; 
  badge?: string; 
  badgeColor?: string;
  onClick?: () => void;
}> = ({ icon, label, active, badge, badgeColor, onClick }) => (
  <motion.button
    whileTap={{ scale: 0.96 }}
    onClick={onClick}
    className={`w-full flex items-center justify-between p-3.5 rounded-2xl font-bold transition-all text-left ${
      active 
        ? 'bg-[#6C35A6] text-white shadow-xl shadow-[#6C35A6]/25' 
        : 'text-[#6C757D] hover:bg-brand-surface dark:hover:bg-white/5 hover:text-[#1A1A1A] dark:hover:text-white'
    }`}
  >
    <div className="flex items-center space-x-3.5">
      <span className="w-4 h-4 shrink-0">{icon}</span>
      <span className="text-xs sm:text-sm">{label}</span>
    </div>
    {badge && (
      <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${badgeColor ? badgeColor : active ? 'bg-white/20 text-white' : 'bg-brand-interactive/10 text-brand-interactive'}`}>
        {badge}
      </span>
    )}
  </motion.button>
);

/**
 * ScrollScaleBox
 * Implements a performant, scroll-linked transform scale & opacity effect
 * on individual stat cards with zero React re-renders during scroll.
 */
interface ScrollScaleBoxProps {
  children: React.ReactNode;
  containerRef?: React.RefObject<HTMLElement | null>;
}

export const ScrollScaleBox: React.FC<ScrollScaleBoxProps> = ({ children, containerRef }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = Boolean(useReducedMotion());

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: STAT_BOX_SCROLL_OFFSET,
    ...(containerRef ? { container: containerRef } : {})
  });

  const smoothProgress = useSpring(scrollYProgress, STAT_BOX_SPRING_CONFIG);

  const scaleTransform = useTransform<number, number>(
    smoothProgress,
    STAT_BOX_SCALE_INPUT,
    STAT_BOX_SCALE_OUTPUT
  );

  const opacityTransform = useTransform<number, number>(
    smoothProgress,
    STAT_BOX_OPACITY_INPUT,
    STAT_BOX_OPACITY_OUTPUT
  );

  // When prefers-reduced-motion is active, render static styles with no animation
  const scale = shouldReduceMotion ? undefined : scaleTransform;
  const opacity = shouldReduceMotion ? undefined : opacityTransform;

  return (
    <div ref={wrapperRef} className="w-full">
      <motion.div
        style={{ scale, opacity }}
        className="will-change-transform w-full"
      >
        {children}
      </motion.div>
    </div>
  );
};

const StatSquircle: React.FC<{ 
  label: string; 
  value: string; 
  subtext?: string;
  highlight?: boolean; 
  highlightColor?: string; 
  hasStar?: boolean;
}> = ({ label, value, subtext, highlight, highlightColor, hasStar }) => (
  <div 
    className={`bg-brand-background/90 dark:bg-[#1A1A1A]/90 backdrop-blur-xl p-6 rounded-[2.5rem] shadow-xl border transition-colors ${
      highlight 
        ? 'border-brand-interactive shadow-brand-interactive/10' 
        : 'border-[#E9ECEF] dark:border-[#2D2D2D]'
    }`}
  >
    <div className="text-[11px] font-black tracking-wider text-[#6C757D] dark:text-[#A0AEC0] mb-3 uppercase">{label}</div>
    <div className={`text-2xl sm:text-3xl font-serif font-black flex items-center space-x-1.5 ${
      highlightColor ? highlightColor : highlight ? 'text-brand-interactive' : 'text-[#1A1A1A] dark:text-white'
    }`}>
      <span>{value}</span>
      {hasStar && <Star className="w-5 h-5 fill-amber-400 text-amber-400 inline" />}
    </div>
    {subtext && (
      <div className="text-xs text-[#6C757D] dark:text-[#A0AEC0] mt-1.5 font-medium">{subtext}</div>
    )}
  </div>
);

const BookingCard: React.FC<{ 
  booking: Booking; 
  onStatusChange: (id: string, status: BookingStatus) => void;
  onOpenChat: () => void;
}> = ({ booking, onStatusChange, onOpenChat }) => {
  const [updating, setUpdating] = useState(false);

  const handleAction = async (newStatus: BookingStatus) => {
    setUpdating(true);
    await onStatusChange(booking.id, newStatus);
    setUpdating(false);
  };

  return (
    <motion.div 
      whileHover={{ scale: 1.008 }}
      transition={springTransition}
      className="bg-brand-background dark:bg-[#1A1A1A] p-5 sm:p-6 rounded-[2rem] border border-[#E9ECEF] dark:border-[#2D2D2D] shadow-lg flex flex-col md:flex-row items-center gap-5 group hover:border-brand-interactive/30 transition-all"
    >
      {booking.customerAvatar ? (
        <img src={booking.customerAvatar} className="w-14 h-14 rounded-2xl object-cover shrink-0 shadow-sm" alt="" />
      ) : (
        <div className="w-14 h-14 rounded-2xl bg-brand-interactive/10 text-brand-interactive flex items-center justify-center font-bold text-lg shrink-0">
          <User className="w-7 h-7" />
        </div>
      )}

      <div className="flex-grow text-center md:text-left space-y-2">
        <div className="flex flex-col md:flex-row md:items-center gap-2">
          <h4 className="font-bold text-base sm:text-lg text-[#1A1A1A] dark:text-white">{booking.customerName}</h4>
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="text-[10px] bg-gray-100 dark:bg-white/10 px-2.5 py-0.5 rounded-lg text-gray-500 font-bold">
              #{booking.id.slice(0, 8)}
            </span>
            {booking.customerPhone && (
              <a 
                href={`tel:${booking.customerPhone}`}
                className="inline-flex items-center text-[11px] font-bold text-brand-interactive hover:underline px-2 py-0.5 rounded-lg bg-brand-interactive/10"
                title="Call client directly"
              >
                <Phone className="w-3 h-3 mr-1" />
                {booking.customerPhone}
              </a>
            )}
          </div>
        </div>

        <p className="text-xs sm:text-sm text-brand-interactive font-black">{booking.serviceName}</p>

        <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs text-[#6C757D]">
          <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1 text-brand-interactive" /> {booking.date || 'Flexible'}</span>
          <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1 text-brand-interactive" /> {booking.time || 'Flexible'}</span>
          <span className="flex items-center font-black text-green-500"><DollarSign className="w-3.5 h-3.5 mr-1 text-green-500" /> ₦{booking.price?.toLocaleString()}</span>
        </div>

        {booking.address && (
          <div className="p-2.5 bg-brand-surface dark:bg-white/5 rounded-xl border border-[#E9ECEF] dark:border-white/10 text-xs text-[#1A1A1A] dark:text-white flex items-start text-left">
            <MapPin className="w-4 h-4 mr-2 text-brand-interactive shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#6C757D] dark:text-gray-400 block mb-0.5">Doorstep Address</span>
              <span className="font-semibold leading-relaxed break-words">{booking.address}</span>
            </div>
          </div>
        )}

        {booking.notes && (
          <div className="p-2.5 bg-brand-interactive/5 dark:bg-brand-interactive/10 rounded-xl border border-brand-interactive/20 text-xs text-[#1A1A1A] dark:text-white flex items-start text-left">
            <MessageSquare className="w-4 h-4 mr-2 text-brand-interactive shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-brand-interactive dark:text-brand-accent block mb-0.5">Client Notes & Preferences</span>
              <span className="font-normal italic leading-relaxed break-words">{booking.notes}</span>
            </div>
          </div>
        )}
      </div>

      {/* Action Controls & In-App Chat Launcher */}
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full md:w-auto">
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={onOpenChat}
          className="p-3 bg-brand-surface dark:bg-white/5 hover:bg-brand-interactive/10 text-brand-interactive rounded-xl border border-brand-interactive/20 text-xs font-bold transition-all flex items-center justify-center space-x-1.5 flex-1 sm:flex-none shadow-sm"
          title="Open Monitored In-App Chat"
        >
          <MessageSquare className="w-4 h-4" />
          <span className="hidden sm:inline">Chat</span>
        </motion.button>

        {booking.status === BookingStatus.PENDING ? (
          <>
            <motion.button 
              disabled={updating}
              whileTap={{ scale: 0.94 }}
              onClick={() => handleAction(BookingStatus.CONFIRMED)} 
              className="flex-1 sm:flex-none px-5 py-3 bg-green-500 text-white rounded-xl font-black text-xs hover:bg-green-600 transition-colors shadow-lg shadow-green-500/20"
            >
              {updating ? 'Updating...' : 'Accept'}
            </motion.button>
            <motion.button 
              disabled={updating}
              whileTap={{ scale: 0.94 }}
              onClick={() => handleAction(BookingStatus.CANCELLED)} 
              className="flex-1 sm:flex-none px-4 py-3 bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white rounded-xl font-bold text-xs hover:bg-gray-200 transition-colors"
            >
              Decline
            </motion.button>
          </>
        ) : booking.status === BookingStatus.CONFIRMED ? (
          <>
            <span className="px-3 py-2 bg-green-500/10 text-green-500 rounded-xl text-xs font-black">
              Confirmed
            </span>
            <motion.button 
              disabled={updating}
              whileTap={{ scale: 0.94 }}
              onClick={() => handleAction(BookingStatus.COMPLETED)} 
              className="flex-1 sm:flex-none px-5 py-3 bg-[#6C35A6] text-white rounded-xl font-black text-xs hover:bg-[#6C35A6]/90 transition-all shadow-md shadow-[#6C35A6]/20"
            >
              {updating ? 'Updating...' : 'Mark Completed'}
            </motion.button>
          </>
        ) : (
          <span className="px-4 py-2 bg-gray-100 dark:bg-white/5 text-[#6C757D] rounded-xl text-xs font-bold capitalize">
            {booking.status}
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default AgentDashboard;
