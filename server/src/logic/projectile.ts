import { Enemy } from './enemy';
import { EventEmitter } from 'events';

export class Projectile {
    x: number;
    y: number;
    angle: number;
    damage: number;
    speed: number;
    type: string;

    event:EventEmitter = new EventEmitter();

    constructor(x: number, y: number, angle: number, damage: number, speed: number, type: string) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.damage = damage;
        this.speed = speed;
        this.type = type;
    }

    tick(delta:number, enemies: Enemy[], projectiles: Projectile[]): void {
        // Move the projectile
        const speed = this.speed * delta / 100;
        this.x += Math.cos(this.angle) * speed;
        this.y += Math.sin(this.angle) * speed;

        // Check collision with enemies
        for (let enemy of enemies) {
            if (Math.hypot(this.x - enemy.x, this.y - enemy.y) < 1 /* assuming size of hitbox */) {
                enemy.takeDamage(this.damage, enemies);
                // Assuming projectile is destroyed on hit, otherwise implement logic for that
                this.emit('motion-hit', this.type, this.x, this.y);
                this.dispose(projectiles);
                break;
            }
        }
    }

    dispose(projectiles:Projectile[]): void {
        // Implement logic to dispose of the projectile
        const index = projectiles.indexOf(this);
        if (index !== -1) {
            projectiles.splice(index, 1);
        }
    }

    getTickData(): IProjectileData{
        return { x: this.x, y: this.y, angle: this.angle, type: this.type };
    }

    isOutOfBounds(size: number): boolean {
        return this.x < 0 || this.x > size || this.y < 0 || this.y > size;
    }

    emit(event:string, ...args:any[]): boolean{
        return this.event.emit(event, ...args);
    }

    on(event:string, listener:(...args: any[]) => void): this{
        this.event.on(event, listener);
        return this;
    }
}
