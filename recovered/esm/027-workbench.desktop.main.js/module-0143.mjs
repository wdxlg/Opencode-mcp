// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/languages/languageConfigurationRegistry.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable, markAsSingleton, toDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { getLeadingWhitespace } from "./module-0030.mjs";
import { PLAINTEXT_LANGUAGE_ID } from "./module-0141.mjs";
import { OnEnterSupport } from "./module-0131.mjs";
import { CharacterPairSupport } from "./module-0126.mjs";
import { DEFAULT_WORD_REGEXP, ensureValidWordDefinition } from "./module-0103.mjs";
import { IndentRulesSupport } from "./module-0130.mjs";
import { LanguageBracketsConfiguration } from "./module-0142.mjs";
import { RichEditBrackets } from "./module-0128.mjs";
import { BracketElectricCharacterSupport } from "./module-0129.mjs";
import { AutoClosingPairs } from "./module-0125.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/editor/common/languages/languageConfigurationRegistry.ts
var LanguageConfigurationServiceChangeEvent = class {
  constructor(languageId) {
    this.languageId = languageId;
  }
  affects(languageId) {
    return !this.languageId ? true : this.languageId === languageId;
  }
};

var ILanguageConfigurationService = createDecorator("languageConfigurationService");

var LanguageConfigurationService = class extends Disposable {
  constructor(configurationService, languageService) {
    super();
    this.configurationService = configurationService;
    this.languageService = languageService;
    this._registry = this._register(new LanguageConfigurationRegistry());
    this.onDidChangeEmitter = this._register(new Emitter({
      leakWarningThreshold: 500,
      leakWarningName: "LanguageConfigurationService.onDidChange"
      /* increased for multi-diff editors with hundreds of text models */
    }));
    this.onDidChange = this.onDidChangeEmitter.event;
    this.configurations = /* @__PURE__ */ new Map();
    const languageConfigKeys = new Set(Object.values(customizedLanguageConfigKeys));
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      const globalConfigChanged = e.change.keys.some(
        (k) => languageConfigKeys.has(k)
      );
      const localConfigChanged = e.change.overrides.filter(
        ([overrideLangName, keys]) => keys.some((k) => languageConfigKeys.has(k))
      ).map(([overrideLangName]) => overrideLangName);
      if (globalConfigChanged) {
        this.configurations.clear();
        this.onDidChangeEmitter.fire(new LanguageConfigurationServiceChangeEvent(void 0));
      } else {
        for (const languageId of localConfigChanged) {
          if (this.languageService.isRegisteredLanguageId(languageId)) {
            this.configurations.delete(languageId);
            this.onDidChangeEmitter.fire(new LanguageConfigurationServiceChangeEvent(languageId));
          }
        }
      }
    }));
    this._register(this._registry.onDidChange((e) => {
      this.configurations.delete(e.languageId);
      this.onDidChangeEmitter.fire(new LanguageConfigurationServiceChangeEvent(e.languageId));
    }));
  }
  register(languageId, configuration2, priority) {
    return this._registry.register(languageId, configuration2, priority);
  }
  getLanguageConfiguration(languageId) {
    let result = this.configurations.get(languageId);
    if (!result) {
      result = computeConfig(languageId, this._registry, this.configurationService, this.languageService);
      this.configurations.set(languageId, result);
    }
    return result;
  }
};

LanguageConfigurationService = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, ILanguageService)
], LanguageConfigurationService);

function computeConfig(languageId, registry4, configurationService, languageService) {
  let languageConfig = registry4.getLanguageConfiguration(languageId);
  if (!languageConfig) {
    if (!languageService.isRegisteredLanguageId(languageId)) {
      return new ResolvedLanguageConfiguration(languageId, {});
    }
    languageConfig = new ResolvedLanguageConfiguration(languageId, {});
  }
  const customizedConfig = getCustomizedLanguageConfig(languageConfig.languageId, configurationService);
  const data = combineLanguageConfigurations([languageConfig.underlyingConfig, customizedConfig]);
  const config = new ResolvedLanguageConfiguration(languageConfig.languageId, data);
  return config;
}

var customizedLanguageConfigKeys = {
  brackets: "editor.language.brackets",
  colorizedBracketPairs: "editor.language.colorizedBracketPairs"
};

