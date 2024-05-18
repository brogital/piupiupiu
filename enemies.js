const enemies = [
    {
        id: 1,
        name: 'Basic Enemy',
        type: 'ground',
        armor: 0,
        health: 10,
        size: 1,
        speed: 2,
        image: 'images/enemy-basic.png',
        isBoss: false
    },
    {
        id: 2,
        name: 'Flying Enemy',
        type: 'flying',
        armor: 1,
        health: 15,
        size: 1,
        speed: 3,
        image: 'images/enemy-flying.png',
        isBoss: false
    },
    {
        id: 3,
        name: 'Boss Enemy',
        type: 'ground',
        armor: 5,
        health: 50,
        size: 2,
        speed: 1,
        image: 'images/enemy-boss.png',
        isBoss: true
    }
    // Добавьте другие враги по необходимости
];

class Enemy {
    constructor(id, x, y) {
        const enemyData = enemies.find(e => e.id === id);
        this.id = id;
        this.name = enemyData.name;
        this.type = enemyData.type;
        this.armor = enemyData.armor;
        this.health = enemyData.health;
        this.size = enemyData.size;
        this.speed = enemyData.speed;
        this.image = new Image();
        this.image.src = enemyData.image;
        this.x = x;
        this.y = y;
        this.pathIndex = 0;
    }

    draw() {
        ctx.drawImage(this.image, this.x - this.size * 10, this.y - this.size * 10, this.size * 20, this.size * 20);
    }

    move(path) {
        const targetX = path[this.pathIndex].x;
        const targetY = path[this.pathIndex].y;
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const distance = Math.hypot(dx, dy);

        if (distance < this.speed) {
            this.x = targetX;
            this.y = targetY;
            if (this.pathIndex < path.length - 1) {
                this.pathIndex++;
            } else {
                return true; // Достиг конца пути
            }
        } else {
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        }
        return false; // Еще в пути
    }

    takeDamage(damage) {
        const actualDamage = damage - this.armor;
        this.health -= actualDamage > 0 ? actualDamage : 0;
        return this.health <= 0;
    }
}
