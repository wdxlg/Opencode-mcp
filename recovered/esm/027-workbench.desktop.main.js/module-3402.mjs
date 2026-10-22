// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/inlineHint/browser/terminal.initialHint.contribution.ts
import { $, EventType, addDisposableListener, getActiveWindow } from "./module-0075.mjs";
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { hasKey } from "./module-0010.mjs";
import { TerminalInstance } from "./module-3291.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatAgentService } from "./module-0974.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ITerminalConfigurationService } from "./module-1149.mjs";
import { registerTerminalContribution } from "./module-2354.mjs";
import { status } from "./module-0076.mjs";
import { localize } from "./module-0001.mjs";
import { renderFormattedText } from "./module-0597.mjs";
import { KeybindingLabel } from "./module-0547.mjs";
import { OS } from "./module-0014.mjs";
import { StandardMouseEvent } from "./module-0024.mjs";
import { IChatEntitlementService } from "./module-0953.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { ITelemetryService } from "./module-0093.mjs";


// src/vs/workbench/contrib/terminalContrib/inlineHint/browser/terminal.initialHint.contribution.ts
var $107 = $;

var InitialHintAddon = class extends Disposable {
  constructor(_capabilities, _onDidChangeAgents) {
    super();
    this._capabilities = _capabilities;
    this._onDidChangeAgents = _onDidChangeAgents;
    this._onDidRequestCreateHint = this._register(new Emitter());
    this._disposables = this._register(new MutableDisposable());
  }
  get onDidRequestCreateHint() {
    return this._onDidRequestCreateHint.event;
  }
  activate(terminal2) {
    const store = this._register(new DisposableStore());
    this._disposables.value = store;
    const capability = this._capabilities.get(2 /* CommandDetection */);
    if (capability) {
      store.add(Event2.once(capability.promptInputModel.onDidStartInput)(() => this._onDidRequestCreateHint.fire()));
    } else {
      this._register(this._capabilities.onDidAddCapability((e) => {
        if (e.id === 2 /* CommandDetection */) {
          const capability2 = e.capability;
          store.add(Event2.once(capability2.promptInputModel.onDidStartInput)(() => this._onDidRequestCreateHint.fire()));
          if (!capability2.promptInputModel.value) {
            this._onDidRequestCreateHint.fire();
          }
        }
      }));
    }
    const agentListener = this._onDidChangeAgents((e) => {
      if (e?.locations.includes("terminal" /* Terminal */)) {
        this._onDidRequestCreateHint.fire();
        agentListener.dispose();
      }
    });
    this._disposables.value?.add(agentListener);
  }
};

var TerminalInitialHintContribution = class extends Disposable {
  constructor(_ctx, _chatAgentService, _configurationService, _instantiationService, _terminalConfigurationService) {
    super();
    this._ctx = _ctx;
    this._chatAgentService = _chatAgentService;
    this._configurationService = _configurationService;
    this._instantiationService = _instantiationService;
    this._terminalConfigurationService = _terminalConfigurationService;
    this._decoration = this._register(new MutableDisposable());
    this._cursorMoveListener = this._register(new MutableDisposable());
  }
  static {
    this.ID = "terminal.initialHint";
  }
  static get(instance2) {
    return instance2.getContribution(TerminalInitialHintContribution.ID);
  }
  xtermOpen(xterm) {
    if (hasKey(this._ctx.instance, { shellLaunchConfig: true }) && (this._ctx.instance.shellLaunchConfig.isExtensionOwnedTerminal || this._ctx.instance.shellLaunchConfig.isFeatureTerminal || this._ctx.instance.shellLaunchConfig.hideFromUser)) {
      return;
    }
    if (!this._configurationService.getValue("terminal.integrated.initialHint" /* Enabled */)) {
      return;
    }
    if (this._terminalConfigurationService.config.sendKeybindingsToShell) {
      return;
    }
    this._xterm = xterm;
    this._addon = this._register(this._instantiationService.createInstance(InitialHintAddon, this._ctx.instance.capabilities, this._chatAgentService.onDidChangeAgents));
    this._xterm.raw.loadAddon(this._addon);
    this._register(this._addon.onDidRequestCreateHint(() => this._createHint()));
  }
  _disposeHint() {
    this._hintWidget?.remove();
    this._hintWidget = void 0;
    this._decoration.clear();
  }
  _createHint() {
    const instance2 = this._ctx.instance instanceof TerminalInstance ? this._ctx.instance : void 0;
    const commandDetectionCapability = instance2?.capabilities.get(2 /* CommandDetection */);
    if (!instance2 || !this._xterm || this._hintWidget || !commandDetectionCapability || commandDetectionCapability.promptInputModel.value || !!instance2.shellLaunchConfig.attachPersistentProcess || commandDetectionCapability.commands.length > 0) {
      return;
    }
    if (!this._configurationService.getValue("terminal.integrated.initialHint" /* Enabled */)) {
      return;
    }
    if (!this._decoration.value) {
      const marker = this._xterm.raw.registerMarker();
      if (!marker) {
        return;
      }
      if (this._xterm.raw.buffer.active.cursorX === 0) {
        return;
      }
      this._register(marker);
      this._decoration.value = this._xterm.raw.registerDecoration({
        marker,
        x: this._xterm.raw.buffer.active.cursorX + 1
      });
    }
    this._register(this._xterm.raw.onKey(() => this.dispose()));
    this._register(this._configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("terminal.integrated.initialHint" /* Enabled */) && !this._configurationService.getValue("terminal.integrated.initialHint" /* Enabled */)) {
        this.dispose();
      }
    }));
    const inputModel = commandDetectionCapability.promptInputModel;
    if (inputModel) {
      this._register(inputModel.onDidChangeInput(() => {
        if (inputModel.value) {
          this.dispose();
        }
      }));
    }
    this._cursorMoveListener.value = this._xterm.raw.onCursorMove(() => {
      if (!inputModel?.value) {
        this._disposeHint();
        this._createHint();
      }
    });
    if (!this._decoration.value) {
      return;
    }
    this._register(this._decoration.value.onRender((e) => {
      if (!this._hintWidget && this._xterm?.isFocused) {
        const widget = this._register(this._instantiationService.createInstance(TerminalInitialHintWidget, instance2));
        this._addon?.dispose();
        this._hintWidget = widget.getDomNode();
        if (!this._hintWidget) {
          return;
        }
        e.appendChild(this._hintWidget);
        e.classList.add("terminal-initial-hint");
        const font = this._xterm.getFont();
        if (font) {
          e.style.fontFamily = font.fontFamily;
          e.style.fontSize = font.fontSize + "px";
        }
      }
      if (this._hintWidget && this._xterm) {
        const decoration3 = this._hintWidget.parentElement;
        if (decoration3) {
          decoration3.style.width = (this._xterm.raw.cols - this._xterm.raw.buffer.active.cursorX) / this._xterm.raw.cols * 100 + "%";
        }
      }
    }));
  }
};

