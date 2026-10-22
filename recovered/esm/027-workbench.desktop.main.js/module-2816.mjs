// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatSubagentOpenChat.ts
import { Disposable, DisposableStore, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { parseChatUri } from "./module-1007.mjs";
import { URI } from "./module-0032.mjs";
import { CHAT_OPEN_AGENT_HOST_CHAT_COMMAND_ID, CHAT_SUBAGENT_RESOURCE_QUERY_PARAM } from "./module-0964.mjs";
import { AUTO_RAW_MODEL_ID, ILanguageModelsService } from "./module-0967.mjs";
import { formatElapsedTime } from "./module-2211.mjs";
import { Action } from "./module-0082.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { ACTIVE_GROUP } from "./module-0934.mjs";
import { Action2, MenuId, MenuItemAction, registerAction2 } from "./module-0092.mjs";
import { Codicon } from "./module-0085.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IChatWidgetService } from "./module-0981.mjs";
import { BaseActionViewItem } from "./module-0476.mjs";
import { $, EventHelper, EventType, WindowIntervalTimer, addDisposableListener, isHTMLElement } from "./module-0075.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { formatCopilotCreditsLabel } from "./module-0972.mjs";
import { createPixelSpinner } from "./module-2010.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { getChatMarkdownRenderOptions } from "./module-2144.mjs";
import { renderFileWidgets } from "./module-2142.mjs";
import { getCompactCodicon } from "./module-2040.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IMarkdownRendererService } from "./module-0541.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IChatMarkdownAnchorService } from "./module-2140.mjs";
import { IAccessibilityService } from "./module-0104.mjs";
import { IHoverService } from "./module-0520.mjs";
import { Emitter } from "./module-0017.mjs";
import { IActionViewItemService } from "./module-0518.mjs";
import { IWorkbenchEnvironmentService } from "./module-0935.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0870.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatSubagentOpenChat.ts
var SubagentChatOpenerRegistry = class {
  constructor() {
    this.openers = /* @__PURE__ */ new Set();
  }
  register(opener) {
    this.openers.add(opener);
    return toDisposable(() => this.openers.delete(opener));
  }
  async open(context2) {
    for (const opener of this.openers) {
      if (await opener.open(context2)) {
        return true;
      }
    }
    return false;
  }
};

var subagentChatOpenerRegistry = new SubagentChatOpenerRegistry();

function asOpenSubagentChatContext(context2) {
  if (typeof context2 === "string") {
    return { chatResource: context2 };
  }
  if (context2 && typeof context2 === "object" && typeof context2.chatResource === "string") {
    return context2;
  }
  return void 0;
}

function getSubagentEditorResource(context2) {
  const parsed = parseChatUri(context2.chatResource);
  if (!parsed || !context2.parentSessionResource) {
    return void 0;
  }
  try {
    const parentSessionResource = URI.parse(context2.parentSessionResource);
    const query = new URLSearchParams(parentSessionResource.query);
    query.set(CHAT_SUBAGENT_RESOURCE_QUERY_PARAM, context2.chatResource);
    return parentSessionResource.with({ fragment: parsed.chatId, query: query.toString() });
  } catch {
    return void 0;
  }
}

function shouldShowSubagentModel(subagentModelName, parentModelId, parentModelName, parentModelMetadataId) {
  const normalize3 = (value2) => value2?.trim().toLowerCase();
  const subagent = normalize3(subagentModelName);
  if (!subagent || subagent === AUTO_RAW_MODEL_ID) {
    return false;
  }
  const parentIdSuffix = parentModelId?.slice(parentModelId.lastIndexOf(":") + 1);
  const parents = [parentModelId, parentIdSuffix, parentModelName, parentModelMetadataId].map(normalize3);
  const autoCandidates = parentModelId ? [parentModelId, parentIdSuffix].map(normalize3) : parents;
  return autoCandidates.includes(AUTO_RAW_MODEL_ID) || !parents.includes(subagent);
}

