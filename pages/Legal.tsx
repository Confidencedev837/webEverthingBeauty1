
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, FileText, ChevronRight, CheckCircle2 } from 'lucide-react';
// Fixed: Added Link to the imports from react-router-dom
import { useLocation, Link } from 'react-router-dom';

const Legal: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  const getContent = () => {
    if (pathname.includes('privacy')) {
      return {
        title: 'Privacy Policy',
        icon: <Lock className="w-12 h-12 text-rosePink" />,
        sections: [
          { subtitle: "Information Collection", text: "We collect personal identification information including name, email address, phone number, and precise geolocation. This data is essential for connecting you with beauty professionals in your area and processing secure transactions." },
          { subtitle: "Data Usage", text: "Your data is used to personalize your experience, process bookings, send appointment reminders, and improve our platform security. We employ advanced encryption to ensure your data remains confidential." },
          { subtitle: "Third-Party Sharing", text: "We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties. This does not include trusted partners who assist us in operating our website and conducting our business, so long as those parties agree to keep this information confidential." }
        ]
      };
    }
    if (pathname.includes('terms')) {
      return {
        title: 'Terms of Service',
        icon: <FileText className="w-12 h-12 text-rosePink" />,
        sections: [
          { subtitle: "Agreement to Terms", text: "By using the Everything Beauty platform, you agree to abide by these Terms of Service. If you do not agree, please do not use our services. We reserve the right to modify these terms at any time." },
          { subtitle: "The Marketplace Model", text: "Everything Beauty operates as a marketplace connecting customers with independent beauty professionals. While we vet all agents, the specific contract for beauty services is strictly between the customer and the professional agent." },
          { subtitle: "Cancellations & Refunds", text: "Cancellations must be made at least 24 hours prior to the scheduled service to qualify for a full refund. Late cancellations may be subject to a 25% convenience fee to compensate the agent for travel and preparation." }
        ]
      };
    }
    return {
      title: 'Partner Agreement',
      icon: <Shield className="w-12 h-12 text-rosePink" />,
      sections: [
        { subtitle: "Professional Standards", text: "As an Everything Beauty Partner, you represent that you are a qualified professional holding all necessary licenses and insurance required by local laws. You agree to provide services with the highest level of professionalism and hygiene." },
        { subtitle: "Platform Fees", text: "Our platform provides marketing, scheduling, and secure payment processing. In exchange, Everything Beauty retains a standard service commission from each successful booking. Commission rates are disclosed upon successful vetting." },
        { subtitle: "Independent Contractor Status", text: "Partners are independent contractors and not employees of Everything Beauty. You are responsible for your own taxes, business expenses, and equipment maintenance." }
      ]
    };
  };

  const data = getContent();

  return (
    <div className="pt-32 pb-24 bg-[#F8F9FA] dark:bg-[#0D0D0D] min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-[#1A1A1A] rounded-[4rem] p-12 md:p-24 shadow-2xl border border-[#E9ECEF] dark:border-rosePink/20"
        >
          <div className="mb-16 flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-10">
            <div className="p-6 bg-blushPink dark:bg-rosePink/10 rounded-[2rem] shadow-lg shadow-rosePink/20">
              {data.icon}
            </div>
            <div>
              <h1 className="text-5xl md:text-7xl font-serif font-bold mb-4">{data.title}</h1>
              <p className="text-xl text-[#6C757D] dark:text-[#B0B0B0]">Everything Beauty Legal Department | {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
          
          <div className="space-y-16 max-w-3xl">
             {data.sections.map((sec, i) => (
               <motion.div 
                 key={i} 
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: i * 0.1 }}
                 className="group"
               >
                 <div className="flex items-center space-x-4 mb-6">
                    <CheckCircle2 className="text-rosePink w-6 h-6" />
                    <h2 className="text-2xl font-serif font-bold">{sec.subtitle}</h2>
                 </div>
                 <p className="text-xl text-[#6C757D] dark:text-[#B0B0B0] leading-relaxed">
                   {sec.text}
                 </p>
               </motion.div>
             ))}
          </div>

          <div className="mt-24 p-10 bg-[#F8F9FA] dark:bg-[#0D0D0D] rounded-[3rem] border-2 border-dashed border-rosePink/30 text-center">
             <h4 className="text-xl font-bold mb-4">Have questions about these terms?</h4>
             <p className="text-[#6C757D] mb-8">Our legal and support teams are available to clarify any points of our agreement.</p>
             <Link to="/contact" className="inline-flex items-center text-rosePink font-bold text-lg group">
                Contact Legal Support <ChevronRight className="ml-2 group-hover:translate-x-2 transition-transform" />
             </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Legal;
