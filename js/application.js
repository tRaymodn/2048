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
    }, sp);
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

document.getElementsByClassName('heading')[0].addEventListener("click", ()=> {
  makeCheckerboard();
})

const makeBestMove = function(tiles, m){
  let order = [];
  let myOrder;
  if(m == 1){
    order = [1, 3, 3];
  }
  else if(m == 3){
    order = [2, 3, 1]
  }
  else if(m == 0){
    order = [3, 0, 2];
  }
  else{
    order = [2, 0, 0];
  }
  if(!game.getResultingPosition(game.grid, order[0]).moved){
    if(!game.getResultingPosition(game.grid, order[1]).moved){
      myOrder = order[2];
    }
    else{
     myOrder = order[1]; 
    }
  }
  else{
    myOrder = order[0];
  }
  let t; // stirng for where the tile will be spawning new tiles from
  if(tiles.length == 2){
    t = checkerBoardStartingTileValue(tiles, myOrder)
  }
  game.move(myOrder)
  switch(t){
    case "tRR":
      fillAndShift(3, 2);
      break;
    case "tRC":
      fillAndShift(2, 3);
      break;
    case "bRC":
      fillAndShift(0, 3);
      break;
    case "bRR":
      fillAndShift(3, 0);
      break;
    case "bLC":
      fillAndShift(0, 1);
      break;
    case "bLR":
      fillAndShift(1, 0);
      break;
    case "tLC":
      fillAndShift(2, 1);
      break;
    case "tLR":
      fillAndShift(1, 2);
  }

}

const makeCheckerboard = function(){
  let g = game;
  let cells = g.grid.cells;
  let tileList = [];
  for(let i = 0; i < game.size; i++){ // get tiles from 2d array into 1D list with no null values
    for(let j = 0; j < game.size; j++){
      if(cells[i][j] !== null){
        tileList.push(cells[i][j]);
      }
    }
  }
  if(tileList.length !== 2){
    console.log("Can only run checkerboard from an initial starting state of a game");
    return;
  }
  else{
    console.log(tileList)
    if(tileList[0].x === tileList[1].x){
      // tiles are on the same column, so should move horizontally
      if(tileList[0].x === g.size - 1){ // if the tiles are in the same column in the final column, move to the left I think
        makeBestMove(tileList, 3); // not really, Im gonna change this to see how it works, but the 3 is gonna have a 2 move as the first option to see if we don't have to go across the board to start making rows/cols
      }
      else{
        makeBestMove(tileList, 1);
      }
    }
    else if(tileList[0].y === tileList[1].y){
      // tiles are on the same row, so should move vertically
      if(tileList[0].y === g.size - 1){ // if tiles are in the bottommost row, go up, else go down
        makeBestMove(tileList, 0);
      }
      else{
        makeBestMove(tileList, 2);
      }
    }
    else if(tileList[0].x === 0 && tileList[1].x === g.size - 1 || tileList[0].x === g.size - 1 && tileList[1].x === 0){
      // tiles are on opposite sides of the board in the x direction, so we should move horizontally
      makeBestMove(tileList, 1);
    }
    else if(tileList[0].y === 0 && tileList[1].y === g.size - 1 || tileList[0].y === g.size - 1 && tileList[1].y === 0){
      // tiles are on opposite sides of the board in the y direction, so we should move vertically
      makeBestMove(tileList, 2);
    }
    else{
      // tiles are not on the same row or column, and are not on opposite sides of the board in either the x or y direction
      // I'll just default to going right here becuase tile spawning perfers columns over rows
      makeBestMove(tileList, 1);
    }
  }

}

const fillAndShift = function(direction, slide){

  if(!game.getResultingPosition(game.grid, direction).moved && game.size%2 === 0){
    game.move(slide)
    console.log("slide " + slide)
  }
  else{ 
    if(game.tileValue == 2){
      game.changeTileValue(4)
    }
    else{
      game.changeTileValue(2);
    }
    if(game.getResultingPosition(game.grid, direction).moved){
      game.move(direction)
      console.log("merge " + direction)
    }
    else{
      console.log("slide: " + slide)
      game.move(slide);
    }
  }
  setTimeout(()=> {
    fillAndShift(direction, slide);
  }, 100);
}

