import { useEffect, useRef, useState } from 'react';
import { Board } from './core/Board.js';
import { GameBoard } from './components/GameBoard.js';
import { GameHeader } from './components/GameHeader.js';

export function App() {
    const boardRef = useRef(new Board());
    const board = boardRef.current;

    const [, setTick] = useState(0);
    useEffect(() => {
        board.subscribe(() => setTick(t => t + 1));
    }, []);

    const isGameOver = board.isGameOver();
    const winnerId = isGameOver ? (board.players[0]!.currentCell.y === 8 ? 1 : 2) : null;

    return (
        <div className="app-container">
            <GameHeader board={board} />
            <GameBoard board={board} />

            {isGameOver && (
                <div className="modal-overlay">
                    <div className="modal-content glass-panel">
                        <h2>Player {winnerId} Wins!</h2>
                        <button onClick={() => {
                            const newBoard = new Board();
                            newBoard.subscribe(() => setTick(t => t + 1));
                            boardRef.current = newBoard;
                            setTick(t => t + 1);
                        }}>
                            Play Again
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
