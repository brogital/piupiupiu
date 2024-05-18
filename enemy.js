const enemyImage = new Image();
enemyImage.src = 'images/enemy.png';

enemyImage.onload = () => {
    console.log('Enemy image loaded successfully');
};

class Enemy {
    constructor(path, health, speed) {
        this.path = path;
        this.pathIndex = 0;
        this.x = path[0].x;
        this.y = path[0].y;
        this.health = health;
        this.speed = speed;
    }

    move() {
        const target = this.path[this.pathIndex];
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const distance = Math.hypot(dx, dy);

        if (distance < this.speed) {
            this.pathIndex++;
            if (this.pathIndex >= this.path.length) {
                this.health = 0; // Монстр достиг конца пути
                return;
            }
        } else {
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        }
    }

    draw() {
        if (enemyImage.complete) {
            ctx.drawImage(enemyImage, this.x - 10, this.y - 10, 20, 20);
        } else {
            // Резервное отображение, если изображение не загружено
            ctx.fillStyle = 'red';
            ctx.fillRect(this.x - 10, this.y - 10, 20, 20);
        }
        ctx.fillStyle = 'black';
        ctx.fillText(this.health, this.x, this.y - 10);
    }
}