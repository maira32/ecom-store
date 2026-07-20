import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { adminAuth } from '@/lib/firebase-admin';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !(session.user as any).id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const token = await adminAuth.createCustomToken((session.user as any).id);

  return NextResponse.json({ token }, { status: 200 });
}