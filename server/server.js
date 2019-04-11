const path = require('path');//http module must be explicitly used when using sockets
const fs = require('fs');//Require file system
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const port = process.env.PORT || 8080;//This port will guarantee that when deployed an available port will be found
const publicDir = path.join(__dirname, '../public');//set public directory path for express to serve up the files
const emulator = require('./emulator/nesEmulator');

//Create server object and pass it to socketIO so sockets run on server
var app = express();
var server = http.createServer(app);

app.use(express.static(publicDir));//Express will use static middleware

var currentUsers = 0;//variable to track the total current users on the server

//Emulator Variables
var game = emulator.Emulator();//Main game
var canvas = emulator.canvas;//Canvas that server displays to
var rom = emulator.rom_data;
// game.nes_init


//Have server listen on specified port
server.listen(port, () => {
    console.log(`Server running on port ${port}.`);
});

var io = socketIO(server);

//The socket parameter is the connection between the client and the server.
io.on('connection', (socket) => {
    var totalCount = io.engine.clientsCount.length
    console.log('new user connection...');
    console.log(`Total users on server ${totalCount}`);

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

/*
Set an interval for the emulator frames to be emitted from the server to all connected clients.
The clients will get the buffer array and set the canvas image with the buffer array.
*/
setInterval(() => {
    canvas.toBuffer((error, bufferArray) => {
        if (error) {
            console.log(`Canvas.toBuffer error is: ${error}`);
            throw error;
        }
        io.emit('frame', bufferArray);
    });
}, 50); //20 FPS

