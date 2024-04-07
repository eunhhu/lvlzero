export class EventEmitter {
    private events: Map<string, Function[]> = new Map();

    on(event: string, callback: Function) {
        let listeners = this.events.get(event);
        if (!listeners) {
            listeners = [];
            this.events.set(event, listeners);
        }
        listeners.push(callback);
    }

    emit(event: string, ...args: any[]) {
        const listeners = this.events.get(event);
        if (!listeners) return;
        for (const listener of listeners) {
            listener(...args);
        }
    }

    // 이벤트 리스너 제거 기능
    off(event: string, callback: Function) {
        const listeners = this.events.get(event);
        if (!listeners) return;
        const index = listeners.indexOf(callback);
        if (index !== -1) {
            listeners.splice(index, 1);
        }
    }

    // 모든 이벤트 리스너 제거
    removeAllListeners(event?: string) {
        if (event) {
            this.events.delete(event);
        } else {
            this.events.clear();
        }
    }
}