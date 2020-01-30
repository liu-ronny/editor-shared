import * as http from "http";
import CommandHandler from "./command-handler";

export default class IPC {
  private commandHandler: CommandHandler;
  private port: number;
  private server?: http.Server;
  private serverRunning: boolean = false;
  private startServerPid: number = 0;

  constructor(commandHandler: CommandHandler, port: number) {
    this.commandHandler = commandHandler;
    this.port = port;
  }

  private startServer() {
    http
      .get(`http://localhost:${this.port}`, () => {})
      .on("error", () => {
        this.server = http.createServer((request, response) => {
          let body = "";
          request.on("data", data => {
            body += data;
          });

          request.on("end", async () => {
            let responseData = "";
            try {
              responseData = JSON.parse(body);
            } catch (e) {
              response.end("");
              return;
            }

            let result = await this.handle(responseData);
            if (!result) {
              result = { success: true };
            }

            response.statusCode = 200;
            response.setHeader("Content-Type", "application/json");
            response.end(JSON.stringify(result));
          });
        });

        try {
          this.server.listen(this.port);
        } catch (e) {}
      });
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

  start() {
    this.stop();
    this.startServer();
    this.startServerPid = window.setInterval(() => {
      this.startServer();
    }, 3000);
  }

  stop() {
    if (this.server) {
      this.server.close();
    }

    if (this.startServerPid) {
      clearInterval(this.startServerPid);
      this.startServerPid = 0;
    }
  }
}
