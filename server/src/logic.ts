export class Game{
    wave:number = 0;
    size:number = 20;
    path:[number, number][] = [];
    units:Unit[] = [];
    constructor(){
        const gridSize = 20;
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
}

export class Unit{
    x:number = 0;
    y:number = 0;
    damage:number = 1;
    range:number = 1;
    rate:number = 1;
    constructor(x:number, y:number){
        this.x = x;
        this.y = y;
    }
}