/* Graduate Project Library */

"use strict";

var HW3_LIBRARY =
(function() {
	function HW3Library() {
		this.profileCalls = 5;
		this.cellCount = 100;
		this.graphSize = this.cellCount * this.cellCount;
		this.directedGraph = [];
		
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
	
	function queueNextCells(toVisit, currentCell, step, directedGraph) {
		var i,
			nextIndex;
		
		/* mark currentCell as visited */
		toVisit[currentCell].step = -2;
		
		for(i = 0; i < HW3_LIBRARY.cellCount; i++) {
			nextIndex = (i * HW3_LIBRARY.cellCount) + currentCell;
			if((directedGraph[nextIndex] === 1) && (toVisit[i].step === -1)) {
				/* store 'adjacent' cell */
				toVisit[i].fromCell = currentCell;
				toVisit[i].step = step;
			}
		}
		
		return;
	}
	
	function fetchNextCell(toVisit) {
		var i,
			fromCell = -1,
			nextCell = -1,
			step = HW3_LIBRARY.cellCount;
		
		for(i = 0; i < toVisit.length; i++) {
			if((toVisit[i].step > 0) && (toVisit[i].step < step)) {
				nextCell = i;
				fromCell = toVisit[i].fromCell;
				step = toVisit[i].step;
			}
		}
		
		if(nextCell > -1) {
			/* dequeue cell and mark as visited */
			toVisit[nextCell].step = -2;
		}
		
		return {fromCell: fromCell, nextCell: nextCell, step: step};
	}
	
	//Attempt to get the encounters along shortest paths found towards a goal cell via breadth-first search
	//Tries to simulate avoiding dynamic memory (all allocations done at beginning only) */
	HW3Library.prototype.getEncountersOfShortestPaths = function(directedGraph, startCell, goalCell) {
		var encounters = [],
			history = [],
			step = 0,
			toVisit = [],
			currentCell,
			i,
			nextIndex,
			temp = {fromCell: -1, nextCell: -1, step: -1},
			expand = true;
		
		/* initialize bookkeeping */
		for(i = 0; i < this.cellCount; i++) {
			encounters.push(0);
			history.push(-1);
			toVisit.push({fromCell: -1, step: -1});
		}
		
		/* If the start is the goal just return 1 encounter */
		if(startCell === goalCell) {
			encounters[startCell] = 1;
			
			return encounters;
		}
		
		/* visit starting cell */
		currentCell = startCell;
		
		/* record history */
		history[step] = startCell;
		
		/* queue 'adjacent' cells */
		queueNextCells(toVisit, currentCell, step + 1, directedGraph);
		
		while(hasQueue(toVisit)) {
			/* fetch next queued cell */
			temp = fetchNextCell(toVisit);
			
			/* visit next cell */
			currentCell = temp.nextCell;
			step = temp.step;
			history[step - 1] = temp.fromCell;
			
			/* record history */
			history[step] = currentCell;
			
			/* if the goal is reached, record encounters and halt expansion */
			if(currentCell === goalCell) {
				for(i = 0; i < history.length; i++) {
					if(history[i] >= 0) {
						encounters[history[i]]++;
					}
					else {
						break;
					}
				}
				
				/* stop expanding and only accept paths the same length as this path */
				expand = false;
			}
			
			if(expand) {
				/* queue 'adjacent' cells */
				queueNextCells(toVisit, currentCell, step + 1, directedGraph);
			}
		}
		
		return encounters;
	}
	
	HW3Library.prototype.getEncountersOfShortestPaths2 = function(directedGraph, startCell, goalCell, encounters, offset) {
		var history = [],
			step = 0,
			toVisit = [],
			currentCell,
			i,
			nextIndex,
			temp = {fromCell: -1, nextCell: -1, step: -1},
			expand = true;
		
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
		
		/* record history */
		history[step] = startCell;
		
		/* queue 'adjacent' cells */
		queueNextCells(toVisit, currentCell, step + 1, directedGraph);
		
		while(hasQueue(toVisit)) {
			/* fetch next queued cell */
			temp = fetchNextCell(toVisit);
			
			/* visit next cell */
			currentCell = temp.nextCell;
			step = temp.step;
			history[step - 1] = temp.fromCell;
			
			/* record history */
			history[step] = currentCell;
			
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
				
				/* stop expanding and only accept paths the same length as this path */
				expand = false;
			}
			
			if(expand) {
				/* queue 'adjacent' cells */
				queueNextCells(toVisit, currentCell, step + 1, directedGraph);
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
