// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/planReviewFeedback/planReviewFeedbackEditorOverlay.ts
import { Action2, MenuId, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { EditorResourceAccessor } from "./module-0925.mjs";
import { URI } from "./module-0032.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IEditorGroupsService } from "./module-0933.mjs";
import { resolveCommandsContext } from "./module-1537.mjs";
import { IListService } from "./module-0636.mjs";
import { IPlanReviewFeedbackService } from "./module-2137.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { CHAT_CATEGORY } from "./module-1476.mjs";
import { ChatContextKeys } from "./module-0965.mjs";
import { Disposable, DisposableMap, combinedDisposable, toDisposable } from "./module-0012.mjs";
import { AgentEditorCommentsOverlayWidget } from "./module-2797.mjs";
import { observableSignalFromEvent } from "./module-0062.mjs";
import { Event2 } from "./module-0017.mjs";
import { autorun } from "./module-0052.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { EditorGroupView } from "./module-1584.mjs";
import { ServiceCollection } from "./module-0440.mjs";
import { IWorkbenchEnvironmentService } from "./module-0935.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0870.mjs";


// src/vs/workbench/contrib/chat/browser/planReviewFeedback/planReviewFeedbackEditorOverlay.ts
var PlanReviewFeedbackEditorMenu = MenuId.for("planReviewFeedback.editorContent");

var hasPlanReviewFeedback = new RawContextKey("planReviewFeedback.hasFeedback", false);

var submitPlanReviewFeedbackActionId = "planReviewFeedback.action.submit";

var navigatePreviousPlanReviewFeedbackActionId = "planReviewFeedback.action.navigatePrevious";

var navigateNextPlanReviewFeedbackActionId = "planReviewFeedback.action.navigateNext";

var clearAllPlanReviewFeedbackActionId = "planReviewFeedback.action.clearAll";

var navigationBearingFakeActionId2 = "planReviewFeedback.navigation.bearings";

function getPlanReviewResource(input, feedbackService) {
  const resources = EditorResourceAccessor.getOriginalUri(input, { supportSideBySide: 3 /* BOTH */ });
  if (!resources) {
    return void 0;
  }
  if (URI.isUri(resources)) {
    return feedbackService.isActivePlanReview(resources) ? resources : void 0;
  }
  return [resources.secondary, resources.primary].find((resource) => resource && feedbackService.isActivePlanReview(resource));
}

function getPlanReviewFromContext(accessor, args2) {
  const editorService = accessor.get(IEditorService);
  const editorGroupsService = accessor.get(IEditorGroupsService);
  const resolvedContext = resolveCommandsContext(args2, editorService, editorGroupsService, accessor.get(IListService));
  const groupedEditor = resolvedContext.groupedEditors[0];
  const group2 = groupedEditor?.group;
  const input = groupedEditor?.editors[0] ?? group2?.activeEditor;
  const resource = getPlanReviewResource(input, accessor.get(IPlanReviewFeedbackService));
  return group2 && resource ? { resource, group: group2 } : void 0;
}

var SubmitPlanReviewFeedbackAction = class extends Action2 {
  constructor() {
    super({
      id: submitPlanReviewFeedbackActionId,
      title: localize2(11348, "Submit Feedback"),
      shortTitle: localize2(11349, "Submit"),
      icon: Codicon.send,
      category: CHAT_CATEGORY,
      precondition: ChatContextKeys.enabled,
      menu: {
        id: PlanReviewFeedbackEditorMenu,
        group: "a_submit",
        order: 0,
        when: ContextKeyExpr.and(ChatContextKeys.enabled, hasPlanReviewFeedback)
      }
    });
  }
  async run(accessor, ...args2) {
    const review = getPlanReviewFromContext(accessor, args2);
    if (!review) {
      return false;
    }
    return accessor.get(IPlanReviewFeedbackService).submitAllFeedback(review.resource);
  }
};

var NavigatePlanReviewFeedbackAction = class extends Action2 {
  constructor(_next) {
    super({
      id: _next ? navigateNextPlanReviewFeedbackActionId : navigatePreviousPlanReviewFeedbackActionId,
      title: _next ? localize2(11346, "Go to Next Feedback Comment") : localize2(11347, "Go to Previous Feedback Comment"),
      icon: _next ? Codicon.arrowDown : Codicon.arrowUp,
      category: CHAT_CATEGORY,
      f1: true,
      precondition: ContextKeyExpr.and(ChatContextKeys.enabled, hasPlanReviewFeedback),
      menu: {
        id: PlanReviewFeedbackEditorMenu,
        group: "navigate",
        order: _next ? 2 : 1,
        when: ContextKeyExpr.and(ChatContextKeys.enabled, hasPlanReviewFeedback)
      }
    });
    this._next = _next;
  }
  async run(accessor, ...args2) {
    const review = getPlanReviewFromContext(accessor, args2);
    if (!review) {
      return;
    }
    const item = accessor.get(IPlanReviewFeedbackService).getNextFeedback(review.resource, this._next);
    if (item) {
      await accessor.get(IEditorService).openEditor({
        resource: item.resource,
        options: {
          revealIfOpened: true,
          selection: { startLineNumber: item.line, startColumn: item.column }
        }
      }, review.group);
    }
  }
};

var ClearAllPlanReviewFeedbackAction = class extends Action2 {
  constructor() {
    super({
      id: clearAllPlanReviewFeedbackActionId,
      title: localize2(11343, "Clear"),
      tooltip: localize2(11344, "Clear All Feedback"),
      icon: Codicon.clearAll,
      category: CHAT_CATEGORY,
      f1: true,
      precondition: ContextKeyExpr.and(ChatContextKeys.enabled, hasPlanReviewFeedback),
      menu: {
        id: PlanReviewFeedbackEditorMenu,
        group: "a_submit",
        order: 1,
        when: ContextKeyExpr.and(ChatContextKeys.enabled, hasPlanReviewFeedback)
      }
    });
  }
  run(accessor, ...args2) {
    const review = getPlanReviewFromContext(accessor, args2);
    if (review) {
      accessor.get(IPlanReviewFeedbackService).clearFeedback(review.resource);
    }
  }
};

var PlanReviewFeedbackOverlayController = class extends Disposable {
  constructor(container3, group2, feedbackService, instantiationService, contextKeyService) {
    super();
    const domNode = document.createElement("div");
    domNode.classList.add("plan-review-feedback-editor-overlay");
    domNode.style.position = "absolute";
    domNode.style.bottom = "24px";
    domNode.style.right = "24px";
    domNode.style.zIndex = "100";
    this._register(toDisposable(() => domNode.remove()));
    const widget = this._register(instantiationService.createInstance(AgentEditorCommentsOverlayWidget, {
      menuId: PlanReviewFeedbackEditorMenu,
      submitActionId: submitPlanReviewFeedbackActionId,
      previousActionId: navigatePreviousPlanReviewFeedbackActionId,
      nextActionId: navigateNextPlanReviewFeedbackActionId,
      navigationBearingActionId: navigationBearingFakeActionId2,
      telemetrySource: "planReviewFeedback.overlayToolbar"
    }));
    domNode.appendChild(widget.getDomNode());
    const hasFeedbackContext = hasPlanReviewFeedback.bindTo(contextKeyService);
    const activeSignal = observableSignalFromEvent(
      this,
      Event2.any(
        group2.onDidActiveEditorChange,
        group2.onDidModelChange,
        feedbackService.onDidChangeFeedback,
        feedbackService.onDidChangeNavigation,
        feedbackService.onDidChangeRegistrations
      )
    );
    this._register(autorun((reader) => {
      activeSignal.read(reader);
      const resource = getPlanReviewResource(group2.activeEditorPane?.input, feedbackService);
      const count2 = resource ? feedbackService.getFeedback(resource).length : 0;
      hasFeedbackContext.set(count2 > 0);
      if (!resource || count2 === 0) {
        widget.hide();
        domNode.remove();
        return;
      }
      widget.show(feedbackService.getNavigationBearing(resource), count2, group2);
      if (!container3.contains(domNode)) {
        container3.appendChild(domNode);
      }
    }));
  }
};

PlanReviewFeedbackOverlayController = __decorateClass([
  __decorateParam(2, IPlanReviewFeedbackService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IContextKeyService)
], PlanReviewFeedbackOverlayController);

var PlanReviewFeedbackEditorOverlay = class extends Disposable {
  static {
    this.ID = "chat.planReviewFeedback.editorOverlay";
  }
  constructor(editorGroupsService, instantiationService, environmentService) {
    super();
    if (environmentService.isSessionsWindow) {
      return;
    }
    const editorGroups = observableFromEvent(
      this,
      Event2.any(editorGroupsService.onDidAddGroup, editorGroupsService.onDidRemoveGroup),
      () => editorGroupsService.groups
    );
    const overlays = this._register(new DisposableMap());
    this._register(autorun((reader) => {
      const groups = editorGroups.read(reader);
      const toDelete = new Set(overlays.keys());
      for (const group2 of groups) {
        if (!(group2 instanceof EditorGroupView)) {
          continue;
        }
        toDelete.delete(group2);
        if (!overlays.has(group2)) {
          const scopedInstantiationService = instantiationService.createChild(
            new ServiceCollection([IContextKeyService, group2.scopedContextKeyService])
          );
          const controller = scopedInstantiationService.createInstance(PlanReviewFeedbackOverlayController, group2.element, group2);
          overlays.set(group2, combinedDisposable(controller, scopedInstantiationService));
        }
      }
      for (const group2 of toDelete) {
        overlays.deleteAndDispose(group2);
      }
    }));
  }
};

PlanReviewFeedbackEditorOverlay = __decorateClass([
  __decorateParam(0, IEditorGroupsService),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IWorkbenchEnvironmentService)
], PlanReviewFeedbackEditorOverlay);

