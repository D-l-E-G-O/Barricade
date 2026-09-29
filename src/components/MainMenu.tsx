import { useState } from "react";
import { Board, type PlayerConfig } from "../core/Board.js";

interface Props {
    onStartGame: (board: Board, showRankings: boolean) => void;
}

export function MainMenu({ onStartGame }: Props) {
    const [menuSize, setMenuSize] = useState(9);
    const [menuPlayers, setMenuPlayers] = useState(2);
    const [playerConfig, setPlayerConfig] = useState<PlayerConfig[]>(['human', 'human', 'human', 'human']);
    const [showRankings, setShowRankings] = useState(false);

    const updateConfig = (index: number, val: PlayerConfig) => {
        const newConfig = [...playerConfig];
        newConfig[index] = val;
        setPlayerConfig(newConfig);
    };

    return (
        <div className="app-container">
            <div className="panel" style={{ padding: '2rem 4rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h1>Barricade</h1>

                <div style={{ margin: '0 auto', width: '100%', maxWidth: '300px' }}>
                    <h3 style={{ marginBottom: '0.5rem' }}>Board Size: {menuSize}x{menuSize}</h3>
                    <input type="range" min="5" max="19" step="2" value={menuSize} onChange={e => setMenuSize(Number(e.target.value))} style={{ width: '100%' }} />
                </div>

                <div style={{ margin: '0 auto', width: '100%', maxWidth: '300px' }}>
                    <h3 style={{ marginBottom: '0.5rem' }}>Players: {menuPlayers}</h3>
                    <input type="range" min="2" max="4" step="1" value={menuPlayers} onChange={e => setMenuPlayers(Number(e.target.value))} style={{ width: '100%' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: menuPlayers > 2 ? '1fr 1fr' : '1fr', gap: '1rem 2rem', marginTop: '0.5rem' }}>
                    {Array.from({ length: menuPlayers }).map((_, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                            <span style={{ fontWeight: '500', whiteSpace: 'nowrap' }}>Player {i + 1}:</span>
                            <select
                                value={playerConfig[i]}
                                onChange={(e) => updateConfig(i, e.target.value as PlayerConfig)}
                                style={{ padding: '0.5rem', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
                            >
                                <option value="human" style={{ color: 'black' }}>Human</option>
                                <option value="easy" style={{ color: 'black' }}>Easy Bot</option>
                                <option value="intermediate" style={{ color: 'black' }}>Intermediate Bot</option>
                                <option value="expert" style={{ color: 'black' }}>Expert Bot</option>
                            </select>
                        </div>
                    ))}
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <input type="checkbox"
                        checked={showRankings}
                        onChange={(e) => setShowRankings(e.target.checked)} />
                    Show player rankings
                </label>

                <button
                    onClick={() => onStartGame(new Board(menuSize, menuPlayers, playerConfig), showRankings)}
                    style={{ padding: '1rem 2rem', fontSize: '1.2rem', fontWeight: 'bold', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', cursor: 'pointer', marginTop: '1rem' }}
                >
                    Start Game
                </button>
            </div>
        </div>
    );
}
