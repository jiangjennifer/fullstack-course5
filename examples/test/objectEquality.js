(function() {
	angular.module('equalityApp', [])
	.controller('equalController', equalController);

	equalController.$inject = ['$scope'];
	function equalController($scope) {
		$scope.obj = {
			name: "Jenn",
			age: 24 
		}
	}
})();