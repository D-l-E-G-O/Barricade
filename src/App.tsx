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

    return (
        <div className="app-container">
            <GameHeader board={board} />
            <GameBoard board={board} />
        </div>
    );
}
