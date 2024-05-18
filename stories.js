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
    // Добавьте другие истории здесь
];
