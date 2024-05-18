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
        enemies: [
            { health: 50, speed: 1 },
            { health: 50, speed: 1 },
            { health: 50, speed: 1 },
            { health: 50, speed: 1 },
            { health: 50, speed: 1 },
            { health: 50, speed: 1 },
            { health: 50, speed: 1 },
            { health: 50, speed: 1 },
            { health: 50, speed: 1 },
            { health: 50, speed: 1 }
        ],
        startingCoins: 100,
        towerCost: 50,
        rewardPerKill: 10
    },
    {
        enemies: [
            { health: 60, speed: 1.2 },
            { health: 60, speed: 1.2 },
            { health: 60, speed: 1.2 },
            { health: 60, speed: 1.2 },
            { health: 60, speed: 1.2 },
            { health: 60, speed: 1.2 },
            { health: 60, speed: 1.2 },
            { health: 60, speed: 1.2 },
            { health: 60, speed: 1.2 },
            { health: 60, speed: 1.2 }
        ],
        startingCoins: 120,
        towerCost: 50,
        rewardPerKill: 15
    },
    {
        enemies: [
            { health: 70, speed: 1.4 },
            { health: 70, speed: 1.4 },
            { health: 70, speed: 1.4 },
            { health: 70, speed: 1.4 },
            { health: 70, speed: 1.4 },
            { health: 70, speed: 1.4 },
            { health: 70, speed: 1.4 },
            { health: 70, speed: 1.4 },
            { health: 70, speed: 1.4 },
            { health: 70, speed: 1.4 }
        ],
        startingCoins: 140,
        towerCost: 50,
        rewardPerKill: 20
    },
    {
        enemies: [
            { health: 80, speed: 1.6 },
            { health: 80, speed: 1.6 },
            { health: 80, speed: 1.6 },
            { health: 80, speed: 1.6 },
            { health: 80, speed: 1.6 },
            { health: 80, speed: 1.6 },
            { health: 80, speed: 1.6 },
            { health: 80, speed: 1.6 },
            { health: 80, speed: 1.6 },
            { health: 80, speed: 1.6 }
        ],
        startingCoins: 160,
        towerCost: 50,
        rewardPerKill: 25
    },
    {
        enemies: [
            { health: 90, speed: 1.8 },
            { health: 90, speed: 1.8 },
            { health: 90, speed: 1.8 },
            { health: 90, speed: 1.8 },
            { health: 90, speed: 1.8 },
            { health: 90, speed: 1.8 },
            { health: 90, speed: 1.8 },
            { health: 90, speed: 1.8 },
            { health: 90, speed: 1.8 },
            { health: 90, speed: 1.8 }
        ],
        startingCoins: 180,
        towerCost: 50,
        rewardPerKill: 30
    },
    {
        enemies: [
            { health: 100, speed: 2 },
            { health: 100, speed: 2 },
            { health: 100, speed: 2 },
            { health: 100, speed: 2 },
            { health: 100, speed: 2 },
            { health: 100, speed: 2 },
            { health: 100, speed: 2 },
            { health: 100, speed: 2 },
            { health: 100, speed: 2 },
            { health: 100, speed: 2 }
        ],
        startingCoins: 200,
        towerCost: 50,
        rewardPerKill: 35
    },
    {
        enemies: [
            { health: 110, speed: 2.2 },
            { health: 110, speed: 2.2 },
            { health: 110, speed: 2.2 },
            { health: 110, speed: 2.2 },
            { health: 110, speed: 2.2 },
            { health: 110, speed: 2.2 },
            { health: 110, speed: 2.2 },
            { health: 110, speed: 2.2 },
            { health: 110, speed: 2.2 },
            { health: 110, speed: 2.2 }
        ],
        startingCoins: 220,
        towerCost: 50,
        rewardPerKill: 40
    },
    {
        enemies: [
            { health: 120, speed: 2.4 },
            { health: 120, speed: 2.4 },
            { health: 120, speed: 2.4 },
            { health: 120, speed: 2.4 },
            { health: 120, speed: 2.4 },
            { health: 120, speed: 2.4 },
            { health: 120, speed: 2.4 },
            { health: 120, speed: 2.4 },
            { health: 120, speed: 2.4 },
            { health: 120, speed: 2.4 }
        ],
        startingCoins: 240,
        towerCost: 50,
        rewardPerKill: 45
    },
    {
        enemies: [
            { health: 130, speed: 2.6 },
            { health: 130, speed: 2.6 },
            { health: 130, speed: 2.6 },
            { health: 130, speed: 2.6 },
            { health: 130, speed: 2.6 },
            { health: 130, speed: 2.6 },
            { health: 130, speed: 2.6 },
            { health: 130, speed: 2.6 },
            { health: 130, speed: 2.6 },
            { health: 130, speed: 2.6 }
        ],
        startingCoins: 260,
        towerCost: 50,
        rewardPerKill: 50
    },
    {
        enemies: [
            { health: 140, speed: 2.8 },
            { health: 140, speed: 2.8 },
            { health: 140, speed: 2.8 },
            { health: 140, speed: 2.8 },
            { health: 140, speed: 2.8 },
            { health: 140, speed: 2.8 },
            { health: 140, speed: 2.8 },
            { health: 140, speed: 2.8 },
            { health: 140, speed: 2.8 },
            { health: 140, speed: 2.8 }
        ],
        startingCoins: 280,
        towerCost: 50,
        rewardPerKill: 55
    },
    {
        enemies: [
            { health: 150, speed: 3 },
            { health: 150, speed: 3 },
            { health: 150, speed: 3 },
            { health: 150, speed: 3 },
            { health: 150, speed: 3 },
            { health: 150, speed: 3 },
            { health: 150, speed: 3 },
            { health: 150, speed: 3 },
            { health: 150, speed: 3 },
            { health: 150, speed: 3 }
        ],
        startingCoins: 300,
        towerCost: 50,
        rewardPerKill: 60
    }
];
