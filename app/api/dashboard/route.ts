import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { getUserDashboard, getUserById } from '../../lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt((session.user as any).id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user session' }, { status: 400 });
    }

    const userDetails = await getUserById(userId);
    const dashboard = await getUserDashboard(userId);

    return NextResponse.json({
      user: {
        id: userDetails?.id,
        email: userDetails?.email,
        name: userDetails?.name,
        phone: userDetails?.phone,
        briefing_opt_in: userDetails?.briefing_opt_in,
        briefing_time: userDetails?.briefing_time,
      },
      dashboard: dashboard ? {
        selected_areas: dashboard.selected_areas,
        data: dashboard.data,
      } : null,
    });
  } catch (err: any) {
    console.error('Fetch dashboard API error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
