import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { getUserById, getUserDashboard, saveUserDashboard } from '../../../lib/db';
import { fetchTodayCalendarEvents } from '../../../lib/google-calendar';

export async function GET(req: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId: rawUserId } = await params;
    const userId = parseInt(rawUserId);
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const dashboard = await getUserDashboard(userId);
    if (!dashboard) {
      return NextResponse.json({
        error: 'No dashboard setup. Complete onboarding first.',
      });
    }

    const selectedAreas = dashboard.selected_areas || [];
    const areaData = dashboard.data || {};

    // 1. Fetch Google Calendar items if connected
    let calendarEvents: any[] = [];
    if (areaData.google_calendar_tokens) {
      calendarEvents = await fetchTodayCalendarEvents(areaData.google_calendar_tokens, userId, areaData);
    }

    // 2. Format calendar summaries for text briefing
    const calendarText = calendarEvents.length > 0
      ? calendarEvents
          .map((evt) => {
            const dateStr = evt.start?.dateTime || evt.start?.date || '';
            const timeStr = dateStr ? new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'All Day';
            return `- ${timeStr}: ${evt.summary}`;
          })
          .join('\n')
      : 'No scheduled appointments today.';

    // 3. Extract key details per selected life area for context
    const dataContext: Record<string, any> = {};
    selectedAreas.forEach((area) => {
      dataContext[area] = areaData[area] || {};
    });

    // 4. Construct personalized text briefing using Gemini (if key available) or fallback
    let briefingText = '';
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (geminiApiKey && geminiApiKey !== 'MY_GEMINI_API_KEY' && geminiApiKey !== '') {
      try {
        const ai = new GoogleGenAI({ apiKey: geminiApiKey });
        const prompt = `
          You are the serene, supportive guide of "Hemby Point Sanctuary" (a personal life dashboard application).
          Write a warm, grounding, and concise morning text briefing for ${user.name || 'Friend'}.
          Use elegant, calming language, utilizing a cozy cream, gold, and sage palette style conceptually (grounding, serene, supportive).

          Today's Google Calendar Agenda:
          ${calendarText}

          Here are their selected Life Areas and their current states/logged values:
          ${JSON.stringify(dataContext, null, 2)}

          Please write a beautifully tailored morning summary.
          - Greet them warmly and reference the sanctuary atmosphere.
          - Structure it with clear, aesthetic text separators (e.g. ✦ [Area Name] ✦).
          - Synthesize ONLY their active areas (such as Faith, Fitness, Pets, Business, etc.). Keep it actionable yet peaceful.
          - Keep the total length around 350-450 words, suitable for a text message or premium card.
          - Do not output any HTML, JSON or Markdown headers. Just use plain text with nice formatting and spacing.
        `;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        briefingText = response.text || '';
      } catch (err) {
        console.error('[GEMINI BRIEFING] Error calling Gemini API, using programmatic briefing:', err);
      }
    }

    // If Gemini was not used or failed, generate programmatically
    if (!briefingText) {
      const greetings = [
        `Good morning, ${user.name || 'friend'}. Welcome back to your Hemby Point Sanctuary. Take a deep, grounding breath.`,
        `Welcome to a fresh morning, ${user.name || 'friend'}. Step into your Sanctuary. Today is a canvas for your growth.`,
        `Peace be with you this morning, ${user.name || 'friend'}. Your Sanctuary is ready for you. Let's ground ourselves in intent.`
      ];
      const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];

      let textParts = [randomGreeting, '\n✦ TODAY\'S SCHEDULE ✦', calendarText];

      selectedAreas.forEach((area) => {
        const data = areaData[area] || {};
        if (area === 'Faith / Spirituality') {
          const prayer = data.todayPrayer || data.prayerJournal || 'Ground yourself in gratitude.';
          const streak = data.streak || 0;
          textParts.push(`\n✦ FAITH & SPIRITUALITY ✦\nPrayer/Reflect: "${prayer}"\nConsecutive Days: ${streak} days`);
        } else if (area === 'Fitness & Health') {
          const workout = data.workoutType || 'Active recovery / Walk';
          const countdown = data.countdownEvent ? `${data.countdownEvent} is approaching.` : '';
          textParts.push(`\n✦ FITNESS & HEALTH ✦\nTarget Focus: ${workout}\n${countdown}`);
        } else if (area === 'Pets') {
          const pets = data.petsList || 'Your animal companions';
          const reminder = data.medsReminder || 'Check routine care & feed.';
          textParts.push(`\n✦ PET CARE ✦\nCompanions: ${pets}\nCare Tasks: ${reminder}`);
        } else if (area === 'Business / Side hustle') {
          const phase = data.currentPhase || 'Refining details';
          const nextStep = data.nextStep || 'Take one bold action today.';
          textParts.push(`\n✦ BUSINESS & SIDE HUSTLE ✦\nPhase: ${phase}\nAction Item: ${nextStep}`);
        } else if (area === 'Finances') {
          const savings = data.savingsGoal ? `Targeting: $${data.savingsGoal}` : 'Keep tabs on budgets.';
          textParts.push(`\n✦ FINANCES ✦\nSavings Goal: ${savings}`);
        } else if (area === 'Relationships') {
          const reminder = data.checkInReminder || 'Message a close friend / loved one today.';
          textParts.push(`\n✦ RELATIONSHIPS ✦\nConnection: ${reminder}`);
        } else if (area === 'Mental health') {
          const mood = data.mood || 'Hopeful';
          const note = data.notes || 'Be kind to your thoughts.';
          textParts.push(`\n✦ MENTAL HEALTH ✦\nCurrent Mood: ${mood}\nReflection: ${note}`);
        } else if (area === 'Sleep & Recovery') {
          const goal = data.sleepGoal || '8 hours';
          textParts.push(`\n✦ SLEEP & RECOVERY ✦\nTarget Sleep: ${goal}`);
        } else {
          textParts.push(`\n✦ ${area.toUpperCase()} ✦\nStay intentional and aligned with your goals.`);
        }
      });

      textParts.push('\nMay you walk with peace and focus today. Your Hemby Sanctuary awaits.');
      briefingText = textParts.join('\n');
    }

    return NextResponse.json({ briefing: briefingText });
  } catch (err: any) {
    console.error('Briefing API error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
