const stories = [
    {
        mapId: 1,
        title: 'The Battle of Green Meadows',
        descriptionStart: 'The journey begins in the tranquil Green Meadows...',
        descriptionEnd: 'The heroes have defended Green Meadows successfully!',
        levels: [
            {
                id: 1,
                description: 'The first wave of enemies is approaching...',
                enemies: [
                    { id: 1, quantity: 10 },
                    { id: 2, quantity: 2 }
                ],
                startingCoins: 100,
                towerCost: 50,
                rewardPerKill: 10
            },
            {
                id: 2,
                description: 'The enemies are getting stronger...',
                enemies: [
                    { id: 1, quantity: 15 },
                    { id: 2, quantity: 5 }
                ],
                startingCoins: 120,
                towerCost: 50,
                rewardPerKill: 15
            }
            // Добавьте другие уровни для истории
        ]
    },
    {
        mapId: 2,
        title: 'The Storm in the Desert',
        descriptionStart: 'A fierce storm brews in the desert...',
        descriptionEnd: 'The desert storm has been quelled!',
        levels: [
            {
                id: 1,
                description: 'Enemies emerge from the desert sands...',
                enemies: [
                    { id: 1, quantity: 10 },
                    { id: 2, quantity: 3 }
                ],
                startingCoins: 100,
                towerCost: 50,
                rewardPerKill: 10
            },
            {
                id: 2,
                description: 'More enemies are coming...',
                enemies: [
                    { id: 1, quantity: 20 },
                    { id: 2, quantity: 5 }
                ],
                startingCoins: 150,
                towerCost: 50,
                rewardPerKill: 20
            }
            // Добавьте другие уровни для истории
        ]
    }
    // Добавьте другие истории по необходимости
];

function getStoryByMapId(mapId) {
    return stories.find(story => story.mapId === mapId);
}
