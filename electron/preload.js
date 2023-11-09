const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  sendShot: (shotData) => ipcRenderer.send('post-shot', shotData),
  getLocalIP: () => ipcRenderer.invoke('get-ip'),
  getConfig: () => ipcRenderer.invoke('get-config'),
  getStatus: () => ipcRenderer.send('get-status'),
  sendTestShot: (ballData, clubData) =>
    ipcRenderer.send('test-shot', ballData, clubData),
  setConfig: (updatedConfig) => ipcRenderer.invoke('set-config', updatedConfig),
  onGarminUpdate: (callback) => ipcRenderer.on('garmin-status', callback),
  onGSProUpdate: (callback) => ipcRenderer.on('gspro-status', callback),
});

// const windowLoaded = new Promise((resolve) => {
//   window.addEventListener('load', resolve);
// });

// ipcRenderer.on('main-port', async (event) => {
//   console.log('IPC MAIN PORT', event);
//   await windowLoaded;
//   window.postMessage('main-port', '*', event.ports);
// });