function formatCompactSubagentDuration(startedAt, duration, now = Date.now()) {
  const end = duration === void 0 ? now : startedAt + Math.max(0, duration);
  return formatElapsedTime(Math.max(0, end - startedAt));
}

function shouldAnimateSubagentToolTransition(displayedToolCallId, displayedIsTool, targetToolCallId, targetIsTool) {
  if (!displayedIsTool && !targetIsTool) {
    return false;
  }
  return displayedIsTool !== targetIsTool || displayedToolCallId !== targetToolCallId;
}

function createOpenSubagentAction(action) {
  const proxy = new Action(action.id, action.label, action.class, false, (context2) => action.run(context2));
  proxy.tooltip = action.tooltip;
  return proxy;
}

function createEditorOpenSubagentAction(action, chatWidgetService, notificationService) {
  const proxy = new Action(action.id, action.label, action.class, false, async (rawContext) => {
    const context2 = asOpenSubagentChatContext(rawContext);
    const resource = context2 && getSubagentEditorResource(context2);
    if (!resource) {
      notificationService.error(localize(12093, null));
      return;
    }
    await chatWidgetService.openSession(resource, ACTIVE_GROUP, {
      pinned: true,
      revealIfOpened: true,
      title: context2.title ? { preferred: context2.title } : void 0
    });
  });
  proxy.tooltip = action.tooltip;
  return proxy;
}

var OpenSubagentChatAction = class extends Action2 {
  constructor() {
    super({
      id: CHAT_OPEN_AGENT_HOST_CHAT_COMMAND_ID,
      title: localize2(12089, "Open Subagent"),
      icon: Codicon.commentDiscussion,
      f1: false,
      menu: { id: MenuId.ChatSubagentContent, group: "navigation" }
    });
  }
  async run(accessor, rawContext) {
    const notificationService = accessor.get(INotificationService);
    const chatWidgetService = accessor.get(IChatWidgetService);
    const context2 = asOpenSubagentChatContext(rawContext);
    if (!context2) {
      throw new Error("Cannot open a subagent chat without a chat resource");
    }
    if (await subagentChatOpenerRegistry.open(context2)) {
      return;
    }
    const resource = getSubagentEditorResource(context2);
    if (!resource) {
      notificationService.error(localize(12093, null));
      return;
    }
    await chatWidgetService.openSession(resource, ACTIVE_GROUP, {
      pinned: true,
      revealIfOpened: true,
      title: context2.title ? { preferred: context2.title } : void 0
    });
  }
};

registerAction2(OpenSubagentChatAction);

