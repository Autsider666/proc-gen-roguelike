import {Entity, Rectangle, Scene, TileMap, Vector} from "excalibur";
import {Color} from "../Utility/Color.ts";
import {TileComponent} from "../Component/TileComponent.ts";
import {InfectionSpawnerSystem} from "../CellularAutomata/System/InfectionSpawnerSystem.ts";
import {GridComponent} from "../Component/GridComponent.ts";
import {NeighborComponent} from "../Component/NeighborComponent.ts";
import {CellularAutomatonSystem} from "../CellularAutomata/System/CellularAutomatonSystem.ts";

export class ArenaScene extends Scene {
    onActivate() {
        this.world.add(new InfectionSpawnerSystem(this.world, 500));
        this.world.add(CellularAutomatonSystem);
        this.engine.backgroundColor = Color.Black;

        const tileSize: number = 5;

        const rows = 100;
        const columns = 200;

        const background = new TileMap({
            name: 'background',
            pos: Vector.Zero,
            rows,
            columns,
            tileHeight: tileSize,
            tileWidth: tileSize,
        });
        background.z = -1;

        const backgroundGraphic = new Rectangle({
            height: tileSize,
            width: tileSize,
            color: Color.fromHex('#ABB2B9'),
            lineWidth: 1,
            strokeColor: Color.Black,
        });

        const WallGraphic = new Rectangle({
            height: tileSize,
            width: tileSize,
            color: Color.Brown,
            lineWidth: 1,
            strokeColor: Color.Black,
        });

        background.tiles.forEach(tile => {
            if (tile.x > 0 && tile.x < (columns - 1) && tile.y > 0 && tile.y < (rows - 1)) {
                tile.addGraphic(backgroundGraphic)
            } else {
                tile.addGraphic(WallGraphic)
                tile.solid = true;
            }
        });

        this.add(background);

        const infection = new TileMap({
            name: 'infection',
            pos: Vector.Zero,
            rows,
            columns,
            tileHeight: tileSize,
            tileWidth: tileSize,
        });

        infection.tiles.forEach(tile => {
            if (tile.x > 0 && tile.x < (columns - 1) && tile.y > 0 && tile.y < (rows - 1)) {
                tile.addGraphic(new Rectangle({
                    height: tileSize,
                    width: tileSize,
                    color: Color.Transparent,
                    // lineWidth: 1,
                    // strokeColor: Color.Black,
                }));

                const entity = new Entity({
                    components: [
                        new TileComponent(tile),
                        new GridComponent(tile.x,tile.y),
                        new NeighborComponent(),
                    ]
                });

                this.world.add(entity);
            }
        });

        this.add(infection);

        // this.add(new Player(new Vector(100,100)))
    }
}