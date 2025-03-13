const { app, BrowserWindow,dialog } = require('electron')
const path = require('path')
let mainWindow;
app.sharedObject = { prop1: process.argv }

const { ipcMain } = require('electron');
ipcMain.on("LeerArchivos", (event, arg) => {
  var archivo = process.argv[process.argv.length - 1]
  var testFolder = require('path').dirname(archivo);
  const fs = require('fs');
  var array = [];
  index = 0;
  contador = 0;

  fs.readdirSync(testFolder,).forEach(file => {
    if (file.toUpperCase().endsWith(".PDF")) {
      contador = contador + 1;
      array.push(testFolder + "\\" + file);
      if (testFolder + "\\" + file == archivo) {
        index = contador - 1;
      }
    }
  }
  )
  event.sender.send('LeerArchivos', array, index);
});


function createWindow() {
     mainWindow = new BrowserWindow({
    width: 1024,
    height: 600,
    icon: __dirname + '/PDF_icon4.png',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      nodeIntegrationInWorker: true,
      enableRemoteModule: true
    }
  })
  mainWindow.loadFile('index.html')
  mainWindow.maximize();
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.handle('save-dialog', async (event,PDFbasename) => {
      const result = await dialog.showSaveDialog(mainWindow, {
        title: 'Guardar archivo',
        defaultPath: PDFbasename ,
        filters: [{ name: 'PDF', extensions: ['pdf'] }]
     });
     return result.filePath;
});