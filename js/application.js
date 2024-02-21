// Wait till the browser is ready to render the game (avoids glitches)
let game;
window.requestAnimationFrame(function () {
  game = new GameManager(4, KeyboardInputManager, HTMLActuator, LocalStorageManager, false);
});

let interval;
let dir = 0;
let autoMoving = false;
let sp = 500;
let currentColor = "rgb(255, 255, 255)";
let golTimeout;

window.onload = function() {
  let colorPickers = document.getElementsByClassName("colorChoice");
  for(const square of colorPickers){
    square.addEventListener("click", () =>{
      currentColor = square.style.backgroundColor;
      document.getElementById("currentColor").style.backgroundColor = currentColor;
    })
  }
}

document.getElementById("moveSpeedRange").addEventListener("change", (e) => {
  let speed = e.target.value;
  document.getElementById("moveSpeedLabel").innerHTML = `Speed: ${301-speed}`;
})

document.getElementById("startLife").addEventListener("click", async function(){
  if(!golTimeout && game.size < 9){
    document.getElementsByClassName("restart-button")[0].click();
    let moveTime = document.getElementById("moveSpeedRange").value;
    let board = makeColorBoardFromPicker();
    console.log(board.map)
    let golBoard = GOLTransform(board.map, board.mapping);
    let zeroRow = new Array(board.map.length).fill(0);
    let mapping;
    for(let row of golBoard){
      console.log(row, zeroRow);
      if(!arraysEqual(row, zeroRow)){
        mapping = {"rgb(0, 0, 0)": 0, "rgb(255, 255, 255)": 1};
        break;
      }
    }
    if(!mapping){ // if the user input an empty board
      mapping = {"rgb(0, 0, 0)": 0};
      game.makeImage(golBoard, mapping, moveTime); //TODO need to add error handling to the looping stuff with life.
      if(game.colorMappings.length > 0 && !game.colorsActive){ // color the tiles if they are not already
        game.colorMappings.forEach((mapping) => {
          game.actuator.changeTileClassColor(mapping.tile, mapping.color);
        })
        game.colorsActive = true;
      }
    }
    else{
      document.getElementById("loadingDiv").style.display = "block";
      document.getElementById("loader").style.display = "block";
      let moves = game.makeImage(golBoard, mapping, moveTime); //TODO need to add error handling to the looping stuff with life.
      if(!moves){
        document.getElementById("mappingTag").innerHTML = "Initial configuration cannot be made currently"
      }
      else{
        if(game.colorMappings.length > 0 && !game.colorsActive){ // color the tiles if they are not already
          game.colorMappings.forEach((mapping) => {
            game.actuator.changeTileClassColor(mapping.tile, mapping.color);
          })
          game.colorsActive = true;
        }
        let wrap = false;
        if(document.getElementById("lifeWrapButton").checked) wrap = true;
        GOLLoop(golBoard, moveTime, wrap, moves.length);
      }
    }
    
  }
  else{
    console.log("Game of Life already playing " + golTimeout);
  }
})

const arraysEqual = function(arr1, arr2){
  for(let i = 0; i < arr1.length; i++){
    if(arr1[i] !== arr2[i]) return false;
  }
  return true;
}

document.getElementById("stopLife").addEventListener("click", () =>{
  stopGOL(true);
})

const stopGOL = function(stopGame){
  clearTimeout(golTimeout);
  if(stopGame) game.stopImage();
  golTimeout = 0;
  console.log(golTimeout);
}

// send in a board that has been GOLTransformed
const GOLLoop = async function(board, time, wrap, numMoves){
  let inbetweenWaitTime = 2500;
  if(board.length > 6) inbetweenWaitTime = inbetweenWaitTime + 250*board.length;
  golTimeout = setTimeout(() => {
    game.restart();
    let newBoard;
    if(wrap) newBoard = wrapGOL(board);
    else newBoard = GOL(board);
    let mapping = {"rgb(0, 0, 0)": 0, "rgb(255, 255, 255)": 1};
    let zeros = new Array(newBoard.length).fill(0);
    let flag = false;
    let numEqual = 0;
    let numOnes = 0;
    for(let i = 0; i < newBoard.length; i++){
      if(!arraysEqual(newBoard[i], zeros)){
        flag = true;
      }

      if(arraysEqual(newBoard[i], board[i])){
        numEqual = numEqual + 1;
        if(numEqual === newBoard.length) flag = false;
      }
      for(let j = 0; j < newBoard[i].length; j++){
        if(newBoard[i][j] === 1) numOnes = numOnes + 1;
      }
    }
    let size = Math.pow(newBoard.length, 2);
    if(flag){
      let number = game.makeImage(newBoard, mapping, time);
      console.log(number)
      if(!number){ // the image cannot be made

      }
      GOLLoop(newBoard, time, wrap, number.length);
    }
    else if(numEqual === board.length){
      game.makeImage(newBoard, mapping, time);
      stopGOL(false);
    }
    else{
      game.makeImage(newBoard, {"rgb(0, 0, 0)": 0}, time);
      stopGOL(false);
    }
  }, time*numMoves + inbetweenWaitTime); // base time of number of moves and how long it takes to make each move
  // or I could find the average number of moves and do a little more than that
}

