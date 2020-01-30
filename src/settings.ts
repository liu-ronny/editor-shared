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

  private createIfNotExists(file: string) {
    mkdirp.sync(this.path());
    if (!fs.existsSync(file)) {
      fs.closeSync(fs.openSync(file, "w"));
    }
  }

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

  private save() {
    this.createIfNotExists(this.systemFile());
    this.createIfNotExists(this.userFile());

    fs.writeFileSync(this.systemFile(), JSON.stringify(this.systemData));
    fs.writeFileSync(this.userFile(), JSON.stringify(this.userData));
  }

  private set(file: string, key: string, value: any) {
    this.load();
    let data = this.dataForFile(file);
    data[key] = value;
    this.save();
  }

  private systemFile(): string {
    return `${this.path()}/serenade.json`;
  }

  private userFile(): string {
    return `${this.path()}/settings.json`;
  }

  getAnimations(): boolean {
    return this.get("user", "animations");
  }

  getAtom(): boolean {
    return this.get("system", "atom");
  }

  getCode(): boolean {
    return this.get("system", "code");
  }

  getInstalled(): boolean {
    return this.get("system", "installed");
  }

  getIgnore(): string[] {
    return this.get("user", "ignore");
  }

  path(): string {
    return `${os.homedir()}/.serenade`;
  }

  setAtom() {
    return this.set("system", "atom", true);
  }

  setCode() {
    return this.set("system", "code", true);
  }
}
