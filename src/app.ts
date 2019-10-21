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
  abstract showNotRunningMessage(): void;
  abstract port(): number;

  checkInstalledAndRunning() {
    const installed = this.settings!.getInstalled();
    if (!installed) {
      this.showInstallMessage();
      return false;
    }

    const running = this.settings!.getRunning();
    if (!running) {
      this.showNotRunningMessage();
      return false;
    }

    this.hideMessage();
    return true;
  }

  destroy() {}

  async run() {
    this.settings = new Settings();
    this.commandHandler = this.createCommandHandler();
    this.ipc = new IPC(this.commandHandler, this.port());
    this.ipc.start();

    let pid = setInterval(() => {
      const result = this.checkInstalledAndRunning();
      if (result) {
        clearInterval(pid);
      }
    }, 1000);
  }
}
