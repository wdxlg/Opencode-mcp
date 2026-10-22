// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/comments/browser/commentNode.ts
import { Action, ActionRunner, Separator } from "./module-0082.mjs";
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { TimeoutTimer } from "./module-0036.mjs";
import { MIN_EDITOR_HEIGHT, SimpleCommentEditor, calculateEditorHeight } from "./module-1361.mjs";
import { Emitter } from "./module-0017.mjs";
import { $, EventType, addDisposableListener, append, getContentHeight, getContentWidth, getWindow, scheduleAtNextAnimationFrame } from "./module-0075.mjs";
import { CommentContextKeys } from "./module-1318.mjs";
import { MOUSE_CURSOR_TEXT_CSS_CLASS_NAME } from "./module-0299.mjs";
import { COMMENTS_SECTION } from "./module-1317.mjs";
import { Scrollable } from "./module-0099.mjs";
import { SmoothScrollableElement } from "./module-0259.mjs";
import { DomEmitter } from "./module-0262.mjs";
import { FileAccess, Schemas } from "./module-0033.mjs";
import { URI } from "./module-0032.mjs";
import { TimestampWidget } from "./module-1323.mjs";
import { ToolBar } from "./module-0503.mjs";
import { ReactionAction, ReactionActionViewItem, ToggleReactionsAction } from "./module-1363.mjs";
import { DropdownMenuActionViewItem } from "./module-0502.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { MenuId, MenuItemAction, SubmenuItemAction } from "./module-0092.mjs";
import { MenuEntryActionViewItem, SubmenuEntryActionViewItem } from "./module-0516.mjs";
import { ActionViewItem } from "./module-0476.mjs";
import { localize } from "./module-0001.mjs";
import { ActionBar } from "./module-0477.mjs";
import { Position } from "./module-0079.mjs";
import { CommentFormActions } from "./module-1338.mjs";
import { StandardMouseEvent } from "./module-0024.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ICommentService } from "./module-1321.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { IMarkdownRendererService } from "./module-0541.mjs";


// src/vs/workbench/contrib/comments/browser/commentNode.ts
var CommentsActionRunner = class extends ActionRunner {
  async runAction(action, context2) {
    await action.run(...context2);
  }
};

