// Canvas
const { body } = document;
const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');
const width = 600;
const height = 550;
const screenWidth = window.screen.width;
const canvasPosition = screenWidth / 2 - width / 2;
const isMobile = window.matchMedia('(max-width: 600px)');
const gameOverEl = document.createElement('div');

// Paddle
const paddleHeight = 10;
const paddleWidth = 50;
const paddleDiff = 25;
let paddleBottomX = 225;
let paddleTopX = 225;
let playerMoved = false;
let paddleContact = false;

// Ball
let ballX = 250;
let ballY = 350;
const ballRadius = 5;

// Speed
let speedY;
let speedX;
let trajectoryX;
let computerSpeed;

// Change mobile settings
if (isMobile.matches) {
  speedY = -2;
  speedX = speedY;
  computerSpeed = 4;
} else {
  speedY = -1;
  speedX = speedY;
  computerSpeed = 3;
}

// Score
let playerScore = 0;
let computerScore = 0;
const winningScore = 7;
let isGameOver = true;
let isNewGame = true;

// Render Everything on Canvas
function renderCanvas() {
  // Canvas Background
  context.fillStyle = 'black';
  context.fillRect(0, 0, width, height);

  // Paddle Color
  context.fillStyle = 'pink';

  // Player Padle (bottom)
  context.fillRect(paddleBottomX, height -20, paddleWidth, paddleHeight);

  // Computer paddle (TOp)
  context.fillRect(paddleTopX, 10, paddleWidth, paddleHeight);

  // Dashed Center Line
  context.beginPath();
  context.setLineDash([7]);
  context.moveTo(0, 285);
  context.lineTo(600, 285);
  context.strokeStyle = 'orange';
  context.stroke();

// Ball
context.beginPath();
context.arc(ballX, ballY, ballRadius, 2 * Math.PI, false);
context.fillStyle = 'purple';
context.fill();

// Score
context.font = '32px Courier New';
context.fillText(playerScore, 20, canvas.height / 2 + 50);
context.fillText(computerScore, 20, canvas.height / 2 - 30);
}

// Create Canvas Element
function createCanvas() {
  canvas.width = width;
  canvas.height = height;
  body.appendChild(canvas);
  renderCanvas();
}

// Reset Ball to center
function ballReset() {
  ballX = width / 2;
  ballY = height / 2;
  speedY = -3;
  paddleContact = false;
}

// Adjust ball movement
function ballMove() {
  // Vertical spedd
  ballY += -speedY;
  // Horizontal speed
  if (playerMoved && paddleContact) {
    ballX += speedX
  }
}

// Determine what ball bounces off, score oints, reset ball
function ballBoundaries() {
  // Bounce of the left wall
  if (ballX < 0 && speedX < 0) {
    speedX = -speedX;
  }
  // Bounce of Right wall
  if (ballX > width && speedX > 0) {
    speedX = -speedX;
  }
  //   Bounce off paddle player (bottom)
  if (ballY > height - paddleDiff) {
    if (ballX > paddleBottomX && ballX < paddleBottomX + paddleWidth) {
      paddleContact = true;
      // Add speed on Hit
      if (playerMoved) {
        speedY -+ 1;
        // Max speed
        if (speedY < -5) {
          speedY = -5;
          computerSpeed = 6;
        }
      }
      speedY = -speedY;
      trajectoryX = ballX - (paddleBottomX + paddleDiff);
      speedX = trajectoryX * 0.3;
    } else if (ballY > height) {
      // Reset Ball, add to computer Score
      ballReset();
      computerScore++;
    }
  }
  // Bounce off computer paddle (Top)
  if (ballY < paddleDiff) {
    if (ballX > paddleTopX && ballX < paddleTopX + paddleWidth) {
      // Add speed on HIT
      if (playerMoved) {
        speedY += 1;
        // Max Speed
        if (speedY > 5) {
          speedY = 5;
        }
      }
      speedY = -speedY;
    } else if (ballY < 0) {
      // reset Ball, add to player score
      ballReset();
      playerScore++;
    }
  }
}

// Computer Movement
function computerAI() {
  if (playerMoved) {
    if (paddleTopX + paddleDiff < ballX) {
      paddleTopX += computerSpeed;
    } else {
      paddleTopX -= computerSpeed;
    }
  }
}

function showGameOverEl(winner) {
  // Hide Canvas
  canvas.hidden = true;
  // Container
  gameOverEl.textContent = '';
  gameOverEl.classList.add('game-over-container');
  // Title
  const title = document.createElement('h1');
  title.textContent = `${winner} Wins!`;
  // Button
  const playAgainBtn = document.createElement('button');
  playAgainBtn.setAttribute('onclick', 'startGame()');
  playAgainBtn.textContent = 'Play Again';
  // Append
  gameOverEl.append(title, playAgainBtn);
  body.appendChild(gameOverEl);
}

// Check if one player has the winning score, if they do, end game
function gameOver() {
  if (playerScore === winningScore || computerScore === winningScore) {
    isGameOver = true;
    // Set Winner
    const winner = playerScore === winningScore ? 'Player 1' : 'Computer';
    showGameOverEl(winner);
  }
}

// Called Every frame
function animate() {
  renderCanvas();
  ballMove();
  ballBoundaries();
  computerAI();
  gameOver();
  if (!isGameOver) {
    window.requestAnimationFrame(animate);
  }
}

// Start Game, Reset Everything
function startGame() {
  if (isGameOver && !isNewGame) {
    body.removeChild(gameOverEl);
    canvas.hidden = false;
  }
  isGameOver = false;
  isNewGame = false;
  playerScore = 0;
  computerScore = 0;
  ballReset();
  createCanvas();
  animate();
  canvas.addEventListener('mousemove', (e) => {
    playerMoved = true;
    // Compensate for canvas being centered
    paddleBottomX = e.clientX - canvasPosition - paddleDiff;
    if (paddleBottomX < paddleDiff) {
      paddleBottomX = 0;
    }
    if (paddleBottomX > width - paddleWidth) {
      paddleBottomX = width - paddleWidth;
    }
    // Hide Cursor
    canvas.style.cursor = 'none';
  });
}

// On Load
startGame();