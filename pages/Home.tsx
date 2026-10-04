import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Users, CheckCircle, Heart, Star, Search, Calendar, Sparkles, ChevronRight, ArrowRight, Shield, MapPin, Briefcase, Camera, Instagram, Quote, Zap, Globe, MessageSquare, Handshake, TrendingUp } from 'lucide-react';
import StatBlock from '../components/StatBlock';
import { getPlatformMetrics, PlatformMetrics } from '../services/supabaseService';

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1920&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?q=80&w=1920&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=1920&auto=format&fit=crop',
];

const Home: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [metrics, setMetrics] = useState<PlatformMetrics>({
    totalAgents: 0,
    totalServices: 0,
    totalBookings: 0,
    completedBookings: 0,
    averageRating: 0
  });
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.replace('#', ''));
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [hash]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    getPlatformMetrics().then(res => {
      setMetrics(res);
    });
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { type: "spring" as const, stiffness: 45, damping: 20 }
  };

  const staggerContainer = {
    initial: { opacity: 0 },
    whileInView: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    },
    viewport: { once: true }
  };

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative h-[110vh] flex items-center overflow-hidden bg-white dark:bg-[#0D0D0D]">
        {/* Slideshow */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 1.8, ease: [0.4, 0, 0.2, 1] }}
              className="absolute inset-0"
            >
              <img
                src={HERO_IMAGES[currentSlide]}
                className="w-full h-full object-cover object-left"
                alt="Beauty Professional"
              />
            </motion.div>
          </AnimatePresence>

          <div className="absolute inset-0 z-10 bg-gradient-to-r from-white via-white/80 to-transparent dark:from-[#0D0D0D] dark:via-[#0D0D0D]/90 dark:to-transparent" />
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-white via-transparent to-transparent dark:from-[#0D0D0D]" />
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, x: -80, y: 80 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ type: "spring", stiffness: 40, damping: 18 }}
            className="max-w-7xl md:max-w-3xl lg:max-w-4xl"
          >
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center space-x-2 text-rosePink text-[10px] font-black uppercase tracking-[0.35em] mb-8 sm:mb-10 drop-shadow-[0_0_12px_rgba(255,51,102,0.6)]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Elite On-Demand Beauty</span>
            </motion.div>

            <h1 className="w-full text-5xl md:text-5xl lg:text-6xl font-serif font-bold text-[#1A1A1A] dark:text-white mb-6 leading-tight tracking-tighter">
              Timeless <span className="text-rosePink italic">Elegance</span> & <span className="text-rosePink italic">Grooming,</span> Delivered.
            </h1>

            <p className="text-lg md:text-xl text-[#6C757D] dark:text-[#B0B0B0] mb-10 max-w-xl font-medium leading-relaxed">
              Discover Nigeria's finest beauty professionals and barbers. On-demand, in-shop, or hybrid—instantly.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <Link
                to="/auth"
                className="group relative px-6 py-3.5 sm:px-10 sm:py-5 bg-rosePink text-white rounded-2xl sm:rounded-[2rem] text-base sm:text-lg font-black hover:bg-[#E57B8D] transition-all transform hover:scale-105 shadow-[0_20px_40px_rgba(255,138,157,0.3)] sm:shadow-[0_30px_60px_rgba(255,138,157,0.4)] text-center overflow-hidden"
              >
                <span className="relative z-10">Get Started</span>
                <motion.div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </Link>

              <Link
                to="/services"
                className="px-6 py-3.5 sm:px-10 sm:py-5 bg-white/50 dark:bg-white/5 backdrop-blur-xl text-[#1A1A1A] dark:text-white border-2 border-transparent hover:border-rosePink rounded-2xl sm:rounded-[2rem] text-base sm:text-lg font-bold transition-all transform hover:scale-105 text-center shadow-lg sm:shadow-xl"
              >
                Explore Services
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Real Live Platform Metrics */}
      <section className="py-24 bg-white dark:bg-[#0D0D0D] relative z-20 -mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            <StatBlock
              number={metrics.totalAgents}
              suffix=""
              label="Verified Specialists"
              icon={<Users />}
              microTexts={["Vetted & Certified Artists", "Nationwide Coverage"]}
            />
            <StatBlock
              number={metrics.totalServices}
              suffix=""
              label="Available Services"
              icon={<Sparkles />}
              microTexts={["Hair, Makeup, Nails, Skincare", "Instant Booking Available"]}
            />
            <StatBlock
              number={metrics.totalBookings}
              suffix=""
              label="Total Reservations"
              icon={<CheckCircle />}
              microTexts={["Secured Cashless Booking", "Client Satisfaction Focused"]}
            />
            <StatBlock
              number={metrics.averageRating > 0 ? metrics.averageRating : 5.0}
              suffix="/5.0"
              label="Platform Standard"
              icon={<Star />}
              microTexts={["Real Client Reviews", "Strict Quality Checks"]}
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-32 bg-[#F8F9FA] dark:bg-[#111] relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-rosePink/10 rounded-full blur-[100px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-24">
            <motion.p {...fadeInUp} className="text-rosePink font-black uppercase tracking-[0.5em] text-[10px] mb-4">The Mastery Process</motion.p>
            <motion.h2 {...fadeInUp} className="text-6xl md:text-8xl font-serif font-bold">Simply Effortless</motion.h2>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid grid-cols-1 lg:grid-cols-4 gap-4"
          >
            {[
              {
                step: "01",
                title: "Curate",
                desc: "Discover beauty professionals by category, price, and proximity.",
                icon: <Search className="w-8 h-8" />
              },
              {
                step: "02",
                title: "Examine",
                desc: "Browse verified portfolios, service details, and client reviews.",
                icon: <Camera className="w-8 h-8" />
              },
              {
                step: "03",
                title: "Reserve",
                desc: "Choose your date, time, and address with upfront pricing.",
                icon: <Calendar className="w-8 h-8" />
              },
              {
                step: "04",
                title: "Radiate",
                desc: "Your specialist arrives and delivers your transformation.",
                icon: <Sparkles className="w-8 h-8" />
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                whileHover={{ y: -15 }}
                className="group relative p-12 bg-white dark:bg-[#1A1A1A] rounded-[4rem] shadow-2xl transition-all duration-500 overflow-hidden"
              >
                <div className="absolute top-8 right-10 text-8xl font-serif font-black text-[#F8F9FA] dark:text-white/5 group-hover:text-rosePink/10 transition-colors pointer-events-none">
                  {item.step}
                </div>
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-blushPink dark:bg-rosePink/10 text-rosePink rounded-[2rem] flex items-center justify-center mb-10 shadow-lg group-hover:rotate-12 transition-transform duration-500">
                    {item.icon}
                  </div>
                  <h3 className="text-3xl font-serif font-bold mb-6">{item.title}</h3>
                  <p className="text-lg text-[#6C757D] dark:text-[#B0B0B0] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Specialist Partnership Section */}
      <section className="py-40 relative bg-[#0D0D0D] overflow-hidden group">
        <div className="absolute inset-0 z-0">
          <motion.img
            initial={{ scale: 1.1 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 10, ease: "linear" }}
            src="https://images.unsplash.com/photo-1540555700478-4be289fbecee?q=80&w=1920&auto=format&fit=crop"
            className="w-full h-full object-cover opacity-40 brightness-50"
            alt="Studio"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-rosePink/20 via-transparent to-transparent opacity-50" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <motion.div {...fadeInUp}>
              <div className="inline-flex items-center space-x-2 text-rosePink text-[10px] font-black uppercase tracking-[0.35em] mb-10 drop-shadow-[0_0_12px_rgba(255,51,102,0.6)]">
                <TrendingUp className="w-4 h-4" />
                <span>Specialist Network</span>
              </div>
              <h2 className="text-6xl md:text-9xl font-serif font-bold text-white mb-10 leading-[0.9] tracking-tighter">
                Lead the <br />
                <span className="text-rosePink italic">Industry.</span>
              </h2>
              <p className="text-2xl text-white/70 mb-16 leading-relaxed font-medium">
                Monetize your services with complete control over your schedule, portfolio, and pricing.
              </p>

              <div className="flex flex-col md:flex-row gap-8">
                <Link to="/auth" className="group flex-1 px-12 py-7 bg-rosePink text-white rounded-[2.5rem] font-black text-2xl flex items-center justify-center space-x-4 hover:bg-[#E57B8D] transition-all transform hover:scale-105 shadow-[0_30px_60px_rgba(255,138,157,0.5)]">
                  <span>Become a Partner</span>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-3 transition-transform duration-500" />
                </Link>
                <Link to="/services" className="flex-1 px-12 py-7 bg-white/5 backdrop-blur-2xl text-white border-2 border-white/20 rounded-[2.5rem] font-bold text-2xl hover:bg-white/10 transition-all transform hover:scale-105 flex items-center justify-center text-center shadow-2xl">
                  Explore Services
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Support FAQ */}
      <section id="faq" className="py-32 bg-[#F8F9FA] dark:bg-[#111]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-24">
            <h2 className="text-5xl md:text-7xl font-serif font-bold mb-6">Support & <span className="text-rosePink italic">Safety</span></h2>
            <p className="text-xl text-[#6C757D] dark:text-[#B0B0B0] max-w-2xl mx-auto font-medium leading-relaxed">Dedicated support for your peace of mind.</p>
          </motion.div>
          <div className="space-y-6">
            {[
              { q: 'How do you verify beauty specialists?', a: 'Every specialist undergoes identity validation, background credential review, and portfolio auditing prior to approval.' },
              { q: 'What safety measures are in place?', a: 'We offer verified scheduling details, 24/7 concierge support, and a comprehensive code of conduct agreement.' },
              { q: 'Is my booking payment secure?', a: 'Yes. Appointments are recorded with full transparency and verified against completed sessions.' },
              { q: 'Can I reschedule an appointment?', a: 'Yes. You can manage or reschedule appointments directly via your dashboard.' }
            ].map((faq, idx) => (
              <motion.details
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="group p-10 bg-white dark:bg-[#1A1A1A] rounded-[3rem] border-2 border-transparent hover:border-rosePink/20 transition-all cursor-pointer shadow-xl"
              >
                <summary className="flex justify-between items-center font-black text-xl list-none">
                  {faq.q}
                  <ChevronRight className="w-7 h-7 group-open:rotate-90 transition-transform text-rosePink" />
                </summary>
                <p className="mt-8 text-xl text-[#6C757D] dark:text-[#B0B0B0] leading-relaxed font-medium">
                  {faq.a}
                </p>
              </motion.details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
