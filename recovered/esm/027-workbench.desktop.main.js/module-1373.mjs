// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/comments/browser/commentThreadRangeDecorator.ts
import { Disposable, dispose } from "./module-0012.mjs";
import { ModelDecorationOptions } from "./module-0423.mjs";


// src/vs/workbench/contrib/comments/browser/commentThreadRangeDecorator.ts
var CommentThreadRangeDecoration = class {
  constructor(range2, options3) {
    this.range = range2;
    this.options = options3;
  }
  get id() {
    return this._decorationId;
  }
  set id(id2) {
    this._decorationId = id2;
  }
};

var CommentThreadRangeDecorator = class _CommentThreadRangeDecorator extends Disposable {
  constructor(commentService) {
    super();
    this.decorationIds = [];
    this.activeDecorationIds = [];
    this.threadCollapseStateListeners = [];
    const decorationOptions = {
      description: _CommentThreadRangeDecorator.description,
      isWholeLine: false,
      zIndex: 20,
      className: "comment-thread-range",
      shouldFillLineOnLineBreak: true
    };
    this.decorationOptions = ModelDecorationOptions.createDynamic(decorationOptions);
    const activeDecorationOptions = {
      description: _CommentThreadRangeDecorator.description,
      isWholeLine: false,
      zIndex: 20,
      className: "comment-thread-range-current",
      shouldFillLineOnLineBreak: true
    };
    this.activeDecorationOptions = ModelDecorationOptions.createDynamic(activeDecorationOptions);
    this._register(commentService.onDidChangeCurrentCommentThread((thread) => {
      this.updateCurrent(thread);
    }));
    this._register(commentService.onDidUpdateCommentThreads(() => {
      this.updateCurrent(void 0);
    }));
  }
  static {
    this.description = "comment-thread-range-decorator";
  }
  updateCurrent(thread) {
    if (!this.editor || thread?.resource && thread.resource?.toString() !== this.editor.getModel()?.uri.toString()) {
      return;
    }
    this.currentThreadCollapseStateListener?.dispose();
    const newDecoration = [];
    if (thread) {
      const range2 = thread.range;
      if (range2 && !(range2.startLineNumber === range2.endLineNumber && range2.startColumn === range2.endColumn)) {
        if (thread.collapsibleState === 1 /* Expanded */) {
          this.currentThreadCollapseStateListener = thread.onDidChangeCollapsibleState((state) => {
            if (state === 0 /* Collapsed */) {
              this.updateCurrent(void 0);
            }
          });
          newDecoration.push(new CommentThreadRangeDecoration(range2, this.activeDecorationOptions));
        }
      }
    }
    this.editor.changeDecorations((changeAccessor) => {
      this.activeDecorationIds = changeAccessor.deltaDecorations(this.activeDecorationIds, newDecoration);
      newDecoration.forEach((decoration3, index2) => decoration3.id = this.decorationIds[index2]);
    });
  }
  update(editor, commentInfos) {
    const model = editor?.getModel();
    if (!editor || !model) {
      return;
    }
    dispose(this.threadCollapseStateListeners);
    this.editor = editor;
    const commentThreadRangeDecorations = [];
    for (const info of commentInfos) {
      info.threads.forEach((thread) => {
        if (thread.isDisposed) {
          return;
        }
        const range2 = thread.range;
        if (!range2 || range2.startLineNumber === range2.endLineNumber && range2.startColumn === range2.endColumn) {
          return;
        }
        this.threadCollapseStateListeners.push(thread.onDidChangeCollapsibleState(() => {
          this.update(editor, commentInfos);
        }));
        if (thread.collapsibleState === 0 /* Collapsed */) {
          return;
        }
        commentThreadRangeDecorations.push(new CommentThreadRangeDecoration(range2, this.decorationOptions));
      });
    }
    editor.changeDecorations((changeAccessor) => {
      this.decorationIds = changeAccessor.deltaDecorations(this.decorationIds, commentThreadRangeDecorations);
      commentThreadRangeDecorations.forEach((decoration3, index2) => decoration3.id = this.decorationIds[index2]);
    });
  }
  dispose() {
    dispose(this.threadCollapseStateListeners);
    this.currentThreadCollapseStateListener?.dispose();
    super.dispose();
  }
};
export { CommentThreadRangeDecoration, CommentThreadRangeDecorator };
