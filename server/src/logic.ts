import { EventEmitter } from "events";
import { units } from "./db";

export class Game{
    wave:number = 0;
    size:number = 20;
    health:number = 1000;
    path:[number, number][] = [];
    level:number = 1;
    maxWave:number = 10;

    units:Unit[] = [];
    enemies:Enemy[] = [];
    projectiles:Projectile[] = [];

    loop:NodeJS.Timeout;
    spawnInterval:NodeJS.Timeout;
    event:EventEmitter = new EventEmitter();

    enemySpawnQueue:Enemy[] = [];

    enemySpawnInterval = 1000
    waitingTimer:number = 0;
    waitingTimerMax:number = 10000;
    status:"waiting"|"started" = "waiting"
    lastTick: number = Date.now();

    constructor(){
        this.generatePath();
    }

    generatePath() {
        let cur:[number, number] = [0, 0];
        this.path.push([...cur]);
        cur = [1, 0];
        this.path.push([...cur]);
        cur = [1, 1];
        this.path.push([...cur]);

        let g = 0

        while (cur[0] < this.size - 2 || cur[1] < this.size - 2) {
            if (cur[0] < this.size - 2 && cur[1] < this.size - 2) {
                if (Math.random() < (g ? 0.4 : 0.6)) {
                    g = 0
                    cur[0]++;
                } else {
                    g = 1
                    cur[1]++;
                }
            } else if (cur[0] < this.size - 2) {
                cur[0]++;
            } else {
                cur[1]++;
            }
            this.path.push([...cur]);
        }

        cur = [this.size - 1, this.size - 2];
        this.path.push([...cur]);
        cur = [this.size - 1, this.size - 1];
        this.path.push([...cur]);
    }

    start(level:number){
        this.lastTick = Date.now();
        this.level = level;
        this.status = "waiting";
        this.waitingTimer = this.waitingTimerMax * 2;
        this.run();
    }

    on(event:string, listener:(...args: any[]) => void){
        this.event.on(event, listener);
    }

    off(event:string, listener:(...args: any[]) => void){
        this.event.off(event, listener);
    }

    emit(event:string, ...args:any[]){
        this.event.emit(event, ...args);
    }

    getInitData():GameInitData{
        return {
            size: this.size,
            path: this.path
        }
    }

    getTickData():GameTickData{
        return {
            health: this.health,
            units: this.units.map(unit => unit.getTickData()),
            enemies: this.enemies.map(enemy => enemy.getTickData()),
            projectiles: this.projectiles.map(projectile => projectile.getTickData()),
            waitingTimer: this.waitingTimer
        }
    }

    gameOver(){
        clearInterval(this.loop);
        this.status = "waiting";
        this.emit('gameOver', this.wave);
    }

    gameComplete(){
        clearInterval(this.loop);
        this.status = "waiting";
        this.emit('gameComplete');
    }

    tick(delta: number) {
        if (this.status === "waiting") {
            this.waitingTimer -= delta;
            if (this.waitingTimer <= 0) {
                this.startWave([new Enemy(0, 0, 0.4, 100, "basic", this.path), new Enemy(0, 0, 0.4, 100, "basic", this.path), new Enemy(0, 0, 0.4, 100, "basic", this.path), new Enemy(0, 0, 0.4, 100, "basic", this.path)]);
            }
        } else {
            // 적 이동
            this.enemies.forEach(enemy => {
                // 예시 목적으로 단순화된 경로 이동 구현
                enemy.move(delta);
            });

            // 유닛 및 발사체 업데이트
            this.units.forEach(unit => unit.tick(delta, this.enemies, this.projectiles));
            this.projectiles.forEach((projectile, index) => {
                projectile.tick(delta, this.enemies, this.projectiles);
                if (projectile.isOutOfBounds(this.size)) {
                    this.projectiles.splice(index, 1); // 화면 밖으로 나간 발사체 제거
                }
            });

            // 적이 모두 제거되었는지 확인
            if (this.enemies.length === 0 && this.enemySpawnQueue.length === 0) {
                this.emit('waveComplete', this.wave);
                this.projectiles = [];
                this.status = "waiting";
                this.waitingTimer = this.waitingTimerMax;
                if (this.wave >= this.maxWave) {
                    this.gameComplete();
                }
            }

            // 적이 목적지에 도달하면 체력 감소
            this.enemies.forEach((enemy, index) => {
                if (enemy.path.length === 0) {
                    this.health -= enemy.health;
                    this.enemies.splice(index, 1);
                }
            });

            // 게임 오버 조건 검사
            if (this.health <= 0) {
                this.gameOver();
            }
        }
    }

