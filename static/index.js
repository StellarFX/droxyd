var socket = io();

function spanSwitch(e) {
    let txt = e.innerText;
    let element = $(".name-container");

    element[0].innerHTML = `<input id="group-name" onblur='spanReset(this)' value='${txt}' />`;
    document.getElementsByTagName('input')[0].focus();
}

function spanReset(e) {
    let txt = e.value;
    if (e.value == "") {
        txt = "Groupe sans nom";
    }

    socket.emit('titleChange', { data: txt });
}

$(() => {

    $(document).on('keydown', '#group-name', function(e) {
        if (e.key == "Enter") {
            spanReset($('#group-name'))
        }
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

        element[0].innerHTML = `<p id="group-name" onclick='spanSwitch(this)'> ${name["data"]} </span>`;
    })

})