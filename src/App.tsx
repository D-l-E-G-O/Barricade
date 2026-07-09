import { useState, useEffect, useRef } from 'react';
import { Board } from './core/Board.js';
import { GameBoard } from './components/GameBoard.js';
import { PlayerInfo } from './components/PlayerInfo.js';
import { MainMenu } from './components/MainMenu.js';
import { GameOverModal } from './components/GameOverModal.js';

export function App() {
    const [gameState, setGameState] = useState<'menu' | 'playing'>('menu');

    const boardRef = useRef(new Board());
    const board = boardRef.current;

    const [, setTick] = useState(0);
    useEffect(() => {
        board.subscribe(() => setTick(t => t + 1));
    }, [board]);

    if (gameState === 'menu') {
        return <MainMenu onStartGame={(newBoard) => {
            newBoard.subscribe(() => setTick(t => t + 1));
            boardRef.current = newBoard;
            setGameState('playing');
        }} />;
    }

    const isGameOver = board.isGameOver();
    const winnerId = isGameOver ? board.players.find(
        p => (p.goal.axis === 'x' && p.currentCell.x === p.goal.targetValue) ||
            (p.goal.axis === 'y' && p.currentCell.y === p.goal.targetValue)
    )?.id : null;

    return (
        <div className="dashboard-layout">

            <div className="top-left-title">
                <h1>Barricade</h1>
            </div>

            <div />

            <main>
                <GameBoard board={board} />
            </main>

            <aside className="right-sidebar glass-panel">
                <button className="back-btn" onClick={() => setGameState('menu')}>
                    ← Back to Menu
                </button>
                <div className="turn-indicator" style={{ marginTop: '2rem' }}>
                    Player {board.currentPlayerId} Turn
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
                    {board.players.map(p => <PlayerInfo key={p.id} board={board} playerId={p.id} />)}
                </div>
            </aside>

            <GameOverModal
                winnerId={winnerId}
                board={board}
                onPlayAgain={(newBoard) => {
                    newBoard.subscribe(() => setTick(t => t + 1));
                    boardRef.current = newBoard;
                    setTick(t => t + 1);
                }}
                onBackToMenu={() => setGameState('menu')}
            />
        </div>
    );
}
