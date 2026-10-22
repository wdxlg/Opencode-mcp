// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/providers/remoteAgentHost/electron-browser/forgetSSHHostKeyCommand.ts
import { Action2, registerAction2 } from "./module-0092.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { CHAT_CATEGORY } from "./module-1475.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { RemoteAgentHostsEnabledSettingId } from "./module-1736.mjs";
import { ISSHHostKeyTrustService } from "./module-4054.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { INotificationService } from "./module-0336.mjs";


// src/vs/sessions/contrib/providers/remoteAgentHost/electron-browser/forgetSSHHostKeyCommand.ts
var ForgetSSHHostKeyCommandId = "workbench.action.chat.forgetSSHHostKey";

function toTrustedHostPickItems(hosts) {
  return hosts.slice().sort((a, b) => a.host.localeCompare(b.host) || a.port - b.port).map((trustedHost) => {
    const alias = trustedHost.keys.find((key3) => key3.alias)?.alias;
    const label3 = trustedHost.port === 22 ? trustedHost.host : `${trustedHost.host}:${trustedHost.port}`;
    return {
      label: alias && alias !== trustedHost.host ? `${alias} (${label3})` : label3,
      description: trustedHost.keys.map((key3) => `${key3.keyType} ${key3.fingerprint}`).join(", "),
      trustedHost
    };
  });
}

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: ForgetSSHHostKeyCommandId,
      title: localize2(5258, "Forget SSH Host Key"),
      category: CHAT_CATEGORY,
      f1: true,
      precondition: ContextKeyExpr.and(
        ChatContextKeys.enabled,
        ContextKeyExpr.equals(`config.${RemoteAgentHostsEnabledSettingId}`, true)
      )
    });
  }
  async run(accessor) {
    const hostKeyTrustService = accessor.get(ISSHHostKeyTrustService);
    const quickInputService = accessor.get(IQuickInputService);
    const notificationService = accessor.get(INotificationService);
    const hosts = hostKeyTrustService.listTrustedHosts();
    if (hosts.length === 0) {
      notificationService.info(localize(5261, null));
      return;
    }
    const picked = await quickInputService.pick(
      toTrustedHostPickItems(hosts),
      {
        placeHolder: localize(5262, null),
        canPickMany: true
      }
    );
    if (!picked?.length) {
      return;
    }
    for (const item of picked) {
      hostKeyTrustService.forgetHost(item.trustedHost.host, item.trustedHost.port);
    }
    notificationService.info(picked.length === 1 ? localize(5260, null, picked[0].trustedHost.host) : localize(5259, null, picked.length));
  }
});
export { toTrustedHostPickItems, ForgetSSHHostKeyCommandId };
