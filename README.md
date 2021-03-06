<div align="center">
  <img src="https://i.ibb.co/x7kSxxS/LOGODROXYD.png" width="15%">
  <br/>
  <br/>
</div>
<div align="center">
  <a href="https://forthebadge.com"><img src="https://forthebadge.com/images/badges/made-with-python.svg"></a>
  <a href="https://forthebadge.com"><img src="https://forthebadge.com/images/badges/made-with-javascript.svg"></a>
  <a href="https://forthebadge.com"><img src="https://forthebadge.com/images/badges/built-with-love.svg"></a>
</div>


# Table des matières

- [À propos](#à-propos)
- [Fonctionnalités](#fonctionnalités)
- [Dépendances](#dépendances)
- [Comment utiliser ?](#comment-utiliser-)

## À propos

Droxyd est une messagerie instantanée développée sous Flask et basée sur "socket.io". C'est une application facile d'utilisation, légère et fonctionnelle.

## Fonctionnalités

- Envoi de messages
- Changement de nom d'utilisateur
- Changement de nom de groupe
- Différents groupes accessible via code
- Message d'événements (Connexion, déconnexion, changement de nom d'utilisateur, changement de nom de groupe).

## Dépendances

- [Flask](https://pypi.org/project/Flask/)
- [Flask-SocketIO](https://pypi.org/project/Flask-SocketIO/)
- [eventlet](https://pypi.org/project/eventlet/)

## Comment utiliser ?

De base, le serveur se lance sur le port 80 sur [localhost](http://localhost). En revanche, vous pouvez éditer ce port en modifiant la dernière ligne du fichier `app.py`.
