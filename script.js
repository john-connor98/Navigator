var totalRows = 23;
var totalCols = 45;
var inProgress = false;
var cellsToAnimate = [];
var createWalls = false;
var algorithm = null;
var justFinished = false;
var animationSpeed = "Fast"; // by default
var animationState = null;
var startCell = [8, 15]; // by default
var endCell = [18, 25]; // by default

var movingStart = false;
var movingEnd = false;

function generateGrid(rows, cols) {
  var grid = "<table>"; //opening table tag
  for (row = 1; row <= rows; row++) {
    grid += "<tr>";
    for (col = 1; col <= cols; col++) {
      grid += "<td></td>";
    }
    grid += "</tr>";
  }
  grid += "</table>"; //closing table tag
  return grid;
}

var myGrid = generateGrid(totalRows, totalCols);

$("#tableContainer").append(myGrid);

/* ---- BUTTONS ---- */
button = document.getElementById('startBtn');
button.addEventListener('click', e => {
    if (algorithm == null) {
    return;
  }
  if (inProgress) {
    update("wait");
    return;
  }
  traverseGraph(algorithm);  
});

/* --- NAV BAR MENUS --- */
$("#algorithms .dropdown-item").click(function () {
  if (inProgress) {
    update("wait");
    return;
  }
  algorithm = $(this).text();
  updateStartBtnText();
  console.log("Algorithm has been changd to: " + algorithm);
});

$("#speed .dropdown-item").click(function () {
  if (inProgress) {
    update("wait");
    return;
  }
  animationSpeed = $(this).text();
  updateSpeedDisplay();
  console.log("Speed has been changd to: " + animationSpeed);
});

const update = (message) => {
  $("#resultsIcon").removeClass();
  $("#resultsIcon").addClass("fas fa-exclamation");
  $("#results").css("background-color", "#ffc107");
  $("#length").text("");
  if (message == "wait") {
    $("#duration").text("Please wait for the algorithm to finish.");
  }
}

const updateStartBtnText = () => {
  if (algorithm == "Depth-First-Search") {
    $("#startBtn").html("Visualize DFS");
  }else if (algorithm == "Breadth-First-Search") {
    $("#startBtn").html("Visualize BFS");
  }
  return;
}

const updateSpeedDisplay = () => {
  if (animationSpeed == "Slow") {
    $(".speedDisplay").text("Speed: Slow");
  } else if (animationSpeed == "Medium") {
    $(".speedDisplay").text("Speed: Medium");
  } else if (animationSpeed == "Fast") {
    $(".speedDisplay").text("Speed: Fast");
  }
  return;
}

/* --- REAL ALGO --- */
const traverseGraph = async (algorithm) => {
  inProgress = true;
  clearBoard(true); 

  var startTime = Date.now();
  var pathFound = executeAlgo(); 
  var endTime = Date.now();
  await animateCells(); 
  if (pathFound) {
    updateResults(endTime - startTime, true, countLength()); 
  } else {
    updateResults(endTime - startTime, false, countLength());
  }
  inProgress = false;
  justFinished = true;
}

const clearBoard = (keepWalls) => {
  var cells = $("#tableContainer").find("td");
  var startCellIndex = startCell[0] * totalCols + startCell[1];
  var endCellIndex = endCell[0] * totalCols + endCell[1];

  for (var i = 0; i < cells.length; i++) {
    isWall = $(cells[i]).hasClass("wall");
    $(cells[i]).removeClass();
    if (i == startCellIndex) {
      $(cells[i]).addClass("start");
    } else if (i == endCellIndex) {
      $(cells[i]).addClass("end");
    } else if (keepWalls && isWall) {
      $(cells[i]).addClass("wall");
    }
  }
}

const executeAlgo = () => {
  if (algorithm == "Depth-First-Search") {
    var visited = createVisited(); 
    var pathFound = DFS(startCell[0], startCell[1], visited); 
  }else if (algorithm == "Breadth-First-Search") {
    var pathFound = BFS();
  }
    
  return pathFound;
}

const countLength = () => {
  var cells = $("td");
  var l = 0;
  for (var i = 0; i < cells.length; i++) {
    if ($(cells[i]).hasClass("success")) {
      l++;
    }
  }
  return l;
}

const createVisited = () => {
  var visited = [];
  var cells = $("#tableContainer").find("td");
  for (var i = 0; i < totalRows; i++) {
    var row = [];
    for (var j = 0; j < totalCols; j++) {
      if (cellIsAWall(i, j, cells)) {
        row.push(true);
      } else {
        row.push(false);
      }
    }
    visited.push(row);
  }
  return visited;
}

