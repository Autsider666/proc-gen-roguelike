import {EventComponent} from "../Component/EventComponent.ts";

type BuilderCallback<C extends EventComponent> = () => C;

export class ComponentPool<C extends EventComponent> {
    private readonly deadPool: C[] = [];
    private readonly activePool: C[] = [];
    private readonly builderCallback: BuilderCallback<C>;

    constructor(builderCallback: BuilderCallback<C>, cleanupCallback?: (component: C) => void) {
        this.builderCallback = () => {
            const component = builderCallback();
            component.events.on<'remove'>('remove', () => {
                this.activePool.splice(this.activePool.indexOf(component), 1);
                this.deadPool.push(component);

                if (cleanupCallback) {
                    cleanupCallback(component);
                }
            });

            console.debug('new', component.constructor.name, Date.now());

            return component;
        };
    }

    public requestComponent(): C {
        const component = this.deadPool.pop() ?? this.builderCallback();
        this.activePool.push(component);

        return component;
    }

    get activeComponents(): C[] {
        return this.activePool;
    }

    get deadComponents(): C[] {
        return this.deadPool;
    }
}