from hashlib import new
import os
from random import randint, randrange

try:
  from flask import Flask, render_template, request, redirect
  from flask.globals import session
  from flask_socketio import SocketIO, emit, join_room, leave_room
  from time import strftime, localtime
  import re
except ImportError:
  os.system('pip install flask flask-socketio eventlet')
  from flask import Flask, render_template, request, redirect
  from flask.globals import session
  from flask_socketio import SocketIO, emit, join_room, leave_room
  from time import strftime, localtime
  import re

import sessionHandler

app = Flask(__name__)
app.secret_key = "c'est secret sale fils de pute"
socketio = SocketIO(app)


title = {}

@app.route('/dev/login')
def showLoginPage():
    sessionHandler.setRoom(None)
    # leave_room(sessionHandler.getRoom())
    userDisconnect()
    return render_template('login.html')

@app.route('/')
def setupPage():
    try:
        if(request.cookies.get('username') == None):
            return redirect('/dev/login')
    except KeyError:
        return redirect('/dev/login')
    try:
        userRoom = sessionHandler.getRoom()
        regex = '^\d{4}$'
        
        if(re.search(regex, userRoom) != None and userRoom in rooms):
            return redirect(f'/chat?id={sessionHandler.getRoom()}')
        else:
            return redirect('/dev/login')
    except:
        return redirect('/dev/login')

@app.route('/chat', methods=['POST', 'GET'])
def showCat():
    username = None
    try:
        username = request.cookies.get('username')
    except KeyError:
        return redirect('/dev/login')
    if(username == None or len(username) < 4):
        return redirect('/dev/login')
    if(re.search('^\d{4}$',request.args.get("id"))):
        sessionHandler.setRoom(request.args.get("id"))
        if(sessionHandler.getRoom() in rooms):
            return render_template('main.html')
        else:
            sessionHandler.setRoom(None)
            return redirect('/dev/login')
    else:
        return redirect('/dev/login')

userList = {}
# sessionHandler.getRoom() = ""

roomUserList = {}

@socketio.on('connect')
def userConnect():
    """Se déclenche lorsqu'un utilisateur rejoint.

    ``-`` Lui attribue ensuite un UID unique, un nom d'utilisateur de base, et une teinte HSL unique. 
    ``-`` Déclenche ensuite tous les événements nécessaires lorsqu'un utilisateur rejoint.
    """
    try:
        sessionHandler.getRoom()
    except KeyError:
        return

    if(sessionHandler.getRoom() == None):
        return

    try:
        title[sessionHandler.getRoom()]
    except KeyError:
        title[sessionHandler.getRoom()] = "Nouveau groupe"
    
    
    # sessionHandler.getRoom() = request.args['id']
    join_room(sessionHandler.getRoom())
    username = request.cookies.get('username')
    sessionHandler.setUID()
    sessionHandler.setUsername(username)
    sessionHandler.setUniqueColor()
    userList[sessionHandler.getUID()] = [sessionHandler.getUsername(),
                                         sessionHandler.getUniqueColor(), sessionHandler.getRoom()]
    emit('userConnect', (sessionHandler.getUID(), sessionHandler.getUsername(
    ), sessionHandler.getUniqueColor()), include_self=False, broadcast=True, room=sessionHandler.getRoom())
    emit('changeTitle', title[sessionHandler.getRoom()], room=sessionHandler.getRoom())
    emit('changeUserInfos', userList[sessionHandler.getUID()])
    emit('loadUsers', (userList, sessionHandler.getUID()))
    emit('loadMessages', messages)

    try:
        roomUserList[sessionHandler.getRoom()] += 1
    except:
        roomUserList[sessionHandler.getRoom()] = 1
    

    emit('new-notification',
         ('join', {"joined": sessionHandler.getUsername()}), broadcast=True, room=sessionHandler.getRoom())
    try:
        messages.append((sessionHandler.getRoom(), 'join', {"joined": sessionHandler.getUsername()}))
    except KeyError:
        return

