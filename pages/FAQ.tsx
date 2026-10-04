import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, HelpCircle, Sparkles, MessageCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const FAQ: React.FC = () => {
  const faqs = [
    {
      category: "For Customers",
      questions: [
        { q: 'How do you verify beauty specialists?', a: 'Every specialist undergoes rigorous identity validation, background credential review, and portfolio auditing prior to approval. We only accept the top 5% of applicants.' },
        { q: 'Is my booking payment secure?', a: 'Yes. Appointments are recorded with full transparency and verified against completed sessions. Payments are held securely in escrow until the service is successfully completed.' },
        { q: 'Can I reschedule an appointment?', a: 'Absolutely. You can seamlessly manage or reschedule appointments directly via your customer dashboard up to 12 hours before the scheduled time.' },
        { q: 'What happens if a professional is late?', a: 'Our agents operate under strict punctuality guidelines. You will receive a partial refund or discount if a verified delay occurs. We value your time above all else.' },
      ]
    },
    {
      category: "For Agents (Professionals)",
      questions: [
        { q: 'How do I get paid?', a: 'Payments are disbursed directly to your registered bank account within 24 hours of a successfully completed appointment. No hidden delays.' },
        { q: 'Can I set my own prices?', a: 'Absolutely. You are your own boss. You have full control over your service menu, custom pricing, and availability schedule.' },
        { q: 'Is there a fee to join?', a: 'Joining Everything Beauty is currently completely free. We only take a small platform commission when you successfully complete a booking.' },
      ]
    }
  ];

  const fadeInUp = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.7, ease: "easeOut" }
  };

  return (
    <div className="bg-white dark:bg-[#0D0D0D] min-h-screen relative overflow-hidden">
      
      {/* Background Decorative Blur */}
      <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-rosePink/10 to-transparent pointer-events-none" />
      <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-rosePink/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Hero Section */}
      <section className="pt-32 pb-16 sm:pt-40 sm:pb-24 px-4 sm:px-6 relative z-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <motion.div {...fadeInUp}>
            <div className="inline-flex items-center space-x-2 text-rosePink text-[10px] font-black uppercase tracking-[0.35em] mb-6 drop-shadow-[0_0_12px_rgba(255,51,102,0.6)]">
              <Sparkles className="w-4 h-4" />
              <span>Clarity & Transparency</span>
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-serif font-bold mb-6 text-[#1A1A1A] dark:text-white leading-tight">
              How can we <br className="hidden lg:block" /><span className="text-rosePink italic">help?</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-[#6C757D] dark:text-[#B0B0B0] font-light leading-relaxed max-w-lg">
              Everything you need to know about navigating the Everything Beauty marketplace safely and efficiently.
            </p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative hidden md:block"
          >
            <div className="absolute -inset-4 bg-rosePink/20 rounded-[3rem] blur-xl transform -rotate-6" />
            <img src="https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1974&auto=format&fit=crop" alt="Beauty Professional" className="relative w-full h-[500px] object-cover rounded-[3rem] shadow-2xl" />
          </motion.div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 relative z-10">
        <div className="space-y-20">
          {faqs.map((section, sIdx) => (
            <motion.div 
              key={sIdx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center space-x-4 mb-10">
                <div className="w-12 h-12 bg-[#F8F9FA] dark:bg-[#1A1A1A] rounded-2xl flex items-center justify-center border border-[#E9ECEF] dark:border-[#2D2D2D] shadow-sm">
                  <HelpCircle className="w-6 h-6 text-rosePink" />
                </div>
                <h2 className="text-3xl font-serif font-bold text-[#1A1A1A] dark:text-white">
                  {section.category}
                </h2>
              </div>
              
              <div className="space-y-6">
                {section.questions.map((faq, idx) => (
                  <motion.details
                    key={idx}
                    initial={{ opacity: 0, scale: 0.98 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    viewport={{ once: true }}
                    className="group bg-white dark:bg-[#1A1A1A] rounded-[2rem] border-2 border-[#E9ECEF] dark:border-[#2D2D2D] hover:border-rosePink/40 transition-all cursor-pointer shadow-lg hover:shadow-xl hover:-translate-y-1 overflow-hidden"
                  >
                    <summary className="flex justify-between items-center font-bold text-lg sm:text-xl list-none text-[#1A1A1A] dark:text-white p-6 sm:p-8 select-none">
                      <span className="pr-8">{faq.q}</span>
                      <div className="w-10 h-10 rounded-full bg-[#F8F9FA] dark:bg-[#252525] flex items-center justify-center flex-shrink-0 group-open:bg-rosePink group-open:text-white transition-colors">
                        <ChevronRight className="w-5 h-5 group-open:rotate-90 transition-transform" />
                      </div>
                    </summary>
                    <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-0">
                      <p className="text-base sm:text-lg text-[#6C757D] dark:text-[#B0B0B0] leading-relaxed border-t border-[#E9ECEF] dark:border-[#2D2D2D] pt-6">
                        {faq.a}
                      </p>
                    </div>
                  </motion.details>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Still Have Questions CTA */}
        <motion.div 
          {...fadeInUp}
          className="mt-32 p-8 sm:p-12 bg-rosePink text-white rounded-[3rem] text-center shadow-2xl shadow-rosePink/30 relative overflow-hidden group"
        >
          {/* Background Decorative Rings */}
          <div className="absolute -top-20 -right-20 w-64 h-64 border-[40px] border-white/10 rounded-full group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute -bottom-20 -left-20 w-48 h-48 border-[30px] border-white/10 rounded-full group-hover:scale-110 transition-transform duration-700" />
          
          <div className="relative z-10">
            <div className="w-20 h-20 bg-white text-rosePink rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl transform group-hover:-translate-y-2 transition-transform duration-500">
              <MessageCircle className="w-10 h-10" />
            </div>
            <h3 className="text-3xl sm:text-4xl font-serif font-black mb-4">Still have questions?</h3>
            <p className="text-white/80 text-lg mb-10 max-w-lg mx-auto">
              Our support team is available 24/7 to help you with any issues, inquiries, or feedback.
            </p>
            <Link 
              to="/contact" 
              className="inline-flex items-center justify-center space-x-3 bg-[#1A1A1A] hover:bg-black text-white px-8 py-5 rounded-2xl font-black text-lg transition-all transform hover:scale-105 shadow-xl"
            >
              <span>Contact Support</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default FAQ;
