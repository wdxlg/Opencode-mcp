// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/codeEditor/browser/inspectEditorTokens/inspectEditorTokens.ts
import { $, append, clearNode, isHTMLElement, reset } from "./module-0075.mjs";
import { Disposable } from "./module-0012.mjs";
import { Schemas } from "./module-0033.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITextMateTokenizationService } from "./module-1226.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { IWorkbenchThemeService } from "./module-0916.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { EditorAction, registerEditorAction, registerEditorContribution } from "./module-0097.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { TreeSitterSyntaxTokenBackend } from "./module-0418.mjs";
import { SEMANTIC_HIGHLIGHTING_SETTING_ID } from "./module-0842.mjs";
import { findMatchingThemeRule } from "./module-2276.mjs";
import { Color } from "./module-0197.mjs";
import { TokenMetadata } from "./module-0108.mjs";
import { Range2 } from "./module-0106.mjs";
import { SemanticTokenRule } from "./module-0881.mjs";


// src/vs/workbench/contrib/codeEditor/browser/inspectEditorTokens/inspectEditorTokens.ts
var $45 = $;

var InspectEditorTokensController = class extends Disposable {
  static {
    this.ID = "editor.contrib.inspectEditorTokens";
  }
  static get(editor) {
    return editor.getContribution(InspectEditorTokensController.ID);
  }
  constructor(editor, textMateService, languageService, themeService, notificationService, configurationService, languageFeaturesService) {
    super();
    this._editor = editor;
    this._textMateService = textMateService;
    this._themeService = themeService;
    this._languageService = languageService;
    this._notificationService = notificationService;
    this._configurationService = configurationService;
    this._languageFeaturesService = languageFeaturesService;
    this._widget = null;
    this._register(this._editor.onDidChangeModel((e) => this.stop()));
    this._register(this._editor.onDidChangeModelLanguage((e) => this.stop()));
    this._register(this._editor.onKeyUp((e) => e.keyCode === 9 /* Escape */ && this.stop()));
  }
  dispose() {
    this.stop();
    super.dispose();
  }
  launch() {
    if (this._widget) {
      return;
    }
    if (!this._editor.hasModel()) {
      return;
    }
    if (this._editor.getModel().uri.scheme === Schemas.vscodeNotebookCell) {
      return;
    }
    this._widget = new InspectEditorTokensWidget(this._editor, this._textMateService, this._languageService, this._themeService, this._notificationService, this._configurationService, this._languageFeaturesService);
  }
  stop() {
    if (this._widget) {
      this._widget.dispose();
      this._widget = null;
    }
  }
  toggle() {
    if (!this._widget) {
      this.launch();
    } else {
      this.stop();
    }
  }
};

InspectEditorTokensController = __decorateClass([
  __decorateParam(1, ITextMateTokenizationService),
  __decorateParam(2, ILanguageService),
  __decorateParam(3, IWorkbenchThemeService),
  __decorateParam(4, INotificationService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, ILanguageFeaturesService)
], InspectEditorTokensController);

var InspectEditorTokens = class extends EditorAction {
  constructor() {
    super({
      id: "editor.action.inspectTMScopes",
      label: localize2(13800, "Developer: Inspect Editor Tokens and Scopes"),
      precondition: void 0
    });
  }
  run(accessor, editor) {
    const controller = InspectEditorTokensController.get(editor);
    controller?.toggle();
  }
};

function renderTokenText(tokenText) {
  if (tokenText.length > 40) {
    tokenText = tokenText.substr(0, 20) + "\u2026" + tokenText.substr(tokenText.length - 20);
  }
  let result = "";
  for (let charIndex = 0, len = tokenText.length; charIndex < len; charIndex++) {
    const charCode = tokenText.charCodeAt(charIndex);
    switch (charCode) {
      case 9 /* Tab */:
        result += "\u2192";
        break;
      case 32 /* Space */:
        result += "\xB7";
        break;
      default:
        result += String.fromCharCode(charCode);
    }
  }
  return result;
}

