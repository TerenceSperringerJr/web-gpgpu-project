/* Graduate Project Serial */

"use strict";

(function() {
	var output = [],
		graphIndex,
		betweenVectorArray = [];
	
	function betweenerSerial() {
		var directedGraph = HW3_LIBRARY.directedGraph[graphIndex],
			betweenVector = betweenVectorArray[graphIndex],
			i,
			row,
			rowOffset;
		
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
		if(HW3_LIBRARY.verboseMode) {
			output[graphIndex] = HW3_LIBRARY.stringifyMatrix(directedGraph) + betweenVector.toString() + "<hr><br>";
		}
		
		graphIndex++;
		
		return;
	}
	
	window.startSerial = function() {
		var times,
			i,
			j;
		
		graphIndex = 0;
		
		for(i = 0; i < HW3_LIBRARY.profileCalls; i++) {
			betweenVectorArray[i] = [];
			
			for(j = 0; j < HW3_LIBRARY.cellCount; j++) {
				betweenVectorArray[i].push(0);
			}
		}
		
		HW3_LIBRARY.clearOutput();
		$("#serial-results").html("Running Serial Version...");
		times = HW3_LIBRARY.profileFunction(betweenerSerial, HW3_LIBRARY.profileCalls);
		
		if(HW3_LIBRARY.verboseMode) {
			for(i = 0; i < HW3_LIBRARY.profileCalls; i++) {
				HW3_LIBRARY.printToOutput(output[i]);
			}
		}
		
		HW3_LIBRARY.printTimeStatistics(times, $("#serial-results")[0]);
		
		return;
	};
	
	return;
})();
