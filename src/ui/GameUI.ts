export class GameUI {
    public constructor() {
        const board = document.getElementById('board')!

        for (let row = 0; row < 17; row++) {
            for (let col = 0; col < 17; col++) {
                const tile = document.createElement('div')
                if (row % 2 === 0) {
                    if (col % 2 === 0) {
                        tile.className = 'cell';
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
                board.appendChild(tile);
            }
        }
    }
}