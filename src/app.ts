import CommandHandler from "./command-handler";
import IPC from "./ipc";
import Settings from "./settings";

export default abstract class App {
  commandHandler?: CommandHandler;
  ipc?: IPC;
  settings?: Settings;
  initialized: boolean = false;

  abstract app(): string;
  abstract createCommandHandler(): CommandHandler;
  abstract hideMessage(): void;
  abstract showInstallMessage(): void;

  checkInstalled(): boolean {
    const installed = this.settings!.getInstalled();
    if (!installed) {
      this.showInstallMessage();
      return false;
    }

    return true;
  }

  destroy() {}

  async run() {
    if (this.initialized) {
      return;
    }

    this.settings = new Settings();
    this.commandHandler = this.createCommandHandler();
    this.ipc = new IPC(this.commandHandler, this.app());
    this.ipc.start();
    this.checkInstalled();
    this.initialized = true;
  }
}
