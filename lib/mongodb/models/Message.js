import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  character_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Character',
    required: true,
    index: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Compound index for efficient queries
MessageSchema.index({ character_id: 1, user_id: 1, created_at: 1 });

export default mongoose.models.Message || mongoose.model('Message', MessageSchema);
