// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/model/tokens/tokenizationFontDecorationsProvider.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { AnnotatedString, AnnotationsUpdate } from "./module-0402.mjs";
import { LineFontChangingDecoration, LineHeightChangingDecoration } from "./module-0400.mjs";
import { Position } from "./module-0079.mjs";
import { OffsetRange } from "./module-0144.mjs";
import { offsetEditFromContentChanges } from "./module-0404.mjs";
import { Range2 } from "./module-0106.mjs";
import { classNameForFontTokenDecorations } from "./module-0401.mjs";


// src/vs/editor/common/model/tokens/tokenizationFontDecorationsProvider.ts
var TokenizationFontDecorationProvider = class _TokenizationFontDecorationProvider extends Disposable {
  constructor(textModel, tokenizationTextModelPart) {
    super();
    this.textModel = textModel;
    this.tokenizationTextModelPart = tokenizationTextModelPart;
    this._onDidChangeLineHeight = this._register(new Emitter());
    this.onDidChangeLineHeight = this._onDidChangeLineHeight.event;
    this._onDidChangeFont = this._register(new Emitter());
    this.onDidChangeFont = this._onDidChangeFont.event;
    this._fontAnnotatedString = new AnnotatedString();
    this._register(this.tokenizationTextModelPart.onDidChangeFontTokens((fontChanges) => {
      const linesChanged = /* @__PURE__ */ new Set();
      const fontTokenAnnotations = [];
      const affectedLineHeights = /* @__PURE__ */ new Set();
      const affectedLineFonts = /* @__PURE__ */ new Set();
      for (const annotation of fontChanges.changes.annotations) {
        const startPosition = this.textModel.getPositionAt(annotation.range.start);
        const lineNumber = startPosition.lineNumber;
        let fontTokenAnnotation;
        if (annotation.annotation === void 0) {
          fontTokenAnnotation = {
            range: annotation.range,
            annotation: void 0
          };
        } else {
          const decorationId = `tokenization-font-decoration-${_TokenizationFontDecorationProvider.DECORATION_COUNT}`;
          const fontTokenDecoration = {
            fontToken: annotation.annotation,
            decorationId
          };
          fontTokenAnnotation = {
            range: annotation.range,
            annotation: fontTokenDecoration
          };
          _TokenizationFontDecorationProvider.DECORATION_COUNT++;
          if (annotation.annotation.lineHeightMultiplier) {
            affectedLineHeights.add(new LineHeightChangingDecoration(0, decorationId, lineNumber, annotation.annotation.lineHeightMultiplier));
          }
          affectedLineFonts.add(new LineFontChangingDecoration(0, decorationId, lineNumber));
        }
        fontTokenAnnotations.push(fontTokenAnnotation);
        if (!linesChanged.has(lineNumber)) {
          const lineNumberStartOffset = this.textModel.getOffsetAt(new Position(lineNumber, 1));
          const lineNumberEndOffset = this.textModel.getOffsetAt(new Position(lineNumber, this.textModel.getLineMaxColumn(lineNumber)));
          const lineOffsetRange = new OffsetRange(lineNumberStartOffset, lineNumberEndOffset);
          const lineAnnotations = this._fontAnnotatedString.getAnnotationsIntersecting(lineOffsetRange);
          for (const annotation2 of lineAnnotations) {
            const decorationId = annotation2.annotation.decorationId;
            affectedLineHeights.add(new LineHeightChangingDecoration(0, decorationId, lineNumber, null));
            affectedLineFonts.add(new LineFontChangingDecoration(0, decorationId, lineNumber));
          }
          linesChanged.add(lineNumber);
        }
      }
      this._fontAnnotatedString.setAnnotations(AnnotationsUpdate.create(fontTokenAnnotations));
      this._onDidChangeLineHeight.fire(affectedLineHeights);
      this._onDidChangeFont.fire(affectedLineFonts);
    }));
  }
  static {
    this.DECORATION_COUNT = 0;
  }
  handleDidChangeContent(change) {
    const edits = offsetEditFromContentChanges(change.changes);
    const deletedAnnotations = this._fontAnnotatedString.applyEdit(edits);
    if (deletedAnnotations.length === 0) {
      return;
    }
    const affectedLineHeights = /* @__PURE__ */ new Set();
    const affectedLineFonts = /* @__PURE__ */ new Set();
    for (const deletedAnnotation of deletedAnnotations) {
      const startPosition = this.textModel.getPositionAt(deletedAnnotation.range.start);
      const lineNumber = startPosition.lineNumber;
      const decorationId = deletedAnnotation.annotation.decorationId;
      affectedLineHeights.add(new LineHeightChangingDecoration(0, decorationId, lineNumber, null));
      affectedLineFonts.add(new LineFontChangingDecoration(0, decorationId, lineNumber));
    }
    this._onDidChangeLineHeight.fire(affectedLineHeights);
    this._onDidChangeFont.fire(affectedLineFonts);
  }
  getDecorationsInRange(range2, ownerId2, filterOutValidation, filterFontDecorations2, onlyMinimapDecorations) {
    const startOffsetOfRange = this.textModel.getOffsetAt(range2.getStartPosition());
    const endOffsetOfRange = this.textModel.getOffsetAt(range2.getEndPosition());
    const annotations = this._fontAnnotatedString.getAnnotationsIntersecting(new OffsetRange(startOffsetOfRange, endOffsetOfRange));
    const decorations = [];
    for (const annotation of annotations) {
      const anno = annotation.annotation;
      const affectsFont = !!(anno.fontToken.fontFamily || anno.fontToken.fontSizeMultiplier);
      if (!(affectsFont && filterFontDecorations2)) {
        const annotationStartPosition = this.textModel.getPositionAt(annotation.range.start);
        const annotationEndPosition = this.textModel.getPositionAt(annotation.range.endExclusive);
        const range3 = Range2.fromPositions(annotationStartPosition, annotationEndPosition);
        const anno2 = annotation.annotation;
        const className2 = classNameForFontTokenDecorations(anno2.fontToken.fontFamily ?? "", anno2.fontToken.fontSizeMultiplier ?? 0);
        const id2 = anno2.decorationId;
        decorations.push({
          id: id2,
          options: {
            description: "FontOptionDecoration",
            inlineClassName: className2,
            lineHeight: anno2.fontToken.lineHeightMultiplier,
            affectsFont
          },
          ownerId: 0,
          range: range3
        });
      }
    }
    return decorations;
  }
  getAllDecorations(ownerId2, filterOutValidation) {
    return this.getDecorationsInRange(
      new Range2(1, 1, this.textModel.getLineCount(), this.textModel.getLineMaxColumn(this.textModel.getLineCount())),
      ownerId2,
      filterOutValidation
    );
  }
};
export { TokenizationFontDecorationProvider };
