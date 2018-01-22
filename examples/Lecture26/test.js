(function() {
	'use strict';
	angular.module('shoppingListApp', [])
	.controller('shoppingListController', shoppingListController)
	.controller('shoppingListController2', shoppingListController2)
	.factory('shoppingListFactory', shoppingListFactory)
	.directive('listItem', listItem);

	function listItem() {
		var ddo = {
			templateUrl: 'list.html'
		}
		return ddo;
	}

	shoppingListController.$inject=['shoppingListFactory'];
	function shoppingListController(shoppingListFactory) {
		var list = this;
		list.name = "Jenn";
		list.itemName = "";
		list.quantity = "";
		var service = shoppingListFactory();
		list.items = service.getItems();
		list.addItem = function() {
			service.addItem(list.itemName, list.quantity);
		}

		list.removeItem = function(index) {
			service.removeItem(index);
		}

		list.print = function() {
			console.log("Print is called! ");
		}

	}

	shoppingListController2.$inject=['shoppingListFactory'];
	function shoppingListController2(shoppingListFactory) {
		var list = this;
		list.name = "Jenn";
		list.itemName = "";
		list.quantity = "";
		var service = shoppingListFactory(3);
		list.items = service.getItems();
		list.addItem = function() {
			try {
				service.addItem(list.itemName, list.quantity);
			} catch(error) {
				list.error = error.message;
			}
			
		}

		list.removeItem = function(index) {
			service.removeItem(index);
		}

	}

	function shoppingListFactory() {
		var factory = function (maxItem) {
			return new shoppingListService(maxItem);
		}
		return factory;
	}

	function shoppingListService(maxItem) {
		var service = this;
		var items = [];
		service.getItems = function() {
			return items;
		}

		service.addItem = function(name, quantity) {
			if (maxItem === undefined || maxItem > items.length) {
				var newItem = {
					itemName: name,
					quantity: quantity,
				};
				items.push(newItem);
			}else {
				throw new Error('maxItem exceed!');
			}
		};

		service.removeItem = function(index) {
			items.splice(index, 1);
			console.log("removeItem is called!");
		}
	}
})();