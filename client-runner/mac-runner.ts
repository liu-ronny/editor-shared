import BaseRunner from './base-runner';

export default class MacRunner extends BaseRunner {
    javaBinary() {
        return './java';
    }

    javaPath() {
        return 'bin';
    }

    jdkUrl() {
        return `https://cdn.serenade.ai/jdk/jdk-mac-${this.jdkVersion()}.tar.gz`;
    }

    jdkVersion() {
        return 'b62c1cb2e6456a5590194053b063ee21';
    }
}