var OpenSubagentChatActionViewItem = class extends BaseActionViewItem {
  constructor(context2, action, options3, openInEditor2 = false, markdownRendererService, instantiationService, chatMarkdownAnchorService, accessibilityService, chatWidgetService, notificationService, languageModelsService, hoverService) {
    super(context2, openInEditor2 ? createEditorOpenSubagentAction(action, chatWidgetService, notificationService) : createOpenSubagentAction(action), options3);
    this.markdownRendererService = markdownRendererService;
    this.instantiationService = instantiationService;
    this.chatMarkdownAnchorService = chatMarkdownAnchorService;
    this.accessibilityService = accessibilityService;
    this.languageModelsService = languageModelsService;
    this.hoverService = hoverService;
    this._confirmationCount = 0;
    this._spinner = this._register(new MutableDisposable());
    this._durationTimer = this._register(new WindowIntervalTimer());
    this._toolTransition = this._register(new MutableDisposable());
    this._activeToolRendered = this._register(new MutableDisposable());
    this._activeToolFileWidgets = this._register(new DisposableStore());
    this._pillHover = this._register(new MutableDisposable());
    this._enabledTracker = this._register(new MutableDisposable());
    this._targetActivityIsTool = false;
    this._displayedActivityIsTool = false;
    this._toolTransitionPhase = "idle";
    this._sourceAction = action;
    this._showElapsedOnly = openInEditor2;
    if (this._action instanceof Action) {
      this._register(this._action);
    }
    this._register(this.accessibilityService.onDidChangeReducedMotion(() => {
      if (this.accessibilityService.isMotionReduced()) {
        this._finishToolTransition();
      }
    }));
  }
  render(container3) {
    super.render(container3);
    container3.classList.add("chat-subagent-pill-widget");
    container3.setAttribute("role", "button");
    this._iconElement = $("span.chat-subagent-pill-icon");
    this._iconElement.appendChild($(`span.chat-subagent-pill-open-icon${ThemeIcon.asCSSSelector(Codicon.commentDiscussion)}`));
    this._agentTypeElement = $("span.chat-subagent-pill-agent-type.hidden");
    this._labelElement = $("span.chat-subagent-pill-label");
    this._modelElement = $("span.chat-subagent-pill-model.hidden");
    this._confirmationCountElement = $("span.chat-subagent-pill-confirmation-count");
    const pillContent = $("span.chat-subagent-pill-content");
    this._pillContentElement = pillContent;
    const pillHeader = $("span.chat-subagent-pill-header");
    this._durationElement = $("span.chat-subagent-pill-duration.hidden");
    this._creditsElement = $("span.chat-subagent-pill-credits.hidden");
    this._activeToolElement = $("span.chat-subagent-pill-active-tool.hidden");
    this._activeToolElement.inert = true;
    const connector = $("span.chat-subagent-pill-active-tool-connector");
    connector.setAttribute("aria-hidden", "true");
    this._activeToolIconElement = $("span.chat-subagent-pill-active-tool-icon");
    this._activeToolIconElement.setAttribute("aria-hidden", "true");
    this._activeToolLabelElement = $(".chat-subagent-pill-active-tool-label");
    this._activeToolElement.append(connector, this._activeToolIconElement, this._activeToolLabelElement);
    pillContent.append(this._iconElement, this._agentTypeElement, this._labelElement, this._modelElement, this._confirmationCountElement);
    pillHeader.append(pillContent, this._durationElement, this._creditsElement);
    container3.append(pillHeader, this._activeToolElement);
    this._pillHover.value = this.hoverService.setupDelayedHover(pillContent, () => ({ content: this.getTooltip() ?? "" }));
    if (this.options.draggable) {
      this._register(addDisposableListener(container3, EventType.DRAG_START, (event) => {
        const context2 = asOpenSubagentChatContext(this._context);
        if (!this.action.enabled || !context2 || !this._dragDataProvider?.(context2, event)) {
          event.preventDefault();
        }
      }));
      this._register(addDisposableListener(container3, EventType.KEY_DOWN, (event) => {
        const keyboardEvent = new StandardKeyboardEvent(event);
        if (keyboardEvent.altKey && keyboardEvent.keyCode === 3 /* Enter */) {
          EventHelper.stop(event, true);
          this._openToSide();
        }
      }));
    }
    this._update();
  }
  onClick(event, preserveFocus = false) {
    const target = event.target;
    if (!this._pillContentElement || !isHTMLElement(target) || !this._pillContentElement.contains(target)) {
      EventHelper.stop(event, true);
      return;
    }
    if (event.altKey) {
      if (this._openToSide()) {
        EventHelper.stop(event, true);
        return;
      }
    }
    super.onClick(event, preserveFocus);
  }
  _openToSide() {
    const context2 = asOpenSubagentChatContext(this._context);
    if (!this.action.enabled || !context2) {
      return false;
    }
    this.actionRunner.run(this.action, { ...context2, toSide: true });
    return true;
  }
  setActionContext(newContext) {
    const previousResource = asOpenSubagentChatContext(this._context)?.chatResource;
    super.setActionContext(newContext);
    const resource = asOpenSubagentChatContext(newContext)?.chatResource;
    if (resource !== previousResource) {
      this._trackedEnabled = void 0;
      this._resolvedTitle = void 0;
      this._reportedModelName = void 0;
      this._restartEnabledTracker();
    }
    this._update();
  }
  _update() {
    if (!this.element) {
      return;
    }
    const context2 = asOpenSubagentChatContext(this._context);
    const enabled = this._trackedEnabled ?? (!!context2 && !!getSubagentEditorResource(context2));
    this._setEnabled(enabled);
    this._setResolvedTitle(context2?.title || this._resolvedTitle);
    this._setAgentType(context2?.agentType);
    this._reportedModelName = context2?.modelName;
    const parentModel = context2?.parentModelId ? this.languageModelsService.lookupLanguageModel(context2.parentModelId) : void 0;
    const contextModelName = shouldShowSubagentModel(context2?.modelName, context2?.parentModelId, context2?.parentModelName ?? parentModel?.name, context2?.parentResolvedModelId ?? parentModel?.id) ? context2?.modelName : void 0;
    this._setModelName(contextModelName);
    this._setCredits(context2?.credits);
    this._updateConfirmationCount(context2);
    this._updateStatus(context2);
    this._updateDuration(context2);
    const showActivity = context2?.isActive === true && (context2.confirmationCount ?? 0) === 0;
    const activeToolLabel = showActivity ? context2.activeToolLabel : void 0;
    this._setActiveTool(
      showActivity ? activeToolLabel ?? localize(12098, null) : void 0,
      showActivity ? context2.activeToolIcon ?? (activeToolLabel ? void 0 : Codicon.comment) : void 0,
      showActivity ? context2.activeToolCallId : void 0,
      !!activeToolLabel
    );
    this.updateTooltip();
    this.updateEnabled();
    this.updateAriaLabel();
  }
  trackEnabled(tracker2) {
    this._enabledTrackerFactory = tracker2;
    this._restartEnabledTracker();
  }
  setDragDataProvider(provider) {
    this._dragDataProvider = provider;
  }
  _restartEnabledTracker() {
    const context2 = asOpenSubagentChatContext(this._context);
    if (!context2 || !this._enabledTrackerFactory) {
      this._enabledTracker.clear();
      return;
    }
    this._enabledTracker.value = this._enabledTrackerFactory(context2, (enabled) => {
      this._trackedEnabled = enabled;
      this._setEnabled(enabled);
    });
  }
  _setEnabled(enabled) {
    this._action.enabled = enabled;
    this._sourceAction.enabled = enabled;
    this.updateEnabled();
  }
  _setModelName(modelName) {
    if (this._modelElement) {
      this._modelElement.textContent = modelName ?? "";
      this._modelElement.classList.toggle("hidden", !modelName);
    }
  }
  _setCredits(credits) {
    const show3 = typeof credits === "number" && credits > 0;
    this._reportedCredits = show3 ? credits : void 0;
    if (this._creditsElement) {
      this._creditsElement.textContent = show3 ? formatCopilotCreditsLabel(credits) : "";
      this._creditsElement.classList.toggle("hidden", !show3);
    }
  }
  _setAgentType(agentType) {
    this._reportedAgentType = agentType;
    if (this._agentTypeElement) {
      this._agentTypeElement.textContent = agentType ?? "";
      this._agentTypeElement.classList.toggle("hidden", !agentType);
    }
  }
  _updateStatus(context2) {
    const status2 = (context2?.confirmationCount ?? 0) > 0 ? "waiting" : context2?.isActive === true ? "running" : context2?.isActive === false ? "completed" : void 0;
    if (status2 === this._renderedStatus) {
      return;
    }
    this._renderedStatus = status2;
    const waiting = status2 === "waiting";
    const running = status2 === "running";
    this.element?.classList.toggle("chat-subagent-running", running);
    this.element?.classList.toggle("chat-subagent-waiting", waiting);
    this._spinner.clear();
    if ((running || waiting) && this._iconElement) {
      const store = new DisposableStore();
      const spinner = store.add(createPixelSpinner(this._iconElement, { variant: waiting ? "ring" : "grid" }));
      store.add(toDisposable(() => spinner.element.remove()));
      this._spinner.value = store;
    }
  }
  _updateConfirmationCount(context2) {
    const count2 = context2?.confirmationCount ?? 0;
    const confirmationActive = !!context2?.confirmationActive;
    this._confirmationCount = count2;
    this.element?.classList.toggle("chat-subagent-needs-confirmation", count2 > 0);
    this.element?.classList.toggle("chat-subagent-has-multiple-confirmations", count2 > 1);
    this.element?.classList.toggle("chat-subagent-confirmation-active", count2 > 0 && confirmationActive);
    this.element?.classList.toggle("chat-subagent-confirmation-pending", count2 > 0 && !confirmationActive);
    if (this._confirmationCountElement) {
      this._confirmationCountElement.textContent = String(count2);
    }
  }
  _updateDuration(context2) {
    this._durationTimer.cancel();
    const startedAt = context2?.startedAt;
    const durationValue = context2?.duration;
    if (!this._durationElement || startedAt === void 0) {
      this._durationElement?.classList.add("hidden");
      return;
    }
    const update = () => {
      const duration = formatCompactSubagentDuration(startedAt, durationValue);
      this._durationElement.textContent = this._showElapsedOnly ? duration : durationValue === void 0 ? localize(12099, null, duration) : localize(12097, null, duration);
      this.updateAriaLabel();
    };
    update();
    this._durationElement.classList.remove("hidden");
    if (durationValue === void 0) {
      this._durationTimer.cancelAndSet(update, 1e3);
    }
  }
  _setActiveTool(label3, icon2, toolCallId, isTool) {
    this._targetToolLabel = label3;
    this._targetToolIcon = icon2;
    this._targetToolCallId = toolCallId;
    this._targetActivityIsTool = isTool;
    if (!this._activeToolElement || !this._activeToolLabelElement || !this._activeToolIconElement) {
      return;
    }
    this._activeToolElement.classList.toggle("hidden", !label3);
    if (!label3) {
      this._toolTransition.clear();
      this._toolTransitionPhase = "idle";
      this._clearToolTransitionClasses();
      this._activeToolRendered.clear();
      this._activeToolFileWidgets.clear();
      this._activeToolLabelElement.textContent = "";
      this._displayedToolLabel = void 0;
      this._displayedToolIcon = void 0;
      this._displayedToolCallId = void 0;
      this._displayedToolAccessibleLabel = void 0;
      this._displayedActivityIsTool = false;
      this._renderActiveToolIcon(void 0);
      return;
    }
    if (!this._displayedToolLabel || this.accessibilityService.isMotionReduced()) {
      this._finishToolTransition();
      return;
    }
    if (this._toolTransitionPhase === "idle" && !shouldAnimateSubagentToolTransition(this._displayedToolCallId, this._displayedActivityIsTool, toolCallId, isTool)) {
      this._setDisplayedTool(label3, icon2, toolCallId, isTool);
      return;
    }
    this._runToolTransition();
  }
  _runToolTransition() {
    if (!this._activeToolLabelElement || this._toolTransitionPhase !== "idle") {
      return;
    }
    if (!shouldAnimateSubagentToolTransition(this._displayedToolCallId, this._displayedActivityIsTool, this._targetToolCallId, this._targetActivityIsTool)) {
      if (this._targetToolLabel !== this._displayedToolLabel || this._targetToolIcon?.id !== this._displayedToolIcon?.id || this._targetToolCallId !== this._displayedToolCallId || this._targetActivityIsTool !== this._displayedActivityIsTool) {
        this._setDisplayedTool(this._targetToolLabel ?? "", this._targetToolIcon, this._targetToolCallId, this._targetActivityIsTool);
      }
      return;
    }
    this._toolTransitionPhase = "out";
    if (!this._restartToolTransition("chat-subagent-tool-fade-out")) {
      this._completeToolTransition();
    }
  }
  _completeToolTransition() {
    this._toolTransition.clear();
    if (this._toolTransitionPhase === "out") {
      this._toolTransitionPhase = "in";
      this._setDisplayedTool(this._targetToolLabel ?? "", this._targetToolIcon, this._targetToolCallId, this._targetActivityIsTool);
      if (!this._restartToolTransition("chat-subagent-tool-fade-in")) {
        this._completeToolTransition();
      }
      return;
    }
    if (this._toolTransitionPhase === "in") {
      this._clearToolTransitionClasses();
      this._toolTransitionPhase = "idle";
      this._runToolTransition();
    }
  }
  _finishToolTransition() {
    this._toolTransition.clear();
    this._toolTransitionPhase = "idle";
    this._clearToolTransitionClasses();
    if (this._targetToolLabel) {
      this._setDisplayedTool(this._targetToolLabel, this._targetToolIcon, this._targetToolCallId, this._targetActivityIsTool);
    }
  }
  _setDisplayedTool(label3, icon2, toolCallId, isTool) {
    if (!this._activeToolLabelElement) {
      return;
    }
    this._activeToolRendered.clear();
    this._activeToolFileWidgets.clear();
    this._activeToolLabelElement.textContent = "";
    const rendered = this.markdownRendererService.render(new MarkdownString(label3), getChatMarkdownRenderOptions(), this._activeToolLabelElement);
    renderFileWidgets(rendered.element, this.instantiationService, this.chatMarkdownAnchorService, this._activeToolFileWidgets);
    this._activeToolRendered.value = rendered;
    this._displayedToolLabel = label3;
    this._displayedToolIcon = icon2;
    this._displayedToolCallId = toolCallId;
    this._displayedToolAccessibleLabel = rendered.element.textContent?.replace(/\s+/g, " ").trim() || label3;
    this._displayedActivityIsTool = isTool;
    this._renderActiveToolIcon(icon2);
    this.updateTooltip();
    this.updateAriaLabel();
  }
  _renderActiveToolIcon(icon2) {
    if (!this._activeToolIconElement) {
      return;
    }
    this._activeToolIconElement.className = "chat-subagent-pill-active-tool-icon";
    if (icon2) {
      this._activeToolIconElement.classList.add(...ThemeIcon.asClassNameArray(getCompactCodicon(icon2)));
    }
  }
  _clearToolTransitionClasses() {
    this._activeToolLabelElement?.classList.remove("chat-subagent-tool-fade-in", "chat-subagent-tool-fade-out");
  }
  _restartToolTransition(className2) {
    if (!this._activeToolLabelElement) {
      return false;
    }
    this._toolTransition.clear();
    this._clearToolTransitionClasses();
    const transition = new DisposableStore();
    const complete = (event) => {
      if (event.target === this._activeToolLabelElement) {
        this._completeToolTransition();
      }
    };
    transition.add(addDisposableListener(this._activeToolLabelElement, EventType.ANIMATION_END, complete));
    transition.add(addDisposableListener(this._activeToolLabelElement, "animationcancel", complete));
    this._toolTransition.value = transition;
    void this._activeToolLabelElement.offsetWidth;
    this._activeToolLabelElement.classList.add(className2);
    if (this._activeToolLabelElement.getAnimations().length === 0) {
      this._toolTransition.clear();
      this._clearToolTransitionClasses();
      return false;
    }
    return true;
  }
  _setResolvedTitle(title) {
    this._resolvedTitle = title;
    if (this._labelElement) {
      this._labelElement.textContent = title || this._action.label;
    }
  }
  getTooltip() {
    const details = [];
    if (this._confirmationCount > 0) {
      details.push(this._confirmationCount === 1 ? localize(12092, null) : localize(12091, null, this._confirmationCount));
    } else {
      details.push(this._resolvedTitle ? localize(12090, null, this._resolvedTitle) : this._action.label);
    }
    if (this._reportedAgentType) {
      details.push(localize(12086, null, this._reportedAgentType));
    }
    if (this._reportedModelName) {
      details.push(localize(12088, null, this._reportedModelName));
    }
    if (this._reportedCredits !== void 0) {
      details.push(formatCopilotCreditsLabel(this._reportedCredits));
    }
    if (this._displayedToolAccessibleLabel && this._displayedActivityIsTool) {
      details.push(localize(12084, null, this._displayedToolAccessibleLabel));
    }
    return details.join("\n");
  }
  updateTooltip() {
    this.updateAriaLabel();
  }
  updateEnabled() {
    if (!this.element) {
      return;
    }
    const enabled = this._action.enabled;
    this.element.classList.toggle("disabled", !enabled);
    this.element.classList.toggle("hidden", !enabled);
    this.element.setAttribute("aria-disabled", String(!enabled));
    this.element.setAttribute("aria-hidden", String(!enabled));
  }
  updateAriaLabel() {
    if (!this.element) {
      return;
    }
    const label3 = this._resolvedTitle ? localize(12090, null, this._resolvedTitle) : this._action.label;
    const status2 = this._renderedStatus === "running" ? localize(12096, null) : this._renderedStatus === "waiting" ? localize(12095, null) : this._renderedStatus === "completed" ? localize(12094, null) : void 0;
    const agentType = this._reportedAgentType ? localize(12085, null, this._reportedAgentType) : void 0;
    const model = this._reportedModelName ? localize(12087, null, this._reportedModelName) : void 0;
    const activeTool = this._displayedToolAccessibleLabel && this._displayedActivityIsTool ? localize(12083, null, this._displayedToolAccessibleLabel) : void 0;
    const duration = this._durationElement?.textContent;
    const credits = this._creditsElement?.textContent;
    this.element.setAttribute("aria-label", [label3, agentType, status2, model, activeTool, duration, credits].filter(Boolean).join(". "));
  }
};

