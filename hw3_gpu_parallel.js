/* Graduate Project GPU Data Parallel */

"use strict";

(function() {
	var output = [],
		graphIndex,
		gpuBufferLength = HW3_LIBRARY.graphSize + HW3_LIBRARY.cellCount;
	
	/* GPU work invoked here */
	function computeKernel(inputVector) {
		var COMPUTE_KERNEL =
/* BEGIN GPU KERNEL */
`
//TurboJS predefines Vertex Shader and leaves us with only the Fragment Shader =(

const float CELL_COUNT = ${HW3_LIBRARY.cellCount}.;
const float GRAPH_LENGTH = ${HW3_LIBRARY.graphSize}.;
const float INDEX_FACTOR = 128.; //10+(2^4), 100+(2^7)
//const float SIZE = CELL_COUNT / 4.;

vec4 readTexture2DFromXY(vec2 position) {
	return texture2D(u_texture, position);
}

vec2 idToRealXY(float ID) {
	float real_y = float(int(ID) / int(CELL_COUNT));
	return vec2(ID - (real_y * CELL_COUNT), real_y);
}

vec2 revertToPos(float real_x, float real_y) {
	float ID = (real_y * CELL_COUNT) + real_x;
	
	vec2 position;
	position.x = (ID - 1.) / 256.;
	position.x -= float(int(position.x));
	position.y = float((int(ID / 256.) * 2) + 1) / 128.;
	
	return position;
}

void main(void) {
	float end_x = pos.x * INDEX_FACTOR;
	float end_y = (pos.y * INDEX_FACTOR) - 1.;
	float end_ID = (end_y * INDEX_FACTOR) + (end_x * 2.) + 1.;
	vec4 my_ID = vec4(end_ID - 3., end_ID - 2., end_ID - 1., end_ID);
	vec4 my_texture = read();
	vec4 to_add;
	
	vec2 real_xy = idToRealXY(end_ID);
	
	for(float y = (CELL_COUNT - 1.); y >= 0.; y--) {
		to_add = readTexture2DFromXY(revertToPos(real_xy.x, y));
		
		for(int i = 0; i < 4; i++) {
			if(my_ID[i] >= GRAPH_LENGTH) {
				gl_FragColor[i] += to_add[i];
			}
			else {
				gl_FragColor[i] = my_texture[i];
			}
		}
	}
	
	//commit(my_texture); //maps to gl_FragColor.rgba
	
	return;
}
`;
/* END GPU KERNEL */
		
		/* invoke GPU on COMPUTE_KERNEL */
		turbojs.run(inputVector, COMPUTE_KERNEL);
		
		return;
	}
	
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
			gpuBuffer = turbojs.alloc(gpuBufferLength),
			graphCopy = [],
			betweenVector = [],
			i,
			j,
			rowData;
		
		for(i = 0; i < gpuBufferLength; i++) {
			gpuBuffer.data[i] = 0;
		}
		
		/**/
		for(j = 0; j < HW3_LIBRARY.cellCount; j++) {
			for(i = 0; i < HW3_LIBRARY.cellCount; i++) {
				rowData = HW3_LIBRARY.getEncountersOfShortestPaths(directedGraph, i, j);
				consolidateRow(gpuBuffer.data, rowData, j);
			}
		}
		/**/
		
		//GPU computations
		computeKernel(gpuBuffer, directedGraph);
		
		graphCopy = directedGraph;
		/*
		for(i = 0; i < HW3_LIBRARY.graphSize; i++) {
			graphCopy[i] = gpuBuffer.data[i];
		}
		*/
		
		for(i = 0; i < HW3_LIBRARY.cellCount; i++) {
			betweenVector[i] = gpuBuffer.data[betweenVectorOffset + i];
		}
		
		output[graphIndex] = HW3_LIBRARY.stringifyMatrix(graphCopy) + betweenVector.toString() + "<hr><br>";
		
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
