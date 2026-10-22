// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/semanticTokens/browser/documentSemanticTokens.ts
import { Disposable, DisposableStore, dispose } from "./module-0012.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { SEMANTIC_HIGHLIGHTING_SETTING_ID, isSemanticColoringEnabled } from "./module-0842.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ISemanticTokensStylingService } from "./module-0839.mjs";
import { IModelService } from "./module-0080.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ILanguageFeatureDebounceService } from "./module-0572.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { getDocumentSemanticTokens, hasDocumentSemanticTokensProvider, isSemanticTokens, isSemanticTokensEdits } from "./module-0841.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { StopWatch } from "./module-0016.mjs";
import { isCancellationError, onUnexpectedError } from "./module-0004.mjs";
import { toMultilineTokens2 } from "./module-0838.mjs";
import { registerEditorFeature } from "./module-0574.mjs";


// src/vs/editor/contrib/semanticTokens/browser/documentSemanticTokens.ts
var DocumentSemanticTokensFeature = class extends Disposable {
  constructor(semanticTokensStylingService, modelService, themeService, configurationService, languageFeatureDebounceService, languageFeaturesService) {
    super();
    this._watchers = new ResourceMap();
    this._providerChangeListeners = this._register(new DisposableStore());
    const provider = languageFeaturesService.documentSemanticTokensProvider;
    const register3 = (model) => {
      this._watchers.get(model.uri)?.dispose();
      this._watchers.set(model.uri, new ModelSemanticColoring(model, semanticTokensStylingService, themeService, languageFeatureDebounceService, languageFeaturesService));
    };
    const deregister = (model, modelSemanticColoring) => {
      modelSemanticColoring.dispose();
      this._watchers.delete(model.uri);
    };
    const handleSettingOrThemeChange = () => {
      for (const model of modelService.getModels()) {
        const curr = this._watchers.get(model.uri);
        if (isSemanticColoringEnabled(model, themeService, configurationService)) {
          if (!curr) {
            register3(model);
          }
        } else {
          if (curr) {
            deregister(model, curr);
          }
        }
      }
    };
    const bindProviderChangeListeners = () => {
      this._providerChangeListeners.clear();
      for (const p of provider.allNoModel()) {
        if (typeof p.onDidChange === "function") {
          this._providerChangeListeners.add(p.onDidChange(() => {
            for (const watcher of this._watchers.values()) {
              watcher.handleProviderDidChange(p);
            }
          }));
        }
      }
    };
    modelService.getModels().forEach((model) => {
      if (isSemanticColoringEnabled(model, themeService, configurationService)) {
        register3(model);
      }
    });
    this._register(modelService.onModelAdded((model) => {
      if (isSemanticColoringEnabled(model, themeService, configurationService)) {
        register3(model);
      }
    }));
    this._register(modelService.onModelRemoved((model) => {
      const curr = this._watchers.get(model.uri);
      if (curr) {
        deregister(model, curr);
      }
    }));
    this._register(configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration(SEMANTIC_HIGHLIGHTING_SETTING_ID)) {
        handleSettingOrThemeChange();
      }
    }));
    this._register(themeService.onDidColorThemeChange(handleSettingOrThemeChange));
    bindProviderChangeListeners();
    this._register(provider.onDidChange(() => {
      bindProviderChangeListeners();
      for (const watcher of this._watchers.values()) {
        watcher.handleRegistryChange();
      }
    }));
  }
  dispose() {
    dispose(this._watchers.values());
    this._watchers.clear();
    super.dispose();
  }
};

DocumentSemanticTokensFeature = __decorateClass([
  __decorateParam(0, ISemanticTokensStylingService),
  __decorateParam(1, IModelService),
  __decorateParam(2, IThemeService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, ILanguageFeatureDebounceService),
  __decorateParam(5, ILanguageFeaturesService)
], DocumentSemanticTokensFeature);

