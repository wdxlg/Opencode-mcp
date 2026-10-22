// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/agentFeedback/browser/agentFeedbackEditorWidgetContribution.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { observableSignalFromEvent } from "./module-0062.mjs";
import { Event2 } from "./module-0017.mjs";
import { autorun } from "./module-0052.mjs";
import { getSessionEditorComments, groupNearbySessionEditorComments } from "./module-3609.mjs";
import { AgentFeedbackEditorWidget } from "./module-4289.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { isIChatSessionFileChange2 } from "./module-0961.mjs";
import { Range2 } from "./module-0106.mjs";
import { isHTMLElement } from "./module-0075.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentFeedbackService } from "./module-3611.mjs";
import { ISessionsManagementService } from "./module-1766.mjs";
import { ICodeReviewService } from "./module-3608.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { registerEditorContribution } from "./module-0097.mjs";


// src/vs/sessions/contrib/agentFeedback/browser/agentFeedbackEditorWidgetContribution.ts
var AgentFeedbackEditorWidgetContribution = class extends Disposable {
  constructor(_editor, _agentFeedbackService, _sessionsManagementService, _codeReviewService, _instantiationService) {
    super();
    this._editor = _editor;
    this._agentFeedbackService = _agentFeedbackService;
    this._sessionsManagementService = _sessionsManagementService;
    this._codeReviewService = _codeReviewService;
    this._instantiationService = _instantiationService;
    this._widgets = [];
    this._widgetListeners = this._register(new DisposableStore());
    /**
     * Composer state shared across widget rebuilds. Without this, any unrelated
     * feedback / review state change would dispose the active widget and discard
     * the textarea the user was typing in.
     */
    this._composerDraftState = {
      drafts: /* @__PURE__ */ new Map(),
      focusedCommentId: void 0
    };
    this._store.add(this._agentFeedbackService.onDidChangeNavigation((sessionResource) => {
      if (this._sessionResource && sessionResource.toString() === this._sessionResource.toString()) {
        this._handleNavigation();
      }
    }));
    const rebuildSignal = observableSignalFromEvent(this, Event2.any(
      this._agentFeedbackService.onDidChangeFeedback,
      this._agentFeedbackService.onDidChangeFeedbackVisibility,
      this._agentFeedbackService.onDidChangeFeedbackScope,
      this._editor.onDidChangeModel
    ));
    this._store.add(Event2.any(this._editor.onDidScrollChange, this._editor.onDidLayoutChange)(() => {
      for (const widget of this._widgets) {
        widget.relayout();
      }
    }));
    this._store.add(autorun((reader) => {
      rebuildSignal.read(reader);
      this._resolveSession();
      if (!this._sessionResource) {
        this._clearWidgets();
        return;
      }
      this._rebuildWidgets(
        this._codeReviewService.getPRReviewState(this._sessionResource).read(reader)
      );
      this._handleNavigation();
    }));
  }
  static {
    this.ID = "agentFeedback.editorWidgetContribution";
  }
  _resolveSession() {
    const model = this._editor.getModel();
    if (!model) {
      this._sessionResource = void 0;
      return;
    }
    this._sessionResource = this._agentFeedbackService.getFeedbackSessionResource(model.uri);
  }
  _rebuildWidgets(prReviewState = this._sessionResource ? this._codeReviewService.getPRReviewState(this._sessionResource).get() : void 0) {
    this._clearWidgets();
    if (!this._sessionResource) {
      return;
    }
    const model = this._editor.getModel();
    if (!model) {
      return;
    }
    const comments = getSessionEditorComments(
      this._sessionResource,
      this._agentFeedbackService.getFeedback(this._sessionResource),
      prReviewState,
      this._agentFeedbackService.getVisibleResolvedFeedbackIds(this._sessionResource)
    );
    const fileComments = this._getCommentsForModel(model.uri, comments);
    if (fileComments.length === 0) {
      return;
    }
    const groups = groupNearbySessionEditorComments(fileComments, 5);
    for (let i2 = groups.length - 1; i2 >= 0; i2--) {
      const group2 = groups[i2];
      const widget = this._instantiationService.createInstance(AgentFeedbackEditorWidget, this._editor, group2, this._sessionResource, this._composerDraftState);
      this._widgets.push(widget);
      this._widgetListeners.add(widget.onDidExpand(() => {
        for (const other of this._widgets) {
          if (other !== widget && other.isExpanded) {
            other.collapse();
          }
        }
      }));
      widget.layout(group2[0].range.startLineNumber);
      widget.restoreComposerFocus();
    }
    this._pruneOrphanedComposerDrafts();
  }
  /**
   * Remove draft entries for comments that no longer exist in any widget.
   * Without this, deleted comments would leave drafts in the map forever.
   */
  _pruneOrphanedComposerDrafts() {
    if (this._composerDraftState.drafts.size === 0 && this._composerDraftState.focusedCommentId === void 0) {
      return;
    }
    const knownCommentIds = /* @__PURE__ */ new Set();
    for (const widget of this._widgets) {
      for (const commentId of widget.getCommentIds()) {
        knownCommentIds.add(commentId);
      }
    }
    for (const commentId of [...this._composerDraftState.drafts.keys()]) {
      if (!knownCommentIds.has(commentId)) {
        this._composerDraftState.drafts.delete(commentId);
      }
    }
    if (this._composerDraftState.focusedCommentId !== void 0 && !knownCommentIds.has(this._composerDraftState.focusedCommentId)) {
      this._composerDraftState.focusedCommentId = void 0;
    }
  }
  _getCommentsForModel(resourceUri, comments) {
    const change = this._getSessionChangeForResource(resourceUri);
    if (!change) {
      return comments.filter((comment) => isEqual2(comment.resourceUri, resourceUri));
    }
    if (!this._isCurrentOrModifiedResource(change, resourceUri)) {
      return [];
    }
    return comments.filter((comment) => comment.resourceUri.fsPath === resourceUri.fsPath);
  }
  _getSessionChangeForResource(resourceUri) {
    if (!this._sessionResource) {
      return void 0;
    }
    const changes = this._sessionsManagementService.getSession(this._sessionResource)?.changes.get();
    if (!changes) {
      return void 0;
    }
    return changes.find((change) => this._changeMatchesFsPath(change, resourceUri));
  }
  _changeMatchesFsPath(change, resourceUri) {
    if (isIChatSessionFileChange2(change)) {
      return change.uri.fsPath === resourceUri.fsPath || change.modifiedUri?.fsPath === resourceUri.fsPath || change.originalUri?.fsPath === resourceUri.fsPath;
    }
    return change.modifiedUri.fsPath === resourceUri.fsPath || change.originalUri?.fsPath === resourceUri.fsPath;
  }
  _isCurrentOrModifiedResource(change, resourceUri) {
    if (isIChatSessionFileChange2(change)) {
      return isEqual2(change.uri, resourceUri) || (change.modifiedUri ? isEqual2(change.modifiedUri, resourceUri) : false);
    }
    return isEqual2(change.modifiedUri, resourceUri);
  }
  _handleNavigation() {
    if (!this._sessionResource) {
      return;
    }
    const model = this._editor.getModel();
    if (!model) {
      return;
    }
    const comments = getSessionEditorComments(
      this._sessionResource,
      this._agentFeedbackService.getFeedback(this._sessionResource),
      this._codeReviewService.getPRReviewState(this._sessionResource).get(),
      this._agentFeedbackService.getVisibleResolvedFeedbackIds(this._sessionResource)
    );
    const bearing = this._agentFeedbackService.getNavigationBearing(this._sessionResource, comments);
    if (bearing.activeIdx < 0) {
      return;
    }
    const activeFeedback = comments[bearing.activeIdx];
    if (!activeFeedback) {
      return;
    }
    if (this._getCommentsForModel(model.uri, [activeFeedback]).length === 0) {
      for (const widget of this._widgets) {
        widget.collapse();
      }
      return;
    }
    for (const widget of this._widgets) {
      if (widget.containsFeedback(activeFeedback.id)) {
        widget.expand();
        widget.focusFeedback(activeFeedback.id);
      } else {
        widget.collapse();
      }
    }
    const range2 = new Range2(
      activeFeedback.range.startLineNumber,
      1,
      activeFeedback.range.endLineNumber,
      1
    );
    this._editor.revealRangeInCenterIfOutsideViewport(range2, 0 /* Smooth */);
  }
  _clearWidgets() {
    this._captureFocusedComposerCommentId();
    this._widgetListeners.clear();
    for (const widget of this._widgets) {
      widget.dispose();
    }
    this._widgets.length = 0;
  }
  _captureFocusedComposerCommentId() {
    this._composerDraftState.focusedCommentId = void 0;
    if (this._widgets.length === 0) {
      return;
    }
    const activeElement = this._editor.getDomNode()?.ownerDocument.activeElement;
    if (!isHTMLElement(activeElement)) {
      return;
    }
    for (const widget of this._widgets) {
      const commentId = widget.findComposerCommentIdForElement(activeElement);
      if (commentId !== void 0) {
        this._composerDraftState.focusedCommentId = commentId;
        return;
      }
    }
  }
  dispose() {
    this._clearWidgets();
    super.dispose();
  }
};

AgentFeedbackEditorWidgetContribution = __decorateClass([
  __decorateParam(1, IAgentFeedbackService),
  __decorateParam(2, ISessionsManagementService),
  __decorateParam(3, ICodeReviewService),
  __decorateParam(4, IInstantiationService)
], AgentFeedbackEditorWidgetContribution);

registerEditorContribution(AgentFeedbackEditorWidgetContribution.ID, AgentFeedbackEditorWidgetContribution, 3 /* Eventually */);
export { AgentFeedbackEditorWidgetContribution };
