// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/aiCustomizationTreeView/browser/aiCustomizationTreeView.contribution.ts
import { URI } from "./module-0032.mjs";
import { Action2, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { IEditorService } from "./module-0935.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IFileService } from "./module-0269.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IClipboardService } from "./module-0487.mjs";
import { AICustomizationItemMenuId, AI_CUSTOMIZATION_CATEGORY, AI_CUSTOMIZATION_VIEW_ID, FOCUS_AI_CUSTOMIZATION_VIEW_ID } from "./module-3516.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { AICustomizationItemDisabledContextKey, AICustomizationItemStorageContextKey, AICustomizationItemTypeContextKey } from "./module-3517.mjs";
import { IPromptsService } from "./module-0987.mjs";
import { IViewsService } from "./module-1246.mjs";
import { IsSessionsWindowContext } from "./module-0950.mjs";
import { TerminalContextKeys } from "./module-1176.mjs";
import { SessionsViewId } from "./module-3529.mjs";


// src/vs/sessions/contrib/aiCustomizationTreeView/browser/aiCustomizationTreeView.contribution.ts
function extractURI2(context2) {
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

var OPEN_AI_CUSTOMIZATION_FILE_ID = "aiCustomization.openFile";

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: OPEN_AI_CUSTOMIZATION_FILE_ID,
      title: localize2(4096, "Open"),
      icon: Codicon.goToFile
    });
  }
  async run(accessor, context2) {
    const editorService = accessor.get(IEditorService);
    await editorService.openEditor({
      resource: extractURI2(context2)
    });
  }
});

var RUN_PROMPT_FROM_VIEW_ID = "aiCustomization.runPrompt";

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: RUN_PROMPT_FROM_VIEW_ID,
      title: localize2(4098, "Run Prompt"),
      icon: Codicon.play
    });
  }
  async run(accessor, context2) {
    const commandService = accessor.get(ICommandService);
    await commandService.executeCommand("workbench.action.chat.run.prompt.current", extractURI2(context2));
  }
});

var DELETE_AI_CUSTOMIZATION_FILE_ID = "aiCustomization.deleteFile";

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: DELETE_AI_CUSTOMIZATION_FILE_ID,
      title: localize2(4089, "Delete"),
      icon: Codicon.trash
    });
  }
  async run(accessor, context2) {
    const fileService = accessor.get(IFileService);
    const dialogService = accessor.get(IDialogService);
    const uri4 = extractURI2(context2);
    const name = typeof context2 === "object" && !URI.isUri(context2) ? context2.name ?? "" : "";
    if (uri4.scheme !== "file") {
      return;
    }
    const confirmation = await dialogService.confirm({
      message: localize(4086, null, name || uri4.path),
      primaryButton: localize(4090, null)
    });
    if (confirmation.confirmed) {
      const useTrash = fileService.hasCapability(uri4, 4096 /* Trash */);
      await fileService.del(uri4, { useTrash, recursive: true });
    }
  }
});

var COPY_AI_CUSTOMIZATION_PATH_ID2 = "aiCustomization.copyPath";

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: COPY_AI_CUSTOMIZATION_PATH_ID2,
      title: localize2(4087, "Copy Path"),
      icon: Codicon.clippy
    });
  }
  async run(accessor, context2) {
    const clipboardService = accessor.get(IClipboardService);
    const uri4 = extractURI2(context2);
    const textToCopy = uri4.scheme === "file" ? uri4.fsPath : uri4.toString(true);
    await clipboardService.writeText(textToCopy);
  }
});

MenuRegistry.appendMenuItem(AICustomizationItemMenuId, {
  command: { id: DELETE_AI_CUSTOMIZATION_FILE_ID, title: localize(4090, null), icon: Codicon.trash },
  group: "inline",
  order: 10
});

MenuRegistry.appendMenuItem(AICustomizationItemMenuId, {
  command: { id: OPEN_AI_CUSTOMIZATION_FILE_ID, title: localize(4097, null) },
  group: "1_open",
  order: 1
});

MenuRegistry.appendMenuItem(AICustomizationItemMenuId, {
  command: { id: RUN_PROMPT_FROM_VIEW_ID, title: localize(4099, null), icon: Codicon.play },
  group: "2_run",
  order: 1,
  when: ContextKeyExpr.equals(AICustomizationItemTypeContextKey.key, "prompt" /* prompt */)
});

MenuRegistry.appendMenuItem(AICustomizationItemMenuId, {
  command: { id: COPY_AI_CUSTOMIZATION_PATH_ID2, title: localize(4088, null) },
  group: "3_modify",
  order: 1
});

MenuRegistry.appendMenuItem(AICustomizationItemMenuId, {
  command: { id: DELETE_AI_CUSTOMIZATION_FILE_ID, title: localize(4090, null) },
  group: "3_modify",
  order: 10
});

