// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/inlineCompletions/browser/view/inlineEdits/inlineEditsViews/inlineEditsCollapsedView.ts
import { Disposable } from "./module-0012.mjs";
import { Event2 } from "./module-0017.mjs";
import { n } from "./module-0075.mjs";
import { constObservable } from "./module-0061.mjs";
import { observableCodeEditor } from "./module-0493.mjs";
import { singleTextRemoveCommonPrefix } from "./module-0719.mjs";
import { derived } from "./module-0054.mjs";
import { Point } from "./module-0492.mjs";
import { PathBuilder, getEditorValidOverlayRect, rectToProps } from "./module-0772.mjs";
import { asCssVariable } from "./module-0226.mjs";
import { inlineEditIndicatorPrimaryBorder } from "./module-0771.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAccessibilityService } from "./module-0104.mjs";


// src/vs/editor/contrib/inlineCompletions/browser/view/inlineEdits/inlineEditsViews/inlineEditsCollapsedView.ts
var InlineEditsCollapsedView = class extends Disposable {
  constructor(_editor, _edit, _accessibilityService) {
    super();
    this._editor = _editor;
    this._edit = _edit;
    this._accessibilityService = _accessibilityService;
    this.onDidClick = Event2.None;
    this._iconRef = n.ref();
    this.isHovered = constObservable(false);
    this._editorObs = observableCodeEditor(this._editor);
    const firstEdit = this._edit.map((inlineEdit) => inlineEdit?.edit?.replacements[0] ?? null);
    const startPosition = firstEdit.map((edit3) => edit3 ? singleTextRemoveCommonPrefix(edit3, this._editor.getModel()).range.getStartPosition() : null);
    const observedStartPoint = this._editorObs.observePosition(startPosition, this._store);
    const startPoint = derived((reader) => {
      const point = observedStartPoint.read(reader);
      if (!point) {
        return null;
      }
      const contentLeft = this._editorObs.layoutInfoContentLeft.read(reader);
      const scrollLeft = this._editorObs.scrollLeft.read(reader);
      return new Point(contentLeft + point.x - scrollLeft, point.y);
    });
    const overlayElement = n.div({
      class: "inline-edits-collapsed-view",
      style: {
        position: "absolute",
        overflow: "visible",
        top: "0px",
        left: "0px",
        display: "block"
      }
    }, [
      [this.getCollapsedIndicator(startPoint)]
    ]).keepUpdated(this._store).element;
    this._register(this._editorObs.createOverlayWidget({
      domNode: overlayElement,
      position: constObservable(null),
      allowEditorOverflow: false,
      minContentWidthInPx: constObservable(0)
    }));
    this.isVisible = this._edit.map((inlineEdit, reader) => !!inlineEdit && startPoint.read(reader) !== null);
  }
  triggerAnimation() {
    if (this._accessibilityService.isMotionReduced()) {
      return new Animation(null, null).finished;
    }
    const animation = this._iconRef.element.animate([
      { offset: 0, transform: "translateY(-3px)" },
      { offset: 0.2, transform: "translateY(1px)" },
      { offset: 0.36, transform: "translateY(-1px)" },
      { offset: 0.52, transform: "translateY(1px)" },
      { offset: 0.68, transform: "translateY(-1px)" },
      { offset: 0.84, transform: "translateY(1px)" },
      { offset: 1, transform: "translateY(0px)" }
    ], { duration: 2e3 });
    return animation.finished;
  }
  getCollapsedIndicator(startPoint) {
    const contentLeft = this._editorObs.layoutInfoContentLeft;
    const startPointTranslated = startPoint.map((p, reader) => p ? p.deltaX(-contentLeft.read(reader)) : null);
    const iconPath = this.createIconPath(startPointTranslated);
    return n.svg({
      class: "collapsedView",
      ref: this._iconRef,
      style: {
        position: "absolute",
        ...rectToProps((r2) => getEditorValidOverlayRect(this._editorObs).read(r2)),
        overflow: "hidden",
        pointerEvents: "none"
      }
    }, [
      n.svgElem("path", {
        class: "collapsedViewPath",
        d: iconPath,
        fill: asCssVariable(inlineEditIndicatorPrimaryBorder)
      })
    ]);
  }
  createIconPath(indicatorPoint) {
    const width2 = 6;
    const triangleHeight = 3;
    const baseHeight = 1;
    return indicatorPoint.map((point) => {
      if (!point) {
        return new PathBuilder().build();
      }
      const baseTopLeft = point.deltaX(-width2 / 2).deltaY(-baseHeight);
      const baseTopRight = baseTopLeft.deltaX(width2);
      const baseBottomLeft = baseTopLeft.deltaY(baseHeight);
      const baseBottomRight = baseTopRight.deltaY(baseHeight);
      const triangleBottomCenter = baseBottomLeft.deltaX(width2 / 2).deltaY(triangleHeight);
      return new PathBuilder().moveTo(baseTopLeft).lineTo(baseTopRight).lineTo(baseBottomRight).lineTo(triangleBottomCenter).lineTo(baseBottomLeft).lineTo(baseTopLeft).build();
    });
  }
};

InlineEditsCollapsedView = __decorateClass([
  __decorateParam(2, IAccessibilityService)
], InlineEditsCollapsedView);
export { InlineEditsCollapsedView };
