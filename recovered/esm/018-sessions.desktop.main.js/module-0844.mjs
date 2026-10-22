// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/semanticTokens/browser/viewportSemanticTokens.ts
import { Disposable, dispose } from "./module-0012.mjs";
import { RunOnceScheduler, createCancelablePromise } from "./module-0036.mjs";
import { SEMANTIC_HIGHLIGHTING_SETTING_ID, isSemanticColoringEnabled } from "./module-0842.mjs";
import { getDocumentRangeSemanticTokens, hasDocumentRangeSemanticTokensProvider } from "./module-0841.mjs";
import { StopWatch } from "./module-0016.mjs";
import { toMultilineTokens2 } from "./module-0838.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ISemanticTokensStylingService } from "./module-0839.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ILanguageFeatureDebounceService } from "./module-0572.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { registerEditorContribution } from "./module-0097.mjs";


// src/vs/editor/contrib/semanticTokens/browser/viewportSemanticTokens.ts
var ViewportSemanticTokensContribution = class extends Disposable {
  constructor(editor, _semanticTokensStylingService, _themeService, _configurationService, languageFeatureDebounceService, languageFeaturesService) {
    super();
    this._semanticTokensStylingService = _semanticTokensStylingService;
    this._themeService = _themeService;
    this._configurationService = _configurationService;
    this._editor = editor;
    this._provider = languageFeaturesService.documentRangeSemanticTokensProvider;
    this._debounceInformation = languageFeatureDebounceService.for(this._provider, "DocumentRangeSemanticTokens", { min: 100, max: 500 });
    this._tokenizeViewport = this._register(new RunOnceScheduler(() => this._tokenizeViewportNow(), 100));
    this._outstandingRequests = [];
    this._rangeProvidersChangeListeners = [];
    const scheduleTokenizeViewport = () => {
      if (this._editor.hasModel()) {
        this._tokenizeViewport.schedule(this._debounceInformation.get(this._editor.getModel()));
      }
    };
    const bindRangeProvidersChangeListeners = () => {
      this._cleanupProviderListeners();
      if (this._editor.hasModel()) {
        const model = this._editor.getModel();
        for (const provider of this._provider.all(model)) {
          const disposable = provider.onDidChange?.(() => {
            this._cancelAll();
            scheduleTokenizeViewport();
          });
          if (disposable) {
            this._rangeProvidersChangeListeners.push(disposable);
          }
        }
      }
    };
    this._register(this._editor.onDidScrollChange(() => {
      scheduleTokenizeViewport();
    }));
    this._register(this._editor.onDidChangeModel(() => {
      bindRangeProvidersChangeListeners();
      this._cancelAll();
      scheduleTokenizeViewport();
    }));
    this._register(this._editor.onDidChangeModelLanguage(() => {
      bindRangeProvidersChangeListeners();
      this._cancelAll();
      scheduleTokenizeViewport();
    }));
    this._register(this._editor.onDidChangeModelContent((e4) => {
      this._cancelAll();
      scheduleTokenizeViewport();
    }));
    bindRangeProvidersChangeListeners();
    this._register(this._provider.onDidChange(() => {
      bindRangeProvidersChangeListeners();
      this._cancelAll();
      scheduleTokenizeViewport();
    }));
    this._register(this._configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration(SEMANTIC_HIGHLIGHTING_SETTING_ID)) {
        this._cancelAll();
        scheduleTokenizeViewport();
      }
    }));
    this._register(this._themeService.onDidColorThemeChange(() => {
      this._cancelAll();
      scheduleTokenizeViewport();
    }));
    scheduleTokenizeViewport();
  }
  static {
    this.ID = "editor.contrib.viewportSemanticTokens";
  }
  static get(editor) {
    return editor.getContribution(ViewportSemanticTokensContribution.ID);
  }
  dispose() {
    this._cleanupProviderListeners();
    super.dispose();
  }
  _cleanupProviderListeners() {
    dispose(this._rangeProvidersChangeListeners);
    this._rangeProvidersChangeListeners = [];
  }
  _cancelAll() {
    for (const request2 of this._outstandingRequests) {
      request2.cancel();
    }
    this._outstandingRequests = [];
  }
  _removeOutstandingRequest(req) {
    for (let i2 = 0, len = this._outstandingRequests.length; i2 < len; i2++) {
      if (this._outstandingRequests[i2] === req) {
        this._outstandingRequests.splice(i2, 1);
        return;
      }
    }
  }
  _tokenizeViewportNow() {
    if (!this._editor.hasModel()) {
      return;
    }
    const model = this._editor.getModel();
    if (model.tokenization.hasCompleteSemanticTokens()) {
      return;
    }
    if (!isSemanticColoringEnabled(model, this._themeService, this._configurationService)) {
      if (model.tokenization.hasSomeSemanticTokens()) {
        model.tokenization.setSemanticTokens(null, false);
      }
      return;
    }
    if (!hasDocumentRangeSemanticTokensProvider(this._provider, model)) {
      if (model.tokenization.hasSomeSemanticTokens()) {
        model.tokenization.setSemanticTokens(null, false);
      }
      return;
    }
    const visibleRanges = this._editor.getVisibleRangesPlusViewportAboveBelow();
    this._outstandingRequests = this._outstandingRequests.concat(visibleRanges.map((range2) => this._requestRange(model, range2)));
  }
  _requestRange(model, range2) {
    const requestVersionId = model.getVersionId();
    const request2 = createCancelablePromise((token) => Promise.resolve(getDocumentRangeSemanticTokens(this._provider, model, range2, token)));
    const sw = new StopWatch(false);
    request2.then((r2) => {
      this._debounceInformation.update(model, sw.elapsed());
      if (!r2 || !r2.tokens || model.isDisposed() || model.getVersionId() !== requestVersionId) {
        return;
      }
      const { provider, tokens: result } = r2;
      const styling = this._semanticTokensStylingService.getStyling(provider);
      model.tokenization.setPartialSemanticTokens(range2, toMultilineTokens2(result, styling, model.getLanguageId()));
    }).then(() => this._removeOutstandingRequest(request2), () => this._removeOutstandingRequest(request2));
    return request2;
  }
};

ViewportSemanticTokensContribution = __decorateClass([
  __decorateParam(1, ISemanticTokensStylingService),
  __decorateParam(2, IThemeService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, ILanguageFeatureDebounceService),
  __decorateParam(5, ILanguageFeaturesService)
], ViewportSemanticTokensContribution);

registerEditorContribution(ViewportSemanticTokensContribution.ID, ViewportSemanticTokensContribution, 1 /* AfterFirstRender */);
export { ViewportSemanticTokensContribution };
