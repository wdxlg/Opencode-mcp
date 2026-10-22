// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/testing/browser/testResultsView/testResultsOutput.ts
import { EditorModel } from "./module-1096.mjs";
import { localize } from "./module-0001.mjs";
import { Disposable, DisposableStore, MutableDisposable, combinedDisposable, toDisposable } from "./module-0012.mjs";
import { Event2 } from "./module-0017.mjs";
import { MessageSubject, TaskSubject, TestOutputSubject } from "./module-3050.mjs";
import { ITestMessage, getMarkId } from "./module-1208.mjs";
import { EmbeddedDiffEditorWidget } from "./module-2947.mjs";
import { DiffEditorWidget } from "./module-0527.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IMarkdownRendererService } from "./module-0541.mjs";
import { CALL_STACK_WIDGET_HEADER_HEIGHT } from "./module-3051.mjs";
import { EmbeddedCodeEditorWidget } from "./module-0621.mjs";
import { CodeEditorWidget } from "./module-0441.mjs";
import { colorizeTestMessageInEditor } from "./module-3049.mjs";
import { MutableObservableValue } from "./module-3025.mjs";
import { Delayer } from "./module-0036.mjs";
import { TerminalCapabilityStore } from "./module-2353.mjs";
import { DetachedProcessInfo } from "./module-2356.mjs";
import { TERMINAL_BACKGROUND_COLOR } from "./module-1174.mjs";
import { peekViewResultsBackground } from "./module-0623.mjs";
import { PANEL_BACKGROUND, SIDE_BAR_BACKGROUND } from "./module-0912.mjs";
import { Iterable } from "./module-0011.mjs";
import { LiveTestResult } from "./module-1432.mjs";
import { formatMessageForTerminal } from "./module-3052.mjs";
import { getWindow, scheduleAtNextAnimationFrame } from "./module-0075.mjs";
import { getXtermScaledDimensions } from "./module-3066.mjs";
import { ITerminalService } from "./module-1149.mjs";
import { IViewDescriptorService } from "./module-1093.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";


// src/vs/workbench/contrib/testing/browser/testResultsView/testResultsOutput.ts
var SimpleDiffEditorModel2 = class extends EditorModel {
  constructor(_original, _modified) {
    super();
    this._original = _original;
    this._modified = _modified;
    this.original = this._original.object.textEditorModel;
    this.modified = this._modified.object.textEditorModel;
  }
  dispose() {
    super.dispose();
    this._original.dispose();
    this._modified.dispose();
  }
};

var commonEditorOptions = {
  scrollBeyondLastLine: false,
  links: true,
  lineNumbers: "off",
  glyphMargin: false,
  scrollbar: {
    vertical: "hidden",
    horizontal: "auto",
    useShadows: false,
    verticalHasArrows: false,
    horizontalHasArrows: false,
    handleMouseWheel: false
  },
  overviewRulerLanes: 0,
  fixedOverflowWidgets: true,
  readOnly: true,
  stickyScroll: { enabled: false },
  minimap: { enabled: false },
  automaticLayout: false
};

var diffEditorOptions = {
  ...commonEditorOptions,
  enableSplitViewResizing: true,
  isInEmbeddedEditor: true,
  renderOverviewRuler: false,
  ignoreTrimWhitespace: false,
  renderSideBySide: true,
  useInlineViewWhenSpaceIsLimited: false,
  originalAriaLabel: localize(21207, null),
  modifiedAriaLabel: localize(21206, null),
  diffAlgorithm: "advanced"
};

function applyEditorMirrorOptions(base, cfg, update) {
  const immutable = new Set(Object.keys(base));
  function applyCurrent() {
    const configuration2 = cfg.getValue("editor");
    let changed = false;
    const patch2 = {};
    for (const [key3, value2] of Object.entries(configuration2)) {
      if (!immutable.has(key3) && base[key3] !== value2) {
        patch2[key3] = value2;
        changed = true;
      }
    }
    return changed ? patch2 : void 0;
  }
  Object.assign(base, applyCurrent());
  return cfg.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration("editor")) {
      const patch2 = applyCurrent();
      if (patch2) {
        update(patch2);
        Object.assign(base, patch2);
      }
    }
  });
}

