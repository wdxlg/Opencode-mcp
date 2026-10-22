// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/update/browser/updateTitleBarEntry.ts
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { UpdateTitleBarChatInProgressContext, UpdateTitleBarContext, UpdateTitleBarEditorVisibleContext } from "./module-2752.mjs";
import { Action2, MenuId, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { localize } from "./module-0001.mjs";
import { Disposable, MutableDisposable } from "./module-0012.mjs";
import { isWeb } from "./module-0014.mjs";
import { UpdateTooltip } from "./module-3321.mjs";
import { autorun } from "./module-0052.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IActionViewItemService } from "./module-0518.mjs";
import { IChatService } from "./module-0973.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IHostService } from "./module-1118.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IUpdateService } from "./module-1181.mjs";
import { BaseActionViewItem } from "./module-0476.mjs";
import { $, append, clearNode, getWindow, scheduleAtNextAnimationFrame } from "./module-0075.mjs";
import { computeProgressPercent } from "./module-3319.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IHoverService } from "./module-0520.mjs";
import { ITelemetryService } from "./module-0093.mjs";


// src/vs/workbench/contrib/update/browser/updateTitleBarEntry.ts
var UPDATE_TITLE_BAR_ACTION_ID = "workbench.actions.updateIndicator";

var DISABLED_REMINDER_LAST_SHOWN_KEY = "update/disabledReminderLastShown";

var DISABLED_REMINDER_PERIOD = 30 * 24 * 60 * 60 * 1e3;

var UPDATE_TITLE_BAR_SETTING = "update.titleBar";

var ACTIONABLE_STATES = ["available for download" /* AvailableForDownload */, "downloaded" /* Downloaded */, "ready" /* Ready */];

var DETAILED_STATES = [...ACTIONABLE_STATES, "checking for updates" /* CheckingForUpdates */, "downloading" /* Downloading */, "updating" /* Updating */, "overwriting" /* Overwriting */, "cancelling" /* Cancelling */];

var additionalMenuPlacement;

function registerUpdateTitleBarMenuPlacement(menuId, item = {}) {
  if (additionalMenuPlacement) {
    throw new Error("An additional update title bar menu placement is already registered");
  }
  additionalMenuPlacement = { menuId, item };
}

function getAdditionalUpdateTitleBarMenuWhen(when) {
  return ContextKeyExpr.and(UpdateTitleBarContext, when);
}

registerAction2(class UpdateIndicatorTitleBarAction extends Action2 {
  constructor() {
    super({
      id: UPDATE_TITLE_BAR_ACTION_ID,
      title: localize(21518, null),
      f1: false,
      menu: [{
        id: MenuId.TitleBarUpdate,
        order: 0,
        when: UpdateTitleBarEditorVisibleContext
      }]
    });
  }
  async run() {
  }
});

