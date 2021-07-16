var socket = io.connect();

function $_GET(param) {
    var url_string = window.location.href;
    var url = new URL(url_string);
    var q = url.searchParams.get(param);

    return q;
}

$(() => {

    if (performance.getEntriesByType("navigation")[0].type == "reload") {
        window.history.pushState({}, document.title, "/" + "dev/login");
    }

    if ($_GET("error") != undefined) {
        switch ($_GET("error")) {
            case "username":
                $("#usernameError").css("opacity", "1");
                $("#usernameInput").css("border-bottom", "2px solid #ff5757");
                break;
            case "room":
                $("#roomError").css("opacity", "1");
                $("#roomInput").css("border-bottom", "2px solid #ff5757");
                break;
            default:
                throw new Error("No case available");
        }
    }
    console.log($_GET("error"));

    document.cookie = `username= ; path=/; expires = Thu, 01 Jan 1970 00:00:00 GMT`;

    $(document).on("submit", "#login-form", (e) => {
        e.preventDefault();
    });

    $(document).on("click", "#connect", function (e) {
        e.preventDefault();
        if (
            $("#room").val() == undefined ||
            $("#room")
                .val()
                .match(/^\d{4}$/g) == null
        ) {
            if (
                $("#username").val() != undefined &&
                $("#username").val().length >= 4
            ) {
                $("#usernameError").css("opacity", "0");
                $("#usernameInput").css("border-bottom", "");
            } else {
                $("#usernameError").css("opacity", "1");
                $("#usernameInput").css("border-bottom", "2px solid #ff5757");
            }
            $("#roomError").css("opacity", "1");
            return $("#roomInput").css("border-bottom", "2px solid #ff5757");
        }
        if ($("#username").val() == undefined || $("#username").val().length < 4) {
            if (
                $("#room").val() != undefined &&
                $("#room")
                    .val()
                    .match(/^\d{4}$/g) != null
            ) {
                $("#roomError").css("opacity", "0");
                $("#roomInput").css("border-bottom", "");
            } else {
                $("#roomError").css("opacity", "1");
                $("#roomInput").css("border-bottom", "2px solid #ff5757");
            }
            $("#usernameError").css("opacity", "1");
            return $("#usernameInput").css("border-bottom", "2px solid #ff5757");
        }
        return socket.emit("newConnection", $("#username").val(), $("#room").val());
    });

    socket.on("redirect", (username, room) => {
        let expirationDate = new Date(Date.now + 3600000); // Date d'expiration du cookie : 1h (3600000ms)

        expirationDate = expirationDate.toUTCString();

        document.cookie = `username=${username}; path=/; expires=${expirationDate}`;
        // document.cookie = `location=${window.location.pathname+window.location.search}; path=/; expires=${expirationDate}`;

        window.location.href = `/chat?id=${room}`;
        return false;
    });

    $(document).on("click", "#create", function (e) {
        if ($("#username").val() == undefined || $("#username").val().length < 4) {
            $("#usernameError").css("opacity", "1");
            return $("#usernameInput").css("border-bottom", "2px solid #ff5757");
        } else {
            socket.emit("newRoom", $("#username").val());
        }
    });
});
