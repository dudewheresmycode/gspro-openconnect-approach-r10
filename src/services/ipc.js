const { ipcMain } = require('electron');
const address = require('address');
const { getConfig } = require('../config');

function ipc() {
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

module.exports = ipc;
