import {Component, Entity, Vector} from "excalibur";
import {GridComponent} from "./GridComponent.ts";
import Array2D from "../Utility/Array2D.ts";

const potentialNeighborDirections = [
    new Vector(-1, -1),
    new Vector(0, -1),
    new Vector(1, -1),
    new Vector(-1, 0),
    new Vector(1, 0),
    new Vector(-1, 1),
    new Vector(0, 1),
    new Vector(1, 1),
]

export class NeighborComponent extends Component {
    private static neighbours = new Map<Entity, Entity[]>();
    private static grid = new Array2D<Entity>();

    onAdd(owner: Entity) {
        const pos = owner.get(GridComponent)?.point;
        if (pos === undefined) {
            throw new Error('Why this happen?');
        }

        NeighborComponent.grid.set(pos.x, pos.y, owner);
    }

    get neighbors(): Entity[] {
        const owner = this.owner;
        const pos = owner?.get(GridComponent)?.point;
        if (owner === undefined || pos === undefined) {
            return [];
        }

        const knownNeighbors:Entity[]|undefined = NeighborComponent.neighbours.get(owner);
        if (knownNeighbors !== undefined){
            return knownNeighbors;
        }

        const neighbors: Entity[] = [];
        for (const direction of potentialNeighborDirections) {
            const potentialNeighbor = NeighborComponent.grid.get(pos.x + direction.x, pos.y + direction.y);
            if (potentialNeighbor === undefined) {
                continue;
            }

            neighbors.push(potentialNeighbor);
        }

        NeighborComponent.neighbours.set(owner, neighbors);

        return neighbors;
    }
}