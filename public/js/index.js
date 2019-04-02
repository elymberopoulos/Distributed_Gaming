//Webpack will bundle these requires into a JS bundle for index.html to use
require('../css/index.css');
const $ = require('jquery');

var canvas = $('#nes-canvas');
var actionButton = $('#actionButton');

//establish connection to server with a socket
var socket = io();


socket.on('connect', () => {
    console.log("Connected to server.");
});

socket.on('userDisconnect', (currentUsers) => {
    console.log(`A user disconnected ${currentUsers} remaining`);
});

socket.on('frame', (frame) => {
    console.log(`Frame received: ${frame}`);
});


