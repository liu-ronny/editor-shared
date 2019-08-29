import * as http from "http";
import * as os from "os";

import CommandHandler from "./command-handler";

export default class IPC {
  private commandHandler: CommandHandler;
  private onSuccess: () => void;
  private port: number;
  private server?: http.Server;

  constructor(commandHandler: CommandHandler, port: number, onSuccess: () => void) {
    this.commandHandler = commandHandler;
    this.port = port;
    this.onSuccess = onSuccess;
  }

  async checkClientRunning(): Promise<boolean> {
    return new Promise(resolve => {
      const data = JSON.stringify({ type: "check" });
      const options = {
        hostname: "localhost",
        port: 17373,
        path: "/",
        method: "POST",
        timeout: 1000,
        headers: {
          "Content-Type": "application/json",
          "Content-Length": data.length
        }
      };

      const request = http.request(options, response => {
        response.on("data", _data => {
          resolve(true);
        });
      });

      request.on("error", _error => {
        resolve(false);
      });

      request.on("timeout", () => {
        request.abort();
        resolve(false);
      });

      request.write(data);
      request.end();
    });
  }

  async handle(response: any): Promise<any> {
    let result = null;
    if (response.execute) {
      for (let i = 0; i < response.execute.sequences.length; i++) {
        let sequence = response.execute.sequences[i];

        for (let command of sequence.commands) {
          if (command.type in (this.commandHandler as any)) {
            result = await (this.commandHandler as any)[command.type](command);
          }
        }
      }
    }

    if (result) {
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
        let parseResponse = "";
        try {
          parseResponse = JSON.parse(body);
        } catch (e) {
          response.end("");
          return;
        }

        let result = await this.handle(parseResponse);
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
