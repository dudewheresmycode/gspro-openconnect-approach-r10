const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    sendShot: (shotData) => ipcRenderer.send('post:shot', shotData),
    getLocalIP: () => ipcRenderer.invoke('get-ip'),
    getConfig: () => ipcRenderer.invoke('get-config'),
    setConfig: (updatedConfig) => ipcRenderer.invoke('set-config', updatedConfig)
})