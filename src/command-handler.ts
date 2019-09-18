import App from "./app";
import * as diff from "./diff";
import IPCClient from "./ipc/client";
import Settings from "./settings";

export default abstract class BaseCommandHandler {
  ipcClient: IPCClient;
  settings: Settings;

  abstract async focus(): Promise<any>;
  abstract highlightRanges(ranges: diff.DiffRange[]): void;
  abstract getActiveEditorText(): string | undefined;
  abstract async scrollToCursor(): Promise<any>;
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

  constructor(ipcClient: IPCClient, settings: Settings) {
    this.ipcClient = ipcClient;
    this.settings = settings;
  }

  pasteText(source: string, data: any, text: string) {
    // if we specify a direction, it means that we want to paste as a line, so add a newline
    let insertionPoint = data.cursor || 0;
    let updatedCursor = insertionPoint;
    if (data.direction && !text.endsWith("\n")) {
      text += "\n";
    }

    // paste on a new line if a direction is specified or we're pasting a full line
    if (text.endsWith("\n") || data.direction) {
      // default to paste below if there's a newline at the end
      data.direction = data.direction || "below";

      // for below (the default), move the cursor to the start of the next line
      if (data.direction === "below") {
        for (; insertionPoint < source.length; insertionPoint++) {
          if (source[insertionPoint] === "\n") {
            insertionPoint++;
            break;
          }
        }
      }

      // for paste above, go to the start of the current line
      else if (data.direction === "above") {
        // if we're at the end of a line, then move the cursor back one, or else we'll paste below
        if (source[insertionPoint] === "\n" && insertionPoint > 0) {
          insertionPoint--;
        }

        for (; insertionPoint >= 0; insertionPoint--) {
          if (source[insertionPoint] === "\n") {
            insertionPoint++;
            break;
          }
        }
      }

      updatedCursor = insertionPoint;
    }

    // move the cursor to the end of the pasted text
    updatedCursor += text.length;
    if (text.endsWith("\n")) {
      updatedCursor--;
    }

    this.updateEditor(
      source.substring(0, insertionPoint) + text + source.substring(insertionPoint),
      updatedCursor
    );
  }

  async uiDelay() {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, 100);
    });
  }

  async updateEditor(source: string, cursor: number) {
    await this.focus();
    const before = this.getActiveEditorText() || "";
    source = source || "";
    let [row, column] = diff.cursorToRowAndColumn(source, cursor);
    let ranges = diff.diff(before, source);
    if (ranges.length == 0) {
      ranges = [
        new diff.DiffRange(
          diff.DiffRangeType.Add,
          diff.DiffHighlightType.Line,
          new diff.DiffPoint(row, 0),
          new diff.DiffPoint(row + 1, 0)
        )
      ];
    }

    const enable = !this.settings.getDisableAnimations();
    const addRanges = enable
      ? ranges.filter((e: diff.DiffRange) => e.diffRangeType == diff.DiffRangeType.Add)
      : [];
    const deleteRanges = enable
      ? ranges.filter((e: diff.DiffRange) => e.diffRangeType == diff.DiffRangeType.Delete)
      : [];
    this.highlightRanges(deleteRanges);

    return new Promise(resolve => {
      setTimeout(
        async () => {
          this.setSourceAndCursor(before, source, row, column);
          this.highlightRanges(addRanges);
          await this.scrollToCursor();
          resolve();
        },
        deleteRanges.length > 0 ? 400 : 0
      );
    });
  }

  async COMMAND_TYPE_DIFF(data: any): Promise<any> {
    await this.updateEditor(data.source, data.cursor);
  }

  async COMMAND_TYPE_SNIPPET(data: any): Promise<any> {
    // the current request has to complete before we can send a new one
    setTimeout(() => {
      this.ipcClient!.send("mic", { type: "sendText", text: `add executed snippet ${data.text};` });
    }, 100);
  }

  async COMMAND_TYPE_SNIPPET_EXECUTED(data: any): Promise<any> {
    await this.updateEditor(data.source, data.cursor);
    await this.focus();
  }
}
