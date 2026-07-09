import { type Cell, Player, type Wall, type Difficulty } from '../models/types.js';
import { Pathfinder } from './Pathfinder.js';

export type PlayerConfig = 'human' | 'easy' | 'intermediate' | 'expert';

export class Board {
    public size: number;
    public grid: Cell[][];
    public placedWalls: Wall[];
    public players: Player[];
    public currentPlayerId: number = 1;

    private listeners: Array<() => void> = [];

    public constructor(size: number = 9, numPlayers: number = 2, config: PlayerConfig[] = []) {
        this.size = size;
        this.grid = [];
        this.placedWalls = [];
        this.players = [];

        this.grid = this.createGrid();
        this.linkGraph();

        const center = Math.floor(this.size / 2);
        const max = this.size - 1;

        const spawnData = [
            { startX: center, startY: 0, goalAxis: 'y' as const, goalValue: max },
            { startX: center, startY: max, goalAxis: 'y' as const, goalValue: 0 },
            { startX: 0, startY: center, goalAxis: 'x' as const, goalValue: max },
            { startX: max, startY: center, goalAxis: 'x' as const, goalValue: 0 }
        ];

        const totalWalls = Math.round((this.size * this.size) / 4);
        const barriers = Math.floor(totalWalls / numPlayers);

        for (let i = 0; i < numPlayers; i++) {
            const id = i + 1;
            const data = spawnData[i]!;
            const cfg = config[i] || 'human';

            const isBot = cfg !== 'human';
            const diff = isBot ? cfg as Difficulty : undefined;

            const startCell = this.grid[data.startX]![data.startY]!;
            const goal = { axis: data.goalAxis, targetValue: data.goalValue };
            
            this.players.push(new Player(startCell, barriers, goal, id, isBot, diff));
        }
    }

    private createGrid(): Cell[][] {
        const grid: Cell[][] = [];
        for (let x = 0; x < this.size; x++) {
            grid[x] = [];
            for (let y = 0; y < this.size; y++) {
                grid[x]![y] = { x, y, up: null, down: null, left: null, right: null };
            }
        }
        return grid;
    }

