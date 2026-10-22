// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/debug/browser/debugActionViewItems.ts
import { BaseActionViewItem, SelectActionViewItem } from "./module-0476.mjs";
import { DisposableStore, dispose, toDisposable } from "./module-0012.mjs";
import { $, EventType, addDisposableListener, append, reset } from "./module-0075.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { debugStart } from "./module-1891.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { EventType2, Gesture } from "./module-0251.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { ActionWidgetDropdown } from "./module-2058.mjs";
import { localize } from "./module-0001.mjs";
import { asCssVariable } from "./module-0226.mjs";
import { selectBackground, selectBorder } from "./module-0233.mjs";
import { renderLabelWithIcons } from "./module-0467.mjs";
import { ADD_CONFIGURATION_ID } from "./module-2406.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IDebugService } from "./module-1057.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IContextViewService } from "./module-0488.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IActionWidgetService } from "./module-0553.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { defaultSelectBoxStyles } from "./module-0513.mjs";
import { hasNativeContextMenu } from "./module-0515.mjs";


// src/vs/workbench/contrib/debug/browser/debugActionViewItems.ts
var StartDebugActionViewItem = class extends BaseActionViewItem {
  constructor(context2, action, options3, debugService, configurationService, commandService, contextService, _contextViewService, keybindingService, hoverService, contextKeyService, actionWidgetService, telemetryService) {
    super(context2, action, options3);
    this.context = context2;
    this.debugService = debugService;
    this.configurationService = configurationService;
    this.commandService = commandService;
    this.contextService = contextService;
    this.keybindingService = keybindingService;
    this.hoverService = hoverService;
    this.contextKeyService = contextKeyService;
    this.actionWidgetService = actionWidgetService;
    this.telemetryService = telemetryService;
    this.debugOptions = [];
    this.selected = 0;
    this.providers = [];
    this.optionCategories = [];
    this.toDispose = [];
    this.registerListeners();
  }
  registerListeners() {
    this.toDispose.push(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("launch")) {
        this.updateOptions();
      }
    }));
    this.toDispose.push(this.debugService.getConfigurationManager().onDidSelectConfiguration(() => {
      this.updateOptions();
    }));
  }
  render(container3) {
    this.container = container3;
    container3.classList.add("start-debug-action-item");
    let titleElement = null;
    let isDisposed = false;
    this.toDispose.push(toDisposable(() => {
      isDisposed = true;
      titleElement?.classList.remove("has-start-debug-action-item");
    }));
    queueMicrotask(() => {
      if (!isDisposed) {
        titleElement = container3.closest(".part > .title");
        titleElement?.classList.add("has-start-debug-action-item");
      }
    });
    this.start = append(container3, $(ThemeIcon.asCSSSelector(debugStart)));
    const title = this.keybindingService.appendKeybinding(this.action.label, this.action.id);
    this.toDispose.push(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), this.start, title));
    this.start.setAttribute("role", "button");
    this._setAriaLabel(title);
    this._register(Gesture.addTarget(this.start));
    for (const event of [EventType.CLICK, EventType2.Tap]) {
      this.toDispose.push(addDisposableListener(this.start, event, () => {
        this.start.blur();
        if (this.debugService.state !== 1 /* Initializing */) {
          this.actionRunner.run(this.action, this.context);
        }
      }));
    }
    this.toDispose.push(addDisposableListener(this.start, EventType.MOUSE_DOWN, (e) => {
      if (this.action.enabled && e.button === 0) {
        this.start.classList.add("active");
      }
    }));
    this.toDispose.push(addDisposableListener(this.start, EventType.MOUSE_UP, () => {
      this.start.classList.remove("active");
    }));
    this.toDispose.push(addDisposableListener(this.start, EventType.MOUSE_OUT, () => {
      this.start.classList.remove("active");
    }));
    this.toDispose.push(addDisposableListener(this.start, EventType.KEY_DOWN, (e) => {
      const event = new StandardKeyboardEvent(e);
      if (event.equals(17 /* RightArrow */)) {
        this.start.tabIndex = -1;
        this.dropdownLabel?.focus();
        event.stopPropagation();
      }
    }));
    this.configurationContainer = append(container3, $(".configuration"));
    this.dropdown = new ActionWidgetDropdown(this.configurationContainer, {
      label: localize(14356, null),
      labelRenderer: (el) => {
        this.dropdownLabel = el;
        el.classList.add("start-debug-action-item-dropdown-label");
        el.tabIndex = -1;
        el.setAttribute("role", "button");
        el.setAttribute("aria-haspopup", "true");
        el.setAttribute("aria-expanded", "false");
        this.renderDropdownLabel();
        return null;
      },
      actionProvider: { getActions: () => this.getDropdownActions() },
      listOptions: {
        showFilter: true,
        filterPlaceholder: localize(14357, null),
        focusFilterOnOpen: true
      }
    }, this.actionWidgetService, this.keybindingService, this.telemetryService);
    this.toDispose.push(this.dropdown);
    this.toDispose.push(this.dropdown.onDidChangeVisibility((visible) => {
      this.dropdownLabel?.setAttribute("aria-expanded", String(visible));
    }));
    this.toDispose.push(addDisposableListener(this.configurationContainer, EventType.KEY_DOWN, (e) => {
      const event = new StandardKeyboardEvent(e);
      if (event.equals(15 /* LeftArrow */)) {
        if (this.dropdownLabel) {
          this.dropdownLabel.tabIndex = -1;
        }
        this.start.tabIndex = 0;
        this.start.focus();
        event.stopPropagation();
        event.preventDefault();
      }
    }));
    this.container.style.border = `1px solid ${asCssVariable(selectBorder)}`;
    this.configurationContainer.style.borderLeft = `1px solid ${asCssVariable(selectBorder)}`;
    this.container.style.backgroundColor = asCssVariable(selectBackground);
    const configManager = this.debugService.getConfigurationManager();
    const updateDynamicConfigs = () => configManager.getDynamicProviders().then((providers2) => {
      if (providers2.length !== this.providers.length) {
        this.providers = providers2;
        this.updateOptions();
      }
    });
    this.toDispose.push(configManager.onDidChangeConfigurationProviders(updateDynamicConfigs));
    updateDynamicConfigs();
    this.updateOptions();
  }
  setActionContext(context2) {
    this.context = context2;
  }
  isEnabled() {
    return true;
  }
  focus(fromRight) {
    if (fromRight) {
      if (this.dropdownLabel) {
        this.dropdownLabel.tabIndex = 0;
        this.dropdownLabel.focus();
      }
    } else {
      this.start.tabIndex = 0;
      this.start.focus();
    }
  }
  blur() {
    this.start.tabIndex = -1;
    if (this.dropdownLabel) {
      this.dropdownLabel.tabIndex = -1;
      this.dropdownLabel.blur();
    }
    this.container.blur();
  }
  setFocusable(focusable) {
    if (focusable) {
      this.start.tabIndex = 0;
    } else {
      this.start.tabIndex = -1;
      if (this.dropdownLabel) {
        this.dropdownLabel.tabIndex = -1;
      }
    }
  }
  dispose() {
    this.toDispose = dispose(this.toDispose);
    super.dispose();
  }
  renderDropdownLabel() {
    if (!this.dropdownLabel) {
      return;
    }
    const currentLabel = this.debugOptions[this.selected]?.label ?? localize(14360, null);
    const labelSpan = $("span.start-debug-action-item-label", void 0, currentLabel);
    const chevron = renderLabelWithIcons("$(chevron-down)");
    reset(this.dropdownLabel, labelSpan, ...chevron);
    this.dropdownLabel.title = currentLabel;
    this.dropdownLabel.setAttribute("aria-label", localize(14358, null, currentLabel));
  }
  getDropdownActions() {
    const actions = [];
    for (let i2 = 0; i2 < this.debugOptions.length; i2++) {
      const option2 = this.debugOptions[i2];
      const category11 = this.optionCategories[i2];
      actions.push({
        id: `debug.config.${i2}`,
        label: option2.label,
        tooltip: option2.label,
        class: void 0,
        enabled: true,
        checked: i2 === this.selected,
        category: category11,
        run: async () => {
          await option2.handler();
        }
      });
    }
    return actions;
  }
  updateOptions() {
    this.selected = 0;
    this.debugOptions = [];
    this.optionCategories = [];
    const manager = this.debugService.getConfigurationManager();
    const inWorkspace = this.contextService.getWorkbenchState() === 3 /* WORKSPACE */;
    let lastGroup;
    let groupOrder = 0;
    const pushOption = (option2, category11) => {
      this.debugOptions.push(option2);
      this.optionCategories.push(category11);
    };
    manager.getAllConfigurations().forEach(({ launch, name, presentation: presentation2 }) => {
      if (lastGroup !== presentation2?.group) {
        lastGroup = presentation2?.group;
        if (this.debugOptions.length) {
          groupOrder++;
        }
      }
      if (name === manager.selectedConfiguration.name && launch === manager.selectedConfiguration.launch) {
        this.selected = this.debugOptions.length;
      }
      const label3 = inWorkspace ? `${name} (${launch.name})` : name;
      pushOption({
        label: label3,
        handler: async () => {
          await manager.selectConfiguration(launch, name);
          return true;
        }
      }, { label: `configurations-${groupOrder}`, order: groupOrder });
    });
    manager.getRecentDynamicConfigurations().slice(0, 3).forEach(({ name, type }) => {
      if (type === manager.selectedConfiguration.type && manager.selectedConfiguration.name === name) {
        this.selected = this.debugOptions.length;
      }
      pushOption({
        label: name,
        handler: async () => {
          await manager.selectConfiguration(void 0, name, void 0, { type });
          return true;
        }
      }, { label: "recent-dynamic", order: 100 });
    });
    if (this.debugOptions.length === 0) {
      pushOption({ label: localize(14360, null), handler: async () => false }, void 0);
    }
    this.providers.forEach((p) => {
      pushOption({
        label: `${p.label}...`,
        handler: async () => {
          const picked = await p.pick();
          if (picked) {
            await manager.selectConfiguration(picked.launch, picked.config.name, picked.config, { type: p.type });
            return true;
          }
          return false;
        }
      }, { label: "actions", order: 200 });
    });
    manager.getLaunches().filter((l) => !l.hidden).forEach((l) => {
      const label3 = inWorkspace ? localize(14352, null, l.name) : localize(14353, null);
      pushOption({
        label: label3,
        handler: async () => {
          await this.commandService.executeCommand(ADD_CONFIGURATION_ID, l.uri.toString());
          return false;
        }
      }, { label: "actions", order: 200 });
    });
    this.renderDropdownLabel();
  }
  _setAriaLabel(title) {
    let ariaLabel = title;
    let keybinding;
    const verbose = this.configurationService.getValue("accessibility.verbosity.debug" /* Debug */);
    if (verbose) {
      keybinding = this.keybindingService.lookupKeybinding("editor.action.accessibilityHelp" /* OpenAccessibilityHelp */, this.contextKeyService)?.getLabel() ?? void 0;
    }
    if (keybinding) {
      ariaLabel = localize(14354, null, ariaLabel, keybinding);
    } else {
      ariaLabel = localize(14355, null, ariaLabel);
    }
    this.start.ariaLabel = ariaLabel;
  }
};

