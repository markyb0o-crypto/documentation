const { app, BrowserWindow, ipcMain, clipboard, shell } = require('electron');
const path = require('path');
const fs = require('fs');

const DATA_DIR = () => path.join(app.getPath('documents'), 'AxiomFL');
const MAPPINGS_FILE = () => path.join(DATA_DIR(), 'mappings.json');
const GUIDE_FILE = () => path.join(DATA_DIR(), 'fl-anleitung.txt');

function ensureDataDir() {
  fs.mkdirSync(DATA_DIR(), { recursive: true });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 900,
    minHeight: 600,
    title: 'Axiom FL Mapper',
    backgroundColor: '#0a0c10',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.VITE_DEV_SERVER) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

ipcMain.handle('storage:load', () => {
  ensureDataDir();
  if (!fs.existsSync(MAPPINGS_FILE())) return {};
  try {
    return JSON.parse(fs.readFileSync(MAPPINGS_FILE(), 'utf8'));
  } catch {
    return {};
  }
});

ipcMain.handle('storage:save', (_event, data) => {
  ensureDataDir();
  fs.writeFileSync(MAPPINGS_FILE(), JSON.stringify(data, null, 2), 'utf8');
  return true;
});

ipcMain.handle('storage:saveGuide', (_event, text) => {
  ensureDataDir();
  fs.writeFileSync(GUIDE_FILE(), text, 'utf8');
  return GUIDE_FILE();
});

ipcMain.handle('clipboard:copy', (_event, text) => {
  clipboard.writeText(text);
  return true;
});

ipcMain.handle('shell:openDataFolder', () => {
  ensureDataDir();
  shell.openPath(DATA_DIR());
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
