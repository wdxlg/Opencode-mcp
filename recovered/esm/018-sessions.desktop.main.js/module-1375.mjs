// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/comments/browser/commentsView.ts
import { IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { CommentsModel, threadHasMeaningfulComments } from "./module-1320.mjs";
import { FilterViewPane } from "./module-1334.mjs";
import { Memento } from "./module-1042.mjs";
import { localize } from "./module-0001.mjs";
import { CommentsViewFilterFocusContextKey } from "./module-1335.mjs";
import { CommentsFilters } from "./module-1336.mjs";
import { COMMENTS_VIEW_TITLE, CommentsList, Filter } from "./module-1326.mjs";
import { FilterOptions } from "./module-1325.mjs";
import { CommentNode, ResourceWithCommentThreads } from "./module-1319.mjs";
import { registerNavigableContainer } from "./module-1368.mjs";
import { $, append, isActiveElement } from "./module-0075.mjs";
import { basename2 } from "./module-0034.mjs";
import { AccessibleViewAction } from "./module-1374.mjs";
import { isCodeEditor } from "./module-0223.mjs";
import { ResourceLabels } from "./module-1322.mjs";
import { revealCommentThread } from "./module-1373.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IViewDescriptorService } from "./module-1094.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IThemeService } from "./module-0287.mjs";
import { ICommentService } from "./module-1321.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IPathService } from "./module-0939.mjs";


// src/vs/workbench/contrib/comments/browser/commentsView.ts
var CONTEXT_KEY_HAS_COMMENTS = new RawContextKey("commentsView.hasComments", false);

var CONTEXT_KEY_SOME_COMMENTS_EXPANDED = new RawContextKey("commentsView.someCommentsExpanded", false);

var CONTEXT_KEY_COMMENT_FOCUSED = new RawContextKey("commentsView.commentFocused", false);

var VIEW_STORAGE_ID = "commentsViewState";

function createResourceCommentsIterator(model) {
  const result = [];
  for (const m of model.resourceCommentThreads) {
    const children = [];
    for (const r2 of m.commentThreads) {
      if (threadHasMeaningfulComments(r2.thread)) {
        children.push({ element: r2 });
      }
    }
    if (children.length > 0) {
      result.push({ element: m, children });
    }
  }
  return result;
}

