// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/debug/browser/callStackWidget.ts
import { observableValue } from "./module-0048.mjs";
import { derived } from "./module-0054.mjs";
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { WorkbenchList } from "./module-0636.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { transaction } from "./module-0045.mjs";
import { autorun, autorunWithStore } from "./module-0052.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { assertNever } from "./module-0009.mjs";
import { ILabelService } from "./module-0641.mjs";
import { addDisposableListener, h } from "./module-0075.mjs";
import { ResourceLabel } from "./module-1323.mjs";
import { Button } from "./module-0546.mjs";
import { generateUuid } from "./module-0190.mjs";
import { Codicon } from "./module-0085.mjs";
import { EmbeddedCodeEditorWidget } from "./module-0621.mjs";
import { CodeEditorWidget } from "./module-0441.mjs";
import { MenuWorkbenchToolBar } from "./module-0519.mjs";
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { createActionViewItem } from "./module-0516.mjs";
import { Range2 } from "./module-0106.mjs";
import { TOP_STACK_FRAME_DECORATION, makeStackFrameColumnDecoration } from "./module-2451.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { defaultButtonStyles } from "./module-0513.mjs";
import { INotificationService } from "./module-0336.mjs";
import { ClickLinkGesture } from "./module-0619.mjs";
import { Position } from "./module-0079.mjs";
import { IEditorService, SIDE_GROUP } from "./module-0934.mjs";


// src/vs/workbench/contrib/debug/browser/callStackWidget.ts
var CallStackFrame = class {
  constructor(name, source, line = 1, column = 1) {
    this.name = name;
    this.source = source;
    this.line = line;
    this.column = column;
  }
};

var SkippedCallFrames = class {
  constructor(label3, load) {
    this.label = label3;
    this.load = load;
  }
};

var CustomStackFrame = class {
  constructor() {
    this.showHeader = observableValue("CustomStackFrame.showHeader", true);
  }
};

var WrappedCallStackFrame = class extends CallStackFrame {
  constructor(original) {
    super(original.name, original.source, original.line, original.column);
    this.editorHeight = observableValue("WrappedCallStackFrame.height", this.source ? 100 : 0);
    this.collapsed = observableValue("WrappedCallStackFrame.collapsed", false);
    this.height = derived((reader) => {
      return this.collapsed.read(reader) ? CALL_STACK_WIDGET_HEADER_HEIGHT : CALL_STACK_WIDGET_HEADER_HEIGHT + this.editorHeight.read(reader);
    });
  }
};

var WrappedCustomStackFrame = class {
  constructor(original) {
    this.original = original;
    this.collapsed = observableValue("WrappedCallStackFrame.collapsed", false);
    this.height = derived((reader) => {
      const headerHeight = this.original.showHeader.read(reader) ? CALL_STACK_WIDGET_HEADER_HEIGHT : 0;
      return this.collapsed.read(reader) ? headerHeight : headerHeight + this.original.height.read(reader);
    });
  }
};

var isFrameLike = (item) => item instanceof WrappedCallStackFrame || item instanceof WrappedCustomStackFrame;

var WIDGET_CLASS_NAME = "multiCallStackWidget";

