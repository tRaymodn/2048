function GameManager(size, InputManager, Actuator, StorageManager, designer) {
  this.size           = size; // Size of the grid
  this.inputManager   = new InputManager;
  this.storageManager = new StorageManager;
  this.actuator       = new Actuator;
  this.gridCreated    = false;
  this.designer       = designer;
  this.colorMappings  = [];
  this.colorsActive         = false;
  this.imageMoveTimeout = undefined;

  this.startTiles     = designer === true ? 0 : 2;

  this.inputManager.on("move", this.move.bind(this));
  this.inputManager.on("restart", this.restart.bind(this));
  this.inputManager.on("keepPlaying", this.keepPlaying.bind(this));

  
  this.setup();
  this.setBoardSize();
}



GameManager.prototype.download = function (filename, text) {
  var pom = document.createElement('a');
  pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  pom.setAttribute('download', filename);

  if (document.createEvent) {
      var event = document.createEvent('MouseEvents');
      event.initEvent('click', true, true);
      pom.dispatchEvent(event);
  }
  else {
      pom.click();
  }
}


GameManager.prototype.appendState = function(state, move){
  let newState = []
  for(let i = 0; i<Math.pow(this.size, 2); i++){
    if(state[i] === null){
      newState.push(0);
    }
    else{
      newState.push(state[i].value);
    }
  }
  this.states.push(newState)
  let moveEntry;
  switch(move){
    case 0:
      moveEntry = [1, 0, 0, 0]
      break;
    case 1:
      moveEntry = [0, 1, 0, 0]
      break;
    case 2:
      moveEntry = [0, 0, 1, 0]
      break;
    case 3:
      moveEntry = [0, 0, 0, 1]
      break;
    default:
      moveEntry = [0, 0, 0, 0]
      break;
  }
  this.moves.push(moveEntry);
}

GameManager.prototype.statesToString = function(){
  let totalString = "[ "
  for(let i = 0; i < this.states.length; i++){
    let thisState = "[ ";
    for(let j = 0; j < Math.pow(this.size, 2); j++){
      if(j === Math.pow(this.size, 2) - 1){
        thisState = thisState + this.states[i][j];
      }
      else{
        thisState = thisState + `${this.states[i][j]}, `;
      }
    }
    if(i === this.states.length - 1){
      totalString+= thisState + "] ";
    }
    else{
      totalString += thisState + "], "
    }
  }
  totalString += "]"
  return totalString;
}

GameManager.prototype.movesToString = function(){
  let totalString = "[ "
  for(let i = 0; i < this.moves.length; i++){
    let thisMove = "[ ";
    for(let j = 0; j < 4; j++){
      if(j === 3){
        thisMove = thisMove + this.moves[i][j];
      }
      else{
        thisMove = thisMove + `${this.moves[i][j]}, `;
      }
    }
    if(i === this.moves.length - 1){
      totalString+= thisMove + "] ";
    }
    else{
      totalString += thisMove + "], "
    }
  }
  totalString += "]"
  return totalString;
}

// Restart the game
GameManager.prototype.restart = function () {
  this.storageManager.clearGameState();
  this.actuator.continueGame(); // Clear the game won/lost message
  this.setup();
};

GameManager.prototype.removeGridRows = function(className, nToRemove){
let all = document.querySelectorAll('.' + className);
//console.log(all);
for (let i = 0; i < nToRemove; i++){
  all[i].remove();;
}
}

GameManager.prototype.setBoardSize = function (){
const sizeInput = document.getElementById("sizeInput");
const plus = document.getElementById("plus");
const minus= document.getElementById("minus");



plus.addEventListener('click', () => {
  if (Number(sizeInput.innerHTML) < 15 ){
    this.removeGridRows('grid-row', parseInt(sizeInput.innerHTML));
    sizeInput.innerHTML = parseInt(sizeInput.innerHTML) + 1;
    document.getElementById("sizeInput2").innerHTML = sizeInput.innerHTML;
    this.size = parseInt(sizeInput.innerHTML);
    this.gridCreated = false;
    this.over = true;

    this.restart();
    this.actuate();
    if(this.designer && this.size < 9){
      let zeros = Array(Number(this.grid.size)).fill(0);
      // Fill in configurations and configDecomps in tileRows
      this.tileRows.evaluateState(zeros, []);
    }
    else if(this.size >= 9){
      document.getElementById("designerDiv").style.display = "none";
      document.getElementById("lifeButtons").style.display = "none";
    }
  }
});

minus.addEventListener('click', () => {
  if (parseInt(sizeInput.innerHTML) > 2 ){
    this.removeGridRows('grid-row', parseInt(sizeInput.innerHTML));
    sizeInput.innerHTML = parseInt(sizeInput.innerHTML) - 1;
    document.getElementById("sizeInput2").innerHTML = sizeInput.innerHTML;
    this.size = parseInt(sizeInput.innerHTML);
    this.gridCreated = false;
    this.over = true;
    
    this.restart();
    this.actuate(); // do we need this? I think restart calls setup which calls acctuate anyways TODO
    if(this.designer){
      if(this.size <= 8){
        document.getElementById("designerDiv").style.display = "flex";
        document.getElementById("lifeButtons").style.display = "flex";
        let zeros = Array(Number(this.grid.size)).fill(0);
        // Fill in configurations and configDecomps in tileRows
        this.tileRows.evaluateState(zeros, []);
      }
    }
  }
});

}

