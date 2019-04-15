const assert = require('chai').assert;
var io = require('socket.io-client');

var socketURL = 'http://127.0.0.1:8080'

var options = {
    transports: ['websocket'],
    'force new connection': true
};
describe('Suite of unit tests', function() {

    var socket;

    beforeEach(function(done) {
        // Setup
        socket = io.connect(socketURL, {
            'reconnection delay' : 0
            , 'reopen delay' : 0
            , 'force new connection' : true
        });
        socket.on('connect', function() {
            console.log('worked...');
            done();
        });
        socket.on('disconnect', function() {
            console.log('disconnected...');
        });
    });

    afterEach(function(done) {
        // Cleanup
        if(socket.connected) {
            console.log('disconnecting...');
            socket.disconnect();
        } else {
            // There will not be a connection unless you have done() in beforeEach, socket.on('connect'...)
            console.log('no connection to break...');
        }
        done();
    });

    after(function(done){
        socket = io.connect(socketURL, {
            'reconnection delay' : 0
            , 'reopen delay' : 0
            , 'force new connection' : true
        });
        socket.emit('shutDown');
        done();
    })

    it('Server should broadcast user count to new users', function(done) {
        socket.on('userConnected',function(userCount){
            assert.equal(userCount,2);
            done();
        });
    });

    var socket2 = io.connect(socketURL, {
        'reconnection delay' : 0
        , 'reopen delay' : 0
        , 'force new connection' : true
    });

    socket2.on('connect', function(){
        console.log('worked...');
    });
    it('Server should lower count when a user disconnects', function(done){



        socket2.disconnect();
        
        socket.on('userDisconnect', function(userCount){
            assert.equal(userCount,1);
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
