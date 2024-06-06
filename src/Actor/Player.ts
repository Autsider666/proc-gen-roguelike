import {BaseActor} from "./BaseActor.ts";
import {CollisionType, Engine, Keys, Vector} from "excalibur";
import {Color} from "../Utility/Color.ts";

export class Player extends BaseActor {
    constructor(pos:Vector = Vector.Zero) {
        super({
            pos,
            radius: 10,
            color: Color.ExcaliburBlue,
            collisionType: CollisionType.Active,
            z: 1,
        });

    }

    onPostUpdate(engine: Engine, delta: number) {
        engine.input.keyboard.on<'hold'>("hold", (evt) => {
            let dir = Vector.Zero;
            switch (evt.key) {
                case Keys.A:
                case Keys.Left:
                    dir = Vector.Left;
                    break;
                case Keys.D:
                case Keys.Right:
                    dir = Vector.Right;
                    break;
                case Keys.S:
                case Keys.Down:
                    dir = Vector.Down;
                    break;
                case Keys.W:
                case Keys.Up:
                    dir = Vector.Up;
                    break;
                default:
                    return;
            }
            if (dir.size === 0) {
                return;
            }

            this.pos = this.pos.clone().add(dir.clone().normalize().scale(delta/1000));
        });
    }
}