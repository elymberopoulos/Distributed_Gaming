//EMULATOR CODE
//Credit to Dan Shumway for his serverboy code example

function EmulatorCode(socket) {

    //--------------------------------------------------
    //Setup canvas for emulator to draw to
    let canvas = document.getElementById('mainCanvas');
    canvas.setAttribute('width', 550);
    canvas.setAttribute('height', 550);
    let ctx = canvas.getContext('2d');
    let ctx_data = ctx.createImageData(160, 144);
    //--------------------------------------------------

    socket.on('frame', function (data) {
        for (var i = 0; i < data.length; i++) {
            ctx_data.data[i] = data[i];
        }

        ctx.putImageData(ctx_data, 0, 0);
    });
    var frames = {};

    window.onkeydown = function (e) {
        keyDownSend(socket, e)
    }

    window.onkeyup = function (e) {
        var keys = {
            "37": "left",
            "39": "right",
            "38": "up",
            "40": "down",
            "90": "a",
            "88": "b",
            "13": "start",
            "32": "select"
        }
        if (keys[e.keyCode]) {
            keyUpSend(socket, e);
        }
    }

    function keyUpSend(socket, e) {
        var keys = {
            "37": "left",
            "39": "right",
            "38": "up",
            "40": "down",
            "90": "a",
            "88": "b",
            "13": "start",
            "32": "select"
        };
        socket.emit('keyup', { key: keys[e.keyCode] });
    }
    function keyDownSend(socket, e) {
        var keys = {
            "37": "left",
            "39": "right",
            "38": "up",
            "40": "down",
            "90": "a",
            "88": "b",
            "13": "start",
            "32": "select"
        };
        if (keys[e.keyCode] != undefined) {
            socket.emit('keydown', { key: keys[e.keyCode] });
        } else {
            if (e.keyCode === 27) {
                socket.emit('restart', {});
            }
        }
    }
}
module.exports = {
    EmulatorCode
}
