// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/actions/chatLanguageModelActions.ts
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { CHAT_CATEGORY } from "./module-1475.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { ILanguageModelsService } from "./module-0968.mjs";
import { IAuthenticationAccessService } from "./module-0969.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IExtensionService } from "./module-0889.mjs";
import { IExtensionsWorkbenchService } from "./module-1023.mjs";
import { IProductService } from "./module-0875.mjs";
import { INTERNAL_AUTH_PROVIDER_PREFIX } from "./module-0952.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";


// src/vs/workbench/contrib/chat/browser/actions/chatLanguageModelActions.ts
var ManageLanguageModelAuthenticationAction = class _ManageLanguageModelAuthenticationAction extends Action2 {
  static {
    this.ID = "workbench.action.chat.manageLanguageModelAuthentication";
  }
  constructor() {
    super({
      id: _ManageLanguageModelAuthenticationAction.ID,
      title: localize2(8696, "Manage Language Model Access..."),
      category: CHAT_CATEGORY,
      precondition: ChatContextKeys.enabled,
      menu: [{
        id: MenuId.AccountsContext,
        order: 100
      }],
      f1: true
    });
  }
  async run(accessor) {
    const quickInputService = accessor.get(IQuickInputService);
    const languageModelsService = accessor.get(ILanguageModelsService);
    const authenticationAccessService = accessor.get(IAuthenticationAccessService);
    const dialogService = accessor.get(IDialogService);
    const extensionService = accessor.get(IExtensionService);
    const extensionsWorkbenchService = accessor.get(IExtensionsWorkbenchService);
    const productService = accessor.get(IProductService);
    const modelIds = languageModelsService.getLanguageModelIds();
    const extensionAuth = /* @__PURE__ */ new Map();
    const ownerToAccountLabel = /* @__PURE__ */ new Map();
    for (const modelId of modelIds) {
      const model = languageModelsService.lookupLanguageModel(modelId);
      if (!model?.auth) {
        continue;
      }
      const ownerId2 = model.extension.value;
      if (extensionAuth.has(ownerId2)) {
        continue;
      }
      try {
        const providerId = INTERNAL_AUTH_PROVIDER_PREFIX + ownerId2;
        const accountLabel = model.auth.accountLabel || "Language Models";
        ownerToAccountLabel.set(ownerId2, accountLabel);
        const allowedExtensions = authenticationAccessService.readAllowedExtensions(
          providerId,
          accountLabel
        ).filter((ext) => !ext.trusted);
        if (productService.trustedExtensionAuthAccess && !Array.isArray(productService.trustedExtensionAuthAccess)) {
          const trustedExtensions = productService.trustedExtensionAuthAccess[providerId];
          for (const ext of trustedExtensions) {
            const index2 = allowedExtensions.findIndex((a) => a.id === ext);
            if (index2 !== -1) {
              allowedExtensions.splice(index2, 1);
            }
            const extension = await extensionService.getExtension(ext);
            if (!extension) {
              continue;
            }
            allowedExtensions.push({
              id: ext,
              name: extension.displayName || extension.name,
              allowed: true,
              // Assume trusted extensions are allowed by default
              trusted: true
              // Mark as trusted
            });
          }
        }
        const filteredExtensions = new Array();
        for (const ext of allowedExtensions) {
          if (await extensionService.getExtension(ext.id)) {
            filteredExtensions.push(ext);
          }
        }
        extensionAuth.set(ownerId2, filteredExtensions);
      } catch (error) {
        if (!extensionAuth.has(ownerId2)) {
          extensionAuth.set(ownerId2, []);
        }
      }
    }
    if (extensionAuth.size === 0) {
      dialogService.prompt({
        type: "info",
        message: localize(8699, null),
        detail: localize(8700, null)
      });
      return;
    }
    const items = [];
    for (const [ownerId2, allowedExtensions] of extensionAuth) {
      const extension = await extensionService.getExtension(ownerId2);
      if (!extension) {
        continue;
      }
      items.push({
        type: "separator",
        id: ownerId2,
        label: localize(8691, null, extension.displayName || extension.name),
        buttons: [{
          iconClass: ThemeIcon.asClassName(Codicon.info),
          tooltip: localize(8701, null)
        }]
      });
      let addedTrustedSeparator = false;
      if (allowedExtensions.length > 0) {
        for (const allowedExt of allowedExtensions) {
          if (allowedExt.trusted && !addedTrustedSeparator) {
            items.push({
              type: "separator",
              label: localize(8702, null)
            });
            addedTrustedSeparator = true;
          }
          items.push({
            label: allowedExt.name,
            ownerId: ownerId2,
            id: allowedExt.id,
            picked: allowedExt.allowed ?? false,
            extension: allowedExt,
            disabled: allowedExt.trusted,
            // Don't allow toggling trusted extensions
            buttons: [{
              iconClass: ThemeIcon.asClassName(Codicon.info),
              tooltip: localize(8701, null)
            }]
          });
        }
      } else {
        items.push({
          label: localize(8698, null),
          description: localize(8697, null, ownerId2),
          pickable: false
        });
      }
    }
    const result = await quickInputService.pick(
      items,
      {
        canPickMany: true,
        sortByLabel: true,
        onDidTriggerSeparatorButton(context2) {
          const extId = context2.separator.id;
          if (extId) {
            void extensionsWorkbenchService.open(extId);
          }
        },
        onDidTriggerItemButton(context2) {
          const extId = context2.item.id;
          if (extId) {
            void extensionsWorkbenchService.open(extId);
          }
        },
        title: localize(8693, null),
        placeHolder: localize(8692, null)
      }
    );
    if (!result) {
      return;
    }
    for (const [ownerId2, allowedExtensions] of extensionAuth) {
      const allowedSet = new Set(result.filter((item) => item.ownerId === ownerId2).filter((item) => !item.extension?.trusted).map((item) => item.id));
      for (const allowedExt of allowedExtensions) {
        allowedExt.allowed = allowedSet.has(allowedExt.id);
      }
      authenticationAccessService.updateAllowedExtensions(
        INTERNAL_AUTH_PROVIDER_PREFIX + ownerId2,
        ownerToAccountLabel.get(ownerId2) || "Language Models",
        allowedExtensions
      );
    }
  }
};

