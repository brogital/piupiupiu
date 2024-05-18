const towerImages = {
    circle: new Image(),
    square: new Image()
};

towerImages.circle.src = 'images/tower-circle.png';
towerImages.square.src = 'images/tower-square.png';

class Tower {
    constructor(x, y, shape, color) {
        this.x = x;
        this.y = y;
        this.shape = shape;
        this.color = color;
        this.level = 1;
        this.damage = 10;
        this.range = 100;
        this.speed = 1;
        this.upgrades = this.generateUpgrades();
        this.projectiles = [];
    }

    attack(enemies) {
        enemies.forEach(enemy => {
            if (Math.hypot(this.x - enemy.x, this.y - enemy.y) <= this.range) {
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
}


    generateUpgrades() {
        let upgrades = [];
        for (let i = 0; i < 350; i++) {
            upgrades.push({
                damage: 5 + Math.random() * 10,
                range: 10 + Math.random() * 50,
                speed: 0.1 + Math.random() * 0.5
            });
        }
        return upgrades;
    }

    draw() {
        if (this.shape in towerImages) {
            ctx.drawImage(towerImages[this.shape], this.x - 20, this.y - 20, 40, 40);
        } else {
            ctx.fillStyle = this.color;
            switch (this.shape) {
                case 'circle':
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, 20, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                case 'square':
                    ctx.fillRect(this.x - 20, this.y - 20, 40, 40);
                    break;
            }
        }
        this.drawRange();
    }

    drawRange() {
        ctx.strokeStyle = 'rgba(0, 0, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.range, 0, Math.PI * 2);
        ctx.stroke();
    }

    upgrade() {
        if (this.level < 350) {
            let upgrade = this.upgrades[this.level];
            this.damage += upgrade.damage;
            this.range += upgrade.range;
            this.speed += upgrade.speed;
            this.level++;
        }
    }

    attack(enemies) {
        enemies.forEach(enemy => {
            if (Math.hypot(this.x - enemy.x, this.y - enemy.y) <= this.range) {
                enemy.health -= this.damage;
            }
        });
    }

    displayInfo() {
        const infoDiv = document.getElementById('tower-info');
        infoDiv.textContent = `Урон: ${this.damage}, Уровень: ${this.level}, Стоимость улучшения: ${this.level * 10} монет`;
        if (buildingPhase) {
            document.getElementById('upgradeTowerButton').style.display = 'inline-block';
        }
        selectedTower = this;
    }
}

let selectedTower = null;




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