registerAction2(SubmitPlanReviewFeedbackAction);

registerAction2(class extends NavigatePlanReviewFeedbackAction {
  constructor() {
    super(false);
  }
});

registerAction2(class extends NavigatePlanReviewFeedbackAction {
  constructor() {
    super(true);
  }
});

registerAction2(ClearAllPlanReviewFeedbackAction);

MenuRegistry.appendMenuItem(PlanReviewFeedbackEditorMenu, {
  command: {
    id: navigationBearingFakeActionId2,
    title: localize(11345, null),
    precondition: ContextKeyExpr.false()
  },
  group: "navigate",
  order: -1,
  when: ContextKeyExpr.and(ChatContextKeys.enabled, hasPlanReviewFeedback)
});

registerWorkbenchContribution2(PlanReviewFeedbackEditorOverlay.ID, PlanReviewFeedbackEditorOverlay, WorkbenchPhase.AfterRestored);
export { getPlanReviewResource, getPlanReviewFromContext, PlanReviewFeedbackEditorMenu, hasPlanReviewFeedback, submitPlanReviewFeedbackActionId, navigatePreviousPlanReviewFeedbackActionId, navigateNextPlanReviewFeedbackActionId, clearAllPlanReviewFeedbackActionId, navigationBearingFakeActionId2, SubmitPlanReviewFeedbackAction, NavigatePlanReviewFeedbackAction, ClearAllPlanReviewFeedbackAction, PlanReviewFeedbackOverlayController, PlanReviewFeedbackEditorOverlay };
