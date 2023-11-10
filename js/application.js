// Wait till the browser is ready to render the game (avoids glitches)
let game;
window.requestAnimationFrame(function () {
  game = new GameManager(4, KeyboardInputManager, HTMLActuator, LocalStorageManager);
});

let interval;
let dir = 0;
let autoMoving = false;
let sp = 500;

document.getElementById('speedP').addEventListener("click", () => {
sp = sp - 50;
let newSpeed = speedInput.value - - 1;
speedInput.value = newSpeed;
});

document.getElementById('speedM').addEventListener("click", () => {
sp = sp + 50;
let newSpeed = speedInput.value - 1;
speedInput.value = newSpeed;
});

document.getElementById('singleMove').addEventListener("click", () => {
  let move = keepLargestInCorner();
      game.move(move);
      futureHendrix(2, game.grid)
      console.log(JSON.stringify(futureList) + "length: " + futureList.length + "direction: " + move)
      console.log("number of true moves: " + t)

})

document.getElementById('autoMove').addEventListener("click", () => {
  if(!autoMoving){
    interval = setInterval(() => {
      let move = keepLargestInCorner();
      game.move(move);
      let state = game.getBoardState();
      //console.log(state);
      dir++;
    }, 20);
    autoMoving = true;
  }
  else{
    clearInterval(interval)
    autoMoving = false;
  }
})

document.getElementById('submitInputType').addEventListener("click", () => {
  let type = document.getElementById("inputType").value
  game.changeTileInsert(type);
  document.getElementById('inputType').value = "";
})

document.getElementById('submitValue').addEventListener("click", () => {
  var number = document.getElementById('inputValue').value;
  game.changeTileValue(number);
  document.getElementById("inputValue").value = "";
})

const isCorner = function(x, y){
  return ((x == 0 && (y == 0 || y == game.size - 1)) ||
          (x == game.size && (y == 0 || y == game.size - 1 )))
}

const isBorder = function(x, y){
  return ((x == 0 || x == game.size  - 1) ||(y == 0 || y == game.size -1));
}

const isLockedRow = function(g, r){
  let locked = true;
  for(let i = 0; i < game.size; i++){
    if(g.cells[r][i] === null){
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

const countRow = function(g , row){
  let cnt = 0;
  for(let i = 0; i < g.size; i++){
    if (g.cells[row][i] !== null){
      cnt++;
    }
  }
    return cnt;
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
  return {tiles: tiles, moved: result.moved};
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
  return {tiles: currOccupied, moved: result.moved };
}
let futureList = []
let t = 0;
const futureHendrix = function(times, grid){
  if(times > 0){
    for(let i = 0; i < 4; i++){
      let result = getAllResults(grid, i);
      console.log(`${i} is ${result.moved} a valid move, iteration:${times}`)
      if(result.moved){
        let res = make2dArray(result.tiles)
        let newg = new Grid(grid.size, res);
        let unnocupied = newg.availableCells()
        for(let j = 0; j < unnocupied.length; j++){
          for(let k = 0; k < 2; k++){
            switch(k){
              case 0:
                let newerg2 = new Grid(grid.size, res);
                let tile2 = new Tile({x: unnocupied[j].x, y: unnocupied[j].y}, 2);
                newerg2.insertTile(tile2);
                if(times === 1){
                  futureList.push(newerg2);
                }
                else{
                  futureHendrix(times - 1, newerg2);
                }
                break;
              case 1:
                let newerg4 = new Grid(grid.size, res);
                let tile4 = new Tile({x: unnocupied[j].x, y: unnocupied[j].y}, 4);
                newerg4.insertTile(tile4);
                if(times === 1){
                  futureList.push(newerg4);
                }
                else{
                  futureHendrix(times - 1, newerg4)
                }
                break;
            }
          }
        }
      }

    }
  }
}

const make2dArray = function(array){
  let size = Math.sqrt(array.length);
  let newArray = [];
  let currx = 0;
  for(let i = 0; i < size; i++){
    let newRow = []
    for(let j = 0; j < size; j++){
      let listItem = array[(i*size) + j]
      let tile;
      if(listItem !== null){
        tile = {position: {x: listItem.x, y: listItem.y}, value: listItem.value};
      }
      else{
        tile = false;
      }
      newRow.push(tile);
    }
    newArray.push(newRow)
  }
  return newArray;
}

const bestToWorst = function(tile){
  let rank = [];
  x = tile.x;
  y = tile.y;
  let best;
  let ok;
  let meh; 
  let grr;
  if(tile.x === 0) {
    best = 0;
    grr = 2;
  }
  else {
    best = 2;
    grr = 0;
  }
  if (tile.y === 0){
      ok = 3;
      meh = 1;
    }
    else{
      ok = 1;
      meh = 3;
    }

    return rank = [best, ok, meh, grr];
  }



const lockRow = function(tile){
  let g = game.grid;
  //let row = tile.y;
  //let col = tile.x;
  //let thisCount = countRow(g, col);
  let best = bestToWorst(tile);
  console.log(`Best ${best}`);
  for(let i of best){
    let result = game.getResultingPosition(g, i);
    //let nextCount = countRow(result.grid, row);
    if (result.moved){
      return i;
    }
  }
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
    

    maxTiles = game.getLargestCell(resultOccupied.tiles); // get max for all tiles
    for(let tile of maxTiles){
      if(maxList.length === 0){
        if (resultOccupied.moved){
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

  for(let tile of currOccupied){ // check if max possible tile is in corner
    if (tile.value === maxList[0].maxTile.value && isCorner(tile.x,tile.y)){
      move =  lockRow(tile);
      if (move !== null){
        console.log ("move: "+ move);
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