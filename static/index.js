var socket = io();

function spanSwitch(e) {
    let txt = e.innerText;
    let id = $(e).attr('id');

    $(e).replaceWith(`<input id="${id}" onblur='spanReset(this)' value='${txt}' />`);
    $(`#${id}`).trigger('focus');
}

function spanReset(e) {
    let txt = e.value;
    let id = $(e).attr('id');
    if (id == "group-name") {

        if (e.value == "") txt = "Groupe sans nom";
        socket.emit('titleChange', { data: txt });

    } else if (id == "username") {

        if (e.value == "") txt = "User";
        socket.emit('usernameChange', txt);
        $(e).replaceWith(`<p onclick="spanSwitch(this)" id="username">${txt}</p>`)
    }

}

// ----
// REMOVE WHEN PROD 
// ----
/*function generateRandomColor() {
    let alreadyUsedColors = [];
    let rColor = Math.floor(Math.random() * (360 - 0 + 1) + 0);
    if (rColor in alreadyUsedColors) {
        generateRandomColor();
        return false;
    } else {
        alreadyUsedColors.push(rColor);
        return rColor;
    }
}*/

$(() => {

    /*$(".icon").each((index, element) => {
        let newColor = generateRandomColor();
        $(element).css('background-color', `hsl(${newColor},100%,72%)`);
        $(element).
    })*/

    $(document).on('keydown', '#group-name', function (e) {
        if (e.key == "Enter") {
            $('#group-name').trigger('blur');
        }
    })

    $(document).on('keydown', '#username', (e) => {
        if (e.key == 'Enter') {
            $('#username').trigger('blur');
        }
    })

    // TODO

    /*$(document).on('keyup', '#user-input', (e) => {
        if (e.key == "Enter") {
            console.log('lapin');
            let message = $("#user-input").val();
            socket.emit('message', message)
        }
    })*/

    socket.on('userConnect', (uid, username, ucolor) => {
        var userConnect = $(`<div class="user" id="user-${uid}"><div class="icon"><i class="fas fa-user"></i></div><p>${username}</p></div>`)
        $(".userlist-container").append(userConnect);
        $(`#user-${uid} .icon`).css('background-color', `hsl(${ucolor},100%,72%)`);
    })

    socket.on('loadUsers', (userList, UID) => {
        console.log(userList, UID);
        for (const [key, value] of Object.entries(userList)) {
            if (key == UID) {
                continue;
            } else {
                var user = $(`<div class="user" id="user-${key}"><div class="icon"><i class="fas fa-user"></i></div><p>${value[0]}</p></div>`);
                $(".userlist-container").append(user);
                console.log("uid " + key, "username " + value[0], "color " + value[1]);
                console.log(".userlist-container")
                $(`#user-${key} .icon`).css('background-color', `hsl(${value[1]},100%,72%)`);
            }
        }
    })

    socket.on('userDisconnect', (id) => {
        $(`#user-${id}`).remove();
    })

    socket.on('changeTitle', (name) => {
        let element = $(".name-container");

        /*if(element[0].children('input'))*/
        element[0].innerHTML = `<p id="group-name" onclick='spanSwitch(this)'> ${name["data"]} </span>`;
    })

    socket.on('changeUsername', (name, id) => {
        console.log(name)
        $(`#user-${id}`).children('p').text(name);
    })

    socket.on('changeUserInfos', (userInfos) => {
        $(`.userinfo .icon`).css('background-color', `hsl(${userInfos[1]},100%,72%)`);
        $('.userinfo').children('p').text(userInfos[0]);
    })

})