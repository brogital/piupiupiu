// game.js

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
    } else if (selectedTowerType && coins >= stories[currentStory].levels[currentLevel].towerCost && !isOnPath(gridX, gridY)) {
        towers.push(new Tower(selectedTowerType, gridX, gridY));
        coins -= stories[currentStory].levels[currentLevel].towerCost;
        selectedTowerType = null;
        updateBalanceDisplay();
    }
});

function upgradeTower() {
    if (selectedTower && coins >= selectedTower.level * 10) {
        console.log('Upgrading tower');
        selectedTower.upgrade();
        coins -= selectedTower.level * 10;
        updateBalanceDisplay();
        selectedTower.displayInfo();
    }
}

function updateBalanceDisplay() {
    balanceDisplay.textContent = coins;
    console.log('Balance updated:', coins);
}

function updateLivesDisplay() {
    livesDisplay.textContent = lives;
    console.log('Lives updated:', lives);
}

function isOnPath(x, y) {
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
    ctx.lineWidth = 20;
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
    }
    ctx.stroke();
    ctx.lineWidth = 1;
}

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
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
        ctx.arc(x, y, 100, 0, Math.PI * 2);
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
                coins += stories[currentStory].levels[currentLevel].rewardPerKill;
                updateBalanceDisplay();
            } else if (enemy.pathIndex >= path.length) {
                lives--;
                updateLivesDisplay();
                enemies.splice(index, 1);
            } else {
                enemy.move(path);
                enemy.draw();
            }
        });

        if (lives <= 0) {
            gameRunning = false;
            gameOver();
        } else if (enemies.length === 0 && currentLevel < stories[currentStory].levels.length - 1) {
            gameRunning = false;
            buildingPhase = true;
            startLevelButton.style.display = 'inline-block';
            upgradeTowerButton.style.display = 'none';
            phaseInfo.textContent = 'Building phase';
            currentLevel++;
            initLevel(currentLevel);
        } else if (enemies.length === 0 && currentLevel === stories[currentStory].levels.length - 1) {
            gameRunning = false;
            buildingPhase = true;
            startLevelButton.style.display = 'inline-block';
            phaseInfo.textContent = 'You won! Start a new game!';
        }
    } else {
        towers.forEach(tower => tower.drawRange());
        enemies.forEach(enemy => enemy.draw());
    }

    requestAnimationFrame(gameLoop);
}

function gameOver() {
    console.log('Game over');
    gameOverMessage.style.display = 'block';
    newGameButton.style.display = 'block';
}

function spawnEnemies() {
    const level = stories[currentStory].levels[currentLevel];
    level.enemies.forEach((enemy, index) => {
        setTimeout(() => {
            for (let i = 0; i < enemy.quantity; i++) {
                enemies.push(new Enemy(enemy.id, path[0].x, path[0].y));
            }
        }, index * 1000);
    });
}

function initStory(storyIndex) {
    currentStory = storyIndex;
    currentLevel = 0;
    const story = stories[currentStory];
    const map = getMapById(story.mapId);
    background = new Image();
    background.src = `images/${map.background}`;
    path = map.path;
    initLevel(currentLevel);
}

function initLevel(levelIndex) {
    enemies = [];
    if (levelIndex > 0) {
        coins += stories[currentStory].levels[levelIndex].startingCoins;
    } else {
        coins = stories[currentStory].levels[levelIndex].startingCoins;
    }
    updateBalanceDisplay();
    updateLivesDisplay();
    drawGame();
}

function loadGame() {
    initStory(0);
}

loadGame();
gameLoop();
