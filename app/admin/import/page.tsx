'use client';

import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Anchor, ArrowLeft, Check, Compass, HelpCircle, Sparkles, Upload } from 'lucide-react';

export default function AdminImportPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [inputText, setInputText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<any | null>(null);

  const sampleIntake = `Name: Sarah Jenkins
Email: sarah.jenkins@example.com
Selected life areas: Faith / Spirituality, Fitness & Health, Pets, Finances, Habits I'm breaking

Faith practice: Journaling daily and morning prayers
Fitness goals: Yoga twice a week, 5k challenge target in mid-October
Companion details: Milo (Golden Retriever), vet checkup on Aug 15
Money plans: Trying to build an emergency savings buffer of 12000
Habits I'm letting go of: Reading on screen before bed, afternoon sugar`;

  const handleInsertSample = () => {
    setInputText(sampleIntake);
  };

  const handleImport = async () => {
    if (!inputText.trim()) {
      setError('Please paste raw intake text before initiating the import.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessResult(null);

    try {
      const response = await fetch('/api/admin/import-intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete the import.');
      }

      setSuccessResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred during import.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1. Loading state
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-sage border-t-transparent mx-auto"></div>
          <p className="mt-4 text-sage font-serif text-lg italic">Securing Admin access...</p>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated state
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-canvas flex flex-col items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[35rem] h-[35rem] rounded-full bg-sage-bg/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[35rem] h-[35rem] rounded-full bg-gold-bg/5 blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-white border border-border-soft rounded-[32px] p-8 text-center shadow-soft relative z-10 space-y-6">
          <div className="mx-auto h-12 w-12 bg-rose/10 text-rose rounded-full flex items-center justify-center">
            <Compass className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-serif text-navy font-bold">Admin Importer</h1>
            <p className="text-sm text-[#6E6A62]">
              You must sign in with your administrative credentials to seed and pre-populate Sanctuary workspaces.
            </p>
          </div>
          <button
            onClick={() => signIn(undefined, { callbackUrl: '/admin/import' })}
            className="w-full py-3 bg-sage-bg hover:bg-sage text-white rounded-full text-sm font-bold transition-all cursor-pointer shadow-sm"
          >
            Sign In with Credentials
          </button>
        </div>
      </div>
    );
  }

  // 3. Authenticated but not Liah
  const isAdmin = session?.user?.email?.toLowerCase() === 'aliahhemby@gmail.com';
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-canvas flex flex-col items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[35rem] h-[35rem] rounded-full bg-sage-bg/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[35rem] h-[35rem] rounded-full bg-gold-bg/5 blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-white border border-border-soft rounded-[32px] p-8 text-center shadow-soft relative z-10 space-y-6">
          <div className="mx-auto h-12 w-12 bg-rose/10 text-rose rounded-full flex items-center justify-center">
            <HelpCircle className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-serif text-navy font-bold">Access Denied</h1>
            <p className="text-sm text-[#6E6A62]">
              The admin import portal is reserved exclusively for <strong className="text-navy">Liah Hemby</strong>.
            </p>
            <p className="text-xs text-[#A19D94] italic mt-2">
              Currently logged in as: {session?.user?.email}
            </p>
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full py-2.5 bg-canvas hover:bg-[#F3EFE6] border border-border-soft text-navy rounded-full text-xs font-bold transition-all cursor-pointer"
            >
              Back to My Dashboard
            </button>
            <button
              onClick={() => signIn(undefined, { callbackUrl: '/admin/import' })}
              className="w-full py-2.5 bg-sage-bg hover:bg-sage text-white rounded-full text-xs font-bold transition-all cursor-pointer"
            >
              Sign In with Another Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Authorized Admin Workspace
  return (
    <div className="min-h-screen bg-canvas px-4 py-12 relative overflow-hidden flex flex-col items-center justify-start text-left">
      <div className="absolute top-[-10%] left-[-10%] w-[45rem] h-[45rem] rounded-full bg-sage-bg/3 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45rem] h-[45rem] rounded-full bg-gold-bg/3 blur-3xl pointer-events-none" />

      <div className="w-full max-w-4xl space-y-8 relative z-10">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-soft pb-6">
          <div className="space-y-1.5">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-1.5 text-xs text-sage font-mono font-bold hover:underline mb-2"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
            </button>
            <h1 className="text-3xl font-serif text-navy font-extrabold flex items-center gap-2">
              <Sparkles className="h-7 w-7 text-gold" />
              Sanctuary Intake Seeder
            </h1>
            <p className="text-xs text-[#6E6A62] font-mono uppercase tracking-wider">
              Liah's Admin Workspace
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs px-3 py-1 bg-white border border-border-soft rounded-full font-mono text-sage font-bold">
              ● Admin Active
            </span>
          </div>
        </div>

        {/* Importer Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border border-border-soft p-6 md:p-8 rounded-[32px] shadow-soft space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-xs font-mono uppercase text-[#6E6A62] tracking-wider font-bold">
                  Raw Intake Form Answers
                </label>
                <button
                  onClick={handleInsertSample}
                  className="text-[11px] text-sage hover:underline font-mono font-bold flex items-center gap-1"
                >
                  <Sparkles className="h-3 w-3 text-gold" /> Insert Sample Template
                </button>
              </div>

              <textarea
                rows={12}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste the unstructured intake answers here. Be sure to include Name, Email, and areas of focus..."
                className="w-full p-4 bg-canvas border border-border-soft rounded-2xl text-sm text-navy focus:outline-none focus:border-sage-bg/30 font-serif leading-relaxed"
              />

              {error && (
                <div className="p-4 bg-rose/5 border border-rose/20 rounded-xl text-xs text-rose font-mono">
                  Error: {error}
                </div>
              )}

              <button
                onClick={handleImport}
                disabled={isSubmitting}
                className={`w-full py-3.5 rounded-full text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isSubmitting
                    ? 'bg-sage-bg/60 text-white cursor-not-allowed'
                    : 'bg-sage-bg hover:bg-sage text-white shadow-md'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Synthesizing Intake Answers with AI...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" /> Seed Sanctuary Account
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-border-soft p-6 md:p-8 rounded-[32px] shadow-soft space-y-4">
              <h3 className="text-lg font-serif text-navy font-bold flex items-center gap-1.5">
                <Anchor className="h-5 w-5 text-gold" />
                How to use
              </h3>
              <p className="text-xs text-[#6E6A62] leading-relaxed font-serif">
                This utility uses the Gemini API to intelligently extract and structure intake details.
                It can parse fully unformatted emails, messages, or checklists and prefill details for any of the 19 Sanctuary life areas.
              </p>
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-sage-bg/10 text-sage text-xs font-bold flex items-center justify-center flex-shrink-0">1</span>
                  <p className="text-xs text-navy/80">
                    Paste the raw form response containing the user's name, email, and preferences.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-sage-bg/10 text-sage text-xs font-bold flex items-center justify-center flex-shrink-0">2</span>
                  <p className="text-xs text-navy/80">
                    Click <strong>Seed Sanctuary Account</strong>. The system will look up the account (or auto-create one with a default credentials pass).
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-sage-bg/10 text-sage text-xs font-bold flex items-center justify-center flex-shrink-0">3</span>
                  <p className="text-xs text-navy/80">
                    All free-text answers are mapped to custom, fully structured states in their respective life area widgets.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Presentation */}
        <AnimatePresence>
          {successResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white border border-border-soft p-6 md:p-8 rounded-[32px] shadow-soft space-y-6 text-left"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border-soft pb-4">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-mono text-sage font-bold uppercase">
                    <Check className="h-4 w-4 text-sage" />
                    Workspace Seed Successful
                  </div>
                  <h2 className="text-xl font-serif text-navy font-bold mt-1">
                    {successResult.user.name}'s Sanctuary Mapped
                  </h2>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-mono font-bold ${
                  successResult.user.isNewUser ? 'bg-rose-bg/15 text-rose' : 'bg-sage-bg/15 text-sage'
                }`}>
                  {successResult.user.isNewUser ? 'New Account Created' : 'Matched Existing Account'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-mono">
                <div>
                  <span className="text-[#A19D94] uppercase tracking-wider font-bold">Account Email</span>
                  <p className="text-navy text-sm font-serif font-bold mt-0.5">{successResult.user.email}</p>
                </div>
                <div>
                  <span className="text-[#A19D94] uppercase tracking-wider font-bold">Imported Focus Areas</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {successResult.dashboard.selected_areas.map((area: string) => (
                      <span key={area} className="px-2 py-0.5 bg-canvas border border-border-soft text-[10px] text-navy rounded-md font-sans">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-canvas border border-border-soft p-4 rounded-xl space-y-2">
                <span className="text-[10px] font-mono uppercase text-[#A19D94] block font-bold">
                  Dashboard Prefill Mapping Payload (JSON)
                </span>
                <pre className="text-[11px] font-mono text-[#6E6A62] bg-white p-3 rounded-lg border border-border-soft overflow-x-auto max-h-[300px]">
                  {JSON.stringify(successResult.dashboard.data, null, 2)}
                </pre>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
