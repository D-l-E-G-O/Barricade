import { Board } from "../core/Board.js";

interface Props {
    winnerId: number | null | undefined;
    board: Board;
    onPlayAgain: (newBoard: Board) => void;
    onBackToMenu: () => void;
}

export function GameOverModal({ winnerId, board, onPlayAgain, onBackToMenu }: Props) {
    if (!winnerId) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content glass-panel">
                <h2>Player {winnerId} Wins!</h2>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>

                    <button onClick={() => {
                        const newBoard = new Board(board.size, board.players.length);
                        onPlayAgain(newBoard);
                    }}>
                        Rematch
                    </button>

                    <button onClick={onBackToMenu} style={{ background: 'transparent' }}>
                        Menu
                    </button>

                </div>
            </div>
        </div>
    );
}
