// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/themes/browser/themes.test.contribution.ts
import { Color } from "./module-0197.mjs";
import { findMatchingThemeRule } from "./module-2251.mjs";
import { TokenizationRegistry2 } from "./module-0164.mjs";
import { TokenMetadata } from "./module-0108.mjs";
import { findMetadata } from "./module-1618.mjs";
import { waitForState } from "./module-0056.mjs";
import { Range2 } from "./module-0106.mjs";
import { URI } from "./module-0032.mjs";
import { splitLines } from "./module-0030.mjs";
import { Event2 } from "./module-0017.mjs";
import { TreeSitterSyntaxTokenBackend } from "./module-0418.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { IWorkbenchThemeService } from "./module-0917.mjs";
import { ITextMateTokenizationService } from "./module-1226.mjs";
import { IModelService } from "./module-0080.mjs";
import { IFileService } from "./module-0269.mjs";
import { basename2 } from "./module-0034.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IEditorService } from "./module-0935.mjs";
import { EditorResourceAccessor } from "./module-0926.mjs";
import { Schemas } from "./module-0033.mjs";
import { CommandsRegistry } from "./module-0087.mjs";


// src/vs/workbench/contrib/themes/browser/themes.test.contribution.ts
var ThemeDocument = class {
  constructor(theme) {
    this._theme = theme;
    this._cache = /* @__PURE__ */ Object.create(null);
    this._defaultColor = "#000000";
    for (let i2 = 0, len = this._theme.tokenColors.length; i2 < len; i2++) {
      const rule = this._theme.tokenColors[i2];
      if (!rule.scope) {
        this._defaultColor = rule.settings.foreground;
      }
    }
  }
  _generateExplanation(selector, color2) {
    return `${selector}: ${Color.Format.CSS.formatHexA(color2, true).toUpperCase()}`;
  }
  explainTokenColor(scopes, color2) {
    const matchingRule = this._findMatchingThemeRule(scopes);
    if (!matchingRule) {
      const expected2 = Color.fromHex(this._defaultColor);
      if (!color2.equals(expected2)) {
        throw new Error(`[${this._theme.label}]: Unexpected color ${Color.Format.CSS.formatHexA(color2)} for ${scopes}. Expected default ${Color.Format.CSS.formatHexA(expected2)}`);
      }
      return this._generateExplanation("default", color2);
    }
    const expected = Color.fromHex(matchingRule.settings.foreground);
    if (!color2.equals(expected)) {
      throw new Error(`[${this._theme.label}]: Unexpected color ${Color.Format.CSS.formatHexA(color2)} for ${scopes}. Expected ${Color.Format.CSS.formatHexA(expected)} coming in from ${matchingRule.rawSelector}`);
    }
    return this._generateExplanation(matchingRule.rawSelector, color2);
  }
  _findMatchingThemeRule(scopes) {
    if (!this._cache[scopes]) {
      this._cache[scopes] = findMatchingThemeRule(this._theme, scopes.split(" "));
    }
    return this._cache[scopes];
  }
};

