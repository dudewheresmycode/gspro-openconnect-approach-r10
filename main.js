const path = require('path');

const address = require('address');
const { app, BrowserWindow, ipcMain, Menu, screen, Tray } = require('electron')
const sound = require("sound-play");


// const GarminR10 = require('./src/GarminR10');
const { getConfig } = require('./src/config');

const ASSETS_DIR = path.join(__dirname, 'assets')
const SUCCESS_DING = path.join(ASSETS_DIR, 'audio/success_bell-6776.mp3');

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

  const primaryDisplay = screen.getPrimaryDisplay();
  const statusWindow = new BrowserWindow({
    frame: false,
    alwaysOnTop: true,
    transparent: true,
    thickFrame: false,
    roundedCorners: false,
    width: 300,
    height: 60,
    x: 20,
    y: primaryDisplay.workAreaSize.height - 100
  });
  statusWindow.loadFile('static/status.html');
  setTimeout(() => {
    sound.play(SUCCESS_DING);
  }, 2000);


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

const iconDefault = path.join(ASSETS_DIR, 'trayTemplate.png');
const iconConnected = path.join(ASSETS_DIR, 'trayConnected.png');
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