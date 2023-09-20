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
          self.addTile(cell);
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

// Continues the game (both restart and keep playing)
HTMLActuator.prototype.continueGame = function () {
  this.clearMessage();
};

HTMLActuator.prototype.clearContainer = function (container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
};

HTMLActuator.prototype.addTile = function (tile) {
  var self = this; // creates a consistent reference to "this" at the moment addTile was created, so even though the state of the actuator (this) might change, self will keep a snapshot of it when addTile was invoked

  var wrapper   = document.createElement("div");
  var inner     = document.createElement("div");
  var position  = tile.previousPosition || { x: tile.x, y: tile.y };
  var positionClass = this.positionClass(position);

  // We can't use classlist because it somehow glitches when replacing classes
  var classes = ["tile", "tile-" + tile.value, positionClass];

  if (tile.value > 2048) classes.push("tile-super");

  this.applyClasses(wrapper, classes, position);

  inner.classList.add("tile-inner");
  inner.textContent = tile.value;

  if (tile.previousPosition) {
    // Make sure that the tile gets rendered in the previous position first
    window.requestAnimationFrame(function () {
      classes[2] = self.positionClass({ x: tile.x, y: tile.y });
      self.applyClasses(wrapper, classes, {x: tile.x, y: tile.y}); // Update the position
    });
  } else if (tile.mergedFrom) {
    classes.push("tile-merged");
    this.applyClasses(wrapper, classes, position);

    // Render the tiles that merged
    tile.mergedFrom.forEach(function (merged) {
      self.addTile(merged);
    });
  } else {
    classes.push("tile-new");
      //TODO This is probably where we need to dynamically create the classes that are not already there, and apply them (something like this)
    // Or I could just use the already created applyClasses() function or jus the element.setAttrubute() function to apply the class to the element.
    // Probably where I will use the createTileClass() function
    this.applyClasses(wrapper, classes, position);
  }

  // Add the inner part of the tile to the wrapper
  wrapper.appendChild(inner);

  // Put the tile on the board


  
  this.tileContainer.appendChild(wrapper);
};

HTMLActuator.prototype.createTileClass = function(tile){
  console.log("position: " + JSON.stringify(tile));
  var pos = document.createElement('style'); // creates a style document
  let tileX = tile.x*121;
  let tileY = tile.y*121;
  // Edit the global "styleElement" style html element to include a new position class according to the position of the tile
  this.styleElement.textContent += `.tile.tile-position-${tile.x+1}-${tile.y+1} { 
    -webkit-transform: translate(${tileX}px, ${tileY}px);
    -moz-transform: translate(${tileX}px, ${tileY}px);
    -ms-transform: translate(${tileX}px, ${tileY}px);
    transform: translate(${tileX}px, ${tileY}px); 
  }`; // where we recreate the classes in main.css
}

HTMLActuator.prototype.applyClasses = function (element, classes, tile) { // sets class attribute of desired element to the class specified
  console.log("position class applied: " + classes[2]);
  let numbers = classes[2].match(/\d+/g);
  console.log(numbers);
  let flag = false;
  for(let number of numbers){ // Check if x-y is greater than 4
    if(number > 4){
      flag = true;
    }
  }
  if(flag && !this.extraTiles.includes(classes[2])){
    if(this.extraTiles.length < 1){ // If no 5 tiles have been created yet, attach the style document to the head of the page to add new class styles
      document.head.appendChild(this.styleElement)
    }
    this.extraTiles.push(classes[2]); // add tile position with 5 to extraTiles
    console.log("extraTiles:" + this.extraTiles.toString())
    this.createTileClass(tile);
    console.log(this.styleElement.innerHTML);
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
