// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/comments/browser/commentThreadHeader.ts
import { registerIcon } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Disposable, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { $, EventType, addDisposableListener, append, getWindow } from "./module-0075.mjs";
import { ActionBar } from "./module-0477.mjs";
import { createActionViewItem } from "./module-0516.mjs";
import { Action, ActionRunner } from "./module-0082.mjs";
import { escape } from "./module-0030.mjs";
import { StandardMouseEvent } from "./module-0024.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IContextMenuService } from "./module-0488.mjs";


// src/vs/workbench/contrib/comments/browser/commentThreadHeader.ts
var collapseIcon = registerIcon("review-comment-collapse", Codicon.chevronUp, localize(14049, null));

var COLLAPSE_ACTION_CLASS = "expand-review-action " + ThemeIcon.asClassName(collapseIcon);

var DELETE_ACTION_CLASS = "expand-review-action " + ThemeIcon.asClassName(Codicon.trashcan);

function threadHasComments(comments) {
  return !!comments && comments.length > 0;
}

var CommentThreadHeader = class extends Disposable {
  constructor(container3, _delegate2, _commentMenus, _commentThread, _contextKeyService, _instantiationService, _contextMenuService) {
    super();
    this._delegate = _delegate2;
    this._commentMenus = _commentMenus;
    this._commentThread = _commentThread;
    this._contextKeyService = _contextKeyService;
    this._instantiationService = _instantiationService;
    this._contextMenuService = _contextMenuService;
    this._headElement = $(".head");
    container3.appendChild(this._headElement);
    this._register(toDisposable(() => this._headElement.remove()));
    this._fillHead();
  }
  _fillHead() {
    const titleElement = append(this._headElement, $(".review-title"));
    this._headingLabel = append(titleElement, $("span.filename"));
    this.createThreadLabel();
    const actionsContainer = append(this._headElement, $(".review-actions"));
    this._actionbarWidget = new ActionBar(actionsContainer, {
      actionViewItemProvider: createActionViewItem.bind(void 0, this._instantiationService)
    });
    this._register(this._actionbarWidget);
    const collapseClass = threadHasComments(this._commentThread.comments) ? COLLAPSE_ACTION_CLASS : DELETE_ACTION_CLASS;
    this._collapseAction = new Action("workbench.action.hideComment" /* Hide */, localize(14050, null), collapseClass, true, () => this._delegate.collapse());
    if (!threadHasComments(this._commentThread.comments)) {
      const commentsChanged = this._register(new MutableDisposable());
      commentsChanged.value = this._commentThread.onDidChangeComments(() => {
        if (threadHasComments(this._commentThread.comments)) {
          this._collapseAction.class = COLLAPSE_ACTION_CLASS;
          commentsChanged.clear();
        }
      });
    }
    const menu = this._commentMenus.getCommentThreadTitleActions(this._contextKeyService);
    this._register(menu);
    this.setActionBarActions(menu);
    this._register(menu);
    this._register(menu.onDidChange((e) => {
      this.setActionBarActions(menu);
    }));
    this._register(addDisposableListener(this._headElement, EventType.CONTEXT_MENU, (e) => {
      return this.onContextMenu(e);
    }));
    this._actionbarWidget.context = this._commentThread;
  }
  setActionBarActions(menu) {
    const groups = menu.getActions({ shouldForwardArgs: true }).reduce((r2, [, actions]) => [...r2, ...actions], []);
    this._actionbarWidget.clear();
    this._actionbarWidget.push([...groups, this._collapseAction], { label: false, icon: true });
  }
  updateCommentThread(commentThread) {
    this._commentThread = commentThread;
    this._actionbarWidget.context = this._commentThread;
    this.createThreadLabel();
  }
  createThreadLabel() {
    let label3;
    label3 = this._commentThread.label;
    if (label3 === void 0) {
      if (!(this._commentThread.comments && this._commentThread.comments.length)) {
        label3 = localize(14051, null);
      }
    }
    if (label3) {
      this._headingLabel.textContent = escape(label3);
      this._headingLabel.setAttribute("aria-label", label3);
    }
  }
  updateHeight(headHeight) {
    this._headElement.style.height = `${headHeight}px`;
    this._headElement.style.lineHeight = this._headElement.style.height;
  }
  onContextMenu(e) {
    const actions = this._commentMenus.getCommentThreadTitleContextActions(this._contextKeyService);
    if (!actions.length) {
      return;
    }
    const event = new StandardMouseEvent(getWindow(this._headElement), e);
    if (!this._contextMenuActionRunner) {
      this._contextMenuActionRunner = this._register(new ActionRunner());
    }
    this._contextMenuService.showContextMenu({
      getAnchor: () => event,
      getActions: () => actions,
      actionRunner: this._contextMenuActionRunner,
      getActionsContext: () => {
        return {
          commentControlHandle: this._commentThread.controllerHandle,
          commentThreadHandle: this._commentThread.commentThreadHandle,
          $mid: 7 /* CommentThread */
        };
      }
    });
  }
};

CommentThreadHeader = __decorateClass([
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, IContextMenuService)
], CommentThreadHeader);
export { threadHasComments, collapseIcon, COLLAPSE_ACTION_CLASS, DELETE_ACTION_CLASS, CommentThreadHeader };
