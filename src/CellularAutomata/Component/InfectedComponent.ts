import {Component, Entity, Raster} from "excalibur";
import {TileComponent} from "../../Component/TileComponent.ts";
import {Color} from "../../Utility/Color.ts";
import {EventComponent} from "../../Component/EventComponent.ts";

type BackupData = {
    color?: Color,
}

export class InfectedComponent extends EventComponent {
    private backup: BackupData = {};

    constructor() {
        super();
    }

    onAdd(owner: Entity) {
        super.onAdd(owner);
        const tile = owner.get(TileComponent)?.tile;
        if (tile === undefined) {
            throw new Error('Does not work without a tile');
        }

        for (const graphic of tile.getGraphics()) {
            if (graphic instanceof Raster) {
                this.backup.color = graphic.color;
                graphic.color = Color.Red;
                return;
            }
        }
    }

    onRemove(previousOwner: Entity) {
        super.onRemove(previousOwner);
        const tile = previousOwner.get(TileComponent)?.tile;
        if (tile === undefined) {
            throw new Error('Does not work without a tile');
        }

        for (const graphic of tile.getGraphics()) {
            if (graphic instanceof Raster && this.backup.color) {
                graphic.color = this.backup.color;
                return;
            }
        }
    }
}