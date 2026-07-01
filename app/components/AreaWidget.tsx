'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Anchor, Heart, PawPrint, TrendingUp, ShieldCheck, Smile, Moon, Briefcase, 
  GraduationCap, Apple, Award, Palette, Plane, Trash2, Home, Users, 
  Check, Plus, Sparkles, Trash, Calendar, CalendarDays, DollarSign
} from 'lucide-react';
import React from 'react';

interface AreaWidgetProps {
  areaName: string;
  data: any;
  onUpdate: (updatedData: any) => void;
}

export default function AreaWidget({ areaName, data, onUpdate }: AreaWidgetProps) {
  // Local states based on area
  const [localData, setLocalData] = useState<any>(data || {});
  const [isSaved, setIsSaved] = useState(false);

  const triggerSave = (updated: any) => {
    setLocalData(updated);
    onUpdate(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  // Rendering specific widget based on focus area
  if (areaName === 'Faith / Spirituality') {
    const prayer = localData.todayPrayer || '';
    const journal = localData.prayerJournal || '';
    const streak = localData.streak || 0;

    return (
      <div className="bg-white border border-border-soft p-6 md:p-8 rounded-[32px] shadow-soft text-left space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-gold font-mono uppercase tracking-wider text-xs font-bold">Faith / Spirituality</span>
            <h3 className="text-2xl font-serif text-navy font-bold mt-1">Prayer Journal & Stillness</h3>
          </div>
          <div className="bg-gold-bg/15 border border-gold/20 px-3.5 py-1.5 rounded-xl text-center">
            <span className="block text-[10px] font-mono text-gold uppercase tracking-wider font-bold">Streak</span>
            <span className="text-lg font-serif text-gold font-bold">{streak} Days</span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase text-[#6E6A62] mb-1.5">Today's Sacred Reflection</label>
            <input
              type="text"
              value={prayer}
              onChange={(e) => setLocalData({ ...localData, todayPrayer: e.target.value })}
              placeholder="What scripture, word, or gratitude is in your soul today?"
              className="w-full px-4 py-3 bg-canvas border border-border-soft rounded-xl text-sm text-navy focus:outline-none focus:border-gold"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-[#6E6A62] mb-1.5">Reflection Journal</label>
            <textarea
              rows={4}
              value={journal}
              onChange={(e) => setLocalData({ ...localData, prayerJournal: e.target.value })}
              placeholder="Record your prayers, study notes, or meditations..."
              className="w-full px-4 py-3 bg-canvas border border-border-soft rounded-xl text-sm text-navy focus:outline-none focus:border-gold"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => triggerSave(localData)}
            className="px-6 py-2.5 bg-sage-bg hover:bg-sage text-white rounded-full text-xs font-bold cursor-pointer transition-colors"
          >
            {isSaved ? 'Aligned ✓' : 'Save Reflection'}
          </button>
          <button
            onClick={() => {
              const updated = { ...localData, streak: streak + 1 };
              triggerSave(updated);
            }}
            className="px-6 py-2.5 bg-gold hover:bg-gold-bg text-navy hover:text-white rounded-full text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Reflect Today (+1 Streak)
          </button>
        </div>
      </div>
    );
  }

  if (areaName === 'Fitness & Health') {
    const activities = localData.activities || [];
    const newActivityName = localData.newActivityName || '';
    const eventName = localData.countdownEvent || '';
    const eventDate = localData.countdownDate || '';

    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const daysLeft = eventDate
      ? Math.max(0, Math.ceil((new Date(eventDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      : null;

    const addActivity = () => {
      if (!newActivityName.trim()) return;
      const newActivity = {
        id: Date.now().toString(),
        name: newActivityName.trim(),
        targetDays: [],
        log: [],
      };
      triggerSave({ ...localData, activities: [...activities, newActivity], newActivityName: '' });
    };

    const removeActivity = (id: string) => {
      triggerSave({ ...localData, activities: activities.filter((a: any) => a.id !== id) });
    };

    const toggleTargetDay = (activityId: string, day: string) => {
      const next = activities.map((a: any) => {
        if (a.id !== activityId) return a;
        const targetDays = a.targetDays.includes(day)
          ? a.targetDays.filter((d: string) => d !== day)
          : [...a.targetDays, day];
        return { ...a, targetDays };
      });
      triggerSave({ ...localData, activities: next });
    };

    const logActivity = (activityId: string) => {
      const today = new Date().toISOString().split('T')[0];
      const next = activities.map((a: any) =>
        a.id === activityId ? { ...a, log: [{ date: today }, ...a.log] } : a
      );
      triggerSave({ ...localData, activities: next });
    };

    const deleteLogEntry = (activityId: string, logIdx: number) => {
      const next = activities.map((a: any) => {
        if (a.id !== activityId) return a;
        return { ...a, log: a.log.filter((_: any, i: number) => i !== logIdx) };
      });
      triggerSave({ ...localData, activities: next });
    };

    return (
      <div className="space-y-6">
        {/* Optional Event Countdown — only shows meaningfully once a name/date is set */}
        <div className="bg-white border border-border-soft rounded-[32px] shadow-soft p-6 md:p-8">
          <span className="text-rose font-mono uppercase tracking-wider text-xs font-bold">Goal Event (Optional)</span>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mt-2">
            <div className="flex-1">
              <input
                type="text"
                value={eventName}
                onChange={(e) => setLocalData({ ...localData, countdownEvent: e.target.value })}
                onBlur={() => triggerSave(localData)}
                placeholder="e.g. My first 5K, a triathlon, a hiking trip..."
                className="w-full text-xl font-serif font-bold text-navy bg-transparent border-0 border-b border-dashed border-rose/20 focus:border-rose focus:outline-none"
              />
              <input
                type="date"
                value={eventDate}
                onChange={(e) => triggerSave({ ...localData, countdownDate: e.target.value })}
                className="text-xs text-[#6E6A62] mt-2 bg-transparent border-0 focus:outline-none"
              />
            </div>
            {daysLeft !== null && eventName && (
              <div className="flex flex-col items-center justify-center h-28 w-28 rounded-full border-4 border-rose-bg/20 shrink-0 mx-auto md:mx-0">
                <span className="text-3xl font-serif font-extrabold text-rose">{daysLeft}</span>
                <span className="text-[9px] font-mono text-[#A19D94] uppercase tracking-wider">Days Left</span>
              </div>
            )}
          </div>
        </div>

        {/* Add New Activity */}
        <div className="bg-white border border-border-soft rounded-[28px] shadow-soft p-5">
          <span className="text-rose font-mono uppercase tracking-wider text-[10px] font-bold">Your Activities</span>
          <p className="text-xs text-[#6E6A62] mt-1 mb-3">
            Add whatever you actually do — running, yoga, weight training, swimming, dance class, anything.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={newActivityName}
              onChange={(e) => setLocalData({ ...localData, newActivityName: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && addActivity()}
              placeholder="e.g. Running, Yoga, Weight Training..."
              className="flex-1 px-4 py-2.5 bg-canvas border border-border-soft rounded-xl text-sm focus:outline-none focus:border-rose"
            />
            <button
              onClick={addActivity}
              className="px-5 py-2.5 bg-sage-bg hover:bg-sage text-white rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </button>
          </div>
        </div>

        {/* Dynamic Activity Cards — one per activity the user has added, none hardcoded */}
        {activities.length === 0 ? (
          <div className="text-center py-10 text-[#A19D94] text-sm italic">
            No activities yet — add your first one above to start tracking.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {activities.map((activity: any) => {
              const weekLog = activity.log.filter((l: any) => {
                const logDate = new Date(l.date);
                const now = new Date();
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                return logDate >= weekAgo;
              });
              const consistencyPct = activity.targetDays.length > 0
                ? Math.min(100, Math.round((weekLog.length / activity.targetDays.length) * 100))
                : 0;

              return (
                <div key={activity.id} className="bg-white border border-border-soft rounded-[28px] shadow-soft p-5">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm font-serif font-bold text-navy">{activity.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-[#A19D94]">{consistencyPct}%</span>
                      <button onClick={() => removeActivity(activity.id)} className="text-[#A19D94] hover:text-rose cursor-pointer">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <label className="block text-[10px] font-mono uppercase text-[#6E6A62] mb-1.5">Weekly Target Days</label>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {daysOfWeek.map(day => (
                      <button
                        key={day}
                        onClick={() => toggleTargetDay(activity.id, day)}
                        className={`px-2 py-1 rounded-full text-[9px] font-bold cursor-pointer transition-colors ${
                          activity.targetDays.includes(day)
                            ? 'bg-rose-bg text-white'
                            : 'bg-canvas text-[#A19D94] border border-border-soft'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => logActivity(activity.id)}
                    className="w-full px-4 py-2 bg-sage-bg hover:bg-sage text-white rounded-full text-[10px] font-bold cursor-pointer transition-colors mb-3"
                  >
                    + Log Today
                  </button>

                  <div className="space-y-1.5 max-h-28 overflow-y-auto">
                    {activity.log.slice(0, 6).map((entry: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center text-[10px] text-[#6E6A62] bg-canvas px-2.5 py-1.5 rounded-lg">
                        <span>{entry.date}</span>
                        <button onClick={() => deleteLogEntry(activity.id, idx)} className="text-[#A19D94] hover:text-rose cursor-pointer">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  if (areaName === 'Pets') {
    const pets = localData.petsList || 'Milo & Bella';
    const reminders = localData.medsReminder || 'Feed at 8am, medication at 9pm';
    const vet = localData.vetAppt || '2026-08-15';

    return (
      <div className="bg-white border border-border-soft p-6 md:p-8 rounded-[32px] shadow-soft text-left space-y-6">
        <div>
          <span className="text-rose font-mono uppercase tracking-wider text-xs font-bold">Pet Care</span>
          <h3 className="text-2xl font-serif text-navy font-bold mt-1">Companion Wellness & Vet Reminders</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-[#6E6A62] mb-1.5">Your Animals</label>
              <input
                type="text"
                value={pets}
                onChange={(e) => setLocalData({ ...localData, petsList: e.target.value })}
                placeholder="Pet names..."
                className="w-full px-4 py-2.5 bg-canvas border border-border-soft rounded-xl text-sm focus:outline-none focus:border-rose text-navy"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#6E6A62] mb-1.5">Care & Medication Schedule</label>
              <textarea
                rows={3}
                value={reminders}
                onChange={(e) => setLocalData({ ...localData, medsReminder: e.target.value })}
                placeholder="Any medicine schedules or special feed tasks..."
                className="w-full px-4 py-2.5 bg-canvas border border-border-soft rounded-xl text-sm focus:outline-none focus:border-rose text-navy"
              />
            </div>
          </div>

          <div className="bg-canvas border border-border-soft p-6 rounded-[24px] shadow-soft flex flex-col justify-center items-center text-center">
            <span className="text-rose font-mono text-[10px] uppercase tracking-wider flex items-center gap-1 font-bold">
              <CalendarDays className="h-3 w-3" />
              Next Vet Visit
            </span>
            <input
              type="date"
              value={vet}
              onChange={(e) => setLocalData({ ...localData, vetAppt: e.target.value })}
              className="text-sm text-navy font-serif font-bold bg-white border border-border-soft rounded-xl px-3 py-2 mt-2 focus:outline-none focus:border-rose"
            />
          </div>
        </div>

        <div>
          <button
            onClick={() => triggerSave(localData)}
            className="px-6 py-2.5 bg-sage-bg hover:bg-sage text-white rounded-full text-xs font-bold cursor-pointer"
          >
            {isSaved ? 'Pet Care Saved ✓' : 'Save Pet Profile'}
          </button>
        </div>
      </div>
    );
  }

  if (areaName === 'Business / Side hustle') {
    const phase = localData.currentPhase || 'Prototyping';
    const nextStep = localData.nextStep || 'Review core SaaS pipeline';
    const pipeline = localData.pipeline || ['Ideation', 'Validation', 'Prototyping', 'Launch'];

    return (
      <div className="bg-white border border-border-soft p-6 md:p-8 rounded-[32px] shadow-soft text-left space-y-6">
        <div>
          <span className="text-gold font-mono uppercase tracking-wider text-xs font-bold">Business / Side Hustle</span>
          <h3 className="text-2xl font-serif text-navy font-bold mt-1">Enterprise Building</h3>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-[#6E6A62] mb-1.5">Current Project Phase</label>
              <input
                type="text"
                value={phase}
                onChange={(e) => setLocalData({ ...localData, currentPhase: e.target.value })}
                className="w-full px-4 py-2.5 bg-canvas border border-border-soft rounded-xl text-sm focus:outline-none focus:border-gold text-navy"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#6E6A62] mb-1.5">Next Bold Action</label>
              <input
                type="text"
                value={nextStep}
                onChange={(e) => setLocalData({ ...localData, nextStep: e.target.value })}
                className="w-full px-4 py-2.5 bg-canvas border border-border-soft rounded-xl text-sm focus:outline-none focus:border-gold text-navy"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-[#6E6A62] mb-2">SaaS pipeline timeline</label>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              {pipeline.map((step: string, idx: number) => (
                <div key={idx} className="bg-canvas border border-border-soft p-3 rounded-xl flex flex-col justify-between h-20">
                  <span className="text-[9px] font-mono text-[#A19D94] block font-bold">Step {idx + 1}</span>
                  <input
                    type="text"
                    value={step}
                    onChange={(e) => {
                      const newPipe = [...pipeline];
                      newPipe[idx] = e.target.value;
                      setLocalData({ ...localData, pipeline: newPipe });
                    }}
                    className="font-serif text-navy font-bold text-center bg-transparent border-0 focus:outline-none text-xs leading-snug"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <button
            onClick={() => triggerSave(localData)}
            className="px-6 py-2.5 bg-sage-bg hover:bg-sage text-white rounded-full text-xs font-bold cursor-pointer"
          >
            {isSaved ? 'Business Saved ✓' : 'Save Phase Settings'}
          </button>
        </div>
      </div>
    );
  }

  if (areaName === 'Finances') {
    const savingsGoal = localData.savingsGoal || 5000;
    const currentSavings = localData.currentSavings || 1500;
    const rent = localData.budgetSnapshot?.rent || 1500;
    const food = localData.budgetSnapshot?.food || 400;
    const fun = localData.budgetSnapshot?.fun || 200;

    const remainingSavings = Math.max(0, savingsGoal - currentSavings);
    const savingsPercent = Math.min(100, Math.ceil((currentSavings / savingsGoal) * 100));

    return (
      <div className="bg-white border border-border-soft p-6 md:p-8 rounded-[32px] shadow-soft text-left space-y-6">
        <div>
          <span className="text-sage font-mono uppercase tracking-wider text-xs font-bold">Finances</span>
          <h3 className="text-2xl font-serif text-navy font-bold mt-1">Material Sufficiency & Budget</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Savings Progress Card */}
          <div className="space-y-4">
            <h4 className="text-md font-serif text-navy font-bold flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-sage" />
              Savings Goal Tracking
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-mono uppercase text-[#6E6A62] mb-1">Target Goal</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-xs text-[#A19D94]">
                    <DollarSign className="h-3 w-3" />
                  </span>
                  <input
                    type="number"
                    value={savingsGoal}
                    onChange={(e) => setLocalData({ ...localData, savingsGoal: parseInt(e.target.value) || 0 })}
                    className="w-full pl-6 pr-2 py-1.5 bg-canvas border border-border-soft rounded-xl text-xs focus:outline-none text-navy"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-[#6E6A62] mb-1">Current Balance</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-xs text-[#A19D94]">
                    <DollarSign className="h-3 w-3" />
                  </span>
                  <input
                    type="number"
                    value={currentSavings}
                    onChange={(e) => setLocalData({ ...localData, currentSavings: parseInt(e.target.value) || 0 })}
                    className="w-full pl-6 pr-2 py-1.5 bg-canvas border border-border-soft rounded-xl text-xs focus:outline-none text-navy"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <div className="flex justify-between text-xs font-mono text-[#6E6A62] mb-1 font-bold">
                <span>{savingsPercent}% Achieved</span>
                <span>${remainingSavings} to go</span>
              </div>
              <div className="w-full bg-canvas h-2.5 rounded-full overflow-hidden border border-border-soft">
                <div 
                  className="bg-sage-bg h-full transition-all duration-500" 
                  style={{ width: `${savingsPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Budget Snapshot */}
          <div className="bg-canvas p-6 rounded-[24px] border border-border-soft shadow-soft space-y-3">
            <h4 className="text-xs font-mono text-sage uppercase tracking-wider mb-2 font-bold">Monthly Budget Snapshot</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs gap-3">
                <span className="text-navy/70 font-medium">Rent/Housing</span>
                <input
                  type="number"
                  value={rent}
                  onChange={(e) => setLocalData({
                    ...localData,
                    budgetSnapshot: { ...localData.budgetSnapshot, rent: parseInt(e.target.value) || 0 }
                  })}
                  className="w-20 px-2 py-1 bg-white border border-border-soft rounded text-right text-xs text-navy"
                />
              </div>

              <div className="flex items-center justify-between text-xs gap-3">
                <span className="text-navy/70 font-medium">Food & Essentials</span>
                <input
                  type="number"
                  value={food}
                  onChange={(e) => setLocalData({
                    ...localData,
                    budgetSnapshot: { ...localData.budgetSnapshot, food: parseInt(e.target.value) || 0 }
                  })}
                  className="w-20 px-2 py-1 bg-white border border-border-soft rounded text-right text-xs text-navy"
                />
              </div>

              <div className="flex items-center justify-between text-xs gap-3">
                <span className="text-navy/70 font-medium">Leisure & Fun</span>
                <input
                  type="number"
                  value={fun}
                  onChange={(e) => setLocalData({
                    ...localData,
                    budgetSnapshot: { ...localData.budgetSnapshot, fun: parseInt(e.target.value) || 0 }
                  })}
                  className="w-20 px-2 py-1 bg-white border border-border-soft rounded text-right text-xs text-navy"
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <button
            onClick={() => triggerSave(localData)}
            className="px-6 py-2.5 bg-sage-bg hover:bg-sage text-white rounded-full text-xs font-bold cursor-pointer"
          >
            {isSaved ? 'Finances Saved ✓' : 'Save Balance details'}
          </button>
        </div>
      </div>
    );
  }

  if (areaName === 'Travel') {
    const bucketList = localData.bucketList || ['Kyoto, Japan', 'Amalfi Coast, Italy'];
    const nextTrip = localData.nextTrip || 'Amalfi Journey';
    const tripDate = localData.tripDate || '2026-10-12';
    const [newItem, setNewItem] = useState('');

    return (
      <div className="bg-white border border-border-soft p-6 md:p-8 rounded-[32px] shadow-soft text-left space-y-6">
        <div>
          <span className="text-gold font-mono uppercase tracking-wider text-xs font-bold">Travel</span>
          <h3 className="text-2xl font-serif text-navy font-bold mt-1">Bucket List & Upcoming Journeys</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-xs font-mono uppercase text-[#6E6A62] font-bold">Next Sanctuary Trip</h4>
            <div className="space-y-3 bg-canvas p-5 rounded-2xl border border-border-soft">
              <div>
                <label className="block text-[10px] font-mono uppercase text-[#A19D94] font-bold">Destination Name</label>
                <input
                  type="text"
                  value={nextTrip}
                  onChange={(e) => setLocalData({ ...localData, nextTrip: e.target.value })}
                  className="w-full bg-transparent border-0 border-b border-border-soft py-1 font-serif text-navy font-bold focus:outline-none focus:border-gold text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-[#A19D94] font-bold">Departure Date</label>
                <input
                  type="date"
                  value={tripDate}
                  onChange={(e) => setLocalData({ ...localData, tripDate: e.target.value })}
                  className="w-full bg-transparent border-0 focus:outline-none text-xs text-navy font-medium"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase text-[#6E6A62] font-bold">Travel Bucket List</h4>
            <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
              {bucketList.map((item: string, idx: number) => (
                <div key={idx} className="flex justify-between items-center text-xs text-navy/80 p-2 bg-canvas rounded-xl border border-border-soft">
                  <span className="font-light">{item}</span>
                  <button
                    onClick={() => {
                      const updated = bucketList.filter((_: any, i: number) => i !== idx);
                      setLocalData({ ...localData, bucketList: updated });
                    }}
                    className="text-rose hover:text-rose-bg text-[10px] font-bold cursor-pointer uppercase tracking-wider"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="Add dream destination..."
                className="flex-grow px-3 py-1.5 bg-canvas border border-border-soft rounded-xl text-xs text-navy focus:outline-none focus:border-gold/30"
              />
              <button
                onClick={() => {
                  if (!newItem.trim()) return;
                  const updated = [...bucketList, newItem.trim()];
                  setLocalData({ ...localData, bucketList: updated });
                  setNewItem('');
                }}
                className="px-3 bg-sage-bg hover:bg-sage text-white text-xs rounded-xl cursor-pointer font-bold"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        <div>
          <button
            onClick={() => triggerSave(localData)}
            className="px-6 py-2.5 bg-sage-bg hover:bg-sage text-white rounded-full text-xs font-bold cursor-pointer"
          >
            {isSaved ? 'Bucket List Saved ✓' : 'Save Travel Goals'}
          </button>
        </div>
      </div>
    );
  }

  if (areaName === 'Relationships') {
    const checkIn = localData.checkInReminder || 'Call Mom on Sundays';
    const dates = localData.importantDates || [{ name: 'Anniversary', date: '2026-11-25' }];

    return (
      <div className="bg-white border border-border-soft p-6 md:p-8 rounded-[32px] shadow-soft text-left space-y-6">
        <div>
          <span className="text-rose font-mono uppercase tracking-wider text-xs font-bold">Relationships</span>
          <h3 className="text-2xl font-serif text-navy font-bold mt-1">Connection & Check-In Reminders</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <label className="block text-xs font-mono uppercase text-[#6E6A62] mb-1 font-bold">Weekly Focus Connection</label>
            <input
              type="text"
              value={checkIn}
              onChange={(e) => setLocalData({ ...localData, checkInReminder: e.target.value })}
              className="w-full px-4 py-2.5 bg-canvas border border-border-soft rounded-xl text-sm focus:outline-none focus:border-rose text-navy"
            />
          </div>

          <div className="bg-canvas p-6 rounded-[24px] border border-border-soft shadow-soft space-y-2">
            <span className="text-[10px] font-mono text-rose uppercase tracking-wider font-bold">Significant Relationship Dates</span>
            {dates.map((d: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center text-xs border-b border-border-soft pb-1.5 last:border-0 last:pb-0">
                <span className="font-serif font-bold text-navy">{d.name}</span>
                <span className="text-navy/60">{d.date}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <button
            onClick={() => triggerSave(localData)}
            className="px-6 py-2.5 bg-sage-bg hover:bg-sage text-white rounded-full text-xs font-bold cursor-pointer"
          >
            {isSaved ? 'Connections Saved ✓' : 'Save Connection Reminder'}
          </button>
        </div>
      </div>
    );
  }

  if (areaName === 'Mental health') {
    const mood = localData.mood || 'Calm';
    const notes = localData.notes || 'Breathing slowly, grateful for stillness.';
    const breaking = localData.habitsBreaking || ['Scrolling before bed', 'Too much coffee'];

    const moods = ['Peaceful', 'Calm', 'Reflective', 'Slow', 'Tired', 'Anxious'];

    return (
      <div className="bg-white border border-border-soft p-6 md:p-8 rounded-[32px] shadow-soft text-left space-y-6">
        <div>
          <span className="text-sage font-mono uppercase tracking-wider text-xs font-bold">Mental Health</span>
          <h3 className="text-2xl font-serif text-navy font-bold mt-1">Emotional Sanctuary & Stillness</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase text-[#6E6A62] mb-2 font-bold">How is your mental state in this moment?</label>
            <div className="flex flex-wrap gap-2">
              {moods.map((m) => {
                const isSelected = mood === m;
                return (
                  <button
                    key={m}
                    onClick={() => setLocalData({ ...localData, mood: m })}
                    className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                      isSelected 
                        ? 'bg-sage-bg text-white shadow-soft font-bold' 
                        : 'bg-canvas border border-border-soft text-navy/70 hover:border-sage-bg/40'
                    }`}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-[#6E6A62] mb-1.5 font-bold">Therapy & Stillness Journal</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setLocalData({ ...localData, notes: e.target.value })}
                className="w-full px-4 py-2.5 bg-canvas border border-border-soft rounded-xl text-sm text-navy focus:outline-none focus:border-sage-bg/30"
              />
            </div>

            <div className="bg-canvas border border-border-soft p-5 rounded-[24px] space-y-2">
              <span className="text-[10px] font-mono uppercase text-sage tracking-wider block font-bold">Habits I'm breaking context</span>
              {breaking.map((h: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-navy/70">
                  <span className="h-1.5 w-1.5 rounded-full bg-sage-bg" />
                  {h}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <button
            onClick={() => triggerSave(localData)}
            className="px-6 py-2.5 bg-sage-bg hover:bg-sage text-white rounded-full text-xs font-bold cursor-pointer"
          >
            {isSaved ? 'Mental Health Logged ✓' : 'Log State'}
          </button>
        </div>
      </div>
    );
  }

  if (areaName === 'Sleep & Recovery') {
    const sleepGoal = localData.sleepGoal || 8;
    const nightlyHabits = localData.nightlyHabits || ['No screens after 10pm', 'Quiet reading'];

    return (
      <div className="bg-white border border-border-soft p-6 md:p-8 rounded-[32px] shadow-soft text-left space-y-6">
        <div>
          <span className="text-rose font-mono uppercase tracking-wider text-xs font-bold">Sleep & Recovery</span>
          <h3 className="text-2xl font-serif text-navy font-bold mt-1">Nocturnal Care & Resting Goals</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-[#6E6A62] mb-1 font-bold">Target Sleep Hours</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="4"
                  max="12"
                  step="0.5"
                  value={sleepGoal}
                  onChange={(e) => setLocalData({ ...localData, sleepGoal: parseFloat(e.target.value) })}
                  className="w-full accent-rose"
                />
                <span className="text-sm font-serif font-bold text-rose w-12 text-right">{sleepGoal} Hrs</span>
              </div>
            </div>
          </div>

          <div className="bg-canvas p-6 rounded-[24px] border border-border-soft shadow-soft space-y-2">
            <span className="text-[10px] font-mono text-rose uppercase tracking-wider block font-bold">Bedtime Routine Goals</span>
            {nightlyHabits.map((h: string, idx: number) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-navy/70">
                <Check className="h-3.5 w-3.5 text-rose stroke-[3]" />
                {h}
              </div>
            ))}
          </div>
        </div>

        <div>
          <button
            onClick={() => triggerSave(localData)}
            className="px-6 py-2.5 bg-sage-bg hover:bg-sage text-white rounded-full text-xs font-bold cursor-pointer"
          >
            {isSaved ? 'Rest Saved ✓' : 'Save Sleep Hours'}
          </button>
        </div>
      </div>
    );
  }

  if (areaName === 'Career / Job') {
    const jobStatus = localData.jobStatus || 'Exploring opportunities';
    const targetTitle = localData.targetTitle || 'Lead Product Architect';
    const resumeSentCount = localData.resumeSentCount || 0;
    const interviewScheduled = localData.interviewScheduled || '';

    return (
      <div className="bg-white border border-border-soft p-6 md:p-8 rounded-[32px] shadow-soft text-left space-y-6 animate-fade-in">
        <div>
          <span className="text-sage font-mono uppercase tracking-wider text-xs font-bold">Career & Professional Growth</span>
          <h3 className="text-2xl font-serif text-navy font-bold mt-1">Career Alignment & Opportunities</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-[#6E6A62] mb-1.5 font-bold">Target Professional Title</label>
              <input
                type="text"
                value={targetTitle}
                onChange={(e) => setLocalData({ ...localData, targetTitle: e.target.value })}
                className="w-full px-4 py-2.5 bg-canvas border border-border-soft rounded-xl text-sm text-navy focus:outline-none focus:border-sage-bg/30"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#6E6A62] mb-1.5 font-bold">Current Search Status</label>
              <select
                value={jobStatus}
                onChange={(e) => setLocalData({ ...localData, jobStatus: e.target.value })}
                className="w-full px-4 py-2.5 bg-canvas border border-border-soft rounded-xl text-sm focus:outline-none focus:border-sage-bg/30 text-navy"
              >
                <option value="Exploring opportunities">Exploring opportunities</option>
                <option value="Actively interviewing">Actively interviewing</option>
                <option value="Reviewing proposals">Reviewing proposals</option>
                <option value="Comfortable in current role">Comfortable in current role</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-canvas border border-border-soft p-5 rounded-[24px] text-center flex flex-col justify-center items-center">
              <span className="text-[10px] font-mono uppercase text-sage tracking-wider font-bold">Resumes Sent</span>
              <span className="text-3xl font-serif text-navy font-bold my-2">{resumeSentCount}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setLocalData({ ...localData, resumeSentCount: Math.max(0, resumeSentCount - 1) })}
                  className="h-6 w-6 bg-white border border-border-soft rounded-lg flex items-center justify-center text-xs text-navy font-bold cursor-pointer"
                >
                  -
                </button>
                <button
                  onClick={() => setLocalData({ ...localData, resumeSentCount: resumeSentCount + 1 })}
                  className="h-6 w-6 bg-sage-bg text-white rounded-lg flex items-center justify-center text-xs font-bold cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            <div className="bg-canvas border border-border-soft p-5 rounded-[24px] flex flex-col justify-center items-center text-center">
              <span className="text-[10px] font-mono uppercase text-sage tracking-wider font-bold">Next Interview</span>
              <input
                type="date"
                value={interviewScheduled}
                onChange={(e) => setLocalData({ ...localData, interviewScheduled: e.target.value })}
                className="text-xs text-navy font-serif font-bold bg-white border border-border-soft rounded-lg px-2 py-1 mt-2 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div>
          <button
            onClick={() => triggerSave(localData)}
            className="px-6 py-2.5 bg-sage-bg hover:bg-sage text-white rounded-full text-xs font-bold cursor-pointer"
          >
            {isSaved ? 'Career Path Saved ✓' : 'Save Career settings'}
          </button>
        </div>
      </div>
    );
  }

  if (areaName === 'Moving / Housing') {
    const targetLocation = localData.targetLocation || 'Pacific Northwest';
    const searchStatus = localData.searchStatus || 'Touring homes';
    const maxBudget = localData.maxBudget || 3000;
    const nextTask = localData.nextTask || 'Review listing contract';

    return (
      <div className="bg-white border border-border-soft p-6 md:p-8 rounded-[32px] shadow-soft text-left space-y-6 animate-fade-in">
        <div>
          <span className="text-sage font-mono uppercase tracking-wider text-xs font-bold">Moving & Housing</span>
          <h3 className="text-2xl font-serif text-navy font-bold mt-1">Sanctuary Relocation Goals</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-[#6E6A62] mb-1.5 font-bold">Target Location / Area</label>
              <input
                type="text"
                value={targetLocation}
                onChange={(e) => setLocalData({ ...localData, targetLocation: e.target.value })}
                className="w-full px-4 py-2.5 bg-canvas border border-border-soft rounded-xl text-sm text-navy focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#6E6A62] mb-1.5 font-bold">Search Status</label>
              <input
                type="text"
                value={searchStatus}
                onChange={(e) => setLocalData({ ...localData, searchStatus: e.target.value })}
                className="w-full px-4 py-2.5 bg-canvas border border-border-soft rounded-xl text-sm text-navy focus:outline-none"
              />
            </div>
          </div>

          <div className="bg-canvas border border-border-soft p-6 rounded-[24px] space-y-4">
            <div>
              <label className="block text-[10px] font-mono uppercase text-sage font-bold mb-1">Max Budget / Month</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-xs text-[#A19D94]">$</span>
                <input
                  type="number"
                  value={maxBudget}
                  onChange={(e) => setLocalData({ ...localData, maxBudget: parseInt(e.target.value) || 0 })}
                  className="w-full pl-6 pr-2 py-1.5 bg-white border border-border-soft rounded-lg text-xs focus:outline-none text-navy"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-sage font-bold mb-1">Next Crucial Task</label>
              <input
                type="text"
                value={nextTask}
                onChange={(e) => setLocalData({ ...localData, nextTask: e.target.value })}
                className="w-full px-2 py-1.5 bg-white border border-border-soft rounded-lg text-xs focus:outline-none text-navy"
              />
            </div>
          </div>
        </div>

        <div>
          <button
            onClick={() => triggerSave(localData)}
            className="px-6 py-2.5 bg-sage-bg hover:bg-sage text-white rounded-full text-xs font-bold cursor-pointer"
          >
            {isSaved ? 'Housing Details Saved ✓' : 'Save Relocation Plan'}
          </button>
        </div>
      </div>
    );
  }

  if (areaName === 'Education / School') {
    const currentClass = localData.currentClass || 'Advanced AI Architectures';
    const currentGpa = localData.currentGpa || '4.0';
    const assignments = localData.assignmentsDue || ['Design Pattern Draft', 'Fullstack Proof of Concept'];
    const [newAssignment, setNewAssignment] = useState('');

    return (
      <div className="bg-white border border-border-soft p-6 md:p-8 rounded-[32px] shadow-soft text-left space-y-6 animate-fade-in">
        <div>
          <span className="text-sage font-mono uppercase tracking-wider text-xs font-bold">Education & Studies</span>
          <h3 className="text-2xl font-serif text-navy font-bold mt-1">Study Sanctuary & Academic Focus</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-[#6E6A62] mb-1.5 font-bold">Primary Course / Class</label>
              <input
                type="text"
                value={currentClass}
                onChange={(e) => setLocalData({ ...localData, currentClass: e.target.value })}
                className="w-full px-4 py-2.5 bg-canvas border border-border-soft rounded-xl text-sm text-navy focus:outline-none"
              />
            </div>

            <div className="bg-canvas border border-border-soft p-4 rounded-xl flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-[#6E6A62] font-bold">Current Target GPA</span>
              <input
                type="text"
                value={currentGpa}
                onChange={(e) => setLocalData({ ...localData, currentGpa: e.target.value })}
                className="w-16 px-2 py-1 bg-white border border-border-soft rounded-lg text-center font-bold font-serif text-navy text-sm"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-mono uppercase text-[#6E6A62] font-bold">Pending Assignments</label>
            <div className="space-y-1.5 max-h-[110px] overflow-y-auto pr-1">
              {assignments.map((asg: string, idx: number) => (
                <div key={idx} className="flex justify-between items-center text-xs text-navy/85 p-2 bg-canvas rounded-lg border border-border-soft">
                  <span className="truncate">{asg}</span>
                  <button
                    onClick={() => {
                      const updated = assignments.filter((_: any, i: number) => i !== idx);
                      setLocalData({ ...localData, assignmentsDue: updated });
                    }}
                    className="text-rose text-[10px] font-bold hover:underline cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newAssignment}
                onChange={(e) => setNewAssignment(e.target.value)}
                placeholder="New assignment..."
                className="flex-grow px-3 py-1.5 bg-canvas border border-border-soft rounded-xl text-xs text-navy"
              />
              <button
                onClick={() => {
                  if (!newAssignment.trim()) return;
                  const updated = [...assignments, newAssignment.trim()];
                  setLocalData({ ...localData, assignmentsDue: updated });
                  setNewAssignment('');
                }}
                className="px-3 bg-sage-bg hover:bg-sage text-white text-xs rounded-xl cursor-pointer font-bold"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        <div>
          <button
            onClick={() => triggerSave(localData)}
            className="px-6 py-2.5 bg-sage-bg hover:bg-sage text-white rounded-full text-xs font-bold cursor-pointer"
          >
            {isSaved ? 'Academic Goals Saved ✓' : 'Save Academic Progress'}
          </button>
        </div>
      </div>
    );
  }

  if (areaName === 'Nutrition & Diet') {
    const dietStyle = localData.dietStyle || 'Whole Foods / Plant-focused';
    const dailyWaterGoal = localData.dailyWaterGoal || 3;
    const waterLogged = localData.waterLogged || 0;
    const mealPrepDay = localData.mealPrepDay || 'Sunday Meal Prep';

    return (
      <div className="bg-white border border-border-soft p-6 md:p-8 rounded-[32px] shadow-soft text-left space-y-6 animate-fade-in">
        <div>
          <span className="text-rose font-mono uppercase tracking-wider text-xs font-bold">Nutrition & Diet</span>
          <h3 className="text-2xl font-serif text-navy font-bold mt-1">Conscious Eating & Pure Hydration</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-[#6E6A62] mb-1.5 font-bold">Active Diet Ethos / Style</label>
              <input
                type="text"
                value={dietStyle}
                onChange={(e) => setLocalData({ ...localData, dietStyle: e.target.value })}
                placeholder="e.g. Vegetarian, Keto, Whole Foods..."
                className="w-full px-4 py-2.5 bg-canvas border border-border-soft rounded-xl text-sm text-navy focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#6E6A62] mb-1.5 font-bold">Meal Prep Strategy</label>
              <input
                type="text"
                value={mealPrepDay}
                onChange={(e) => setLocalData({ ...localData, mealPrepDay: e.target.value })}
                className="w-full px-4 py-2.5 bg-canvas border border-border-soft rounded-xl text-sm text-navy focus:outline-none"
              />
            </div>
          </div>

          <div className="bg-canvas border border-border-soft p-6 rounded-[24px] flex flex-col justify-center items-center text-center">
            <span className="text-[10px] font-mono uppercase text-rose tracking-wider font-bold">Pure Water Tracker</span>
            <span className="text-3xl font-serif text-rose font-bold my-2">{waterLogged} / {dailyWaterGoal} L</span>
            <div className="flex gap-2.5">
              <button
                onClick={() => setLocalData({ ...localData, waterLogged: Math.max(0, waterLogged - 0.25) })}
                className="h-8 px-3 bg-white border border-border-soft rounded-xl text-xs text-navy font-bold cursor-pointer"
              >
                -250ml
              </button>
              <button
                onClick={() => setLocalData({ ...localData, waterLogged: waterLogged + 0.25 })}
                className="h-8 px-3 bg-rose-bg text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1"
              >
                +250ml
              </button>
            </div>
          </div>
        </div>

        <div>
          <button
            onClick={() => triggerSave(localData)}
            className="px-6 py-2.5 bg-sage-bg hover:bg-sage text-white rounded-full text-xs font-bold cursor-pointer"
          >
            {isSaved ? 'Nutrition Saved ✓' : 'Save Nutrition Log'}
          </button>
        </div>
      </div>
    );
  }

  if (areaName === 'Certifications / Learning') {
    const activeCert = localData.activeCert || 'AWS Solutions Architect';
    const completionPercent = localData.completionPercent || 0;
    const nextQuizDate = localData.nextQuizDate || '';

    return (
      <div className="bg-white border border-border-soft p-6 md:p-8 rounded-[32px] shadow-soft text-left space-y-6 animate-fade-in">
        <div>
          <span className="text-sage font-mono uppercase tracking-wider text-xs font-bold">Certifications & Learning</span>
          <h3 className="text-2xl font-serif text-navy font-bold mt-1">Wisdom Cultivation & Badges</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-[#6E6A62] mb-1.5 font-bold">Target Certification / Study</label>
              <input
                type="text"
                value={activeCert}
                onChange={(e) => setLocalData({ ...localData, activeCert: e.target.value })}
                className="w-full px-4 py-2.5 bg-canvas border border-border-soft rounded-xl text-sm text-navy"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#6E6A62] mb-1.5 font-bold">Study Progress</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={completionPercent}
                  onChange={(e) => setLocalData({ ...localData, completionPercent: parseInt(e.target.value) })}
                  className="w-full accent-sage"
                />
                <span className="text-xs font-bold font-mono text-sage w-12 text-right">{completionPercent}%</span>
              </div>
            </div>
          </div>

          <div className="bg-canvas border border-border-soft p-6 rounded-[24px] flex flex-col justify-center items-center text-center">
            <span className="text-[10px] font-mono uppercase text-sage tracking-wider font-bold">Upcoming Exam / Quiz</span>
            <input
              type="date"
              value={nextQuizDate}
              onChange={(e) => setLocalData({ ...localData, nextQuizDate: e.target.value })}
              className="text-xs text-navy font-serif font-bold bg-white border border-border-soft rounded-lg px-3 py-2 mt-2 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <button
            onClick={() => triggerSave(localData)}
            className="px-6 py-2.5 bg-sage-bg hover:bg-sage text-white rounded-full text-xs font-bold cursor-pointer"
          >
            {isSaved ? 'Learning Saved ✓' : 'Save Wisdom Progress'}
          </button>
        </div>
      </div>
    );
  }

  if (areaName === 'Creativity / Projects') {
    const projectTitle = localData.projectTitle || 'Watercolor Canvas Series';
    const nextMilestone = localData.nextMilestone || 'Complete Prime Sketches';
    const checklist = localData.materialChecklist || ['Cold-press block paper', 'Fine sable brushes'];
    const [newItem, setNewItem] = useState('');

    return (
      <div className="bg-white border border-border-soft p-6 md:p-8 rounded-[32px] shadow-soft text-left space-y-6 animate-fade-in">
        <div>
          <span className="text-gold font-mono uppercase tracking-wider text-xs font-bold">Creativity & Design</span>
          <h3 className="text-2xl font-serif text-navy font-bold mt-1">Creative Sanctuary & Projects</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-[#6E6A62] mb-1.5 font-bold">Active Project Title</label>
              <input
                type="text"
                value={projectTitle}
                onChange={(e) => setLocalData({ ...localData, projectTitle: e.target.value })}
                className="w-full px-4 py-2.5 bg-canvas border border-border-soft rounded-xl text-sm text-navy focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#6E6A62] mb-1.5 font-bold">Next Major Milestone</label>
              <input
                type="text"
                value={nextMilestone}
                onChange={(e) => setLocalData({ ...localData, nextMilestone: e.target.value })}
                className="w-full px-4 py-2.5 bg-canvas border border-border-soft rounded-xl text-sm text-navy focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-mono uppercase text-[#6E6A62] font-bold">Material & Tool Checklist</label>
            <div className="space-y-1.5 max-h-[110px] overflow-y-auto pr-1">
              {checklist.map((item: string, idx: number) => (
                <div key={idx} className="flex justify-between items-center text-xs text-navy/85 p-2 bg-canvas rounded-lg border border-border-soft">
                  <span className="truncate">{item}</span>
                  <button
                    onClick={() => {
                      const updated = checklist.filter((_: any, i: number) => i !== idx);
                      setLocalData({ ...localData, materialChecklist: updated });
                    }}
                    className="text-rose text-[10px] font-bold cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="Add material..."
                className="flex-grow px-3 py-1.5 bg-canvas border border-border-soft rounded-xl text-xs text-navy"
              />
              <button
                onClick={() => {
                  if (!newItem.trim()) return;
                  const updated = [...checklist, newItem.trim()];
                  setLocalData({ ...localData, materialChecklist: updated });
                  setNewItem('');
                }}
                className="px-3 bg-sage-bg hover:bg-sage text-white text-xs rounded-xl font-bold cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        <div>
          <button
            onClick={() => triggerSave(localData)}
            className="px-6 py-2.5 bg-sage-bg hover:bg-sage text-white rounded-full text-xs font-bold cursor-pointer"
          >
            {isSaved ? 'Creation Saved ✓' : 'Save Project Details'}
          </button>
        </div>
      </div>
    );
  }

  if (areaName === 'Social life') {
    const socialGoal = localData.socialGoal || 'Weekly connection';
    const lastHangout = localData.lastHangout || 'Dinner with Sarah';
    const nextPlan = localData.nextPlan || 'Saturday stroll';

    return (
      <div className="bg-white border border-border-soft p-6 md:p-8 rounded-[32px] shadow-soft text-left space-y-6 animate-fade-in">
        <div>
          <span className="text-rose font-mono uppercase tracking-wider text-xs font-bold">Social Life</span>
          <h3 className="text-2xl font-serif text-navy font-bold mt-1">Conscious Gathering & Community</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-[#6E6A62] mb-1.5 font-bold">Community Connection Goal</label>
              <input
                type="text"
                value={socialGoal}
                onChange={(e) => setLocalData({ ...localData, socialGoal: e.target.value })}
                className="w-full px-4 py-2.5 bg-canvas border border-border-soft rounded-xl text-sm text-navy"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#6E6A62] mb-1.5 font-bold">Last Soul Connection</label>
              <input
                type="text"
                value={lastHangout}
                onChange={(e) => setLocalData({ ...localData, lastHangout: e.target.value })}
                className="w-full px-4 py-2.5 bg-canvas border border-border-soft rounded-xl text-sm text-navy"
              />
            </div>
          </div>

          <div className="bg-canvas border border-border-soft p-6 rounded-[24px] flex flex-col justify-center">
            <label className="block text-[10px] font-mono uppercase text-rose font-bold mb-1">Upcoming Sanctuary Plans</label>
            <textarea
              rows={2}
              value={nextPlan}
              onChange={(e) => setLocalData({ ...localData, nextPlan: e.target.value })}
              className="w-full p-2.5 bg-white border border-border-soft rounded-lg text-xs text-navy focus:outline-none focus:border-rose/30"
            />
          </div>
        </div>

        <div>
          <button
            onClick={() => triggerSave(localData)}
            className="px-6 py-2.5 bg-sage-bg hover:bg-sage text-white rounded-full text-xs font-bold cursor-pointer"
          >
            {isSaved ? 'Social Status Saved ✓' : 'Save Social Plans'}
          </button>
        </div>
      </div>
    );
  }

  if (areaName === "Habits I'm breaking") {
    const activeHabits = localData.activeHabits || ['Late-night screen time', 'Skipping stretching'];
    const currentStreakDays = localData.currentStreakDays || 0;
    const [newHabit, setNewHabit] = useState('');

    return (
      <div className="bg-white border border-border-soft p-6 md:p-8 rounded-[32px] shadow-soft text-left space-y-6 animate-fade-in">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-sage font-mono uppercase tracking-wider text-xs font-bold">Habit Breaking</span>
            <h3 className="text-2xl font-serif text-navy font-bold mt-1">Conscious Release & Freedom</h3>
          </div>
          <div className="bg-sage-bg/15 border border-sage/20 px-3.5 py-1.5 rounded-xl text-center">
            <span className="block text-[10px] font-mono text-sage uppercase tracking-wider font-bold">Streak</span>
            <span className="text-lg font-serif text-sage font-bold">{currentStreakDays} Days</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="block text-xs font-mono uppercase text-[#6E6A62] font-bold">Habits I Am Gently Releasing</label>
            <div className="space-y-1.5 max-h-[125px] overflow-y-auto pr-1">
              {activeHabits.map((hab: string, idx: number) => (
                <div key={idx} className="flex justify-between items-center text-xs text-navy/85 p-2 bg-canvas rounded-lg border border-border-soft">
                  <span className="truncate">{hab}</span>
                  <button
                    onClick={() => {
                      const updated = activeHabits.filter((_: any, i: number) => i !== idx);
                      setLocalData({ ...localData, activeHabits: updated });
                    }}
                    className="text-rose text-[10px] font-bold cursor-pointer"
                  >
                    Release
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newHabit}
                onChange={(e) => setNewHabit(e.target.value)}
                placeholder="New habit..."
                className="flex-grow px-3 py-1.5 bg-canvas border border-border-soft rounded-xl text-xs text-navy"
              />
              <button
                onClick={() => {
                  if (!newHabit.trim()) return;
                  const updated = [...activeHabits, newHabit.trim()];
                  setLocalData({ ...localData, activeHabits: updated });
                  setNewHabit('');
                }}
                className="px-3 bg-sage-bg hover:bg-sage text-white text-xs rounded-xl font-bold cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>

          <div className="bg-canvas border border-border-soft p-6 rounded-[24px] flex flex-col justify-center items-center text-center space-y-4">
            <span className="text-[10px] font-mono uppercase text-sage tracking-wider font-bold">Strengthen Release Streak</span>
            <button
              onClick={() => {
                const updated = { ...localData, currentStreakDays: currentStreakDays + 1 };
                triggerSave(updated);
              }}
              className="px-6 py-2.5 bg-sage-bg hover:bg-sage text-white rounded-full text-xs font-bold cursor-pointer flex items-center gap-1"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Gently Record Clean Day
            </button>
          </div>
        </div>

        <div>
          <button
            onClick={() => triggerSave(localData)}
            className="px-6 py-2.5 bg-sage-bg hover:bg-sage text-white rounded-full text-xs font-bold cursor-pointer"
          >
            {isSaved ? 'Habit Settings Saved ✓' : 'Save Habit List'}
          </button>
        </div>
      </div>
    );
  }

  if (areaName === 'Home / Living space') {
    const organizingArea = localData.organizingArea || 'Sanctuary Reading Nook';
    const declutterProgress = localData.declutterProgress || 50;
    const nextTask = localData.nextTask || 'Set up amber floor lamp';

    return (
      <div className="bg-white border border-border-soft p-6 md:p-8 rounded-[32px] shadow-soft text-left space-y-6 animate-fade-in">
        <div>
          <span className="text-sage font-mono uppercase tracking-wider text-xs font-bold">Home & Living Space</span>
          <h3 className="text-2xl font-serif text-navy font-bold mt-1">Interior Alignment & Coziness</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-[#6E6A62] mb-1.5 font-bold">Current Sanctuary Project Area</label>
              <input
                type="text"
                value={organizingArea}
                onChange={(e) => setLocalData({ ...localData, organizingArea: e.target.value })}
                className="w-full px-4 py-2.5 bg-canvas border border-border-soft rounded-xl text-sm text-navy"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#6E6A62] mb-1.5 font-bold">Next Housework Task</label>
              <input
                type="text"
                value={nextTask}
                onChange={(e) => setLocalData({ ...localData, nextTask: e.target.value })}
                className="w-full px-4 py-2.5 bg-canvas border border-border-soft rounded-xl text-sm text-navy"
              />
            </div>
          </div>

          <div className="bg-canvas border border-border-soft p-6 rounded-[24px] flex flex-col justify-center text-center">
            <span className="text-[10px] font-mono uppercase text-sage tracking-wider font-bold">Declutter & Clean Progress</span>
            <span className="text-3xl font-serif text-sage font-bold my-2">{declutterProgress}%</span>
            <input
              type="range"
              min="0"
              max="100"
              value={declutterProgress}
              onChange={(e) => setLocalData({ ...localData, declutterProgress: parseInt(e.target.value) })}
              className="w-full accent-sage"
            />
          </div>
        </div>

        <div>
          <button
            onClick={() => triggerSave(localData)}
            className="px-6 py-2.5 bg-sage-bg hover:bg-sage text-white rounded-full text-xs font-bold cursor-pointer"
          >
            {isSaved ? 'Home Design Saved ✓' : 'Save Living Space settings'}
          </button>
        </div>
      </div>
    );
  }

  if (areaName === 'Family') {
    const connectionGoal = localData.connectionGoal || 'Call siblings twice a week';
    const currentStreak = localData.currentStreak || 0;
    const familyNotes = localData.familyNotes || 'Planning mountain retreat...';

    return (
      <div className="bg-white border border-border-soft p-6 md:p-8 rounded-[32px] shadow-soft text-left space-y-6 animate-fade-in">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-rose font-mono uppercase tracking-wider text-xs font-bold">Family & Kin</span>
            <h3 className="text-2xl font-serif text-navy font-bold mt-1">Conscious Care & Deep Kinship</h3>
          </div>
          <div className="bg-rose-bg/15 border border-rose/20 px-3.5 py-1.5 rounded-xl text-center">
            <span className="block text-[10px] font-mono text-rose uppercase tracking-wider font-bold">Streak</span>
            <span className="text-lg font-serif text-rose font-bold">{currentStreak} Weeks</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-[#6E6A62] mb-1.5 font-bold">Kinship Connection Goal</label>
              <input
                type="text"
                value={connectionGoal}
                onChange={(e) => setLocalData({ ...localData, connectionGoal: e.target.value })}
                className="w-full px-4 py-2.5 bg-canvas border border-border-soft rounded-xl text-sm text-navy focus:outline-none"
              />
            </div>

            <div>
              <button
                onClick={() => {
                  const updated = { ...localData, currentStreak: currentStreak + 1 };
                  triggerSave(updated);
                }}
                className="w-full px-6 py-2.5 bg-rose-bg hover:bg-rose text-white rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Mark Weekly Call Done (+1 Streak)
              </button>
            </div>
          </div>

          <div className="bg-canvas border border-border-soft p-6 rounded-[24px] space-y-2">
            <span className="text-[10px] font-mono uppercase text-rose tracking-wider block font-bold">Conscious Notes & Anniversaries</span>
            <textarea
              rows={3}
              value={familyNotes}
              onChange={(e) => setLocalData({ ...localData, familyNotes: e.target.value })}
              className="w-full p-2.5 bg-white border border-border-soft rounded-lg text-xs text-navy focus:outline-none focus:border-rose/30"
            />
          </div>
        </div>

        <div>
          <button
            onClick={() => triggerSave(localData)}
            className="px-6 py-2.5 bg-sage-bg hover:bg-sage text-white rounded-full text-xs font-bold cursor-pointer"
          >
            {isSaved ? 'Family Aligned ✓' : 'Save Family Notes'}
          </button>
        </div>
      </div>
    );
  }

  // Fallback / General custom widget for all other life areas
  const textVal = localData.generalNotes || 'Record milestones and check list items.';
  const list = localData.customList || ['Write out next step action plan', 'Organize files'];
  const [newCustomItem, setNewCustomItem] = useState('');

  return (
    <div className="bg-white border border-border-soft p-6 md:p-8 rounded-[32px] shadow-soft text-left space-y-6">
      <div>
        <span className="text-sage font-mono uppercase tracking-wider text-xs font-bold">{areaName}</span>
        <h3 className="text-2xl font-serif text-navy font-bold mt-1">Goal Alignment Tracker</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase text-[#6E6A62] mb-1.5 font-bold">Action & Progress Notes</label>
            <textarea
              rows={4}
              value={textVal}
              onChange={(e) => setLocalData({ ...localData, generalNotes: e.target.value })}
              placeholder="What are your goals in this area?"
              className="w-full px-4 py-3 bg-canvas border border-border-soft rounded-xl text-sm text-navy focus:outline-none focus:border-sage-bg/30"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-mono uppercase text-[#6E6A62] font-bold">Action Items Checklist</label>
          <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
            {list.map((item: string, idx: number) => (
              <div key={idx} className="flex justify-between items-center text-xs text-navy/80 p-2.5 bg-canvas rounded-xl border border-border-soft">
                <span className="font-light truncate">{item}</span>
                <button
                  onClick={() => {
                    const updated = list.filter((_: any, i: number) => i !== idx);
                    setLocalData({ ...localData, customList: updated });
                  }}
                  className="text-rose hover:text-rose-bg text-xs cursor-pointer"
                >
                  <Trash className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newCustomItem}
              onChange={(e) => setNewCustomItem(e.target.value)}
              placeholder="Add action..."
              className="flex-grow px-3 py-2 bg-canvas border border-border-soft rounded-xl text-xs text-navy focus:outline-none focus:border-sage-bg/30"
            />
            <button
              onClick={() => {
                if (!newCustomItem.trim()) return;
                const updated = [...list, newCustomItem.trim()];
                setLocalData({ ...localData, customList: updated });
                setNewCustomItem('');
              }}
              className="px-3 bg-sage-bg hover:bg-sage text-white text-xs rounded-xl cursor-pointer font-bold"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      <div>
        <button
          onClick={() => triggerSave(localData)}
          className="px-6 py-2.5 bg-sage-bg hover:bg-sage text-white rounded-full text-xs font-bold cursor-pointer"
        >
          {isSaved ? 'Goals Saved ✓' : 'Save Goals'}
        </button>
      </div>
    </div>
  );
}
