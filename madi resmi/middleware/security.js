const ThreatLog = require('../models/ThreatLog');

// Защита форм от спама
exports.formProtection = (req, res, next) => {
  if (req.method === 'POST') {
    // Добавляем honeypot поле
    req.body.honeypot = req.body.honeypot || '';
    
    // Проверка honeypot
    if (req.body.honeypot !== '') {
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      
      new ThreatLog({
        ip,
        type: 'bot_detected',
        reason: 'Honeypot field filled',
        requestData: req.body
      }).save();
      
      return res.status(403).json({ error: 'Bot detected' });
    }
    
    // Проверка времени заполнения
    const startTime = req.body.startTime || Date.now();
    const fillTime = (Date.now() - parseInt(startTime)) / 1000;
    
    if (fillTime < 3) {
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      
      new ThreatLog({
        ip,
        type: 'suspicious',
        reason: 'Form filled too quickly',
        requestData: req.body
      }).save();
      
      return res.status(400).json({ error: 'Please fill the form properly' });
    }
  }
  next();
};

// Защита от XSS
exports.xssSanitizer = (req, res, next) => {
  const sanitize = (obj) => {
    for (const key in obj) {
      if (key.includes('captcha')) continue;
      if (typeof obj[key] === 'string') {
        obj[key] = obj[key]
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/'/g, '&#39;')
          .replace(/"/g, '&#34;');
      } else if (typeof obj[key] === 'object') {
        sanitize(obj[key]);
      }
    }
  };
  
  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  
  next();
};