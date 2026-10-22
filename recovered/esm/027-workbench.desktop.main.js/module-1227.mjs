// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadLanguages.ts
import { Disposable, DisposableMap } from "./module-0012.mjs";
import { ExtHostContext, MainContext } from "./module-0921.mjs";
import { URI } from "./module-0032.mjs";
import { Range2 } from "./module-0106.mjs";
import { TokenizationRegistry2 } from "./module-0164.mjs";
import { Color } from "./module-0197.mjs";
import { TokenMetadata } from "./module-0108.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0919.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { IModelService } from "./module-0080.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { ILanguageStatusService } from "./module-1225.mjs";
import { ITextMateTokenizationService } from "./module-1226.mjs";
import { IThemeService } from "./module-0287.mjs";


// src/vs/workbench/api/browser/mainThreadLanguages.ts
var MainThreadLanguages = class extends Disposable {
  constructor(_extHostContext, _languageService, _modelService, _resolverService, _languageStatusService, _textMateService, themeService) {
    super();
    this._languageService = _languageService;
    this._modelService = _modelService;
    this._resolverService = _resolverService;
    this._languageStatusService = _languageStatusService;
    this._textMateService = _textMateService;
    this._status = this._register(new DisposableMap());
    this._proxy = _extHostContext.getProxy(ExtHostContext.ExtHostLanguages);
    this._proxy.$acceptLanguageIds(_languageService.getRegisteredLanguageIds());
    this._register(_languageService.onDidChange((_) => {
      this._proxy.$acceptLanguageIds(_languageService.getRegisteredLanguageIds());
    }));
    this._register(themeService.onDidColorThemeChange(() => {
      this._proxy.$acceptSyntaxHighlightingThemeChanged();
    }));
  }
  async $changeLanguage(resource, languageId) {
    if (!this._languageService.isRegisteredLanguageId(languageId)) {
      return Promise.reject(new Error(`Unknown language id: ${languageId}`));
    }
    const uri5 = URI.revive(resource);
    const ref = await this._resolverService.createModelReference(uri5);
    try {
      ref.object.textEditorModel.setLanguage(this._languageService.createById(languageId));
    } finally {
      ref.dispose();
    }
  }
  async $tokensAtPosition(resource, position2) {
    const uri5 = URI.revive(resource);
    const model = this._modelService.getModel(uri5);
    if (!model) {
      return void 0;
    }
    model.tokenization.tokenizeIfCheap(position2.lineNumber);
    const tokens = model.tokenization.getLineTokens(position2.lineNumber);
    const idx = tokens.findTokenIndexAtOffset(position2.column - 1);
    return {
      type: tokens.getStandardTokenType(idx),
      range: new Range2(position2.lineNumber, 1 + tokens.getStartOffset(idx), position2.lineNumber, 1 + tokens.getEndOffset(idx))
    };
  }
  async $computeFullSyntaxHighlighting(source, languageId) {
    const colorMap = (TokenizationRegistry2.getColorMap() ?? []).map((c) => c ? Color.Format.CSS.formatHexA(c) : "");
    const resolvedLanguageId = this._languageService.isRegisteredLanguageId(languageId) ? languageId : this._languageService.getLanguageIdByLanguageName(languageId);
    const grammar = resolvedLanguageId ? await this._textMateService.createTokenizer(resolvedLanguageId) : null;
    if (!grammar) {
      const tokens2 = source.length === 0 ? [] : [{ length: source.length, foreground: 0, fontStyle: 0 /* None */ }];
      return { tokens: tokens2, colorMap };
    }
    const tokens = [];
    const lines = source.split("\n");
    let state = null;
    for (let i2 = 0; i2 < lines.length; i2++) {
      const line = lines[i2];
      const result = grammar.tokenizeLine2(line, state, 500);
      state = result.ruleStack;
      const binary = result.tokens;
      for (let j = 0; j < binary.length; j += 2) {
        const startOffset = binary[j];
        const metadata = binary[j + 1];
        const endOffset = j + 2 < binary.length ? binary[j + 2] : line.length;
        if (endOffset > startOffset) {
          tokens.push({
            length: endOffset - startOffset,
            foreground: TokenMetadata.getForeground(metadata),
            fontStyle: TokenMetadata.getFontStyle(metadata)
          });
        }
      }
      if (i2 < lines.length - 1) {
        tokens.push({ length: 1, foreground: 0, fontStyle: 0 /* None */ });
      }
    }
    return { tokens, colorMap };
  }
  // --- language status
  $setLanguageStatus(handle2, status2) {
    this._status.set(handle2, this._languageStatusService.addStatus(status2));
  }
  $removeLanguageStatus(handle2) {
    this._status.deleteAndDispose(handle2);
  }
};

MainThreadLanguages = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadLanguages),
  __decorateParam(1, ILanguageService),
  __decorateParam(2, IModelService),
  __decorateParam(3, ITextModelService),
  __decorateParam(4, ILanguageStatusService),
  __decorateParam(5, ITextMateTokenizationService),
  __decorateParam(6, IThemeService)
], MainThreadLanguages);
export { MainThreadLanguages };
