// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/comments/browser/commentsTreeViewer.ts
import { localize, localize2 } from "./module-0001.mjs";
import { CommentNode, ResourceWithCommentThreads } from "./module-1320.mjs";
import { $, append } from "./module-0075.mjs";
import { IMenuService, MenuId } from "./module-0092.mjs";
import { createActionViewItem, getContextMenuActions } from "./module-0516.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { TimestampWidget } from "./module-1324.mjs";
import { ActionBar } from "./module-0477.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { renderMarkdown } from "./module-0468.mjs";
import { commentViewThreadStateColorVar, getCommentThreadStateIconColor } from "./module-1325.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IThemeService } from "./module-0287.mjs";
import { FilterOptions } from "./module-1326.mjs";
import { basename2 } from "./module-0034.mjs";
import { IListService, WorkbenchObjectTree } from "./module-0636.mjs";
import { CommentsModel } from "./module-1321.mjs";
import { ActionViewItem } from "./module-0476.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IKeybindingService } from "./module-0352.mjs";


// src/vs/workbench/contrib/comments/browser/commentsTreeViewer.ts
var COMMENTS_VIEW_ID = "workbench.panel.comments";

var COMMENTS_VIEW_STORAGE_ID = "Comments";

var COMMENTS_VIEW_TITLE = localize2(14012, "Comments");

var CommentsModelVirtualDelegate = class _CommentsModelVirtualDelegate {
  static {
    this.RESOURCE_ID = "resource-with-comments";
  }
  static {
    this.COMMENT_ID = "comment-node";
  }
  getHeight(element) {
    if (element instanceof CommentNode && element.hasReply()) {
      return 44;
    }
    return 22;
  }
  getTemplateId(element) {
    if (element instanceof ResourceWithCommentThreads) {
      return _CommentsModelVirtualDelegate.RESOURCE_ID;
    }
    if (element instanceof CommentNode) {
      return _CommentsModelVirtualDelegate.COMMENT_ID;
    }
    return "";
  }
};

var ResourceWithCommentsRenderer = class {
  constructor(labels2) {
    this.labels = labels2;
    this.templateId = "resource-with-comments";
  }
  renderTemplate(container3) {
    const labelContainer = append(container3, $(".resource-container"));
    const resourceLabel = this.labels.create(labelContainer);
    const separator2 = append(labelContainer, $(".separator"));
    const owner = labelContainer.appendChild($(".owner"));
    return { resourceLabel, owner, separator: separator2 };
  }
  renderElement(node, index2, templateData) {
    templateData.resourceLabel.setFile(node.element.resource);
    templateData.separator.innerText = "\xB7";
    if (node.element.ownerLabel) {
      templateData.owner.innerText = node.element.ownerLabel;
      templateData.separator.style.display = "inline";
    } else {
      templateData.owner.innerText = "";
      templateData.separator.style.display = "none";
    }
  }
  disposeTemplate(templateData) {
    templateData.resourceLabel.dispose();
  }
};

var CommentsMenus = class {
  constructor(menuService) {
    this.menuService = menuService;
  }
  getResourceActions(element) {
    const actions = this.getActions(MenuId.CommentsViewThreadActions, element);
    return { actions: actions.primary };
  }
  getResourceContextActions(element) {
    return this.getActions(MenuId.CommentsViewThreadActions, element).secondary;
  }
  setContextKeyService(service) {
    this.contextKeyService = service;
  }
  getActions(menuId, element) {
    if (!this.contextKeyService) {
      return { primary: [], secondary: [] };
    }
    const overlay = [
      ["commentController", element.owner],
      ["resourceScheme", element.resource.scheme],
      ["commentThread", element.contextValue],
      ["canReply", element.thread.canReply]
    ];
    const contextKeyService = this.contextKeyService.createOverlay(overlay);
    const menu = this.menuService.getMenuActions(menuId, contextKeyService, { shouldForwardArgs: true });
    return getContextMenuActions(menu, "inline");
  }
  dispose() {
    this.contextKeyService = void 0;
  }
};

CommentsMenus = __decorateClass([
  __decorateParam(0, IMenuService)
], CommentsMenus);

