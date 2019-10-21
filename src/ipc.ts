import * as http from "http";
import CommandHandler from "./command-handler";

export default class IPC {
  private commandHandler: CommandHandler;
  private port: number;
  private server?: http.Server;

  constructor(commandHandler: CommandHandler, port: number) {
    this.commandHandler = commandHandler;
    this.port = port;
  }

  async handle(response: any): Promise<any> {
    let result = null;
    if (response.execute) {
      for (let i = 0; i < response.execute.sequencesList.length; i++) {
        let sequence = response.execute.sequencesList[i];

        for (let command of sequence.commandsList) {
          if (command.type in (this.commandHandler as any)) {
            result = await (this.commandHandler as any)[command.type](command);
          }
        }
      }
    }

    return result;
  }

  start() {
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

    this.server.once("error", (error: any) => {
      if (error.code == "EADDRINUSE") {
        console.error("Serenade is already running in another editor window.");
        return;
      }
    });

    this.server.listen(this.port);
  }

  stop() {
    if (this.server) {
      this.server.close();
    }
  }
}
