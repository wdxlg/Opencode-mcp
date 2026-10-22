// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/actions/chatPluginActions.ts
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { CHAT_CATEGORY } from "./module-1475.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { IExtensionsWorkbenchService } from "./module-1023.mjs";
import { Codicon } from "./module-0085.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { InstalledAgentPluginsViewId } from "./module-0982.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IPluginInstallService } from "./module-2544.mjs";
import { DisposableStore, toDisposable } from "./module-0012.mjs";
import { parseMarketplaceReference, parseMarketplaceReferences, readConfiguredMarketplaces } from "./module-1026.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IAgentPluginRepositoryService } from "./module-1024.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IFileService } from "./module-0269.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";


// src/vs/workbench/contrib/chat/browser/actions/chatPluginActions.ts
var ManagePluginsAction = class _ManagePluginsAction extends Action2 {
  static {
    this.ID = "workbench.action.chat.managePlugins";
  }
  constructor() {
    super({
      id: _ManagePluginsAction.ID,
      title: localize2(8738, "Plugins"),
      category: CHAT_CATEGORY,
      precondition: ChatContextKeys.enabled,
      f1: true
    });
  }
  async run(accessor) {
    accessor.get(IExtensionsWorkbenchService).openSearch("@agentPlugins ");
  }
};

var InstallFromSourceAction = class _InstallFromSourceAction extends Action2 {
  static {
    this.ID = "workbench.action.chat.installPluginFromSource";
  }
  constructor() {
    super({
      id: _InstallFromSourceAction.ID,
      title: localize2(8732, "Install Plugin from Source"),
      category: CHAT_CATEGORY,
      icon: Codicon.add,
      precondition: ChatContextKeys.enabled,
      f1: true,
      menu: [{
        id: MenuId.ViewTitle,
        when: ContextKeyExpr.and(
          ContextKeyExpr.equals("view", InstalledAgentPluginsViewId),
          ChatContextKeys.Setup.hidden.negate(),
          ChatContextKeys.Setup.disabledInWorkspace.negate()
        ),
        group: "navigation",
        order: 1
      }]
    });
  }
  async run(accessor, options3) {
    const quickInputService = accessor.get(IQuickInputService);
    const pluginInstallService = accessor.get(IPluginInstallService);
    const extensionsWorkbenchService = accessor.get(IExtensionsWorkbenchService);
    const store = new DisposableStore();
    const inputBox = store.add(quickInputService.createInputBox());
    inputBox.placeholder = localize(8739, null);
    inputBox.prompt = localize(8740, null);
    inputBox.ignoreFocusOut = true;
    inputBox.show();
    store.add(inputBox.onDidChangeValue(() => {
      inputBox.validationMessage = void 0;
    }));
    return new Promise((resolve3) => {
      let installing = false;
      let installed = false;
      store.add(toDisposable(() => resolve3(installed)));
      store.add(inputBox.onDidHide(() => {
        if (!installing) {
          store.dispose();
        }
      }));
      store.add(inputBox.onDidAccept(async () => {
        const source = inputBox.value.trim();
        if (!source) {
          return;
        }
        const validationError = pluginInstallService.validatePluginSource(source);
        if (validationError) {
          inputBox.validationMessage = validationError;
          return;
        }
        inputBox.busy = true;
        inputBox.enabled = false;
        installing = true;
        try {
          inputBox.hide();
          const result = await pluginInstallService.installPluginFromSource(source);
          if (!result.success) {
            if (result.message) {
              inputBox.validationMessage = result.message;
            }
            inputBox.show();
          } else {
            installed = true;
            if (!options3?.skipReveal) {
              const ref = parseMarketplaceReference(source);
              if (ref) {
                extensionsWorkbenchService.openSearch(`@agentPlugins ${ref.displayLabel}`);
              }
            }
            store.dispose();
          }
        } catch (e4) {
          const detail2 = e4 instanceof Error ? e4.message : String(e4);
          inputBox.validationMessage = localize(8731, null, detail2);
          inputBox.show();
        } finally {
          installing = false;
          if (!store.isDisposed) {
            inputBox.busy = false;
            inputBox.enabled = true;
          }
        }
      }));
    });
  }
};

