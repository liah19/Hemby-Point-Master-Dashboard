'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Sparkles, User, Mail, Lock, Phone, Clock, ArrowRight, Check } from 'lucide-react';
import React from 'react';

export default function SignUp() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [briefingOptIn, setBriefingOptIn] = useState(false);
  const [briefingTime, setBriefingTime] = useState('07:00');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          name,
          phone,
          briefingOptIn,
          briefingTime,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to register account');
        setIsLoading(false);
      } else {
        setSuccess('Account created successfully! Redirecting to login...');
        setTimeout(() => {
          router.push('/auth/signin?registered=true');
        }, 1500);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF9F5]">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#8C9C86] border-t-transparent mx-auto"></div>
          <p className="mt-4 text-[#8C9C86] font-serif text-lg italic">Aligning with Sanctuary...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF9F5] px-4 py-12 relative overflow-hidden">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-[-10%] right-[-10%] w-[30rem] h-[30rem] rounded-full bg-[#A2B59D]/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[30rem] h-[30rem] rounded-full bg-[#D89B91]/5 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-lg w-full bg-white border border-[#8C9C86]/10 p-8 rounded-3xl shadow-sm z-10"
      >
        <div className="text-center mb-8">
          <span className="text-[#8C9C86] font-mono tracking-[0.2em] text-xs uppercase font-medium">Create Account</span>
          <h2 className="text-3xl font-serif text-[#1A2530] mt-2 font-medium">Join the Sanctuary</h2>
          <p className="mt-2 text-[#1A2530]/60 text-sm font-light">Enter your details to construct your personalized dashboard</p>
        </div>

        {error && (
          <div className="bg-[#D89B91]/10 border border-[#D89B91]/30 text-[#C98A7F] text-xs px-4 py-3 rounded-xl mb-6 text-center font-light">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-[#8C9C86]/10 border border-[#8C9C86]/30 text-[#8C9C86] text-xs px-4 py-3 rounded-xl mb-6 text-center font-light flex items-center justify-center gap-2">
            <Check className="h-4 w-4" />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#1A2530]/60 mb-2 font-medium">Your Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#1A2530]/30">
                  <User className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Aliah Hemby"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FAF9F5] border border-[#8C9C86]/10 rounded-xl text-sm focus:outline-none focus:border-[#8C9C86]/40 text-[#1A2530] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#1A2530]/60 mb-2 font-medium">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#1A2530]/30">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FAF9F5] border border-[#8C9C86]/10 rounded-xl text-sm focus:outline-none focus:border-[#8C9C86]/40 text-[#1A2530] transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#1A2530]/60 mb-2 font-medium">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#1A2530]/30">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FAF9F5] border border-[#8C9C86]/10 rounded-xl text-sm focus:outline-none focus:border-[#8C9C86]/40 text-[#1A2530] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#1A2530]/60 mb-2 font-medium">Phone Number</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#1A2530]/30">
                  <Phone className="h-4 w-4" />
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+15017122661"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FAF9F5] border border-[#8C9C86]/10 rounded-xl text-sm focus:outline-none focus:border-[#8C9C86]/40 text-[#1A2530] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Morning briefing options */}
          <div className="bg-[#FAF9F5] p-5 rounded-2xl border border-[#8C9C86]/10 space-y-4">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="briefing"
                checked={briefingOptIn}
                onChange={(e) => setBriefingOptIn(e.target.checked)}
                className="mt-1 h-4 w-4 text-[#8C9C86] border-[#8C9C86]/20 rounded focus:ring-[#8C9C86]/30 cursor-pointer accent-[#8C9C86]"
              />
              <div className="text-left">
                <label htmlFor="briefing" className="text-sm font-medium text-[#1A2530] cursor-pointer">
                  Opt-in to Morning Text Briefings
                </label>
                <p className="text-xs text-[#1A2530]/50 font-light mt-0.5">
                  Receive a peaceful, custom text briefing summarizing your daily agenda and goals.
                </p>
              </div>
            </div>

            {briefingOptIn && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#8C9C86]/5"
              >
                <div>
                  <label className="block text-xs font-mono uppercase text-[#1A2530]/50 mb-1.5">Briefing Time</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#1A2530]/30">
                      <Clock className="h-3.5 w-3.5" />
                    </span>
                    <input
                      type="time"
                      value={briefingTime}
                      onChange={(e) => setBriefingTime(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-white border border-[#8C9C86]/10 rounded-lg text-xs text-[#1A2530]"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-[#8C9C86] hover:bg-[#7D8D78] disabled:bg-[#8C9C86]/50 text-white rounded-xl font-medium tracking-wide shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer pt-3"
          >
            {isLoading ? 'Creating Sanctuary Account...' : 'Sign Up'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-[#1A2530]/60 font-light">
          Already have an account?{' '}
          <Link href="/auth/signin" className="text-[#8C9C86] hover:text-[#7D8D78] font-medium underline underline-offset-4 decoration-[#8C9C86]/30">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