function getCustomizedLanguageConfig(languageId, configurationService) {
  const brackets = configurationService.getValue(customizedLanguageConfigKeys.brackets, {
    overrideIdentifier: languageId
  });
  const colorizedBracketPairs = configurationService.getValue(customizedLanguageConfigKeys.colorizedBracketPairs, {
    overrideIdentifier: languageId
  });
  return {
    brackets: validateBracketPairs(brackets),
    colorizedBracketPairs: validateBracketPairs(colorizedBracketPairs)
  };
}

function validateBracketPairs(data) {
  if (!Array.isArray(data)) {
    return void 0;
  }
  return data.map((pair) => {
    if (!Array.isArray(pair) || pair.length !== 2) {
      return void 0;
    }
    return [pair[0], pair[1]];
  }).filter((p) => !!p);
}

function getIndentationAtPosition(model, lineNumber, column) {
  const lineText = model.getLineContent(lineNumber);
  let indentation = getLeadingWhitespace(lineText);
  if (indentation.length > column - 1) {
    indentation = indentation.substring(0, column - 1);
  }
  return indentation;
}

var ComposedLanguageConfiguration = class {
  constructor(languageId) {
    this.languageId = languageId;
    this._resolved = null;
    this._entries = [];
    this._order = 0;
    this._resolved = null;
  }
  register(configuration2, priority) {
    const entry = new LanguageConfigurationContribution(
      configuration2,
      priority,
      ++this._order
    );
    this._entries.push(entry);
    this._resolved = null;
    return markAsSingleton(toDisposable(() => {
      for (let i2 = 0; i2 < this._entries.length; i2++) {
        if (this._entries[i2] === entry) {
          this._entries.splice(i2, 1);
          this._resolved = null;
          break;
        }
      }
    }));
  }
  getResolvedConfiguration() {
    if (!this._resolved) {
      const config = this._resolve();
      if (config) {
        this._resolved = new ResolvedLanguageConfiguration(
          this.languageId,
          config
        );
      }
    }
    return this._resolved;
  }
  _resolve() {
    if (this._entries.length === 0) {
      return null;
    }
    this._entries.sort(LanguageConfigurationContribution.cmp);
    return combineLanguageConfigurations(this._entries.map((e) => e.configuration));
  }
};

function combineLanguageConfigurations(configs) {
  let result = {
    comments: void 0,
    brackets: void 0,
    wordPattern: void 0,
    indentationRules: void 0,
    onEnterRules: void 0,
    autoClosingPairs: void 0,
    surroundingPairs: void 0,
    autoCloseBefore: void 0,
    folding: void 0,
    colorizedBracketPairs: void 0,
    __electricCharacterSupport: void 0
  };
  for (const entry of configs) {
    result = {
      comments: entry.comments || result.comments,
      brackets: entry.brackets || result.brackets,
      wordPattern: entry.wordPattern || result.wordPattern,
      indentationRules: entry.indentationRules || result.indentationRules,
      onEnterRules: entry.onEnterRules || result.onEnterRules,
      autoClosingPairs: entry.autoClosingPairs || result.autoClosingPairs,
      surroundingPairs: entry.surroundingPairs || result.surroundingPairs,
      autoCloseBefore: entry.autoCloseBefore || result.autoCloseBefore,
      folding: entry.folding || result.folding,
      colorizedBracketPairs: entry.colorizedBracketPairs || result.colorizedBracketPairs,
      __electricCharacterSupport: entry.__electricCharacterSupport || result.__electricCharacterSupport
    };
  }
  return result;
}

var LanguageConfigurationContribution = class {
  constructor(configuration2, priority, order) {
    this.configuration = configuration2;
    this.priority = priority;
    this.order = order;
  }
  static cmp(a, b) {
    if (a.priority === b.priority) {
      return a.order - b.order;
    }
    return a.priority - b.priority;
  }
};

var LanguageConfigurationChangeEvent = class {
  constructor(languageId) {
    this.languageId = languageId;
  }
};