GameManager.prototype.makeImage = function(colorMap, mapping, time){
  this.colorMappings = [];
  document.getElementById("mappingTag").innerHTML = "";
  let moveSets = this.tileRows.tileAssignments(colorMap);

  document.getElementById("loadingDiv").style.display = "none";
  document.getElementById("loader").style.display = "none";
  if(moveSets.length > 0){
    let index = 0;
    for(const prop in mapping){ // set tile class colors correctly
      let mappingNumbers = moveSets[0].mapping[index.toString()];
      if(typeof(mappingNumbers) === "object"){
        let map = [];
        mappingNumbers.forEach((number) => {
          map.push(number);
          if(this.colorsActive) this.actuator.changeTileClassColor(number, prop);
          this.colorMappings.push({tile: number, color: prop});
        })
        document.getElementById("mappingTag").innerHTML += `${prop}: ${JSON.stringify(map)}`;
      }
      else{
        if(this.colorsActive) this.actuator.changeTileClassColor(mappingNumbers, prop);
        document.getElementById("mappingTag").innerHTML += `${prop}: ${JSON.stringify(mappingNumbers)}`
        this.colorMappings.push({tile: number, color: prop});
      }
      if(index < mapping.length - 1){
        document.getElementById("mappingTag").innerHTML += `, `;
      }
      index = index + 1;
    }
    console.log(JSON.stringify(moveSets[0]))
    this.makeImageMove(moveSets[0].moves, time, true);
    return moveSets[0].moves;
  }
  else{
    let colorMapTranspose = colorMap[0].map((_, colIndex) => colorMap.map(row => row[colIndex]));
    let newColorMapTranspose = Array(colorMapTranspose.length);
    for(let i = 0; i < colorMapTranspose.length; i++){
      newColorMapTranspose[i] = colorMapTranspose[colorMapTranspose.length - 1 - i];
    }
    console.log("attempting with columns" + JSON.stringify(newColorMapTranspose))
    let colMoveSet = this.tileRows.tileAssignments(newColorMapTranspose);
    if(colMoveSet.length > 0){
      let index = 0;
      for(const prop in mapping){ // set tile class colors correctly
        let mappingNumbers = colMoveSet[0].mapping[index.toString()];
        if(typeof(mappingNumbers) === "object"){
          let map = [];
          mappingNumbers.forEach((number) => {
            map.push(number);
            if(this.colorsActive) this.actuator.changeTileClassColor(number, prop);
            this.colorMappings.push({tile: number, color: prop});
          })
          document.getElementById("mappingTag").innerHTML += `${prop}: ${JSON.stringify(map)}`;
        }
        else{
          if(this.colorsActive) this.actuator.changeTileClassColor(mappingNumbers, prop);
          document.getElementById("mappingTag").innerHTML += `${prop}: ${JSON.stringify(mappingNumbers)}`
          this.colorMappings.push({tile: number, color: prop});
        }
        if(index < mapping.length - 1){
          document.getElementById("mappingTag").innerHTML += `, `;
        }
        index = index + 1;
      }
      console.log(JSON.stringify(colMoveSet[0]))
      this.makeImageMove(colMoveSet[0].moves, time, false);
      return colMoveSet[0].moves
    }
    else{
      console.log("cannot be made at this time");
      document.getElementById("mappingTag").innerHTML = "Image cannot be made at this time";
      return false;
    }
  }
}

GameManager.prototype.makeImageMove = function(moves, time, isRow){
  // this setTimout waits time, and then seems to do all of the moves at once.
  this.designerMove(moves[0].move, moves[0].value, moves[0].position, isRow);
  console.log(this.grid)
if(moves.length > 1){
    let newMoves = [...moves];
    newMoves.shift();
    this.imageMoveTimeout = setTimeout(() => { 
      this.makeImageMove(newMoves, time, isRow);
    }, time);
  }
}

GameManager.prototype.stopImage = function(){
  clearTimeout(this.imageMoveTimeout);
}

