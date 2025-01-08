var video = document.querySelector('#video');
var canvas = document.querySelector('#canvas');
var context = canvas.getContext('2d');
var btn = document.querySelector('#btn')

canvas.style.display = 'none'
canvas.widht = 300;
canvas.height = 300;

context.widht = canvas.widht;
context.height = canvas.height;

var socket = io();
var ID
var NOMBRE = document.getElementById('nombre-participante').textContent;
socket.on("connect", () => {
    socket.emit('nombre', NOMBRE);
    ID = socket.id
    console.log('MI ID: ' + ID);
    console.log('MI ID: ' + NOMBRE);
    document.getElementById('id-participante').textContent = 'id:' + ID;
});

var lista = [];

function publicarMensaje(msg) {
    //document.querySelector('.status').innerText = msg
}

function loadCamara(stream) {
    video.srcObject = stream;
    publicarMensaje('camara funcionando');
}

function errorCamara() {
    publicarMensaje('camara ha fallado');
}

function emitVideo(video, context) {
    context.drawImage(video, 0, 0, context.widht, context.height);
    videoData = canvas.toDataURL('image/webp');
    //console.log(videoData);
    socket.emit('stream', videoData);
}

btn.addEventListener('click', () => {
    navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msgGetUserMedia);

    if (navigator.getUserMedia) {
        navigator.getUserMedia({ video: true }, loadCamara, errorCamara)
    }

    var intervalo = setInterval(() => {
        emitVideo(video, context)
    }, 1);

})

var tablero = document.getElementById('tablero');
//var c1 = document.getElementById('c1');


function insertNew(id) {
    var fracmentoHTML = '' +
        '<div id="' + id + '"class="col"> ' +
        '   <div class="card"> ' +
        '       <img id="play-' + id + '" src="" alt=""> ' +
        '       <div class="card-body">  ' +
        '           <h5 id="nombre-' + id + '" class="card-title" ></h5> ' +
        '           <h5 id="id-' + id + '" class="card-title" style="font-size: 10px;">' + id + '</h5> ' +

        '       </div> ' +
        '   </div> ' +
        '</div>';

    //console.log(data);
    tablero.insertAdjacentHTML("beforeend", fracmentoHTML);
}

function removeHTML(id) {
    var div = document.getElementById(id);
    div.remove();
}

socket.on('new-connection', (data) => {
    insertNew(data);
    lista.push(data);
    console.log("nuevo conectado: ")
    console.log(data);
    //insertNombre(data);
});

function playRes(data) {
    let img = document.getElementById('play-' + data.id);
    //console.log(img);
    img.src = data.data;
}

socket.on('stream-res', (data) => {
    //console.log('LLEGO VIDEO DE:' + data.id);
    //console.log(data.data);
    playRes(data);
});

socket.on('lista-conectados', (data) => {
    console.log('lista de conectados: ');
    console.log(data);
    lista = data;
    data.forEach(data => {
        insertNew(data);
    })
});

var lista_nombres

function insertNombre(id) {
    h5 = document.getElementById('nombre-' + id);
    h5.textContent = lista_nombres[id];
}

socket.on('lista-nombres', (data) => {
    console.log('NOMBREs');
    console.log(data);
    lista_nombres = data;
    lista.forEach(id => {
        insertNombre(id);
    })
});

socket.on('Desconectado', (data) => {
    console.log('se desconecto: ')
    console.log(data);
    lista = lista.filter((item) => item !== data);
    console.log(lista);
    removeHTML(data);
});

socket.on('terminate', (data) => {
    console.log('terminando');
    if (data) {
        window.location.href = "/";
    }
});

var cambiarNombre = document.getElementById('btn-cambiar-nombre');
cambiarNombre.onclick = () => {
	var nombre = document.getElementById('in-nombre').value;
	socket.emit('canbiar-nombre', nombre);
	NOMBRE = nombre
	document.getElementById('nombre-participante').textContent = nombre;
}
