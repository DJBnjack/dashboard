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
    var processes_api_url = "";
    
    var updateProcesses = function() {
        $http({
            method: 'GET',
            url: processes_api_url
        }).then(function successCallback(response) {
            if(response.statusCode !== 200){
                console.log('Invalid Status Code Returned:', response.statusCode);
            } else {
                $scope.processes = response.body;                
            }
        }, function errorCallback(response) {
            console.log('Error:', response);
        });    
    }

    socket.on('url', url => processes_api_url = url);
    socket.on('updated', updateProcesses);
});