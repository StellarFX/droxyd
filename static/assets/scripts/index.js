var socket = io();

function $_GET(param) {
	var vars = {};
	window.location.href.replace( location.hash, '' ).replace( 
		/[?&]+([^=&]+)=?([^&]*)?/gi, // regexp
		function( m, key, value ) { // callback
			vars[key] = value !== undefined ? value : '';
		}
	);

	if ( param ) {
		return vars[param] ? vars[param] : null;	
	}
	return vars;
}

/**
 * L'historique des messages
 */
let msgHistory = [];

/**
 * Transforme le texte (p) en input (input).
 * @param {HTMLElement} e
 */
function spanSwitch(e) {
  let txt = e.innerText;
  let id = $(e).attr("id");

  $(e).replaceWith(
    `<input id="${id}" onblur='spanReset(this)' maxlength="36" value='${txt}' />`
  );
  $(`#${id}`).trigger("focus");
}

/**
 * Transforme l'input (input) en texte (p).
 * @param {HTMLElement} e
 */
function spanReset(e) {
  let txt = e.value;
  let id = $(e).attr("id");
  if (id == "group-name") {
    if (e.value == "") txt = "Groupe sans nom";
    socket.emit("titleChange", txt);
  } else if (id == "username") {
    if (e.value == "") txt = "User";
    socket.emit("usernameChange", txt);
    
    txt = txt.replace(/</g, "&lt;").replace(/>/g, "&gt;"); 

    let expirationDate = new Date(Date.now + 3600000); // Date d'expiration du cookie

    document.cookie = `username=${txt}; path=/; expires=${expirationDate}`;

    $(e).replaceWith(`<p onclick="spanSwitch(this)" id="username">${txt}</p>`);
  }
}

/**
 * Met en forme tout le message à partir de la liste contenant les informations d'un (1) message.
 * @param {Array} message
 * @returns {JQuery<HTMLElement>}
 */
function loadCustomMessage(message) {
  message[1] = message[1].replace(/</g, "&lt;").replace(/>/g, "&gt;");

  var message = $(`<div class="message" id="#user-${message[2]}">
        <div class="icon" style="background-color: ${message[4]}">
            <i class="fas fa-user"></i>
        </div>
        <div class="message-infos">
            <div class="user-info">
                <span class="msg-user">${message[3]}</span>
                <span>${message[5]}</span>
            </div>
            <p class="message-text">${message[1]}</p>
        </div>
    </div>`);

  return message;
}

/**
 * Met en forme et renvoi le nouveau message type "notification".
 * @param {Object.<String, String>} infos Les informations à mettre en forme
 * @param {String} type Le type de la notification ("join" / "leave" / "rename-user" / "rename-group")
 * @returns {JQuery<HTMLElement>} La notification mise en forme
 */
function newCustomEvent(infos, type) {
  if (type == "join") {
    infos["joined"] = infos["joined"].replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return $(
      `<div class="message notification" id="join"> <div class="icon"> <i class="fas fa-arrow-right" aria-hidden="true"></i></div> <div class="message-infos"> <p class="message-text"><b>${infos["joined"]}</b> a rejoint la conversation.</p> </div> </div>`
    );
  } else if (type == "leave") {
    infos["left"] = infos["left"].replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return $(
      `<div class="message notification" id="leave"> <div class="icon"> <i class="fas fa-arrow-left" aria-hidden="true"></i> </div> <div class="message-infos"> <p class="message-text"><b>${infos["left"]}</b> a quitté la conversation.</p> </div> </div>`
    );
  } else if (type == "rename-user") {
    infos["namebefore"] = infos["namebefore"].replace(/</g, "&lt;").replace(/>/g, "&gt;");
    infos["nameafter"] = infos["nameafter"].replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return $(
      `<div class="message notification" id="rename-user"> <div class="icon"> <i class="fas fa-user-edit" aria-hidden="true"></i> </div> <div class="message-infos"> <p class="message-text"><b>${infos["namebefore"]}</b> s'est renommé en <b>${infos["nameafter"]}</b>.</p> </div> </div>`
    );
  } else if (type == "rename-group") {
    infos["user"] = infos["user"].replace(/</g, "&lt;").replace(/>/g, "&gt;");
    infos["newName"] = infos["newName"].replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return $(
      `<div class="message notification" id="rename-group"> <div class="icon"> <i class="fas fa-edit" aria-hidden="true"></i> </div> <div class="message-infos"> <p class="message-text"><b>${infos["user"]}</b> a renommé la conversation en <b>${infos["newName"]}</b>.</p> </div> </div>`
    );
  }
}

