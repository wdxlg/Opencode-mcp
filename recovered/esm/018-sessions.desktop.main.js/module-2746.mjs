// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatPetAchievements.contribution.ts
import { Registry } from "./module-0090.mjs";
import { EditorExtensions } from "./module-0926.mjs";
import { EditorPaneDescriptor } from "./module-1085.mjs";
import { ChatPetAchievementsContextKeys, ChatPetAchievementsEditor } from "./module-2744.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { SyncDescriptor } from "./module-0134.mjs";
import { ChatPetAchievementsEditorInput } from "./module-2745.mjs";
import { Action2, registerAction2 } from "./module-0092.mjs";
import { CHAT_PET_OPEN_ACHIEVEMENTS_COMMAND_ID, ChatPetAchievementIds, chatPetAchievements, isUserAuthoredChatPetCustomization } from "./module-2111.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { ChatPetContextKeys, IChatPetService } from "./module-2112.mjs";
import { Categories } from "./module-0847.mjs";
import { status } from "./module-0076.mjs";
import { IEditorService } from "./module-0935.mjs";
import { Disposable } from "./module-0012.mjs";
import { autorun } from "./module-0052.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ICommandService } from "./module-0087.mjs";
import { AICustomizationManagementSection } from "./module-0996.mjs";
import { timeout } from "./module-0036.mjs";
import { IAICustomizationItemsModel } from "./module-2618.mjs";
import { ICustomizationHarnessService } from "./module-1032.mjs";
import { IMcpWorkbenchService } from "./module-1206.mjs";
import { ILogService } from "./module-0095.mjs";
import { getActiveElement, isHTMLElement } from "./module-0075.mjs";
import { AccessibleContentProvider } from "./module-0799.mjs";


// src/vs/workbench/contrib/chat/browser/chatPetAchievements.contribution.ts
Registry.as(EditorExtensions.EditorPane).registerEditorPane(
  EditorPaneDescriptor.create(
    ChatPetAchievementsEditor,
    ChatPetAchievementsEditor.ID,
    localize(11010, null)
  ),
  [new SyncDescriptor(ChatPetAchievementsEditorInput)]
);

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: CHAT_PET_OPEN_ACHIEVEMENTS_COMMAND_ID,
      title: localize2(11011, "Open Achievements"),
      precondition: ContextKeyExpr.and(ChatContextKeys.enabled, ChatPetContextKeys.enabled)
    });
    registerAction2(class extends Action2 {
      constructor() {
        super({
          id: "chat.pet.developer.unlockAllAchievements",
          title: localize2(11008, "Unlock All Pet Achievements"),
          category: Categories.Developer,
          precondition: ContextKeyExpr.and(ChatContextKeys.enabled, ChatPetContextKeys.enabled),
          f1: true
        });
      }
      run(accessor) {
        const chatPetService = accessor.get(IChatPetService);
        for (const achievement of chatPetAchievements) {
          chatPetService.unlockAchievement(achievement.id);
        }
        status(localize(11009, null));
      }
    });
    registerAction2(class extends Action2 {
      constructor() {
        super({
          id: "chat.pet.developer.resetAchievements",
          title: localize2(11006, "Reset Pet Achievements"),
          category: Categories.Developer,
          precondition: ChatContextKeys.enabled,
          f1: true
        });
      }
      run(accessor) {
        accessor.get(IChatPetService).resetAchievements();
        status(localize(11007, null));
      }
    });
  }
  async run(accessor) {
    if (!accessor.get(IChatPetService).enabled.get()) {
      return;
    }
    await accessor.get(IEditorService).openEditor(ChatPetAchievementsEditorInput.getOrCreate(), { pinned: true });
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "chat.pet.developer.resetSize",
      title: localize2(11012, "Reset Pet Size"),
      category: Categories.Developer,
      precondition: ChatContextKeys.enabled,
      f1: true
    });
  }
  run(accessor) {
    const chatPetService = accessor.get(IChatPetService);
    chatPetService.resetScale();
    status(localize(11013, null, Math.round(chatPetService.scale.get() * 100)));
  }
});

var ChatPetContextContribution = class extends Disposable {
  static {
    this.ID = "workbench.contrib.chatPetContext";
  }
  constructor(chatPetService, contextKeyService) {
    super();
    const enabledContextKey = ChatPetContextKeys.enabled.bindTo(contextKeyService);
    this._register(autorun((reader) => {
      enabledContextKey.set(chatPetService.enabled.read(reader));
    }));
  }
};

ChatPetContextContribution = __decorateClass([
  __decorateParam(0, IChatPetService),
  __decorateParam(1, IContextKeyService)
], ChatPetContextContribution);

