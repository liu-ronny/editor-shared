import CommandHandler from "./command-handler";
import IPC from "./ipc";
import Settings from "./settings";

export default abstract class App {
  commandHandler?: CommandHandler;
  ipc?: IPC;
  settings?: Settings;

  abstract createCommandHandler(): CommandHandler;
  abstract hideMessage(): void;
  abstract showInstallMessage(): void;
  abstract port(): number;

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
    this.settings = new Settings();
    this.commandHandler = this.createCommandHandler();
    this.ipc = new IPC(this.commandHandler, this.port());
    this.ipc.start();
    this.checkInstalled();
  }
}
