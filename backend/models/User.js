const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  emailVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  verificationTokenExpires: { type: Date },
  dailyCalorieGoal: { type: Number, default: 2000 },
  dailyProteinGoal: { type: Number, default: 100 },
  createdAt: { type: Date, default: Date.now },

  onboardingCompleted: { type: Boolean, default: false },
  gender: { type: String, enum: ['male', 'female', 'other', null], default: null },
  weightKg: { type: Number, default: null },
  heightCm: { type: Number, default: null },
  age: { type: Number, default: null },
  activityLevel: { type: String, default: null },
  goal: { type: String, default: null },
});

module.exports = mongoose.model('User', userSchema);