var InspectEditorTokensWidget = class _InspectEditorTokensWidget extends Disposable {
  constructor(editor, textMateService, languageService, themeService, notificationService, configurationService, languageFeaturesService) {
    super();
    // Editor.IContentWidget.allowEditorOverflow
    this.allowEditorOverflow = true;
    this._isDisposed = false;
    this._editor = editor;
    this._languageService = languageService;
    this._themeService = themeService;
    this._textMateService = textMateService;
    this._notificationService = notificationService;
    this._configurationService = configurationService;
    this._languageFeaturesService = languageFeaturesService;
    this._model = this._editor.getModel();
    this._domNode = document.createElement("div");
    this._domNode.className = "token-inspect-widget";
    this._currentRequestCancellationTokenSource = new CancellationTokenSource();
    this._beginCompute(this._editor.getPosition());
    this._register(this._editor.onDidChangeCursorPosition((e) => this._beginCompute(this._editor.getPosition())));
    this._register(themeService.onDidColorThemeChange((_) => this._beginCompute(this._editor.getPosition())));
    this._register(configurationService.onDidChangeConfiguration((e) => e.affectsConfiguration("editor.semanticHighlighting.enabled") && this._beginCompute(this._editor.getPosition())));
    this._editor.addContentWidget(this);
  }
  static {
    this._ID = "editor.contrib.inspectEditorTokensWidget";
  }
  dispose() {
    this._isDisposed = true;
    this._editor.removeContentWidget(this);
    this._currentRequestCancellationTokenSource.cancel();
    super.dispose();
  }
  getId() {
    return _InspectEditorTokensWidget._ID;
  }
  _beginCompute(position2) {
    const grammar = this._textMateService.createTokenizer(this._model.getLanguageId());
    const semanticTokens = this._computeSemanticTokens(position2);
    const backend = this._model.tokenization.tokens.get();
    const asTreeSitterBackend = backend instanceof TreeSitterSyntaxTokenBackend ? backend : void 0;
    clearNode(this._domNode);
    this._domNode.appendChild(document.createTextNode(localize(13801, null)));
    Promise.all([grammar, semanticTokens]).then(([grammar2, semanticTokens2]) => {
      if (this._isDisposed) {
        return;
      }
      const treeSitterTree = asTreeSitterBackend?.tree.get();
      this._compute(grammar2, semanticTokens2, treeSitterTree, position2);
      this._domNode.style.maxWidth = `${Math.max(this._editor.getLayoutInfo().width * 0.66, 500)}px`;
      this._editor.layoutContentWidget(this);
    }, (err) => {
      this._notificationService.warn(err);
      setTimeout(() => {
        InspectEditorTokensController.get(this._editor)?.stop();
      });
    });
  }
  _isSemanticColoringEnabled() {
    const setting = this._configurationService.getValue(SEMANTIC_HIGHLIGHTING_SETTING_ID, { overrideIdentifier: this._model.getLanguageId(), resource: this._model.uri })?.enabled;
    if (typeof setting === "boolean") {
      return setting;
    }
    return this._themeService.getColorTheme().semanticHighlighting;
  }
  _compute(grammar, semanticTokens, tree, position2) {
    const textMateTokenInfo = grammar && this._getTokensAtPosition(grammar, position2);
    const semanticTokenInfo = semanticTokens && this._getSemanticTokenAtPosition(semanticTokens, position2);
    const treeSitterTokenInfo = tree && this._getTreeSitterTokenAtPosition(tree, position2);
    if (!textMateTokenInfo && !semanticTokenInfo && !treeSitterTokenInfo) {
      reset(this._domNode, "No grammar or semantic tokens available.");
      return;
    }
    const tmMetadata = textMateTokenInfo?.metadata;
    const semMetadata = semanticTokenInfo?.metadata;
    const semTokenText = semanticTokenInfo && renderTokenText(this._model.getValueInRange(semanticTokenInfo.range));
    const tmTokenText = textMateTokenInfo && renderTokenText(this._model.getLineContent(position2.lineNumber).substring(textMateTokenInfo.token.startIndex, textMateTokenInfo.token.endIndex));
    const semTokenLength = semanticTokenInfo && this._model.getValueLengthInRange(semanticTokenInfo.range);
    const tmTokenLength = textMateTokenInfo && textMateTokenInfo.token.endIndex - textMateTokenInfo.token.startIndex;
    const tokenText = semTokenText || tmTokenText || "";
    const tokenLength = semTokenLength || tmTokenLength || 0;
    reset(
      this._domNode,
      $45(
        "h2.tiw-token",
        void 0,
        tokenText,
        $45("span.tiw-token-length", void 0, `${tokenLength} ${tokenLength === 1 ? "char" : "chars"}`)
      )
    );
    append(this._domNode, $45("hr.tiw-metadata-separator", { "style": "clear:both" }));
    append(this._domNode, $45(
      "table.tiw-metadata-table",
      void 0,
      $45(
        "tbody",
        void 0,
        $45(
          "tr",
          void 0,
          $45("td.tiw-metadata-key", void 0, "language"),
          $45("td.tiw-metadata-value", void 0, tmMetadata?.languageId || "")
        ),
        $45(
          "tr",
          void 0,
          $45("td.tiw-metadata-key", void 0, "standard token type"),
          $45("td.tiw-metadata-value", void 0, this._tokenTypeToString(tmMetadata?.tokenType || 0 /* Other */))
        ),
        ...this._formatMetadata(semMetadata, tmMetadata)
      )
    ));
    if (semanticTokenInfo) {
      append(this._domNode, $45("hr.tiw-metadata-separator"));
      const table = append(this._domNode, $45("table.tiw-metadata-table", void 0));
      const tbody = append(table, $45(
        "tbody",
        void 0,
        $45(
          "tr",
          void 0,
          $45("td.tiw-metadata-key", void 0, "semantic token type"),
          $45("td.tiw-metadata-value", void 0, semanticTokenInfo.type)
        )
      ));
      if (semanticTokenInfo.modifiers.length) {
        append(tbody, $45(
          "tr",
          void 0,
          $45("td.tiw-metadata-key", void 0, "modifiers"),
          $45("td.tiw-metadata-value", void 0, semanticTokenInfo.modifiers.join(" "))
        ));
      }
      if (semanticTokenInfo.metadata) {
        const properties = ["foreground", "bold", "italic", "underline", "strikethrough"];
        const propertiesByDefValue = {};
        const allDefValues = new Array();
        for (const property of properties) {
          if (semanticTokenInfo.metadata[property] !== void 0) {
            const definition = semanticTokenInfo.definitions[property];
            const defValue = this._renderTokenStyleDefinition(definition, property);
            const defValueStr = defValue.map((el) => isHTMLElement(el) ? el.outerHTML : el).join();
            let properties2 = propertiesByDefValue[defValueStr];
            if (!properties2) {
              propertiesByDefValue[defValueStr] = properties2 = [];
              allDefValues.push([defValue, defValueStr]);
            }
            properties2.push(property);
          }
        }
        for (const [defValue, defValueStr] of allDefValues) {
          append(tbody, $45(
            "tr",
            void 0,
            $45("td.tiw-metadata-key", void 0, propertiesByDefValue[defValueStr].join(", ")),
            $45("td.tiw-metadata-value", void 0, ...defValue)
          ));
        }
      }
    }
    if (textMateTokenInfo) {
      const theme = this._themeService.getColorTheme();
      append(this._domNode, $45("hr.tiw-metadata-separator"));
      const table = append(this._domNode, $45("table.tiw-metadata-table"));
      const tbody = append(table, $45("tbody"));
      if (tmTokenText && tmTokenText !== tokenText) {
        append(tbody, $45(
          "tr",
          void 0,
          $45("td.tiw-metadata-key", void 0, "textmate token"),
          $45("td.tiw-metadata-value", void 0, `${tmTokenText} (${tmTokenText.length})`)
        ));
      }
      const scopes = new Array();
      for (let i2 = textMateTokenInfo.token.scopes.length - 1; i2 >= 0; i2--) {
        scopes.push(textMateTokenInfo.token.scopes[i2]);
        if (i2 > 0) {
          scopes.push($45("br"));
        }
      }
      append(tbody, $45(
        "tr",
        void 0,
        $45("td.tiw-metadata-key", void 0, "textmate scopes"),
        $45("td.tiw-metadata-value.tiw-metadata-scopes", void 0, ...scopes)
      ));
      const matchingRule = findMatchingThemeRule(theme, textMateTokenInfo.token.scopes, false);
      const semForeground = semanticTokenInfo?.metadata?.foreground;
      if (matchingRule) {
        if (semForeground !== textMateTokenInfo.metadata.foreground) {
          let defValue = $45(
            "code.tiw-theme-selector",
            void 0,
            matchingRule.rawSelector,
            $45("br"),
            JSON.stringify(matchingRule.settings, null, "	")
          );
          if (semForeground) {
            defValue = $45("s", void 0, defValue);
          }
          append(tbody, $45(
            "tr",
            void 0,
            $45("td.tiw-metadata-key", void 0, "foreground"),
            $45("td.tiw-metadata-value", void 0, defValue)
          ));
        }
      } else if (!semForeground) {
        append(tbody, $45(
          "tr",
          void 0,
          $45("td.tiw-metadata-key", void 0, "foreground"),
          $45("td.tiw-metadata-value", void 0, "No theme selector")
        ));
      }
    }
    if (treeSitterTokenInfo) {
      const lastTokenInfo = treeSitterTokenInfo[treeSitterTokenInfo.length - 1];
      append(this._domNode, $45("hr.tiw-metadata-separator"));
      const table = append(this._domNode, $45("table.tiw-metadata-table"));
      const tbody = append(table, $45("tbody"));
      append(tbody, $45(
        "tr",
        void 0,
        $45("td.tiw-metadata-key", void 0, `tree-sitter token ${lastTokenInfo.id}`),
        $45("td.tiw-metadata-value", void 0, `${lastTokenInfo.text}`)
      ));
      const scopes = new Array();
      let i2 = treeSitterTokenInfo.length - 1;
      let node = treeSitterTokenInfo[i2];
      while (node.parent || i2 > 0) {
        scopes.push(node.type);
        node = node.parent ?? treeSitterTokenInfo[--i2];
        if (node) {
          scopes.push($45("br"));
        }
      }
      append(tbody, $45(
        "tr",
        void 0,
        $45("td.tiw-metadata-key", void 0, "tree-sitter tree"),
        $45("td.tiw-metadata-value.tiw-metadata-scopes", void 0, ...scopes)
      ));
      const tokenizationSupport = this._model.tokenization.tokens.get().tokenizationImpl.get();
      const captures = tokenizationSupport?.captureAtPosition(position2.lineNumber, position2.column);
      if (captures && captures.length > 0) {
        append(tbody, $45(
          "tr",
          void 0,
          $45("td.tiw-metadata-key", void 0, "foreground"),
          $45("td.tiw-metadata-value", void 0, captures.map((cap) => cap.name).join(" "))
        ));
      }
    }
  }
  _formatMetadata(semantic, tm) {
    const elements = new Array();
    function render(property) {
      const value2 = semantic?.[property] || tm?.[property];
      if (value2 !== void 0) {
        const semanticStyle = semantic?.[property] ? "tiw-metadata-semantic" : "";
        elements.push($45(
          "tr",
          void 0,
          $45("td.tiw-metadata-key", void 0, property),
          $45(`td.tiw-metadata-value.${semanticStyle}`, void 0, value2)
        ));
      }
      return value2;
    }
    const foreground2 = render("foreground");
    const background = render("background");
    if (foreground2 && background) {
      const backgroundColor = Color.fromHex(background), foregroundColor = Color.fromHex(foreground2);
      if (backgroundColor.isOpaque()) {
        elements.push($45(
          "tr",
          void 0,
          $45("td.tiw-metadata-key", void 0, "contrast ratio"),
          $45("td.tiw-metadata-value", void 0, backgroundColor.getContrastRatio(foregroundColor.makeOpaque(backgroundColor)).toFixed(2))
        ));
      } else {
        elements.push($45(
          "tr",
          void 0,
          $45("td.tiw-metadata-key", void 0, "Contrast ratio cannot be precise for background colors that use transparency"),
          $45("td.tiw-metadata-value")
        ));
      }
    }
    const fontStyleLabels = new Array();
    function addStyle(key3) {
      let label3;
      if (semantic && semantic[key3]) {
        label3 = $45("span.tiw-metadata-semantic", void 0, key3);
      } else if (tm && tm[key3]) {
        label3 = key3;
      }
      if (label3) {
        if (fontStyleLabels.length) {
          fontStyleLabels.push(" ");
        }
        fontStyleLabels.push(label3);
      }
    }
    addStyle("bold");
    addStyle("italic");
    addStyle("underline");
    addStyle("strikethrough");
    if (fontStyleLabels.length) {
      elements.push($45(
        "tr",
        void 0,
        $45("td.tiw-metadata-key", void 0, "font style"),
        $45("td.tiw-metadata-value", void 0, ...fontStyleLabels)
      ));
    }
    return elements;
  }
  _decodeMetadata(metadata) {
    const colorMap = this._themeService.getColorTheme().tokenColorMap;
    const languageId = TokenMetadata.getLanguageId(metadata);
    const tokenType = TokenMetadata.getTokenType(metadata);
    const fontStyle = TokenMetadata.getFontStyle(metadata);
    const foreground2 = TokenMetadata.getForeground(metadata);
    const background = TokenMetadata.getBackground(metadata);
    return {
      languageId: this._languageService.languageIdCodec.decodeLanguageId(languageId),
      tokenType,
      bold: fontStyle & 2 /* Bold */ ? true : void 0,
      italic: fontStyle & 1 /* Italic */ ? true : void 0,
      underline: fontStyle & 4 /* Underline */ ? true : void 0,
      strikethrough: fontStyle & 8 /* Strikethrough */ ? true : void 0,
      foreground: colorMap[foreground2],
      background: colorMap[background]
    };
  }
  _tokenTypeToString(tokenType) {
    switch (tokenType) {
      case 0 /* Other */:
        return "Other";
      case 1 /* Comment */:
        return "Comment";
      case 2 /* String */:
        return "String";
      case 3 /* RegEx */:
        return "RegEx";
      default:
        return "??";
    }
  }
  _getTokensAtPosition(grammar, position2) {
    const lineNumber = position2.lineNumber;
    const stateBeforeLine = this._getStateBeforeLine(grammar, lineNumber);
    const tokenizationResult1 = grammar.tokenizeLine(this._model.getLineContent(lineNumber), stateBeforeLine);
    const tokenizationResult2 = grammar.tokenizeLine2(this._model.getLineContent(lineNumber), stateBeforeLine);
    let token1Index = 0;
    for (let i2 = tokenizationResult1.tokens.length - 1; i2 >= 0; i2--) {
      const t2 = tokenizationResult1.tokens[i2];
      if (position2.column - 1 >= t2.startIndex) {
        token1Index = i2;
        break;
      }
    }
    let token2Index = 0;
    for (let i2 = tokenizationResult2.tokens.length >>> 1; i2 >= 0; i2--) {
      if (position2.column - 1 >= tokenizationResult2.tokens[i2 << 1]) {
        token2Index = i2;
        break;
      }
    }
    return {
      token: tokenizationResult1.tokens[token1Index],
      metadata: this._decodeMetadata(tokenizationResult2.tokens[(token2Index << 1) + 1])
    };
  }
  _getStateBeforeLine(grammar, lineNumber) {
    let state = null;
    for (let i2 = 1; i2 < lineNumber; i2++) {
      const tokenizationResult = grammar.tokenizeLine(this._model.getLineContent(i2), state);
      state = tokenizationResult.ruleStack;
    }
    return state;
  }
  isSemanticTokens(token) {
    return token && token.data;
  }
  async _computeSemanticTokens(position2) {
    if (!this._isSemanticColoringEnabled()) {
      return null;
    }
    const tokenProviders = this._languageFeaturesService.documentSemanticTokensProvider.ordered(this._model);
    if (tokenProviders.length) {
      const provider = tokenProviders[0];
      const tokens = await Promise.resolve(provider.provideDocumentSemanticTokens(this._model, null, this._currentRequestCancellationTokenSource.token));
      if (this.isSemanticTokens(tokens)) {
        return { tokens, legend: provider.getLegend() };
      }
    }
    const rangeTokenProviders = this._languageFeaturesService.documentRangeSemanticTokensProvider.ordered(this._model);
    if (rangeTokenProviders.length) {
      const provider = rangeTokenProviders[0];
      const lineNumber = position2.lineNumber;
      const range2 = new Range2(lineNumber, 1, lineNumber, this._model.getLineMaxColumn(lineNumber));
      const tokens = await Promise.resolve(provider.provideDocumentRangeSemanticTokens(this._model, range2, this._currentRequestCancellationTokenSource.token));
      if (this.isSemanticTokens(tokens)) {
        return { tokens, legend: provider.getLegend() };
      }
    }
    return null;
  }
  _getSemanticTokenAtPosition(semanticTokens, pos) {
    const tokenData = semanticTokens.tokens.data;
    const defaultLanguage = this._model.getLanguageId();
    let lastLine = 0;
    let lastCharacter = 0;
    const posLine = pos.lineNumber - 1, posCharacter = pos.column - 1;
    for (let i2 = 0; i2 < tokenData.length; i2 += 5) {
      const lineDelta = tokenData[i2], charDelta = tokenData[i2 + 1], len = tokenData[i2 + 2], typeIdx = tokenData[i2 + 3], modSet = tokenData[i2 + 4];
      const line = lastLine + lineDelta;
      const character = lineDelta === 0 ? lastCharacter + charDelta : charDelta;
      if (posLine === line && character <= posCharacter && posCharacter < character + len) {
        const type = semanticTokens.legend.tokenTypes[typeIdx] || "not in legend (ignored)";
        const modifiers = [];
        let modifierSet = modSet;
        for (let modifierIndex = 0; modifierSet > 0 && modifierIndex < semanticTokens.legend.tokenModifiers.length; modifierIndex++) {
          if (modifierSet & 1) {
            modifiers.push(semanticTokens.legend.tokenModifiers[modifierIndex]);
          }
          modifierSet = modifierSet >> 1;
        }
        if (modifierSet > 0) {
          modifiers.push("not in legend (ignored)");
        }
        const range2 = new Range2(line + 1, character + 1, line + 1, character + 1 + len);
        const definitions3 = {};
        const colorMap = this._themeService.getColorTheme().tokenColorMap;
        const theme = this._themeService.getColorTheme();
        const tokenStyle = theme.getTokenStyleMetadata(type, modifiers, defaultLanguage, true, definitions3);
        let metadata = void 0;
        if (tokenStyle) {
          metadata = {
            languageId: void 0,
            tokenType: 0 /* Other */,
            bold: tokenStyle?.bold,
            italic: tokenStyle?.italic,
            underline: tokenStyle?.underline,
            strikethrough: tokenStyle?.strikethrough,
            foreground: colorMap[tokenStyle?.foreground || 0 /* None */],
            background: void 0
          };
        }
        return { type, modifiers, range: range2, metadata, definitions: definitions3 };
      }
      lastLine = line;
      lastCharacter = character;
    }
    return null;
  }
  _walkTreeforPosition(cursor, pos) {
    const offset = this._model.getOffsetAt(pos);
    cursor.gotoFirstChild();
    let goChild = false;
    let lastGoodNode = null;
    do {
      if (cursor.currentNode.startIndex <= offset && offset < cursor.currentNode.endIndex) {
        goChild = true;
        lastGoodNode = cursor.currentNode;
      } else {
        goChild = false;
      }
    } while (goChild ? cursor.gotoFirstChild() : cursor.gotoNextSibling());
    return lastGoodNode;
  }
  _getTreeSitterTokenAtPosition(treeSitterTree, pos) {
    const nodes = [];
    let tree = treeSitterTree?.tree.get();
    while (tree) {
      const cursor = tree.walk();
      const node = this._walkTreeforPosition(cursor, pos);
      cursor.delete();
      if (node) {
        nodes.push(node);
        treeSitterTree = treeSitterTree?.getInjectionTrees(node.startIndex, treeSitterTree.languageId);
        tree = treeSitterTree?.tree.get();
      } else {
        tree = void 0;
      }
    }
    return nodes.length > 0 ? nodes : null;
  }
  _renderTokenStyleDefinition(definition, property) {
    const elements = new Array();
    if (definition === void 0) {
      return elements;
    }
    const theme = this._themeService.getColorTheme();
    if (Array.isArray(definition)) {
      const scopesDefinition = {};
      theme.resolveScopes(definition, scopesDefinition);
      const matchingRule = scopesDefinition[property];
      if (matchingRule && scopesDefinition.scope) {
        const scopes = $45("ul.tiw-metadata-values");
        const strScopes = Array.isArray(matchingRule.scope) ? matchingRule.scope : [String(matchingRule.scope)];
        for (const strScope of strScopes) {
          scopes.appendChild($45("li.tiw-metadata-value.tiw-metadata-scopes", void 0, strScope));
        }
        elements.push(
          scopesDefinition.scope.join(" "),
          scopes,
          $45("code.tiw-theme-selector", void 0, JSON.stringify(matchingRule.settings, null, "	"))
        );
        return elements;
      }
      return elements;
    } else if (SemanticTokenRule.is(definition)) {
      const scope = theme.getTokenStylingRuleScope(definition);
      if (scope === "setting") {
        elements.push(`User settings: ${definition.selector.id} - ${this._renderStyleProperty(definition.style, property)}`);
        return elements;
      } else if (scope === "theme") {
        elements.push(`Color theme: ${definition.selector.id} - ${this._renderStyleProperty(definition.style, property)}`);
        return elements;
      }
      return elements;
    } else {
      const style = theme.resolveTokenStyleValue(definition);
      elements.push(`Default: ${style ? this._renderStyleProperty(style, property) : ""}`);
      return elements;
    }
  }
  _renderStyleProperty(style, property) {
    switch (property) {
      case "foreground":
        return style.foreground ? Color.Format.CSS.formatHexA(style.foreground, true) : "";
      default:
        return style[property] !== void 0 ? String(style[property]) : "";
    }
  }
  getDomNode() {
    return this._domNode;
  }
  getPosition() {
    return {
      position: this._editor.getPosition(),
      preference: [2 /* BELOW */, 1 /* ABOVE */]
    };
  }
};

registerEditorContribution(InspectEditorTokensController.ID, InspectEditorTokensController, 4 /* Lazy */);

registerEditorAction(InspectEditorTokens);
export { renderTokenText, $45, InspectEditorTokensController, InspectEditorTokens, InspectEditorTokensWidget };
