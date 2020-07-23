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

  abstract COMMAND_TYPE_CLOSE_TAB(_data: any): Promise<any>;
  abstract COMMAND_TYPE_CLOSE_WINDOW(_data: any): Promise<any>;
  abstract COMMAND_TYPE_COPY(data: any): Promise<any>;
  abstract COMMAND_TYPE_CREATE_TAB(_data: any): Promise<any>;
  abstract COMMAND_TYPE_GET_EDITOR_STATE(_data: any): Promise<any>;
  abstract COMMAND_TYPE_GO_TO_DEFINITION(_data: any): Promise<any>;
  abstract COMMAND_TYPE_NEXT_TAB(_data: any): Promise<any>;
  abstract COMMAND_TYPE_PASTE(data: any): Promise<any>;
  abstract COMMAND_TYPE_PREVIOUS_TAB(_data: any): Promise<any>;
  abstract COMMAND_TYPE_REDO(_data: any): Promise<any>;
  abstract COMMAND_TYPE_SAVE(_data: any): Promise<any>;
  abstract COMMAND_TYPE_SPLIT(data: any): Promise<any>;
  abstract COMMAND_TYPE_SWITCH_TAB(data: any): Promise<any>;
  abstract COMMAND_TYPE_UNDO(_data: any): Promise<any>;
  abstract COMMAND_TYPE_WINDOW(data: any): Promise<any>;

  constructor(settings: Settings) {
    this.settings = settings;
  }

  pasteText(source: string, data: any, text: string) {
    let cursor = data.cursor || 0;
    let cursorAdjustment = 0;
    let direction = data.direction || "inline";
    if (!data.direction && text.endsWith("\n")) {
      direction = "below";
    }

    // if we specify a direction, make sure there's a newline
    if ((direction == "above" || direction == "below") && !text.endsWith("\n")) {
      text += "\n";
    }

    if (direction === "below") {
      // account for the newline
      cursorAdjustment--;
      for (; cursor < source.length; cursor++) {
        if (source[cursor] === "\n") {
          cursor++;
          break;
        }
      }
    } else if (direction === "above") {
      // if we're at the end of a line, then move the cursor back one, or else we'll paste at the cursor
      if (source[cursor] === "\n" && cursor > 0) {
        cursor--;
      }

      for (; cursor >= 0; cursor--) {
        if (source[cursor] === "\n") {
          cursor++;
          break;
        }
      }
    }

    this.updateEditor(
      source.substring(0, cursor) + text + source.substring(cursor),
      cursor + text.length + cursorAdjustment
    );
  }

  async uiDelay() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 100);
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
