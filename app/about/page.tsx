'use client';

import React from 'react';
import { RevealGroup, RevealItem } from '@/components/motion';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#FDFBFF] dark:bg-[#0A070D] text-[#1A1A1A] dark:text-white transition-colors duration-300">
      
      {/* ──────────────────────────────────────────────────────────────────────────
          SECTION 1: HERO
          Eyebrow label, large headline, short paragraph, three stat counters
          ────────────────────────────────────────────────────────────────────────── */}
      <section className="relative pt-24 pb-20 md:pt-36 md:pb-28 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <RevealGroup stagger={0.1} className="flex flex-col items-center text-center">
          
          {/* Eyebrow Label */}
          <RevealItem as="div">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold font-accent tracking-widest uppercase bg-[#6C35A6]/10 text-[#6C35A6] dark:bg-[#A78BCE]/15 dark:text-[#A78BCE] border border-[#6C35A6]/20 mb-6">
              Empowering On-Demand Excellence
            </span>
          </RevealItem>

          {/* Large Headline */}
          <RevealItem as="h1" className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight leading-[1.08] max-w-4xl text-[#1A102F] dark:text-white mb-6">
            Redefining beauty services with modern engineering.
          </RevealItem>

          {/* Short Paragraph */}
          <RevealItem as="p" className="font-body text-base sm:text-lg md:text-xl text-[#6C757D] dark:text-[#A0A0A0] max-w-2xl leading-relaxed mb-12">
            We bridge the gap between verified independent beauty professionals and clients who demand salon-grade artistry delivered directly to their doorstep.
          </RevealItem>

          {/* Three Stat Counters */}
          <RevealItem as="div" className="w-full max-w-3xl pt-4">
            <RevealGroup stagger={0.08} className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 p-6 sm:p-8 rounded-3xl bg-white/70 dark:bg-[#14101A]/80 backdrop-blur-xl border border-[#E9ECEF] dark:border-[#261E33] shadow-xl shadow-[#6C35A6]/5">
              
              <RevealItem as="div" className="text-center">
                <div className="font-accent font-bold text-3xl sm:text-4xl lg:text-5xl text-[#6C35A6] dark:text-[#A78BCE] mb-1">
                  12,000+
                </div>
                <div className="font-body text-xs sm:text-sm font-medium text-[#6C757D] dark:text-[#9A9A9A]">
                  Verified Bookings
                </div>
              </RevealItem>

              <RevealItem as="div" className="text-center sm:border-x sm:border-[#E9ECEF] sm:dark:border-[#261E33]">
                <div className="font-accent font-bold text-3xl sm:text-4xl lg:text-5xl text-[#6C35A6] dark:text-[#A78BCE] mb-1">
                  4.95 / 5
                </div>
                <div className="font-body text-xs sm:text-sm font-medium text-[#6C757D] dark:text-[#9A9A9A]">
                  Client Satisfaction
                </div>
              </RevealItem>

              <RevealItem as="div" className="text-center">
                <div className="font-accent font-bold text-3xl sm:text-4xl lg:text-5xl text-[#6C35A6] dark:text-[#A78BCE] mb-1">
                  &lt; 60s
                </div>
                <div className="font-body text-xs sm:text-sm font-medium text-[#6C757D] dark:text-[#9A9A9A]">
                  Average Booking Speed
                </div>
              </RevealItem>

            </RevealGroup>
          </RevealItem>

        </RevealGroup>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          SECTION 2: WHAT WE'RE BUILDING
          4-card grid with staggered reveals
          ────────────────────────────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-[#E9ECEF]/70 dark:border-[#20172B]">
        <RevealGroup stagger={0.1} className="mb-12 md:mb-16 text-center max-w-2xl mx-auto">
          <RevealItem as="span" className="font-accent text-xs font-semibold uppercase tracking-widest text-[#6C35A6] dark:text-[#A78BCE] mb-3 inline-block">
            Our Architecture
          </RevealItem>
          <RevealItem as="h2" className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-tight text-[#1A102F] dark:text-white mb-4">
            What we&apos;re building
          </RevealItem>
          <RevealItem as="p" className="font-body text-sm sm:text-base text-[#6C757D] dark:text-[#A0A0A0]">
            Four pillars powering our high-trust, on-demand marketplace infrastructure.
          </RevealItem>
        </RevealGroup>

        {/* 4-Card Grid with 0.08s Stagger */}
        <RevealGroup stagger={0.08} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <RevealItem as="article" className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#14101A] border border-[#E9ECEF] dark:border-[#261E33] shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#6C35A6]/10 text-[#6C35A6] dark:bg-[#A78BCE]/20 dark:text-[#A78BCE] flex items-center justify-center font-accent font-bold text-lg mb-6 group-hover:scale-110 transition-transform">
                01
              </div>
              <h3 className="font-display font-bold text-xl text-[#1A102F] dark:text-white mb-2">
                Instant Smart Dispatch
              </h3>
              <p className="font-body text-sm text-[#6C757D] dark:text-[#9A9A9A] leading-relaxed">
                Autonomous calendar routing matching verified stylists with nearby clients based on service radius and real-time availability.
              </p>
            </div>
            <div className="pt-6 font-accent text-xs font-semibold text-[#6C35A6] dark:text-[#A78BCE]">
              Zero Scheduling Lag →
            </div>
          </RevealItem>

          <RevealItem as="article" className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#14101A] border border-[#E9ECEF] dark:border-[#261E33] shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#6C35A6]/10 text-[#6C35A6] dark:bg-[#A78BCE]/20 dark:text-[#A78BCE] flex items-center justify-center font-accent font-bold text-lg mb-6 group-hover:scale-110 transition-transform">
                02
              </div>
              <h3 className="font-display font-bold text-xl text-[#1A102F] dark:text-white mb-2">
                Biometric Credentialing
              </h3>
              <p className="font-body text-sm text-[#6C757D] dark:text-[#9A9A9A] leading-relaxed">
                Multi-tier identity authentication, background checks, and portfolio audits ensuring only top-tier professionals enter client homes.
              </p>
            </div>
            <div className="pt-6 font-accent text-xs font-semibold text-[#6C35A6] dark:text-[#A78BCE]">
              100% Vetted Artists →
            </div>
          </RevealItem>

          <RevealItem as="article" className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#14101A] border border-[#E9ECEF] dark:border-[#261E33] shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#6C35A6]/10 text-[#6C35A6] dark:bg-[#A78BCE]/20 dark:text-[#A78BCE] flex items-center justify-center font-accent font-bold text-lg mb-6 group-hover:scale-110 transition-transform">
                03
              </div>
              <h3 className="font-display font-bold text-xl text-[#1A102F] dark:text-white mb-2">
                Escrow Settlement
              </h3>
              <p className="font-body text-sm text-[#6C757D] dark:text-[#9A9A9A] leading-relaxed">
                Funds are protected in bonded escrow and released only after appointment completion, eliminating payment disputes and cancellations.
              </p>
            </div>
            <div className="pt-6 font-accent text-xs font-semibold text-[#6C35A6] dark:text-[#A78BCE]">
              Bonded Protection →
            </div>
          </RevealItem>

          <RevealItem as="article" className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#14101A] border border-[#E9ECEF] dark:border-[#261E33] shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#6C35A6]/10 text-[#6C35A6] dark:bg-[#A78BCE]/20 dark:text-[#A78BCE] flex items-center justify-center font-accent font-bold text-lg mb-6 group-hover:scale-110 transition-transform">
                04
              </div>
              <h3 className="font-display font-bold text-xl text-[#1A102F] dark:text-white mb-2">
                Agent Business Suite
              </h3>
              <p className="font-body text-sm text-[#6C757D] dark:text-[#9A9A9A] leading-relaxed">
                Turnkey SaaS portal with live analytics, emergency off-duty switches, custom service tiering, and direct clientele messaging.
              </p>
            </div>
            <div className="pt-6 font-accent text-xs font-semibold text-[#6C35A6] dark:text-[#A78BCE]">
              Full Financial Control →
            </div>
          </RevealItem>

        </RevealGroup>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          SECTION 3: WHY US
          4 numbered points & two-column comparison (us vs alternative)
          ────────────────────────────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-[#E9ECEF]/70 dark:border-[#20172B]">
        
        {/* Header */}
        <RevealGroup stagger={0.1} className="mb-14 md:mb-20 text-center max-w-3xl mx-auto">
          <RevealItem as="span" className="font-accent text-xs font-semibold uppercase tracking-widest text-[#6C35A6] dark:text-[#A78BCE] mb-3 inline-block">
            Competitive Edge
          </RevealItem>
          <RevealItem as="h2" className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-tight text-[#1A102F] dark:text-white mb-4">
            Why leading clients and artists choose us
          </RevealItem>
          <RevealItem as="p" className="font-body text-sm sm:text-base text-[#6C757D] dark:text-[#A0A0A0]">
            A purpose-built infrastructure replacing fragmented DMs, unpredictable salon wait times, and untracked cash transactions.
          </RevealItem>
        </RevealGroup>

        {/* 4 Numbered Points */}
        <RevealGroup stagger={0.1} className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          
          <RevealItem as="div" className="flex items-start gap-5 p-6 rounded-3xl bg-white dark:bg-[#14101A] border border-[#E9ECEF] dark:border-[#261E33]">
            <span className="font-accent font-extrabold text-2xl text-[#6C35A6] dark:text-[#A78BCE] bg-[#6C35A6]/10 dark:bg-[#A78BCE]/15 w-12 h-12 rounded-2xl flex items-center justify-center shrink-0">
              1
            </span>
            <div>
              <h4 className="font-display font-bold text-lg text-[#1A102F] dark:text-white mb-1.5">
                Zero Salon Wait Times
              </h4>
              <p className="font-body text-sm text-[#6C757D] dark:text-[#9A9A9A] leading-relaxed">
                Save 2 to 3 hours every appointment. Certified beauty specialists arrive directly at your home or suite fully equipped.
              </p>
            </div>
          </RevealItem>

          <RevealItem as="div" className="flex items-start gap-5 p-6 rounded-3xl bg-white dark:bg-[#14101A] border border-[#E9ECEF] dark:border-[#261E33]">
            <span className="font-accent font-extrabold text-2xl text-[#6C35A6] dark:text-[#A78BCE] bg-[#6C35A6]/10 dark:bg-[#A78BCE]/15 w-12 h-12 rounded-2xl flex items-center justify-center shrink-0">
              2
            </span>
            <div>
              <h4 className="font-display font-bold text-lg text-[#1A102F] dark:text-white mb-1.5">
                Guaranteed Verified Skills
              </h4>
              <p className="font-body text-sm text-[#6C757D] dark:text-[#9A9A9A] leading-relaxed">
                Every specialist must submit video demonstrations and pass identity validation before publishing a single service on the platform.
              </p>
            </div>
          </RevealItem>

          <RevealItem as="div" className="flex items-start gap-5 p-6 rounded-3xl bg-white dark:bg-[#14101A] border border-[#E9ECEF] dark:border-[#261E33]">
            <span className="font-accent font-extrabold text-2xl text-[#6C35A6] dark:text-[#A78BCE] bg-[#6C35A6]/10 dark:bg-[#A78BCE]/15 w-12 h-12 rounded-2xl flex items-center justify-center shrink-0">
              3
            </span>
            <div>
              <h4 className="font-display font-bold text-lg text-[#1A102F] dark:text-white mb-1.5">
                Direct In-App Security Audit
              </h4>
              <p className="font-body text-sm text-[#6C757D] dark:text-[#9A9A9A] leading-relaxed">
                Full end-to-end audit logging for communications, price protections, and automated customer support resolutions.
              </p>
            </div>
          </RevealItem>

          <RevealItem as="div" className="flex items-start gap-5 p-6 rounded-3xl bg-white dark:bg-[#14101A] border border-[#E9ECEF] dark:border-[#261E33]">
            <span className="font-accent font-extrabold text-2xl text-[#6C35A6] dark:text-[#A78BCE] bg-[#6C35A6]/10 dark:bg-[#A78BCE]/15 w-12 h-12 rounded-2xl flex items-center justify-center shrink-0">
              4
            </span>
            <div>
              <h4 className="font-display font-bold text-lg text-[#1A102F] dark:text-white mb-1.5">
                Upfront Fixed Pricing
              </h4>
              <p className="font-body text-sm text-[#6C757D] dark:text-[#9A9A9A] leading-relaxed">
                No surprise add-on charges or cash negotiations at arrival. Everything is agreed and locked in before booking confirmation.
              </p>
            </div>
          </RevealItem>

        </RevealGroup>

        {/* Two-Column Comparison (Us vs Alternative) */}
        <RevealGroup stagger={0.1} className="rounded-3xl border border-[#E9ECEF] dark:border-[#261E33] overflow-hidden bg-white dark:bg-[#14101A] shadow-xl">
          
          <RevealItem as="div" className="p-6 sm:p-8 bg-[#6C35A6]/5 dark:bg-[#A78BCE]/5 border-b border-[#E9ECEF] dark:border-[#261E33] text-center">
            <h3 className="font-display font-bold text-2xl text-[#1A102F] dark:text-white mb-1">
              The Platform Comparison
            </h3>
            <p className="font-body text-sm text-[#6C757D] dark:text-[#A0A0A0]">
              How our on-demand model compares to conventional walk-in salons and manual DM bookings.
            </p>
          </RevealItem>

          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#E9ECEF] dark:divide-[#261E33]">
            
            {/* Column 1: Everything Beauty */}
            <div className="p-6 sm:p-8 space-y-4">
              <RevealItem as="div" className="flex items-center gap-2 font-display font-bold text-lg text-[#6C35A6] dark:text-[#A78BCE]">
                <span>✓</span>
                <span>Everything Beauty Platform</span>
              </RevealItem>
              <ul className="space-y-3 font-body text-sm text-[#4A4A4A] dark:text-[#CCCCCC]">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold shrink-0">✓</span>
                  <span>Doorstep convenience scheduled on your exact timeline</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold shrink-0">✓</span>
                  <span>100% ID-verified & portfolio-audited specialists</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold shrink-0">✓</span>
                  <span>Secure escrow payment release after satisfactory session</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold shrink-0">✓</span>
                  <span>Instant digital confirmation under 60 seconds</span>
                </li>
              </ul>
            </div>

            {/* Column 2: The Alternative */}
            <div className="p-6 sm:p-8 space-y-4 bg-gray-50/50 dark:bg-black/20">
              <RevealItem as="div" className="flex items-center gap-2 font-display font-bold text-lg text-[#6C757D]">
                <span>✕</span>
                <span>Traditional Salons & Manual DMs</span>
              </RevealItem>
              <ul className="space-y-3 font-body text-sm text-[#6C757D] dark:text-[#888888]">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold shrink-0">✕</span>
                  <span>Unpredictable salon wait times and crowded lobbies</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold shrink-0">✕</span>
                  <span>Unverified credentials and fake online portfolio pictures</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold shrink-0">✕</span>
                  <span>Upfront wire transfers with zero refund guarantees</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold shrink-0">✕</span>
                  <span>Endless back-and-forth messaging just to check basic pricing</span>
                </li>
              </ul>
            </div>

          </div>

        </RevealGroup>

      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          SECTION 4: CALL TO ACTION
          Headline, supportive copy, button row
          ────────────────────────────────────────────────────────────────────────── */}
      <section className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <RevealGroup stagger={0.1} className="p-8 sm:p-12 md:p-16 rounded-[2.5rem] md:rounded-[3.5rem] bg-gradient-to-br from-[#32104D] via-[#4A156B] to-[#6C35A6] text-white text-center shadow-2xl shadow-[#6C35A6]/20 relative overflow-hidden">
          
          <RevealItem as="span" className="font-accent text-xs font-semibold uppercase tracking-widest text-[#A78BCE] mb-4 inline-block">
            Start Today
          </RevealItem>

          <RevealItem as="h2" className="font-display font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight leading-tight max-w-2xl mx-auto mb-6">
            Ready for a superior beauty experience?
          </RevealItem>

          <RevealItem as="p" className="font-body text-base sm:text-lg text-white/80 max-w-xl mx-auto mb-10 leading-relaxed">
            Join thousands of satisfied clients who have made on-demand luxury their default beauty standard.
          </RevealItem>

          {/* Button Row */}
          <RevealItem as="div" className="flex flex-wrap items-center justify-center gap-4">
            <button className="px-8 py-4 rounded-2xl bg-white text-[#32104D] font-display font-bold text-base hover:bg-[#F3EDF8] active:scale-95 transition-all shadow-lg shadow-black/20 cursor-pointer">
              Book a Specialist Now
            </button>
            <button className="px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-display font-semibold text-base active:scale-95 transition-all backdrop-blur-sm cursor-pointer">
              Apply as a Certified Artist
            </button>
          </RevealItem>

        </RevealGroup>
      </section>

    </main>
  );
}

