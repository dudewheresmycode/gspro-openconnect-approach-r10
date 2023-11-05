const { BrowserWindow } = require('electron');
const { PRELOAD, INDEX_PAGE } = require('../constants');

function mainWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    minHeight: 360,
    minWidth: 640,
    // titleBarStyle: 'hidden',
    // titleBarOverlay: true,
    webPreferences: {
      preload: PRELOAD,
    },
  });
  win.loadFile(INDEX_PAGE);
  win.webContents.openDevTools();

  return win;
}
module.exports = mainWindow;
