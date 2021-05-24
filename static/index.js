var socket = io();

function spanSwitch(e) {
    let txt = e.innerText;
    let element = $(".name-container");

    element[0].innerHTML = `<input id="group-name" onblur='spanReset(this)' value='${txt}' />`;
    document.getElementsByTagName('input')[0].focus();
}

function spanReset(e) {
    let txt = e.value;
    if(e.value == "") {
        txt = "Groupe sans nom";
    }
    let element = $(".name-container");

    socket.emit('titleChange', { data: txt });
    element[0].innerHTML = `<p id="group-name" onclick='spanSwitch(this)'> ${txt} </span>`;
}

$(() => {

    $("#form").on('submit', (e) => {

        e.preventDefault();

        var username = $('#username').val();

        return socket.emit('name', { data: username });

    })

    /*socket.on('userConnect', () => {
        var userConnect = document.createElement('div');
        userConnect.innerHTML = "<p>Un utilisateur s'est connecté</p>";
        $("#connectlist").append(userConnect);
    })
  
    socket.on('userDisconnect', () => {
        var userDisconnect = document.createElement('div');
        userDisconnect.innerHTML = "<p>Un utilisateur s'est déconnecté</p>";
        $("#connectlist").append(userDisconnect);
    })*/

    socket.on('changeTitle', (name) => {
        let element = $(".name-container");

        element[0].innerHTML = `<p id="group-name" onclick='spanSwitch(this)'> ${txt["data"]} </span>`;
    })

})