// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/model/bracketPairsTextModelPart/colorizedBracketPairsDecorationProvider.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { Range2 } from "./module-0106.mjs";
import { registerThemingParticipant } from "./module-0287.mjs";
import { editorBracketHighlightingForeground1, editorBracketHighlightingForeground2, editorBracketHighlightingForeground3, editorBracketHighlightingForeground4, editorBracketHighlightingForeground5, editorBracketHighlightingForeground6, editorBracketHighlightingUnexpectedBracketForeground } from "./module-0288.mjs";


// src/vs/editor/common/model/bracketPairsTextModelPart/colorizedBracketPairsDecorationProvider.ts
var ColorizedBracketPairsDecorationProvider = class extends Disposable {
  constructor(textModel) {
    super();
    this.textModel = textModel;
    this.colorProvider = new ColorProvider();
    this.onDidChangeEmitter = this._register(new Emitter());
    this.onDidChange = this.onDidChangeEmitter.event;
    this.colorizationOptions = textModel.getOptions().bracketPairColorizationOptions;
    this._register(textModel.bracketPairs.onDidChange((e4) => {
      this.onDidChangeEmitter.fire();
    }));
  }
  //#region TextModel events
  handleDidChangeOptions(e4) {
    this.colorizationOptions = this.textModel.getOptions().bracketPairColorizationOptions;
  }
  //#endregion
  getDecorationsInRange(range2, ownerId2, filterOutValidation, filterFontDecorations2, onlyMinimapDecorations) {
    if (onlyMinimapDecorations) {
      return [];
    }
    if (ownerId2 === void 0) {
      return [];
    }
    if (!this.colorizationOptions.enabled) {
      return [];
    }
    const result = this.textModel.bracketPairs.getBracketsInRange(range2, true).map((bracket) => ({
      id: `bracket${bracket.range.toString()}-${bracket.nestingLevel}`,
      options: {
        description: "BracketPairColorization",
        inlineClassName: this.colorProvider.getInlineClassName(
          bracket,
          this.colorizationOptions.independentColorPoolPerBracketType
        )
      },
      ownerId: 0,
      range: bracket.range
    })).toArray();
    return result;
  }
  getAllDecorations(ownerId2, filterOutValidation, filterFontDecorations2) {
    if (ownerId2 === void 0) {
      return [];
    }
    if (!this.colorizationOptions.enabled) {
      return [];
    }
    return this.getDecorationsInRange(
      new Range2(1, 1, this.textModel.getLineCount(), 1),
      ownerId2,
      filterOutValidation,
      filterFontDecorations2
    );
  }
};

var ColorProvider = class {
  constructor() {
    this.unexpectedClosingBracketClassName = "unexpected-closing-bracket";
  }
  getInlineClassName(bracket, independentColorPoolPerBracketType) {
    if (bracket.isInvalid) {
      return this.unexpectedClosingBracketClassName;
    }
    return this.getInlineClassNameOfLevel(independentColorPoolPerBracketType ? bracket.nestingLevelOfEqualBracketType : bracket.nestingLevel);
  }
  getInlineClassNameOfLevel(level) {
    return `bracket-highlighting-${level % 30}`;
  }
};

registerThemingParticipant((theme, collector) => {
  const colors = [
    editorBracketHighlightingForeground1,
    editorBracketHighlightingForeground2,
    editorBracketHighlightingForeground3,
    editorBracketHighlightingForeground4,
    editorBracketHighlightingForeground5,
    editorBracketHighlightingForeground6
  ];
  const colorProvider = new ColorProvider();
  collector.addRule(`.monaco-editor .${colorProvider.unexpectedClosingBracketClassName} { color: ${theme.getColor(editorBracketHighlightingUnexpectedBracketForeground)}; }`);
  const colorValues = colors.map((c) => theme.getColor(c)).filter((c) => !!c).filter((c) => !c.isTransparent());
  for (let level = 0; level < 30; level++) {
    const color2 = colorValues[level % colorValues.length];
    collector.addRule(`.monaco-editor .${colorProvider.getInlineClassNameOfLevel(level)} { color: ${color2}; }`);
  }
});
export { ColorizedBracketPairsDecorationProvider, ColorProvider };
