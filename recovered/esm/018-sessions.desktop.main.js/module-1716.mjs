// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/textMate/browser/textMateTokenizationFeatureImpl.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { ThreadedBackgroundTokenizerFactory } from "./module-1712.mjs";
import { createStyleSheet } from "./module-0224.mjs";
import { grammarsExtPoint } from "./module-1715.mjs";
import { LazyTokenizationSupport, TokenizationRegistry2 } from "./module-0164.mjs";
import { isEqualOrParent2, joinPath } from "./module-0034.mjs";
import { localize } from "./module-0001.mjs";
import { importAMDNodeModule, resolveAmdNodeModulePath } from "./module-0191.mjs";
import { TMGrammarFactory, missingTMGrammarErrorMessage } from "./module-1714.mjs";
import { TextMateTokenizationSupport } from "./module-1707.mjs";
import { TokenizationSupportWithLineLimit } from "./module-1708.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { equals } from "./module-0007.mjs";
import { generateTokensCSSForColorMap, generateTokensCSSForFontMap } from "./module-0401.mjs";
import { isWeb } from "./module-0014.mjs";
import { FileAccess, nodeModulesAsarUnpackedPath, nodeModulesPath } from "./module-0033.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { IWorkbenchThemeService } from "./module-0917.mjs";
import { IExtensionResourceLoaderService } from "./module-0893.mjs";
import { INotificationService } from "./module-0336.mjs";
import { ILogService } from "./module-0095.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IProgressService } from "./module-0446.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { Color } from "./module-0197.mjs";
import { isObject } from "./module-0010.mjs";
import { observableFromEvent } from "./module-0057.mjs";


