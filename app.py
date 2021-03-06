import os

try:
  from flask import Flask, render_template
  from flask.globals import session
  from flask_socketio import SocketIO, emit
  from time import strftime, localtime
except ImportError:
  os.system('pip install flask flask-socketio eventlet')
  from flask import Flask, render_template
  from flask.globals import session
  from flask_socketio import SocketIO, emit
  from time import strftime, localtime

import sessionHandler

app = Flask(__name__)
socketio = SocketIO(app)


title = "Nouveau groupe"


@app.route('/')
def setupPage():
    return render_template('main.html')


@socketio.on('name')
def nameHandler(json):
    print(json)


userList = {}


@socketio.on('connect')
def userConnect():
    """Se déclenche lorsqu'un utilisateur rejoint.

    ``-`` Lui attribue ensuite un UID unique, un nom d'utilisateur de base, et une teinte HSL unique. 
    ``-`` Déclenche ensuite tous les événements nécessaires lorsqu'un utilisateur rejoint.
    """
    sessionHandler.setUID()
    sessionHandler.setUsername()
    sessionHandler.setUniqueColor()
    userList[sessionHandler.getUID()] = [sessionHandler.getUsername(),
                                         sessionHandler.getUniqueColor()]
    emit('userConnect', (sessionHandler.getUID(), sessionHandler.getUsername(
    ), sessionHandler.getUniqueColor()), include_self=False, broadcast=True)
    emit('changeTitle', title)
    emit('changeUserInfos', userList[sessionHandler.getUID()])
    emit('loadUsers', (userList, sessionHandler.getUID()))
    emit('loadMessages', messages)

    emit('new-notification',
         ('join', {"joined": sessionHandler.getUsername()}), broadcast=True)
    messages.append(('join', {"joined": sessionHandler.getUsername()}))


@socketio.on('disconnect')
def userDisconnect():
    """Se déclenche lorsqu'un utilisateur se déconnecte.

    ``-`` Le retire ensuite de la liste des utilisateurs.
    """
    userList.pop(session['id'])

    emit('new-notification',
         ('leave', {"left": sessionHandler.getUsername()}), broadcast=True)
    emit('userDisconnect', sessionHandler.getUID(), broadcast=True)
    messages.append(('leave', {"left": sessionHandler.getUsername()}))

# CUSTOM EVENTS


@socketio.on('titleChange')
def titleChange(name):
    """Se déclenche lorsque l'utilisateur change le nom du groupe.

    Args:
        name (String): Le nom du groupe
    """
    global title
    title = name
    emit('changeTitle', title, broadcast=True)
    emit('new-notification', ('rename-group',
         {"user": sessionHandler.getUsername(), "newName": name}), broadcast=True)
    messages.append(
        ('rename-group', {"user": sessionHandler.getUsername(), "newName": name}))


@socketio.on('usernameChange')
def changeUsername(name):
    """Se déclenche lorsque l'utilisateur change son nom d'utilisateur.

    Args:
        name (String): Le nouveau nom d'utilisateur
    """
    namebefore = sessionHandler.getUsername()
    sessionHandler.setUsername(name)
    userList[sessionHandler.getUID()] = [name, sessionHandler.getUniqueColor()]
    emit('changeUsername', (name, sessionHandler.getUID()),
         include_self=False, broadcast=True)
    emit('new-notification', ('rename-user',
         {"namebefore": namebefore, "nameafter": sessionHandler.getUsername()}), broadcast=True)
    messages.append(
        ('rename-user', {"namebefore": namebefore, "nameafter": sessionHandler.getUsername()}))


messages = []


@socketio.on('message')
def handleMessage(msg):
    """Se déclenche lors de l'envoi d'un nouveau message.

    Args:
        msg (String): Le message envoyé.
    """
    messageTime = strftime('%H:%M', localtime())
    messages.append((msg, sessionHandler.getUID(), userList[sessionHandler.getUID(
    )][0], userList[sessionHandler.getUID()][1], messageTime))
    emit('newMessage', (msg, userList[sessionHandler.getUID(
    )], sessionHandler.getUID(), messageTime), broadcast=True)


if __name__ == "__main__":
    socketio.run(app, host='0.0.0.0', port=80)
