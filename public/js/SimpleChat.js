const $ = require('jquery');

function simpleChat(){

    var chatAppend = $('#chatAppend');
    var submitChatBTN = $('#submitChat').on('click', ()=>{
        console.log('button clicked');
        
        chatAppend.append("<div>"+$("#chatMessage").val()+"</div>");
        $("#chatMessage").val("");
    });
    var clearChat = $('#emptyChat').on('click', ()=>{
        console.log('Clear chat button clicked');
        chatAppend.empty();
    });

}
module.exports = {
    simpleChat
}


