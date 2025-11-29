import { verifyPassword } from '@/lib/auth/password';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { password, hash } = await request.json();

    if (!password || !hash) {
      return NextResponse.json(
        { error: 'Password and hash are required' },
        { status: 400 }
      );
    }

    const isValid = await verifyPassword(password, hash);

    return NextResponse.json({ isValid });
  } catch (error) {
    console.error('Password verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify password' },
      { status: 500 }
    );
  }
}
