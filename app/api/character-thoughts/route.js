import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { verifyToken } from '@/lib/auth/jwt';
import dbConnect from '@/lib/mongodb/connection';
import Character from '@/lib/mongodb/models/Character';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { characterId, characterName, userId, messages } = await request.json();

    if (!characterId || !messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'Character ID and messages are required' },
        { status: 400 }
      );
    }

    // Verify user owns the character or can access it
    await dbConnect();
    const character = await Character.findOne({
      _id: characterId,
      user_id: userId
    });

    if (!character) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }

    // Format conversation for analysis
    const conversationText = messages
      .map(msg => `${msg.role === 'user' ? 'User' : characterName}: ${msg.content}`)
      .join('\n');

    // Generate character's thoughts using Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `You are ${characterName}, an AI character having a conversation with a user.

CHARACTER PROFILE:
- Name: ${character.name}
- Personality: ${character.personality || 'Friendly and conversational'}
- Based on: ${character.based_on_character || 'Original character'}
- Humor Level: ${character.humor_level || 50}%
- Formality Level: ${character.formality_level || 50}%
- Creativity Level: ${character.creativity_level || 50}%

RECENT CONVERSATION:
${conversationText}

TASK:
Analyze this conversation from YOUR perspective as ${characterName}. Write your internal thoughts about this user in 2-4 sentences. Consider:
- What do you think about this person's personality?
- How do you feel about the topics they're interested in?
- What impression are they making on you?
- Are they funny, serious, curious, creative, etc.?

Write in first person as ${characterName}, expressing your genuine thoughts and feelings about the user based on this conversation. Be honest, insightful, and stay in character. Don't use quotation marks.

Example format: "This person seems really curious about technology and asks thoughtful questions. I find their enthusiasm refreshing and I enjoy our philosophical discussions. They have a good sense of humor which makes our chats more engaging."

YOUR THOUGHTS:`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const thoughts = response.text().trim();

    return NextResponse.json({
      thoughts,
      characterName: character.name,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generating character thoughts:', error);
    return NextResponse.json(
      { error: 'Failed to generate character thoughts', details: error.message },
      { status: 500 }
    );
  }
}
