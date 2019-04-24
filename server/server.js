const path = require('path');//http module must be explicitly used when using sockets
const fs = require('fs');//Require file system
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const port = process.env.PORT || 8080;//This port will guarantee that when deployed an available port will be found
const publicDir = path.join(__dirname, '../public');//set public directory path for express to serve up the files
const gameboy = require('serverboy');
const P2PServer = require('./PeerEmulator');

//Change serverTimeOut to change timeout time
const serverTimeout = 3;

//Create server object and pass it to socketIO so sockets run on server
var app = express();
var server = http.createServer(app);
app.use(express.static(publicDir));//Express will use static middleware
var io = socketIO(server);
var currentScreen;
var currentUsers = 0;

//Have server listen on specified port
server.listen(port, () => {
    console.log(`Server running on port ${port}.`);
});

//Function for adjusting the user count so it cannot go below 0 in any way
function adjustUserCount(value) {
    if (value === "decrement" && currentUsers > 0) {
        return currentUsers -= 1;
    }
    else if (value === "increment") {
        return currentUsers += 1;

    }
    else {
        console.log("UserCount error.");
    }
}

//Credit to Dan Shumway for his serverboy code example
var rompath = __dirname + '/emulator/rom/TetrisDX.gbc';
var rom = fs.readFileSync(rompath);

//start the rom.
var gameboy_instance = new gameboy();
gameboy_instance.loadRom(rom);

// var io; //Handle streaming.
var keysToPress = []; //What keys we want pressed.
var timerOn = false;
var startTime = 0;
var previousTime = 0;

io.on('connection', function (socket) {
    console.log('connection happened');

    socket.on('incrementCount', (data) => {
        io.emit('checkUserCount', adjustUserCount('increment'));
    });
    //Relay the first peer's connection information to all other peers with broadcast
    socket.on('p2pSignal', (p2pSignal) => {
        console.log(`Server p2p signal is ${p2pSignal}`);
        socket.broadcast.emit('p2pStartSignal', p2pSignal);
    });

    //Relay the second peer's connection information to other peers with broadcast
    socket.on('2ndSignal', (secondSignal) => {
        console.log(`Server second signal is ${secondSignal}`);
        socket.broadcast.emit('2ndSignal', secondSignal);
    });

    socket.on('StartP2PServer', ()=>{
        // P2PServer.SetPort();
        io.emit('StartP2PServer');
        P2PServer.InitiateBackUpServer('start');
    });

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
            io.emit('acceptedKey', true);
        }
    });

    //When a user disconnects then the total user counter is decremented and every socket is notified
    socket.on('disconnect', () => {
        console.log('user disconnected');
        io.emit('userDisconnect', adjustUserCount('decrement'));
    });

    socket.on('shutDown', () => {
        console.group('Server is Shutting Down');
        currentUsers = 0;
        server.close();
        process.exit(0);
    });

    socket.on('restart', function (data) {
        gameboy_instance.loadROM(rom);
    });
});
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
    if (frames % 20 === 0) { //Output every 20th frame.
        console.log(frames);

        if (io) {

            io.emit('frame', currentScreen);
            io.emit('memory', gameboy_instance.getMemory());

            // io.emit('audio', audioLoop);
            audioLoop = [];
        }
    }

    var elapsed = process.hrtime(start)[1] / 1000000;
    setTimeout(emulatorLoop, 5); //Try and run at about 60fps.

    //this runs the timer and if no  users are connected to the server then it starts the timer
    if (currentUsers < 1) {
        if (!timerOn) {
            startTimer();
        }
        timer();
    } else {
        timerOn = false;
    }
};

//startTimer turns on the timerBoolean and sets the current time
function startTimer() {
    if (!timerOn) {
        timerOn = true;
        startTime = Date.now();
        previousTime = 0;
    }
}
//timer is the main code for the timer and will shutdown the server if it has been inactive for 3 min unless changed at the top by changing serverTimeout
function timer() {
    if (timerOn) {
        var time = (((Date.now() - startTime) / 1000) / 60);//mili to seconds to min
        if ((time - previousTime) > 1) {

            console.log('Inactive time is: ' + time.toPrecision(1) + 'min');
            previousTime = time;
        }
        if (time >= serverTimeout) {
            console.log('Server is shutting Down');
            //this is where to add code to be ran before shutdown
            io.close();
            server.close();
            process.exit(0);
        }
    }
}
emulatorLoop();