var DiffContentProvider = class extends Disposable {
  constructor(editor, container3, instantiationService, modelService, configurationService) {
    super();
    this.editor = editor;
    this.container = container3;
    this.instantiationService = instantiationService;
    this.modelService = modelService;
    this.configurationService = configurationService;
    this.widget = this._register(new MutableDisposable());
    this.model = this._register(new MutableDisposable());
  }
  get onDidContentSizeChange() {
    return this.widget.value?.onDidContentSizeChange || Event2.None;
  }
  async update(subject) {
    if (!(subject instanceof MessageSubject)) {
      this.clear();
      return false;
    }
    const message = subject.message;
    if (!ITestMessage.isDiffable(message)) {
      this.clear();
      return false;
    }
    const [original, modified] = await Promise.all([
      this.modelService.createModelReference(subject.expectedUri),
      this.modelService.createModelReference(subject.actualUri)
    ]);
    const model = this.model.value = new SimpleDiffEditorModel2(original, modified);
    if (!this.widget.value) {
      const options3 = { ...diffEditorOptions };
      const listener = applyEditorMirrorOptions(
        options3,
        this.configurationService,
        (u) => editor.updateOptions(u)
      );
      const editor = this.widget.value = this.editor ? this.instantiationService.createInstance(
        EmbeddedDiffEditorWidget,
        this.container,
        options3,
        {},
        this.editor
      ) : this.instantiationService.createInstance(
        DiffEditorWidget,
        this.container,
        options3,
        {}
      );
      Event2.once(editor.onDidDispose)(() => {
        listener.dispose();
      });
      if (this.dimension) {
        editor.layout(this.dimension);
      }
    }
    this.widget.value.setModel(model);
    this.widget.value.updateOptions(this.getOptions(
      isMultiline(message.expected) || isMultiline(message.actual)
    ));
    return true;
  }
  clear() {
    this.model.clear();
    this.widget.clear();
  }
  layout(dimensions, hasMultipleFrames) {
    this.dimension = dimensions;
    const editor = this.widget.value;
    if (!editor) {
      return;
    }
    editor.layout(dimensions);
    const height = Math.max(
      editor.getOriginalEditor().getContentHeight(),
      editor.getModifiedEditor().getContentHeight()
    );
    editor.updateOptions({ scrollbar: { ...commonEditorOptions.scrollbar, handleMouseWheel: !hasMultipleFrames } });
    this.helper = new ScrollHelper(hasMultipleFrames, height, dimensions.height);
    return height;
  }
  onScrolled(evt) {
    this.helper?.onScrolled(evt, this.widget.value?.getDomNode(), this.widget.value?.getOriginalEditor());
  }
  getOptions(isMultiline2) {
    return isMultiline2 ? { ...diffEditorOptions, lineNumbers: "on" } : { ...diffEditorOptions, lineNumbers: "off" };
  }
};

DiffContentProvider = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, ITextModelService),
  __decorateParam(4, IConfigurationService)
], DiffContentProvider);

var MarkdownTestMessagePeek = class extends Disposable {
  constructor(container3, markdownRendererService) {
    super();
    this.container = container3;
    this.markdownRendererService = markdownRendererService;
    this.rendered = this._register(new DisposableStore());
    this._register(toDisposable(() => this.clear()));
  }
  async update(subject) {
    this.clear();
    if (!(subject instanceof MessageSubject)) {
      return false;
    }
    const message = subject.message;
    if (ITestMessage.isDiffable(message) || typeof message.message === "string") {
      return false;
    }
    const rendered = this.rendered.add(this.markdownRendererService.render(message.message, {}));
    rendered.element.style.userSelect = "text";
    rendered.element.classList.add("preview-text");
    this.container.appendChild(rendered.element);
    this.element = rendered.element;
    this.rendered.add(toDisposable(() => rendered.element.remove()));
    return true;
  }
  layout(dimension) {
    if (!this.element) {
      return void 0;
    }
    this.element.style.width = `${dimension.width - 32}px`;
    return this.element.clientHeight;
  }
  clear() {
    this.rendered.clear();
    this.element = void 0;
  }
};

