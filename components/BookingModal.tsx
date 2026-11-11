import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar as CalendarIcon, Clock, MapPin, MessageSquare, CheckCircle, Info, AlertCircle, Ban } from 'lucide-react';
import { Service, AgentAvailability } from '../types';
import { useAuth } from '../context/AuthContext';
import { createBooking, getAgentAvailability, getBookedSlots } from '../services/supabaseService';
import { dispatchBookingCreatedAlert } from '../services/whatsappService';

interface BookingModalProps {
  service: Service;
  isOpen: boolean;
  onClose: () => void;
}

const ALL_TIME_SLOTS = [
  '08:00 AM',
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '01:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
  '05:00 PM',
  '06:00 PM',
  '07:00 PM'
];

const BookingModal: React.FC<BookingModalProps> = ({ service, isOpen, onClose }) => {
  const { user, currentUser } = useAuth();
  
  // Default to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  const [date, setDate] = useState(defaultDateStr);
  const [time, setTime] = useState('11:00 AM');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [notes, setNotes] = useState('');
  
  // Availability & conflict prevention state
  const [availability, setAvailability] = useState<AgentAvailability | null>(null);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [dayOffWarning, setDayOffWarning] = useState<string | null>(null);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmedBookingId, setConfirmedBookingId] = useState<string>('');
  const [createdWhatsAppUrls, setCreatedWhatsAppUrls] = useState<{
    clientWhatsAppUrl: string;
    agentWhatsAppUrl: string;
    conciergeWhatsAppUrl: string;
  } | null>(null);

  const travelFee = 2500;
  const totalAmount = (service.price || 0) + travelFee;

  // Load specialist schedule when modal opens
  useEffect(() => {
    if (isOpen && service.agentId) {
      loadSpecialistAvailability();
    }
  }, [isOpen, service.agentId]);

  const loadSpecialistAvailability = async () => {
    setLoadingSchedule(true);
    const avail = await getAgentAvailability(service.agentId);
    setAvailability(avail);
    setLoadingSchedule(false);
  };

  // Check conflicts and day of week when date changes
  useEffect(() => {
    if (!date || !service.agentId) return;

    // 1. Day of week validation
    const selectedDateObj = new Date(date + 'T00:00:00');
    const dayName = selectedDateObj.toLocaleDateString('en-US', { weekday: 'long' });

    if (availability && availability.days.length > 0 && !availability.days.includes(dayName)) {
      setDayOffWarning(`Specialist is off on ${dayName}s. Please choose an active working day (${availability.days.join(', ')}).`);
    } else {
      setDayOffWarning(null);
    }

    // 2. Query already booked slots for this date
    const checkConflicts = async () => {
      const booked = await getBookedSlots(service.agentId, date);
      setBookedSlots(booked);

      // If current selected time is booked, switch to first open time
      if (booked.includes(time)) {
        const firstAvailable = ALL_TIME_SLOTS.find(slot => !booked.includes(slot));
        if (firstAvailable) {
          setTime(firstAvailable);
        }
      }
    };

    checkConflicts();
  }, [date, service.agentId, availability]);

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (availability?.isEmergencyOff) {
      setErrorMessage('Specialist is temporarily not accepting appointments today. Please try another day.');
      return;
    }

    if (dayOffWarning) {
      setErrorMessage(dayOffWarning);
      return;
    }

    if (bookedSlots.includes(time)) {
      setErrorMessage(`The ${time} slot is already booked for this specialist. Please select another time.`);
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    const customerId = user?.id || currentUser.id;
    const agentId = service.agentId;

    const result = await createBooking({
      customerId,
      agentId,
      serviceId: service.id,
      date: date || defaultDateStr,
      time,
      address: address || 'Client location',
      customerNotes: notes,
      totalAmount
    });

    setIsLoading(false);

    if (result.success) {
      const refId = result.data?.id ? result.data.id.slice(0, 8).toUpperCase() : 'EB-NEW';
      setConfirmedBookingId(refId);

      // Real-time WhatsApp dispatch to Customer, Agent, and Concierge
      const whatsappLinks = await dispatchBookingCreatedAlert({
        booking: result.data,
        serviceName: service.name,
        agentName: service.agentName || 'Specialist',
        agentPhone: (service as any).agentPhone,
        customerName: currentUser?.name || 'Valued Client',
        customerPhone: currentUser?.phone,
        date: date || defaultDateStr,
        time,
        address: address || 'Client location',
        totalAmount
      });
      setCreatedWhatsAppUrls(whatsappLinks);
      setIsSuccess(true);
    } else {
      setErrorMessage(result.error || 'Failed to complete appointment booking. Please retry.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="relative w-full max-w-lg bg-brand-background dark:bg-[#161616] rounded-3xl shadow-2xl overflow-hidden border border-black/10 dark:border-white/10"
          >
            <div data-lenis-prevent className="p-6 overflow-y-auto max-h-[90vh] overscroll-contain">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-[#1A1A1A] dark:text-white">Book Appointment</h2>
                  <p className="text-xs text-[#6C757D]">Direct calendar synchronization</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors">
                  <X className="w-6 h-6 text-[#6C757D]" />
                </button>
              </div>

              {/* Emergency Away Warning */}
              {availability?.isEmergencyOff && (
                <div className="mb-4 p-3.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-xs flex items-start gap-2.5">
                  <Ban className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-black">Specialist Away:</strong> This specialist is currently unavailable today. You may book for a future date or check back soon.
                  </div>
                </div>
              )}

              {/* Day Off Warning */}
              {dayOffWarning && (
                <div className="mb-4 p-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-2xl text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{dayOffWarning}</span>
                </div>
              )}

              {errorMessage && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {!isSuccess ? (
                <form onSubmit={handleConfirm} className="space-y-5">
                  {/* Service Summary */}
                  <div className="flex items-center p-4 bg-brand-surface dark:bg-white/5 rounded-2xl border border-[#E9ECEF] dark:border-white/10">
                    <img src={service.image} className="w-16 h-16 rounded-xl object-cover mr-4 shadow-sm" alt="" />
                    <div>
                      <h4 className="font-serif font-bold text-base text-[#1A1A1A] dark:text-white">{service.name}</h4>
                      <p className="text-xs text-[#6C757D] font-medium">with {service.agentName}</p>
                      <p className="text-sm font-black text-[#111111] dark:text-white mt-0.5">₦{service.price.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Date & Time with Conflict Prevention */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-[#6C757D] flex items-center">
                        <CalendarIcon className="w-3.5 h-3.5 mr-1 text-brand-interactive" /> SELECT DATE
                      </label>
                      <input 
                        type="date" 
                        required 
                        min={new Date().toISOString().split('T')[0]}
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full p-3 bg-brand-surface dark:bg-white/5 border border-[#E9ECEF] dark:border-white/10 rounded-xl text-sm outline-none focus:border-brand-interactive transition-all text-[#1A1A1A] dark:text-white" 
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-[#6C757D] flex items-center justify-between">
                        <span className="flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-1 text-brand-interactive" /> TIME SLOT
                        </span>
                        {bookedSlots.length > 0 && (
                          <span className="text-[10px] text-amber-500 font-bold">
                            {bookedSlots.length} Booked
                          </span>
                        )}
                      </label>
                      <select 
                        required 
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full p-3 bg-brand-surface dark:bg-white/5 border border-[#E9ECEF] dark:border-white/10 rounded-xl text-sm outline-none focus:border-brand-interactive transition-all text-[#1A1A1A] dark:text-white"
                      >
                        {ALL_TIME_SLOTS.map(slot => {
                          const isBooked = bookedSlots.includes(slot);
                          return (
                            <option 
                              key={slot} 
                              value={slot} 
                              disabled={isBooked}
                              className={isBooked ? 'text-gray-400 bg-gray-100 dark:bg-black/40' : ''}
                            >
                              {slot} {isBooked ? '(Booked)' : '(Available)'}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-[#6C757D] flex items-center">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-brand-interactive" /> CLIENT ADDRESS
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. 15 Admiralty Way, Lekki Phase 1, Lagos" 
                      required 
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full p-3 bg-brand-surface dark:bg-white/5 border border-[#E9ECEF] dark:border-white/10 rounded-xl text-sm outline-none focus:border-brand-interactive transition-all text-[#1A1A1A] dark:text-white" 
                    />
                  </div>

                  {/* Requests */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-[#6C757D] flex items-center">
                      <MessageSquare className="w-3.5 h-3.5 mr-1 text-brand-interactive" /> NOTES & PREFERENCES
                    </label>
                    <textarea 
                      placeholder="Hair texture, allergies, skin tone notes, gate code..." 
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full p-3 bg-brand-surface dark:bg-white/5 border border-[#E9ECEF] dark:border-white/10 rounded-xl text-sm h-16 resize-none outline-none focus:border-brand-interactive transition-all text-[#1A1A1A] dark:text-white"
                    />
                  </div>

                  {/* Pricing Summary */}
                  <div className="p-4 bg-brand-interactive/5 rounded-2xl border border-brand-interactive/10 space-y-1.5">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-[#6C757D]">Base Service</span>
                      <span className="font-bold">₦{service.price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-[#6C757D] flex items-center">
                        Travel & Sanitation <Info className="w-3 h-3 ml-1 text-brand-interactive" />
                      </span>
                      <span className="font-bold">₦{travelFee.toLocaleString()}</span>
                    </div>
                    <div className="pt-2 border-t border-brand-interactive/20 flex justify-between font-bold text-sm sm:text-base">
                      <span>Total Amount</span>
                      <span className="text-[#111111] dark:text-white font-black text-base sm:text-lg">₦{totalAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-2">
                    <button 
                      type="button" 
                      onClick={onClose} 
                      className="flex-1 py-3.5 text-[#6C757D] hover:text-[#1A1A1A] dark:hover:text-white font-bold text-sm transition-colors"
                    >
                      Cancel
                    </button>
                    <motion.button 
                      type="submit" 
                      disabled={isLoading || !!dayOffWarning || !!availability?.isEmergencyOff}
                      whileTap={{ scale: 0.96 }}
                      className="flex-[2] py-3.5 bg-brand-interactive text-white rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-lg shadow-brand-interactive/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-40"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          <span>Confirm Booking</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              ) : (
                <div className="py-6 sm:py-8 flex flex-col items-center text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 450, damping: 20 }}
                    className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white mb-4 shadow-[0_0_25px_rgba(16,185,129,0.35)] border border-white/20"
                  >
                    <CheckCircle className="w-9 h-9" />
                  </motion.div>

                  <h3 className="text-2xl font-serif font-bold mb-1 text-[#1A1A1A] dark:text-white">Appointment Dispatched</h3>
                  
                  <div className="inline-block px-3 py-1 rounded-xl bg-brand-interactive/10 text-brand-interactive text-xs font-black tracking-wider uppercase mb-3">
                    Booking Reference #{confirmedBookingId}
                  </div>

                  <p className="text-xs sm:text-sm text-[#6C757D] dark:text-[#B0B0B0] max-w-sm leading-relaxed mb-6">
                    Your appointment has been registered and real-time updates are active. Open WhatsApp to receive immediate confirmation directly on your phone.
                  </p>

                  <div className="w-full flex flex-col sm:flex-row gap-3">
                    {createdWhatsAppUrls && (
                      <a
                        href={createdWhatsAppUrls.clientWhatsAppUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center space-x-2"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Open WhatsApp Update</span>
                      </a>
                    )}
                    <button
                      onClick={() => {
                        onClose();
                        setIsSuccess(false);
                      }}
                      className="flex-1 py-3.5 px-4 bg-brand-surface dark:bg-[#222] text-[#1A1A1A] dark:text-white border border-[#E9ECEF] dark:border-[#333] rounded-2xl font-bold text-xs hover:border-brand-interactive transition-all cursor-pointer"
                    >
                      Done & Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BookingModal;
