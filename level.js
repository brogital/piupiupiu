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
        enemies: Array.from({ length: 10 }, () => ({ health: 50, speed: 1 })),
        startingCoins: 100,
        towerCost: 50,
        rewardPerKill: 10
    },
    {
        enemies: Array.from({ length: 15 }, () => ({ health: 60, speed: 1.1 })),
        startingCoins: 120,
        towerCost: 50,
        rewardPerKill: 15
    },
    {
        enemies: Array.from({ length: 20 }, () => ({ health: 70, speed: 1.2 })),
        startingCoins: 140,
        towerCost: 50,
        rewardPerKill: 20
    },
    {
        enemies: Array.from({ length: 25 }, () => ({ health: 80, speed: 1.3 })),
        startingCoins: 160,
        towerCost: 50,
        rewardPerKill: 25
    },
    {
        enemies: Array.from({ length: 30 }, () => ({ health: 90, speed: 1.4 })),
        startingCoins: 180,
        towerCost: 50,
        rewardPerKill: 30
    },
    {
        enemies: Array.from({ length: 35 }, () => ({ health: 100, speed: 1.5 })),
        startingCoins: 200,
        towerCost: 50,
        rewardPerKill: 35
    },
    {
        enemies: Array.from({ length: 40 }, () => ({ health: 110, speed: 1.6 })),
        startingCoins: 220,
        towerCost: 50,
        rewardPerKill: 40
    },
    {
        enemies: Array.from({ length: 45 }, () => ({ health: 120, speed: 1.7 })),
        startingCoins: 240,
        towerCost: 50,
        rewardPerKill: 45
    },
    {
        enemies: Array.from({ length: 50 }, () => ({ health: 130, speed: 1.8 })),
        startingCoins: 260,
        towerCost: 50,
        rewardPerKill: 50
    },
    {
        enemies: Array.from({ length: 55 }, () => ({ health: 140, speed: 1.9 })),
        startingCoins: 280,
        towerCost: 50,
        rewardPerKill: 55
    }
];
