const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const balanceDisplay = document.getElementById('balance');
const livesDisplay = document.getElementById('lives');
const newGameButton = document.getElementById('newGameButton');
const gameOverMessage = document.getElementById('game-over');
const phaseInfo = document.getElementById('phase-info');
const startLevelButton = document.getElementById('startLevelButton');
const upgradeTowerButton = document.getElementById('upgradeTowerButton');

const gridSize = 20;
let selectedTowerType = null;
let gameRunning = false;
let buildingPhase = true;

const background = new Image();
background.src = 'images/background-neutral.png'; // Обновление пути к фону

background.onload = () => {
    initLevel(currentLevel);
    gameLoop();
};

canvas.addEventListener('mousemove', (event) => {
    if (selectedTowerType) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const gridX = Math.floor(x / gridSize) * gridSize;
        const gridY = Math.floor(y / gridSize) * gridSize;

        drawGame();
        drawPreviewTower(gridX, gridY);
    }
});

canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const gridX = Math.floor(x / gridSize) * gridSize;
    const gridY = Math.floor(y / gridSize) * gridSize;

    const clickedTower = towers.find(tower => tower.x === gridX && tower.y === gridY);

    if (clickedTower) {
        clickedTower.displayInfo();
    } else if (selectedTowerType && coins >= levels[currentLevel].towerCost && !isOnPath(gridX, gridY)) {
        towers.push(new Tower(gridX, gridY, selectedTowerType, selectedTowerType === 'circle' ? 'blue' : 'green'));
        coins -= levels[currentLevel].towerCost;
        selectedTowerType = null;
        updateBalanceDisplay();
    }
});

function selectTower(type) {
    selectedTowerType = type;
}

function startLevel() {
    gameRunning = true;
    buildingPhase = false;
    startLevelButton.style.display = 'none';
    upgradeTowerButton.style.display = 'none';
    phaseInfo.textContent = '';
}

function upgradeTower() {
    if (selectedTower && coins >= selectedTower.level * 10) {
        selectedTower.upgrade();
        coins -= selectedTower.level * 10;
        updateBalanceDisplay();
        selectedTower.displayInfo();
    }
}

function newGame() {
    currentLevel = 0;
    lives = 10;
    coins = levels[currentLevel].startingCoins;
    towers = [];
    enemies = [];
    gameRunning = false;
    buildingPhase = true;
    newGameButton.style.display = 'none';
    gameOverMessage.style.display = 'none';
    startLevelButton.style.display = 'inline-block';
    phaseInfo.textContent = 'Фаза строительства';
    initLevel(currentLevel);
    gameLoop();
}

function updateBalanceDisplay() {
    balanceDisplay.textContent = coins;
}

function updateLivesDisplay() {
    livesDisplay.textContent = lives;
}

function isOnPath(x, y) {
    // Проверка, находится ли точка на пути
    return path.some(point => Math.abs(point.x - x) < gridSize * 1.5 && Math.abs(point.y - y) < gridSize * 1.5);
}

function drawGrid() {
    for (let x = 0; x < canvas.width; x += gridSize) {
        for (let y = 0; y < canvas.height; y += gridSize) {
            if (isOnPath(x, y)) {
                ctx.fillStyle = 'lightgray';
            } else {
                ctx.fillStyle = 'white';
            }
            ctx.fillRect(x, y, gridSize, gridSize);
            ctx.strokeRect(x, y, gridSize, gridSize);
        }
    }
}

function drawPath() {
    ctx.strokeStyle = 'gray';
    ctx.lineWidth = 20; // Увеличим ширину линии для пути монстров
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
    }
    ctx.stroke();
    ctx.lineWidth = 1; // Вернем ширину линии обратно
}

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height); // Отображение фона
    drawGrid();
    drawPath();

    towers.forEach(tower => tower.draw());
    if (gameRunning) {
        enemies.forEach(enemy => enemy.draw());
    }
}

function drawPreviewTower(x, y) {
    if (selectedTowerType) {
        ctx.fillStyle = 'rgba(0, 0, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(0, 0, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(x, y, 100, 0, Math.PI * 2); // Используем начальный радиус 100
        ctx.stroke();
    }
}

function gameLoop() {
    drawGame();

    if (gameRunning) {
        towers.forEach(tower => {
            tower.attack(enemies);
        });

        enemies.forEach((enemy, index) => {
            if (enemy.health <= 0) {
                enemies.splice(index, 1);
                coins += levels[currentLevel].rewardPerKill;
                updateBalanceDisplay();
            } else if (enemy.pathIndex >= enemy.path.length) {
                // Enemy reached the end of the path
                lives--;
                updateLivesDisplay();
                enemies.splice(index, 1);
            } else {
                enemy.move();
                enemy.draw();
            }
        });

        if (lives <= 0) {
            gameRunning = false;
            gameOver();
        } else if (enemies.length === 0 && currentLevel < levels.length - 1) {
            gameRunning = false;
            buildingPhase = true;
            startLevelButton.style.display = 'inline-block';
            upgradeTowerButton.style.display = 'none';
            phaseInfo.textContent = 'Фаза строительства';
            currentLevel++;
            initLevel(currentLevel);
        } else if (enemies.length === 0 && currentLevel === levels.length - 1) {
            gameRunning = false;
            buildingPhase = true;
            startLevelButton.style.display = 'inline-block';
            phaseInfo.textContent = 'Вы победили! Начните новую игру!';
            showFireworks();
        }
    } else {
        towers.forEach(tower => tower.drawRange());
        enemies.forEach(enemy => enemy.draw());
    }

    requestAnimationFrame(gameLoop);
}

function gameOver() {
    gameOverMessage.style.display = 'block';
    newGameButton.style.display = 'block';
}

function showFireworks() {
    // Показать праздничный салют
    const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
    const fireworksInterval = setInterval(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < 10; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const radius = Math.random() * 50 + 20;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
            ctx.fill();
        }
    }, 500);
    setTimeout(() => clearInterval(fireworksInterval), 5000);
}

initLevel(currentLevel);
gameLoop();