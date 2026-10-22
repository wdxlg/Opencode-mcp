// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/editor/browser/addTabActions.ts
import { ContextKeyExpr } from "./module-0089.mjs";
import { EditorTabsVisibleContext, IsAuxiliaryWindowContext, IsSessionsWindowContext, IsTopRightEditorGroupContext } from "./module-0950.mjs";
import { IsQuickChatSessionContext, SessionIsCreatedContext, SinglePaneChangesTabAvailableContext, SinglePaneChangesTabMissingContext, SinglePaneFilesTabAvailableContext, SinglePaneFilesTabMissingContext } from "./module-1770.mjs";
import { Action2 } from "./module-0092.mjs";
import { NEW_FILE_TAB_COMMAND_ID } from "./module-1800.mjs";
import { localize2 } from "./module-0001.mjs";
import { SessionsCategories } from "./module-3532.mjs";
import { Codicon } from "./module-0085.mjs";
import { Menus } from "./module-3437.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IEditorGroupsService } from "./module-0934.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { EmptyFileEditorInput } from "./module-3767.mjs";
import { IBrowserViewWorkbenchService } from "./module-1243.mjs";
import { generateUuid } from "./module-0190.mjs";
import { openNewSearchEditor } from "./module-2819.mjs";
import { ISessionChangesService } from "./module-3646.mjs";


// src/vs/sessions/contrib/editor/browser/addTabActions.ts
var NEW_BROWSER_TAB_COMMAND_ID = "workbench.action.agentSessions.newBrowserTab";

var NEW_SEARCH_TAB_COMMAND_ID = "workbench.action.agentSessions.newSearchTab";

var NEW_CHANGES_TAB_COMMAND_ID = "workbench.action.agentSessions.newChangesTab";

var addTabActionWhen = ContextKeyExpr.and(
  IsSessionsWindowContext,
  IsAuxiliaryWindowContext.toNegated()
);

var addTabLayoutWhen = ContextKeyExpr.and(
  addTabActionWhen,
  IsTopRightEditorGroupContext
);

var singleEditorTitleWhen = EditorTabsVisibleContext.negate();

var changesTabActionWhen = ContextKeyExpr.and(
  addTabActionWhen,
  SessionIsCreatedContext,
  SinglePaneChangesTabAvailableContext
);

var filesTabActionWhen = ContextKeyExpr.and(
  addTabActionWhen,
  SinglePaneFilesTabAvailableContext
);

var searchTabActionWhen = ContextKeyExpr.and(
  addTabActionWhen,
  IsQuickChatSessionContext.negate()
);

var NewFileTabAction = class extends Action2 {
  constructor() {
    super({
      id: NEW_FILE_TAB_COMMAND_ID,
      title: localize2(4759, "Files"),
      category: SessionsCategories.Sessions,
      icon: Codicon.newFile,
      f1: true,
      precondition: filesTabActionWhen,
      keybinding: {
        weight: 250 /* SessionsContrib */,
        when: filesTabActionWhen,
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 35 /* KeyE */
      },
      menu: {
        id: Menus.SessionsEditorTabsBarAddTab,
        group: "navigation",
        order: 1,
        // Only offer when the Files tab is not already shown.
        when: ContextKeyExpr.and(
          addTabLayoutWhen,
          SinglePaneFilesTabAvailableContext,
          ContextKeyExpr.or(singleEditorTitleWhen, SinglePaneFilesTabMissingContext)
        )
      }
    });
  }
  async run(accessor) {
    const editorService = accessor.get(IEditorService);
    const editorGroupsService = accessor.get(IEditorGroupsService);
    const instantiationService = accessor.get(IInstantiationService);
    const sessionsService = accessor.get(ISessionsService);
    const group2 = editorGroupsService.mainPart.activeGroup;
    const workspace = sessionsService.activeSession.get()?.workspace.get();
    await editorService.openEditor(instantiationService.createInstance(EmptyFileEditorInput, workspace), { pinned: true, index: group2.count }, group2);
  }
};

