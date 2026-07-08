export class Player {
    public currentCell: Cell;
    public barriersLeft: number;
    public goalRow: number;
    public id: 1 | 2;

    public constructor(currentCell: Cell, barriersLeft: number, goalRow: number, id: 1 | 2) {
        this.currentCell = currentCell;
        this.barriersLeft = barriersLeft;
        this.goalRow = goalRow;
        this.id = id;
    }
}

export interface Cell {
    x: number;
    y: number;
    up: Cell | null;
    down: Cell | null;
    left: Cell | null;
    right: Cell | null;
}

export interface Wall {
    x: number;
    y: number;
    isVertical: boolean;
}