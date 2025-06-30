const mongoose = require('mongoose');

const ThreatLogSchema = new mongoose.Schema({
  type: { 
    type: String, 
    required: true,
    enum: ['bot_detected', 'malicious_ip', 'suspicious', 'blocked'] 
  },
  ip: { type: String, required: true },
  reason: { type: String, required: true },
  requestData: { type: mongoose.Schema.Types.Mixed },
  details: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ThreatLog', ThreatLogSchema);