import IPC from "./ipc";
import Settings from "./settings";

export default abstract class App {
  ipc?: IPC;
  settings?: Settings;

  abstract showInstallMessage(): void;
  abstract showNotRunningMessage(): void;

  async checkInstalledAndRunning() {
    const installed = this.settings!.getAppInstalled();
    if (!installed) {
      this.showInstallMessage();
      return;
    }

    const running = await this.ipc!.checkClientRunning();
    if (!running) {
      this.showNotRunningMessage();
      return;
    }
  }

  destroy() {
    this.ipc!.stop();
  }

  async run() {
    this.ipc!.start();
    this.checkInstalledAndRunning();
  }
}