TerminalInitialHintContribution = __decorateClass([
  __decorateParam(1, IChatAgentService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, ITerminalConfigurationService)
], TerminalInitialHintContribution);

registerTerminalContribution(TerminalInitialHintContribution.ID, TerminalInitialHintContribution, false);

var TerminalInitialHintWidget = class extends Disposable {
  constructor(_instance, _chatEntitlementService, _commandService, _configurationService, _contextMenuService, _keybindingService, _telemetryService) {
    super();
    this._instance = _instance;
    this._chatEntitlementService = _chatEntitlementService;
    this._commandService = _commandService;
    this._configurationService = _configurationService;
    this._contextMenuService = _contextMenuService;
    this._keybindingService = _keybindingService;
    this._telemetryService = _telemetryService;
    this._toDispose = this._register(new DisposableStore());
    this._isVisible = false;
    this._ariaLabel = "";
    this._toDispose.add(_instance.onDidFocus(() => {
      if (this._instance.hasFocus && this._isVisible && this._ariaLabel && this._configurationService.getValue("accessibility.verbosity.terminalChat" /* TerminalInlineChat */)) {
        status(this._ariaLabel);
      }
    }));
    this._toDispose.add(this._configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("terminal.integrated.initialHint" /* Enabled */) && !this._configurationService.getValue("terminal.integrated.initialHint" /* Enabled */)) {
        this.dispose();
      }
    }));
  }
  /**
   * Creates wrapped hint elements with click listeners for responsive hint layouts.
   * Returns a before link and an after prose span containing a link.
   */
  _createWrappedHintElements(text2, keybindingLabel2, clickHandler) {
    const [beforeText, afterText] = text2.split(keybindingLabel2);
    const before = $107("a", void 0, beforeText);
    this._toDispose.add(addDisposableListener(before, EventType.CLICK, clickHandler));
    const after2 = $107("span.terminal-initial-hint-prose", void 0);
    const afterLink = $107("a", void 0, afterText);
    this._toDispose.add(addDisposableListener(afterLink, EventType.CLICK, clickHandler));
    after2.appendChild(afterLink);
    return { before, after: after2 };
  }
  _getHintContent() {
    const ariaLabelParts = [];
    const handleDontShowClick = () => {
      this._configurationService.updateValue("terminal.integrated.initialHint" /* Enabled */, false);
    };
    const dontShowHintHandler = {
      disposables: this._toDispose,
      callback: (index2, _event) => {
        switch (index2) {
          case "0":
            handleDontShowClick();
            break;
        }
      }
    };
    const hintElement = $107("div.terminal-initial-hint");
    hintElement.style.display = "block";
    const aiFeaturesHidden = this._chatEntitlementService.sentiment.hidden;
    if (!aiFeaturesHidden) {
      const handleCopilotCliClick = () => {
        this._telemetryService.publicLog2("workbenchActionExecuted", {
          id: "terminalCopilotCli.hintAction",
          from: "hint"
        });
        this._instance.sendText("copilot", false);
      };
      const copilotCliHint = localize(20769, null);
      const copilotCliHintHandler = {
        callback: () => handleCopilotCliClick(),
        disposables: this._toDispose
      };
      hintElement.appendChild(renderFormattedText(copilotCliHint, { actionHandler: copilotCliHintHandler }));
      ariaLabelParts.push(localize(20770, null));
    }
    const suggestEnabled = aiFeaturesHidden && this._configurationService.getValue("terminal.integrated.suggest.enabled" /* Enabled */);
    const suggestKeybinding = suggestEnabled ? this._keybindingService.lookupKeybinding("workbench.action.terminal.triggerSuggest" /* TriggerSuggest */) : void 0;
    const suggestKeybindingLabel = suggestKeybinding?.getLabel();
    if (suggestKeybinding && suggestKeybindingLabel) {
      const suggestActionPart = localize(20777, null, suggestKeybindingLabel);
      const handleSuggestClick = () => {
        this._commandService.executeCommand("workbench.action.terminal.triggerSuggest" /* TriggerSuggest */);
      };
      const { before: suggestBefore, after: suggestAfter } = this._createWrappedHintElements(suggestActionPart, suggestKeybindingLabel, handleSuggestClick);
      hintElement.appendChild(suggestBefore);
      const suggestLabel = this._toDispose.add(new KeybindingLabel(hintElement, OS));
      suggestLabel.set(suggestKeybinding);
      suggestLabel.element.style.width = "min-content";
      suggestLabel.element.style.display = "inline";
      suggestLabel.element.style.cursor = "pointer";
      this._toDispose.add(addDisposableListener(suggestLabel.element, EventType.CLICK, handleSuggestClick));
      hintElement.appendChild(suggestAfter);
      hintElement.appendChild($107("span.terminal-initial-hint-separator"));
      ariaLabelParts.push(suggestActionPart);
    }
    if (ariaLabelParts.length === 0) {
      return void 0;
    }
    const typeToDismiss = localize(20773, null);
    const typeToDismissRendered = renderFormattedText(typeToDismiss, { actionHandler: dontShowHintHandler });
    typeToDismissRendered.classList.add("detail", "terminal-initial-hint-prose");
    const proseBefore = $107("span.terminal-initial-hint-prose", void 0, localize(20776, null));
    hintElement.appendChild(proseBefore);
    hintElement.appendChild(typeToDismissRendered);
    const typeToDismissCompact = localize(20775, null);
    const typeToDismissCompactRendered = renderFormattedText(typeToDismissCompact, { actionHandler: dontShowHintHandler });
    typeToDismissCompactRendered.classList.add("detail", "terminal-initial-hint-compact");
    hintElement.appendChild(typeToDismissCompactRendered);
    ariaLabelParts.push(localize(20774, null));
    return { ariaLabel: ariaLabelParts.join(" "), hintElement };
  }
  getDomNode() {
    if (!this._domNode) {
      const result = this._getHintContent();
      if (!result) {
        return void 0;
      }
      const { hintElement, ariaLabel } = result;
      this._domNode = $107(".terminal-initial-hint");
      this._domNode.style.paddingLeft = "4px";
      this._domNode.append(hintElement);
      this._ariaLabel = ariaLabel.concat(localize(20771, null, "accessibility.verbosity.terminalChat" /* TerminalInlineChat */));
      this._toDispose.add(addDisposableListener(this._domNode, "click", () => {
        this._domNode?.remove();
        this._domNode = void 0;
      }));
      this._toDispose.add(addDisposableListener(this._domNode, EventType.CONTEXT_MENU, (e) => {
        this._contextMenuService.showContextMenu({
          getAnchor: () => {
            return new StandardMouseEvent(getActiveWindow(), e);
          },
          getActions: () => {
            return [
              {
                id: "workench.action.disableTerminalInitialHint",
                label: localize(20772, null),
                tooltip: localize(20772, null),
                enabled: true,
                class: void 0,
                run: () => this._configurationService.updateValue("terminal.integrated.initialHint" /* Enabled */, false)
              }
            ];
          }
        });
      }));
    }
    return this._domNode;
  }
  dispose() {
    this._domNode?.remove();
    super.dispose();
  }
};

TerminalInitialHintWidget = __decorateClass([
  __decorateParam(1, IChatEntitlementService),
  __decorateParam(2, ICommandService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IContextMenuService),
  __decorateParam(5, IKeybindingService),
  __decorateParam(6, ITelemetryService)
], TerminalInitialHintWidget);
export { $107, InitialHintAddon, TerminalInitialHintContribution, TerminalInitialHintWidget };