var CallStackWidget = class extends Disposable {
  constructor(container3, containingEditor, instantiationService) {
    super();
    this.layoutEmitter = this._register(new Emitter());
    this.currentFramesDs = this._register(new DisposableStore());
    container3.classList.add(WIDGET_CLASS_NAME);
    this._register(toDisposable(() => container3.classList.remove(WIDGET_CLASS_NAME)));
    this.list = this._register(instantiationService.createInstance(
      WorkbenchList,
      "TestResultStackWidget",
      container3,
      new StackDelegate(),
      [
        instantiationService.createInstance(FrameCodeRenderer, containingEditor, this.layoutEmitter.event),
        instantiationService.createInstance(MissingCodeRenderer),
        instantiationService.createInstance(CustomRenderer),
        instantiationService.createInstance(SkippedRenderer, (i2) => this.loadFrame(i2))
      ],
      {
        multipleSelectionSupport: false,
        mouseSupport: false,
        keyboardSupport: false,
        setRowLineHeight: false,
        alwaysConsumeMouseWheel: false,
        accessibilityProvider: instantiationService.createInstance(StackAccessibilityProvider)
      }
    ));
  }
  get onDidChangeContentHeight() {
    return this.list.onDidChangeContentHeight;
  }
  get onDidScroll() {
    return this.list.onDidScroll;
  }
  get contentHeight() {
    return this.list.contentHeight;
  }
  /** Replaces the call frames display in the view. */
  setFrames(frames) {
    this.currentFramesDs.clear();
    const cts = new CancellationTokenSource();
    this.currentFramesDs.add(toDisposable(() => cts.dispose(true)));
    this.cts = cts;
    this.list.splice(0, this.list.length, this.mapFrames(frames));
  }
  layout(height, width2) {
    this.list.layout(height, width2);
    this.layoutEmitter.fire();
  }
  collapseAll() {
    transaction((tx) => {
      for (let i2 = 0; i2 < this.list.length; i2++) {
        const frame = this.list.element(i2);
        if (isFrameLike(frame)) {
          frame.collapsed.set(true, tx);
        }
      }
    });
  }
  async loadFrame(replacing) {
    if (!this.cts) {
      return;
    }
    const frames = await replacing.load(this.cts.token);
    if (this.cts.token.isCancellationRequested) {
      return;
    }
    const index2 = this.list.indexOf(replacing);
    this.list.splice(index2, 1, this.mapFrames(frames));
  }
  mapFrames(frames) {
    const result = [];
    for (const frame of frames) {
      if (frame instanceof SkippedCallFrames) {
        result.push(frame);
        continue;
      }
      const wrapped = frame instanceof CustomStackFrame ? new WrappedCustomStackFrame(frame) : new WrappedCallStackFrame(frame);
      result.push(wrapped);
      this.currentFramesDs.add(autorun((reader) => {
        const height = wrapped.height.read(reader);
        const idx = this.list.indexOf(wrapped);
        if (idx !== -1) {
          this.list.updateElementHeight(idx, height);
        }
      }));
    }
    return result;
  }
};

CallStackWidget = __decorateClass([
  __decorateParam(2, IInstantiationService)
], CallStackWidget);

var StackAccessibilityProvider = class {
  constructor(labelService) {
    this.labelService = labelService;
  }
  getAriaLabel(e) {
    if (e instanceof SkippedCallFrames) {
      return e.label;
    }
    if (e instanceof WrappedCustomStackFrame) {
      return e.original.label;
    }
    if (e instanceof CallStackFrame) {
      if (e.source && e.line) {
        return localize(14244, null, e.name, e.line, this.labelService.getUriLabel(e.source, { relative: true }));
      }
      return e.name;
    }
    assertNever(e);
  }
  getWidgetAriaLabel() {
    return localize(14243, null);
  }
};

StackAccessibilityProvider = __decorateClass([
  __decorateParam(0, ILabelService)
], StackAccessibilityProvider);

var StackDelegate = class {
  getHeight(element) {
    if (element instanceof CallStackFrame || element instanceof WrappedCustomStackFrame) {
      return element.height.get();
    }
    if (element instanceof SkippedCallFrames) {
      return CALL_STACK_WIDGET_HEADER_HEIGHT;
    }
    assertNever(element);
  }
  getTemplateId(element) {
    if (element instanceof CallStackFrame) {
      return element.source ? FrameCodeRenderer.templateId : MissingCodeRenderer.templateId;
    }
    if (element instanceof SkippedCallFrames) {
      return SkippedRenderer.templateId;
    }
    if (element instanceof WrappedCustomStackFrame) {
      return CustomRenderer.templateId;
    }
    assertNever(element);
  }
};

var editorOptions = {
  scrollBeyondLastLine: false,
  scrollbar: {
    vertical: "hidden",
    horizontal: "hidden",
    handleMouseWheel: false,
    useShadows: false
  },
  overviewRulerLanes: 0,
  fixedOverflowWidgets: true,
  overviewRulerBorder: false,
  stickyScroll: { enabled: false },
  minimap: { enabled: false },
  readOnly: true,
  automaticLayout: false
};

var makeFrameElements = () => h("div.multiCallStackFrame", [
  h("div.header@header", [
    h("div.collapse-button@collapseButton"),
    h("div.title.show-file-icons@title"),
    h("div.actions@actions")
  ]),
  h("div.editorParent", [
    h("div.editorContainer@editor")
  ])
]);

var CALL_STACK_WIDGET_HEADER_HEIGHT = 24;

