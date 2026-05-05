type Listener = { context: any; callback: (...args: any[]) => void };

export class EventsManager {
    private static listeners: Record<string, Function[]> = {};

    static addListener(event: string, callback: (...args: any[]) => void) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(callback);
    }

    static removeListener(event: string, callback: (...args: any[]) => void) {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter(
            l => l !== callback
        );
    }

    static emit(event: string, ...args: any[]) {
        if (!this.listeners[event]) return;
        for (const l of this.listeners[event]) {
            l.apply(null, args);
        }
    }
}
