// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/actions/chatGettingStarted.ts
import { Disposable } from "./module-0012.mjs";
import { ExtensionIdentifier } from "./module-0688.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IProductService } from "./module-0875.mjs";
import { IExtensionService } from "./module-0889.mjs";
import { IExtensionManagementService } from "./module-0874.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IChatWidgetService } from "./module-0982.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/contrib/chat/browser/actions/chatGettingStarted.ts
var ChatGettingStartedContribution = class extends Disposable {
  constructor(productService, extensionService, extensionManagementService, storageService, chatWidgetService, configurationService) {
    super();
    this.productService = productService;
    this.extensionService = extensionService;
    this.extensionManagementService = extensionManagementService;
    this.storageService = storageService;
    this.chatWidgetService = chatWidgetService;
    this.configurationService = configurationService;
    this.recentlyInstalled = false;
    const defaultChatAgent2 = this.productService.defaultChatAgent;
    const hideWelcomeView = this.storageService.getBoolean(ChatGettingStartedContribution.hideWelcomeView, -1 /* APPLICATION */, false);
    if (!defaultChatAgent2 || hideWelcomeView) {
      return;
    }
    this.registerListeners(defaultChatAgent2);
  }
  static {
    this.ID = "workbench.contrib.chatGettingStarted";
  }
  static {
    this.hideWelcomeView = "workbench.chat.hideWelcomeView";
  }
  registerListeners(defaultChatAgent2) {
    this._register(this.extensionManagementService.onDidInstallExtensions(async (result) => {
      for (const e4 of result) {
        if (ExtensionIdentifier.equals(defaultChatAgent2.extensionId, e4.identifier.id) && e4.operation === 2 /* Install */) {
          this.recentlyInstalled = true;
          return;
        }
      }
    }));
    this._register(this.extensionService.onDidChangeExtensionsStatus(async (event) => {
      for (const ext of event) {
        if (ExtensionIdentifier.equals(defaultChatAgent2.extensionId, ext.value)) {
          const extensionStatus = this.extensionService.getExtensionsStatus();
          if (extensionStatus[ext.value].activationTimes && this.recentlyInstalled) {
            this.onDidInstallChat();
            return;
          }
        }
      }
    }));
  }
  async onDidInstallChat() {
    const startupEditor = this.configurationService.getValue("workbench.startupEditor");
    if (startupEditor !== "agentSessionsWelcomePage") {
      this.chatWidgetService.revealWidget();
    }
    this.storageService.store(ChatGettingStartedContribution.hideWelcomeView, true, -1 /* APPLICATION */, 1 /* MACHINE */);
    this.recentlyInstalled = false;
  }
};

ChatGettingStartedContribution = __decorateClass([
  __decorateParam(0, IProductService),
  __decorateParam(1, IExtensionService),
  __decorateParam(2, IExtensionManagementService),
  __decorateParam(3, IStorageService),
  __decorateParam(4, IChatWidgetService),
  __decorateParam(5, IConfigurationService)
], ChatGettingStartedContribution);
export { ChatGettingStartedContribution };
