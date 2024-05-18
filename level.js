const path = [
    { x: 0, y: 50 },
    { x: 100, y: 50 },
    { x: 100, y: 200 },
    { x: 300, y: 200 },
    { x: 300, y: 400 },
    { x: 600, y: 400 },
    { x: 600, y: 550 },
    { x: 800, y: 550 }
];

const levels = [
    {
        enemies: Array.from({ length: 10 }, () => new Enemy(path, 50, 1)),
        towers: [],
        startingCoins: 100,
        towerCost: 50,
        rewardPerKill: 10
    },
    {
        enemies: Array.from({ length: 15 }, () => new Enemy(path, 60, 1.2)),
        towers: [],
        startingCoins: 120,
        towerCost: 50,
        rewardPerKill: 12
    },
    {
        enemies: Array.from({ length: 20 }, () => new Enemy(path, 70, 1.5)),
        towers: [],
        startingCoins: 140,
        towerCost: 50,
        rewardPerKill: 14
    },
    {
        enemies: Array.from({ length: 25 }, () => new Enemy(path, 80, 1.8)),
        towers: [],
        startingCoins: 160,
        towerCost: 50,
        rewardPerKill: 16
    },
    {
        enemies: Array.from({ length: 30 }, () => new Enemy(path, 90, 2)),
        towers: [],
        startingCoins: 180,
        towerCost: 50,
        rewardPerKill: 18
    }
];

let currentLevel = 0;
let coins = levels[currentLevel].startingCoins;
let towers = [];
let enemies = [];

function initLevel(levelIndex) {
    const level = levels[levelIndex];
    enemies = level.enemies;
    towers = level.towers.map(t => new Tower(t.x, t.y, t.shape, t.color));
    coins = level.startingCoins;
    updateLevelInfo();
    updateBalanceDisplay();
}

function updateLevelInfo() {
    const levelInfoDiv = document.getElementById('level-info');
    const level = levels[currentLevel];
    levelInfoDiv.textContent = `Уровень: ${currentLevel + 1}, Монстров: ${level.enemies.length}, Здоровье монстров: ${level.enemies[0].health}`;
}
