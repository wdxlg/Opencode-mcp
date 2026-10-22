// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/browserView/electron-browser/features/browserScopeIndicatorFeature.ts
import { localize } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { BrowserEditor, BrowserEditorContribution } from "./module-4048.mjs";
import { $ } from "./module-0075.mjs";
import { renderIcon } from "./module-0467.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IWorkspaceTrustManagementService } from "./module-0854.mjs";


// src/vs/workbench/contrib/browserView/electron-browser/features/browserScopeIndicatorFeature.ts
function classifyBrowserScopeBadge(scope, isWorkspaceUntrusted) {
  switch (scope) {
    case "ephemeral" /* Ephemeral */:
      return isWorkspaceUntrusted ? "incognito-untrusted" /* IncognitoUntrusted */ : "incognito" /* Incognito */;
    case "secondAccount" /* SecondAccount */:
      return "second-account" /* SecondAccount */;
    default:
      return "none" /* None */;
  }
}

function presentationFor(kind) {
  switch (kind) {
    case "incognito" /* Incognito */:
      return {
        label: localize(8163, null),
        hover: localize(8164, null),
        icon: Codicon.eyeClosed,
        className: "incognito"
      };
    case "incognito-untrusted" /* IncognitoUntrusted */:
      return {
        label: localize(8165, null),
        hover: localize(8166, null),
        icon: Codicon.shield,
        className: "incognito untrusted"
      };
    case "second-account" /* SecondAccount */:
      return {
        label: localize(8167, null),
        hover: localize(8168, null),
        icon: Codicon.account,
        className: "second-account"
      };
    default:
      return void 0;
  }
}

var BrowserScopeIndicatorContribution = class extends BrowserEditorContribution {
  constructor(editor, hoverService, workspaceContextService, workspaceTrustManagementService) {
    super(editor);
    this.workspaceContextService = workspaceContextService;
    this.workspaceTrustManagementService = workspaceTrustManagementService;
    this._hover = "";
    this._container = $(".browser-scope-indicator");
    this._container.setAttribute("role", "status");
    this._iconSlot = $("span.browser-scope-indicator-icon");
    this._label = $("span.browser-scope-indicator-label");
    this._container.append(this._iconSlot, this._label);
    this._register(hoverService.setupDelayedHover(this._container, () => ({ content: this._hover })));
    this._register(this.workspaceTrustManagementService.onDidChangeTrust(() => this.refresh(this.editor.input?.model?.storageScope ?? this.editor.input?.serialize().storageScope)));
    this.refresh(void 0);
  }
  get widgets() {
    return [{ location: "preUrl" /* PreUrl */, element: this._container, order: -10 }];
  }
  prerenderInput(input) {
    this.refresh(input.serialize().storageScope);
  }
  onModelAttached(model, _store) {
    this.refresh(model.storageScope);
  }
  onModelDetached() {
    this.refresh(void 0);
  }
  isWorkspaceUntrusted() {
    return this.workspaceContextService.getWorkbenchState() !== 1 /* EMPTY */ && !this.workspaceTrustManagementService.isWorkspaceTrusted();
  }
  refresh(scope) {
    const kind = classifyBrowserScopeBadge(scope, this.isWorkspaceUntrusted());
    const presentation2 = presentationFor(kind);
    this._container.className = "browser-scope-indicator";
    this._container.dataset.kind = kind;
    if (!presentation2) {
      this._container.style.display = "none";
      this._container.removeAttribute("aria-label");
      this._hover = "";
      return;
    }
    this._container.style.display = "";
    for (const cls of presentation2.className.split(" ")) {
      this._container.classList.add(cls);
    }
    this._iconSlot.replaceChildren(renderIcon(presentation2.icon));
    this._label.textContent = presentation2.label;
    this._container.setAttribute("aria-label", `${presentation2.label}. ${presentation2.hover}`);
    this._hover = presentation2.hover;
  }
};

BrowserScopeIndicatorContribution = __decorateClass([
  __decorateParam(1, IHoverService),
  __decorateParam(2, IWorkspaceContextService),
  __decorateParam(3, IWorkspaceTrustManagementService)
], BrowserScopeIndicatorContribution);

BrowserEditor.registerContribution(BrowserScopeIndicatorContribution);
export { classifyBrowserScopeBadge, presentationFor, BrowserScopeIndicatorContribution };
