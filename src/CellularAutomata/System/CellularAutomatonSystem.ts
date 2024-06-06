import {Entity, Query, System, SystemType, TagQuery, World} from "excalibur";
import {GridComponent} from "../../Component/GridComponent.ts";
import {TileComponent} from "../../Component/TileComponent.ts";
import {NeighborComponent} from "../../Component/NeighborComponent.ts";
import {IntervalSystem} from "../../System/IntervalSystem.ts";
import {CellComponent} from "../Component/CellComponent.ts";

export type CellType = typeof CellComponent | typeof GridComponent | typeof TileComponent | typeof NeighborComponent;
export const CellComponents = [GridComponent, TileComponent, NeighborComponent] as const;

export class CellularAutomatonSystem extends IntervalSystem {
    systemType: SystemType = SystemType.Draw;

    private cellQuery: Query<CellType>;

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
           const cell = entity.get(CellComponent);
            cell.alive ? this.reviveCell(entity) : this.killCell(entity);

            cell.on<'dead'>('dead',() => this.killCell(entity));
            cell.on<'alive'>('alive',() => this.reviveCell(entity));
        });

        this.cellQuery.entityRemoved$.subscribe(entity => {
            this.aliveCells.delete(entity)
            this.deadCells.delete(entity)
        });
    }

    private reviveCell(entity:Entity<CellComponent>): void {
        this.aliveCells.add(entity);
        this.deadCells.delete(entity);

        entity.get(CellComponent).resurrect();
    }

    private killCell(entity:Entity<CellComponent>): void {
        this.deadCells.add(entity);
        this.aliveCells.delete(entity);

        entity.get(CellComponent).kill();
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
            const livingNeighbourCount = cell.get(NeighborComponent).neighbors.filter(neighbor => neighbor.get(CellComponent)?.alive).length;
            if (livingNeighbourCount < this.minNeighborsToLive || livingNeighbourCount > this.maxNeighborsToLive) {
                killList.add(cell);
            }
        }

        // 4. Any dead cell with exactly three live neighbors becomes a live cell, as if by reproduction.
        const infectList = new Set<Entity>;
        for (const cell of this.deadCells) {
            const infectedNeighbors = cell.get(NeighborComponent).neighbors.filter(neighbor => neighbor.get(CellComponent)?.alive).length;
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


        // TODO check if kill/infectList contain some identical entities
        killList.forEach((cell: Entity) => this.killCell(cell));
        infectList.forEach(cell => this.reviveCell(cell));
    }
}