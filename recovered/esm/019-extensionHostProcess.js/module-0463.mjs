// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/api/common/extHostStatusBar.ts
import { DisposableStore } from "./module-0011.mjs";
import { Disposable3, ThemeColor2, asStatusBarItemIdentifier } from "./module-0244.mjs";
import { isNumber } from "./module-0009.mjs";
import { checkProposedApiEnabled } from "./module-0173.mjs";
import { localize } from "./module-0013.mjs";
import { MarkdownString3 } from "./module-0245.mjs";
import { MainContext } from "./module-0054.mjs";


// src/vs/workbench/api/common/extHostStatusBar.ts
var ExtHostStatusBarEntry = class _ExtHostStatusBarEntry {
  constructor(proxy, commands, staticItems, extension, id2, alignment = 1 /* Left */, priority, _onDispose) {
    this._onDispose = _onDispose;
    this._disposed = false;
    this._text = "";
    this._staleCommandRegistrations = new DisposableStore();
    this.#proxy = proxy;
    this.#commands = commands;
    if (id2 && extension) {
      this._entryId = asStatusBarItemIdentifier(extension.identifier, id2);
      const item = staticItems.get(this._entryId);
      if (item) {
        alignment = item.alignLeft ? 1 /* Left */ : 2 /* Right */;
        priority = item.priority;
        this._visible = true;
        this.name = item.name;
        this.text = item.text;
        this.tooltip = item.tooltip;
        this.command = item.command;
        this.accessibilityInformation = item.accessibilityInformation;
      }
    } else {
      this._entryId = String(_ExtHostStatusBarEntry.ID_GEN++);
    }
    this._extension = extension;
    this._id = id2;
    this._alignment = alignment;
    this._priority = this.validatePriority(priority);
  }
  static {
    this.ID_GEN = 0;
  }
  static {
    this.ALLOWED_BACKGROUND_COLORS = /* @__PURE__ */ new Map(
      [
        ["statusBarItem.errorBackground", new ThemeColor2("statusBarItem.errorForeground")],
        ["statusBarItem.warningBackground", new ThemeColor2("statusBarItem.warningForeground")]
      ]
    );
  }
  #proxy;
  #commands;
  validatePriority(priority) {
    if (!isNumber(priority)) {
      return void 0;
    }
    if (priority === Number.POSITIVE_INFINITY) {
      return Number.MAX_VALUE;
    }
    if (priority === Number.NEGATIVE_INFINITY) {
      return -Number.MAX_VALUE;
    }
    return priority;
  }
  get id() {
    return this._id ?? this._extension.identifier.value;
  }
  get entryId() {
    return this._entryId;
  }
  get alignment() {
    return this._alignment;
  }
  get priority() {
    return this._priority;
  }
  get text() {
    return this._text;
  }
  get name() {
    return this._name;
  }
  get tooltip() {
    return this._tooltip;
  }
  get tooltip2() {
    if (this._extension) {
      checkProposedApiEnabled(this._extension, "statusBarItemTooltip");
    }
    return this._tooltip2;
  }
  get color() {
    return this._color;
  }
  get backgroundColor() {
    return this._backgroundColor;
  }
  get command() {
    return this._command?.fromApi;
  }
  get accessibilityInformation() {
    return this._accessibilityInformation;
  }
  set text(text) {
    this._text = text;
    this.update();
  }
  set name(name) {
    this._name = name;
    this.update();
  }
  set tooltip(tooltip) {
    this._tooltip = tooltip;
    this.update();
  }
  set tooltip2(tooltip) {
    if (this._extension) {
      checkProposedApiEnabled(this._extension, "statusBarItemTooltip");
    }
    this._tooltip2 = tooltip;
    this.update();
  }
  set color(color2) {
    this._color = color2;
    this.update();
  }
  set backgroundColor(color2) {
    if (color2 && !_ExtHostStatusBarEntry.ALLOWED_BACKGROUND_COLORS.has(color2.id)) {
      color2 = void 0;
    }
    this._backgroundColor = color2;
    this.update();
  }
  set command(command) {
    if (this._command?.fromApi === command) {
      return;
    }
    if (this._latestCommandRegistration) {
      this._staleCommandRegistrations.add(this._latestCommandRegistration);
    }
    this._latestCommandRegistration = new DisposableStore();
    if (typeof command === "string") {
      this._command = {
        fromApi: command,
        internal: this.#commands.toInternal({ title: "", command }, this._latestCommandRegistration)
      };
    } else if (command) {
      this._command = {
        fromApi: command,
        internal: this.#commands.toInternal(command, this._latestCommandRegistration)
      };
    } else {
      this._command = void 0;
    }
    this.update();
  }
  set accessibilityInformation(accessibilityInformation) {
    this._accessibilityInformation = accessibilityInformation;
    this.update();
  }
  show() {
    this._visible = true;
    this.update();
  }
  hide() {
    clearTimeout(this._timeoutHandle);
    this._visible = false;
    this.#proxy.$disposeEntry(this._entryId);
  }
  update() {
    if (this._disposed || !this._visible) {
      return;
    }
    clearTimeout(this._timeoutHandle);
    this._timeoutHandle = setTimeout(() => {
      this._timeoutHandle = void 0;
      let id2;
      if (this._extension) {
        if (this._id) {
          id2 = `${this._extension.identifier.value}.${this._id}`;
        } else {
          id2 = this._extension.identifier.value;
        }
      } else {
        id2 = this._id;
      }
      let name;
      if (this._name) {
        name = this._name;
      } else {
        name = localize(5888, null, this._extension.displayName || this._extension.name);
      }
      let color2 = this._color;
      if (this._backgroundColor) {
        color2 = _ExtHostStatusBarEntry.ALLOWED_BACKGROUND_COLORS.get(this._backgroundColor.id);
      }
      let tooltip;
      let hasTooltipProvider;
      if (typeof this._tooltip2 === "function") {
        tooltip = MarkdownString3.fromStrict(this._tooltip);
        hasTooltipProvider = true;
      } else {
        tooltip = MarkdownString3.fromStrict(this._tooltip2 ?? this._tooltip);
        hasTooltipProvider = false;
      }
      this.#proxy.$setEntry(
        this._entryId,
        id2,
        this._extension?.identifier.value,
        name,
        this._text,
        tooltip,
        hasTooltipProvider,
        this._command?.internal,
        color2,
        this._backgroundColor,
        this._alignment === 1 /* Left */,
        this._priority,
        this._accessibilityInformation
      );
      this._staleCommandRegistrations.clear();
    }, 0);
  }
  dispose() {
    this.hide();
    this._staleCommandRegistrations.dispose();
    this._latestCommandRegistration?.dispose();
    this._onDispose?.();
    this._disposed = true;
  }
};