var CHAT_PET_KEEP_EDIT_COMMAND_IDS = /* @__PURE__ */ new Set([
  "chatEditing.acceptFile",
  "chatEditing.acceptAllFiles",
  "chatEditor.action.accept",
  "chatEditor.action.acceptHunk",
  "chatEditor.action.acceptAllEdits",
  "chatEditing.multidiff.acceptAllFiles"
]);

var CHAT_PET_REVIEW_EDIT_COMMAND_IDS = /* @__PURE__ */ new Set([
  "chatEditor.action.reviewChanges",
  "chatEditing.openFileInDiff",
  "chatEditing.viewChanges",
  "chatEditing.viewAllSessionChanges",
  "workbench.changesView.action.viewChanges"
]);

var CHAT_PET_COPY_OUTPUT_COMMAND_IDS = /* @__PURE__ */ new Set([
  "workbench.action.chat.copyAll",
  "workbench.action.chat.copyItem",
  "workbench.action.chat.copyFinalResponse",
  "workbench.action.chat.copyCodeBlock"
]);

var ChatPetEditingAchievementContribution = class extends Disposable {
  static {
    this.ID = "workbench.contrib.chatPetEditingAchievement";
  }
  constructor(commandService, chatPetService) {
    super();
    this._register(commandService.onDidExecuteCommand((event) => {
      if (CHAT_PET_KEEP_EDIT_COMMAND_IDS.has(event.commandId)) {
        chatPetService.unlockAchievement(ChatPetAchievementIds.AgentEditKept);
      }
      if (CHAT_PET_REVIEW_EDIT_COMMAND_IDS.has(event.commandId)) {
        chatPetService.unlockAchievement(ChatPetAchievementIds.AgentChangesReviewed);
      }
      if (CHAT_PET_COPY_OUTPUT_COMMAND_IDS.has(event.commandId)) {
        chatPetService.unlockAchievement(ChatPetAchievementIds.UsefulOutputCopied);
      }
    }));
  }
};

ChatPetEditingAchievementContribution = __decorateClass([
  __decorateParam(0, ICommandService),
  __decorateParam(1, IChatPetService)
], ChatPetEditingAchievementContribution);

var ChatPetCustomizationAchievementContribution = class extends Disposable {
  constructor(chatPetService, customizationItemsModel, customizationHarnessService, mcpWorkbenchService, logService) {
    super();
    this.chatPetService = chatPetService;
    this.customizationItemsModel = customizationItemsModel;
    this.customizationHarnessService = customizationHarnessService;
    this.mcpWorkbenchService = mcpWorkbenchService;
    this.logService = logService;
    this.customizationBaselineVersion = 0;
    this.customizationBaselineReady = false;
    this.observedSkillIds = /* @__PURE__ */ new Set();
    this.observedInstructionIds = /* @__PURE__ */ new Set();
    this.observationInitializationStarted = false;
    this._register(autorun((reader) => {
      if (!this.chatPetService.enabled.read(reader) || this.observationInitializationStarted) {
        return;
      }
      this.observationInitializationStarted = true;
      void this.initializeCustomizationObservation();
      void this.initializeMcpObservation();
    }));
  }
  static {
    this.ID = "workbench.contrib.chatPetCustomizationAchievements";
  }
  async initializeCustomizationObservation() {
    const skills = this.customizationItemsModel.getItems(AICustomizationManagementSection.Skills);
    const instructions = this.customizationItemsModel.getItems(AICustomizationManagementSection.Instructions);
    let waitForLatestFetch = false;
    while (!this._store.isDisposed) {
      const source = this.customizationItemsModel.getActiveItemSource();
      if (await this.establishCustomizationBaseline(skills, instructions, source, waitForLatestFetch)) {
        break;
      }
      waitForLatestFetch = true;
    }
    if (this._store.isDisposed) {
      return;
    }
    this._register(autorun((reader) => {
      this.customizationHarnessService.activeSessionResource.read(reader);
      this.customizationHarnessService.availableHarnesses.read(reader);
      const source = this.customizationItemsModel.getActiveItemSource();
      const currentSkillIds = getUserCustomizationIds(skills.read(reader));
      const currentInstructionIds = getUserCustomizationIds(instructions.read(reader));
      const enabled = this.chatPetService.enabled.read(reader);
      const unlocked = new Set(this.chatPetService.unlockedAchievements.read(reader));
      if (source !== this.observedCustomizationSource) {
        this.observedCustomizationSource = source;
        this.customizationBaselineReady = false;
        void this.establishCustomizationBaseline(skills, instructions, source, true);
        return;
      }
      if (!this.customizationBaselineReady) {
        return;
      }
      const skillAdded = hasAddedId(currentSkillIds, this.observedSkillIds);
      const instructionAdded = hasAddedId(currentInstructionIds, this.observedInstructionIds);
      this.observedSkillIds = currentSkillIds;
      this.observedInstructionIds = currentInstructionIds;
      if (enabled && skillAdded && !unlocked.has(ChatPetAchievementIds.CustomSkillPresent)) {
        this.chatPetService.unlockAchievement(ChatPetAchievementIds.CustomSkillPresent);
      }
      if (enabled && instructionAdded && !unlocked.has(ChatPetAchievementIds.InstructionPresent)) {
        this.chatPetService.unlockAchievement(ChatPetAchievementIds.InstructionPresent);
      }
    }));
  }
  async establishCustomizationBaseline(skills, instructions, expectedSource, waitForLatestFetch) {
    const version2 = ++this.customizationBaselineVersion;
    this.customizationBaselineReady = false;
    if (waitForLatestFetch) {
      await timeout(0);
    }
    await Promise.all([
      this.customizationItemsModel.whenSectionLoaded(AICustomizationManagementSection.Skills),
      this.customizationItemsModel.whenSectionLoaded(AICustomizationManagementSection.Instructions)
    ]);
    if (this._store.isDisposed || version2 !== this.customizationBaselineVersion || expectedSource !== this.customizationItemsModel.getActiveItemSource()) {
      return false;
    }
    this.observedCustomizationSource = expectedSource;
    this.observedSkillIds = getUserCustomizationIds(skills.get());
    this.observedInstructionIds = getUserCustomizationIds(instructions.get());
    this.customizationBaselineReady = true;
    return true;
  }
  async initializeMcpObservation() {
    try {
      await this.mcpWorkbenchService.queryLocal();
    } catch (error) {
      this.logService.error("[ChatPetCustomizationAchievementContribution] Failed to establish the MCP server baseline", error);
      return;
    }
    if (this._store.isDisposed) {
      return;
    }
    let observedServerIds = getMcpServerIds(this.mcpWorkbenchService);
    this._register(this.mcpWorkbenchService.onChange(() => {
      const currentServerIds = getMcpServerIds(this.mcpWorkbenchService);
      const serverAdded = hasAddedId(currentServerIds, observedServerIds);
      observedServerIds = currentServerIds;
      if (this.chatPetService.enabled.get() && serverAdded && !this.chatPetService.unlockedAchievements.get().includes(ChatPetAchievementIds.McpServerPresent)) {
        this.chatPetService.unlockAchievement(ChatPetAchievementIds.McpServerPresent);
      }
    }));
  }
};

