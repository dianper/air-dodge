const game = document.getElementById("game");
const player = document.getElementById("player");
const startBtn = document.getElementById("startBtn");
const splash = document.getElementById("splash");
const playBtn = document.getElementById("playBtn");
const scoreEl = document.getElementById("score");
const recordEl = document.getElementById("record");

let gameRunning = false;
let obstacleInterval = null;
let obstacleIntervals = [];
let score = 0;
let record = localStorage.getItem("record") || 0;

let gameWidth, gameHeight;
let playerWidth, playerHeight;
let MAX_X, MAX_Y;

let playerX = (gameWidth - playerWidth) / 2;
let playerY = 0;
let startX, startY;

recordEl.textContent = `Record: ${record}`;

/* =======================
   CONTROLS
======================= */

let movingLeft = false;
let movingRight = false;
let movingUp = false;
let movingDown = false;

function gameLoop() {
    if (!gameRunning) return;

    if (movingLeft) moveLeft();
    if (movingRight) moveRight();
    if (movingUp) moveUp();
    if (movingDown) moveDown();

    requestAnimationFrame(gameLoop);
}

// Start the game loop
requestAnimationFrame(gameLoop);

// keyboard
document.addEventListener("keydown", (e) => {
    if (!gameRunning) return;

    if (e.key === "ArrowLeft") movingLeft = true;
    if (e.key === "ArrowRight") movingRight = true;
    if (e.key === "ArrowUp") movingUp = true;
    if (e.key === "ArrowDown") movingDown = true;
});

document.addEventListener("keyup", (e) => {
    if (!gameRunning) return;

    if (e.key === "ArrowLeft") movingLeft = false;
    if (e.key === "ArrowRight") movingRight = false;
    if (e.key === "ArrowUp") movingUp = false;
    if (e.key === "ArrowDown") movingDown = false;
});

// Touch
game.addEventListener("touchstart", (e) => {
    if (!gameRunning) return;
    e.preventDefault();

    const touch = e.touches[0];
    const rect = game.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;
    const touchY = touch.clientY - rect.top;

    const playerRect = player.getBoundingClientRect();
    const playerCenterX = playerRect.left + playerRect.width / 2 - rect.left;
    const playerCenterY = playerRect.top + playerRect.height / 2 - rect.top;

    movingLeft = touchX < playerCenterX;
    movingRight = touchX > playerCenterX;
    movingUp = touchY < playerCenterY;
    movingDown = touchY > playerCenterY;
});

game.addEventListener("touchend", (e) => {
    e.preventDefault();
    movingLeft = movingRight = movingUp = movingDown = false;
});

/* =======================
   MOVEMENT
======================= */

const speed = 4;

function moveLeft() {
    playerX = Math.max(0, playerX - speed);
    player.style.left = playerX + "px";
}

function moveRight() {
    playerX = Math.min(MAX_X, playerX + speed);
    player.style.left = playerX + "px";
}

function moveUp() {
    playerY = Math.max(0, playerY - speed);
    player.style.top = playerY + "px";
}

function moveDown() {
    playerY = Math.min(MAX_Y, playerY + speed);
    player.style.top = playerY + "px";
}

/* =======================
   OBSTACLES
======================= */

function createObstacle() {
    if (!gameRunning) return;

    const obs = document.createElement("div");
    obs.classList.add("obstacle");
    
    const obsWidth = 64;
    const maxX = gameWidth - obsWidth;
    obs.style.left = Math.floor(Math.random() * maxX) + "px";
    
    const spinDuration = Math.random() * 3 + 2; // 2s to 5s
    const spinDirection = Math.random() > 0.5 ? "normal" : "reverse";

    obs.style.animationDuration = `${spinDuration}s`;
    obs.style.animationDirection = spinDirection;
    game.appendChild(obs);

    let y = -64;
    const interval = setInterval(() => {
        if (!gameRunning) return;

        y += 5;
        obs.style.top = y + "px";

        if (checkCollision(obs)) {
            gameOver();
        }

        if (y > gameHeight) {
            clearInterval(interval);
            obstacleIntervals = obstacleIntervals.filter(i => i !== interval);
            obs.remove();

            if (gameRunning) {
                score++;
                scoreEl.textContent = `Score: ${score}`;
            }
        }
    }, 25);

    obstacleIntervals.push(interval);
}

/* =======================
   COLLISION
======================= */

function checkCollision(obs) {
    const p = player.getBoundingClientRect();
    const o = obs.getBoundingClientRect();

    const padding = 12;

    const pHit = {
        top: p.top + padding,
        bottom: p.bottom - padding,
        left: p.left + padding,
        right: p.right - padding
    };

    const oHit = {
        top: o.top + padding,
        bottom: o.bottom - padding,
        left: o.left + padding,
        right: o.right - padding
    };

    return !(
        pHit.top > oHit.bottom ||
        pHit.bottom < oHit.top ||
        pHit.right < oHit.left ||
        pHit.left > oHit.right
    );
}

/* =======================
   GAME FLOW
======================= */

window.addEventListener("load", () => {
    resetGame(); 
});

startBtn.addEventListener("click", () => {
    if (!gameRunning) {
        startGame();
    } else {
        stopGame();
    }
});

function startGame() {
    resetGame();

    score = 0;
    
    scoreEl.textContent = "Score: 0";
    
    gameRunning = true;

    requestAnimationFrame(gameLoop);
    
    startBtn.textContent = "STOP";
    
    obstacleInterval = setInterval(createObstacle, 1500);
}

function stopGame() {
    gameRunning = false;

    updateRecord();

    resetObstacles();

    startBtn.textContent = "START";
}

function gameOver() {
    gameRunning = false;

    updateRecord();

    resetObstacles();

    startBtn.textContent = "RESTART";

    alert(`Game Over!\nScore: ${score}`);
}

function resetGame() {
    gameWidth = game.clientWidth;
    gameHeight = game.clientHeight;

    playerWidth = player.clientWidth;
    playerHeight = player.clientHeight;

    MAX_X = gameWidth - playerWidth;
    MAX_Y = gameHeight - playerHeight;

    playerX = (gameWidth - playerWidth) / 2;
    playerY = gameHeight - playerHeight - 12;

    player.style.left = playerX + "px";;
    player.style.top = playerY + "px";

    document.querySelectorAll(".obstacle").forEach(o => o.remove());
}

function resetObstacles() {
    clearInterval(obstacleInterval);
    obstacleInterval = null;

    obstacleIntervals.forEach(i => clearInterval(i));
    obstacleIntervals = [];

    document.querySelectorAll(".obstacle").forEach(o => o.remove());
}

function updateRecord() {
    if (score > record) {
        record = score;
        localStorage.setItem("record", record);
        recordEl.textContent = `Record: ${record}`;
    }
}

/* =======================
   SERVICE WORKER
======================= */

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((reg) => console.log('Service Worker registered', reg))
      .catch((err) => console.log('Service Worker failed', err));
  });
}

// Splash → Game
playBtn.addEventListener("click", () => {
    splash.style.opacity = "0";
    splash.style.pointerEvents = "none";

    document.querySelector(".app").style.visibility = "visible";

    setTimeout(() => {
        splash.style.display = "none";
    }, 400);
});
