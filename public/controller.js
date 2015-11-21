var processApp = angular.module('processApp', []);

processApp.controller('ProcessListCtrl', function ($scope, $http) {
	$scope.processes = [];
	var url = "http://processes-api.core.djbnjack.svc.tutum.io:3000/processes";
	// var url = "http://localhost:3000/processes";
	$http.get(url)
		.then(
			response => $scope.processes = response.data.map(element => element.row[0]), 
			error => console.log(error)
		);
});