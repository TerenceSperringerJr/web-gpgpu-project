/* Graduate Project Serial */

"use strict";

(function() {
	var output = [],
		graphIndex;
	
	function consolidateBetweeness(betweenVector, assimilateVector) {
		var i;
		
		for(i = 0; i < betweenVector.length; i++) {
			betweenVector[i] += assimilateVector[i]
		}
		
		return;
	}
	
	function betweenerSerial() {
		var directedGraph = HW3_LIBRARY.directedGraph[graphIndex],
			betweenVector = [],
			i,
			j;
		
		for(i = 0; i < HW3_LIBRARY.cellCount; i++) {
			betweenVector[i] = 0;
		}
		
		for(j = 0; j < HW3_LIBRARY.cellCount; j++) {
			for(i = 0; i < HW3_LIBRARY.cellCount; i++) {
				consolidateBetweeness(betweenVector, HW3_LIBRARY.getEncountersOfShortestPaths(directedGraph, i, j));
			}
		}
		
		output[graphIndex] = HW3_LIBRARY.stringifyMatrix(directedGraph) + betweenVector.toString() + "<hr><br>";
		graphIndex++;
		
		return;
	}
	
	window.startSerial = function() {
		var times,
			i;
		
		graphIndex = 0;
		
		HW3_LIBRARY.clearOutput();
		$("#serial-results").html("Running Serial Version...");
		times = HW3_LIBRARY.profileFunction(betweenerSerial, HW3_LIBRARY.profileCalls);
		
		for(i = 0; i < HW3_LIBRARY.profileCalls; i++) {
			HW3_LIBRARY.printToOutput(output[i]);
		}
		
		HW3_LIBRARY.printTimeStatistics(times, $("#serial-results")[0]);
		
		return;
	};
	
	return;
})();
