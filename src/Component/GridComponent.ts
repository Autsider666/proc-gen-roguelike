import {Component, Vector} from "excalibur";

export class GridComponent extends Component {
    public readonly point: Vector;
    constructor(
        public readonly x: number,
        public readonly y: number,
    ) {
        super();

        this.point = new Vector(x,y)
    }
}