const assert = require('chai').assert;
var io = require('socket.io-client');

var socketURL = 'http://127.0.0.1:8080'

var options = {
    transports: ['websocket'],
    'force new connection': true
};

describe('Server should broadcast user count to new users', function () {
    var client1 = io.connect(socketURL, options);
    
    var client2 = io.connect(socketURL, options);
    
    it('3rd userConnection test', function (done) {
        var client3 = io.connect(socketURL,options);
        client1.on('userConnected', function (userCount) {
            assert.equal(userCount, 3);
            client3.disconnect();
            done();
        });
    });

    it('userDisconnected test', function (done) {
        client1.disconnect();
        client2.on('userDisconnect', function (userCount) {
            assert.equal(userCount, 1);
            client2.disconnect();
            done();
        });
    });
});
