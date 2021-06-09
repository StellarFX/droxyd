from flask import redirect
from app import socketio
import sessionHandler

@socketio.on('newConnection')
def testHandler(username):
    sessionHandler.setUsername(username)
    sessionHandler.setUID()
    sessionHandler.setUniqueColor()
    return redirect('/')