var CommentNodeRenderer = class {
  constructor(actionViewItemProvider, menus, configurationService, hoverService, themeService) {
    this.actionViewItemProvider = actionViewItemProvider;
    this.menus = menus;
    this.configurationService = configurationService;
    this.hoverService = hoverService;
    this.themeService = themeService;
    this.templateId = "comment-node";
  }
  renderTemplate(container3) {
    const threadContainer = append(container3, $(".comment-thread-container"));
    const metadataContainer = append(threadContainer, $(".comment-metadata-container"));
    const metadata = append(metadataContainer, $(".comment-metadata"));
    const icon2 = append(metadata, $(".icon"));
    const userNames = append(metadata, $(".user"));
    const timestamp = new TimestampWidget(this.configurationService, this.hoverService, append(metadata, $(".timestamp-container")));
    const relevance = append(metadata, $(".relevance"));
    const separator2 = append(metadata, $(".separator"));
    const commentPreview = append(metadata, $(".text"));
    const rangeContainer = append(metadata, $(".range"));
    const range2 = $("p");
    rangeContainer.appendChild(range2);
    const threadMetadata = {
      icon: icon2,
      userNames,
      timestamp,
      relevance,
      separator: separator2,
      commentPreview,
      range: range2
    };
    threadMetadata.separator.innerText = "\xB7";
    const actionsContainer = append(metadataContainer, $(".actions"));
    const actionBar3 = new ActionBar(actionsContainer, {
      actionViewItemProvider: this.actionViewItemProvider
    });
    const snippetContainer = append(threadContainer, $(".comment-snippet-container"));
    const repliesMetadata = {
      container: snippetContainer,
      icon: append(snippetContainer, $(".icon")),
      count: append(snippetContainer, $(".count")),
      lastReplyDetail: append(snippetContainer, $(".reply-detail")),
      separator: append(snippetContainer, $(".separator")),
      timestamp: new TimestampWidget(this.configurationService, this.hoverService, append(snippetContainer, $(".timestamp-container")))
    };
    repliesMetadata.separator.innerText = "\xB7";
    repliesMetadata.icon.classList.add(...ThemeIcon.asClassNameArray(Codicon.indent));
    const disposables = [threadMetadata.timestamp, repliesMetadata.timestamp];
    return { threadMetadata, repliesMetadata, actionBar: actionBar3, disposables, elementDisposables: new DisposableStore() };
  }
  getCountString(commentCount) {
    if (commentCount > 2) {
      return localize(14013, null, commentCount - 1);
    } else if (commentCount === 2) {
      return localize(14014, null);
    } else {
      return localize(14009, null);
    }
  }
  getRenderedComment(commentBody) {
    const renderedComment = renderMarkdown(commentBody, {}, document.createElement("span"));
    const images = renderedComment.element.getElementsByTagName("img");
    for (let i2 = 0; i2 < images.length; i2++) {
      const image = images[i2];
      const textDescription = $("");
      textDescription.textContent = image.alt ? localize(14016, null, image.alt) : localize(14015, null);
      image.replaceWith(textDescription);
    }
    const headings = [...renderedComment.element.getElementsByTagName("h1"), ...renderedComment.element.getElementsByTagName("h2"), ...renderedComment.element.getElementsByTagName("h3"), ...renderedComment.element.getElementsByTagName("h4"), ...renderedComment.element.getElementsByTagName("h5"), ...renderedComment.element.getElementsByTagName("h6")];
    for (const heading2 of headings) {
      const textNode = document.createTextNode(heading2.textContent || "");
      heading2.replaceWith(textNode);
    }
    while (renderedComment.element.children.length > 1 && renderedComment.element.firstElementChild?.tagName === "HR") {
      renderedComment.element.removeChild(renderedComment.element.firstElementChild);
    }
    return renderedComment;
  }
  getIcon(threadState, hasDraft) {
    if (hasDraft) {
      return Codicon.commentDraft;
    } else if (threadState === 0 /* Unresolved */) {
      return Codicon.commentUnresolved;
    } else {
      return Codicon.comment;
    }
  }
  renderElement(node, index2, templateData) {
    templateData.actionBar.clear();
    const commentCount = node.element.replies.length + 1;
    if (node.element.threadRelevance === 1 /* Outdated */) {
      templateData.threadMetadata.relevance.style.display = "";
      templateData.threadMetadata.relevance.innerText = localize(14018, null);
      templateData.threadMetadata.separator.style.display = "none";
    } else {
      templateData.threadMetadata.relevance.innerText = "";
      templateData.threadMetadata.relevance.style.display = "none";
      templateData.threadMetadata.separator.style.display = "";
    }
    templateData.threadMetadata.icon.classList.remove(...Array.from(templateData.threadMetadata.icon.classList.values()).filter((value2) => value2.startsWith("codicon")));
    const hasDraft = node.element.thread.comments?.some((comment) => comment.state === 1 /* Draft */);
    templateData.threadMetadata.icon.classList.add(...ThemeIcon.asClassNameArray(this.getIcon(node.element.threadState, hasDraft)));
    if (node.element.threadState !== void 0) {
      const color2 = this.getCommentThreadWidgetStateColor(node.element.threadState, this.themeService.getColorTheme());
      templateData.threadMetadata.icon.style.setProperty(commentViewThreadStateColorVar, `${color2}`);
      templateData.threadMetadata.icon.style.color = `var(${commentViewThreadStateColorVar})`;
    }
    templateData.threadMetadata.userNames.textContent = node.element.comment.userName;
    templateData.threadMetadata.timestamp.setTimestamp(node.element.comment.timestamp ? new Date(node.element.comment.timestamp) : void 0);
    const originalComment = node.element;
    templateData.threadMetadata.commentPreview.innerText = "";
    templateData.threadMetadata.commentPreview.style.height = "22px";
    if (typeof originalComment.comment.body === "string") {
      templateData.threadMetadata.commentPreview.innerText = originalComment.comment.body;
    } else {
      const renderedComment = this.getRenderedComment(originalComment.comment.body);
      templateData.elementDisposables.add(renderedComment);
      for (let i2 = renderedComment.element.children.length - 1; i2 >= 1; i2--) {
        renderedComment.element.removeChild(renderedComment.element.children[i2]);
      }
      templateData.threadMetadata.commentPreview.appendChild(renderedComment.element);
      templateData.elementDisposables.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), templateData.threadMetadata.commentPreview, renderedComment.element.textContent ?? ""));
    }
    if (node.element.range) {
      if (node.element.range.startLineNumber === node.element.range.endLineNumber) {
        templateData.threadMetadata.range.textContent = localize(14010, null, node.element.range.startLineNumber);
      } else {
        templateData.threadMetadata.range.textContent = localize(14011, null, node.element.range.startLineNumber, node.element.range.endLineNumber);
      }
    }
    const menuActions = this.menus.getResourceActions(node.element);
    templateData.actionBar.push(menuActions.actions, { icon: true, label: false });
    templateData.actionBar.context = {
      commentControlHandle: node.element.controllerHandle,
      commentThreadHandle: node.element.threadHandle,
      $mid: 7 /* CommentThread */
    };
    if (!node.element.hasReply()) {
      templateData.repliesMetadata.container.style.display = "none";
      return;
    }
    templateData.repliesMetadata.container.style.display = "";
    templateData.repliesMetadata.count.textContent = this.getCountString(commentCount);
    const lastComment = node.element.replies[node.element.replies.length - 1].comment;
    templateData.repliesMetadata.lastReplyDetail.textContent = localize(14017, null, lastComment.userName);
    templateData.repliesMetadata.timestamp.setTimestamp(lastComment.timestamp ? new Date(lastComment.timestamp) : void 0);
  }
  getCommentThreadWidgetStateColor(state, theme) {
    return state !== void 0 ? getCommentThreadStateIconColor(state, theme) : void 0;
  }
  disposeElement(_node, _index, templateData) {
    templateData.elementDisposables.clear();
  }
  disposeTemplate(templateData) {
    templateData.disposables.forEach((disposeable) => disposeable.dispose());
    templateData.elementDisposables.dispose();
    templateData.actionBar.dispose();
  }
};

