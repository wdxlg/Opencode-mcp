// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/providers/copilotChatSessions/browser/modePicker.ts
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { ChatMode, IChatModeService } from "./module-1469.mjs";
import { getChatSessionType } from "./module-0962.mjs";
import { CopilotCLISessionType } from "./module-3672.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatSessionsService } from "./module-0961.mjs";
import { $, EventHelper, EventType, addDisposableListener, append, clearNode } from "./module-0075.mjs";
import { EventType2, Gesture } from "./module-0251.mjs";
import { reportNewChatPickerClosed } from "./module-3541.mjs";
import { reportChatModeChange } from "./module-2048.mjs";
import { AICustomizationManagementCommands2 } from "./module-1471.mjs";
import { AICustomizationManagementSection } from "./module-0996.mjs";
import { localize } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { renderIcon } from "./module-0467.mjs";
import { IActionWidgetService } from "./module-0553.mjs";
import { ICommandService } from "./module-0087.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IChatService } from "./module-0973.mjs";


// src/vs/sessions/contrib/providers/copilotChatSessions/browser/modePicker.ts
var ModePickerModel = class extends Disposable {
  constructor(chatSessionsService, chatModeService) {
    super();
    this.chatSessionsService = chatSessionsService;
    this.chatModeService = chatModeService;
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this._modeChangeListener = this._register(new MutableDisposable());
    this._chatModesDisposable = this._register(new MutableDisposable());
    this._selectedModeId = void 0;
  }
  get selectedMode() {
    if (!this._selectedModeId) {
      return ChatMode.Agent;
    }
    return this._findModeById(this._selectedModeId) ?? ChatMode.Agent;
  }
  get selectedModeId() {
    return this._selectedModeId;
  }
  reset() {
    this._selectedModeId = void 0;
    this._onDidChange.fire();
  }
  setSelectedMode(mode) {
    this._selectedModeId = mode.id;
    this._onDidChange.fire();
  }
  setSession(session, selectedModeId) {
    if (!session) {
      if (!this._sessionResource) {
        return;
      }
      this._sessionResource = void 0;
      this._chatModesDisposable.value = void 0;
      this._chatModes = void 0;
      this._selectedModeId = void 0;
      this._onDidChange.fire();
      return;
    }
    this._setSession(session, selectedModeId);
  }
  getAvailableModes() {
    const sessionType = this._sessionResource ? getChatSessionType(this._sessionResource) : CopilotCLISessionType.id;
    const customAgentTarget = this.chatSessionsService.getCustomAgentTargetForSessionType(sessionType);
    const effectiveTarget = customAgentTarget && customAgentTarget !== "undefined" /* Undefined */ ? customAgentTarget : "github-copilot" /* GitHubCopilot */;
    const result = [ChatMode.Agent];
    for (const mode of this._chatModes?.custom ?? []) {
      const target = mode.target.get();
      if (target === effectiveTarget || target === "undefined" /* Undefined */) {
        const visibility = mode.visibility?.get();
        if (visibility && !visibility.userInvocable) {
          continue;
        }
        result.push(mode);
      }
    }
    return result;
  }
  _setSession(session, selectedModeId) {
    const sessionResource = session.resource;
    if (this._sessionResource?.toString() === sessionResource.toString()) {
      if (this._selectedModeId !== selectedModeId) {
        this._selectedModeId = selectedModeId;
        this._onDidChange.fire();
      }
      return;
    }
    this._sessionResource = sessionResource;
    const modes = this.chatModeService.createModes(sessionResource);
    this._chatModesDisposable.value = modes;
    this._chatModes = modes;
    this._modeChangeListener.value = modes.onDidChange(() => {
      this._onDidChange.fire();
    });
    this._selectedModeId = selectedModeId;
    this._onDidChange.fire();
  }
  _findModeById(id2) {
    const mode = this._chatModes?.findModeById(id2);
    if (mode) {
      return mode;
    }
    return void 0;
  }
};

ModePickerModel = __decorateClass([
  __decorateParam(0, IChatSessionsService),
  __decorateParam(1, IChatModeService)
], ModePickerModel);

