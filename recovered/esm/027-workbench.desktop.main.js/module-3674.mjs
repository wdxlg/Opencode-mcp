// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/share/browser/shareService.ts
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { localize } from "./module-0001.mjs";
import { score2 } from "./module-0858.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { registerAction2 } from "./module-0092.mjs";
import { ToggleTitleBarConfigAction } from "./module-2579.mjs";
import { IsCompactTitleBarContext, WorkspaceFolderCountContext } from "./module-0949.mjs";


// src/vs/workbench/contrib/share/browser/shareService.ts
var ShareProviderCountContext = new RawContextKey("shareProviderCount", 0, localize(19316, null));

var ShareService = class {
  constructor(contextKeyService, labelService, quickInputService, codeEditorService, telemetryService) {
    this.contextKeyService = contextKeyService;
    this.labelService = labelService;
    this.quickInputService = quickInputService;
    this.codeEditorService = codeEditorService;
    this.telemetryService = telemetryService;
    this._providers = /* @__PURE__ */ new Set();
    this.providerCount = ShareProviderCountContext.bindTo(this.contextKeyService);
  }
  registerShareProvider(provider) {
    this._providers.add(provider);
    this.providerCount.set(this._providers.size);
    return {
      dispose: () => {
        this._providers.delete(provider);
        this.providerCount.set(this._providers.size);
      }
    };
  }
  getShareActions() {
    return [];
  }
  async provideShare(item, token) {
    const language2 = this.codeEditorService.getActiveCodeEditor()?.getModel()?.getLanguageId() ?? "";
    const providers2 = [...this._providers.values()].filter((p) => score2(p.selector, item.resourceUri, language2, true, void 0, void 0) > 0).sort((a, b) => a.priority - b.priority);
    if (providers2.length === 0) {
      return void 0;
    }
    if (providers2.length === 1) {
      this.telemetryService.publicLog2("shareService.share", { providerId: providers2[0].id });
      return providers2[0].provideShare(item, token);
    }
    const items = providers2.map((p) => ({ label: p.label, provider: p }));
    const selected = await this.quickInputService.pick(items, { canPickMany: false, placeHolder: localize(19319, null, this.labelService.getUriLabel(item.resourceUri)) }, token);
    if (selected !== void 0) {
      this.telemetryService.publicLog2("shareService.share", { providerId: selected.provider.id });
      return selected.provider.provideShare(item, token);
    }
    return;
  }
};

ShareService = __decorateClass([
  __decorateParam(0, IContextKeyService),
  __decorateParam(1, ILabelService),
  __decorateParam(2, IQuickInputService),
  __decorateParam(3, ICodeEditorService),
  __decorateParam(4, ITelemetryService)
], ShareService);

registerAction2(class ToggleShareControl extends ToggleTitleBarConfigAction {
  constructor() {
    super("workbench.experimental.share.enabled", localize(19317, null), localize(19318, null), 3, ContextKeyExpr.and(IsCompactTitleBarContext.toNegated(), ContextKeyExpr.has("config.window.commandCenter"), ContextKeyExpr.and(ShareProviderCountContext.notEqualsTo(0), WorkspaceFolderCountContext.notEqualsTo(0))));
  }
});
export { ShareProviderCountContext, ShareService };
