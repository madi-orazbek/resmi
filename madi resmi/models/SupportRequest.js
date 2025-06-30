const mongoose = require('mongoose');

const SupportRequestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  topic: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, default: 'new', enum: ['new', 'in_progress', 'resolved'] },
  ip: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SupportRequest', SupportRequestSchema);