// if grid is empty, insert a value at the given position, else, just set the insert and value to be correct and make the move
GameManager.prototype.designerMove = function(move, value, placement, isRow){
  let flag = false;
  for(const row of this.grid.cells){
    for(const val of row){
      if(val !== null){
        flag = true;
      }
    }
  }
  if(!isRow){
    switch(placement){
      case "bRR":
        placement = "bL";
        break;
      case "bLR":
        placement = "tL";
        break;
      case "tRR":
        placement = "bR";
        break;
      case "tLR":
        placement = "tR";
    }

    move = move + 1;
    if(move > 3){
      move = 0
    }
  }
  if(!flag){
    console.log("Inserting first tile")
    this.placeTileSpecific(value, placement)
  }
  else{
    this.tileInsert = placement;
    this.tileValue = value;
    this.move(move);
  }
}

// Keep playing after winning (allows going over 2048)
GameManager.prototype.keepPlaying = function () {
  this.keepPlaying = true;
  this.actuator.continueGame(); // Clear the game won/lost message
};

// Return true if the game is lost, or has won and the user hasn't kept playing
GameManager.prototype.isGameTerminated = function () {
  return this.over || (this.won && !this.keepPlaying);
};

// Set up the game
GameManager.prototype.setup = function () {
  var previousState = this.storageManager.getGameState();
  
  /*
  // Reload the game from a previous game if present
  if (previousState) {
    this.grid        = new Grid(previousState.grid.size,
                                previousState.grid.cells); // Reload grid
    this.score       = previousState.score;
    this.over        = previousState.over;
    this.won         = previousState.won;
    this.keepPlaying = previousState.keepPlaying;
    this.states = [];
    this.moves = [];
    this.tileRows = new TileRows();
    this.tileRows = new TileRows();
  } else {
    */
    this.grid        = new Grid(this.size);
    this.score       = 0;
    this.over        = false;
    this.won         = false;
    this.keepPlaying = false;
    this.states = [];
    this.moves = [];
    this.tileInsert = "random"
    this.tileValue = 0;
    this.tileRows = new TileRows();

  // Add the initial tiles
  if(!this.designer){
    this.addStartTiles(); 
  }
  else if(this.size < 9){ // limits the size of designer to 8 for now
    let zeros = Array(Number(this.grid.size)).fill(0);
    // Fill in configurations and configDecomps in tileRows
    this.tileRows.evaluateState(zeros, []);
  }

  //Set the position classes
  this.actuator.setPositionClasses(this.grid);

  document.getElementById("mappingTag").innerHTML = "";

  // Update the actuator
  this.actuate();
};

// Set up the initial tiles to start the game with
GameManager.prototype.addStartTiles = function () {
  for (var i = 0; i < this.startTiles; i++) {
    this.addRandomTile();
  }
};

// Adds a tile in a random position
GameManager.prototype.addRandomTile = function () {
  if (this.grid.cellsAvailable()) {
    var value = Math.random() < 0.9 ? 2 : 4;
    var tile = new Tile(this.grid.randomAvailableCell(), value);

    this.grid.insertTile(tile);
  }
};

GameManager.prototype.addRandomTileValue = function (val) {
  if (this.grid.cellsAvailable()) {
    var value;
    if(val == 0){
      value = Math.random() < 0.9 ? 2 : 4;
    }
    else{
      value = Number(val);
    }
    var tile = new Tile(this.grid.randomAvailableCell(), value);

    this.grid.insertTile(tile);
  }
};

GameManager.prototype.addRandomTileGrid = function(grid){
  if (grid.cellsAvailable()) {
    var value = Math.random() < 0.9 ? 2 : 4;
    var tile = new Tile(grid.randomAvailableCell(), value);

    grid.insertTile(tile);
  }
}

// Adds a tile in a random position
GameManager.prototype.addTile = function (x, y) {
  if (this.grid.cellsAvailable()) {
    var value = Math.random() < 0.9 ? 2 : 4;
    var tile = new Tile(this.grid.randomAvailableCell(), value);

    this.grid.insertTile(tile);
  }
};

GameManager.prototype.getBoardState = function(){
  let list = [];
  for(let i = 0; i <  this.size; i++){
    for(let j = 0; j < this.size; j++){
      let cell = this.grid.cellContent({x: i, y: j});
      list.push(cell);
    }
  }
  return list;
}