var ManagePluginMarketplacesAction = class _ManagePluginMarketplacesAction extends Action2 {
  static {
    this.ID = "workbench.action.chat.managePluginMarketplaces";
  }
  constructor() {
    super({
      id: _ManagePluginMarketplacesAction.ID,
      title: localize2(8735, "Manage Plugin Marketplaces"),
      icon: Codicon.globe,
      category: CHAT_CATEGORY,
      precondition: ChatContextKeys.enabled,
      f1: true,
      menu: [{
        id: MenuId.ViewTitle,
        when: ContextKeyExpr.and(
          ContextKeyExpr.equals("view", InstalledAgentPluginsViewId),
          ChatContextKeys.Setup.hidden.negate(),
          ChatContextKeys.Setup.disabledInWorkspace.negate()
        ),
        group: "navigation",
        order: 2
      }]
    });
  }
  async run(accessor) {
    const quickInputService = accessor.get(IQuickInputService);
    const configurationService = accessor.get(IConfigurationService);
    const pluginRepositoryService = accessor.get(IAgentPluginRepositoryService);
    const extensionsWorkbenchService = accessor.get(IExtensionsWorkbenchService);
    const commandService = accessor.get(ICommandService);
    const fileService = accessor.get(IFileService);
    const notificationService = accessor.get(INotificationService);
    const { userValues, extraValues, effectiveValues } = readConfiguredMarketplaces(configurationService);
    const refs = parseMarketplaceReferences(effectiveValues);
    const policyCanonicalIds = new Set(parseMarketplaceReferences(extraValues).map((r2) => r2.canonicalId));
    if (refs.length === 0) {
      quickInputService.pick([], { placeHolder: localize(8736, null) });
      return;
    }
    const items = refs.map((ref2) => ({
      label: ref2.displayLabel,
      description: ref2.kind === "localFileUri" /* LocalFileUri */ ? localize(8733, null) : policyCanonicalIds.has(ref2.canonicalId) ? localize(8734, null, ref2.cloneUrl) : ref2.cloneUrl,
      reference: ref2,
      managedByPolicy: policyCanonicalIds.has(ref2.canonicalId)
    }));
    const selected = await quickInputService.pick(items, {
      placeHolder: localize(8743, null)
    });
    if (!selected) {
      return;
    }
    const ref = selected.reference;
    const actionItems = [
      { id: "showPlugins", label: localize(8745, null) }
    ];
    const repoUri = pluginRepositoryService.getRepositoryUri(ref);
    const repoExists = await fileService.exists(repoUri);
    if (repoExists) {
      actionItems.push({ id: "openDirectory", label: localize(8737, null) });
    }
    actionItems.push({ id: "removeMarketplace", label: localize(8742, null) });
    const action = await quickInputService.pick(actionItems, {
      placeHolder: localize(8744, null, ref.displayLabel)
    });
    if (!action) {
      return;
    }
    switch (action.id) {
      case "showPlugins":
        extensionsWorkbenchService.openSearch(`@agentPlugins ${ref.displayLabel}`);
        break;
      case "openDirectory":
        await commandService.executeCommand("revealFileInOS", repoUri);
        break;
      case "removeMarketplace": {
        if (selected.managedByPolicy) {
          notificationService.notify({
            severity: Severity2.Warning,
            message: localize(8741, null, ref.displayLabel)
          });
          return;
        }
        const updated = userValues.filter((v2) => typeof v2 === "string" && v2.trim() !== ref.rawValue);
        await configurationService.updateValue("chat.plugins.marketplaces" /* PluginMarketplaces */, updated);
        break;
      }
    }
  }
};

function registerChatPluginActions() {
  registerAction2(ManagePluginsAction);
  registerAction2(InstallFromSourceAction);
  registerAction2(ManagePluginMarketplacesAction);
}
export { registerChatPluginActions, ManagePluginsAction, InstallFromSourceAction, ManagePluginMarketplacesAction };
