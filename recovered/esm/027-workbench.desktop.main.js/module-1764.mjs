// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/services/semanticTokensStylingService.ts
import { Disposable } from "./module-0012.mjs";
import { SemanticTokensProviderStyling } from "./module-0838.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IThemeService } from "./module-0287.mjs";
import { ILogService } from "./module-0095.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { ISemanticTokensStylingService } from "./module-0839.mjs";


// src/vs/editor/common/services/semanticTokensStylingService.ts
var SemanticTokensStylingService = class extends Disposable {
  constructor(_themeService, _logService, _languageService) {
    super();
    this._themeService = _themeService;
    this._logService = _logService;
    this._languageService = _languageService;
    this._caches = /* @__PURE__ */ new WeakMap();
    this._register(this._themeService.onDidColorThemeChange(() => {
      this._caches = /* @__PURE__ */ new WeakMap();
    }));
  }
  getStyling(provider) {
    if (!this._caches.has(provider)) {
      this._caches.set(provider, new SemanticTokensProviderStyling(provider.getLegend(), this._themeService, this._languageService, this._logService));
    }
    return this._caches.get(provider);
  }
};

SemanticTokensStylingService = __decorateClass([
  __decorateParam(0, IThemeService),
  __decorateParam(1, ILogService),
  __decorateParam(2, ILanguageService)
], SemanticTokensStylingService);

registerSingleton(ISemanticTokensStylingService, SemanticTokensStylingService, 1 /* Delayed */);
export { SemanticTokensStylingService };
