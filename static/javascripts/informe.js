const tablero = document.getElementById('tablero');
const guardar = document.getElementById('btn-guardar');

const LABELS = ['happy', 'angry', 'neutral', 'disgusted', 'sad', 'surprised', 'fearful'];
const DETECTIONS = JSON.parse(document.getElementById('detections').dataset.detections);
const LISTA = JSON.parse(document.getElementById('detections').dataset.lista);
const NOMBRES = JSON.parse(document.getElementById('detections').dataset.names);


//{ { detections['9H8lX4tiDxxtbj_UAAAD'][0] | safe } }
console.log(DETECTIONS);
console.log(LISTA);
console.log(NOMBRES);

LISTA.forEach(id => {
    addCanvas(id, NOMBRES[id]);
    console.log(id, NOMBRES[id]);
    crearGrafica(id);
});

function addCanvas(id, nombre) {
    var fracmentoHTML = '' +
        '<div id="' + id + '"class="col"> ' +
        '   <div class="card"> ' +
        //'       <img id="play-' + id + '" src="" style="position: relative;"> ' +
        '       <canvas id="canvas-' + id + '"style="position: relative;"> </canvas>' +
        '       <div class="card-body">  ' +
        '           <h5 class="card-title">' + nombre + '</h5> ' +
        '           <h5 class="card-title" style="font-size: 10px;">id: ' + id + '</h5> ' +
        '       </div> ' +
        '   </div> ' +
        '</div>';

    tablero.insertAdjacentHTML("beforeend", fracmentoHTML);
}

function crearGrafica(id) {
    const ctx = document.getElementById('canvas-' + id).getContext('2d');
    const myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: LABELS,
            datasets: [{
                label: '%',
                data: [
                    DETECTIONS[id][0].happy * 100,
                    DETECTIONS[id][0].angry * 100,
                    DETECTIONS[id][0].neutral * 100,
                    DETECTIONS[id][0].disgusted * 100,
                    DETECTIONS[id][0].sad * 100,
                    DETECTIONS[id][0].surprised * 100,
                    DETECTIONS[id][0].fearful * 100
                ],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}


guardar.onclick = () => {
    html2pdf()
        .set({
            margin: 1,
            filename: 'documento.pdf',
            image: {
                type: 'jpeg',
                quality: 0.98
            },
            html2canvas: {
                scale: 3, // A mayor escala, mejores gráficos, pero más peso
                letterRendering: true,
            },
            jsPDF: {
                unit: "in",
                format: "a3",
                orientation: 'portrait' // landscape o portrait
            }
        })
        .from(tablero)
        .save()
        .catch(err => console.log(err));
}