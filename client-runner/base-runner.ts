import {ChildProcess, spawn} from 'child_process';
import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import * as mkdirp from 'mkdirp';
import * as path from 'path';
import * as rimraf from 'rimraf';
import * as targz from 'targz';
import * as kill from 'tree-kill';

import Settings from '../settings';
import StateManager from '../state-manager';

export default abstract class BaseRunner {
    private state: StateManager;
    private settings: Settings;
    private clientProcess?: ChildProcess;

    abstract javaBinary(): string;
    abstract javaPath(): string;
    abstract jdkUrl(): string;
    abstract jdkVersion(): string;

    constructor(state: StateManager, settings: Settings) {
        this.state = state;
        this.settings = settings;

        process.on('exit', () => {
            this.kill();
        });
    }

    private log(data: Buffer) {
        let string = data.toString();
        if (string.startsWith('WARNING:')) {
            return;
        }

        console.log(string);
    }

    clientVersion() {
        return '3a257bc174890aaa323ec49b0e0fc7b4';
    }

    clientUrl() {
        return `https://cdn.serenade.ai/client/Serenade-${this.clientVersion()}.tar.gz`;
    }

    checkPort(callback: (result: boolean) => void) {
        let result = true;
        let server = http.createServer();
        server.once('error', (error: any) => {
            if (error.code === 'EADDRINUSE') {
                result = false;
            }
        });

        server.once('listening', function() {
            server.close();
        });

        setTimeout(() => {
            callback(result);
        }, 100);

        server.listen(17373);
    }

    downloadAndDecompress(url: string, version: string, archiveName: string, status: string, callback: () => void) {
        let shouldUpdateUI = true;
        const archive = `${this.settings.path()}/${archiveName}`;
        let base = path.dirname(archive);
        if (fs.existsSync(`${base}/${version}`)) {
            if (callback) {
                callback();
            }

            return;
        }

        rimraf.sync(base);
        mkdirp.sync(base);

        const file = fs.createWriteStream(archive);
        https.get(url, response => {
            let downloaded = 0;
            const length = response.headers['content-length'];
            let total = 0;
            if (length !== undefined) {
                total = parseInt(length, 10);
            }

            response.on('data', data => {
                downloaded += data.length;
                if (shouldUpdateUI) {
                    this.state.set('status', `${status} (${Math.min(100, Math.floor((100 * downloaded) / total))}%)\n`);
                    shouldUpdateUI = false;
                    setTimeout(() => {
                        shouldUpdateUI = true;
                    }, 500);
                }
            });

            response.pipe(file);
            file.on('finish', () => {
                targz.decompress({src: archive, dest: base}, _err => {
                    fs.unlinkSync(archive);
                    if (callback) {
                        callback();
                    }
                });
            });
        });
    }

    installAndRun(callback: () => void) {
        if (this.settings.get('disable_autostart')) {
            callback();
            return;
        }

        this.installJdk(() => {
            this.installClient(() => {
                this.checkPort(open => {
                    // don't try to run the client twice. the IPC will show an error message to the user
                    if (!open) {
                        callback();
                        return;
                    }

                    this.clientProcess = spawn(
                        this.javaBinary(),
                        [
                            '--add-opens=java.base/java.nio=ALL-UNNAMED',
                            '--add-opens=java.base/java.lang=ALL-UNNAMED',
                            '-Dapple.awt.UIElement="true"',
                            '-jar',
                            `"${this.settings.path()}/client/${this.clientVersion()}/serenade.jar"`
                        ],
                        {cwd: `${this.settings.path()}/jdk/${this.jdkVersion()}/${this.javaPath()}`, shell: true}
                    );

                    this.clientProcess.stdout.on('data', this.log);
                    this.clientProcess.stderr.on('data', this.log);
                    callback();
                });
            });
        });
    }

    installClient(callback: () => void) {
        this.downloadAndDecompress(
            this.clientUrl(), this.clientVersion(), 'client/serenade.tar.gz', 'Updating', callback
        );
    }

    installJdk(callback: () => void) {
        this.downloadAndDecompress(this.jdkUrl(), this.jdkVersion(), 'jdk/jdk.tar.gz', 'Installing', callback);
    }

    kill() {
        if (this.clientProcess) {
            // the tree-kill library doesn't seem reliable across platforms, so try both the native nodejs
            // pkill and the native library
            const pid = this.clientProcess.pid;
            this.clientProcess.kill();
            kill(pid);
        }
    }
}