CommentNodeRenderer = __decorateClass([
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IHoverService),
  __decorateParam(4, IThemeService)
], CommentNodeRenderer);

var Filter = class {
  constructor(options3) {
    this.options = options3;
  }
  filter(element, parentVisibility) {
    if (this.options.filter === "" && this.options.showResolved && this.options.showUnresolved) {
      return 1 /* Visible */;
    }
    if (element instanceof ResourceWithCommentThreads) {
      return this.filterResourceMarkers(element);
    } else {
      return this.filterCommentNode(element, parentVisibility);
    }
  }
  filterResourceMarkers(resourceMarkers) {
    if (this.options.textFilter.text && !this.options.textFilter.negate) {
      const uriMatches = FilterOptions._filter(this.options.textFilter.text, basename2(resourceMarkers.resource));
      if (uriMatches) {
        return { visibility: true, data: { type: 0 /* Resource */, uriMatches: uriMatches || [] } };
      }
    }
    return 2 /* Recurse */;
  }
  filterCommentNode(comment, parentVisibility) {
    const matchesResolvedState = comment.threadState === void 0 || this.options.showResolved && 1 /* Resolved */ === comment.threadState || this.options.showUnresolved && 0 /* Unresolved */ === comment.threadState;
    if (!matchesResolvedState) {
      return false;
    }
    if (!this.options.textFilter.text) {
      return true;
    }
    const textMatches = (
      // Check body of comment for value
      FilterOptions._messageFilter(this.options.textFilter.text, typeof comment.comment.body === "string" ? comment.comment.body : comment.comment.body.value) || FilterOptions._messageFilter(this.options.textFilter.text, comment.comment.userName) || comment.replies.map((reply) => {
        return FilterOptions._messageFilter(this.options.textFilter.text, reply.comment.userName) || FilterOptions._messageFilter(this.options.textFilter.text, typeof reply.comment.body === "string" ? reply.comment.body : reply.comment.body.value);
      }).filter((value2) => !!value2).flat()
    );
    if (textMatches.length && !this.options.textFilter.negate) {
      return { visibility: true, data: { type: 1 /* Comment */, textMatches } };
    }
    if (textMatches.length && this.options.textFilter.negate && parentVisibility === 2 /* Recurse */) {
      return false;
    }
    if (textMatches.length === 0 && this.options.textFilter.negate && parentVisibility === 2 /* Recurse */) {
      return true;
    }
    return parentVisibility;
  }
};

