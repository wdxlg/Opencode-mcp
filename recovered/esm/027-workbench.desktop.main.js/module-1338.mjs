// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/comments/browser/commentGlyphWidget.ts
import { darken, opaque, registerColor } from "./module-0226.mjs";
import { listInactiveSelectionBackground } from "./module-0232.mjs";
import { editorBackground, editorForeground } from "./module-0229.mjs";
import { Color } from "./module-0197.mjs";
import { localize } from "./module-0001.mjs";
import { Disposable, toDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { themeColorFromId2 } from "./module-0287.mjs";
import { ModelDecorationOptions } from "./module-0423.mjs";


// src/vs/workbench/contrib/comments/browser/commentGlyphWidget.ts
var overviewRulerCommentingRangeForeground = registerColor("editorGutter.commentRangeForeground", { dark: opaque(listInactiveSelectionBackground, editorBackground), light: darken(opaque(listInactiveSelectionBackground, editorBackground), 0.05), hcDark: Color.white, hcLight: Color.black }, localize(13943, null));

var overviewRulerCommentForeground = registerColor("editorOverviewRuler.commentForeground", overviewRulerCommentingRangeForeground, localize(13946, null));

var overviewRulerCommentUnresolvedForeground = registerColor("editorOverviewRuler.commentUnresolvedForeground", overviewRulerCommentForeground, localize(13947, null));

var overviewRulerCommentDraftForeground = registerColor("editorOverviewRuler.commentDraftForeground", overviewRulerCommentUnresolvedForeground, localize(13945, null));

var editorGutterCommentGlyphForeground = registerColor("editorGutter.commentGlyphForeground", { dark: editorForeground, light: editorForeground, hcDark: Color.black, hcLight: Color.white }, localize(13942, null));

registerColor("editorGutter.commentUnresolvedGlyphForeground", editorGutterCommentGlyphForeground, localize(13944, null));

registerColor("editorGutter.commentDraftGlyphForeground", editorGutterCommentGlyphForeground, localize(13941, null));

var CommentGlyphWidget = class _CommentGlyphWidget extends Disposable {
  constructor(editor, lineNumber) {
    super();
    this._threadHasDraft = false;
    this._onDidChangeLineNumber = this._register(new Emitter());
    this.onDidChangeLineNumber = this._onDidChangeLineNumber.event;
    this._commentsOptions = this.createDecorationOptions();
    this._editor = editor;
    this._commentsDecorations = this._editor.createDecorationsCollection();
    this._register(this._commentsDecorations.onDidChange((e) => {
      const range2 = this._commentsDecorations.length > 0 ? this._commentsDecorations.getRange(0) : null;
      if (range2 && range2.endLineNumber !== this._lineNumber) {
        this._lineNumber = range2.endLineNumber;
        this._onDidChangeLineNumber.fire(this._lineNumber);
      }
    }));
    this._register(toDisposable(() => this._commentsDecorations.clear()));
    this.setLineNumber(lineNumber);
  }
  static {
    this.description = "comment-glyph-widget";
  }
  createDecorationOptions() {
    let className2;
    if (this._threadHasDraft) {
      className2 = "comment-range-glyph comment-thread-draft";
    } else {
      const unresolved = this._threadState === 0 /* Unresolved */;
      className2 = `comment-range-glyph comment-thread${unresolved ? "-unresolved" : ""}`;
    }
    const decorationOptions = {
      description: _CommentGlyphWidget.description,
      isWholeLine: true,
      overviewRuler: {
        color: themeColorFromId2(this._threadHasDraft ? overviewRulerCommentDraftForeground : this._threadState === 0 /* Unresolved */ ? overviewRulerCommentUnresolvedForeground : overviewRulerCommentForeground),
        position: 2 /* Center */
      },
      collapseOnReplaceEdit: true,
      linesDecorationsClassName: className2
    };
    return ModelDecorationOptions.createDynamic(decorationOptions);
  }
  setThreadState(state, hasDraft = false) {
    if (this._threadState !== state || this._threadHasDraft !== hasDraft) {
      this._threadState = state;
      this._threadHasDraft = hasDraft;
      this._commentsOptions = this.createDecorationOptions();
      this._updateDecorations();
    }
  }
  _updateDecorations() {
    const commentsDecorations = [{
      range: {
        startLineNumber: this._lineNumber,
        startColumn: 1,
        endLineNumber: this._lineNumber,
        endColumn: 1
      },
      options: this._commentsOptions
    }];
    this._commentsDecorations.set(commentsDecorations);
  }
  setLineNumber(lineNumber) {
    this._lineNumber = lineNumber;
    this._updateDecorations();
  }
  getPosition() {
    const range2 = this._commentsDecorations.length > 0 ? this._commentsDecorations.getRange(0) : null;
    return {
      position: {
        lineNumber: range2 ? range2.endLineNumber : this._lineNumber,
        column: 1
      },
      preference: [0 /* EXACT */]
    };
  }
};
export { overviewRulerCommentingRangeForeground, overviewRulerCommentForeground, overviewRulerCommentUnresolvedForeground, overviewRulerCommentDraftForeground, editorGutterCommentGlyphForeground, CommentGlyphWidget };
