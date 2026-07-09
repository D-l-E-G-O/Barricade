import type { Board } from "../core/Board.js";
import { PlayerInfo } from "./PlayerInfo.js";

export function GameHeader({ board }: { board: Board }) {
    return (
        <header className="glass-panel">
            <h1>Barricade</h1>
            <div className="game-info">
                <PlayerInfo board={board} playerId={1} />

                <div className="turn-indicator">
                    Player {board.currentPlayerId} Turn
                </div>

                <PlayerInfo board={board} playerId={2} />
            </div>
        </header>
    );
}
