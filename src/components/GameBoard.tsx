import { useState } from 'react';
import type { Board } from "../core/Board.js";
import type { Wall } from "../models/types.js";
import { Cell } from "./Cell.js";
import { GapHorizontal, GapVertical, Intersection } from "./Gap.js";

export function GameBoard({ board }: { board: Board }) {
    const domSize = (board.size * 2) - 1;
    const totalUnits = (board.size * 3) + ((board.size - 1) * 1);

    const [toastMsg, setToastMsg] = useState<string | null>(null);
    const currentPlayer = board.players[board.currentPlayerId - 1]!;
    const validMoves = board.getValidMoves(currentPlayer);
    const [hoveredWall, setHoveredWall] = useState<Wall | null>(null);

    const showToast = (message: string) => {
        setToastMsg(message);
        setTimeout(() => {
            setToastMsg(null);
        }, 2000);
    };

    const handleGapMouseMove = (e: React.MouseEvent, x: number, y: number, isVertical: boolean) => {
        const rect = e.currentTarget.getBoundingClientRect();
        let wallX = x;
        let wallY = y;

        if (isVertical) {
            const isTopHalf = (e.clientY - rect.top) < (rect.height / 2);
            if (isTopHalf && y > 0) wallY = y - 1;
        } else {
            const isLeftHalf = (e.clientX - rect.left) < (rect.width / 2);
            if (isLeftHalf && x > 0) wallX = x - 1;
        }

        wallX = Math.min(wallX, board.size - 2);
        wallY = Math.min(wallY, board.size - 2);
        const previewWall = { x: wallX, y: wallY, isVertical };
        if (board.isValidWallPlacement(previewWall)) {
            setHoveredWall(previewWall);
        } else {
            setHoveredWall(null);
        }
    };

    const handleMouseLeave = () => setHoveredWall(null);

    const handleCellClick = (x: number, y: number) => {
        const success = board.movePlayer(board.currentPlayerId, board.grid[x]![y]!);
        if (!success) showToast("Invalid Move!");
    };

    const handleWallClick = (x: number, y: number, isVertical: boolean) => {
        if (x === board.size - 1) x = board.size - 2;
        if (y === board.size - 1) y = board.size - 2;
        const success = board.placeWall(board.currentPlayerId, { x, y, isVertical });
        if (!success) showToast("Invalid Wall!");
    };

    return (
        <main className="game-area">
            <div className="board glass-panel"
                style={{
                    '--cell-size': `calc(min(80vh, 60vw) * 3 / ${totalUnits})`,
                    '--gap-size': `calc(min(80vh, 60vw) * 1 / ${totalUnits})`,

                    gridTemplateColumns: `repeat(${board.size - 1}, var(--cell-size) var(--gap-size)) var(--cell-size)`,
                    gridTemplateRows: `repeat(${board.size - 1}, var(--cell-size) var(--gap-size)) var(--cell-size)`
                } as React.CSSProperties}
            >
                {Array.from({ length: domSize }).map((_, row) =>
                    Array.from({ length: domSize }).map((_, col) => {
                        const x = Math.floor(col / 2);
                        const y = Math.floor(row / 2);

                        if (row % 2 === 0 && col % 2 === 0) {
                            const isVal = validMoves.some(m => m.x === x && m.y === y);
                            return (
                                <Cell
                                    key={`${col}-${row}`}
                                    board={board}
                                    x={x}
                                    y={y}
                                    onClick={() => handleCellClick(x, y)}
                                    isValidMove={isVal}
                                />
                            );
                        }

                        if (row % 2 === 0) {
                            return (
                                <GapVertical
                                    key={`${col}-${row}`}
                                    board={board}
                                    x={x}
                                    y={y}
                                    onClick={() => handleWallClick(x, y, true)}
                                    onMouseMove={(e) => handleGapMouseMove(e, x, y, true)}
                                    onMouseLeave={handleMouseLeave}
                                    hoveredWall={hoveredWall}
                                />
                            );
                        }

                        if (col % 2 === 0) {
                            return (
                                <GapHorizontal
                                    key={`${col}-${row}`}
                                    board={board}
                                    x={x}
                                    y={y}
                                    onClick={() => handleWallClick(x, y, false)}
                                    onMouseMove={(e) => handleGapMouseMove(e, x, y, false)}
                                    onMouseLeave={handleMouseLeave}
                                    hoveredWall={hoveredWall}
                                />
                            );
                        }

                        return (
                            <Intersection
                                key={`${col}-${row}`}
                                board={board}
                                x={x}
                                y={y}
                            />
                        );
                    })
                )}
            </div>

            {toastMsg && (
                <div className="toast">
                    {toastMsg}
                </div>
            )}
        </main>
    );
}
