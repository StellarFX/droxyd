$(() => {

  var socket = io();

  $("#form").on('submit', (e) => {

      e.preventDefault();

      var username = $('#username').val();
      console.log(username);

      return socket.emit('name', { data: username });

  })
  
  socket.on('userConnect', () => {
      var userConnect = document.createElement('div');
      userConnect.innerHTML = "<p>Un utilisateur s'est connecté</p>";
      $("#connectlist").append(userConnect);
  })

  socket.on('userDisconnect', () => {
      var userDisconnect = document.createElement('div');
      userDisconnect.innerHTML = "<p>Un utilisateur s'est déconnecté</p>";
      $("#connectlist").append(userDisconnect);
  })

})