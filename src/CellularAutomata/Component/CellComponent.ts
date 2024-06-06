import {Entity, Graphic, Raster, Rectangle} from "excalibur";
import {Color} from "../../Utility/Color.ts";
import {TileComponent} from "../../Component/TileComponent.ts";
import {EventComponent} from "../../Component/EventComponent.ts";

type CellEvents = {
    'alive': void,
    'dead': void,
}

export class CellComponent extends EventComponent<CellEvents> {
    private static aliveGraphics = new Map<number, Graphic>;

    private readonly aliveGraphic: Graphic;
    private backupGraphic: Graphic;

    constructor(
        graphicSize: number,
        private isAlive: boolean = false,
    ) {
        super();

        let graphic = CellComponent.aliveGraphics.get(graphicSize);
        if (graphic === undefined) {
            graphic = new Rectangle({
                height: graphicSize,
                width: graphicSize,
                color: Color.Red,
                lineWidth: 1,
                strokeColor: Color.Gray,
            });

            CellComponent.aliveGraphics.set(graphicSize, graphic);
        }

        this.aliveGraphic = graphic;
    }

    get alive():boolean {
        return this.isAlive;
    }

    onAdd(owner: Entity) {
        const tile = owner.get(TileComponent)?.tile;
        if (tile === undefined) {
            throw new Error('Does not work without a tile');
        }

        for (const graphic of tile.getGraphics()) {
            if (graphic instanceof Raster) {
                this.backupGraphic = graphic;
            }
        }
    }

    onRemove(previousOwner: Entity) {
        super.onRemove(previousOwner);

        this.remove();
    }

    kill(): void {
        if (!this.alive) {
            return;
        }

        this.remove();
        this.events.emit('dead');
    }

    private remove():void {
        this.isAlive = false;
        const owner = this.owner;
        const tile = owner?.get(TileComponent)?.tile;
        if (tile === undefined) {
            throw new Error('Does not work without a tile');
        }

        tile.clearGraphics();
        tile.addGraphic(this.backupGraphic);
    }

    resurrect(): void {
        if (this.alive) {
            return;
        }

        this.isAlive = true;
        this.events.emit('alive')
        const owner = this.owner;
        const tile = owner?.get(TileComponent)?.tile;
        if (tile === undefined) {
            throw new Error('Does not work without a tile');
        }

        tile.clearGraphics();
        tile.addGraphic(this.aliveGraphic);
    }
}