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
        return '826e79539e8bbcc338c46e32ce3dfbb6';
    }
}
