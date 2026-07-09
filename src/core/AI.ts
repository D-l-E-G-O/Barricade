import { Board } from "./Board.js";
import { Pathfinder } from "./Pathfinder.js";
import { type Cell, Player, type Wall } from "../models/types.js";

export class AI {
    public static playTurn(board: Board, player: Player): void {
        if (player.difficulty === 'expert') {
            this.playExpert(board, player);
        } else if (player.difficulty === 'intermediate') {
            this.playIntermediate(board, player);
        } else {
            this.playEasy(board, player);
        }
    }

    private static playEasy(board: Board, player: Player): void {
        const path = Pathfinder.getRandomShortestPath(player);
        const validMoves = board.getValidMoves(player);

        if (path && path.length > 1) {
            const nextStep = path[1];

            const optimalMove = validMoves.find(m => m.x === nextStep!.x && m.y === nextStep!.y);

            if (optimalMove) {
                board.movePlayer(player.id, optimalMove);
                return;
            }
        }

        if (validMoves.length > 0) {
            const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
            board.movePlayer(player.id, randomMove!);
        }
    }

    private static playIntermediate(board: Board, player: Player): void {
        const myPath = Pathfinder.getRandomShortestPath(player);
        if (!myPath) {
            this.playEasy(board, player);
            return;
        }

        // 1. Threat Assessment: Find the closest opponent
        let bestOpponent: Player | null = null;
        let opponentPath: Cell[] | null = null;
        let minOpponentDistance = Infinity;
        for (const p of board.players) {
            if (p.id === player.id) continue;
            const path = Pathfinder.getRandomShortestPath(p);
            if (path && path.length < minOpponentDistance) {
                minOpponentDistance = path.length;
                bestOpponent = p;
                opponentPath = path;
            }
        }

        // 2. Decide: If an opponent is beating us (or tied) and we have walls, block them
        if (player.barriersLeft > 0 && opponentPath && minOpponentDistance <= myPath.length) {

            // 15% chance to ignore the threat and move forward
            if (Math.random() < 0.15) {
                this.playEasy(board, player);
                return;
            }

            // Randomly block one of their next 3 steps
            const transitions = [];
            for (let i = 0; i < Math.min(3, opponentPath.length - 1); i++) {
                transitions.push({ A: opponentPath[i]!, B: opponentPath[i + 1]! });
            }
            transitions.sort(() => Math.random() - 0.5);

            // 3. Try to place a wall directly on their path
            for (const { A, B } of transitions) {
                const possibleWalls: Wall[] = [];

                // If they are moving vertically, we need a horizontal wall
                if (A.x === B.x) {
                    const minY = Math.min(A.y, B.y);
                    if (A.x >= 0 && A.x < board.size - 1) possibleWalls.push({ x: A.x, y: minY, isVertical: false });
                    if (A.x - 1 >= 0) possibleWalls.push({ x: A.x - 1, y: minY, isVertical: false });
                }

                // If they are moving horizontally, we need a vertical wall
                else if (A.y === B.y) {
                    const minX = Math.min(A.x, B.x);
                    if (A.y >= 0 && A.y < board.size - 1) possibleWalls.push({ x: minX, y: A.y, isVertical: true });
                    if (A.y - 1 >= 0) possibleWalls.push({ x: minX, y: A.y - 1, isVertical: true });
                }

                // Randomize which of the two possible walls we use to block the gap
                possibleWalls.sort(() => Math.random() - 0.5);

                // 4. Try placing the walls
                for (const wall of possibleWalls) {
                    if (board.placeWall(player.id, wall)) {
                        return;
                    }
                }
            }
        }

        // 5. Fallback: If we couldn't block them (or we are winning), just move
        this.playEasy(board, player);
    }

    private static playExpert(board: Board, player: Player): void {
        const myPath = Pathfinder.getRandomShortestPath(player);
        if (!myPath) { this.playEasy(board, player); return; }

        let bestAction: { type: 'move', cell: Cell } | { type: 'wall', wall: Wall } | null = null;
        let maxScore = -Infinity;

        // Helper: Score the board state. We multiply opponent distance by 1.5 
        // to mathematically prioritize delaying them over advancing ourselves.
        const getScore = (myLen: number, minOpp: number) => {
            return (minOpp * 1.5) - myLen;
        };

        // 1. Simulate all Valid Moves
        const validMoves = board.getValidMoves(player);
        for (const move of validMoves) {
            const originalCell = player.currentCell;
            player.currentCell = move;

            const pathAfterMove = Pathfinder.getRandomShortestPath(player);
            if (pathAfterMove) {
                let minOpp = Infinity;
                for (const p of board.players) {
                    if (p.id === player.id) continue;
                    const path = Pathfinder.getRandomShortestPath(p);
                    if (path && path.length < minOpp) minOpp = path.length;
                }

                const score = getScore(pathAfterMove.length, minOpp) + (Math.random() * 0.01);
                if (score > maxScore) {
                    maxScore = score;
                    bestAction = { type: 'move', cell: move };
                }
            }

            // Revert step
            player.currentCell = originalCell;
        }

        // 2. Simulate Candidate Walls
        if (player.barriersLeft > 0) {
            const candidateWalls: Wall[] = [];

            // Only evaluate walls that directly intersect an opponent's path
            for (const p of board.players) {
                if (p.id === player.id) continue;
                const path = Pathfinder.getRandomShortestPath(p);
                if (!path) continue;

                for (let i = 0; i < path.length - 1; i++) {
                    const A = path[i]!;
                    const B = path[i + 1]!;
                    if (A.x === B.x) {
                        const minY = Math.min(A.y, B.y);
                        if (A.x >= 0 && A.x < board.size - 1) candidateWalls.push({ x: A.x, y: minY, isVertical: false });
                        if (A.x - 1 >= 0) candidateWalls.push({ x: A.x - 1, y: minY, isVertical: false });
                    } else if (A.y === B.y) {
                        const minX = Math.min(A.x, B.x);
                        if (A.y >= 0 && A.y < board.size - 1) candidateWalls.push({ x: minX, y: A.y, isVertical: true });
                        if (A.y - 1 >= 0) candidateWalls.push({ x: minX, y: A.y - 1, isVertical: true });
                    }
                }
            }

            for (const wall of candidateWalls) {
                board.simulateWall(wall, () => {
                    // Recalculate my path because my own wall might block me!
                    const newMyPath = Pathfinder.getRandomShortestPath(player);
                    if (!newMyPath) return; 

                    let minOpp = Infinity;
                    for (const p of board.players) {
                        if (p.id === player.id) continue;
                        const path = Pathfinder.getRandomShortestPath(p);
                        if (path && path.length < minOpp) minOpp = path.length;
                    }

                    // Flat penalty of -0.5 to discourage wasting walls on 0-step delays
                    const score = getScore(newMyPath.length, minOpp) - 0.5 + (Math.random() * 0.01);
                    if (score > maxScore) {
                        maxScore = score;
                        bestAction = { type: 'wall', wall: wall };
                    }
                });
            }
        }

        // 3. Execute Best Action
        const action = bestAction as { type: 'move', cell: Cell } | { type: 'wall', wall: Wall } | null;
        if (action) {
            if (action.type === 'move') {
                board.movePlayer(player.id, action.cell);
            } else {
                board.placeWall(player.id, action.wall);
            }
        } else {
            this.playEasy(board, player);
        }
    }
}
