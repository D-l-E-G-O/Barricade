import { type Cell, Player } from '../models/types.js';

export class Pathfinder {
    public static hasPath(player: Player): boolean {
        const queue: Cell[] = [player.currentCell];
        const visited: Set<Cell> = new Set();

        visited.add(player.currentCell);

        while (queue.length > 0) {
            const current = queue.shift()!;

            if (
                (player.id === 1 && current.y === player.goalRow) ||
                (player.id === 2 && current.y === player.goalRow)
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
}
