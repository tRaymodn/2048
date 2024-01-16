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

// Based on the tiles on the board and the move taken, runs runRepeating() with the correct direction and slide
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
  let f = "switch"; // make some way to change this in the future to be able to change between different modes of inserting tiles
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
    fillSwitchShift(inputs[0], inputs[1], 2)
  }
}

// Makes the best starting move from a valid position (makeBestMove()) based on the initial position of the tiles
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
  else{ // Function is being run from a state with only two tiles on it
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

const fillSwitchShift = function(direction, slide, time){

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
  /*
  if(game.getResultingPosition(game.grid, direction).moved){
    game.move(direction);
    console.log("merge " + direction)
  }
  else if(game.getResultingPosition(game.grid, opposite).moved){
    if(game.tileValue == 2){
      //game.changeTileValue(4);
    }
    else{
      game.changeTileValue(2);
    }
    game.move(opposite);
    console.log("merge (opposite) " + opposite);
  }
  else{
    game.move(slide);
    console.log("slide " + slide);
  }
  */
  if( game.tileValue == 2){
    game.changeTileValue(4);
  }
  else{
    game.changeTileValue(2);
  }

 if(time > 0){
  game.move(direction)
  console.log("regular")
  setTimeout(() => {
    fillSwitchShift(opposite, slide, time-1);
  }, 100)
 }
 else{
  game.move(slide)
    console.log("opposite")
    setTimeout(() => {
    fillSwitchShift(opposite, slide, 2);
  }, 100)
 }
  
}

// want to make a new function to create some shape with the tiles
// obviously we can make rows/cols of tiles which do not merge with each other and just shove them next to each other, but 
// this is the same as essentially just placing the tiles there in the first place, so realistically, not that impressive

// need to have a function that merges tiles so that we get a resulting board that could not have resulted from just placing tiles on the board
// Put ideas in notebook because they are easier to draw and visualize on paper rather than with ASCII characters

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

  const countRowNull = function(r){
    let cnt = 0;
    for(let i = 0; i < r.length ; i++){
      if (r[i] == null){
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
  let ld = 0; // loading tiles
  let lk = 0; // locking row
  let mt = 0; // maintain stucture
  let nextRowI;
  let currRowI;
  let nextMultiplier = 1;
  let currMultiplier = 1; 
  let nextChain;
  let currChain;
  let nextScr = 0;
  let currScr = 0;
  let currVal = 0;
  let nextVal = 0;
  let adjLoad = 0;



  /*
  -LARGEST IN CORNER 
  */

  // Get position of the max tile in the current grid if any are in the corner, save the row, otherwise our row is the first entry in the largest tiles array 
  let currPos = game.grid.getMaxPos()
  for (let g of currPos){
    if (isCorner(g.x, g.y)){
      currVal = g.value
      currRowI = g.y 
      break;
    }
  }
  if (!currRowI){
    currRowI = currPos[0].y;
  }
  

  // get position of the largest tile in the next grid, if so save the value and the row , otherwise the value is zero and we use the first entry in the largest tiles array
  let nextPos = grid.getMaxPos()
  for (let p of nextPos){
    if (isCorner(p.x, p.y)){
      nextVal = p.value
      nextRowI = p.y;
      break;
    }
  }
  if(!nextRowI){
    nextRowI = nextPos[0].y
  }

  

  /*
  CHAINING
  */ 

  // determine which index to start chaining from, then get the row in either normal order or reverse order for current grid
  let nextRow = getRow(grid, nextRowI);
  let j;
  let nextRR = false;
  let currRow = getRow(game.grid, currRowI);
  let i;
  let currRR = false;

  j = getRowMaxIndex(nextRow) + 1;
  if ( j >= nextRow.length / 2 ){
    nextRow = getRowReverse(grid, nextRowI);
    j = getRowMaxIndex(nextRow) + 1;
    nextRR = true;
  }

  i = getRowMaxIndex(currRow) + 1;
  if ( i >= currRow.length / 2 ){
    currRow = getRowReverse(game.grid, currRowI);
    i = getRowMaxIndex(currRow) + 1;
    currRR = true;
  }

   // obtain chain metrics for comparison later 
   let obj = assessChain(grid, nextRow, nextRowI, j , nextRR);

   nextMultiplier = obj.m // length
   nextChain = obj.arr // tiles
   nextScr = obj.scr // sum - length
 
 // obtain chain metrics for comparison later 
   let p = assessChain(game.grid, currRow, currRowI, i, currRR );
 
   currMultiplier = p.m; // length
   currChain = p.arr; // tiles
   currScr = p.scr; // sum - length

  // want to preface edge if not corner for most space with chain < --------------------------------------

  // CHAIN DOESNT HAVE TO BE IDEAL CHAIN ALL THE TIME < ----------------------------------- 


 /*
  LOADING TILES
*/

  // given that we have a chain present before and after a move we always want to consider both the average difference in the sum
  // and the differential between the counts of the chains as a negative value for either will be representative of the change of the board state


    let initSum = rowValue(currChain);
    let initCount = countRow(currChain)

    let reversedCurr = currChain.slice();
    let reversedNext = nextChain.slice();

    let currPositions = [];
    let nextPositions = [];

    for (let tile of reversedCurr){
      let pos = {x: tile.x , y: tile.y}
      currPositions.push(pos);
    }

    for (let tile of reversedNext){
      let pos = {x: tile.x , y: tile.y}
      nextPositions.push(pos);
    }

    //console.log("curr positions" , currPositions)
    //console.log("next positions" , nextPositions)

    let adjCurr = loadAdj(game.grid, currPositions)
    let adjNext = loadAdj(grid, nextPositions)

    //console.log("adj curr" , adjCurr);
    //console.log("adj next" ,  adjNext);

    if(adjCurr.length > 0 && adjNext.length > 0){
      sumFacCurr = rowValue(adjCurr) / adjCurr.length;
      sumFacNext = rowValue(adjNext) / adjNext.length;
      adjLoad = sumFacNext - sumFacCurr;
    }
    

    let nextSum = rowValue(nextChain);
    let nextCount = countRow(nextChain);
    
    //console.log( "Current Chain", currChain);
    //console.log("Next Chain", nextChain);


    let fac = (nextSum - initSum) / (initCount +  nextCount); 
    let countDif =  nextCount - initCount ; 

    //console.log("FAC" , fac , "Dif" , countDif)

    // < --------------- need to prefer proper ordered chains over chains. (i.e [128, 64, 32, 16] VS. [128, 32, 8, 2]   )

    // < ---------------- can we load adjacent tiles to chain in ascending order from chain 




  

  /*
  LOCKING ROW 
  */

  let lockedCurr = isLockedRow(game.grid, currRowI);
  let lockedNext = isLockedRow(grid, nextRowI);


  if(lockedCurr && !lockedNext || !lockedCurr && !lockedNext){
    lk = -1;
  }
  if (lockedCurr && lockedNext){
    lk = 1;
  }
  if (!lockedCurr && lockedNext){
    lk = 2;
  }

  //SCORES 
  mt =  nextMultiplier - currMultiplier;
  lg =  nextVal - currVal;
  ld = fac + countDif
  

  //console.log("Largest In Corner:" , lg , "Chain Structure", des, "\n" );
  //console.log("Chain Multiplier" , multiplier, "LOCK" , lk, "LOAD" ,ld, "Mainchain", mt , '\n');
  console.log("direction" , dir);
  //console.log("Scores", nextScr , currScr)
  console.log("Lg: ", lg , "Chain:" , nextScr - currScr ,"load", ld , "lock" ,lk , "mainchain:" ,  mt, "adjLoad" , adjLoad)
  let eq =  lg + (nextScr - currScr) + ld +  mt  + adjLoad // + lk (maybe unimportant)
      return eq;
  }

const getLikes = function (prev, curr){
  let cnt = 0
  for(let i = 0; i < prev.length; i++ ){
    if (prev[i] == null || curr[i] == null){
      continue;
    }
    else{
      if (prev[i].value != curr[i].value)
      cnt++
    }

  }
  return cnt;
}

const assessChain = function(grid, r, rIndex, startIndex,  rr){
  let arr = [r[startIndex - 1]];
  //console.log("METRICS CHAIN", grid, r, rIndex, startIndex,  rr)
  let multiplier = 1;
  let des = 0;
  let temp = rIndex;
  for (let i = startIndex; i < r.length; i++){
    //console.log("MULT: " + multiplier )
    if(r[i - 1] == null || r[i] == null){
      //console.log(r[i - 1] , r[i])
      break;
    }
    let prev = r[i - 1]
    let curr = r[i]
    //console.log("TILES" , prev, curr)
    /*
    if (curr.value == prev.value || curr.value == prev.value / 2){
      arr.push(curr);
      multiplier++;
    }
    else */ if (curr.value <= prev.value ){
      arr.push(curr);
      multiplier++;
    }

    else{
      break;
    }

    if (multiplier % grid.size - (startIndex - 1 ) == 0 ){
      
      //console.log("CHECK NEXT ROW")
      if (rIndex >= grid.size / 2 ){
        temp--;
      }else {
        temp++
      }
      //console.log(temp)
      //console.log(rIndex)

      
      if (rr){
        r = getRow( grid , temp )
      } else{
        r = getRowReverse( grid , temp)
      }
      //console.log("ROW: " + JSON.stringify(r))

      if(r[0] != null && curr.value >= r[0].value){
        //console.log("NEXTROW:" , curr,  r[0].value)
        i = 0;
        multiplier++;
        arr.push(r[0])
      }
      
      // compare curr last and prev next 
    }

  }
  if (multiplier != 1){
    des = 1;
  } else{
    des = 0;
  }

  let Sum = rowValue(arr);
  let Count = countRow(arr);

  let scr = Sum - Count

  return {des: des, m: multiplier , arr: arr, scr: scr};
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
  let best = Number.NEGATIVE_INFINITY
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
  console.log("MOVE : "+ move);
  console.log("\n")
  return move;
}

const loadAdj = function(grid, positions) {
  let posNotInChainOrNull = [];
  let values = [];


  for (let pos of positions){

    let urdl = []

    up =    { x: pos.x, y: pos.y - 1 }
    right = { x: pos.x + 1, y: pos.y }
    down =  { x: pos.x, y: pos.y + 1 }
    left =  { x: pos.x - 1, y: pos.y }

    //let posss = [up , right, down, left];
    //console.log("POSS" , posss);
    

    if(up.x < grid.size && up.y < grid.size && up.x >= 0 && up.y >=  0 ){
      urdl.push(up)
    }
    if(right.x < grid.size && right.y < grid.size && right.x >= 0 && right.y >= 0 ){
      urdl.push(right)
    }
    if(down.x < grid.size && down.y < grid.size && down.x >= 0 && down.y >= 0 ){
      urdl.push(down)
    }
    if(left.x < grid.size && left.y < grid.size && left.x >= 0 && left.y >= 0 ){
      urdl.push(left)
    }
    
    //console.log("POS and urdl", pos, urdl);

    for (let dir of urdl){
      for (let i = 0; i < positions.length; i++){
        if (dir.x == positions[i].x  && dir.y == positions[i].y) {
          break;
        } else if (i == positions.length - 1){
            posNotInChainOrNull.push(dir);
          } else continue;
        } 
    }
  }

  //console.log("pos not in chain " , posNotInChainOrNull)

  for (let valid of posNotInChainOrNull){
    if (grid.cells[valid.x][valid.y] != null){
      values.push(grid.cells[valid.x][valid.y]);

    }
      
  }
  return values;
}

