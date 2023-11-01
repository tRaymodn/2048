// Wait till the browser is ready to render the game (avoids glitches)
let game;
window.requestAnimationFrame(function () {
  game = new GameManager(4, KeyboardInputManager, HTMLActuator, LocalStorageManager);
});

let interval;
let dir = 0;
let autoMoving = false;

document.getElementById('autoMove').addEventListener("click", () => {
  
  if(!autoMoving){
    interval = setInterval(() => {
      let move = keepLargestInCorner();
      game.move(move);
      let state = game.getBoardState();
      console.log(state);
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

const keepLargestInCorner = function(){
  let cornerMoves = [];
  let borderMoves = []; 
  let move;
  let g = game.grid;
  let currMax = 0;
  let maxList = [];
  let dir;
  for(let i = 0; i < 4; i++){
    let maxTiles = [];
    let tiles = [];
    result = game.getResultingPosition(g, i);
    //console.log("result: " + JSON.stringify(result.grid.cells))

    for(let j = 0; j < result.grid.cells.length; j++){
      for(let k = 0; k < result.grid.cells[j].length; k++){
        if(result.grid.cells[j][k] !== null){
          tiles.push(result.grid.cells[j][k]);
        }
      }
    }

    maxTiles = game.getLargestCell(tiles);
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

    console.log("MaxTiles: " + JSON.stringify(maxTiles),"Direction: " +  i);
  }

  for(tile of maxList){
    console.log(tile);
     let x = tile.maxTile.x;
    let y = tile.maxTile.y;
    if (isCorner(x,y)  && tile.maxTile.value == maxList[0].maxTile.value){
      cornerMoves.push(tile.direction);
    }
    else if (isBorder(x,y) && tile.maxTile.value == maxList[0].maxTile.value ){
      borderMoves.push(tile.direction);
    }
  }

  console.log(`CornerMoves: ${cornerMoves}`);
  console.log(`BorderMoves: ${borderMoves}`);
    let cmL = cornerMoves.length;
    let bmL = borderMoves.length;

    if (cmL == 0){
      if (bmL == 0){
        console.log("MOSTEMPTY")
        move = getMoveMostEmpty();
      }
      else{
        move = borderMoves[0];
      }
    }

    if (cmL > 0){
      move = cornerMoves[0];
    }
    return move;
  }

const getMoveMostEmpty = function(){
  let numTiles = []
  let g = game.grid;
  for(let i = 0; i < 4; i++){
    let thisTiles = 0;
    result = game.getResultingPosition(g, i);
    console.log("result: " + JSON.stringify(result.grid.cells))
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
  console.log("best move:" + m)
  return m
}