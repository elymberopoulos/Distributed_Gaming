//Webpack will bundle these requires into a JS bundle for index.html to use
require('../css/index.css');
const $ = require('jquery');
const Peer = require("simple-peer");
const BackUpEmulator = require('./BackupEmulator');
const Chat = require('./ServerChat');
const BrowserEmulator = require('./EmulatorCode');



let peers = []

function setPeers(id) {

    peers.push(id);
    console.log(peers[0])

}

function getpeers() {
    return peers;
}

function init() {

    var socket = io(); //establish connection to server with a socket
    Chat.ServerChat(socket); //Start server chat code
    BrowserEmulator.EmulatorCode(socket); //Start browser code for serverboy

    //Set interval check for connection so errors to connect wont be
    //console logged repeatedly
    setInterval(() => {
        if (socket.disconnected) {
            socket.close();
        }
    }, 10000);

    //--------------------------------------------------
    //PEER TO PEER
    let peer; //peer object initialized later based on href location to either generate initiator or generic peer
    let p2pSignal; //Signal data for peer to peer connection
    let isP2PInitiator = false; //Boolean check for the first peer created. emits special hash code signals
    var localEmulatorStarted = false; //triggered in peer.on('connect') to see if server communication is severed
    //--------------------------------------------------

    //Constructor for a new peer object. This object will generate connection codes
    //that will be sent to the peer it is supposed to connect to.
    peer = new Peer({

        initiator: location.hash === '#init',
        //notifies neighboring peer who is the initiator
        trickle: false
        //don't use Turn/Stun servers
    });


    //Data must be stringified to be sent over peer socket.
    peer.on('signal', data => {
        // document.getElementById('myID').value = JSON.stringify(data)
        console.log(`The Simple Peer Data is ${JSON.stringify(data)}.`);
        p2pSignal = data;
    });

    peer.on('connect', () => {

        console.log('Peer to peer connection established');
        //send interval messages to check that still connected with p2p
        setInterval(() => {
            peer.send('Connected');
            //This is where the backup localhost server would be started if the connection to the main server is lost.
            //When the peer to peer connection is triggered the backup server should start.

            //If the connection to the server is lost then the backup server port needs to be returned
            //to each client so that when the signal is lost their window location can be redirected to that localhost.
            if (socket.disconnected && !localEmulatorStarted) {
                console.log('Backup emulator started');
                BackUpEmulator.StartBackup();
                console.log(`SERVER STOPPED.`);
                localEmulatorStarted = true; //set back to false to avoid being repeatedly called.
            }
        }, 2000);
    });

    peer.on('data', (data) => {
        console.log(`Peer to peer data is ${data}.`);
    });

    socket.on('StartP2PServer', () => {
        console.log('Backup server succesfully called.');
    });



    socket.on('connect', () => {
        console.log("Connected to server.");
        emitIncrement(socket);
    });

    socket.on('checkUserCount', (userCount) => {
        console.log(`Total users ${userCount}.`);

        //The below if statements only apply to the first peer
        //Create the connection hash code necessary for peers to connect to the first peer.
        if (userCount === 1 && window.location.href === window.location.href + '') {
            isP2PInitiator = true;
            window.location.href = window.location.href + '/#init';
        }
        //When server has 2 people emit the connection signal and broadcast on server side
        else if (userCount === 2 && isP2PInitiator) {
            console.log(`${userCount} users connected. Sending p2p signal ${JSON.stringify(p2pSignal)}`);
            socket.emit('p2pSignal', JSON.stringify(p2pSignal));
        }
    });

    socket.on('p2pStartSignal', (startSignal) => {
        //Apply the first peer's connection code to the second peer
        console.log(`Broadcasted signal data ${startSignal}`);
        startSignal = JSON.parse(startSignal);
        setPeers(startSignal)
        console.log(`ATTEMPTING PEER TO PEER CONNECTION WITH ${startSignal}`);
        peer.signal(startSignal);

        //set a timeout so that the p2pSignal variable has time to be initialized.
        //it was sending null without the timeout. possibly use async await later
        setTimeout(() => {
            //Get the peer's connection code and return it back to the first peer
            var secondSignal = JSON.stringify(p2pSignal);
            //emit the second generated p2p signal back to the original peer to establish the connection.
            socket.emit('2ndSignal', secondSignal);
            console.log(`Second Signal sent ${secondSignal}`);
        }, 500);
    });

    //When the second signal is sent back to the original peer establish the connection between the two
    socket.on('2ndSignal', (secondSignal) => {
        console.log(`Second signal is ${secondSignal}`);
        var signal = JSON.parse(secondSignal);
        setPeers(signal)
        peer.signal(signal);
    });

    socket.on('userDisconnect', (currentUsers) => {
        console.log(`A user disconnected ${currentUsers} remaining`);
    });

}
init();



function emitIncrement(socket) {
    socket.emit('incrementCount', (1));
}



module.exports = {
    getpeers,
    setPeers,
    emitIncrement
}















