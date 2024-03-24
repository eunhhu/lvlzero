"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const events_1 = require("events");
class Game {
    wave = 0;
    size = 20;
    health = 100;
    path = [];
    units = [];
    enemies = [];
    projectiles = [];
    loop;
    spawnInterval;
    event = new events_1.EventEmitter();
    enemySpawnQueue = [];
    enemySpawnInterval = 1000;
    waitingTimer = 0;
    waitingTimerMax = 10000;
    status = "waiting";
    lastTick = Date.now();
    constructor() {
        const gridSize = this.size;
        const visited = Array.from({ length: gridSize }, () => Array(gridSize).fill(false));
        let currentColumn = Math.floor(Math.random() * (gridSize - 1)) + 1;
        let currentRow = 0;
        this.path.push([currentRow, currentColumn]);
        visited[currentRow][currentColumn] = true;
        while (currentRow < gridSize - 1) {
            const possibleMoves = [
                [currentRow + 1, currentColumn],
                [currentRow, currentColumn - 1],
                [currentRow, currentColumn + 1],
            ];
            const validMoves = possibleMoves.filter(([row, column]) => {
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
    on(event, listener) {
        this.event.on(event, listener);
    }
    off(event, listener) {
        this.event.off(event, listener);
    }
    emit(event, ...args) {
        this.event.emit(event, ...args);
    }
    getInitData() {
        return {
            wave: this.wave,
            health: this.health,
            size: this.size,
            path: this.path
        };
    }
    getTickData() {
        return {
            wave: this.wave,
            health: this.health,
            units: this.units.map(unit => unit.getTickData()),
            enemies: this.enemies.map(enemy => enemy.getTickData()),
            projectiles: this.projectiles.map(projectile => projectile.getTickData())
        };
    }
    gameOver() {
        clearInterval(this.loop);
        this.status = "waiting";
        this.emit('gameOver');
    }
    tick(delta) {
        if (this.status === "waiting") {
            this.waitingTimer -= delta;
            if (this.waitingTimer <= 0) {
                this.startWave([new Enemy(0, 0, 0.1, 10, "basic", this.path)]);
            }
        }
        else {
            // 적 이동
            this.enemies.forEach(enemy => {
                // 예시 목적으로 단순화된 경로 이동 구현
                enemy.move();
            });
            // 유닛 및 발사체 업데이트
            this.units.forEach(unit => unit.tick(this.enemies, this.projectiles));
            this.projectiles.forEach((projectile, index) => {
                projectile.tick(this.enemies, this.projectiles);
                if (projectile.isOutOfBounds(this.size)) {
                    this.projectiles.splice(index, 1); // 화면 밖으로 나간 발사체 제거
                }
            });
            // 적이 모두 제거되었는지 확인
            if (this.enemies.length === 0 && this.enemySpawnQueue.length === 0) {
                this.status = "waiting";
                this.waitingTimer = this.waitingTimerMax;
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
    startWave(enemies) {
        this.status = "started";
        this.enemySpawnQueue = enemies;
        const spawnEnemy = () => {
            if (this.enemySpawnQueue.length > 0) {
                const enemy = this.enemySpawnQueue.shift();
                if (enemy) {
                    this.enemies.push(enemy);
                }
            }
            else {
                clearInterval(this.spawnInterval);
                // 모든 적이 제거되었을 때 새로운 웨이브를 시작하거나 게임을 종료하기 위한 조건을 여기에 추가할 수 있습니다.
            }
        };
        // 정해진 간격으로 대기열에서 적을 생성
        const spawnInterval = setInterval(spawnEnemy, this.enemySpawnInterval);
        this.spawnInterval = spawnInterval;
    }
    placeUnit(x, y, unitType) {
        // 유닛을 배치하는 예시 메서드, 실제 구현은 유닛 유형과 게임 로직에 따라 달라질 것입니다
        if (this.units.some(unit => unit.x === x && unit.y === y)) {
            return this.emit('unitPlacementFailed', 'A unit already exists at the specified location');
        }
        const newUnit = new Unit(x, y, 10, 1000, 5, 5, unitType, 1);
        this.units.push(newUnit);
        this.emit('unitPlaced', newUnit);
    }
    removeUnit(x, y) {
        const index = this.units.findIndex(unit => unit.x === x && unit.y === y);
        if (index !== -1) {
            const removedUnit = this.units.splice(index, 1)[0];
            this.emit('unitRemoved', removedUnit);
        }
        else {
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
exports.Game = Game;
class Enemy {
    x;
    y;
    speed;
    health;
    type;
    path = [];
    event = new events_1.EventEmitter();
    constructor(x, y, speed, health, type, path) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.health = health;
        this.type = type;
        this.path = [...path];
    }
    // Method to move the enemy along the path
    move() {
        if (this.path.length === 0)
            return;
        const [nextX, nextY] = this.path[0];
        const dx = nextX - this.x;
        const dy = nextY - this.y;
        const distance = Math.hypot(dx, dy);
        if (distance <= this.speed) {
            this.x = nextX;
            this.y = nextY;
            this.path.shift();
        }
        else {
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        }
    }
    takeDamage(damage) {
        this.health -= damage;
    }
    getTickData() {
        return { x: this.x, y: this.y, health: this.health, type: this.type };
    }
}
class Unit {
    x;
    y;
    damage;
    rate;
    range;
    bulletSpeed;
    type;
    lvl;
    cooldown = 0; // To manage firing rate
    event = new events_1.EventEmitter();
    constructor(x, y, damage, rate, range, bulletSpeed, type, lvl) {
        this.x = x;
        this.y = y;
        this.damage = damage;
        this.rate = rate;
        this.range = range;
        this.bulletSpeed = bulletSpeed;
        this.type = type;
        this.lvl = lvl;
    }
    tick(enemies, projectiles) {
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
    getTickData() {
        return { x: this.x, y: this.y, type: this.type, lvl: this.lvl };
    }
}
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
    tick(enemies, projectiles) {
        // Move the projectile
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        // Check collision with enemies
        for (let enemy of enemies) {
            if (Math.hypot(this.x - enemy.x, this.y - enemy.y) < 1 /* assuming size of hitbox */) {
                enemy.takeDamage(this.damage);
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
//# sourceMappingURL=logic.js.map