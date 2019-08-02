import BaseRunner from './base-runner';

export default class LinuxRunner extends BaseRunner {
    javaBinary() {
        return './java';
    }

    javaPath() {
        return 'bin';
    }

    jdkUrl() {
        return `https://cdn.serenade.ai/jdk/jdk-linux-${this.jdkVersion()}.tar.gz`;
    }

    jdkVersion() {
        return '0e348736654c61b3ceb268190d263d41';
    }
}
