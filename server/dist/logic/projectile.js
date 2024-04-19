"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Projectile = void 0;
const events_1 = require("events");
const splashAcceptDebuffs = ['fire', 'poison', 'bleed', 'weak'];
class Projectile {
    id;
    x;
    y;
    angle;
    damage;
    speed;
    tags;
    type;
    size;
    pierced = []; // enemies' id that have been pierced
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
        this.size = 0.7;
    }
    tick(delta, enemies, projectiles) {
        // Move the projectile
        const speed = this.speed * delta / 100;
        this.x += Math.cos(this.angle) * speed;
        this.y += Math.sin(this.angle) * speed;
        // Check collision with enemies
        for (let enemy of enemies) {
            if (Math.hypot(this.x - enemy.x, this.y - enemy.y) < this.size /* assuming size of hitbox */ && !this.pierced.includes(enemy.id)) {
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
                    const radius = +(splash.split(':')[1]) + this.size;
                    const in_ranged = enemies.filter(v => {
                        return Math.hypot(this.x - v.x, this.y - v.y) < radius && v.id !== enemy.id;
                    });
                    in_ranged.forEach(v => {
                        v.takeDamage(this.damage, debuffs.filter(v => splashAcceptDebuffs.includes(v.type)), enemies);
                    });
                }
                enemy.takeDamage(this.damage, debuffs, enemies);
                this.emit('motion-hit', this.type, this.x, this.y);
                const pierce = this.tags.find(tag => tag.split(':')[0] == 'pierce');
                if (pierce) {
                    this.pierced.push(enemy.id);
                    if (this.pierced.length >= +(pierce.split(':')[1]))
                        this.dispose(projectiles);
                }
                else {
                    this.dispose(projectiles);
                }
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
        return { x: +this.x.toFixed(2), y: +this.y.toFixed(2), angle: +this.angle.toFixed(2), type: this.type, id: this.id };
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