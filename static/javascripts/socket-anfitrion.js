/**
 * IA RECONICIMIENTOS DE EMOCIONES 
 */
const MODELS_DIR = '/static/javascripts/modelos';

/*async function init() {
    await faceapi.nets.ssdMobilenetv1.loadFromUri(MODELS_DIR);
}

init
*/
Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri(MODELS_DIR),
    faceapi.nets.ageGenderNet.loadFromUri(MODELS_DIR),
    faceapi.nets.faceExpressionNet.loadFromUri(MODELS_DIR),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODELS_DIR),
    faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODELS_DIR),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODELS_DIR),
    faceapi.nets.ssdMobilenetv1.loadFromUri(MODELS_DIR),
    faceapi.nets.tinyFaceDetector.loadFromUri(MODELS_DIR)
]).then(() => {
    console.log('MODELOS CARGADOS');
    detectar();
});

var video = document.querySelector('#video');
var canvas = document.querySelector('#canvas');
var context = canvas.getContext('2d');
var btn = document.querySelector('#btn');


canvas.style.display = 'none'
canvas.widht = 300;
canvas.height = 300;

context.widht = canvas.widht;
context.height = canvas.height;

var socket = io();

var ID
var NOMBRE = document.getElementById('nombre-anfitrion').textContent;

socket.on("connect", () => {
    socket.emit('nombre', NOMBRE);
    ID = socket.id
    console.log('MI ID: ' + ID);
    console.log('MI ID: ' + NOMBRE);
    document.getElementById('id-anfitrion').textContent = 'id:' + ID;
    document.getElementById('invitacion').textContent = ID;
	document.getElementById('link').textContent = 'https://zoomface.rada-rojasrojas.repl.co/chat/?id_room='+ID;
    //document.getElementById('nombre-anfitrion').textContent = NOMBRE;
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
        '       <img id="play-' + id + '" src="" style="position: relative;"> ' +
        //'       <canvas id="canvas-' + id + 'style="position: relative;"> </canvas>' +
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
    console.log("nuevo conectado: ");
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


function detectar() {

    console.log('comenzando las detecciones');
    setInterval(async function() {
        console.log('kakaka');
        if (lista.length > 0) {
            lista.forEach(async(item) => {
                var img = document.getElementById('play-' + item);
                let detections = await faceapi.detectSingleFace(img)
                    .withFaceLandmarks()
                    .withFaceExpressions();
                //.withAgeAndGender()
                //.withFaceDescriptors();
                let displaySize
                var canvas = document.getElementById('canvas-' + item);
                if (!canvas) {
                    canvas = faceapi.createCanvasFromMedia(img);
                    canvas.id = "canvas-" + item;
                    canvas.style.position = 'absolute';
                }
                console.log(canvas);
                img.insertAdjacentElement('afterend' /*'beforebegin'*/ , canvas);
                displaySize = { width: img.width, height: img.height };
                faceapi.matchDimensions(canvas, displaySize);
                console.log(detections.expressions);

                socket.emit('detections-faces', { 'id': item, 'data': detections.expressions });

                const resizedDetections = faceapi.resizeResults(detections, displaySize);
                canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

                //faceapi.draw.drawDetections(canvas, resizedDetections);
                faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
                faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

            })
        }
    }, 1)
}
/*
var btn_temrinar = document.getElementById('btn-terminar');
btn_temrinar.onclick = () => {
    socket.emit('terminar', true);
}
*/
var copiar = document.getElementById('btn-copiar');
copiar.onclick = () => {
    var cod = document.getElementById('invitacion');
    var selection = document.createRange();
    selection.selectNodeContents(cod);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(selection);
    var res = document.execCommand('copy');
    window.getSelection().removeAllRanges(selection);
}

var copiarLink = document.getElementById('btn-copiar-link');
copiarLink.onclick = () => {
    var cod = document.getElementById('link');
    var selection = document.createRange();
    selection.selectNodeContents(cod);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(selection);
    var res = document.execCommand('copy');
    window.getSelection().removeAllRanges(selection);
}

var cambiarNombre = document.getElementById('btn-cambiar-nombre');
cambiarNombre.onclick = () => {
	var nombre = document.getElementById('in-nombre').value;
	socket.emit('canbiar-nombre', nombre);
	NOMBRE = nombre
	document.getElementById('nombre-anfitrion').textContent = nombre;
}