var UpdateTitleBarContribution = class extends Disposable {
  constructor(actionViewItemService, chatService, configurationService, contextKeyService, hostService, instantiationService, storageService, updateService) {
    super();
    this.configurationService = configurationService;
    this.hostService = hostService;
    this.storageService = storageService;
    this.tooltipVisible = false;
    this.tooltipFocused = false;
    if (isWeb) {
      return;
    }
    this.context = UpdateTitleBarContext.bindTo(contextKeyService);
    this.tooltip = this._register(instantiationService.createInstance(UpdateTooltip));
    const chatInProgressContext = UpdateTitleBarChatInProgressContext.bindTo(contextKeyService);
    this._register(autorun((reader) => {
      chatInProgressContext.set(chatService.requestInProgressObs.read(reader));
    }));
    this.state = updateService.state;
    this._register(updateService.onStateChange((state) => {
      this.state = state;
      this.onStateChange();
    }));
    this._register(this.configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration(UPDATE_TITLE_BAR_SETTING)) {
        this.onStateChange();
      }
    }));
    this._register(actionViewItemService.register(
      MenuId.TitleBarUpdate,
      UPDATE_TITLE_BAR_ACTION_ID,
      (action, options3) => this.createEntry(instantiationService, action, options3)
    ));
    if (additionalMenuPlacement) {
      const { menuId, item } = additionalMenuPlacement;
      MenuRegistry.appendMenuItem(menuId, {
        ...item,
        command: {
          id: UPDATE_TITLE_BAR_ACTION_ID,
          title: localize(21518, null)
        },
        when: getAdditionalUpdateTitleBarMenuWhen(item.when)
      });
      this._register(actionViewItemService.register(
        menuId,
        UPDATE_TITLE_BAR_ACTION_ID,
        (action, options3) => this.createEntry(instantiationService, action, options3)
      ));
    }
    void this.onStateChange(true);
  }
  createEntry(instantiationService, action, options3) {
    this.entry = instantiationService.createInstance(UpdateTitleBarEntry, action, options3, this.tooltip, (focus) => {
      this.tooltipVisible = true;
      this.tooltipFocused = focus;
    }, () => {
      this.tooltipVisible = false;
      this.tooltipFocused = false;
      if (!ACTIONABLE_STATES.includes(this.state.type) && !DETAILED_STATES.includes(this.state.type)) {
        this.context.set(false);
      }
    });
    if (this.tooltipVisible) {
      this.entry.showTooltip(this.tooltipFocused);
    }
    return this.entry;
  }
  async onStateChange(startup = false) {
    if (this.configurationService.getValue(UPDATE_TITLE_BAR_SETTING) === false) {
      this.tooltipVisible = false;
      this.tooltipFocused = false;
      this.context.set(false);
      return;
    }
    if (this.tooltipVisible || !await this.hostService.hadLastFocus()) {
      this.context.set(this.tooltipVisible || ACTIONABLE_STATES.includes(this.state.type));
      this.tooltip.renderState(this.state);
      return;
    }
    this.tooltip.renderState(this.state);
    let context2 = ACTIONABLE_STATES.includes(this.state.type);
    let showTooltip = false;
    switch (this.state.type) {
      case "disabled" /* Disabled */:
        if (startup) {
          const reason = this.state.reason;
          if (reason === 5 /* InvalidConfiguration */ || reason === 6 /* RunningAsAdmin */) {
            const lastShown = this.storageService.getNumber(DISABLED_REMINDER_LAST_SHOWN_KEY, -1 /* APPLICATION */);
            showTooltip = lastShown === void 0 || Date.now() - lastShown >= DISABLED_REMINDER_PERIOD;
          }
        }
        break;
      case "idle" /* Idle */:
        showTooltip = !!this.state.error;
        break;
      case "downloading" /* Downloading */:
      case "updating" /* Updating */:
      case "overwriting" /* Overwriting */:
        context2 = this.state.explicit;
        break;
      case "cancelling" /* Cancelling */:
        context2 = true;
        break;
      case "restarting" /* Restarting */:
        context2 = true;
        break;
    }
    if (showTooltip) {
      this.tooltipVisible = true;
      context2 = true;
    }
    this.context.set(context2);
    if (showTooltip) {
      this.entry?.showTooltip();
      if (this.state.type === "disabled" /* Disabled */) {
        this.storageService.store(DISABLED_REMINDER_LAST_SHOWN_KEY, Date.now(), -1 /* APPLICATION */, 1 /* MACHINE */);
      }
    }
  }
};

UpdateTitleBarContribution = __decorateClass([
  __decorateParam(0, IActionViewItemService),
  __decorateParam(1, IChatService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IHostService),
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, IStorageService),
  __decorateParam(7, IUpdateService)
], UpdateTitleBarContribution);