var LanguageConfigurationRegistry = class extends Disposable {
  constructor() {
    super();
    this._entries = /* @__PURE__ */ new Map();
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this._register(this.register(PLAINTEXT_LANGUAGE_ID, {
      brackets: [
        ["(", ")"],
        ["[", "]"],
        ["{", "}"]
      ],
      surroundingPairs: [
        { open: "{", close: "}" },
        { open: "[", close: "]" },
        { open: "(", close: ")" },
        { open: "<", close: ">" },
        { open: '"', close: '"' },
        { open: "'", close: "'" },
        { open: "`", close: "`" }
      ],
      colorizedBracketPairs: [],
      folding: {
        offSide: true
      }
    }, 0));
  }
  /**
   * @param priority Use a higher number for higher priority
   */
  register(languageId, configuration2, priority = 0) {
    let entries2 = this._entries.get(languageId);
    if (!entries2) {
      entries2 = new ComposedLanguageConfiguration(languageId);
      this._entries.set(languageId, entries2);
    }
    const disposable = entries2.register(configuration2, priority);
    this._onDidChange.fire(new LanguageConfigurationChangeEvent(languageId));
    return markAsSingleton(toDisposable(() => {
      disposable.dispose();
      this._onDidChange.fire(new LanguageConfigurationChangeEvent(languageId));
    }));
  }
  getLanguageConfiguration(languageId) {
    const entries2 = this._entries.get(languageId);
    return entries2?.getResolvedConfiguration() || null;
  }
};

var ResolvedLanguageConfiguration = class _ResolvedLanguageConfiguration {
  constructor(languageId, underlyingConfig) {
    this.languageId = languageId;
    this.underlyingConfig = underlyingConfig;
    this._brackets = null;
    this._electricCharacter = null;
    this._onEnterSupport = this.underlyingConfig.brackets || this.underlyingConfig.indentationRules || this.underlyingConfig.onEnterRules ? new OnEnterSupport(this.underlyingConfig) : null;
    this.comments = _ResolvedLanguageConfiguration._handleComments(this.underlyingConfig);
    this.characterPair = new CharacterPairSupport(this.underlyingConfig);
    this.wordDefinition = this.underlyingConfig.wordPattern || DEFAULT_WORD_REGEXP;
    this.indentationRules = this.underlyingConfig.indentationRules;
    if (this.underlyingConfig.indentationRules) {
      this.indentRulesSupport = new IndentRulesSupport(
        this.underlyingConfig.indentationRules
      );
    } else {
      this.indentRulesSupport = null;
    }
    this.foldingRules = this.underlyingConfig.folding || {};
    this.bracketsNew = new LanguageBracketsConfiguration(
      languageId,
      this.underlyingConfig
    );
  }
  getWordDefinition() {
    return ensureValidWordDefinition(this.wordDefinition);
  }
  get brackets() {
    if (!this._brackets && this.underlyingConfig.brackets) {
      this._brackets = new RichEditBrackets(
        this.languageId,
        this.underlyingConfig.brackets
      );
    }
    return this._brackets;
  }
  get electricCharacter() {
    if (!this._electricCharacter) {
      this._electricCharacter = new BracketElectricCharacterSupport(
        this.brackets
      );
    }
    return this._electricCharacter;
  }
  onEnter(autoIndent, previousLineText, beforeEnterText, afterEnterText) {
    if (!this._onEnterSupport) {
      return null;
    }
    return this._onEnterSupport.onEnter(
      autoIndent,
      previousLineText,
      beforeEnterText,
      afterEnterText
    );
  }
  getAutoClosingPairs() {
    return new AutoClosingPairs(this.characterPair.getAutoClosingPairs());
  }
  getAutoCloseBeforeSet(forQuotes) {
    return this.characterPair.getAutoCloseBeforeSet(forQuotes);
  }
  getSurroundingPairs() {
    return this.characterPair.getSurroundingPairs();
  }
  static _handleComments(conf) {
    const commentRule = conf.comments;
    if (!commentRule) {
      return null;
    }
    const comments = {};
    if (commentRule.lineComment) {
      if (typeof commentRule.lineComment === "string") {
        comments.lineCommentToken = commentRule.lineComment;
      } else {
        comments.lineCommentToken = commentRule.lineComment.comment;
        comments.lineCommentNoIndent = commentRule.lineComment.noIndent;
      }
    }
    if (commentRule.blockComment) {
      const [blockStart, blockEnd] = commentRule.blockComment;
      comments.blockCommentStartToken = blockStart;
      comments.blockCommentEndToken = blockEnd;
    }
    return comments;
  }
};

registerSingleton(ILanguageConfigurationService, LanguageConfigurationService, 1 /* Delayed */);
export { computeConfig, getCustomizedLanguageConfig, validateBracketPairs, getIndentationAtPosition, combineLanguageConfigurations, LanguageConfigurationServiceChangeEvent, ILanguageConfigurationService, LanguageConfigurationService, customizedLanguageConfigKeys, ComposedLanguageConfiguration, LanguageConfigurationContribution, LanguageConfigurationChangeEvent, LanguageConfigurationRegistry, ResolvedLanguageConfiguration };
