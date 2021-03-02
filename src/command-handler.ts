import App from "./app";
import * as diff from "./diff";
import Settings from "./settings";

export default abstract class BaseCommandHandler {
  settings: Settings;

  abstract async focus(): Promise<any>;
  abstract highlightRanges(ranges: diff.DiffRange[]): number;
  abstract getActiveEditorText(): string | undefined;
  abstract async scrollToCursor(): Promise<any>;
  abstract select(startRow: number, startColumn: number, endRow: number, endColumn: number): void;
  abstract setSourceAndCursor(before: string, source: string, row: number, column: number): void;

  abstract async COMMAND_TYPE_CLOSE_TAB(_data: any): Promise<any>;
  abstract async COMMAND_TYPE_CLOSE_WINDOW(_data: any): Promise<any>;
  abstract async COMMAND_TYPE_COPY(data: any): Promise<any>;
  abstract async COMMAND_TYPE_CREATE_TAB(_data: any): Promise<any>;
  abstract async COMMAND_TYPE_GET_EDITOR_STATE(_data: any): Promise<any>;
  abstract async COMMAND_TYPE_GO_TO_DEFINITION(_data: any): Promise<any>;
  abstract async COMMAND_TYPE_NEXT_TAB(_data: any): Promise<any>;
  abstract async COMMAND_TYPE_PREVIOUS_TAB(_data: any): Promise<any>;
  abstract async COMMAND_TYPE_REDO(_data: any): Promise<any>;
  abstract async COMMAND_TYPE_SAVE(_data: any): Promise<any>;
  abstract async COMMAND_TYPE_SPLIT(data: any): Promise<any>;
  abstract async COMMAND_TYPE_SWITCH_TAB(data: any): Promise<any>;
  abstract async COMMAND_TYPE_UNDO(_data: any): Promise<any>;
  abstract async COMMAND_TYPE_WINDOW(data: any): Promise<any>;

  async COMMAND_TYPE_DEBUGGER_CONTINUE(_data: any): Promise<any> {}
  async COMMAND_TYPE_DEBUGGER_INLINE_BREAKPOINT(_data: any): Promise<any> {}
  async COMMAND_TYPE_DEBUGGER_PAUSE(_data: any): Promise<any> {}
  async COMMAND_TYPE_DEBUGGER_SHOW_HOVER(_data: any): Promise<any> {}
  async COMMAND_TYPE_DEBUGGER_START(_data: any): Promise<any> {}
  async COMMAND_TYPE_DEBUGGER_STEP_INTO(_data: any): Promise<any> {}
  async COMMAND_TYPE_DEBUGGER_STEP_OUT(_data: any): Promise<any> {}
  async COMMAND_TYPE_DEBUGGER_STEP_OVER(_data: any): Promise<any> {}
  async COMMAND_TYPE_DEBUGGER_STOP(_data: any): Promise<any> {}
  async COMMAND_TYPE_DEBUGGER_TOGGLE_BREAKPOINT(_data: any): Promise<any> {}

  constructor(settings: Settings) {
    this.settings = settings;
  }

  filenameFromLanguage(
    filename: string,
    language: string,
    map: { [key: string]: string[] }
  ): string {
    if (map[language]) {
      let matches = false;
      for (const extension of map[language]) {
        if (filename.endsWith(`.${extension}`)) {
          matches = true;
          break;
        }
      }

      if (!matches) {
        filename += `.${map[language][0]}`;
      }
    }

    return filename;
  }

  async uiDelay(delay: number = 100) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, delay);
    });
  }

  async updateEditor(source: string, cursor: number): Promise<any> {
    await this.focus();

    const before = this.getActiveEditorText() || "";
    source = source || "";
    let [row, column] = diff.cursorToRowAndColumn(source, cursor);
    if (!this.settings.getAnimations()) {
      this.setSourceAndCursor(before, source, row, column);
      await this.scrollToCursor();
      return Promise.resolve();
    }

    let ranges = diff.diff(before, source);
    if (ranges.length == 0) {
      ranges = [
        new diff.DiffRange(
          diff.DiffRangeType.Add,
          diff.DiffHighlightType.Line,
          new diff.DiffPoint(row, 0),
          new diff.DiffPoint(row + 1, 0)
        ),
      ];
    }

    const addRanges = ranges.filter(
      (e: diff.DiffRange) => e.diffRangeType == diff.DiffRangeType.Add
    );
    const deleteRanges = ranges.filter(
      (e: diff.DiffRange) => e.diffRangeType == diff.DiffRangeType.Delete
    );

    const timeout = this.highlightRanges(deleteRanges);
    return new Promise((resolve) => {
      setTimeout(
        async () => {
          this.setSourceAndCursor(before, source, row, column);
          this.highlightRanges(addRanges);
          await this.scrollToCursor();
          resolve();
        },
        deleteRanges.length > 0 ? timeout : 1
      );
    });
  }

  async COMMAND_TYPE_DIFF(data: any): Promise<any> {
    await this.updateEditor(data.source, data.cursor);
  }

  async COMMAND_TYPE_SELECT(data: any): Promise<any> {
    const [startRow, startColumn] = diff.cursorToRowAndColumn(data.source, data.cursor);
    const [endRow, endColumn] = diff.cursorToRowAndColumn(data.source, data.cursorEnd);
    this.select(startRow, startColumn, endRow, endColumn);
  }
}
