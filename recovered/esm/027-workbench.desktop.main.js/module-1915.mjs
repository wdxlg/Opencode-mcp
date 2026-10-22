// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/view/cellParts/cellComments.ts
import { CellContentPart } from "./module-1896.mjs";
import { DisposableMap, DisposableStore } from "./module-0012.mjs";
import { CommentThreadWidget } from "./module-1371.mjs";
import { coalesce } from "./module-0007.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IThemeService } from "./module-0287.mjs";
import { ICommentService } from "./module-1322.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/workbench/contrib/notebook/browser/view/cellParts/cellComments.ts
var CellComments = class extends CellContentPart {
  constructor(notebookEditor, container3, contextKeyService, themeService, commentService, instantiationService) {
    super();
    this.notebookEditor = notebookEditor;
    this.container = container3;
    this.contextKeyService = contextKeyService;
    this.themeService = themeService;
    this.commentService = commentService;
    this.instantiationService = instantiationService;
    this.container.classList.add("review-widget");
    this._register(this._commentThreadWidgets = new DisposableMap());
    this._register(this.themeService.onDidColorThemeChange(this._applyTheme, this));
    this._applyTheme();
  }
  async initialize(element) {
    if (this.currentElement === element) {
      return;
    }
    this.currentElement = element;
    await this._updateThread();
  }
  async _createCommentTheadWidget(owner, commentThread) {
    const widgetDisposables = new DisposableStore();
    const widget = this.instantiationService.createInstance(
      CommentThreadWidget,
      this.container,
      this.notebookEditor,
      owner,
      this.notebookEditor.textModel.uri,
      this.contextKeyService,
      this.instantiationService,
      commentThread,
      void 0,
      void 0,
      {},
      void 0,
      {
        actionRunner: () => {
        },
        collapse: async () => {
          return true;
        }
      }
    );
    widgetDisposables.add(widget);
    this._commentThreadWidgets.set(commentThread.threadId, { widget, dispose: () => widgetDisposables.dispose() });
    const layoutInfo = this.notebookEditor.getLayoutInfo();
    await widget.display(layoutInfo.fontInfo.lineHeight, true);
    this._applyTheme();
    widgetDisposables.add(widget.onDidResize(() => {
      if (this.currentElement) {
        this.currentElement.commentHeight = this._calculateCommentThreadHeight(widget.getDimensions().height);
      }
    }));
  }
  _bindListeners() {
    this.cellDisposables.add(this.commentService.onDidUpdateCommentThreads(async () => this._updateThread()));
  }
  async _updateThread() {
    if (!this.currentElement) {
      return;
    }
    const infos = await this._getCommentThreadsForCell(this.currentElement);
    const widgetsToDelete = new Set(this._commentThreadWidgets.keys());
    const layoutInfo = this.currentElement.layoutInfo;
    this.container.style.top = `${layoutInfo.commentOffset}px`;
    for (const info of infos) {
      if (!info) {
        continue;
      }
      for (const thread of info.threads) {
        widgetsToDelete.delete(thread.threadId);
        const widget = this._commentThreadWidgets.get(thread.threadId)?.widget;
        if (widget) {
          await widget.updateCommentThread(thread);
        } else {
          await this._createCommentTheadWidget(info.uniqueOwner, thread);
        }
      }
    }
    for (const threadId of widgetsToDelete) {
      this._commentThreadWidgets.deleteAndDispose(threadId);
    }
    this._updateHeight();
  }
  _calculateCommentThreadHeight(bodyHeight) {
    const layoutInfo = this.notebookEditor.getLayoutInfo();
    const headHeight = Math.ceil(layoutInfo.fontInfo.lineHeight * 1.2);
    const lineHeight = layoutInfo.fontInfo.lineHeight;
    const arrowHeight = Math.round(lineHeight / 3);
    const frameThickness = Math.round(lineHeight / 9) * 2;
    const computedHeight = headHeight + bodyHeight + arrowHeight + frameThickness + 8;
    return computedHeight;
  }
  _updateHeight() {
    if (!this.currentElement) {
      return;
    }
    let height = 0;
    for (const { widget } of this._commentThreadWidgets.values()) {
      height += this._calculateCommentThreadHeight(widget.getDimensions().height);
    }
    this.currentElement.commentHeight = height;
  }
  async _getCommentThreadsForCell(element) {
    if (this.notebookEditor.hasModel()) {
      return coalesce(await this.commentService.getNotebookComments(element.uri));
    }
    return [];
  }
  _applyTheme() {
    const fontInfo = this.notebookEditor.getLayoutInfo().fontInfo;
    for (const { widget } of this._commentThreadWidgets.values()) {
      widget.applyTheme(fontInfo);
    }
  }
  didRenderCell(element) {
    this.initialize(element);
    this._bindListeners();
  }
  prepareLayout() {
    this._updateHeight();
  }
  updateInternalLayoutNow(element) {
    if (this.currentElement) {
      this.container.style.top = `${element.layoutInfo.commentOffset}px`;
    }
  }
};

CellComments = __decorateClass([
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, IThemeService),
  __decorateParam(4, ICommentService),
  __decorateParam(5, IInstantiationService)
], CellComments);
export { CellComments };
