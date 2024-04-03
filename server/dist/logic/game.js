"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const events_1 = require("events");
const db_1 = require("../db");
const unit_1 = require("./unit");
const enemy_1 = require("./enemy");
class Game {
    wave = 0;
    size = 20;
    health = 1000;
    path = [];
    level = 1;
    maxWave = 10;
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
        this.generatePath();
    }
    generatePath() {
        let cur = [0, 0];
        this.path.push([...cur]);
        cur = [1, 0];
        this.path.push([...cur]);
        cur = [1, 1];
        this.path.push([...cur]);
        let g = 0;
        while (cur[0] < this.size - 2 || cur[1] < this.size - 2) {
            if (cur[0] < this.size - 2 && cur[1] < this.size - 2) {
                if (Math.random() < (g ? 0.4 : 0.6)) {
                    g = 0;
                    cur[0]++;
                }
                else {
                    g = 1;
                    cur[1]++;
                }
            }
            else if (cur[0] < this.size - 2) {
                cur[0]++;
            }
            else {
                cur[1]++;
            }
            this.path.push([...cur]);
        }
        cur = [this.size - 1, this.size - 2];
        this.path.push([...cur]);
        cur = [this.size - 1, this.size - 1];
        this.path.push([...cur]);
    }
    init(lvl = 1) {
        this.lastTick = Date.now();
        this.level = lvl;
        this.maxWave = db_1.levels[lvl - 1].enemies.length;
        this.health = 1000;
        this.units = [];
        this.enemies = [];
        this.projectiles = [];
        this.wave = 0;
        this.status = "waiting";
        this.waitingTimer = this.waitingTimerMax * 2;
    }
    start() {
        this.lastTick = Date.now();
        this.run();
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
            size: this.size,
            path: this.path,
            maxWave: this.maxWave
        };
    }
    getTickData() {
        return {
            health: this.health,
            units: this.units.map(unit => unit.getTickData()),
            enemies: this.enemies.map(enemy => enemy.getTickData()),
            projectiles: this.projectiles.map(projectile => projectile.getTickData()),
            waitingTimer: this.waitingTimer
        };
    }
    gameOver() {
        clearInterval(this.loop);
        this.emit('gameOver', this.level, this.wave);
        this.init();
    }
    gameComplete() {
        clearInterval(this.loop);
        this.emit('gameComplete', this.level);
        this.init();
    }
    tick(delta) {
        if (this.status === "waiting") {
            this.waitingTimer -= delta;
            if (this.waitingTimer <= 0) {
                const enems = db_1.levels[this.level - 1].enemies[this.wave].map((enemyType) => {
                    const enemyData = db_1.enemies.find(enemy => enemy.type === enemyType);
                    let enemy;
                    if (!enemyData)
                        enemy = new enemy_1.Enemy(0, 0, 0.05, 100, 'basic', this.path);
                    enemy = new enemy_1.Enemy(0, 0, enemyData.speed, enemyData.health, enemyType, this.path);
                    enemy.on('dead', (type) => {
                        this.emit('enemyDead', db_1.enemies.find(enemy => enemy.type === type).coin);
                    });
                    enemy.on('motion-killed', (x, y) => {
                        this.emit('motion', `enemyKilled-${enemy.type}`, x, y);
                    });
                    enemy.on('motion-damaged', (x, y, damage) => {
                        this.emit('motion', `enemyDamaged-${enemy.type}`, x, y, damage);
                    });
                    return enemy;
                });
                this.startWave(enems);
            }
        }
        else { // 게임이 진행 중일 때
            // 적 업데이트
            this.enemies.forEach(enemy => {
                enemy.tick(delta, this.enemies);
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
    startWave(enemies) {
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
        const unitData = db_1.units.find(unit => unit.type === unitType);
        const newUnit = new unit_1.Unit(x, y, unitData.damage, unitData.rate, unitData.range, unitData.bulletSpeed, unitData.upgradeCost, unitData.cost, unitData.tags, unitType, 1);
        newUnit.on('motion-hit', (type, x, y) => {
            this.emit('motion', `projHit-${type}`, x, y);
        });
        newUnit.on('motion-fire', (type, x, y) => {
            this.emit('motion', `unitFire-${type}`, x, y);
        });
        this.units.push(newUnit);
        this.emit('unitPlaced', newUnit);
        return newUnit;
    }
    sellUnit(x, y) {
        const index = this.units.findIndex(unit => unit.x === x && unit.y === y);
        if (index !== -1) {
            const unit = this.units[index];
            this.units.splice(index, 1);
            this.emit('unitSold', unit);
            return unit;
        }
    }
    upgradeUnit(x, y) {
        let unit = this.units.find(unit => unit.x === x && unit.y === y);
        if (unit) {
            unit.lvl++;
            this.emit('unitUpgraded', unit);
            return unit;
        }
    }
    findUnit(x, y) {
        return this.units.find(unit => unit.x === x && unit.y === y);
    }
    skipWave() {
        if (this.status === "waiting") {
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
        this.loop = setInterval(runTick, 1000 / 60);
    }
    command(command) {
        const params = command.split(' ');
        const commander = params[0];
        switch (commander) {
            case 'place':
                if (params.length < 4)
                    return;
                if (+params[1] < 0 || +params[1] >= this.size || isNaN(+params[1]))
                    return;
                if (+params[2] < 0 || +params[2] >= this.size || isNaN(+params[2]))
                    return;
                if (!db_1.units.find(unit => unit.type === params[3]))
                    return;
                this.placeUnit(parseInt(params[1]), parseInt(params[2]), params[3]);
                break;
            case 'sell':
                if (params.length < 3)
                    return;
                if (+params[1] < 0 || +params[1] >= this.size || isNaN(+params[1]))
                    return;
                if (+params[2] < 0 || +params[2] >= this.size || isNaN(+params[2]))
                    return;
                this.sellUnit(parseInt(params[1]), parseInt(params[2]));
                break;
            case 'upgrade':
                if (params.length < 3)
                    return;
                if (+params[1] < 0 || +params[1] >= this.size || isNaN(+params[1]))
                    return;
                if (+params[2] < 0 || +params[2] >= this.size || isNaN(+params[2]))
                    return;
                this.upgradeUnit(parseInt(params[1]), parseInt(params[2]));
                break;
            case 'completeWave':
                clearInterval(this.spawnInterval);
                this.enemies = [];
                this.status = "waiting";
                this.waitingTimer = 0;
                this.emit('waveComplete', this.wave);
                this.projectiles = [];
                break;
            case 'skipWave':
                this.skipWave();
                break;
            case 'setWave':
                if (params.length < 2)
                    return;
                if (+params[1] < 0)
                    return;
                if (+params[1] > this.maxWave)
                    return;
                if (isNaN(+params[1]))
                    return;
                this.wave = +params[1];
                break;
            case 'killAll':
                this.enemies = [];
                break;
            case 'gameOver':
                this.gameOver();
                break;
            case 'gameComplete':
                this.gameComplete();
                break;
            case 'emit':
                this.emit(params[1], ...params.slice(2));
                break;
            case 'giveCoin':
                if (params.length < 2)
                    return;
                if (+params[1] < 0)
                    return;
                if (isNaN(+params[1]))
                    return;
                this.emit('coin', +params[1]);
                break;
            default:
                break;
        }
    }
}
exports.Game = Game;
//# sourceMappingURL=game.js.map