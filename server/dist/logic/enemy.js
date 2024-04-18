"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Enemy = void 0;
const events_1 = require("events");
class Enemy {
    id;
    x;
    y;
    speed;
    health;
    maxHealth;
    type;
    path = [];
    event = new events_1.EventEmitter();
    debuffs = [];
    constructor(x, y, speed, health, type, path) {
        this.id = Math.floor(Math.random() * 1000000);
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.health = health;
        this.maxHealth = health;
        this.type = type;
        this.path = [...path];
    }
    tick(delta, enemies) {
        this.move(delta);
        // Check for debuffs
        for (let debuff of this.debuffs) {
            debuff.duration -= delta;
            if (debuff.duration <= 0) {
                this.debuffs = this.debuffs.filter(v => v !== debuff);
            }
            if (debuff.type === 'poison') {
                this.damage(debuff.value * delta / 1000, true);
            }
        }
        if (this.debuffs.some(v => v.type === 'fire')) {
            this.damage(this.debuffs.filter(v => v.type === 'fire').sort((a, b) => b.value - a.value)[0].value * delta / 1000, true);
        }
        if (this.debuffs.some(v => v.type === 'bleed')) {
            this.damage(this.maxHealth * this.debuffs.filter(v => v.type === 'bleed').sort((a, b) => b.value - a.value)[0].value * delta / 1000, true);
        }
        if (this.health <= 0) {
            this.die(enemies);
        }
    }
    // Method to move the enemy along the path
    move(delta) {
        if (this.debuffs.some(v => v.type === 'stun'))
            return;
        if (this.path.length === 0)
            return;
        const [nextX, nextY] = this.path[0];
        const dx = nextX - this.x;
        const dy = nextY - this.y;
        const distance = Math.hypot(dx, dy);
        let speed = this.speed * delta / 100;
        if (this.debuffs.some(v => v.type === 'slow')) {
            speed *= this.debuffs.filter(v => v.type === 'slow').sort((a, b) => a.value - b.value)[0].value;
        }
        if (this.debuffs.some(v => v.type === 'illusion')) {
            // need to make the enemy move in the opposite direction
            speed *= -this.debuffs.filter(v => v.type === 'illusion').sort((a, b) => b.value - a.value)[0].value;
        }
        if (distance <= speed) {
            this.x = nextX;
            this.y = nextY;
            this.path = this.path.slice(1);
        }
        else {
            this.x += (dx / distance) * speed;
            this.y += (dy / distance) * speed;
        }
    }
    takeDamage(damage, debuffs, enemies) {
        this.damage(damage);
        this.debuffs.push(...debuffs);
        if (this.health <= 0) {
            this.die(enemies);
        }
    }
    damage(damage, isDebuff = false) {
        if (this.debuffs.some(v => v.type === 'weak')) {
            damage *= 1 + this.debuffs.filter(v => v.type === 'weak').sort((a, b) => b.value - a.value)[0].value;
            damage = Math.max(0, damage);
            damage = Math.round(damage);
        }
        this.health -= damage;
        if (!isDebuff)
            this.emit('motion-damaged', this.x, this.y, damage);
    }
    getTickData() {
        return { x: +this.x.toFixed(2), y: +this.y.toFixed(2), health: +this.health.toFixed(2), maxHealth: this.maxHealth, status: this.debuffs.map(v => v.type), type: this.type, id: this.id };
    }
    die(enemies) {
        this.dispose(enemies);
        this.emit('dead', this.type);
    }
    dispose(enemies) {
        // Implement logic to dispose of the enemy
        const index = enemies.indexOf(this);
        if (index !== -1) {
            enemies.splice(index, 1);
        }
    }
    emit(event, ...args) {
        return this.event.emit(event, ...args);
    }
    on(event, listener) {
        this.event.on(event, listener);
        return this;
    }
}
exports.Enemy = Enemy;
//# sourceMappingURL=enemy.js.map