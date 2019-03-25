const path = require('path');
//http module must be explicitly used when using sockets
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
//This port will guarantee that when deployed an available port will be found
const port = process.env.PORT || 8080;
//set public directory path for express to serve up the files
const publicDir = path.join(__dirname, '../public');

//Create server object and pass it to socketIO so sockets run on server
var app = express();
var server = http.createServer(app);

//Express will use static middleware
app.use(express.static(publicDir));

//Have server listen on specified port
server.listen(port, () => {
    console.log(`Server running on port ${port}.`);
});

var io = socketIO(server);
io.on('connection', (socket) => {
    console.log('new user connection...');
});