var CommentNode2 = class extends Disposable {
  constructor(parentEditor, commentThread, comment, pendingEdit, owner, resource, parentThread, markdownRendererOptions, instantiationService, commentService, notificationService, contextMenuService, contextKeyService, configurationService, hoverService, keybindingService, textModelService, markdownRendererService) {
    super();
    this.parentEditor = parentEditor;
    this.commentThread = commentThread;
    this.comment = comment;
    this.pendingEdit = pendingEdit;
    this.owner = owner;
    this.resource = resource;
    this.parentThread = parentThread;
    this.markdownRendererOptions = markdownRendererOptions;
    this.instantiationService = instantiationService;
    this.commentService = commentService;
    this.notificationService = notificationService;
    this.contextMenuService = contextMenuService;
    this.configurationService = configurationService;
    this.hoverService = hoverService;
    this.keybindingService = keybindingService;
    this.textModelService = textModelService;
    this.markdownRendererService = markdownRendererService;
    this._md = this._register(new MutableDisposable());
    this._focusClearTimer = this._register(new TimeoutTimer());
    this._editAction = null;
    this._commentEditContainer = null;
    this._reactionsActionBar = this._register(new MutableDisposable());
    this._reactionActions = this._register(new DisposableStore());
    this._commentEditor = null;
    this._commentEditorModel = null;
    this._editorHeight = MIN_EDITOR_HEIGHT;
    this._actionRunner = this._register(new CommentsActionRunner());
    this.toolbar = this._register(new MutableDisposable());
    this._commentFormActions = null;
    this._commentEditorActions = null;
    this._onDidClick = this._register(new Emitter());
    this.isEditing = false;
    this._editModeDisposables = this._register(new DisposableStore());
    this._domNode = $("div.review-comment");
    this._contextKeyService = this._register(contextKeyService.createScoped(this._domNode));
    this._commentContextValue = CommentContextKeys.commentContext.bindTo(this._contextKeyService);
    if (this.comment.contextValue) {
      this._commentContextValue.set(this.comment.contextValue);
    }
    this._commentMenus = this.commentService.getCommentMenus(this.owner);
    this._domNode.tabIndex = -1;
    this._avatar = append(this._domNode, $("div.avatar-container"));
    this.updateCommentUserIcon(this.comment.userIconPath);
    this._commentDetailsContainer = append(this._domNode, $(".review-comment-contents"));
    this.createHeader(this._commentDetailsContainer);
    this._body = document.createElement(`div`);
    this._body.classList.add("comment-body", MOUSE_CURSOR_TEXT_CSS_CLASS_NAME);
    if (configurationService.getValue(COMMENTS_SECTION)?.maxHeight !== false) {
      this._body.classList.add("comment-body-max-height");
    }
    this.createScroll(this._commentDetailsContainer, this._body);
    this.updateCommentBody(this.comment.body);
    this.createReactionsContainer(this._commentDetailsContainer);
    this._domNode.setAttribute("aria-label", `${comment.userName}, ${this.commentBodyValue}`);
    this._domNode.setAttribute("role", "treeitem");
    this._register(addDisposableListener(this._domNode, EventType.CLICK, () => this.isEditing || this._onDidClick.fire(this)));
    this._register(addDisposableListener(this._domNode, EventType.CONTEXT_MENU, (e4) => {
      return this.onContextMenu(e4);
    }));
    if (pendingEdit) {
      this.switchToEditMode();
    }
    this.activeCommentListeners();
  }
  get domNode() {
    return this._domNode;
  }
  activeCommentListeners() {
    this._register(addDisposableListener(this._domNode, EventType.FOCUS_IN, () => {
      this.commentService.setActiveCommentAndThread(this.owner, { thread: this.commentThread, comment: this.comment });
    }, true));
  }
  createScroll(container2, body) {
    this._scrollable = this._register(new Scrollable({
      forceIntegerValues: true,
      smoothScrollDuration: 125,
      scheduleAtNextAnimationFrame: (cb) => scheduleAtNextAnimationFrame(getWindow(container2), cb)
    }));
    this._scrollableElement = this._register(new SmoothScrollableElement(body, {
      horizontal: 3 /* Visible */,
      vertical: 3 /* Visible */
    }, this._scrollable));
    this._register(this._scrollableElement.onScroll((e4) => {
      if (e4.scrollLeftChanged) {
        body.scrollLeft = e4.scrollLeft;
      }
      if (e4.scrollTopChanged) {
        body.scrollTop = e4.scrollTop;
      }
    }));
    const onDidScrollViewContainer = this._register(new DomEmitter(body, "scroll")).event;
    this._register(onDidScrollViewContainer((_) => {
      const position2 = this._scrollableElement.getScrollPosition();
      const scrollLeft = Math.abs(body.scrollLeft - position2.scrollLeft) <= 1 ? void 0 : body.scrollLeft;
      const scrollTop = Math.abs(body.scrollTop - position2.scrollTop) <= 1 ? void 0 : body.scrollTop;
      if (scrollLeft !== void 0 || scrollTop !== void 0) {
        this._scrollableElement.setScrollPosition({ scrollLeft, scrollTop });
      }
    }));
    container2.appendChild(this._scrollableElement.getDomNode());
  }
  updateCommentBody(body) {
    this._body.innerText = "";
    this._md.clear();
    this._plainText = void 0;
    if (typeof body === "string") {
      this._plainText = append(this._body, $(".comment-body-plainstring"));
      this._plainText.innerText = body;
    } else {
      this._md.value = this.markdownRendererService.render(body, this.markdownRendererOptions);
      this._body.appendChild(this._md.value.element);
    }
  }
  updateCommentUserIcon(userIconPath) {
    this._avatar.textContent = "";
    if (userIconPath) {
      const img = append(this._avatar, $("img.avatar"));
      img.src = FileAccess.uriToBrowserUri(URI.revive(userIconPath)).toString(true);
      img.onerror = (_) => img.remove();
    }
  }
  get onDidClick() {
    return this._onDidClick.event;
  }
  createTimestamp(container2) {
    this._timestamp = append(container2, $("span.timestamp-container"));
    this.updateTimestamp(this.comment.timestamp);
  }
  updateTimestamp(raw) {
    if (!this._timestamp) {
      return;
    }
    const timestamp = raw !== void 0 ? new Date(raw) : void 0;
    if (!timestamp) {
      this._timestampWidget?.dispose();
    } else {
      if (!this._timestampWidget) {
        this._timestampWidget = new TimestampWidget(this.configurationService, this.hoverService, this._timestamp, timestamp);
        this._register(this._timestampWidget);
      } else {
        this._timestampWidget.setTimestamp(timestamp);
      }
    }
  }
  createHeader(commentDetailsContainer) {
    const header2 = append(commentDetailsContainer, $(`div.comment-title.${MOUSE_CURSOR_TEXT_CSS_CLASS_NAME}`));
    const infoContainer = append(header2, $("comment-header-info"));
    const author = append(infoContainer, $("strong.author"));
    author.innerText = this.comment.userName;
    this.createTimestamp(infoContainer);
    this._isPendingLabel = append(infoContainer, $("span.isPending"));
    if (this.comment.label) {
      this._isPendingLabel.innerText = this.comment.label;
    } else {
      this._isPendingLabel.innerText = "";
    }
    this._actionsToolbarContainer = append(header2, $(".comment-actions"));
    this.createActionsToolbar();
  }
  getToolbarActions(menu) {
    const contributedActions = menu.getActions({ shouldForwardArgs: true });
    const primary = [];
    const secondary = [];
    const result = { primary, secondary };
    fillInActions2(contributedActions, result, false, (g) => /^inline/.test(g));
    return result;
  }
  get commentNodeContext() {
    return [
      {
        thread: this.commentThread,
        commentUniqueId: this.comment.uniqueIdInThread,
        $mid: 10 /* CommentNode */
      },
      {
        commentControlHandle: this.commentThread.controllerHandle,
        commentThreadHandle: this.commentThread.commentThreadHandle,
        $mid: 7 /* CommentThread */
      }
    ];
  }
  createToolbar() {
    this.toolbar.value = new ToolBar(this._actionsToolbarContainer, this.contextMenuService, {
      actionViewItemProvider: (action, options3) => {
        if (action.id === ToggleReactionsAction.ID) {
          return new DropdownMenuActionViewItem(
            action,
            action.menuActions,
            this.contextMenuService,
            {
              ...options3,
              actionViewItemProvider: (action2, options4) => this.actionViewItemProvider(action2, options4),
              classNames: ["toolbar-toggle-pickReactions", ...ThemeIcon.asClassNameArray(Codicon.reactions)],
              anchorAlignmentProvider: () => 1 /* RIGHT */
            }
          );
        }
        return this.actionViewItemProvider(action, options3);
      },
      orientation: 0 /* HORIZONTAL */
    });
    this.toolbar.value.context = this.commentNodeContext;
    this.toolbar.value.actionRunner = this._actionRunner;
  }
  createActionsToolbar() {
    const actions = [];
    const menu = this._commentMenus.getCommentTitleActions(this.comment, this._contextKeyService);
    this._register(menu);
    this._register(menu.onDidChange((e4) => {
      const { primary: primary2, secondary: secondary2 } = this.getToolbarActions(menu);
      if (!this.toolbar && (primary2.length || secondary2.length)) {
        this.createToolbar();
      }
      this.toolbar.value.setActions(primary2, secondary2);
    }));
    const { primary, secondary } = this.getToolbarActions(menu);
    actions.push(...primary);
    if (actions.length || secondary.length) {
      this.createToolbar();
      this.toolbar.value.setActions(actions, secondary);
    }
  }
  actionViewItemProvider(action, options3) {
    if (action.id === ToggleReactionsAction.ID) {
      options3 = { label: false, icon: true };
    } else {
      options3 = { label: false, icon: true };
    }
    if (action.id === ReactionAction.ID) {
      const item = new ReactionActionViewItem(action);
      return item;
    } else if (action instanceof MenuItemAction) {
      return this.instantiationService.createInstance(MenuEntryActionViewItem, action, { hoverDelegate: options3.hoverDelegate });
    } else if (action instanceof SubmenuItemAction) {
      return this.instantiationService.createInstance(SubmenuEntryActionViewItem, action, options3);
    } else {
      const item = new ActionViewItem({}, action, options3);
      return item;
    }
  }
  async submitComment() {
    if (this._commentEditor && this._commentFormActions) {
      await this._commentFormActions.triggerDefaultAction();
      this.pendingEdit = void 0;
    }
  }
  createReactionPicker(reactionGroup) {
    const toggleReactionAction = this._reactionActions.add(new ToggleReactionsAction(() => {
      toggleReactionActionViewItem?.show();
    }, localize(13952, null)));
    let reactionMenuActions = [];
    if (reactionGroup && reactionGroup.length) {
      reactionMenuActions = reactionGroup.map((reaction) => {
        return this._reactionActions.add(new Action(`reaction.command.${reaction.label}`, `${reaction.label}`, "", true, async () => {
          try {
            await this.commentService.toggleReaction(this.owner, this.resource, this.commentThread, this.comment, reaction);
          } catch (e4) {
            const error = e4.message ? localize(13954, null, e4.message) : localize(13953, null);
            this.notificationService.error(error);
          }
        }));
      });
    }
    toggleReactionAction.menuActions = reactionMenuActions;
    const toggleReactionActionViewItem = this._reactionActions.add(new DropdownMenuActionViewItem(
      toggleReactionAction,
      toggleReactionAction.menuActions,
      this.contextMenuService,
      {
        actionViewItemProvider: (action, options3) => {
          if (action.id === ToggleReactionsAction.ID) {
            return toggleReactionActionViewItem;
          }
          return this.actionViewItemProvider(action, options3);
        },
        classNames: "toolbar-toggle-pickReactions",
        anchorAlignmentProvider: () => 1 /* RIGHT */
      }
    ));
    return toggleReactionAction;
  }
  createReactionsContainer(commentDetailsContainer) {
    this._reactionActionsContainer?.remove();
    this._reactionsActionBar.clear();
    this._reactionActions.clear();
    const hasReactionHandler = this.commentService.hasReactionHandler(this.owner);
    const reactions = this.comment.commentReactions?.filter((reaction) => !!reaction.count) || [];
    if (reactions.length === 0 && !hasReactionHandler) {
      return;
    }
    this._reactionActionsContainer = append(commentDetailsContainer, $("div.comment-reactions"));
    this._reactionsActionBar.value = new ActionBar(this._reactionActionsContainer, {
      actionViewItemProvider: (action, options3) => {
        if (action.id === ToggleReactionsAction.ID) {
          return new DropdownMenuActionViewItem(
            action,
            action.menuActions,
            this.contextMenuService,
            {
              actionViewItemProvider: (action2, options4) => this.actionViewItemProvider(action2, options4),
              classNames: ["toolbar-toggle-pickReactions", ...ThemeIcon.asClassNameArray(Codicon.reactions)],
              anchorAlignmentProvider: () => 1 /* RIGHT */
            }
          );
        }
        return this.actionViewItemProvider(action, options3);
      }
    });
    reactions.map((reaction) => {
      const action = this._reactionActions.add(new ReactionAction(`reaction.${reaction.label}`, `${reaction.label}`, reaction.hasReacted && (reaction.canEdit || hasReactionHandler) ? "active" : "", reaction.canEdit || hasReactionHandler, async () => {
        try {
          await this.commentService.toggleReaction(this.owner, this.resource, this.commentThread, this.comment, reaction);
        } catch (e4) {
          let error;
          if (reaction.hasReacted) {
            error = e4.message ? localize(13951, null, e4.message) : localize(13950, null);
          } else {
            error = e4.message ? localize(13949, null, e4.message) : localize(13948, null);
          }
          this.notificationService.error(error);
        }
      }, reaction.reactors, reaction.iconPath, reaction.count));
      this._reactionsActionBar.value?.push(action, { label: true, icon: true });
    });
    if (hasReactionHandler) {
      const toggleReactionAction = this.createReactionPicker(this.comment.commentReactions || []);
      this._reactionsActionBar.value?.push(toggleReactionAction, { label: false, icon: true });
    }
  }
  get commentBodyValue() {
    return typeof this.comment.body === "string" ? this.comment.body : this.comment.body.value;
  }
  async createCommentEditor(editContainer) {
    this._editModeDisposables.clear();
    const container2 = append(editContainer, $(".edit-textarea"));
    this._commentEditor = this.instantiationService.createInstance(SimpleCommentEditor, container2, SimpleCommentEditor.getEditorOptions(this.configurationService), this._contextKeyService, this.parentThread);
    this._editModeDisposables.add(this._commentEditor);
    const resource = URI.from({
      scheme: Schemas.commentsInput,
      path: `/commentinput-${this.comment.uniqueIdInThread}-${Date.now()}.md`
    });
    const modelRef = await this.textModelService.createModelReference(resource);
    this._commentEditorModel = modelRef;
    this._editModeDisposables.add(this._commentEditorModel);
    this._commentEditor.setModel(this._commentEditorModel.object.textEditorModel);
    this._commentEditor.setValue(this.pendingEdit?.body ?? this.commentBodyValue);
    if (this.pendingEdit) {
      this._commentEditor.setPosition(this.pendingEdit.cursor);
    } else {
      const lastLine = this._commentEditorModel.object.textEditorModel.getLineCount();
      const lastColumn = this._commentEditorModel.object.textEditorModel.getLineLength(lastLine) + 1;
      this._commentEditor.setPosition(new Position(lastLine, lastColumn));
    }
    this.pendingEdit = void 0;
    this._commentEditor.layout({ width: container2.clientWidth - 14, height: this._editorHeight });
    this._commentEditor.focus();
    scheduleAtNextAnimationFrame(getWindow(editContainer), () => {
      this._commentEditor.layout({ width: container2.clientWidth - 14, height: this._editorHeight });
      this._commentEditor.focus();
    });
    const commentThread = this.commentThread;
    commentThread.input = {
      uri: this._commentEditor.getModel().uri,
      value: this.commentBodyValue
    };
    this.commentService.setActiveEditingCommentThread(commentThread);
    this.commentService.setActiveCommentAndThread(this.owner, { thread: commentThread, comment: this.comment });
    this._editModeDisposables.add(this._commentEditor.onDidFocusEditorWidget(() => {
      commentThread.input = {
        uri: this._commentEditor.getModel().uri,
        value: this.commentBodyValue
      };
      this.commentService.setActiveEditingCommentThread(commentThread);
      this.commentService.setActiveCommentAndThread(this.owner, { thread: commentThread, comment: this.comment });
    }));
    this._editModeDisposables.add(this._commentEditor.onDidChangeModelContent((e4) => {
      if (commentThread.input && this._commentEditor && this._commentEditor.getModel().uri === commentThread.input.uri) {
        const newVal = this._commentEditor.getValue();
        if (newVal !== commentThread.input.value) {
          const input = commentThread.input;
          input.value = newVal;
          commentThread.input = input;
          this.commentService.setActiveEditingCommentThread(commentThread);
          this.commentService.setActiveCommentAndThread(this.owner, { thread: commentThread, comment: this.comment });
        }
      }
    }));
    this.calculateEditorHeight();
    this._editModeDisposables.add(this._commentEditorModel.object.textEditorModel.onDidChangeContent(() => {
      if (this._commentEditor && this.calculateEditorHeight()) {
        this._commentEditor.layout({ height: this._editorHeight, width: this._commentEditor.getLayoutInfo().width });
        this._commentEditor.render(true);
      }
    }));
  }
  calculateEditorHeight() {
    if (this._commentEditor) {
      const newEditorHeight = calculateEditorHeight(this.parentEditor, this._commentEditor, this._editorHeight);
      if (newEditorHeight !== this._editorHeight) {
        this._editorHeight = newEditorHeight;
        return true;
      }
    }
    return false;
  }
  getPendingEdit() {
    const model = this._commentEditor?.getModel();
    if (this._commentEditor && model && model.getValueLength() > 0) {
      return { body: model.getValue(), cursor: this._commentEditor.getPosition() };
    }
    return void 0;
  }
  removeCommentEditor() {
    this.isEditing = false;
    if (this._editAction) {
      this._editAction.enabled = true;
    }
    this._body.classList.remove("hidden");
    this._editModeDisposables.clear();
    this._commentEditor = null;
    this._commentEditContainer.remove();
  }
  layout(widthInPixel) {
    const editorWidth = widthInPixel !== void 0 ? widthInPixel - 72 : this._commentEditor?.getLayoutInfo().width ?? 0;
    this._commentEditor?.layout({ width: editorWidth, height: this._editorHeight });
    const scrollWidth = this._body.scrollWidth;
    const width2 = getContentWidth(this._body);
    const scrollHeight = this._body.scrollHeight;
    const height = getContentHeight(this._body) + 4;
    this._scrollableElement.setScrollDimensions({ width: width2, scrollWidth, height, scrollHeight });
  }
  async switchToEditMode() {
    if (this.isEditing) {
      return;
    }
    this.isEditing = true;
    this._body.classList.add("hidden");
    this._commentEditContainer = append(this._commentDetailsContainer, $(".edit-container"));
    await this.createCommentEditor(this._commentEditContainer);
    const formActions = append(this._commentEditContainer, $(".form-actions"));
    const otherActions = append(formActions, $(".other-actions"));
    this.createCommentWidgetFormActions(otherActions);
    const editorActions = append(formActions, $(".editor-actions"));
    this.createCommentWidgetEditorActions(editorActions);
  }
  createCommentWidgetFormActions(container2) {
    const menus = this.commentService.getCommentMenus(this.owner);
    const menu = menus.getCommentActions(this.comment, this._contextKeyService);
    this._editModeDisposables.add(menu);
    this._editModeDisposables.add(menu.onDidChange(() => {
      this._commentFormActions?.setActions(menu);
    }));
    this._commentFormActions = new CommentFormActions(this.keybindingService, this._contextKeyService, this.contextMenuService, container2, (action) => {
      const text2 = this._commentEditor.getValue();
      action.run({
        thread: this.commentThread,
        commentUniqueId: this.comment.uniqueIdInThread,
        text: text2,
        $mid: 11 /* CommentThreadNode */
      });
      this.removeCommentEditor();
    });
    this._editModeDisposables.add(this._commentFormActions);
    this._commentFormActions.setActions(menu);
  }
  createCommentWidgetEditorActions(container2) {
    const menus = this.commentService.getCommentMenus(this.owner);
    const menu = menus.getCommentEditorActions(this._contextKeyService);
    this._editModeDisposables.add(menu);
    this._editModeDisposables.add(menu.onDidChange(() => {
      this._commentEditorActions?.setActions(menu, true);
    }));
    this._commentEditorActions = new CommentFormActions(this.keybindingService, this._contextKeyService, this.contextMenuService, container2, (action) => {
      const text2 = this._commentEditor.getValue();
      action.run({
        thread: this.commentThread,
        commentUniqueId: this.comment.uniqueIdInThread,
        text: text2,
        $mid: 11 /* CommentThreadNode */
      });
      this._commentEditor?.focus();
    });
    this._editModeDisposables.add(this._commentEditorActions);
    this._commentEditorActions.setActions(menu, true);
  }
  setFocus(focused, visible = false) {
    if (focused) {
      this._domNode.focus();
      this._actionsToolbarContainer.classList.add("tabfocused");
      this._domNode.tabIndex = 0;
      if (this.comment.mode === 0 /* Editing */) {
        this._commentEditor?.focus();
      }
    } else {
      if (this._actionsToolbarContainer.classList.contains("tabfocused") && !this._actionsToolbarContainer.classList.contains("mouseover")) {
        this._domNode.tabIndex = -1;
      }
      this._actionsToolbarContainer.classList.remove("tabfocused");
    }
  }
  async update(newComment) {
    if (newComment.body !== this.comment.body) {
      this.updateCommentBody(newComment.body);
    }
    if (this.comment.userIconPath && newComment.userIconPath && URI.from(this.comment.userIconPath).toString() !== URI.from(newComment.userIconPath).toString()) {
      this.updateCommentUserIcon(newComment.userIconPath);
    }
    const isChangingMode = newComment.mode !== void 0 && newComment.mode !== this.comment.mode;
    this.comment = newComment;
    if (isChangingMode) {
      if (newComment.mode === 0 /* Editing */) {
        await this.switchToEditMode();
      } else {
        this.removeCommentEditor();
      }
    }
    if (newComment.label) {
      this._isPendingLabel.innerText = newComment.label;
    } else {
      this._isPendingLabel.innerText = "";
    }
    this.createReactionsContainer(this._commentDetailsContainer);
    if (this.comment.contextValue) {
      this._commentContextValue.set(this.comment.contextValue);
    } else {
      this._commentContextValue.reset();
    }
    if (this.comment.timestamp) {
      this.updateTimestamp(this.comment.timestamp);
    }
  }
  onContextMenu(e4) {
    const event = new StandardMouseEvent(getWindow(this._domNode), e4);
    this.contextMenuService.showContextMenu({
      getAnchor: () => event,
      menuId: MenuId.CommentThreadCommentContext,
      menuActionOptions: { shouldForwardArgs: true },
      contextKeyService: this._contextKeyService,
      actionRunner: this._actionRunner,
      getActionsContext: () => {
        return this.commentNodeContext;
      }
    });
  }
  focus() {
    this.domNode.focus();
    this.domNode.classList.add("focus");
    this._focusClearTimer.setIfNotSet(() => this.domNode.classList.remove("focus"), 3e3);
  }
};

CommentNode2 = __decorateClass([
  __decorateParam(8, IInstantiationService),
  __decorateParam(9, ICommentService),
  __decorateParam(10, INotificationService),
  __decorateParam(11, IContextMenuService),
  __decorateParam(12, IContextKeyService),
  __decorateParam(13, IConfigurationService),
  __decorateParam(14, IHoverService),
  __decorateParam(15, IKeybindingService),
  __decorateParam(16, ITextModelService),
  __decorateParam(17, IMarkdownRendererService)
], CommentNode2);

function fillInActions2(groups, target, useAlternativeActions, isPrimaryGroup = (group2) => group2 === "navigation") {
  for (const tuple of groups) {
    let [group2, actions] = tuple;
    if (useAlternativeActions) {
      actions = actions.map((a) => a instanceof MenuItemAction && !!a.alt ? a.alt : a);
    }
    if (isPrimaryGroup(group2)) {
      const to = Array.isArray(target) ? target : target.primary;
      to.unshift(...actions);
    } else {
      const to = Array.isArray(target) ? target : target.secondary;
      if (to.length > 0) {
        to.push(new Separator());
      }
      to.push(...actions);
    }
  }
}
export { fillInActions2, CommentsActionRunner, CommentNode2 };
