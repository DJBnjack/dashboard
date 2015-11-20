$(document).ready(function() {
	var socket = io();
	
	$('form').submit(function(e){
		console.log('sending message');
		socket.emit('chat message', $('#m').val());
		$('#m').val('');
		e.preventDefault();
	});
	
	socket.on('chat message', function(msg){
		$('#messages').append($('<li>').text(msg));
	});
});