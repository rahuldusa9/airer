import mongoose from 'mongoose';

const CharacterSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  personality: {
    type: String,
    default: ''
  },
  system_prompt: {
    type: String,
    default: ''
  },
  based_on_character: {
    type: String,
    default: ''
  },
  avatar_url: {
    type: String,
    default: ''
  },
  tone: {
    type: Number,
    default: 5,
    min: 1,
    max: 10
  },
  humor: {
    type: Number,
    default: 5,
    min: 1,
    max: 10
  },
  formality: {
    type: Number,
    default: 5,
    min: 1,
    max: 10
  },
  creativity: {
    type: Number,
    default: 5,
    min: 1,
    max: 10
  },
  empathy: {
    type: Number,
    default: 5,
    min: 1,
    max: 10
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
CharacterSchema.index({ user_id: 1, created_at: -1 });

export default mongoose.models.Character || mongoose.model('Character', CharacterSchema);
