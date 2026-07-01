import { GoogleGenAI } from '@google/genai';

const LIFE_AREAS = [
  'Faith / Spirituality',
  'Fitness & Health',
  'Career / Job',
  'Business / Side hustle',
  'Finances',
  'Relationships',
  'Moving / Housing',
  'Education / School',
  'Mental health',
  'Sleep & Recovery',
  'Nutrition & Diet',
  'Certifications / Learning',
  'Creativity / Projects',
  'Social life',
  'Travel',
  "Habits I'm breaking",
  'Home / Living space',
  'Pets',
  'Family'
];

export interface ParsedIntake {
  name: string;
  email: string;
  selected_areas: string[];
  data: Record<string, any>;
}

// Fallback manual parser if Gemini is unavailable
function fallbackParse(text: string): ParsedIntake {
  const lines = text.split('\n');
  let name = 'New User';
  let email = '';
  const selected_areas: string[] = [];

  // Simple regex matching for name and email
  for (const line of lines) {
    if (/name\s*:/i.test(line)) {
      name = line.split(/:\s*/)[1]?.trim() || name;
    }
    if (/email\s*:/i.test(line)) {
      email = line.split(/:\s*/)[1]?.trim() || email;
    }
  }

  // Scan text to see which area names are present or mentioned
  for (const area of LIFE_AREAS) {
    const escapedArea = area.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedArea, 'i');
    if (regex.test(text)) {
      selected_areas.push(area);
    }
  }

  // Create sensible defaults for selected areas
  const data: Record<string, any> = {};
  selected_areas.forEach(area => {
    if (area === 'Faith / Spirituality') {
      data[area] = { todayPrayer: 'Align with purpose', prayerJournal: 'Seeking quiet stillness and gratitude.', streak: 0 };
    } else if (area === 'Fitness & Health') {
      data[area] = { workoutType: 'Cardio & Strength', weeklyTarget: 3, consistency: [false, false, false, false, false, false, false], countdownEvent: 'Sanctuary Challenge', countdownDate: '' };
    } else if (area === 'Pets') {
      data[area] = { petsList: 'Companion animals', medsReminder: 'Standard care schedule', vetAppt: '' };
    } else if (area === 'Business / Side hustle') {
      data[area] = { currentPhase: 'Validation', nextStep: 'Define target niche', pipeline: ['Ideation', 'Validation', 'Prototyping', 'Launch'] };
    } else if (area === 'Finances') {
      data[area] = { savingsGoal: 10000, currentSavings: 0, revenueTracker: 0, budgetSnapshot: { rent: 1500, food: 400, transport: 200 } };
    } else if (area === 'Travel') {
      data[area] = { bucketList: [], nextTrip: '', tripDate: '' };
    } else if (area === 'Relationships') {
      data[area] = { checkInReminder: 'Keep in touch', importantDates: [] };
    } else if (area === 'Mental health') {
      data[area] = { mood: 'Calm', notes: 'Entering a sanctuary space.', habitsBreaking: [] };
    } else if (area === 'Sleep & Recovery') {
      data[area] = { sleepGoal: 8, averageSleep: 7, nightlyHabits: [] };
    } else if (area === 'Career / Job') {
      data[area] = { jobStatus: 'Exploring opportunities', targetTitle: '', resumeSentCount: 0, interviewScheduled: '' };
    } else if (area === 'Moving / Housing') {
      data[area] = { targetLocation: '', searchStatus: 'Exploring', maxBudget: 3000, nextTask: '' };
    } else if (area === 'Education / School') {
      data[area] = { currentClass: '', currentGpa: '4.0', assignmentsDue: [] };
    } else if (area === 'Nutrition & Diet') {
      data[area] = { dietStyle: 'Balanced diet', dailyWaterGoal: 3, waterLogged: 0, mealPrepDay: 'Sunday prep' };
    } else if (area === 'Certifications / Learning') {
      data[area] = { activeCert: '', completionPercent: 0, nextQuizDate: '' };
    } else if (area === 'Creativity / Projects') {
      data[area] = { projectTitle: '', nextMilestone: '', materialChecklist: [] };
    } else if (area === 'Social life') {
      data[area] = { socialGoal: 'Regular connection', lastHangout: '', nextPlan: '' };
    } else if (area === "Habits I'm breaking") {
      data[area] = { activeHabits: [], currentStreakDays: 0 };
    } else if (area === 'Home / Living space') {
      data[area] = { organizingArea: 'Primary space', declutterProgress: 0, nextTask: '' };
    } else if (area === 'Family') {
      data[area] = { connectionGoal: 'Keep in touch', currentStreak: 0, familyNotes: '' };
    }
  });

  return { name, email, selected_areas, data };
}