MarkdownTestMessagePeek = __decorateClass([
  __decorateParam(1, IMarkdownRendererService)
], MarkdownTestMessagePeek);

var ScrollHelper = class {
  constructor(hasMultipleFrames, contentHeight, viewHeight) {
    this.hasMultipleFrames = hasMultipleFrames;
    this.contentHeight = contentHeight;
    this.viewHeight = viewHeight;
  }
  onScrolled(evt, container3, editor) {
    if (!editor || !container3) {
      return;
    }
    let delta2 = Math.max(0, evt.scrollTop - (this.hasMultipleFrames ? CALL_STACK_WIDGET_HEADER_HEIGHT : 0));
    delta2 = Math.min(Math.max(0, this.contentHeight - this.viewHeight), delta2);
    editor.setScrollTop(delta2);
    container3.style.transform = `translateY(${delta2}px)`;
  }
};

var PlainTextMessagePeek = class extends Disposable {
  constructor(editor, container3, instantiationService, modelService, configurationService) {
    super();
    this.editor = editor;
    this.container = container3;
    this.instantiationService = instantiationService;
    this.modelService = modelService;
    this.configurationService = configurationService;
    this.widgetDecorations = this._register(new MutableDisposable());
    this.widget = this._register(new MutableDisposable());
    this.model = this._register(new MutableDisposable());
  }
  get onDidContentSizeChange() {
    return this.widget.value?.onDidContentSizeChange || Event2.None;
  }
  async update(subject) {
    if (!(subject instanceof MessageSubject)) {
      this.clear();
      return false;
    }
    const message = subject.message;
    if (ITestMessage.isDiffable(message) || message.type === 1 /* Output */ || typeof message.message !== "string") {
      this.clear();
      return false;
    }
    const modelRef = this.model.value = await this.modelService.createModelReference(subject.messageUri);
    if (!this.widget.value) {
      const options3 = { ...commonEditorOptions };
      const listener = applyEditorMirrorOptions(
        options3,
        this.configurationService,
        (u) => editor.updateOptions(u)
      );
      const editor = this.widget.value = this.editor ? this.instantiationService.createInstance(
        EmbeddedCodeEditorWidget,
        this.container,
        options3,
        {},
        this.editor
      ) : this.instantiationService.createInstance(
        CodeEditorWidget,
        this.container,
        options3,
        { isSimpleWidget: true }
      );
      Event2.once(editor.onDidDispose)(() => {
        listener.dispose();
      });
      if (this.dimension) {
        editor.layout(this.dimension);
      }
    }
    this.widget.value.setModel(modelRef.object.textEditorModel);
    this.widget.value.updateOptions(commonEditorOptions);
    this.widgetDecorations.value = colorizeTestMessageInEditor(message.message, this.widget.value);
    return true;
  }
  clear() {
    this.widgetDecorations.clear();
    this.widget.clear();
    this.model.clear();
  }
  onScrolled(evt) {
    this.helper?.onScrolled(evt, this.widget.value?.getDomNode(), this.widget.value);
  }
  layout(dimensions, hasMultipleFrames) {
    this.dimension = dimensions;
    const editor = this.widget.value;
    if (!editor) {
      return;
    }
    editor.layout(dimensions);
    const height = editor.getContentHeight();
    this.helper = new ScrollHelper(hasMultipleFrames, height, dimensions.height);
    editor.updateOptions({ scrollbar: { ...commonEditorOptions.scrollbar, handleMouseWheel: !hasMultipleFrames } });
    return height;
  }
};

PlainTextMessagePeek = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, ITextModelService),
  __decorateParam(4, IConfigurationService)
], PlainTextMessagePeek);

