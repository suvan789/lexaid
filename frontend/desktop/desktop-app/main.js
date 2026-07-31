const { app, BrowserWindow, Menu } = require('electron');

if (require('electron-squirrel-startup')) app.quit();

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "LexAid",
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Remove the default menu completely for a native app feel
  Menu.setApplicationMenu(null);

  // Load the live production website!
  win.loadURL('https://lexaid-mu.vercel.app');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