const cellIsAWall = (i, j, cells) => {
  var cellNum = i * totalCols + j;
  return $(cells[cellNum]).hasClass("wall");
}

const DFS = (i, j, visited) => {
  if (i == endCell[0] && j == endCell[1]) {
    cellsToAnimate.push([[i, j], "success"]);
    return true;
  }
  visited[i][j] = true;
  cellsToAnimate.push([[i, j], "searching"]);
  var neighbors = getNeighbors(i, j);
    
  for (var k = 0; k < neighbors.length; k++) {
    var m = neighbors[k][0];
    var n = neighbors[k][1];
    if (!visited[m][n]) {
      var pathFound = DFS(m, n, visited);
      if (pathFound) {
        cellsToAnimate.push([[i, j], "success"]);
        return true;
      }
    }
  }
  cellsToAnimate.push([[i, j], "visited"]);
  return false;
}

const getNeighbors = (i, j) => {
  var neighbors = [];
  if (i > 0) {
    neighbors.push([i - 1, j]);
  }
  if (j > 0) {
    neighbors.push([i, j - 1]);
  }
  if (i < totalRows - 1) {
    neighbors.push([i + 1, j]);
  }
  if (j < totalCols - 1) {
    neighbors.push([i, j + 1]);
  }
  return neighbors;
}

function Queue() { 
 this.stack = new Array();
 this.dequeue = function(){
  	return this.stack.pop(); 
 } 
 this.enqueue = function(item){
  	this.stack.unshift(item);
  	return;
 }
 this.empty = function(){
 	return ( this.stack.length == 0 );
 }
 this.clear = function(){
 	this.stack = new Array();
 	return;
 }
}

function BFS(){
	var pathFound = false;
	var myQueue = new Queue();
	var prev = createPrev();
	var visited = createVisited();
	myQueue.enqueue( startCell );
	cellsToAnimate.push(startCell, "searching");
	visited[ startCell[0] ][ startCell[1] ] = true;
	while ( !myQueue.empty() ){
		var cell = myQueue.dequeue();
		var r = cell[0];
		var c = cell[1];
		cellsToAnimate.push( [cell, "visited"] );
		if (r == endCell[0] && c == endCell[1]){
			pathFound = true;
			break;
		}
		// Put neighboring cells in queue
		var neighbors = getNeighbors(r, c);
		for (var k = 0; k < neighbors.length; k++){
			var m = neighbors[k][0];
			var n = neighbors[k][1];
			if ( visited[m][n] ) { continue ;}
			visited[m][n] = true;
			prev[m][n] = [r, c];
			cellsToAnimate.push( [neighbors[k], "searching"] );
			myQueue.enqueue(neighbors[k]);
		}
	}
	// Make any nodes still in the queue "visited"
	while ( !myQueue.empty() ){
		var cell = myQueue.dequeue();
		var r = cell[0];
		var c = cell[1];
		cellsToAnimate.push( [cell, "visited"] );
	}
	// If a path was found, illuminate it
	if (pathFound) {
		var r = endCell[0];
		var c = endCell[1];
		cellsToAnimate.push( [[r, c], "success"] );
		while (prev[r][c] != null){
			var prevCell = prev[r][c];
			r = prevCell[0];
			c = prevCell[1];
			cellsToAnimate.push( [[r, c], "success"] );
		}
	}
	return pathFound;
}

const createPrev = () => {
	var prev = [];
	for (var i = 0; i < totalRows; i++){
		var row = [];
		for (var j = 0; j < totalCols; j++){
			row.push(null);
		}
		prev.push(row);
	}
	return prev;
}

const animateCells = async () => {
  animationState = null;
  var cells = $("#tableContainer").find("td");
  var startCellIndex = startCell[0] * totalCols + startCell[1];
  var endCellIndex = endCell[0] * totalCols + endCell[1];

  var delay = getDelay();
  for (var i = 0; i < cellsToAnimate.length; i++) {
    var cellCoordinates = cellsToAnimate[i][0];
    var x = cellCoordinates[0];
    var y = cellCoordinates[1];
    var num = x * totalCols + y;
    if (num == startCellIndex || num == endCellIndex) {
      continue;
    }
    var cell = cells[num];
    var colorClass = cellsToAnimate[i][1];

    // color the cell and provide delay
    await new Promise((resolve) => setTimeout(resolve, delay));

    $(cell).removeClass();
    $(cell).addClass(colorClass);
  }
  cellsToAnimate = [];
  return new Promise((resolve) => resolve(true));
}

