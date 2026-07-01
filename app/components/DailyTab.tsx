'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, Calendar, CheckSquare, MessageSquare, Plus, Check, Play,
  Anchor, Heart, PawPrint, TrendingUp, ShieldCheck, Smile, Settings, UserCheck
} from 'lucide-react';
import React from 'react';

interface DailyTabProps {
  user: any;
  selectedAreas: string[];
  dashboardData: any;
  onUpdateData: (newData: any) => void;
  onConnectCalendar: () => void;
}

export default function DailyTab({
  user,
  selectedAreas,
  dashboardData,
  onUpdateData,
  onConnectCalendar,
}: DailyTabProps) {
  const [briefing, setBriefing] = useState<string>('');
  const [isLoadingBriefing, setIsLoadingBriefing] = useState<boolean>(false);
  const [errorBriefing, setErrorBriefing] = useState<string>('');

  // Calendar events state
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState<boolean>(false);

  // Daily Quick Notes or custom tasks
  const [tasks, setTasks] = useState<string[]>(
    dashboardData.dailyTasks || ['Take a 10-minute quiet reflection', 'Review active life goals']
  );
  const [newTaskText, setNewTaskText] = useState<string>('');

  // Check if calendar is connected
  const isCalendarConnected = !!dashboardData.google_calendar_tokens;

  useEffect(() => {
    const fetchEvents = async () => {
      if (!isCalendarConnected) return;
      setIsLoadingEvents(true);
      try {
        const res = await fetch('/api/calendar/events');
        if (res.ok) {
          const data = await res.json();
          setCalendarEvents(data.events || []);
        }
      } catch (err) {
        console.error('Failed to fetch calendar events:', err);
      } finally {
        setIsLoadingEvents(false);
      }
    };

    fetchEvents();
  }, [user?.id, isCalendarConnected]);

  useEffect(() => {
    // Generate/fetch briefing from API
    const fetchBriefing = async () => {
      setIsLoadingBriefing(true);
      setErrorBriefing('');
      try {
        const res = await fetch(`/api/briefing/${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setBriefing(data.briefing);
        } else {
          setErrorBriefing('Failed to compile your morning sanctuary briefing.');
        }
      } catch (err) {
        setErrorBriefing('Error contacting briefing API.');
      } finally {
        setIsLoadingBriefing(false);
      }
    };

    if (user?.id) {
      fetchBriefing();
    }
  }, [user?.id, selectedAreas, dashboardData]);

  const handleAddTask = () => {
    if (!newTaskText.trim()) return;
    const updatedTasks = [...tasks, newTaskText.trim()];
    setTasks(updatedTasks);
    setNewTaskText('');
    onUpdateData({ ...dashboardData, dailyTasks: updatedTasks });
  };

  const handleToggleTask = (index: number) => {
    const updatedTasks = tasks.filter((_, i) => i !== index);
    setTasks(updatedTasks);
    onUpdateData({ ...dashboardData, dailyTasks: updatedTasks });
  };

  return (
    <div className="space-y-8">
      {/* Morning Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-border-soft p-8 rounded-[32px] shadow-soft relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-gold-bg/5 blur-xl pointer-events-none" />
        <div className="z-10 relative">
          <span className="text-sage font-mono tracking-[0.2em] text-xs uppercase font-bold">Daily sanctuary focus</span>
          <h2 className="text-3xl md:text-4xl font-serif text-navy mt-1 font-bold">
            Welcome back to your <span className="italic text-gold font-normal font-serif">Sanctuary</span>
          </h2>
          <p className="text-[#6E6A62] text-sm mt-2 font-light">
            Today is {new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}. Take a deep, intentional breath.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {isCalendarConnected ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-sage-bg/15 text-sage rounded-full text-xs font-bold border border-sage/20">
                <UserCheck className="h-3 w-3" />
                Google Calendar Integrated
              </span>
            ) : (
              <button
                onClick={onConnectCalendar}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold-bg/15 text-gold hover:bg-gold-bg/25 rounded-full text-xs font-bold border border-gold/20 cursor-pointer transition-colors"
              >
                <Calendar className="h-3 w-3" />
                Connect Google Calendar
              </button>
            )}

            {user.briefing_opt_in ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-bg/15 text-rose rounded-full text-xs font-bold border border-rose-bg/20">
                <MessageSquare className="h-3 w-3" />
                Morning SMS Opted-In ({user.briefing_time})
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-canvas text-[#A19D94] rounded-full text-xs font-bold border border-border-soft">
                Morning SMS Disabled
              </span>
            )}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Morning Text Briefing Section (Left/Center) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-border-soft p-6 md:p-8 rounded-[32px] shadow-soft space-y-4">
            <div className="flex justify-between items-center border-b border-border-soft pb-4">
              <h3 className="text-xl font-serif text-navy font-bold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-gold animate-spin-slow" />
                Your Morning Sanctuary Briefing
              </h3>
              <button
                onClick={async () => {
                  setIsLoadingBriefing(true);
                  try {
                    const res = await fetch(`/api/briefing/${user.id}`);
                    if (res.ok) {
                      const data = await res.json();
                      setBriefing(data.briefing);
                    }
                  } catch (e) {}
                  setIsLoadingBriefing(false);
                }}
                disabled={isLoadingBriefing}
                className="text-xs font-mono text-sage hover:text-sage-bg uppercase tracking-wider cursor-pointer underline font-bold"
              >
                {isLoadingBriefing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>

            {isLoadingBriefing ? (
              <div className="py-12 flex flex-col items-center justify-center text-sage">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-sage border-t-transparent mb-3"></div>
                <p className="font-serif italic text-sm">Whispering with your active focus areas...</p>
              </div>
            ) : errorBriefing ? (
              <p className="text-xs text-rose font-medium text-center py-6">{errorBriefing}</p>
            ) : (
              <div className="text-navy/80 text-sm font-light leading-relaxed whitespace-pre-wrap select-text selection:bg-sage/20 bg-canvas p-6 rounded-2xl border border-border-soft max-h-[450px] overflow-y-auto">
                {briefing}
              </div>
            )}
          </div>

          {/* Google Calendar Agenda Widget */}
          {isCalendarConnected && (
            <div className="bg-white border border-border-soft p-6 md:p-8 rounded-[32px] shadow-soft space-y-4">
              <div className="flex justify-between items-center border-b border-border-soft pb-4">
                <h3 className="text-lg font-serif text-navy font-bold flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gold" />
                  Today's Google Calendar Agenda
                </h3>
                <span className="text-xs font-mono text-sage bg-sage-bg/10 px-2.5 py-1 rounded-full font-bold">
                  Live Sync
                </span>
              </div>

              {isLoadingEvents ? (
                <div className="py-6 flex flex-col items-center justify-center text-sage">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-sage border-t-transparent mb-2"></div>
                  <p className="font-serif italic text-xs">Retrieving your sacred schedule...</p>
                </div>
              ) : calendarEvents.length === 0 ? (
                <p className="text-xs text-[#A19D94] italic text-center py-4">No appointments scheduled for today.</p>
              ) : (
                <div className="divide-y divide-border-soft">
                  {calendarEvents.map((evt: any, idx: number) => {
                    const start = evt.start?.dateTime || evt.start?.date || '';
                    const end = evt.end?.dateTime || evt.end?.date || '';
                    const startFormatted = start ? new Date(start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'All Day';
                    const endFormatted = end ? new Date(end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

                    return (
                      <div key={evt.id || idx} className="py-3 flex items-start justify-between gap-4 first:pt-0 last:pb-0">
                        <div className="text-left">
                          <p className="text-sm font-bold text-navy font-serif sm:font-sans">{evt.summary}</p>
                          {evt.location && (
                            <p className="text-xs text-[#6E6A62] mt-0.5">{evt.location}</p>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="text-xs font-mono font-bold text-gold bg-gold-bg/10 px-2.5 py-1 rounded-full">
                            {startFormatted} {endFormatted ? ` - ${endFormatted}` : ''}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Daily Tasks and Micro-Widgets (Right Column) */}
        <div className="space-y-6">
          {/* Daily Tasks Card */}
          <div className="bg-white border border-border-soft p-6 rounded-[32px] shadow-soft">
            <h3 className="text-lg font-serif text-navy font-bold flex items-center gap-2 mb-4">
              <CheckSquare className="h-4 w-4 text-sage" />
              Today's Sanctuary Alignment
            </h3>

            {/* Tasks list */}
            <div className="space-y-2.5 mb-4 max-h-[180px] overflow-y-auto pr-1">
              {tasks.length === 0 ? (
                <p className="text-xs text-[#A19D94] italic font-light">No custom alignment tasks defined for today.</p>
              ) : (
                tasks.map((task, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-2 p-2.5 bg-canvas hover:bg-white border border-border-soft hover:border-sage-bg/30 rounded-xl group transition-all">
                    <span className="text-xs text-navy/85 font-light truncate">{task}</span>
                    <button
                      onClick={() => handleToggleTask(idx)}
                      className="h-5 w-5 bg-sage-bg/10 group-hover:bg-sage-bg text-transparent group-hover:text-white rounded-md flex items-center justify-center cursor-pointer transition-colors"
                    >
                      <Check className="h-3 w-3 stroke-[3]" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Quick add task */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                placeholder="Commit to an action..."
                className="flex-grow px-3 py-2 bg-canvas border border-border-soft rounded-xl text-xs text-navy focus:outline-none focus:border-sage-bg/30"
              />
              <button
                onClick={handleAddTask}
                className="h-8 w-8 bg-sage-bg hover:bg-sage text-white rounded-xl flex items-center justify-center cursor-pointer"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Micro Summaries Grid */}
          <div className="bg-white border border-border-soft p-6 rounded-[32px] shadow-soft">
            <h3 className="text-lg font-serif text-navy font-bold mb-3">Focus Area Summaries</h3>
            <div className="space-y-3.5">
              {selectedAreas.length === 0 ? (
                <p className="text-xs text-[#A19D94] italic">No focus areas configured.</p>
              ) : (
                selectedAreas.slice(0, 4).map((area) => {
                  const data = dashboardData[area] || {};
                  let detail = 'Ready to align.';
                  let Icon = Sparkles;
                  let colorClass = 'text-[#A19D94] bg-gray-50';

                  if (area === 'Faith / Spirituality') {
                    detail = data.todayPrayer ? `Reflecting: "${data.todayPrayer.substring(0, 30)}..."` : 'Prayer & reflection state active.';
                    Icon = Anchor;
                    colorClass = 'text-gold bg-gold-bg/10';
                  } else if (area === 'Fitness & Health') {
                    detail = `Target Focus: ${data.workoutType || 'Yoga'}`;
                    Icon = Heart;
                    colorClass = 'text-rose bg-rose-bg/10';
                  } else if (area === 'Pets') {
                    detail = `Caring for ${data.petsList || 'animal companions'}`;
                    Icon = PawPrint;
                    colorClass = 'text-rose bg-rose-bg/10';
                  } else if (area === 'Business / Side hustle') {
                    detail = `Current Phase: ${data.currentPhase || 'Refinement'}`;
                    Icon = TrendingUp;
                    colorClass = 'text-gold bg-gold-bg/10';
                  } else if (area === 'Finances') {
                    detail = data.savingsGoal ? `Target Savings: $${data.savingsGoal}` : 'Budget snapshot active.';
                    Icon = ShieldCheck;
                    colorClass = 'text-sage bg-sage-bg/10';
                  } else if (area === 'Mental health') {
                    detail = `Current Mood: ${data.mood || 'Hopeful'}`;
                    Icon = Smile;
                    colorClass = 'text-sage bg-sage-bg/10';
                  }

                  return (
                    <div key={area} className="flex items-center gap-3 border-b border-border-soft pb-2.5 last:border-0 last:pb-0">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${colorClass}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="text-left min-w-0 flex-grow">
                        <span className="text-[10px] font-mono text-[#A19D94] uppercase tracking-wider block">{area}</span>
                        <p className="text-xs text-navy/80 font-light truncate">{detail}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