var AbstractFrameRenderer = class {
  constructor(instantiationService) {
    this.instantiationService = instantiationService;
  }
  renderTemplate(container3) {
    const elements = makeFrameElements();
    container3.appendChild(elements.root);
    const templateStore = new DisposableStore();
    container3.classList.add("multiCallStackFrameContainer");
    templateStore.add(toDisposable(() => {
      container3.classList.remove("multiCallStackFrameContainer");
      elements.root.remove();
    }));
    const label3 = templateStore.add(this.instantiationService.createInstance(ResourceLabel, elements.title, {}));
    const collapse = templateStore.add(new Button(elements.collapseButton, {}));
    const contentId = generateUuid();
    elements.editor.id = contentId;
    elements.editor.role = "region";
    elements.collapseButton.setAttribute("aria-controls", contentId);
    return this.finishRenderTemplate({
      container: container3,
      decorations: [],
      elements,
      label: label3,
      collapse,
      elementStore: templateStore.add(new DisposableStore()),
      templateStore
    });
  }
  renderElement(element, index2, template2) {
    const { elementStore } = template2;
    elementStore.clear();
    const item = element;
    this.setupCollapseButton(item, template2);
  }
  setupCollapseButton(item, { elementStore, elements, collapse }) {
    elementStore.add(autorun((reader) => {
      collapse.element.className = "";
      const collapsed2 = item.collapsed.read(reader);
      collapse.icon = collapsed2 ? Codicon.chevronRight : Codicon.chevronDown;
      collapse.element.ariaExpanded = String(!collapsed2);
      elements.root.classList.toggle("collapsed", collapsed2);
    }));
    const toggleCollapse = () => item.collapsed.set(!item.collapsed.get(), void 0);
    elementStore.add(collapse.onDidClick(toggleCollapse));
    elementStore.add(addDisposableListener(elements.title, "click", toggleCollapse));
  }
  disposeElement(element, index2, templateData) {
    templateData.elementStore.clear();
  }
  disposeTemplate(templateData) {
    templateData.templateStore.dispose();
  }
};

AbstractFrameRenderer = __decorateClass([
  __decorateParam(0, IInstantiationService)
], AbstractFrameRenderer);

var CONTEXT_LINES = 2;

