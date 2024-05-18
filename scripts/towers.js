// towers.js

class Tower {
    constructor(type, x, y) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.level = 1;
        this.range = 100;
        this.damage = 10;
        this.attackSpeed = 1000;
    }

    draw() {
        const img = new Image();
        img.src = `images/tower-${this.type}.png`;
        img.onload = () => {
            ctx.drawImage(img, this.x, this.y, gridSize, gridSize);
        };
    }

    drawRange() {
        ctx.beginPath();
        ctx.arc(this.x + gridSize / 2, this.y + gridSize / 2, this.range, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(0, 0, 255, 0.5)';
        ctx.stroke();
    }

    attack(enemies) {
        // Реализация атаки башни
    }

    upgrade() {
        this.level++;
        this.damage += 5;
        this.range += 10;
        this.attackSpeed -= 50;
    }

    displayInfo() {
        alert(`Уровень: ${this.level}\nУрон: ${this.damage}\nРадиус: ${this.range}`);
    }
}
