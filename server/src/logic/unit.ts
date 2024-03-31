import { EventEmitter } from 'events';
import { Enemy } from './enemy';
import { Projectile } from './projectile';

export class Unit {
    x: number;
    y: number;
    damage: number[];
    rate: number[];
    range: number[];
    bulletSpeed: number[];
    upgradeCost: number[];
    cost: number;
    tags: string[] = [];
    type: string;
    lvl: number;
    cooldown: number = 0; // To manage firing rate

    event:EventEmitter = new EventEmitter();

    constructor(x: number, y: number, damage: number[], rate: number[], range: number[], bulletSpeed:number[], upgradeCost:number[], cost:number, tags:string[], type: string, lvl: number) {
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

    tick(delta:number, enemies: Enemy[], projectiles: Projectile[]): void {
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
            // Calculate angle towards target
            const angle = Math.atan2(target.y - this.y, target.x - this.x);
            projectiles.push(new Projectile(this.x, this.y, angle, this.getCurStat().damage, this.getCurStat().bulletSpeed, this.type));
            this.cooldown = this.getCurStat().rate;
        }
    }

    getTickData(): IUnitData{
        return { x: this.x, y: this.y, type: this.type, lvl: this.lvl };
    }

    getCurStat() {
        return {
            damage: this.damage[this.lvl-1],
            rate: this.rate[this.lvl-1],
            range: this.range[this.lvl-1],
            bulletSpeed: this.bulletSpeed[this.lvl-1],
            upgradeCost: this.upgradeCost[this.lvl-1]
        }
    }
}
