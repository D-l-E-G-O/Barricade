import type { Board } from "../core/Board.js";

export function PlayerInfo({ board, playerId }: { board: Board; playerId: 1 | 2 }) {
    return (
        <div className={`player-info ${board.currentPlayerId === playerId ? 'active' : ''}`}>
            <div className={`avatar p${playerId}-avatar`}></div>
            <div>
                <h3>Player {playerId}</h3>
                <p>Walls: <span>{board.players[playerId - 1]!.barriersLeft}</span></p>
            </div>
        </div>
    )
}