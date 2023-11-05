const { BrowserWindow } = require('electron');
const { PRELOAD, INDEX_PAGE } = require('../constants');
const url = require('url');

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
  // win.loadFile(INDEX_PAGE);
  win.loadURL(
    url.format({
      pathname: INDEX_PAGE, // relative path to the HTML-file
      protocol: 'file:',
      slashes: true,
    })
  );

  win.webContents.openDevTools();

  return win;
}
module.exports = mainWindow;
