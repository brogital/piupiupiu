// stories.js

const stories = [
    {
        id: 0,
        mapId: 0,
        descriptionStart: "Начало истории 1",
        descriptionEnd: "Конец истории 1",
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
            // Добавьте другие уровни здесь
        ]
    },
    {
        id: 1,
        mapId: 1,
        descriptionStart: "Начало истории 2",
        descriptionEnd: "Конец истории 2",
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
            // Добавьте другие уровни здесь
        ]
    },
    // Добавьте другие истории здесь
];
