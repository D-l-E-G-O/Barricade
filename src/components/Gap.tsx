import type { Board } from "../core/Board.js";

interface GapProps {
    board: Board;
    x: number;
    y: number;
    onClick?: () => void;
}

export function GapVertical({ board, x, y, onClick }: GapProps) {
    const hasWall = board.placedWalls.some(w => w.isVertical && w.x === x && (w.y === y || w.y + 1 === y));
    return (
        <div
            className={`gap-v ${hasWall ? 'wall-placed' : ''}`}
            onClick={onClick}
        />
    );
}

export function GapHorizontal({ board, x, y, onClick }: GapProps) {
    const hasWall = board.placedWalls.some(w => !w.isVertical && w.y === y && (w.x === x || w.x + 1 === x));
    return (
        <div
            className={`gap-h ${hasWall ? 'wall-placed' : ''}`}
            onClick={onClick}
        />
    );
}

export function Intersection({ board, x, y }: GapProps) {
    const hasWall = board.placedWalls.some(w => w.x === x && w.y === y);
    return (
        <div className={`intersection ${hasWall ? 'wall-placed' : ''}`} />
    );
}