var UpdateTitleBarEntry = class extends BaseActionViewItem {
  constructor(action, options3, tooltip, onDidShowTooltip, onUserDismissedTooltip, commandService, hoverService, telemetryService, updateService) {
    super(void 0, action, options3);
    this.tooltip = tooltip;
    this.onDidShowTooltip = onDidShowTooltip;
    this.onUserDismissedTooltip = onUserDismissedTooltip;
    this.commandService = commandService;
    this.hoverService = hoverService;
    this.telemetryService = telemetryService;
    this.updateService = updateService;
    this.visibleTooltip = this._register(new MutableDisposable());
    this.action.run = () => this.runAction();
    this._register(this.updateService.onStateChange((state) => this.onStateChange(state)));
    this._register(this.commandService.onDidExecuteCommand((event) => {
      if (event.commandId === "workbench.action.showHover" && this.isFocused()) {
        this.focusTooltip();
      }
    }));
  }
  render(container2) {
    super.render(container2);
    this.content = append(container2, $(".update-indicator"));
    container2.setAttribute("role", "button");
    this.updateTooltip();
    this.onStateChange(this.updateService.state);
    if (this.tooltipFocusOnRender !== void 0) {
      const focus = this.tooltipFocusOnRender;
      this.tooltipFocusOnRender = void 0;
      scheduleAtNextAnimationFrame(getWindow(container2), () => this.showTooltip(focus));
    }
  }
  showTooltip(focus = false) {
    if (!this.element?.isConnected) {
      this.tooltipFocusOnRender = focus;
      return;
    }
    const hover = this.hoverService.showInstantHover({
      content: this.tooltip.domNode,
      target: {
        targetElements: [this.element],
        dispose: () => {
          if (!!this.element?.isConnected) {
            this.onUserDismissedTooltip();
          }
        }
      },
      persistence: { sticky: true },
      appearance: { showPointer: true, compact: true },
      position: { anchorAlignment: 1 /* RIGHT */ },
      trapFocus: focus
    }, focus);
    if (hover) {
      this.visibleTooltip.value = hover;
      this.onDidShowTooltip(focus);
    }
  }
  focusTooltip() {
    this.visibleTooltip.clear();
    this.showTooltip(true);
  }
  getHoverContents() {
    return this.tooltip.domNode;
  }
  getHoverOptions() {
    return { position: { anchorAlignment: 1 /* RIGHT */ } };
  }
  async runAction() {
    let commandId;
    switch (this.updateService.state.type) {
      case "available for download" /* AvailableForDownload */:
        commandId = "update.downloadNow";
        break;
      case "downloaded" /* Downloaded */:
        commandId = "update.install";
        break;
      case "ready" /* Ready */:
        commandId = "update.restart";
        break;
      default:
        this.showTooltip(true);
        return;
    }
    this.telemetryService.publicLog2("workbenchActionExecuted", { id: commandId, from: "titlebar" });
    await this.commandService.executeCommand(commandId);
  }
  onStateChange(state) {
    if (!this.content) {
      return;
    }
    clearNode(this.content);
    this.content.classList.remove("prominent", "progress-indefinite", "progress-percent", "update-disabled");
    this.content.style.removeProperty("--update-progress");
    const label3 = append(this.content, $(".indicator-label"));
    switch (state.type) {
      case "disabled" /* Disabled */:
        label3.textContent = localize(21517, null);
        this.content.classList.add("update-disabled");
        break;
      case "checking for updates" /* CheckingForUpdates */:
        label3.textContent = localize(21512, null);
        this.renderProgressState(this.content);
        break;
      case "overwriting" /* Overwriting */:
        label3.textContent = localize(21515, null);
        this.renderProgressState(this.content);
        break;
      case "available for download" /* AvailableForDownload */:
      case "downloaded" /* Downloaded */:
      case "ready" /* Ready */:
        label3.textContent = localize(21517, null);
        this.content.classList.add("prominent");
        break;
      case "downloading" /* Downloading */:
        label3.textContent = localize(21513, null);
        this.renderProgressState(this.content, computeProgressPercent(state.downloadedBytes, state.totalBytes));
        break;
      case "updating" /* Updating */:
        label3.textContent = localize(21514, null);
        this.renderProgressState(this.content, computeProgressPercent(state.currentProgress, state.maxProgress));
        break;
      case "restarting" /* Restarting */:
        label3.textContent = localize(21516, null);
        this.renderProgressState(this.content);
        break;
      case "cancelling" /* Cancelling */:
        label3.textContent = localize(21511, null);
        this.renderProgressState(this.content);
        break;
      default:
        label3.textContent = localize(21517, null);
        break;
    }
    this.element?.setAttribute("aria-label", label3.textContent);
  }
  renderProgressState(content, percentage) {
    if (percentage !== void 0) {
      content.classList.add("progress-percent");
      content.style.setProperty("--update-progress", `${percentage}%`);
    } else {
      content.classList.add("progress-indefinite");
    }
  }
};

UpdateTitleBarEntry = __decorateClass([
  __decorateParam(5, ICommandService),
  __decorateParam(6, IHoverService),
  __decorateParam(7, ITelemetryService),
  __decorateParam(8, IUpdateService)
], UpdateTitleBarEntry);
export { registerUpdateTitleBarMenuPlacement, getAdditionalUpdateTitleBarMenuWhen, UPDATE_TITLE_BAR_ACTION_ID, DISABLED_REMINDER_LAST_SHOWN_KEY, DISABLED_REMINDER_PERIOD, UPDATE_TITLE_BAR_SETTING, ACTIONABLE_STATES, DETAILED_STATES, additionalMenuPlacement, UpdateTitleBarContribution, UpdateTitleBarEntry };
