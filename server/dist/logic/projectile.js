"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Projectile = void 0;
class Projectile {
    x;
    y;
    angle;
    damage;
    speed;
    type;
    constructor(x, y, angle, damage, speed, type) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.damage = damage;
        this.speed = speed;
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
                enemy.takeDamage(this.damage, enemies);
                // Assuming projectile is destroyed on hit, otherwise implement logic for that
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
        return { x: this.x, y: this.y, angle: this.angle, type: this.type };
    }
    isOutOfBounds(size) {
        return this.x < 0 || this.x > size || this.y < 0 || this.y > size;
    }
}
exports.Projectile = Projectile;
//# sourceMappingURL=projectile.js.map