var Snapper = class {
  constructor(languageService, themeService, textMateService, modelService) {
    this.languageService = languageService;
    this.themeService = themeService;
    this.textMateService = textMateService;
    this.modelService = modelService;
  }
  _themedTokenize(grammar, lines) {
    const colorMap = TokenizationRegistry2.getColorMap();
    let state = null;
    const result = [];
    let resultLen = 0;
    for (let i2 = 0, len = lines.length; i2 < len; i2++) {
      const line = lines[i2];
      const tokenizationResult = grammar.tokenizeLine2(line, state);
      for (let j = 0, lenJ = tokenizationResult.tokens.length >>> 1; j < lenJ; j++) {
        const startOffset = tokenizationResult.tokens[j << 1];
        const metadata = tokenizationResult.tokens[(j << 1) + 1];
        const endOffset = j + 1 < lenJ ? tokenizationResult.tokens[j + 1 << 1] : line.length;
        const tokenText = line.substring(startOffset, endOffset);
        const color2 = TokenMetadata.getForeground(metadata);
        result[resultLen++] = {
          text: tokenText,
          color: colorMap[color2]
        };
      }
      state = tokenizationResult.ruleStack;
    }
    return result;
  }
  _themedTokenizeTreeSitter(tokens, languageId) {
    const colorMap = TokenizationRegistry2.getColorMap();
    const result = Array(tokens.length);
    const colorThemeData = this.themeService.getColorTheme();
    for (let i2 = 0, len = tokens.length; i2 < len; i2++) {
      const token = tokens[i2];
      const scopes = token.t.split(" ");
      const metadata = findMetadata(colorThemeData, scopes, this.languageService.languageIdCodec.encodeLanguageId(languageId), false);
      const color2 = TokenMetadata.getForeground(metadata);
      result[i2] = {
        text: token.c,
        color: colorMap[color2]
      };
    }
    return result;
  }
  _tokenize(grammar, lines) {
    let state = null;
    const result = [];
    let resultLen = 0;
    for (let i2 = 0, len = lines.length; i2 < len; i2++) {
      const line = lines[i2];
      const tokenizationResult = grammar.tokenizeLine(line, state);
      let lastScopes = null;
      for (let j = 0, lenJ = tokenizationResult.tokens.length; j < lenJ; j++) {
        const token = tokenizationResult.tokens[j];
        const tokenText = line.substring(token.startIndex, token.endIndex);
        const tokenScopes = token.scopes.join(" ");
        if (lastScopes === tokenScopes) {
          result[resultLen - 1].c += tokenText;
        } else {
          lastScopes = tokenScopes;
          result[resultLen++] = {
            c: tokenText,
            t: tokenScopes,
            r: {
              dark_plus: void 0,
              light_plus: void 0,
              dark_vs: void 0,
              light_vs: void 0,
              hc_black: void 0
            }
          };
        }
      }
      state = tokenizationResult.ruleStack;
    }
    return result;
  }
  async _getThemesResult(grammar, lines) {
    const currentTheme = this.themeService.getColorTheme();
    const getThemeName = (id2) => {
      const part = "vscode-theme-defaults-themes-";
      const startIdx = id2.indexOf(part);
      if (startIdx !== -1) {
        return id2.substring(startIdx + part.length, id2.length - 5);
      }
      return void 0;
    };
    const result = {};
    const themeDatas = await this.themeService.getColorThemes();
    const defaultThemes = themeDatas.filter((themeData) => !!getThemeName(themeData.id));
    for (const defaultTheme of defaultThemes) {
      const themeId = defaultTheme.id;
      const success = await this.themeService.setColorTheme(themeId, void 0);
      if (success) {
        const themeName = getThemeName(themeId);
        result[themeName] = {
          document: new ThemeDocument(this.themeService.getColorTheme()),
          tokens: this._themedTokenize(grammar, lines)
        };
      }
    }
    await this.themeService.setColorTheme(currentTheme.id, void 0);
    return result;
  }
  async _getTreeSitterThemesResult(tokens, languageId) {
    const currentTheme = this.themeService.getColorTheme();
    const getThemeName = (id2) => {
      const part = "vscode-theme-defaults-themes-";
      const startIdx = id2.indexOf(part);
      if (startIdx !== -1) {
        return id2.substring(startIdx + part.length, id2.length - 5);
      }
      return void 0;
    };
    const result = {};
    const themeDatas = await this.themeService.getColorThemes();
    const defaultThemes = themeDatas.filter((themeData) => !!getThemeName(themeData.id));
    for (const defaultTheme of defaultThemes) {
      const themeId = defaultTheme.id;
      const success = await this.themeService.setColorTheme(themeId, void 0);
      if (success) {
        const themeName = getThemeName(themeId);
        result[themeName] = {
          document: new ThemeDocument(this.themeService.getColorTheme()),
          tokens: this._themedTokenizeTreeSitter(tokens, languageId)
        };
      }
    }
    await this.themeService.setColorTheme(currentTheme.id, void 0);
    return result;
  }
  _enrichResult(result, themesResult) {
    const index2 = {};
    const themeNames = Object.keys(themesResult);
    for (const themeName of themeNames) {
      index2[themeName] = 0;
    }
    for (let i2 = 0, len = result.length; i2 < len; i2++) {
      const token = result[i2];
      for (const themeName of themeNames) {
        const themedToken = themesResult[themeName].tokens[index2[themeName]];
        themedToken.text = themedToken.text.substr(token.c.length);
        if (themedToken.color) {
          token.r[themeName] = themesResult[themeName].document.explainTokenColor(token.t, themedToken.color);
        }
        if (themedToken.text.length === 0) {
          index2[themeName]++;
        }
      }
    }
  }
  _moveInjectionCursorToRange(cursor, injectionRange) {
    let continueCursor = cursor.gotoFirstChild();
    while ((cursor.startIndex < injectionRange.startIndex || cursor.endIndex > injectionRange.endIndex) && continueCursor) {
      if (cursor.endIndex < injectionRange.startIndex) {
        continueCursor = cursor.gotoNextSibling();
      } else {
        continueCursor = cursor.gotoFirstChild();
      }
    }
  }
  async _treeSitterTokenize(treeSitterTree, tokenizationModel, languageId) {
    const tree = await waitForState(treeSitterTree.tree);
    if (!tree) {
      return [];
    }
    const cursor = tree.walk();
    cursor.gotoFirstChild();
    let cursorResult = true;
    const tokens = [];
    const cursors = [{ cursor, languageId, startOffset: 0, endOffset: treeSitterTree.textModel.getValueLength() }];
    do {
      const current = cursors[cursors.length - 1];
      const currentCursor = current.cursor;
      const currentLanguageId = current.languageId;
      const isOutsideRange = currentCursor.currentNode.endIndex > current.endOffset;
      if (!isOutsideRange && currentCursor.currentNode.childCount === 0) {
        const range2 = new Range2(currentCursor.currentNode.startPosition.row + 1, currentCursor.currentNode.startPosition.column + 1, currentCursor.currentNode.endPosition.row + 1, currentCursor.currentNode.endPosition.column + 1);
        const injection = treeSitterTree.getInjectionTrees(currentCursor.currentNode.startIndex, currentLanguageId);
        const treeSitterRange = injection?.ranges.find((r2) => r2.startIndex <= currentCursor.currentNode.startIndex && r2.endIndex >= currentCursor.currentNode.endIndex);
        const injectionTree = injection?.tree.get();
        const injectionLanguageId = injection?.languageId;
        if (injectionTree && injectionLanguageId && treeSitterRange && treeSitterRange.startIndex === currentCursor.currentNode.startIndex) {
          const injectionCursor = injectionTree.walk();
          this._moveInjectionCursorToRange(injectionCursor, treeSitterRange);
          cursors.push({ cursor: injectionCursor, languageId: injectionLanguageId, startOffset: treeSitterRange.startIndex, endOffset: treeSitterRange.endIndex });
          while (currentCursor.endIndex <= treeSitterRange.endIndex && (currentCursor.gotoNextSibling() || currentCursor.gotoParent())) {
          }
        } else {
          const capture = tokenizationModel.captureAtRangeTree(range2);
          tokens.push({
            c: currentCursor.currentNode.text.replace(/\r/g, ""),
            t: capture?.map((cap) => cap.name).join(" ") ?? "",
            r: {
              dark_plus: void 0,
              light_plus: void 0,
              dark_vs: void 0,
              light_vs: void 0,
              hc_black: void 0
            }
          });
          while (!(cursorResult = currentCursor.gotoNextSibling())) {
            if (!(cursorResult = currentCursor.gotoParent())) {
              break;
            }
          }
        }
      } else {
        cursorResult = currentCursor.gotoFirstChild();
      }
      if (cursors.length > 1 && (!cursorResult && currentCursor === cursors[cursors.length - 1].cursor || isOutsideRange)) {
        current.cursor.delete();
        cursors.pop();
        cursorResult = true;
      }
    } while (cursorResult);
    cursor.delete();
    return tokens;
  }
  captureSyntaxTokens(fileName, content) {
    const languageId = this.languageService.guessLanguageIdByFilepathOrFirstLine(URI.file(fileName));
    return this.textMateService.createTokenizer(languageId).then((grammar) => {
      if (!grammar) {
        return [];
      }
      const lines = splitLines(content);
      const result = this._tokenize(grammar, lines);
      return this._getThemesResult(grammar, lines).then((themesResult) => {
        this._enrichResult(result, themesResult);
        return result.filter((t2) => t2.c.length > 0);
      });
    });
  }
  async captureTreeSitterSyntaxTokens(resource, content) {
    const languageId = this.languageService.guessLanguageIdByFilepathOrFirstLine(resource);
    if (!languageId) {
      return [];
    }
    const model = this.modelService.getModel(resource) ?? this.modelService.createModel(content, { languageId, onDidChange: Event2.None }, resource);
    const tokenizationPart = model.tokenization.tokens.get();
    if (!(tokenizationPart instanceof TreeSitterSyntaxTokenBackend)) {
      return [];
    }
    const treeObs = tokenizationPart.tree;
    const tokenizationImplObs = tokenizationPart.tokenizationImpl;
    const treeSitterTree = treeObs.get() ?? await waitForState(treeObs);
    const tokenizationImpl = tokenizationImplObs.get() ?? await waitForState(tokenizationImplObs);
    if (!treeSitterTree) {
      return [];
    }
    const result = (await this._treeSitterTokenize(treeSitterTree, tokenizationImpl, languageId)).filter((t2) => t2.c.length > 0);
    const themeTokens = await this._getTreeSitterThemesResult(result, languageId);
    this._enrichResult(result, themeTokens);
    return result;
  }
};

