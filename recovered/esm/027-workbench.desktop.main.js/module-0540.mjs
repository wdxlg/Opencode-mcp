// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/inlineProgress/browser/inlineProgress.ts
import { ModelDecorationOptions } from "./module-0423.mjs";
import { noBreakWhitespace } from "./module-0030.mjs";
import { Disposable, MutableDisposable } from "./module-0012.mjs";
import { $, EventType, addDisposableListener } from "./module-0075.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { disposableTimeout } from "./module-0036.mjs";
import { Range2 } from "./module-0106.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/editor/contrib/inlineProgress/browser/inlineProgress.ts
var inlineProgressDecoration = ModelDecorationOptions.register({
  description: "inline-progress-widget",
  stickiness: 1 /* NeverGrowsWhenTypingAtEdges */,
  showIfCollapsed: true,
  after: {
    content: noBreakWhitespace,
    inlineClassName: "inline-editor-progress-decoration",
    inlineClassNameAffectsLetterSpacing: true,
    widthInEm: 1
  }
});

var InlineProgressWidget = class _InlineProgressWidget extends Disposable {
  constructor(typeId2, editor, range2, title, delegate) {
    super();
    this.typeId = typeId2;
    this.editor = editor;
    this.range = range2;
    this.delegate = delegate;
    this.allowEditorOverflow = false;
    this.suppressMouseDown = true;
    this.create(title);
    this.editor.addContentWidget(this);
    this.editor.layoutContentWidget(this);
  }
  static {
    this.baseId = "editor.widget.inlineProgressWidget";
  }
  create(title) {
    this.domNode = $(".inline-progress-widget");
    this.domNode.role = "button";
    this.domNode.title = title;
    const iconElement = $("span.icon");
    this.domNode.append(iconElement);
    iconElement.classList.add(...ThemeIcon.asClassNameArray(Codicon.loading), "codicon-modifier-spin");
    const updateSize = () => {
      const lineHeight = this.editor.getOption(75 /* lineHeight */);
      this.domNode.style.height = `${lineHeight}px`;
      this.domNode.style.width = `${Math.ceil(0.8 * lineHeight)}px`;
    };
    updateSize();
    this._register(this.editor.onDidChangeConfiguration((c) => {
      if (c.hasChanged(61 /* fontSize */) || c.hasChanged(75 /* lineHeight */)) {
        updateSize();
      }
    }));
    this._register(addDisposableListener(this.domNode, EventType.CLICK, (e) => {
      this.delegate.cancel();
    }));
  }
  getId() {
    return _InlineProgressWidget.baseId + "." + this.typeId;
  }
  getDomNode() {
    return this.domNode;
  }
  getPosition() {
    return {
      position: { lineNumber: this.range.startLineNumber, column: this.range.startColumn },
      preference: [0 /* EXACT */]
    };
  }
  dispose() {
    super.dispose();
    this.editor.removeContentWidget(this);
  }
};

var InlineProgressManager = class extends Disposable {
  constructor(id2, _editor, _instantiationService) {
    super();
    this.id = id2;
    this._editor = _editor;
    this._instantiationService = _instantiationService;
    /** Delay before showing the progress widget */
    this._showDelay = 500;
    // ms
    this._showPromise = this._register(new MutableDisposable());
    this._currentWidget = this._register(new MutableDisposable());
    this._operationIdPool = 0;
    this._currentDecorations = _editor.createDecorationsCollection();
  }
  dispose() {
    super.dispose();
    this._currentDecorations.clear();
  }
  async showWhile(position2, title, promise, delegate, delayOverride) {
    const operationId = this._operationIdPool++;
    this._currentOperation = operationId;
    this.clear();
    this._showPromise.value = disposableTimeout(() => {
      const range2 = Range2.fromPositions(position2);
      const decorationIds = this._currentDecorations.set([{
        range: range2,
        options: inlineProgressDecoration
      }]);
      if (decorationIds.length > 0) {
        this._currentWidget.value = this._instantiationService.createInstance(InlineProgressWidget, this.id, this._editor, range2, title, delegate);
      }
    }, delayOverride ?? this._showDelay);
    try {
      return await promise;
    } finally {
      if (this._currentOperation === operationId) {
        this.clear();
        this._currentOperation = void 0;
      }
    }
  }
  clear() {
    this._showPromise.clear();
    this._currentDecorations.clear();
    this._currentWidget.clear();
  }
};

InlineProgressManager = __decorateClass([
  __decorateParam(2, IInstantiationService)
], InlineProgressManager);
export { inlineProgressDecoration, InlineProgressWidget, InlineProgressManager };
