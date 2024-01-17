export interface EventListener {
    handleEvent(event: Event): void;
}

export interface CustomEventListener extends EventListener {
    originalListener?: EventListener;
    wrappedHandler?: (event: Event) => void;
}

export class EventDelegator {
    private targetElement: HTMLCanvasElement;
    public eventListeners: Map<string, CustomEventListener[]>;

    constructor(targetElement: HTMLCanvasElement) {
        this.targetElement = targetElement;
        this.eventListeners = new Map();
    }

    addEventListener(eventType: string, listener: CustomEventListener): void {
        if (!this.eventListeners.has(eventType)) {
            this.eventListeners.set(eventType, []);
        }

        const listeners = this.eventListeners.get(eventType);

        if (listeners) {
            const wrappedHandler = (e: Event) => {
                listener.handleEvent(e);
            };

            listener.originalListener = listener;
            listener.wrappedHandler = wrappedHandler;

            listeners.push(listener);

            this.targetElement.addEventListener(eventType, wrappedHandler);
        }
    }

    removeAllEventListeners(): void {
        this.eventListeners.forEach((listeners, eventType) => {
            if (listeners) {
                listeners.forEach(listener => {
                    if (listener.wrappedHandler) {
                        this.targetElement.removeEventListener(eventType, listener.wrappedHandler);
                    }
                });
            }
        });

        this.eventListeners.clear();
    }

    handleEvent(event: Event): void {
        const listeners = this.eventListeners.get(event.type);

        if (listeners) {
            for (const listener of listeners) {
                listener.originalListener?.handleEvent(event);
            }
        }
    }
}