// src/vs/workbench/services/textMate/browser/textMateTokenizationFeatureImpl.ts
var TextMateTokenizationFeature = class extends Disposable {
  constructor(_languageService, _themeService, _extensionResourceLoaderService, _notificationService, _logService, _configurationService, _progressService, _environmentService, _instantiationService, _telemetryService) {
    super();
    this._languageService = _languageService;
    this._themeService = _themeService;
    this._extensionResourceLoaderService = _extensionResourceLoaderService;
    this._notificationService = _notificationService;
    this._logService = _logService;
    this._configurationService = _configurationService;
    this._progressService = _progressService;
    this._environmentService = _environmentService;
    this._instantiationService = _instantiationService;
    this._telemetryService = _telemetryService;
    this._createdModes = [];
    this._encounteredLanguages = [];
    this._debugMode = false;
    this._debugModePrintFunc = () => {
    };
    this._grammarDefinitions = null;
    this._grammarFactory = null;
    this._tokenizersRegistrations = this._register(new DisposableStore());
    this._currentTheme = null;
    this._currentTokenColorMap = null;
    this._currentTokenFontMap = null;
    this._threadedBackgroundTokenizerFactory = this._instantiationService.createInstance(
      ThreadedBackgroundTokenizerFactory,
      (timeMs, languageId, sourceExtensionId, lineLength, isRandomSample) => this._reportTokenizationTime(timeMs, languageId, sourceExtensionId, lineLength, true, isRandomSample),
      () => this.getAsyncTokenizationEnabled()
    );
    this._vscodeOniguruma = null;
    this._styleElement = createStyleSheet();
    this._styleElement.className = "vscode-tokens-styles";
    grammarsExtPoint.setHandler((extensions) => this._handleGrammarsExtPoint(extensions));
    this._updateTheme(this._themeService.getColorTheme(), true);
    this._register(this._themeService.onDidColorThemeChange(() => {
      this._updateTheme(this._themeService.getColorTheme(), false);
    }));
    this._register(this._languageService.onDidRequestRichLanguageFeatures((languageId) => {
      this._createdModes.push(languageId);
    }));
  }
  static {
    this.reportTokenizationTimeCounter = { sync: 0, async: 0 };
  }
  getAsyncTokenizationEnabled() {
    return !!this._configurationService.getValue("editor.experimental.asyncTokenization");
  }
  getAsyncTokenizationVerification() {
    return !!this._configurationService.getValue("editor.experimental.asyncTokenizationVerification");
  }
  _handleGrammarsExtPoint(extensions) {
    this._grammarDefinitions = null;
    if (this._grammarFactory) {
      this._grammarFactory.dispose();
      this._grammarFactory = null;
    }
    this._tokenizersRegistrations.clear();
    this._grammarDefinitions = [];
    for (const extension of extensions) {
      const grammars = extension.value;
      for (const grammar of grammars) {
        const validatedGrammar = this._validateGrammarDefinition(extension, grammar);
        if (validatedGrammar) {
          this._grammarDefinitions.push(validatedGrammar);
          if (validatedGrammar.language) {
            const lazyTokenizationSupport = new LazyTokenizationSupport(() => this._createTokenizationSupport(validatedGrammar.language));
            this._tokenizersRegistrations.add(lazyTokenizationSupport);
            this._tokenizersRegistrations.add(TokenizationRegistry2.registerFactory(validatedGrammar.language, lazyTokenizationSupport));
          }
        }
      }
    }
    this._threadedBackgroundTokenizerFactory.setGrammarDefinitions(this._grammarDefinitions);
    for (const createdMode of this._createdModes) {
      TokenizationRegistry2.getOrCreate(createdMode);
    }
  }
  _validateGrammarDefinition(extension, grammar) {
    if (!validateGrammarExtensionPoint(extension.description.extensionLocation, grammar, extension.collector, this._languageService)) {
      return null;
    }
    const grammarLocation = joinPath(extension.description.extensionLocation, grammar.path);
    const embeddedLanguages = /* @__PURE__ */ Object.create(null);
    if (grammar.embeddedLanguages) {
      const scopes = Object.keys(grammar.embeddedLanguages);
      for (let i2 = 0, len = scopes.length; i2 < len; i2++) {
        const scope = scopes[i2];
        const language2 = grammar.embeddedLanguages[scope];
        if (typeof language2 !== "string") {
          continue;
        }
        if (this._languageService.isRegisteredLanguageId(language2)) {
          embeddedLanguages[scope] = this._languageService.languageIdCodec.encodeLanguageId(language2);
        }
      }
    }
    const tokenTypes = /* @__PURE__ */ Object.create(null);
    if (grammar.tokenTypes) {
      const scopes = Object.keys(grammar.tokenTypes);
      for (const scope of scopes) {
        const tokenType = grammar.tokenTypes[scope];
        switch (tokenType) {
          case "string":
            tokenTypes[scope] = 2 /* String */;
            break;
          case "other":
            tokenTypes[scope] = 0 /* Other */;
            break;
          case "comment":
            tokenTypes[scope] = 1 /* Comment */;
            break;
          case "regex":
            tokenTypes[scope] = 3 /* RegEx */;
            break;
        }
      }
    }
    const validLanguageId = grammar.language && this._languageService.isRegisteredLanguageId(grammar.language) ? grammar.language : void 0;
    function asStringArray(array3, defaultValue) {
      if (!Array.isArray(array3)) {
        return defaultValue;
      }
      if (!array3.every((e4) => typeof e4 === "string")) {
        return defaultValue;
      }
      return array3;
    }
    return {
      location: grammarLocation,
      language: validLanguageId,
      scopeName: grammar.scopeName,
      embeddedLanguages,
      tokenTypes,
      injectTo: grammar.injectTo,
      balancedBracketSelectors: asStringArray(grammar.balancedBracketScopes, ["*"]),
      unbalancedBracketSelectors: asStringArray(grammar.unbalancedBracketScopes, []),
      sourceExtensionId: extension.description.id
    };
  }
  startDebugMode(printFn, onStop) {
    if (this._debugMode) {
      this._notificationService.error(localize(23387, null));
      return;
    }
    this._debugModePrintFunc = printFn;
    this._debugMode = true;
    if (this._debugMode) {
      this._progressService.withProgress(
        {
          location: 15 /* Notification */,
          buttons: [localize(23397, null)]
        },
        (progress) => {
          progress.report({
            message: localize(23395, null)
          });
          return this._getVSCodeOniguruma().then((vscodeOniguruma) => {
            vscodeOniguruma.setDefaultDebugCall(true);
            progress.report({
              message: localize(23396, null)
            });
            return new Promise((resolve3, reject) => {
            });
          });
        },
        (choice) => {
          this._getVSCodeOniguruma().then((vscodeOniguruma) => {
            this._debugModePrintFunc = () => {
            };
            this._debugMode = false;
            vscodeOniguruma.setDefaultDebugCall(false);
            onStop();
          });
        }
      );
    }
  }
  _canCreateGrammarFactory() {
    return !!this._grammarDefinitions;
  }
  async _getOrCreateGrammarFactory() {
    if (this._grammarFactory) {
      return this._grammarFactory;
    }
    const [vscodeTextmate, vscodeOniguruma] = await Promise.all([importAMDNodeModule("vscode-textmate", "release/main.js"), this._getVSCodeOniguruma()]);
    const onigLib = Promise.resolve({
      createOnigScanner: (sources) => vscodeOniguruma.createOnigScanner(sources),
      createOnigString: (str) => vscodeOniguruma.createOnigString(str)
    });
    if (this._grammarFactory) {
      return this._grammarFactory;
    }
    this._grammarFactory = new TMGrammarFactory({
      logTrace: (msg) => this._logService.trace(msg),
      logError: (msg, err) => this._logService.error(msg, err),
      readFile: (resource) => this._extensionResourceLoaderService.readExtensionResource(resource)
    }, this._grammarDefinitions || [], vscodeTextmate, onigLib);
    this._updateTheme(this._themeService.getColorTheme(), true);
    return this._grammarFactory;
  }
  async _createTokenizationSupport(languageId) {
    if (!this._languageService.isRegisteredLanguageId(languageId)) {
      return null;
    }
    if (!this._canCreateGrammarFactory()) {
      return null;
    }
    try {
      const grammarFactory = await this._getOrCreateGrammarFactory();
      if (!grammarFactory.has(languageId)) {
        return null;
      }
      const encodedLanguageId = this._languageService.languageIdCodec.encodeLanguageId(languageId);
      const r2 = await grammarFactory.createGrammar(languageId, encodedLanguageId);
      if (!r2.grammar) {
        return null;
      }
      const maxTokenizationLineLength = observableConfigValue2(
        "editor.maxTokenizationLineLength",
        languageId,
        -1,
        this._configurationService
      );
      const store = new DisposableStore();
      const tokenization = store.add(new TextMateTokenizationSupport(
        r2.grammar,
        r2.initialState,
        r2.containsEmbeddedLanguages,
        (textModel, tokenStore) => this._threadedBackgroundTokenizerFactory.createBackgroundTokenizer(textModel, tokenStore, maxTokenizationLineLength),
        () => this.getAsyncTokenizationVerification(),
        (timeMs, lineLength, isRandomSample) => {
          this._reportTokenizationTime(timeMs, languageId, r2.sourceExtensionId, lineLength, false, isRandomSample);
        },
        true
      ));
      store.add(tokenization.onDidEncounterLanguage((encodedLanguageId2) => {
        if (!this._encounteredLanguages[encodedLanguageId2]) {
          const languageId2 = this._languageService.languageIdCodec.decodeLanguageId(encodedLanguageId2);
          this._encounteredLanguages[encodedLanguageId2] = true;
          this._languageService.requestBasicLanguageFeatures(languageId2);
        }
      }));
      return new TokenizationSupportWithLineLimit(encodedLanguageId, tokenization, store, maxTokenizationLineLength);
    } catch (err) {
      if (err.message && err.message === missingTMGrammarErrorMessage) {
        return null;
      }
      onUnexpectedError(err);
      return null;
    }
  }
  _updateTheme(colorTheme, forceUpdate) {
    if (!forceUpdate && this._currentTheme && this._currentTokenColorMap && equalsTokenRules(this._currentTheme.settings, colorTheme.tokenColors) && equals(this._currentTokenColorMap, colorTheme.tokenColorMap) && this._currentTokenFontMap && equals(this._currentTokenFontMap, colorTheme.tokenFontMap)) {
      return;
    }
    this._currentTheme = { name: colorTheme.label, settings: colorTheme.tokenColors };
    this._currentTokenColorMap = colorTheme.tokenColorMap;
    this._currentTokenFontMap = colorTheme.tokenFontMap;
    this._grammarFactory?.setTheme(this._currentTheme, this._currentTokenColorMap);
    const colorMap = toColorMap(this._currentTokenColorMap);
    const colorCssRules = generateTokensCSSForColorMap(colorMap);
    const fontCssRules = generateTokensCSSForFontMap(this._currentTokenFontMap);
    this._styleElement.textContent = colorCssRules + fontCssRules;
    TokenizationRegistry2.setColorMap(colorMap);
    if (this._currentTheme && this._currentTokenColorMap) {
      this._threadedBackgroundTokenizerFactory.acceptTheme(this._currentTheme, this._currentTokenColorMap);
    }
  }
  async createTokenizer(languageId) {
    if (!this._languageService.isRegisteredLanguageId(languageId)) {
      return null;
    }
    const grammarFactory = await this._getOrCreateGrammarFactory();
    if (!grammarFactory.has(languageId)) {
      return null;
    }
    const encodedLanguageId = this._languageService.languageIdCodec.encodeLanguageId(languageId);
    const { grammar } = await grammarFactory.createGrammar(languageId, encodedLanguageId);
    return grammar;
  }
  _getVSCodeOniguruma() {
    if (!this._vscodeOniguruma) {
      this._vscodeOniguruma = (async () => {
        try {
          const [vscodeOniguruma, wasm] = await Promise.all([importAMDNodeModule("vscode-oniguruma", "release/main.js"), this._loadVSCodeOnigurumaWASM()]);
          await vscodeOniguruma.loadWASM({
            data: wasm,
            print: (str) => {
              this._debugModePrintFunc(str);
            }
          });
          return vscodeOniguruma;
        } catch (err) {
          this._vscodeOniguruma = null;
          throw err;
        }
      })();
    }
    return this._vscodeOniguruma;
  }
  async _loadVSCodeOnigurumaWASM() {
    if (isWeb) {
      const response = await fetch(resolveAmdNodeModulePath("vscode-oniguruma", "release/onig.wasm"));
      return await response.arrayBuffer();
    } else {
      const response = await fetch(this._environmentService.isBuilt ? FileAccess.asBrowserUri(`${nodeModulesAsarUnpackedPath}/vscode-oniguruma/release/onig.wasm`).toString(true) : FileAccess.asBrowserUri(`${nodeModulesPath}/vscode-oniguruma/release/onig.wasm`).toString(true));
      return response;
    }
  }
  _reportTokenizationTime(timeMs, languageId, sourceExtensionId, lineLength, fromWorker, isRandomSample) {
    const key3 = fromWorker ? "async" : "sync";
    if (TextMateTokenizationFeature.reportTokenizationTimeCounter[key3] > 50) {
      return;
    }
    if (TextMateTokenizationFeature.reportTokenizationTimeCounter[key3] === 0) {
      setTimeout(() => {
        TextMateTokenizationFeature.reportTokenizationTimeCounter[key3] = 0;
      }, 1e3 * 60 * 60);
    }
    TextMateTokenizationFeature.reportTokenizationTimeCounter[key3]++;
    this._telemetryService.publicLog2("editor.tokenizedLine", {
      timeMs,
      languageId,
      lineLength,
      fromWorker,
      sourceExtensionId,
      isRandomSample,
      tokenizationSetting: this.getAsyncTokenizationEnabled() ? this.getAsyncTokenizationVerification() ? 2 : 1 : 0
    });
  }
};

