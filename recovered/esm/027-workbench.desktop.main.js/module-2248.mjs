// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatForkActionViewItem.ts
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { CodiconActionViewItem } from "./module-1924.mjs";
import { DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { localize } from "./module-0001.mjs";
import { status } from "./module-0076.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatForkActionViewItem.ts
var actionIconClasses = ThemeIcon.asClassNameArray(Codicon.repoForked);

var forkIconClasses = ThemeIcon.asClassNameArray(Codicon.repoForkedCompact);

var spinnerIconClasses = ThemeIcon.asClassNameArray(ThemeIcon.modify(Codicon.loadingCompact, "spin"));

var labelIconClasses = [.../* @__PURE__ */ new Set([...actionIconClasses, ...forkIconClasses, ...spinnerIconClasses])].filter((className2) => className2 !== "codicon");

var ChatForkActionViewItem = class extends CodiconActionViewItem {
  constructor() {
    super(...arguments);
    this.actionRunnerListener = this._register(new MutableDisposable());
    this.running = false;
  }
  get actionRunner() {
    return super.actionRunner;
  }
  set actionRunner(actionRunner) {
    super.actionRunner = actionRunner;
    this.bindActionRunner(actionRunner);
  }
  render(container3) {
    super.render(container3);
    container3.classList.add("chat-fork-action-item");
    if (this.label) {
      this.label.classList.add("chat-fork-action-label");
      this.label.textContent = "";
      this.icon = document.createElement("span");
      this.icon.classList.add("chat-fork-action-icon");
      this.icon.setAttribute("aria-hidden", "true");
      this.label.appendChild(this.icon);
    }
    this.bindActionRunner(super.actionRunner);
    this.renderRunningState();
  }
  getTooltip() {
    return this.running ? localize(12361, null) : super.getTooltip();
  }
  updateClass() {
    super.updateClass();
    this.updateIcon();
  }
  bindActionRunner(actionRunner) {
    const listeners = new DisposableStore();
    listeners.add(actionRunner.onWillRun((e) => {
      if (e.action === this.action) {
        this.setRunning(true);
      }
    }));
    listeners.add(actionRunner.onDidRun((e) => {
      if (e.action === this.action) {
        this.setRunning(false);
      }
    }));
    this.actionRunnerListener.value = listeners;
  }
  setRunning(running) {
    if (this.running === running) {
      return;
    }
    this.running = running;
    this.renderRunningState();
    if (running) {
      status(localize(12362, null));
    }
  }
  renderRunningState() {
    this.updateIcon();
    this.label?.setAttribute("aria-busy", String(this.running));
    this.updateTooltip();
  }
  updateIcon() {
    if (!this.label || !this.icon) {
      return;
    }
    this.label.classList.remove(...labelIconClasses);
    this.icon.classList.remove(...forkIconClasses, ...spinnerIconClasses);
    this.icon.classList.add(...this.running ? spinnerIconClasses : forkIconClasses);
  }
};
export { actionIconClasses, forkIconClasses, spinnerIconClasses, labelIconClasses, ChatForkActionViewItem };
