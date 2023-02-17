const { app, MessageChannelMain } = require('electron');

// const GarminR10 = require('./services/GarminR10');
const GSProConnect = require('./services/GSProConnect');
const { getConfig } = require('./config');
const mainWindow = require('./elements/mainWindow');
const statusOverlay = require('./elements/statusOverlay');
const trayMenu = require('./elements/trayMenu');
const ipcListeners = require('./services/ipc');

let tray = null;
let mainWin = null;
let status = null;

app.whenReady().then(() => {
  mainWin = mainWindow();
  tray = trayMenu();
  // status = statusOverlay();

  const { port1, port2 } = new MessageChannelMain();
  const gsProConnect = new GSProConnect(port2);
  mainWin.webContents.postMessage('main-port', null, [port1]);

  // const r10Server = new GarminR10();
  // r10Server.connect();

  ipcListeners();
});
