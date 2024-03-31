import { EventEmitter } from 'events';

export class Enemy {
    x: number;
    y: number;
    speed: number;
    health: number;
    type: string;

    path: [number, number][] = [];
    event:EventEmitter = new EventEmitter();

    constructor(x: number, y: number, speed: number, health: number, type: string, path: [number, number][]) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.health = health;
        this.type = type;
        this.path = [...path];
    }
  
    // Method to move the enemy along the path
    move(delta:number): void {
        if (this.path.length === 0) return;

        const [nextX, nextY] = this.path[0];
        const dx = nextX - this.x;
        const dy = nextY - this.y;
        const distance = Math.hypot(dx, dy);

        const speed = this.speed * delta / 100;

        if (distance <= speed) {
            this.x = nextX;
            this.y = nextY;
            this.path.shift();
        } else {
            this.x += (dx / distance) * speed;
            this.y += (dy / distance) * speed;
        }
    }

    takeDamage(damage: number, enemies:Enemy[]): void {
        this.health -= damage;
        if (this.health <= 0) {
            this.dispose(enemies);
        }
    }

    getTickData(): IEnemyData{
        return { x: this.x, y: this.y, health: this.health, type: this.type };
    }

    dispose(enemies: Enemy[]): void {
        // Implement logic to dispose of the enemy
        const index = enemies.indexOf(this);
        if (index !== -1) {
            enemies.splice(index, 1);
        }
    }
}
