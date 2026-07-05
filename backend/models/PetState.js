const mongoose = require('mongoose');

const petStateSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  mood: { type: String, enum: ['happy', 'neutral', 'sad', 'sick'], default: 'neutral' },
  moodScore: { type: Number, default: 50 },
  streakDays: { type: Number, default: 0 },
  lastFedAt: { type: Date, default: null },
});

module.exports = mongoose.model('PetState', petStateSchema);