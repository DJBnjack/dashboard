var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var redis = require('socket.io-redis');
io.adapter(redis({ host: 'redis.core.djbnjack.svc.tutum.io', port: 6379 }));

// Routing
app.use(express.static(__dirname + '/public'));

setInterval(() => io.emit('system', 'ping from server'), 5000);

// Socket logic
io.on('connection', function(socket){
    console.log('user connected');
	socket.emit('system', 'hello, user!');
	
    
	socket.on('chat message', function(msg){
		console.log('message: ' + msg);
		io.emit('chat message', msg);
	});
});

// Listen
http.listen(3001);