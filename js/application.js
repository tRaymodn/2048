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