const GOLTransform = function(board, mapping){
  let zeroValue = -1;
  if(mapping["rgb(0, 0, 0)"] || mapping["rgb(0, 0, 0)"] == 0){
    zeroValue = mapping["rgb(0, 0, 0)"];
  }
  let newBoard = [];
  for(let row of board){
    let r = [];
    for(let val of row){
      if(val !== zeroValue) r.push(1);
      else r.push(0);
    }
    newBoard.push(r);
  }
  return newBoard;
}

function countAliveNeighbors(board, row, col) {
  // Count the number of alive cells around the given cell (row, col)
  let count = 0;
  const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
  ];

  for (const [dx, dy] of directions) {
      let newRow = row + dx;
      if(newRow < 0) newRow = (board.length+newRow)%board.length;
      else if(newRow > board.length-1) newRow = newRow%board.length;

      let newCol = col + dy;
      if(newCol < 0) newCol = (board.length+newCol)%board.length;
      else if(newCol > board.length-1) newCol = newCol%board.length;

      if (board[newRow][newCol] === 1) {
          count++;
      }
  }

  return count;
}

function wrapGOL(board) {
  const newBoard = [];

  for (let i = 0; i < board.length; i++) {
      const newRow = [];

      for (let j = 0; j < board[i].length; j++) {
          const aliveNeighbors = countAliveNeighbors(board, i, j);

          // Apply the rules of Conway's Game of Life
          if (board[i][j] === 1) {
              if (aliveNeighbors < 2 || aliveNeighbors > 3) {
                  newRow.push(0); // Cell dies due to underpopulation or overpopulation
              } else {
                  newRow.push(1); // Cell survives
              }
          } else {
              if (aliveNeighbors === 3) {
                  newRow.push(1); // Cell becomes alive due to reproduction
              } else {
                  newRow.push(0); // Cell remains dead
              }
          }
      }

      newBoard.push(newRow);
  }

  return newBoard;
}
// play life with colored 2048 boards
// makes 2048 boards to be the game of life
// assume it only takes in a board with ones and zeros on it (make function to transcribe boards from multi-color to monocolor)
// going to take in a board and return a new board based on which cells lived and died
const GOL = function(board){
  let newBoard = [];
  board.forEach((row) => {
    newBoard.push([...row]);
  })
  for(let i = 0; i < board.length; i++){
    for(let j = 0; j < board[i].length; j++){
      let aliveCells = 0;
      let firstFlag, lastFlag = false;
      if(i > 0){ // not in first row
        if(board[i-1][j] === 1) aliveCells = aliveCells+1;

        if(j > 0){ // not in first column
          if(board[i][j-1] === 1) aliveCells = aliveCells+1;
          
          if(board[i-1][j-1] === 1) aliveCells = aliveCells+1;
          firstFlag = true;
        }
        if(j < board.length -1){ // not in last column
          if(board[i][j+1] === 1) aliveCells = aliveCells+1;

          if(board[i-1][j+1] === 1) aliveCells = aliveCells+1;
          lastFlag = true;
        }
      }
      
      if(i < board.length-1){ // not in last row
        if(board[i+1][j] === 1) aliveCells = aliveCells+1;
        
        if(j > 0){ // not in first column
          if(board[i+1][j-1] === 1) aliveCells = aliveCells+1;

          if(!firstFlag){
            if(board[i][j-1] === 1) aliveCells = aliveCells+1;
          }
        }

        if(j < board.length -1){ // not in last column
          if(board[i+1][j+1] === 1) aliveCells = aliveCells+1;

          if(!lastFlag){
            if(board[i][j+1] === 1) aliveCells = aliveCells+1;
          }
        }
      }

      console.log(`${i},${j} alive cells: ${aliveCells}`);

      if(board[i][j] === 0){ // current cell is dead
        if(aliveCells === 3) newBoard[i][j] = 1;
      }
      else{ // current cell is alive
        if(aliveCells < 2 || aliveCells > 3) newBoard[i][j] = 0;
      }
    }
  }

  return newBoard;
}

