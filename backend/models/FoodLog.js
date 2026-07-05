const mongoose = require('mongoose');

const foodLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  foodName: { type: String, required: true },
  calories: { type: Number, required: true },
  protein: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  fat: { type: Number, default: 0 },
  loggedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('FoodLog', foodLogSchema);