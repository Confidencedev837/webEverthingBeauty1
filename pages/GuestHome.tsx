import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Users, CheckCircle, Heart, Star, Search, Calendar, ChevronRight, ArrowRight, Shield, MapPin, Briefcase, Camera, Instagram, Quote, Zap, Globe, MessageSquare, Handshake, TrendingUp } from 'lucide-react';
import StatBlock from '../components/StatBlock';
import Typewriter, { TypewriterPhrase } from '../components/Typewriter';
import { getPlatformMetrics, PlatformMetrics } from '../services/supabaseService';

const HERO_IMAGES = [
  'https://media.allure.com/photos/6940574e2221c37477bde11d/16:9/w_1920,c_limit/%C2%A9Margaret%20K.%20Photography,%20All%20Rights%20Reserved-18-0026.jpg',
  'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=80&w=1920&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=1920&auto=format&fit=crop',
];

const HERO_PHRASES: TypewriterPhrase[] = [
  ['Book a makeup artist ', 'in under 60 seconds.'],
  ['Verified professionals ', 'come to your doorstep.'],
  ['Hair. Nails. Glow. ', 'On-demand, anywhere.'],
  ['Skip the salon. ', 'Beauty comes to you.'],
];

const INDUSTRY_PHRASE: TypewriterPhrase[] = [['Earn More.\n', 'Work on Your Terms.']];

interface StepNumberProps {
  target: number;
}

const StopwatchNumber: React.FC<StepNumberProps> = ({ target }) => {
  const [val, setVal] = useState(0);

  const handleStart = () => {
    const duration = 600;
    const startTime = performance.now();
    let frameId: number;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(eased * target));
      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, rotate: 10 }}
      whileInView={{ opacity: 1, y: 0, rotate: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      onViewportEnter={handleStart}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 18,
        mass: 0.8
      }}
      className="absolute top-6 right-8 text-7xl sm:text-8xl font-serif font-black text-[#1A1A1A]/10 dark:text-white pointer-events-none select-none drop-shadow-[0_12px_24px_rgba(0,0,0,0.06)] dark:drop-shadow-[0_0_35px_rgba(255,255,255,0.45)] transition-colors inline-block"
    >
      0{val}
    </motion.div>
  );
};

