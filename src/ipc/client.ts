import * as http from "http";

export default class IPCClient {
  async checkClientRunning(): Promise<boolean> {
    return this.send("mic", { type: "check" });
  }

  async send(app: string, data: any): Promise<any> {
    let port = 17373;
    if (app == "ui") {
      port = 17374;
    }

    return new Promise(resolve => {
      const dataString = JSON.stringify(data);
      const options = {
        hostname: "localhost",
        port: port,
        path: "/",
        method: "POST",
        timeout: 1000,
        headers: {
          "Content-Type": "application/json",
          "Content-Length": dataString.length
        }
      };

      const request = http.request(options, (response: any) => {
        response.on("data", (_data: any) => {
          resolve(true);
        });
      });

      request.on("error", (_error: any) => {
        resolve(false);
      });

      request.on("timeout", () => {
        request.abort();
        resolve(false);
      });

      request.write(dataString);
      request.end();
    });
  }
}
