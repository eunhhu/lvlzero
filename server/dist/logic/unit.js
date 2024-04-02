"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Unit = void 0;
const events_1 = require("events");
const projectile_1 = require("./projectile");
class Unit {
    x;
    y;
    damage;
    rate;
    range;
    bulletSpeed;
    upgradeCost;
    cost;
    tags = [];
    type;
    lvl;
    cooldown = 0; // To manage firing rate
    event = new events_1.EventEmitter();
    constructor(x, y, damage, rate, range, bulletSpeed, upgradeCost, cost, tags, type, lvl) {
        this.x = x;
        this.y = y;
        this.damage = damage;
        this.rate = rate;
        this.range = range;
        this.bulletSpeed = bulletSpeed;
        this.upgradeCost = upgradeCost;
        this.cost = cost;
        this.tags = tags;
        this.type = type;
        this.lvl = lvl;
    }
    tick(delta, enemies, projectiles) {
        if (this.cooldown > 0) {
            this.cooldown -= delta;
            return;
        }
        // Find the closest enemy within range
        const target = enemies.find(enemy => {
            const distance = Math.hypot(this.x - enemy.x, this.y - enemy.y);
            return distance <= this.getCurStat().range;
        });
        if (target) {
            this.emit('motion-fire', this.type, this.x, this.y);
            // Calculate angle towards target
            const angle = Math.atan2(target.y - this.y, target.x - this.x);
            const proj = new projectile_1.Projectile(this.x, this.y, angle, this.getCurStat().damage, this.getCurStat().bulletSpeed, this.type);
            proj.on('motion-hit', (type, x, y) => {
                this.emit('motion-hit', type, x, y);
            });
            projectiles.push(proj);
            this.cooldown = this.getCurStat().rate;
        }
    }
    getTickData() {
        return { x: this.x, y: this.y, type: this.type, lvl: this.lvl };
    }
    getCurStat() {
        return {
            damage: this.damage[this.lvl - 1],
            rate: this.rate[this.lvl - 1],
            range: this.range[this.lvl - 1],
            bulletSpeed: this.bulletSpeed[this.lvl - 1],
            upgradeCost: this.upgradeCost[this.lvl - 1]
        };
    }
    emit(event, ...args) {
        return this.event.emit(event, ...args);
    }
    on(event, listener) {
        this.event.on(event, listener);
        return this;
    }
}
exports.Unit = Unit;
//# sourceMappingURL=unit.js.map