ChatPetCustomizationAchievementContribution = __decorateClass([
  __decorateParam(0, IChatPetService),
  __decorateParam(1, IAICustomizationItemsModel),
  __decorateParam(2, ICustomizationHarnessService),
  __decorateParam(3, IMcpWorkbenchService),
  __decorateParam(4, ILogService)
], ChatPetCustomizationAchievementContribution);

function getUserCustomizationIds(items) {
  return new Set(items.filter((item) => isUserAuthoredChatPetCustomization(item.source, item.isBuiltin)).map((item) => item.id));
}

function getMcpServerIds(mcpWorkbenchService) {
  return new Set(mcpWorkbenchService.local.map((server) => server.id));
}

function hasAddedId(currentIds, previousIds) {
  for (const id2 of currentIds) {
    if (!previousIds.has(id2)) {
      return true;
    }
  }
  return false;
}

var ChatPetAchievementsAccessibilityHelp = class {
  constructor() {
    this.priority = 110;
    this.name = "chatPetAchievements";
    this.type = "help" /* Help */;
    this.when = ChatPetAchievementsContextKeys.focused;
  }
  getProvider(_accessor) {
    const previouslyFocusedElement = getActiveElement();
    const editorService = _accessor.get(IEditorService);
    const content = [
      localize(11004, null),
      localize(11002, null),
      localize(11005, null),
      localize(11003, null)
    ].join("\n\n");
    return new AccessibleContentProvider(
      "chatPetAchievements" /* ChatPetAchievements */,
      { type: "help" /* Help */ },
      () => content,
      () => {
        if (isHTMLElement(previouslyFocusedElement) && previouslyFocusedElement.isConnected && previouslyFocusedElement.getClientRects().length > 0) {
          previouslyFocusedElement.focus();
        } else {
          editorService.activeEditorPane?.focus();
        }
      },
      "accessibility.verbosity.chatPetAchievements" /* ChatPetAchievements */
    );
  }
};
export { getUserCustomizationIds, getMcpServerIds, hasAddedId, ChatPetContextContribution, CHAT_PET_KEEP_EDIT_COMMAND_IDS, CHAT_PET_REVIEW_EDIT_COMMAND_IDS, CHAT_PET_COPY_OUTPUT_COMMAND_IDS, ChatPetEditingAchievementContribution, ChatPetCustomizationAchievementContribution, ChatPetAchievementsAccessibilityHelp };
