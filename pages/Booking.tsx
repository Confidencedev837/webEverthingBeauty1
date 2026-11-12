// pages/Booking.tsx - Dedicated Responsive Booking Screen
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Calendar as CalendarIcon, Clock, MapPin, MessageSquare,
  CheckCircle, Info, AlertCircle, Ban, ArrowRight, ArrowLeft,
  ShieldCheck, Check, Building, Navigation, Lock, User, Phone, LocateFixed
} from 'lucide-react';
import { Service, AgentAvailability } from '../types';
import { useAuth } from '../context/AuthContext';
import { useSnackbar } from '../components/Snackbar';
import LoadingState from '../components/LoadingState';
import { getServiceById, createBooking, getAgentAvailability, getBookedSlots } from '../services/supabaseService';
import { dispatchBookingCreatedAlert } from '../services/whatsappService';

const ALL_TIME_SLOTS = [
  '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM',
  '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM'
];

const SLOT_MINUTES = 60;
const SAME_DAY_LEAD_MINUTES = 60;
const LAST_END_MINUTES = 21 * 60; // 9:00 PM
const MAX_DAYS_AHEAD = 90;
const TRAVEL_FEE = 2500;

const CANCELLATION_POLICY = "Cancellation and rescheduling are free up to 4 hours before your confirmed appointment time.";
const PAYMENT_NOTE = "Payment is securely protected in escrow and released only after your appointment is fulfilled.";

const NG_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River',
  'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT Abuja', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano',
  'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo',
  'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
];

const VAGUE_TERMS = [
  'lagos', 'abuja', 'ibadan', 'port harcourt', 'calabar', 'uyo', 'kano', 'benin', 'enugu', 'asaba',
  'home', 'my home', 'my house', 'house', 'office', 'my office', 'location', 'client location',
  'around', 'nearby', 'anywhere', 'call me', 'gate', 'somewhere', 'na', 'nil', 'none'
];

type BookingStep = 1 | 2 | 3;
type SlotState = 'open' | 'booked' | 'overlap' | 'past' | 'late';

const STEPS: Array<{ id: BookingStep; label: string; Icon: React.ElementType }> = [
  { id: 1, label: 'Date & Time', Icon: CalendarIcon },
  { id: 2, label: 'Doorstep Address', Icon: MapPin },
  { id: 3, label: 'Review & Confirm', Icon: CheckCircle }
];

const SLOT_LABEL: Record<SlotState, string> = {
  open: '',
  booked: 'Reserved',
  overlap: 'Overlaps',
  past: 'Passed',
  late: 'Too late'
};

const getLagosNow = () => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Lagos',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '00';
  return {
    dateISO: `${get('year')}-${get('month')}-${get('day')}`,
    minutes: Number(get('hour')) * 60 + Number(get('minute'))
  };
};

const addDays = (iso: string, n: number): string => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
};

const slotToMinutes = (slot: string): number => {
  const [t, period] = slot.split(' ');
  const [hRaw, m] = t.split(':').map(Number);
  let h = hRaw;
  if (period === 'PM' && h !== 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return h * 60 + m;
};

const formatLongDate = (iso: string): string =>
  new Date(iso + 'T00:00:00Z').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  });

const weekdayName = (iso: string): string =>
  new Date(iso + 'T00:00:00Z').toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });

const normalizeNgPhone = (raw: string): string | null => {
  let d = raw.replace(/[^\d+]/g, '');
  if (d.startsWith('+')) d = d.slice(1);
  if (d.startsWith('234')) d = d.slice(3);
  else if (d.startsWith('0')) d = d.slice(1);
  return /^[789][01]\d{8}$/.test(d) ? `+234${d}` : null;
};

const stateLabel = (s: string) => (s === 'FCT Abuja' ? 'FCT Abuja' : `${s} State`);

const getSlotState = (
  slot: string,
  booked: string[],
  isToday: boolean,
  nowMinutes: number,
  durationMins: number
): SlotState => {
  const start = slotToMinutes(slot);
  const end = start + durationMins;
  if (isToday && start < nowMinutes + SAME_DAY_LEAD_MINUTES) return 'past';
  if (end > LAST_END_MINUTES) return 'late';
  if (booked.includes(slot)) return 'booked';
  const starts = booked.map(slotToMinutes).filter(Number.isFinite);
  if (starts.some((b) => b < end && b + SLOT_MINUTES > start)) return 'overlap';
  return 'open';
};

type Coords = { lat: number; lng: number; accuracy: number };

