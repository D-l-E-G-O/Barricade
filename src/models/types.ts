export class Player {
    public currentCell: Cell;
    public barriersLeft: number;
    public goal: Goal;
    public id: number;

    public constructor(currentCell: Cell, barriersLeft: number, goal: Goal, id: number) {
        this.currentCell = currentCell;
        this.barriersLeft = barriersLeft;
        this.goal = goal;
        this.id = id;
    }
}

export interface Goal {
    axis: 'x' | 'y';
    targetValue: number;
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