var StatusBarMessage = class {
  constructor(statusBar) {
    this._messages = [];
    this._item = statusBar.createStatusBarEntry(void 0, "status.extensionMessage", 1 /* Left */, Number.MIN_VALUE);
    this._item.name = localize(5889, null);
  }
  dispose() {
    this._messages.length = 0;
    this._item.dispose();
  }
  setMessage(message) {
    const data = { message };
    this._messages.unshift(data);
    this._update();
    return new Disposable3(() => {
      const idx = this._messages.indexOf(data);
      if (idx >= 0) {
        this._messages.splice(idx, 1);
        this._update();
      }
    });
  }
  _update() {
    if (this._messages.length > 0) {
      this._item.text = this._messages[0].message;
      this._item.show();
    } else {
      this._item.hide();
    }
  }
};

var ExtHostStatusBar = class {
  constructor(mainContext, commands) {
    this._entries = /* @__PURE__ */ new Map();
    this._existingItems = /* @__PURE__ */ new Map();
    this._proxy = mainContext.getProxy(MainContext.MainThreadStatusBar);
    this._commands = commands;
    this._statusMessage = new StatusBarMessage(this);
  }
  $acceptStaticEntries(added) {
    for (const item of added) {
      this._existingItems.set(item.entryId, item);
    }
  }
  async $provideTooltip(entryId, cancellation) {
    const entry = this._entries.get(entryId);
    if (!entry) {
      return void 0;
    }
    const tooltip = typeof entry.tooltip2 === "function" ? await entry.tooltip2(cancellation) : entry.tooltip2;
    return !cancellation.isCancellationRequested ? MarkdownString3.fromStrict(tooltip) : void 0;
  }
  createStatusBarEntry(extension, id2, alignment, priority) {
    const entry = new ExtHostStatusBarEntry(this._proxy, this._commands, this._existingItems, extension, id2, alignment, priority, () => this._entries.delete(entry.entryId));
    this._entries.set(entry.entryId, entry);
    return entry;
  }
  setStatusBarMessage(text, timeoutOrThenable) {
    const d = this._statusMessage.setMessage(text);
    let handle;
    if (typeof timeoutOrThenable === "number") {
      handle = setTimeout(() => d.dispose(), timeoutOrThenable);
    } else if (typeof timeoutOrThenable !== "undefined") {
      timeoutOrThenable.then(() => d.dispose(), () => d.dispose());
    }
    return new Disposable3(() => {
      d.dispose();
      clearTimeout(handle);
    });
  }
};
export { ExtHostStatusBarEntry, StatusBarMessage, ExtHostStatusBar };