// Typewriter text with bounce
const TypewriterBounce: React.FC<{ text: string; className?: string }> = ({ text, className = '' }) => {
  const reduceMotion = useReducedMotion();
  const [count, setCount] = useState(reduceMotion ? text.length : 0);

  useEffect(() => {
    if (reduceMotion) {
      setCount(text.length);
      return;
    }
    setCount(0);
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setCount(i);
      if (i >= text.length) clearInterval(id);
    }, 18);
    return () => clearInterval(id);
  }, [text, reduceMotion]);

  const typing = count < text.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 360, damping: 20 }}
      className={className}
    >
      <span className="sr-only">{text}</span>
      <span className="grid" aria-hidden="true">
        <span className="invisible col-start-1 row-start-1">{text}</span>
        <span className="col-start-1 row-start-1">
          {text.slice(0, count)}
          {typing && <span className="inline-block w-0.5 h-3.5 ml-0.5 bg-brand-interactive align-middle" />}
        </span>
      </span>
    </motion.div>
  );
};

// Stepper diagram
const StepProgress: React.FC<{ current: BookingStep }> = ({ current }) => (
  <nav aria-label="Booking steps" className="w-full">
    <ol className="flex items-center justify-between text-xs font-black uppercase tracking-[0.16em]">
      {STEPS.map((s, idx) => {
        const isCurrent = s.id === current;
        const isDone = s.id < current;

        return (
          <li key={s.id} className="flex items-center flex-1 last:flex-none">
            <div
              className={`flex items-center space-x-2 transition-colors ${
                isCurrent
                  ? 'text-brand-interactive'
                  : isDone
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-[#888] dark:text-[#666]'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-black border transition-all ${
                  isCurrent
                    ? 'border-brand-interactive bg-brand-interactive/10 text-brand-interactive'
                    : isDone
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : 'border-black/10 dark:border-white/10 text-[#888]'
                }`}
              >
                {isDone ? <Check className="w-3.5 h-3.5" /> : <span>0{s.id}</span>}
              </div>
              <span className="hidden sm:inline">{s.label}</span>
            </div>

            {idx < STEPS.length - 1 && (
              <div className="flex-1 mx-3 sm:mx-4 h-[1px] bg-black/10 dark:bg-white/10" />
            )}
          </li>
        );
      })}
    </ol>
  </nav>
);

