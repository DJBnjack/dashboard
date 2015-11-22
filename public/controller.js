var processApp = angular.module('processApp', []);

processApp.factory('socket', ['$rootScope', function ($rootScope) {
    var socket = io.connect('http://socketserver.messaging.djbnjack.svc.tutum.io:3210/processes');
    // var socket = io.connect('http://localhost:3210/processes');
 
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
            $scope.processes = response.data.map(element => element.row[0]);                
        }, function errorCallback(response) {
            console.log('Error:', response);
        });    
    }
    
    var setUrl = function(url) {
        processes_api_url = url;
        updateProcesses();        
    }

    socket.on('url', setUrl);
    socket.on('updated', updateProcesses);
    socket.on('error', exception => console.log(exception));
});