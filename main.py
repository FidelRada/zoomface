from flask import Flask, render_template, redirect, url_for, request
from firebase import guardarDetections, obtenerDetections, guardarName, obtenerName
#from socketIO import conectar
from flask_socketio import SocketIO, send, emit
from pkg_resources import require


app = Flask(__name__, template_folder='templates')#, static_folder='static')
#app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

DETECCIONES_PARTICIPANTES = {}
LISTA_IDS= []
LISTA_NOMBRES = {}

@app.route('/')
def index():
    return render_template('chat/index.html')

@app.route('/chat/anfitrion', methods=['POST'])
def chat():
    nombre = request.form.get('nombre')
    return render_template('chat/anfitrion.html', title='Anfitrion', nombre = nombre)

def noExiste(id_room):        
    return id_room not in LISTA_IDS

@app.route('/chat/', methods=['POST', 'GET'])
def joinChatroom():
	if request.args:
		id_room = request.args['id_room']
		nombre = 'invitado'
	else:
		id_room = request.form.get('id_room')
		nombre = request.form.get('nombre')
	if noExiste(id_room):
		return f'<center> <h1> LA SALA: "{id_room}" NO EXISTE</h1> </center>'
	print(f'id_room={id_room}')
	return render_template('chat/participante.html', title='Participante', id_room=id_room, nombre=nombre);

@app.route('/chat/terminar')
def terminar():
    print("GUARDANDO")
    guardarDetections(DETECCIONES_PARTICIPANTES)
    guardarName(LISTA_NOMBRES)
    print('OBTENIENDO DATOS')
    db = obtenerDetections()
    nombres = obtenerName()
    socketio.emit('terminate')#, True, broadcast=True)

    return render_template('chat/informe.html', title='informe', detections=db, nombres=nombres, lista= LISTA_IDS)

@socketio.on('connect')
def connect(): 
    print(f'''**********************************
SE CONECTO: {request.sid} 
**********************************''')    
    #L = list(LISTA_IDS)
    #L.remove(request.sid)
    #print(L)
    emit('lista-conectados', LISTA_IDS)
    emit('lista-nombres', LISTA_NOMBRES)
    emit('new-connection', request.sid , broadcast=True, include_self=False)
    LISTA_IDS.append(request.sid)
    print(LISTA_IDS)

@socketio.on('nombre')
def nombre(nombre):
    LISTA_NOMBRES[request.sid] = nombre
    print('lista nombres')
    print(LISTA_NOMBRES)
    emit('lista-nombres', LISTA_NOMBRES, broadcast=True)

@socketio.on('disconnect')
def disconnect():
    print(f'''
**********************************
SE DESCONECTO: {request.sid} 
**********************************
''')
    emit('Desconectado', request.sid, broadcast=True, include_self=True)
    LISTA_IDS.remove(request.sid)
    print(LISTA_IDS)

@socketio.on('stream')
def stream(data):
    #print(f'''******************************
#STREAM
#*********************''')
    #print(data)
    emit('stream-res', {'id': request.sid, 'data': data}, broadcast=True, include_self=False)

def addDetections(sid, data):
    if not request.sid in DETECCIONES_PARTICIPANTES:
        DETECCIONES_PARTICIPANTES[sid] = []
    DETECCIONES_PARTICIPANTES[sid].append(data) 

@socketio.on('detections-faces')
def detect_faces(data):
    #print(f'''******************************
#DETECTION FACES
#*********************''')
    addDetections(data['id'], data['data'])
    print(DETECCIONES_PARTICIPANTES)

@socketio.on('terminar')
def terminate(data):
    print('sala terminada')
    if data :
        emit('terminate', data, broadcast=True, include_self=False)

@socketio.on('canbiar-nombre')
def canbiarNombre(data):
	LISTA_NOMBRES[request.sid]=data
	emit('lista-nombres', LISTA_NOMBRES, broadcast=True)

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', debug=True)
	#app.run(host='0.0.0.0', debug=True)
 
