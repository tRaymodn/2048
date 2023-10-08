// Wait till the browser is ready to render the game (avoids glitches)
let game;
window.requestAnimationFrame(function () {
  game = new GameManager(5, KeyboardInputManager, HTMLActuator, LocalStorageManager);
});

let interval;
let dir = 0;
let autoMoving = false;

document.getElementById('autoMove').addEventListener("click", () => {
  if(!autoMoving){
    interval = setInterval(() => {
       game.move(dir%4);
       dir++;
    }, 93);
    autoMoving = true;
  }
  else{
    clearInterval(interval)
    autoMoving = false;
  }
})