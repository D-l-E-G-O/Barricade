import { useState } from "react";
import { Board, type PlayerConfig } from "../core/Board.js";

interface Props {
    onStartGame: (board: Board) => void;
}

export function MainMenu({ onStartGame }: Props) {
    const [menuSize, setMenuSize] = useState(9);
    const [menuPlayers, setMenuPlayers] = useState(2);
    const [playerConfig, setPlayerConfig] = useState<PlayerConfig[]>(['human', 'human', 'human', 'human']);

    const updateConfig = (index: number, val: PlayerConfig) => {
        const newConfig = [...playerConfig];
        newConfig[index] = val;
        setPlayerConfig(newConfig);
    };

    return (
        <div className="app-container">
            <div className="glass-panel" style={{ padding: '3rem 5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <h1>Barricade</h1>

                <div>
                    <h3 style={{ marginBottom: '1rem' }}>Board Size: {menuSize}x{menuSize}</h3>
                    <input type="range" min="5" max="19" step="2" value={menuSize} onChange={e => setMenuSize(Number(e.target.value))} style={{ width: '100%' }} />
                </div>

                <div>
                    <h3 style={{ marginBottom: '1rem' }}>Players: {menuPlayers}</h3>
                    <input type="range" min="2" max="4" step="1" value={menuPlayers} onChange={e => setMenuPlayers(Number(e.target.value))} style={{ width: '100%' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                    {Array.from({ length: menuPlayers }).map((_, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>Player {i + 1}:</span>
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

                <button
                    onClick={() => onStartGame(new Board(menuSize, menuPlayers, playerConfig))}
                    style={{ padding: '1rem 2rem', fontSize: '1.2rem', fontWeight: 'bold', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', cursor: 'pointer', marginTop: '1rem' }}
                >
                    Start Game
                </button>
            </div>
        </div>
    );
}