var CommentsList = class extends WorkbenchObjectTree {
  constructor(labels2, container3, options3, contextKeyService, listService, instantiationService, configurationService, contextMenuService, keybindingService) {
    const delegate = new CommentsModelVirtualDelegate();
    const actionViewItemProvider = createActionViewItem.bind(void 0, instantiationService);
    const menus = instantiationService.createInstance(CommentsMenus);
    menus.setContextKeyService(contextKeyService);
    const renderers = [
      instantiationService.createInstance(ResourceWithCommentsRenderer, labels2),
      instantiationService.createInstance(CommentNodeRenderer, actionViewItemProvider, menus)
    ];
    super(
      "CommentsTree",
      container3,
      delegate,
      renderers,
      {
        accessibilityProvider: options3.accessibilityProvider,
        identityProvider: {
          getId: (element) => {
            if (element instanceof CommentsModel) {
              return "root";
            }
            if (element instanceof ResourceWithCommentThreads) {
              return `${element.uniqueOwner}-${element.id}`;
            }
            if (element instanceof CommentNode) {
              return `${element.uniqueOwner}-${element.resource.toString()}-${element.threadId}-${element.comment.uniqueIdInThread}` + (element.isRoot ? "-root" : "");
            }
            return "";
          }
        },
        expandOnlyOnTwistieClick: true,
        collapseByDefault: false,
        overrideStyles: options3.overrideStyles,
        filter: options3.filter,
        sorter: options3.sorter,
        findWidgetEnabled: false,
        multipleSelectionSupport: false
      },
      instantiationService,
      contextKeyService,
      listService,
      configurationService
    );
    this.contextMenuService = contextMenuService;
    this.keybindingService = keybindingService;
    this.menus = menus;
    this.disposables.add(this.onContextMenu((e) => this.commentsOnContextMenu(e)));
  }
  commentsOnContextMenu(treeEvent) {
    const node = treeEvent.element;
    if (!(node instanceof CommentNode)) {
      return;
    }
    const event = treeEvent.browserEvent;
    event.preventDefault();
    event.stopPropagation();
    this.setFocus([node]);
    const actions = this.menus.getResourceContextActions(node);
    if (!actions.length) {
      return;
    }
    this.contextMenuService.showContextMenu({
      getAnchor: () => treeEvent.anchor,
      getActions: () => actions,
      getActionViewItem: (action) => {
        const keybinding = this.keybindingService.lookupKeybinding(action.id);
        if (keybinding) {
          return new ActionViewItem(action, action, { label: true, keybinding: keybinding.getLabel() });
        }
        return void 0;
      },
      onHide: (wasCancelled) => {
        if (wasCancelled) {
          this.domFocus();
        }
      },
      getActionsContext: () => ({
        commentControlHandle: node.controllerHandle,
        commentThreadHandle: node.threadHandle,
        $mid: 7 /* CommentThread */,
        thread: node.thread
      })
    });
  }
  filterComments() {
    this.refilter();
  }
  getVisibleItemCount() {
    let filtered = 0;
    const root = this.getNode();
    for (const resourceNode of root.children) {
      for (const commentNode of resourceNode.children) {
        if (commentNode.visible && resourceNode.visible) {
          filtered++;
        }
      }
    }
    return filtered;
  }
};

CommentsList = __decorateClass([
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IListService),
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, IConfigurationService),
  __decorateParam(7, IContextMenuService),
  __decorateParam(8, IKeybindingService)
], CommentsList);
export { COMMENTS_VIEW_ID, COMMENTS_VIEW_STORAGE_ID, COMMENTS_VIEW_TITLE, CommentsModelVirtualDelegate, ResourceWithCommentsRenderer, CommentsMenus, CommentNodeRenderer, Filter, CommentsList };
