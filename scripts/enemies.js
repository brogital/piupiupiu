// enemies.js

class Enemy {
    constructor(type, x, y) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.health = 100;
        this.speed = 2;
        this.pathIndex = 0;
    }

    draw() {
        const img = new Image();
        img.src = `images/enemy-${this.type}.png`;
        img.onload = () => {
            ctx.drawImage(img, this.x, this.y, gridSize, gridSize);
        };
    }

    move(path) {
        // Реализация движения врага по пути
    }
}
