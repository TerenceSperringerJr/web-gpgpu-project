/* Graduate Project Library */

"use strict";

var HW3_LIBRARY =
(function() {
	function HW3Library() {
		this.profileCalls = 5;
		this.cellCount = 100;
		this.graphSize = this.cellCount * this.cellCount;
		this.directedGraph = [];
		this.verboseMode = false;
		
		this.randomizeAllGraphs();
		
		return;
	}
	
	function hasQueue(toVisit) {
		var i;
		
		for(i = 0; i < toVisit.length; i++) {
			if(toVisit[i].step > 0) {
				return true;
			}
		}
		
		return false;
	}
	
	function queueNextCells(toVisit, currentCell, currentStep, directedGraph) {
		var i,
			nextIndex;
		
		for(i = 0; i < HW3_LIBRARY.cellCount; i++) {
			nextIndex = (i * HW3_LIBRARY.cellCount) + currentCell;
			if((directedGraph[nextIndex] === 1) && (toVisit[i].step === -1)) {
				/* store 'adjacent' cell */
				toVisit[i].fromCell = currentCell;
				toVisit[i].step = currentStep + 1;
			}
		}
		
		return;
	}
	
	function fetchNextCell(toVisit, currentCell) {
		var i,
			nextCell = -1,
			step = HW3_LIBRARY.cellCount;
		
		for(i = 0; i < toVisit.length; i++) {
			if((toVisit[i].step > 0) && (toVisit[i].fromCell === currentCell)) {
				nextCell = i;
				step = toVisit[i].step;
				
				break;
			}
		}
		
		return {nextCell: nextCell, step: step};
	}
	
	//Add the connection graph columns together to get direct encounters
	HW3Library.prototype.serialDirectConnects = function(betweenVector, connectionGraph, offset) {
		var y,
			x,
			row;
		
		for(x = 0; x < HW3_LIBRARY.cellCount; x++) {
			for(y = 0; y < HW3_LIBRARY.cellCount; y++) {
				row = y * HW3_LIBRARY.cellCount;
				
				if(x !== y) {
					betweenVector[offset + y] += connectionGraph[row + x];
					betweenVector[offset + x] += connectionGraph[row + x];
				}
				else{
					betweenVector[offset + x]++;
				}
			}
		}
		
		return;
	}
	
	//Attempt to get the encounters along shortest paths found towards a goal cell via breadth-first search
	//Tries to simulate avoiding dynamic memory (all allocations done at beginning only) */
	HW3Library.prototype.getEncountersOfShortestPaths = function(directedGraph, startCell, goalCell, encounters, offset) {
		var history = [],
			currentStep = 0,
			toVisit = [],
			currentCell,
			i,
			temp,
			shortestPathLength = HW3_LIBRARY.cellCount;
		
		/* initialize bookkeeping */
		for(i = 0; i < this.cellCount; i++) {
			//encounters[offset + i] = 0;
			history.push(-1);
			toVisit.push({fromCell: -1, step: -1});
		}
		
		/* If the start is the goal just return 1 encounter */
		if(startCell === goalCell) {
			encounters[offset + startCell]++;
			
			return;
		}
		
		/* visit starting cell */
		currentCell = startCell;
		/* mark currentCell as visited */
		toVisit[currentCell].step = 0;
		
		/* record history */
		history[currentStep] = currentCell;
		
		/* queue 'adjacent' cells */
		queueNextCells(toVisit, currentCell, currentStep, directedGraph);
		
		while(hasQueue(toVisit)) {
			/* fetch next queued cell */
			temp = fetchNextCell(toVisit, currentCell);
			
			if(temp.nextCell > -1) {
				// visit next cell
				currentCell = temp.nextCell;
				// mark currentCell as visited
				toVisit[currentCell].step = 0;
				// update step
				currentStep = temp.step;
				// record history
				history[currentStep] = currentCell;
				
				/* if the goal is reached, record encounters and halt expansion */
				if(currentCell === goalCell) {
					for(i = 0; i < history.length; i++) {
						if(history[i] >= 0) {
							encounters[offset + history[i]]++;
						}
						else {
							break;
						}
					}
					
					// stop expanding and only accept paths the same length as this path
					shortestPathLength = currentStep;
					//drop anything queued with longer path (higher step)
					for(i = 0; i < toVisit.length; i++) {
						if(toVisit[i].step > shortestPathLength) {
							toVisit[i].step = 0;
						}
					}
					
				}
			}
			/* we've reached a dead end! */
			else {
				//undo last step
				history[currentStep] = -1;
				currentStep--;
				currentCell = history[currentStep];
			}
			
			if(currentStep < shortestPathLength) {
				/* queue 'adjacent' cells */
				queueNextCells(toVisit, currentCell, currentStep, directedGraph);
			}
		}
		
		return;
	}
	
	HW3Library.prototype.randomizeAllGraphs = function() {
		var i;
		
		for(i = 0; i < this.profileCalls; i++) {
			this.directedGraph[i] = this.generateRandomMatrix();
		}
		
		return;
	}
	
	HW3Library.prototype.stringifyMatrix = function(matrix) {
		var outputString = "<code>",
			totalCells = matrix.length,
			i;
		
		for(i = 0; i < totalCells; i++) {
			outputString += matrix[i];
			
			if((i % this.cellCount) === (this.cellCount - 1)) {
				outputString += "<br>";
			}
		}
		
		outputString += "</code>";
		
		return outputString;
	}
	
	HW3Library.prototype.generateRandomMatrix = function() {
		var matrix = [this.cellCount * this.cellCount],
			x,
			y;
		
		for(y = 0; y < this.cellCount; y++) {
			for(x = 0; x < this.cellCount; x++) {
				if(x === y) {
					matrix[(y * this.cellCount) + x] = 1;
				}
				else {
					matrix[(y * this.cellCount) + x] = Math.floor(Math.random() * 2);
				}
			}
		}
		
		return matrix;
	}
	
	HW3Library.prototype.toggleHW3About = function() {
		var aboutHW3 = document.getElementById("about-hw3");
		
		aboutHW3.hidden = !aboutHW3.hidden;
		
		return;
	}
	
	HW3Library.prototype.toggleVerboseMode = function() {
		this.verboseMode = document.getElementById("verbose-flag").checked;
		
		return;
	}
	
	HW3Library.prototype.timeFunction = function(toCall) {
		var startTime,
			endTime;
		
		startTime = new Date().getTime();
		toCall();
		endTime = new Date().getTime();
		
		return endTime - startTime;
	}
	
	HW3Library.prototype.profileFunction = function(toCall, calls) {
		var times = [],
			totalTime = 0,
			averageTime = 0,
			i;
		
		for(i = 0; i < calls; i++) {
			times.push(this.timeFunction(toCall));
			totalTime += times[i];
		}
		
		averageTime = totalTime / calls;
		
		times.push(averageTime);
		times.push(totalTime);
		
		return times;
	}
	
	HW3Library.prototype.printTimeStatistics = function(times, output) {
		var outputString = "",
			i;
		
		for(i = 0; i < (times.length - 2); i++) {
			outputString += "Time[" + i + "]: " + times[i] + "ms<br>";
		}
		outputString += "Average: " + times[i] + "ms<br>";
		outputString += "Total &nbsp;&nbsp;: " + times[i + 1] + "ms<br>";
		
		output.innerHTML = outputString;
		
		return;
	}
	
	HW3Library.prototype.printToOutput = function(outputString) {
		var output = document.getElementById("output");
		
		output.innerHTML += outputString;
		
		return;
	}
	
	HW3Library.prototype.clearOutput = function() {
		var output = document.getElementById("output");
		
		output.innerHTML = "";
		
		return;
	}
	
	// GPGPU functionality
	if(turbojs) {
		
	}
	
	return new HW3Library();
})();
