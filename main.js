const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Store = require('electron-store');
const GoogleSheetsSync = require('./googleSheets');

const store = new Store();
let mainWindow;
const googleSheets = new GoogleSheetsSync();

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Gestionnaire pour sauvegarder les données
ipcMain.on('save-time-entry', (event, timeEntry) => {
  const timeEntries = store.get('timeEntries', []);
  timeEntries.push({
    ...timeEntry,
    id: Date.now().toString() // Ajouter un ID unique
  });
  store.set('timeEntries', timeEntries);
});

// Gestionnaire pour récupérer les données
ipcMain.handle('get-time-entries', () => {
  return store.get('timeEntries', []);
});

// Gestionnaire pour mettre à jour une entrée
ipcMain.on('update-time-entry', (event, { id, taskName, duration }) => {
  const timeEntries = store.get('timeEntries', []);
  const updatedEntries = timeEntries.map(entry => 
    entry.id === id ? { ...entry, taskName, duration } : entry
  );
  store.set('timeEntries', updatedEntries);
});

// Gestionnaire pour supprimer une entrée
ipcMain.on('delete-time-entry', (event, id) => {
  const timeEntries = store.get('timeEntries', []);
  const filteredEntries = timeEntries.filter(entry => entry.id !== id);
  store.set('timeEntries', filteredEntries);
});

// Gestionnaire pour supprimer plusieurs entrées
ipcMain.handle('delete-multiple-time-entries', async (event, ids) => {
  try {
    const timeEntries = store.get('timeEntries', []);
    const filteredEntries = timeEntries.filter(entry => !ids.includes(entry.id));
    store.set('timeEntries', filteredEntries);
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression multiple:', error);
    throw error;
  }
});

// Gestionnaire pour mettre à jour l'ordre des entrées
ipcMain.on('reorder-time-entries', (event, timeEntries) => {
  store.set('timeEntries', timeEntries);
});

// Gérer la synchronisation avec Google Sheets
ipcMain.handle('sync-to-sheets', async (event, task) => {
  try {
    return await googleSheets.syncTask(task);
  } catch (error) {
    console.error('Erreur lors de la synchronisation avec Google Sheets:', error);
    return { success: false, error: error.message };
  }
});
