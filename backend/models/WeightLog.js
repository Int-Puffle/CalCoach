const mongoose = require('mongoose');

const weightLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  weightKg: { type: Number, required: true },
  loggedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('WeightLog', weightLogSchema);
