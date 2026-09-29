import type { Board } from "../core/Board.js";
import { Pathfinder } from "../core/Pathfinder.js";

export function LiveRanking({ board }: { board: Board }) {
    const playerData = board.players.map(p => {
        const distance = Pathfinder.getRandomShortestPath(p)!.length;
        return { player: p, distance: distance };
    });

    const sortedPlayers = playerData.sort((a, b) => a.distance - b.distance);

    return (
        <aside className="left-sidebar panel">
            <div className="turn-indicator">
                Live Rankings
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                {sortedPlayers.map((p, index) => (
                    <div key={p.player.id} className="ranking-row">
                        <div className="ranking-player">
                            <span className={`ranking-rank ${index === 0 ? 'text-primary' : 'text-secondary'}`}>
                                #{index + 1}
                            </span>
                            <div className={`avatar p${p.player.id}-avatar`} style={{ width: '28px', height: '28px' }} />
                            <span className={`ranking-name ${index === 0 ? 'text-primary' : 'text-secondary'}`}>
                                Player {p.player.id}
                            </span>
                        </div>
                        <span className={`ranking-badge ${index === 0 ? 'text-primary' : 'text-secondary'}`}>
                            {p.distance} cells
                        </span>
                    </div>
                ))}
            </div>
        </aside>
    );
}