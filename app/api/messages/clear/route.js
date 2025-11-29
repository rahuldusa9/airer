import { NextResponse } from 'next/server';
import { clearChat } from '@/lib/db/api';
import { verifyToken } from '@/lib/auth/jwt';

export async function DELETE(request) {
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
    
    await clearChat(characterId, decoded.userId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Clear chat error:', error);
    return NextResponse.json({ error: 'Failed to clear chat' }, { status: 500 });
  }
}
