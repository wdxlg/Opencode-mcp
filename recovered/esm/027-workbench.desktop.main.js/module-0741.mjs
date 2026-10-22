// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/defaultAccount/common/defaultAccount.ts
import { createDecorator } from "./module-0077.mjs";


// src/vs/platform/defaultAccount/common/defaultAccount.ts
var GitHubPaths = {
  copilotSettings: "settings/copilot/features",
  billingBudgets: "settings/copilot/features?utm_source=vscode",
  copilotUpgrade: "github-copilot/upgrade?utm_source=vscode"
};

var MANAGED_SETTINGS_UPDATE_REQUIRED_ERROR_CODE = "client_update_required";

var IDefaultAccountService = createDecorator("defaultAccountService");
export { GitHubPaths, MANAGED_SETTINGS_UPDATE_REQUIRED_ERROR_CODE, IDefaultAccountService };
