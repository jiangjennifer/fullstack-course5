(function() {
	angular.module('test', [])
	.controller('ShoppingListController', ShoppingListController)
	.controller('listController', listController)
	.factory('ShoppingListFactory', ShoppingListFactory)
	.directive('shoppingList', ShoppingList);

	function ShoppingListFactory() {
		return function(maxItem) {
			return new ShoppingListService(maxItem);
		}
	};

	function ShoppingListService(maxItem) {
		var service = this;
		var items = [];
		service.getItems = function() {
			return items;
		};
		service.add = function(name, quantity) {
			if (maxItem !== undefined && items.length === maxItem) {
				throw new Error('Max Items reached!');
			}
			var newItem = {
				itemName: name,
				itemQuantity: quantity,
			}
			items.push(newItem);
		};
		service.remove = function(index) {
			items.splice(index, 1);
		};
	}

	ShoppingListController.$inject = ['ShoppingListFactory'];
	function ShoppingListController(ShoppingListFactory) {
		var list = this;
		list.itemName = "";
		list.itemQuantity = 0;
		var service = ShoppingListFactory();
		list.items = service.getItems();
		list.name = "List1";
		list.obj = {
			name: "Jenn",
		}
		list.add = function() {
			try {
				service.add(list.itemName, list.itemQuantity);
			} catch(error) {
				list.errorMessage = error.message;
			}
		};

		list.remove = function(index) {
			console.log(list.obj);
			service.remove(index);
		};

		list.method = function(arg) {
			console.log(list.obj);
			list.prop = "hi" + arg;
		}
	}

	function ShoppingList() {
		var ddo = {
			templateUrl: "list.html",
			restrict: "E",
			scope: {
				myList: "<",
				title: "@",
				// myRemove: "&remove",
				myRemove:"<",
				myMethod: "<"
			},
			controller: 'listController as $ctrl',
			bindToController: true,
			// controllerAs: '$ctrl'
		}
		return ddo;
	}

	function listController() {
		var list = this;
		list.obj = {
			name: "Jerry",
		}
		list.cookieError = function(item){
			if (item.toLowerCase().indexOf("cookies") === -1) {
				return false;
			}
			return true;
		}
		list.changeValue = function() {
			console.log("Reach here");
			list.obj.name = "Jennifer";
			// list.obj = {
			// 	name: "Jennifer",
			// }
		}
	}
})();