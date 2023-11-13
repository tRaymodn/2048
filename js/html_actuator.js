function HTMLActuator() {
  this.tileContainer    = document.querySelector(".tile-container");
  this.scoreContainer   = document.querySelector(".score-container");
  this.bestContainer    = document.querySelector(".best-container");
  this.messageContainer = document.querySelector(".game-message");

  this.styleElement = document.createElement('style');
  this.extraTiles = [];
  this.score = 0;
}

// resets the board to the last board state and updates the score and best score
HTMLActuator.prototype.actuate = function (grid, metadata) {
  var self = this;

  window.requestAnimationFrame(function () {
    self.clearContainer(self.tileContainer);

    grid.cells.forEach(function (column) {
      column.forEach(function (cell) {
        if (cell) {
          self.addTile(cell, grid.size);
        }
      });
    });

    self.updateScore(metadata.score);
    self.updateBestScore(metadata.bestScore);

    if (metadata.terminated) {
      if (metadata.over) {
        self.message(false); // You lose
      } else if (metadata.won) {
        self.message(true); // You win!
      }
    }

  });
};

HTMLActuator.prototype.setPositionClasses = function(grid){
  this.styleElement.textContent = ''; // reset
  let gameContainer = document.getElementsByClassName('game-container')[0];
  let tileX;
  let tileY;
  let flag = false;
  if(grid.size > 8){
    flag = true;
  }
  for(let i = 0; i < grid.size; i++){
    for(let j = 0; j < grid.size; j++){
      if(flag){
        tileX = i*((gameContainer.offsetWidth - (grid.size * 16 )) / grid.size) + 15*i;
        tileY = j*((gameContainer.offsetWidth - (grid.size * 16 )) / grid.size) + 15*j;
      }
      else{
        tileX = i*121;
        tileY = j*121;
      }
      this.styleElement.textContent += `.tile.tile-position-${i+1}-${j+1} { 
      -webkit-transform: translate(${tileX}px, ${tileY}px);
      -moz-transform: translate(${tileX}px, ${tileY}px);
      -ms-transform: translate(${tileX}px, ${tileY}px);
      transform: translate(${tileX}px, ${tileY}px);}`
    }
  }
}

// Continues the game (both restart and keep playing)
HTMLActuator.prototype.continueGame = function () {
  this.clearMessage();
};

HTMLActuator.prototype.clearContainer = function (container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
};

HTMLActuator.prototype.addTile = function (tile, boardSize) {
  var self = this; // creates a consistent reference to "this" at the moment addTile was created, so even though the state of the actuator (this) might change, self will keep a snapshot of it when addTile was invoked

  var wrapper   = document.createElement("div");
  var inner     = document.createElement("div");
  var position  = tile.previousPosition || { x: tile.x, y: tile.y };
  var positionClass = this.positionClass(position);
  let gameContainer = document.getElementsByClassName('game-container')[0];

  // We can't use classlist because it somehow glitches when replacing classes
  var classes = ["tile", "tile-" + tile.value, positionClass];

  if (tile.value > 2048) classes.push("tile-super");

  this.applyClasses(wrapper, classes);

  if(boardSize <=8){
    inner.classList.add("tile-inner");
  }
  else{
    inner.classList.add("tile-inner");
    inner.setAttribute("style", `width: ${(gameContainer.offsetWidth - (boardSize * 16 )) / boardSize}px; height: ${(gameContainer.offsetHeight - (boardSize * 16 ))/boardSize}px;
    font-size: ${55-boardSize*2.47}px; line-height: ${(gameContainer.offsetWidth - (boardSize * 16 )) / boardSize}px;`)
    wrapper.setAttribute("style", `width: ${(gameContainer.offsetWidth - (boardSize * 16 )) / boardSize}px; height: ${(gameContainer.offsetHeight - (boardSize * 16 ))/boardSize}px;
    font-size: ${55-boardSize*2.47}px; line-height: ${(gameContainer.offsetWidth - (boardSize * 16 )) / boardSize}px;`)
  }
  inner.textContent = tile.value;

  if (tile.previousPosition) {
    // Make sure that the tile gets rendered in the previous position first
    window.requestAnimationFrame(function () {
      classes[2] = self.positionClass({ x: tile.x, y: tile.y });
      self.applyClasses(wrapper, classes); // Update the position
    });
  } else if (tile.mergedFrom) {
    classes.push("tile-merged");
    this.applyClasses(wrapper, classes);

    // Render the tiles that merged
    tile.mergedFrom.forEach(function (merged) {
      self.addTile(merged, boardSize);
    });
  } else {
    classes.push("tile-new");
    this.applyClasses(wrapper, classes);
  }

  // Add the inner part of the tile to the wrapper
  wrapper.appendChild(inner);

  // Put the tile on the board
  this.tileContainer.appendChild(wrapper);
};

HTMLActuator.prototype.applyClasses = function (element, classes) { // sets class attribute of desired element to the class specified
  if(!this.extraTiles.includes(classes[2])){
    if(this.extraTiles.length < 1){ // If no 5 tiles have been created yet, attach the style document to the head of the page to add new class styles
      document.head.appendChild(this.styleElement)
    }
    this.extraTiles.push(classes[2]); // add tile position with 5 to extraTiles
  }
  element.setAttribute("class", classes.join(" "));
};

HTMLActuator.prototype.normalizePosition = function (position) {
  return { x: position.x + 1, y: position.y + 1 };
};

HTMLActuator.prototype.positionClass = function (position) { // takes in position and returns string with the name of the correct position class
  position = this.normalizePosition(position);
  return "tile-position-" + position.x + "-" + position.y;
};

HTMLActuator.prototype.updateScore = function (score) {
  this.clearContainer(this.scoreContainer);

  var difference = score - this.score;
  this.score = score;

  this.scoreContainer.textContent = this.score;

  if (difference > 0) {
    var addition = document.createElement("div");
    addition.classList.add("score-addition");
    addition.textContent = "+" + difference;

    this.scoreContainer.appendChild(addition);
  }
};

HTMLActuator.prototype.updateBestScore = function (bestScore) {
  this.bestContainer.textContent = bestScore;
};

HTMLActuator.prototype.message = function (won) {
  var type    = won ? "game-won" : "game-over";
  var message = won ? "You win!" : "Game over!";

  this.messageContainer.classList.add(type);
  this.messageContainer.getElementsByTagName("p")[0].textContent = message;
};

HTMLActuator.prototype.clearMessage = function () {
  // IE only takes one value to remove at a time.
  this.messageContainer.classList.remove("game-won");
  this.messageContainer.classList.remove("game-over");
};
