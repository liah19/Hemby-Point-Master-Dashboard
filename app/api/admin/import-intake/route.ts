import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getUserByEmail, createUser, saveUserDashboard } from '../../../lib/db';
import { parseWithGeminiOrFallback } from '../../../lib/intake-parser';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    // 1. Authenticate session & authorize admin (aliahhemby@gmail.com)
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const email = session.user.email?.toLowerCase();
    if (email !== 'aliahhemby@gmail.com') {
      return NextResponse.json({ error: 'Access Denied: Admin account only' }, { status: 403 });
    }

    // 2. Parse request payload
    const body = await req.json();
    let parsedData: { name: string; email: string; selected_areas: string[]; data: Record<string, any> };

    if (body.text) {
      // Raw unstructured text was provided - use the AI parser
      parsedData = await parseWithGeminiOrFallback(body.text);
    } else {
      // Structured payload was provided directly
      parsedData = {
        name: body.name || 'Friend',
        email: body.email || '',
        selected_areas: Array.isArray(body.selected_areas) ? body.selected_areas : [],
        data: body.data || {}
      };
    }

    if (!parsedData.email) {
      return NextResponse.json({ error: 'Missing user email in intake payload' }, { status: 400 });
    }

    // 3. Find or create the user account by email
    let targetUser = await getUserByEmail(parsedData.email);
    let isNewUser = false;

    if (!targetUser) {
      isNewUser = true;
      // Generate a strong default password (they can reset or sign in with OAuth / credentials later)
      const passwordHash = await bcrypt.hash('Sanctuary2026!', 10);
      targetUser = await createUser({
        email: parsedData.email,
        passwordHash,
        name: parsedData.name
      });
    }

    // 4. Set selected areas and pre-populate dashboard JSONB data
    const dashboard = await saveUserDashboard(
      targetUser.id,
      parsedData.selected_areas,
      parsedData.data
    );

    return NextResponse.json({
      success: true,
      message: isNewUser ? 'Created user account and seeded dashboard' : 'Matched existing user and pre-populated dashboard',
      user: {
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
        isNewUser
      },
      dashboard: {
        selected_areas: dashboard.selected_areas,
        data: dashboard.data
      }
    });

  } catch (err: any) {
    console.error('[ADMIN IMPORT API ERROR]:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
