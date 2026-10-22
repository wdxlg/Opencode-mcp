// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/inlineCompletions/browser/view/inlineEdits/inlineEditsViews/originalEditorInlineDiffView.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { observableCodeEditor } from "./module-0493.mjs";
import { derived } from "./module-0054.mjs";
import { ModelDecorationOptions } from "./module-0423.mjs";
import { classNames } from "./module-0772.mjs";
import { OffsetRange } from "./module-0144.mjs";
import { Range2 } from "./module-0106.mjs";
import { autorunWithStore } from "./module-0052.mjs";
import { InlineEditClickEvent } from "./module-0727.mjs";
import { rangeIsSingleLine } from "./module-0489.mjs";
import { observableFromEvent } from "./module-0057.mjs";


// src/vs/editor/contrib/inlineCompletions/browser/view/inlineEdits/inlineEditsViews/originalEditorInlineDiffView.ts
var OriginalEditorInlineDiffView = class extends Disposable {
  constructor(_originalEditor, _state, _modifiedTextModel) {
    super();
    this._originalEditor = _originalEditor;
    this._state = _state;
    this._modifiedTextModel = _modifiedTextModel;
    this._onDidClick = this._register(new Emitter());
    this.onDidClick = this._onDidClick.event;
    this.isHovered = observableCodeEditor(this._originalEditor).isTargetHovered(
      (p) => p.target.type === 6 /* CONTENT_TEXT */ && p.target.detail.injectedText?.options.attachedData instanceof InlineEditAttachedData && p.target.detail.injectedText.options.attachedData.owner === this,
      this._store
    );
    this._tokenizationFinished = modelTokenizationFinished(this._modifiedTextModel);
    this._decorations = derived(this, (reader) => {
      const diff4 = this._state.read(reader);
      if (!diff4) {
        return void 0;
      }
      const modified = diff4.modifiedText;
      const showInline = diff4.mode === "insertionInline";
      const hasOneInnerChange = diff4.diff.length === 1 && diff4.diff[0].innerChanges?.length === 1;
      const showEmptyDecorations = true;
      const originalDecorations = [];
      const modifiedDecorations = [];
      const diffLineAddDecorationBackground2 = ModelDecorationOptions.register({
        className: "inlineCompletions-line-insert",
        description: "line-insert",
        isWholeLine: true,
        marginClassName: "gutter-insert"
      });
      const diffLineDeleteDecorationBackground2 = ModelDecorationOptions.register({
        className: "inlineCompletions-line-delete",
        description: "line-delete",
        isWholeLine: true,
        marginClassName: "gutter-delete"
      });
      const diffWholeLineDeleteDecoration2 = ModelDecorationOptions.register({
        className: "inlineCompletions-char-delete",
        description: "char-delete",
        isWholeLine: false,
        zIndex: 1
        // be on top of diff background decoration
      });
      const diffWholeLineAddDecoration2 = ModelDecorationOptions.register({
        className: "inlineCompletions-char-insert",
        description: "char-insert",
        isWholeLine: true
      });
      const diffAddDecoration2 = ModelDecorationOptions.register({
        className: "inlineCompletions-char-insert",
        description: "char-insert",
        shouldFillLineOnLineBreak: true
      });
      const diffAddDecorationEmpty2 = ModelDecorationOptions.register({
        className: "inlineCompletions-char-insert diff-range-empty",
        description: "char-insert diff-range-empty"
      });
      const NESOriginalBackground = ModelDecorationOptions.register({
        className: "inlineCompletions-original-lines",
        description: "inlineCompletions-original-lines",
        isWholeLine: false,
        shouldFillLineOnLineBreak: true
      });
      const showFullLineDecorations = diff4.mode !== "sideBySide" && diff4.mode !== "deletion" && diff4.mode !== "insertionInline" && diff4.mode !== "lineReplacement";
      const hideEmptyInnerDecorations = diff4.mode === "lineReplacement";
      for (const m of diff4.diff) {
        if (showFullLineDecorations) {
          if (!m.original.isEmpty) {
            originalDecorations.push({
              range: m.original.toInclusiveRange(),
              options: diffLineDeleteDecorationBackground2
            });
          }
          if (!m.modified.isEmpty) {
            modifiedDecorations.push({
              range: m.modified.toInclusiveRange(),
              options: diffLineAddDecorationBackground2
            });
          }
        }
        if (m.modified.isEmpty || m.original.isEmpty) {
          if (!m.original.isEmpty) {
            originalDecorations.push({ range: m.original.toInclusiveRange(), options: diffWholeLineDeleteDecoration2 });
          }
          if (!m.modified.isEmpty) {
            modifiedDecorations.push({ range: m.modified.toInclusiveRange(), options: diffWholeLineAddDecoration2 });
          }
        } else {
          const useInlineDiff = showInline && allowsTrueInlineDiffRendering2(m);
          for (const i2 of m.innerChanges || []) {
            if (m.original.contains(i2.originalRange.startLineNumber) && !(hideEmptyInnerDecorations && i2.originalRange.isEmpty())) {
              const replacedText = this._originalEditor.getModel()?.getValueInRange(i2.originalRange, 1 /* LF */);
              originalDecorations.push({
                range: i2.originalRange,
                options: {
                  description: "char-delete",
                  shouldFillLineOnLineBreak: false,
                  className: classNames(
                    "inlineCompletions-char-delete",
                    i2.originalRange.isSingleLine() && diff4.mode === "insertionInline" && "single-line-inline",
                    i2.originalRange.isEmpty() && "empty",
                    (i2.originalRange.isEmpty() && hasOneInnerChange || diff4.mode === "deletion" && replacedText === "\n") && showEmptyDecorations && !useInlineDiff && "diff-range-empty"
                  ),
                  inlineClassName: useInlineDiff ? classNames("strike-through", "inlineCompletions") : null,
                  zIndex: 1
                }
              });
            }
            if (m.modified.contains(i2.modifiedRange.startLineNumber)) {
              modifiedDecorations.push({
                range: i2.modifiedRange,
                options: i2.modifiedRange.isEmpty() && showEmptyDecorations && !useInlineDiff && hasOneInnerChange ? diffAddDecorationEmpty2 : diffAddDecoration2
              });
            }
            if (useInlineDiff) {
              const insertedText = modified.getValueOfRange(i2.modifiedRange);
              const textSegments = insertedText.length > 3 ? [
                { text: insertedText.slice(0, 1), extraClasses: ["start"], offsetRange: new OffsetRange(i2.modifiedRange.startColumn - 1, i2.modifiedRange.startColumn) },
                { text: insertedText.slice(1, -1), extraClasses: [], offsetRange: new OffsetRange(i2.modifiedRange.startColumn, i2.modifiedRange.endColumn - 2) },
                { text: insertedText.slice(-1), extraClasses: ["end"], offsetRange: new OffsetRange(i2.modifiedRange.endColumn - 2, i2.modifiedRange.endColumn - 1) }
              ] : [
                { text: insertedText, extraClasses: ["start", "end"], offsetRange: new OffsetRange(i2.modifiedRange.startColumn - 1, i2.modifiedRange.endColumn) }
              ];
              this._tokenizationFinished.read(reader);
              const lineTokens = this._modifiedTextModel.tokenization.getLineTokens(i2.modifiedRange.startLineNumber);
              for (const { text: text2, extraClasses, offsetRange } of textSegments) {
                originalDecorations.push({
                  range: Range2.fromPositions(i2.originalRange.getEndPosition()),
                  options: {
                    description: "inserted-text",
                    before: {
                      tokens: lineTokens.getTokensInRange(offsetRange),
                      content: text2,
                      inlineClassName: classNames(
                        "inlineCompletions-char-insert",
                        i2.modifiedRange.isSingleLine() && diff4.mode === "insertionInline" && "single-line-inline",
                        ...extraClasses
                        // include extraClasses for additional styling if provided
                      ),
                      cursorStops: 3 /* None */,
                      attachedData: new InlineEditAttachedData(this)
                    },
                    zIndex: 2,
                    showIfCollapsed: true
                  }
                });
              }
            }
          }
        }
      }
      if (diff4.editorType === "diffEditor" /* DiffEditor */) {
        for (const m of diff4.diff) {
          if (!m.original.isEmpty) {
            originalDecorations.push({
              range: m.original.toExclusiveRange(),
              options: NESOriginalBackground
            });
          }
        }
      }
      return { originalDecorations, modifiedDecorations };
    });
    this._register(observableCodeEditor(this._originalEditor).setDecorations(this._decorations.map((d) => d?.originalDecorations ?? [])));
    const modifiedCodeEditor = this._state.map((s) => s?.modifiedCodeEditor);
    this._register(autorunWithStore((reader, store) => {
      const e4 = modifiedCodeEditor.read(reader);
      if (e4) {
        store.add(observableCodeEditor(e4).setDecorations(this._decorations.map((d) => d?.modifiedDecorations ?? [])));
      }
    }));
    this._register(this._originalEditor.onMouseUp((e4) => {
      if (e4.target.type !== 6 /* CONTENT_TEXT */) {
        return;
      }
      const a = e4.target.detail.injectedText?.options.attachedData;
      if (a instanceof InlineEditAttachedData && a.owner === this) {
        this._onDidClick.fire(new InlineEditClickEvent(e4.event));
      }
    }));
  }
  static supportsInlineDiffRendering(mapping2) {
    return allowsTrueInlineDiffRendering2(mapping2);
  }
};

var InlineEditAttachedData = class {
  constructor(owner) {
    this.owner = owner;
  }
};

function allowsTrueInlineDiffRendering2(mapping2) {
  if (!mapping2.innerChanges) {
    return false;
  }
  return mapping2.innerChanges.every((c) => rangeIsSingleLine(c.modifiedRange) && rangeIsSingleLine(c.originalRange));
}

var i = 0;

function modelTokenizationFinished(model) {
  return observableFromEvent(model.onDidChangeTokens, () => i++);
}
export { allowsTrueInlineDiffRendering2, modelTokenizationFinished, OriginalEditorInlineDiffView, InlineEditAttachedData, i };
