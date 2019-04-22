//Webpack will bundle these requires into a JS bundle for index.html to use
require('../css/index.css');
const $ = require('jquery');

$(document).ready(() => {
    //establish connection to server with a socket
    var socket = io();

    //var screen = gameboy.getScreen();
    var canvas = document.getElementById('mainCanvas');
    //var canvas = document.querySelector('canvas');
    //canvas.setAttribute('width', 160);
    //canvas.setAttribute('height', 144);
    var ctx = canvas.getContext('2d');
    var ctx_data = ctx.createImageData(160, 144);

    // adding stats to webpage
    var connectionStats = document.getElementById('stats')
    var userStats = document.getElementById('totalUsers')

    console.log('about to connect');
    //var socket = io.connect('localhost:3333'); //Server address goes here.
    var socket = io();

    socket.on('connect', () => {
        console.log("Connected to server.");
        socket.emit('incrementCount', (1));
    });

    socket.on('checkUserCount', (userCount) => {
        console.log(`Total users ${userCount}.`);
//	ambigious way of showing total users on homepage
//        totalUsers.innerHTML = `Total users ${userCount}.`;
    });

    socket.on('userDisconnect', (currentUsers) => {
        console.log(`A user disconnected ${currentUsers} remaining`);
        if(currentUsers == null){
			connectionStats.innerHTML = `You are playing alone :(`;
		}else{
			connectionStats.innerHTML = `A user disconnected, ${currentUsers} users remaining`;}
    });

    //Credit to Dan Shumway for his serverboy code example
    socket.on('frame', function (data) {
        for (let i = 0; i < data.length; i++) {
            ctx_data.data[i] = data[i];
        }

        ctx.putImageData(ctx_data, 0, 0);
    });

    // socket.on('screen', function (data) {
    //     for (let i = 0; i < screen.length; i++) {
    //         ctx_data.data[i] = screen[i];
    //     }

    //     ctx.putImageData(ctx_data, 0, 0);
    // });

    var audioContext = new AudioContext();
    var frames = {};
    socket.on('audio', function (data) {

        //data needs to be copied to an array.
        var buffers = {
            left: [],
            right: []
        };
        /* for (let i = 0; i < data.length; i+=2) {*/
        /* buffers.left.push(data[i] || 0);*/
        /* buffers.right.push(data[i+1] || 0);*/
        /* }*/

        var buffer = audioContext.createBuffer(1, data.length, 44150.56842105263);
        buffer.getChannelData(0).set(data);
        //buffer.getChannelData(1).set(buffers.right);

        var source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.start();
    });


    window.onkeydown = function (e) {
        var keys = {
            "37": "left",
            "39": "right",
            "38": "up",
            "40": "down",
            "90": "a",
            "88": "b",
            "13": "start",
            "32": "select"
        };

        if (keys[e.keyCode] != undefined) {
            socket.emit('keydown', { key: keys[e.keyCode] });
        } else {
            if (e.keyCode === 27) {
                socket.emit('restart', {});
            }
        }
    }

    window.onkeyup = function (e) {
        var keys = {
            "37": "left",
            "39": "right",
            "38": "up",
            "40": "down",
            "90": "a",
            "88": "b",
            "13": "start",
            "32": "select"
        }
        if (keys[e.keyCode]) {
            socket.emit('keyup', { key: keys[e.keyCode] });
        }
    }

});

$(function(){
    var socket = io.connect();
});












