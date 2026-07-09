import type { Board } from "../core/Board.js";

interface CellProps {
    board: Board;
    x: number;
    y: number;
    onClick: () => void;
    isValidMove?: boolean;
}

export function Cell({ board, x, y, onClick, isValidMove }: CellProps) {
    const isPlayer1Here = board.players[0]?.currentCell.x === x && board.players[0]?.currentCell.y === y;
    const isPlayer2Here = board.players[1]?.currentCell.x === x && board.players[1]?.currentCell.y === y;
    const isPlayer3Here = board.players[2]?.currentCell.x === x && board.players[2]?.currentCell.y === y;
    const isPlayer4Here = board.players[3]?.currentCell.x === x && board.players[3]?.currentCell.y === y;

    return (
        <div className={`cell ${isValidMove ? 'valid-move' : ''}`} onClick={onClick}>
            {isPlayer1Here && <div className="player-token p1-token" />}
            {isPlayer2Here && <div className="player-token p2-token" />}
            {isPlayer3Here && <div className="player-token p3-token" />}
            {isPlayer4Here && <div className="player-token p4-token" />}
        </div>
    );
}