    startWave(enemies: Enemy[]) {
        this.wave++;
        this.status = "started";
        this.enemySpawnQueue = enemies;
        this.emit('waveStarted', this.wave);

        const spawnEnemy = () => {
            if (this.enemySpawnQueue.length > 0) {
                const enemy = this.enemySpawnQueue.shift();
                if (enemy) {
                    this.enemies.push(enemy);
                }
            } else {
                clearInterval(this.spawnInterval);
                // 모든 적이 제거되었을 때 새로운 웨이브를 시작하거나 게임을 종료하기 위한 조건을 여기에 추가할 수 있습니다.
            }
        };

        // 정해진 간격으로 대기열에서 적을 생성
        const spawnInterval = setInterval(spawnEnemy, this.enemySpawnInterval);
        this.spawnInterval = spawnInterval;
    }

    placeUnit(x: number, y: number, unitType: string) {
        // 유닛을 배치하는 예시 메서드, 실제 구현은 유닛 유형과 게임 로직에 따라 달라질 것입니다
        if (this.units.some(unit => unit.x === x && unit.y === y)) {
            return this.emit('unitPlacementFailed', 'A unit already exists at the specified location');
        }

        const unitData = units.find(unit => unit.type === unitType);
        const newUnit = new Unit(x, y, unitData.damage, unitData.rate, unitData.range, unitData.bulletSpeed, unitType, 1);
        this.units.push(newUnit);
        this.emit('unitPlaced', newUnit);
        return newUnit;
    }

    sellUnit(x: number, y: number) {
        const index = this.units.findIndex(unit => unit.x === x && unit.y === y);
        if (index !== -1) {
            const unit = this.units[index];
            this.units.splice(index, 1);
            this.emit('unitSold', unit);
            return unit;
        }
    }

    upgradeUnit(x: number, y: number) {
        const unit = this.units.find(unit => unit.x === x && unit.y === y);
        if (unit) {
            unit.lvl++;
            this.emit('unitUpgraded', unit);
            return unit;
        }
    }

    skipWave() {
        if(this.status === "waiting"){
            this.waitingTimer = 0;
        }
    }

    run() {
        const runTick = () => {
            const now = Date.now();
            const delta = now - this.lastTick;
            this.lastTick = now;
            this.tick(delta);
            this.emit('tick', this.getTickData());
        };

        this.loop = setInterval(runTick, 10);
    }
}

class Enemy {
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

    getTickData(): EnemyData{
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

class Unit {
    x: number;
    y: number;
    damage: number;
    rate: number;
    range: number;
    bulletSpeed: number;
    type: string;
    lvl: number;
    cooldown: number = 0; // To manage firing rate

    event:EventEmitter = new EventEmitter();

    constructor(x: number, y: number, damage: number, rate: number, range: number, bulletSpeed:number, type: string, lvl: number) {
        this.x = x;
        this.y = y;
        this.damage = damage;
        this.rate = rate;
        this.range = range;
        this.bulletSpeed = bulletSpeed;
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
            return distance <= this.range;
        });

        if (target) {
            // Calculate angle towards target
            const angle = Math.atan2(target.y - this.y, target.x - this.x);
            projectiles.push(new Projectile(this.x, this.y, angle, this.damage, this.bulletSpeed, this.type));
            this.cooldown = this.rate;
        }
    }

    getTickData(): UnitData{
        return { x: this.x, y: this.y, type: this.type, lvl: this.lvl };
    }
}

class Projectile {
    x: number;
    y: number;
    angle: number;
    damage: number;
    speed: number;
    type: string;
  
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

    getTickData(): ProjectileData{
        return { x: this.x, y: this.y, angle: this.angle, type: this.type };
    }

    isOutOfBounds(size: number): boolean {
        return this.x < 0 || this.x > size || this.y < 0 || this.y > size;
    }
}
