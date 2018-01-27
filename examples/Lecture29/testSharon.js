(function() {
	'use strict'; 

	angular.module('testS', [])
.controller('testCtrl', testCtrl)
.directive('testDir', testDir);


	// angular.module('testS', [])
	// .controller('testCtrl', testCtrl),
	// .directive('testDir', testDir);

	function testCtrl() {

	};

	function testDir() {
		var ddo = {
			scope: {
				allowZeroUndefined: "&?",
				allowZeroTrue: "&?",
				allowZeroFalse: "&?",
				allowZeroString: "&?",
			},
			controller: testDirCtrl,
			controllerAs: "testDir",
			bindToController: true,
			templateUrl: "testDir.html"
		}
		return ddo;
	};

	function testDirCtrl() {
		var testDir = this;
		testDir.console = function() {
			console.log("allowZeroTrue: ", testDir.allowTrue);
			console.log("allowZeroTrue(): ", testDir.allowZeroTrue());
			console.log("allowZeroFalse: ", testDir.allowZeroFalse);
			console.log("allowZeroFalse(): ", testDir.allowZeroFalse());
			console.log("allowZeroString: ", testDir.allowZeroString);
			console.log("allowZeroString(): ", testDir.allowZeroString());
			console.log("allowZeroUndefined: ", testDir.allowZero);
			console.log("allowZeroUnidefined(): ", testDir.allowZero());
		}
	};
})();