// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/aiCustomization/aiCustomizationManagement.contribution.ts
import { Registry } from "./module-0090.mjs";
import { EditorExtensions } from "./module-0926.mjs";
import { EditorPaneDescriptor } from "./module-1085.mjs";
import { AICustomizationManagementEditor } from "./module-2653.mjs";
import { AICustomizationManagementCommands2, AICustomizationManagementItemMenuId, AI_CUSTOMIZATION_ITEM_DISABLED_KEY, AI_CUSTOMIZATION_ITEM_PLUGIN_URI_KEY, AI_CUSTOMIZATION_ITEM_STORAGE_KEY, AI_CUSTOMIZATION_ITEM_TYPE_KEY, AI_CUSTOMIZATION_ITEM_URI_KEY, AI_CUSTOMIZATION_MANAGEMENT_EDITOR_ID, AI_CUSTOMIZATION_MANAGEMENT_EDITOR_INPUT_ID } from "./module-1471.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { SyncDescriptor } from "./module-0134.mjs";
import { AICustomizationManagementEditorInput } from "./module-2622.mjs";
import { URI } from "./module-0032.mjs";
import { Action2, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { Codicon } from "./module-0085.mjs";
import { IEditorService } from "./module-0935.mjs";
import { getCodeEditor } from "./module-0223.mjs";
import { AICustomizationManagementSection, AICustomizationSources, IAICustomizationWorkspaceService } from "./module-0996.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { ICommandService } from "./module-0087.mjs";
import { isMacintosh, isWindows } from "./module-0014.mjs";
import { IFileService } from "./module-0269.mjs";
import { IDialogService } from "./module-0267.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { basename2, dirname2, isEqualOrParent2 } from "./module-0034.mjs";
import { IAgentPluginService } from "./module-1017.mjs";
import { applyEdits, removeProperty } from "./module-1377.mjs";
import { VSBuffer } from "./module-0038.mjs";
import { IClipboardService } from "./module-0487.mjs";
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { SYNCED_CUSTOMIZATION_SCHEME } from "./module-1756.mjs";
import { Schemas } from "./module-0033.mjs";
import { IPromptsService } from "./module-0987.mjs";
import { Disposable } from "./module-0012.mjs";
import { ExtensionIdentifier } from "./module-0688.mjs";
import { CHAT_CATEGORY } from "./module-1475.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { IChatWidgetService } from "./module-0982.mjs";
import { ICustomizationHarnessService } from "./module-1032.mjs";
import { IEditorGroupsService } from "./module-0934.mjs";
import { Categories } from "./module-0847.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IWorkbenchExtensionManagementService } from "./module-1047.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";


// src/vs/workbench/contrib/chat/browser/aiCustomization/aiCustomizationManagement.contribution.ts
Registry.as(EditorExtensions.EditorPane).registerEditorPane(
  EditorPaneDescriptor.create(
    AICustomizationManagementEditor,
    AI_CUSTOMIZATION_MANAGEMENT_EDITOR_ID,
    localize(9386, null)
  ),
  [
    // Note: Using the class directly since we use a singleton pattern
    new SyncDescriptor(AICustomizationManagementEditorInput)
  ]
);
var AICustomizationManagementEditorInputSerializer = class {
  canSerialize(editorInput) {
    return editorInput instanceof AICustomizationManagementEditorInput;
  }
  serialize(input) {
    return "";
  }
  deserialize(instantiationService) {
    return AICustomizationManagementEditorInput.getOrCreate();
  }
};
Registry.as(EditorExtensions.EditorFactory).registerEditorSerializer(
  AI_CUSTOMIZATION_MANAGEMENT_EDITOR_INPUT_ID,
  AICustomizationManagementEditorInputSerializer
);
function extractURI(context2) {
  if (URI.isUri(context2)) {
    return context2;
  }
  if (typeof context2 === "string") {
    return URI.parse(context2);
  }
  if (URI.isUri(context2.uri)) {
    return context2.uri;
  }
  return URI.parse(context2.uri);
}
function extractSource(context2) {
  if (URI.isUri(context2) || typeof context2 === "string") {
    return void 0;
  }
  return context2.storage;
}
function extractPromptType(context2) {
  if (URI.isUri(context2) || typeof context2 === "string") {
    return void 0;
  }
  return context2.promptType;
}
function extractPluginUri(context2) {
  if (URI.isUri(context2) || typeof context2 === "string") {
    return void 0;
  }
  const raw = context2.pluginUri;
  if (!raw) {
    return void 0;
  }
  return URI.isUri(raw) ? raw : typeof raw === "string" ? URI.parse(raw) : void 0;
}
function extractItemId(context2) {
  if (URI.isUri(context2) || typeof context2 === "string") {
    return void 0;
  }
  return typeof context2.itemId === "string" ? context2.itemId : void 0;
}
function parseHookItemId(itemId) {
  const hashIndex = itemId.lastIndexOf("#");
  if (hashIndex < 0) {
    return void 0;
  }
  const fragment = itemId.substring(hashIndex + 1);
  const match2 = /^([^[]+)\[(\d+)\]$/.exec(fragment);
  if (!match2) {
    return void 0;
  }
  return { originalId: match2[1], index: parseInt(match2[2], 10) };
}
var OPEN_AI_CUSTOMIZATION_MGMT_FILE_ID = "aiCustomizationManagement.openFile";
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: OPEN_AI_CUSTOMIZATION_MGMT_FILE_ID,
      title: localize2(9411, "Open"),
      icon: Codicon.goToFile
    });
  }
  async run(accessor, context2) {
    const editorService = accessor.get(IEditorService);
    const source = extractSource(context2);
    const editorPane = await editorService.openEditor({
      resource: extractURI(context2)
    });
    const codeEditor = getCodeEditor(editorPane?.getControl());
    if (codeEditor && (source === AICustomizationSources.extension || source === AICustomizationSources.plugin)) {
      codeEditor.updateOptions({
        readOnly: true,
        readOnlyMessage: new MarkdownString(localize(9416, null))
      });
    }
  }
});
var RUN_PROMPT_MGMT_ID = "aiCustomizationManagement.runPrompt";
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: RUN_PROMPT_MGMT_ID,
      title: localize2(9419, "Run Prompt"),
      icon: Codicon.play
    });
  }
  async run(accessor, context2) {
    const commandService = accessor.get(ICommandService);
    await commandService.executeCommand("workbench.action.chat.run.prompt.current", extractURI(context2));
  }
});
var REVEAL_IN_OS_LABEL = isWindows ? localize2(9418, "Reveal in File Explorer") : isMacintosh ? localize2(9417, "Reveal in Finder") : localize2(9414, "Open Containing Folder");
var REVEAL_AI_CUSTOMIZATION_IN_OS_ID = "aiCustomizationManagement.revealInOS";
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: REVEAL_AI_CUSTOMIZATION_IN_OS_ID,
      title: REVEAL_IN_OS_LABEL,
      icon: Codicon.folderOpened
    });
  }
  async run(accessor, context2) {
    const commandService = accessor.get(ICommandService);
    const uri5 = extractURI(context2);
    await commandService.executeCommand("revealFileInOS", uri5);
  }
});
var DELETE_AI_CUSTOMIZATION_ID = "aiCustomizationManagement.delete";
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: DELETE_AI_CUSTOMIZATION_ID,
      title: localize2(9400, "Delete"),
      icon: Codicon.trash
    });
  }
  async run(accessor, context2) {
    const fileService = accessor.get(IFileService);
    const dialogService = accessor.get(IDialogService);
    const telemetryService = accessor.get(ITelemetryService);
    const workspaceService = accessor.get(IAICustomizationWorkspaceService);
    const editorService = accessor.get(IEditorService);
    const uri5 = extractURI(context2);
    const source = extractSource(context2);
    const promptType = extractPromptType(context2);
    const itemId = extractItemId(context2);
    const isSkill = promptType === "skill" /* skill */;
    const isHook = promptType === "hook" /* hook */;
    const fileName = isSkill ? basename2(dirname2(uri5)) : basename2(uri5);
    if (source === AICustomizationSources.plugin) {
      const agentPluginService = accessor.get(IAgentPluginService);
      const plugin = agentPluginService.plugins.get().find((p) => isEqualOrParent2(uri5, p.uri));
      if (plugin) {
        const result = await dialogService.confirm({
          message: localize(9390, null, plugin.label),
          detail: localize(9391, null),
          primaryButton: localize(9423, null),
          type: "question"
        });
        if (result.confirmed) {
          plugin.remove?.();
        }
      }
      return;
    }
    if (source === AICustomizationSources.extension || source === AICustomizationSources.builtin) {
      await dialogService.info(
        localize(9388, null),
        localize(9389, null)
      );
      return;
    }
    const hookInfo = isHook && itemId ? parseHookItemId(itemId) : void 0;
    const hookName = typeof context2 !== "string" && !URI.isUri(context2) ? context2.name : void 0;
    const message = isSkill ? localize(9395, null, fileName) : hookInfo && hookName ? localize(9394, null, hookName) : localize(9392, null, fileName);
    const confirmation = await dialogService.confirm({
      message,
      detail: localize(9393, null),
      primaryButton: localize(9401, null),
      type: "warning"
    });
    if (confirmation.confirmed) {
      try {
        telemetryService.publicLog2("chatCustomizationEditor.deleteItem", {
          promptType: promptType ?? "",
          storage: source ?? ""
        });
      } catch {
      }
      if (hookInfo) {
        try {
          const content2 = await fileService.readFile(uri5);
          const text2 = content2.value.toString();
          const edits = removeProperty(text2, ["hooks", hookInfo.originalId, hookInfo.index], { tabSize: 1, insertSpaces: false });
          if (edits.length > 0) {
            const updated = applyEdits(text2, edits);
            await fileService.writeFile(uri5, VSBuffer.fromString(updated));
            if (source === AICustomizationSources.local) {
              const projectRoot = workspaceService.getActiveProjectRoot();
              if (projectRoot) {
                await workspaceService.commitFiles(projectRoot, [uri5]);
              }
            }
          }
        } catch {
          await dialogService.error(
            localize(9402, null),
            localize(9403, null)
          );
        }
        return;
      }
      const deleteTarget = isSkill ? dirname2(uri5) : uri5;
      const useTrash = fileService.hasCapability(deleteTarget, 4096 /* Trash */);
      await fileService.del(deleteTarget, { useTrash, recursive: isSkill });
      if (source === AICustomizationSources.local) {
        const projectRoot = workspaceService.getActiveProjectRoot();
        if (projectRoot) {
          await workspaceService.deleteFiles(projectRoot, [deleteTarget]);
        }
      }
      const activeEditor = editorService.activeEditorPane;
      if (activeEditor instanceof AICustomizationManagementEditor) {
        activeEditor.refreshList();
      }
    }
  }
});
var COPY_AI_CUSTOMIZATION_PATH_ID = "aiCustomizationManagement.copyPath";
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: COPY_AI_CUSTOMIZATION_PATH_ID,
      title: localize2(9398, "Copy Path"),
      icon: Codicon.clippy
    });
  }
  async run(accessor, context2) {
    const clipboardService = accessor.get(IClipboardService);
    const uri5 = extractURI(context2);
    const textToCopy = uri5.scheme === "file" ? uri5.fsPath : uri5.toString(true);
    await clipboardService.writeText(textToCopy);
  }
});
var INSTALL_CHAT_CUSTOMIZATION_EXTENSION_ID = "aiCustomizationManagement.installChatCustomizationExtension";
var CHAT_CUSTOMIZATION_EXTENSION_ID = "ms-vscode.vscode-chat-customizations-evaluations";
var CHAT_CUSTOMIZATION_EXTENSION_NOT_INSTALLED_CONTEXT = new RawContextKey("chat.customizationExtensionNotInstalled", true);
var CHAT_CUSTOMIZATION_EXTENSION_NOT_INSTALLED = CHAT_CUSTOMIZATION_EXTENSION_NOT_INSTALLED_CONTEXT.isEqualTo(true);
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: INSTALL_CHAT_CUSTOMIZATION_EXTENSION_ID,
      title: localize2(9410, "Install Chat Customization Extension"),
      icon: Codicon.beaker
    });
  }
  async run(accessor, context2) {
    await accessor.get(ICommandService).executeCommand("workbench.extensions.installExtension", CHAT_CUSTOMIZATION_EXTENSION_ID, { enable: true });
  }
});
var WHEN_ITEM_IS_DELETABLE = ContextKeyExpr.and(
  ContextKeyExpr.notEquals(AI_CUSTOMIZATION_ITEM_STORAGE_KEY, AICustomizationSources.extension),
  ContextKeyExpr.notEquals(AI_CUSTOMIZATION_ITEM_STORAGE_KEY, AICustomizationSources.plugin),
  ContextKeyExpr.notEquals(AI_CUSTOMIZATION_ITEM_STORAGE_KEY, AICustomizationSources.builtin)
);
var WHEN_ITEM_IS_PLUGIN = ContextKeyExpr.and(
  ContextKeyExpr.equals(AI_CUSTOMIZATION_ITEM_STORAGE_KEY, AICustomizationSources.plugin),
  ContextKeyExpr.regex(AI_CUSTOMIZATION_ITEM_PLUGIN_URI_KEY, new RegExp(`^${SYNCED_CUSTOMIZATION_SCHEME}:`)).negate()
);
MenuRegistry.appendMenuItem(AICustomizationManagementItemMenuId, {
  command: { id: INSTALL_CHAT_CUSTOMIZATION_EXTENSION_ID, title: localize(9409, null), icon: Codicon.beaker },
  group: "inline",
  order: 1,
  when: ContextKeyExpr.and(
    CHAT_CUSTOMIZATION_EXTENSION_NOT_INSTALLED,
    ContextKeyExpr.or(
      ContextKeyExpr.equals(AI_CUSTOMIZATION_ITEM_TYPE_KEY, "prompt" /* prompt */),
      ContextKeyExpr.equals(AI_CUSTOMIZATION_ITEM_TYPE_KEY, "instructions" /* instructions */),
      ContextKeyExpr.equals(AI_CUSTOMIZATION_ITEM_TYPE_KEY, "agent" /* agent */),
      ContextKeyExpr.equals(AI_CUSTOMIZATION_ITEM_TYPE_KEY, "skill" /* skill */)
    )
  )
});
MenuRegistry.appendMenuItem(AICustomizationManagementItemMenuId, {
  command: { id: COPY_AI_CUSTOMIZATION_PATH_ID, title: localize(9399, null), icon: Codicon.clippy },
  group: "inline",
  order: 2
});
MenuRegistry.appendMenuItem(AICustomizationManagementItemMenuId, {
  command: { id: DELETE_AI_CUSTOMIZATION_ID, title: localize(9401, null), icon: Codicon.trash },
  group: "inline",
  order: 10,
  when: WHEN_ITEM_IS_DELETABLE
});
MenuRegistry.appendMenuItem(AICustomizationManagementItemMenuId, {
  command: { id: OPEN_AI_CUSTOMIZATION_MGMT_FILE_ID, title: localize(9412, null) },
  group: "1_open",
  order: 1
});
MenuRegistry.appendMenuItem(AICustomizationManagementItemMenuId, {
  command: { id: RUN_PROMPT_MGMT_ID, title: localize(9420, null), icon: Codicon.play },
  group: "2_run",
  order: 1,
  when: ContextKeyExpr.equals(AI_CUSTOMIZATION_ITEM_TYPE_KEY, "prompt" /* prompt */)
});
MenuRegistry.appendMenuItem(AICustomizationManagementItemMenuId, {
  command: { id: REVEAL_AI_CUSTOMIZATION_IN_OS_ID, title: REVEAL_IN_OS_LABEL.value },
  group: "3_file",
  order: 1,
  when: ContextKeyExpr.or(
    ContextKeyExpr.regex(AI_CUSTOMIZATION_ITEM_URI_KEY, new RegExp(`^${Schemas.file}:`)),
    ContextKeyExpr.regex(AI_CUSTOMIZATION_ITEM_URI_KEY, new RegExp(`^${Schemas.vscodeUserData}:`))
  )
});
MenuRegistry.appendMenuItem(AICustomizationManagementItemMenuId, {
  command: { id: DELETE_AI_CUSTOMIZATION_ID, title: localize(9401, null) },
  group: "4_modify",
  order: 1,
  when: WHEN_ITEM_IS_DELETABLE
});
var UNINSTALL_PLUGIN_AI_CUSTOMIZATION_ID = "aiCustomizationManagement.uninstallPlugin";
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: UNINSTALL_PLUGIN_AI_CUSTOMIZATION_ID,
      title: localize2(9424, "Uninstall Plugin"),
      icon: Codicon.trash
    });
  }
  async run(accessor, context2) {
    const agentPluginService = accessor.get(IAgentPluginService);
    const dialogService = accessor.get(IDialogService);
    const uri5 = extractURI(context2);
    const plugin = agentPluginService.plugins.get().find((p) => isEqualOrParent2(uri5, p.uri));
    if (!plugin) {
      return;
    }
    const result = await dialogService.confirm({
      message: localize(9396, null, plugin.label),
      detail: localize(9397, null),
      primaryButton: localize(9425, null),
      type: "question"
    });
    if (result.confirmed) {
      plugin.remove?.();
    }
  }
});
MenuRegistry.appendMenuItem(AICustomizationManagementItemMenuId, {
  command: { id: UNINSTALL_PLUGIN_AI_CUSTOMIZATION_ID, title: localize(9423, null), icon: Codicon.trash },
  group: "inline",
  order: 10,
  when: WHEN_ITEM_IS_PLUGIN
});
MenuRegistry.appendMenuItem(AICustomizationManagementItemMenuId, {
  command: { id: UNINSTALL_PLUGIN_AI_CUSTOMIZATION_ID, title: localize(9423, null) },
  group: "4_modify",
  order: 1,
  when: WHEN_ITEM_IS_PLUGIN
});
var SHOW_PLUGIN_AI_CUSTOMIZATION_ID = "aiCustomizationManagement.showPlugin";
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: SHOW_PLUGIN_AI_CUSTOMIZATION_ID,
      title: localize2(9421, "Show Plugin")
    });
  }
  async run(accessor, context2) {
    const agentPluginService = accessor.get(IAgentPluginService);
    const editorService = accessor.get(IEditorService);
    const pluginUri = extractPluginUri(context2);
    if (!pluginUri) {
      return;
    }
    const plugin = agentPluginService.plugins.get().find((p) => p.uri.toString() === pluginUri.toString());
    if (!plugin) {
      return;
    }
    const item = {
      kind: "installed" /* Installed */,
      name: plugin.label,
      description: plugin.fromMarketplace?.description ?? "",
      marketplace: plugin.fromMarketplace?.marketplace,
      plugin
    };
    const input = AICustomizationManagementEditorInput.getOrCreate();
    const pane = await editorService.openEditor(input, { pinned: true });
    if (pane instanceof AICustomizationManagementEditor) {
      await pane.showPluginDetail(item);
    }
  }
});
MenuRegistry.appendMenuItem(AICustomizationManagementItemMenuId, {
  command: { id: SHOW_PLUGIN_AI_CUSTOMIZATION_ID, title: localize(9422, null) },
  group: "1_open",
  order: 2,
  when: WHEN_ITEM_IS_PLUGIN
});
var DISABLE_AI_CUSTOMIZATION_MGMT_ITEM_ID = "aiCustomizationManagement.disableItem";
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: DISABLE_AI_CUSTOMIZATION_MGMT_ITEM_ID,
      title: localize2(9404, "Disable"),
      icon: Codicon.eyeClosed
    });
  }
  async run(accessor, context2) {
    const promptsService = accessor.get(IPromptsService);
    const uri5 = extractURI(context2);
    const promptType = extractPromptType(context2);
    if (!promptType) {
      return;
    }
    const disabled = promptsService.getDisabledPromptFiles(promptType);
    disabled.add(uri5);
    promptsService.setDisabledPromptFiles(promptType, disabled);
  }
});
var ENABLE_AI_CUSTOMIZATION_MGMT_ITEM_ID = "aiCustomizationManagement.enableItem";
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: ENABLE_AI_CUSTOMIZATION_MGMT_ITEM_ID,
      title: localize2(9406, "Enable"),
      icon: Codicon.eye
    });
  }
  async run(accessor, context2) {
    const promptsService = accessor.get(IPromptsService);
    const uri5 = extractURI(context2);
    const promptType = extractPromptType(context2);
    if (!promptType) {
      return;
    }
    const disabled = promptsService.getDisabledPromptFiles(promptType);
    disabled.delete(uri5);
    promptsService.setDisabledPromptFiles(promptType, disabled);
  }
});
MenuRegistry.appendMenuItem(AICustomizationManagementItemMenuId, {
  command: { id: DISABLE_AI_CUSTOMIZATION_MGMT_ITEM_ID, title: localize(9405, null) },
  group: "5_toggle",
  order: 1,
  when: ContextKeyExpr.and(
    ContextKeyExpr.equals(AI_CUSTOMIZATION_ITEM_DISABLED_KEY, false),
    ContextKeyExpr.equals(AI_CUSTOMIZATION_ITEM_STORAGE_KEY, AICustomizationSources.builtin),
    ContextKeyExpr.equals(AI_CUSTOMIZATION_ITEM_TYPE_KEY, "skill" /* skill */)
  )
});
MenuRegistry.appendMenuItem(AICustomizationManagementItemMenuId, {
  command: { id: ENABLE_AI_CUSTOMIZATION_MGMT_ITEM_ID, title: localize(9407, null) },
  group: "5_toggle",
  order: 1,
  when: ContextKeyExpr.and(
    ContextKeyExpr.equals(AI_CUSTOMIZATION_ITEM_DISABLED_KEY, true),
    ContextKeyExpr.equals(AI_CUSTOMIZATION_ITEM_STORAGE_KEY, AICustomizationSources.builtin),
    ContextKeyExpr.equals(AI_CUSTOMIZATION_ITEM_TYPE_KEY, "skill" /* skill */)
  )
});
MenuRegistry.appendMenuItem(AICustomizationManagementItemMenuId, {
  command: { id: DISABLE_AI_CUSTOMIZATION_MGMT_ITEM_ID, title: localize(9405, null), icon: Codicon.eyeClosed },
  group: "inline",
  order: 5,
  when: ContextKeyExpr.and(
    ContextKeyExpr.equals(AI_CUSTOMIZATION_ITEM_DISABLED_KEY, false),
    ContextKeyExpr.equals(AI_CUSTOMIZATION_ITEM_STORAGE_KEY, AICustomizationSources.builtin),
    ContextKeyExpr.equals(AI_CUSTOMIZATION_ITEM_TYPE_KEY, "skill" /* skill */)
  )
});
MenuRegistry.appendMenuItem(AICustomizationManagementItemMenuId, {
  command: { id: ENABLE_AI_CUSTOMIZATION_MGMT_ITEM_ID, title: localize(9407, null), icon: Codicon.eye },
  group: "inline",
  order: 5,
  when: ContextKeyExpr.and(
    ContextKeyExpr.equals(AI_CUSTOMIZATION_ITEM_DISABLED_KEY, true),
    ContextKeyExpr.equals(AI_CUSTOMIZATION_ITEM_STORAGE_KEY, AICustomizationSources.builtin),
    ContextKeyExpr.equals(AI_CUSTOMIZATION_ITEM_TYPE_KEY, "skill" /* skill */)
  )
});
var AICustomizationManagementActionsContribution = class extends Disposable {
  constructor(contextKeyService, extensionManagementService, configurationService) {
    super();
    this.extensionManagementService = extensionManagementService;
    this.configurationService = configurationService;
    const syncModalPresentation = () => AICustomizationManagementEditorInput.setModalPresentation(
      this.configurationService.getValue("opencode.bridge.settingsPageFloating") === true
    );
    syncModalPresentation();
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("opencode.bridge.settingsPageFloating")) {
        syncModalPresentation();
      }
    }));
    this.chatCustomizationExtensionNotInstalledContext = CHAT_CUSTOMIZATION_EXTENSION_NOT_INSTALLED_CONTEXT.bindTo(contextKeyService);
    const refreshExtensionContext = () => this.updateChatCustomizationExtensionContext();
    this._register(this.extensionManagementService.onProfileAwareDidInstallExtensions(refreshExtensionContext));
    this._register(this.extensionManagementService.onProfileAwareDidUninstallExtension(refreshExtensionContext));
    this._register(this.extensionManagementService.onDidChangeProfile(refreshExtensionContext));
    this.updateChatCustomizationExtensionContext();
    this.registerActions();
  }
  static {
    this.ID = "workbench.contrib.aiCustomizationManagementActions";
  }
  async updateChatCustomizationExtensionContext() {
    try {
      const installedExtensions = await this.extensionManagementService.getInstalled();
      const extensionKey = ExtensionIdentifier.toKey(CHAT_CUSTOMIZATION_EXTENSION_ID);
      const isInstalled = installedExtensions.some((ext) => ExtensionIdentifier.toKey(ext.identifier.id) === extensionKey);
      this.chatCustomizationExtensionNotInstalledContext.set(!isInstalled);
    } catch {
      this.chatCustomizationExtensionNotInstalledContext.set(true);
    }
  }
  registerActions() {
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: AICustomizationManagementCommands2.OpenEditor,
          title: localize2(9413, "Open Customizations"),
          shortTitle: localize2(9387, "Customizations"),
          category: CHAT_CATEGORY,
          precondition: ChatContextKeys.enabled,
          f1: true
        });
      }
      async run(accessor, section, automationId, options3) {
        const editorService = accessor.get(IEditorService);
        const chatWidgetService = accessor.get(IChatWidgetService);
        const harnessService = accessor.get(ICustomizationHarnessService);
        const editorGroupsService = options3?.toFront ? accessor.get(IEditorGroupsService) : void 0;
        const widget = chatWidgetService.lastFocusedWidget;
        const pendingSessionType = widget?.input.pendingDelegationTarget;
        const sessionResource = pendingSessionType ? harnessService.getSessionResourceForHarness(pendingSessionType) : widget?.viewModel?.sessionResource;
        if (sessionResource) {
          harnessService.setActiveSession(sessionResource);
        }
        const input = AICustomizationManagementEditorInput.getOrCreate();
        const pane = await editorService.openEditor(input, { pinned: true });
        if (editorGroupsService) {
          const group2 = editorGroupsService.activeGroup;
          if (group2.getIndexOfEditor(input) > 0) {
            group2.moveEditor(input, group2, { index: 0 });
          }
        }
        const targetSection = section ?? AICustomizationManagementSection.Bridge;
        if (pane instanceof AICustomizationManagementEditor) {
          pane.selectSectionById(targetSection);
          if (targetSection === AICustomizationManagementSection.Automations && automationId) {
            pane.focusAutomation(automationId);
          }
        }
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: AICustomizationManagementCommands2.OpenMarketplace,
          title: localize2(9415, "Open Marketplace"),
          category: CHAT_CATEGORY,
          precondition: ChatContextKeys.enabled
        });
      }
      async run(accessor, section) {
        const editorService = accessor.get(IEditorService);
        const input = AICustomizationManagementEditorInput.getOrCreate();
        const pane = await editorService.openEditor(input, { pinned: true });
        if (pane instanceof AICustomizationManagementEditor) {
          const targetSection = section ?? AICustomizationManagementSection.McpServers;
          pane.selectSectionById(targetSection, { showMarketplace: true });
        }
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: AICustomizationManagementCommands2.GenerateDebugReport,
          title: localize2(9408, "Generate Customization Debug Report"),
          category: Categories.Developer,
          precondition: ChatContextKeys.enabled,
          f1: true
        });
      }
      async run(accessor) {
        const editorService = accessor.get(IEditorService);
        const input = AICustomizationManagementEditorInput.getOrCreate();
        const pane = await editorService.openEditor(input, { pinned: true });
        if (!(pane instanceof AICustomizationManagementEditor)) {
          return;
        }
        const report = await pane.generateDebugReport();
        await editorService.openEditor({
          resource: void 0,
          contents: report,
          languageId: "plaintext"
        });
      }
    }));
  }
};
AICustomizationManagementActionsContribution = __decorateClass([
  __decorateParam(0, IContextKeyService),
  __decorateParam(1, IWorkbenchExtensionManagementService),
  __decorateParam(2, IConfigurationService)
], AICustomizationManagementActionsContribution);
registerWorkbenchContribution2(
  AICustomizationManagementActionsContribution.ID,
  AICustomizationManagementActionsContribution,
  WorkbenchPhase.AfterRestored
);
export { extractURI, extractSource, extractPromptType, extractPluginUri, extractItemId, parseHookItemId, AICustomizationManagementEditorInputSerializer, OPEN_AI_CUSTOMIZATION_MGMT_FILE_ID, RUN_PROMPT_MGMT_ID, REVEAL_IN_OS_LABEL, REVEAL_AI_CUSTOMIZATION_IN_OS_ID, DELETE_AI_CUSTOMIZATION_ID, COPY_AI_CUSTOMIZATION_PATH_ID, INSTALL_CHAT_CUSTOMIZATION_EXTENSION_ID, CHAT_CUSTOMIZATION_EXTENSION_ID, CHAT_CUSTOMIZATION_EXTENSION_NOT_INSTALLED_CONTEXT, CHAT_CUSTOMIZATION_EXTENSION_NOT_INSTALLED, WHEN_ITEM_IS_DELETABLE, WHEN_ITEM_IS_PLUGIN, UNINSTALL_PLUGIN_AI_CUSTOMIZATION_ID, SHOW_PLUGIN_AI_CUSTOMIZATION_ID, DISABLE_AI_CUSTOMIZATION_MGMT_ITEM_ID, ENABLE_AI_CUSTOMIZATION_MGMT_ITEM_ID, AICustomizationManagementActionsContribution };
