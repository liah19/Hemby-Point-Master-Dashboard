import { getUserDashboard, saveUserDashboard } from './db';

// Helper to refresh Google OAuth access token
export async function refreshGoogleAccessToken(refreshToken: string): Promise<string | null> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return null;
  }

  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      console.error('[GOOGLE CALENDAR] Token refresh failed:', await response.text());
      return null;
    }

    const data = await response.json();
    return data.access_token;
  } catch (err) {
    console.error('[GOOGLE CALENDAR] Token refresh exception:', err);
    return null;
  }
}

// Fetch Google Calendar events for today
export async function fetchTodayCalendarEvents(tokens: any, userId: number, dashboardData: any): Promise<any[]> {
  if (tokens.is_mock) {
    const todayStr = new Date().toISOString().split('T')[0];
    return [
      { id: 'mock-1', summary: 'Morning Prayer & Reflection', start: { dateTime: `${todayStr}T07:30:00` }, end: { dateTime: `${todayStr}T08:00:00` } },
      { id: 'mock-2', summary: 'Hemby Point Core Team Sync', start: { dateTime: `${todayStr}T10:00:00` }, end: { dateTime: `${todayStr}T11:00:00` } },
      { id: 'mock-3', summary: 'Gym Workout Session', start: { dateTime: `${todayStr}T17:30:00` }, end: { dateTime: `${todayStr}T18:30:00` } },
    ];
  }

  let accessToken = tokens.access_token;

  // Refresh if expired (or close to expiring)
  if (tokens.expiry_date && Date.now() > tokens.expiry_date - 60000 && tokens.refresh_token) {
    const newAccessToken = await refreshGoogleAccessToken(tokens.refresh_token);
    if (newAccessToken) {
      accessToken = newAccessToken;
      // Update stored tokens
      tokens.access_token = newAccessToken;
      tokens.expiry_date = Date.now() + 3600 * 1000;
      await saveUserDashboard(userId, dashboardData.selected_areas || [], {
        ...dashboardData,
        google_calendar_tokens: tokens,
      });
    }
  }

  try {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(now.setHours(23, 59, 59, 999)).toISOString();

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(
        startOfDay
      )}&timeMax=${encodeURIComponent(endOfDay)}&singleEvents=true&orderBy=startTime`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      console.warn('[GOOGLE CALENDAR] API fetch events failed, using fallback.');
      return [];
    }

    const data = await response.json();
    return data.items || [];
  } catch (err) {
    console.error('[GOOGLE CALENDAR] Exception while fetching calendar events:', err);
    return [];
  }
}
