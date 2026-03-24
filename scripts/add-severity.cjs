const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'mcsb-controls.json'), 'utf8'));

// Severity assignments based on MCSB v2 risk impact
const severities = {
  'IM-1': 'critical', 'IM-2': 'critical', 'IM-3': 'high', 'IM-4': 'critical',
  'NS-1': 'high', 'NS-2': 'high', 'NS-3': 'high', 'NS-4': 'high', 'NS-5': 'medium',
  'DP-1': 'high', 'DP-2': 'critical', 'DP-3': 'high', 'DP-4': 'medium',
  'AM-1': 'medium', 'AM-2': 'medium', 'AM-3': 'medium',
  'LT-1': 'critical', 'LT-2': 'high', 'LT-3': 'medium', 'LT-4': 'medium',
  'IR-1': 'high', 'IR-2': 'medium', 'IR-3': 'high',
  'PV-1': 'high', 'PV-2': 'medium', 'PV-3': 'high', 'PV-4': 'medium',
  'ES-1': 'critical', 'ES-2': 'high', 'ES-3': 'high',
  'BR-1': 'high', 'BR-2': 'medium', 'BR-3': 'medium',
  'DS-1': 'high', 'DS-2': 'high', 'DS-3': 'medium',
  'GS-1': 'medium', 'GS-2': 'medium', 'GS-3': 'low',
  'AI-1': 'high', 'AI-2': 'high', 'AI-3': 'medium',
};

for (const [, controls] of Object.entries(data)) {
  for (const control of controls) {
    control.severity = severities[control.id] || 'medium';
  }
}

fs.writeFileSync(
  path.join(__dirname, '..', 'src', 'data', 'mcsb-controls.json'),
  JSON.stringify(data, null, 2) + '\n',
);

console.log('Added severity to all controls');
