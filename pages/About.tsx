
import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Target, Lightbulb, Star, Zap, Users, ArrowRight, Heart, Sparkles, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const About: React.FC = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  return (
    <div className="pt-16 sm:pt-20 md:pt-24 bg-white dark:bg-[#0D0D0D]">
      {/* Hero */}
      <section className="relative min-h-[60vh] sm:h-[55vh] md:h-[60vh] flex items-center justify-center text-center overflow-hidden py-12 sm:py-0">
        <div className="absolute inset-0 z-0 scale-110">
          <img src="https://picsum.photos/seed/founders/1920/1080" className="w-full h-full object-cover blur-sm opacity-40" alt="" />
          <div className="absolute inset-0 bg-gradient-to-b from-white dark:from-[#0D0D0D] via-transparent to-white dark:to-[#0D0D0D]" />
        </div>
        <div className="relative z-10 max-w-4xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block px-6 py-2 bg-blushPink dark:bg-rosePink/10 text-rosePink rounded-full text-xs font-bold uppercase tracking-widest mb-4 sm:mb-6"
          >
            Our Journey
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl font-serif font-bold mb-4 sm:mb-6 md:mb-8 leading-tight"
          >
            Redefining Beauty <br /> Services, <span className="text-rosePink italic">Together</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-[#6C757D] dark:text-[#B0B0B0] font-light leading-relaxed max-w-2xl mx-auto"
          >
            Founded in 2023 by two visionary brothers, Everything Beauty is Nigeria's premier platform for professional on-demand beauty services.
          </motion.p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-12 sm:py-16 md:py-24 bg-[#F8F9FA] dark:bg-[#1A1A1A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 lg:gap-20 items-center">
            <motion.div {...fadeInUp} className="relative">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-rosePink/10 rounded-full blur-3xl animate-pulse hidden sm:block" />
              <img src="https://picsum.photos/seed/story/800/800" className="relative rounded-2xl sm:rounded-3xl md:rounded-[3rem] shadow-xl sm:shadow-2xl z-10" alt="Founder team" />
            </motion.div>
            <div>
              <motion.h2 {...fadeInUp} className="text-4xl md:text-5xl font-serif font-bold mb-8">Our Story</motion.h2>
              <div className="space-y-6 text-lg text-[#6C757D] dark:text-[#B0B0B0] leading-relaxed">
                <motion.p {...fadeInUp} transition={{ delay: 0.1 }}>
                  Everything Beauty was born from a simple observation: the incredible talent of local beauty professionals was often inaccessible to customers who needed high-quality services at home.
                </motion.p>
                <motion.p {...fadeInUp} transition={{ delay: 0.2 }}>
                  Two brothers identified this gap and decided to build a bridge. They envisioned a world where trust, transparency, and convenience define the beauty industry.
                </motion.p>
                <motion.p {...fadeInUp} transition={{ delay: 0.3 }}>
                  Today, we are more than just a marketplace; we are a community empowering thousands of beauty agents to grow their businesses while providing customers with peace of mind and exceptional results.
                </motion.p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-12 sm:py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-12">
          <motion.div {...fadeInUp} className="p-6 sm:p-8 md:p-12 bg-white dark:bg-[#1A1A1A] rounded-2xl sm:rounded-3xl md:rounded-[3rem] border border-[#E9ECEF] dark:border-[#2D2D2D] shadow-lg sm:shadow-xl text-center">
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-blushPink dark:bg-rosePink/10 text-rosePink rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 md:mb-8">
              <Target className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" />
            </div>
            <h3 className="text-3xl font-serif font-bold mb-6">Our Mission</h3>
            <p className="text-[#6C757D] dark:text-[#B0B0B0] text-lg leading-relaxed">
              To revolutionize beauty service delivery through cutting-edge technology, community empowerment, and an unwavering commitment to trust.
            </p>
          </motion.div>
          <motion.div {...fadeInUp} transition={{ delay: 0.2 }} className="p-6 sm:p-8 md:p-12 bg-rosePink text-white rounded-2xl sm:rounded-3xl md:rounded-[3rem] shadow-lg sm:shadow-xl shadow-rosePink/20 text-center">
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/20 text-white rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 md:mb-8">
              <Lightbulb className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" />
            </div>
            <h3 className="text-3xl font-serif font-bold mb-6">Our Vision</h3>
            <p className="text-white/90 text-lg leading-relaxed">
              To create a future where premium beauty services are accessible to everyone, everywhere, at the touch of a button.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-12 sm:py-16 md:py-24 bg-[#F8F9FA] dark:bg-[#1A1A1A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-8 sm:mb-12 md:mb-16">
          <motion.h2 {...fadeInUp} className="text-4xl md:text-5xl font-serif font-bold mb-4">Our Core Values</motion.h2>
          <div className="w-24 h-1 bg-rosePink mx-auto mb-8 rounded-full" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {[
            { icon: <ShieldCheck />, title: 'Trust & Verification', desc: 'Rigorous vetting for every partner.' },
            { icon: <Zap />, title: 'Innovation', desc: 'Pushing boundaries in service delivery.' },
            { icon: <Star />, title: 'Excellence', desc: 'A focus on high-quality results.' },
            { icon: <Users />, title: 'Community', desc: 'Empowering local entrepreneurs.' },
            { icon: <Heart />, title: 'Inspiration', desc: 'Making beauty accessible and inspiring.' },
            { icon: <Sparkles />, title: 'Convenience', desc: 'Your home, your time, our priority.' }
          ].map((val, i) => (
            <motion.div
              key={i}
              {...fadeInUp}
              transition={{ delay: i * 0.1 }}
              className="p-6 sm:p-8 md:p-10 bg-white dark:bg-[#252525] rounded-xl sm:rounded-2xl md:rounded-[2rem] border border-transparent hover:border-rosePink/20 transition-all text-center group shadow-sm"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#F8F9FA] dark:bg-[#1A1A1A] text-rosePink rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 group-hover:bg-rosePink group-hover:text-white transition-all">
                {val.icon}
              </div>
              <h4 className="text-xl font-bold mb-2">{val.title}</h4>
              <p className="text-[#6C757D] dark:text-[#B0B0B0]">{val.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Coverage */}
      <section className="py-12 sm:py-16 md:py-24 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div {...fadeInUp} className="flex flex-col items-center">
            <MapPin className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-rosePink mb-4 sm:mb-6 md:mb-8" />
            <h2 className="text-4xl font-serif font-bold mb-6">Expanding Nationwide</h2>
            <p className="text-lg text-[#6C757D] dark:text-[#B0B0B0] leading-relaxed mb-12">
              Currently serving major hubs including Lagos, Abuja, and Port Harcourt. We are rapidly expanding to bring Everything Beauty to your doorstep, wherever you are in Nigeria.
            </p>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              <Link to="/auth" className="px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 bg-rosePink text-white rounded-full font-bold text-lg hover:bg-[#E57B8D] transition-all shadow-lg sm:shadow-xl shadow-rosePink/20">
                Join our Mission
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;
