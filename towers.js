const towers = [
    {
        id: 1,
        name: 'Circle Tower',
        upgrades: 5,
        damage: 10,
        range: 100,
        enemyTypes: ['ground', 'flying'],
        image: 'images/tower-circle.png'
    },
    {
        id: 2,
        name: 'Square Tower',
        upgrades: 5,
        damage: 15,
        range: 80,
        enemyTypes: ['ground'],
        image: 'images/tower-square.png'
    }
    // Добавьте другие башни по необходимости
];

class Tower {
    constructor(id, x, y) {
        const towerData = towers.find(t => t.id === id);
        this.id = id;
        this.name = towerData.name;
        this.x = x;
        this.y = y;
        this.damage = towerData.damage;
        this.range = towerData.range;
        this.upgrades = towerData.upgrades;
        this.enemyTypes = towerData.enemyTypes;
        this.image = new Image();
        this.image.src = towerData.image;
        this.level = 1;
        this.projectiles = [];
    }

    draw() {
        ctx.drawImage(this.image, this.x - 20, this.y - 20, 40, 40);
        this.drawRange();
    }

    drawRange() {
        ctx.strokeStyle = 'rgba(0, 0, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.range, 0, Math.PI * 2);
        ctx.stroke();
    }

    upgrade() {
        if (this.level < this.upgrades) {
            this.damage += 5; // Увеличение урона на 5 при каждом улучшении
            this.range += 10; // Увеличение радиуса на 10 при каждом улучшении
            this.level++;
        }
    }

    attack(enemies) {
        enemies.forEach(enemy => {
            if (this.enemyTypes.includes(enemy.type) && Math.hypot(this.x - enemy.x, this.y - enemy.y) <= this.range) {
                const projectile = new Projectile(this.x, this.y, enemy, this.damage, 5);
                this.projectiles.push(projectile);
            }
        });

        this.projectiles = this.projectiles.filter(projectile => {
            const reached = projectile.move();
            if (!reached) {
                projectile.draw();
            }
            return !reached;
        });
    }

    displayInfo() {
        const infoDiv = document.getElementById('tower-info');
        infoDiv.textContent = `Урон: ${this.damage}, Уровень: ${this.level}, Стоимость улучшения: ${this.level * 10}`;
        if (buildingPhase) {
            document.getElementById('upgradeTowerButton').style.display = 'inline-block';
        }
        selectedTower = this;
    }
}

class Projectile {
    constructor(x, y, target, damage, speed) {
        this.x = x;
        this.y = y;
        this.target = target;
        this.damage = damage;
        this.speed = speed;
    }

    move() {
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const distance = Math.hypot(dx, dy);

        if (distance < this.speed) {
            this.target.health -= this.damage;
            return true; // Снаряд достиг цели
        } else {
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
            return false; // Снаряд еще в пути
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = 'black';
        ctx.fill();
    }
}

let selectedTower = null;