var ModelSemanticColoring = class extends Disposable {
  constructor(model, _semanticTokensStylingService, themeService, languageFeatureDebounceService, languageFeaturesService) {
    super();
    this._semanticTokensStylingService = _semanticTokensStylingService;
    this._relevantProviders = /* @__PURE__ */ new Set();
    this._isDisposed = false;
    this._model = model;
    this._provider = languageFeaturesService.documentSemanticTokensProvider;
    this._debounceInformation = languageFeatureDebounceService.for(this._provider, "DocumentSemanticTokens", { min: ModelSemanticColoring.REQUEST_MIN_DELAY, max: ModelSemanticColoring.REQUEST_MAX_DELAY });
    this._fetchDocumentSemanticTokens = this._register(new RunOnceScheduler(() => this._fetchDocumentSemanticTokensNow(), ModelSemanticColoring.REQUEST_MIN_DELAY));
    this._currentDocumentResponse = null;
    this._currentDocumentRequestCancellationTokenSource = null;
    this._providersChangedDuringRequest = false;
    this._updateRelevantProviders();
    this._register(this._model.onDidChangeContent(() => {
      if (!this._fetchDocumentSemanticTokens.isScheduled()) {
        this._fetchDocumentSemanticTokens.schedule(this._debounceInformation.get(this._model));
      }
    }));
    this._register(this._model.onDidChangeAttached(() => {
      if (!this._fetchDocumentSemanticTokens.isScheduled()) {
        this._fetchDocumentSemanticTokens.schedule(this._debounceInformation.get(this._model));
      }
    }));
    this._register(this._model.onDidChangeLanguage(() => {
      if (this._currentDocumentResponse) {
        this._currentDocumentResponse.dispose();
        this._currentDocumentResponse = null;
      }
      if (this._currentDocumentRequestCancellationTokenSource) {
        this._currentDocumentRequestCancellationTokenSource.cancel();
        this._currentDocumentRequestCancellationTokenSource = null;
      }
      this._setDocumentSemanticTokens(null, null, null, []);
      this._updateRelevantProviders();
      this._fetchDocumentSemanticTokens.schedule(0);
    }));
    this._register(themeService.onDidColorThemeChange((_) => {
      this._setDocumentSemanticTokens(null, null, null, []);
      this._fetchDocumentSemanticTokens.schedule(this._debounceInformation.get(this._model));
    }));
    this._fetchDocumentSemanticTokens.schedule(0);
  }
  static {
    this.REQUEST_MIN_DELAY = 300;
  }
  static {
    this.REQUEST_MAX_DELAY = 2e3;
  }
  handleRegistryChange() {
    this._updateRelevantProviders();
    this._fetchDocumentSemanticTokens.schedule(this._debounceInformation.get(this._model));
  }
  handleProviderDidChange(provider) {
    if (!this._relevantProviders.has(provider)) {
      return;
    }
    if (this._currentDocumentRequestCancellationTokenSource) {
      this._providersChangedDuringRequest = true;
      return;
    }
    this._fetchDocumentSemanticTokens.schedule(0);
  }
  _updateRelevantProviders() {
    this._relevantProviders = new Set(this._provider.all(this._model));
  }
  dispose() {
    if (this._currentDocumentResponse) {
      this._currentDocumentResponse.dispose();
      this._currentDocumentResponse = null;
    }
    if (this._currentDocumentRequestCancellationTokenSource) {
      this._currentDocumentRequestCancellationTokenSource.cancel();
      this._currentDocumentRequestCancellationTokenSource = null;
    }
    this._setDocumentSemanticTokens(null, null, null, []);
    this._isDisposed = true;
    super.dispose();
  }
  _fetchDocumentSemanticTokensNow() {
    if (this._currentDocumentRequestCancellationTokenSource) {
      return;
    }
    if (!hasDocumentSemanticTokensProvider(this._provider, this._model)) {
      if (this._currentDocumentResponse) {
        this._model.tokenization.setSemanticTokens(null, false);
      }
      return;
    }
    if (!this._model.isAttachedToEditor()) {
      return;
    }
    const cancellationTokenSource = new CancellationTokenSource();
    const lastProvider = this._currentDocumentResponse ? this._currentDocumentResponse.provider : null;
    const lastResultId = this._currentDocumentResponse ? this._currentDocumentResponse.resultId || null : null;
    const request2 = getDocumentSemanticTokens(this._provider, this._model, lastProvider, lastResultId, cancellationTokenSource.token);
    this._currentDocumentRequestCancellationTokenSource = cancellationTokenSource;
    this._providersChangedDuringRequest = false;
    const pendingChanges = [];
    const contentChangeListener = this._model.onDidChangeContent((e4) => {
      pendingChanges.push(e4);
    });
    const sw = new StopWatch(false);
    request2.then((res) => {
      this._debounceInformation.update(this._model, sw.elapsed());
      this._currentDocumentRequestCancellationTokenSource = null;
      contentChangeListener.dispose();
      if (!res) {
        this._setDocumentSemanticTokens(null, null, null, pendingChanges);
      } else {
        const { provider, tokens } = res;
        const styling = this._semanticTokensStylingService.getStyling(provider);
        this._setDocumentSemanticTokens(provider, tokens || null, styling, pendingChanges);
      }
    }, (err) => {
      const isExpectedError = err && (isCancellationError(err) || typeof err.message === "string" && err.message.indexOf("busy") !== -1);
      if (!isExpectedError) {
        onUnexpectedError(err);
      }
      this._currentDocumentRequestCancellationTokenSource = null;
      contentChangeListener.dispose();
      if (pendingChanges.length > 0 || this._providersChangedDuringRequest) {
        if (!this._fetchDocumentSemanticTokens.isScheduled()) {
          this._fetchDocumentSemanticTokens.schedule(this._debounceInformation.get(this._model));
        }
      }
    });
  }
  static _copy(src, srcOffset, dest, destOffset, length) {
    length = Math.min(length, dest.length - destOffset, src.length - srcOffset);
    for (let i2 = 0; i2 < length; i2++) {
      dest[destOffset + i2] = src[srcOffset + i2];
    }
  }
  _setDocumentSemanticTokens(provider, tokens, styling, pendingChanges) {
    const currentResponse = this._currentDocumentResponse;
    const rescheduleIfNeeded = () => {
      if ((pendingChanges.length > 0 || this._providersChangedDuringRequest) && !this._fetchDocumentSemanticTokens.isScheduled()) {
        this._fetchDocumentSemanticTokens.schedule(this._debounceInformation.get(this._model));
      }
    };
    if (this._currentDocumentResponse) {
      this._currentDocumentResponse.dispose();
      this._currentDocumentResponse = null;
    }
    if (this._isDisposed) {
      if (provider && tokens) {
        provider.releaseDocumentSemanticTokens(tokens.resultId);
      }
      return;
    }
    if (!provider || !styling) {
      this._model.tokenization.setSemanticTokens(null, false);
      return;
    }
    if (!tokens) {
      this._model.tokenization.setSemanticTokens(null, true);
      rescheduleIfNeeded();
      return;
    }
    if (isSemanticTokensEdits(tokens)) {
      if (!currentResponse) {
        this._model.tokenization.setSemanticTokens(null, true);
        return;
      }
      if (tokens.edits.length === 0) {
        tokens = {
          resultId: tokens.resultId,
          data: currentResponse.data
        };
      } else {
        let deltaLength = 0;
        for (const edit3 of tokens.edits) {
          deltaLength += (edit3.data ? edit3.data.length : 0) - edit3.deleteCount;
        }
        const srcData = currentResponse.data;
        const destData = new Uint32Array(srcData.length + deltaLength);
        let srcLastStart = srcData.length;
        let destLastStart = destData.length;
        for (let i2 = tokens.edits.length - 1; i2 >= 0; i2--) {
          const edit3 = tokens.edits[i2];
          if (edit3.start > srcData.length) {
            styling.warnInvalidEditStart(currentResponse.resultId, tokens.resultId, i2, edit3.start, srcData.length);
            this._model.tokenization.setSemanticTokens(null, true);
            return;
          }
          const copyCount = srcLastStart - (edit3.start + edit3.deleteCount);
          if (copyCount > 0) {
            ModelSemanticColoring._copy(srcData, srcLastStart - copyCount, destData, destLastStart - copyCount, copyCount);
            destLastStart -= copyCount;
          }
          if (edit3.data) {
            ModelSemanticColoring._copy(edit3.data, 0, destData, destLastStart - edit3.data.length, edit3.data.length);
            destLastStart -= edit3.data.length;
          }
          srcLastStart = edit3.start;
        }
        if (srcLastStart > 0) {
          ModelSemanticColoring._copy(srcData, 0, destData, 0, srcLastStart);
        }
        tokens = {
          resultId: tokens.resultId,
          data: destData
        };
      }
    }
    if (isSemanticTokens(tokens)) {
      this._currentDocumentResponse = new SemanticTokensResponse(provider, tokens.resultId, tokens.data);
      const result = toMultilineTokens2(tokens, styling, this._model.getLanguageId());
      if (pendingChanges.length > 0) {
        for (const change of pendingChanges) {
          for (const area of result) {
            for (const singleChange of change.changes) {
              area.applyEdit(singleChange.range, singleChange.text);
            }
          }
        }
      }
      this._model.tokenization.setSemanticTokens(result, true);
    } else {
      this._model.tokenization.setSemanticTokens(null, true);
    }
    rescheduleIfNeeded();
  }
};

ModelSemanticColoring = __decorateClass([
  __decorateParam(1, ISemanticTokensStylingService),
  __decorateParam(2, IThemeService),
  __decorateParam(3, ILanguageFeatureDebounceService),
  __decorateParam(4, ILanguageFeaturesService)
], ModelSemanticColoring);

var SemanticTokensResponse = class {
  constructor(provider, resultId, data) {
    this.provider = provider;
    this.resultId = resultId;
    this.data = data;
  }
  dispose() {
    this.provider.releaseDocumentSemanticTokens(this.resultId);
  }
};

registerEditorFeature(DocumentSemanticTokensFeature);
export { DocumentSemanticTokensFeature, ModelSemanticColoring, SemanticTokensResponse };
