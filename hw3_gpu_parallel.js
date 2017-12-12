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
			graphCopy = [],
			betweenVector = [],
			i,
			k,
			row,
			rowData,
			buffer = gpuBuffer.data;
		
		//initialization performance loss
		for(i = 0; i < gpuBufferLength; i++) {
			buffer[i] = 0;
		}
		
		for(row = 0; row < HW3_LIBRARY.cellCount; row++) {
			for(i = 0; i < HW3_LIBRARY.cellCount; i++) {
				HW3_LIBRARY.getEncountersOfShortestPaths2(directedGraph, i, row, buffer, row * HW3_LIBRARY.cellCount);
			}
		}
		
		/* invoke GPU on gpuBuffer using ADD_ROWS shader */
		turbojs.run(gpuBuffer, ADD_ROWS);
		
		graphCopy = directedGraph;
		/*
		for(i = 0; i < HW3_LIBRARY.graphSize; i++) {
			graphCopy[i] = gpuBuffer.data[i];
		}
		*/
		
		output[graphIndex] = HW3_LIBRARY.stringifyMatrix(graphCopy) + gpuBuffer.data[betweenVectorOffset + i];
		for(i = 1; i < HW3_LIBRARY.cellCount; i++) {
			output[graphIndex] += "," + gpuBuffer.data[betweenVectorOffset + i];
		}
		output[graphIndex] += "<hr><br>";
		
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
		
		for(i = 0; i < HW3_LIBRARY.profileCalls; i++) {
			HW3_LIBRARY.printToOutput(output[i]);
		}
		
		HW3_LIBRARY.printTimeStatistics(times, $("#gpu-results")[0]);
		
		return;
	};
	
	return;
})();
