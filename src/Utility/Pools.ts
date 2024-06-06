import {ComponentPool} from "./ComponentPool.ts";
import {InfectedComponent} from "../CellularAutomata/Component/InfectedComponent.ts";

export const InfectedPool = new ComponentPool<InfectedComponent>(() => new InfectedComponent())