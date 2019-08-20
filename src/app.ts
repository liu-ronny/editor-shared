import IPC from "./ipc";
import Settings from "./settings";

export default class App {
  ipc?: IPC;

  destroy() {
    this.ipc!.stop();
  }

  run() {
    this.ipc!.start();
  }
}
