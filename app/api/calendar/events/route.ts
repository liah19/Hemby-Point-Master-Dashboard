import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getUserDashboard } from '../../../lib/db';
import { fetchTodayCalendarEvents } from '../../../lib/google-calendar';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt((session.user as any).id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 400 });
    }

    const dashboard = await getUserDashboard(userId);
    if (!dashboard || !dashboard.data?.google_calendar_tokens) {
      return NextResponse.json({ events: [], connected: false });
    }

    const events = await fetchTodayCalendarEvents(dashboard.data.google_calendar_tokens, userId, dashboard.data);
    return NextResponse.json({ events, connected: true });
  } catch (err: any) {
    console.error('Calendar events API error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
