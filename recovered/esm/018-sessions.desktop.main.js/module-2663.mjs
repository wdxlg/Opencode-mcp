// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/aiCustomization/openCodeBridgeStartupFailureCard.ts
import { Codicon } from "./module-0085.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { $, addDisposableListener, append } from "./module-0075.mjs";
import { BRIDGE_STARTUP_FAILURE_ACTION_LABELS, BRIDGE_STARTUP_FAILURE_CHROME, bridgeStartupFailureCopy } from "./module-2662.mjs";
import { ThemeIcon } from "./module-0086.mjs";


// src/vs/workbench/contrib/chat/browser/aiCustomization/openCodeBridgeStartupFailureCard.ts
var MAX_ACTIONS = 3;

var SEVERITY_ICON = { error: Codicon.error, warning: Codicon.warning, info: Codicon.info };

var cardIdPool = 0;

var OpenCodeBridgeStartupFailureCard = class extends Disposable {
  constructor(container2, onAction) {
    super();
    this.onAction = onAction;
    this.actionListeners = this._register(new DisposableStore());
    this.element = append(container2, $(".opencode-bridge-startup-failure"));
    this.element.id = "opencode-bridge-startup-failure-" + String(++cardIdPool);
    this.element.hidden = true;
    const header2 = append(this.element, $(".opencode-bridge-startup-failure-header"));
    this.icon = append(header2, $("span"));
    this.icon.setAttribute("aria-hidden", "true");
    this.heading = append(header2, $("strong.opencode-bridge-startup-failure-heading"));
    this.body = append(this.element, $(".opencode-bridge-startup-failure-body"));
    this.cause = append(this.body, $("p.opencode-bridge-startup-failure-cause"));
    this.actions = append(this.body, $(".opencode-bridge-startup-failure-actions"));
    this.details = append(this.body, $("details.opencode-bridge-startup-failure-details"));
    append(this.details, $("summary", void 0, bridgeStartupFailureCopy(BRIDGE_STARTUP_FAILURE_CHROME.details)));
    this.detail = append(this.details, $("pre"));
    const copy = append(this.details, $("button.opencode-bridge-startup-failure-copy"));
    copy.type = "button";
    copy.textContent = bridgeStartupFailureCopy(BRIDGE_STARTUP_FAILURE_ACTION_LABELS["copy-diagnostics"]);
    this._register(addDisposableListener(copy, "click", () => this.report("copy-diagnostics")));
  }
  get visible() {
    return !this.element.hidden;
  }
  /**
   * Shows a failure, or hides the card for undefined. An identical failure is not re-rendered, so
   * status polling neither flickers nor repeats the announcement. Returns whether the content changed.
   */
  render(failure2) {
    if (!failure2) {
      if (!this.current) {
        return false;
      }
      this.current = void 0;
      this.element.hidden = true;
      this.actionListeners.clear();
      this.actions.replaceChildren();
      this.detail.textContent = "";
      this.details.open = false;
      return true;
    }
    if (this.current?.key === failure2.key) {
      return false;
    }
    this.current = failure2;
    this.element.className = `opencode-bridge-startup-failure severity-${failure2.severity}`;
    this.icon.className = ThemeIcon.asClassName(SEVERITY_ICON[failure2.severity]);
    this.heading.textContent = failure2.heading;
    this.cause.textContent = failure2.cause;
    this.actionListeners.clear();
    const actions = failure2.actions.slice(0, MAX_ACTIONS);
    this.actions.replaceChildren(...actions.map((action, index2) => this.createActionButton(action, index2 === 0)));
    this.actions.hidden = actions.length === 0;
    this.detail.textContent = failure2.detail;
    this.details.open = false;
    this.element.hidden = false;
    return true;
  }
  /** Folds the card to its one-line heading; the page's state badge keeps saying Error. */
  setCollapsed(collapsed2) {
    this.element.classList.toggle("collapsed", collapsed2);
    this.body.hidden = collapsed2;
  }
  createActionButton(action, primary) {
    const button = $(primary ? "button.primary" : "button.secondary");
    button.type = "button";
    button.dataset.action = action;
    button.textContent = bridgeStartupFailureCopy(BRIDGE_STARTUP_FAILURE_ACTION_LABELS[action]);
    this.actionListeners.add(addDisposableListener(button, "click", () => this.report(action)));
    return button;
  }
  report(action) {
    if (this.current) {
      this.onAction(action, this.current);
    }
  }
};
export { MAX_ACTIONS, SEVERITY_ICON, cardIdPool, OpenCodeBridgeStartupFailureCard };
