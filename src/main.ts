import './style.css'
import {Engine} from "excalibur";
import {ArenaScene} from "./Scene/ArenaScene.ts";
import {PatternLoader} from "./CellularAutomata/Utility/PatternLoader.ts";

await PatternLoader.load();

const game = new Engine({
    scenes: {
        arena: ArenaScene,
    },
});

game.goToScene('arena')

await game.start();