OpenSubagentChatActionViewItem = __decorateClass([
  __decorateParam(4, IMarkdownRendererService),
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, IChatMarkdownAnchorService),
  __decorateParam(7, IAccessibilityService),
  __decorateParam(8, IChatWidgetService),
  __decorateParam(9, INotificationService),
  __decorateParam(10, ILanguageModelsService),
  __decorateParam(11, IHoverService)
], OpenSubagentChatActionViewItem);

var EditorOpenSubagentChatActionViewItemContribution = class extends Disposable {
  static {
    this.ID = "workbench.contrib.editorOpenSubagentChatActionViewItem";
  }
  constructor(actionViewItemService, environmentService) {
    super();
    if (environmentService.isSessionsWindow) {
      return;
    }
    const onDidRegister = this._register(new Emitter());
    this._register(actionViewItemService.register(MenuId.ChatSubagentContent, CHAT_OPEN_AGENT_HOST_CHAT_COMMAND_ID, (action, options3, instantiationService) => {
      if (!(action instanceof MenuItemAction)) {
        return void 0;
      }
      return instantiationService.createInstance(OpenSubagentChatActionViewItem, void 0, action, options3, true);
    }, onDidRegister.event));
    onDidRegister.fire();
  }
};

EditorOpenSubagentChatActionViewItemContribution = __decorateClass([
  __decorateParam(0, IActionViewItemService),
  __decorateParam(1, IWorkbenchEnvironmentService)
], EditorOpenSubagentChatActionViewItemContribution);

registerWorkbenchContribution2(EditorOpenSubagentChatActionViewItemContribution.ID, EditorOpenSubagentChatActionViewItemContribution, WorkbenchPhase.BlockStartup);
export { asOpenSubagentChatContext, getSubagentEditorResource, shouldShowSubagentModel, formatCompactSubagentDuration, shouldAnimateSubagentToolTransition, createOpenSubagentAction, createEditorOpenSubagentAction, SubagentChatOpenerRegistry, subagentChatOpenerRegistry, OpenSubagentChatAction, OpenSubagentChatActionViewItem, EditorOpenSubagentChatActionViewItemContribution };