TextMateTokenizationFeature = __decorateClass([
  __decorateParam(0, ILanguageService),
  __decorateParam(1, IWorkbenchThemeService),
  __decorateParam(2, IExtensionResourceLoaderService),
  __decorateParam(3, INotificationService),
  __decorateParam(4, ILogService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, IProgressService),
  __decorateParam(7, IWorkbenchEnvironmentService),
  __decorateParam(8, IInstantiationService),
  __decorateParam(9, ITelemetryService)
], TextMateTokenizationFeature);

function toColorMap(colorMap) {
  const result = [null];
  for (let i2 = 1, len = colorMap.length; i2 < len; i2++) {
    result[i2] = Color.fromHex(colorMap[i2]);
  }
  return result;
}

function equalsTokenRules(a, b) {
  if (!b || !a || b.length !== a.length) {
    return false;
  }
  for (let i2 = b.length - 1; i2 >= 0; i2--) {
    const r1 = b[i2];
    const r2 = a[i2];
    if (r1.scope !== r2.scope) {
      return false;
    }
    const s1 = r1.settings;
    const s2 = r2.settings;
    if (s1 && s2) {
      if (s1.fontStyle !== s2.fontStyle || s1.foreground !== s2.foreground || s1.background !== s2.background || s1.lineHeight !== s2.lineHeight || s1.fontSize !== s2.fontSize || s1.fontFamily !== s2.fontFamily) {
        return false;
      }
    } else if (!s1 || !s2) {
      return false;
    }
  }
  return true;
}

