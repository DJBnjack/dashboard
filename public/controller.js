var processApp = angular.module('processApp', []);

processApp.factory('socket', ['$rootScope', function ($rootScope) {
    var socket = io.connect('http://socketserver.messaging.djbnjack.svc.tutum.io:3210/processes');
 
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
    
    var updateProcesses = function(data) {
        $scope.processes = JSON.parse(data).map(element => element.row[0]);
    }
    
    socket.on('processes', updateProcesses);
    socket.on('system', msg => console.log(msg))
});