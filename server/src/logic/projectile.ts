import { Enemy } from './enemy';
import { EventEmitter } from 'events';

export class Projectile {
    id: number;
    x: number;
    y: number;
    angle: number;
    damage: number;
    speed: number;
    tags: string[];
    type: string;
    size: number;

    event:EventEmitter = new EventEmitter();

    constructor(x: number, y: number, angle: number, damage: number, speed: number, tags:string[], type: string) {
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

    tick(delta:number, enemies: Enemy[], projectiles: Projectile[]): void {
        // Move the projectile
        const speed = this.speed * delta / 100;
        this.x += Math.cos(this.angle) * speed;
        this.y += Math.sin(this.angle) * speed;

        // Check collision with enemies
        for (let enemy of enemies) {
            if (Math.hypot(this.x - enemy.x, this.y - enemy.y) < this.size /* assuming size of hitbox */) {
                let debuffs = [];
                for (let tag of this.tags.filter(tag => tag.split('-')[0] === 'debuff')) {
                    const main = tag.split('-')[1];
                    const type = main.split(':')[0];
                    const duration = +(main.split(':')[1]);
                    let value = +(main.split(':')[2]);
                    if(type === 'poison' || type === 'fire') value = value * this.damage;
                    debuffs.push({type, duration, value});
                }
                const splash = this.tags.find(tag => tag.split(':')[0] == 'splash');
                if(splash){
                    const radius = +(splash.split(':')[1]) + this.size;
                    const in_ranged = enemies.filter(v => {
                        return Math.hypot(this.x - v.x, this.y - v.y) < radius;
                    });
                    in_ranged.forEach(v => {
                        v.takeDamage(this.damage, debuffs, enemies);
                    });
                } else {
                    enemy.takeDamage(this.damage, debuffs, enemies);
                }

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
        return { x: this.x, y: this.y, angle: this.angle, type: this.type, id: this.id};
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
