'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Sparkles, Mail, Lock, ArrowRight, Chrome } from 'lucide-react';
import React from 'react';

export default function SignIn() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
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

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error || 'Invalid credentials');
        setIsLoading(false);
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/dashboard' });
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
      <div className="absolute top-[-10%] right-[-10%] w-[30rem] h-[30rem] rounded-full bg-[#C5A850]/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[30rem] h-[30rem] rounded-full bg-[#8C9C86]/5 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full bg-white border border-[#8C9C86]/10 p-8 rounded-3xl shadow-sm z-10"
      >
        <div className="text-center mb-8">
          <span className="text-[#8C9C86] font-mono tracking-[0.2em] text-xs uppercase font-medium">Welcome Back</span>
          <h2 className="text-3xl font-serif text-[#1A2530] mt-2 font-medium">Enter the Sanctuary</h2>
          <p className="mt-2 text-[#1A2530]/60 text-sm font-light">Align your daily focus and track your life areas</p>
        </div>

        {error && (
          <div className="bg-[#D89B91]/10 border border-[#D89B91]/30 text-[#C98A7F] text-xs px-4 py-3 rounded-xl mb-6 text-center font-light">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
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
                className="w-full pl-10 pr-4 py-3 bg-[#FAF9F5] border border-[#8C9C86]/10 rounded-xl text-sm focus:outline-none focus:border-[#8C9C86]/40 text-[#1A2530] transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-mono uppercase tracking-wider text-[#1A2530]/60 font-medium">Password</label>
            </div>
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
                className="w-full pl-10 pr-4 py-3 bg-[#FAF9F5] border border-[#8C9C86]/10 rounded-xl text-sm focus:outline-none focus:border-[#8C9C86]/40 text-[#1A2530] transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-[#8C9C86] hover:bg-[#7D8D78] disabled:bg-[#8C9C86]/50 text-white rounded-xl font-medium tracking-wide shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {isLoading ? 'Connecting...' : 'Sign In'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="relative flex py-4 items-center justify-center">
          <div className="flex-grow border-t border-[#8C9C86]/10"></div>
          <span className="flex-shrink mx-4 text-[#1A2530]/40 text-xs font-mono uppercase">or</span>
          <div className="flex-grow border-t border-[#8C9C86]/10"></div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          className="w-full py-3 border border-[#8C9C86]/15 hover:border-[#8C9C86]/35 text-[#1A2530] rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2.5 cursor-pointer bg-[#FAF9F5]/40"
        >
          <Chrome className="h-4 w-4 text-[#C5A850]" />
          Continue with Google
        </button>

        <p className="mt-8 text-center text-xs text-[#1A2530]/60 font-light">
          Don't have an account yet?{' '}
          <Link href="/auth/signup" className="text-[#8C9C86] hover:text-[#7D8D78] font-medium underline underline-offset-4 decoration-[#8C9C86]/30">
            Create an account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
