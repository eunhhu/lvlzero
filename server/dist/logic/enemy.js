"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Enemy = void 0;
const events_1 = require("events");
class Enemy {
    x;
    y;
    speed;
    health;
    type;
    path = [];
    event = new events_1.EventEmitter();
    constructor(x, y, speed, health, type, path) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.health = health;
        this.type = type;
        this.path = [...path];
    }
    // Method to move the enemy along the path
    move(delta) {
        if (this.path.length === 0)
            return;
        const [nextX, nextY] = this.path[0];
        const dx = nextX - this.x;
        const dy = nextY - this.y;
        const distance = Math.hypot(dx, dy);
        const speed = this.speed * delta / 100;
        if (distance <= speed) {
            this.x = nextX;
            this.y = nextY;
            this.path.shift();
        }
        else {
            this.x += (dx / distance) * speed;
            this.y += (dy / distance) * speed;
        }
    }
    takeDamage(damage, enemies) {
        this.health -= damage;
        if (this.health <= 0) {
            this.dispose(enemies);
        }
    }
    getTickData() {
        return { x: this.x, y: this.y, health: this.health, type: this.type };
    }
    dispose(enemies) {
        // Implement logic to dispose of the enemy
        const index = enemies.indexOf(this);
        if (index !== -1) {
            enemies.splice(index, 1);
        }
    }
}
exports.Enemy = Enemy;
//# sourceMappingURL=enemy.js.map