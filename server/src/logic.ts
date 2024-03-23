import { EventEmitter } from "events";

export class Game{
    wave:number = 0;
    size:number = 20;
    health:number = 100;
    path:[number, number][] = [];

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
        const gridSize = this.size;
        const visited: boolean[][] = Array.from({ length: gridSize }, () => Array(gridSize).fill(false));

        let currentColumn = Math.floor(Math.random() * (gridSize-1)) + 1;
        let currentRow = 0;

        this.path.push([currentRow, currentColumn]);
        visited[currentRow][currentColumn] = true;

        while (currentRow < gridSize - 1) {
            const possibleMoves: [number, number][] = [
                [currentRow + 1, currentColumn],
                [currentRow, currentColumn - 1],
                [currentRow, currentColumn + 1],
            ];

            const validMoves: [number, number][] = possibleMoves.filter(([row, column]) => {
                return row >= 0 && column >= 0 && row < gridSize && column < gridSize && !visited[row][column];
            });

            if (validMoves.length === 0) {
                break;
            }

            const nextMove = validMoves[Math.floor(Math.random() * validMoves.length)];
            [currentRow, currentColumn] = nextMove;

            this.path.push(nextMove);
            visited[currentRow][currentColumn] = true;
        }
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
            wave: this.wave,
            health: this.health,
            size: this.size,
            path: this.path
        }
    }

    getTickData():GameTickData{
        return {
            wave: this.wave,
            health: this.health,
            units: this.units.map(unit => unit.getTickData()),
            enemies: this.enemies.map(enemy => enemy.getTickData()),
            projectiles: this.projectiles.map(projectile => projectile.getTickData())
        }
    }

    gameOver(){
        clearInterval(this.loop);
        this.status = "waiting";
        this.emit('gameOver');
    }

    tick(delta: number) {
        if (this.status === "waiting") {
            this.waitingTimer -= delta;
            if (this.waitingTimer <= 0) {
                this.startWave(this.enemySpawnQueue);
            }
        } else {
            // 적 이동
            this.enemies.forEach(enemy => {
                // 예시 목적으로 단순화된 경로 이동 구현
                if (this.path.length > 0) enemy.move(this.path);
            });

            // 유닛 및 발사체 업데이트
            this.units.forEach(unit => unit.tick(this.enemies, this.projectiles, this.path));
            this.projectiles.forEach((projectile, index) => {
                projectile.tick(this.enemies);
                if (projectile.isOutOfBounds(this.size)) {
                    this.projectiles.splice(index, 1); // 화면 밖으로 나간 발사체 제거
                }
            });

            // 게임 오버 조건 검사
            if (this.health <= 0) {
                this.gameOver();
            }

            // 적이 모두 제거되었는지 확인
            if (this.enemies.length === 0 && this.enemySpawnQueue.length === 0) {
                this.status = "waiting";
                this.waitingTimer = this.waitingTimerMax;
            }

            // 적이 목적지에 도달하면 체력 감소
            this.enemies.forEach((enemy, index) => {
                if (enemy.x === this.path[this.path.length - 1][0] && enemy.y === this.path[this.path.length - 1][1]) {
                    this.health -= 10;
                    this.enemies.splice(index, 1);
                }
            });
        }
    }

    startWave(enemies: Enemy[]) {
        this.status = "started";
        this.enemySpawnQueue = enemies;

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
        const newUnit = new Unit(x, y, 10, 1000, 5, 5, unitType, 1);
        this.units.push(newUnit);
        this.emit('unitPlaced', newUnit);
    }

    removeUnit(x: number, y: number) {
        const index = this.units.findIndex(unit => unit.x === x && unit.y === y);
        if (index !== -1) {
            const removedUnit = this.units.splice(index, 1)[0];
            this.emit('unitRemoved', removedUnit);
        } else {
            this.emit('unitRemovalFailed', 'No unit found at the specified location');
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

        this.loop = setInterval(runTick, 50);
    }
}

class Enemy {
    x: number;
    y: number;
    speed: number;
    health: number;
    type: string;
  
    constructor(x: number, y: number, speed: number, health: number, type: string) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.health = health;
        this.type = type;
    }
  
    // Method to move the enemy along the path
    move(path: [number, number][]): void {
        // Implementation will be simplified for the purpose of this example
        const nextPosition = path.shift();
        if (nextPosition) {
            [this.x, this.y] = nextPosition;
        }
    }
  
    takeDamage(damage: number): void {
        this.health -= damage;
    }
  
    getTickData(): EnemyData{
        return { x: this.x, y: this.y, health: this.health, type: this.type };
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

    tick(enemies: Enemy[], projectiles: Projectile[], path: [number, number][]): void {
        if (this.cooldown > 0) {
            this.cooldown -= 50; // Assuming tick is called every 50 ms
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

    tick(enemies: Enemy[]): void {
    // Move the projectile
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;

    // Check collision with enemies
        for (let enemy of enemies) {
            if (Math.hypot(this.x - enemy.x, this.y - enemy.y) < 1 /* assuming size of hitbox */) {
                enemy.takeDamage(this.damage);
                // Assuming projectile is destroyed on hit, otherwise implement logic for that
                break;
            }
        }
    }

    getTickData(): ProjectileData{
        return { x: this.x, y: this.y, angle: this.angle, type: this.type };
    }

    isOutOfBounds(size: number): boolean {
        return this.x < 0 || this.x > size || this.y < 0 || this.y > size;
    }
}
