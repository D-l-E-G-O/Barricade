import { Board } from './core/Board.js';
import { GameUI } from './ui/GameUI.js';

document.addEventListener('DOMContentLoaded', () => {
    const board = new Board();
    const ui = new GameUI(board);
});
