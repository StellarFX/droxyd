from flask import session
from app import app
from random import randrange

app.secret_key = '&DePv5].:<UuPKW)'


def setUsername(username='User '):
    """Change le nom d'utilisateur de la personne qui effectue la requête.

    Parameters:
        baseUsername (string): Le nom d'utilisateur à changer. (De base : "User <ID>")

    Returns:
        None
    """
    if(username == 'User '):
        session['username'] = username + str(int(getUID()))
    else:
        session['username'] = username


uColors = []


def setUniqueColor():
    """Applique une couleur unique pour l'utilisateur (HSL)

    Returns:
        None si fonctionnel
    """
    uniqueColor = randrange(360)
    if(uniqueColor in uColors):
        setUniqueColor()
        return
    else:
        uColors.append(uniqueColor)
        session['uniqueColor'] = uniqueColor


def getUniqueColor():
    """Récupère la couleur unique de l'utilisateur (HSL)

    Returns:
        (int) La teinte unique de l'utilisateur (HSL)
    """
    return session['uniqueColor']


ids = 0


def setUID():
    """Applique un ID utilisateur unique

    Returns:
        None
    """
    global ids
    session['id'] = ids
    ids += 1


def getUID():
    """Récupère l'ID utilisateur

    Returns:
        (int) l'ID de session utilisateur
    """
    return session['id']


def getUsername():
    """Récupère le nom d'utilisateur de la personne qui effectue la requête.

    :return: Le nom d'utilisateur (string)
    """
    return session['username']
