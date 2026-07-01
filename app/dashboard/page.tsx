'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, Calendar, Clock, Phone, LogOut, Settings, Bell, 
  Sparkles, Check, ChevronRight, Menu, X, ArrowRight, ShieldCheck, HelpCircle
} from 'lucide-react';
import DailyTab from '../components/DailyTab';
import AreaWidget from '../components/AreaWidget';
import React from 'react';

// Declarations for Google Identity Services
declare global {
  interface Window {
    google?: any;
  }
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Dashboard state
  const [user, setUser] = useState<any>(null);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [dashboardData, setDashboardData] = useState<any>({});
  const [activeTab, setActiveTab] = useState<string>('Daily');
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Settings states
  const [phone, setPhone] = useState<string>('');
  const [briefingOptIn, setBriefingOptIn] = useState<boolean>(false);
  const [briefingTime, setBriefingTime] = useState<string>('07:00');
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Fetch Dashboard data
  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/dashboard');
      if (res.status === 401) {
        router.push('/auth/signin');
        return;
      }
      
      const data = await res.json();
      if (!data.dashboard || data.dashboard.selected_areas.length === 0) {
        // No dashboard selections -> redirect to onboarding!
        router.push('/onboarding');
        return; // isLoading intentionally stays true — we're navigating away
      }

      setUser(data.user);
      setSelectedAreas(data.dashboard.selected_areas);
      setDashboardData(data.dashboard.data || {});

      // Prefill settings form
      setPhone(data.user.phone || '');
      setBriefingOptIn(!!data.user.briefing_opt_in);
      setBriefingTime(data.user.briefing_time || '07:00');
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      fetchDashboard();
    }
  }, [status, router]);

  // Save Settings / Data changes
  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/dashboard/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedAreas,
          data: dashboardData,
          phone,
          briefingOptIn,
          briefingTime,
        })
      });

      if (res.ok) {
        setMessage({ text: 'Sanctuary details updated successfully.', type: 'success' });
        // Refresh local details
        fetchDashboard();
        setTimeout(() => setMessage(null), 3000);
      } else {
        const d = await res.json();
        setMessage({ text: d.error || 'Failed to save changes.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'An unexpected error occurred.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  // Update specific widget data
  const handleUpdateAreaWidget = async (area: string, updatedWidgetData: any) => {
    const updatedDashData = {
      ...dashboardData,
      [area]: updatedWidgetData
    };
    setDashboardData(updatedDashData);

    // Persist changes instantly in database
    try {
      await fetch('/api/dashboard/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedAreas,
          data: updatedDashData,
          phone,
          briefingOptIn,
          briefingTime,
        })
      });
    } catch (err) {
      console.error('Failed to autosave widget changes:', err);
    }
  };

  // Connect Google Calendar
  const handleConnectCalendar = async () => {
    // 1. Fetch Google Client ID
    const googleClientId = '612393304347-kodt7zoea7p7jken5rewcm.apps.googleusercontent.com'; // Injected for ease of Google Integration

    if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
      console.warn('[GOOGLE CALENDAR] GIS Script not loaded yet. Simulating connection.');
      // Simulate connection
      await handleSimulateCalendar();
      return;
    }

    try {
      const client = window.google.accounts.oauth2.initCodeClient({
        client_id: googleClientId,
        scope: 'https://www.googleapis.com/auth/calendar.readonly',
        ux_mode: 'popup',
        callback: async (response: any) => {
          if (response.code) {
            setIsSaving(true);
            try {
              const res = await fetch('/api/auth/google-calendar/callback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: response.code })
              });
              if (res.ok) {
                setMessage({ text: 'Google Calendar integrated successfully.', type: 'success' });
                fetchDashboard();
              } else {
                setMessage({ text: 'Failed to integrate Google Calendar.', type: 'error' });
              }
            } catch (err) {
              console.error(err);
            } finally {
              setIsSaving(false);
              setTimeout(() => setMessage(null), 3000);
            }
          }
        },
      });
      client.requestCode();
    } catch (err) {
      console.error('[GOOGLE CALENDAR] Error initializing code client:', err);
      await handleSimulateCalendar();
    }
  };

  const handleSimulateCalendar = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/auth/google-calendar/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: 'mock_code_123' })
      });
      if (res.ok) {
        setMessage({ text: 'Mock Google Calendar integrated successfully (Demo Mode).', type: 'success' });
        fetchDashboard();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // Clear Calendar integration
  const handleDisconnectCalendar = async () => {
    const updatedData = { ...dashboardData };
    delete updatedData.google_calendar_tokens;
    setDashboardData(updatedData);
    
    setIsSaving(true);
    try {
      await fetch('/api/dashboard/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedAreas,
          data: updatedData,
          phone,
          briefingOptIn,
          briefingTime,
        })
      });
      setMessage({ text: 'Google Calendar disconnected.', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  if (status === 'loading' || isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-sage border-t-transparent mx-auto"></div>
          <p className="mt-4 text-sage font-serif text-lg italic animate-pulse">Opening Sanctuary Doors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas flex flex-col selection:bg-sage/20">
      {/* Top Serene Header */}
      <header className="sticky top-0 z-20 bg-canvas/85 backdrop-blur-md border-b border-border-soft px-6 py-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <Compass className="h-6 w-6 text-sage" />
          <h1 className="text-2xl font-serif font-light text-navy tracking-tight">
            Hemby Point <span className="italic font-serif font-normal text-gold">Sanctuary</span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {session?.user?.email?.toLowerCase() === 'aliahhemby@gmail.com' && (
            <button
              onClick={() => router.push('/admin/import')}
              className="flex items-center gap-1.5 px-3 py-2 bg-gold-bg/15 hover:bg-gold-bg/25 border border-gold/30 text-navy rounded-full text-xs font-mono uppercase tracking-wider cursor-pointer transition-all"
              title="Admin Portal"
            >
              <Sparkles className="h-4 w-4 text-gold" />
              <span className="hidden sm:inline">Admin Seeder</span>
            </button>
          )}

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2.5 hover:bg-sage-bg/10 text-navy/75 hover:text-navy rounded-full transition-colors cursor-pointer"
            title="Sanctuary Settings"
          >
            <Settings className="h-5 w-5" />
          </button>
          
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-1.5 px-4 py-2 hover:bg-rose-bg/15 text-[#6E6A62] hover:text-rose rounded-full text-xs font-mono uppercase tracking-wider cursor-pointer transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Leave</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-grow max-w-7xl w-full mx-auto px-4 md:px-8 py-8 flex flex-col lg:flex-row gap-8">
        {/* Dynamic Sidebar Tabs */}
        <aside className="lg:w-64 flex-shrink-0 flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-2 pb-4 lg:pb-0 border-b lg:border-b-0 lg:border-r border-border-soft pr-0 lg:pr-6 whitespace-nowrap scrollbar-none scroll-smooth">
          {/* Default Daily Tab */}
          <button
            onClick={() => setActiveTab('Daily')}
            className={`px-5 py-3 rounded-full text-xs font-bold cursor-pointer transition-all flex items-center gap-2.5 ${
              activeTab === 'Daily'
                ? 'bg-sage-bg text-white shadow-soft font-bold'
                : 'bg-white/50 border border-border-soft text-[#6E6A62] hover:bg-white'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            Daily Focus
          </button>

          {/* User selected Life Areas */}
          {selectedAreas.map((area) => {
            const active = activeTab === area;
            return (
              <button
                key={area}
                onClick={() => setActiveTab(area)}
                className={`px-5 py-3 rounded-full text-xs font-bold cursor-pointer transition-all flex items-center gap-2.5 ${
                  active
                    ? 'bg-sage-bg text-white shadow-soft font-bold'
                    : 'bg-white/50 border border-border-soft text-[#6E6A62] hover:bg-white'
                }`}
              >
                <ChevronRight className={`h-3 w-3 transition-transform ${active ? 'rotate-90' : ''}`} />
                {area}
              </button>
            );
          })}
        </aside>

        {/* Workspace Display Area */}
        <main className="flex-grow">
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-2xl text-xs mb-6 text-center font-medium border ${
                message.type === 'success'
                  ? 'bg-sage-bg/10 border-sage/20 text-sage'
                  : 'bg-rose-bg/10 border-rose-bg/20 text-rose'
              }`}
            >
              {message.text}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'Daily' ? (
                <DailyTab
                  user={user}
                  selectedAreas={selectedAreas}
                  dashboardData={dashboardData}
                  onUpdateData={(newData) => handleUpdateAreaWidget('dailyTasks', newData)}
                  onConnectCalendar={handleConnectCalendar}
                />
              ) : (
                <AreaWidget
                  areaName={activeTab}
                  data={dashboardData[activeTab]}
                  onUpdate={(updatedData) => handleUpdateAreaWidget(activeTab, updatedData)}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Floating Settings Drawer */}
      <AnimatePresence>
        {showSettings && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="fixed inset-0 bg-black/25 backdrop-blur-xs z-30"
            />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 22 }}
              className="fixed right-0 top-0 bottom-0 max-w-md w-full bg-canvas border-l border-border-soft shadow-2xl p-8 z-40 overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-8 border-b border-border-soft pb-4">
                <h3 className="text-xl font-serif text-navy font-bold flex items-center gap-2">
                  <Settings className="h-5 w-5 text-sage" />
                  Sanctuary Settings
                </h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-1.5 hover:bg-gray-100 rounded-full cursor-pointer text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-6 text-left">
                {/* Google Calendar Control */}
                <div className="bg-white p-6 rounded-[24px] border border-border-soft shadow-soft space-y-4">
                  <h4 className="text-sm font-serif font-bold text-navy flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-gold" />
                    Google Calendar Settings
                  </h4>
                  {dashboardData.google_calendar_tokens ? (
                    <div className="space-y-3">
                      <p className="text-xs text-sage font-medium flex items-center gap-1">
                        <Check className="h-4 w-4" /> Integrated and active
                      </p>
                      <button
                        type="button"
                        onClick={handleDisconnectCalendar}
                        className="text-xs font-mono text-rose font-bold uppercase tracking-wider underline cursor-pointer"
                      >
                        Disconnect Calendar
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs text-[#A19D94] font-light">
                        Integrate your schedules directly into morning briefings. Works offline.
                      </p>
                      <button
                        type="button"
                        onClick={handleConnectCalendar}
                        className="w-full py-2.5 bg-white border border-gold/30 hover:border-gold text-navy rounded-xl text-xs font-bold cursor-pointer flex items-center justify-center gap-2"
                      >
                        Connect Google Calendar
                      </button>
                    </div>
                  )}
                </div>

                {/* Personal Morning Briefing (Free iOS Shortcut Integration) */}
                <div className="bg-white p-6 rounded-[24px] border border-border-soft shadow-soft space-y-4">
                  <h4 className="text-sm font-serif font-bold text-navy flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-gold" />
                    Personal Morning Briefing
                  </h4>

                  <p className="text-xs text-[#6E6A62] font-serif leading-relaxed">
                    Set up a completely free automated Morning Briefing on your mobile device (using Apple iOS Shortcuts on iPhone, Tasker on Android, or a standard cron webhook trigger) to call your personal endpoint and message the response directly to yourself. This avoids any Twilio usage or SMS costs.
                  </p>

                  <div className="bg-canvas border border-border-soft p-3.5 rounded-xl space-y-2">
                    <label className="block text-[10px] font-mono uppercase text-[#6E6A62] font-bold">Your Briefing Endpoint URL</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={user ? `${window.location.origin}/api/briefing/${user.id}` : ''}
                        className="w-full px-3 py-1.5 bg-white border border-border-soft rounded-lg text-xs font-mono text-sage focus:outline-none"
                        id="briefing-endpoint-url"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (user) {
                            navigator.clipboard.writeText(`${window.location.origin}/api/briefing/${user.id}`);
                            setMessage({ text: 'Copied briefing URL to clipboard!', type: 'success' });
                            setTimeout(() => setMessage(null), 3000);
                          }
                        }}
                        className="px-3 py-1.5 bg-sage-bg hover:bg-sage text-white rounded-lg text-xs font-mono uppercase tracking-wider font-bold cursor-pointer transition-all flex-shrink-0 animate-pulse"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  <p className="text-[10px] text-[#A19D94] font-light leading-normal">
                    This endpoint dynamically compiles your Faith practice, Fitness target, Calendar schedules, and other active focus areas into a serene, AI-curated morning summary.
                  </p>
                </div>

                <div className="pt-4 border-t border-border-soft">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full py-3 bg-sage-bg hover:bg-sage disabled:bg-sage-bg/50 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isSaving ? 'Aligning Changes...' : 'Save Sanctuary Settings'}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
