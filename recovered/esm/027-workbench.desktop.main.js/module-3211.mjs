// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mergeEditor/browser/view/editorGutter.ts
import { Disposable, toDisposable } from "./module-0012.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { observableSignalFromEvent } from "./module-0062.mjs";
import { observableSignal } from "./module-0058.mjs";
import { h, reset } from "./module-0075.mjs";
import { transaction } from "./module-0045.mjs";
import { autorun } from "./module-0052.mjs";
import { MergeEditorLineRange } from "./module-1130.mjs";


// src/vs/workbench/contrib/mergeEditor/browser/view/editorGutter.ts
var EditorGutter2 = class extends Disposable {
  constructor(_editor, _domNode, itemProvider) {
    super();
    this._editor = _editor;
    this._domNode = _domNode;
    this.itemProvider = itemProvider;
    this.scrollTop = observableFromEvent(
      this,
      this._editor.onDidScrollChange,
      (e) => (
        /** @description editor.onDidScrollChange */
        this._editor.getScrollTop()
      )
    );
    this.isScrollTopZero = this.scrollTop.map((scrollTop) => (
      /** @description isScrollTopZero */
      scrollTop === 0
    ));
    this.modelAttached = observableFromEvent(
      this,
      this._editor.onDidChangeModel,
      (e) => (
        /** @description editor.onDidChangeModel */
        this._editor.hasModel()
      )
    );
    this.editorOnDidChangeViewZones = observableSignalFromEvent("onDidChangeViewZones", this._editor.onDidChangeViewZones);
    this.editorOnDidContentSizeChange = observableSignalFromEvent("onDidContentSizeChange", this._editor.onDidContentSizeChange);
    this.domNodeSizeChanged = observableSignal("domNodeSizeChanged");
    this.views = /* @__PURE__ */ new Map();
    this._domNode.className = "gutter monaco-editor";
    const scrollDecoration = this._domNode.appendChild(
      h("div.scroll-decoration", { role: "presentation", ariaHidden: "true", style: { width: "100%" } }).root
    );
    const o = new ResizeObserver(() => {
      transaction((tx) => {
        this.domNodeSizeChanged.trigger(tx);
      });
    });
    o.observe(this._domNode);
    this._register(toDisposable(() => o.disconnect()));
    this._register(autorun((reader) => {
      scrollDecoration.className = this.isScrollTopZero.read(reader) ? "" : "scroll-decoration";
    }));
    this._register(autorun((reader) => (
      /** @description EditorGutter.Render */
      this.render(reader)
    )));
  }
  dispose() {
    super.dispose();
    reset(this._domNode);
  }
  render(reader) {
    if (!this.modelAttached.read(reader)) {
      return;
    }
    this.domNodeSizeChanged.read(reader);
    this.editorOnDidChangeViewZones.read(reader);
    this.editorOnDidContentSizeChange.read(reader);
    const scrollTop = this.scrollTop.read(reader);
    const domNodeHeight = this._domNode.clientHeight;
    const visibleRanges = this._editor.getVisibleRanges();
    const unusedIds = new Set(this.views.keys());
    if (visibleRanges.length > 0) {
      const visibleRange = visibleRanges[0];
      const visibleRange2 = MergeEditorLineRange.fromLength(
        visibleRange.startLineNumber,
        visibleRange.endLineNumber - visibleRange.startLineNumber
      ).deltaEnd(1);
      const gutterItems = this.itemProvider.getIntersectingGutterItems(
        visibleRange2,
        reader
      );
      for (const gutterItem of gutterItems) {
        if (!gutterItem.range.intersectsOrTouches(visibleRange2)) {
          continue;
        }
        unusedIds.delete(gutterItem.id);
        let view = this.views.get(gutterItem.id);
        if (!view) {
          const viewDomNode = document.createElement("div");
          this._domNode.appendChild(viewDomNode);
          const itemView = this.itemProvider.createView(
            gutterItem,
            viewDomNode
          );
          view = new ManagedGutterItemView2(itemView, viewDomNode);
          this.views.set(gutterItem.id, view);
        } else {
          view.gutterItemView.update(gutterItem);
        }
        const top2 = gutterItem.range.startLineNumber <= this._editor.getModel().getLineCount() ? this._editor.getTopForLineNumber(gutterItem.range.startLineNumber, true) - scrollTop : this._editor.getBottomForLineNumber(gutterItem.range.startLineNumber - 1, false) - scrollTop;
        const bottom = this._editor.getBottomForLineNumber(gutterItem.range.endLineNumberExclusive - 1, true) - scrollTop;
        const height = bottom - top2;
        view.domNode.style.top = `${top2}px`;
        view.domNode.style.height = `${height}px`;
        view.gutterItemView.layout(top2, height, 0, domNodeHeight);
      }
    }
    for (const id2 of unusedIds) {
      const view = this.views.get(id2);
      view.gutterItemView.dispose();
      view.domNode.remove();
      this.views.delete(id2);
    }
  }
};

var ManagedGutterItemView2 = class {
  constructor(gutterItemView, domNode) {
    this.gutterItemView = gutterItemView;
    this.domNode = domNode;
  }
};
export { EditorGutter2, ManagedGutterItemView2 };
