// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatSetup/chatSetup.ts
import { product_default } from "./module-0139.mjs";
import { RawContextKey } from "./module-0089.mjs";
import { ExtensionIdentifier } from "./module-0688.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/chat/browser/chatSetup/chatSetup.ts
var defaultChat2 = {
  chatExtensionId: product_default.defaultChatAgent?.chatExtensionId ?? "",
  chatRefreshTokenCommand: product_default.defaultChatAgent?.chatRefreshTokenCommand ?? "",
  providerExtensionId: product_default.defaultChatAgent?.providerExtensionId ?? ""
};

var ChatSetupDialogVisibleContext = new RawContextKey("chatSetupDialogVisible", false);

var ChatSetupError = class extends Error {
  constructor(originalError, userNotified) {
    super(originalError.message, { cause: originalError });
    this.originalError = originalError;
    this.userNotified = userNotified;
    this.name = originalError.name;
  }
};

function refreshTokens(commandService) {
  commandService.executeCommand(defaultChat2.chatRefreshTokenCommand).catch(() => {
  });
}

function buildUpgradeUrlWithRedirect(baseUpgradeUrl, urlProtocol, quality) {
  const vscodeUri = `${urlProtocol}://${defaultChat2.chatExtensionId}/upgrade-success`;
  const redirectHost = quality === "stable" ? "vscode.dev" : "insiders.vscode.dev";
  const returnTo = `https://${redirectHost}/redirect?url=${encodeURIComponent(vscodeUri)}`;
  const separator2 = baseUpgradeUrl.includes("?") ? "&" : "?";
  return `${baseUpgradeUrl}${separator2}return_to=${encodeURIComponent(returnTo)}`;
}

async function maybeEnableAuthExtension(extensionsWorkbenchService, logService) {
  if (!defaultChat2.providerExtensionId) {
    return false;
  }
  const providerExtension = extensionsWorkbenchService.local.find(
    (e4) => ExtensionIdentifier.equals(e4.identifier.id, defaultChat2.providerExtensionId)
  );
  if (!providerExtension) {
    return false;
  }
  if (providerExtension.enablementState === 10 /* DisabledGlobally */ || providerExtension.enablementState === 11 /* DisabledWorkspace */) {
    logService.info(`[chat setup] auth provider extension '${defaultChat2.providerExtensionId}' is disabled, re-enabling it`);
    try {
      await extensionsWorkbenchService.setEnablement([providerExtension], 12 /* EnabledGlobally */);
      await extensionsWorkbenchService.updateRunningExtensions(localize(11128, null));
      return true;
    } catch (error) {
      logService.error(`[chat setup] failed to re-enable auth provider extension '${defaultChat2.providerExtensionId}'`, error);
      return false;
    }
  }
  return false;
}
export { refreshTokens, buildUpgradeUrlWithRedirect, maybeEnableAuthExtension, defaultChat2, ChatSetupDialogVisibleContext, ChatSetupError };
