import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore


# Use the application default credentials
cred = credentials.Certificate('./proyectosw1-73c5f-firebase-adminsdk-9cuc5-e35801974f.json')
firebase_admin.initialize_app(cred)

db = firestore.client()

def guardarDetections(DETECTIONS):
	try:
		print(DETECTIONS)
		doc_ref = db.collection(u'detections').document(u'anfitrion')
		print('ok docref')
		doc_ref.set(DETECTIONS)
		#print(doc_ref)
		return True
	except:
		return False

def obtenerDetections():
	try:
		users_ref = db.collection(u'detections').document('anfitrion')
		docs = users_ref.get()
		print(docs.to_dict())
		#for doc in docs:
		#	print(f'{doc}')
		return docs.to_dict()
	except:
		return {'NO':'HAY NADA'}

def guardarName(NOMBRES):
	try:
		print(NOMBRES)
		doc_ref = db.collection(u'nombres').document(u'lista')
		print('ok docref')
		doc_ref.set(NOMBRES)
		#print(doc_ref)
		return True
	except:
		return False

def obtenerName():
	try:
		users_ref = db.collection(u'nombres').document('lista')
		docs = users_ref.get()
		print(docs.to_dict())
		#for doc in docs:
		#	print(f'{doc}')
		return docs.to_dict()
	except:
		return {'NO':'HAY NADA'}

'''
config = {

	"apiKey": "AIzaSyCnvx5fbzaRyYmEO5uhV0Ehubs3-CijU1Y",
	"authDomain": "proyectosw1-73c5f.firebaseapp.com",
	"projectId": "proyectosw1-73c5f",
	"storageBucket": "proyectosw1-73c5f.appspot.com",
	"messagingSenderId": "756224073759",
	"appId": "1:756224073759:web:fb078c977fcc8606d9752a",
	"measurementId": "G-72BFH9Z5LN",
    
    "databaseURL": "firebase-adminsdk-9cuc5@proyectosw1-73c5f.iam.gserviceaccount.com",
    "serviceAccount": ""
}

firebase = pyrebase.initialize_app(config)

auth = firebase.auth()
db = firebase.database()

def crearUsuario(email, password):
	try:
		user = auth.create_user_with_email_and_password(email, password)
		auth.send_email_verification(user['idToken'])
		return True
	except:
		return False
		

def acceder(email, password):
	try:
		user = auth.sign_in_with_email_and_password(email, password)
		print(user)
		return True
	except:
		return False

def guardar(DETECTIONS):
	try:
		print(db.child("data").push("qwer"))
		return True
	except:
		return False
        
def obtener():
    try:
        return db#db.child('data')
    except:
        return {'NO':'HAY NADA'}
        
'''