Snapper = __decorateClass([
  __decorateParam(0, ILanguageService),
  __decorateParam(1, IWorkbenchThemeService),
  __decorateParam(2, ITextMateTokenizationService),
  __decorateParam(3, IModelService)
], Snapper);

async function captureTokens(accessor, resource, treeSitter = false) {
  const process3 = (resource2) => {
    const fileService = accessor.get(IFileService);
    const fileName = basename2(resource2);
    const snapper = accessor.get(IInstantiationService).createInstance(Snapper);
    return fileService.readFile(resource2).then((content) => {
      if (treeSitter) {
        return snapper.captureTreeSitterSyntaxTokens(resource2, content.value.toString());
      } else {
        return snapper.captureSyntaxTokens(fileName, content.value.toString());
      }
    });
  };
  if (!resource) {
    const editorService = accessor.get(IEditorService);
    const file = editorService.activeEditor ? EditorResourceAccessor.getCanonicalUri(editorService.activeEditor, { filterByScheme: Schemas.file }) : null;
    if (file) {
      process3(file).then((result) => {
        console.log(result);
      });
    } else {
      console.log("No file editor active");
    }
  } else {
    const processResult = await process3(resource);
    return processResult;
  }
  return void 0;
}

CommandsRegistry.registerCommand("_workbench.captureSyntaxTokens", function(accessor, resource) {
  return captureTokens(accessor, resource);
});

CommandsRegistry.registerCommand("_workbench.captureTreeSitterSyntaxTokens", function(accessor, resource) {
  if (!resource) {
    const editorService = accessor.get(IEditorService);
    resource = editorService.activeEditor?.resource;
  }
  return captureTokens(accessor, resource, true);
});
export { captureTokens, ThemeDocument, Snapper };
