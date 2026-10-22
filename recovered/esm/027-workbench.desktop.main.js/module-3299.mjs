// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminal/browser/terminalTabsChatEntry.ts
import { Disposable } from "./module-0012.mjs";
import { $, EventType, addDisposableListener, append } from "./module-0075.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ICommandService } from "./module-0087.mjs";
import { ITerminalChatService, ITerminalService } from "./module-1149.mjs";
import { ITelemetryService } from "./module-0093.mjs";


// src/vs/workbench/contrib/terminal/browser/terminalTabsChatEntry.ts
var TerminalTabsChatEntry = class extends Disposable {
  constructor(container3, _tabContainer, _commandService, _terminalChatService, _terminalService, _telemetryService) {
    super();
    this._tabContainer = _tabContainer;
    this._commandService = _commandService;
    this._terminalChatService = _terminalChatService;
    this._terminalService = _terminalService;
    this._telemetryService = _telemetryService;
    this._entry = append(container3, $(".terminal-tabs-chat-entry"));
    this._entry.tabIndex = 0;
    this._entry.setAttribute("role", "button");
    const entry = append(this._entry, $(".terminal-tabs-entry"));
    const icon2 = append(entry, $(".terminal-tabs-chat-entry-icon"));
    icon2.classList.add(...ThemeIcon.asClassNameArray(Codicon.commentDiscussionSparkle));
    this._label = append(entry, $(".terminal-tabs-chat-entry-label"));
    this._deleteButton = append(entry, $(".terminal-tabs-chat-entry-delete"));
    this._deleteButton.classList.add(...ThemeIcon.asClassNameArray(Codicon.trashcan));
    this._deleteButton.tabIndex = 0;
    this._deleteButton.setAttribute("role", "button");
    this._deleteButton.setAttribute("aria-label", localize(20081, null));
    this._deleteButton.setAttribute("title", localize(20082, null));
    const runChatTerminalsCommand = () => {
      void this._commandService.executeCommand("workbench.action.terminal.chat.viewHiddenChatTerminals");
    };
    this._register(addDisposableListener(this._entry, EventType.CLICK, (e) => {
      if (e.target === this._deleteButton || this._deleteButton.contains(e.target)) {
        return;
      }
      e.preventDefault();
      runChatTerminalsCommand();
    }));
    this._register(addDisposableListener(this._entry, EventType.KEY_DOWN, (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        runChatTerminalsCommand();
      }
    }));
    this._register(addDisposableListener(this._deleteButton, EventType.CLICK, async (e) => {
      e.preventDefault();
      e.stopPropagation();
      await this._deleteAllHiddenTerminals();
    }));
    this._register(addDisposableListener(this._deleteButton, EventType.KEY_DOWN, async (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        e.stopPropagation();
        await this._deleteAllHiddenTerminals();
      }
    }));
    this.update();
  }
  dispose() {
    this._entry.remove();
    this._label.remove();
    this._deleteButton.remove();
    super.dispose();
  }
  async _deleteAllHiddenTerminals() {
    const hiddenTerminals = this._terminalChatService.getToolSessionTerminalInstances(true);
    if (hiddenTerminals.length === 0) {
      return;
    }
    this._telemetryService.publicLog2("terminal.chatDeleteHiddenTerminals", {
      count: hiddenTerminals.length
    });
    await Promise.all(hiddenTerminals.map((terminal2) => this._terminalService.safeDisposeTerminal(terminal2)));
  }
  get element() {
    return this._entry;
  }
  update() {
    const hiddenChatTerminalCount = this._terminalChatService.getToolSessionTerminalInstances(true).length;
    if (hiddenChatTerminalCount <= 0) {
      this._entry.style.display = "none";
      this._label.textContent = "";
      this._entry.removeAttribute("aria-label");
      this._entry.removeAttribute("title");
      return;
    }
    this._entry.style.display = "";
    const tooltip = localize(20085, null);
    this._entry.setAttribute("title", tooltip);
    const hasText = this._tabContainer.classList.contains("has-text");
    if (hasText) {
      this._label.textContent = hiddenChatTerminalCount === 1 ? localize(20084, null, hiddenChatTerminalCount) : localize(20083, null, hiddenChatTerminalCount);
    } else {
      this._label.textContent = `${hiddenChatTerminalCount}`;
    }
    const ariaLabel = hiddenChatTerminalCount === 1 ? localize(20080, null) : localize(20079, null, hiddenChatTerminalCount);
    this._entry.setAttribute("aria-label", ariaLabel);
  }
};

TerminalTabsChatEntry = __decorateClass([
  __decorateParam(2, ICommandService),
  __decorateParam(3, ITerminalChatService),
  __decorateParam(4, ITerminalService),
  __decorateParam(5, ITelemetryService)
], TerminalTabsChatEntry);
export { TerminalTabsChatEntry };
