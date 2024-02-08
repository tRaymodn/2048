// Wait till the browser is ready to render the game (avoids glitches)
let game;
window.requestAnimationFrame(function () {
  game = new GameManager(4, KeyboardInputManager, HTMLActuator, LocalStorageManager, false);
});

let interval;
let dir = 0;
let autoMoving = false;
let sp = 500;

document.getElementById('makeImageButton').addEventListener("click", () => {
  if(game.designer){
    let colorMap = makeColorBoardFromPicker();
    game.makeImage(colorMap.map, colorMap.mapping, 200);
  }
  
})

document.getElementById('plus').addEventListener("click", () => {
  if(game.designer){
    game.actuator.clearContainer(document.getElementById("colorPicker"));
    makeImagePickerBoard(Number(game.size) + 1);
  }
})

document.getElementById('minus').addEventListener("click", () => {
  if(game.designer){
    game.actuator.clearContainer(document.getElementById("colorPicker"));
    makeImagePickerBoard(Math.max(Number(game.size) - 1, 2));
  }
})

document.getElementById('designerButton').addEventListener("click", () => {
  //game.removeGridRows('grid-row', game.size);
  //game = new GameManager(game.size, KeyboardInputManager, HTMLActuator, LocalStorageManager, true);
  if(!game.designer){
    game.grid.cells = game.grid.empty();
    game.actuator.clearContainer(game.actuator.tileContainer);
    game.designer = !game.designer;
    makeImagePickerBoard(game.size);
    console.log(game.size);
    let zeros = Array(Number(game.grid.size)).fill(0);
    // Fill in configurations and configDecomps in tileRows
    game.tileRows.evaluateState(zeros, []);
    console.log(game.tileRows.getFilledConfigs());
  }
  else{
    game.actuator.clearContainer(document.getElementById("colorPicker"));
    game.designer = !game.designer;
    game.setup();
  }
  //game.grid.insertTile({x: 0, y: 0, value: 2});
  //game.actuator.addTile({x: 0, y: 0, value: 2}, game.size);
})




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

  
  let scr = scoreboard();
  game.move(scr.m);

  //console.log("R" , isLockedRow(game.grid, 0))

  //console.log("C", isLockedCol(game.grid, 0 ))

  
  

      
      //futureHendrix(2, game.grid)
      //console.log(JSON.stringify(futureList) + "length: " + futureList.length + "direction: " + move)
      //console.log("number of true moves: " + t)

})

document.getElementById('simulate').addEventListener("click",() =>{
  scorekeeper(1000)
})

document.getElementById('autoMove').addEventListener("click", () => {
  if(!autoMoving){
    interval = setInterval(() => {
      if (!game.movesAvailable()){
        clearInterval(interval)
        autoMoving = false;
      }else{
      let scr = scoreboard();
      game.move(scr.m);
      let state = game.getBoardState();
      //console.log(state);
      
  }
}, sp);
  
    autoMoving = true;
  }
  else{
    clearInterval(interval)
    autoMoving = false;
  }
})


document.getElementsByClassName('heading')[0].addEventListener("click", ()=> {
  makeCheckerboard();
})



const makeImagePickerBoard = function(size){
  for(let i = 0; i < size; i++){
    let row = document.createElement("div");
    row.setAttribute("class", "colorTileRow")
    for(let j = 0; j < size; j++){
      let tile = document.createElement("div")
      tile.setAttribute("class", "colorTile");
      tile.addEventListener("click", (e) => {
        changePickerTileColor(e.target);
      })
      row.appendChild(tile);
    }
    document.getElementById("colorPicker").appendChild(row);
  }
}

const changePickerTileColor = function(htmlTile){
  let style = getComputedStyle(htmlTile).backgroundColor;
  let newColor;
  switch(style){
    case 'rgb(0, 0, 0)':
      newColor = "rgb(255, 0, 0)";
      break;
    case "rgb(255, 0, 0)":
      newColor = "rgb(255, 165, 0)";
      break;
    case "rgb(255, 165, 0)":
      newColor = "rgb(255, 255, 0)";
      break;
    case "rgb(255, 255, 0)":
      newColor = "rgb(0, 255, 0)";
      break;
    case "rgb(0, 255, 0)":
      newColor = "rgb(0, 0, 255)";
      break;
    case "rgb(0, 0, 255)":
      newColor = "rgb(75, 0, 130)";
      break;
    case "rgb(75, 0, 130)":
      newColor = "rgb(148, 0, 211)";
      break;
    case "rgb(148, 0, 211)":
      newColor = "rgb(255, 255, 255)";
      break;
    case "rgb(255, 255, 255)":
      newColor = "rgb(0, 0, 0)";
      break;
    default:
      newColor = "rgb(0, 0, 0)";
      break;
  }
  htmlTile.setAttribute("style", `background-color: ${newColor}`);
  makeColorBoardFromPicker()
}