var NewBrowserTabAction = class extends Action2 {
  constructor() {
    super({
      id: NEW_BROWSER_TAB_COMMAND_ID,
      title: localize2(4757, "Browser"),
      category: SessionsCategories.Sessions,
      icon: Codicon.globe,
      f1: true,
      precondition: addTabActionWhen,
      keybinding: {
        weight: 250 /* SessionsContrib */,
        when: addTabActionWhen,
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 32 /* KeyB */
      },
      menu: {
        id: Menus.SessionsEditorTabsBarAddTab,
        group: "navigation",
        order: 2,
        when: addTabLayoutWhen
      }
    });
  }
  async run(accessor) {
    const browserViewWorkbenchService = accessor.get(IBrowserViewWorkbenchService);
    const editorService = accessor.get(IEditorService);
    const browserInput = browserViewWorkbenchService.getOrCreateLazy({ id: generateUuid() });
    await editorService.openEditor(browserInput);
  }
};

var NewSearchTabAction = class extends Action2 {
  constructor() {
    super({
      id: NEW_SEARCH_TAB_COMMAND_ID,
      title: localize2(4760, "Search"),
      category: SessionsCategories.Sessions,
      icon: Codicon.search,
      f1: true,
      precondition: searchTabActionWhen,
      keybinding: {
        weight: 250 /* SessionsContrib */,
        when: searchTabActionWhen,
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 36 /* KeyF */
      },
      menu: {
        id: Menus.SessionsEditorTabsBarAddTab,
        group: "navigation",
        order: 3,
        when: ContextKeyExpr.and(addTabLayoutWhen, IsQuickChatSessionContext.negate())
      }
    });
  }
  async run(accessor) {
    const instantiationService = accessor.get(IInstantiationService);
    await instantiationService.invokeFunction(openNewSearchEditor, { location: "new" });
  }
};

var NewChangesTabAction = class extends Action2 {
  constructor() {
    super({
      id: NEW_CHANGES_TAB_COMMAND_ID,
      title: localize2(4758, "Changes"),
      category: SessionsCategories.Sessions,
      icon: Codicon.gitCompare,
      f1: false,
      precondition: changesTabActionWhen,
      keybinding: {
        weight: 250 /* SessionsContrib */,
        when: changesTabActionWhen,
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 37 /* KeyG */,
        mac: { primary: 256 /* WinCtrl */ | 1024 /* Shift */ | 37 /* KeyG */ }
      },
      menu: {
        id: Menus.SessionsEditorTabsBarAddTab,
        group: "navigation",
        order: 0,
        // Only offer when the session has a Changes editor but its tab is closed.
        when: ContextKeyExpr.and(
          addTabLayoutWhen,
          SinglePaneChangesTabAvailableContext,
          ContextKeyExpr.or(singleEditorTitleWhen, SinglePaneChangesTabMissingContext)
        )
      }
    });
  }
  async run(accessor) {
    const editorGroupsService = accessor.get(IEditorGroupsService);
    const sessionsService = accessor.get(ISessionsService);
    const sessionChangesService = accessor.get(ISessionChangesService);
    const session = sessionsService.activeSession.get();
    if (session?.isCreated.get()) {
      const group2 = editorGroupsService.mainPart.activeGroup;
      await sessionChangesService.openChangesEditor(session.resource, { index: group2.count }, group2);
    }
  }
};
export { NEW_BROWSER_TAB_COMMAND_ID, NEW_SEARCH_TAB_COMMAND_ID, NEW_CHANGES_TAB_COMMAND_ID, addTabActionWhen, addTabLayoutWhen, singleEditorTitleWhen, changesTabActionWhen, filesTabActionWhen, searchTabActionWhen, NewFileTabAction, NewBrowserTabAction, NewSearchTabAction, NewChangesTabAction };
