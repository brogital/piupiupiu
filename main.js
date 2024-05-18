// main.js

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
let currentStory = null;
let currentLevel = 0;
let towers = [];
let enemies = [];
let lives = 10;
let coins = 100;

let background = new Image();
let path = [];

window.selectTower = function(type) {
    console.log('Tower selected:', type);
    selectedTowerType = type;
};

window.startLevel = function() {
    console.log('Level started');
    gameRunning = true;
    buildingPhase = false;
    startLevelButton.style.display = 'none';
    upgradeTowerButton.style.display = 'none';
    phaseInfo.textContent = '';
    spawnEnemies();
};

window.newGame = function() {
    console.log('New game started');
    lives = 10;
    coins = 100;
    towers = [];
    enemies = [];
    gameRunning = false;
    buildingPhase = true;
    newGameButton.style.display = 'none';
    gameOverMessage.style.display = 'none';
    startLevelButton.style.display = 'inline-block';
    phaseInfo.textContent = 'Фаза строительства';
    initStory(currentStory);
    gameLoop();
}

function gameOver() {
    console.log('Game over');
    gameOverMessage.style.display = 'block';
    newGameButton.style.display = 'block';
}

function initStory(storyIndex) {
    currentStory = storyIndex;
    currentLevel = 0;
    const story = stories[currentStory];
    alert(story.descriptionStart);
    const map = getMapById(story.mapId);
    background = new Image();
    background.src = map.background;
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

window.onload = function() {
    loadGame();
    gameLoop();
};
