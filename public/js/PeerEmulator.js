/*
This code is for when the server is disconnected and the players
are relying on peer to peer networks for playing the game.

TESTING THIS ON THE SERVER SIDE NOT WORKING IN PUBLIC DIRECTORY
*/
// const fs = require('fs');
const gameboy = require('serverboy');
function PeerEmulator(peer) {
    var rompath = __dirname + '/localEmulator/Tetris.gb';
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
module.exports = {
    PeerEmulator
}