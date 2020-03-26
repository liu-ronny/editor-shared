import { v4 as uuidv4 } from "uuid";
import WebSocket from "ws";
import CommandHandler from "./command-handler";

export default class IPC {
  private app: string;
  private commandHandler: CommandHandler;
  private connected: boolean = false;
  private id: string = "";
  private websocket?: WebSocket;

  constructor(commandHandler: CommandHandler, app: string) {
    this.commandHandler = commandHandler;
    this.app = app;
    this.id = uuidv4();
  }

  ensureConnection() {
    if (!this.connected) {
      try {
        this.websocket = new WebSocket("ws://localhost:17373/");
        this.websocket.on("error", () => {});

        this.websocket.on("open", () => {
          this.connected = true;
          this.sendActive();
        });

        this.websocket.on("close", () => {
          this.connected = false;
        });

        this.websocket.on("message", async message => {
          if (typeof message == "string") {
            let request;
            try {
              request = JSON.parse(message);
            } catch (e) {
              return;
            }

            if (request.message == "response") {
              const result = await this.handle(request.data.response);
              if (result) {
                this.send("callback", {
                  callback: request.data.callback,
                  data: result
                });
              }
            }
          }
        });
      } catch (e) {}
    }
  }

  async handle(response: any): Promise<any> {
    let result = null;
    if (response.execute) {
      for (const command of response.execute.commandsList) {
        if (command.type in (this.commandHandler as any)) {
          result = await (this.commandHandler as any)[command.type](command);
        }
      }
    }

    return result;
  }

  sendActive() {
    this.send("active", {
      app: this.app,
      id: this.id
    });
  }

  send(message: string, data: any) {
    if (!this.connected) {
      return;
    }

    try {
      this.websocket!.send(JSON.stringify({ message, data }));
    } catch (e) {
      this.connected = false;
    }
  }

  start() {
    this.ensureConnection();

    setInterval(() => {
      this.ensureConnection();
    }, 1000);

    setInterval(() => {
      this.send("heartbeat", {});
    }, 60000);
  }
}
