var location = {}

var Peer = require("simple-peer")
var peer = new Peer({

	initiator: true,
	//notifies neighboring peer who is the initiator
	trickle:false
	//don't use Turn/Stun servers
	
})

peer.on('signal', data => {

	document.getElementById('myID').value = JSON.stringify(data)

})

document.getElementById('connect').addEventListener('click',()=>{


	var otherID = JSON.parse(document.getElementById('otherId').value)
	peer.signal(otherID)
	//establishes bidirectional communication between two peers

})

document.getElementById('send').addEventListener('click',() => {
	var yourMessage = document.getElementById('yourMessage').value
	peer.send(yourMessage)
})

peer.on('data',data => {

	var yourMessage = document.getElementById('yourMessage').value
	peer.send(yourMessage)

})

peer.on('data', data => {

	document.getElementById('messages').textContent += data = '\n' 
})