    private linkGraph(): void {
        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.size; y++) {
                const cell = this.grid[x]![y]!;

                if (x > 0) {
                    cell.left = this.grid[x - 1]![y]!;
                }

                if (x < this.size - 1) {
                    cell.right = this.grid[x + 1]![y]!;
                }

                if (y > 0) {
                    cell.up = this.grid[x]![y - 1]!;
                }

                if (y < this.size - 1) {
                    cell.down = this.grid[x]![y + 1]!;
                }
            }
        }
    }

    private executeWithTurnSafety(playerId: number, action: () => boolean): boolean {
        if (playerId !== this.currentPlayerId) return false;

        const success = action();

        if (success) {
            this.switchTurn();
            this.notify();
        }
        return success;
    }

    private switchTurn() {
        this.currentPlayerId = (this.currentPlayerId % this.players.length) + 1;
    }

    public movePlayer(playerId: number, targetCell: Cell): boolean {
        return this.executeWithTurnSafety(playerId, () => {
            const player = this.players[playerId - 1]!;

            const allowedMoves = this.getValidMoves(player);

            if (!allowedMoves.includes(targetCell)) {
                return false;
            }

            player.currentCell = targetCell;

            return true;
        });
    }

    public getValidMoves(player: Player): Cell[] {
        const moves: Cell[] = [];

        // Pre-calculate all cells currently occupied by opponents
        const occupiedCells = new Set<Cell>();
        for (const p of this.players) {
            if (p.id !== player.id) {
                occupiedCells.add(p.currentCell);
            }
        }

        const directions: ('up' | 'down' | 'left' | 'right')[] = ['up', 'down', 'left', 'right'];

        for (const dir of directions) {
            const adjacentCell = player.currentCell[dir];

            if (adjacentCell === null) continue;

            if (!occupiedCells.has(adjacentCell)) {
                moves.push(adjacentCell);
            } else {
                // If an opponent is in the adjacent cell, we can jump over them!
                const jumpCell = adjacentCell[dir];

                // Ensure the jump landing cell exists and is NOT occupied by another player
                if (jumpCell !== null && !occupiedCells.has(jumpCell)) {
                    moves.push(jumpCell);
                }
            }
        }
        return moves;
    }

    public placeWall(playerId: number, wall: Wall): boolean {
        return this.executeWithTurnSafety(playerId, () => {
            const player = this.players[playerId - 1]!;

            if (
                player.barriersLeft <= 0 ||
                !this.isValidWallPlacement(wall) ||
                this.isBlockingAllPaths(wall)
            ) {
                return false;
            }

            this.blockPath(wall);

            this.placedWalls.push(wall);
            player.barriersLeft--;

            return true;
        });
    }

    public simulateWall<T>(wall: Wall, evaluator: () => T): T | null {
        if (!this.isValidWallPlacement(wall)) return null;

        this.blockPath(wall);

        let isTrappingSomeone = false;
        for (const p of this.players) {
            if (!Pathfinder.hasPath(p)) {
                isTrappingSomeone = true;
                break;
            }
        }

        if (isTrappingSomeone) {
            this.unblockPath(wall);
            return null;
        }

        const result = evaluator();

        this.unblockPath(wall);
        return result;
    }

    public isValidWallPlacement(wall: Wall): boolean {
        // Check bounds
        if (
            wall.x < 0 ||
            wall.x >= this.size - 1 ||
            wall.y < 0 ||
            wall.y >= this.size - 1
        ) {
            return false;
        }

        // Check all overlapping rules
        return !this.placedWalls.some(w => {
            // Same spot and same orientation
            if (
                w.x === wall.x &&
                w.y === wall.y &&
                w.isVertical === wall.isVertical
            )
                return true;

            // The Cross (same spot, but different orientation)
            if (
                w.x === wall.x &&
                w.y === wall.y &&
                w.isVertical !== wall.isVertical
            )
                return true;

            // Horizontal half-overlap
            if (
                !wall.isVertical &&
                !w.isVertical &&
                w.y === wall.y &&
                Math.abs(w.x - wall.x) === 1
            )
                return true;

            // Vertical half-overlap
            if (
                wall.isVertical &&
                w.isVertical &&
                w.x === wall.x &&
                Math.abs(w.y - wall.y) === 1
            )
                return true;

            return false;
        });
    }

    private blockPath(wall: Wall) {
        const topLeft = this.grid[wall.x]![wall.y]!;
        const topRight = this.grid[wall.x + 1]![wall.y]!;
        const bottomLeft = this.grid[wall.x]![wall.y + 1]!;
        const bottomRight = this.grid[wall.x + 1]![wall.y + 1]!;

        if (wall.isVertical) {
            topLeft.right = null;
            topRight.left = null;
            bottomLeft.right = null;
            bottomRight.left = null;
        } else {
            topLeft.down = null;
            topRight.down = null;
            bottomLeft.up = null;
            bottomRight.up = null;
        }
    }

    private unblockPath(wall: Wall) {
        const topLeft = this.grid[wall.x]![wall.y]!;
        const topRight = this.grid[wall.x + 1]![wall.y]!;
        const bottomLeft = this.grid[wall.x]![wall.y + 1]!;
        const bottomRight = this.grid[wall.x + 1]![wall.y + 1]!;

        if (wall.isVertical) {
            topLeft.right = topRight;
            topRight.left = topLeft;
            bottomLeft.right = bottomRight;
            bottomRight.left = bottomLeft;
        } else {
            topLeft.down = bottomLeft;
            topRight.down = bottomRight;
            bottomLeft.up = topLeft;
            bottomRight.up = topRight;
        }
    }

    private isBlockingAllPaths(wall: Wall): boolean {
        this.blockPath(wall);

        let isTrappingSomeone = false;

        for (const player of this.players) {
            if (!Pathfinder.hasPath(player)) {
                isTrappingSomeone = true;
                break;
            }
        }

        this.unblockPath(wall);
        return isTrappingSomeone;
    }

    public subscribe(listener: () => void) {
        this.listeners.push(listener);
    }

    private notify() {
        for (const listener of this.listeners) {
            listener();
        }
    }

    public isGameOver() {
        for (const player of this.players) {
            const goal = player.goal;
            const current = player.currentCell;
            if ((goal.axis === 'x' && current.x === goal.targetValue) ||
                (goal.axis === 'y' && current.y === goal.targetValue)) {
                return true;
            }
        }
        return false;
    }
}
