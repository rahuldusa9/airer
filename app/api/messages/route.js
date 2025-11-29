import { NextResponse } from 'next/server';
import { getMessages } from '@/lib/db/api';
import { verifyToken } from '@/lib/auth/jwt';

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    const { searchParams } = new URL(request.url);
    const characterId = searchParams.get('characterId');
    
    if (!characterId) {
      return NextResponse.json({ error: 'Character ID required' }, { status: 400 });
    }
    
    const messages = await getMessages(characterId, decoded.userId);
    
    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json({ error: 'Failed to get messages' }, { status: 500 });
  }
}
