/**
 * Memory Management System
 * Handles memory extraction, embedding generation, and retrieval
 */

import connectDB from '../mongodb/connection';
import Memory from '../mongodb/models/Memory';
import Message from '../mongodb/models/Message';

/**
 * Cosine similarity between two vectors
 */
function cosineSimilarity(a, b) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Generate embedding for text using Gemini Text Embedding API
 */
export async function generateEmbedding(text) {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: {
        parts: [{ text }]
      }
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Embedding generation failed: ${error}`);
  }

  const data = await response.json();
  return data.embedding.values;
}

/**
 * Extract important facts from conversation for long-term memory
 */
export async function extractMemories(messages, characterName) {
  if (messages.length < 4) return []; // Need enough context

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return [];

  // Build conversation context
  const conversationText = messages.slice(-10).map(m => 
    `${m.role === 'user' ? 'User' : characterName}: ${m.content}`
  ).join('\n');

  const prompt = `Analyze this conversation and extract 1-3 important facts or memories that ${characterName} should remember about the user. Focus on:
- Personal information (name, preferences, interests)
- Important events or stories
- Emotional moments
- Recurring topics

Return ONLY a JSON array of strings, nothing else. Example: ["User likes pizza", "User works as a teacher"]

Conversation:
${conversationText}

Important memories (JSON array only):`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 256,
        }
      })
    });

    if (!response.ok) return [];

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
    
    // Extract JSON array from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];
    
    const memories = JSON.parse(jsonMatch[0]);
    return Array.isArray(memories) ? memories : [];
  } catch (error) {
    console.error('Memory extraction error:', error);
    return [];
  }
}

/**
 * Save memory with embedding to database
 */
export async function saveMemory(characterId, userId, content, importance = 5) {
  await connectDB();

  try {
    // Generate embedding
    const embedding = await generateEmbedding(content);

    // Save to MongoDB
    const memory = await Memory.create({
      character_id: characterId,
      user_id: userId,
      content,
      embedding,
      importance
    });

    return JSON.parse(JSON.stringify(memory));
  } catch (error) {
    console.error('Save memory error:', error);
    return null;
  }
}

/**
 * Retrieve relevant memories using vector similarity search
 */
export async function getRelevantMemories(characterId, userId, query, limit = 5) {
  await connectDB();

  try {
    // Generate embedding for query
    const queryEmbedding = await generateEmbedding(query);

    // Get all memories for this character
    const memories = await Memory.find({
      character_id: characterId,
      user_id: userId
    }).lean();

    if (!memories || memories.length === 0) return [];

    // Calculate similarity scores
    const memoriesWithScores = memories.map(memory => ({
      ...memory,
      similarity: cosineSimilarity(queryEmbedding, memory.embedding)
    }));

    // Filter by threshold and sort by similarity
    const relevantMemories = memoriesWithScores
      .filter(m => m.similarity > 0.5)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    return relevantMemories.map(mem => ({
      id: mem._id.toString(),
      content: mem.content,
      importance: mem.importance,
      similarity: mem.similarity,
      created_at: mem.created_at
    }));
  } catch (error) {
    console.error('Get relevant memories error:', error);
    return [];
  }
}

/**
 * Process conversation and auto-save important memories
 */
export async function processConversationMemories(characterId, userId, messages, characterName) {
  try {
    // Extract memories from recent conversation
    const newMemories = await extractMemories(messages, characterName);

    // Save each memory with embedding
    const savedMemories = [];
    for (const memory of newMemories) {
      const saved = await saveMemory(characterId, userId, memory, 7);
      if (saved) savedMemories.push(saved);
    }

    return savedMemories;
  } catch (error) {
    console.error('Process conversation memories error:', error);
    return [];
  }
}