$(() => {
  /**
   * Lorsque l'utilisateur appuit sur entrée lors d'un changement de nom de groupe.
   */
  $(document).on("keydown", "#group-name", function (e) {
    if (e.key == "Enter") {
      document.getElementById("group-name").blur();
    }
  });

  /**
   * Lorsque l'utilisateur appuit sur entrée lors d'un changement de nom d'utilisateur.
   */
  $(document).on("keyup", "#username", (e) => {
    if (e.key == "Enter") {
      document.getElementById("username").blur();
    }
  });

  /**
   * Lorsque l'utilisateur appuit sur entrée dans la barre de tchat.
   */
  $(document).on("keyup", "#user-input", (e) => {
    if (e.key == "Enter") {
      let message = $("#user-input").val();
      socket.emit("message", message);
      $("#user-input").val("");
    }
  });

  socket.on("new-notification", (type, infos) => {
    let newEvent = newCustomEvent(infos, type);
    $(".tchat").prepend(newEvent);
    msgHistory.push(newEvent);
  });

  /**
   * Ajoute un utilisateur qui vient de rejoindre dans la liste des utilisateurs.
   */
  socket.on("userConnect", (uid, username, ucolor) => {
    var userConnect = $(
      `<div class="user" id="user-${uid}"><div class="icon"><i class="fas fa-user"></i></div><p>${username}</p></div>`
    );
    $(".userlist-container").append(userConnect);
    $(`#user-${uid} .icon`).css("background-color", `hsl(${ucolor},100%,72%)`);
  });

  /**
   * Charge les utilisateurs présents lorsque l'utilisateur rejoint et les charge dans la liste des utilisateurs
   */
  socket.on("loadUsers", (userList, UID) => {
    for (const [key, value] of Object.entries(userList)) {
      if(value[2] != $_GET('id')) {
        continue;
      }
      if (key == UID) {
        continue;
      } else {
        value[0] = value[0].replace(/</g, "&lt;").replace(/>/g, "&gt;");
        var user = $(
          `<div class="user" id="user-${key}"><div class="icon"><i class="fas fa-user"></i></div><p>${value[0]}</p></div>`
        );
        $(".userlist-container").append(user);
        $(`#user-${key} .icon`).css(
          "background-color",
          `hsl(${value[1]},100%,72%)`
        );
      }
    }
  });

  /**
   * Retire l'utilisateur de la liste des utilisateurs
   */
  socket.on("userDisconnect", (id) => {
    $(`#user-${id}`).remove();
  });

  /**
   * Change le titre du groupe.
   */
  socket.on("changeTitle", (name) => {
    let element = $(".name-container");

    name = name.replace(/</g, "&lt;").replace(/>/g, "&gt;");


    element[0].innerHTML = `<p id="group-name" onclick='spanSwitch(this)'> ${name} </span>`;
  });

  /**
   * Charge le nom d'utilisateur depuis le serveur.
   */
  socket.on("changeUsername", (name, id) => {
    name = name.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    let expirationDate = new Date(Date.now + 3600000); // Date d'expiration du cookie : 1h (3600000ms)

    expirationDate = expirationDate.toUTCString();

    $(`#user-${id}`).children("p").text(name);    
  });

  /**
   * Charge les infos de l'utilisateur
   */
  socket.on("changeUserInfos", (userInfos) => {
    $(`.userinfo .icon`).css(
      "background-color",
      `hsl(${userInfos[1]},100%,72%)`
    );

    userInfos[0] = userInfos[0].replace(/</g, "&lt;").replace(/>/g, "&gt;");

    $(".userinfo").children("p").text(userInfos[0]);
  });

  /**
   * S'active lors de la réception d'un message.
   */
  socket.on("newMessage", (msg, userInfos, UID, messageTime) => {
    msg = msg.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    userInfos[0] = userInfos[0].replace(/</g, "&lt;").replace(/>/g, "&gt;");

    var message = $(`<div class="message" id="#user-${UID}">
            <div class="icon">
                <i class="fas fa-user"></i>
            </div>
            <div class="message-infos">
                <div class="user-info">
                    <span class="msg-user">${userInfos[0]}</span>
                    <span>${messageTime}</span>
                </div>
                <p class="message-text">${msg}</p>
            </div>
        </div>`);
    

    if ($(".message").first().attr("id") == `#user-${UID}`) {
      let actualText = $(".message")
        .first()
        .children(".message-infos")
        .children("p").first()
        .html();
      $(".message")
        .first()
        .children(".message-infos")
        .children("p").first()
        .html(`${actualText}</br>${msg}`);
    } else {
      $(".tchat").prepend(message);
      $(`.message .icon`)
        .first()
        .css("background-color", `hsl(${userInfos[1]},100%,72%)`);
    }
  });

  /**
   * Charge l'historique des messages lorsqu'un utilisateur rejoint.
   */
  socket.on("loadMessages", (messages) => {
    if(messages == undefined) return;
    for (i = 0; i < messages.length; i++) {
      if(messages[i][0] != $_GET("id")) {
        continue;
      }
      if (messages[i].length == 3) {
        let notifToPrepend = newCustomEvent(messages[i][2], messages[i][1]);
        msgHistory.push(notifToPrepend);
      } else {
        let msgToPrepend = loadCustomMessage(messages[i]);
        msgToPrepend
          .children(".icon")
          .css("background-color", `hsl(${messages[i][4]},100%,72%)`);
        msgHistory.push(msgToPrepend);
      }
    }
    for (i = 0; i < msgHistory.length; i++) {
      if ($(".message").first().attr("id") == `#user-${messages[i][2]}`) {
        let actualText = $(".message")
          .first()
          .children(".message-infos")
          .children("p")
          .html();
        $(".message")
          .first()
          .children(".message-infos")
          .children("p")
          .html(`${actualText}</br>${messages[i][1]}`);
      } else {
        $(".tchat").prepend(msgHistory[i]);
      }
    }
  });
});
