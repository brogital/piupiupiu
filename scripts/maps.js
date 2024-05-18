// maps.js

const maps = [
    {
        id: 0,
        background: 'images/map-green-meadows.png',
        path: [
            { x: 0, y: 100 },
            { x: 100, y: 100 },
            { x: 200, y: 100 },
            { x: 300, y: 100 },
            { x: 400, y: 100 },
            { x: 500, y: 100 },
            { x: 600, y: 100 },
            { x: 700, y: 100 }
            // Добавьте точки пути
        ],
        towers: ['circle', 'square']
    },
    {
        id: 1,
        background: 'images/map-desert-storm.png',
        path: [
            { x: 0, y: 150 },
            { x: 100, y: 150 },
            { x: 200, y: 150 },
            { x: 300, y: 150 },
            { x: 400, y: 150 },
            { x: 500, y: 150 },
            { x: 600, y: 150 },
            { x: 700, y: 150 }
            // Добавьте точки пути
        ],
        towers: ['circle', 'square']
    },
    // Добавьте другие карты здесь
];

function getMapById(id) {
    return maps.find(map => map.id === id);
}
