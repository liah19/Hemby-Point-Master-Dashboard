'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Compass, Heart, Briefcase, TrendingUp, Users, Home as HomeIcon, 
  GraduationCap, Smile, Moon, Apple, Award, Palette, Plane, 
  Trash2, ShieldCheck, PawPrint, Anchor, ArrowRight, Check
} from 'lucide-react';
import React from 'react';

// The list of possible life areas matching exactly the user prompt
const LIFE_AREAS = [
  { name: 'Faith / Spirituality', category: 'Soul', icon: Anchor, color: 'text-gold bg-gold/15 border-gold/30' },
  { name: 'Fitness & Health', category: 'Body', icon: Heart, color: 'text-rose bg-rose/15 border-rose/30' },
  { name: 'Career / Job', category: 'Work', icon: Briefcase, color: 'text-sage bg-sage/15 border-sage/30' },
  { name: 'Business / Side hustle', category: 'Work', icon: TrendingUp, color: 'text-gold bg-gold/15 border-gold/30' },
  { name: 'Finances', category: 'Material', icon: ShieldCheck, color: 'text-sage bg-sage/15 border-sage/30' },
  { name: 'Relationships', category: 'Connection', icon: Users, color: 'text-rose bg-rose/15 border-rose/30' },
  { name: 'Moving / Housing', category: 'Material', icon: HomeIcon, color: 'text-sage bg-sage/15 border-sage/30' },
  { name: 'Education / School', category: 'Mind', icon: GraduationCap, color: 'text-sage bg-sage/15 border-sage/30' },
  { name: 'Mental health', category: 'Mind', icon: Smile, color: 'text-sage bg-sage/15 border-sage/30' },
  { name: 'Sleep & Recovery', category: 'Body', icon: Moon, color: 'text-rose bg-rose/15 border-rose/30' },
  { name: 'Nutrition & Diet', category: 'Body', icon: Apple, color: 'text-rose bg-rose/15 border-rose/30' },
  { name: 'Certifications / Learning', category: 'Mind', icon: Award, color: 'text-sage bg-sage/15 border-sage/30' },
  { name: 'Creativity / Projects', category: 'Soul', icon: Palette, color: 'text-gold bg-gold/15 border-gold/30' },
  { name: 'Social life', category: 'Connection', icon: Users, color: 'text-rose bg-rose/15 border-rose/30' },
  { name: 'Travel', category: 'Soul', icon: Plane, color: 'text-gold bg-gold/15 border-gold/30' },
  { name: 'Habits I\'m breaking', category: 'Mind', icon: Trash2, color: 'text-sage bg-sage/15 border-sage/30' },
  { name: 'Home / Living space', category: 'Material', icon: HomeIcon, color: 'text-sage bg-sage/15 border-sage/30' },
  { name: 'Pets', category: 'Connection', icon: PawPrint, color: 'text-rose bg-rose/15 border-rose/30' },
  { name: 'Family', category: 'Connection', icon: Users, color: 'text-rose bg-rose/15 border-rose/30' },
];

