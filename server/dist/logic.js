"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Enemy = exports.Unit = exports.Game = void 0;
class Game {
    wave = 0;
    size = 20;
    path = [];
    units = [];
    enemies = [];
    constructor() {
        const gridSize = 20;
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
    startWave() {
        this.wave++;
        let enemy = new Enemy(this.path[0][0], this.path[0][1]);
        enemy.health = this.wave;
        enemy.speed = 0.1;
        this.enemies.push(enemy);
    }
    moveEnemies() {
        this.enemies.forEach(enemy => {
            enemy.move(this.path);
        });
    }
    attackUnits() {
        this.units.forEach(unit => {
            unit.attack(this.enemies);
        });
    }
    checkEnemies() {
        this.enemies = this.enemies.filter(enemy => enemy.health > 0);
    }
    tick(delta) {
        this.moveEnemies();
        this.attackUnits();
        this.checkEnemies();
    }
}
exports.Game = Game;
class Unit {
    x = 0;
    y = 0;
    damage = 1;
    range = 1;
    rate = 1;
    curRate = 0;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    attack(enemies) {
        if (enemies.length === 0)
            return;
        let closestEnemy = enemies.reduce((prev, curr) => {
            let prevDist = Math.sqrt(Math.pow(prev.x - this.x, 2) + Math.pow(prev.y - this.y, 2));
            let currDist = Math.sqrt(Math.pow(curr.x - this.x, 2) + Math.pow(curr.y - this.y, 2));
            return prevDist < currDist ? prev : curr;
        });
        if (closestEnemy) {
            let dist = Math.sqrt(Math.pow(closestEnemy.x - this.x, 2) + Math.pow(closestEnemy.y - this.y, 2));
            if (dist <= this.range) {
                if (this.curRate === this.rate) {
                    closestEnemy.health -= this.damage;
                    this.curRate = 0;
                }
                else {
                    this.curRate++;
                }
            }
        }
    }
}
exports.Unit = Unit;
class Enemy {
    x = 0;
    y = 0;
    health = 1;
    speed = 1;
    pathIndex = 0;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    move(path) {
        if (this.pathIndex < path.length - 1) {
            // 현재 위치와 다음 위치 사이의 거리 계산
            const [nextX, nextY] = path[this.pathIndex + 1];
            const dx = nextX - this.x;
            const dy = nextY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < this.speed) {
                // 다음 경로 점에 도달하면, 인덱스 업데이트
                this.pathIndex++;
                this.x = nextX;
                this.y = nextY;
                if (this.pathIndex < path.length - 1) {
                    // 추가적으로 이동해야 할 거리가 있는 경우
                    this.move(path);
                }
            }
            else {
                // 경로를 따라 선형적으로 이동
                const ratio = this.speed / distance;
                this.x += dx * ratio;
                this.y += dy * ratio;
            }
        }
    }
}
exports.Enemy = Enemy;
//# sourceMappingURL=logic.js.map