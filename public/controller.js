var processApp = angular.module('processApp', []);

processApp.controller('ProcessListCtrl', function ($scope) {
  $scope.processes = [
    {
		'name': 'First process',
     	'description': 'Oh yeah',
		'id': 1,
		'stepCount': 10
	}, {
		'name': 'Second process',
     	'description': 'Oh yeah',
		'id': 2,
		'stepCount': 20
	}, {
		'name': 'Third process',
     	'description': 'Oh yeah',
		'id': 3,
		'stepCount': 15
	}
  ];
});