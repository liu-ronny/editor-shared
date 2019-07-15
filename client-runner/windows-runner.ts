import BaseRunner from './base-runner';

export default class WindowsRunner extends BaseRunner {
    javaBinary() {
        return 'java.exe';
    }

    javaPath() {
        return 'bin';
    }

    jdkUrl() {
        return `https://cdn.serenade.ai/jdk/jdk-windows-${this.jdkVersion()}.tar.gz`;
    }

    jdkVersion() {
        return '86526c4bd2c90a6bafbd1032ec0bf3b9';
    }
}