function validateGrammarExtensionPoint(extensionLocation, syntax, collector, _languageService) {
  if (syntax.language && (typeof syntax.language !== "string" || !_languageService.isRegisteredLanguageId(syntax.language))) {
    collector.error(localize(23390, null, grammarsExtPoint.name, String(syntax.language)));
    return false;
  }
  if (!syntax.scopeName || typeof syntax.scopeName !== "string") {
    collector.error(localize(23393, null, grammarsExtPoint.name, String(syntax.scopeName)));
    return false;
  }
  if (!syntax.path || typeof syntax.path !== "string") {
    collector.error(localize(23391, null, grammarsExtPoint.name, String(syntax.path)));
    return false;
  }
  if (syntax.injectTo && (!Array.isArray(syntax.injectTo) || syntax.injectTo.some((scope) => typeof scope !== "string"))) {
    collector.error(localize(23389, null, grammarsExtPoint.name, JSON.stringify(syntax.injectTo)));
    return false;
  }
  if (syntax.embeddedLanguages && !isObject(syntax.embeddedLanguages)) {
    collector.error(localize(23388, null, grammarsExtPoint.name, JSON.stringify(syntax.embeddedLanguages)));
    return false;
  }
  if (syntax.tokenTypes && !isObject(syntax.tokenTypes)) {
    collector.error(localize(23394, null, grammarsExtPoint.name, JSON.stringify(syntax.tokenTypes)));
    return false;
  }
  const grammarLocation = joinPath(extensionLocation, syntax.path);
  if (!isEqualOrParent2(grammarLocation, extensionLocation)) {
    collector.warn(localize(23392, null, grammarsExtPoint.name, grammarLocation.path, extensionLocation.path));
  }
  return true;
}

function observableConfigValue2(key3, languageId, defaultValue, configurationService) {
  return observableFromEvent(
    (handleChange) => configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration(key3, { overrideIdentifier: languageId })) {
        handleChange(e4);
      }
    }),
    () => configurationService.getValue(key3, { overrideIdentifier: languageId }) ?? defaultValue
  );
}
export { toColorMap, equalsTokenRules, validateGrammarExtensionPoint, observableConfigValue2, TextMateTokenizationFeature };
