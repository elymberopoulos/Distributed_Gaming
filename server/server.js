const path = require('path');
//http module must be explicitly used when using sockets
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
//This port will guarantee that when deployed an available port will be found
const port = process.env.PORT || 8080;

//Save a path to the index.html file
const mainHTMLPath = path.join(__dirname, '../html');

//Create server object and pass it to socketIO so sockets run on server
var app = express();
var server = http.createServer(app);
var io = socketIO(server);


//Express will use static middleware
app.use(express.static(mainHTMLPath));

//Have server listen on specified port
server.listen(port, () => {
    console.log(`Server running on port ${port}.`);
});

io.on('connection', (socket) => {
    console.log('new user connection...');
});