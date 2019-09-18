import * as http from "http";
import CommandHandler from "../command-handler";

export default class IPCServer {
  private commandHandler: CommandHandler;
  private onSuccess: () => void;
  private port: number;
  private server?: http.Server;

  constructor(commandHandler: CommandHandler, port: number, onSuccess: () => void) {
    this.commandHandler = commandHandler;
    this.port = port;
    this.onSuccess = onSuccess;
  }

  async handle(response: any): Promise<any> {
    let result = null;
    let success = false;
    if (response.execute) {
      for (let i = 0; i < response.execute.sequences.length; i++) {
        let sequence = response.execute.sequences[i];

        for (let command of sequence.commands) {
          if (command.type in (this.commandHandler as any)) {
            success = true;
            result = await (this.commandHandler as any)[command.type](command);
          }
        }
      }
    }

    if (success) {
      this.onSuccess();
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
