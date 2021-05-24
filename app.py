from flask import Flask, render_template
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'

socketio = SocketIO(app)

title = {"data": "Nouveau groupe"}

@app.route('/')
def setupPage():
    return render_template('login.html')

@socketio.on('name')
def nameHandler(json):
    print(json)

@socketio.on('connect')
def userConnect():
    emit('userConnect', broadcast=True)
    emit('changeTitle', title)

@socketio.on('disconnect')
def userDisconnect():
    emit('userDisconnect', broadcast=True)

# CUSTOM EVENTS

@socketio.on('titleChange')
def titleChange(name):
    global title
    title = name
    emit('changeTitle', title, broadcast=True)

if __name__ == "__main__":
    socketio.run(app)
