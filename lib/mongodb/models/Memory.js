import mongoose from 'mongoose';

const MemorySchema = new mongoose.Schema({
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
  content: {
    type: String,
    required: true
  },
  embedding: {
    type: [Number],  // Array of numbers for vector embedding
    required: true
  },
  importance: {
    type: Number,
    default: 5,
    min: 1,
    max: 10
  },
  created_at: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Compound index for efficient queries
MemorySchema.index({ character_id: 1, user_id: 1, importance: -1 });

export default mongoose.models.Memory || mongoose.model('Memory', MemorySchema);
