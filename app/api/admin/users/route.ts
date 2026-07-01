import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getAllUsers, deleteUser } from '../../../lib/db';

function isAdminEmail(email: string | null | undefined) {
  const adminEmail = (process.env.ADMIN_EMAIL || 'hembypointadvisory@gmail.com').toLowerCase();
  return email?.toLowerCase() === adminEmail;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !isAdminEmail(session.user.email)) {
    return NextResponse.json({ error: 'Access Denied: Admin account only' }, { status: 403 });
  }

  const users = await getAllUsers();
  return NextResponse.json({ users });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !isAdminEmail(session.user.email)) {
    return NextResponse.json({ error: 'Access Denied: Admin account only' }, { status: 403 });
  }

  const { userId } = await req.json();
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  await deleteUser(userId);
  return NextResponse.json({ success: true });
}
