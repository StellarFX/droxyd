var socket = io();

socket.on('connect', () => {
  var name = window.prompt("Enter your name: ");
  socket.emit('name', {data: name});
})