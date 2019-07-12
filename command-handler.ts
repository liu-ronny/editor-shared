export default interface CommandHandler {
    COMMAND_TYPE_CANCEL(_data: any): Promise<any>;
    COMMAND_TYPE_CLOSE_TAB(_data: any): Promise<any>;
    COMMAND_TYPE_CLOSE_WINDOW(_data: any): Promise<any>;
    COMMAND_TYPE_COPY(data: any): Promise<any>;
    COMMAND_TYPE_CREATE_TAB(_data: any): Promise<any>;
    COMMAND_TYPE_DIFF(data: any): Promise<any>;
    COMMAND_TYPE_GET_EDITOR_STATE(_data: any): Promise<any>;
    COMMAND_TYPE_GO_TO_DEFINITION(_data: any): Promise<any>;
    COMMAND_TYPE_INVALID(_data: any): Promise<any>;
    COMMAND_TYPE_LOGIN(data: any): Promise<any>;
    COMMAND_TYPE_NEXT_TAB(_data: any): Promise<any>;
    COMMAND_TYPE_OPEN_FILE(data: any): Promise<any>;
    COMMAND_TYPE_PASTE(data: any): Promise<any>;
    COMMAND_TYPE_PAUSE(_data: any): Promise<any>;
    COMMAND_TYPE_PREVIOUS_TAB(_data: any): Promise<any>;
    COMMAND_TYPE_REDO(_data: any): Promise<any>;
    COMMAND_TYPE_SAVE(_data: any): Promise<any>;
    COMMAND_TYPE_SET_EDITOR_STATUS(data: any): Promise<any>;
    COMMAND_TYPE_SNIPPET(data: any): Promise<any>;
    COMMAND_TYPE_SNIPPET_EXECUTED(data: any): Promise<any>;
    COMMAND_TYPE_SPLIT(data: any): Promise<any>;
    COMMAND_TYPE_SWITCH_TAB(data: any): Promise<any>;
    COMMAND_TYPE_UNDO(_data: any): Promise<any>;
    COMMAND_TYPE_USE(data: any): Promise<any>;
    COMMAND_TYPE_WINDOW(data: any): Promise<any>;
}
