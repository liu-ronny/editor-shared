export default class StateManager {
    protected data: any;
    protected callbacks: any;

    constructor() {
        this.data = {};
        this.callbacks = {};
    }

    protected afterSet(_key: string, _value: any, _previous: any) {
    }

    get(key: string) {
        return this.data[key];
    }

    set(key: string, value: any) {
        let previous = this.data[key];
        if (previous) {
            previous = JSON.parse(JSON.stringify(this.data[key]));
        }

        // handle local callbacks for state change
        this.data[key] = value;
        if (key in this.callbacks) {
            for (let callback of this.callbacks[key]) {
                callback(value, previous);
            }
        }

        this.afterSet(key, value, previous);
    }

    subscribe(key: string, callback: (value: any, previous: any) => void) {
        if (!(key in this.callbacks)) {
            this.callbacks[key] = [];
        }

        this.callbacks[key].push(callback);
    }
}
