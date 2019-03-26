const path = require('path');//http module must be explicitly used when using sockets
const fs = require('fs');//Require file system
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const port = process.env.PORT || 8080;//This port will guarantee that when deployed an available port will be found
const publicDir = path.join(__dirname, '../public');//set public directory path for express to serve up the files

//Get the rom data into a binary
var romData = fs.readFileSync('./emulator/rom/Legend_of_Zelda.nes', {encoding: 'binary'});


//Create server object and pass it to socketIO so sockets run on server
var app = express();
var server = http.createServer(app);

app.use(express.static(publicDir));//Express will use static middleware


//Have server listen on specified port
server.listen(port, () => {
    console.log(`Server running on port ${port}.`);
});

var io = socketIO(server);
io.on('connection', (socket) => {
    console.log('new user connection...');
});