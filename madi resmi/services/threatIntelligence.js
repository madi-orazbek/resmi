const ThreatLog = require('../models/ThreatLog');
const axios = require('axios');
require('dotenv').config();

// Проверка IP через AbuseIPDB
exports.checkIp = async (ip) => {
  try {
    if (process.env.ABUSEIPDB_KEY) {
      const response = await axios.get(
        `https://api.abuseipdb.com/api/v2/check?ipAddress=${ip}`,
        {
          headers: {
            'Key': process.env.ABUSEIPDB_KEY,
            'Accept': 'application/json'
          }
        }
      );
      
      const data = response.data.data;
      if (data.abuseConfidenceScore > 50) {
        await new ThreatLog({
          ip,
          type: 'malicious_ip',
          reason: `Abuse confidence: ${data.abuseConfidenceScore}%`,
          details: data
        }).save();
        
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Threat intelligence error:', error);
    return false;
  }
};

// Локальная база плохих IP
const badIPs = new Set([
  '185.130.5.253',
  '192.168.1.100'
  // Добавьте другие известные плохие IP
]);

exports.checkLocalIp = (ip) => {
  return badIPs.has(ip);
};