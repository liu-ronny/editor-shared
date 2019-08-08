import App from './app';
import * as diff from './diff';
import Settings from './settings';
import StateManager from './state-manager';

export default abstract class BaseCommandHandler {
    app: App;
    state: StateManager;
    settings: Settings;

    abstract async focus(): Promise<any>;
    abstract getActiveEditorText(): string|undefined;
    abstract async scrollToCursor(): Promise<any>;
    abstract setSourceAndCursor(before: string, source: string, row: number, column: number): void;

    abstract COMMAND_TYPE_CLOSE_TAB(_data: any): Promise<any>;
    abstract COMMAND_TYPE_CLOSE_WINDOW(_data: any): Promise<any>;
    abstract COMMAND_TYPE_COPY(data: any): Promise<any>;
    abstract COMMAND_TYPE_CREATE_TAB(_data: any): Promise<any>;
    abstract COMMAND_TYPE_DIFF(data: any): Promise<any>;
    abstract COMMAND_TYPE_GET_EDITOR_STATE(_data: any): Promise<any>;
    abstract COMMAND_TYPE_GO_TO_DEFINITION(_data: any): Promise<any>;
    abstract COMMAND_TYPE_NEXT_TAB(_data: any): Promise<any>;
    abstract COMMAND_TYPE_OPEN_FILE(data: any): Promise<any>;
    abstract COMMAND_TYPE_PASTE(data: any): Promise<any>;
    abstract COMMAND_TYPE_PREVIOUS_TAB(_data: any): Promise<any>;
    abstract COMMAND_TYPE_REDO(_data: any): Promise<any>;
    abstract COMMAND_TYPE_SAVE(_data: any): Promise<any>;
    abstract COMMAND_TYPE_SPLIT(data: any): Promise<any>;
    abstract COMMAND_TYPE_SWITCH_TAB(data: any): Promise<any>;
    abstract COMMAND_TYPE_UNDO(_data: any): Promise<any>;
    abstract COMMAND_TYPE_USE(data: any): Promise<any>;
    abstract COMMAND_TYPE_WINDOW(data: any): Promise<any>;

    constructor(app: App, state: StateManager, settings: Settings) {
        this.app = app;
        this.state = state;
        this.settings = settings;
    }

    async uiDelay() {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, 100);
        });
    }

    async updateEditor(source: string, cursor: number) {
        const before = this.getActiveEditorText() || '';
        source = source || '';
        let [row, column] = diff.cursorToRowAndColumn(source, cursor);
        let ranges = diff.diff(before, source);
        if (ranges.length == 0) {
            ranges = [new diff.DiffRange(
                diff.DiffRangeType.Add,
                diff.DiffHighlightType.Line,
                new diff.DiffPoint(row, 0),
                new diff.DiffPoint(row + 1, 0)
            )];
        }

        const enable = !this.settings.get('disable_animations');
        const addRanges = enable ? ranges.filter((e: diff.DiffRange) => e.diffRangeType == diff.DiffRangeType.Add) : [];
        const deleteRanges =
            enable ? ranges.filter((e: diff.DiffRange) => e.diffRangeType == diff.DiffRangeType.Delete) : [];
        this.state.set('highlightedRanges', deleteRanges);

        return new Promise(resolve => {
            setTimeout(async () => {
                this.setSourceAndCursor(before, source, row, column);
                this.state.set('highlightedRanges', addRanges);
                await this.scrollToCursor();
                resolve();
            }, deleteRanges.length > 0 ? 400 : 0);
        });
    }

    async COMMAND_TYPE_CANCEL(_data: any): Promise<any> {
        this.state.set('alternatives', {suggestions: true});
    }

    async COMMAND_TYPE_INVALID(_data: any): Promise<any> {
    }

    async COMMAND_TYPE_LOGIN(data: any): Promise<any> {
        if (data.text !== '' && data.text !== undefined) {
            this.state.set('appState', 'READY');
        }
        else {
            this.state.set('loginError', 'Invalid email/password.');
        }
    }

    async COMMAND_TYPE_LOGOUT(_data: any): Promise<any> {
        this.app.ipc!.send('DISABLE_LISTENING', {});
        this.state.set('appState', 'LOGIN_FORM');
    }

    async COMMAND_TYPE_PAUSE(_data: any): Promise<any> {
        this.state.set('listening', false);
    }

    async COMMAND_TYPE_PING(_data: any): Promise<any> {
        this.app.ipc!.send('PING', {});
    }

    async COMMAND_TYPE_SET_EDITOR_STATUS(data: any): Promise<any> {
        let text = data.text;
        if (data.volume) {
            this.state.set('volume', Math.floor(data.volume * 100));
        }

        this.state.set('status', text);
    }

    async COMMAND_TYPE_SNIPPET(data: any): Promise<any> {
        this.state.set('loading', true);
        this.app.ipc!.send('SEND_TEXT', {text: 'add executed snippet ' + data.text});
    }

    async COMMAND_TYPE_SNIPPET_EXECUTED(data: any): Promise<any> {
        await this.updateEditor(data.source, data.cursor);
        this.focus();
    }
}
