import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb/connection';
import Memory from '@/lib/mongodb/models/Memory';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const characterId = searchParams.get('characterId');
    const userId = searchParams.get('userId');

    if (!characterId || !userId) {
      return NextResponse.json(
        { error: 'Missing characterId or userId' },
        { status: 400 }
      );
    }

    await connectDB();
    
    // Get all memories for this character
    const memories = await Memory.find({
      character_id: characterId,
      user_id: userId
    })
      .sort({ created_at: -1 })
      .lean();

    return NextResponse.json({
      characterId,
      userId,
      totalMemories: memories?.length || 0,
      memories: memories.map(mem => ({
        id: mem._id.toString(),
        content: mem.content,
        importance: mem.importance,
        created_at: mem.created_at
      }))
    });

  } catch (error) {
    console.error('View memories error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch memories' },
      { status: 500 }
    );
  }
}