// Sends the updated grid to the actuator
GameManager.prototype.actuate = function () {
  if (this.storageManager.getBestScore() < this.score) {
    this.storageManager.setBestScore(this.score);
  }

  // Clear the state when the game is over (game over only, not win)
  if (this.over) {
    this.storageManager.clearGameState();
  } else {
    this.storageManager.setGameState(this.serialize());
  }
  if(!this.gridCreated){
    this.createGridHTML();
    this.gridCreated = true;
  }
  
  this.actuator.actuate(this.grid, {
    score:      this.score,
    over:       this.over,
    won:        this.won,
    bestScore:  this.storageManager.getBestScore(),
    terminated: this.isGameTerminated(),
    states : this.states,
    moves: this.moves
  });

};

GameManager.prototype.createGridHTML = function(){
  let gridContainer = document.getElementsByClassName('grid-container')[0];
  let gameContainer = document.getElementsByClassName('game-container')[0];
  // I want to take in the size of the board and then create and append divs to the "grid-container" class div
  for(let i = 0; i < this.size; i++){
    let row = document.createElement('div');
    row.setAttribute('class', 'grid-row');
    for(let j = 0; j < this.size; j++){
      let cell = document.createElement('div');
      cell.setAttribute('class', 'grid-cell');
      if(this.size > 6 ){
        
        cell.setAttribute('style', `width: ${(gameContainer.offsetWidth - (this.size * 16 )) / this.size}px; height: ${(gameContainer.offsetHeight - (this.size * 16 ))/this.size}px;`);
      }
      else cell.setAttribute('style', `width: 106px; height: 106px;`);
      row.appendChild(cell);
    }

    gridContainer.appendChild(row);
    
    
  }
  if(this.size  <= 6){
  gameContainer.setAttribute('style', `width: ${(121 * this.size) + 15}px; height:${(121 * this.size) + 15}px;`);
  }
}

// Represent the current game as an object
GameManager.prototype.serialize = function () {
  return {
    grid:        this.grid.serialize(),
    score:       this.score,
    over:        this.over,
    won:         this.won,
    keepPlaying: this.keepPlaying
  };
};

// Save all tile positions and remove merger info
GameManager.prototype.prepareTiles = function () {
  this.grid.eachCell(function (x, y, tile) {
    if (tile) {
      tile.mergedFrom = null;
      //tile.savePosition(); CHANGES
      tile.previousPosition = {x: x, y: y};
    }
  });
};

// Move a tile and its representation
GameManager.prototype.moveTile = function (tile, cell) {
  this.grid.cells[tile.x][tile.y] = null;
  this.grid.cells[cell.x][cell.y] = tile;
  //tile.updatePosition(cell);
  tile.x = cell.x;
  tile.y = cell.y;
};

GameManager.prototype.moveTileGrid = function(tile, cell, grid){
  grid.cells[tile.x][tile.y] = null;
  grid.cells[cell.x][cell.y] = tile;
  tile.x = cell.x;
  tile.y = cell.y;
  //tile.updatePosition(cell);
}

// Move tiles on the grid in the specified direction
GameManager.prototype.move = function (direction) {
  // 0: up, 1: right, 2: down, 3: left
  var self = this;

  
  if (this.isGameTerminated()){
    if(this.movesAvailable()){
      this.actuator.continueGame();
    }
    else return 
  }
   
  

  var cell, tile;

  var vector     = this.getVector(direction);
  var traversals = this.buildTraversals(vector);
  var moved      = false;

  // Save the current tile positions and remove merger information
  this.prepareTiles();
  let state = this.getBoardState();
  let move = direction;
  //console.log(move)

  // Traverse the grid in the right direction and move tiles
  traversals.x.forEach(function (x) {
    traversals.y.forEach(function (y) {
      cell = { x: x, y: y };
      tile = self.grid.cellContent(cell);

      if (tile) {
        var positions = self.findFarthestPosition(cell, vector);
        var next      = self.grid.cellContent(positions.next);

        // Only one merger per row traversal?
        if (next && next.value === tile.value && !next.mergedFrom) {
          var merged = new Tile(positions.next, tile.value * 2);
          merged.mergedFrom = [tile, next];

          self.grid.insertTile(merged);
          self.grid.removeTile(tile);

          // Converge the two tiles' positions
          tile.updatePosition(positions.next);

          // Update the score
          self.score += merged.value;

          // The mighty 2048 tile
          if (merged.value === 2048) self.won = true;
        } else {
          self.moveTile(tile, positions.farthest);
        }

        if (!self.positionsEqual(cell, tile)) {
          moved = true; // The tile moved from its original cell!
        }
      }
    });
  });

  if (moved) {
    this.appendState(state, move);
    switch(this.tileInsert){
      case 'random': 
        this.addRandomTileValue(this.tileValue);
        break;
      case 'tL':
        this.topLeftInsertTile(this.tileValue);
        break;
      case 'bL': 
        this.bottomLeftInsertTile(this.tileValue);
        break;
      case 'tR':
        this.topRightInsertTile(this.tileValue);
        break;
      case 'bR':
        this.bottomRightInsertTile(this.tileValue);
        break;
      case 'tLR':
        this.topLeftInsertTileRow(this.tileValue);
        break;
      case 'bLR':
        this.bottomLeftInsertTileRow(this.tileValue);
        break;
      case 'tRR':
        this.topRightInsertTileRow(this.tileValue);
        break;
      case 'bRR':
        this.bottomRightInsertTileRow(this.tileValue);
        break;
      default:
        this.addRandomTile(this.tileValue);
    }
    if (!this.movesAvailable() && !this.designer) { // stops the "Game Over" from displaying when in designer mode and there are no more moves
      //this.download("moves.txt", this.movesToString())
      //this.download("states.txt", this.statesToString())
      this.over = true; // Game over!
    }

    this.actuate();
  }
};

