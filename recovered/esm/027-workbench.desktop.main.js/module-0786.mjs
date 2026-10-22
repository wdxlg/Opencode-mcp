// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/inlineCompletions/browser/view/inlineEdits/inlineEditsViews/longDistanceHint/longDistancePreviewEditor.ts
import { LineRange } from "./module-0174.mjs";
import { Disposable } from "./module-0012.mjs";
import { n } from "./module-0075.mjs";
import { derived } from "./module-0054.mjs";
import { TextModelValueReference } from "./module-0731.mjs";
import { Range2 } from "./module-0106.mjs";
import { constObservable } from "./module-0061.mjs";
import { ModelDecorationOptions } from "./module-0423.mjs";
import { classNames, maxContentWidthInRange } from "./module-0772.mjs";
import { observableCodeEditor } from "./module-0493.mjs";
import { autorun } from "./module-0052.mjs";
import { JumpToView } from "./module-0785.mjs";
import { InlineEditsGutterIndicator, InlineEditsGutterIndicatorData } from "./module-0774.mjs";
import { observableValue } from "./module-0048.mjs";
import { EmbeddedCodeEditorWidget } from "./module-0621.mjs";
import { InlineCompletionContextKeys } from "./module-0697.mjs";
import { clamp } from "./module-0040.mjs";
import { Position } from "./module-0079.mjs";
import { OffsetRange } from "./module-0144.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/editor/contrib/inlineCompletions/browser/view/inlineEdits/inlineEditsViews/longDistanceHint/longDistancePreviewEditor.ts
function expandLineRangeWithContext(targetLineNumber, contextLineCount, lineCount) {
  const clampedTarget = Math.max(1, Math.min(lineCount, targetLineNumber));
  const startLineNumber = Math.max(1, clampedTarget - contextLineCount);
  const endLineNumberExclusive = Math.min(lineCount + 1, clampedTarget + contextLineCount + 1);
  return new LineRange(startLineNumber, endLineNumberExclusive);
}

