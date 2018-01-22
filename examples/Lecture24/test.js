(function() {
	angular.module('testApp', [])
	.controller('shoppingListController', shoppingListController)
	.service('shoppingListService', shoppingListService)
	.service('weightLossFilterService', weightLossFilterService);

	shoppingListController.$inject = ['shoppingListService'];
	function shoppingListController(shoppingListService) {
		var list = this;
		list.name = "";
		list.quantity = "";
		list.items = shoppingListService.getItems();
		list.addItem = function() {
			shoppingListService.addItem(list.name, list.quantity);
		}

		list.removeItem = function(index) {
			shoppingListService.removeItem(index);
		}
	}

	shoppingListService.$inject = ['weightLossFilterService', '$q'];
	function shoppingListService(weightLossFilterService, $q) {
		var service = this;
		var items = [];
		service.getItems = function() {
			return items;
		}

		// service.addItem = function(name, quantity) {
		// 	var namePromise = weightLossFilterService.checkName(name);

		// 	namePromise.then(function(nameResult) {
		// 		var quantityPromise = weightLossFilterService.checkQuantity(quantity);

		// 		quantityPromise.then(function(quantityResult) {
		// 			var newItem = {
		// 				name: name,
		// 				quantity: quantity,
		// 			};
		// 			items.push(newItem);
		// 		}, function(error) {
		// 			console.log(error.message);
		// 		})
		// 	}, function(nameResult) {
		// 		console.log(nameResult.message);
		// 	});

		// 	console.log("Implement me first!");
		// }

		// service.addItem = function(name, quantity) {
		// 	var namePromise = weightLossFilterService.checkName(name);

		// 	namePromise.then(function() {
		// 		return weightLossFilterService.checkQuantity(quantity);
		// 	}).then(function() {
		// 		var newItem = {
		// 			name: name,
		// 			quantity: quantity,
		// 		};
		// 		items.push(newItem);
		// 	})
		// 	.catch(function(error) {
		// 		console.log("Error:" + error.message);
		// 	});
		// };

		service.addItem = function(name, quantity) {
			var namePromise = weightLossFilterService.checkName(name);
			var quantityPromise = weightLossFilterService.checkQuantity(quantity);

			$q.all([namePromise, quantityPromise])
			.then(function() {
				var newItem = {
					name: name,
					quantity: quantity
				};
				items.push(newItem);
			})
			.catch(function(error) {
				console.log("Error: " + error.message);
			});
		};

		service.removeItem = function(index) {
			items.splice(index, 1);
		}
	}

	weightLossFilterService.$inject = ['$q', '$timeout'];
	function weightLossFilterService($q, $timeout) {
		var service = this;

		service.checkName = function(name) {
			var result = {
				message: "",
			};

			var deferred = $q.defer();
			$timeout(function() {
				if (name.toLowerCase().indexOf('cookie') === -1) {
					deferred.resolve(result);
				}else {
					result.message = "You should not eat cookies!";
					deferred.reject(result);
				}
			}, 3000);

			return deferred.promise;
		};

		service.checkQuantity = function(quantity) {
			var result = {
				message: "",
			}

			var deferred = $q.defer();

			$timeout(function() {
				if (quantity < 5) {
					deferred.resolve(result);
				}else {
					result.message = "You should not buy more than 5!";
					deferred.reject(result);
				}
			}, 1000);

			return deferred.promise;
		};
	}
})();