// this function changes the tile input style based on the position of the tiles in the starting board
// returns the string abbreviation of whatever style is going to be used
const checkerBoardStartingTileValue = function(tiles, direction){
  let tile1; // tile with larger y value
  let tile2; // tile with smaller y value
  if(tiles[0].y > tiles[1].y){
    tile1 = tiles[0];
    tile2 = tiles[1];
  }
  else{
    tile1 = tiles[1]
    tile2 = tiles[0]
  }
  const getTileVal = function(t1, t2) {
    if(t1.value == 2 && t2.value != 2){
      game.changeTileValue(4);
    }
    else{
      game.changeTileValue(2);
    }
  }
  let returnString;
  if(direction == 1 || direction == 3){ // column
    console.log("column")
    if(tile1.y == tile2.y && (tile1.y == 0 || tile1.y == game.size-1)){ // they are on the same row and are actually going to be making a row
      if(direction == 3){
        game.changeTileInsert("bRR");
        returnString = "bRR"
      }
      else{
        game.changeTileInsert("bL")
        returnString = "bLR"
      }
      getTileVal(tile1, tile2);
      console.log("endrow")
    }
    else if(tile1.y + 1 == tile2.y || tile1.y - 1 == tile2.y){ // if tiles are right next to each other
      console.log("adjacent")
      if(tile2.y == 0){ // if the tiles are against the top of the  board
        if(direction == 3){
          game.changeTileInsert("bL");
          returnString = "bLC";
        }
        else{
          game.changeTileInsert("bR");
          returnString = "bRC";
        }
        getTileVal(tile1, tile2);
        console.log("top")
      }
      else{ // the tiles are somewhere in the middle or on the bottom of the board
        // default to on the top
        if(direction == 3){
          game.changeTileInsert("tL");
          returnString = "tLC";
        }
        else{
          game.changeTileInsert("tR");
          returnString = "tRC";
        }
        getTileVal(tile2, tile1);
        console.log("middle/bottom")
      }
    }
    else if(tile1.y == game.size - 1 && tile2.y == 0){ // if the two tiles are on opposite ends
      if(direction == 3){
        game.changeTileInsert("tL");
        returnString = "tLC";
      }
      else{
        game.changeTileInsert("tR");
        returnString = "tRC";
      }
      game.changeTileValue(2);
      console.log("opposite")
    }
    else if(tile1.y == game.size - 1){ // if there is a tile at the bottom of the board
      if(direction == 3){
        game.changeTileInsert("tL");
        returnString = "tLC";
      }
      else{
        game.changeTileInsert("tR");
        returnString = "tRC";
      }
      getTileVal(tile2, tile1);
      console.log("bottom")
    }
    else if(tile2.y == 0){ // if there is a tile a the top of the board
      if(direction == 3){
        game.changeTileInsert("bL");
        returnString = "bLC";
      }
      else{
        game.changeTileInsert("bR");
        returnString = "bRC";
      }
      getTileVal(tile1, tile2);
      console.log("top")
    }
    else{ // there are no tiles at the corners of the board
      if(direction == 3){
        game.changeTileInsert("tL");
        returnString = "tLC";
      }
      else{
        game.changeTileInsert("tR");
        returnString = "tRC";
      }
      getTileVal(tile2, tile1);
      console.log("no corners")
    }
  }
  else{ // row
    if(tile2.x >= tile1.x){ // set tile1 and tile2 based on xs instead - used for rows
      let temp = tile1;
      tile1 = tile2;
      tile2 = temp;
    }
    console.log("tile1.x:" + tile1.x, "tile2.x: " + tile2.x)
    console.log("row")
    if(tile1.x == tile2.x && (tile1.x == 0 || tile1.x == game.size-1)){ // they are on the same column and are actually going to be making a row
      if(direction == 0){
        game.changeTileInsert("bR");
        returnString = "bRC"
      }
      else{
        game.changeTileInsert("tR");
        returnString = "tRC"
      }
      getTileVal(tile1, tile2);
      console.log("endrow")
    }
    else if(tile1.x + 1 == tile2.x || tile1.x - 1 == tile2.x){ // if tiles are right next to each other
      if(tile2.x == 0){ // if the tiles are against the left side of the  board
        if(direction == 0){
          game.changeTileInsert("tRR");
          returnString = "tRR";
        }
        else{
          game.changeTileInsert("bRR");
          returnString = "bRR";
        }
        getTileVal(tile1, tile2);
        console.log("left side")
      }
      else{ // if the tiles are against the right side of the board
        if(direction == 0){
          game.changeTileInsert("tLR");
          returnString = "tLR";
        }
        else{
          game.changeTileInsert("bLR");
          returnString = "bLR";
        }
        getTileVal(tile2, tile1);
        console.log("right side/middle")
      }
    }
    else if(tile1.x == game.size - 1 && tile2.x == 0){ // if the two tiles are on opposite ends
      if(direction == 0){
        game.changeTileInsert("tLR");
        returnString = "tLR";
      }
      else{
        game.changeTileInsert("bLR");
        returnString = "bLR";
      }
      game.changeTileValue(2);
      console.log("opposite sides")
    }
    else if(tile1.x == game.size - 1){ // if there is a tile at the right side of the board
      if(direction == 0){
        game.changeTileInsert("tLR");
        returnString = "tLR";
      }
      else{
        game.changeTileInsert("bLR");
        returnString = "bLR";
      }
      getTileVal(tile2, tile1);
      console.log("tile right")
    }
    else if(tile2.x == 0){ // if there is a tile a the left side of the board
      if(direction == 0){
        game.changeTileInsert("tRR");
        returnString = "tRR";
      }
      else{
        game.changeTileInsert("bRR");
        returnString = "bRR";
      }
      getTileVal(tile1, tile2);
      console.log("tile left")
    }
    else{ // there are no tiles at the corners of the board
      if(direction == 0){
        game.changeTileInsert("tLR");
        returnString = "tLR";
      }
      else{
        game.changeTileInsert("bLR");
        returnString = "bLR";
      }
      getTileVal(tile2, tile1);
      console.log("no corner")
    }
  }
  return returnString;
}

