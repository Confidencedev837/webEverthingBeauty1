import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, ShieldCheck, Lock, Clock, Calendar, CheckCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { Booking, BookingMessage } from '../types';
import { getBookingMessages, sendBookingMessage } from '../services/supabaseService';

interface BookingChatDrawerProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  currentUserName: string;
  currentUserRole: 'CUSTOMER' | 'AGENT' | 'ADMIN';
}

const BookingChatDrawer: React.FC<BookingChatDrawerProps> = ({
  booking,
  isOpen,
  onClose,
  currentUserId,
  currentUserName,
  currentUserRole,
}) => {
  const [messages, setMessages] = useState<BookingMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async (isBackground = false) => {
    if (!booking) return;
    if (!isBackground) setLoading(true);
    setError(null);
    try {
      const msgs = await getBookingMessages(booking.id);
      setMessages(msgs);
    } catch (err: any) {
      if (!isBackground) {
        setError(err?.message || 'Failed to load conversation history');
      }
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && booking) {
      loadMessages(false);
      // Background real-time polling every 3.5 seconds while chat drawer is open
      const pollTimer = setInterval(() => {
        loadMessages(true);
      }, 3500);
      return () => clearInterval(pollTimer);
    } else {
      setMessages([]);
      setInputText('');
      setError(null);
    }
  }, [isOpen, booking?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking || !inputText.trim() || sending) return;

    setSending(true);
    setError(null);
    const textToSend = inputText.trim();
    setInputText('');

    const res = await sendBookingMessage(
      booking.id,
      currentUserId,
      currentUserName,
      currentUserRole,
      textToSend
    );

    setSending(false);
    if (res.success) {
      setMessages(res.messages);
    } else {
      setError(res.error || 'Failed to send message.');
      setInputText(textToSend); // restore on failure
    }
  };

  if (!isOpen || !booking) return null;

  const counterpartName = currentUserRole === 'AGENT' ? booking.customerName : booking.agentName;
  const counterpartAvatar = currentUserRole === 'AGENT' ? booking.customerAvatar : booking.agentAvatar;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Drawer Container */}
        <motion.aside
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          className="relative w-full max-w-lg h-full bg-brand-background dark:bg-[#121212] border-l border-[#E9ECEF] dark:border-[#2D2D2D] shadow-2xl flex flex-col z-10"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-[#E9ECEF] dark:border-[#2D2D2D] bg-brand-surface dark:bg-[#161616] flex items-center justify-between">
            <div className="flex items-center space-x-3.5">
              {counterpartAvatar ? (
                <img
                  src={counterpartAvatar}
                  alt={counterpartName}
                  className="w-12 h-12 rounded-2xl object-cover border border-brand-interactive/20 shadow-md"
                />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-brand-interactive/10 text-brand-interactive font-black text-lg flex items-center justify-center shadow-md">
                  {counterpartName ? counterpartName.charAt(0).toUpperCase() : 'C'}
                </div>
              )}
              <div>
                <h3 className="font-serif font-black text-base sm:text-lg text-[#1A1A1A] dark:text-white leading-tight">
                  {counterpartName || 'Client'}
                </h3>
                <div className="flex items-center space-x-2 text-xs text-[#6C757D] font-medium mt-0.5">
                  <span className="text-brand-interactive font-bold truncate max-w-[170px]">{booking.serviceName}</span>
                  <span>•</span>
                  <span className="uppercase text-[10px] tracking-wider px-2 py-0.5 rounded-lg bg-brand-interactive/10 text-brand-interactive font-black">
                    {booking.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => { void loadMessages(false); }}
                title="Refresh messages"
                className="p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-[#6C757D] hover:text-brand-interactive transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-[#6C757D] hover:text-[#1A1A1A] dark:hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Appointment Context Info Bar */}
          <div className="px-5 py-2.5 bg-brand-interactive/5 border-b border-brand-interactive/10 flex items-center justify-between text-xs text-[#6C757D]">
            <div className="flex items-center space-x-3">
              <span className="flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1 text-brand-interactive" />
                {booking.date || 'Flexible'}
              </span>
              <span className="flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1 text-brand-interactive" />
                {booking.time || 'Flexible'}
              </span>
            </div>
            <span className="font-black text-green-500">₦{booking.price?.toLocaleString()}</span>
          </div>

          {/* Monitored Security Banner */}
          <div className="p-3 mx-4 my-3 bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 rounded-2xl flex items-start space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed text-amber-700 dark:text-amber-300">
              <strong className="font-black">Platform Monitored Chat:</strong> All communications are audited for safety, verification, and payment protection. Never share external contact or direct payment handles.
            </p>
          </div>

          {/* Messages Area */}
          <div data-lenis-prevent className="flex-grow p-4 sm:p-6 overflow-y-auto space-y-4 overscroll-contain">
            {loading && messages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="w-7 h-7 border-3 border-brand-interactive/30 border-t-brand-interactive rounded-full animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#6C757D]">
                <div className="w-14 h-14 rounded-2xl bg-brand-interactive/10 text-brand-interactive flex items-center justify-center mb-3">
                  <Lock className="w-6 h-6" />
                </div>
                <h4 className="font-serif font-black text-base text-[#1A1A1A] dark:text-white mb-1">
                  Private Session Channel
                </h4>
                <p className="text-xs max-w-xs leading-relaxed">
                  Start communicating about appointment requirements, arrival timing, or beauty style requests.
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderId === currentUserId;
                const formattedTime = new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center space-x-1.5 mb-1 px-1">
                      <span className="text-[10px] font-black text-[#6C757D]">
                        {isMe ? 'You' : msg.senderName || (msg.senderRole === 'AGENT' ? 'Specialist' : 'Client')}
                      </span>
                      <span className="text-[9px] text-[#A0AEC0]">• {formattedTime}</span>
                    </div>

                    <div
                      className={`max-w-[85%] sm:max-w-[78%] p-3.5 sm:p-4 rounded-2xl shadow-sm text-xs sm:text-sm leading-relaxed ${
                        isMe
                          ? 'bg-[#6C35A6] text-white rounded-tr-none shadow-[0_4px_16px_rgba(108,53,166,0.25)]'
                          : 'bg-brand-surface dark:bg-[#1E1E1E] text-[#1A1A1A] dark:text-white border border-[#E9ECEF] dark:border-[#2D2D2D] rounded-tl-none'
                      }`}
                    >
                      {msg.message}
                    </div>

                    {isMe && (
                      <div className="flex items-center text-[9px] text-[#A0AEC0] mt-1 mr-1">
                        <CheckCheck className="w-3 h-3 text-brand-interactive" />
                      </div>
                    )}
                  </motion.div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {error && (
            <div className="mx-4 mb-2 p-2.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Chat Input */}
          <form onSubmit={handleSend} className="p-4 border-t border-[#E9ECEF] dark:border-[#2D2D2D] bg-brand-surface dark:bg-[#161616]">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Message ${counterpartName || 'client'}...`}
                disabled={sending}
                className="flex-grow p-3.5 bg-brand-background dark:bg-[#0D0D0D] border border-[#E9ECEF] dark:border-[#2D2D2D] rounded-2xl text-xs sm:text-sm outline-none focus:border-brand-interactive transition-all text-[#1A1A1A] dark:text-white"
              />
              <button
                type="submit"
                disabled={sending || !inputText.trim()}
                className="p-3.5 bg-brand-interactive text-white rounded-2xl hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 transition-all shadow-lg shadow-brand-interactive/25 flex items-center justify-center shrink-0"
              >
                {sending ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </form>
        </motion.aside>
      </div>
    </AnimatePresence>
  );
};

export default BookingChatDrawer;