var DISABLE_AI_CUSTOMIZATION_ITEM_ID = "aiCustomization.disableItem";

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: DISABLE_AI_CUSTOMIZATION_ITEM_ID,
      title: localize2(4091, "Disable"),
      icon: Codicon.eyeClosed
    });
  }
  async run(accessor, context2) {
    if (typeof context2 !== "object" || URI.isUri(context2)) {
      return;
    }
    const promptsService = accessor.get(IPromptsService);
    const viewsService = accessor.get(IViewsService);
    const uri4 = extractURI2(context2);
    const promptType = context2.promptType;
    if (!promptType) {
      return;
    }
    const disabled = promptsService.getDisabledPromptFiles(promptType);
    disabled.add(uri4);
    promptsService.setDisabledPromptFiles(promptType, disabled);
    const view = viewsService.getActiveViewWithId(AI_CUSTOMIZATION_VIEW_ID);
    view?.refresh();
  }
});

var ENABLE_AI_CUSTOMIZATION_ITEM_ID = "aiCustomization.enableItem";

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: ENABLE_AI_CUSTOMIZATION_ITEM_ID,
      title: localize2(4093, "Enable"),
      icon: Codicon.eye
    });
  }
  async run(accessor, context2) {
    if (typeof context2 !== "object" || URI.isUri(context2)) {
      return;
    }
    const promptsService = accessor.get(IPromptsService);
    const viewsService = accessor.get(IViewsService);
    const uri4 = extractURI2(context2);
    const promptType = context2.promptType;
    if (!promptType) {
      return;
    }
    const disabled = promptsService.getDisabledPromptFiles(promptType);
    disabled.delete(uri4);
    promptsService.setDisabledPromptFiles(promptType, disabled);
    const view = viewsService.getActiveViewWithId(AI_CUSTOMIZATION_VIEW_ID);
    view?.refresh();
  }
});

MenuRegistry.appendMenuItem(AICustomizationItemMenuId, {
  command: { id: DISABLE_AI_CUSTOMIZATION_ITEM_ID, title: localize(4092, null) },
  group: "4_toggle",
  order: 1,
  when: ContextKeyExpr.and(
    ContextKeyExpr.equals(AICustomizationItemDisabledContextKey.key, false),
    ContextKeyExpr.equals(AICustomizationItemStorageContextKey.key, "builtin" /* builtIn */),
    ContextKeyExpr.equals(AICustomizationItemTypeContextKey.key, "skill" /* skill */)
  )
});

MenuRegistry.appendMenuItem(AICustomizationItemMenuId, {
  command: { id: ENABLE_AI_CUSTOMIZATION_ITEM_ID, title: localize(4094, null) },
  group: "4_toggle",
  order: 1,
  when: ContextKeyExpr.and(
    ContextKeyExpr.equals(AICustomizationItemDisabledContextKey.key, true),
    ContextKeyExpr.equals(AICustomizationItemStorageContextKey.key, "builtin" /* builtIn */),
    ContextKeyExpr.equals(AICustomizationItemTypeContextKey.key, "skill" /* skill */)
  )
});

MenuRegistry.appendMenuItem(AICustomizationItemMenuId, {
  command: { id: DISABLE_AI_CUSTOMIZATION_ITEM_ID, title: localize(4092, null), icon: Codicon.eyeClosed },
  group: "inline",
  order: 5,
  when: ContextKeyExpr.and(
    ContextKeyExpr.equals(AICustomizationItemDisabledContextKey.key, false),
    ContextKeyExpr.equals(AICustomizationItemStorageContextKey.key, "builtin" /* builtIn */),
    ContextKeyExpr.equals(AICustomizationItemTypeContextKey.key, "skill" /* skill */)
  )
});

MenuRegistry.appendMenuItem(AICustomizationItemMenuId, {
  command: { id: ENABLE_AI_CUSTOMIZATION_ITEM_ID, title: localize(4094, null), icon: Codicon.eye },
  group: "inline",
  order: 5,
  when: ContextKeyExpr.and(
    ContextKeyExpr.equals(AICustomizationItemDisabledContextKey.key, true),
    ContextKeyExpr.equals(AICustomizationItemStorageContextKey.key, "builtin" /* builtIn */),
    ContextKeyExpr.equals(AICustomizationItemTypeContextKey.key, "skill" /* skill */)
  )
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: FOCUS_AI_CUSTOMIZATION_VIEW_ID,
      title: localize2(4095, "Focus Chat Customizations"),
      category: AI_CUSTOMIZATION_CATEGORY,
      precondition: IsSessionsWindowContext,
      f1: true,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 33 /* KeyC */,
        when: ContextKeyExpr.and(IsSessionsWindowContext, TerminalContextKeys.focus.negate())
      }
    });
  }
  async run(accessor) {
    const viewsService = accessor.get(IViewsService);
    const sessionsView = await viewsService.openView(SessionsViewId, false);
    sessionsView?.focusCustomizations();
  }
});
export { extractURI2, OPEN_AI_CUSTOMIZATION_FILE_ID, RUN_PROMPT_FROM_VIEW_ID, DELETE_AI_CUSTOMIZATION_FILE_ID, COPY_AI_CUSTOMIZATION_PATH_ID2, DISABLE_AI_CUSTOMIZATION_ITEM_ID, ENABLE_AI_CUSTOMIZATION_ITEM_ID };