@socketio.on('disconnect')
def userDisconnect():
    """Se déclenche lorsqu'un utilisateur se déconnecte.

    ``-`` Le retire ensuite de la liste des utilisateurs.
    """
    try:
        sessionHandler.getUID()
    except KeyError:
        return redirect('/dev/login')
    userList.pop(sessionHandler.getUID())
    leave_room(sessionHandler.getRoom())

    roomUserList[sessionHandler.getRoom()] -= 1

    emit('new-notification',
         ('leave', {"left": sessionHandler.getUsername()}), broadcast=True, room=sessionHandler.getRoom())
    emit('userDisconnect', sessionHandler.getUID(), broadcast=True, room=sessionHandler.getRoom())
    messages.append((sessionHandler.getRoom(), 'leave', {"left": sessionHandler.getUsername()}))

    if roomUserList[sessionHandler.getRoom()] <= 0:
        i = 0
        while i < len(messages):
            if(messages[i][0] == sessionHandler.getRoom()):
                messages.pop()[i]
            else:
                i += 1
        rooms.remove(sessionHandler.getRoom())



# CUSTOM EVENTS


@socketio.on('titleChange')
def titleChange(name):
    """Se déclenche lorsque l'utilisateur change le nom du groupe.

    Args:
        name (String): Le nom du groupe
    """
    global title
    title[sessionHandler.getRoom()] = name
    if(title[sessionHandler.getRoom()] == "" or title[sessionHandler.getRoom()] == None):
        title[sessionHandler.getRoom()] == "Nouveau groupe"
    emit('changeTitle', title[sessionHandler.getRoom()], broadcast=True, room=sessionHandler.getRoom())
    emit('new-notification', ('rename-group',
         {"user": sessionHandler.getUsername(), "newName": name}), broadcast=True, room=sessionHandler.getRoom())
    messages.append(
        (sessionHandler.getRoom(), 'rename-group', {"user": sessionHandler.getUsername(), "newName": name}))


@socketio.on('usernameChange')
def changeUsername(name):
    """Se déclenche lorsque l'utilisateur change son nom d'utilisateur.

    Args:
        name (String): Le nouveau nom d'utilisateur
    """
    namebefore = sessionHandler.getUsername()
    sessionHandler.setUsername(name)
    userList[sessionHandler.getUID()] = [name, sessionHandler.getUniqueColor(), sessionHandler.getRoom()]
    emit('changeUsername', (name, sessionHandler.getUID()),
         include_self=False, broadcast=True, room=sessionHandler.getRoom())
    emit('new-notification', ('rename-user',
         {"namebefore": namebefore, "nameafter": sessionHandler.getUsername()}), broadcast=True, room=sessionHandler.getRoom())
    messages.append(
        (sessionHandler.getRoom(), 'rename-user', {"namebefore": namebefore, "nameafter": sessionHandler.getUsername()}))


messages = []


@socketio.on('message')
def handleMessage(msg):
    """Se déclenche lors de l'envoi d'un nouveau message.

    Args:
        msg (String): Le message envoyé.
    """
    messageTime = strftime('%H:%M', localtime())
    messages.append((sessionHandler.getRoom(), msg, sessionHandler.getUID(), userList[sessionHandler.getUID(
    )][0], userList[sessionHandler.getUID()][1], messageTime))
    emit('newMessage', (msg, userList[sessionHandler.getUID(
    )], sessionHandler.getUID(), messageTime), broadcast=True, room=sessionHandler.getRoom())

#
# LOGIN EVENTS
#

rooms = []

@socketio.on('newConnection')
def setcookie(username, room):

    #resp = make_response(redirect(f'/chat?id={room}'))
    #resp.set_cookie('name', username)
    return emit('redirect', (username, room))

@socketio.on('newRoom')
def createNewRoom(username):
    newRoom = f'{randrange(1, 10**4):04}'
    if newRoom in rooms:
        createNewRoom()
    else:
        rooms.append(newRoom)
    
    # resp = make_response(redirect(f'/chat?id={newRoom}'))
    # resp.set_cookie('name', username)
    return emit('redirect', (username, newRoom))

if __name__ == "__main__":
    socketio.run(app, host='0.0.0.0', port=8080)