GameManager.prototype.placeTileSpecific = function(tileValue, tileInsert){
  switch(tileInsert){
    case 'random': 
      this.addRandomTileValue(tileValue);
      break;
    case 'tL':
      this.topLeftInsertTile(tileValue);
      this.actuator.addTile({x: 0, y: 0, value: tileValue}, this.size);
      break;
    case 'bL': 
      this.bottomLeftInsertTile(tileValue);
      this.actuator.addTile({x: this.size-1, y: 0, value: tileValue}, this.size);
      break;
    case 'tR':
      this.topRightInsertTile(tileValue);
      this.actuator.addTile({x: 0, y: this.size-1, value: tileValue}, this.size);
      break;
    case 'bR':
      this.bottomRightInsertTile(tileValue);
      this.actuator.addTile({x: this.size-1, y: this.size-1, value: tileValue}, this.size);
      break;
    case 'tLR':
      this.topLeftInsertTileRow(tileValue);
      this.actuator.addTile({x: 0, y: 0, value: tileValue}, this.size);
      break;
    case 'bLR':
      this.bottomLeftInsertTileRow(tileValue);
      this.actuator.addTile({x: this.size-1, y: 0, value: tileValue}, this.size);
      break;
    case 'tRR':
      this.topRightInsertTileRow(tileValue);
      this.actuator.addTile({x: 0, y: this.size-1, value: tileValue}, this.size);
      break;
    case 'bRR':
      this.bottomRightInsertTileRow(tileValue);
      this.actuator.addTile({x: this.size-1, y: this.size-1, value: tileValue}, this.size);
      break;
    default:
      this.addRandomTile(tileValue);
  }
}

GameManager.prototype.changeTileInsert = function(insertStyle){
  this.tileInsert = insertStyle;
}

GameManager.prototype.topLeftInsertTile = function(val) {
  let anArray = this.grid.availableCells();
  var value;
  if(val == 0){
    value = Math.random() < 0.9 ? 2 : 4;
  }
  else{
    value = Number(val);
  }
    for (let i = 0; i < anArray.length; i++){
          const tile = new Tile({x: anArray[i].x, y: anArray[i].y} , value);
          this.grid.insertTile(tile);
          break;
        }
}

 // currently working on this
GameManager.prototype.topLeftInsertTileRow = function(val){
  let anArray = this.grid.availableCells();
  var value;
  if(val == 0){
    value = Math.random() < 0.9 ? 2 : 4;
  }
  else{
    value = Number(val);
  }
  var pos = {x: this.size -1, y: this.size - 1} //lowest x, lowest y available
  for(let i = 0; i < anArray.length; i++){
    if(anArray[i].y < pos.y){
      pos.x = anArray[i].x
      pos.y = anArray[i].y
    }
    else if(anArray[i].y === pos.y){
      if(anArray[i].x < pos.x){
        pos.y = anArray[i].y;
      }
    }
  }
  const tile = new Tile({x: pos.x, y: pos.y}, value);
  this.grid.insertTile(tile);
}

GameManager.prototype.bottomLeftInsertTile = function(val) {
  let anArray = this.grid.availableCells();
  var value;
  if(val == 0){
    value = Math.random() < 0.9 ? 2 : 4;
  }
  else{
    value = Number(val);
  }
  
  var pos = {x: this.size -1, y: 0} //lowest x, largest y available
  for(let i = 0; i < anArray.length; i++){
    if(anArray[i].x < pos.x){
      pos.x = anArray[i].x
      pos.y = anArray[i].y
    }
    else if(anArray[i].x === pos.x){
      if(anArray[i].y > pos.y){
        pos.y = anArray[i].y;
      }
    }
  }
  const tile = new Tile({x: pos.x, y: pos.y}, value);
  this.grid.insertTile(tile);
}