var LongDistancePreviewEditor = class extends Disposable {
  constructor(_previewTextModel, _properties, _parentEditor, _tabAction, _instantiationService) {
    super();
    this._previewTextModel = _previewTextModel;
    this._properties = _properties;
    this._parentEditor = _parentEditor;
    this._tabAction = _tabAction;
    this._instantiationService = _instantiationService;
    this._previewRef = n.ref();
    this.element = n.div({ class: "preview", style: {
      /*pointerEvents: 'none'*/
    }, ref: this._previewRef });
    this._state = derived(this, (reader) => {
      const props = this._properties.read(reader);
      if (!props) {
        return void 0;
      }
      let mode;
      let targetLineNumber;
      if (props.nextCursorPosition !== null) {
        mode = "original";
        targetLineNumber = props.nextCursorPosition.lineNumber;
      } else {
        if (props.diff[0].innerChanges?.every((c) => c.modifiedRange.isEmpty())) {
          mode = "original";
          targetLineNumber = props.diff[0].original.startLineNumber;
        } else {
          mode = "modified";
          targetLineNumber = props.diff[0].modified.startLineNumber;
        }
      }
      const textModel = mode === "modified" ? TextModelValueReference.snapshot(this._previewTextModel) : props.target;
      const contextLineCount = this._parentEditorObs.getOption(71 /* inlineSuggest */).read(reader).edits.longDistanceHintContextLineCount;
      const displayModel = mode === "modified" ? this._previewTextModel : props.target.dangerouslyGetUnderlyingModel();
      const visibleLineRange = expandLineRangeWithContext(targetLineNumber, contextLineCount, displayModel.getLineCount());
      return {
        mode,
        targetLineNumber,
        visibleLineRange,
        textModel,
        diff: props.diff
      };
    });
    this.updatePreviewEditorEffect = derived(this, (reader) => {
      this._previewEditorObs.model.read(reader);
      const range2 = this._state.read(reader)?.visibleLineRange;
      if (!range2) {
        return;
      }
      const hiddenAreas = [];
      if (range2.startLineNumber > 1) {
        hiddenAreas.push(new Range2(1, 1, range2.startLineNumber - 1, 1));
      }
      if (range2.endLineNumberExclusive < this._previewTextModel.getLineCount() + 1) {
        hiddenAreas.push(new Range2(range2.endLineNumberExclusive, 1, this._previewTextModel.getLineCount() + 1, 1));
      }
      this.previewEditor.setHiddenAreas(hiddenAreas, void 0, true);
    });
    this.horizontalContentRangeInPreviewEditorToShow = derived(this, (reader) => {
      return this._getHorizontalContentRangeInPreviewEditorToShow(this.previewEditor, reader);
    });
    this.contentHeight = derived(this, (reader) => {
      const viewState = this._state.read(reader);
      if (!viewState) {
        return constObservable(null);
      }
      return this._previewEditorObs.observeLineHeightsForLineRange(viewState.visibleLineRange).map((heights) => heights.reduce((sum2, height) => sum2 + height, 0));
    }).flatten();
    this._editorDecorations = derived(this, (reader) => {
      const state = this._state.read(reader);
      if (!state) {
        return void 0;
      }
      const diff4 = {
        mode: "insertionInline",
        diff: state.diff
      };
      const originalDecorations = [];
      const modifiedDecorations = [];
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
      const hideEmptyInnerDecorations = true;
      for (const m of diff4.diff) {
        if (m.modified.isEmpty || m.original.isEmpty) {
          if (!m.original.isEmpty) {
            originalDecorations.push({ range: m.original.toInclusiveRange(), options: diffWholeLineDeleteDecoration2 });
          }
          if (!m.modified.isEmpty) {
            modifiedDecorations.push({ range: m.modified.toInclusiveRange(), options: diffWholeLineAddDecoration2 });
          }
        } else {
          for (const i2 of m.innerChanges || []) {
            if (m.original.contains(i2.originalRange.startLineNumber) && !(hideEmptyInnerDecorations && i2.originalRange.isEmpty())) {
              originalDecorations.push({
                range: i2.originalRange,
                options: {
                  description: "char-delete",
                  shouldFillLineOnLineBreak: false,
                  className: classNames(
                    "inlineCompletions-char-delete",
                    // i.originalRange.isSingleLine() && diff.mode === 'insertionInline' && 'single-line-inline',
                    i2.originalRange.isEmpty() && "empty"
                  ),
                  zIndex: 1
                }
              });
            }
            if (m.modified.contains(i2.modifiedRange.startLineNumber)) {
              modifiedDecorations.push({
                range: i2.modifiedRange,
                options: diffAddDecoration2
              });
            }
          }
        }
      }
      return { originalDecorations, modifiedDecorations };
    });
    this.previewEditor = this._register(this._createPreviewEditor());
    this._parentEditorObs = observableCodeEditor(this._parentEditor);
    this._register(autorun((reader) => {
      const tm = this._state.read(reader)?.textModel || null;
      if (tm) {
        this.previewEditor.setModel(tm.dangerouslyGetUnderlyingModel());
      }
    }));
    this._previewEditorObs = observableCodeEditor(this.previewEditor);
    this._register(this._previewEditorObs.setDecorations(derived((reader) => {
      const state = this._state.read(reader);
      const decorations = this._editorDecorations.read(reader);
      return (state?.mode === "original" ? decorations?.originalDecorations : decorations?.modifiedDecorations) ?? [];
    })));
    const showJumpToDecoration = false;
    if (showJumpToDecoration) {
      this._register(this._instantiationService.createInstance(JumpToView, this._previewEditorObs, { style: "cursor" }, derived((reader) => {
        const p = this._properties.read(reader);
        if (!p || !p.nextCursorPosition) {
          return void 0;
        }
        return {
          jumpToPosition: p.nextCursorPosition
        };
      })));
    }
    this._register(autorun((reader) => {
      if (!this._properties.read(reader)) {
        return;
      }
      const cursorPosition = this._parentEditorObs.cursorPosition.read(reader);
      if (cursorPosition) {
        this.previewEditor.setPosition(this._previewTextModel.validatePosition(cursorPosition), "longDistanceHintPreview");
      }
    }));
    this._register(autorun((reader) => {
      const state = this._state.read(reader);
      if (!state) {
        return;
      }
      const lineNumberDigets = (state.visibleLineRange.endLineNumberExclusive - 1).toString().length;
      this.previewEditor.updateOptions({ lineNumbersMinChars: lineNumberDigets + 1 });
    }));
    this._register(this._instantiationService.createInstance(
      InlineEditsGutterIndicator,
      this._previewEditorObs,
      derived((reader) => {
        const state = this._state.read(reader);
        if (!state) {
          return void 0;
        }
        const props = this._properties.read(reader);
        if (!props) {
          return void 0;
        }
        return new InlineEditsGutterIndicatorData(
          props.inlineSuggestInfo,
          LineRange.ofLength(state.targetLineNumber, 1),
          props.model,
          void 0
        );
      }),
      this._tabAction,
      constObservable(0),
      constObservable(false),
      observableValue(this, false)
    ));
    this.updatePreviewEditorEffect.recomputeInitiallyAndOnChange(this._store);
  }
  _createPreviewEditor() {
    return this._instantiationService.createInstance(
      EmbeddedCodeEditorWidget,
      this._previewRef.element,
      {
        glyphMargin: false,
        lineNumbers: "on",
        minimap: { enabled: false },
        guides: {
          indentation: false,
          bracketPairs: false,
          bracketPairsHorizontal: false,
          highlightActiveIndentation: false
        },
        editContext: false,
        // is a bit faster
        rulers: [],
        padding: { top: 0, bottom: 0 },
        //folding: false,
        selectOnLineNumbers: false,
        selectionHighlight: false,
        columnSelection: false,
        overviewRulerBorder: false,
        overviewRulerLanes: 0,
        //lineDecorationsWidth: 0,
        //lineNumbersMinChars: 0,
        revealHorizontalRightPadding: 0,
        bracketPairColorization: { enabled: true, independentColorPoolPerBracketType: false },
        scrollBeyondLastLine: false,
        scrollbar: {
          vertical: "hidden",
          horizontal: "hidden",
          handleMouseWheel: false
        },
        readOnly: true,
        wordWrap: "off",
        wordWrapOverride1: "off",
        wordWrapOverride2: "off"
      },
      {
        contextKeyValues: {
          [InlineCompletionContextKeys.inInlineEditsPreviewEditor.key]: true
        },
        contributions: []
      },
      this._parentEditor
    );
  }
  _getHorizontalContentRangeInPreviewEditorToShow(editor, reader) {
    const state = this._state.read(reader);
    if (!state) {
      return void 0;
    }
    const diff4 = state.diff;
    const jumpToPos = this._properties.read(reader)?.nextCursorPosition;
    const visibleRange = state.visibleLineRange;
    const l = this._previewEditorObs.layoutInfo.read(reader);
    const trueContentWidth = maxContentWidthInRange(this._previewEditorObs, visibleRange, reader);
    let firstCharacterChange;
    if (jumpToPos) {
      firstCharacterChange = Range2.fromPositions(jumpToPos);
    } else if (diff4[0].innerChanges) {
      firstCharacterChange = state.mode === "modified" ? diff4[0].innerChanges[0].modifiedRange : diff4[0].innerChanges[0].originalRange;
    } else {
      return void 0;
    }
    const preferredRange = growUntilVariableBoundaries(editor.getModel(), firstCharacterChange, 5);
    const leftOffset = this._previewEditorObs.getLeftOfPosition(preferredRange.getStartPosition(), reader);
    const rightOffset = this._previewEditorObs.getLeftOfPosition(preferredRange.getEndPosition(), reader);
    const left = clamp(leftOffset, 0, trueContentWidth);
    const right = clamp(rightOffset, left, trueContentWidth);
    const indentCol = editor.getModel().getLineFirstNonWhitespaceColumn(preferredRange.startLineNumber);
    const indentationEnd = this._previewEditorObs.getLeftOfPosition(new Position(preferredRange.startLineNumber, indentCol), reader);
    const preferredRangeToReveal = new OffsetRange(left, right);
    return {
      indentationEnd,
      preferredRangeToReveal,
      maxEditorWidth: trueContentWidth + l.contentLeft,
      contentWidth: trueContentWidth,
      nonContentWidth: l.contentLeft
      // Width of area that is not content
    };
  }
  layout(dimension, desiredPreviewEditorScrollLeft) {
    this.previewEditor.layout(dimension);
    this._previewEditorObs.editor.setScrollLeft(desiredPreviewEditorScrollLeft);
  }
};

