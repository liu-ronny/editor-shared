import * as fs from "fs";
import * as mkdirp from "mkdirp";
import * as os from "os";

export default class Settings {
  private systemData: any = {};
  private systemDefaults: any = {};
  private userData: any = {};
  private userDefaults: any = {
    ignore: [
      "**/.git/**",
      "**/.gradle/**",
      "*.pyc",
      "*.class",
      "*.jar",
      "*.dylib",
      "**/node_modules/**",
      "**/__pycache__/**"
    ]
  };

  private dataForFile(file: string): any {
    if (file == "user") {
      return this.userData;
    } else if (file == "system") {
      return this.systemData;
    }
  }

  private defaultsForFile(file: string): any {
    if (file == "user") {
      return this.userDefaults;
    } else if (file == "system") {
      return this.systemDefaults;
    }
  }

  private get(file: string, key: string): any {
    this.load();
    let data = this.dataForFile(file);
    if (data[key] === undefined) {
      return this.defaultsForFile(file)[key];
    }

    return data[key];
  }

  private load() {
    this.systemData = {};
    this.userData = {};

    try {
      this.systemData = JSON.parse(fs.readFileSync(this.systemFile()).toString());
    } catch (e) {
      this.systemData = {};
    }

    try {
      this.userData = JSON.parse(fs.readFileSync(this.userFile()).toString());
    } catch (e) {
      this.userData = {};
    }
  }

  private systemFile(): string {
    return `${this.path()}/serenade.json`;
  }

  private userFile(): string {
    return `${this.path()}/settings.json`;
  }

  getAppInstalled(): boolean {
    return this.get("system", "app_installed");
  }

  getDisableAnimations(): boolean {
    return this.get("user", "disable_animations");
  }

  getIgnore(): string[] {
    return this.get("user", "ignore");
  }

  path(): string {
    return `${os.homedir()}/.serenade`;
  }
}
