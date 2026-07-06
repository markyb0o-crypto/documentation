const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('axiomDesktop', {
  isDesktop: true,
  loadMappings: () => ipcRenderer.invoke('storage:load'),
  saveMappings: (data) => ipcRenderer.invoke('storage:save', data),
  saveGuide: (text) => ipcRenderer.invoke('storage:saveGuide', text),
  copyToClipboard: (text) => ipcRenderer.invoke('clipboard:copy', text),
  openDataFolder: () => ipcRenderer.invoke('shell:openDataFolder'),
});