const DoorstepRoutingDiagram: React.FC = () => (
  <div className="w-full p-4 sm:p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 my-4">
    <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-[0.18em] text-[#6C757D] dark:text-[#999] mb-3">
      <span>Doorstep Logistics Pipeline</span>
      <span className="text-emerald-600 dark:text-emerald-400 font-bold">Direct Specialist Dispatch</span>
    </div>

    <div className="grid grid-cols-3 gap-2 sm:gap-4 relative">
      <div className="flex flex-col items-center text-center p-2.5 sm:p-3 rounded-xl bg-white dark:bg-[#161616] border border-black/5 dark:border-white/5 shadow-sm">
        <div className="w-8 h-8 rounded-lg bg-brand-interactive/10 flex items-center justify-center text-brand-interactive mb-2">
          <Building className="w-4 h-4" />
        </div>
        <span className="text-xs font-bold text-[#1A1A1A] dark:text-white">Kit Sanitization</span>
        <span className="text-[10px] text-[#6C757D] dark:text-[#888] mt-0.5 leading-tight">Tools prepped</span>
      </div>

      <div className="flex flex-col items-center text-center p-2.5 sm:p-3 rounded-xl bg-white dark:bg-[#161616] border border-black/5 dark:border-white/5 shadow-sm">
        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-2">
          <Navigation className="w-4 h-4" />
        </div>
        <span className="text-xs font-bold text-[#1A1A1A] dark:text-white">En-Route GPS</span>
        <span className="text-[10px] text-[#6C757D] dark:text-[#888] mt-0.5 leading-tight">Direct navigation</span>
      </div>

      <div className="flex flex-col items-center text-center p-2.5 sm:p-3 rounded-xl bg-white dark:bg-[#161616] border border-black/5 dark:border-white/5 shadow-sm">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2">
          <MapPin className="w-4 h-4" />
        </div>
        <span className="text-xs font-bold text-[#1A1A1A] dark:text-white">Your Doorstep</span>
        <span className="text-[10px] text-[#6C757D] dark:text-[#888] mt-0.5 leading-tight">Arrival on time</span>
      </div>
    </div>
  </div>
);

const ScheduleTimetableDiagram: React.FC<{
  selectedTime: string;
  bookedSlots: string[];
  isToday: boolean;
  lagosNowMinutes: number;
  durationMins: number;
  onSelectSlot: (slot: string) => void;
}> = ({ selectedTime, bookedSlots, isToday, lagosNowMinutes, durationMins, onSelectSlot }) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between text-xs font-bold text-[#6C757D] dark:text-[#999]">
      <div className="flex items-center space-x-2">
        <Clock className="w-4 h-4 text-brand-interactive" />
        <span className="tracking-wide uppercase text-[11px] font-black">Interactive Time Slots</span>
      </div>
      <div className="flex items-center space-x-4 text-[11px]">
        <span className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Available</span>
        </span>
        <span className="flex items-center space-x-1.5 text-gray-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-gray-400" />
          <span>Reserved</span>
        </span>
      </div>
    </div>

    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
      {ALL_TIME_SLOTS.map((slot) => {
        const slotState = getSlotState(slot, bookedSlots, isToday, lagosNowMinutes, durationMins);
        const isOpen = slotState === 'open';
        const isSelected = selectedTime === slot;
        const label = SLOT_LABEL[slotState];

        return (
          <button
            key={slot}
            type="button"
            disabled={!isOpen}
            onClick={() => onSelectSlot(slot)}
            className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
              !isOpen
                ? 'bg-black/[0.02] dark:bg-white/[0.02] border-black/5 dark:border-white/5 opacity-40 cursor-not-allowed text-[#888]'
                : isSelected
                ? 'bg-brand-interactive text-white border-brand-interactive shadow-md shadow-brand-interactive/20 scale-[1.01]'
                : 'bg-white dark:bg-[#161616] text-[#1A1A1A] dark:text-white border-black/10 dark:border-white/10 hover:border-brand-interactive/50'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-1">
              <span className="text-xs font-black tracking-tight">{slot}</span>
              {!isOpen ? (
                <Lock className="w-3 h-3 text-gray-400" />
              ) : isSelected ? (
                <Check className="w-3.5 h-3.5 text-white" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              )}
            </div>
            <span
              className={`text-[10px] font-bold ${
                isSelected ? 'text-white/80' : !isOpen ? 'text-gray-400' : 'text-[#6C757D] dark:text-[#888]'
              }`}
            >
              {label || 'Instant Confirm'}
            </span>
          </button>
        );
      })}
    </div>
  </div>
);

const Booking: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, currentUser } = useAuth();
  const { showSnackbar } = useSnackbar();

  const [service, setService] = useState<Service | null>(null);
  const [loadingService, setLoadingService] = useState(true);

  const lagosNow = useMemo(() => getLagosNow(), []);
  const minDate = lagosNow.dateISO;
  const maxDate = useMemo(() => addDays(minDate, MAX_DAYS_AHEAD), [minDate]);

  const [currentStep, setCurrentStep] = useState<BookingStep>(1);

  // Form state
  const [date, setDate] = useState(minDate);
  const [time, setTime] = useState('11:00 AM');
  const [streetLine, setStreetLine] = useState('');
  const [area, setArea] = useState('');
  const [stateName, setStateName] = useState('Lagos');
  const [landmark, setLandmark] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [coords, setCoords] = useState<Coords | null>(null);
  const [locating, setLocating] = useState(false);

  // Availability state
  const [availability, setAvailability] = useState<AgentAvailability | null>(null);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [dayOffWarning, setDayOffWarning] = useState<string | null>(null);

  // Submission state
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmedBookingId, setConfirmedBookingId] = useState('');
  const [createdWhatsAppUrls, setCreatedWhatsAppUrls] = useState<{
    clientWhatsAppUrl: string;
    agentWhatsAppUrl: string;
    conciergeWhatsAppUrl: string;
  } | null>(null);

  // Fetch service on load
  useEffect(() => {
    let isMounted = true;
    const loadService = async () => {
      if (!id) {
        setLoadingService(false);
        return;
      }
      setLoadingService(true);
      const res = await getServiceById(id);
      if (isMounted) {
        if (res.data) {
          setService(res.data);
        }
        setLoadingService(false);
      }
    };

    loadService();
    return () => {
      isMounted = false;
    };
  }, [id]);

  // Pre-populate phone if user is logged in
  useEffect(() => {
    if (currentUser?.phone) {
      setPhone(currentUser.phone);
    }
  }, [currentUser]);

  // Load specialist schedule
  useEffect(() => {
    if (service?.agentId) {
      getAgentAvailability(service.agentId).then((avail) => {
        setAvailability(avail);
      });
    }
  }, [service?.agentId]);

  const durationMins = service?.durationMins || 60;
  const totalAmount = (service?.price || 0) + TRAVEL_FEE;
  const isToday = date === lagosNow.dateISO;

  // Conflict and day off checking
  useEffect(() => {
    if (!date || !service?.agentId) return;

    const dayName = weekdayName(date);
    if (availability && availability.days.length > 0 && !availability.days.includes(dayName)) {
      setDayOffWarning(
        `Specialist is off on ${dayName}s. Please choose an active working day (${availability.days.join(', ')}).`
      );
    } else {
      setDayOffWarning(null);
    }

    const checkConflicts = async () => {
      const booked = await getBookedSlots(service.agentId, date);
      setBookedSlots(booked);

      const currentState = getSlotState(time, booked, date === lagosNow.dateISO, lagosNow.minutes, durationMins);
      if (currentState !== 'open') {
        const firstOpen = ALL_TIME_SLOTS.find(
          (slot) => getSlotState(slot, booked, date === lagosNow.dateISO, lagosNow.minutes, durationMins) === 'open'
        );
        if (firstOpen) setTime(firstOpen);
      }
    };

    checkConflicts();
  }, [date, service?.agentId, availability, durationMins, lagosNow.dateISO, lagosNow.minutes]);

  // Address validation
  const addressValidation = useMemo(() => {
    const cleanStreet = streetLine.trim();
    const cleanArea = area.trim();

    const hasMinLength = cleanStreet.length >= 8 && cleanArea.length >= 3;
    const hasHouseNumber = /\d/.test(cleanStreet);

    const isVagueStreet = VAGUE_TERMS.includes(cleanStreet.toLowerCase());
    const isVagueArea = VAGUE_TERMS.includes(cleanArea.toLowerCase());

    const validPhone = phone.trim() ? normalizeNgPhone(phone) !== null : true;

    let error: string | null = null;
    if (!cleanStreet) {
      error = 'Enter your street address and house or flat number.';
    } else if (!hasHouseNumber) {
      error = 'Include your building, plot, or flat number (e.g. "Plot 14", "Flat 2B").';
    } else if (isVagueStreet || cleanStreet.length < 8) {
      error = 'Please enter a complete street address rather than a vague location.';
    } else if (!cleanArea || isVagueArea) {
      error = 'Enter your specific neighborhood or area (e.g. "Lekki Phase 1", "Maitama").';
    } else if (phone.trim() && !validPhone) {
      error = 'Enter a valid Nigerian phone number (e.g. 08012345678 or +2348012345678).';
    }

    const isValid = hasMinLength && hasHouseNumber && !isVagueStreet && !isVagueArea && validPhone;

    return {
      isValid,
      hasMinLength,
      hasHouseNumber,
      hasArea: cleanArea.length >= 3 && !isVagueArea,
      validPhone,
      error
    };
  }, [streetLine, area, phone]);

  const handlePinpointLocation = () => {
    if (!navigator.geolocation) {
      showSnackbar('Geolocation is not supported by your browser.', 'error');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: Number(pos.coords.latitude.toFixed(6)),
          lng: Number(pos.coords.longitude.toFixed(6)),
          accuracy: Math.round(pos.coords.accuracy)
        });
        setLocating(false);
        showSnackbar('GPS coordinates attached to doorstep delivery notes.', 'success');
      },
      () => {
        setLocating(false);
        showSnackbar('Could not access GPS location. Please ensure location permissions are granted.', 'info');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleProceedToStep2 = () => {
    if (availability?.isEmergencyOff) {
      setErrorMessage('Specialist is temporarily not accepting appointments today.');
      return;
    }
    if (dayOffWarning) {
      setErrorMessage(dayOffWarning);
      return;
    }
    const currentSlotState = getSlotState(time, bookedSlots, isToday, lagosNow.minutes, durationMins);
    if (currentSlotState !== 'open') {
      setErrorMessage(`The ${time} slot is ${SLOT_LABEL[currentSlotState].toLowerCase()}. Please select an available slot.`);
      return;
    }
    setErrorMessage('');
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProceedToStep3 = () => {
    if (!addressValidation.isValid) {
      setErrorMessage(addressValidation.error || 'Please fill in complete doorstep address details.');
      return;
    }
    setErrorMessage('');
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!service) return;

    if (availability?.isEmergencyOff || dayOffWarning) {
      setErrorMessage('Specialist is unavailable for the selected schedule. Please select another date.');
      return;
    }

    if (!addressValidation.isValid) {
      setErrorMessage(addressValidation.error || 'Please complete doorstep address verification.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    const customerId = user?.id || currentUser?.id || 'guest-client';
    const agentId = service.agentId;
    const fullAddress = `${streetLine.trim()}, ${area.trim()}, ${stateLabel(stateName)}`;

    const noteParts: string[] = [];
    if (landmark.trim()) noteParts.push(`Landmark: ${landmark.trim()}`);
    if (phone.trim()) noteParts.push(`Phone: ${normalizeNgPhone(phone) || phone.trim()}`);
    if (coords) noteParts.push(`GPS Pin: (${coords.lat}, ${coords.lng} ±${coords.accuracy}m)`);
    if (notes.trim()) noteParts.push(`Client Notes: ${notes.trim()}`);
    const customerNotesCompiled = noteParts.join(' | ');

    const result = await createBooking({
      customerId,
      agentId,
      serviceId: service.id,
      date,
      time,
      address: fullAddress,
      customerNotes: customerNotesCompiled,
      totalAmount
    });

    setIsLoading(false);

    if (result.success) {
      const refId = result.data?.id ? result.data.id.slice(0, 8).toUpperCase() : 'EB-NEW';
      setConfirmedBookingId(refId);

      const whatsappLinks = await dispatchBookingCreatedAlert({
        booking: result.data,
        serviceName: service.name,
        agentName: service.agentName || 'Specialist',
        agentPhone: (service as any).agentPhone,
        customerName: currentUser?.name || 'Valued Client',
        customerPhone: phone.trim() || currentUser?.phone,
        date,
        time,
        address: fullAddress,
        totalAmount
      });
      setCreatedWhatsAppUrls(whatsappLinks);
      setIsSuccess(true);
      showSnackbar('Appointment booked successfully!', 'success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setErrorMessage(result.error || 'Failed to complete appointment booking. Please retry.');
    }
  };

  if (loadingService) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <LoadingState message="Loading appointment portal..." />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen pt-28 pb-16 px-4 max-w-lg mx-auto text-center flex flex-col items-center justify-center">
        <AlertCircle className="w-12 h-12 text-amber-500 mb-4" />
        <h2 className="text-2xl font-serif font-bold text-[#1A1A1A] dark:text-white mb-2">Service Not Found</h2>
        <p className="text-sm text-[#6C757D] dark:text-[#A0A0A0] mb-6">
          The requested service could not be retrieved or is no longer available.
        </p>
        <Link
          to="/services"
          className="py-3 px-6 rounded-2xl bg-brand-interactive text-white font-bold text-sm shadow-md"
        >
          Browse All Services
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-background dark:bg-[#0B0A0F] text-[#1A1A1A] dark:text-white pb-24 pt-20 sm:pt-24 transition-colors">
      {/* Sticky Screen Subheader */}
      <div className="sticky top-16 z-20 w-full bg-brand-background/95 dark:bg-[#0B0A0F]/95 backdrop-blur-md border-b border-black/10 dark:border-white/10 px-4 sm:px-6 lg:px-8 py-3.5 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 sm:p-2.5 rounded-xl border border-black/10 dark:border-white/10 text-[#1A1A1A] dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all flex items-center cursor-pointer"
              aria-label="Go back"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
              <span className="text-xs font-bold hidden sm:inline">Back</span>
            </button>

            <img
              src={service.image}
              alt=""
              className="w-10 h-10 rounded-xl object-cover border border-black/10 dark:border-white/10 shadow-sm"
            />
            <div>
              <h1 className="font-serif font-bold text-sm sm:text-base leading-tight truncate max-w-[160px] sm:max-w-xs md:max-w-md">
                {service.name}
              </h1>
              <div className="flex items-center space-x-2 text-[11px] text-[#6C757D] dark:text-[#A0A0A0]">
                <span>with {service.agentName}</span>
                <span>&bull;</span>
                <span className="font-black text-[#111] dark:text-white">₦{service.price.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center max-w-xs w-full ml-6">
            <StepProgress current={currentStep} />
          </div>
        </div>
      </div>

      {/* Progress Bar for Mobile */}
      <div className="md:hidden w-full bg-black/5 dark:bg-white/5 h-1">
        <div
          className="h-full bg-brand-interactive transition-all duration-300"
          style={{ width: `${(currentStep / 3) * 100}%` }}
        />
      </div>

      {/* Main Responsive Screen Body */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isSuccess ? (
          <div className="w-full space-y-8">
            {availability?.isEmergencyOff && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-xs flex items-start gap-3">
                <Ban className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-black text-sm block mb-0.5">Specialist Away</strong>
                  This specialist is temporarily unavailable today. Please select another date or check back shortly.
                </div>
              </div>
            )}

            {dayOffWarning && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-2xl text-xs flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-black text-sm block mb-0.5">Schedule Notice</strong>
                  {dayOffWarning}
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-xs flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span className="font-medium text-xs sm:text-sm">{errorMessage}</span>
              </div>
            )}

            {/* STEP 1: DATE & TIME */}
            {currentStep === 1 && (
              <motion.section
                key="step-1"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div>
                  <div className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-interactive mb-1">
                    Step 01 of 03 &bull; Schedule Coordination
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1A1A1A] dark:text-white">
                    Select Appointment Date & Time
                  </h2>
                  <TypewriterBounce
                    text="Choose an active working date and preferred time window. Reserved and passed slots are locked automatically to prevent scheduling conflicts."
                    className="text-xs sm:text-sm text-[#6C757D] dark:text-[#A0A0A0] mt-1.5 leading-relaxed"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-[#6C757D] dark:text-[#A0A0A0] flex items-center">
                    <CalendarIcon className="w-3.5 h-3.5 mr-1.5 text-brand-interactive" />
                    Select Date
                  </label>
                  <input
                    type="date"
                    required
                    min={minDate}
                    max={maxDate}
                    value={date}
                    onChange={(e) => {
                      setDate(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    className="w-full p-4 bg-white dark:bg-[#161616] border border-black/10 dark:border-white/10 rounded-2xl text-sm outline-none focus:border-brand-interactive transition-all text-[#1A1A1A] dark:text-white shadow-sm"
                  />
                </div>

                <ScheduleTimetableDiagram
                  selectedTime={time}
                  bookedSlots={bookedSlots}
                  isToday={isToday}
                  lagosNowMinutes={lagosNow.minutes}
                  durationMins={durationMins}
                  onSelectSlot={(selected) => {
                    setTime(selected);
                    if (errorMessage) setErrorMessage('');
                  }}
                />

                <div className="p-4 rounded-2xl bg-white dark:bg-[#161616] border border-black/5 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-brand-interactive/10 flex items-center justify-center text-brand-interactive">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold block">{service.agentName}</span>
                      <span className="text-[11px] text-[#6C757D] dark:text-[#888]">Doorstep Specialist</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-xs font-bold text-[#6C757D] dark:text-[#999]">
                    <span>Standard Session: ~{durationMins} mins</span>
                    <span className="text-[#1A1A1A] dark:text-white font-black">₦{service.price.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={handleProceedToStep2}
                    disabled={!!dayOffWarning || !!availability?.isEmergencyOff}
                    className="py-4 px-9 bg-brand-interactive hover:bg-brand-interactive/90 text-white rounded-2xl font-black text-xs sm:text-sm tracking-wide flex items-center space-x-2 shadow-lg shadow-brand-interactive/20 active:scale-95 transition-all cursor-pointer disabled:opacity-40"
                  >
                    <span>Continue to Doorstep Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.section>
            )}

            {/* STEP 2: DOORSTEP ADDRESS */}
            {currentStep === 2 && (
              <motion.section
                key="step-2"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div>
                  <div className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-interactive mb-1">
                    Step 02 of 03 &bull; Doorstep Navigation
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1A1A1A] dark:text-white">
                    Doorstep Delivery Address
                  </h2>
                  <TypewriterBounce
                    text="Enter your exact doorstep delivery location. Strict verification is enforced: building number, street name, and neighborhood area are mandatory."
                    className="text-xs sm:text-sm text-[#6C757D] dark:text-[#A0A0A0] mt-1.5 leading-relaxed"
                  />
                </div>

                <DoorstepRoutingDiagram />

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-wider text-[#6C757D] dark:text-[#A0A0A0]">
                        State / Territory
                      </label>
                      <select
                        value={stateName}
                        onChange={(e) => setStateName(e.target.value)}
                        className="w-full p-4 bg-white dark:bg-[#161616] border border-black/10 dark:border-white/10 rounded-2xl text-sm outline-none focus:border-brand-interactive transition-all text-[#1A1A1A] dark:text-white shadow-sm"
                      >
                        {NG_STATES.map((s) => (
                          <option key={s} value={s}>
                            {stateLabel(s)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-wider text-[#6C757D] dark:text-[#A0A0A0]">
                        Neighborhood / Area
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Lekki Phase 1, Maitama, GRA"
                        value={area}
                        onChange={(e) => {
                          setArea(e.target.value);
                          if (errorMessage) setErrorMessage('');
                        }}
                        className="w-full p-4 bg-white dark:bg-[#161616] border border-black/10 dark:border-white/10 rounded-2xl text-sm outline-none focus:border-brand-interactive transition-all text-[#1A1A1A] dark:text-white shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-wider text-[#6C757D] dark:text-[#A0A0A0] flex items-center justify-between">
                      <span className="flex items-center">
                        <MapPin className="w-3.5 h-3.5 mr-1.5 text-brand-interactive" />
                        Street Address & House / Flat #
                      </span>
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase">
                        Required
                      </span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Flat 3B, Plot 14 Admiralty Way"
                      value={streetLine}
                      onChange={(e) => {
                        setStreetLine(e.target.value);
                        if (errorMessage) setErrorMessage('');
                      }}
                      className="w-full p-4 bg-white dark:bg-[#161616] border border-black/10 dark:border-white/10 rounded-2xl text-sm outline-none focus:border-brand-interactive transition-all text-[#1A1A1A] dark:text-white shadow-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-wider text-[#6C757D] dark:text-[#A0A0A0]">
                        Landmark / Estate Gate (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Beside Zenith Bank, Call at gate"
                        value={landmark}
                        onChange={(e) => setLandmark(e.target.value)}
                        className="w-full p-4 bg-white dark:bg-[#161616] border border-black/10 dark:border-white/10 rounded-2xl text-sm outline-none focus:border-brand-interactive transition-all text-[#1A1A1A] dark:text-white shadow-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-wider text-[#6C757D] dark:text-[#A0A0A0]">
                        Phone for Dispatch Contact
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888]" />
                        <input
                          type="tel"
                          placeholder="080 1234 5678"
                          value={phone}
                          onChange={(e) => {
                            setPhone(e.target.value);
                            if (errorMessage) setErrorMessage('');
                          }}
                          className="w-full pl-10 pr-3.5 py-4 bg-white dark:bg-[#161616] border border-black/10 dark:border-white/10 rounded-2xl text-sm outline-none focus:border-brand-interactive transition-all text-[#1A1A1A] dark:text-white shadow-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5">
                    <div className="flex items-center space-x-2 text-xs">
                      <LocateFixed className="w-4 h-4 text-brand-interactive" />
                      <span className="font-bold text-[#1A1A1A] dark:text-white">
                        {coords ? `GPS Pin Attached (${coords.lat}, ${coords.lng})` : 'Attach Exact GPS Coordinates'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handlePinpointLocation}
                      disabled={locating}
                      className="py-1.5 px-3.5 rounded-xl bg-brand-surface dark:bg-white/10 text-brand-interactive text-xs font-bold hover:bg-brand-interactive hover:text-white transition-all cursor-pointer"
                    >
                      {locating ? 'Detecting...' : coords ? 'Update Pin' : 'Detect Location'}
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 space-y-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-[#6C757D] dark:text-[#888] block">
                      Doorstep Verification Checklist
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <div
                        className={`flex items-center space-x-2 ${
                          addressValidation.hasHouseNumber ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-[#888]'
                        }`}
                      >
                        <Check className={`w-3.5 h-3.5 ${addressValidation.hasHouseNumber ? 'text-emerald-600' : 'text-gray-400'}`} />
                        <span>House / Plot #</span>
                      </div>

                      <div
                        className={`flex items-center space-x-2 ${
                          addressValidation.hasArea ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-[#888]'
                        }`}
                      >
                        <Check className={`w-3.5 h-3.5 ${addressValidation.hasArea ? 'text-emerald-600' : 'text-gray-400'}`} />
                        <span>Specific Area</span>
                      </div>

                      <div
                        className={`flex items-center space-x-2 ${
                          addressValidation.validPhone ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-[#888]'
                        }`}
                      >
                        <Check className={`w-3.5 h-3.5 ${addressValidation.validPhone ? 'text-emerald-600' : 'text-gray-400'}`} />
                        <span>Valid Contact Phone</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStep(1);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="py-4 px-6 text-[#6C757D] hover:text-[#1A1A1A] dark:hover:text-white font-bold text-xs sm:text-sm flex items-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Schedule</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleProceedToStep3}
                    disabled={!addressValidation.isValid}
                    className="py-4 px-9 bg-brand-interactive hover:bg-brand-interactive/90 text-white rounded-2xl font-black text-xs sm:text-sm tracking-wide flex items-center space-x-2 shadow-lg shadow-brand-interactive/20 active:scale-95 transition-all cursor-pointer disabled:opacity-40"
                  >
                    <span>Review & Confirm</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.section>
            )}

            {/* STEP 3: REVIEW & CONFIRM */}
            {currentStep === 3 && (
              <motion.section
                key="step-3"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div>
                  <div className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-interactive mb-1">
                    Step 03 of 03 &bull; Final Dispatch Confirmation
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1A1A1A] dark:text-white">
                    Appointment Summary & Preferences
                  </h2>
                  <TypewriterBounce
                    text="Verify your appointment window and delivery coordinates. Add any special requests, allergies, or estate gate notes before confirming."
                    className="text-xs sm:text-sm text-[#6C757D] dark:text-[#A0A0A0] mt-1.5 leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-white dark:bg-[#161616] border border-black/5 dark:border-white/5 space-y-2 shadow-sm">
                    <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-[#6C757D] dark:text-[#888]">
                      <CalendarIcon className="w-3.5 h-3.5 text-brand-interactive" />
                      <span>Schedule Window</span>
                    </div>
                    <p className="text-base font-bold text-[#1A1A1A] dark:text-white">
                      {formatLongDate(date)}
                    </p>
                    <p className="text-xs font-black text-brand-interactive">
                      {time} (Session: ~{durationMins} mins)
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white dark:bg-[#161616] border border-black/5 dark:border-white/5 space-y-2 shadow-sm">
                    <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-[#6C757D] dark:text-[#888]">
                      <MapPin className="w-3.5 h-3.5 text-brand-interactive" />
                      <span>Verified Doorstep Location</span>
                    </div>
                    <p className="text-sm font-bold text-[#1A1A1A] dark:text-white leading-tight">
                      {streetLine}, {area}, {stateLabel(stateName)}
                    </p>
                    {landmark && (
                      <p className="text-[11px] text-[#6C757D] dark:text-[#888]">
                        Landmark: {landmark}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-[#6C757D] dark:text-[#A0A0A0] flex items-center">
                    <MessageSquare className="w-3.5 h-3.5 mr-1.5 text-brand-interactive" />
                    Special Instructions & Preferences (Optional)
                  </label>
                  <textarea
                    placeholder="Hair texture, allergies, skin sensitivity, estate entry code, or special setup preferences..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-4 bg-white dark:bg-[#161616] border border-black/10 dark:border-white/10 rounded-2xl text-sm h-24 resize-none outline-none focus:border-brand-interactive transition-all text-[#1A1A1A] dark:text-white shadow-sm"
                  />
                </div>

                <div className="p-6 bg-brand-surface/40 dark:bg-white/[0.03] rounded-3xl border border-black/5 dark:border-white/5 space-y-3.5">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-[#6C757D] dark:text-[#888]">Base Specialist Service</span>
                    <span className="font-bold">₦{service.price.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-[#6C757D] dark:text-[#888] flex items-center">
                      Sanitation, Kit & Doorstep Transit
                      <Info className="w-3 h-3 ml-1 text-brand-interactive" />
                    </span>
                    <span className="font-bold">₦{TRAVEL_FEE.toLocaleString()}</span>
                  </div>
                  <div className="pt-3 border-t border-black/10 dark:border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider block text-[#6C757D] dark:text-[#888]">
                        Total Amount
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center mt-0.5">
                        <ShieldCheck className="w-3 h-3 mr-1" />
                        Guaranteed Doorstep Delivery
                      </span>
                    </div>
                    <span className="text-2xl sm:text-3xl font-black text-[#111] dark:text-white">
                      ₦{totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="space-y-1 text-[11px] text-[#6C757D] dark:text-[#888]">
                  <p>{CANCELLATION_POLICY}</p>
                  {PAYMENT_NOTE && <p>{PAYMENT_NOTE}</p>}
                </div>

                <div className="flex items-center justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStep(2);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="py-4 px-6 text-[#6C757D] hover:text-[#1A1A1A] dark:hover:text-white font-bold text-xs sm:text-sm flex items-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Address</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={isLoading}
                    className="py-4 px-9 sm:px-12 bg-brand-interactive hover:bg-brand-interactive/90 text-white rounded-2xl font-black text-xs sm:text-sm tracking-wide flex items-center space-x-2 shadow-xl shadow-brand-interactive/25 active:scale-95 transition-all cursor-pointer disabled:opacity-40"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Confirm & Schedule Appointment</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.section>
            )}
          </div>
        ) : (
          /* SUCCESS DISPATCH SCREEN */
          <div className="py-12 sm:py-20 flex flex-col items-center text-center max-w-lg mx-auto">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 450, damping: 20 }}
              className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center text-white mb-6 shadow-[0_0_35px_rgba(16,185,129,0.35)] border border-white/20"
            >
              <CheckCircle className="w-10 h-10" />
            </motion.div>

            <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-2 text-[#1A1A1A] dark:text-white">
              Appointment Dispatched
            </h2>

            <div className="text-xs font-black tracking-widest uppercase text-brand-interactive mb-4">
              Booking Reference #{confirmedBookingId}
            </div>

            <p className="text-xs sm:text-sm text-[#6C757D] dark:text-[#A0A0A0] leading-relaxed mb-8">
              Your appointment with <strong className="text-[#1A1A1A] dark:text-white">{service.agentName}</strong> has been secured for <strong className="text-[#1A1A1A] dark:text-white">{formatLongDate(date)} at {time}</strong>. Real-time updates have been registered.
            </p>

            <div className="w-full flex flex-col sm:flex-row gap-3">
              {createdWhatsAppUrls && (
                <a
                  href={createdWhatsAppUrls.clientWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-4 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center space-x-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Open WhatsApp Update</span>
                </a>
              )}
              <button
                onClick={() => navigate('/customer/dashboard')}
                className="flex-1 py-4 px-5 bg-white dark:bg-[#161616] text-[#1A1A1A] dark:text-white border border-black/10 dark:border-white/10 rounded-2xl font-bold text-xs hover:border-brand-interactive transition-all cursor-pointer"
              >
                View in Dashboard
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Booking;
