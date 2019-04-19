//Webpack will bundle these requires into a JS bundle for index.html to use
require('../css/index.css');
const $ = require('jquery');
const Peer = require("simple-peer")

$(document).ready(() => {


    var p2pSignal; //Signal data for peer to peer connection
    var isP2PInitiator = false;

    var peer = new Peer({

        initiator: location.hash === '#init',
        //notifies neighboring peer who is the initiator
        trickle: false
        //don't use Turn/Stun servers

    })

    peer.on('signal', data => {
        // document.getElementById('myID').value = JSON.stringify(data)
        // console.log(`The Simple Peer Data is ${JSON.stringify(data)}.`);
        p2pSignal = data;
        isP2PInitiator = true;
    });


    //establish connection to server with a socket
    var socket = io();

    var canvas = document.getElementById('mainCanvas');
    canvas.setAttribute('width', 550);
    canvas.setAttribute('height', 550);
    var ctx = canvas.getContext('2d');
    var ctx_data = ctx.createImageData(160, 144);

    console.log('about to connect');
    //var socket = io.connect('localhost:3333'); //Server address goes here.
    var socket = io();

    socket.on('connect', () => {
        console.log("Connected to server.");
        socket.emit('incrementCount', (1));
    });

    socket.on('checkUserCount', (userCount) => {
        console.log(`Total users ${userCount}.`);
        if (userCount === 1 && window.location.href === window.location.href + '') {
            window.location.href = window.location.href + '/#init';
        }
        //When server has 2 people emit the connection signal and broadcast on server side
        else if (userCount === 2 && isP2PInitiator) {
            console.log(`${userCount} users connected. Sending p2p signal ${JSON.stringify(p2pSignal)}`);
            socket.emit('p2pSignal', p2pSignal);
        }
    });

    socket.on('p2pStartSignal', (startSignal) => {
        console.log(`Broadcasted signal data ${startSignal}`);
    });

    socket.on('userDisconnect', (currentUsers) => {
        console.log(`A user disconnected ${currentUsers} remaining`);
    });

    //Credit to Dan Shumway for his serverboy code example
    socket.on('frame', function (data) {
        for (var i = 0; i < data.length; i++) {
            ctx_data.data[i] = data[i];
        }

        ctx.putImageData(ctx_data, 0, 0);
    });

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

var saveToDB = id => 
{
    
}