var FrameCodeRenderer = class extends AbstractFrameRenderer {
  constructor(containingEditor, onLayout, modelService, instantiationService) {
    super(instantiationService);
    this.containingEditor = containingEditor;
    this.onLayout = onLayout;
    this.modelService = modelService;
    this.templateId = FrameCodeRenderer.templateId;
  }
  static {
    this.templateId = "f";
  }
  finishRenderTemplate(data) {
    const contributions = [{
      id: ClickToLocationContribution.ID,
      instantiation: 2 /* BeforeFirstInteraction */,
      ctor: ClickToLocationContribution
    }];
    const editor = this.containingEditor ? this.instantiationService.createInstance(
      EmbeddedCodeEditorWidget,
      data.elements.editor,
      editorOptions,
      { isSimpleWidget: true, contributions },
      this.containingEditor
    ) : this.instantiationService.createInstance(
      CodeEditorWidget,
      data.elements.editor,
      editorOptions,
      { isSimpleWidget: true, contributions }
    );
    data.templateStore.add(editor);
    const toolbar = data.templateStore.add(this.instantiationService.createInstance(MenuWorkbenchToolBar, data.elements.actions, MenuId.DebugCallStackToolbar, {
      menuOptions: { shouldForwardArgs: true },
      actionViewItemProvider: (action, options3) => createActionViewItem(this.instantiationService, action, options3)
    }));
    return { ...data, editor, toolbar };
  }
  renderElement(element, index2, template2) {
    super.renderElement(element, index2, template2);
    const { elementStore, editor } = template2;
    const item = element;
    const uri5 = item.source;
    template2.label.element.setFile(uri5);
    const cts = new CancellationTokenSource();
    elementStore.add(toDisposable(() => cts.dispose(true)));
    this.modelService.createModelReference(uri5).then((reference) => {
      if (cts.token.isCancellationRequested) {
        return reference.dispose();
      }
      elementStore.add(reference);
      editor.setModel(reference.object.textEditorModel);
      this.setupEditorAfterModel(item, template2);
      this.setupEditorLayout(item, template2);
    });
  }
  setupEditorLayout(item, { elementStore, container: container3, editor }) {
    const layout2 = () => {
      const prev = editor.getContentHeight();
      editor.layout({ width: container3.clientWidth, height: prev });
      const next = editor.getContentHeight();
      if (next !== prev) {
        editor.layout({ width: container3.clientWidth, height: next });
      }
      item.editorHeight.set(next, void 0);
    };
    elementStore.add(editor.onDidChangeModelDecorations(layout2));
    elementStore.add(editor.onDidChangeModelContent(layout2));
    elementStore.add(editor.onDidChangeModelOptions(layout2));
    elementStore.add(this.onLayout(layout2));
    layout2();
  }
  setupEditorAfterModel(item, template2) {
    const range2 = Range2.fromPositions({
      column: item.column ?? 1,
      lineNumber: item.line ?? 1
    });
    template2.toolbar.context = { uri: item.source, range: range2 };
    template2.editor.setHiddenAreas([
      Range2.fromPositions(
        { column: 1, lineNumber: 1 },
        { column: 1, lineNumber: Math.max(1, item.line - CONTEXT_LINES - 1) }
      ),
      Range2.fromPositions(
        { column: 1, lineNumber: item.line + CONTEXT_LINES + 1 },
        { column: 1, lineNumber: 1073741824 /* MAX_SAFE_SMALL_INTEGER */ }
      )
    ]);
    template2.editor.changeDecorations((accessor) => {
      for (const d of template2.decorations) {
        accessor.removeDecoration(d);
      }
      template2.decorations.length = 0;
      const beforeRange = range2.setStartPosition(range2.startLineNumber, 1);
      const hasCharactersBefore = !!template2.editor.getModel()?.getValueInRange(beforeRange).trim();
      const decoRange = range2.setEndPosition(range2.startLineNumber, 1073741824 /* MAX_SAFE_SMALL_INTEGER */);
      template2.decorations.push(accessor.addDecoration(
        decoRange,
        makeStackFrameColumnDecoration(!hasCharactersBefore)
      ));
      template2.decorations.push(accessor.addDecoration(
        decoRange,
        TOP_STACK_FRAME_DECORATION
      ));
    });
    item.editorHeight.set(template2.editor.getContentHeight(), void 0);
  }
};

FrameCodeRenderer = __decorateClass([
  __decorateParam(2, ITextModelService),
  __decorateParam(3, IInstantiationService)
], FrameCodeRenderer);

var MissingCodeRenderer = class {
  constructor(instantiationService) {
    this.instantiationService = instantiationService;
    this.templateId = MissingCodeRenderer.templateId;
  }
  static {
    this.templateId = "m";
  }
  renderTemplate(container3) {
    const elements = makeFrameElements();
    elements.root.classList.add("missing");
    container3.appendChild(elements.root);
    const label3 = this.instantiationService.createInstance(ResourceLabel, elements.title, {});
    return { elements, label: label3 };
  }
  renderElement(element, _index, templateData) {
    const cast = element;
    templateData.label.element.setResource({
      name: cast.name,
      description: localize(14242, null, cast.line, cast.column),
      range: { startLineNumber: cast.line, startColumn: cast.column, endColumn: cast.column, endLineNumber: cast.line }
    }, {
      icon: Codicon.fileBinary
    });
  }
  disposeTemplate(templateData) {
    templateData.label.dispose();
    templateData.elements.root.remove();
  }
};

MissingCodeRenderer = __decorateClass([
  __decorateParam(0, IInstantiationService)
], MissingCodeRenderer);

var CustomRenderer = class _CustomRenderer extends AbstractFrameRenderer {
  constructor() {
    super(...arguments);
    this.templateId = _CustomRenderer.templateId;
  }
  static {
    this.templateId = "c";
  }
  finishRenderTemplate(data) {
    return data;
  }
  renderElement(element, index2, template2) {
    super.renderElement(element, index2, template2);
    const item = element;
    const { elementStore, container: container3, label: label3 } = template2;
    label3.element.setResource({ name: item.original.label }, { icon: item.original.icon });
    elementStore.add(autorun((reader) => {
      template2.elements.header.style.display = item.original.showHeader.read(reader) ? "" : "none";
    }));
    elementStore.add(autorunWithStore((reader, store) => {
      if (!item.collapsed.read(reader)) {
        store.add(item.original.render(container3));
      }
    }));
    const actions = item.original.renderActions?.(template2.elements.actions);
    if (actions) {
      elementStore.add(actions);
    }
  }
};

