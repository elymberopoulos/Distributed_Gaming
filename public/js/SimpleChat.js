const $ = require('jquery');

function simpleChat(){
    var chatAppend = $('#chatAppend');
    var submitChatBTN = $('#submitChat').on('click', ()=>{
        console.log('button clicked');
        chatAppend.append("<b>"+$("#chatMessage").val()+"</b>");

    });
}
module.exports = {
    simpleChat
}


