import { verifyToken } from '@/lib/auth/jwt';
import connectDB from '@/lib/mongodb/connection';
import Character from '@/lib/mongodb/models/Character';
import Message from '@/lib/mongodb/models/Message';
import Memory from '@/lib/mongodb/models/Memory';

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return Response.json({ error: 'Invalid token' }, { status: 401 });
    }

    await connectDB();

    // Get total characters
    const totalCharacters = await Character.countDocuments({ user_id: payload.userId });

    // Get total messages sent by user
    const totalMessages = await Message.countDocuments({ 
      user_id: payload.userId,
      role: 'user'
    });

    // Get total AI responses
    const totalResponses = await Message.countDocuments({ 
      user_id: payload.userId,
      role: 'assistant'
    });

    // Get total memories
    const totalMemories = await Memory.countDocuments({ user_id: payload.userId });

    // Get character with most messages
    const characterStats = await Message.aggregate([
      { $match: { user_id: payload.userId } },
      { $group: { _id: '$character_id', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);

    let mostActiveCharacter = null;
    if (characterStats.length > 0) {
      const character = await Character.findById(characterStats[0]._id).lean();
      if (character) {
        mostActiveCharacter = {
          name: character.name,
          messageCount: characterStats[0].count
        };
      }
    }

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentMessages = await Message.countDocuments({
      user_id: payload.userId,
      role: 'user',
      created_at: { $gte: sevenDaysAgo }
    });

    // Get average messages per character
    const avgMessagesPerCharacter = totalCharacters > 0 
      ? Math.round((totalMessages + totalResponses) / totalCharacters)
      : 0;

    return Response.json({
      stats: {
        totalCharacters,
        totalMessages,
        totalResponses,
        totalMemories,
        mostActiveCharacter,
        recentMessages,
        avgMessagesPerCharacter,
        totalConversations: totalMessages + totalResponses
      }
    });

  } catch (error) {
    console.error('Stats error:', error);
    return Response.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
