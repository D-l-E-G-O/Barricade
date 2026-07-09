import type { Board } from "../core/Board.js";
import type { Wall } from "../models/types.js";

interface GapProps {
    board: Board;
    x: number;
    y: number;
    onClick: () => void;
    onMouseMove: (e: React.MouseEvent) => void;
    onMouseLeave: () => void;
    hoveredWall: Wall | null;
}

interface IntersectionProps {
    board: Board;
    x: number;
    y: number;
}

export function GapVertical({ board, x, y, onClick, onMouseMove, onMouseLeave, hoveredWall }: GapProps) {
    const hasWall = board.placedWalls.some(w => w.isVertical && w.x === x && (w.y === y || w.y + 1 === y));
    const isPreview = hoveredWall?.isVertical && hoveredWall.x === x && (hoveredWall.y === y || hoveredWall.y + 1 === y);
    return (
        <div
            className={`gap-v ${hasWall ? 'wall-placed' : ''} ${isPreview && !hasWall ? 'wall-preview' : ''}`}
            onClick={onClick}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
        />
    );
}

export function GapHorizontal({ board, x, y, onClick, onMouseMove, onMouseLeave, hoveredWall }: GapProps) {
    const hasWall = board.placedWalls.some(w => !w.isVertical && w.y === y && (w.x === x || w.x + 1 === x));
    const isPreview = !hoveredWall?.isVertical && hoveredWall?.y === y && (hoveredWall?.x === x || hoveredWall?.x + 1 === x);
    return (
        <div
            className={`gap-h ${hasWall ? 'wall-placed' : ''} ${isPreview && !hasWall ? 'wall-preview' : ''}`}
            onClick={onClick}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
        />
    );
}

export function Intersection({ board, x, y }: IntersectionProps) {
    const hasWall = board.placedWalls.some(w => w.x === x && w.y === y);
    return (
        <div className={`intersection ${hasWall ? 'wall-placed' : ''}`} />
    );
}
