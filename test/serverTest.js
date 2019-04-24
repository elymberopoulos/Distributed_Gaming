const assert = require('chai').assert;
var io = require('socket.io-client');
const Browser = require('zombie');


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
            console.log('disconnected');
        });
    });

    afterEach(function(done) {
        // Cleanup
        if(socket.connected) {
            console.log('disconnecting');
            socket.disconnect();
        } else {
            console.log('no connection to break');
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

    it('Server should be able to receive keydown and keyup commands', function(done){
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
            console.log('disconnected');
        });
    });

    afterEach(function(done) {
        // Cleanup
        if(socket.connected) {
            console.log('disconnecting');
            socket.disconnect();
        } else {
            console.log('no connection to break');
        }

        if(socket2)
        done();
    });

    it('Server should lower count when a user disconnects', function(done){
        socket2.disconnect();
        
        socket.on('userDisconnect', function(userCount){
            assert.equal(userCount,1);
            done();
        });
    });
});

// describe("Client should be able to connect to server",function(){
    
//     const browser = new Browser();

//     before(function(done) {
//         browser.visit('//#init',done());
//       });

//     it('Client success', function(){
//         browser.assert.success();
//     })
// });

describe('p2pTest in relation to server job', function(){
        // Setup
    before(function(done){
    socket2 = io.connect(socketURL,options);
    socket = io.connect(socketURL, options);
    done();
    })
    
    after(function(done){
        socket2.disconnect();
        socket.disconnect();
        done();
    })

    it('Server should emit to everyone p2pSignal when received', function(done){
        socket.emit('p2pSignal', (1));

        socket2.on('p2pStartSignal',function(p2pSignal){
            assert.equal(p2pSignal,1);
            done();
        });
    });



    it('Server should emit to everyone 2ndSignal when received', function(done){
        socket.emit('2ndSignal', (2));

        socket2.on('2ndSignal',function(p2pSignal){
            assert.equal(p2pSignal,2);
            done();
        });
    });

    it('Server should start p2p and emit StartP2PServer when told', function(done){
        socket.emit('StartP2PServer');

        done();
    });
})




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
