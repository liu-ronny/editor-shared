import * as diff from './diff';
import StateManager from './state-manager';

export default abstract class BaseCommandHandler {
    abstract async focus(): Promise<any>;
    abstract getActiveEditorText(): string|undefined;
    abstract getState(): StateManager;
    abstract async scrollToCursor(): Promise<any>;
    abstract setSourceAndCursor(before: string, source: string, row: number, column: number): void;

    abstract COMMAND_TYPE_CANCEL(_data: any): Promise<any>;
    abstract COMMAND_TYPE_CLOSE_TAB(_data: any): Promise<any>;
    abstract COMMAND_TYPE_CLOSE_WINDOW(_data: any): Promise<any>;
    abstract COMMAND_TYPE_COPY(data: any): Promise<any>;
    abstract COMMAND_TYPE_CREATE_TAB(_data: any): Promise<any>;
    abstract COMMAND_TYPE_DIFF(data: any): Promise<any>;
    abstract COMMAND_TYPE_GET_EDITOR_STATE(_data: any): Promise<any>;
    abstract COMMAND_TYPE_GO_TO_DEFINITION(_data: any): Promise<any>;
    abstract COMMAND_TYPE_INVALID(_data: any): Promise<any>;
    abstract COMMAND_TYPE_LOGIN(data: any): Promise<any>;
    abstract COMMAND_TYPE_NEXT_TAB(_data: any): Promise<any>;
    abstract COMMAND_TYPE_OPEN_FILE(data: any): Promise<any>;
    abstract COMMAND_TYPE_PASTE(data: any): Promise<any>;
    abstract COMMAND_TYPE_PAUSE(_data: any): Promise<any>;
    abstract COMMAND_TYPE_PING(_data: any): Promise<any>;
    abstract COMMAND_TYPE_PREVIOUS_TAB(_data: any): Promise<any>;
    abstract COMMAND_TYPE_REDO(_data: any): Promise<any>;
    abstract COMMAND_TYPE_SAVE(_data: any): Promise<any>;
    abstract COMMAND_TYPE_SET_EDITOR_STATUS(data: any): Promise<any>;
    abstract COMMAND_TYPE_SNIPPET(data: any): Promise<any>;
    abstract COMMAND_TYPE_SNIPPET_EXECUTED(data: any): Promise<any>;
    abstract COMMAND_TYPE_SPLIT(data: any): Promise<any>;
    abstract COMMAND_TYPE_SWITCH_TAB(data: any): Promise<any>;
    abstract COMMAND_TYPE_UNDO(_data: any): Promise<any>;
    abstract COMMAND_TYPE_USE(data: any): Promise<any>;
    abstract COMMAND_TYPE_WINDOW(data: any): Promise<any>;

    async uiDelay() {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, 100);
        });
    }

    async updateEditor(source: string, cursor: number) {
        const before = this.getActiveEditorText();
        if (!before) {
            return;
        }

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

        const addRanges = ranges.filter((e: diff.DiffRange) => e.diffRangeType == diff.DiffRangeType.Add);
        const deleteRanges = ranges.filter((e: diff.DiffRange) => e.diffRangeType == diff.DiffRangeType.Delete);
        this.getState().set('highlightedRanges', deleteRanges);

        return new Promise(resolve => {
            setTimeout(async () => {
                this.setSourceAndCursor(before, source, row, column);
                this.getState().set('highlightedRanges', addRanges);
                await this.scrollToCursor();
                resolve();
            }, deleteRanges.length > 0 ? 400 : 0);
        });
    }
}
