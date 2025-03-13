// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const path = require('path'); 
const fs = require('fs');
const { contextBridge, ipcRenderer } = require('electron');

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
})


contextBridge.exposeInMainWorld('electronAPI', {
  saveDialog: (PDFbasename) => {
    return ipcRenderer.invoke('save-dialog', PDFbasename);  // Aquí pasas PDFbasename al main
  },
    sendMessage: (msg) => ipcRenderer.send('message', msg),
    onReceiveMessage: (callback) => ipcRenderer.on('message-reply', (event, data) => callback(data)),
    fileExists: (filePath) => fs.existsSync(filePath),
    leerArchivos: () => ipcRenderer.send('LeerArchivos'),
    onLeerArchivos: (callback) => ipcRenderer.on('LeerArchivos', (event, arg, ind) => callback(arg, ind)),
    unlinkFile: (filePath, callback) => {
      fs.unlink(filePath, (err) => {
          callback(err);
      });
    }, 
    renameFile: (oldPath,newPath, callback) => {
      fs.rename(oldPath,newPath, (err) => {
          callback(err);
      });
    },
  

  path: {
    dirname: (filePath) => path.dirname(filePath),
    join: (...args) => path.join(...args),
    basename: (filePath) => path.basename(filePath) 
}

});

