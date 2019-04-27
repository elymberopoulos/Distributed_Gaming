const $ = require('jquery');

function ServerChat(socket) {
    var $messageForm = $('#messageForm');
    var $message = $('#message');
    var $chat = $('#chat');

    $messageForm.submit(function (e) {
        e.preventDefault();
        socket.emit('send message', $message.val());
        console.log('pressed submit');
        $message.val('');
    });

    socket.on('new message', function (data) {
        $chat.append('<div class="well">' + data.msg + '</div>');
    });
}

module.exports = {
    ServerChat
}