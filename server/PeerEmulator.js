/*
This code is for when the server is disconnected and the players
are relying on peer to peer networks for playing the game.
*/
const path = require('path');//http module must be explicitly used when using sockets
const fs = require('fs');//Require file system
const express = require('express');
const http = require('http');
// const port = process.env.PORT || 4041;//This port will guarantee that when deployed an available port will be found
const publicDir = path.join(__dirname, '../public');//set public directory path for express to serve up the files
const gameboy = require('serverboy');
const getPort = require('get-port');

let backupServerStarted = false;
var mainPort;

// //Async function to discover an open port //CAUSING SERVER CRASHES
// async function SetPort() {
//     await getPort()
//         .then((discoveredPort) => {
//             mainPort = discoveredPort;
//             console.log(`PEER TO PEER SERVER LISTENING ON ${discoveredPort}.`);
//         }, (error) => {
//             console.log(`Error occurred while getting port ${error}!!`);
//         });
//     return mainPort;
// }

function PeerEmulator() {
    //Create server object and pass it to socketIO so sockets run on server
    var app = express();
    var server = http.createServer(app);
    app.use(express.static(publicDir));//Express will use static middleware
    // server.listen(mainPort);

    (async () => {
        await getPort().then((discoveredPort) => {
            server.listen(discoveredPort);
            console.log(`PEER TO PEER SERVER LISTENING ON DISCOVERED PORT: ${discoveredPort}.`);
        }, (error) => {
            console.log(`Error occurred while getting port ${error}!!`);
        });
        // Will use any element in the preferred ports array if available, otherwise fall back to a random port
    })();
    var rompath = __dirname + '/emulator/rom/Tetris.gb';
    var rom = fs.readFileSync(rompath);

    //start the rom.
    var gameboy_instance = new gameboy();
    gameboy_instance.loadRom(rom);

    // var io; //Handle streaming.
    var keysToPress = []; //What keys we want pressed.
    var timerOn = false;
    var startTime = 0;
    var previousTime = 0;

    //The new connection can send commands.
    // socket.on('keydown', function (data) {
    //     var index = keysToPress.indexOf(data.key);
    //     if (index === -1) {
    //         keysToPress.push(data.key);
    //     }
    // });

    // socket.on('keyup', function (data) {
    //     var index = keysToPress.indexOf(data.key);
    //     if (index !== -1) {
    //         keysToPress.splice(index, 1);
    //         io.emit('acceptedKey', true);
    //     }
    // });

    var frames = 0; var lastFrame = undefined; var currentFrame = undefined;
    var audioLoop = [];
    var emulatorLoop = function () {

        // var start = process.hrtime(); //CAUSING BROWSER ERROR
        gameboy_instance.pressKeys(keysToPress);
        currentScreen = gameboy_instance.doFrame();

        // let currentAudio = gameboy_instance.getAudio();

        //Compress into mono - literally throw away half the frames
        // for (let i = 0; i < 705; i += 2) {
        //     audioLoop.push(currentAudio[i]);
        // }

        frames++;
        if (frames % 20 === 0) { //Output every 20th frame.
            console.log(frames);
            // if (io) {

            //     io.emit('frame', currentScreen);
            //     io.emit('memory', gameboy_instance.getMemory());

            //     // io.emit('audio', audioLoop);
            //     audioLoop = [];
            // }
        }

        // var elapsed = process.hrtime(start)[1] / 1000000; //CAUSING BROWSER ERROR
        setTimeout(emulatorLoop, 5); //Try and run at about 60fps.
    }
    emulatorLoop();
}
function InitiateBackUpServer(command) {
    if (command === "start") {
        backupServerStarted = true;
    }

}
setInterval(() => {
    if (backupServerStarted) {
        PeerEmulator();
    }
}, 5000);
module.exports = {
    InitiateBackUpServer
}