var ModePicker = class extends Disposable {
  constructor(modePickerModel, session, actionWidgetService, commandService, telemetryService, chatService) {
    super();
    this.session = session;
    this.actionWidgetService = actionWidgetService;
    this.commandService = commandService;
    this.telemetryService = telemetryService;
    this.chatService = chatService;
    this._onDidSelect = this._register(new Emitter());
    this.onDidSelect = this._onDidSelect.event;
    this._renderDisposables = this._register(new DisposableStore());
    this._modePickerModel = modePickerModel;
    this._register(this._modePickerModel.onDidChange(() => {
      if (this._triggerElement) {
        this._updateTriggerLabel();
      }
    }));
  }
  /**
   * Resets the selected mode back to the default Agent mode.
   */
  reset() {
    this._modePickerModel.reset();
    this._updateTriggerLabel();
  }
  /**
   * Renders the mode picker trigger button into the given container.
   */
  render(container2) {
    this._renderDisposables.clear();
    const slot = append(container2, $(".sessions-chat-picker-slot"));
    this._renderDisposables.add({ dispose: () => slot.remove() });
    const trigger = append(slot, $("a.action-label"));
    trigger.tabIndex = 0;
    trigger.role = "button";
    this._triggerElement = trigger;
    this._updateTriggerLabel();
    this._renderDisposables.add(Gesture.addTarget(trigger));
    for (const eventType of [EventType.CLICK, EventType2.Tap]) {
      this._renderDisposables.add(addDisposableListener(trigger, eventType, (e4) => {
        EventHelper.stop(e4, true);
        this._showPicker();
      }));
    }
    this._renderDisposables.add(addDisposableListener(trigger, EventType.KEY_DOWN, (e4) => {
      if (e4.key === "Enter" || e4.key === " ") {
        EventHelper.stop(e4, true);
        this._showPicker();
      }
    }));
    return slot;
  }
  _showPicker() {
    if (!this._triggerElement || this.actionWidgetService.isVisible) {
      return;
    }
    const modes = this._modePickerModel.getAvailableModes();
    const items = this._buildItems(modes);
    const triggerElement = this._triggerElement;
    const delegate = {
      onSelect: (item) => {
        this.actionWidgetService.hide();
        if (item.kind === "mode") {
          const activeChat = this.session.get()?.activeChat.get();
          const previousModeId = activeChat?.mode.get()?.id;
          const previousMode = modes.find((mode) => mode.id === previousModeId) ?? ChatMode.Agent;
          reportNewChatPickerClosed(this.telemetryService, {
            id: "NewChatModePicker",
            optionIdBefore: previousMode.id,
            optionIdAfter: item.mode.id,
            optionLabelBefore: previousMode.label.get(),
            optionLabelAfter: item.mode.label.get(),
            isPII: true
          });
          const requestCount = activeChat ? this.chatService.getSession(activeChat.resource)?.getRequests().length ?? 0 : 0;
          reportChatModeChange(this.telemetryService, previousMode, item.mode, requestCount);
          this._selectMode(item.mode);
        } else {
          this.commandService.executeCommand(AICustomizationManagementCommands2.OpenEditor, AICustomizationManagementSection.Agents);
        }
      },
      onHide: () => {
        triggerElement.focus();
      }
    };
    this.actionWidgetService.show(
      "localModePicker",
      false,
      items,
      delegate,
      this._triggerElement,
      void 0,
      [],
      {
        getAriaLabel: (item) => item.label ?? "",
        getWidgetAriaLabel: () => localize(5062, null)
      }
    );
  }
  _buildItems(modes) {
    const items = [];
    const selectedModeId = this._modePickerModel.selectedMode.id;
    const agentMode = modes[0];
    items.push({
      kind: "action" /* Action */,
      label: agentMode.label.get(),
      group: { title: "", icon: selectedModeId === agentMode.id ? Codicon.check : Codicon.blank },
      item: { kind: "mode", mode: agentMode }
    });
    const customModes = modes.slice(1);
    if (customModes.length > 0) {
      items.push({ kind: "separator" /* Separator */, label: "" });
      for (const mode of customModes) {
        items.push({
          kind: "action" /* Action */,
          label: mode.label.get(),
          group: { title: "", icon: selectedModeId === mode.id ? Codicon.check : Codicon.blank },
          item: { kind: "mode", mode }
        });
      }
    }
    items.push({ kind: "separator" /* Separator */, label: "" });
    items.push({
      kind: "action" /* Action */,
      label: localize(5061, null),
      group: { title: "", icon: Codicon.blank },
      item: { kind: "configure" }
    });
    return items;
  }
  _selectMode(mode) {
    this._modePickerModel.setSelectedMode(mode);
    this._updateTriggerLabel();
    this._onDidSelect.fire(mode);
  }
  _updateTriggerLabel() {
    if (!this._triggerElement) {
      return;
    }
    clearNode(this._triggerElement);
    const selectedMode = this._modePickerModel.selectedMode;
    const icon2 = selectedMode.icon.get();
    if (icon2) {
      append(this._triggerElement, renderIcon(icon2));
    }
    const labelSpan = append(this._triggerElement, $("span.sessions-chat-dropdown-label"));
    labelSpan.textContent = selectedMode.label.get();
    this._triggerElement.ariaLabel = localize(5063, null, selectedMode.label.get());
  }
};

ModePicker = __decorateClass([
  __decorateParam(2, IActionWidgetService),
  __decorateParam(3, ICommandService),
  __decorateParam(4, ITelemetryService),
  __decorateParam(5, IChatService)
], ModePicker);
export { ModePickerModel, ModePicker };
