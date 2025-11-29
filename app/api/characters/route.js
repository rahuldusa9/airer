import { NextResponse } from 'next/server';
import { createCharacter, getCharacters } from '@/lib/db/api';
import { verifyToken } from '@/lib/auth/jwt';

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    const characters = await getCharacters(decoded.userId);
    
    return NextResponse.json({ characters });
  } catch (error) {
    console.error('Get characters error:', error);
    return NextResponse.json({ error: 'Failed to get characters' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    const body = await request.json();
    
    const characterData = {
      ...body,
      user_id: decoded.userId
    };
    
    const character = await createCharacter(characterData);
    
    return NextResponse.json({ character });
  } catch (error) {
    console.error('Create character error:', error);
    return NextResponse.json({ error: 'Failed to create character' }, { status: 500 });
  }
}
