import BaseRunner from './client-runner/base-runner';
import IPC from './ipc';
import Settings from './settings';
import StateManager from './state-manager';

export default class App {
    protected clientRunner?: BaseRunner;
    protected settings?: Settings;
    protected state?: StateManager;
    ipc?: IPC;

    destroy() {
        this.clientRunner!.kill();
        this.ipc!.stop();
    }

    run() {
        this.state!.subscribe('nuxCompleted', (completed: boolean, _previous: boolean) => {
            this.settings!.set('nux_completed', completed);
        });

        this.state!.set('nuxCompleted', this.settings!.get('nux_completed'));
        this.state!.set('appState', 'LOADING');
        this.state!.set('alternatives', {});
        this.state!.set('volume', 0);
        this.state!.set('listening', false);
        this.state!.set('status', 'Paused');
        this.ipc!.start();

        this.clientRunner!.installAndRun(() => {
            const token = this.settings!.get('token');
            this.state!.set('appState', token && token.length ? 'READY' : 'LOGIN_FORM');
        });
    }
}
