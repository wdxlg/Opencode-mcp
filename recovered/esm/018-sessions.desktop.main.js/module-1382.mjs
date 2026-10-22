// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadComments.ts
import { Emitter } from "./module-0017.mjs";
import { Range2 } from "./module-0106.mjs";
import { Disposable, DisposableMap, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { URI } from "./module-0032.mjs";
import { Schemas } from "./module-0033.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ICommentService } from "./module-1321.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { registerIcon } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { ExtHostContext, MainContext } from "./module-0922.mjs";
import { revealCommentThread } from "./module-1373.mjs";
import { COMMENTS_VIEW_ID, COMMENTS_VIEW_STORAGE_ID, COMMENTS_VIEW_TITLE } from "./module-1326.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions13, IViewDescriptorService } from "./module-1094.mjs";
import { SyncDescriptor } from "./module-0134.mjs";
import { ViewPaneContainer } from "./module-1381.mjs";
import { CommentsPanel } from "./module-1375.mjs";
import { extHostNamedCustomer } from "./module-0920.mjs";
import { IViewsService } from "./module-1246.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/workbench/api/browser/mainThreadComments.ts
var MainThreadCommentThread = class {
  constructor(commentThreadHandle, controllerHandle, extensionId, threadId, resource, _range, comments, _canReply, _isTemplate, editorId) {
    this.commentThreadHandle = commentThreadHandle;
    this.controllerHandle = controllerHandle;
    this.extensionId = extensionId;
    this.threadId = threadId;
    this.resource = resource;
    this._range = _range;
    this._canReply = _canReply;
    this._isTemplate = _isTemplate;
    this.editorId = editorId;
    this._onDidChangeInput = new Emitter();
    this._onDidChangeLabel = new Emitter();
    this.onDidChangeLabel = this._onDidChangeLabel.event;
    this._onDidChangeComments = new Emitter();
    this._onDidChangeCanReply = new Emitter();
    this._collapsibleState = 0 /* Collapsed */;
    this._onDidChangeCollapsibleState = new Emitter();
    this.onDidChangeCollapsibleState = this._onDidChangeCollapsibleState.event;
    this._onDidChangeInitialCollapsibleState = new Emitter();
    this.onDidChangeInitialCollapsibleState = this._onDidChangeInitialCollapsibleState.event;
    this._onDidChangeApplicability = new Emitter();
    this.onDidChangeApplicability = this._onDidChangeApplicability.event;
    this._onDidChangeState = new Emitter();
    this.onDidChangeState = this._onDidChangeState.event;
    this._isDisposed = false;
    if (_isTemplate) {
      this.comments = [];
    } else if (comments) {
      this._comments = comments;
    }
  }
  get input() {
    return this._input;
  }
  set input(value2) {
    this._input = value2;
    this._onDidChangeInput.fire(value2);
  }
  get onDidChangeInput() {
    return this._onDidChangeInput.event;
  }
  get label() {
    return this._label;
  }
  set label(label3) {
    this._label = label3;
    this._onDidChangeLabel.fire(this._label);
  }
  get contextValue() {
    return this._contextValue;
  }
  set contextValue(context2) {
    this._contextValue = context2;
  }
  get comments() {
    return this._comments;
  }
  set comments(newComments) {
    this._comments = newComments;
    this._onDidChangeComments.fire(this._comments);
  }
  get onDidChangeComments() {
    return this._onDidChangeComments.event;
  }
  set range(range2) {
    this._range = range2;
  }
  get range() {
    return this._range;
  }
  get onDidChangeCanReply() {
    return this._onDidChangeCanReply.event;
  }
  set canReply(state) {
    this._canReply = state;
    this._onDidChangeCanReply.fire(!!this._canReply);
  }
  get canReply() {
    return this._canReply;
  }
  get collapsibleState() {
    return this._collapsibleState;
  }
  set collapsibleState(newState) {
    if (this.initialCollapsibleState === void 0) {
      this.initialCollapsibleState = newState;
    }
    if (newState !== this._collapsibleState) {
      this._collapsibleState = newState;
      this._onDidChangeCollapsibleState.fire(this._collapsibleState);
    }
  }
  get initialCollapsibleState() {
    return this._initialCollapsibleState;
  }
  set initialCollapsibleState(initialCollapsibleState) {
    this._initialCollapsibleState = initialCollapsibleState;
    this._onDidChangeInitialCollapsibleState.fire(initialCollapsibleState);
  }
  get isDisposed() {
    return this._isDisposed;
  }
  isDocumentCommentThread() {
    return this._range === void 0 || Range2.isIRange(this._range);
  }
  get state() {
    return this._state;
  }
  set state(newState) {
    this._state = newState;
    this._onDidChangeState.fire(this._state);
  }
  get applicability() {
    return this._applicability;
  }
  set applicability(value2) {
    this._applicability = value2;
    this._onDidChangeApplicability.fire(value2);
  }
  get isTemplate() {
    return this._isTemplate;
  }
  batchUpdate(changes) {
    const modified = (value2) => Object.prototype.hasOwnProperty.call(changes, value2);
    if (modified("range")) {
      this._range = changes.range;
    }
    if (modified("label")) {
      this._label = changes.label;
    }
    if (modified("contextValue")) {
      this._contextValue = changes.contextValue === null ? void 0 : changes.contextValue;
    }
    if (modified("comments")) {
      this.comments = changes.comments;
    }
    if (modified("collapseState")) {
      this.collapsibleState = changes.collapseState;
    }
    if (modified("canReply")) {
      this.canReply = changes.canReply;
    }
    if (modified("state")) {
      this.state = changes.state;
    }
    if (modified("applicability")) {
      this.applicability = changes.applicability;
    }
    if (modified("isTemplate")) {
      this._isTemplate = changes.isTemplate;
    }
  }
  hasComments() {
    return !!this.comments && this.comments.length > 0;
  }
  dispose() {
    this._isDisposed = true;
    this._onDidChangeCollapsibleState.dispose();
    this._onDidChangeInitialCollapsibleState.dispose();
    this._onDidChangeComments.dispose();
    this._onDidChangeInput.dispose();
    this._onDidChangeLabel.dispose();
    this._onDidChangeCanReply.dispose();
    this._onDidChangeState.dispose();
    this._onDidChangeApplicability.dispose();
  }
  toJSON() {
    return {
      $mid: 7 /* CommentThread */,
      commentControlHandle: this.controllerHandle,
      commentThreadHandle: this.commentThreadHandle
    };
  }
};

var CommentThreadWithDisposable = class {
  constructor(thread) {
    this.thread = thread;
    this.disposableStore = new DisposableStore();
  }
  dispose() {
    this.disposableStore.dispose();
  }
};

var MainThreadCommentController = class extends Disposable {
  constructor(_proxy, _handle, _uniqueId, _id, _label, _features, _commentService, _uriIdentityService) {
    super();
    this._proxy = _proxy;
    this._handle = _handle;
    this._uniqueId = _uniqueId;
    this._id = _id;
    this._label = _label;
    this._features = _features;
    this._commentService = _commentService;
    this._uriIdentityService = _uriIdentityService;
    this._threads = this._register(new DisposableMap());
  }
  get handle() {
    return this._handle;
  }
  get id() {
    return this._id;
  }
  get contextValue() {
    return this._id;
  }
  get proxy() {
    return this._proxy;
  }
  get label() {
    return this._label;
  }
  get reactions() {
    return this._reactions;
  }
  set reactions(reactions) {
    this._reactions = reactions;
  }
  get options() {
    return this._features.options;
  }
  get features() {
    return this._features;
  }
  get owner() {
    return this._id;
  }
  get activeComment() {
    return this._activeComment;
  }
  async setActiveCommentAndThread(commentInfo) {
    this._activeComment = commentInfo;
    return this._proxy.$setActiveComment(this._handle, commentInfo ? { commentThreadHandle: commentInfo.thread.commentThreadHandle, uniqueIdInThread: commentInfo.comment?.uniqueIdInThread } : void 0);
  }
  updateFeatures(features) {
    this._features = features;
  }
  createCommentThread(extensionId, commentThreadHandle, threadId, resource, range2, comments, isTemplate, editorId) {
    const thread = new MainThreadCommentThread(
      commentThreadHandle,
      this.handle,
      extensionId,
      threadId,
      URI.revive(resource).toString(),
      range2,
      comments,
      true,
      isTemplate,
      editorId
    );
    const threadWithDisposable = new CommentThreadWithDisposable(thread);
    this._threads.set(commentThreadHandle, threadWithDisposable);
    threadWithDisposable.disposableStore.add(thread.onDidChangeCollapsibleState(() => {
      this.proxy.$updateCommentThread(this.handle, thread.commentThreadHandle, { collapseState: thread.collapsibleState });
    }));
    if (thread.isDocumentCommentThread()) {
      this._commentService.updateComments(this._uniqueId, {
        added: [thread],
        removed: [],
        changed: [],
        pending: []
      });
    } else {
      this._commentService.updateNotebookComments(this._uniqueId, {
        added: [thread],
        removed: [],
        changed: [],
        pending: []
      });
    }
    return thread;
  }
  updateCommentThread(commentThreadHandle, threadId, resource, changes) {
    const thread = this.getKnownThread(commentThreadHandle);
    thread.batchUpdate(changes);
    if (thread.isDocumentCommentThread()) {
      this._commentService.updateComments(this._uniqueId, {
        added: [],
        removed: [],
        changed: [thread],
        pending: []
      });
    } else {
      this._commentService.updateNotebookComments(this._uniqueId, {
        added: [],
        removed: [],
        changed: [thread],
        pending: []
      });
    }
  }
  deleteCommentThread(commentThreadHandle) {
    const thread = this.getKnownThread(commentThreadHandle);
    this._threads.deleteAndDispose(commentThreadHandle);
    thread.dispose();
    if (thread.isDocumentCommentThread()) {
      this._commentService.updateComments(this._uniqueId, {
        added: [],
        removed: [thread],
        changed: [],
        pending: []
      });
    } else {
      this._commentService.updateNotebookComments(this._uniqueId, {
        added: [],
        removed: [thread],
        changed: [],
        pending: []
      });
    }
  }
  deleteCommentThreadMain(commentThreadId) {
    for (const { thread } of this._threads.values()) {
      if (thread.threadId === commentThreadId) {
        this._proxy.$deleteCommentThread(this._handle, thread.commentThreadHandle);
      }
    }
  }
  updateInput(input) {
    const thread = this.activeEditingCommentThread;
    if (thread && thread.input) {
      const commentInput = thread.input;
      commentInput.value = input;
      thread.input = commentInput;
    }
  }
  updateCommentingRanges(resourceHints) {
    this._commentService.updateCommentingRanges(this._uniqueId, resourceHints);
  }
  getKnownThread(commentThreadHandle) {
    const thread = this._threads.get(commentThreadHandle);
    if (!thread) {
      throw new Error("unknown thread");
    }
    return thread.thread;
  }
  async getDocumentComments(resource, token) {
    if (resource.scheme === Schemas.vscodeNotebookCell) {
      return {
        uniqueOwner: this._uniqueId,
        label: this.label,
        threads: [],
        commentingRanges: {
          resource,
          ranges: [],
          fileComments: false
        }
      };
    }
    const ret = [];
    for (const thread of [...this._threads.keys()]) {
      const commentThread = this._threads.get(thread);
      if (commentThread.thread.resource && this._uriIdentityService.extUri.isEqual(URI.parse(commentThread.thread.resource), resource)) {
        if (commentThread.thread.isDocumentCommentThread()) {
          ret.push(commentThread.thread);
        }
      }
    }
    const commentingRanges = await this._proxy.$provideCommentingRanges(this.handle, resource, token);
    return {
      uniqueOwner: this._uniqueId,
      label: this.label,
      threads: ret,
      commentingRanges: {
        resource,
        ranges: commentingRanges?.ranges || [],
        fileComments: !!commentingRanges?.fileComments
      }
    };
  }
  async getNotebookComments(resource, token) {
    if (resource.scheme !== Schemas.vscodeNotebookCell) {
      return {
        uniqueOwner: this._uniqueId,
        label: this.label,
        threads: []
      };
    }
    const ret = [];
    for (const thread of [...this._threads.keys()]) {
      const commentThread = this._threads.get(thread);
      if (commentThread.thread.resource === resource.toString()) {
        if (!commentThread.thread.isDocumentCommentThread()) {
          ret.push(commentThread.thread);
        }
      }
    }
    return {
      uniqueOwner: this._uniqueId,
      label: this.label,
      threads: ret
    };
  }
  async toggleReaction(uri4, thread, comment, reaction, token) {
    return this._proxy.$toggleReaction(this._handle, thread.commentThreadHandle, uri4, comment, reaction);
  }
  getAllComments() {
    const ret = [];
    for (const thread of [...this._threads.keys()]) {
      ret.push(this._threads.get(thread).thread);
    }
    return ret;
  }
  createCommentThreadTemplate(resource, range2, editorId) {
    return this._proxy.$createCommentThreadTemplate(this.handle, resource, range2, editorId);
  }
  async updateCommentThreadTemplate(threadHandle, range2) {
    await this._proxy.$updateCommentThreadTemplate(this.handle, threadHandle, range2);
  }
  toJSON() {
    return {
      $mid: 6 /* CommentController */,
      handle: this.handle
    };
  }
};

MainThreadCommentController = __decorateClass([
  __decorateParam(6, ICommentService),
  __decorateParam(7, IUriIdentityService)
], MainThreadCommentController);

var commentsViewIcon = registerIcon("comments-view-icon", Codicon.commentDiscussion, localize(5673, null));

var MainThreadComments = class extends Disposable {
  constructor(extHostContext, _commentService, _viewsService, _viewDescriptorService, _uriIdentityService, _editorService, _instantiationService) {
    super();
    this._commentService = _commentService;
    this._viewsService = _viewsService;
    this._viewDescriptorService = _viewDescriptorService;
    this._uriIdentityService = _uriIdentityService;
    this._editorService = _editorService;
    this._instantiationService = _instantiationService;
    this._handlers = /* @__PURE__ */ new Map();
    this._commentControllers = /* @__PURE__ */ new Map();
    this._activeEditingCommentThreadDisposables = this._register(new DisposableStore());
    this._openViewListener = this._register(new MutableDisposable());
    this._onChangeContainerListener = this._register(new MutableDisposable());
    this._onChangeContainerLocationListener = this._register(new MutableDisposable());
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostComments);
    this._commentService.unregisterCommentController();
    this._register(this._commentService.onDidChangeActiveEditingCommentThread(async (thread) => {
      const handle2 = thread.controllerHandle;
      const controller = this._commentControllers.get(handle2);
      if (!controller) {
        return;
      }
      this._activeEditingCommentThreadDisposables.clear();
      this._activeEditingCommentThread = thread;
      controller.activeEditingCommentThread = this._activeEditingCommentThread;
    }));
    this._register(this._commentService.onResourceHasCommentingRanges(() => {
      this.registerView();
    }));
    this._register(this._commentService.onDidUpdateCommentThreads(() => {
      this.registerView();
    }));
  }
  $registerCommentController(handle2, id2, label3, extensionId) {
    const providerId = `${id2}-${extensionId}`;
    this._handlers.set(handle2, providerId);
    const provider = this._instantiationService.createInstance(MainThreadCommentController, this._proxy, handle2, providerId, id2, label3, {});
    this._commentService.registerCommentController(providerId, provider);
    this._commentControllers.set(handle2, provider);
    this._commentService.setWorkspaceComments(String(handle2), []);
  }
  $unregisterCommentController(handle2) {
    const providerId = this._handlers.get(handle2);
    this._handlers.delete(handle2);
    this._commentControllers.get(handle2)?.dispose();
    this._commentControllers.delete(handle2);
    if (typeof providerId !== "string") {
      return;
    } else {
      this._commentService.unregisterCommentController(providerId);
    }
  }
  $updateCommentControllerFeatures(handle2, features) {
    const provider = this._commentControllers.get(handle2);
    if (!provider) {
      return void 0;
    }
    provider.updateFeatures(features);
  }
  $createCommentThread(handle2, commentThreadHandle, threadId, resource, range2, comments, extensionId, isTemplate, editorId) {
    const provider = this._commentControllers.get(handle2);
    if (!provider) {
      return void 0;
    }
    return provider.createCommentThread(extensionId.value, commentThreadHandle, threadId, resource, range2, comments, isTemplate, editorId);
  }
  $updateCommentThread(handle2, commentThreadHandle, threadId, resource, changes) {
    const provider = this._commentControllers.get(handle2);
    if (!provider) {
      return void 0;
    }
    return provider.updateCommentThread(commentThreadHandle, threadId, resource, changes);
  }
  $deleteCommentThread(handle2, commentThreadHandle) {
    const provider = this._commentControllers.get(handle2);
    if (!provider) {
      return;
    }
    return provider.deleteCommentThread(commentThreadHandle);
  }
  $updateCommentingRanges(handle2, resourceHints) {
    const provider = this._commentControllers.get(handle2);
    if (!provider) {
      return;
    }
    provider.updateCommentingRanges(resourceHints);
  }
  async $revealCommentThread(handle2, commentThreadHandle, commentUniqueIdInThread, options3) {
    const provider = this._commentControllers.get(handle2);
    if (!provider) {
      return Promise.resolve();
    }
    const thread = provider.getAllComments().find((thread2) => thread2.commentThreadHandle === commentThreadHandle);
    if (!thread || !thread.isDocumentCommentThread()) {
      return Promise.resolve();
    }
    const comment = thread.comments?.find((comment2) => comment2.uniqueIdInThread === commentUniqueIdInThread);
    revealCommentThread(this._commentService, this._editorService, this._uriIdentityService, thread, comment, options3.focusReply, void 0, options3.preserveFocus);
  }
  async $hideCommentThread(handle2, commentThreadHandle) {
    const provider = this._commentControllers.get(handle2);
    if (!provider) {
      return Promise.resolve();
    }
    const thread = provider.getAllComments().find((thread2) => thread2.commentThreadHandle === commentThreadHandle);
    if (!thread || !thread.isDocumentCommentThread()) {
      return Promise.resolve();
    }
    thread.collapsibleState = 0 /* Collapsed */;
  }
  registerView() {
    const commentsPanelAlreadyConstructed = !!this._viewDescriptorService.getViewDescriptorById(COMMENTS_VIEW_ID);
    if (!commentsPanelAlreadyConstructed) {
      const VIEW_CONTAINER4 = Registry.as(Extensions13.ViewContainersRegistry).registerViewContainer({
        id: COMMENTS_VIEW_ID,
        title: COMMENTS_VIEW_TITLE,
        ctorDescriptor: new SyncDescriptor(ViewPaneContainer, [COMMENTS_VIEW_ID, { mergeViewWithContainerWhenSingleView: true }]),
        storageId: COMMENTS_VIEW_STORAGE_ID,
        hideIfEmpty: true,
        icon: commentsViewIcon,
        order: 10
      }, 1 /* Panel */);
      Registry.as(Extensions13.ViewsRegistry).registerViews([{
        id: COMMENTS_VIEW_ID,
        name: COMMENTS_VIEW_TITLE,
        canToggleVisibility: false,
        ctorDescriptor: new SyncDescriptor(CommentsPanel),
        canMoveView: true,
        containerIcon: commentsViewIcon,
        focusCommand: {
          id: "workbench.action.focusCommentsPanel"
        }
      }], VIEW_CONTAINER4);
    }
    this.registerViewListeners(commentsPanelAlreadyConstructed);
  }
  setComments() {
    [...this._commentControllers.keys()].forEach((handle2) => {
      const threads = this._commentControllers.get(handle2).getAllComments();
      if (threads.length) {
        const providerId = this.getHandler(handle2);
        this._commentService.setWorkspaceComments(providerId, threads);
      }
    });
  }
  registerViewOpenedListener() {
    if (!this._openViewListener.value) {
      this._openViewListener.value = this._viewsService.onDidChangeViewVisibility((e4) => {
        if (e4.id === COMMENTS_VIEW_ID && e4.visible) {
          this.setComments();
          if (this._openViewListener) {
            this._openViewListener.dispose();
          }
        }
      });
    }
  }
  /**
   * If the comments view has never been opened, the constructor for it has not yet run so it has
   * no listeners for comment threads being set or updated. Listen for the view opening for the
   * first time and send it comments then.
   */
  registerViewListeners(commentsPanelAlreadyConstructed) {
    if (!commentsPanelAlreadyConstructed) {
      this.registerViewOpenedListener();
    }
    if (!this._onChangeContainerListener.value) {
      this._onChangeContainerListener.value = this._viewDescriptorService.onDidChangeContainer((e4) => {
        if (e4.views.find((view) => view.id === COMMENTS_VIEW_ID)) {
          this.setComments();
          this.registerViewOpenedListener();
        }
      });
    }
    if (!this._onChangeContainerLocationListener.value) {
      this._onChangeContainerLocationListener.value = this._viewDescriptorService.onDidChangeContainerLocation((e4) => {
        const commentsContainer = this._viewDescriptorService.getViewContainerByViewId(COMMENTS_VIEW_ID);
        if (e4.viewContainer.id === commentsContainer?.id) {
          this.setComments();
          this.registerViewOpenedListener();
        }
      });
    }
  }
  getHandler(handle2) {
    if (!this._handlers.has(handle2)) {
      throw new Error("Unknown handler");
    }
    return this._handlers.get(handle2);
  }
};

MainThreadComments = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadComments),
  __decorateParam(1, ICommentService),
  __decorateParam(2, IViewsService),
  __decorateParam(3, IViewDescriptorService),
  __decorateParam(4, IUriIdentityService),
  __decorateParam(5, IEditorService),
  __decorateParam(6, IInstantiationService)
], MainThreadComments);
export { MainThreadCommentThread, CommentThreadWithDisposable, MainThreadCommentController, commentsViewIcon, MainThreadComments };
