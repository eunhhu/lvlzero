import { EventEmitter } from 'events';

export class Enemy {
    id: number;
    x: number;
    y: number;
    speed: number;
    health: number;
    maxHealth: number;
    type: string;

    path: [number, number][] = [];
    event:EventEmitter = new EventEmitter();
    debuffs:IDebuff[] = [];

    constructor(x: number, y: number, speed: number, health: number, type: string, path: [number, number][]) {
        this.id = Math.floor(Math.random() * 1000000);
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.health = health;
        this.maxHealth = health;
        this.type = type;
        this.path = [...path];
    }

    tick(delta:number, enemies:Enemy[]): void {
        this.move(delta);

        // Check for debuffs
        for (let debuff of this.debuffs) {
            debuff.duration -= delta;
            if (debuff.duration <= 0) {
                this.debuffs = this.debuffs.filter(v => v !== debuff);
            }
            if (debuff.type === 'poison') {
                this.damage(debuff.value * delta / 1000)
            }
        }
        if(this.debuffs.some(v => v.type === 'fire')){
            this.damage(this.debuffs.filter(v => v.type === 'fire').sort((a, b) => b.value - a.value)[0].value * delta / 1000)
        }
        if(this.debuffs.some(v => v.type === 'bleed')){
            this.damage(this.maxHealth * this.debuffs.filter(v => v.type === 'bleed').sort((a, b) => b.value - a.value)[0].value * delta / 1000);
        }
        if (this.health <= 0) {
            this.die(enemies);
        }
    }
    // Method to move the enemy along the path
    move(delta:number): void {
        if (this.debuffs.some(v => v.type === 'stun')) return;
        if (this.path.length === 0) return;

        const [nextX, nextY] = this.path[0];
        const dx = nextX - this.x;
        const dy = nextY - this.y;
        const distance = Math.hypot(dx, dy);

        let speed = this.speed * delta / 100;
        if (this.debuffs.some(v => v.type === 'slow')) {
            speed *= this.debuffs.filter(v => v.type === 'slow').sort((a, b) => a.value - b.value)[0].value;
        }

        if (distance <= speed) {
            this.x = nextX;
            this.y = nextY;
            this.path = this.path.slice(1);
        } else {
            this.x += (dx / distance) * speed;
            this.y += (dy / distance) * speed;
        }
    }

    takeDamage(damage: number, debuffs:IDebuff[], enemies:Enemy[]): void {
        this.damage(damage);
        this.debuffs.push(...debuffs);
        if (this.health <= 0) {
            this.die(enemies);
        }
    }

    damage(damage: number): void {
        this.health -= damage;
        this.emit('motion-damaged', this.x, this.y, damage);
    }

    getTickData(): IEnemyData{
        return { x: this.x, y: this.y, health: this.health, maxHealth:this.maxHealth, status:this.debuffs.map(v => v.type), type: this.type, id: this.id};
    }

    die(enemies:Enemy[]): void {
        this.dispose(enemies);
        this.emit('dead', this.type);
    }

    dispose(enemies: Enemy[]): void {
        // Implement logic to dispose of the enemy
        const index = enemies.indexOf(this);
        if (index !== -1) {
            enemies.splice(index, 1);
        }
    }

    emit(event:string, ...args:any[]): boolean{
        return this.event.emit(event, ...args);
    }

    on(event:string, listener:(...args: any[]) => void): this{
        this.event.on(event, listener);
        return this;
    }
}