var ConfigureLanguageModelsGroupAction = class extends Action2 {
  constructor() {
    super({
      id: "lm.addLanguageModelsProviderGroup",
      title: localize(8694, null)
    });
  }
  async run(accessor, languageModelsProviderGroup) {
    const languageModelsService = accessor.get(ILanguageModelsService);
    if (!languageModelsProviderGroup) {
      throw new Error("Language model group is required");
    }
    const { name, vendor, ...configuration2 } = languageModelsProviderGroup;
    await languageModelsService.addLanguageModelsProviderGroup(name, vendor, configuration2);
  }
};

var MigrateLanguageModelsGroupAction = class extends Action2 {
  constructor() {
    super({
      id: "lm.migrateLanguageModelsProviderGroup",
      title: localize(8695, null)
    });
  }
  async run(accessor, languageModelsProviderGroup) {
    const languageModelsService = accessor.get(ILanguageModelsService);
    if (!languageModelsProviderGroup) {
      throw new Error("Language model group is required");
    }
    await languageModelsService.migrateLanguageModelsProviderGroup(languageModelsProviderGroup);
  }
};

function registerLanguageModelActions() {
  registerAction2(ManageLanguageModelAuthenticationAction);
  registerAction2(ConfigureLanguageModelsGroupAction);
  registerAction2(MigrateLanguageModelsGroupAction);
}
export { registerLanguageModelActions, ManageLanguageModelAuthenticationAction, ConfigureLanguageModelsGroupAction, MigrateLanguageModelsGroupAction };
