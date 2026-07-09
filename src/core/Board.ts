import { type Cell, Player, type Wall } from '../models/types.js';
import { Pathfinder } from './Pathfinder.js';

export class Board {
    public size: number;
    public grid: Cell[][];
    public placedWalls: Wall[];
    public players: Player[];
    public currentPlayerId: number = 1;

    private listeners: Array<() => void> = [];

    public constructor(size: number = 9, numPlayers: number = 2) {
        this.size = size;
        this.grid = [];
        this.placedWalls = [];
        this.players = [];

        this.grid = this.createGrid();
        this.linkGraph();

        const center = Math.floor(this.size / 2);
        const max = this.size - 1;

        this.players.push(new Player(this.grid[center]![0]!, 10, { axis: 'y', targetValue: max }, 1));
        this.players.push(new Player(this.grid[center]![max]!, 10, { axis: 'y', targetValue: 0 }, 2));
        if (numPlayers >= 3) {
            this.players.push(new Player(this.grid[0]![center]!, 10, { axis: 'x', targetValue: max }, 3));
        }
        if (numPlayers === 4) {
            this.players.push(new Player(this.grid[max]![center]!, 10, { axis: 'x', targetValue: 0 }, 4));
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

        const opponent = this.players.find(p => p !== player)!;

        const directions: ('up' | 'down' | 'left' | 'right')[] = ['up', 'down', 'left', 'right'];

        for (const dir of directions) {
            const adjacentCell = player.currentCell[dir];

            if (adjacentCell === null) continue;

            if (adjacentCell !== opponent.currentCell) {
                moves.push(adjacentCell);
                continue;
            }

            const jumpCell = opponent.currentCell[dir];

            if (jumpCell !== null) {
                moves.push(jumpCell);
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

        const p1CanWin = Pathfinder.hasPath(this.players[0]!);
        const p2CanWin = Pathfinder.hasPath(this.players[1]!);

        this.unblockPath(wall);

        return !p1CanWin || !p2CanWin;
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
