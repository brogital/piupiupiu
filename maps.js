// maps.js

const maps = [
    {
        id: 0,
        background: 'path/to/your/background-image.png',
        path: [
            { x: 0, y: 100 },
            { x: 100, y: 100 },
            { x: 200, y: 100 }
            // Добавьте точки пути
        ]
    },
    // Добавьте другие карты здесь
];

function getMapById(id) {
    return maps.find(map => map.id === id);
}