const shift = function(board, direction, number){
  if(!number) number = 0;
  if(direction == 2){
    let last = board[board.length-1];
    for(let i = board.length -1; i >= 0; i--){
      if(i == 0){
        board[i] = last;
      }
      else{
        board[i] = board[i-1]
      }
    }
  }
  else if(direction == 0){
    let first = board[0];
    for(let i = 0; i < board.length; i++){
      if(i == board.length-1){
        board[i] = first;
      }
      else{
        board[i] = board[i+1];
      }
    }
  }
  else{
    for(const row of board){
      let first = row[0];
      let last = row[row.length-1];
      if(direction == 3){
        for(let i = 0; i < row.length; i++){
          if(i === row.length - 1){
            row[i] = first;
          }
          else{
            row[i] = row[i+1];
          }
        }
      }
      else if(direction == 1){
        for(let i = row.length-1; i >= 0; i--){
          if(i === 0){
            row[i] = last;
          }
          else{
            row[i] = row[i-1];
          }
        }
      }
    }
  }
  return board;
}

document.getElementById('makeImageButton').addEventListener("click", async function(){
  if(game.designer){
    game.colorsActive = true;
    let colorMap = makeColorBoardFromPicker();
    console.log(JSON.stringify(colorMap.map));
    let openLoad = new Promise((resolve, reject) => {
      document.getElementById("loadingDiv").style.display = "block";
      document.getElementById("loader").style.display = "block";
      resolve(true);
    })
    openLoad.then(() =>{
      setTimeout(() => {
        game.makeImage(colorMap.map, colorMap.mapping, document.getElementById("moveSpeedRange").value);
      },20);
    })
  }
  
})

document.getElementById('plus').addEventListener("click", () => {
  if(golTimeout){
    stopGOL(true);
  }
  if(game.designer){
    game.actuator.clearContainer(document.getElementById("colorPicker"));
    makeImagePickerBoard(Number(game.size) + 1);
  }
})

document.getElementById('minus').addEventListener("click", () => {
  if(golTimeout){
    stopGOL(true);
  }
  if(game.designer){
    game.actuator.clearContainer(document.getElementById("colorPicker"));
    makeImagePickerBoard(Math.max(Number(game.size) - 1, 2));
  }
})

document.getElementById('designerButton').addEventListener("click", () => {
  //game.removeGridRows('grid-row', game.size);
  //game = new GameManager(game.size, KeyboardInputManager, HTMLActuator, LocalStorageManager, true);
  if(!game.designer){
    if(game.size < 9){ // limit size
      game.grid.cells = game.grid.empty();
      game.actuator.clearContainer(game.actuator.tileContainer);
      game.designer = !game.designer;
      makeImagePickerBoard(game.size);
      document.getElementById("colorChangeDiv").style.display = "flex";
      document.getElementById("currentColorDiv").style.display = "block";
      document.getElementById("rightButtonsDiv").style.display = "flex";
      document.getElementById("makeImageButton").style.display = "block";
      document.getElementById("lifeButtons").style.display = "flex";
      console.log(game.size);
      let zeros = Array(Number(game.grid.size)).fill(0);
      // Fill in configurations and configDecomps in tileRows
      game.tileRows.evaluateState(zeros, []);
      document.getElementById("designerButton").innerHTML = "Close Designer";
    }
    
  }
  else{
    document.getElementById("colorChangeDiv").style.display = "none";
    document.getElementById("currentColorDiv").style.display = "none";
    document.getElementById("rightButtonsDiv").style.display = "none";
    document.getElementById("makeImageButton").style.display = "none";
    document.getElementById("lifeButtons").style.display = "none";
    document.getElementById("designerButton").innerHTML = "Open Designer";
    game.actuator.clearContainer(document.getElementById("colorPicker"));
    game.designer = !game.designer;
    game.setup();

  }
  //game.grid.insertTile({x: 0, y: 0, value: 2});
  //game.actuator.addTile({x: 0, y: 0, value: 2}, game.size);
})

document.getElementById("toggleColorTiles").addEventListener("click", () => {
  if(game.colorsActive){
    game.actuator.resetTileClassColors();
    game.colorsActive = false;
  }
  else if(game.colorMappings.length > 0){
    game.colorMappings.forEach((mapping) => {
      game.actuator.changeTileClassColor(mapping.tile, mapping.color);
    })
    game.colorsActive = true;
  }
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



  
  let scr = crystalBall();
  game.move(scr);
  //let M = crystalBall();
  //game.move(M);
  

  //console.log("R" , isLockedRow(game.grid, 0))

  //console.log("C", isLockedCol(game.grid, 0 ))

  
  
      
      futureHendrix(3, game.grid);
      console.log(futureList);
})

  // way to favor higher percentages to choose better values  
  document.getElementById('TEST').addEventListener("click",() =>{
  let test =  scorekeeper(5, 1,1,1,1,1,1,0);
  game.download("HSCORES.txt", JSON.stringify(test.scores[0]));
  });

