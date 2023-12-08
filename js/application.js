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
  let move = scoreboard();
      game.move(move);
      //futureHendrix(2, game.grid)
      //console.log(JSON.stringify(futureList) + "length: " + futureList.length + "direction: " + move)
      //console.log("number of true moves: " + t)

})

document.getElementById('autoMove').addEventListener("click", () => {
  if(!autoMoving){
    interval = setInterval(() => {
      let move = scoreboard();
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

document.getElementById("submitValue").addEventListener("click", () => {
  let val = document.getElementById("inputValue").value
  game.changeTileValue(val);
  document.getElementById('inputValue').value = "";
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
  let f = "checker"; // make some way to change this in the future to be able to change between different modes of inserting tiles
  switch(t){
    case "tRR":
      runRepeating([3,2], f)
      break;
    case "tRC":
      runRepeating([2,3], f)
      break;
    case "bRC":
      runRepeating([0,3], f)
      break;
    case "bRR":
      runRepeating([3,0], f)
      break;
    case "bLC":
      runRepeating([0,1], f)
      break;
    case "bLR":
      runRepeating([1,0], f)
      break;
    case "tLC":
      runRepeating([2,1], f)
      break;
    case "tLR":
      runRepeating([1,2], f)
  }

}

const runRepeating = function(inputs, func){
  if(func == "checker"){
    fillAndShift(inputs[0], inputs[1]);
  }
  else if(func == "switch"){
    fillSwitchShift(inputs[0], inputs[1])
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

const fillSwitchShift = function(direction, slide){

  let opposite;
    switch(direction){
      case 0:
        opposite = 2;
        break;
      case 1:
        opposite = 3;
        break;
      case 2:
        opposite = 0;
        break;
      case 3:
        opposite = 1;
        break;
    }

  if(game.tileValue == 2){
    game.changeTileValue(4);
  }
  else{
    game.changeTileValue(2);
  }
  if(game.getResultingPosition(game.grid, direction).moved){
    game.move(direction);
    console.log("merge " + direction)
  }
  else if(game.getResultingPosition(game.grid, opposite).moved){
    game.move(opposite);
    console.log("merge (opposite) " + opposite);
  }
  else{
    game.move(slide);
    console.log("slide " + slide);
  }
  setTimeout(() => {
    fillSwitchShift(opposite, slide);
  }, 100)
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
        game.changeTileInsert("bLR")
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
    //console.log( i, r)
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

const getRow = function (g, r){
  let arr = []
  for (let i = 0; i < g.size; i++){
      arr.push(g.cells[i][r])
    }
  return arr;
}

const getRowReverse = function (g, r){
  let arr = []
  for (let i = g.size - 1; i >= 0; i--){
      arr.push(g.cells[i][r])
    }
  return arr;
}


const countRow = function(r){
  let cnt = 0;
  for(let i = 0; i < r.length ; i++){
    if (r[i] != null){
      cnt++;
    }
  }
    return cnt;
  }
  
  // returns 1d array of tiles that are not null
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

// returns 1d array of tiles and boolean whether it moved or not
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

// returns only tiles that are occupied after a move and whether it moved or not
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

const futureHendrix = function(times, grid){
  futureList = []
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
                  futureList.push({move: i, grid: newerg2});
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
                  futureList.push({move: i, grid: nerwerg4});
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

  const rowValue = function(arr){
    sum = 0;
    for (let i = 0; i < arr.length; i++){
      if(arr[i] != null){
        sum += arr[i].value;
      }
    }
    return sum;
  }
  /*
  const loadTile = function(grid, tile){ // needs some lovin
    let pos = {x: tile.x, y: tile.y};
    futureHendrix(1, grid);
    for(let future of futureList){
      if (future.grid.cells[pos.x][pos.y] != null && future.grid.cells[pos.x][pos.y].value > tile.value){ // this is definitely wrong
        return  true;
      }
    }
    
    return  false;

    
  }

  const loadTiles = function(valid, tile){// loading tiles with preference to corner rather than how it is now and lovin'
   
      let startValue = rowValue(game.grid, tile.y);
      let startCount = countRow(game.grid, tile.y);

 //for valid resulting grids -> get new row values -> check adj tile -> determine case (same, less, more) -> move if can -> if not check next adj tile
    // -> if no tiles fall in a case, best validmove
    for (let i of valid){
      let result = game.getResultingPosition(game.grid, i);
      let resultValue = rowValue(result.grid, tile.y);
      let resultCount = countRow(result.grid, tile.y);

      //preface merges within row
      if((resultValue > startValue && startCount == resultCount) || (resultValue == startValue && startCount < resultCount)){ 
        console.log("Value: " + startValue +"," + resultValue);
        console.log("Count: " + startCount +"," + resultValue);
        return i; 
      }

      let nextTiles = getRow(result.grid, tile.y); 
      for (let j = 0; j < nextTiles.length - 2; j++){
        let curr = nextTiles[j];
        let next = nextTiles[j + 1];
        if(curr == null){
          continue;
        }
        if(curr.value == next.value){//move towards corner
          console.log("EQUALS")
          if (tile.x == 0 ){
            return 3;
          }
          else{
            return 1;
              
          }
        }
        else if(curr.value > next.value){ // load tile if can 
          let load = loadTile(result.grid, nextTiles[j + 1]);
          if (load){
            console.log("next LESS")
            return i;
          }
        }

        else if (curr.value < next.value){ // dont load any tiles in row, load previous tile
          let load = loadTile(result.grid, nextTiles[j]);
          if (load){
            console.log("next GREATER")
            return i;
          }
        }
        }
    }
    //console.log("VALID" + valid);
    return valid[0]; //return first valid move if no tiles can or should be loaded.
      
      
}
const lockRow = function(tile){ //being worked
  let g = game.grid;
  //let row = tile.y;
  //let col = tile.x;
  //let thisCount = countRow(g, col);
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
  //console.log("LOCKED?" + isLockedRow(g, col))
 
  if (isLockedRow(g,col)){
    console.log("LOAD")
    return loadTiles(valid, tile)
  } 

  for(let i of valid){
    let result = game.getResultingPosition(g, i);
    lock = isLockedRow(result.grid, col)
    nextCount = countRow(result.grid, row);
    nextValue = rowValue(result.grid, row);
    let tile = g.cells[row][col];
    let nextTile = result.grid.cells[row][col];

    if(nextTile != null && nextTile.value >= tile.value){ // could be null
      console.log("Not LOCKED LOAD");
      loadTiles(valid, tile)
    }

    if (lock || thisCount < nextCount ||  nextValue >= thisValue){
      console.log("NOT ALREADY LOCKED BUT LOAD");
      return i;
    }
    else{
      console.log("Default")
        return valid[0]
    
  }
  }
}
      

Prefaces putting largest tile in the corner, if the largest possible tile is already on the board and in a corner, it will move to lock out either a row
or column that tile is located in, if no moves can be made to fill a row or column,  it will make a move to have the most empty tiles.
if the largest possible next tile is not in a corner, it will find border and corner moves for that tile (i.e., moves that put that largest tile in the
corner, then the border). if a corner move is avalible, it will make it, if not it will make a border move, if neither, it will make the most empty move.

//priortizing bottom left
const keepLargestInCorner = function(){
  let cornerMoves = [];
  let borderMoves = []; 
  let g = game.grid;
  let maxList = [];
  let move;
  let resultOccupied = [];
  //console.log("g: " + JSON.stringify(g.cells));
  let valid = [];
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
*/
const points = function(game, grid, dir){
  let lg = 0; // largest in corner
  let des = 0// descending order
  let ld = 0; // loading tiles
  let lk = 0; // locking row
  let mt = 0; // maintain stucture
  let mrg = 0; // merges 
  let ourTile;
  let ourRow;
  let currMax = 0;
  let multiplier = 1;
  

  let pos1 = game.grid.getMaxPos()
  for (let g of pos1){
    if (isCorner(g)){
      currMax = g.value;
      ourRow = g.position.y 
      break;
    }
  }
  if (!ourRow){
    ourRow = pos1[0].y;
  }
  

  /*largest in corner
    -get largest tile, is it in the corner
  |Score +++++
  */
  let pos = grid.getMaxPos()
  for (let p of pos){
    if (isCorner(p.x, p.y)){
      if (currMax < p.value){
        // greater score for increasing th value in the corner
        lg = 4;
      } else {
        lg = 2;
      }
      ourTile = p;
      break;
      
    }
    lg = 0;
  }
  if(!ourTile){
    ourTile = pos[0]
  }
   /*
  Descecnding order from corner
    -only if largest in corner, start corner and check value of next with points for higher chains
  | Score ++++
  */ 

    /*
    HAVE MULTIPLIER EXTEND IN CHAIN FASHION 
    */
  let row;
  let rr = false;

  if (lg != 0){
    let cornerCol = ourTile.x
  
    if(cornerCol == 0){
      row = getRow(grid, ourTile.y);
      
    } else{
      rr = true;
      row = getRowReverse(grid, ourTile.y)
      
    }
    //console.log(grid, row, ourTile.y, rr)

  let obj = assessChain(grid, row, ourTile.y, 1 , rr);
  des = obj.des
  multiplier = obj.m

  }
    //console.log(ourTile)
   
    //console.log(ourRow)
    //console.log(row);
    //console.log(grid); 


 




 /*
  can we load any tiles
  -only adventageous given both above 
  | Score +++ given chain struc
*/
// need tro be able to load second roew ++
  if (lg != 0 && des == 1){
    let aRow = getRow(game.grid, ourRow);
  
    let initSum = rowValue(aRow);
    let initCount = countRow(aRow)
    let nextSum = rowValue(row);
    let nextCount = countRow(row);
    console.log(initCount, nextCount);

    // adjust merges based on value or sum of tiles.
    if (nextSum > initSum && initCount == nextCount){
      ld = 2;
    }
    if(nextSum == initSum && initCount > nextCount){
      ld = 4;
    }
    //does a move change the value of a previoulsy defined structure
  }

 /*
  can we Lock Row
    -good fallback regardless of above
  | If all previous true Score +++, if any above not true Score +++++
  */
  let lockedCurr = isLockedRow(game.grid, ourRow);
  let lockedNext = isLockedRow(grid, ourTile.y);

//can prob check if previous coinditions are true here 

  if(lockedCurr && !lockedNext){
    lk = -1;
    //detrimentScore
  }
  if (lockedCurr && lockedNext){
    lk = 1;
  }
  if (!lockedCurr && lockedNext){
    lk = 2;
  }

   /*
  Can we maintain the struture
  -Always want to if can, if doesnt large score detriment
  |score +++++ if not score-------
  */

  // want to preface edge if not corner for most space with chain. 

  let row1 = getRow(game.grid, ourRow);
  let i;
  let rr1 = false;
  i = getRowMaxIndex(row1) + 1;
  if ( i >= row1.length / 2 ){
    row1 = getRowReverse(game.grid, ourRow);
    i = getRowMaxIndex(row1) + 1;
    rr1 = true;
  }
  let p = assessChain(game.grid, row1, ourRow, i, rr1 );
  let multiplier1 = p.m

    if (multiplier1 > multiplier){
      mt = 0
    }
    if (multiplier1 == multiplier){
      mt = 1
    }
    if (multiplier > multiplier1){
      mt = 3
    }
 /*
 CAN WE MERGE WITHIN OUR ROW
  can we increase Row Value
  -always want to try to get larger tiles if possible, unless to trap a smaller tile 
  score +   


*/
console.log("Largest In Corner:" , lg , "Chain Structure", des, "\n" );
console.log("Chain Multiplier" , multiplier, "LOCK" , lk, "LOAD" ,ld, "Mainchain", mt , '\n');
console.log(dir);
//mt will zero lock and load if the structure for a move is worse
let eq =  lg + (multiplier *des) + ld + lk +  mt
    return eq;

}

// I want to progress until i find a tile
//from that tile we 
const assessChain = function(grid, r, rIndex, startIndex,  rr){
  //console.log("METRICS CHAIN", grid, r, rIndex, startIndex,  rr)
  let multiplier = 1;
  let des = 0;
  let temp = rIndex;
  for (let i = startIndex; i < r.length; i++){
    //console.log("MULT: " + multiplier )
    if(r[i - 1] == null || r[i] == null){
      console.log(r[i - 1] , r[i])
      break;
    }
    let prev = r[i - 1].value
    let curr = r[i].value
    console.log("TILES" , prev, curr)
    if(prev >= curr){
      multiplier++;
    }else{
      break;
    }

    if (multiplier % grid.size - (startIndex - 1 ) == 0 ){
     
      console.log("CHECK NEXT ROW")

      if (rIndex >= grid.size / 2 ){
        temp--;
      }else {
        temp++
      }
      console.log(temp)
      console.log(rIndex)

      
      if (rr){
        r = getRow( grid , temp )
      } else{
        r = getRowReverse( grid , temp)
      }
      console.log("ROW: " + JSON.stringify(r))

      if(r[0] != null && curr >= r[0].value){
        console.log("NEXTROW:" , curr,  r[0].value)
        i = 0;
        multiplier++;
      }
      
      // compare curr last and prev next 
    }

  }
  if (multiplier != 1){
    des = 1;
  } else{
    des = 0;
  }

  return {des: des, m: multiplier};
}


const getRowMaxIndex = function(tiles){
  let max = Number.MIN_VALUE
  let pos;
  for (let i = 0; i < tiles.length; i++){
    if(tiles[i] != null && tiles[i].value > max){
      max = tiles[i].value;
      pos = i
    }
  }
  return pos;
}

const getValidMoves = function(){
  let valid = [];
  for (let i = 0; i < 4; i++){
    let result = game.getResultingPosition(game.grid, i);
    if (result.moved){
      valid.push(i);
    }
  }
  return valid;
}


const scoreboard = function(){
  let moves = getValidMoves()
  let P = []
  let best = 0
  let move;
  let gamer = game

  for (let i of moves){
    let result = gamer.getResultingPosition(gamer.grid, i);
    let p = points(gamer, result.grid, i); //int
    P.push(p)
  }

  // right now the values might be the same for the score, in which we will prefer left. 
  //eventually moves will very very rarely have the same value.
  console.log("MOVES: " + moves)
  for (let _ = 0; _ < P.length; _++){
    if ( P[_] >= best){
      best = P[_]
      move =  moves[_]
    }
  } 
  console.log("POINTS:" + P);
  console.log("MOVE : "+ move)
  return move;
}


