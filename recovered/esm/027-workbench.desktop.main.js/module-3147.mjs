// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/scm/browser/scmAccessibilityHelp.ts
import { ContextKeyExpr } from "./module-0089.mjs";
import { FocusedViewContext, SidebarFocusContext } from "./module-0949.mjs";
import { HISTORY_VIEW_PANE_ID, ISCMViewService, REPOSITORIES_VIEW_PANE_ID, VIEW_PANE_ID } from "./module-1080.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IViewsService } from "./module-1246.mjs";
import { Disposable } from "./module-0012.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";


// src/vs/workbench/contrib/scm/browser/scmAccessibilityHelp.ts
var SCMAccessibilityHelp = class {
  constructor() {
    this.name = "scm";
    this.type = "help" /* Help */;
    this.priority = 100;
    this.when = ContextKeyExpr.or(
      ContextKeyExpr.and(ContextKeyExpr.equals("activeViewlet", "workbench.view.scm"), SidebarFocusContext),
      ContextKeyExpr.equals(FocusedViewContext.key, REPOSITORIES_VIEW_PANE_ID),
      ContextKeyExpr.equals(FocusedViewContext.key, VIEW_PANE_ID),
      ContextKeyExpr.equals(FocusedViewContext.key, HISTORY_VIEW_PANE_ID)
    );
  }
  getProvider(accessor) {
    const commandService = accessor.get(ICommandService);
    const scmViewService = accessor.get(ISCMViewService);
    const viewsService = accessor.get(IViewsService);
    return new SCMAccessibilityHelpContentProvider(commandService, scmViewService, viewsService);
  }
};

var SCMAccessibilityHelpContentProvider = class extends Disposable {
  constructor(_commandService, _scmViewService, _viewsService) {
    super();
    this._commandService = _commandService;
    this._scmViewService = _scmViewService;
    this._viewsService = _viewsService;
    this.id = "scm" /* SourceControl */;
    this.verbositySettingKey = "accessibility.verbosity.sourceControl" /* SourceControl */;
    this.options = { type: "help" /* Help */ };
    this._focusedView = this._viewsService.getFocusedViewName();
  }
  onClose() {
    switch (this._focusedView) {
      case "Source Control":
        this._commandService.executeCommand("workbench.scm");
        break;
      case "Source Control Repositories":
        this._commandService.executeCommand("workbench.scm.repositories");
        break;
      case "Source Control Graph":
        this._commandService.executeCommand("workbench.scm.history");
        break;
      default:
        this._commandService.executeCommand("workbench.view.scm");
    }
  }
  provideContent() {
    const content2 = [];
    if (this._scmViewService.visibleRepositories.length > 1) {
      const repositoryList = this._scmViewService.visibleRepositories.map((r2) => r2.provider.name).join(", ");
      content2.push(localize(18865, null, repositoryList));
    }
    const focusedRepository = this._scmViewService.focusedRepository;
    if (focusedRepository) {
      content2.push(localize(18866, null, focusedRepository.provider.name));
      const currentHistoryItemRef = focusedRepository.provider.historyProvider.get()?.historyItemRef.get();
      if (currentHistoryItemRef) {
        content2.push(localize(18867, null, currentHistoryItemRef.name));
      }
      if (focusedRepository.input.visible && focusedRepository.input.enabled && focusedRepository.input.value !== "") {
        content2.push(localize(18868, null, focusedRepository.input.value));
      }
      const actionButton = focusedRepository.provider.actionButton.get();
      if (actionButton) {
        const label3 = actionButton.command.tooltip ?? actionButton.command.title;
        const enablementLabel = actionButton.enabled ? localize(18848, null) : localize(18847, null);
        content2.push(localize(18869, null, label3, enablementLabel));
      }
      const resourceGroups = [];
      for (const resourceGroup of focusedRepository.provider.groups) {
        resourceGroups.push(`${resourceGroup.label} (${resourceGroup.resources.length} resource(s))`);
      }
      focusedRepository.provider.groups.map((g) => g.label).join(", ");
      content2.push(localize(18870, null, resourceGroups.join(", ")));
    }
    content2.push(localize(18859, null));
    content2.push(localize(18860, null));
    content2.push(localize(18861, null));
    content2.push(localize(18862, null));
    content2.push(localize(18863, null));
    content2.push(localize(18864, null));
    content2.push(localize(18854, null));
    content2.push(localize(18855, null));
    content2.push(localize(18856, null));
    content2.push(localize(18857, null));
    content2.push(localize(18858, null));
    content2.push(localize(18849, null));
    content2.push(localize(18850, null));
    content2.push(localize(18851, null));
    content2.push(localize(18852, null));
    content2.push(localize(18853, null));
    return content2.join("\n");
  }
};

SCMAccessibilityHelpContentProvider = __decorateClass([
  __decorateParam(0, ICommandService),
  __decorateParam(1, ISCMViewService),
  __decorateParam(2, IViewsService)
], SCMAccessibilityHelpContentProvider);
export { SCMAccessibilityHelp, SCMAccessibilityHelpContentProvider };
