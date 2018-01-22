(function() {
	'use strict';

	angular.module('test', [])
	.controller('ShoppingListController1', ShoppingListController1)
	.controller('ShoppingListController2', ShoppingListController2)
	.factory('ShoppingListFactory', ShoppingListFactory)
	.directive('listItem', ListItem);

	function ListItem() {
		var ddo = {
			templateUrl:"listItem.html",
			restrict:"E",
			scope: {
				list:"=myList",
				listName:"@",
			}
		}
		return ddo;
	}

	function ShoppingListFactory() {
		return function(maxItem) {
			return new ShoppingListService(maxItem);
		}
	}

	function ShoppingListService(maxItem) {
		var service = this;
		var items = [];
		service.getItems = function() {
			return items;
		}

		service.addItem = function(name, quantity) {
			if (maxItem !== undefined && items.length === maxItem) {
				throw new Error("Exceed max items!");
			}
			var newItem = {
				itemName: name,
				itemQuantity: quantity
			}
			items.push(newItem);
		}

		service.removeItem = function(index) {
			items.splice(index, 1);
		}
	}

	ShoppingListController1.$inject = ['ShoppingListFactory', '$q'];
	function ShoppingListController1(ShoppingListFactory, $q) {
		var list1 = this;
		var service = ShoppingListFactory();
		list1.items = service.getItems();
		list1.name = "";
		list1.quantity = 0;
		list1.total = 0;
		list1.addItem = function() {
			try {
				service.addItem(list1.name, list1.quantity);
				list1.total++;
			} catch(error) {
				list1.errorMessage = error.message;
			}
		}
		list1.removeItem = function(index) {
			service.removeItem(index);
			list1.total--;
		}

		list1.callPromise = function() {
			var promise = simulatePromise();
			promise.then(function(value) {
				console.log(value);
			});
			console.log("waiting time");
		}

		var simulatePromise = function() {
			var deferred = $q.defer();
			deferred.resolve("succeed");
			return deferred.promise;
		}
	}

	ShoppingListController2.$inject = ['ShoppingListFactory'];
	function ShoppingListController2(ShoppingListFactory) {
		var list2 = this;
		var service = ShoppingListFactory(3);
		list2.items = service.getItems();
		list2.name = "";
		list2.quantity = 0;
		list2.listName = "List 2 " + list2.items.length;
		list2.addItem = function() {
			try {
				service.addItem(list2.name, list2.quantity);
				list2.listName = "List 2 " + list2.items.length;
			} catch(error) {
				list2.errorMessage = error.message;
			}
		}
		list2.removeItem = function(index) {
			service.removeItem(index);
			list2.listName = "List 2 " + list2.items.length;
		}
	}

})();