GameManager.prototype.bottomLeftInsertTileRow = function(val) {
  let anArray = this.grid.availableCells();
  var value;
  if(val == 0){
    value = Math.random() < 0.9 ? 2 : 4;
  }
  else{
    value = Number(val);
  }
  
  var pos = {x: this.size -1, y: 0} //lowest x, largest y available
  for(let i = 0; i < anArray.length; i++){
    if(anArray[i].y > pos.y){
      pos.x = anArray[i].x
      pos.y = anArray[i].y
    }
    else if(anArray[i].y === pos.y){
      if(anArray[i].x < pos.x){
        pos.x = anArray[i].x;
      }
    }
  }
  const tile = new Tile({x: pos.x, y: pos.y}, value);
  this.grid.insertTile(tile);
}

GameManager.prototype.topRightInsertTileRow = function(val) {
  let anArray = this.grid.availableCells();
  var value;
  if(val == 0){
    value = Math.random() < 0.9 ? 2 : 4;
  }
  else{
    value = Number(val);
  }
  var pos = {x: 0, y: this.size - 1} //largest x, lowest y available
  for(let i = 0; i < anArray.length; i++){
    if(anArray[i].y < pos.y){
      pos.x = anArray[i].x
      pos.y = anArray[i].y
    }
    else if(anArray[i].y === pos.y){
      if(anArray[i].x > pos.x){
        pos.x = anArray[i].x;
      }
    }
  }
  const tile = new Tile({x: pos.x, y: pos.y}, value);
  this.grid.insertTile(tile);
}

GameManager.prototype.topRightInsertTile = function(val) {
  let anArray = this.grid.availableCells();
  var value;
  if(val == 0){
    value = Math.random() < 0.9 ? 2 : 4;
  }
  else{
    value = Number(val);
  }
  var pos = {x: 0, y: this.size - 1} //largest x, lowest y available
  for(let i = 0; i < anArray.length; i++){
    if(anArray[i].x > pos.x){
      pos.x = anArray[i].x
      pos.y = anArray[i].y
    }
    else if(anArray[i].x === pos.x){
      if(anArray[i].y < pos.y){
        pos.y = anArray[i].y;
      }
    }
  }
  const tile = new Tile({x: pos.x, y: pos.y}, value);
  this.grid.insertTile(tile);
}

GameManager.prototype.bottomRightInsertTile = function(val){
  let anArray = this.grid.availableCells();
  var value;
  if(val == 0){
    value = Math.random() < 0.9 ? 2 : 4;
  }
  else{
    value = Number(val);
  }
    for (let i = anArray.length - 1; i >= 0; i--){
          const tile = new Tile({x: anArray[i].x, y: anArray[i].y} , value);
          this.grid.insertTile(tile);
          break;
        }
}

GameManager.prototype.bottomRightInsertTileRow = function(val) {
  let anArray = this.grid.availableCells();
  var value;
  if(val == 0){
    value = Math.random() < 0.9 ? 2 : 4;
  }
  else{
    value = Number(val);
  }
  var pos = {x: 0, y: 0} //largest x, largest y available
  for(let i = 0; i < anArray.length; i++){
    if(anArray[i].y > pos.y){
      pos.x = anArray[i].x
      pos.y = anArray[i].y
    }
    else if(anArray[i].y === pos.y){
      if(anArray[i].x > pos.x){
        pos.x = anArray[i].x;
      }
    }
  }
  const tile = new Tile({x: pos.x, y: pos.y}, value);
  this.grid.insertTile(tile);
}

GameManager.prototype.changeTileValue = function(value){
  if(value == 2 || value == 4){
    this.tileValue = value;
  }
  else{
    this.tileValue = 0;
  }
}


GameManager.prototype.cornerTileInsertRotating = function(rotation) {
  let value = Math.random() < 0.9 ? 2 : 4;
  let position;
      switch(rotation){
      case 0:
        position = {x: 0, y: 0};
        break;
      case 1:
        position = {x: 0, y: this.grid.size-1}
        break;
      case 2:
        position = {x: this.grid.size-1, y: 0};
        break;
      case 3:
        position = {x: this.grid.size-1, y: this.grid.size-1};
        break;
      default:
        position = {x: 0, y: 0};
        break;
    }
    const tile = new Tile(position, value);
    if(!this.grid.cellOccupied(position)){
      this.grid.insertTile(tile);
    }
    else{
      let adjTiles = this.adjacentTiles(position.x, position.y);
      
      let newPosition = this.cornerTileInsertHelper(adjTiles, position.x, position.y);
      console.log("position:" + JSON.stringify(newPosition));
      const tile = new Tile(newPosition, value);
      this.grid.insertTile(tile);
    }
}

