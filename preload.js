const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  close: () => ipcRenderer.send('window:close'),
  minimize: () => ipcRenderer.send('window:minimize'),
  togglePin: () => ipcRenderer.invoke('window:toggle-pin'),
  onUpdate: (callback) => {
    const subscription = (_event, data) => callback(data);
    ipcRenderer.on('status-update', subscription);
    return () => {
      ipcRenderer.removeListener('status-update', subscription);
    };
  }
});
