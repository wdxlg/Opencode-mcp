// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/copilot/copilotAgentStartupConfig.ts
import { equals2 } from "./module-0035.mjs";


// src/vs/platform/agentHost/node/copilot/copilotAgentStartupConfig.ts
var CopilotAgentStartupConfig = class {
  constructor(sessionSync, rubberDuck, multiTurnContextRouting, copilotSdkLogLevel, enterpriseHost, systemProxy, githubMcpServer, managedSettingsPermissions) {
    this.sessionSync = sessionSync;
    this.rubberDuck = rubberDuck;
    this.multiTurnContextRouting = multiTurnContextRouting;
    this.copilotSdkLogLevel = copilotSdkLogLevel;
    this.enterpriseHost = enterpriseHost;
    this.systemProxy = systemProxy;
    this.githubMcpServer = githubMcpServer;
    this.managedSettingsPermissions = managedSettingsPermissions;
  }
  equals(other) {
    return this.changedKeysFrom(other).length === 0;
  }
  proxyTargetChangedFrom(other) {
    return this.enterpriseHost !== other.enterpriseHost || this.systemProxy !== other.systemProxy;
  }
  describeChangesFrom(other) {
    const values = new Map(Object.entries(this));
    return this.changedKeysFrom(other).map((key) => key === "managedSettingsPermissions" ? key : `${key}=${String(values.get(key))}`).join(", ");
  }
  changedKeysFrom(other) {
    const otherEntries = new Map(Object.entries(other));
    return Object.entries(this).filter(([key, value]) => key === "managedSettingsPermissions" ? !equals2(value, otherEntries.get(key)) : value !== otherEntries.get(key)).map(([key]) => key);
  }
};
export { CopilotAgentStartupConfig };
