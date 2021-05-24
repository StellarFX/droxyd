from flask import Flask, render_template
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'

socketio = SocketIO(app)

@app.route('/')
def setupPage():
    return render_template('login.html')

@socketio.on('name')
def nameHandler(json):
    print(json)

@socketio.on('connect')
def userConnect():
    emit('userConnect', broadcast=True)

@socketio.on('disconnect')
def userDisconnect():
    emit('userDisconnect', broadcast=True)

# CUSTOM EVENTS

@socketio.on('titleChange')
def titleChange(name):
    emit('changeTitle', name, broadcast=True)

if __name__ == "__main__":
    socketio.run(app)
