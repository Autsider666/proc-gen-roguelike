import {BoundingBox, Entity, Query, Random, SystemType, World} from "excalibur";
import {InfectedComponent} from "../Component/InfectedComponent.ts";
import {GridComponent} from "../../Component/GridComponent.ts";
import {TileComponent} from "../../Component/TileComponent.ts";
import Array2D from "../../Utility/Array2D.ts";
import {PatternLoader} from "../Utility/PatternLoader.ts";
import {CellComponents, CellType} from "./CellularAutomatonSystem.ts";
import {InfectedPool} from "../../Utility/Pools.ts";
import {IntervalSystem} from "../../System/IntervalSystem.ts";

export class InfectionSpawnerSystem extends IntervalSystem {
    systemType: SystemType = SystemType.Draw;

    private infectedQuery: Query<typeof InfectedComponent | CellType>;
    private cellQuery: Query<CellType>;

    private readonly random = new Random();

    private readonly infectedTiles = new Set<Entity<typeof InfectedComponent | CellType>>();
    private readonly deadCells = new Set<Entity<CellType>>();

    private readonly worldBounds: BoundingBox = new BoundingBox(0, 0, 0, 0);
    private readonly infectableMap = new Array2D<Entity<typeof GridComponent | typeof TileComponent>>();



    constructor(
        world: World,
        private readonly minimalInfections: number = 10,
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

            const grid = entity.get(GridComponent);
            this.infectableMap.set(grid.x,grid.y,entity);
            if (!this.worldBounds.contains(grid.point)) {
                this.worldBounds.left = Math.min(this.worldBounds.left, grid.x);
                this.worldBounds.right = Math.max(this.worldBounds.right, grid.x);
                this.worldBounds.top = Math.min(this.worldBounds.top, grid.y);
                this.worldBounds.bottom = Math.max(this.worldBounds.bottom, grid.y);
            }
        });
        this.cellQuery.entityRemoved$.subscribe(entity => {
            this.deadCells.delete(entity);
            this.infectedTiles.delete(entity);

            const grid = entity.get(GridComponent);
            this.infectableMap.delete(grid.x,grid.y);
        });

        // noinspection TypeScriptValidateTypes
        this.infectedQuery = world.query([InfectedComponent, ...CellComponents]);
        this.infectedQuery.entityAdded$.subscribe(entity => {
            this.infectedTiles.add(entity);
            this.deadCells.delete(entity);

            const grid = entity.get(GridComponent);
            this.infectableMap.delete(grid.x,grid.y);
        });
        this.infectedQuery.entityRemoved$.subscribe(entity => {
            this.infectedTiles.delete(entity);
            this.deadCells.add(entity);

            const grid = entity.get(GridComponent);
            this.infectableMap.set(grid.x,grid.y, entity);
        });
    }

    update(elapsedMs: number): void {
        if (this.shouldWait(elapsedMs)) {
            return;
        }

        if (this.infectedTiles.size >= this.minimalInfections) {
            return;
        }

        let pattern = PatternLoader.getRandom();

        const validTiles = Array.from(this.deadCells).filter(tile => {
            const point = tile.get(GridComponent).point;
            const translation = pattern.bounds.translate(point);
            return this.worldBounds.contains(translation);
        });

        if (validTiles.length === 0) {
            console.log('No valid tiles found for ', pattern);
            return;
        }

        let tries = 10;
        while (tries > 0) {
            tries--;
            const randomTile = this.random.pickOne(validTiles);
            // if (pattern.velocity && playerPos) {
            //     const targetAngle = playerPos.sub(randomTile.pos).toAngle();
            //     const patternAngle = pattern.velocity.toAngle();
            //
            //     let rotation = 0;
            //     while (Math.abs(targetAngle - (patternAngle + rotation)) > Math.PI / 4) {
            //         rotation += Math.PI / 2;
            //
            //         if (rotation > 2 * Math.PI) {
            //             rotation = 0;
            //             break;
            //         }
            //     }
            //
            //
            //     if (rotation > 0) {
            //         pattern = pattern.rotate(rotation);
            //         const divideToDegree = (Math.PI * 2) / 360;
            //         console.log('rotated by', rotation / divideToDegree);
            //
            //         // console.log({
            //         //     pattern: pattern.velocity,
            //         //     patternAngle:(pattern.velocity?.toAngle() ?? 0)/divideToDegree,
            //         //     test: (new Vector(0,-1)).toAngle()/divideToDegree,
            //         //     playerPos,
            //         //     tile:randomTile.pos,
            //         //     directionToTarget:playerPos.sub(randomTile.pos),
            //         //     angleToPlayer: targetAngle/divideToDegree,
            //         //     angleOfPattern: patternAngle/divideToDegree,
            //         //     addedRotation: rotation/divideToDegree,
            //         //     remainingDifference:Math.abs(targetAngle-(patternAngle+rotation))/divideToDegree,
            //         //     resultingAngle:(patternAngle+rotation)/divideToDegree,
            //         // });
            //     }
            // }

            const tilesToInfect: Entity[] = [];
            const gridPos = randomTile.get(GridComponent);
            for (const point of pattern.points) {
                const x = gridPos.x + point.x;
                const y = gridPos.y + point.y;
                const tile = this.infectableMap.get(x, y);
                if (!tile) {
                    continue;
                }

                tilesToInfect.push(tile);
            }

            if (tilesToInfect.length !== pattern.points.length) {
                continue;
            }

            tilesToInfect.forEach(tile => tile.addComponent(InfectedPool.requestComponent()));

            break;
        }
    }

}