const isCorner = function(x, y){
  return ((x == 0 && (y == 0 || y == game.size - 1)) ||
          (x == game.size - 1 && (y == 0 || y == game.size - 1 )))
}

const isBorder = function(x, y){
  return ((x == 0 || x == game.size  - 1) ||(y == 0 || y == game.size -1));
}

const isLockedRow = function(g, r){
  let locked = true;
  for(let i = 0; i < game.size; i++){
    console.log( i, r)
    //console.log("OURCELL: " + g.cells[i][r].value)
    if(g.cells[i][r] === null){
      locked = false;
      break;
    }
  }
return locked;
}

const isLockedCol = function(c, tiles){
  let locked = true;
  for(let i = 0; i < game.size; i++){
    if(g.cells[i][col] === null){
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
  if(tile.y === 0) {
    best = 0;
    grr = 2;
  }
  else {
    best = 2;
    grr = 0;
  }
  if (tile.x === 0){
      ok = 3;
      meh = 1;
    }
    else{
      ok = 1;
      meh = 3;
    }

    return rank = [best, ok, meh, grr];
  }

  const rowValue = function(g, r){
    sum = 0;
    for (let i = 0; i < g.size; i++){
      if (g.cells[r][i] !== null){
        sum += g.cells[r][i].value 
      }
    }
    return sum;
  }

  const loadTiles = function(valid, tile){
    let g = game.grid
    let adj = {x: tile.x - 1, y: tile.y};
    let cnt = 1;
    let startValue = tile.value
    //get adj Tile value (only 1 because row and corner)
    if (tile.x === 0){
      adj = {x: tile.x + 1, y: tile.y}
    }

    let initAdj = g.cells[adj.x][adj.y]
    //go through valid moves
    for (i of valid){
      let result = game.getResultingPosition(g, i)
      let adjTile = result.grid.cells[adj.x][adj.y]
      let cornerTile = result.grid.cells[tile.x][tile.y]
      console.log(adjTile, i)
      if (adjTile !== null && cornerTile !== null && initAdj !== null && initAdj.value < adjTile.value && cornerTile.value >= startValue){
        return i;
      }
      else{
       
        if (cnt === valid.length){
          return valid[0];
        }
        cnt++
      }

    }
    // check if any moves increase the value of an adj tile in the row (or column)
    //if so make move
    //if not return first valid move

    
  }



const lockRow = function(tile){
  let g = game.grid;
  let row = tile.x;
  let col = tile.y;
  let thisCount = countRow(g, row);
  let thisValue = rowValue(g,row);

  let valid = []
  let best = bestToWorst(tile);

  for (let j of best){
    let result = game.getResultingPosition(g, j);
    if (result.moved){
      valid.push(j);
    }
  }
  console.log("LOCKED?" + isLockedRow(g, col))
 
  if (isLockedRow(g,col)){
    console.log("LOAD")
    return loadTiles(valid, tile)
  } else{
  


  let cnt = 1;
  for(let i of valid){
    let result = game.getResultingPosition(g, i);
    lock = isLockedRow(result.grid, col)
    nextCount = countRow(result.grid, row);
    nextValue = rowValue(result.grid, row);
    if (lock || thisCount < nextCount ||  nextValue >= thisValue){
      return i;
    }
    else{
      //console.log("cnt: " + cnt)
      if (cnt === valid.length){
        return valid[0]
      }
     
    }
    cnt++
  }
  }
}
      

/* Prefaces putting largest tile in the corner, if the largest possible tile is already on the board and in a corner, it will move to lock out either a row
or column that tile is located in, if no moves can be made to fill a row or column,  it will make a move to have the most empty tiles.
if the largest possible next tile is not in a corner, it will find border and corner moves for that tile (i.e., moves that put that largest tile in the
corner, then the border). if a corner move is avalible, it will make it, if not it will make a border move, if neither, it will make the most empty move. */

//priortizing bottom left
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
  for(let tile of currOccupied){ // check if max possible tile is in corne
    

    if (tile.value === maxList[0].maxTile.value && isCorner(tile.x,tile.y)){
      console.log("MaxTile: " + maxList[0].maxTile.value )
      console.log(isCorner(tile.x,tile.y))
      move =  lockRow(tile);
      if (move != null){
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