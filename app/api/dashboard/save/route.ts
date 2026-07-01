import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { saveUserDashboard, updateUserBriefingSettings } from '../../../lib/db';

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

    const body = await req.json();
    const { selectedAreas, data, phone, briefingOptIn, briefingTime } = body;

    // Validate selectedAreas is an array
    if (!Array.isArray(selectedAreas)) {
      return NextResponse.json({ error: 'selectedAreas must be an array' }, { status: 400 });
    }

    // Save dashboard data
    const dashboard = await saveUserDashboard(userId, selectedAreas, data || {});

    // Update briefing settings if provided
    if (phone !== undefined || briefingOptIn !== undefined || briefingTime !== undefined) {
      await updateUserBriefingSettings(
        userId,
        phone || '',
        !!briefingOptIn,
        briefingTime || '07:00'
      );
    }

    return NextResponse.json({
      message: 'Dashboard saved successfully',
      dashboard: {
        selected_areas: dashboard.selected_areas,
        data: dashboard.data,
      }
    });
  } catch (err: any) {
    console.error('Save dashboard API error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
