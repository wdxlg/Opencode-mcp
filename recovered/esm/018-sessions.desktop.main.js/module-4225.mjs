// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/browser/openInVSCodeUtils.ts
import { isAgentHostProvider } from "./module-1764.mjs";
import { VSBuffer, encodeHex } from "./module-0038.mjs";
import { AGENT_HOST_SCHEME, fromAgentHostUri } from "./module-1001.mjs";
import { Schemas } from "./module-0033.mjs";


// src/vs/sessions/browser/openInVSCodeUtils.ts
function resolveRemoteAuthority(providerId, sessionsProvidersService, remoteAgentHostService) {
  const provider = sessionsProvidersService.getProvider(providerId);
  if (!provider || !isAgentHostProvider(provider) || !provider.remoteAddress) {
    return void 0;
  }
  const entry = remoteAgentHostService.getEntryByAddress(provider.remoteAddress);
  if (!entry) {
    return void 0;
  }
  switch (entry.connection.type) {
    case "ssh" /* SSH */:
      if (entry.connection.sshConfigHost) {
        return `ssh-remote+${entry.connection.sshConfigHost}`;
      }
      return `ssh-remote+${sshAuthorityString(entry.connection)}`;
    case "tunnel" /* Tunnel */:
      return `tunnel+${entry.connection.label ?? `${entry.connection.tunnelId}.${entry.connection.clusterId}`}`;
    case "devContainer" /* DevContainer */:
      return `dev-container+${encodeHex(VSBuffer.fromString(entry.connection.hostPath))}`;
    default:
      return void 0;
  }
}

function resolveRemoteFolderUri(folderUri, providerId, sessionsProvidersService, remoteAgentHostService) {
  if (folderUri.scheme !== AGENT_HOST_SCHEME) {
    return folderUri;
  }
  const remoteAuthority = resolveRemoteAuthority(providerId, sessionsProvidersService, remoteAgentHostService);
  if (!remoteAuthority) {
    return folderUri;
  }
  return fromAgentHostUri(folderUri).with({ authority: remoteAuthority, scheme: Schemas.vscodeRemote });
}

function sshAuthorityString(connection) {
  const hostName = connection.hostName;
  const needsEncoding = connection.user || connection.port || /[A-Z/\\+]/.test(hostName) || !/^[a-zA-Z0-9.:\-]+$/.test(hostName);
  if (!needsEncoding) {
    return hostName;
  }
  const obj = { hostName };
  if (connection.user) {
    obj.user = connection.user;
  }
  if (connection.port) {
    obj.port = connection.port;
  }
  const json = JSON.stringify(obj);
  return encodeHex(VSBuffer.fromString(json));
}
export { resolveRemoteAuthority, resolveRemoteFolderUri, sshAuthorityString };
