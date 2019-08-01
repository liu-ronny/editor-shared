import * as http from 'http';
import * as os from 'os';

import ClientRunner from './client-runner/base-runner';
import CommandHandler from './command-handler';
import StateManager from './state-manager';

export default class IPC {
    protected platform: string;
    protected server?: http.Server;
    protected state: StateManager;
    protected commandHandler: CommandHandler;
    protected clientRunner: ClientRunner;

    constructor(state: StateManager, commandHandler: CommandHandler, clientRunner: ClientRunner, platform: string) {
        this.state = state;
        this.commandHandler = commandHandler;
        this.clientRunner = clientRunner;
        this.platform = platform;
    }

    private os() {
        if (process.platform == 'darwin') {
            return 'MacOS';
        }
        else if (process.platform == 'win32') {
            return 'Windows';
        }
        else if (process.platform == 'linux') {
            return 'Linux';
        }

        return process.platform;
    }

    beforeHandle() {
    }

    async handle(response: any): Promise<any> {
        this.beforeHandle();
        if (response.alternatives) {
            this.state.set('alternatives', {alternatives: response.alternatives});
        }

        let result = null;
        if (response.execute) {
            this.state.set('volume', 0);
            for (let i = 0; i < response.execute.sequences.length; i++) {
                let sequence = response.execute.sequences[i];

                for (let command of sequence.commands) {
                    result = await (this.commandHandler as any)[command.type](command);
                }
            }
        }

        return result;
    }

    send(
        message: any,
        data: any = {},
        onResponse: ((response: any) => void) = (_response: any) => {},
        onError: ((error: any) => void) = (_error: any) => {}
    ) {
        data.type = message;
        let json = JSON.stringify(data);

        let request = http.request(
            {
                host: 'localhost',
                port: 17373,
                path: '/',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(json),
                    'User-Agent': `SerenadeClient/${this.clientRunner.clientVersion()} ` +
                        `(${this.os()} ${os.release()}; ${this.platform})`
                }
            },
            (response: any) => {
                if (onResponse) {
                    onResponse(response);
                }
            }
        );

        if (onError) {
            request.on('error', (error: any) => {
                onError(error);
            });
        }

        request.write(json);
        request.end();
    }

    pingClientUntilRunning() {
        this.send(
            'PING',
            {},
            (_response: any) => {
                this.state.set('clientRunning', true);
            },
            (_error: any) => {
                setTimeout(() => {
                    this.pingClientUntilRunning();
                }, 100);
            }
        );
    }

    start() {
        this.state.subscribe('listening', (listening: any, previous: any) => {
            if (listening === !!previous) {
                return;
            }

            this.send(listening ? 'ENABLE_LISTENING' : 'DISABLE_LISTENING');
        });

        this.server = http.createServer((request, response) => {
            let body = '';
            request.on('data', data => {
                body += data;
            });

            request.on('end', async () => {
                let parseResponse = '';
                try {
                    parseResponse = JSON.parse(body);
                }
                catch (e) {
                    response.end('');
                    return;
                }

                let result = await this.handle(parseResponse);
                if (!result) {
                    result = {success: true};
                }

                response.statusCode = 200;
                response.setHeader('Content-Type', 'application/json');
                response.end(JSON.stringify(result));
            });
        });

        this.server.once('error', (error: any) => {
            if (error.code === 'EADDRINUSE') {
                console.error('Serenade is already running in another editor window.');
                return;
            }
        });

        this.server.listen(17374);
    }

    stop() {
        if (this.server) {
            this.server.close();
        }
    }
}
