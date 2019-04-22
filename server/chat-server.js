const path = require('path');
const fs = require('fs');
const publicDir = path.join(__dirname, '../public/index.html');

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

users = [];
connections =[];

server.listen(process.env.PORT || 8080);
console.log("server running ...");


app.get('/', function(req, res){
	//res.sendFile(__dirname + '/../public/index.html');
	res.sendFile(publicDir);
});

io.sockets.on('connection', function(socket){
	// connect
	connections.push(socket);
	console.log('Connected: %s sockets connected', connections.length);

	// disconnect
	socket.on('disconnect', function(data){
		connections.splice(connections.indexOf(socket), 1);
		console.log('Disconnected: %s sockets connected', connections.length);
	});

	//Send Message
	socket.on('send message', function(data){
		console.log(data);
		io.sockets.emit('new message', {msg: data});
	});
});
