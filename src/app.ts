import CommandHandler from "./command-handler";
import IPCClient from "./ipc/client";
import IPCServer from "./ipc/server";
import Settings from "./settings";

export default abstract class App {
  commandHandler?: CommandHandler;
  ipcClient?: IPCClient;
  ipcServer?: IPCServer;
  settings?: Settings;

  abstract createCommandHandler(): CommandHandler;
  abstract hideMessage(): void;
  abstract showInstallMessage(): void;
  abstract showNotRunningMessage(): void;
  abstract port(): number;

  async checkInstalledAndRunning() {
    const installed = this.settings!.getAppInstalled();
    if (!installed) {
      this.showInstallMessage();
      return;
    }

    const running = await this.ipcClient!.checkClientRunning();
    if (!running) {
      this.showNotRunningMessage();
      return;
    }
  }

  destroy() {
    this.ipcServer!.stop();
  }

  async run() {
    this.settings = new Settings();
    this.ipcClient = new IPCClient();
    this.commandHandler = this.createCommandHandler();
    this.ipcServer = new IPCServer(this.commandHandler, this.port(), () => {
      this.hideMessage();
    });

    this.ipcServer!.start();
    this.checkInstalledAndRunning();
  }
}
