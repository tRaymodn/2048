function GameManager(size, InputManager, Actuator, StorageManager) {
  this.size           = size; // Size of the grid
  this.inputManager   = new InputManager;
  this.storageManager = new StorageManager;
  this.actuator       = new Actuator;
  this.gridCreated    = false;

  this.startTiles     = 2;

  this.inputManager.on("move", this.move.bind(this));
  this.inputManager.on("restart", this.restart.bind(this));
  this.inputManager.on("keepPlaying", this.keepPlaying.bind(this));

  this.setup();
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
  } else {
    this.grid        = new Grid(this.size);
    this.score       = 0;
    this.over        = false;
    this.won         = false;
    this.keepPlaying = false;
    this.states = [];
    this.moves = [];

    // Add the initial tiles
    this.addStartTiles();
  }

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
  // I want to take in the size of the board and then create and append divs to the "grid-container" class div
  for(let i = 0; i < this.size; i++){
    let row = document.createElement('div');
    row.setAttribute('class', 'grid-row');
    for(let j = 0; j < this.size; j++){
      let cell = document.createElement('div');
      cell.setAttribute('class', 'grid-cell');
      row.appendChild(cell);
    }
    document.getElementsByClassName('grid-container')[0].appendChild(row);
  }
  document.getElementsByClassName('game-container')[0].setAttribute('style', `width:${(this.size)*124}px; height:${(this.size)*124}px;`);

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
      tile.savePosition();
    }
  });
};

// Move a tile and its representation
GameManager.prototype.moveTile = function (tile, cell) {
  this.grid.cells[tile.x][tile.y] = null;
  this.grid.cells[cell.x][cell.y] = tile;
  tile.updatePosition(cell);
};

// Move tiles on the grid in the specified direction
GameManager.prototype.move = function (direction) {
  // 0: up, 1: right, 2: down, 3: left
  var self = this;

  if (this.isGameTerminated()) return; // Don't do anything if the game's over

  var cell, tile;

  var vector     = this.getVector(direction);
  var traversals = this.buildTraversals(vector);
  var moved      = false;

  // Save the current tile positions and remove merger information
  this.prepareTiles();
  let state = this.getBoardState();
  let move = direction;
  console.log(move)

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
    this.addRandomTile()
    //this.cornerTileInsertRotating(direction);
    console.log("direction: " + direction)
    let adjTiles = this.adjacentTiles(1,1);
    if(adjTiles.left != null){
      console.log("left: " + adjTiles.left.value + "\n");
    }else{
      console.log("No tile at" + "(LEFT) " + "\n");
    }
    if(adjTiles.right != null){
      console.log("Right: " + adjTiles.right.value + "\n");
    }else{
      console.log("No tile at "  + " (RIGHT) " + "\n");
    }
    if(adjTiles.up != null){
      console.log("Up: " + adjTiles.up.value + "\n");
    }else{
      console.log("No tile at "  + " (UP) " + "\n");
    }
    if(adjTiles.down != null){
      console.log("Down: " + adjTiles.down.value + "\n");
    }else{
      console.log("No tile at " + " (DOWN) " + "\n");
    }
    let occupiedCellsArr = this.getOccupiedCells();
    let maxTile = this.getLargestCell(occupiedCellsArr);
      for(let i = 0; i < maxTile.length; i++){
        console.log("Max Tile X: " + maxTile[i].x + " Max Tile Y: " + maxTile[i].y + " Max Tile Value: " + maxTile[i].value);
      }
    if (!this.movesAvailable()) {
      this.download("moves.txt", this.movesToString())
      this.download("states.txt", this.statesToString())
      this.over = true; // Game over!
    }

    this.actuate();
  }
};

GameManager.prototype.topLeftInsertTile = function() {
  let anArray = this.grid.availableCells();
    var value = Math.random() < 0.9 ? 2 : 4;
    for (let i = 0; i < anArray.length; i++){
          const tile = new Tile({x: anArray[i].x, y: anArray[i].y} , value);
          this.grid.insertTile(tile);
          break;
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

//function that returns an array of tiles that are present on the board ofter merges
GameManager.prototype.getOccupiedCells = function(){
  let occupiedCells = [];
  let count = 0;
  for(let i = 0; i < this.size; i++){
    for(let j = 0; j < this.size; j++){
      let aCell = {x: i, y: j};
      if (this.grid.cellOccupied(aCell)){
        let aTile = this.grid.cellContent(aCell);
        occupiedCells[count] = aTile;
        count++;
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
  var traversals = { x: [], y: [] };

  for (var pos = 0; pos < this.size; pos++) {
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
