const assert = require('chai').assert;
var io = require('socket.io-client');

var socketURL = 'http://127.0.0.1:8080'

var options = {
    'reconnection delay' : 0,
    'reopen delay' : 0,
    'force new connection' : true
};
describe('Suite of unit tests', function() {

    var socket;

    beforeEach(function(done) {
        // Setup
        socket = io.connect(socketURL,options);

        socket.on('connect', function() {
            socket.emit('incrementCount', (1));
            done();
        });

        socket.on('userDisconnect', function() {
            console.log('disconnected...');
        });
    });

    afterEach(function(done) {
        // Cleanup
        if(socket.connected) {
            console.log('disconnecting...');
            socket.disconnect();
        } else {
            console.log('no connection to break...');
        }
        done();
    });

    it('Server should broadcast user count to new users', function(done) {
        socket.on('checkUserCount',function(userCount){
            assert.equal(userCount,1);
            done();
        });
    });

    it('Server should emit frames from the emulator to the user', function(done){
        socket.on('frame', function(screen) {
            assert.equal((screen != null),true);
            done();
        });
    });

    it('User should be able to send keydown and keyup commands to server', function(done){
        socket.emit('keydown',{key:37});
        socket.emit('keyup',{key:37});

        socket.on('acceptedKey', function(data){
            assert.equal(data,true);
            done();
        });

    });
});

describe('disconnect test', function() {

    beforeEach(function(done) {
        // Setup
        socket2 = io.connect(socketURL,options);

        socket2.on('connect', function() {
            socket2.emit('incrementCount', (1));
        });

        socket = io.connect(socketURL, options);

        socket.on('connect', function() {
            socket.emit('incrementCount', (1));
            done();
        });

        socket.on('userDisconnect', function() {
            console.log('disconnected...');
        });
    });

    afterEach(function(done) {
        // Cleanup
        if(socket.connected) {
            console.log('disconnecting...');
            socket.disconnect();
        } else {
            console.log('no connection to break...');
        }
        done();
    });

    it('Server should lower count when a user disconnects', function(done){
        socket2.disconnect();
        
        socket.on('userDisconnect', function(userCount){
            assert.equal(userCount,1);
            socket.emit('shutDown');
            done();
        });
    });
});



    // it('userDisconnected test', function (done) {
    //     var client1 = io.connect(socketURL);
        
    //     var client2 = io.connect(socketURL);
    //     client1.disconnect();
    //     client2.on('userDisconnect', function (userCount) {
    //         assert.equal(userCount, 1);
    //         client2.disconnect();
    //         done();
    //     });
    // });
