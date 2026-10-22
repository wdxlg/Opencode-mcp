// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/policyBlocked/browser/sessionsPolicyBlocked.ts
import { Disposable, toDisposable } from "./module-0012.mjs";
import { $, EventType, addDisposableGenericMouseDownListener, addDisposableListener, append, getWindow } from "./module-0075.mjs";
import { localize } from "./module-0001.mjs";
import { URI } from "./module-0032.mjs";
import { Button } from "./module-0546.mjs";
import { defaultButtonStyles } from "./module-0513.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IProductService } from "./module-0875.mjs";
import { IDefaultAccountService } from "./module-0741.mjs";
import { IWorkbenchLayoutService } from "./module-1119.mjs";


// src/vs/sessions/contrib/policyBlocked/browser/sessionsPolicyBlocked.ts
var SessionsPolicyBlockedOverlay = class extends Disposable {
  constructor(container2, options3, commandService, openerService, productService, defaultAccountService, layoutService) {
    super();
    this.commandService = commandService;
    this.openerService = openerService;
    this.productService = productService;
    this.defaultAccountService = defaultAccountService;
    this.overlay = append(container2, $(".sessions-policy-blocked-overlay"));
    this.overlay.setAttribute("role", "dialog");
    this.overlay.setAttribute("aria-modal", "true");
    this.overlay.tabIndex = -1;
    this.overlay.focus();
    this._register(toDisposable(() => this.overlay.remove()));
    const workbenchRoot = layoutService.mainContainer;
    workbenchRoot.classList.add("sessions-policy-blocked");
    this._register(toDisposable(() => workbenchRoot.classList.remove("sessions-policy-blocked")));
    const card = append(this.overlay, $(".sessions-policy-blocked-card"));
    this._register(addDisposableListener(getWindow(this.overlay), EventType.KEY_DOWN, (e4) => {
      if (card.contains(e4.target)) {
        return;
      }
      e4.preventDefault();
      e4.stopPropagation();
    }, true));
    this._register(addDisposableGenericMouseDownListener(this.overlay, (e4) => {
      if (e4.target === this.overlay) {
        e4.preventDefault();
        e4.stopPropagation();
      }
    }));
    append(card, $("div.sessions-policy-blocked-logo"));
    switch (options3.reason) {
      case "agentDisabled" /* AgentDisabled */:
        this._renderAgentDisabled(card);
        break;
      case "loading" /* Loading */:
        this._renderLoading(card);
        break;
      case "accountPolicyGate" /* AccountPolicyGate */:
        this._renderAccountPolicyGate(card, options3);
        break;
      case "managedSettingsRefresh" /* ManagedSettingsRefresh */:
        this._renderManagedSettingsRefresh(card, options3.freshness);
        break;
    }
  }
  _renderAgentDisabled(card) {
    this.overlay.setAttribute("aria-label", localize(4904, null));
    append(card, $("h2", void 0, localize(4908, null)));
    const description = append(card, $("p"));
    append(description, document.createTextNode(localize(4905, null)));
    append(description, document.createTextNode(" "));
    const learnMore = append(description, $("a.sessions-policy-blocked-link"));
    learnMore.textContent = localize(4906, null);
    learnMore.href = "https://aka.ms/VSCode/Agents/docs";
    this._register(addDisposableListener(learnMore, EventType.CLICK, (e4) => {
      e4.preventDefault();
      this.openerService.open(URI.parse("https://aka.ms/VSCode/Agents/docs"));
    }));
    const button = this._register(new Button(card, { ...defaultButtonStyles, secondary: true }));
    button.label = localize(4907, null);
    this._register(button.onDidClick(() => this._openVSCode()));
  }
  _renderLoading(card) {
    this.overlay.setAttribute("aria-label", localize(4893, null));
    append(card, $(
      "div.sessions-policy-blocked-progress-bar",
      void 0,
      $("div.sessions-policy-blocked-progress-bar-fill")
    ));
  }
  _renderAccountPolicyGate(card, options3) {
    this.overlay.setAttribute("aria-label", localize(4886, null));
    append(card, $("h2", void 0, localize(4892, null)));
    const description = append(card, $("p"));
    if (options3.accountName) {
      append(description, document.createTextNode(
        localize(4889, null, options3.accountName)
      ));
    } else {
      append(description, document.createTextNode(
        localize(4888, null)
      ));
    }
    const approvedOrgs = options3.approvedOrganizations ?? [];
    const hasConcreteOrgs = approvedOrgs.length > 0 && !approvedOrgs.includes("*");
    if (hasConcreteOrgs) {
      const orgSection = append(card, $("div.sessions-policy-blocked-orgs"));
      append(orgSection, $(
        "p.sessions-policy-blocked-orgs-label",
        void 0,
        localize(4885, null)
      ));
      const orgList = append(orgSection, $("ul"));
      for (const org of approvedOrgs) {
        append(orgList, $("li", void 0, org));
      }
    }
    const footer = append(card, $("p.sessions-policy-blocked-footer"));
    append(footer, document.createTextNode(localize(4887, null)));
    append(footer, document.createTextNode(" "));
    const learnMore = append(footer, $("a.sessions-policy-blocked-link"));
    learnMore.textContent = localize(4890, null);
    learnMore.href = "https://code.visualstudio.com/docs/enterprise/overview";
    this._register(addDisposableListener(learnMore, EventType.CLICK, (e4) => {
      e4.preventDefault();
      this.openerService.open(URI.parse("https://code.visualstudio.com/docs/enterprise/overview"));
    }));
    const signInButton = this._register(new Button(card, { ...defaultButtonStyles }));
    signInButton.label = localize(4891, null);
    this._register(signInButton.onDidClick(() => {
      this.commandService.executeCommand("workbench.action.agenticSignIn");
    }));
  }
  _renderManagedSettingsRefresh(card, freshness) {
    this.overlay.setAttribute("aria-label", localize(4894, null));
    append(card, $("h2", void 0, localize(4902, null)));
    const message = freshness?.failure === "noToken" /* NoToken */ ? localize(4896, null, this.productService.nameShort) : freshness?.failure === "rateLimited" /* RateLimited */ ? localize(4899, null) : freshness?.failure === "noUrl" /* NoUrl */ ? localize(4897, null, this.productService.nameShort) : freshness?.failure === "updateRequired" /* UpdateRequired */ ? localize(4903, null, this.productService.nameShort) : localize(4895, null, this.productService.nameShort);
    append(card, $("p", void 0, message));
    if (freshness?.failure === "noToken" /* NoToken */) {
      const signInButton = this._register(new Button(card, { ...defaultButtonStyles }));
      signInButton.label = localize(4901, null);
      this._register(signInButton.onDidClick(() => this.commandService.executeCommand("workbench.action.agenticSignIn")));
    } else if (freshness?.failure !== "noUrl" /* NoUrl */ && freshness?.failure !== "updateRequired" /* UpdateRequired */) {
      const retryButton = this._register(new Button(card, { ...defaultButtonStyles }));
      retryButton.label = localize(4900, null);
      this._register(retryButton.onDidClick(() => this.defaultAccountService.refresh({ forceRefresh: true, retryManagedSettings: true })));
    }
    const openVSCodeButton = this._register(new Button(card, { ...defaultButtonStyles, secondary: true }));
    openVSCodeButton.label = localize(4898, null);
    this._register(openVSCodeButton.onDidClick(() => this._openVSCode()));
  }
  _openVSCode() {
    const scheme = this.productService.parentPolicyConfig?.urlProtocol ?? this.productService.urlProtocol;
    this.openerService.open(URI.from({ scheme, query: "windowId=_blank" }), { openExternal: true });
  }
};

SessionsPolicyBlockedOverlay = __decorateClass([
  __decorateParam(2, ICommandService),
  __decorateParam(3, IOpenerService),
  __decorateParam(4, IProductService),
  __decorateParam(5, IDefaultAccountService),
  __decorateParam(6, IWorkbenchLayoutService)
], SessionsPolicyBlockedOverlay);
export { SessionsPolicyBlockedOverlay };
