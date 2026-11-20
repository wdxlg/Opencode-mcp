// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/actions/chatBranchActions.ts
import { IChatWidgetService } from "./module-0981.mjs";
import { isRequestVM, isResponseVM } from "./module-0978.mjs";
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { localize2 } from "./module-0001.mjs";
import { CHAT_CATEGORY } from "./module-1476.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { ChatContextKeys } from "./module-0965.mjs";
import { IChatBranchService } from "./module-2015.mjs";
import { Codicon } from "./module-0085.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IChatService } from "./module-0972.mjs";
import { INotificationService } from "./module-0336.mjs";
import { ILanguageModelsService } from "./module-0967.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IModelService } from "./module-0080.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { IEditorService } from "./module-0934.mjs";
import { URI } from "./module-0032.mjs";


// src/vs/workbench/contrib/chat/browser/actions/chatBranchActions.ts
function getBranchRowContext(accessor, args2) {
  const element = args2[0];
  const widgetService = accessor.get(IChatWidgetService);
  const widget = widgetService.lastFocusedWidget;
  if (!widget?.viewModel) {
    return void 0;
  }
  const item = element && (isRequestVM(element) || isResponseVM(element)) ? element : widget.getFocus();
  if (!item) {
    return void 0;
  }
  return { widget, rowId: item.id };
}

var ChatBranchNavigateAction = class extends Action2 {
  constructor(direction) {
    const isNext = direction === "next";
    super({
      id: isNext ? "workbench.action.chat.opencode.branchNext" : "workbench.action.chat.opencode.branchPrev",
      title: isNext ? localize2(8582, "\u25B6") : localize2(8583, "\u25C0"),
      f1: false,
      category: CHAT_CATEGORY,
      menu: {
        id: MenuId.ChatMessageFooter,
        group: "navigation",
        order: direction === "next" ? 0.55 : 0.5,
        when: ContextKeyExpr.and(
          ChatContextKeys.isResponse,
          isNext ? ChatContextKeys.openCodeBranchHasNext : ChatContextKeys.openCodeBranchHasPrev
        )
      }
    });
    this.direction = direction;
  }
  run(accessor, ...args2) {
    const context2 = getBranchRowContext(accessor, args2);
    if (!context2) {
      return;
    }
    const branchService = accessor.get(IChatBranchService);
    const viewModel = context2.widget.viewModel;
    if (!viewModel) {
      return;
    }
    const sessionResource = viewModel.sessionResource;
    if (!sessionResource) {
      return;
    }
    const info = branchService.getRowInfo(sessionResource, context2.rowId);
    if (!info) {
      return;
    }
    const model = viewModel.model;
    if (model.requestInProgress.get() || model.hasActiveRequest.get()) {
      return;
    }
    const targetIndex = info.variantIndex + (this.direction === "next" ? 1 : -1);
    const target = info.group.variants[targetIndex];
    if (!target) {
      return;
    }
    branchService.setActiveVariant(sessionResource, info.group.id, target.requestId);
  }
};

var ChatBranchMergeAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.chat.opencode.branchMerge",
      title: localize2(8581, "\u5408\u5E76\u603B\u7ED3"),
      f1: false,
      category: CHAT_CATEGORY,
      icon: Codicon.gitMerge,
      menu: {
        id: MenuId.ChatMessageFooter,
        group: "navigation",
        order: 1.2,
        when: ContextKeyExpr.and(ChatContextKeys.isResponse, ChatContextKeys.openCodeBranchCanMerge)
      }
    });
  }
  async run(accessor, ...args2) {
    const context2 = getBranchRowContext(accessor, args2);
    if (!context2) {
      return;
    }
    const { widget, rowId } = context2;
    const sessionResource = widget.viewModel?.sessionResource;
    if (!sessionResource) {
      return;
    }
    const model = widget.viewModel.model;
    if (model.requestInProgress.get() || model.hasActiveRequest.get()) {
      return;
    }
    if (!(accessor.get(IConfigurationService).getValue("opencode.multiModel.enabled") ?? true)) {
      return;
    }
    const branchService = accessor.get(IChatBranchService);
    const info = branchService.getRowInfo(sessionResource, rowId);
    if (!info || info.canMerge === false) {
      return;
    }
    await widget.acceptInput(void 0, {
      openCodeBranchIntent: { kind: "merge", groupId: info.group.id },
      forceEmptyInput: true,
      isSystemInitiated: true,
      systemInitiatedLabel: "\u5408\u5E76\u603B\u7ED3"
    });
  }
};

var ChatBranchAdoptAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.chat.opencode.branchAdopt",
      title: localize2(8579, "\u91C7\u7EB3"),
      f1: false,
      category: CHAT_CATEGORY,
      icon: Codicon.check,
      menu: {
        id: MenuId.ChatMessageFooter,
        group: "navigation",
        order: 1.4,
        when: ContextKeyExpr.and(ChatContextKeys.isResponse, ChatContextKeys.openCodeBranchCanAdopt)
      }
    });
  }
  async run(accessor, ...args2) {
    const context2 = getBranchRowContext(accessor, args2);
    if (!context2) {
      return;
    }
    const { widget, rowId } = context2;
    const sessionResource = widget.viewModel?.sessionResource;
    if (!sessionResource) {
      return;
    }
    const branchService = accessor.get(IChatBranchService);
    const info = branchService.getRowInfo(sessionResource, rowId);
    if (!info) {
      return;
    }
    const variant = info.group.variants[info.variantIndex];
    branchService.adoptVariant(sessionResource, variant.requestId);
    await accessor.get(ICommandService).executeCommand("opencode.branch.adoptVariant", info.group.id, variant.requestId);
  }
};

var ChatBranchDeleteAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.chat.opencode.branchDelete",
      title: localize2(8580, "\u5220\u9664\u5206\u652F"),
      f1: false,
      category: CHAT_CATEGORY,
      icon: Codicon.trash,
      menu: {
        id: MenuId.ChatMessageFooter,
        group: "navigation",
        order: 1.6,
        when: ContextKeyExpr.and(ChatContextKeys.isResponse, ChatContextKeys.openCodeBranchCanDelete)
      }
    });
  }
  async run(accessor, ...args2) {
    const context2 = getBranchRowContext(accessor, args2);
    if (!context2) {
      return;
    }
    const { widget, rowId } = context2;
    const sessionResource = widget.viewModel?.sessionResource;
    if (!sessionResource) {
      return;
    }
    const model = widget.viewModel.model;
    if (model.requestInProgress.get() || model.hasActiveRequest.get()) {
      return;
    }
    const branchService = accessor.get(IChatBranchService);
    const info = branchService.getRowInfo(sessionResource, rowId);
    if (!info || info.canDelete === false) {
      return;
    }
    const variant = info.group.variants[info.variantIndex];
    await accessor.get(IChatService).removeRequest(sessionResource, variant.requestId);
    branchService.removeRequest(sessionResource, variant.requestId);
  }
};

// OpenCode multi-model: run every configured branch model for the last
// question in one click. A chat session accepts one request at a time, so the
// branch requests are still sent one after another. With
// opencode.multiModel.parallelBranches >= 2 the first request tells the
// extension about the whole batch; it starts the other models in the background
// right away and each later request only attaches to its finished (or still
// running) background job, so the models answer concurrently.
var openCodeBranchRunAllSessions = /* @__PURE__ */ new Set();

function openCodeParallelBranchLimit(configurationService) {
  const value = configurationService.getValue("opencode.multiModel.parallelBranches");
  return Number.isInteger(value) && value >= 1 ? Math.min(value, 6) : 3;
}

function openCodeBranchBatchId() {
  try {
    return globalThis.crypto.randomUUID();
  } catch {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
  }
}

function openCodeBranchSleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeOpenCodeModelList(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  return [...new Set(value.filter((item) => typeof item === "string").map((item) => item.trim()).filter(Boolean))];
}

function openCodeMaxBranches(configurationService) {
  const value = configurationService.getValue("opencode.multiModel.maxBranches");
  return Number.isInteger(value) && value >= 2 ? Math.min(value, 6) : 3;
}

function lastOpenCodeQuestion(model) {
  const requests = model.getRequests();
  for (let index = requests.length - 1; index >= 0; index -= 1) {
    const text = requests[index].message.text.trim();
    if (text) {
      return text;
    }
  }
  return void 0;
}

async function waitForOpenCodeRequestSettled(model, previousCount) {
  for (let attempt = 0; attempt < 100 && model.getRequests().length <= previousCount; attempt += 1) {
    await openCodeBranchSleep(100);
  }
  if (model.getRequests().length <= previousCount) {
    return false;
  }
  while (model.requestInProgress.get() || model.hasActiveRequest.get() || model.getRequests().at(-1)?.response?.isComplete === false) {
    await openCodeBranchSleep(400);
  }
  const response = model.getRequests().at(-1)?.response;
  return !!response && response.isComplete !== false && response.isCanceled !== true && !response.result?.errorDetails;
}

var ChatBranchRunAllAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.chat.opencode.branchRunAll",
      title: { value: "\u591A\u6A21\u578B\u5206\u652F", original: "Multi-Model Branches" },
      tooltip: "\u7528\u8BBE\u7F6E\u597D\u7684\u5206\u652F\u6A21\u578B\u91CD\u7B54\u8FD9\u4E2A\u95EE\u9898\uFF08\u53EF\u5E76\u884C\uFF09",
      f1: false,
      category: CHAT_CATEGORY,
      icon: Codicon.gitCompare,
      menu: {
        id: MenuId.ChatMessageFooter,
        group: "navigation",
        order: 1.1,
        when: ContextKeyExpr.and(
          ChatContextKeys.isResponse,
          ChatContextKeys.openCodeBranchCanRunAll,
          ContextKeyExpr.notEquals("config.opencode.multiModel.enabled", false)
        )
      }
    });
  }
  async run(accessor, ...args2) {
    const context2 = getBranchRowContext(accessor, args2);
    if (!context2) {
      return;
    }
    const { widget } = context2;
    const viewModel = widget.viewModel;
    const sessionResource = viewModel?.sessionResource;
    if (!viewModel || !sessionResource) {
      return;
    }
    const configurationService = accessor.get(IConfigurationService);
    const notificationService = accessor.get(INotificationService);
    const commandService = accessor.get(ICommandService);
    const languageModelsService = accessor.get(ILanguageModelsService);
    const branchService = accessor.get(IChatBranchService);
    const sessionKey = sessionResource.toString();
    if (openCodeBranchRunAllSessions.has(sessionKey)) {
      notificationService.info("\u591A\u6A21\u578B\u5206\u652F\u6B63\u5728\u751F\u6210\uFF0C\u8BF7\u7B49\u5F53\u524D\u5206\u652F\u5B8C\u6210\u3002");
      return;
    }
    if (!(configurationService.getValue("opencode.multiModel.enabled") ?? true)) {
      return;
    }
    const model = viewModel.model;
    if (model.requestInProgress.get() || model.hasActiveRequest.get()) {
      return;
    }
    if (!widget.input.isBranchEligible()) {
      notificationService.info("\u591A\u6A21\u578B\u5206\u652F\u9700\u8981 Plan \u6A21\u5F0F\uFF0C\u6216\u5728 Git \u4ED3\u5E93\u91CC\u7528 Code \u6A21\u5F0F\u5B8C\u6210\u7684\u4E0A\u4E00\u8F6E\u56DE\u7B54\uFF0C\u5E76\u4E14\u4E0A\u4E00\u8F6E\u5DF2\u6709\u5B8C\u6574\u56DE\u7B54\u3002");
      return;
    }
    let models = normalizeOpenCodeModelList(configurationService.getValue("opencode.multiModel.branchModels"));
    if (models.length === 0) {
      await commandService.executeCommand("opencode.pickBranchModels");
      models = normalizeOpenCodeModelList(configurationService.getValue("opencode.multiModel.branchModels"));
      if (models.length === 0) {
        return;
      }
    }
    const question = lastOpenCodeQuestion(model);
    if (!question) {
      return;
    }
    const lastResponse = viewModel.getItems().filter(isResponseVM).at(-1);
    const rowInfo = lastResponse ? branchService.getRowInfo(sessionResource, lastResponse.id) : void 0;
    const roundOpen = !!rowInfo && !rowInfo.group.mergedRequestId;
    const answered = roundOpen ? rowInfo.group.variants.filter((variant) => variant.kind === "branch" && !variant.canceled) : [];
    const usedModels = new Set(answered.map((variant) => variant.modelIdentifier ?? variant.modelId).filter(Boolean));
    if (!roundOpen) {
      const lastModelId = model.getRequests().at(-1)?.modelId;
      if (lastModelId) {
        usedModels.add(lastModelId);
      }
    }
    const capacity = Math.max(0, openCodeMaxBranches(configurationService) - Math.max(answered.length, 1));
    const pending = models.filter((id) => !usedModels.has(id));
    if (capacity === 0) {
      notificationService.info("\u672C\u56DE\u5408\u5206\u652F\u6570\u5DF2\u8FBE\u4E0A\u9650\uFF0C\u8BF7\u5148\u5408\u5E76\u603B\u7ED3\u6216\u91C7\u7EB3\u4E00\u4E2A\u5206\u652F\u3002");
      return;
    }
    if (pending.length === 0) {
      notificationService.info("\u5DF2\u9009\u7684\u5206\u652F\u6A21\u578B\u90FD\u5DF2\u5728\u672C\u56DE\u5408\u4F5C\u7B54\u3002\u53EF\u4EE5\u5728\u300C\u591A\u6A21\u578B\u535A\u5F08\u300D\u8BBE\u7F6E\u91CC\u6DFB\u52A0\u5176\u4ED6\u6A21\u578B\u3002");
      return;
    }
    const queue = pending.slice(0, capacity);
    if (pending.length > capacity) {
      notificationService.info(`\u672C\u56DE\u5408\u6700\u591A\u8FD8\u80FD\u751F\u6210 ${capacity} \u4E2A\u5206\u652F\uFF0C\u53EA\u8FD0\u884C\u524D ${capacity} \u4E2A\u6A21\u578B\u3002`);
    }
    const available = queue.filter((modelIdentifier) => {
      if (languageModelsService.lookupLanguageModel(modelIdentifier)) {
        return true;
      }
      notificationService.warn(`\u5206\u652F\u6A21\u578B ${modelIdentifier} \u5F53\u524D\u4E0D\u53EF\u7528\uFF0C\u5DF2\u8DF3\u8FC7\u3002`);
      return false;
    });
    const parallel = openCodeParallelBranchLimit(configurationService) >= 2 && available.length >= 2 ? {
      batchId: openCodeBranchBatchId(),
      models: available.map((identifier) => {
        const metadata = languageModelsService.lookupLanguageModel(identifier);
        let modelConfiguration;
        try {
          modelConfiguration = widget.input.getModelConfiguration?.(identifier);
        } catch {
          modelConfiguration = void 0;
        }
        return { identifier, vendor: metadata.vendor, id: metadata.id, modelConfiguration };
      })
    } : void 0;
    openCodeBranchRunAllSessions.add(sessionKey);
    let completed = 0;
    let sent = 0;
    try {
      for (const modelIdentifier of available) {
        if (widget.viewModel?.sessionResource?.toString() !== sessionKey) {
          break;
        }
        // Later requests of a parallel batch only attach to jobs that already started from the
        // eligible round, so a failed branch before them must not block the rest.
        if (!parallel || sent === 0 ? !widget.input.isBranchEligible() : model.requestInProgress.get() || model.hasActiveRequest.get()) {
          break;
        }
        sent += 1;
        const previousCount = model.getRequests().length;
        await widget.acceptInput(question, {
          openCodeBranchIntent: { kind: "branch", groupId: void 0, ...parallel ? { parallel: { batchId: parallel.batchId, modelIdentifier, models: parallel.models } } : {} },
          openCodeModelOverride: modelIdentifier,
          preserveInput: true,
          storeToHistory: false
        });
        if (!await waitForOpenCodeRequestSettled(model, previousCount)) {
          const response = model.getRequests().length > previousCount ? model.getRequests().at(-1)?.response : void 0;
          // In a parallel batch one failed branch does not stop the others; a request
          // that was not sent or that the user stopped still stops the whole batch.
          if (parallel && response && response.isCanceled !== true) {
            continue;
          }
          break;
        }
        completed += 1;
      }
    } finally {
      openCodeBranchRunAllSessions.delete(sessionKey);
      if (parallel) {
        commandService.executeCommand("opencode.multiModel.cancelParallelBranches", parallel.batchId, true).catch(() => void 0);
      }
    }
    if (completed === 0 || !(configurationService.getValue("opencode.multiModel.autoMerge") ?? false)) {
      return;
    }
    if (widget.viewModel?.sessionResource?.toString() !== sessionKey || model.requestInProgress.get() || model.hasActiveRequest.get()) {
      return;
    }
    const latest = widget.viewModel.getItems().filter(isResponseVM).at(-1);
    const latestInfo = latest ? branchService.getRowInfo(sessionResource, latest.id) : void 0;
    if (!latestInfo?.canMerge) {
      return;
    }
    await widget.acceptInput(void 0, {
      openCodeBranchIntent: { kind: "merge", groupId: latestInfo.group.id },
      forceEmptyInput: true,
      isSystemInitiated: true,
      systemInitiatedLabel: "\u5408\u5E76\u603B\u7ED3"
    });
  }
};