export default function Onboarding() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  const toggleArea = (areaName: string) => {
    setSelectedAreas(prev => 
      prev.includes(areaName)
        ? prev.filter(item => item !== areaName)
        : [...prev, areaName]
    );
  };

  const handleSave = async () => {
    if (selectedAreas.length === 0) {
      setError('Please select at least one area to continue.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    // Prepare default widgets states for each selected area
    const initialData: Record<string, any> = {};
    selectedAreas.forEach(area => {
      if (area === 'Faith / Spirituality') {
        initialData[area] = { todayPrayer: '', prayerJournal: 'Give thanks for this day.', streak: 0 };
      } else if (area === 'Fitness & Health') {
        initialData[area] = { workoutType: 'Yoga & Stretching', weeklyTarget: 4, consistency: [true, false, false, false, false, false, false], countdownEvent: 'Sanctuary 5k Run', countdownDate: '2026-09-01' };
      } else if (area === 'Pets') {
        initialData[area] = { petsList: 'Milo & Bella', medsReminder: 'Feed at 8am, medication at 9pm', vetAppt: '2026-08-15' };
      } else if (area === 'Business / Side hustle') {
        initialData[area] = { currentPhase: 'Development', nextStep: 'Complete core app UI review', pipeline: ['Ideation', 'Market Validation', 'Prototyping', 'Launch Prep'] };
      } else if (area === 'Finances') {
        initialData[area] = { savingsGoal: 5000, currentSavings: 1500, revenueTracker: 120, budgetSnapshot: { rent: 1500, food: 400, transport: 200 } };
      } else if (area === 'Travel') {
        initialData[area] = { bucketList: ['Kyoto, Japan', 'Amalfi Coast, Italy'], nextTrip: 'Amalfi Journey', tripDate: '2026-10-12' };
      } else if (area === 'Relationships') {
        initialData[area] = { checkInReminder: 'Call Mom on Sundays', importantDates: [{ name: 'Anniversary', date: '2026-11-25' }] };
      } else if (area === 'Mental health') {
        initialData[area] = { mood: 'Peaceful', notes: 'Breathing slowly, grateful for stillness.', habitsBreaking: ['Scrolling before bed', 'Too much caffeine'] };
      } else if (area === 'Sleep & Recovery') {
        initialData[area] = { sleepGoal: 8, averageSleep: 7.2, nightlyHabits: ['No screens after 10pm', 'Read 10 pages'] };
      } else if (area === 'Career / Job') {
        initialData[area] = { jobStatus: 'Exploring opportunities', targetTitle: 'Lead Product Architect', resumeSentCount: 12, interviewScheduled: '2026-07-15' };
      } else if (area === 'Moving / Housing') {
        initialData[area] = { targetLocation: 'Pacific Northwest', searchStatus: 'Touring homes', maxBudget: 3500, nextTask: 'Review contract proposal' };
      } else if (area === 'Education / School') {
        initialData[area] = { currentClass: 'Advanced AI Architectures', currentGpa: '3.9', assignmentsDue: ['Design Pattern Draft', 'Fullstack Framework Proof'] };
      } else if (area === 'Nutrition & Diet') {
        initialData[area] = { dietStyle: 'Whole Foods / Plant-focused', dailyWaterGoal: 3, mealPrepDay: 'Sunday prep', trackedToday: true };
      } else if (area === 'Certifications / Learning') {
        initialData[area] = { activeCert: 'AWS Certified Cloud Solutions Architect', completionPercent: 65, nextQuizDate: '2026-07-10' };
      } else if (area === 'Creativity / Projects') {
        initialData[area] = { projectTitle: 'Watercolor Canvas Series', nextMilestone: 'Finish prime sketches', materialChecklist: ['Cold-press block paper', 'Fine sable brushes'] };
      } else if (area === 'Social life') {
        initialData[area] = { socialGoal: 'Weekly connection', lastHangout: 'Thursday dinner with Sarah', nextPlan: 'Saturday botanical gardens stroll' };
      } else if (area === 'Habits I\'m breaking') {
        initialData[area] = { activeHabits: ['Late-night screen time', 'Skipping stretching'], currentStreakDays: 14 };
      } else if (area === 'Home / Living space') {
        initialData[area] = { organizingArea: 'Sanctuary Reading Nook', declutterProgress: 80, nextTask: 'Set up amber floor lamp' };
      } else if (area === 'Family') {
        initialData[area] = { connectionGoal: 'Call siblings twice a week', currentStreak: 5, familyNotes: 'Planning family mountain cabin trip in August.' };
      }
    });

    try {
      const res = await fetch('/api/dashboard/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedAreas,
          data: initialData
        })
      });

      if (res.ok) {
        router.push('/dashboard');
      } else {
        const d = await res.json();
        setError(d.error || 'Failed to initialize dashboard. Please try again.');
        setIsSubmitting(false);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-sage border-t-transparent mx-auto"></div>
          <p className="mt-4 text-sage font-serif text-lg italic">Aligning with Sanctuary...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas px-4 py-16 relative overflow-hidden flex flex-col items-center justify-center">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[35rem] h-[35rem] rounded-full bg-sage-bg/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[35rem] h-[35rem] rounded-full bg-gold-bg/5 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl w-full text-center z-10"
      >
        <span className="text-sage font-mono tracking-[0.2em] text-xs uppercase font-bold">Onboarding</span>
        <h1 className="text-4xl md:text-5xl font-serif text-navy mt-3 font-light tracking-tight">
          Select Your <span className="italic text-gold font-normal animate-pulse">Focus Sanctuaries</span>
        </h1>
        <p className="mt-3 text-[#6E6A62] text-base md:text-lg font-light max-w-2xl mx-auto leading-relaxed">
          Which areas of your life need presence and alignment? Choose whichever apply to you. 
          We will dynamically craft your dashboard tabs and widgets.
        </p>

        {error && (
          <div className="bg-rose-bg/10 border border-rose-bg/20 text-rose font-medium text-xs px-4 py-3 rounded-xl max-w-md mx-auto mt-6 text-center">
            {error}
          </div>
        )}

        {/* Bento-style selections grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-12 text-left">
          {LIFE_AREAS.map((area, idx) => {
            const isSelected = selectedAreas.includes(area.name);
            const IconComponent = area.icon;

            return (
              <motion.div
                key={area.name}
                onClick={() => toggleArea(area.name)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`p-5 rounded-[24px] border transition-all duration-300 cursor-pointer flex items-start gap-4 shadow-soft relative overflow-hidden ${
                  isSelected 
                    ? 'bg-white border-sage/60 ring-1 ring-sage/30' 
                    : 'bg-white/70 hover:bg-white border-border-soft'
                }`}
              >
                <div className={`h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 ${area.color}`}>
                  <IconComponent className="h-5 w-5" />
                </div>
                
                <div className="pr-4">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#A19D94] block mb-0.5">
                    {area.category}
                  </span>
                  <h3 className="text-sm font-bold text-navy leading-tight font-serif sm:font-sans">
                    {area.name}
                  </h3>
                </div>

                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-4 right-4 h-5 w-5 rounded-full bg-sage-bg flex items-center justify-center text-white"
                  >
                    <Check className="h-3 w-3 stroke-[3]" />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Save Action */}
        <div className="mt-12 flex flex-col items-center justify-center gap-4">
          <p className="text-xs font-mono text-[#6E6A62] uppercase tracking-wider">
            {selectedAreas.length} Area{selectedAreas.length !== 1 ? 's' : ''} Selected
          </p>

          <motion.button
            onClick={handleSave}
            disabled={isSubmitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-10 py-4 bg-sage-bg hover:bg-sage disabled:bg-sage-bg/50 text-white rounded-full font-semibold tracking-wide shadow-sm hover:shadow transition-all duration-300 flex items-center gap-2 cursor-pointer text-sm"
          >
            {isSubmitting ? 'Preparing Your Sanctuary...' : 'Construct My Sanctuary'}
            <ArrowRight className="h-4 w-4" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
