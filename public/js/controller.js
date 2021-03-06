$(function () {
    $("#navbar ul li a[href^='#']").on('click', function(e) {
        // prevent default anchor click behavior
        e.preventDefault();
        
        // store hash
        var hash = this.hash;
        
        // animate
        $('html, body').animate({
            scrollTop: $(hash).offset().top-70
            }, 300, function(){
        
            // when done, add hash to url
            // (default click behaviour)
            window.location.hash = hash;
        });
    });
    
    $('.nav-tabs a').click(function (e) {
        e.preventDefault();
        $(this).tab('show');
    })
});

var processApp = angular.module('processApp', ['ngPrettyJson']);

processApp.factory('socket', ['$rootScope', function ($rootScope) {
    var socket = io.connect('http://socketserver-1.messaging.djbnjack.cont.tutum.io:3210/processes');
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
    $scope.title = "Elastic BPM";
	$scope.processes = [];
    $scope.selectedProcess = undefined;
    var processes_api_url = "";

    $scope.tutumServiceInfo = "";
    $scope.tutumStackInfo = "";
    $scope.tutumNodeInfo = "";
    var getTutumInfo = function () {
        $http({
            method: 'GET',
            url: 'https://dashboard.tutum.co/api/v1/service/',
             headers: {'Authorization': 'ApiKey djbnjack:97c5dae24f965291a3433efa99684113d2fee38f'}
        }).then(function successCallback(response) {
            $scope.tutumServiceInfo = response.data;                
        }, function errorCallback(response) {
            console.log('Error:', response);
        });
        
        $http({
            method: 'GET',
            url: 'https://dashboard.tutum.co//api/v1/stack/',
             headers: {'Authorization': 'ApiKey djbnjack:97c5dae24f965291a3433efa99684113d2fee38f'}
        }).then(function successCallback(response) {
            $scope.tutumStackInfo = response.data;                
        }, function errorCallback(response) {
            console.log('Error:', response);
        });
        
        $http({
            method: 'GET',
            url: 'https://dashboard.tutum.co//api/v1/node/',
             headers: {'Authorization': 'ApiKey djbnjack:97c5dae24f965291a3433efa99684113d2fee38f'}
        }).then(function successCallback(response) {
            $scope.tutumNodeInfo = response.data;                
        }, function errorCallback(response) {
            console.log('Error:', response);
        });    }
    
    // First info call
    getTutumInfo();
    
    // Schedule it every 5 secs
    setInterval(getTutumInfo, 5000);
    
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
    
    $scope.deleteProcess = function(guid) {
        $http({
            method: 'DELETE',
            url: processes_api_url + '/' + guid
        }).then(function successCallback(response) {
            console.log('Process with guid ' + guid + ' removed.');                
        }, function errorCallback(response) {
            console.log('Error:', response);
        });
    }
    
    $scope.updateProcess = function(guid) {
        $http({
            method: 'PUT',
            url: processes_api_url + '/' + guid
        }).then(function successCallback(response) {
            console.log('Process with guid ' + guid + ' updated.');                
        }, function errorCallback(response) {
            console.log('Error:', response);
        });
    }
        
    $scope.createProcess = function() {
        var newName = "New Process";
        if ($scope.newprocess != undefined) {
            newName = $scope.newprocess.name 
        }
        console.log("Creating process with name: " + newName);
        $http({
            method: 'POST',
            url: processes_api_url,
            data: { name: newName }
        }).then(function successCallback(response) {
            console.log('New process created.');                
        }, function errorCallback(response) {
            console.log('Error:', response);
        });
    }
    
    $scope.showProcess = function(index) {
        $scope.selectedProcess = index;
    }
    
    var setUrl = function(url) {
        processes_api_url = url;
        updateProcesses();        
    }
    
    $scope.getUrl = function(url) {
        return url.replace("tcp://", "http://");
    }

    socket.on('url', setUrl);
    socket.on('updated', updateProcesses);
    socket.on('error', exception => console.log(exception));
});