
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, MessageSquare, Tag, Clock, ChevronRight, Instagram, Twitter, Linkedin, Facebook, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { useSnackbar } from '../components/Snackbar';

const Contact: React.FC = () => {
  const { showSnackbar } = useSnackbar();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    showSnackbar('Message sent successfully! We will get back to you soon.', 'success');
  };

  return (
    <div className="pt-16 sm:pt-20 md:pt-24 bg-[#F8F9FA] dark:bg-[#0D0D0D]">
      {/* Hero Header */}
      <section className="py-12 sm:py-16 md:py-20 text-center max-w-4xl mx-auto px-4 sm:px-6">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-4"
        >
          Get in Touch
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-base sm:text-lg md:text-xl text-[#6C757D] dark:text-[#B0B0B0] font-light"
        >
          We'd love to hear from you. Our team is here to support you 24/7.
        </motion.p>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-20 md:pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8 md:gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3 bg-white dark:bg-[#1A1A1A] p-6 sm:p-8 md:p-12 lg:p-16 rounded-2xl sm:rounded-3xl md:rounded-[3rem] shadow-lg sm:shadow-xl md:shadow-2xl border border-[#E9ECEF] dark:border-[#2D2D2D]"
          >
            <div className="mb-8 sm:mb-10 md:mb-12">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blushPink dark:bg-rosePink/10 text-rosePink rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                <Send className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold mb-2">Send us a Message</h2>
              <p className="text-sm sm:text-base text-[#6C757D]">Expect a response within 24 business hours.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#6C757D] uppercase tracking-widest">Name</label>
                  <input type="text" placeholder="Your full name" className="w-full p-3 sm:p-4 bg-[#F8F9FA] dark:bg-[#0D0D0D] border border-transparent rounded-xl sm:rounded-2xl outline-none focus:border-rosePink transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#6C757D] uppercase tracking-widest">Email</label>
                  <input type="email" placeholder="hello@company.com" className="w-full p-3 sm:p-4 bg-[#F8F9FA] dark:bg-[#0D0D0D] border border-transparent rounded-xl sm:rounded-2xl outline-none focus:border-rosePink transition-all" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#6C757D] uppercase tracking-widest flex items-center">
                  <Tag className="w-3 h-3 mr-1" /> Subject
                </label>
                <select className="w-full p-3 sm:p-4 bg-[#F8F9FA] dark:bg-[#0D0D0D] border border-transparent rounded-xl sm:rounded-2xl outline-none focus:border-rosePink transition-all">
                  <option>General Inquiry</option>
                  <option>Technical Support</option>
                  <option>Partnership</option>
                  <option>Feedback</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#6C757D] uppercase tracking-widest flex items-center">
                  <MessageSquare className="w-3 h-3 mr-1" /> Message
                </label>
                <textarea placeholder="How can we help you?" className="w-full p-3 sm:p-4 bg-[#F8F9FA] dark:bg-[#0D0D0D] border border-transparent rounded-xl sm:rounded-2xl outline-none focus:border-rosePink transition-all h-32 sm:h-40 resize-none"></textarea>
              </div>
              <button type="submit" className="w-full py-3 sm:py-4 md:py-5 bg-rosePink text-white rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg md:text-xl hover:bg-[#E57B8D] transition-all transform hover:scale-[1.01] shadow-lg sm:shadow-xl shadow-rosePink/20 flex items-center justify-center gap-2 sm:gap-3">
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Send Message</span>
              </button>
            </form>
          </motion.div>

          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* ... keeping existing contact info ... */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-6 sm:p-8 md:p-10 bg-white dark:bg-[#1A1A1A] rounded-2xl sm:rounded-3xl md:rounded-[3rem] border border-[#E9ECEF] dark:border-[#2D2D2D] shadow-sm"
            >
              <h3 className="text-xl sm:text-2xl font-serif font-bold mb-6 sm:mb-8">Contact Information</h3>
              <div className="space-y-6 sm:space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 flex-shrink-0 bg-blushPink dark:bg-rosePink/10 text-rosePink rounded-2xl flex items-center justify-center">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold mb-1">Email Us</div>
                    <a href="mailto:support@everythingbeauty.com" className="text-[#6C757D] hover:text-rosePink transition-colors">support@everythingbeauty.com</a>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 flex-shrink-0 bg-blushPink dark:bg-rosePink/10 text-rosePink rounded-2xl flex items-center justify-center">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold mb-1">Call Us</div>
                    <a href="tel:+2348001234567" className="text-[#6C757D] hover:text-rosePink transition-colors">+234 (0) 800 123 4567</a>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 flex-shrink-0 bg-blushPink dark:bg-rosePink/10 text-rosePink rounded-2xl flex items-center justify-center">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold mb-1">Headquarters</div>
                    <p className="text-[#6C757D]">Victoria Island, Lagos, Nigeria</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 flex-shrink-0 bg-blushPink dark:bg-rosePink/10 text-rosePink rounded-2xl flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold mb-1">Support Hours</div>
                    <p className="text-[#6C757D]">Mon-Fri: 9am - 6pm</p>
                    <p className="text-[#6C757D] text-xs mt-1">24/7 Support for Active Bookings</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Notification Test Zone */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="p-6 sm:p-8 bg-[#F0F2F5] dark:bg-[#252525] rounded-3xl border border-dashed border-[#ADB5BD] dark:border-[#495057]"
            >
              <h4 className="font-bold mb-4 uppercase tracking-widest text-[#6C757D] text-xs">Test Notifications</h4>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => showSnackbar('Payment successful!', 'success')}
                  className="p-3 bg-green-500/10 text-green-600 rounded-xl font-bold text-xs hover:bg-green-500 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" /> Success
                </button>
                <button
                  onClick={() => showSnackbar('Network error. Retry?', 'error')}
                  className="p-3 bg-red-500/10 text-red-600 rounded-xl font-bold text-xs hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <AlertCircle className="w-4 h-4" /> Error
                </button>
                <button
                  onClick={() => showSnackbar('New message received.', 'info')}
                  className="col-span-2 p-3 bg-blue-500/10 text-blue-600 rounded-xl font-bold text-xs hover:bg-blue-500 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <Info className="w-4 h-4" /> Info / Update
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 sm:p-8 md:p-10 bg-rosePink text-white rounded-2xl sm:rounded-3xl md:rounded-[3rem] shadow-lg sm:shadow-xl shadow-rosePink/20"
            >
              <h3 className="text-xl sm:text-2xl font-serif font-bold mb-4 sm:mb-6">Connect With Us</h3>
              <p className="text-sm sm:text-base mb-6 sm:mb-8 text-white/90">Join our growing community of beauty lovers and professionals.</p>
              <div className="grid grid-cols-4 gap-3 sm:gap-4">
                {[Instagram, Twitter, Facebook, Linkedin].map((Icon, i) => (
                  <button key={i} className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-xl sm:rounded-2xl bg-white/20 hover:bg-white text-white hover:text-rosePink transition-all group">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:scale-110" />
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Questions Section - Kept same */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="p-6 sm:p-8 md:p-10 bg-white dark:bg-[#1A1A1A] rounded-2xl sm:rounded-3xl md:rounded-[3rem] border border-rosePink/20 flex flex-col items-center text-center"
            >
              {/* ... same content ... */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blushPink dark:bg-rosePink/10 text-rosePink rounded-full flex items-center justify-center mb-3 sm:mb-4">
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 rotate-90" />
              </div>
              <h4 className="font-bold mb-2">Have questions?</h4>
              <p className="text-sm text-[#6C757D] mb-4 sm:mb-6">Our FAQ might have exactly what you need.</p>
              <Link to="/#faq" className="text-rosePink font-bold flex items-center group">
                Go to FAQ <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
