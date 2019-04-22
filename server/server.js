const path = require('path');//http module must be explicitly used when using sockets
const fs = require('fs');//Require file system
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const port = process.env.PORT || 8080;//This port will guarantee that when deployed an available port will be found
const publicDir = path.join(__dirname, '../public');//set public directory path for express to serve up the files
const gameboy = require('serverboy');
const randHash = require('random-hash');

//Create server object and pass it to socketIO so sockets run on server
var app = express();
var server = http.createServer(app);
app.use(express.static(publicDir));//Express will use static middleware

//Have server listen on specified port
server.listen(port, () => {
    console.log(`Server running on port ${port}.`);
});

//Generate random hash for peer-to-peer connection unique id's
var randomHash = randHash.generateHash({
    length: 5
});

var io = socketIO(server);
var currentScreen;
let currentUsers = 0;

function adjustUserCount(value){
    if(value === "decrement" && currentUsers > 0){
        return currentUsers -= 1;
        // did this fix the obnoxious "null remaining" ?
        //return currentUsers-- ;
    }
    else if(value === "increment"){
        currentUsers += 1;
        
        // did this fix the obnoxious userCount ?
        //return currentUsers++ ;
    }
    else{
        console.log("UserCount error.");
    }
}

//Credit to Dan Shumway for his serverboy code example
var rompath = __dirname + '/emulator/rom/Tetris.gb';
var rom = fs.readFileSync(rompath);

//start the rom.
var gameboy_instance = new gameboy();
gameboy_instance.loadRom(rom);

// var io; //Handle streaming.
var keysToPress = []; //What keys we want pressed.

// arrays to hold users and their connections/sockets
//var users=[];
var connections=[];

// app.get('/', function(req, res){
// 	//res.sendFile(__dirname + '/../public/index.html');
// 	res.sendFile(publicDir);
// });


io.on('connection', function (socket) {
    connections.push(socket);
    //console.log('connection happened');
    console.log('Connected: %s sockets connected', connections.length);

    socket.on('incrementCount', (data)=>{
        adjustUserCount('increment');
        io.emit('checkUserCount', currentUsers);
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
        }
    });

    //Now, the new connection can also send messages.
    socket.on('send message', function(data){
		console.log(data);
		io.sockets.emit('new message', {msg: data});
    });
    
    //When a user disconnects then the total user counter is decremented and every socket is notified
    socket.on('disconnect', () => {
        connections.splice(connections.indexOf(socket), 1);
        // console.log('user disconnected');
		console.log('Disconnected: %s sockets connected', connections.length);
        io.emit('userDisconnect', adjustUserCount('decrement'));
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
    if (frames % 14 === 0) { //Output every 10th frame.
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

emulatorLoop();


