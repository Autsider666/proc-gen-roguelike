import {Component, Entity, EventEmitter} from "excalibur";
import {EventKey, EventMap, Handler, Subscription} from "excalibur/build/dist/EventEmitter";

type ComponentEvents = {
    add: { owner: Entity, component: EventComponent },
    remove: { previousOwner: Entity, component: EventComponent },
}

export abstract class EventComponent<TEventMap extends EventMap = {}> extends Component {
    public readonly events = new EventEmitter<TEventMap&ComponentEvents>();

    onAdd(owner: Entity) {
        this.events.emit<'add'>('add', {owner, component: this});
    }

    onRemove(previousOwner: Entity) {
        this.events.emit<'remove'>('remove', {previousOwner, component: this});
    }

    on<TEventName extends EventKey<TEventMap&ComponentEvents>>(eventName: TEventName, handler: Handler<TEventMap&ComponentEvents[TEventName]>): Subscription {
        return this.events.on(eventName, handler);
    }
}