document.getElementById('simulate').addEventListener("click",() =>{
  let someScores = []
  let highScores = []
  let values = [ 0, 1];
  //recursively improve
  let perms =  generatePerms(values, 6);   //[[1,1,1,1,1,1],[1,1,1,1,1,0],[1,1,1,1,0,1],[1,1,1,1,0,0]] 

  for(let perm of perms){
    let scr = scorekeeper(10, perm[0], perm[1],perm[2], perm[3], perm[4],perm[5]);
    someScores.push(scr.scores);
  }
  //console.log(JSON.stringify(someScores));
  
  for (let scr of someScores){
    
    let metrics  = scr[0];
     let date = scr[1];
     let weights = scr[2];
      let fourBest = scr[3];
     
     
     //console.log(values);
     for (let pObj of metrics){
      if ((parseInt(pObj.V) > 512)){
        highScores.push(weights, metrics);
        break;
      }
     }

  }

  //console.log(highScores);
  game.download("HIGHSCORES.txt", JSON.stringify(highScores));


  
})

document.getElementById('autoMove').addEventListener("click", () => {
  if(!autoMoving){
    interval = setInterval(() => {
      if (!game.movesAvailable()){
        clearInterval(interval)
        autoMoving = false;
      }else{
        let M = crystalBall();
      
      game.move(M);
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
/*
  TODO: 
 ///AVG VS SUM 
 // NOT MAKING MOVES THAT ARE DETRIMENTAL
 // MORE FUTURE STATES
 // VARY WEIGHTS
*/
const crystalBall = function (){
  let U = 0;
  let R = 0; 
  let D = 0;
  let L = 0;
  let shiftScoresU = [];
  let shiftScoresR = [];
  let shiftScoresD = [];
  let shiftScoresL = [];

  futureList = [];
  futureHendrix(2, game.grid , true , -1) 
  //console.log(futureList);
  
 for (let newGrid of futureList){
  let M = newGrid.move ;
  let spawned = newGrid.tile;
  let P = points( newGrid.grid, M, 1,1,1,1,1,1) // lg mono empty chain shift adj
  let aScr = P.eq;
  //console.log(spawned)

  switch (M){
    case 0:
      if (spawned == 2){
        U +=  (aScr * 0.9);
        shiftScoresU.push(P.numEmpty);
      } else {
        U += (aScr * 0.1);
        shiftScoresU.push(P.numEmpty);
      }
      break;
    case 1:
      if (spawned == 2){
        R+= (aScr * 0.9);
        shiftScoresR.push(P.numEmpty);
      } else {
        R += (aScr * 0.1);
        shiftScoresR.push(P.numEmpty);
      }
      break;
    case 2:
      if (spawned == 2){
        D += (aScr * 0.9 );
        shiftScoresD.push(P.numEmpty);
      } else {
        D += (aScr * 0.1) ;
        shiftScoresD.push(P.numEmpty);
      }
      break;

    case 3:

    if (spawned == 2){
      L+= (aScr * 0.9);
      shiftScoresL.push(P.numEmpty);
    } else {
      L+= (aScr * 0.1);
      shiftScoresL.push(P.numEmpty);
    }
      break;
  }
 }

 if(shiftScoresU.length <= 0){
  shiftScoresU.push(0)
 }
 if(shiftScoresR.length <= 0){
  shiftScoresR.push(0)
 }
 if(shiftScoresD.length <= 0){
  shiftScoresD.push(0)
 }
 if(shiftScoresL.length <= 0){
  shiftScoresL.push(0)
 }
 console.log(shiftScoresU,shiftScoresR,shiftScoresD,shiftScoresL )
 //console.log(U, R, D, L);
 let UorD = (U > D) ? { avg: U/shiftScoresU.length, dir: 0 } : { avg: D/ shiftScoresD.length, dir: 2 };
 let LorR = (L > R) ? { avg: L/shiftScoresL.length, dir: 3 } : { avg: R/shiftScoresR.length, dir: 1 };

 console.log( U/shiftScoresU.length,D/ shiftScoresD.length, L/shiftScoresL.length ,R/shiftScoresR.length);

/*
 if (sumU == sumD){
  let shiftSumU = shiftScoresU.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
  let shiftSumD = shiftScoresD.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
  UorD = (shiftSumU > shiftSumD) ?  { avg: sumU, dir: 0 } : { avg: sumD, dir: 2 };
  

 }
 if (sumL == sumR){
  let shiftSumL = shiftScoresL.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
  let shiftSumR = shiftScoresR.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
  LorR = (shiftSumL > shiftSumR) ?  { avg: sumL, dir: 3 } : { avg: sumR, dir: 1 };
  
 }
 */
 let final = (UorD.avg > LorR.avg) ? UorD.dir : LorR.dir;
console.log(final)

return final;
}


document.getElementById("colorPickerReset").addEventListener("click", () => {
  resetColorBoard();
})

const makeImagePickerBoard = function(size){
  for(let i = 0; i < size; i++){
    let row = document.createElement("div");
    row.setAttribute("class", "colorTileRow")
    for(let j = 0; j < size; j++){
      let tile = document.createElement("div")
      tile.setAttribute("class", "colorTile");
      tile.addEventListener("mouseover", (e) => {
        e.preventDefault();
        if(e.buttons === 1){
          changePickerTileColor(e.target);
        }
        else if(e.buttons === 2){
          changePickerTileBlack(e.target);
        }
      })
      tile.addEventListener("mousedown", (e) => {
        e.preventDefault();
        if(e.buttons === 1){
          changePickerTileColor(e.target);
        }
        else if(e.buttons === 2){
          changePickerTileBlack(e.target);
        }
      })
      tile.addEventListener("contextmenu", (e) => {
        e.preventDefault();
      })
      row.appendChild(tile);
    }
    document.getElementById("colorPicker").appendChild(row);
  }
}

const changePickerTileColor = function(htmlTile){
  let newColor;
  newColor = currentColor;
  htmlTile.setAttribute("style", `background-color: ${newColor}`);
}

const changePickerTileBlack = function(htmlTile){
  htmlTile.setAttribute("style", "background-color: black;");
}

const resetColorBoard = function(){
  let tiles = document.getElementsByClassName("colorTile");
  for(let t of tiles){
    t.style.backgroundColor = "rgb(0, 0, 0)";
  }
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

const getColReverse = function (g, c){
  let arr = []
  for (let i = g.size - 1; i >= 0; i--){
      arr.push(g.cells[c][i])
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
    let cnt = 0;
    let temp;
    for(let i = 0; i < arr.length  - 1; i++){
      if (arr[i] == null && arr[i + 1] == null){
        continue;
      }else if (arr[i] == null){
        if (temp){
          if (arr[i+1].value == temp.value){
            cnt++
          }
        }
        continue;

      }
      else if (arr[i+1] == null){
        if (!temp){
           temp = arr[i];
           continue;
        }
        if (arr[i]. value == temp.value){
            cnt++
            continue;
        }
      } else if (arr[i].value == arr[i+1].value){
        cnt++;
      }
    }
    return cnt;
  }

  //TODO: Make NULL TILES  NOT MATTER
  const getRowCons = function(r){
    let arr = [];
    for(let i = 0; i < r.length ; i++){
      if (r[i] != null){
        arr.push(r[i]);
      } else break;
    }
    return arr;
  }
  const getColCons = function(c){
    let arr = [];
    for(let i = 0; i < c.length ; i++){
      if (c[i] != null){
        arr.push(c[i]);
      }else break;
    }
    return arr;
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
      if (g.cells[i][j] != null){
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
let move;

const futureHendrix = function(times, grid, isFirst, firstMove){
  move = firstMove;
  if(times > 0){
    for(let i = 0; i < 4; i++){
      let result = getAllResults(grid, i);
      //console.log(`${i} is ${result.moved} a valid move, iteration:${times}`)
      if(result.moved){
        if (isFirst){
          move = i;
        }
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
                  futureList.push({move: move, grid: newerg2, tile: 2});
                }
                else{

                   
                  futureHendrix(times - 1, newerg2, false, move);
                  
                }
                break;
              case 1:
                let newerg4 = new Grid(grid.size, res);
                //console.log(newerg4)
                //console.log(res)
                let tile4 = new Tile({x: unnocupied[j].x, y: unnocupied[j].y}, 4);
                newerg4.insertTile(tile4);
                if(times === 1){
                  futureList.push({move: move, grid: newerg4 , tile: 4});
                }
                else{
                  futureHendrix(times - 1, newerg4, false, move);
                }
                break;
            }
          }
        }
      }
    }
  }
  return futureList;
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

const points = function( grid, dir , val1 ,val2 ,val3, val4, val5, val6,val7){
  //console.log(val1, val2, val3, val4, dir)
  let lg = 0; // largest in corner
  //let ld = 0; // loading tiles
  //let lk = 0; // locking row
  //let mt = 0; // maintain stucture
  let nextRowI;
  let nextColI;
  let nextVal = 0;
  let adjLoad = 0;
  let shiftLoad = 0;



  /*
  -LARGEST IN CORNER 
  */


  // get position of the largest tile in the next grid, if so save the value and the row , otherwise the value is zero and we use the first entry in the largest tiles array
  let currMax = game.grid.getMaxPos()[0];
  let nextPos = grid.getMaxPos()
  nextRowI = nextPos[0].y
  nextColI = nextPos[0].x;
  nextVal = 1 // TODO:
  for (let p of nextPos){
    if (isCorner(p.x, p.y) && p.value > currMax){
      nextVal = p.value * 2 ;
      nextRowI = p.y;
      nextColI = p.x
      break;
    }
    else if ( isCorner(p.x,p.y)){
      nextVal = p.value;
      nextRowI = p.y;
      nextColI = p.x
      break;
    }
  }

  /*
  EMPTY TILES
  */

  let occTiles = getOccupiedResults(grid, dir);
  let currOcc = getCurrentOccupiedTiles();
  let currEmpty = (Math.pow(game.grid.size, 2) - 1 - currOcc.length)
 let numEmpty = (Math.pow(grid.size , 2) - 1 -  occTiles.tiles.length);
 let merges = (numEmpty - currEmpty) ;




  /*
  CHAINING
  */ 

  // determine which index to start chaining from, then get the row in either normal order or reverse order for current grid
  let RR = false;
  let CR = false;

  if ( nextColI >= (grid.size - 1 ) / 2 ) RR = true;
  if ( nextRowI  >= (grid.size - 1 ) / 2) CR = true;
  

  // obtain chain metrics for comparison later 
  //let mono = assessMono(grid, RR, CR ,dir);
  let chain  = assessChain(grid, nextRowI, nextColI, RR, CR, dir);
  let mono = assessMono(grid, RR, CR, dir);

  let ourChain = (chain.mC > chain.mR) ?  chain.arrC : chain.arrR
  let chainScr = rowValue(ourChain) / ourChain.length;  //TODO: 
  let monoScr = mono.c + mono.r;





  //console.log(mono.c, mono.r)
  //console.log(chain.mR, chain.arrR, chain.mC, chain.arrC )

 // tiles

 /*
  LOADING TILES
*/

  // given that we have a chain present before and after a move we always want to consider both the average difference in the sum
  // and the differential between the counts of the chains as a negative value for either will be representative of the change of the board state
    let pos;
    let broken = [];
    for (let t of ourChain){
      pos = {x: t.x , y: t.y}
      broken.push(pos);
    }

    //let adjCurr = loadAdj(game.grid, currPositions)
    let adjNext = loadAdj(grid, broken )
    

    //want to create a method that will run until all tiles that are adjacent to other tiles havea score 
    // always have to move so look at next adj and calcualte score of adj tiles 
    let desAdj = [];

    while (broken.length < getOccupiedResults(grid, dir).tiles.length && adjNext.length > 0 ){
      adjNext = new Set(loadAdj(grid, broken))
      adjNext = [...adjNext]
      for (let tile of adjNext){
        let pos = {x: tile.x , y: tile.y}
        broken.push(pos);
      }
      desAdj.push(adjNext.map(item => item.value));

    }

    let nextScrs = [];
    
    //console.log(desAdj);
    if(desAdj.length > 0){
    for( let i = 0; i < desAdj.length; i++){
      for(let j = 0; j < desAdj[i].length; j++){
        desAdj[i][j] = (desAdj[i][j] * ((desAdj[i].length - j) / desAdj[i].length));
      }
      const sumNext = desAdj[i].reduce((accumulator, currentValue) => {
        return accumulator + currentValue;
      }, 0);
      //console.log("SUMfirst", sumNext, dir);
      

      nextScrs.push(sumNext  * ((desAdj.length - i) / desAdj.length ));

    }


    adjLoad = nextScrs.reduce((accumulator, currentValue) => {
      return accumulator + currentValue;
    }, 0);
     //console.log("SumNext" ,nextScrs, adjLoad , dir);

  }



/*
    if(adjCurr.length > 0 && adjNext.length > 0){
      sumFacCurr = rowValue(adjCurr) / adjCurr.length;
      sumFacNext = rowValue(adjNext) / adjNext.length;
      adjLoad = sumFacNext - sumFacCurr;
    }
    */
    

    //let nextSum = rowValue(nextChain);
    //let nextCount = countRow(nextChain);
    
    //console.log( "Current Chain", currChain);
    //console.log("Next Chain", nextChain);


   // let fac = nextSum - initSum ; 
    //let countDif =  nextCount - initCount ; 

    //console.log("FAC" , fac , "Dif" , countDif)

    // < --------------- need to prefer proper ordered chains over chains. (i.e [128, 64, 32, 16] VS. [128, 32, 8, 2]   )





  

  /*
  LOCKING ROW 


    

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

 

  let lockedNext = isLockedRow(grid, nextRowI);

  let shiftScores = []
  //ROW SLIDE Check columns
  if (dir == 1 || dir == 3 ){
    
    //determine direction to check 
    if( nextColI < grid.size / 2  ){
      for(let i = 0; i < grid.size - 1; i ++ ){
        let col = getCol(grid, i) ;
        shiftScores.push(getConsScr(col)) ; // TODO: 
      } 
    }else{
      for(let i = grid.size - 1; i >= 0; i-- ){
          let col = getCol(grid, i) ;
          shiftScores.push(getConsScr(col));
      } 
    }
  }else {
    if( nextRowI < grid.size / 2  ){
      for(let i = 0; i < grid.size - 1; i ++ ){
        let row = getRow(grid, i) ;
        shiftScores.push(getConsScr(row));
      } 
    }else{
      for(let i = grid.size-1; i >= 0; i-- ){
          let row = getRow(grid, i) ;
          shiftScores.push(getConsScr(row) );
      } 
    }
  }
  //console.log(shiftScores , dir);

    shiftLoad = shiftScores.reduce((accumulator, currentValue) => {
      return accumulator + currentValue;
    }, 0);


    
    //console.log("DIR" , dir); /// direction of move
    //console.log("CHAIN", ourChain); // starting at largest tile, and going towards row and column index with more space, tile muxt be 1/2 previous tile value 
    //console.log("MONO", monoScr); // number of rows and columns that are descending 
    //console.log("LG", nextVal); // largest value on the board, 1/2 if not in corner
    //console.log("EMPTY" , numEmpty )
    //console.log("ADJ", desAdj); // all tiles on board into heiarchy of closest to further adj tiles
    //console.log("SHIFT", shiftLoad); // number of tiles that are the same for all rows or columns
  //SCORES 
  //mt =  nextMultiplier - currMultiplier;
  lg =  nextVal;
  //ld = fac + countDif
  

  //console.log("Largest In Corner:" , lg , "Chain Structure", des, "\n" );
  //console.log("Chain Multiplier" , multiplier, "LOCK" , lk, "LOAD" ,ld, "Mainchain", mt , '\n');
  //console.log("direction" , dir);
  //console.log("Scores", nextScr , currScr)
 //console.log("Lg: ", lg , "Chain:" , chainScr , "Mono:" , monoScr  ,"adjLoad" , adjLoad, "Shift" ,shiftLoad , "EMPTY" , numEmpty)
  let eq =  (lg * val1) + (monoScr*val2 ) + (merges*val3) + (chainScr *val4 ) + (shiftLoad*val5 ) + (adjLoad *val6)  //+ ld + lk +  mt //(maybe unimportant)
  //console.log(eq);
  return {lg: lg , multip: chainScr , mono: monoScr, adjLoad: adjLoad  , shiftLoad: shiftLoad ,numEmpty: merges, eq: eq};
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

//MONOTONICITY
// go through every row/ col and add 1 to score if every tile in that row is non increasing (including just one tile)
// starting pos doesnt matter since all rows

const assessMono = function (grid, rr, cr, dir){
  let rowScr = 0;
  let colScr = 0; 

  for(let k = 0; k < grid.size; k++){
    //let dist = Math.abs(j - nextColI);
    let  r = getRow(grid, k);
    let c = getCol(grid, k);

    if (rr) r = getRowReverse(grid, k);
    if (cr) c = getColReverse(grid, k);
    

    let consR = getRowCons(r);
    let consC = getColCons(c);
    //console.log("ROW",consR);
    //console.log("COL",consC);
    
    for (let i = 0 ; i < consR.length - 1; i++){
      let next = consR[i + 1]
      let curr = consR[i];
      if (next.value <= curr.value){
        if (i == consR.length - 2){
          rowScr++;
        } else continue;
      } else break;;
    }
    //console.log("ROWSCR",rowScr++ , dir);
 

    for (let j = 0 ; j < consC.length - 1; j++){
      let next = consC[j + 1]
      let curr = consC[j];
      if (next.value <= curr.value){
        if (j == consC.length - 2){
          colScr++;
        } else continue;
      } else break;
    }
    //console.log("COLSCR",colScr++, dir);


    //determine if monotonic row / col
    // if monotionic add to score
    // if not go to next row
    //higher score for roes closer to maxtile row

  }
  return {r: rowScr, c: colScr};
}

const assessChain = function(grid, nextRowI, nextColI,  rr, cr , dir){

  //console.log("METRICS CHAIN", grid, r, rIndex, startIndex,  rr)
  let multiplierR = 1;
  let multiplierC = 1;
  let tempR = nextRowI;
  let tempC = nextColI;
  
  

  let r = getRow(grid, nextRowI);
  
  if (rr) r = getRowReverse(grid, nextRowI);
  let ColI = getRowMaxIndex(r);
  let arrR = [r[ColI]];


  for (let i = ColI; i < r.length - 1; i++){
    let next = r[i + 1]
    let curr = r[i];

    //console.log("RNC" ,r, next, curr, ColI , i, dir);

    if(next == null || curr == null) break;
    
    if ( next.value == curr.value || next.value == curr.value/2 ){
    arrR.push(next);
    multiplierR++;
    } else break;

    if (i == r.length - 2){
      if (nextRowI > (grid.size - 1 )/ 2){
        if(tempR != 0){
          tempR--;
        }else break;
      } else if (tempR != grid.size - 1){
        tempR++;
      }else break; 

      r = getRowReverse( grid , tempR)
      if (rr) r = getRow( grid , tempR )

      if(r[0] != null && (r[0].value  == next.value || r[0].value  == next.value / 2)){
        rr = !rr;
        i = -1; 
        arrR.push(r[0]);
        multiplierR++;
      } else break;
    }
  }

  let c = getCol(grid, nextColI);
  if (cr) c = getColReverse(grid, nextColI);
  let RowI = getRowMaxIndex(c);
  let arrC = [c[RowI]];

  for (let j = RowI; j < c.length - 1; j++){
    let next = c[j + 1]
    let curr = c[j];
    //console.log("CNC" ,c, next, curr, RowI, j,  dir);

    if(next == null || curr == null) break;
    
    if ( next.value == curr.value || next.value == curr.value/2 ){
    arrC.push(next);
    multiplierC++;
    } else break;

    if (j == c.length - 2){
      if (nextColI > (grid.size - 1) / 2 ){ // TODO:
        if (tempC != 0){
          tempC--;
        } else break;
      } else if (tempC != grid.size - 1){
        tempC++
      }else break;
      //console.log(tempC , nextColI,  dir);

      c = getColReverse( grid , tempC)
      if (cr) c = getCol( grid , tempC )

      if(c[0] != null && (c[0].value  == next.value || c[0].value  == next.value /2 )){
        cr = !cr;
        j = -1; 
        arrC.push(c[0]);
        multiplierC++;
      } else break;
    }
  }
  return {mR: multiplierR , arrR: arrR, mC: multiplierC, arrC: arrC};
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


const scoreboard = function(val1 ,val2 ,val3, val4, val5, val6,val7){
  let moves = getValidMoves()
  let P = []
  let best = Number.NEGATIVE_INFINITY
  let move;
  let Values = [];

  for (let i of moves){
    //Values = [];
    let result = game.getResultingPosition(game.grid, i);
    
    let POINTS = points(result.grid, i , val1 ,val2 ,val3, val4, val5, val6, val7); //OBJECT
    let p = POINTS.eq ;
    Values.push([POINTS.lg,POINTS.multip, POINTS.mono, POINTS.adjLoad,POINTS.shiftLoad, POINTS.numEmpty, p])

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


const scorekeeper = function(iter, val1 ,val2 ,val3, val4, val5, val6 ,val7) {
  let scores = [];
  let date = new Date();
  let sp = 100;
  let values = [];
  let best = []
  for(let i = 0 ; i <= iter; i++){
    if (!game.isGameTerminated()) {
      let m = crystalBall();
      game.move(m);
      //values.push(sc.p);
      i = i - 1
    } else{
      best.push(fourBest());
      game.restart();
    }
  }


  scores.push(getScoreMetrics(best));
  scores.push(date);
  scores.push([val1 ,val2 ,val3, val4, val5, val6,val7] , best);


  let csv = [];
  //POINTS.lg,POINTS.multip,POINTS.ld,POINTS.mt,POINTS.adjLoad,POINTS.lk,scrNext.sum
 csv.push(["INDEX", "LG", "MTP", "MONO", "ADJ", "SHFT","EMPTY", "SUM\n"].join())
  

  for (let val of values){
    let aval = val.join();
    csv.push(aval + "\n");
  
  }

  //game.download("CSVs.csv", csv)
  //game.download("resultant.txt", JSON.stringify(scores));
  
  return {scores: scores, csv: csv};
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
      percentages.push({V: `${compare[i]}`, P: cnt / arr.length});
      cnt = 0;
    }
  }
}
return percentages;

}

//[0.25, 0.5, 1, 2, 4]
//GPT
const generatePerms = function(values, length){
  if (length === 0) return [[]];
  let result = []
  for(let i = 0; i < values.length; i++){
    let current = values[i];
    let perms = generatePerms(values, length - 1);
    for (let perm of perms){
      result.push([current, ...perm]);
    }
  }
return result;

}
