// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/sandbox/common/sandboxHelperIpc.ts



// src/vs/platform/sandbox/common/sandboxHelperIpc.ts
var SANDBOX_HELPER_CHANNEL_NAME = "sandboxHelper";

var SandboxHelperChannelClient = class {
  constructor(channel) {
    this.channel = channel;
  }
  checkSandboxDependencies() {
    return this.channel.call("checkSandboxDependencies");
  }
  getWindowsMxcFilesystemPolicy() {
    return this.channel.call("getWindowsMxcFilesystemPolicy");
  }
  getWindowsMxcEnvironment() {
    return this.channel.call("getWindowsMxcEnvironment");
  }
  buildWindowsMxcSandboxPayload(commandLine, policy, workingDirectory, containerName, containment) {
    return this.channel.call("buildWindowsMxcSandboxPayload", { commandLine, policy, workingDirectory, containerName, containment });
  }
};
export { SANDBOX_HELPER_CHANNEL_NAME, SandboxHelperChannelClient };
