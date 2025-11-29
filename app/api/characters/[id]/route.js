import { NextResponse } from 'next/server';
import { getCharacter, deleteCharacter } from '@/lib/db/api';
import { verifyToken } from '@/lib/auth/jwt';

export async function GET(request, { params }) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await verifyToken(token);
    const { id } = await params;
    
    const character = await getCharacter(id);
    
    return NextResponse.json({ character });
  } catch (error) {
    console.error('Get character error:', error);
    return NextResponse.json({ error: 'Failed to get character' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await verifyToken(token);
    const { id } = await params;
    
    await deleteCharacter(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete character error:', error);
    return NextResponse.json({ error: 'Failed to delete character' }, { status: 500 });
  }
}