StartDebugActionViewItem = __decorateClass([
  __decorateParam(3, IDebugService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, ICommandService),
  __decorateParam(6, IWorkspaceContextService),
  __decorateParam(7, IContextViewService),
  __decorateParam(8, IKeybindingService),
  __decorateParam(9, IHoverService),
  __decorateParam(10, IContextKeyService),
  __decorateParam(11, IActionWidgetService),
  __decorateParam(12, ITelemetryService)
], StartDebugActionViewItem);

var FocusSessionActionViewItem = class extends SelectActionViewItem {
  constructor(action, session, debugService, contextViewService, configurationService) {
    super(null, action, [], -1, contextViewService, defaultSelectBoxStyles, { ariaLabel: localize(14359, null), useCustomDrawn: !hasNativeContextMenu(configurationService) });
    this.debugService = debugService;
    this.configurationService = configurationService;
    this._register(this.debugService.getViewModel().onDidFocusSession(() => {
      const session2 = this.getSelectedSession();
      if (session2) {
        const index2 = this.getSessions().indexOf(session2);
        this.select(index2);
      }
    }));
    const sessionListenersStore = this._register(new DisposableStore());
    const registerSessionListeners = (session2) => {
      const sessionListeners = sessionListenersStore.add(new DisposableStore());
      sessionListeners.add(session2.onDidChangeName(() => this.update()));
      sessionListeners.add(session2.onDidEndAdapter(() => sessionListenersStore.delete(sessionListeners)));
    };
    this._register(this.debugService.onDidNewSession((session2) => {
      registerSessionListeners(session2);
      this.update();
    }));
    this.getSessions().forEach(registerSessionListeners);
    this._register(this.debugService.onDidEndSession(() => this.update()));
    const selectedSession = session ? this.mapFocusedSessionToSelected(session) : void 0;
    this.update(selectedSession);
  }
  getActionContext(_, index2) {
    return this.getSessions()[index2];
  }
  update(session) {
    if (!session) {
      session = this.getSelectedSession();
    }
    const sessions = this.getSessions();
    const names = sessions.map((s) => {
      const label3 = s.getLabel();
      if (s.parentSession) {
        return `\xA0\xA0${label3}`;
      }
      return label3;
    });
    this.setOptions(names.map((data) => ({ text: data })), session ? sessions.indexOf(session) : void 0);
  }
  getSelectedSession() {
    const session = this.debugService.getViewModel().focusedSession;
    return session ? this.mapFocusedSessionToSelected(session) : void 0;
  }
  getSessions() {
    const showSubSessions = this.configurationService.getValue("debug").showSubSessionsInToolBar;
    const sessions = this.debugService.getModel().getSessions();
    return showSubSessions ? sessions : sessions.filter((s) => !s.parentSession);
  }
  mapFocusedSessionToSelected(focusedSession) {
    const showSubSessions = this.configurationService.getValue("debug").showSubSessionsInToolBar;
    while (focusedSession.parentSession && !showSubSessions) {
      focusedSession = focusedSession.parentSession;
    }
    return focusedSession;
  }
};

FocusSessionActionViewItem = __decorateClass([
  __decorateParam(2, IDebugService),
  __decorateParam(3, IContextViewService),
  __decorateParam(4, IConfigurationService)
], FocusSessionActionViewItem);
export { StartDebugActionViewItem, FocusSessionActionViewItem };
