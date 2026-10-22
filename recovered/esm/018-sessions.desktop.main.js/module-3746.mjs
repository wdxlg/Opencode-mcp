// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/changes/browser/changes.contribution.ts
import { Disposable } from "./module-0012.mjs";
import { Registry } from "./module-0090.mjs";
import { EditorExtensions } from "./module-0926.mjs";
import { EditorPaneDescriptor } from "./module-1085.mjs";
import { SessionChangesEditor } from "./module-3739.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { SyncDescriptor } from "./module-0134.mjs";
import { SessionChangesEditorInput, SessionChangesEditorSerializer } from "./module-3586.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentWorkbenchLayoutService } from "./module-3474.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";
import { AccessibleViewRegistry } from "./module-0693.mjs";
import { SessionsChangesAccessibilityHelp } from "./module-3745.mjs";
import { registerIcon } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";
import { Extensions13 } from "./module-1094.mjs";
import { CHANGES_VIEW_CONTAINER_ID, CHANGES_VIEW_ID, SESSIONS_CHANGES_OPEN_SINGLE_FILE_DIFF_SETTING } from "./module-3620.mjs";
import { ChangesViewPane, ChangesViewPaneContainer, SinglePaneChangesViewPane } from "./module-3737.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { IsPhoneLayoutContext, SessionHasWorkspaceContext } from "./module-1770.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { IChangesViewService } from "./module-3645.mjs";
import { ChangesViewService } from "./module-3743.mjs";
import { ISessionChangesService, SessionChangesService } from "./module-3646.mjs";


// src/vs/sessions/contrib/changes/browser/changes.contribution.ts
var SinglePaneChangesEditorContribution = class extends Disposable {
  static {
    this.ID = "workbench.contrib.sessions.singlePaneChangesEditor";
  }
  constructor(layoutService) {
    super();
    if (!layoutService.isSinglePaneLayoutEnabled) {
      return;
    }
    this._register(Registry.as(EditorExtensions.EditorPane).registerEditorPane(
      EditorPaneDescriptor.create(SessionChangesEditor, SessionChangesEditor.ID, localize(4251, null)),
      [new SyncDescriptor(SessionChangesEditorInput)]
    ));
    this._register(Registry.as(EditorExtensions.EditorFactory).registerEditorSerializer(
      SessionChangesEditorInput.ID,
      SessionChangesEditorSerializer
    ));
  }
};

SinglePaneChangesEditorContribution = __decorateClass([
  __decorateParam(0, IAgentWorkbenchLayoutService)
], SinglePaneChangesEditorContribution);

registerWorkbenchContribution2(SinglePaneChangesEditorContribution.ID, SinglePaneChangesEditorContribution, WorkbenchPhase.BlockStartup);

AccessibleViewRegistry.register(new SessionsChangesAccessibilityHelp());

var changesViewIcon = registerIcon("changes-view-icon", Codicon.gitCompare, localize2(4249, "View icon for the Changes view.").value);

var viewContainersRegistry2 = Registry.as(Extensions13.ViewContainersRegistry);

var changesViewContainer = viewContainersRegistry2.registerViewContainer({
  id: CHANGES_VIEW_CONTAINER_ID,
  title: localize2(4248, "Changes"),
  icon: changesViewIcon,
  order: 10,
  ctorDescriptor: new SyncDescriptor(ChangesViewPaneContainer),
  storageId: CHANGES_VIEW_CONTAINER_ID,
  hideIfEmpty: true,
  openCommandActionDescriptor: {
    id: CHANGES_VIEW_CONTAINER_ID,
    mnemonicTitle: localize(4250, null),
    keybindings: {
      primary: 0,
      win: { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 37 /* KeyG */ },
      linux: { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 37 /* KeyG */ },
      mac: { primary: 256 /* WinCtrl */ | 1024 /* Shift */ | 37 /* KeyG */ }
    },
    order: 1
  },
  windowEnablement: 2 /* Sessions */
}, 2 /* AuxiliaryBar */);

var viewsRegistry5 = Registry.as(Extensions13.ViewsRegistry);

var changesViewWhen = ContextKeyExpr.and(IsPhoneLayoutContext.negate(), SessionHasWorkspaceContext);

var ChangesViewContribution = class extends Disposable {
  static {
    this.ID = "workbench.contrib.sessions.changesView";
  }
  constructor(layoutService) {
    super();
    const ctor = layoutService.isSinglePaneLayoutEnabled ? SinglePaneChangesViewPane : ChangesViewPane;
    viewsRegistry5.registerViews([{
      id: CHANGES_VIEW_ID,
      name: localize2(4248, "Changes"),
      containerIcon: changesViewIcon,
      ctorDescriptor: new SyncDescriptor(ctor),
      canToggleVisibility: false,
      canMoveView: false,
      weight: 100,
      order: 1,
      when: changesViewWhen,
      windowEnablement: 2 /* Sessions */
    }], changesViewContainer);
  }
};

ChangesViewContribution = __decorateClass([
  __decorateParam(0, IAgentWorkbenchLayoutService)
], ChangesViewContribution);

registerWorkbenchContribution2(ChangesViewContribution.ID, ChangesViewContribution, WorkbenchPhase.BlockStartup);

Registry.as(Extensions4.Configuration).registerConfiguration({
  id: "sessions",
  properties: {
    [SESSIONS_CHANGES_OPEN_SINGLE_FILE_DIFF_SETTING]: {
      type: "boolean",
      tags: ["preview"],
      description: localize(4252, null),
      default: false
    }
  }
});

registerSingleton(IChangesViewService, ChangesViewService, 1 /* Delayed */);

registerSingleton(ISessionChangesService, SessionChangesService, 1 /* Delayed */);
export { SinglePaneChangesEditorContribution, changesViewIcon, viewContainersRegistry2, changesViewContainer, viewsRegistry5, changesViewWhen, ChangesViewContribution };
