var index = 0;
var array = [];
document.getElementsByTagName("body")[0].focus();
document.querySelector('#NEXT').addEventListener('click', () => {
    CargarSiguiente();
})
document.querySelector('#PREV').addEventListener('click', () => {
    CargarAnterior();
})

document.querySelector('#delete').addEventListener('click', () => {
    Borrar(array[index]);

})
document.querySelector('#rename').addEventListener('click', () => {
    PrepareRename(true);

})
document.querySelector('#Cancel_ChangeName').addEventListener('click', () => {
    PrepareRename(false);

})
document.querySelector('#OK_ChangeName').addEventListener('click', () => {
    SetRename();

})
document.addEventListener("keydown", function (event) {
    if (event.defaultPrevented) {
        return;
    }
    if ((event.keyCode == 70 && (event.ctrlKey || event.metaKey))) {
        alert("prueba");
    }
    if (document.getElementById("DirectoryInput").hidden) {
        switch (event.key) {
            case "Right": CargarSiguiente();
                break;

            case "Left": CargarAnterior();
                break;

            case "ArrowRight": CargarSiguiente();
                break;

            case "ArrowLeft": CargarAnterior();
                break;
            default:
                return;
        }
    }
    else {
        switch (event.key) {
            case "Enter": SetRename();
                break;

            case "Escape": PrepareRename(false);
                break;
        }
    }
}, true);

function SetTitle(texto){
    document.title=  texto + "  -  PDF gallery " ;
}
function PrepareRename(encendido) {
    var directoryPath = require('path').dirname(array[index])
    document.getElementById("DirectoryInput").value = array[index].replace(directoryPath + "\\", "");

    var elementosinvisibles = document.getElementsByClassName("Rename");
    for (i = 0; i < elementosinvisibles.length; i++) {
        elementosinvisibles[i].hidden = !encendido;
    }

    var elementosMain = document.getElementsByClassName("Main");
    for (i = 0; i < elementosMain.length; i++) {
        elementosMain[i].hidden = encendido;
    }
    if (encendido == true) {
        document.getElementById("DirectoryInput").focus();
        document.getElementById("DirectoryInput").select();
    }
}
function SetRename() {
    var fs = require('fs');

    var directoryPath = require('path').dirname(array[index])
    var newName = document.getElementById("DirectoryInput").value;

    if (newName == "") newName = array[index].replace(directoryPath + "\\", "");

    if (newName.toUpperCase().endsWith(".PDF") == false) { newName = newName + ".pdf"; }


    if (fs.existsSync(directoryPath + "\\" + newName)) {
        alert("The filename is already used");
        document.getElementById("DirectoryInput").focus();
    }
    else {

        fs.rename(array[index], directoryPath + "\\" + newName, function (err) {

            if (err) {
                alert("An error ocurred updating the file" + err.message);
                document.getElementById("DirectoryInput").focus();
            }
            else {
                array[index] = directoryPath + newName;
                document.getElementById("displayPDF").src = array[index];
                message("Successfully renamed!", 1500);
            }
            PrepareRename(false);
        });
    }
}

function message(texto, Timeout) {
    document.getElementById("TextAlert").innerText = texto;
    document.getElementById("SuccessRename").hidden = false;
    setTimeout(function () {

        document.getElementById("SuccessRename").hidden = true;

    }, Timeout)
}
function Borrar(filepath) {
    var fs = require('fs');

    if (confirm("Are you sure you want to delete this PDF?")) {

        if (fs.existsSync(filepath)) {
            fs.unlink(filepath, (err) => {
                if (err) {
                    alert("An error ocurred updating the file" + err.message);
                    return;
                }
                array.splice(index, 1);
                message("Successfully deleted!", 1500);
                CargarSiguiente();

            });
        } else {
            alert("This file doesn't exist, cannot delete");
        }
    }
    else{
    };
}
function CargarSiguiente() {
    var fs = require('fs');
    if (index < array.length - 1) {
        index = index + 1;
    }
    else {
        index = 0;
    }

    if (!fs.existsSync(array[index])) {
        array.splice(index, 1);
        CargarSiguiente();
    }

    if (array.length != 1) {
        document.getElementById("displayPDF").src = array[index];
        var filename = array[index].split("\\");
        SetTitle(filename[filename.length -1]);
    }
}

function CargarAnterior() {
    var fs = require('fs');
    if (index > 0) {
        index = index - 1;
    }
    else {
        index = array.length - 1;
    }

    if (!fs.existsSync(array[index])) {
        array.splice(index, 1);
        CargarAnterior();
    }
    if (array.length != 1){
        document.getElementById("displayPDF").src = array[index];
        var filename = array[index].split("\\");
        SetTitle(filename[filename.length -1]);
    }



}


const { ipcRenderer } = require('electron');
ipcRenderer.on('LeerArchivos', (event, arg, ind) => {
    array = arg;
    index = ind;
    document.getElementById("displayPDF").src = array[index];
    var filename = array[index].split("\\");
    SetTitle(filename[filename.length -1]);
});
ipcRenderer.send('LeerArchivos', null);
