export const EventNames = {
    Wheel: 'Wheel',

    Zoom: 'Zoom'
} as const;

export type EventName = (typeof EventNames)[keyof typeof EventNames];

export class Event {
    private readonly _name: EventName;

    public constructor(name: EventName) {
        this._name = name;
    }

    public get name(): EventName {
        return this._name;
    }
}
