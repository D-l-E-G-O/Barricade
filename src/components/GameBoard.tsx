import { useState } from 'react';
import type { Board } from "../core/Board.js";
import { Cell } from "./Cell.js";
import { GapHorizontal, GapVertical, Intersection } from "./Gap.js";

export function GameBoard({ board }: { board: Board }) {
    const [toastMsg, setToastMsg] = useState<string | null>(null);

    const showToast = (message: string) => {
        setToastMsg(message);
        setTimeout(() => {
            setToastMsg(null);
        }, 2000);
    };

    const handleCellClick = (x: number, y: number) => {
        const success = board.movePlayer(board.currentPlayerId, board.grid[x]![y]!);
        if (!success) showToast("Invalid Move!");
    };

    const handleWallClick = (x: number, y: number, isVertical: boolean) => {
        if (x === 8) x = 7;
        if (y === 8) y = 7;
        const success = board.placeWall(board.currentPlayerId, { x, y, isVertical });
        if (!success) showToast("Invalid Wall!");
    };

    return (
        <main className="game-area">
            <div className="board glass-panel">
                {Array.from({ length: 17 }).map((_, row) =>
                    Array.from({ length: 17 }).map((_, col) => {
                        const x = Math.floor(col / 2);
                        const y = Math.floor(row / 2);

                        if (row % 2 === 0 && col % 2 === 0) {
                            return (
                                <Cell
                                    key={`${col}-${row}`}
                                    board={board}
                                    x={x}
                                    y={y}
                                    onClick={() => handleCellClick(x, y)}
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
