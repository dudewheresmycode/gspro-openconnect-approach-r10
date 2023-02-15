const address = require('address');
const { app, BrowserWindow, ipcMain, Menu, Tray } = require('electron')
const path = require('path')

// const GarminR10 = require('./src/GarminR10');
const { getConfig } = require('./src/config');

const assetsDirectory = path.join(__dirname, 'assets')

let tray = null
let win = null;

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })
  win.loadFile('static/index.html');

  // const r10Server = new GarminR10();
  // r10Server.connect();

  ipcMain.handle('get-config', async (event) => {
    return getConfig();
  });
  ipcMain.handle('set-config', async (event, updatedConfig) => {
    return setConfig(updatedConfig);
  });
  ipcMain.handle('get-ip', (event, title) => {
    return address.ip();
  });
}

const iconDefault = path.join(assetsDirectory, 'trayTemplate.png');
const iconConnected = path.join(assetsDirectory, 'trayConnected.png');
function createTray() {
  tray = new Tray(iconDefault)
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Status: Not Connected', type: 'radio' },
    { label: 'Item2', type: 'radio' },
    { label: 'Item3', type: 'radio', checked: true },
    { label: 'Item4', type: 'radio' }
  ]);
  tray.setToolTip('This is my application.');
  tray.setContextMenu(contextMenu);
}

app.whenReady().then(() => {
  createTray();
  setTimeout(() => {
    tray.setImage(iconConnected);
  }, 3000);
  createWindow();
});