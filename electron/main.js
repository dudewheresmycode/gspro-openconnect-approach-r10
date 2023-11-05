const { app, MessageChannelMain } = require('electron');

const GarminR10 = require('./services/GarminR10');
const GSProConnect = require('./services/GSProConnect');
const { getConfig } = require('./config');
const mainWindow = require('./elements/mainWindow');
const statusOverlay = require('./elements/statusOverlay');
const trayMenu = require('./elements/trayMenu');
const appMenu = require('./elements/appMenu');
const ipcListeners = require('./services/ipc');

let tray = null;
let mainWin = null;
let menu = null;
let status = null;

app.whenReady().then(() => {
  mainWin = mainWindow();
  menu = appMenu();
  // tray = trayMenu();
  // status = statusOverlay();

  // const { port1, port2 } = new MessageChannelMain();
  const gsProConnect = new GSProConnect(mainWin.webContents);
  // mainWin.webContents.postMessage('main-port', null, [port1]);

  const r10Server = new GarminR10(mainWin.webContents, gsProConnect);
  r10Server.connect();
  // port2.start();

  app.on('before-quit', async () => {
    await gsProConnect.safeDisconnect();
  });
  ipcListeners(gsProConnect, r10Server);
});
