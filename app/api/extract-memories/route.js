import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb/connection';
import Message from '@/lib/mongodb/models/Message';
import { processConversationMemories } from '@/lib/memory';

export async function POST(request) {
  try {
    const { characterId, userId, characterName } = await request.json();

    if (!characterId || !userId || !characterName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get recent messages
    await connectDB();
    const messages = await Message.find({
      character_id: characterId,
      user_id: userId
    })
      .select('role content')
      .sort({ created_at: -1 })
      .limit(20)
      .lean();

    if (!messages || messages.length < 4) {
      return NextResponse.json({ 
        message: 'Not enough messages for memory extraction',
        memoriesSaved: 0 
      });
    }

    // Extract and save memories
    const savedMemories = await processConversationMemories(
      characterId,
      userId,
      messages.reverse(),
      characterName
    );

    return NextResponse.json({
      success: true,
      memoriesSaved: savedMemories.length,
      memories: savedMemories.map(m => m.content)
    });

  } catch (error) {
    console.error('Memory extraction API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to extract memories' },
      { status: 500 }
    );
  }
}
