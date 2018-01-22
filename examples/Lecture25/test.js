(function() {
	'use strict';

	angular.module('testApp', []) 
	.controller('testController', testController)
	.service('testService', testService)
	.constant('apiBasePath', "http://davids-restaurant.herokuapp.com");

	testService.$inject = ['$http', 'apiBasePath'];
	function testService($http, apiBasePath) {
		var service = this;
		service.getMenuCategories = function() {
			var promise = $http({
				url: (apiBasePath + "/categories.json"),
			});
			return promise;
		}

		service.logMenuCategories = function(shortName) {
			var promise = $http({
				url: ("http://davids-restaurant.herokuapp.com/menu_items.json"),
				params: {
					category: shortName
				}
			});
			return promise;
		}
	}

    testController.$inject = ['testService'];
	function testController(testService) {
		var menu = this;

		var promise = testService.getMenuCategories();
		promise.then(function(response) {
			menu.categories = response.data;
		})
		.catch(function(error) {
			console.log("Something went terribly wrong!");
		});

		menu.showCategory = function(shortName) {
			var promise = testService.logMenuCategories(shortName);
			promise.then(function(response) {
				console.log(response.data);
			})
			.catch(function() {
				console.log("Something went wrong!");
			})
		}
	}

})();