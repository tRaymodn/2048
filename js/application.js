// Wait till the browser is ready to render the game (avoids glitches)
let game;
window.requestAnimationFrame(function () {
  game = new GameManager(4, KeyboardInputManager, HTMLActuator, LocalStorageManager);
});

let interval;
let dir = 0;
let autoMoving = false;
document.getElementById('singleMove').addEventListener("click", () => {
  let move = keepLargestInCorner();
      game.move(move);
})

document.getElementById('autoMove').addEventListener("click", () => {
  if(!autoMoving){
    interval = setInterval(() => {
      let move = keepLargestInCorner();
      game.move(move);
      let state = game.getBoardState();
      //console.log(state);
      dir++;
    }, 50);
    autoMoving = true;
  }
  else{
    clearInterval(interval)
    autoMoving = false;
  }
})

const isCorner = function(x, y){
  return ((x == 0 && (y == 0 || y == game.size - 1)) ||
          (x == game.size && (y == 0 || y == game.size - 1 )))
}

const isBorder = function(x, y){
  return ((x == 0 || x == game.size  - 1) ||(y == 0 || y == game.size -1));
}

const isLockedRow = function(r, tiles){
  let locked = true;
  for(let i = 0; i < game.size; i++){
    if(tiles[r * game.size + i] === null){
      locked = false;
      break;
    }
  }
return locked;
}

const isLockedCol = function(c, tiles){
  let locked = true;
  for(let i = 0; i < game.size; i++){
    if(tiles[i * game.size + c] === null){
      locked = false;
      break;
    }
  }
  return locked;
}

const countTiles = function(tiles, row, col){
  //console.log(tiles)
  let rCount = 0;
  let cCount = 0;
  for (let tile of tiles){
    if (tile !== null){
      if (tile.x === row){
        rCount++;
      }
      if (tile.y === col){
        cCount++;
      }
    }
  }
  return {r: rCount, c: cCount};

}


const getCurrentTiles = function() {
  let allCells = [];
  let g = game.grid;
  for (let i = 0; i < g.cells.length; i++){
    for (let j = 0; j < g.cells[i].length; j++){
        allCells.push(g.cells[i][j]);
    }
  }
  return allCells;
}

const getCurrentOccupiedTiles = function() {
  let currOccupied = [];
  let g = game.grid;
  for (let i = 0; i < g.cells.length; i++){
    for (let j = 0; j < g.cells[i].length; j++){
      if (g.cells[i][j] !== null){
        currOccupied.push(g.cells[i][j]);
      }
    }
  }
  return currOccupied;
}

const getAllResults = function(g, i){
  let tiles = [];
    result = game.getResultingPosition(g, i);
    for(let j = 0; j < result.grid.cells.length; j++){
      for(let k = 0; k < result.grid.cells[j].length; k++){
          tiles.push(result.grid.cells[j][k]);
      }
    }
  return tiles;
}

const getOccupiedResults = function(g, i){
  let currOccupied = [];
  result = game.getResultingPosition(g, i);
  for (let i = 0; i < result.grid.cells.length; i++){
    for (let j = 0; j < result.grid.cells[i].length; j++){
      if (result.grid.cells[i][j] !== null){
        currOccupied.push(result.grid.cells[i][j]);
      }
    }
  }
  return currOccupied;
}

/* takes in a tile and the current board state as an array of tiles. For every move direction, chack if valid move, if so then go through every tile in
that move to see if any are in the corner and they are the max value. if so, calculate the number of tiles in the row and col and compare them to 
the current grid. If new is greater than old in either direction, return that move. */

const lockBase = function(allCells, cell){
  let g = game.grid;
  let move = null;

  for (let i = 0; i < 4; i++){
    let tiles = getAllResults(g, i);
    //console.log("lockTiles: " + tiles);
    if (result.moved){
      for(let tile of tiles){
        if(tile !== null && tile.value >= cell.value && isCorner(tile.x,tile.y)){
        //console.log("lockTiles: " + JSON.stringify(tiles));
        let row = tile.x;
        let col = tile.y;
        //console.log(row);
        let currCounts = countTiles(allCells, row, col);
        let currR = currCounts.r;
        let currC = currCounts.c;
        let resultCounts = countTiles(tiles, row, col);
        let resultR = resultCounts.r;
        let resultC = resultCounts.c;
        //console.log(currR , currC);
        //console.log(resultR , resultC);
          if ((resultR > currR || resultC > currC) ){
            move = i;
          }
        }
      }
    }
  }
  return move;
}

/* takes in a tile checks if it is already locked in two directions, if not we run lockMove, else we return null */
const lockBaseHelper = function(tile){
  let move = null;
  let allCells = getCurrentTiles();
  if((!isLockedRow(tile.x, allCells) && !isLockedCol(tile.y, allCells))){
    let lockMove = lockBase(allCells, tile);
    //console.log("lockMove: " + lockMove)
      if(lockMove !== null){
        move = lockMove;
        console.log("LOCKED");
    }
  }

  return move;
}