var CommentsPanel = class extends FilterViewPane {
  constructor(options3, instantiationService, viewDescriptorService, editorService, configurationService, contextKeyService, contextMenuService, keybindingService, openerService, themeService, commentService, hoverService, uriIdentityService, storageService, pathService) {
    const stateMemento = new Memento(VIEW_STORAGE_ID, storageService);
    const viewState = stateMemento.getMemento(1 /* WORKSPACE */, 1 /* MACHINE */);
    super({
      ...options3,
      filterOptions: {
        placeholder: localize(14022, null),
        ariaLabel: localize(14021, null),
        history: viewState.filterHistory || [],
        text: viewState.filter || "",
        focusContextKey: CommentsViewFilterFocusContextKey.key
      }
    }, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService);
    this.editorService = editorService;
    this.commentService = commentService;
    this.uriIdentityService = uriIdentityService;
    this.pathService = pathService;
    this.totalComments = 0;
    this.currentHeight = 0;
    this.currentWidth = 0;
    this.cachedFilterStats = void 0;
    this.onDidChangeVisibility = this.onDidChangeBodyVisibility;
    this.hasCommentsContextKey = CONTEXT_KEY_HAS_COMMENTS.bindTo(contextKeyService);
    this.someCommentsExpandedContextKey = CONTEXT_KEY_SOME_COMMENTS_EXPANDED.bindTo(contextKeyService);
    this.commentsFocusedContextKey = CONTEXT_KEY_COMMENT_FOCUSED.bindTo(contextKeyService);
    this.stateMemento = stateMemento;
    this.viewState = viewState;
    this.filters = this._register(new CommentsFilters({
      showResolved: this.viewState.showResolved !== false,
      showUnresolved: this.viewState.showUnresolved !== false,
      sortBy: this.viewState.sortBy ?? "resourceAscending" /* ResourceAscending */
    }, this.contextKeyService));
    this.filter = new Filter(new FilterOptions(this.filterWidget.getFilterText(), this.filters.showResolved, this.filters.showUnresolved));
    this._register(this.filters.onDidChange((event) => {
      if (event.showResolved || event.showUnresolved) {
        this.updateFilter();
      }
      if (event.sortBy) {
        this.refresh();
      }
    }));
    this._register(this.filterWidget.onDidChangeFilterText(() => this.updateFilter()));
  }
  get focusedCommentNode() {
    const focused = this.tree?.getFocus();
    if (focused?.length === 1 && focused[0] instanceof CommentNode) {
      return focused[0];
    }
    return void 0;
  }
  get focusedCommentInfo() {
    if (!this.focusedCommentNode) {
      return;
    }
    return this.getScreenReaderInfoForNode(this.focusedCommentNode);
  }
  focusNextNode() {
    if (!this.tree) {
      return;
    }
    const focused = this.tree.getFocus()?.[0];
    if (!focused) {
      return;
    }
    let next = this.tree.navigate(focused).next();
    while (next && !(next instanceof CommentNode)) {
      next = this.tree.navigate(next).next();
    }
    if (!next) {
      return;
    }
    this.tree.setFocus([next]);
  }
  focusPreviousNode() {
    if (!this.tree) {
      return;
    }
    const focused = this.tree.getFocus()?.[0];
    if (!focused) {
      return;
    }
    let previous = this.tree.navigate(focused).previous();
    while (previous && !(previous instanceof CommentNode)) {
      previous = this.tree.navigate(previous).previous();
    }
    if (!previous) {
      return;
    }
    this.tree.setFocus([previous]);
  }
  saveState() {
    this.viewState.filter = this.filterWidget.getFilterText();
    this.viewState.filterHistory = this.filterWidget.getHistory();
    this.viewState.showResolved = this.filters.showResolved;
    this.viewState.showUnresolved = this.filters.showUnresolved;
    this.viewState.sortBy = this.filters.sortBy;
    this.stateMemento.saveMemento();
    super.saveState();
  }
  render() {
    super.render();
    this._register(registerNavigableContainer({
      name: "commentsView",
      focusNotifiers: [this, this.filterWidget],
      focusNextWidget: () => {
        if (this.filterWidget.hasFocus()) {
          this.focus();
        }
      },
      focusPreviousWidget: () => {
        if (!this.filterWidget.hasFocus()) {
          this.focusFilter();
        }
      }
    }));
  }
  focusFilter() {
    this.filterWidget.focus();
  }
  clearFilterText() {
    this.filterWidget.setFilterText("");
  }
  getFilterStats() {
    if (!this.cachedFilterStats) {
      this.cachedFilterStats = {
        total: this.totalComments,
        filtered: this.tree?.getVisibleItemCount() ?? 0
      };
    }
    return this.cachedFilterStats;
  }
  updateFilter() {
    this.filter.options = new FilterOptions(this.filterWidget.getFilterText(), this.filters.showResolved, this.filters.showUnresolved);
    this.tree?.filterComments();
    this.cachedFilterStats = void 0;
    const { total, filtered } = this.getFilterStats();
    this.filterWidget.updateBadge(total === filtered || total === 0 ? void 0 : localize(14032, null, filtered, total));
    this.filterWidget.checkMoreFilters(!this.filters.showResolved || !this.filters.showUnresolved);
  }
  renderBody(container2) {
    super.renderBody(container2);
    container2.classList.add("comments-panel");
    const domContainer = append(container2, $(".comments-panel-container"));
    this.treeContainer = append(domContainer, $(".tree-container"));
    this.treeContainer.classList.add("file-icon-themable-tree", "show-file-icons");
    this.cachedFilterStats = void 0;
    this.createTree();
    this.createMessageBox(domContainer);
    this._register(this.commentService.onDidSetAllCommentThreads(this.onAllCommentsChanged, this));
    this._register(this.commentService.onDidUpdateCommentThreads(this.onCommentsUpdated, this));
    this._register(this.commentService.onDidDeleteDataProvider(this.onDataProviderDeleted, this));
    this._register(this.onDidChangeBodyVisibility((visible) => {
      if (visible) {
        this.refresh();
      }
    }));
    this.renderComments();
  }
  focus() {
    super.focus();
    const element = this.tree?.getHTMLElement();
    if (element && isActiveElement(element)) {
      return;
    }
    if (!this.commentService.commentsModel.hasCommentThreads() && this.messageBoxContainer) {
      this.messageBoxContainer.focus();
    } else if (this.tree) {
      this.tree.domFocus();
    }
  }
  renderComments() {
    this.treeContainer.classList.toggle("hidden", !this.commentService.commentsModel.hasCommentThreads());
    this.renderMessage();
    this.tree?.setChildren(null, createResourceCommentsIterator(this.commentService.commentsModel));
  }
  collapseAll() {
    if (this.tree) {
      this.tree.collapseAll();
      this.tree.setSelection([]);
      this.tree.setFocus([]);
      this.tree.domFocus();
      this.tree.focusFirst();
    }
  }
  expandAll() {
    if (this.tree) {
      this.tree.expandAll();
      this.tree.setSelection([]);
      this.tree.setFocus([]);
      this.tree.domFocus();
      this.tree.focusFirst();
    }
  }
  get hasRendered() {
    return !!this.tree;
  }
  layoutBodyContent(height = this.currentHeight, width2 = this.currentWidth) {
    if (this.messageBoxContainer) {
      this.messageBoxContainer.style.height = `${height}px`;
    }
    this.tree?.layout(height, width2);
    this.currentHeight = height;
    this.currentWidth = width2;
  }
  createMessageBox(parent) {
    this.messageBoxContainer = append(parent, $(".message-box-container"));
    this.messageBoxContainer.setAttribute("tabIndex", "0");
  }
  renderMessage() {
    this.messageBoxContainer.textContent = this.commentService.commentsModel.getMessage();
    this.messageBoxContainer.classList.toggle("hidden", this.commentService.commentsModel.hasCommentThreads());
  }
  makeCommentLocationLabel(file, range2) {
    const fileLabel = basename2(file);
    if (!range2) {
      return localize(14023, null, fileLabel);
    }
    if (range2.startLineNumber === range2.endLineNumber) {
      return localize(14025, null, range2.startLineNumber, range2.startColumn, fileLabel);
    } else {
      return localize(14024, null, range2.startLineNumber, range2.endLineNumber, fileLabel);
    }
  }
  makeScreenReaderLabelInfo(element, forAriaLabel) {
    const userName = element.comment.userName;
    const locationLabel = this.makeCommentLocationLabel(element.resource, element.range);
    const replyCountLabel = this.getReplyCountAsString(element, forAriaLabel);
    const bodyLabel = typeof element.comment.body === "string" ? element.comment.body : element.comment.body.value;
    return { userName, locationLabel, replyCountLabel, bodyLabel };
  }
  getScreenReaderInfoForNode(element, forAriaLabel) {
    let accessibleViewHint = "";
    if (forAriaLabel && this.configurationService.getValue("accessibility.verbosity.comments" /* Comments */)) {
      const kbLabel = this.keybindingService.lookupKeybinding(AccessibleViewAction.id)?.getAriaLabel();
      accessibleViewHint = kbLabel ? localize(14019, null, kbLabel) : localize(14020, null);
    }
    const replies = this.getRepliesAsString(element, forAriaLabel);
    const editor = this.editorService.findEditors(element.resource);
    const codeEditor = this.editorService.activeEditorPane?.getControl();
    let relevantLines;
    if (element.range && editor?.length && isCodeEditor(codeEditor)) {
      relevantLines = codeEditor.getModel()?.getValueInRange(element.range);
      if (relevantLines) {
        relevantLines = "\nCorresponding code: \n" + relevantLines;
      }
    }
    if (!relevantLines) {
      relevantLines = "";
    }
    const labelInfo = this.makeScreenReaderLabelInfo(element, forAriaLabel);
    if (element.threadRelevance === 1 /* Outdated */) {
      return localize(
        14028,
        null,
        labelInfo.userName,
        labelInfo.bodyLabel,
        labelInfo.locationLabel,
        labelInfo.replyCountLabel,
        relevantLines
      ) + replies + accessibleViewHint;
    } else {
      return localize(
        14027,
        null,
        labelInfo.userName,
        labelInfo.bodyLabel,
        labelInfo.locationLabel,
        labelInfo.replyCountLabel,
        relevantLines
      ) + replies + accessibleViewHint;
    }
  }
  getRepliesAsString(node, forAriaLabel) {
    if (!node.replies.length || forAriaLabel) {
      return "";
    }
    return "\n" + node.replies.map(
      (reply) => localize(
        14030,
        null,
        reply.comment.userName,
        typeof reply.comment.body === "string" ? reply.comment.body : reply.comment.body.value
      )
    ).join("\n");
  }
  getReplyCountAsString(node, forAriaLabel) {
    return node.replies.length && !forAriaLabel ? localize(14026, null, node.replies.length) : "";
  }
  createTree() {
    this.treeLabels = this._register(this.instantiationService.createInstance(ResourceLabels, this));
    this.tree = this._register(this.instantiationService.createInstance(CommentsList, this.treeLabels, this.treeContainer, {
      overrideStyles: this.getLocationBasedColors().listOverrideStyles,
      selectionNavigation: true,
      filter: this.filter,
      sorter: {
        compare: (a, b) => {
          if (a instanceof CommentsModel || b instanceof CommentsModel) {
            return 0;
          }
          if (this.filters.sortBy === "updatedAtDescending" /* UpdatedAtDescending */) {
            return a.lastUpdatedAt > b.lastUpdatedAt ? -1 : 1;
          } else if (this.filters.sortBy === "resourceAscending" /* ResourceAscending */) {
            if (a instanceof ResourceWithCommentThreads && b instanceof ResourceWithCommentThreads) {
              const workspaceScheme = this.pathService.defaultUriScheme;
              if (a.resource.scheme !== b.resource.scheme && (a.resource.scheme === workspaceScheme || b.resource.scheme === workspaceScheme)) {
                return b.resource.scheme === workspaceScheme ? 1 : -1;
              }
              return a.resource.toString() > b.resource.toString() ? 1 : -1;
            } else if (a instanceof CommentNode && b instanceof CommentNode && a.thread.range && b.thread.range) {
              return a.thread.range?.startLineNumber > b.thread.range?.startLineNumber ? 1 : -1;
            }
          }
          return 0;
        }
      },
      keyboardNavigationLabelProvider: {
        getKeyboardNavigationLabel: (item) => {
          return void 0;
        }
      },
      accessibilityProvider: {
        getAriaLabel: (element) => {
          if (element instanceof CommentsModel) {
            return localize(14031, null);
          }
          if (element instanceof ResourceWithCommentThreads) {
            return localize(14029, null, basename2(element.resource), element.resource.fsPath);
          }
          if (element instanceof CommentNode) {
            return this.getScreenReaderInfoForNode(element, true);
          }
          return "";
        },
        getWidgetAriaLabel() {
          return COMMENTS_VIEW_TITLE.value;
        }
      }
    }));
    this._register(this.tree.onDidOpen((e4) => {
      this.openFile(e4.element, e4.editorOptions.pinned, e4.editorOptions.preserveFocus, e4.sideBySide);
    }));
    this._register(this.tree.onDidChangeModel(() => {
      this.updateSomeCommentsExpanded();
    }));
    this._register(this.tree.onDidChangeCollapseState(() => {
      this.updateSomeCommentsExpanded();
    }));
    this._register(this.tree.onDidFocus(() => this.commentsFocusedContextKey.set(true)));
    this._register(this.tree.onDidBlur(() => this.commentsFocusedContextKey.set(false)));
  }
  openFile(element, pinned, preserveFocus, sideBySide) {
    if (!element) {
      return;
    }
    if (!(element instanceof ResourceWithCommentThreads || element instanceof CommentNode)) {
      return;
    }
    const threadToReveal = element instanceof ResourceWithCommentThreads ? element.commentThreads[0].thread : element.thread;
    const commentToReveal = element instanceof ResourceWithCommentThreads ? element.commentThreads[0].comment : void 0;
    return revealCommentThread(this.commentService, this.editorService, this.uriIdentityService, threadToReveal, commentToReveal, false, pinned, preserveFocus, sideBySide);
  }
  async refresh() {
    if (!this.tree) {
      return;
    }
    if (this.isVisible()) {
      this.hasCommentsContextKey.set(this.commentService.commentsModel.hasCommentThreads());
      this.cachedFilterStats = void 0;
      this.renderComments();
      if (this.tree.getSelection().length === 0 && this.commentService.commentsModel.hasCommentThreads()) {
        const firstComment = this.commentService.commentsModel.resourceCommentThreads[0].commentThreads[0];
        if (firstComment && this.tree.hasElement(firstComment)) {
          this.tree.setFocus([firstComment]);
          this.tree.setSelection([firstComment]);
        }
      }
    }
  }
  onAllCommentsChanged(e4) {
    this.cachedFilterStats = void 0;
    this.totalComments += e4.commentThreads.length;
    let unresolved = 0;
    for (const thread of e4.commentThreads) {
      if (thread.state === 0 /* Unresolved */) {
        unresolved++;
      }
    }
    this.refresh();
  }
  onCommentsUpdated(e4) {
    this.cachedFilterStats = void 0;
    this.totalComments += e4.added.length;
    this.totalComments -= e4.removed.length;
    let unresolved = 0;
    for (const resource of this.commentService.commentsModel.resourceCommentThreads) {
      for (const thread of resource.commentThreads) {
        if (thread.threadState === 0 /* Unresolved */) {
          unresolved++;
        }
      }
    }
    this.refresh();
  }
  onDataProviderDeleted(owner) {
    this.cachedFilterStats = void 0;
    this.totalComments = 0;
    this.refresh();
  }
  updateSomeCommentsExpanded() {
    this.someCommentsExpandedContextKey.set(this.isSomeCommentsExpanded());
  }
  areAllCommentsExpanded() {
    if (!this.tree) {
      return false;
    }
    const navigator2 = this.tree.navigate();
    while (navigator2.next()) {
      if (this.tree.isCollapsed(navigator2.current())) {
        return false;
      }
    }
    return true;
  }
  isSomeCommentsExpanded() {
    if (!this.tree) {
      return false;
    }
    const navigator2 = this.tree.navigate();
    while (navigator2.next()) {
      if (!this.tree.isCollapsed(navigator2.current())) {
        return true;
      }
    }
    return false;
  }
};

CommentsPanel = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IViewDescriptorService),
  __decorateParam(3, IEditorService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IContextKeyService),
  __decorateParam(6, IContextMenuService),
  __decorateParam(7, IKeybindingService),
  __decorateParam(8, IOpenerService),
  __decorateParam(9, IThemeService),
  __decorateParam(10, ICommentService),
  __decorateParam(11, IHoverService),
  __decorateParam(12, IUriIdentityService),
  __decorateParam(13, IStorageService),
  __decorateParam(14, IPathService)
], CommentsPanel);
export { createResourceCommentsIterator, CONTEXT_KEY_HAS_COMMENTS, CONTEXT_KEY_SOME_COMMENTS_EXPANDED, CONTEXT_KEY_COMMENT_FOCUSED, VIEW_STORAGE_ID, CommentsPanel };
