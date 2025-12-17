const game = document.getElementById("game");
const player = document.getElementById("player");
const startBtn = document.getElementById("startBtn");

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

const speed = 20;

recordEl.textContent = `Record: ${record}`;

/* =======================
   CONTROLS
======================= */

document.addEventListener("keydown", (e) => {
    if (!gameRunning) return;
    if (e.key === "ArrowLeft") moveLeft();
    if (e.key === "ArrowRight") moveRight();
    if (e.key === "ArrowUp") moveUp();
    if (e.key === "ArrowDown") moveDown();
});

game.addEventListener("touchstart", (e) => {
    if (!gameRunning) return;

    const touch = e.touches[0];
    const rect = game.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const w = rect.width;

    if (x < w / 2) {
        moveLeft();
    } else {
        moveRight();
    }
});

/* =======================
   MOVEMENT
======================= */

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
    
    const obsWidth = 40;
    const maxX = gameWidth - obsWidth;
    obs.style.left = Math.floor(Math.random() * maxX) + "px";
    game.appendChild(obs);

    let y = -40;
    const interval = setInterval(() => {
        if (!gameRunning) return;

        y += 4;
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
    }, 20);

    obstacleIntervals.push(interval);
}

/* =======================
   COLLISION
======================= */

function checkCollision(obs) {
    const p = player.getBoundingClientRect();
    const o = obs.getBoundingClientRect();

    return !(
        p.top > o.bottom ||
        p.bottom < o.top ||
        p.right < o.left ||
        p.left > o.right
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
    
    startBtn.textContent = "STOP";
    
    obstacleInterval = setInterval(createObstacle, 1200);
}

function stopGame() {
    gameRunning = false;

    clearInterval(obstacleInterval);
    obstacleInterval = null;

    obstacleIntervals.forEach(i => clearInterval(i));
    obstacleIntervals = [];

    document.querySelectorAll(".obstacle").forEach(o => o.remove());

    startBtn.textContent = "START";
}

function gameOver() {
    gameRunning = false;

    updateRecord();

    clearInterval(obstacleInterval);
    obstacleInterval = null;

    obstacleIntervals.forEach(i => clearInterval(i));
    obstacleIntervals = [];

    document.querySelectorAll(".obstacle").forEach(o => o.remove());

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

function updateRecord() {
    if (score > record) {
        record = score;
        localStorage.setItem("record", record);
        recordEl.textContent = `Record: ${record}`;
    }
}
