const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  close: () => ipcRenderer.send('window:close'),
  minimize: () => ipcRenderer.send('window:minimize'),
  togglePin: () => ipcRenderer.invoke('window:toggle-pin'),
  getSettings: () => ipcRenderer.invoke('settings:get'),
  saveSettings: (settings) => ipcRenderer.invoke('settings:save', settings),
  onUpdate: (callback) => {
    const subscription = (_event, data) => callback(data);
    ipcRenderer.on('status-update', subscription);
    return () => {
      ipcRenderer.removeListener('status-update', subscription);
    };
  }
});
