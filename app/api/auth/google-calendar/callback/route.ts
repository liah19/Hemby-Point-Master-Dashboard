import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../[...nextauth]/route';
import { getUserDashboard, saveUserDashboard } from '../../../../lib/db';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt((session.user as any).id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user session' }, { status: 400 });
    }

    const { code } = await req.json();
    if (!code) {
      return NextResponse.json({ error: 'Authorization code is required' }, { status: 400 });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret || clientId === 'your-google-client-id.apps.googleusercontent.com') {
      console.warn('[GOOGLE CALENDAR] Missing or default GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET. Simulating connection.');
      // Simulate successful connection since credentials might not be configured yet
      const dashboard = await getUserDashboard(userId);
      const existingData = dashboard?.data || {};
      const updatedData = {
        ...existingData,
        google_calendar_tokens: {
          access_token: 'mock_access_token_123',
          refresh_token: 'mock_refresh_token_123',
          expiry_date: Date.now() + 3600 * 1000,
          is_mock: true
        }
      };
      await saveUserDashboard(userId, dashboard?.selected_areas || [], updatedData);
      return NextResponse.json({ message: 'Mock Google Calendar connected successfully (Demo Mode)' });
    }

    // Exchange code for tokens
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: 'postmessage', // Very important for Google Identity Services popup client
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[GOOGLE CALENDAR] Token exchange failed:', errorText);
      return NextResponse.json({ error: 'Failed to exchange authorization code: ' + errorText }, { status: 500 });
    }

    const tokens = await response.json();
    
    // Save tokens in user dashboard data
    const dashboard = await getUserDashboard(userId);
    const existingData = dashboard?.data || {};
    const updatedData = {
      ...existingData,
      google_calendar_tokens: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || existingData.google_calendar_tokens?.refresh_token, // refresh token is only sent on first consent
        expiry_date: Date.now() + (tokens.expires_in * 1000),
      }
    };

    await saveUserDashboard(userId, dashboard?.selected_areas || [], updatedData);

    return NextResponse.json({ message: 'Google Calendar connected successfully!' });
  } catch (err: any) {
    console.error('Google Calendar callback API error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
