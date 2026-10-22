// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/agentHost/common/sshRemoteAgentHost.ts
import { createDecorator } from "./module-0042.mjs";


// src/vs/platform/agentHost/common/sshRemoteAgentHost.ts
var ISSHRemoteAgentHostService = createDecorator("sshRemoteAgentHostService");

var SSH_REMOTE_AGENT_HOST_CHANNEL = "sshRemoteAgentHost";

function computeSSHConnectionKey(config) {
  return config.sshConfigHost ? `ssh:${config.sshConfigHost}` : `${config.username}@${config.host}:${config.port ?? 22}`;
}

function isSSHStrictHostKeyChecking(value) {
  return value === "ask" || value === "accept-new" || value === "yes" || value === "no" || value === "off";
}

var SSH_HOST_KEY_DENIED_ERROR_NAME = "SSHHostKeyDenied";

var SSHHostKeyDeniedError = class extends Error {
  constructor(displayHost) {
    super(`Host key verification failed for ${displayHost}`);
    this.name = SSH_HOST_KEY_DENIED_ERROR_NAME;
  }
};

var ISSHRemoteAgentHostMainService = createDecorator("sshRemoteAgentHostMainService");
export { computeSSHConnectionKey, isSSHStrictHostKeyChecking, ISSHRemoteAgentHostService, SSH_REMOTE_AGENT_HOST_CHANNEL, SSH_HOST_KEY_DENIED_ERROR_NAME, SSHHostKeyDeniedError, ISSHRemoteAgentHostMainService };
