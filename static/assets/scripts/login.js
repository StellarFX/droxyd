/**
 * @type {WebSocket}
 */
var socket = io();

$(() => {

    $(document).on("click", "#submit", (e) => {
        var newUsername = $("#username").val();
        socket.emit('newConnection', newUsername);
    })

    

})
