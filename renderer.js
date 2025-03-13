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
document.querySelector('#move').addEventListener('click', () => {
    MoveFile([array[index]])

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
    var directoryPath = window.electronAPI.path.dirname(array[index]);
    document.getElementById("DirectoryInput").value = window.electronAPI.path.basename(array[index]);
    

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

    var directoryPath = window.electronAPI.path.dirname(array[index])
    var newName = document.getElementById("DirectoryInput").value;
    if (newName == "") newName =     document.getElementById("DirectoryInput").value = window.electronAPI.path.basename(array[index]);


    if (newName.toUpperCase().endsWith(".PDF") == false) { newName = newName + ".pdf"; }
    var nuevaRuta = window.electronAPI.path.join(directoryPath,newName)
    if (window.electronAPI.fileExists(nuevaRuta)) {
        alert("The filename is already being used.");
        document.getElementById("DirectoryInput").focus();
    }
    else {

        window.electronAPI.renameFile(array[index], nuevaRuta, function (err) {
            console.log(err);
            if (err) {
                alert("An error ocurred updating the file" + err.message);
                document.getElementById("DirectoryInput").focus();
            }
            else {
                array[index] = window.electronAPI.path.join(directoryPath,newName);
                document.getElementById("displayPDF").src = array[index];
                message("Successfully renamed!", 1500);
            }
            PrepareRename(false);
            document.getElementById("displayPDF").src = array[index];
            SetTitle( window.electronAPI.path.basename(array[index]));
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

    if (confirm("Are you sure you want to delete this PDF?")) {

        if (window.electronAPI.fileExists(filepath)) {
            window.electronAPI.unlinkFile(filepath, (err) => {
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
    if (index < array.length - 1) {
        index = index + 1;
    }
    else {
        index = 0;
    }

    if (!window.electronAPI.fileExists(array[index]) && array.length>0) {
        array.splice(index, 1);
        CargarSiguiente();
    }


    if (array.length > 1) {
        document.getElementById("displayPDF").src = array[index];
        SetTitle(window.electronAPI.path.basename(array[index]));
    }
    else if (array.length == 0) {
        document.getElementById("displayPDF").src = "";
        SetTitle("");
    }
}

function MoveFile() {
    // Asegúrate de que array[index] contenga una ruta de archivo válida
    var archivo = window.electronAPI.path.basename(array[index]);

    // Invocamos el diálogo de guardar y manejamos la promesa
    window.electronAPI.saveDialog(archivo).then((filePath) => {
        if (filePath) {
            console.log('Archivo guardado en:', filePath);
        } else {
            console.log('Guardado cancelado');
        }
    }).catch((error) => {
        console.error('Error al guardar el archivo:', error);
    });
}

function CargarAnterior() {

    if (index > 0) {
        index = index - 1;
    }
    else {
        index = array.length - 1;
    }

    if (!window.electronAPI.fileExists(array[index]) && array.length>0) {
        array.splice(index, 1);
        CargarAnterior();
    }
    if (array.length > 1){
        document.getElementById("displayPDF").src = array[index];
        SetTitle(window.electronAPI.path.basename(array[index]));
    }

    else if (array.length == 0) {
        document.getElementById("displayPDF").src = "";
        SetTitle("");
    }

    

}

window.electronAPI.onLeerArchivos((arg, ind) => {
    array = arg;
    index = ind;
    document.getElementById("displayPDF").src = array[index];
    SetTitle(window.electronAPI.path.dirname(array[index]));

});

window.electronAPI.leerArchivos();