GameManager.prototype.cornerTileInsertHelper = function(tiles, x, y){
  let tileSides = {right: {x: x+1, y:y}, left: {x: x-1, y:y}, up: {x: x, y: y-1}, down: {x: x, y: y+1}}
  if(tiles.right == null && this.grid.withinBounds(tileSides.right)){
    return tileSides.right;
  }
  else if(tiles.left == null && this.grid.withinBounds(tileSides.left)){
    return tileSides.left;
  }
  else if(tiles.up == null && this.grid.withinBounds(tileSides.up)){
    return tileSides.up;
  }
  else if(tiles.down == null && this.grid.withinBounds(tileSides.down)){
    return tileSides.down;
  }
  else{
    let list = [tileSides.right, tileSides.left, tileSides.up, tileSides.down];
    for(const i of list){
      return this.cornerTileInsertHelper(this.adjacentTiles(i.x, i.y), i.x, i.y);
    }
  }
}
/**
 * This function will take in a grid of cells and a move, represented by a number, (0-3), and return the resulting gridisGameTerminated
 * @param {Grid} grid // The state of the board before the move
 * @param {Number} move // The move to be executed on the given grid
 */
GameManager.prototype.getResultingPosition = function(grid, direction){
  let newCells = []
  for(let i = 0; i < grid.cells.length; i++){
    let newRow = []
    for(let j = 0; j < this.size; j++){
      if(grid.cells[i][j] !== null){
        newRow.push({position: {x: grid.cells[i][j].x, y: grid.cells[i][j].y}, value: grid.cells[i][j].value})
      }
      else{
        newRow.push(null)
      }
    }
    newCells.push(newRow)
  }
  let newGrid = new Grid(grid.size, newCells)
    // 0: up, 1: right, 2: down, 3: left
    var self = this;

    if (this.isGameTerminated()){
      if(this.movesAvailable()){
        this.actuator.continueGame();
      }
      else return 
    }
     
        
    // Don't do anything if the game's over
  
    var cell, tile;
  
    var vector     = this.getVector(direction);
    var traversals = this.buildTraversals(vector);
    var moved      = false;
  
    // Save the current tile positions and remove merger information
    this.prepareTiles();
    let state = this.getBoardState();
    let move = direction;
    //console.log(move)
  
    // Traverse the grid in the right direction and move tiles
    traversals.x.forEach(function (x) {
      traversals.y.forEach(function (y) {
        cell = { x: x, y: y };
        tile = newGrid.cellContent(cell);
  
        if (tile) {
          var positions = self.findFarthestPositionGrid(cell, vector, newGrid);
          var next      = newGrid.cellContent(positions.next);
  
          // Only one merger per row traversal?
          if (next && next.value === tile.value && !next.mergedFrom) {
            var merged = new Tile(positions.next, tile.value * 2);
            merged.mergedFrom = [tile, next];
  
            newGrid.insertTile(merged);
            newGrid.removeTile(tile);
  
            // Converge the two tiles' positions
            tile.updatePosition(positions.next);
  
            // Update the score
            self.score += merged.value;
  
            // The mighty 2048 tile
            if (merged.value === 2048) self.won = true;
          } else {
            self.moveTileGrid(tile, positions.farthest, newGrid);
          }
  
          if (!self.positionsEqual(cell, tile)) {
            moved = true; // The tile moved from its original cell!
          }
        }
      });
    });
    this.printGrid(newGrid)
    if(moved){
      return {grid: newGrid, moved:true};
    }
    return {grid: newGrid, moved: false};
    if (moved) {
      // here we print the grid and then add the random tile, so right now the representation shows the grid after the move, and before a new tile gets inserted
      this.printGrid(newGrid)
      this.appendState(state, move);
      this.addRandomTileGrid(newGrid)
      //this.cornerTileInsertRotating(direction);
      console.log("direction: " + direction)
      let occupiedCellsArr = this.getOccupiedCells();
      let maxTile = this.getLargestCell(occupiedCellsArr);
        for(let i = 0; i < maxTile.length; i++){
          console.log("Max Tile X: " + maxTile[i].x + " Max Tile Y: " + maxTile[i].y + " Max Tile Value: " + maxTile[i].value);
        }
      if (!this.movesAvailable()) {
        this.over = true; // Game over!
      }
  
      // this.actuate(); don't think we want to actuate since this is just going to return an array of tiles
    }
}

GameManager.prototype.printGrid = function(grid){
  let cells = grid.cells;
  let ar = []
  for(let i = 0; i < cells.length; i++){
    for(let j = 0; j < this.size; j++){
      if(cells[i][j] === null){
        ar.push(0);
      }
      else{
        ar.push(cells[i][j].value)
      }
    }

  }
  //console.log(JSON.stringify(ar));
}

