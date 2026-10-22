// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/sshRemoteAgentHost.ts
import { createDecorator } from "./module-0077.mjs";


// src/vs/platform/agentHost/common/sshRemoteAgentHost.ts
var ISSHRemoteAgentHostService = createDecorator("sshRemoteAgentHostService");

var SSH_REMOTE_AGENT_HOST_CHANNEL = "sshRemoteAgentHost";

function computeSSHConnectionKey(config) {
  return config.sshConfigHost ? `ssh:${config.sshConfigHost}` : `${config.username}@${config.host}:${config.port ?? 22}`;
}

var SSH_HOST_KEY_DENIED_ERROR_NAME = "SSHHostKeyDenied";

function isSSHHostKeyDeniedError(error) {
  return error instanceof Error && error.name === SSH_HOST_KEY_DENIED_ERROR_NAME;
}

var ISSHRemoteAgentHostMainService = createDecorator("sshRemoteAgentHostMainService");
export { computeSSHConnectionKey, isSSHHostKeyDeniedError, ISSHRemoteAgentHostService, SSH_REMOTE_AGENT_HOST_CHANNEL, SSH_HOST_KEY_DENIED_ERROR_NAME, ISSHRemoteAgentHostMainService };
