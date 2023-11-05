const path = require('path');

const BASE_DIR = path.resolve(path.join(__dirname, '../'));

module.exports = {
  PRELOAD: path.join(BASE_DIR, 'electron/preload.js'),
  INDEX_PAGE: path.join(BASE_DIR, 'build/index.html'),
  STATUS_PAGE: path.join(BASE_DIR, 'static/status.html'),
  SUCCESS_DING: path.join(BASE_DIR, 'assets/audio/ready_bell.mp3'),

  TRAY_ICON_DEFAULT: path.join(BASE_DIR, 'assets/trayTemplate.png'),
  TRAY_ICON_CONNECTED: path.join(BASE_DIR, 'assets/trayConnected.png'),
};