LongDistancePreviewEditor = __decorateClass([
  __decorateParam(4, IInstantiationService)
], LongDistancePreviewEditor);

function growUntilVariableBoundaries(textModel, range2, maxGrow) {
  const startPosition = range2.getStartPosition();
  const endPosition = range2.getEndPosition();
  const line = textModel.getLineContent(startPosition.lineNumber);
  function isVariableNameCharacter(col) {
    const char = line.charAt(col - 1);
    return /[a-zA-Z0-9_]/.test(char);
  }
  function isWhitespace3(col) {
    const char = line.charAt(col - 1);
    return char === " " || char === "	";
  }
  let startColumn = startPosition.column;
  while (startColumn > 1 && isVariableNameCharacter(startColumn) && !isWhitespace3(startColumn - 1) && startPosition.column - startColumn < maxGrow) {
    startColumn--;
  }
  let endColumn = endPosition.column - 1;
  while (endColumn <= line.length && isVariableNameCharacter(endColumn) && !isWhitespace3(endColumn + 1) && endColumn - endPosition.column < maxGrow) {
    endColumn++;
  }
  return new Range2(startPosition.lineNumber, startColumn, endPosition.lineNumber, endColumn + 1);
}
export { expandLineRangeWithContext, growUntilVariableBoundaries, LongDistancePreviewEditor };
