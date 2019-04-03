const path = require('path');//http module must be explicitly used when using sockets
const fs = require('fs');//Require file system
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const port = process.env.PORT || 8080;//This port will guarantee that when deployed an available port will be found
const publicDir = path.join(__dirname, '../public');//set public directory path for express to serve up the files
const gameboy = require('serverboy');

//Create server object and pass it to socketIO so sockets run on server
var app = express();
var server = http.createServer(app);
app.use(express.static(publicDir));//Express will use static middleware
var currentUsers = 0;//variable to track the total current users on the server

//Have server listen on specified port
server.listen(port, () => {
    console.log(`Server running on port ${port}.`);
});

var io = socketIO(server);

var currentScreen;


//Credit to Dan Shumway for his serverboy code example
function loadROM(file_path) {

    var rom = fs.readFileSync(file_path);

    //start the rom.
    var gameboy_instance = new gameboy();
    gameboy_instance.loadRom(rom);

    // var io; //Handle streaming.
    var keysToPress = []; //What keys we want pressed.

    var start_io = function () {

        io.on('connection', function (socket) {
            console.log('connection happened');
            //Logic for handeling a new connection here.

            //The new connection can send commands.
            socket.on('keydown', function (data) {
                var index = keysToPress.indexOf(data.key);
                if (index === -1) {
                    keysToPress.push(data.key);
                }
            });

            socket.on('keyup', function (data) {
                var index = keysToPress.indexOf(data.key);
                if (index !== -1) {
                    keysToPress.splice(index, 1);
                }
            });

            socket.on('restart', function (data) {
                gameboy_instance.loadROM(rom);
            });

        });
    };

    //Handle doing a single frame.
    //You want to basically time this at about 60fps.
    var frames = 0; var lastFrame = undefined; var currentFrame = undefined;
    var audioLoop = [];
    var emulatorLoop = function () {
        var start = process.hrtime();

        gameboy_instance.pressKeys(keysToPress);
        currentScreen = gameboy_instance.doFrame();

        // let currentAudio = gameboy_instance.getAudio();

        //Compress into mono - literally throw away half the frames
        // for (let i = 0; i < 705; i += 2) {
        //     audioLoop.push(currentAudio[i]);
        // }

        frames++;
        if (frames % 10 === 0) { //Output every 10th frame.
            if (io) {
                console.log(frames);

                io.emit('frame', currentScreen);
                io.emit('memory', gameboy_instance.getMemory());
                // io.emit('audio', audioLoop);
                audioLoop = [];
            }
        }

        var elapsed = process.hrtime(start)[1] / 1000000;
        setTimeout(emulatorLoop, 5); //Try and run at about 60fps.
    };


    start_io();
    emulatorLoop();
}


console.log('starting to load rom');
var rom = __dirname + '/emulator/rom/Pokemon.gbc';
loadROM(rom);




//The socket parameter is the connection between the client and the server.
io.on('connection', (socket) => {
    console.log('new user connection...');
    currentUsers++;
    console.log(`Total users on server ${currentUsers}`);

    //When the user inputs a command from the client this is where it is handled and passed to emulator running the game.
    socket.on('command', (userCommand) => {
        game.keyboard(userCommand);
        console.log(`Command ${userCommand} issued to game.`);
    });

    //When a user disconnects then the total user counter is decremented and every socket is notified
    socket.on('disconnect', () => {
        console.log('user disconnected');
        currentUsers--;
        io.emit('userDisconnect', currentUsers);
    })
});

