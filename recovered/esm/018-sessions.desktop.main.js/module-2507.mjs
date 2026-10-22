// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/actions/chatAgentRecommendationActions.ts
import { Disposable } from "./module-0012.mjs";
import { ExtensionIdentifier } from "./module-0688.mjs";
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { localize2 } from "./module-0001.mjs";
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { CHAT_CATEGORY } from "./module-1475.mjs";
import { Codicon } from "./module-0085.mjs";
import { CommandsRegistry, ICommandService } from "./module-0087.mjs";
import { IProductService } from "./module-0875.mjs";
import { IChatService } from "./module-0973.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtensionGalleryService } from "./module-0874.mjs";
import { IWorkbenchExtensionManagementService } from "./module-1047.mjs";
import { TimeoutTimer } from "./module-0036.mjs";


// src/vs/workbench/contrib/chat/browser/actions/chatAgentRecommendationActions.ts
var INSTALL_CONTEXT_PREFIX = "chat.installRecommendationAvailable";

var ChatAgentRecommendation = class extends Disposable {
  constructor(productService, extensionGalleryService, extensionManagementService, contextKeyService) {
    super();
    this.productService = productService;
    this.extensionGalleryService = extensionGalleryService;
    this.extensionManagementService = extensionManagementService;
    this.contextKeyService = contextKeyService;
    this.availabilityContextKeys = /* @__PURE__ */ new Map();
    this.refreshRequestId = 0;
    const recommendations = this.productService.chatSessionRecommendations;
    if (!recommendations?.length || !this.extensionGalleryService.isEnabled()) {
      return;
    }
    for (const recommendation of recommendations) {
      this.registerRecommendation(recommendation);
    }
    const refresh = () => this.refreshInstallAvailability();
    this._register(this.extensionManagementService.onProfileAwareDidInstallExtensions(refresh));
    this._register(this.extensionManagementService.onProfileAwareDidUninstallExtension(refresh));
    this._register(this.extensionManagementService.onDidChangeProfile(refresh));
    this.refreshInstallAvailability();
  }
  static {
    this.ID = "workbench.contrib.chatAgentRecommendation";
  }
  registerRecommendation(recommendation) {
    const extensionKey = ExtensionIdentifier.toKey(recommendation.extensionId);
    const commandId = `chat.installRecommendation.${extensionKey}.${recommendation.name}`;
    const availabilityContextId = `${INSTALL_CONTEXT_PREFIX}.${extensionKey}`;
    const availabilityContext = new RawContextKey(availabilityContextId, false).bindTo(this.contextKeyService);
    this.availabilityContextKeys.set(extensionKey, availabilityContext);
    const title = localize2(8578, "New {0}", recommendation.displayName);
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: commandId,
          title,
          tooltip: recommendation.description,
          f1: false,
          category: CHAT_CATEGORY,
          icon: Codicon.extensions,
          menu: [
            {
              id: MenuId.ChatNewMenu,
              group: "4_recommendations",
              when: ContextKeyExpr.equals(availabilityContextId, true)
            }
          ]
        });
      }
      async run(accessor) {
        const commandService = accessor.get(ICommandService);
        const productService = accessor.get(IProductService);
        const chatService = accessor.get(IChatService);
        const installPreReleaseVersion = productService.quality !== "stable";
        await commandService.executeCommand("workbench.extensions.installExtension", recommendation.extensionId, {
          installPreReleaseVersion
        });
        await runPostInstallCommand(commandService, chatService, recommendation.postInstallCommand);
      }
    }));
  }
  refreshInstallAvailability() {
    if (!this.availabilityContextKeys.size) {
      return;
    }
    const currentRequest = ++this.refreshRequestId;
    this.extensionManagementService.getInstalled().then((installedExtensions) => {
      if (currentRequest !== this.refreshRequestId) {
        return;
      }
      const installed = new Set(installedExtensions.map((ext) => ExtensionIdentifier.toKey(ext.identifier.id)));
      for (const [extensionKey, context2] of this.availabilityContextKeys) {
        context2.set(!installed.has(extensionKey));
      }
    }, () => {
      if (currentRequest !== this.refreshRequestId) {
        return;
      }
      for (const [, context2] of this.availabilityContextKeys) {
        context2.set(false);
      }
    });
  }
};

ChatAgentRecommendation = __decorateClass([
  __decorateParam(0, IProductService),
  __decorateParam(1, IExtensionGalleryService),
  __decorateParam(2, IWorkbenchExtensionManagementService),
  __decorateParam(3, IContextKeyService)
], ChatAgentRecommendation);

async function runPostInstallCommand(commandService, chatService, commandId) {
  if (!commandId) {
    return;
  }
  await waitForCommandRegistration(commandId);
  await chatService.activateDefaultAgent("panel" /* Chat */);
  try {
    await commandService.executeCommand(commandId);
  } catch {
  }
}

function waitForCommandRegistration(commandId) {
  if (CommandsRegistry.getCommands().has(commandId)) {
    return Promise.resolve();
  }
  return new Promise((resolve3) => {
    const timer = new TimeoutTimer();
    const listener = CommandsRegistry.onDidRegisterCommand((id2) => {
      if (id2 === commandId) {
        listener.dispose();
        timer.dispose();
        resolve3();
      }
    });
    timer.cancelAndSet(() => {
      listener.dispose();
      resolve3();
    }, 1e4);
  });
}
export { runPostInstallCommand, waitForCommandRegistration, INSTALL_CONTEXT_PREFIX, ChatAgentRecommendation };
