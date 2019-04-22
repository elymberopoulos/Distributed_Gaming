const path = require('path');
const fs = require('fs');
const publicDir = path.join(__dirname, '../public/index.html');

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

users = [];
connections =[ ];

server.listen(process.env.PORT || 8080);
console.log("server running ...");


app.get('/', function(req, res){
	//res.sendFile(__dirname + '/../public/chat.html');
	res.sendFile(publicDir);
});

