// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/providers/remoteAgentHost/electron-browser/remoteAgentHostLocationPreferenceCommand.ts
import { computeSSHConnectionKey } from "./module-1779.mjs";
import { IRemoteAgentHostService, RemoteAgentHostsEnabledSettingId, getEntryAddress } from "./module-1736.mjs";
import { ITunnelAgentHostService, TUNNEL_ADDRESS_PREFIX } from "./module-1734.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { isAgentHostProvider } from "./module-1764.mjs";
import { Action2, registerAction2 } from "./module-0092.mjs";
import { ChangeRemoteAgentHostLocationPreferenceCommandId } from "./module-3559.mjs";
import { CHAT_CATEGORY } from "./module-1475.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { IRemoteAgentHostLocationPreferenceService } from "./module-3558.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IDialogService } from "./module-0267.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IProductService } from "./module-0875.mjs";
import { IProgressService } from "./module-0446.mjs";
import { ISessionsProvidersService } from "./module-1765.mjs";
import { changeRemoteAgentHostLocationPreference } from "./module-3560.mjs";


// src/vs/sessions/contrib/providers/remoteAgentHost/electron-browser/remoteAgentHostLocationPreferenceCommand.ts
function collectRemoteAgentHostLocationTargets(sshEntries, cachedTunnels) {
  const targets = /* @__PURE__ */ new Map();
  for (const entry of sshEntries) {
    if (entry.connection.type !== "ssh" /* SSH */) {
      continue;
    }
    const preferenceKey = computeSSHConnectionKey({
      sshConfigHost: entry.connection.sshConfigHost,
      username: entry.connection.user,
      host: entry.connection.hostName,
      port: entry.connection.port
    });
    if (!targets.has(preferenceKey)) {
      targets.set(preferenceKey, { preferenceKey, address: getEntryAddress(entry), label: entry.name });
    }
  }
  for (const tunnel of cachedTunnels) {
    const preferenceKey = `${TUNNEL_ADDRESS_PREFIX}${tunnel.tunnelId}`;
    if (!targets.has(preferenceKey)) {
      targets.set(preferenceKey, { preferenceKey, address: preferenceKey, label: tunnel.name });
    }
  }
  return [...targets.values()];
}

async function pickRemoteAgentHostLocationTarget(quickInputService, targets) {
  if (targets.length <= 1) {
    return targets[0];
  }
  const picked = await quickInputService.pick(
    targets.map((target) => ({ label: target.label, target })),
    { placeHolder: localize(5265, null) }
  );
  return picked?.target;
}

function findAgentHostProviderForTarget(providers2, liveAddress) {
  return providers2.filter(isAgentHostProvider).find((provider) => provider.remoteAddress === liveAddress);
}

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: ChangeRemoteAgentHostLocationPreferenceCommandId,
      title: localize2(5263, "Change Preferred Remote Agent Location"),
      category: CHAT_CATEGORY,
      f1: true,
      precondition: ContextKeyExpr.and(
        ChatContextKeys.enabled,
        ContextKeyExpr.equals(`config.${RemoteAgentHostsEnabledSettingId}`, true)
      )
    });
  }
  async run(accessor) {
    const remoteAgentHostService = accessor.get(IRemoteAgentHostService);
    const tunnelAgentHostService = accessor.get(ITunnelAgentHostService);
    const locationPreferenceService = accessor.get(IRemoteAgentHostLocationPreferenceService);
    const quickInputService = accessor.get(IQuickInputService);
    const dialogService = accessor.get(IDialogService);
    const notificationService = accessor.get(INotificationService);
    const productService = accessor.get(IProductService);
    const progressService = accessor.get(IProgressService);
    const sessionsProvidersService = accessor.get(ISessionsProvidersService);
    const targets = collectRemoteAgentHostLocationTargets(remoteAgentHostService.configuredEntries, tunnelAgentHostService.getCachedTunnels());
    if (targets.length === 0) {
      notificationService.info(localize(5264, null));
      return;
    }
    const target = await pickRemoteAgentHostLocationTarget(quickInputService, targets);
    if (!target) {
      return;
    }
    const provider = findAgentHostProviderForTarget(sessionsProvidersService.getProviders(), target.address);
    await changeRemoteAgentHostLocationPreference({
      preferenceKey: target.preferenceKey,
      hostLabel: target.label,
      productName: productService.nameShort,
      provider,
      dialogService,
      locationPreferenceService,
      notificationService,
      remoteAgentHostService,
      progressService
    });
  }
});
export { collectRemoteAgentHostLocationTargets, pickRemoteAgentHostLocationTarget, findAgentHostProviderForTarget };
