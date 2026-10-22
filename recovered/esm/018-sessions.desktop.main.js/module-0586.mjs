// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/hover/browser/resizableContentWidget.ts
import { Disposable } from "./module-0012.mjs";
import { Dimension, getClientArea, getDomNodePagePosition } from "./module-0075.mjs";
import { ResizableHTMLElement } from "./module-0585.mjs";
import { Position } from "./module-0079.mjs";


// src/vs/editor/contrib/hover/browser/resizableContentWidget.ts
var TOP_HEIGHT = 30;

var BOTTOM_HEIGHT = 24;

var ResizableContentWidget = class extends Disposable {
  constructor(_editor, minimumSize = new Dimension(10, 10)) {
    super();
    this._editor = _editor;
    this.allowEditorOverflow = true;
    this.suppressMouseDown = false;
    this._resizableNode = this._register(new ResizableHTMLElement());
    this._contentPosition = null;
    this._isResizing = false;
    this._resizableNode.domNode.style.position = "absolute";
    this._resizableNode.minSize = Dimension.lift(minimumSize);
    this._resizableNode.layout(minimumSize.height, minimumSize.width);
    this._resizableNode.enableSashes(true, true, true, true);
    this._register(this._resizableNode.onDidResize((e4) => {
      this._resize(new Dimension(e4.dimension.width, e4.dimension.height));
      if (e4.done) {
        this._isResizing = false;
      }
    }));
    this._register(this._resizableNode.onDidWillResize(() => {
      this._isResizing = true;
    }));
  }
  get isResizing() {
    return this._isResizing;
  }
  getDomNode() {
    return this._resizableNode.domNode;
  }
  getPosition() {
    return this._contentPosition;
  }
  get position() {
    return this._contentPosition?.position ? Position.lift(this._contentPosition.position) : void 0;
  }
  _availableVerticalSpaceAbove(position2) {
    const editorDomNode = this._editor.getDomNode();
    const mouseBox = this._editor.getScrolledVisiblePosition(position2);
    if (!editorDomNode || !mouseBox) {
      return;
    }
    const editorBox = getDomNodePagePosition(editorDomNode);
    return editorBox.top + mouseBox.top - TOP_HEIGHT;
  }
  _availableVerticalSpaceBelow(position2) {
    const editorDomNode = this._editor.getDomNode();
    const mouseBox = this._editor.getScrolledVisiblePosition(position2);
    if (!editorDomNode || !mouseBox) {
      return;
    }
    const editorBox = getDomNodePagePosition(editorDomNode);
    const bodyBox = getClientArea(editorDomNode.ownerDocument.body);
    const mouseBottom = editorBox.top + mouseBox.top + mouseBox.height;
    return bodyBox.height - mouseBottom - BOTTOM_HEIGHT;
  }
  _findPositionPreference(widgetHeight, showAtPosition) {
    const maxHeightBelow = Math.min(this._availableVerticalSpaceBelow(showAtPosition) ?? Infinity, widgetHeight);
    const maxHeightAbove = Math.min(this._availableVerticalSpaceAbove(showAtPosition) ?? Infinity, widgetHeight);
    const maxHeight = Math.min(Math.max(maxHeightAbove, maxHeightBelow), widgetHeight);
    const height = Math.min(widgetHeight, maxHeight);
    let renderingAbove;
    if (this._editor.getOption(69 /* hover */).above) {
      renderingAbove = height <= maxHeightAbove ? 1 /* ABOVE */ : 2 /* BELOW */;
    } else {
      renderingAbove = height <= maxHeightBelow ? 2 /* BELOW */ : 1 /* ABOVE */;
    }
    if (renderingAbove === 1 /* ABOVE */) {
      this._resizableNode.enableSashes(true, true, false, false);
    } else {
      this._resizableNode.enableSashes(false, true, true, false);
    }
    return renderingAbove;
  }
  _resize(dimension) {
    this._resizableNode.layout(dimension.height, dimension.width);
  }
};
export { TOP_HEIGHT, BOTTOM_HEIGHT, ResizableContentWidget };
