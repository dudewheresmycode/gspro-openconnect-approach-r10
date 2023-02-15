const { app } = require('electron');
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const { join } = require('path');

console.log(app.getPath('userData'));
// File path
// const appDir = app.getPath('userData');
// const __dirname = dirname(fileURLToPath(import.meta.url));
const file = join(app.getPath('userData'), 'R10ConnectSettings.json')
console.log('database path:', file);
const adapter = new FileSync(file);
let db;

const DEFAULT_OPTIONS = {
  units: 'Yards',
  api_version: '1',
  club_data: true,
  gspro: {
    ip_address: '127.0.0.1',
    port: 921,
  },
  garmin: {
    device_id: 'Garmin R10',
    port: 2483
  }
};


async function getConfig() {
  return db.get('config').value();
}
async function updateConfig(updatedConfig) {
  return db.set('config', updatedConfig).write();
}

if (!db) {
  // initial setup
  db = low(adapter);
  db.defaults({ config: DEFAULT_OPTIONS }).write();
}

module.exports = { getConfig, updateConfig };