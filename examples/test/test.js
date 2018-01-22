(function() {
	angular.module("testApp", [])
	.controller("testController", testController);

	testController.$inject = ['$scope'];
	function testController($scope) {
		$scope.var1 = 1;
		$scope.var2 = 2 * $scope.var1;
		// $scope.add = function() {
		// 	setTimeout(function() {
		// 		$scope.$apply(function() {
		// 			$scope.var1 ++;
		// 			console.log($scope.var1);
		// 		})}, 2000);
		$scope.add = function() {
			$scope.$apply(function() {
				setTimeout(function() {
					$scope.var1 ++;
					console.log($scope.var1);
				}, 2000);
			});
		};
			// $scope.var1 ++;
			// $scope.var2 = $scope.var * 2;
			 
	}
})();