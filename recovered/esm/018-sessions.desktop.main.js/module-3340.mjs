// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/authentication/browser/actions/signOutOfAccountAction.ts
import { Action2 } from "./module-0092.mjs";
import { localize } from "./module-0001.mjs";
import { IAuthenticationService } from "./module-0952.mjs";
import { IAuthenticationUsageService } from "./module-1415.mjs";
import { IAuthenticationAccessService } from "./module-0969.mjs";
import { IDialogService } from "./module-0267.mjs";
import { severity_default } from "./module-0266.mjs";


// src/vs/workbench/contrib/authentication/browser/actions/signOutOfAccountAction.ts
var SignOutOfAccountAction = class extends Action2 {
  constructor() {
    super({
      id: "_signOutOfAccount",
      title: localize(7968, null),
      f1: false
    });
  }
  async run(accessor, { providerId, accountLabel }) {
    const authenticationService = accessor.get(IAuthenticationService);
    const authenticationUsageService = accessor.get(IAuthenticationUsageService);
    const authenticationAccessService = accessor.get(IAuthenticationAccessService);
    const dialogService = accessor.get(IDialogService);
    if (!providerId || !accountLabel) {
      throw new Error("Invalid arguments. Expected: { providerId: string; accountLabel: string }");
    }
    const allSessions = await authenticationService.getSessions(providerId);
    const sessions = allSessions.filter((s) => s.account.label === accountLabel);
    const accountUsages = authenticationUsageService.readAccountUsages(providerId, accountLabel);
    const { confirmed } = await dialogService.confirm({
      type: severity_default.Info,
      message: accountUsages.length ? localize(7966, null, accountLabel, accountUsages.map((usage) => usage.extensionName).join("\n")) : localize(7967, null, accountLabel),
      primaryButton: localize(7965, null)
    });
    if (confirmed) {
      const removeSessionPromises = sessions.map((session) => authenticationService.removeSession(providerId, session.id));
      await Promise.all(removeSessionPromises);
      authenticationUsageService.removeAccountUsage(providerId, accountLabel);
      authenticationAccessService.removeAllowedExtensions(providerId, accountLabel);
    }
  }
};
export { SignOutOfAccountAction };