export async function parseWithGeminiOrFallback(text: string): Promise<ParsedIntake> {
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (!geminiApiKey || geminiApiKey === 'MY_GEMINI_API_KEY' || geminiApiKey === '') {
    console.log('[INTAKE PARSER] No active Gemini key, running fallback text parser.');
    return fallbackParse(text);
  }

  try {
    const ai = new GoogleGenAI({ apiKey: geminiApiKey });
    const prompt = `
      You are an elite, highly precise JSON parser for Hemby Point Sanctuary (a luxury mindfulness life dashboard application).
      Your job is to read unstructured user answers from their Intake Form and translate them into a strictly formatted JSON object.
      
      The user's raw intake text is:
      """
      ${text}
      """

      You MUST extract:
      1. "name": The user's name (default to "Friend" if not found)
      2. "email": The user's email (default to empty string if not found)
      3. "selected_areas": Which of the following 19 possible life areas are selected or discussed in the text. Return exactly the subset of strings matching these 19 names:
         'Faith / Spirituality', 'Fitness & Health', 'Career / Job', 'Business / Side hustle', 'Finances', 'Relationships', 'Moving / Housing', 'Education / School', 'Mental health', 'Sleep & Recovery', 'Nutrition & Diet', 'Certifications / Learning', 'Creativity / Projects', 'Social life', 'Travel', "Habits I'm breaking", 'Home / Living space', 'Pets', 'Family'
         
      4. "data": For each of the "selected_areas", translate their free-text answers into sensible structured objects matching these schemas.
         Here is the schema mapping for each area:
         - 'Faith / Spirituality' => { todayPrayer: string (the practice), prayerJournal: string, streak: number }
         - 'Fitness & Health' => { workoutType: string, weeklyTarget: number, consistency: boolean[] (exactly 7 values), countdownEvent: string, countdownDate: string }
         - 'Career / Job' => { jobStatus: string, targetTitle: string, resumeSentCount: number, interviewScheduled: string }
         - 'Business / Side hustle' => { currentPhase: string, nextStep: string, pipeline: string[] }
         - 'Finances' => { savingsGoal: number, currentSavings: number, revenueTracker: number, budgetSnapshot: { rent: number, food: number, transport: number } }
         - 'Relationships' => { checkInReminder: string, importantDates: Array<{ name: string, date: string }> }
         - 'Moving / Housing' => { targetLocation: string, searchStatus: string, maxBudget: number, nextTask: string }
         - 'Education / School' => { currentClass: string, currentGpa: string, assignmentsDue: string[] }
         - 'Mental health' => { mood: string, notes: string, habitsBreaking: string[] }
         - 'Sleep & Recovery' => { sleepGoal: number, averageSleep: number, nightlyHabits: string[] }
         - 'Nutrition & Diet' => { dietStyle: string, dailyWaterGoal: number, waterLogged: number, mealPrepDay: string }
         - 'Certifications / Learning' => { activeCert: string, completionPercent: number, nextQuizDate: string }
         - 'Creativity / Projects' => { projectTitle: string, nextMilestone: string, materialChecklist: string[] }
         - 'Social life' => { socialGoal: string, lastHangout: string, nextPlan: string }
         - 'Travel' => { bucketList: string[], nextTrip: string, tripDate: string }
         - "Habits I'm breaking" => { activeHabits: string[], currentStreakDays: number }
         - 'Home / Living space' => { organizingArea: string, declutterProgress: number, nextTask: string }
         - 'Pets' => { petsList: string, medsReminder: string, vetAppt: string }
         - 'Family' => { connectionGoal: string, currentStreak: number, familyNotes: string }

      Translate free-text answers intelligently!
      Example: If they write "trying to save 10k by December" under money goals, map under 'Finances' as: { savingsGoal: 10000, currentSavings: 1500, budgetSnapshot: { rent: 1500, food: 400, transport: 200 } }.
      Example: If they list pets with vet dates, prefill 'Pets' with pet names and vet visit.

      You MUST respond with a valid JSON document ONLY, adhering to the structure described.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const parsedJson = JSON.parse(response.text || '{}');
    
    // Validate result and return
    return {
      name: parsedJson.name || 'Friend',
      email: parsedJson.email || '',
      selected_areas: Array.isArray(parsedJson.selected_areas) ? parsedJson.selected_areas : [],
      data: parsedJson.data || {}
    };
  } catch (err) {
    console.error('[GEMINI INTAKE PARSER] Failed to parse with Gemini, falling back:', err);
    return fallbackParse(text);
  }
}
