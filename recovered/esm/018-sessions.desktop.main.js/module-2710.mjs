// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatManagement/chatManagement.contribution.ts
import { registerIcon } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { ChatEntitlementContextKeys } from "./module-0954.mjs";
import { Registry } from "./module-0090.mjs";
import { EditorExtensions } from "./module-0926.mjs";
import { EditorPaneDescriptor } from "./module-1085.mjs";
import { ModelsManagementEditor } from "./module-2708.mjs";
import { SyncDescriptor } from "./module-0134.mjs";
import { ModelsManagementEditorInput } from "./module-2709.mjs";
import { IProductService } from "./module-0875.mjs";
import { IExtensionsWorkbenchService } from "./module-1023.mjs";
import { IWorkbenchExtensionEnablementService } from "./module-1047.mjs";
import { IProgressService } from "./module-0446.mjs";
import { ExtensionIdentifier } from "./module-0688.mjs";
import { Disposable } from "./module-0012.mjs";
import { Action2, MenuId, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { CONTEXT_MODELS_EDITOR, CONTEXT_MODELS_SEARCH_FOCUS, MANAGE_CHAT_COMMAND_ID } from "./module-0965.mjs";
import { CHAT_CATEGORY } from "./module-1475.mjs";
import { IEditorService } from "./module-0935.mjs";
import { ILanguageModelsConfigurationService } from "./module-0967.mjs";
import { ResourceContextKey } from "./module-0950.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";


// src/vs/workbench/contrib/chat/browser/chatManagement/chatManagement.contribution.ts
var languageModelsOpenSettingsIcon = registerIcon("language-models-open-settings", Codicon.goToFile, localize(10890, null));

var LANGUAGE_MODELS_ENTITLEMENT_PRECONDITION = ContextKeyExpr.and(ChatContextKeys.enabled, ContextKeyExpr.or(
  ChatContextKeys.Entitlement.planFree,
  ChatContextKeys.Entitlement.planEdu,
  ChatContextKeys.Entitlement.planPro,
  ChatContextKeys.Entitlement.planProPlus,
  ChatContextKeys.Entitlement.planMax,
  ChatContextKeys.Entitlement.planBusiness,
  ChatContextKeys.Entitlement.planEnterprise,
  ChatContextKeys.Entitlement.internal,
  ChatEntitlementContextKeys.clientByokEnabled
));

Registry.as(EditorExtensions.EditorPane).registerEditorPane(
  EditorPaneDescriptor.create(
    ModelsManagementEditor,
    ModelsManagementEditor.ID,
    localize(10892, null)
  ),
  [
    new SyncDescriptor(ModelsManagementEditorInput)
  ]
);

var ModelsManagementEditorInputSerializer = class {
  canSerialize(editorInput) {
    return true;
  }
  serialize(input) {
    return "";
  }
  deserialize(instantiationService) {
    return instantiationService.createInstance(ModelsManagementEditorInput);
  }
};

Registry.as(EditorExtensions.EditorFactory).registerEditorSerializer(ModelsManagementEditorInput.ID, ModelsManagementEditorInputSerializer);

async function ensureChatExtensionEnabled(accessor) {
  const chatExtensionId = accessor.get(IProductService).defaultChatAgent?.chatExtensionId;
  if (!chatExtensionId) {
    return;
  }
  const extensionsWorkbenchService = accessor.get(IExtensionsWorkbenchService);
  const extensionEnablementService = accessor.get(IWorkbenchExtensionEnablementService);
  const progressService = accessor.get(IProgressService);
  const localExtensions = await extensionsWorkbenchService.queryLocal();
  const chatExtension = localExtensions.find((e4) => ExtensionIdentifier.equals(e4.identifier.id, chatExtensionId));
  if (!chatExtension?.local || extensionEnablementService.isEnabled(chatExtension.local)) {
    return;
  }
  await progressService.withProgress(
    { location: 10 /* Window */, title: localize(10888, null) },
    async () => {
      await extensionsWorkbenchService.setEnablement([chatExtension], 12 /* EnabledGlobally */);
      await extensionsWorkbenchService.updateRunningExtensions(localize(10889, null));
    }
  );
}

var ChatManagementActionsContribution = class extends Disposable {
  constructor(languageModelsConfigurationService) {
    super();
    this.languageModelsConfigurationService = languageModelsConfigurationService;
    this.registerChatManagementActions();
    this.registerLanguageModelsEditorTitleActions();
  }
  static {
    this.ID = "workbench.contrib.chatManagementActions";
  }
  registerChatManagementActions() {
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: MANAGE_CHAT_COMMAND_ID,
          title: localize2(10893, "Manage Language Models"),
          category: CHAT_CATEGORY,
          precondition: LANGUAGE_MODELS_ENTITLEMENT_PRECONDITION,
          f1: true
        });
      }
      async run(accessor, searchQuery) {
        const editorService = accessor.get(IEditorService);
        await ensureChatExtensionEnabled(accessor);
        const pane = await editorService.openEditor(new ModelsManagementEditorInput(), { pinned: true });
        if (searchQuery && pane instanceof ModelsManagementEditor) {
          pane.search(searchQuery);
        }
        return pane;
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: "chat.models.action.clearSearchResults",
          precondition: CONTEXT_MODELS_EDITOR,
          keybinding: {
            primary: 9 /* Escape */,
            weight: 100 /* EditorContrib */,
            when: CONTEXT_MODELS_SEARCH_FOCUS
          },
          title: localize2(10891, "Clear Models Search Results")
        });
      }
      run(accessor) {
        const activeEditorPane = accessor.get(IEditorService).activeEditorPane;
        if (activeEditorPane instanceof ModelsManagementEditor) {
          activeEditorPane.clearSearch();
        }
        return null;
      }
    }));
    const openLanguageModelsJsonWhen = ContextKeyExpr.and(
      CONTEXT_MODELS_EDITOR,
      LANGUAGE_MODELS_ENTITLEMENT_PRECONDITION
    );
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: "workbench.action.openLanguageModelsJson",
          title: localize2(10894, "Open Language Models (JSON)"),
          category: CHAT_CATEGORY,
          precondition: LANGUAGE_MODELS_ENTITLEMENT_PRECONDITION,
          icon: languageModelsOpenSettingsIcon,
          f1: true,
          menu: [{
            id: MenuId.EditorTitle,
            when: openLanguageModelsJsonWhen,
            group: "navigation",
            order: 1
          }, {
            id: MenuId.ModalEditorEditorTitle,
            when: openLanguageModelsJsonWhen,
            group: "navigation",
            order: 1
          }]
        });
      }
      async run(accessor) {
        const languageModelsConfigurationService = accessor.get(ILanguageModelsConfigurationService);
        await languageModelsConfigurationService.configureLanguageModels();
      }
    }));
  }
  registerLanguageModelsEditorTitleActions() {
    const modelsConfigurationFile = this.languageModelsConfigurationService.configurationFile;
    const openModelsManagementEditorWhen = ContextKeyExpr.and(
      CONTEXT_MODELS_EDITOR.toNegated(),
      ResourceContextKey.Resource.isEqualTo(modelsConfigurationFile.toString()),
      ContextKeyExpr.not("isInDiffEditor"),
      LANGUAGE_MODELS_ENTITLEMENT_PRECONDITION
    );
    MenuRegistry.appendMenuItem(MenuId.EditorTitle, {
      command: {
        id: MANAGE_CHAT_COMMAND_ID,
        title: localize2(10893, "Manage Language Models"),
        icon: languageModelsOpenSettingsIcon
      },
      when: openModelsManagementEditorWhen,
      group: "navigation",
      order: 1
    });
  }
};

ChatManagementActionsContribution = __decorateClass([
  __decorateParam(0, ILanguageModelsConfigurationService)
], ChatManagementActionsContribution);

registerWorkbenchContribution2(ChatManagementActionsContribution.ID, ChatManagementActionsContribution, WorkbenchPhase.AfterRestored);
export { ensureChatExtensionEnabled, languageModelsOpenSettingsIcon, LANGUAGE_MODELS_ENTITLEMENT_PRECONDITION, ModelsManagementEditorInputSerializer, ChatManagementActionsContribution };