var TerminalMessagePeek = class extends Disposable {
  constructor(container3, isInPeekView, terminalService, viewDescriptorService, workspaceContext) {
    super();
    this.container = container3;
    this.isInPeekView = isInPeekView;
    this.terminalService = terminalService;
    this.viewDescriptorService = viewDescriptorService;
    this.workspaceContext = workspaceContext;
    this.terminalCwd = this._register(new MutableObservableValue(""));
    this.xtermLayoutDelayer = this._register(new Delayer(50));
    /** Active terminal instance. */
    this.terminal = this._register(new MutableDisposable());
    /** Listener for streaming result data */
    this.outputDataListener = this._register(new MutableDisposable());
  }
  async makeTerminal() {
    const prev = this.terminal.value;
    if (prev) {
      prev.xterm.clearBuffer();
      prev.xterm.clearSearchDecorations();
      prev.xterm.write(`\x1Bc`);
      return prev;
    }
    const capabilities = new TerminalCapabilityStore();
    const cwd2 = this.terminalCwd;
    capabilities.add(0 /* CwdDetection */, {
      type: 0 /* CwdDetection */,
      isTrusted: true,
      get cwds() {
        return [cwd2.value];
      },
      onDidChangeCwd: cwd2.onDidChange,
      getCwd: () => cwd2.value,
      updateCwd: () => {
      }
    });
    return this.terminal.value = await this.terminalService.createDetachedTerminal({
      rows: 10,
      cols: 80,
      readonly: true,
      capabilities,
      processInfo: new DetachedProcessInfo({ initialCwd: cwd2.value }),
      colorProvider: {
        getBackgroundColor: (theme) => {
          const terminalBackground = theme.getColor(TERMINAL_BACKGROUND_COLOR);
          if (terminalBackground) {
            return terminalBackground;
          }
          if (this.isInPeekView) {
            return theme.getColor(peekViewResultsBackground);
          }
          const location2 = this.viewDescriptorService.getViewLocationById("workbench.panel.testResults.view" /* ResultsViewId */);
          return location2 === 1 /* Panel */ ? theme.getColor(PANEL_BACKGROUND) : theme.getColor(SIDE_BAR_BACKGROUND);
        }
      }
    });
  }
  async update(subject) {
    this.outputDataListener.clear();
    if (subject instanceof TaskSubject) {
      await this.updateForTaskSubject(subject);
    } else if (subject instanceof TestOutputSubject || subject instanceof MessageSubject && subject.message.type === 1 /* Output */) {
      await this.updateForTestSubject(subject);
    } else {
      this.clear();
      return false;
    }
    return true;
  }
  async updateForTestSubject(subject) {
    const that = this;
    const testItem = subject instanceof TestOutputSubject ? subject.test.item : subject.test;
    const terminal2 = await this.updateGenerically({
      subject,
      noOutputMessage: localize(21203, null),
      getTarget: (result) => result?.tasks[subject.taskIndex].output,
      *doInitialWrite(output, results) {
        that.updateCwd(testItem.uri);
        const state = subject instanceof TestOutputSubject ? subject.test : results.getStateById(testItem.extId);
        if (!state) {
          return;
        }
        for (const message of state.tasks[subject.taskIndex].messages) {
          if (message.type === 1 /* Output */) {
            yield* output.getRangeIter(message.offset, message.length);
          }
        }
      },
      doListenForMoreData: (output, result, write) => result.onChange((e) => {
        if (e.reason === 2 /* NewMessage */ && e.item.item.extId === testItem.extId && e.message.type === 1 /* Output */) {
          for (const chunk of output.getRangeIter(e.message.offset, e.message.length)) {
            write(chunk.buffer);
          }
        }
      })
    });
    if (subject instanceof MessageSubject && subject.message.type === 1 /* Output */ && subject.message.marker !== void 0) {
      terminal2?.xterm.selectMarkedRange(
        getMarkId(subject.message.marker, true),
        getMarkId(subject.message.marker, false),
        /* scrollIntoView= */
        true
      );
    }
  }
  updateForTaskSubject(subject) {
    return this.updateGenerically({
      subject,
      noOutputMessage: localize(21204, null),
      getTarget: (result) => result?.tasks[subject.taskIndex],
      doInitialWrite: (task, result) => {
        this.updateCwd(Iterable.find(result.tests, (t2) => !!t2.item.uri)?.item.uri);
        return task.output.buffers;
      },
      doListenForMoreData: (task, _result, write) => task.output.onDidWriteData((e) => write(e.buffer))
    });
  }
  async updateGenerically(opts) {
    const result = opts.subject.result;
    const target = opts.getTarget(result);
    if (!target) {
      return this.clear();
    }
    const terminal2 = await this.makeTerminal();
    let didWriteData = false;
    const pendingWrites = new MutableObservableValue(0);
    if (result instanceof LiveTestResult) {
      for (const chunk of opts.doInitialWrite(target, result)) {
        didWriteData ||= chunk.byteLength > 0;
        pendingWrites.value++;
        terminal2.xterm.write(chunk.buffer, () => pendingWrites.value--);
      }
    } else {
      didWriteData = true;
      this.writeNotice(terminal2, localize(21205, null));
    }
    this.attachTerminalToDom(terminal2);
    this.outputDataListener.clear();
    if (result instanceof LiveTestResult && !result.completedAt) {
      const l1 = result.onComplete(() => {
        if (!didWriteData) {
          this.writeNotice(terminal2, opts.noOutputMessage);
        }
      });
      const l2 = opts.doListenForMoreData(target, result, (data) => {
        terminal2.xterm.write(data);
        didWriteData ||= data.byteLength > 0;
      });
      this.outputDataListener.value = combinedDisposable(l1, l2);
    }
    if (!this.outputDataListener.value && !didWriteData) {
      this.writeNotice(terminal2, opts.noOutputMessage);
    }
    if (pendingWrites.value > 0) {
      await new Promise((resolve3) => {
        const l = pendingWrites.onDidChange(() => {
          if (pendingWrites.value === 0) {
            l.dispose();
            resolve3();
          }
        });
      });
    }
    return terminal2;
  }
  updateCwd(testUri) {
    const wf = testUri && this.workspaceContext.getWorkspaceFolder(testUri) || this.workspaceContext.getWorkspace().folders[0];
    if (wf) {
      this.terminalCwd.value = wf.uri.fsPath;
    }
  }
  writeNotice(terminal2, str) {
    terminal2.xterm.write(formatMessageForTerminal(str));
  }
  attachTerminalToDom(terminal2) {
    terminal2.xterm.write("\x1B[?25l");
    scheduleAtNextAnimationFrame(getWindow(this.container), () => this.layoutTerminal(terminal2));
    terminal2.attachToElement(this.container, { enableGpu: false });
  }
  clear() {
    this.outputDataListener.clear();
    this.xtermLayoutDelayer.cancel();
    this.terminal.clear();
  }
  layout(dimensions) {
    this.dimensions = dimensions;
    if (this.terminal.value) {
      this.layoutTerminal(this.terminal.value, dimensions.width, dimensions.height);
      return dimensions.height;
    }
    return void 0;
  }
  layoutTerminal({ xterm }, width2 = this.dimensions?.width ?? this.container.clientWidth, height = this.dimensions?.height ?? this.container.clientHeight) {
    width2 -= 10 + 20;
    this.xtermLayoutDelayer.trigger(() => {
      const scaled = getXtermScaledDimensions(getWindow(this.container), xterm.getFont(), width2, height);
      if (scaled) {
        xterm.resize(scaled.cols, scaled.rows);
      }
    });
  }
};

TerminalMessagePeek = __decorateClass([
  __decorateParam(2, ITerminalService),
  __decorateParam(3, IViewDescriptorService),
  __decorateParam(4, IWorkspaceContextService)
], TerminalMessagePeek);

var isMultiline = (str) => !!str && str.includes("\n");
export { applyEditorMirrorOptions, SimpleDiffEditorModel2, commonEditorOptions, diffEditorOptions, DiffContentProvider, MarkdownTestMessagePeek, ScrollHelper, PlainTextMessagePeek, TerminalMessagePeek, isMultiline };