const makeColorBoardFromPicker = function(){
  let colorBoard = []
  let mapping = {};
  let number = 0;
  let columns = document.getElementsByClassName("colorTileRow")
  for(let i = 0; i < columns.length; i++){
    let thisColumn = columns[i];
    let col = [];
    for(let j = 0; j < thisColumn.children.length; j++){
      let color = getComputedStyle(thisColumn.children[j]).backgroundColor;
      if(!mapping[color] && mapping[color] !== 0){
        mapping[color] = number;
        col.push(mapping[color]);
        number = number + 1;
      }
      else{
        col.push(mapping[color])
      }
    }
    colorBoard.push(col);
  }
  let output = colorBoard[0].map((_, colIndex) => colorBoard.map(row => row[colIndex])); // https://stackoverflow.com/questions/17428587/transposing-a-2d-array-in-javascript
  return {map: output, mapping: mapping};
}

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

const isLockedRow = function(grid, r){
  let locked = true;
  let row = getRow(grid, r);
  for(let i = 0; i < row.length - 1; i++){
    //console.log( i, row)
    //console.log("OURCELL: " + row[i])
    if(row[i] == null || row[i + 1] == null || row[i+1].value == row[i].value ){
      locked = false;
      break;
    }
  }
return locked;
}

const isLockedCol = function(grid,c){
  let locked = true;
  let col = getCol(grid, c);
  for(let i = 0; i < col.length - 1; i++){
    if(col[i] == null || col[i + 1] == null || col[i + 1].value == col[i].value ){
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

const getCol = function (g, c){
  let arr = []
  for (let i = 0; i < g.size; i++){
      arr.push(g.cells[c][i])
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

  const getConsScr = function (arr){
    let scores = [];
    for(let i = 0; i < arr.length; i++){
      if (arr[i] == null || arr[i + 1] == null){
        continue;
      } else if (arr[i].value == arr[i+1].value){
        let cnt = 2;
        let temp = i + 1
        while(true){
          if (temp < arr.length - 1 && arr[temp + 1] != null && arr[temp].value == arr[temp + 1].value){
            cnt++;
            temp++;
          } else{
            scores.push(arr[i + 1].value * (cnt - i))
            break;
          }
        }
      }
    }
    return scores.reduce((accumulator, currentValue) => {
      return accumulator + currentValue;
    }, 0); 
  }

  const countRowCons = function(r){
    let cnt = 0;
    for(let i = 0; i < r.length ; i++){
      if (r[i] != null){
        cnt++;
      }else break;
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


let scrLeft = 0; 
let scrRight = 0;

const points = function(game, grid, dir){

  let lg = 0; // largest in corner
  let ld = 0; // loading tiles
  //let lk = 0; // locking row
  //let mt = 0; // maintain stucture
  let nextRowI;
  let currRowI;
  let nextColI;
  let currColI;
  let nextMultiplier = 1;
  let currMultiplier = 1; 
  let nextChain;
  let currChain;
  let nextScr = 0;
  let currScr = 0;
  let currVal = 0;
  let nextVal = 0;
  let adjLoad = 0;
  let shiftLoad = 0;



  /*
  -LARGEST IN CORNER 
  */

  // Get position of the max tile in the current grid if any are in the corner, save the row, otherwise our row is the first entry in the largest tiles array 
  let currPos = game.grid.getMaxPos()
  currRowI = currPos[0].y;
  currColI = currPos[0].x;
  for (let g of currPos){
    currVal = g.value/1.5;  // TODO:
    if (isCorner(g.x, g.y)){
      currVal = g.value
      currRowI = g.y 
      currColI = g.x
      break;
    }
  }
  

  // get position of the largest tile in the next grid, if so save the value and the row , otherwise the value is zero and we use the first entry in the largest tiles array
  let nextPos = grid.getMaxPos()
  nextRowI = nextPos[0].y
  nextColI = nextPos[0].x;
  for (let p of nextPos){
    nextVal = p.value/1.5// TODO:
    if (isCorner(p.x, p.y)){
      nextVal = p.value
      nextRowI = p.y;
      nextColI = p.x
      break;
    }
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
   nextScr = obj.scr // sum - length TODO:
 
 // obtain chain metrics for comparison later 
   let p = assessChain(game.grid, currRow, currRowI, i, currRR );
 
   currMultiplier = p.m; // length
   currChain = p.arr; // tiles
   currScr = p.scr; // sum - length TODO:


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

    //let adjCurr = loadAdj(game.grid, currPositions)
    let adjNext = loadAdj(grid, nextPositions)
    

    //want to create a method that will run until all tiles that are adjacent to other tiles havea score 
    // always have to move so look at next adj and calcualte score of adj tiles 
    let desAdj = [];

    while (nextPositions.length < getOccupiedResults(grid, dir).tiles.length && adjNext.length > 0 ){
      adjNext = new Set(loadAdj(grid, nextPositions))
      adjNext = [...adjNext]
      for (let tile of adjNext){
        let pos = {x: tile.x , y: tile.y}
        nextPositions.push(pos);
      }
      desAdj.push(adjNext.map(item => item.value));

    }
    //console.log("next positions" , nextPositions)
    //console.log("adj next" ,  adjNext);
    //console.log(nextPositions.length)
    //console.log(getOccupiedResults(grid, dir).tiles.length)
    //console.log(dir)
    //console.log("next positions" , nextPositions)
    //console.log("desAdj" , desAdj)

    //console.log("adj curr" , adjCurr);
    //console.log("adj next" ,  adjNext);

    let nextScrs = [];
    
    if(desAdj.length > 0){
    for( i = 0; i < desAdj.length; i++){
      const sumNext = desAdj[i].reduce((accumulator, currentValue) => {
        return accumulator + currentValue;
      }, 0);


      nextScrs.push(sumNext * ((desAdj.length - i) / desAdj.length) / (nextVal / 2)); // TODO:

    }

    adjLoad = nextScrs.reduce((accumulator, currentValue) => {
      return accumulator + currentValue;
    }, 0);
  }



/*
    if(adjCurr.length > 0 && adjNext.length > 0){
      sumFacCurr = rowValue(adjCurr) / adjCurr.length;
      sumFacNext = rowValue(adjNext) / adjNext.length;
      adjLoad = sumFacNext - sumFacCurr;
    }
    */
    

    let nextSum = rowValue(nextChain);
    let nextCount = countRow(nextChain);
    
    //console.log( "Current Chain", currChain);
    //console.log("Next Chain", nextChain);


    let fac = nextSum - initSum ; 
    let countDif =  nextCount - initCount ; 

    //console.log("FAC" , fac , "Dif" , countDif)

    // < --------------- need to prefer proper ordered chains over chains. (i.e [128, 64, 32, 16] VS. [128, 32, 8, 2]   )





  

  /*
  LOCKING ROW 
   // TODO:
    - verify mutiple Rows indexing (more than one row locked)

    // TODO: Make SHIFT LOAD EXTEND TO ALL ROWS OF THE BOARD
    

    want to look at a grids next positions
      sum the values that are the same after left and right moves in consecutive rows and sum their scores by closest to start
      sum the values that are the same after and up and down moves in consecutive columns and sum scoores byb closest to start 
      could start at any index most likely 0 or grid.size 

      foor every move i want to 


      If Horizontally locked
      move a direction say left 
      -> get start row and next row 
      -> go through every column
      -> if values in col arr [x][][][]    x match y ? multiply value of matching tiles by grid.size - 1 - i  / (grid.size - 1)
                              [y][][][]    sum all column values
                              [z][][][]
                              [q][][][]
      

     if vertically  locked
      move a direction say down
      -> go through every row
      -> if values in row arr [x][y][z][q]    x match y ? multiply value of matching tiles by grid.size - 1 - i  / (grid.size - 1)
                              [][][][]    sum all row values
                              [][][][]
                              [][][][]
      

  */

 

  let lockedCurr = isLockedRow(game.grid, currRowI);
  let lockedNext = isLockedRow(grid, nextRowI);

  let shiftScores = []
  //ROW SLIDE Check columns
  if (dir == 1 || dir == 3 ){
    
    //determine direction to check 
    if( nextColI < grid.size / 2  ){
      for(let i = nextColI; i < grid.size - 1; i ++ ){
        let col = getCol(grid, i) ;
        shiftScores.push(getConsScr(col) * (grid.size - 1 - i) / (grid.size - 1) / nextVal) ; // TODO: 
      } 
    }else{
      for(let i = nextColI; i > 0; i-- ){
          let col = getCol(grid, i) ;
          shiftScores.push(getConsScr(col) * (grid.size - 1 - i) / (grid.size - 1) / nextVal);
      } 
    }
  }else {
    if( nextRowI < grid.size / 2  ){
      for(let i = nextRowI; i < grid.size - 1; i ++ ){
        let row = getRow(grid, i) ;
        shiftScores.push(getConsScr(row)* (grid.size - 1 - i) / (grid.size - 1) / nextVal);
      } 
    }else{
      for(let i = nextRowI; i > 0; i-- ){
          let row = getRow(grid, i) ;
          shiftScores.push(getConsScr(row)* (grid.size - 1 - i) / (grid.size - 1) / nextVal );
      } 
    }
  }
  //console.log(shiftScores , dir);

    shiftLoad = shiftScores.reduce((accumulator, currentValue) => {
      return accumulator + currentValue;
    }, 0);


    


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
  lg =  nextVal;
  ld = fac + countDif
  

  //console.log("Largest In Corner:" , lg , "Chain Structure", des, "\n" );
  //console.log("Chain Multiplier" , multiplier, "LOCK" , lk, "LOAD" ,ld, "Mainchain", mt , '\n');
  //console.log("direction" , dir);
  //console.log("Scores", nextScr , currScr)
  //console.log("Lg: ", lg , "Chain:" , nextScr - currScr ,"load", ld , "lock" ,lk , "mainchain:" ,  mt, "adjLoad" , adjLoad, "Shift" ,shiftLoad)
  let eq =  lg + nextScr  + adjLoad  + shiftLoad //+ ld + lk +  mt //(maybe unimportant)
  //console.log(eq);
  return {lg: lg , multip: nextScr ,  adjLoad: adjLoad  , shiftLoad: shiftLoad , eq: eq};
  }


const getLikes = function (above, below){
  let tiles = [];
  for(let i = 0; i < above.length; i++ ){
    if (above[i] == null || below[i] == null){
      continue;
    }
    else if (above[i].value == below[i].value){ 
        tiles.push(above[i].value);
      }
    }
  return tiles;
}

/*
TODO: clean 
*/

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

  let Sum = rowValue(arr);
  let Count = countRow(arr);

  let scr = Sum - Count

  return {m: multiplier , arr: arr, scr: scr};
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
  let Values = [];

  for (let i of moves){
    //Values = [];
    let result = gamer.getResultingPosition(gamer.grid, i);
    let POINTS = points(gamer, result.grid, i); //OBJECT
    let p = POINTS.eq ;
    Values.push([POINTS.lg,POINTS.multip,POINTS.adjLoad,POINTS.shiftLoad, p])

    P.push(p)
  }
  //console.log(Values);

  // right now the values might be the same for the score, in which we will prefer left. 
  //eventually moves will very very rarely have the same value.
  let finVals = []
  //console.log("MOVES: " + moves)
  for (let _ = 0; _ < P.length; _++){
    if ( P[_] >= best){
      best = P[_]
      move =  moves[_]
      finVals = Values[_];
    }
  } 
  

  //console.log("POINTS for Each Move:" + P);
  //console.log("Values:" + finVals);
  //console.log("MOVE : "+ move);
  //console.log("\n")
  return {m: move, p: finVals};
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


const scorekeeper = function(iter) {
  let scores = [];
  let date = new Date();
  let sp = 100;
  let values = [];
  for(let i = 0 ; i <= iter; i++){
    if (!game.isGameTerminated()) {
      let sc = scoreboard();
      game.move(sc.m);
      values.push(sc.p);
      i = i - 1
    } else{
      scores.push(fourBest());
      game.restart();
    }
  }
  scores.unshift(getScoreMetrics(scores));
  scores.unshift(date);
  //scores.push(values);
  let csv = [];
  //POINTS.lg,POINTS.multip,POINTS.ld,POINTS.mt,POINTS.adjLoad,POINTS.lk,scrNext.sum
/* csv.push(["INDEX", "LG", "MTP", "ADJ", "SHFT", "SUM\n"].join())
  

  for (let val of values){
    let aval = val.join();
    csv.push(aval + "\n");
  
  }
*/
  //game.download("Data.csv", csv)
  game.download("Results.txt", JSON.stringify(scores));
  return scores;
};


const fourBest = function(){

let best = [];
let g = game.grid;
let largest = g.getMaxPos();
let occTiles = game.getOccupiedCells();
let compare = largest[0].value;

  while ( best.length < 4 ){
    for(let tile of occTiles){
      let i = tile.x;
      let j = tile.y;
      if(compare == g.cells[i][j].value){
        best.push(g.cells[i][j].value)
        if (best.length == 4){ 
          break; }
      }
    }
    compare /= 2
  }
  return best; 
}

const getScoreMetrics = function(arr){
let percentages = [];

arr.shift();
let cnt = 0;

let lowest = Math.min(...arr.map(subArray => subArray[0]));
let largest = Math.max(...arr.map(subArray => subArray[0]));

let compare = [];
for (let i = lowest; i <= largest; i *= 2){
  compare.push(i)
}


for(let i = 0 ; i < compare.length; i++){
  for(let j = 0; j < arr.length; j++){
    if(compare[i] == arr[j][0]){
      cnt++
    }
    if (j == arr.length - 1){
      percentages.push({Value: `${compare[i]}`, Percent: cnt / arr.length});
      cnt = 0;
    }
  }
}
return percentages;

}

