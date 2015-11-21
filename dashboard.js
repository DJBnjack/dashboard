var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var client = require('socket.io-client')('http://localhost:3001');
var redis = require('socket.io-redis');
var request = require('request');

// IO adapter to get info from other senders
io.adapter(redis({ host: 'redis.core.djbnjack.svc.tutum.io', port: 6379 }));

// Routing
app.use(express.static(__dirname + '/public'));

var processJson = "";
var updateProcesses = function(callback) {
    var url = "http://processes-api.core.djbnjack.svc.tutum.io:3000/processes";
    // var url = "http://localhost:3000/processes";
    request(url, function (error, response, body) {
        if(error){
            console.log('Error:', error);
        } else if(response.statusCode !== 200){
            console.log('Invalid Status Code Returned:', response.statusCode);
        }
    
        processJson = body;
        if (callback != null) callback(processJson);
    });    
}

// Initial load of processes
updateProcesses();

// Socket logic
io.on('connection', function(socket){
	socket.emit('processes', processJson);
});

client.on('updated', function(msg){
    console.log('updated: ' + msg);
    if (msg == 'processes') {
        updateProcesses((updatedProcesses) => io.emit('processes', updatedProcesses));
    }
});

client.on('system', function(msg){
    console.log('system: ' + msg);
});

// Listen
http.listen(3001);