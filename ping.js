const gameBoard = document.querySelector("#gameBoard");
const ctx = gameBoard.getContext("2d");
const scoreText = document.querySelector("#scoreText");
const timerText = document.querySelector("#timer");
const winText = document.querySelector("#winText");
const reactRoot = document.querySelector("#reactRoot");
const resetBtn = document.querySelector("#resetBtn");
const startBtn = document.querySelector("#startBtn"); // Add a start button in your HTML
const instructionsPopup = document.querySelector("#instructionsPopup"); // Add a popup in your HTML
const gameWidth = gameBoard.width;
const gameHeight = gameBoard.height;

const colors = {
  board: "#f9f9f9",
  paddle1: "lightblue",
  paddle2: "red",
  border: "black",
  ball: "yellow",
  ballBorder: "black"
};

const ballRadius = 12.5;
const paddleSpeed = 50;
const maxBallSpeed = 10;
const gameDuration = 60; // seconds

let ballSpeed = 3;
let ballX = gameWidth / 2;
let ballY = gameHeight / 2;
let ballXDirection = 1;
let ballYDirection = 1;

let player1Score = 0;
let player2Score = 0;

let paddle1 = { width: 25, height: 100, x: 0, y: 0 };
let paddle2 = { width: 25, height: 100, x: gameWidth - 25, y: gameHeight - 100 };

let animationId = null;
let timerId;
let timeRemaining = gameDuration;
const winSound = new Audio("gamewin.wav");
const touchSound = new Audio("gametouch.mp4"); // Add a sound for ball touch

window.addEventListener("keydown", changeDirection);
resetBtn.addEventListener("click", resetGame);
startBtn.addEventListener("click", startGame);
window.onload = showInstructions;

function gameStart() {
  reactRoot.innerHTML = ""; // Clear winner message at the start of a new game
  resetBall();
  updateTimerText();
  timerId = setInterval(updateTimer, 1000);
  animationId = requestAnimationFrame(gameLoop);
}

function updateTimer() {
  timeRemaining--;
  updateTimerText();
  if (timeRemaining <= 0) {
    clearInterval(timerId);
    endGame();
  }
}

function updateTimerText() {
  const minutes = String(Math.floor(timeRemaining / 60)).padStart(2, '0');
  const seconds = String(timeRemaining % 60).padStart(2, '0');
  timerText.textContent = `${minutes}:${seconds}`;
}

function gameLoop() {
  clearBoard();
  drawPaddles();
  moveBall();
  drawBall(ballX, ballY);
  checkCollision();
  animationId = requestAnimationFrame(gameLoop);
}

function clearBoard() {
  ctx.fillStyle = colors.board;
  ctx.fillRect(0, 0, gameWidth, gameHeight);
  ctx.setLineDash([5, 15]);
  ctx.strokeStyle = colors.border;
  ctx.beginPath();
  ctx.moveTo(gameWidth / 2, 0);
  ctx.lineTo(gameWidth / 2, gameHeight);
  ctx.stroke();
}

function drawPaddles() {
  // Paddle 1
  ctx.fillStyle = ctx.createLinearGradient(0, paddle1.y, paddle1.width, paddle1.y + paddle1.height);
  ctx.fillStyle.addColorStop(0, "#00f");
  ctx.fillStyle.addColorStop(1, "#0ff");
  ctx.fillRect(paddle1.x, paddle1.y, paddle1.width, paddle1.height);

  // Paddle 2
  ctx.fillStyle = ctx.createLinearGradient(0, paddle2.y, paddle2.width, paddle2.y + paddle2.height);
  ctx.fillStyle.addColorStop(0, "#f00");
  ctx.fillStyle.addColorStop(1, "#f90");
  ctx.fillRect(paddle2.x, paddle2.y, paddle2.width, paddle2.height);
}

function resetBall() {
  ballSpeed = 3;
  ballXDirection = Math.random() > 0.5 ? 1 : -1;
  ballYDirection = (Math.random() * 2 - 1);
  ballX = gameWidth / 2;
  ballY = gameHeight / 2;
}

function moveBall() {
  ballX += ballSpeed * ballXDirection;
  ballY += ballSpeed * ballYDirection;
}

function drawBall(x, y) {
  ctx.fillStyle = ctx.createRadialGradient(x, y, 0, x, y, ballRadius);
  ctx.fillStyle.addColorStop(0, "#fff");
  ctx.fillStyle.addColorStop(1, "#ff0");
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  ctx.fill();
}

function checkCollision() {
  // Ball collision with top or bottom wall
  if (ballY <= ballRadius || ballY >= gameHeight - ballRadius) {
    ballYDirection *= -1;
  }

  // Ball collision with paddle1
  if (ballX <= paddle1.x + paddle1.width + ballRadius &&
      ballY >= paddle1.y && ballY <= paddle1.y + paddle1.height) {
    ballXDirection = 1;
    ballSpeed = Math.min(ballSpeed + 0.5, maxBallSpeed);
    touchSound.play(); // Play touch sound for paddle1
  }

  // Ball collision with paddle2
  if (ballX >= paddle2.x - ballRadius &&
      ballY >= paddle2.y && ballY <= paddle2.y + paddle2.height) {
    ballXDirection = -1;
    ballSpeed = Math.min(ballSpeed + 0.5, maxBallSpeed);
    touchSound.play(); // Play touch sound for paddle2
  }

  // Ball goes out of bounds (left or right)
  if (ballX <= 0) {
    player2Score++;
    updateScore();
    resetBall();
  }

  if (ballX >= gameWidth) {
    player1Score++;
    updateScore();
    resetBall();
  }
}

function changeDirection(e) {
  switch (e.keyCode) {
    case 87:
      if (paddle1.y > 0) paddle1.y -= paddleSpeed;
      break;
    case 83:
      if (paddle1.y < gameHeight - paddle1.height) paddle1.y += paddleSpeed;
      break;
    case 38:
      if (paddle2.y > 0) paddle2.y -= paddleSpeed;
      break;
    case 40:
      if (paddle2.y < gameHeight - paddle2.height) paddle2.y += paddleSpeed;
      break;
  }
}

function updateScore() {
  scoreText.textContent = `${player1Score} : ${player2Score}`;
}

function endGame() {
  cancelAnimationFrame(animationId);
  winSound.play();
  const winnerMessage = player1Score > player2Score
    ? "⏱ Time's Up! Player 1 Wins!"
    : player2Score > player1Score
      ? "⏱ Time's Up! Player 2 Wins!"
      : "⏱ Time's Up! It's a Draw!";
  console.log("Winner:", winnerMessage); // Debug line
  ReactDOM.render(
    React.createElement('h2', { style: { color: 'darkgreen' } }, winnerMessage),
    reactRoot
  );
}

function resetGame() {
  player1Score = 0;
  player2Score = 0;
  updateScore();
  // Do NOT clear reactRoot.innerHTML here
  timeRemaining = gameDuration;
  paddle1.y = 0;
  paddle2.y = gameHeight - paddle2.height;
  cancelAnimationFrame(animationId);
  clearInterval(timerId);
  gameStart();
}

function startGame() {
  instructionsPopup.style.display = "none"; // Hide the popup
  startBtn.style.display = "none"; // Hide the start button
  gameStart(); // Start the game
}

function showInstructions() {
  instructionsPopup.style.display = "block"; // Show the popup
  startBtn.style.display = "block"; // Show the start button
}
