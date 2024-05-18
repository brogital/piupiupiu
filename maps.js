const maps = [
    {
        id: 1,
        name: 'Green Meadows',
        order: 1,
        path: [
            { x: 0, y: 50 },
            { x: 100, y: 50 },
            { x: 100, y: 200 },
            { x: 300, y: 200 },
            { x: 300, y: 400 },
            { x: 600, y: 400 },
            { x: 600, y: 550 },
            { x: 800, y: 550 }
        ],
        background: 'images/map-green-meadows.png',
        levels: 10,
        bossName: 'Boss Enemy'
    },
    {
        id: 2,
        name: 'Desert Storm',
        order: 2,
        path: [
            { x: 0, y: 100 },
            { x: 200, y: 100 },
            { x: 200, y: 300 },
            { x: 400, y: 300 },
            { x: 400, y: 500 },
            { x: 600, y: 500 },
            { x: 600, y: 700 },
            { x: 800, y: 700 }
        ],
        background: 'images/map-desert-storm.png',
        levels: 10,
        bossName: 'Boss Enemy'
    }
    // Добавьте другие карты по необходимости
];

function getMapById(id) {
    return maps.find(map => map.id === id);
}
