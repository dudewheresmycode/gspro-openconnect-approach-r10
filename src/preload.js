const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  sendShot: (shotData) => ipcRenderer.send('post-shot', shotData),
  getLocalIP: () => ipcRenderer.invoke('get-ip'),
  getConfig: () => ipcRenderer.invoke('get-config'),
  setConfig: (updatedConfig) => ipcRenderer.invoke('set-config', updatedConfig),
});

const windowLoaded = new Promise((resolve) => {
  window.addEventListener('load', resolve);
});

ipcRenderer.on('main-port', async (event) => {
  console.log('IPC MAIN PORT', event);
  await windowLoaded;
  window.postMessage('main-port', '*', event.ports);
});
