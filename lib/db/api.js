/**
 * MongoDB API - Replaces Supabase API
 * All database operations using MongoDB
 */

import connectDB from '../mongodb/connection';
import User from '../mongodb/models/User';
import Character from '../mongodb/models/Character';
import Message from '../mongodb/models/Message';
import Memory from '../mongodb/models/Memory';

// ==================== CHARACTER OPERATIONS ====================

export async function createCharacter(characterData) {
  await connectDB();
  
  const character = await Character.create({
    user_id: characterData.user_id,
    name: characterData.name,
    personality: characterData.personality || '',
    system_prompt: characterData.system_prompt || '',
    based_on_character: characterData.based_on_character || '',
    avatar_url: characterData.avatar_url || '',
    tone: characterData.tone || 5,
    humor: characterData.humor || 5,
    formality: characterData.formality || 5,
    creativity: characterData.creativity || 5,
    empathy: characterData.empathy || 5
  });

  return JSON.parse(JSON.stringify(character));
}

export async function updateCharacter(id, updates) {
  await connectDB();
  
  const character = await Character.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!character) throw new Error('Character not found');
  return JSON.parse(JSON.stringify(character));
}

export async function deleteCharacter(id) {
  await connectDB();
  
  // Delete character and all associated data
  await Promise.all([
    Character.findByIdAndDelete(id),
    Message.deleteMany({ character_id: id }),
    Memory.deleteMany({ character_id: id })
  ]);
}

export async function getCharacters(userId) {
  await connectDB();
  
  const characters = await Character.find({ user_id: userId })
    .sort({ created_at: -1 })
    .lean();

  return characters.map(char => ({
    ...char,
    id: char._id.toString(),
    user_id: char.user_id.toString()
  }));
}

export async function getCharacter(id) {
  await connectDB();
  
  const character = await Character.findById(id).lean();
  if (!character) return null;

  return {
    ...character,
    id: character._id.toString(),
    user_id: character.user_id.toString()
  };
}

// ==================== MESSAGE OPERATIONS ====================

export async function getMessages(characterId, userId) {
  await connectDB();
  
  const messages = await Message.find({
    character_id: characterId,
    user_id: userId
  })
    .sort({ created_at: 1 })
    .lean();

  return messages.map(msg => ({
    ...msg,
    id: msg._id.toString(),
    character_id: msg.character_id.toString(),
    user_id: msg.user_id.toString()
  }));
}

export async function saveMessages(messages) {
  await connectDB();
  
  const savedMessages = await Message.insertMany(messages);
  return savedMessages;
}

export async function getMessageCount(characterId, userId) {
  await connectDB();
  
  return await Message.countDocuments({
    character_id: characterId,
    user_id: userId
  });
}

// ==================== CHAT OPERATIONS ====================

export async function sendMessage(characterId, userId, message, character) {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        characterId,
        userId,
        message,
        character
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'API request failed');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;
          
          try {
            const parsed = JSON.parse(data);
            if (parsed.text) fullResponse += parsed.text;
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }

    if (!fullResponse) {
      throw new Error('No response received from API');
    }

    // Save messages to MongoDB
    await connectDB();
    await Message.insertMany([
      {
        character_id: characterId,
        user_id: userId,
        role: 'user',
        content: message
      },
      {
        character_id: characterId,
        user_id: userId,
        role: 'assistant',
        content: fullResponse
      }
    ]);

    // Trigger memory extraction every 5 messages
    const messageCount = await getMessageCount(characterId, userId);
    if (messageCount % 5 === 0) {
      fetch('/api/extract-memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterId, userId, characterName: character.name })
      }).catch(err => console.warn('Memory extraction failed:', err));
    }

    return fullResponse;
  } catch (error) {
    console.error('Chat API error:', error);
    throw new Error('Chat unavailable: ' + error.message);
  }
}

export async function clearChat(characterId, userId) {
  await connectDB();
  
  await Promise.all([
    Message.deleteMany({ character_id: characterId, user_id: userId }),
    Memory.deleteMany({ character_id: characterId, user_id: userId })
  ]);
}

// ==================== MEMORY OPERATIONS ====================

export async function saveMemory(characterId, userId, content, embedding, importance = 5) {
  await connectDB();
  
  const memory = await Memory.create({
    character_id: characterId,
    user_id: userId,
    content,
    embedding,
    importance
  });

  return JSON.parse(JSON.stringify(memory));
}

export async function getMemories(characterId, userId, limit = 50) {
  await connectDB();
  
  const memories = await Memory.find({
    character_id: characterId,
    user_id: userId
  })
    .sort({ importance: -1, created_at: -1 })
    .limit(limit)
    .lean();

  return memories.map(mem => ({
    ...mem,
    id: mem._id.toString(),
    character_id: mem.character_id.toString(),
    user_id: mem.user_id.toString()
  }));
}

// ==================== USER OPERATIONS ====================

export async function createUser(username, email, passwordHash) {
  await connectDB();
  
  const user = await User.create({
    username,
    email,
    password_hash: passwordHash
  });

  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    created_at: user.created_at
  };
}

export async function getUserByEmail(email) {
  await connectDB();
  
  const user = await User.findOne({ email: email.toLowerCase() }).lean();
  if (!user) return null;

  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    password_hash: user.password_hash,
    created_at: user.created_at
  };
}

export async function getUserById(id) {
  await connectDB();
  
  const user = await User.findById(id).lean();
  if (!user) return null;

  return {
    id: user._id.toString(),
    email: user.email,
    created_at: user.created_at
  };
}

export async function updateUserLogin(userId) {
  await connectDB();
  
  await User.findByIdAndUpdate(userId, {
    $set: { last_login: new Date() }
  });
}
