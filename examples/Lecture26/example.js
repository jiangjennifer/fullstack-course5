(function() {
	'use strict';

	angular.module('test', [])
	.controller('ShoppingListController1', ShoppingListController1)
	.factory('ShoppingListFactory', ShoppingListFactory)
	.directive('listItem', listItem);

	function listItem() {
		var ddo = {
			templateUrl: 'exampleListItem.html',
		}
		return ddo;
	}

    ShoppingListController1.$inject = ['ShoppingListFactory'];
	function ShoppingListController1(ShoppingListFactory) {
		var list = this;
		list.itemName = "";
		list.itemQuantity = 0;
		var service = ShoppingListFactory(3);
		list.items = service.getItems();
		list.add = function() {
			try {
				service.add(list.itemName, list.itemQuantity);
			} catch(error) {
				list.errorMessage = error.message;
			}
		}

		list.remove = function(index) {
			service.remove(index);
		}
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

		service.add = function(itemName, itemQuantity) {
			if (maxItem !== undefined && items.length >= maxItem) {
				throw new Error('maxItem exceeds!');
			}
			var item = {
				name: itemName,
				quantity: itemQuantity,
			}
			items.push(item);
		}

		service.remove = function(index) {
			items.splice(index, 1);
		}
	}

})();
