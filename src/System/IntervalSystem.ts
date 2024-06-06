import {System} from "excalibur";

export abstract class IntervalSystem extends System {
    protected constructor(
        protected readonly intervalMs: number,
        protected nextMs: number = 0,
    ) {
        super();
    }

    shouldWait(elapsedMs: number): boolean {
        this.nextMs -= elapsedMs;
        if (this.nextMs > 0) {
            return true;
        }

        this.nextMs = this.intervalMs;

        return false;
    }
}