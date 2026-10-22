// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/textMate/common/TMGrammarFactory.ts
import { Disposable } from "./module-0012.mjs";
import { TMScopeRegistry } from "./module-1771.mjs";


// src/vs/workbench/services/textMate/common/TMGrammarFactory.ts
var missingTMGrammarErrorMessage = "No TM Grammar registered for this language.";

var TMGrammarFactory = class extends Disposable {
  constructor(host, grammarDefinitions, vscodeTextmate, onigLib) {
    super();
    this._host = host;
    this._initialState = vscodeTextmate.INITIAL;
    this._scopeRegistry = new TMScopeRegistry();
    this._injections = {};
    this._injectedEmbeddedLanguages = {};
    this._languageToScope = /* @__PURE__ */ new Map();
    this._grammarRegistry = this._register(new vscodeTextmate.Registry({
      onigLib,
      loadGrammar: async (scopeName) => {
        const grammarDefinition = this._scopeRegistry.getGrammarDefinition(scopeName);
        if (!grammarDefinition) {
          this._host.logTrace(`No grammar found for scope ${scopeName}`);
          return null;
        }
        const location2 = grammarDefinition.location;
        try {
          const content2 = await this._host.readFile(location2);
          return vscodeTextmate.parseRawGrammar(content2, location2.path);
        } catch (e) {
          this._host.logError(`Unable to load and parse grammar for scope ${scopeName} from ${location2}`, e);
          return null;
        }
      },
      getInjections: (scopeName) => {
        const scopeParts = scopeName.split(".");
        let injections = [];
        for (let i2 = 1; i2 <= scopeParts.length; i2++) {
          const subScopeName = scopeParts.slice(0, i2).join(".");
          injections = [...injections, ...this._injections[subScopeName] || []];
        }
        return injections;
      }
    }));
    for (const validGrammar of grammarDefinitions) {
      this._scopeRegistry.register(validGrammar);
      if (validGrammar.injectTo) {
        for (const injectScope of validGrammar.injectTo) {
          let injections = this._injections[injectScope];
          if (!injections) {
            this._injections[injectScope] = injections = [];
          }
          injections.push(validGrammar.scopeName);
        }
        if (validGrammar.embeddedLanguages) {
          for (const injectScope of validGrammar.injectTo) {
            let injectedEmbeddedLanguages = this._injectedEmbeddedLanguages[injectScope];
            if (!injectedEmbeddedLanguages) {
              this._injectedEmbeddedLanguages[injectScope] = injectedEmbeddedLanguages = [];
            }
            injectedEmbeddedLanguages.push(validGrammar.embeddedLanguages);
          }
        }
      }
      if (validGrammar.language) {
        this._languageToScope.set(validGrammar.language, validGrammar.scopeName);
      }
    }
  }
  has(languageId) {
    return this._languageToScope.has(languageId);
  }
  setTheme(theme, colorMap) {
    this._grammarRegistry.setTheme(theme, colorMap);
  }
  getColorMap() {
    return this._grammarRegistry.getColorMap();
  }
  async createGrammar(languageId, encodedLanguageId) {
    const scopeName = this._languageToScope.get(languageId);
    if (typeof scopeName !== "string") {
      throw new Error(missingTMGrammarErrorMessage);
    }
    const grammarDefinition = this._scopeRegistry.getGrammarDefinition(scopeName);
    if (!grammarDefinition) {
      throw new Error(missingTMGrammarErrorMessage);
    }
    const embeddedLanguages = grammarDefinition.embeddedLanguages;
    if (this._injectedEmbeddedLanguages[scopeName]) {
      const injectedEmbeddedLanguages = this._injectedEmbeddedLanguages[scopeName];
      for (const injected of injectedEmbeddedLanguages) {
        for (const scope of Object.keys(injected)) {
          embeddedLanguages[scope] = injected[scope];
        }
      }
    }
    const containsEmbeddedLanguages = Object.keys(embeddedLanguages).length > 0;
    let grammar;
    try {
      grammar = await this._grammarRegistry.loadGrammarWithConfiguration(
        scopeName,
        encodedLanguageId,
        {
          embeddedLanguages,
          // eslint-disable-next-line local/code-no-any-casts
          tokenTypes: grammarDefinition.tokenTypes,
          balancedBracketSelectors: grammarDefinition.balancedBracketSelectors,
          unbalancedBracketSelectors: grammarDefinition.unbalancedBracketSelectors
        }
      );
    } catch (err) {
      if (err.message && err.message.startsWith("No grammar provided for")) {
        throw new Error(missingTMGrammarErrorMessage);
      }
      throw err;
    }
    return {
      languageId,
      grammar,
      initialState: this._initialState,
      containsEmbeddedLanguages,
      sourceExtensionId: grammarDefinition.sourceExtensionId
    };
  }
};
export { missingTMGrammarErrorMessage, TMGrammarFactory };