var SkippedRenderer = class {
  constructor(loadFrames, notificationService) {
    this.loadFrames = loadFrames;
    this.notificationService = notificationService;
    this.templateId = SkippedRenderer.templateId;
  }
  static {
    this.templateId = "s";
  }
  renderTemplate(container3) {
    const store = new DisposableStore();
    const button = new Button(container3, { title: "", ...defaultButtonStyles });
    const data = { button, store };
    store.add(button);
    store.add(button.onDidClick(() => {
      if (!data.current || !button.enabled) {
        return;
      }
      button.enabled = false;
      this.loadFrames(data.current).catch((e) => {
        this.notificationService.error(localize(14240, null, e.message));
      });
    }));
    return data;
  }
  renderElement(element, index2, templateData) {
    const cast = element;
    templateData.button.enabled = true;
    templateData.button.label = cast.label;
    templateData.current = cast;
  }
  disposeTemplate(templateData) {
    templateData.store.dispose();
  }
};

SkippedRenderer = __decorateClass([
  __decorateParam(1, INotificationService)
], SkippedRenderer);

var ClickToLocationContribution = class extends Disposable {
  constructor(editor, editorService) {
    super();
    this.editor = editor;
    this.linkDecorations = editor.createDecorationsCollection();
    this._register(toDisposable(() => this.linkDecorations.clear()));
    const clickLinkGesture = this._register(new ClickLinkGesture(editor));
    this._register(clickLinkGesture.onMouseMoveOrRelevantKeyDown(([mouseEvent, keyboardEvent]) => {
      this.onMove(mouseEvent);
    }));
    this._register(clickLinkGesture.onExecute((e) => {
      const model = this.editor.getModel();
      if (!this.current || !model) {
        return;
      }
      editorService.openEditor({
        resource: model.uri,
        options: {
          selection: Range2.fromPositions(new Position(this.current.line, this.current.word.startColumn)),
          selectionRevealType: 1 /* CenterIfOutsideViewport */
        }
      }, e.hasSideBySideModifier ? SIDE_GROUP : void 0);
    }));
  }
  static {
    this.ID = "clickToLocation";
  }
  onMove(mouseEvent) {
    if (!mouseEvent.hasTriggerModifier) {
      return this.clear();
    }
    const position2 = mouseEvent.target.position;
    const word = position2 && this.editor.getModel()?.getWordAtPosition(position2);
    if (!word) {
      return this.clear();
    }
    const prev = this.current?.word;
    if (prev && prev.startColumn === word.startColumn && prev.endColumn === word.endColumn && prev.word === word.word) {
      return;
    }
    this.current = { word, line: position2.lineNumber };
    this.linkDecorations.set([{
      range: new Range2(position2.lineNumber, word.startColumn, position2.lineNumber, word.endColumn),
      options: {
        description: "call-stack-go-to-file-link",
        inlineClassName: "call-stack-go-to-file-link"
      }
    }]);
  }
  clear() {
    this.linkDecorations.clear();
    this.current = void 0;
  }
};

ClickToLocationContribution = __decorateClass([
  __decorateParam(1, IEditorService)
], ClickToLocationContribution);

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "callStackWidget.goToFile",
      title: localize2(14241, "Open File"),
      icon: Codicon.goToFile,
      menu: {
        id: MenuId.DebugCallStackToolbar,
        order: 22,
        group: "navigation"
      }
    });
  }
  async run(accessor, { uri: uri5, range: range2 }) {
    const editorService = accessor.get(IEditorService);
    await editorService.openEditor({
      resource: uri5,
      options: {
        selection: range2,
        selectionRevealType: 1 /* CenterIfOutsideViewport */
      }
    });
  }
});
export { CallStackFrame, SkippedCallFrames, CustomStackFrame, WrappedCallStackFrame, WrappedCustomStackFrame, isFrameLike, WIDGET_CLASS_NAME, CallStackWidget, StackAccessibilityProvider, StackDelegate, editorOptions, makeFrameElements, CALL_STACK_WIDGET_HEADER_HEIGHT, AbstractFrameRenderer, CONTEXT_LINES, FrameCodeRenderer, MissingCodeRenderer, CustomRenderer, SkippedRenderer, ClickToLocationContribution };
