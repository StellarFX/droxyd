from flask import Flask, render_template
from flask.globals import session
from flask_socketio import SocketIO, emit

app = Flask(__name__)
socketio = SocketIO(app)

import sessionHandler

title = {"data": "Nouveau groupe"}

@app.route('/')
def setupPage():
    return render_template('login.html')

@socketio.on('name')
def nameHandler(json):
    print(json)

userList = {}

@socketio.on('connect')
def userConnect():
    sessionHandler.setUID()
    sessionHandler.setUsername()
    sessionHandler.setUniqueColor()
    userList[sessionHandler.getUID()] = [sessionHandler.getUsername(), sessionHandler.getUniqueColor()]
    emit('userConnect', (sessionHandler.getUID(), sessionHandler.getUsername(), sessionHandler.getUniqueColor()), include_self=False, broadcast=True)
    emit('changeTitle', title)
    emit('changeUserInfos', userList[sessionHandler.getUID()])
    emit('loadUsers', (userList, sessionHandler.getUID()))

@socketio.on('disconnect')
def userDisconnect():
    userList.pop(session['id'])
    emit('userDisconnect', sessionHandler.getUID(), broadcast=True)

# CUSTOM EVENTS

@socketio.on('titleChange')
def titleChange(name):
    global title
    title = name
    emit('changeTitle', title, broadcast=True)

@socketio.on('usernameChange')
def changeUsername(name):
    sessionHandler.setUsername(name)
    userList[sessionHandler.getUID()] = [name, sessionHandler.getUniqueColor()]
    emit('changeUsername', (name, sessionHandler.getUID()), include_self=False, broadcast=True)

@socketio.on('message')
def handleMessage(msg):
    print(sessionHandler.getUsername())
    # emit('newMessage', json, broadcast=True)
    print(msg)

if __name__ == "__main__":
    socketio.run(app)
