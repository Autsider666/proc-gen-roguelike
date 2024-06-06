import {Entity, Query, System, SystemType, TagQuery, World} from "excalibur";
import {InfectedComponent} from "../Component/InfectedComponent.ts";
import {GridComponent} from "../../Component/GridComponent.ts";
import {TileComponent} from "../../Component/TileComponent.ts";
import {NeighborComponent} from "../../Component/NeighborComponent.ts";
import {InfectedPool} from "../../Utility/Pools.ts";
import {IntervalSystem} from "../../System/IntervalSystem.ts";

export type CellType = typeof GridComponent | typeof TileComponent | typeof NeighborComponent;
export const CellComponents = [GridComponent, TileComponent, NeighborComponent] as const;

export class CellularAutomatonSystem extends IntervalSystem {
    systemType: SystemType = SystemType.Draw;

    private cellQuery: Query<CellType>;
    private infectedCellQuery: Query<typeof InfectedComponent | CellType>;

    // private random: Random = new Random();

    private readonly aliveCells = new Set<Entity>();
    private readonly deadCells = new Set<Entity>();

    // private readonly minimalInfections: number = 20;
    private readonly minNeighborsToLive: number = 2;
    private readonly maxNeighborsToLive: number = 3;
    private readonly neighborsToInfect: number = 3;

    constructor(
        world: World,
        intervalMs: number = 500,
    ) {
        super(intervalMs);

        // noinspection TypeScriptValidateTypes
        this.cellQuery = world.query(CellComponents);
        this.cellQuery.entityAdded$.subscribe(entity => {
            if (entity.has(InfectedComponent)) {
                console.error('Not expecting any infected cells here.')
            }

            this.deadCells.add(entity);
            this.aliveCells.delete(entity);
        });

        this.cellQuery.entityRemoved$.subscribe(entity => {
            this.aliveCells.delete(entity)
            this.deadCells.delete(entity)
        });

        // noinspection TypeScriptValidateTypes
        this.infectedCellQuery = world.query([InfectedComponent, ...CellComponents]);
        this.infectedCellQuery.entityAdded$.subscribe(entity => {
            this.deadCells.delete(entity);
            this.aliveCells.add(entity);
        });

        this.infectedCellQuery.entityRemoved$.subscribe(entity => {
            this.aliveCells.delete(entity)
            this.deadCells.add(entity)
        });
    }

    update(elapsedMs: number): void {
        if (this.shouldWait(elapsedMs)) {
            return;
        }

        const killList = new Set<Entity>;
        for (const cell of this.aliveCells) {
            // 1. Any live cell with fewer than two live neighbors dies, as if by underpopulation.
            // 2. Any live cell with two or three live neighbors lives on to the next generation.
            // 3. Any live cell with more than three live neighbors dies, as if by overpopulation.
            const livingNeighbourCount = cell.get(NeighborComponent).neighbors.filter(neighbor => neighbor.has(InfectedComponent)).length;
            if (livingNeighbourCount < this.minNeighborsToLive || livingNeighbourCount > this.maxNeighborsToLive) {
                killList.add(cell);
            }
        }

        // 4. Any dead cell with exactly three live neighbors becomes a live cell, as if by reproduction.
        const infectList = new Set<Entity>;
        for (const cell of this.deadCells) {
            if (cell.has(InfectedComponent)) {
                continue;
            }

            const infectedNeighbors = cell.get(NeighborComponent).neighbors.filter(neighbor => neighbor.has(InfectedComponent)).length;
            if (infectedNeighbors === this.neighborsToInfect) {
                infectList.add(cell);
            }
        }

        // console.log({
        //     infected: Array.from(this.aliveCells).map(entity => ({
        //         x: entity.get(GridComponent).x,
        //         y: entity.get(GridComponent).y,
        //     })),
        //     uninfected: Array.from(this.deadCells).map(entity => ({
        //         x: entity.get(GridComponent).x,
        //         y: entity.get(GridComponent).y,
        //     })),
        //     died: Array.from(killList).map(entity => ({
        //         x: entity.get(GridComponent).x,
        //         y: entity.get(GridComponent).y,
        //     })),
        //     new: Array.from(infectList).map(entity => ({
        //         x: entity.get(GridComponent).x,
        //         y: entity.get(GridComponent).y,
        //     })),
        // });

        killList.forEach((cell: Entity) => {
            cell.removeComponent(InfectedComponent);
        });
        infectList.forEach(cell => {
            cell.addComponent(InfectedPool.requestComponent());
        });
    }
}