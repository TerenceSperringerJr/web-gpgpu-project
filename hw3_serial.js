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
			row,
			rowOffset;
		
		//Initialization
		//PERFORMANCE WIN
		for(i = 0; i < HW3_LIBRARY.cellCount; i++) {
			betweenVector[i] = 0;
		}
		
		//Add the connection graph columns together to get direct occurences
		//PERFORMANCE LOSS
		HW3_LIBRARY.serialDirectConnects(betweenVector, directedGraph, 0);
		
		for(row = 0; row < HW3_LIBRARY.cellCount; row++) {
			rowOffset = row * HW3_LIBRARY.cellCount;
			for(i = 0; i < HW3_LIBRARY.cellCount; i++) {
				// only perform shortest paths if row, column is zero (not directly connected)
				if(directedGraph[rowOffset + i] === 0) {
					HW3_LIBRARY.getEncountersOfShortestPaths(directedGraph, i, row, betweenVector, 0);
				}
			}
		}
		
		//Output
		//PERFORMANCE MATCH?
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
