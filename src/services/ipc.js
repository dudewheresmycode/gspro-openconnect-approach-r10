const { ipcMain } = require('electron');
const address = require('address');
const { getConfig } = require('../config');

function ipc(gsProConnect, r10Server) {
  ipcMain.handle('get-config', async (event) => {
    return getConfig();
  });
  ipcMain.handle('set-config', async (event, updatedConfig) => {
    return setConfig(updatedConfig);
  });
  ipcMain.handle('get-ip', (event, title) => {
    return address.ip();
  });
  ipcMain.on('test-shot', (event, ballData, clubData) => {
    console.log('Sending test shot...', ballData, clubData);
    r10Server.sendTestShot(ballData, clubData);
  });
  ipcMain.on('get-status', () => {
    // gets the initial status on page load
    // this will allow the page to be up to date
    // if the user refreshes the page
    gsProConnect.sendIpcStatus();
    r10Server.sendIpcStatus();
  });
}

module.exports = ipc;
