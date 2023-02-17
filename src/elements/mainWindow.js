const { BrowserWindow } = require('electron');
const { PRELOAD, INDEX_PAGE } = require('../constants');

function mainWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: PRELOAD,
    },
  });
  win.loadFile(INDEX_PAGE);
  win.webContents.openDevTools();

  return win;
}
module.exports = mainWindow;
