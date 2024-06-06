import {Component, Entity, EventEmitter} from "excalibur";

type ComponentEvents = {
    add: { owner: Entity, component: EventComponent },
    remove: { previousOwner: Entity, component: EventComponent },
}

export abstract class EventComponent extends Component {
    public readonly events = new EventEmitter<ComponentEvents>();

    onAdd(owner: Entity) {
        this.events.emit<'add'>('add', {owner, component: this});
    }

    onRemove(previousOwner: Entity) {
        this.events.emit<'remove'>('remove', {previousOwner, component: this});
    }
}