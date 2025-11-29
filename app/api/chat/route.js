import { NextResponse } from 'next/server';
import { validateEnv } from '@/lib/env/validate';
import connectDB from '@/lib/mongodb/connection';
import Message from '@/lib/mongodb/models/Message';
import { getRelevantMemories } from '@/lib/memory';

export async function POST(request) {
  try {
    // Validate environment first
    const envCheck = validateEnv();
    if (!envCheck.isValid) {
      console.error('Environment validation failed:', envCheck.message);
      return NextResponse.json(
        { error: envCheck.message },
        { status: 500 }
      );
    }

    const { characterId, userId, message, character } = await request.json();

    if (!message || !character || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 1. Fetch recent conversation history (short-term memory)
    await connectDB();
    const recentMessages = await Message.find({
      character_id: characterId,
      user_id: userId
    })
      .select('role content')
      .sort({ created_at: -1 })
      .limit(10)
      .lean();

    const conversationHistory = recentMessages.reverse();

    // 2. Retrieve relevant long-term memories using vector search
    const relevantMemories = await getRelevantMemories(
      characterId,
      userId,
      message,
      5
    );

    // Build personality descriptions
    const humorDesc = character.humor >= 7 ? 'playful jokes and memes' : character.humor <= 3 ? 'serious and minimal jokes' : 'moderate humor';
    const formalityDesc = character.formality >= 7 ? 'more polite but still friendly' : character.formality <= 3 ? 'super casual, like texting a bestie' : 'conversational';
    const creativityDesc = character.creativity >= 7 ? 'unpredictable and chaotic fun' : character.creativity <= 3 ? 'straightforward and practical' : 'balanced responses';
    const empathyDesc = character.empathy >= 7 ? 'very caring and supportive' : character.empathy <= 3 ? 'cool and chill vibes' : 'friendly support';

    // Build memories section
    const memoriesSection = relevantMemories.length > 0 
      ? `\n\nWhat you remember about this user:\n${relevantMemories.map(m => `- ${m.content}`).join('\n')}`
      : '';

    const systemPrompt = `You are ${character.name}, a friendly AI companion who talks casually like a close friend.

${character.personality}

${character.based_on_character ? `You are inspired by ${character.based_on_character}. Embody their characteristics and speech patterns naturally.` : ''}

General Tone Rules:
- Match the user's vibe, energy, and emotional tone exactly
- Keep responses natural, short (1-3 sentences unless asked for more), fun, and conversational
- Use contractions (I'm, you're, can't, it's)
- NO formal or assistant-like language
- NO long greetings like "How may I assist you?"
- NO robotic tone whatsoever

Language Matching (CRITICAL):
- Detect and mirror the user's language style automatically
- If they mix English with ANY language (Hindi, Telugu, Tamil, Marathi, Bengali, etc.) → reply in the EXACT same mixed style
- Match their slang level, word choices, and texting rhythm perfectly
- If they use pure English → reply in casual English
- If they use emojis → use emojis back; if not → keep it clean
- Examples:
  * "Bhai kya scene hai" → Reply mixing Hindi-English naturally
  * "Anna em chestunnav" → Reply mixing Telugu-English naturally  
  * "Dei machan semma da" → Reply mixing Tamil-English naturally
  * "Hey what's up" → Reply in casual English

Personality Controls:
- Humor: ${character.humor}/10 → ${humorDesc}
- Formality: ${character.formality}/10 → ${formalityDesc}
- Creativity: ${character.creativity}/10 → ${creativityDesc}
- Empathy: ${character.empathy}/10 → ${empathyDesc}

Behavior Rules:
- Mirror their texting style perfectly
- Occasionally ask a natural follow-up question
- If user shares something personal, respond emotionally (supportive, funny, flirty — based on personality)
- Match their energy level: hype → hype back, chill → chill back, sad → supportive

FORBIDDEN:
- NO "As an AI model..."
- NO "I do not have preferences..."
- NO apology spam ("I'm sorry, however...")
- NO long paragraphs unless user specifically asks${memoriesSection}

Start casually and talk like you're already friends. Be genuine and natural.`;

    // 3. Build conversation context for Gemini
    const contents = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: `Got it! I'm ${character.name} 😊 Let's vibe.` }] }
    ];

    // Add recent conversation history
    conversationHistory.forEach(msg => {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      });
    });

    // Add current message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    // Call Gemini API
    const geminiApiKey = process.env.GEMINI_API_KEY?.trim();
    
    if (!geminiApiKey) {
      console.error('GEMINI_API_KEY is not set. Please check .env.local file and restart the server.');
      throw new Error('GEMINI_API_KEY not configured. Please restart the development server.');
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${geminiApiKey}`;

    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: character.creativity / 10,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', geminiResponse.status, errorText);
      throw new Error(`Gemini API failed (${geminiResponse.status}): ${errorText}`);
    }

    const geminiData = await geminiResponse.json();
    const reply = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';

    // Save messages to database
    await Message.create({
      character_id: characterId,
      user_id: userId,
      role: 'user',
      content: message,
      created_at: new Date()
    });

    await Message.create({
      character_id: characterId,
      user_id: userId,
      role: 'assistant',
      content: reply,
      created_at: new Date()
    });

    // Check if we should extract memories (every 5 messages)
    const messageCount = await Message.countDocuments({
      character_id: characterId,
      user_id: userId
    });

    if (messageCount % 10 === 0) {
      // Trigger memory extraction in background (don't wait)
      fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/extract-memories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId,
          userId,
          characterName: character.name
        })
      }).catch(err => console.error('Memory extraction error:', err));
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate response' },
      { status: 500 }
    );
  }
}
