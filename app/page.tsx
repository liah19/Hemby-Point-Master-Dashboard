'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Compass, Sparkles, Calendar, MessageSquare, ArrowRight } from 'lucide-react';
import React from 'react';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-sage border-t-transparent mx-auto"></div>
          <p className="mt-4 text-sage font-serif text-lg italic">Entering the Sanctuary...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-canvas px-4 py-12 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40rem] h-[40rem] rounded-full bg-sage-bg/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40rem] h-[40rem] rounded-full bg-rose-bg/5 blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="z-10 max-w-4xl w-full text-center"
      >
        <span className="text-sage font-mono tracking-[0.25em] text-xs uppercase font-bold">Welcome to</span>
        <h1 className="text-5xl md:text-7xl font-serif font-light text-navy mt-3 tracking-tight">
          Hemby Point <span className="italic font-serif font-normal text-gold">Sanctuary</span>
        </h1>
        <p className="mt-6 text-lg md:text-xl text-[#6E6A62] max-w-2xl mx-auto font-light leading-relaxed">
          A personal, grounding SaaS dashboard structured purely around your unique life goals. 
          Connect your calendar, align your focus areas, and rise with serene morning text briefings.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/auth/signup" className="w-full sm:w-auto">
            <span
              className="px-8 py-3.5 bg-sage-bg hover:bg-sage text-white rounded-full font-semibold tracking-wide shadow-sm hover:shadow transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              Begin Your Journey
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
          <Link href="/auth/signin" className="w-full sm:w-auto">
            <span
              className="px-8 py-3.5 bg-white border border-sage-bg/30 hover:border-sage-bg/60 text-navy rounded-full font-semibold tracking-wide shadow-sm hover:shadow transition-all duration-300 cursor-pointer block text-center"
            >
              Sign In
            </span>
          </Link>
        </div>

        {/* Feature Cards Grid (Bento style) */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
          <div className="bg-white rounded-[32px] border border-border-soft p-8 shadow-soft md:col-span-2">
            <div className="h-10 w-10 rounded-xl bg-gold-bg/15 flex items-center justify-center text-gold mb-4">
              <Compass className="h-5 w-5" />
            </div>
            <h3 className="serif text-xl font-bold text-navy">Dynamic Core Architecture</h3>
            <p className="mt-2 text-[#6E6A62] text-sm font-light leading-relaxed">
              No cookie-cutter dashboards. Choose your exact life areas from Faith & Spirituality to Finances and Pets. 
              The sanctuary dynamically reshapes its tabs and trackers specifically for you.
            </p>
          </div>

          <div className="bg-white rounded-[32px] border border-border-soft p-8 shadow-soft md:col-span-2">
            <div className="h-10 w-10 rounded-xl bg-sage-bg/15 flex items-center justify-center text-sage mb-4">
              <MessageSquare className="h-5 w-5" />
            </div>
            <h3 className="serif text-xl font-bold text-navy">Serene Morning Briefings</h3>
            <p className="mt-2 text-[#6E6A62] text-sm font-light leading-relaxed">
              Opt-in to personalized morning text briefings. Receive your active tracker updates, daily tasks, 
              and Google Calendar schedule as a warm, grounding text sent directly to your phone.
            </p>
          </div>

          <div className="bg-white rounded-[32px] border border-border-soft p-8 shadow-soft md:col-span-2">
            <div className="h-10 w-10 rounded-xl bg-rose-bg/15 flex items-center justify-center text-rose mb-4">
              <Calendar className="h-5 w-5" />
            </div>
            <h3 className="serif text-xl font-bold text-navy">Google Calendar Connection</h3>
            <p className="mt-2 text-[#6E6A62] text-sm font-light leading-relaxed">
              Securely authenticate your Google Calendar. Store your tokens scoped specifically to your 
              account so your morning agenda works perfectly, even when you're completely offline.
            </p>
          </div>

          <div className="bg-white rounded-[32px] border border-border-soft p-8 shadow-soft md:col-span-2">
            <div className="h-10 w-10 rounded-xl bg-sage-bg/15 flex items-center justify-center text-sage mb-4">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="serif text-xl font-bold text-navy">Beautifully Tailored Design</h3>
            <p className="mt-2 text-[#6E6A62] text-sm font-light leading-relaxed">
              Immerse yourself in a grounding aesthetic. Generous negative space, gorgeous cream and charcoal, 
              paired with soft gold, sage, and dusty rose indicators designed to bring focus and calm.
            </p>
          </div>
        </div>

        <footer className="mt-20 text-xs text-[#A19D94] font-mono tracking-[0.3em] uppercase">
          Rooted in Purpose • Hemby Point Sanctuary
        </footer>
      </motion.div>
    </div>
  );
}
