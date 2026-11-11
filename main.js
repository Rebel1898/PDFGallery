const { app, BrowserWindow,dialog } = require('electron')
const path = require('path')
const fs = require("fs");

let mainWindow;
let testFolder;
app.sharedObject = { prop1: process.argv }

const { ipcMain } = require('electron');

ipcMain.on("LeerArchivos", (event, arg) => {
  var archivo = process.argv[process.argv.length - 1]
 procesarLecturaArchivos(archivo,event);

});


ipcMain.handle("setcurrentDir", async (event) => {
 
 const result = await dialog.showOpenDialog({
    title: "Select PDF file from chosen directory",
    defaultPath: testFolder,
    properties: ["openFile"],
    filters: [
        { name: "Archivos PDF", extensions: ["pdf"] }
    ]
});

    console.log(result);
    if (result.canceled || result.filePaths.length === 0) {
        return {
            success: false,
            canceled: true
        };
    }

    testFolder = result.filePaths[0];

 
    procesarLecturaArchivos(testFolder,event);

    return {
        success: true,
        directory: testFolder
    };


});

function procesarLecturaArchivos(archivo, event ){



  testFolder = require('path').dirname(archivo);
  console.log(testFolder);
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
}




function createWindow() {
     mainWindow = new BrowserWindow({
    width: 1024,
    height: 600,
    icon: __dirname + '/icons/logo.png',
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
  mainWindow.webContents.on('page-title-updated', (event, title) => {
  console.log('Título recibido del HTML:', title);

  event.preventDefault();
  mainWindow.setTitle('PDF Gallery');
});
  //  mainWindow.webContents.openDevTools();
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