const GuestHome: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [metrics, setMetrics] = useState<PlatformMetrics>({
    totalAgents: 0,
    totalServices: 0,
    totalBookings: 0,
    completedBookings: 0,
    averageRating: 0
  });
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.replace('#', ''));
      if (element) {
        setTimeout(() => {
          if ((window as any).lenis) {
            (window as any).lenis.scrollTo(element, { offset: -70, duration: 1.2 });
          } else {
            element.scrollIntoView({ behavior: 'smooth' });
          }
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
      <section className="relative h-[110vh] flex items-center overflow-hidden bg-brand-background dark:bg-[#0D0D0D]">
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
                className="w-full h-full object-cover object-[center_28%] sm:object-center md:object-[72%_center] lg:object-right"
                alt="Beauty Professional"
              />
            </motion.div>
          </AnimatePresence>

          {/* Responsive Scrim: on phones a gentle vertical gradient keeps the subject visible; on desktop horizontal */}
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-white via-white/70 to-white/20 dark:from-[#0D0D0D] dark:via-[#0D0D0D]/75 dark:to-[#0D0D0D]/20 md:bg-gradient-to-r md:from-white md:via-white/80 md:to-transparent md:dark:from-[#0D0D0D] md:dark:via-[#0D0D0D]/90 md:dark:to-transparent" />
          <div className="absolute inset-0 z-10 bg-gradient-to-b from-white/70 via-transparent to-transparent dark:from-[#0D0D0D]/70 md:hidden" />
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
              className="inline-flex items-center space-x-2 text-brand-interactive text-[10px] font-black tracking-[0.35em] mb-8 sm:mb-10 drop-shadow-[0_0_12px_rgba(108,53,166,0.6)]"
            >
              <span className="w-2 h-2 rounded-sm bg-brand-interactive inline-block shadow-[0_0_8px_rgba(108,53,166,0.8)]" />
              <span>Elite On-Demand Beauty</span>
            </motion.div>

            <h1 className="w-full min-h-[3.75em] md:min-h-[2.5em] text-5xl md:text-5xl lg:text-6xl font-serif font-bold text-[#1A1A1A] dark:text-white mb-6 leading-tight tracking-tighter">
              <Typewriter phrases={HERO_PHRASES} loop />
            </h1>

            <p className="text-lg md:text-xl text-[#6C757D] dark:text-[#B0B0B0] mb-10 max-w-xl font-medium leading-relaxed">
              Discover Nigeria's finest beauty professionals and barbers. On-demand, in-shop, or hybrid—instantly.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <Link
                to="/auth"
                className="group relative px-6 py-3.5 sm:px-10 sm:py-5 bg-brand-interactive text-white rounded-2xl sm:rounded-[2rem] text-base sm:text-lg font-black hover:bg-brand-interactive/90 transition-all transform hover:scale-105 shadow-[0_20px_40px_rgba(108,53,166,0.3)] sm:shadow-[0_30px_60px_rgba(108,53,166,0.4)] text-center overflow-hidden"
              >
                <span className="relative z-10">Get Started</span>
                <motion.div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </Link>

              <Link
                to="/services"
                className="px-6 py-3.5 sm:px-10 sm:py-5 bg-white/50 dark:bg-white/5 backdrop-blur-xl text-[#1A1A1A] dark:text-white border-2 border-transparent hover:border-brand-interactive rounded-2xl sm:rounded-[2rem] text-base sm:text-lg font-bold transition-all transform hover:scale-105 text-center shadow-lg sm:shadow-xl"
              >
                Explore Services
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Real Live Platform Metrics */}
      <section className="py-24 bg-brand-background dark:bg-[#0D0D0D] relative z-20 -mt-20">
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
              icon={<Zap />}
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
      <section className="py-32 bg-brand-surface dark:bg-[#111] relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-interactive/10 rounded-[4rem] blur-[100px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-24">
            <motion.p {...fadeInUp} className="text-brand-interactive font-black tracking-[0.5em] text-[10px] mb-4">The Mastery Process</motion.p>
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
                icon: <Search className="w-8 h-8" />,
                image: "/images/steps/curate-woman-phone.png",
                imageClassName: "w-[15rem] sm:w-[16rem] md:w-[17rem] -bottom-3 -right-2"
              },
              {
                step: "02",
                title: "Examine",
                desc: "Browse verified portfolios, service details, and client reviews.",
                icon: <Camera className="w-8 h-8" />,
                image: "/images/steps/examine-friends.png",
                imageClassName: "w-[21rem] sm:w-[22rem] md:w-[23rem] -bottom-3 -right-3"
              },
              {
                step: "03",
                title: "Reserve",
                desc: "Choose your date, time, and address with upfront pricing.",
                icon: <Calendar className="w-8 h-8" />,
                image: "/images/steps/reserve-confirmed.png",
                imageClassName: "w-[21rem] sm:w-[22rem] md:w-[23rem] -bottom-3 -right-3"
              },
              {
                step: "04",
                title: "Radiate",
                desc: "Your specialist arrives and delivers your transformation.",
                icon: <Zap className="w-8 h-8" />,
                image: "/images/steps/radiate-twists-profile.png",
                imageClassName: "w-[12rem] sm:w-[13.5rem] md:w-[14.5rem] -bottom-3 -right-2"
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                whileHover={{ y: -15 }}
                className="group relative p-8 sm:p-10 bg-brand-background dark:bg-[#1A1A1A] rounded-[3rem] sm:rounded-[3.5rem] shadow-2xl transition-all duration-500 overflow-hidden aspect-[4/5] lg:aspect-auto lg:min-h-[500px] xl:min-h-[520px] flex flex-col justify-between"
              >
                {/* Number: Stopwatch count-up effect swinging in from the bottom */}
                <StopwatchNumber target={parseInt(item.step, 10)} />

                <div className="relative z-10 pr-2">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-brand-surface dark:bg-brand-interactive/10 text-brand-interactive rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:rotate-12 transition-transform duration-500">
                    {item.icon}
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-serif font-bold mb-3 sm:mb-4 text-[#1A1A1A] dark:text-white">
                    {item.title}
                  </h3>
                  <p className="text-sm sm:text-base text-[#6C757D] dark:text-[#B0B0B0] leading-relaxed max-w-[190px] sm:max-w-[210px] min-h-[3rem]">
                    <Typewriter phrases={[[item.desc, '']]} startOnView typeSpeed={22} />
                  </p>
                </div>

                {/* Animated Bottom-Right Illustration with Subtle Yellow Accent Halo Glow */}
                {item.image && (
                  <motion.div
                    initial={{ opacity: 0, x: -80, rotate: -22, scale: 0.8 }}
                    whileInView={{ opacity: 1, x: 0, rotate: 0, scale: 1 }}
                    viewport={{ amount: 0.5 }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 14,
                      mass: 0.7,
                      delay: 0.1
                    }}
                    className={`absolute pointer-events-none select-none z-10 ${item.imageClassName || "w-[21rem] sm:w-[22rem] md:w-[23rem] -bottom-3 -right-3"}`}
                  >
                    {/* Subtle Yellow Accent Halo Glow */}
                    <div className="absolute inset-0 -inset-x-4 -inset-y-4 bg-gradient-to-tr from-amber-400/25 via-amber-300/15 to-transparent rounded-full blur-2xl pointer-events-none opacity-80" />

                    <img
                      src={item.image}
                      alt={item.title}
                      className="relative z-10 w-full h-auto object-contain drop-shadow-[0_0_24px_rgba(251,191,36,0.35)] dark:drop-shadow-[0_0_30px_rgba(251,191,36,0.45)]"
                    />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Specialist Partnership Section */}
      <section className="py-16 sm:py-28 md:py-36 relative bg-[#0D0D0D] overflow-hidden group">
        <div className="absolute inset-0 z-0">
          <motion.img
            initial={{ scale: 1.1 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 10, ease: "linear" }}
            src="https://images.unsplash.com/photo-1653758265969-b048bb0b328a?q=80&w=1920&auto=format&fit=crop"
            className="w-full h-full object-cover opacity-35 sm:opacity-40 brightness-[0.45] sm:brightness-50"
            alt="Studio"
          />
          {/* Mobile-first full scrim gradient so text is always 100% crisp on narrow screens */}
          <div className="absolute inset-0 bg-gradient-to-b sm:bg-gradient-to-r from-black via-black/90 sm:via-black/80 to-black/75 sm:to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-interactive/20 via-transparent to-transparent opacity-40 sm:opacity-50" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <motion.div {...fadeInUp}>
              <h2 className="text-4xl sm:text-6xl md:text-8xl font-serif font-bold text-white mb-4 sm:mb-6 leading-[1.05] sm:leading-[0.95] tracking-tight">
                <Typewriter phrases={INDUSTRY_PHRASE} startOnView typeSpeed={80} accentClassName="text-brand-accent" />
              </h2>
              <p className="text-sm sm:text-lg md:text-xl text-white/80 mb-6 sm:mb-10 leading-relaxed font-medium">
                Turn your beauty and grooming skills into steady income. Stop chasing fake bank alerts and answering 50 DMs a day. Get booked by paying customers with guaranteed upfront payouts, zero price haggling, and complete control over your doorstep calendar.
              </p>

              {/* Core Commercial Value Points */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-8 sm:mb-12">
                <div className="p-4 sm:p-5 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-start gap-3.5 transition-all hover:bg-white/[0.08]">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-brand-interactive/25 text-brand-accent flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm sm:text-base mb-1">
                      Guaranteed Upfront Payment
                    </h3>
                    <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                      Customer money is locked before you leave home. No standing in living rooms waiting for alerts to drop.
                    </p>
                  </div>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-start gap-3.5 transition-all hover:bg-white/[0.08]">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-brand-interactive/25 text-brand-accent flex items-center justify-center shrink-0 mt-0.5">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm sm:text-base mb-1">
                      Fuel & Transit Protection
                    </h3>
                    <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                      If a customer cancels late on a doorstep booking, your time, fuel, and transport costs are paid to you automatically.
                    </p>
                  </div>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-start gap-3.5 transition-all hover:bg-white/[0.08]">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-brand-interactive/25 text-brand-accent flex items-center justify-center shrink-0 mt-0.5">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm sm:text-base mb-1">
                      No Price Haggling
                    </h3>
                    <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                      Customers pay your exact published rates. No awkward discount begging or endless negotiation in WhatsApp DMs.
                    </p>
                  </div>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-start gap-3.5 transition-all hover:bg-white/[0.08]">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-brand-interactive/25 text-brand-accent flex items-center justify-center shrink-0 mt-0.5">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm sm:text-base mb-1">
                      Fast Bank Withdrawals
                    </h3>
                    <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                      Withdraw your completed booking earnings directly into any Nigerian commercial bank account with zero delays.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
                <Link to="/auth" className="group w-full sm:flex-1 px-6 py-4 sm:px-8 sm:py-5 bg-brand-interactive text-white rounded-2xl sm:rounded-[2rem] font-black text-sm sm:text-base md:text-lg flex items-center justify-center space-x-3 hover:bg-brand-interactive/90 active:scale-95 transition-all shadow-[0_16px_32px_rgba(108,53,166,0.4)] sm:shadow-[0_20px_40px_rgba(108,53,166,0.5)]">
                  <span>Register as a Beauty Agent</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                </Link>
                <Link to="/services" className="w-full sm:flex-1 px-6 py-4 sm:px-8 sm:py-5 bg-white/5 backdrop-blur-2xl text-white border-2 border-white/20 rounded-2xl sm:rounded-[2rem] font-bold text-sm sm:text-base md:text-lg hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center text-center shadow-xl sm:shadow-2xl">
                  Book a Service Now
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Support FAQ */}
      <section id="faq" className="relative py-20 sm:py-32 bg-brand-surface dark:bg-[#0D0D0D] overflow-hidden">
        {/* Subtle Textured Background Overlay */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div
            className="w-full h-full bg-repeat opacity-[0.70] dark:opacity-[0.70] invert dark:invert-0 mix-blend-multiply dark:mix-blend-screen"
            style={{
              backgroundImage: 'url(/images/grid-texture.jpg)',
              backgroundSize: '240px auto'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-surface via-transparent to-brand-surface dark:from-[#0D0D0D] dark:via-transparent dark:to-[#0D0D0D]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.3 }}
            transition={{ type: "spring", stiffness: 50, damping: 20 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-5xl md:text-7xl font-serif font-bold mb-3 sm:mb-5">
              Frequently Asked <span className="text-brand-interactive italic">Questions</span>
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-[#6C757D] dark:text-[#B0B0B0] max-w-2xl mx-auto font-medium leading-relaxed">
              Straightforward answers for customers and beauty agents on bookings, emergency dispatch, and payouts.
            </p>
          </motion.div>

          <div className="space-y-3 sm:space-y-4">
            {[
              {
                q: "What happens if a booking is cancelled last-minute?",
                a: "Direct Protection: If an agent cancels, you receive an immediate, reliable replacement dispatched to your location plus booking credit. If a customer cancels after the cut-off window, the beauty agent receives an automated cancellation fee to cover their time and transport costs."
              },
              {
                q: "What if I experience 'what I ordered versus what I got'?",
                a: "Quality Redo or Refund: If a beauty agent fails to deliver the agreed style or produces substandard work, do not confirm the session code. File an instant dispute on your booking screen—our concierge reviews the session and arranges a free priority redo by a top-rated agent or issues a direct escrow refund."
              },
              {
                q: "How do you prevent fake portfolios before I book?",
                a: "Verified Portfolios Only: Stolen and filtered stock photos are permanently banned. Every beauty agent profile features authentic portfolio photos, recent live client video transformations, and audited reviews from real customers."
              },
              {
                q: "Are there vouchers, discounts, and promo codes for customers?",
                a: "Instant Savings: Yes. New customers receive a welcome discount at signup, and frequent customers unlock seasonal vouchers and loyalty credits applied directly at checkout with zero hidden doorstep surcharges."
              },
              {
                q: "Is customer payment safe if an agent does not show up?",
                a: "100% Escrow Protection: Your payment stays locked in secure escrow and is only released after you confirm the beauty agent arrived and completed the service. If an agent fails to show, you receive an immediate full refund."
              },
              {
                q: "Can I schedule early morning (e.g. 7:00 AM) bookings for weddings or shoots?",
                a: "Flexible Morning Scheduling: Yes. Early morning doorstep appointments can be scheduled in advance. Select your exact call-time during checkout, and your beauty agent arrives promptly with their full setup."
              },
              {
                q: "How and when do beauty agents withdraw their earnings?",
                a: "Same-Day Local Payouts: Once a customer confirms the job is completed, funds clear into your platform wallet. You can withdraw directly into any Nigerian commercial bank account with zero red tape."
              },
              {
                q: "Do beauty agents bring their own ring lights and extension cords?",
                a: "Fully Equipped Kits: Yes. Verified doorstep beauty agents travel with complete mobile kits, including ring lights, heavy-duty extension cables, and sanitized tools so you never have to provide equipment."
              },
              {
                q: "Can I book a beauty agent for home, office, or hotel doorstep visits?",
                a: "Full Doorstep Delivery: Yes. From hair styling, braiding, and barber cuts to nails, lashes, and makeup, beauty agents arrive directly at your home, office, or event venue with their complete professional toolkit."
              },
              {
                q: "How does transport and travel pricing work for doorstep visits?",
                a: "Upfront & Transparent: Transport fees are calculated upfront based on your location and included in the total checkout price. Beauty agents never demand extra fuel money or surprise gate fees when they arrive."
              },
              {
                q: "Can I book multiple beauty agents for bridal trains or group events?",
                a: "Group & Event Friendly: Yes. You can book multiple specialized agents for weddings, photoshoots, or family events, schedule coordinated arrival times, and manage all reservations under one dashboard."
              },
              {
                q: "How do you screen and verify beauty agents before they join?",
                a: "Strict 3-Tier Vetting: Every beauty agent must pass government ID verification, background credential checks, and a manual portfolio audit before their profile can accept customer bookings."
              }
            ].map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className={`p-5 sm:p-7 md:p-8 bg-brand-background/95 dark:bg-[#1A1A1A]/95 backdrop-blur-md rounded-2xl sm:rounded-3xl border transition-all cursor-pointer shadow-sm hover:shadow-md ${
                    isOpen
                      ? 'border-brand-interactive/50 dark:border-brand-interactive/40 shadow-brand-interactive/5'
                      : 'border-black/5 dark:border-white/5 hover:border-brand-interactive/20'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 select-none">
                    <span className="font-bold text-sm sm:text-base md:text-lg text-[#1A1A1A] dark:text-white leading-snug">
                      {faq.q}
                    </span>
                    <ChevronRight
                      className={`w-5 h-5 shrink-0 transition-transform duration-300 text-brand-interactive ${
                        isOpen ? 'rotate-90' : ''
                      }`}
                    />
                  </div>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="overflow-hidden"
                      >
                        <p className="pt-3 sm:pt-4 text-xs sm:text-sm md:text-base text-[#6C757D] dark:text-[#B0B0B0] leading-relaxed font-medium">
                          {faq.a.includes(':') ? (
                            <>
                              <strong className="text-[#1A1A1A] dark:text-white font-bold">{faq.a.split(':')[0]}:</strong>
                              {faq.a.slice(faq.a.indexOf(':') + 1)}
                            </>
                          ) : (
                            faq.a
                          )}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default GuestHome;

