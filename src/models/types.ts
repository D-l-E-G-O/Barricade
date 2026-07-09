export type Difficulty = 'easy' | 'intermediate' | 'expert';

export class Player {
    public currentCell: Cell;
    public barriersLeft: number;
    public goal: Goal;
    public id: number;
    public isBot: boolean;
    public difficulty: Difficulty | undefined;

    public constructor(currentCell: Cell, barriersLeft: number, goal: Goal, id: number, isBot: boolean = false, difficulty?: Difficulty) {
        this.currentCell = currentCell;
        this.barriersLeft = barriersLeft;
        this.goal = goal;
        this.id = id;
        this.isBot = isBot;
        this.difficulty = difficulty;
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