//function that returns an array of tiles that are present on the board ofter merges
GameManager.prototype.getOccupiedCells = function(){
  let occupiedCells = [];
  for(let i = 0; i < this.size; i++){
    for(let j = 0; j < this.size; j++){
      let aCell = {x: i, y: j};
      if (this.grid.cellOccupied(aCell)){
        let aTile = this.grid.cellContent(aCell);
        occupiedCells.push(aTile);
      }
    }
  }
  return occupiedCells;
}


//function takes in array of tiles, and returns an Array of maxTiles whether it be one or more
GameManager.prototype.getLargestCell = function(anArray){
  let max = 0;
  let maxTiles = [];
  let count = 0;
for(let i = 0; i < anArray.length; i++){
  let value = anArray[i].value;
  if (max < value) max = value;
}
for(let i = 0; i < anArray.length; i++){
  let value = anArray[i].value;
   let position = {x: anArray[i].x, y: anArray[i].y};
  if (max === value){
    maxTiles[count] = new Tile(position, max);
    count++;
  }
}
return maxTiles;
}

GameManager.prototype.immutableMoves = function(){
  let occupiedCells = this.getOccupiedCells();
  let largestTiles = this.getLargestCell(occupiedCells);
}


GameManager.prototype.adjacentTiles = function(x, y){
  let rightPos = {x: x + 1, y: y};
  let leftPos = {x: x - 1, y: y};
  let upPos = {x: x, y: y - 1};
  let downPos = {x: x, y: y + 1};
  let right = this.grid.cellContent(rightPos);
  let left = this.grid.cellContent(leftPos);
  let up = this.grid.cellContent(upPos);
  let down = this.grid.cellContent(downPos);
  const adj = {
    right: right,
    left: left,
    up: up,
    down: down
  }

  return adj;
}
// Get the vector representing the chosen direction
GameManager.prototype.getVector = function (direction) {
  // Vectors representing tile movement
  var map = {
    0: { x: 0,  y: -1 }, // Up
    1: { x: 1,  y: 0 },  // Right
    2: { x: 0,  y: 1 },  // Down
    3: { x: -1, y: 0 }   // Left
  };

  return map[direction];
};

// Build a list of positions to traverse in the right order
GameManager.prototype.buildTraversals = function (vector) {
  let traversals = { x: [], y: [] };

  for (let pos = 0; pos < this.size; pos++) {
    traversals.x.push(pos);
    traversals.y.push(pos);
  }

  // Always traverse from the farthest cell in the chosen direction
  if (vector.x === 1) traversals.x = traversals.x.reverse();
  if (vector.y === 1) traversals.y = traversals.y.reverse();

  return traversals;
};

GameManager.prototype.findFarthestPosition = function (cell, vector) {
  var previous;

  // Progress towards the vector direction until an obstacle is found
  do {
    previous = cell;
    cell     = { x: previous.x + vector.x, y: previous.y + vector.y };
  } while (this.grid.withinBounds(cell) &&
           this.grid.cellAvailable(cell));

  return {
    farthest: previous,
    next: cell // Used to check if a merge is required
  };
};

// This function does exactly the same as the findFarthestPosition, but takes in a grid
GameManager.prototype.findFarthestPositionGrid = function(cell, vector,  grid){
  var previous;

  // Progress towards the vector direction until an obstacle is found
  do {
    previous = cell;
    cell     = { x: previous.x + vector.x, y: previous.y + vector.y };
  } while (grid.withinBounds(cell) &&
           grid.cellAvailable(cell));
  return {
    farthest: previous,
    next: cell // Used to check if a merge is required
  };
}

GameManager.prototype.movesAvailable = function () {
  return this.grid.cellsAvailable() || this.tileMatchesAvailable();
};

// Check for available matches between tiles (more expensive check)
GameManager.prototype.tileMatchesAvailable = function () {
  var self = this;

  var tile;

  for (var x = 0; x < this.size; x++) {
    for (var y = 0; y < this.size; y++) {
      tile = this.grid.cellContent({ x: x, y: y });

      if (tile) {
        for (var direction = 0; direction < 4; direction++) {
          var vector = self.getVector(direction);
          var cell   = { x: x + vector.x, y: y + vector.y };

          var other  = self.grid.cellContent(cell);

          if (other && other.value === tile.value) {
            return true; // These two tiles can be merged
          }
        }
      }
    }
  }

  return false;
};

GameManager.prototype.positionsEqual = function (first, second) {
  return first.x === second.x && first.y === second.y;
};
