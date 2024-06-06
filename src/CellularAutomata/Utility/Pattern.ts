import {BoundingBox, Vector} from "excalibur";
import './PatternSchema.ts';
import {PatternData} from "./PatternSchema.ts";

export class Pattern {
    public readonly bounds: BoundingBox;

    constructor(
        public readonly points: Vector[],
        private readonly outerBounds: Vector[] = [],
        public readonly velocity?: Vector
    ) {
        this.bounds = BoundingBox.fromPoints(points.concat(outerBounds));
    }

    rotate(angle: number): Pattern {
        return new Pattern(
            this.points.map(point => point.rotate(angle, this.bounds.center)),
            this.outerBounds.map(point => point.rotate(angle, this.bounds.center)),
            this.velocity?.rotate(angle, this.bounds.center),
        );
    }

    static fromCellsString(cells: string): Pattern {
        const points: Vector[] = [];
        const lines = cells.split(/\r?\n/);
        let y = 0;
        for (const line of lines) {
            if (line.startsWith('!')) {
                continue;
            }

            let x = 0;
            const character = line.split('');
            for (const char of character) {
                if (char === 'O') {
                    points.push(new Vector(x, y));
                }
                x++;
            }

            y++;
        }

        return new Pattern(points);
    }

    static fromJSON(cells: PatternData): Pattern {
        return new Pattern(
            cells.points.map(point => new Vector(point.x,point.y)),
            cells.outerBounds?.map(point => new Vector(point.x,point.y)),
            cells.velocity ? new Vector(cells.velocity.x,cells.velocity.x): undefined,
        );
    }
}
