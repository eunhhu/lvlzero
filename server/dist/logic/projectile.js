"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Projectile = void 0;
const events_1 = require("events");
class Projectile {
    id;
    x;
    y;
    angle;
    damage;
    speed;
    tags;
    type;
    event = new events_1.EventEmitter();
    constructor(x, y, angle, damage, speed, tags, type) {
        this.id = Math.floor(Math.random() * 1000000);
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.damage = damage;
        this.speed = speed;
        this.tags = tags;
        this.type = type;
    }
    tick(delta, enemies, projectiles) {
        // Move the projectile
        const speed = this.speed * delta / 100;
        this.x += Math.cos(this.angle) * speed;
        this.y += Math.sin(this.angle) * speed;
        // Check collision with enemies
        for (let enemy of enemies) {
            if (Math.hypot(this.x - enemy.x, this.y - enemy.y) < 1 /* assuming size of hitbox */) {
                let debuffs = [];
                for (let tag of this.tags.filter(tag => tag.split('-')[0] === 'debuff')) {
                    const main = tag.split('-')[1];
                    const type = main.split(':')[0];
                    const duration = +(main.split(':')[1]);
                    let value = +(main.split(':')[2]);
                    if (type === 'poison' || type === 'fire')
                        value = value * this.damage;
                    debuffs.push({ type, duration, value });
                }
                const splash = this.tags.find(tag => tag.split(':')[0] == 'splash');
                if (splash) {
                    const radius = +(splash.split(':')[1]);
                    for (let enemy of enemies) {
                        if (Math.hypot(this.x - enemy.x, this.y - enemy.y) < radius) {
                            enemy.takeDamage(this.damage, debuffs, enemies);
                        }
                    }
                }
                else {
                    enemy.takeDamage(this.damage, debuffs, enemies);
                }
                this.emit('motion-hit', this.type, this.x, this.y);
                this.dispose(projectiles);
                break;
            }
        }
    }
    dispose(projectiles) {
        // Implement logic to dispose of the projectile
        const index = projectiles.indexOf(this);
        if (index !== -1) {
            projectiles.splice(index, 1);
        }
    }
    getTickData() {
        return { x: this.x, y: this.y, angle: this.angle, type: this.type, id: this.id };
    }
    isOutOfBounds(size) {
        return this.x < 0 || this.x > size || this.y < 0 || this.y > size;
    }
    emit(event, ...args) {
        return this.event.emit(event, ...args);
    }
    on(event, listener) {
        this.event.on(event, listener);
        return this;
    }
}
exports.Projectile = Projectile;
//# sourceMappingURL=projectile.js.map