var OPENCODE_BRANCH_ROLE_LABELS = { critic: "\u5BA1\u67E5\u8005", alternative: "\u66FF\u4EE3\u65B9\u6848", minimal: "\u6700\u5C0F\u6539\u52A8", verifier: "\u9A8C\u8BC1\u4F18\u5148" };

function openCodeBranchVariantTitle(variant, index, languageModelsService) {
  const name = variant.modelIdentifier ? languageModelsService.lookupLanguageModel(variant.modelIdentifier)?.name ?? variant.modelId : variant.modelId;
  const parts = [variant.kind === "merge" ? "\u5408\u5E76\u603B\u7ED3" : `\u5206\u652F ${index + 1}`];
  if (name) {
    parts.push(name);
  }
  const roleLabel = variant.role ? OPENCODE_BRANCH_ROLE_LABELS[variant.role] : void 0;
  if (roleLabel) {
    parts.push(roleLabel);
  }
  return parts.join(" \u00B7 ");
}

function openCodeBranchVariantDocument(chatModel, variant, title) {
  const request = chatModel.getRequests().find((candidate) => candidate.id === variant.requestId);
  const response = request?.response;
  const body = (response?.response?.getMarkdown?.() || response?.response?.toString?.() || "").trim() || "\uFF08\u7A7A\u56DE\u7B54\uFF09";
  const header = [`# ${title}`];
  if (typeof response?.completedAt === "number" && typeof response?.timestamp === "number" && response.completedAt > response.timestamp) {
    header.push(`> \u7528\u65F6 ${Math.max(1, Math.round((response.completedAt - response.timestamp) / 1e3))} \u79D2`);
  }
  return `${header.join("\n\n")}\n\n${body}\n`;
}

var ChatBranchCompareAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.chat.opencode.branchCompare",
      title: { value: "\u5BF9\u6BD4\u5206\u652F", original: "Compare Branches" },
      tooltip: "\u628A\u5F53\u524D\u56DE\u7B54\u548C\u53E6\u4E00\u4E2A\u5206\u652F\u5E76\u6392\u5BF9\u6BD4",
      f1: false,
      category: CHAT_CATEGORY,
      icon: Codicon.diff,
      menu: {
        id: MenuId.ChatMessageFooter,
        group: "navigation",
        order: 1.15,
        when: ContextKeyExpr.and(ChatContextKeys.isResponse, ChatContextKeys.openCodeBranchCanCompare)
      }
    });
  }
  async run(accessor, ...args2) {
    const context2 = getBranchRowContext(accessor, args2);
    if (!context2) {
      return;
    }
    const { widget, rowId } = context2;
    const viewModel = widget.viewModel;
    const sessionResource = viewModel?.sessionResource;
    if (!viewModel || !sessionResource) {
      return;
    }
    const branchService = accessor.get(IChatBranchService);
    const languageModelsService = accessor.get(ILanguageModelsService);
    const quickInputService = accessor.get(IQuickInputService);
    const modelService = accessor.get(IModelService);
    const languageService = accessor.get(ILanguageService);
    const editorService = accessor.get(IEditorService);
    const info = branchService.getRowInfo(sessionResource, rowId);
    if (!info) {
      return;
    }
    const entries = info.group.variants.map((variant, index) => ({ variant, index })).filter(({ variant }) => !variant.canceled);
    if (entries.length < 2) {
      return;
    }
    const current = entries.find(({ index }) => index === info.variantIndex) ?? entries[0];
    const others = entries.filter((entry) => entry !== current);
    let other = others[0];
    if (others.length > 1) {
      const picked = await quickInputService.pick(
        others.map((entry) => ({ label: openCodeBranchVariantTitle(entry.variant, entry.index, languageModelsService), entry })),
        { placeHolder: `\u9009\u62E9\u8981\u548C\u300C${openCodeBranchVariantTitle(current.variant, current.index, languageModelsService)}\u300D\u5BF9\u6BD4\u7684\u56DE\u7B54` }
      );
      if (!picked) {
        return;
      }
      other = picked.entry;
    }
    const [left, right] = current.index < other.index ? [current, other] : [other, current];
    const toDocument = (entry) => {
      const title = openCodeBranchVariantTitle(entry.variant, entry.index, languageModelsService);
      const resource = URI.from({ scheme: "inmemory", path: `/opencode-branch/${info.group.id}/${entry.variant.requestId}.md` });
      const text = openCodeBranchVariantDocument(viewModel.model, entry.variant, title);
      const existing = modelService.getModel(resource);
      if (existing) {
        existing.setValue(text);
      } else {
        modelService.createModel(text, languageService.createById("markdown"), resource);
      }
      return { resource, title };
    };
    const original = toDocument(left);
    const modified = toDocument(right);
    await editorService.openEditor({
      original: { resource: original.resource },
      modified: { resource: modified.resource },
      label: `${original.title} \u2194 ${modified.title}`,
      options: { pinned: true }
    });
  }
};

function registerChatBranchActions() {
  registerAction2(class ChatBranchPrevAction extends ChatBranchNavigateAction {
    constructor() {
      super("previous");
    }
  });
  registerAction2(class ChatBranchNextAction extends ChatBranchNavigateAction {
    constructor() {
      super("next");
    }
  });
  registerAction2(ChatBranchMergeAction);
  registerAction2(ChatBranchAdoptAction);
  registerAction2(ChatBranchDeleteAction);
  registerAction2(ChatBranchRunAllAction);
  registerAction2(ChatBranchCompareAction);
}
export { getBranchRowContext, registerChatBranchActions, ChatBranchNavigateAction, ChatBranchMergeAction, ChatBranchAdoptAction, ChatBranchDeleteAction, ChatBranchRunAllAction, ChatBranchCompareAction };