const getDelay = () => {
  var delay;
  if (animationSpeed === "Slow") {
    if (algorithm == "Depth-First-Search") {
      delay = 25;
    } else {
      delay = 20;
    }
  } else if (animationSpeed === "Medium") {
    if (algorithm == "Depth-First-Search") {
      delay = 15;
    } else {
      delay = 10;
    }
  } else if (animationSpeed == "Fast") {
    if (algorithm == "Depth-First-Search") {
      delay = 8;
    } else {
      delay = 5;
    }
  }
  console.log("Delay = " + delay);
  return delay;
}

function updateResults(duration, pathFound, length) {
  var firstAnimation = "boingOutDown";
  var secondAnimation = "boingInUp";

  $("#results").removeClass();
  $("#results").addClass("magictime " + firstAnimation);
  setTimeout(function () {
    //aage funtion likho baad mei timeout value
    $("#resultsIcon").removeClass();
    //$("#results").css("height","80px");
    if (pathFound) {
      $("#results").css("background-color", "#77dd77");
      $("#resultsIcon").addClass("fas fa-check");
    } else {
      $("#results").css("background-color", "#ff6961");
      $("#resultsIcon").addClass("fas fa-times");
    }
    $("#duration").text("Duration: " + duration + " ms");
    $("#length").text("Length: " + length);
    $("#results").removeClass(firstAnimation);
    $("#results").addClass(secondAnimation);
  }, 1100);
}

/*--- MOUSE FUNCTIONS ---*/
// pressed
$("td").mousedown(function () {
  var index = $("td").index(this);
  var startCellIndex = startCell[0] * totalCols + startCell[1];
  var endCellIndex = endCell[0] * totalCols + endCell[1];
  if (!inProgress) {
    // Clear board if just finished
    if (justFinished && !inProgress) {
      clearBoard(true);
      justFinished = false;
    }
    if (index == startCellIndex) {
      movingStart = true;
    } else if (index == endCellIndex) {
      movingEnd = true;
    } else {
      createWalls = true;
    }
  }
});

// freed mouse
$("td").mouseup(function () {
  createWalls = false;
  movingStart = false;
  movingEnd = false;
});

$("td").mouseenter(function () {
  if (!createWalls && !movingStart && !movingEnd) {
    return;
  } 

  var index = $("td").index(this);
  var startCellIndex = startCell[0] * totalCols + startCell[1];
  var endCellIndex = endCell[0] * totalCols + endCell[1];

  if (!inProgress) {
    if (justFinished) {
      clearBoard(true);
      justFinished = false;
    }

    if (movingStart && index != endCellIndex) {
      moveStartOrEnd(startCellIndex, index, "start");
    } else if (movingEnd && index != startCellIndex) {
      moveStartOrEnd(endCellIndex, index, "end");
    } else if (index != startCellIndex && index != endCellIndex) {
      $(this).toggleClass("wall");
    }
  }
});

function moveStartOrEnd(prevIndex, newIndex, startOrEnd) {
  var newCellY = newIndex % totalCols;
  var newCellX = Math.floor((newIndex - newCellY) / totalCols);
  if (startOrEnd == "start") {
    startCell = [newCellX, newCellY];
    console.log("Moving start to [" + newCellX + ", " + newCellY + "]");
  } else {
    endCell = [newCellX, newCellY];
    console.log("Moving end to [" + newCellX + ", " + newCellY + "]");
  }
  clearBoard(true);
  return;
}

$("td").click(function () {
  var index = $("td").index(this);
  var startCellIndex = startCell[0] * totalCols + startCell[1];
  var endCellIndex = endCell[0] * totalCols + endCell[1];
  if (
    inProgress == false &&
    !(index == startCellIndex) &&
    !(index == endCellIndex)
  ) {
    if (justFinished) {
      clearBoard(true);
      justFinished = false;
    }
    $(this).toggleClass("wall");
  }
});

$("body").mouseup(function () {
  createWalls = false;
  movingStart = false;
  movingEnd = false;
});

$("#clearBtn").click(function () {
  if (inProgress) {
    update("wait");
    return;
  }
  clearBoard(false);
});

clearBoard();

//$("#startBtn").click(function () {
//  if (algorithm == null) {
//    return;
//  }
//  if (inProgress) {
//    update("wait");
//    return;
//  }
//  traverseGraph(algorithm);   
//});