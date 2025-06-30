const mongoose = require('mongoose');

const CaptchaSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  answer: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 900 } // 15 минут
});

module.exports = mongoose.model('CaptchaSession', CaptchaSessionSchema);