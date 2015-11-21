var processApp = angular.module('processApp', []);

processApp.factory('socket', ['$rootScope', function ($rootScope) {
    var socket = io.connect();
 
    return {
        on: function (eventName, callback) {
            function wrapper() {
                var args = arguments;
                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                });
            }
 
            socket.on(eventName, wrapper);
 
            return function () {
                socket.removeListener(eventName, wrapper);
            };
        },
 
        emit: function (eventName, data, callback) {
            socket.emit(eventName, data, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    if(callback) {
                        callback.apply(socket, args);
                    }
                });
            });
        }
    };
}]);

processApp.controller('ProcessListCtrl', function ($scope, $http, socket) {
	$scope.processes = [];
    $scope.recievedTroughSocket = "";
    
	var url = "http://processes-api.core.djbnjack.svc.tutum.io:3000/processes";
	// var url = "http://localhost:3000/processes";
	$http.get(url)
		.then(
			response => $scope.processes = response.data.map(element => element.row[0]), 
			error => console.log(error)
		);
	
    var logData = function(data) {
        $scope.recievedTroughSocket += "[" + new Date().toLocaleString() + "] " + data + "\n";
    }
    
	socket.on('system', logData);
});