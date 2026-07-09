import { type Cell, Player } from '../models/types.js';

export class Pathfinder {
    public static hasPath(player: Player): boolean {
        const queue: Cell[] = [player.currentCell];
        const visited: Set<Cell> = new Set();

        visited.add(player.currentCell);

        while (queue.length > 0) {
            const current = queue.shift()!;

            if (
                (player.goal.axis === 'y' && current.y === player.goal.targetValue) ||
                (player.goal.axis === 'x' && current.x === player.goal.targetValue)
            ) {
                return true;
            }

            const directions: ('up' | 'down' | 'left' | 'right')[] = ['up', 'down', 'left', 'right'];
            for (const dir of directions) {
                const neighbor = current[dir];

                if (neighbor && !visited.has(neighbor)) {
                    visited.add(neighbor);
                    queue.push(neighbor);
                }
            }
        }

        return false;
    }

    public static getRandomShortestPath(player: Player): Cell[] | null {
        const queue: Cell[] = [player.currentCell];
        const visited: Set<Cell> = new Set();
        const parents: Map<Cell, Cell> = new Map();
        visited.add(player.currentCell);
        while (queue.length > 0) {
            const current = queue.shift()!;
            if (
                (player.goal.axis === 'y' && current.y === player.goal.targetValue) ||
                (player.goal.axis === 'x' && current.x === player.goal.targetValue)
            ) {
                const path: Cell[] = [];
                let curr: Cell | undefined = current;
                while (curr) {
                    path.unshift(curr);
                    curr = parents.get(curr);
                }
                return path;
            }
            const directions: ('up' | 'down' | 'left' | 'right')[] = ['up', 'down', 'left', 'right'];

            directions.sort(() => Math.random() - 0.5);

            for (const dir of directions) {
                const neighbor = current[dir];
                if (neighbor && !visited.has(neighbor)) {
                    visited.add(neighbor);
                    parents.set(neighbor, current);
                    queue.push(neighbor);
                }
            }
        }
        return null;
    }
}
