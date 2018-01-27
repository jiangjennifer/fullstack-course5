(function() {
	'use strict';

	angular.module('test', [])
	.controller('ShoppingListController', ShoppingListController)
	.controller('MyListController', MyListController)
	.factory('ShoppingServiceFactory', ShoppingServiceFactory)
	.directive('myList', MyList);

function ShoppingServiceFactory() {
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
		service.add = function(name, quantity) {
			if (maxItem !== undefined && maxItem === items.length) {
				throw new Error('max items exceed!');
			}
			var newItem = {
				name: name,
				quantity: quantity,
			}
			items.push(newItem);
		}
		service.remove = function(index) {
			items.splice(index, 1);
		}
	}

	ShoppingListController.$inject = ['ShoppingServiceFactory'];
	function ShoppingListController(ShoppingServiceFactory) {
		var list = this;
		var service = ShoppingServiceFactory();
		list.items = service.getItems();
		list.size = list.items.length;
		list.itemName = "";
		list.itemQuantity = 0;
		list.add = function() {
			try {
				service.add(list.itemName, list.itemQuantity);
				list.size++;
			} catch (error) {
				list.errorMessage = error.message;
			}
		}
		list.remove = function(index) {
			list.lastRemoved = "the last removed item is " + list.items[index].name;
			service.remove(index);
			list.size--;
		}
	}

	function MyList() {
		var ddo = {
			scope: {
				title: "@",
				list: "=",
				items: "=",
				remove: "&"

			},
			restrict: "E",
			controller: "MyListController as myList",
			bindToController: true,
			templateUrl: "myList.html"
		}
		return ddo;
	}

	function MyListController() {
		var myList = this;
		myList.cookieDetector = function(item) {
			if (item.toLowerCase().indexOf("cookies") === -1) {
				return false;
			}
			return true;
		}
	}
})();