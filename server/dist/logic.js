"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Unit = exports.Game = void 0;
class Game {
    wave = 0;
    size = 20;
    path = [];
    units = [];
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
}
exports.Game = Game;
class Unit {
    x = 0;
    y = 0;
    damage = 1;
    range = 1;
    rate = 1;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
exports.Unit = Unit;
//# sourceMappingURL=logic.js.map