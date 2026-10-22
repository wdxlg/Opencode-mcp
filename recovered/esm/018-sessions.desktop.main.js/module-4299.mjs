// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/agentFeedback/browser/agentFeedbackEditorOverlay.ts
import { EmptyFileEditorInput } from "./module-3767.mjs";
import { getActiveResourceCandidates, getFeedbackSessionCandidates } from "./module-3587.mjs";
import { DisposableMap, DisposableStore, combinedDisposable, toDisposable } from "./module-0012.mjs";
import { AgentEditorCommentsOverlayWidget } from "./module-2772.mjs";
import { Menus } from "./module-3437.mjs";
import { hasSessionEditorComments, hasUnsubmittedAgentFeedback, navigateNextFeedbackActionId, navigatePreviousFeedbackActionId, navigationBearingFakeActionId3, submitFeedbackActionId } from "./module-4298.mjs";
import { observableSignalFromEvent } from "./module-0062.mjs";
import { Event2 } from "./module-0017.mjs";
import { autorun } from "./module-0052.mjs";
import { getAcceptedAgentFeedbackCommentCount, getSessionEditorComments } from "./module-3609.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentFeedbackService } from "./module-3611.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { ICodeReviewService } from "./module-3608.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { EditorGroupView } from "./module-2019.mjs";
import { ServiceCollection } from "./module-0440.mjs";
import { IEditorGroupsService } from "./module-0934.mjs";


// src/vs/sessions/contrib/agentFeedback/browser/agentFeedbackEditorOverlay.ts
function getAgentFeedbackOverlayResourceCandidates(input) {
  return input instanceof EmptyFileEditorInput ? [] : getActiveResourceCandidates(input);
}

var AgentFeedbackOverlayController = class {
  constructor(group2, agentFeedbackService, instaService, contextKeyService, codeReviewService) {
    this._store = new DisposableStore();
    this._domNode = document.createElement("div");
    const container2 = group2.editorPaneContainer;
    container2.classList.add("agent-feedback-editor-overlay-host");
    this._store.add(toDisposable(() => container2.classList.remove("agent-feedback-editor-overlay-host")));
    this._domNode.classList.add("agent-feedback-editor-overlay");
    this._domNode.style.position = "absolute";
    this._domNode.style.bottom = "24px";
    this._domNode.style.right = "24px";
    this._domNode.style.zIndex = "100";
    const widget = this._store.add(instaService.createInstance(AgentEditorCommentsOverlayWidget, {
      menuId: Menus.AgentFeedbackEditorContent,
      submitActionId: submitFeedbackActionId,
      previousActionId: navigatePreviousFeedbackActionId,
      nextActionId: navigateNextFeedbackActionId,
      navigationBearingActionId: navigationBearingFakeActionId3,
      telemetrySource: "agentFeedback.overlayToolbar"
    }));
    this._domNode.appendChild(widget.getDomNode());
    this._store.add(toDisposable(() => this._domNode.remove()));
    const hasCommentsContext = hasSessionEditorComments.bindTo(contextKeyService);
    const hasAgentFeedbackContext = hasUnsubmittedAgentFeedback.bindTo(contextKeyService);
    const show3 = () => {
      if (!container2.contains(this._domNode)) {
        container2.appendChild(this._domNode);
      }
    };
    const hide4 = () => {
      if (container2.contains(this._domNode)) {
        widget.hide();
        this._domNode.remove();
      }
    };
    const activeSignal = observableSignalFromEvent(this, Event2.any(
      group2.onDidActiveEditorChange,
      group2.onDidModelChange,
      agentFeedbackService.onDidChangeFeedback,
      agentFeedbackService.onDidChangeFeedbackVisibility,
      agentFeedbackService.onDidChangeNavigation,
      agentFeedbackService.onDidChangeFeedbackScope
    ));
    this._store.add(autorun((r2) => {
      activeSignal.read(r2);
      const activeInput = group2.activeEditorPane?.input;
      const candidates = getAgentFeedbackOverlayResourceCandidates(activeInput);
      let navigationBearings = void 0;
      let acceptedFeedbackCount = 0;
      for (const { sessionResource } of getFeedbackSessionCandidates(candidates, (candidate) => agentFeedbackService.getFeedbackSessionResource(candidate))) {
        const comments = getSessionEditorComments(
          sessionResource,
          agentFeedbackService.getFeedback(sessionResource),
          codeReviewService.getPRReviewState(sessionResource).read(r2),
          agentFeedbackService.getVisibleResolvedFeedbackIds(sessionResource)
        );
        if (comments.length > 0) {
          navigationBearings = agentFeedbackService.getNavigationBearing(sessionResource, comments);
          acceptedFeedbackCount = getAcceptedAgentFeedbackCommentCount(comments);
          break;
        }
      }
      if (!navigationBearings) {
        hasCommentsContext.set(false);
        hasAgentFeedbackContext.set(false);
        hide4();
        return;
      }
      hasCommentsContext.set(true);
      hasAgentFeedbackContext.set(acceptedFeedbackCount > 0);
      widget.show(navigationBearings, acceptedFeedbackCount, group2);
      show3();
    }));
  }
  dispose() {
    this._store.dispose();
  }
};

AgentFeedbackOverlayController = __decorateClass([
  __decorateParam(1, IAgentFeedbackService),
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, ICodeReviewService)
], AgentFeedbackOverlayController);

var AgentFeedbackEditorOverlay = class {
  constructor(editorGroupsService, instantiationService) {
    this._store = new DisposableStore();
    const editorGroups = observableFromEvent(
      this,
      Event2.any(editorGroupsService.onDidAddGroup, editorGroupsService.onDidRemoveGroup),
      () => editorGroupsService.groups
    );
    const overlayWidgets = this._store.add(new DisposableMap());
    this._store.add(autorun((r2) => {
      const groups = editorGroups.read(r2);
      const toDelete = new Set(overlayWidgets.keys());
      for (const group2 of groups) {
        if (!(group2 instanceof EditorGroupView)) {
          continue;
        }
        toDelete.delete(group2);
        if (!overlayWidgets.has(group2)) {
          const scopedInstaService = instantiationService.createChild(
            new ServiceCollection([IContextKeyService, group2.scopedContextKeyService])
          );
          const ctrl = scopedInstaService.createInstance(AgentFeedbackOverlayController, group2);
          overlayWidgets.set(group2, combinedDisposable(ctrl, scopedInstaService));
        }
      }
      for (const group2 of toDelete) {
        overlayWidgets.deleteAndDispose(group2);
      }
    }));
  }
  static {
    this.ID = "chat.agentFeedback.editorOverlay";
  }
  dispose() {
    this._store.dispose();
  }
};

AgentFeedbackEditorOverlay = __decorateClass([
  __decorateParam(0, IEditorGroupsService),
  __decorateParam(1, IInstantiationService)
], AgentFeedbackEditorOverlay);
export { getAgentFeedbackOverlayResourceCandidates, AgentFeedbackOverlayController, AgentFeedbackEditorOverlay };