/* Prefaces putting largest tile in the corner, if the largest possible tile is already on the board and in a corner, it will move to lock out either a row
or column that tile is located in, if no moves can be made to fill a row or column,  it will make a move to have the most empty tiles.
if the largest possible next tile is not in a corner, it will find border and corner moves for that tile (i.e., moves that put that largest tile in the
corner, then the border). if a corner move is avalible, it will make it, if not it will make a border move, if neither, it will make the most empty move. */
const keepLargestInCorner = function(){
  let cornerMoves = [];
  let borderMoves = []; 
  let g = game.grid;
  let maxList = [];
  let move;
  let resultOccupied = [];
  //console.log("g: " + JSON.stringify(g.cells));

  for(let i = 0; i < 4; i++){ 
    let maxTiles = [];
    resultOccupied = getOccupiedResults(g, i); // get occupied tiles for the current board in every move direction
    

    maxTiles = game.getLargestCell(resultOccupied); // get max for all tiles
    for(let tile of maxTiles){
      if(maxList.length === 0){
        if (result.moved){
          maxList.push({maxTile: tile, direction: i})
        }
      }
      else if(tile.value === maxList[0].maxTile.value && result.moved){
        maxList.push({maxTile: tile, direction: i})
      }
      else if (tile.value > maxList[0].maxTile.value && result.moved){
        maxList = [];
        maxList.push({maxTile: tile, direction: i})
      }
    }
    

    //console.log("MaxTiles: " + JSON.stringify(maxTiles),"Direction: " +  i);
  }

  let currOccupied = getCurrentOccupiedTiles(); // get current board occupied tiles

  for(let tile of currOccupied){ // check if max possible tile will be in corner
    if (tile.value === maxList[0].maxTile.value && isCorner(tile.x,tile.y)){
      move =  lockBaseHelper(tile);
      if (move !== null){
        return move;
      }
      else{
        console.log("EMPTY");
        return getMoveMostEmpty();
      }
    }
  }

  for(tile of maxList){ // for every maxfor results chick if corner then border
    let x = tile.maxTile.x;
    let y = tile.maxTile.y;
    if (isCorner(x,y)){
      cornerMoves.push(tile.direction);
    }
    else if (isBorder(x,y)){
      borderMoves.push(tile.direction);
    }
  }

  //console.log(`CornerMoves: ${cornerMoves}`);
  //console.log(`BorderMoves: ${borderMoves}`);
    let cmL = cornerMoves.length;
    let bmL = borderMoves.length;

    if (cmL == 0){ //no corner moves
      if (bmL == 0){ //no border moves
        console.log("MOST EMPTY")
        move = getMoveMostEmpty();
      }
      else{
        move = borderMoves[0];
      }
    }

    if (cmL > 0){
      move = cornerMoves[0];
    }
    console.log("CORNER")
    return move;
  }



const getMoveMostEmpty = function(){
  let numTiles = []
  let g = game.grid;
  for(let i = 0; i < 4; i++){
    let thisTiles = 0;
    result = game.getResultingPosition(g, i);
    //console.log("result: " + JSON.stringify(result.grid.cells))
    for(let j = 0; j < result.grid.cells.length; j++){
      for(let k = 0; k < result.grid.cells[j].length; k++){
        if(result.grid.cells[j][k] !== null){
          thisTiles++;
        }
      }
    }
    numTiles.push({tiles: thisTiles, direction: i, moved: result.moved})
  }
  let moveFound = false;
  let m = 2; // move
  while(!moveFound){
    let index = 0;
    let leastTiles = numTiles[0].tiles
    for(let i = 1; i < numTiles.length; i++){
      if(numTiles[i].tiles <= leastTiles){
        leastTiles = numTiles[i].tiles;
        index = i;
      }
    }
    if(numTiles[index].moved === false){
      numTiles.splice(index, 1);
    }
    else{
      m = numTiles[index].direction;
      moveFound = true;
    }
  }
  //console.log("best move:" + m)
  return m
}

const keepChain = function(){
  /* I am going for my chain, which starts in the bottom right corner and extends to the left to start and working up the board
  So ideally, I want to keep the highest value tile at the last(?) position in the array and I want following moves to build up the next highest value in the chain.
  how to represent each value in the chain? -
  check to see whether the value in the corner is the highest value
  consecutively check the tiles, according to their positions in the array based on what the chain should look like- 
  i.e is the second tile that is part of the chain the second-highest value on the board?
  if so, then we need to check the next value in the chain.
  going like this, once we get to a value along the shape of the chain that does not fit with our chain structure, we try to build up that value.
  Maybe that means taking the next move that increases the value of that particular tile (or maybe the tiles surrounding it)
  We want to merge things up in the chain in a particular direction so as to not disrupt the basic structure
  - - - >
  | - - -
  - - - |
  | - - -
  */

  
  // check chain values - positions are: (grid) [3][3], [3][2], [3][1], [3][0], [2][3]... etc for MY chain. with the root tile being at grid.cells[3][3]
  let flag = false;
  let previousTile = game.grid.cells[3][3]; // need to account for when there is no tile here, such as in the beginning of the game, or when we have to move away
  if(previousTile === null){
    previousTile = {value: 0}
  }
  console.log(cornerTile)
  for(let i = 3; i >=0; i--){
    for(let j = 3; j >=0; j--){
      let chainTile = game.grid.cells[i][j]; // this should represent the current tile in MY defined chain
      // maybe go through the shape of the chain until we find a value later in the chain that is larger than a value earlier in the chain, then we know where to dump stuff
      if(chainTile.value > previousTile.value){
        flag = true // when this flag is set, then we need to start pumping the previous value, because it is messing up the chain
      }
    }
  }

}