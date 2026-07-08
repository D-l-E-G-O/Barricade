import { Board } from '../core/Board.js';

export class GameUI {
    private board: Board;

    public constructor(board: Board) {
        this.board = board;
        const boardElement = document.getElementById('board')!

        for (let row = 0; row < 17; row++) {
            for (let col = 0; col < 17; col++) {
                const tile = document.createElement('div')
                if (row % 2 === 0) {
                    if (col % 2 === 0) {
                        tile.className = 'cell';
                        tile.addEventListener('click', () => {
                            const targetCell = this.board.grid[col / 2]![row / 2]!;
                            const success = this.board.movePlayer(this.board.currentPlayerId, targetCell);
                            if (success) {
                                this.updateVisuals();
                            }
                        });
                    }
                    else {
                        tile.className = 'gap-v';
                    }
                }
                else {
                    if (col % 2 === 0) {
                        tile.className = 'gap-h';
                    }
                    else {
                        tile.className = 'intersection';
                    }
                }

                // Translate grid coordinates
                tile.dataset.x = String(Math.floor(col / 2));
                tile.dataset.y = String(Math.floor(row / 2));
                boardElement.appendChild(tile);
            }
        }

        this.updateVisuals();
    }

    private updateVisuals() {
        this.updatePlayerToken(1);
        this.updatePlayerToken(2);
    }

    private updatePlayerToken(playerIndex: number) {
        const cell = this.board.players[playerIndex - 1]!.currentCell;
        const domCell = document.querySelector(`.cell[data-x="${cell.x}"][data-y="${cell.y}"]`);

        if (domCell) {
            // Try to find the token if it already exists
            let playerDiv = document.querySelector(`.p${playerIndex}-token`);

            // Create it if it doesn't exist
            if (!playerDiv) {
                playerDiv = document.createElement('div');
                playerDiv.className = `player-token p${playerIndex}-token`;
            }

            // Append it. If it already exists, it'll just automatically move it from the old cell to the new cell.
            domCell.appendChild(playerDiv);
        }
    }
}