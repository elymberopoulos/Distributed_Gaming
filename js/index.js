require('../css/index.css');
const socketIO = require('socket.io-client');
const $ = require('jquery');

var socket = io();

$(document).ready(()=>{

    socket.on('connect', ()=>{
        console.log("Connected to server.");
    });
});

