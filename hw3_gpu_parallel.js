/* Graduate Project GPU Data Parallel */

"use strict";

(function() {
	var output = [],
		graphIndex,
		gpuBufferLength = HW3_LIBRARY.graphSize + HW3_LIBRARY.cellCount,
		gpuBuffer;
	
	function consolidateRow(buffer, rowData, row) {
		var i;
		
		for(i = 0; i < rowData.length; i++) {
			buffer[(row * HW3_LIBRARY.cellCount) + i] += rowData[i];
		}
		
		return;
	}
	
	/* This initializes the data and calls the computeKernel */
	function betweenerGPU() {
		var betweenVectorOffset = HW3_LIBRARY.graphSize,
			directedGraph = HW3_LIBRARY.directedGraph[graphIndex],
			i,
			y,
			rowOffset,
			buffer = gpuBuffer.data;
		
		//Initialization
		//BIG PERFORMANCE LOSS!
		for(i = 0; i < HW3_LIBRARY.graphSize; i++) {
			buffer[i] = directedGraph[i];
		}
		//Rough equivalent of serial initialization
		for(; i < gpuBufferLength; i++) {
			buffer[i] = 0;
		}
		
		//GPU work: add the connection graph columns together to get direct occurences
		//PERFORMANCE WIN?
		turbojs.run(gpuBuffer, DIRECT_CONNECTS);
		
		for(y = 0; y < HW3_LIBRARY.cellCount; y++) {
			rowOffset = y * HW3_LIBRARY.cellCount;
			
			for(i = 0; i < HW3_LIBRARY.cellCount; i++) {
				if(directedGraph[rowOffset + i] === 0) {
					HW3_LIBRARY.getEncountersOfShortestPaths(directedGraph, i, y, buffer, betweenVectorOffset);
				}
			}
		}
		
		//invoke GPU on gpuBuffer using ADD_ROWS shader
		//obsolete but I worked really hard on it and it paved the way for new computation
		//turbojs.run(gpuBuffer, ADD_ROWS);
		
		//Output
		//Either match or slight loss -depending on toString() implementation
		if(HW3_LIBRARY.verboseMode) {
			output[graphIndex] = HW3_LIBRARY.stringifyMatrix(directedGraph) + buffer[betweenVectorOffset];
			for(i = 1; i < HW3_LIBRARY.cellCount; i++) {
				output[graphIndex] += "," + buffer[betweenVectorOffset + i];
			}
			output[graphIndex] += "<hr><br>";
		}
		
		graphIndex++;
		
		return;
	}
	
	window.startGPUParallel = function() {
		var times,
			i;
		
		if(!turbojs) {
			$("#gpu-results").html("ERROR: TurboJS is unable to work with your system =(");
			
			return;
		}
		
		gpuBuffer = turbojs.alloc(gpuBufferLength);
		graphIndex = 0;
		
		HW3_LIBRARY.clearOutput();
		$("#gpu-results").html("Running GPU Parallel Version...");
		times = HW3_LIBRARY.profileFunction(betweenerGPU, HW3_LIBRARY.profileCalls);
		
		if(HW3_LIBRARY.verboseMode) {
			for(i = 0; i < HW3_LIBRARY.profileCalls; i++) {
				HW3_LIBRARY.printToOutput(output[i]);
			}
		}
		
		HW3_LIBRARY.printTimeStatistics(times, $("#gpu-results")[0]);
		
		return;
	};
	
	return;
})();
