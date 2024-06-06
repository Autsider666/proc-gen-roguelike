import './style.css'
import {DisplayMode, Engine} from "excalibur";
import {ArenaScene} from "./Scene/ArenaScene.ts";
import {PatternLoader} from "./CellularAutomata/Utility/PatternLoader.ts";

await PatternLoader.load();

const game = new Engine({
    scenes: {
        arena: ArenaScene,
    },
    displayMode: DisplayMode.FitScreenAndZoom,
    // height: 200,
    // width: 300,
});

game.goToScene('arena')

await game.start();