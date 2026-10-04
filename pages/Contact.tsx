
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, MessageSquare, Tag, Clock, ChevronRight, Instagram, Twitter, Linkedin, Facebook, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { useSnackbar } from '../components/Snackbar';

const Contact: React.FC = () => {
  const { showSnackbar } = useSnackbar();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      showSnackbar('Please fill in all required fields.', 'error');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch("https://formsubmit.co/ajax/confidenceorok30@gmail.com", {
        method: "POST",
        headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            ...formData,
            _subject: `New Contact from ${formData.name}: ${formData.subject}`
        })
      });

      if (response.ok) {
        showSnackbar('Message sent successfully! We will get back to you soon.', 'success');
        setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
      } else {
        throw new Error('Failed to send message');
      }
    } catch (err) {
      showSnackbar('There was an error sending your message. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
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
                  <label className="text-xs font-bold text-[#6C757D] uppercase tracking-widest">Name *</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Your full name" required className="w-full p-3 sm:p-4 bg-[#F8F9FA] dark:bg-[#0D0D0D] border border-transparent rounded-xl sm:rounded-2xl outline-none focus:border-rosePink transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#6C757D] uppercase tracking-widest">Email *</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="hello@company.com" required className="w-full p-3 sm:p-4 bg-[#F8F9FA] dark:bg-[#0D0D0D] border border-transparent rounded-xl sm:rounded-2xl outline-none focus:border-rosePink transition-all" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#6C757D] uppercase tracking-widest flex items-center">
                  <Tag className="w-3 h-3 mr-1" /> Subject
                </label>
                <select value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} className="w-full p-3 sm:p-4 bg-[#F8F9FA] dark:bg-[#0D0D0D] border border-transparent rounded-xl sm:rounded-2xl outline-none focus:border-rosePink transition-all appearance-none">
                  <option>General Inquiry</option>
                  <option>Technical Support</option>
                  <option>Partnership</option>
                  <option>Feedback</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#6C757D] uppercase tracking-widest flex items-center">
                  <MessageSquare className="w-3 h-3 mr-1" /> Message *
                </label>
                <textarea value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} placeholder="How can we help you?" required className="w-full p-3 sm:p-4 bg-[#F8F9FA] dark:bg-[#0D0D0D] border border-transparent rounded-xl sm:rounded-2xl outline-none focus:border-rosePink transition-all h-32 sm:h-40 resize-none"></textarea>
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full py-3 sm:py-4 md:py-5 bg-rosePink text-white rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg md:text-xl hover:bg-[#E57B8D] transition-all transform hover:scale-[1.01] shadow-lg sm:shadow-xl shadow-rosePink/20 flex items-center justify-center gap-2 sm:gap-3 disabled:opacity-50 disabled:cursor-not-allowed">
                {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4 sm:w-5 sm:h-5" />}
                <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
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
              <div className="flex flex-wrap gap-3 sm:gap-4">
                {[
                  { Icon: WhatsAppIcon, href: "https://wa.me/2348116422587?text=Hello%20Everything%20Beauty!%20I%20have%20an%20inquiry.", color: "hover:text-[#25D366]" },
                  { Icon: Instagram, href: "#", color: "hover:text-[#E1306C]" },
                  { Icon: Twitter, href: "#", color: "hover:text-[#1DA1F2]" },
                  { Icon: Facebook, href: "#", color: "hover:text-[#4267B2]" },
                  { Icon: Linkedin, href: "#", color: "hover:text-[#0077B5]" }
                ].map((social, i) => (
                  <a 
                    key={i} 
                    href={social.href}
                    target={social.href !== "#" ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-xl sm:rounded-2xl bg-white/20 hover:bg-white text-white ${social.color} transition-all group shadow-sm`}
                  >
                    <social.Icon className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:scale-110" />
                  </a>
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

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
  </svg>
);

export default Contact;
