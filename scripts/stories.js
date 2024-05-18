// stories.js

const stories = [
    {
        id: 0,
        mapId: 0,
        descriptionStart: "The journey begins in the Green Meadows.",
        descriptionEnd: "Victory in the Green Meadows!",
        levels: [
            {
                startingCoins: 100,
                towerCost: 50,
                rewardPerKill: 10,
                enemies: [
                    { id: 'basic', quantity: 10 },
                    { id: 'flying', quantity: 5 }
                ]
            },
            {
                startingCoins: 150,
                towerCost: 60,
                rewardPerKill: 15,
                enemies: [
                    { id: 'basic', quantity: 15 },
                    { id: 'flying', quantity: 10 },
                    { id: 'boss', quantity: 1 }
                ]
            },
            // Добавьте другие уровни здесь
        ]
    },
    {
        id: 1,
        mapId: 1,
        descriptionStart: "The challenge continues in the Desert Storm.",
        descriptionEnd: "Victory in the Desert Storm!",
        levels: [
            {
                startingCoins: 120,
                towerCost: 60,
                rewardPerKill: 15,
                enemies: [
                    { id: 'basic', quantity: 15 },
                    { id: 'flying', quantity: 10 }
                ]
            },
            {
                startingCoins: 180,
                towerCost: 70,
                rewardPerKill: 20,
                enemies: [
                    { id: 'basic', quantity: 20 },
                    { id: 'flying', quantity: 15 },
                    { id: 'boss', quantity: 1 }
                ]
            },
            // Добавьте другие уровни здесь
        ]
    },
    // Добавьте другие истории здесь
];
