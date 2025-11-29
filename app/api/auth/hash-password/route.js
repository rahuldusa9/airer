import { hashPassword } from '@/lib/auth/password';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    return NextResponse.json({ hashedPassword });
  } catch (error) {
    console.error('Password hashing error:', error);
    return NextResponse.json(
      { error: 'Failed to hash password' },
      { status: 500 }
    );
  }
}
