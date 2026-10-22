// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/scm/browser/scm.contribution.ts
import { ModesRegistry } from "./module-0141.mjs";
import { registerIcon } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions13 } from "./module-1093.mjs";
import { HISTORY_VIEW_PANE_ID, ISCMService, ISCMViewService, REPOSITORIES_VIEW_PANE_ID, VIEWLET_ID4, VIEW_PANE_ID } from "./module-1080.mjs";
import { SyncDescriptor } from "./module-0134.mjs";
import { SCMViewPaneContainer } from "./module-3137.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { MANAGE_TRUST_COMMAND_ID, WorkspaceTrustContext } from "./module-3144.mjs";
import { ContextKeys, SCMViewPane } from "./module-3142.mjs";
import { SCMRepositoriesViewPane } from "./module-3143.mjs";
import { SCMHistoryViewPane } from "./module-3146.mjs";
import { Extensions10, WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0870.mjs";
import { SCMActiveRepositoryController, SCMActiveResourceContextKeyController } from "./module-3136.mjs";
import { SCMWorkingSetController } from "./module-3145.mjs";
import { SCMHistoryItemContextContribution } from "./module-1467.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { KeybindingsRegistry } from "./module-0091.mjs";
import { getActiveElement, isActiveElement } from "./module-0075.mjs";
import { CommandsRegistry, ICommandService } from "./module-0087.mjs";
import { SCMInputContextKeys } from "./module-3141.mjs";
import { Context } from "./module-0696.mjs";
import { InlineCompletionContextKeys } from "./module-0697.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { IListService, WorkbenchList } from "./module-0636.mjs";
import { isSCMRepository } from "./module-2028.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { RepositoryPicker } from "./module-3140.mjs";
import { Action2, MenuId, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { RemoteNameContext, ResourceContextKey } from "./module-0949.mjs";
import { IViewsService } from "./module-1246.mjs";
import { ChatContextKeys } from "./module-0965.mjs";
import { CHAT_SETUP_SUPPORT_ANONYMOUS_ACTION_ID } from "./module-1476.mjs";
import { product_default } from "./module-0139.mjs";
import { AccessibleViewRegistry } from "./module-0693.mjs";
import { SCMAccessibilityHelp } from "./module-3147.mjs";


// src/vs/workbench/contrib/scm/browser/scm.contribution.ts
ModesRegistry.registerLanguage({
  id: "scminput",
  extensions: [],
  aliases: [],
  // hide from language selector
  mimetypes: ["text/x-scm-input"]
});

var sourceControlViewIcon = registerIcon("source-control-view-icon", Codicon.sourceControl, localize(18846, null));

var viewContainer3 = Registry.as(Extensions13.ViewContainersRegistry).registerViewContainer({
  id: VIEWLET_ID4,
  title: localize2(18842, "Source Control"),
  ctorDescriptor: new SyncDescriptor(SCMViewPaneContainer),
  storageId: "workbench.scm.views.state",
  icon: sourceControlViewIcon,
  alwaysUseContainerInfo: true,
  order: 2,
  hideIfEmpty: true
}, 0 /* Sidebar */, { doNotRegisterOpenCommand: true });

var viewsRegistry5 = Registry.as(Extensions13.ViewsRegistry);

var containerTitle = localize(18845, null);

viewsRegistry5.registerViewWelcomeContent(VIEW_PANE_ID, {
  content: localize(18776, null),
  when: "default"
});

viewsRegistry5.registerViewWelcomeContent(VIEW_PANE_ID, {
  content: localize(18777, null),
  when: ContextKeyExpr.and(ContextKeyExpr.equals("scm.providerCount", 0), WorkspaceTrustContext.IsEnabled, WorkspaceTrustContext.IsTrusted.toNegated())
});

viewsRegistry5.registerViewWelcomeContent(VIEW_PANE_ID, {
  content: `[${localize(18773, null)}](command:${MANAGE_TRUST_COMMAND_ID})`,
  when: ContextKeyExpr.and(ContextKeyExpr.equals("scm.providerCount", 0), WorkspaceTrustContext.IsEnabled, WorkspaceTrustContext.IsTrusted.toNegated())
});

viewsRegistry5.registerViewWelcomeContent(HISTORY_VIEW_PANE_ID, {
  content: localize(18775, null),
  when: ContextKeys.SCMHistoryItemCount.isEqualTo(0)
});

viewsRegistry5.registerViews([{
  id: REPOSITORIES_VIEW_PANE_ID,
  containerTitle,
  name: localize2(18839, "Repositories"),
  singleViewPaneContainerTitle: localize(18844, null),
  ctorDescriptor: new SyncDescriptor(SCMRepositoriesViewPane),
  canToggleVisibility: true,
  hideByDefault: true,
  canMoveView: true,
  weight: 20,
  order: 0,
  when: ContextKeyExpr.and(ContextKeyExpr.has("scm.providerCount"), ContextKeyExpr.notEquals("scm.providerCount", 0)),
  // readonly when = ContextKeyExpr.or(ContextKeyExpr.equals('config.scm.alwaysShowProviders', true), ContextKeyExpr.and(ContextKeyExpr.notEquals('scm.providerCount', 0), ContextKeyExpr.notEquals('scm.providerCount', 1)));
  containerIcon: sourceControlViewIcon
}], viewContainer3);

viewsRegistry5.registerViews([{
  id: VIEW_PANE_ID,
  containerTitle,
  name: localize2(18835, "Changes"),
  singleViewPaneContainerTitle: containerTitle,
  ctorDescriptor: new SyncDescriptor(SCMViewPane),
  canToggleVisibility: true,
  canMoveView: true,
  weight: 40,
  order: 1,
  containerIcon: sourceControlViewIcon,
  openCommandActionDescriptor: {
    id: viewContainer3.id,
    mnemonicTitle: localize(18774, null),
    keybindings: {
      primary: 0,
      win: { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 37 /* KeyG */ },
      linux: { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 37 /* KeyG */ },
      mac: { primary: 256 /* WinCtrl */ | 1024 /* Shift */ | 37 /* KeyG */ }
    },
    order: 2
  }
}], viewContainer3);

viewsRegistry5.registerViews([{
  id: HISTORY_VIEW_PANE_ID,
  containerTitle,
  name: localize2(18838, "Graph"),
  singleViewPaneContainerTitle: localize(18843, null),
  ctorDescriptor: new SyncDescriptor(SCMHistoryViewPane),
  canToggleVisibility: true,
  canMoveView: true,
  weight: 40,
  order: 2,
  when: ContextKeyExpr.and(
    ContextKeyExpr.has("scm.historyProviderCount"),
    ContextKeyExpr.notEquals("scm.historyProviderCount", 0)
  ),
  containerIcon: sourceControlViewIcon
}], viewContainer3);

Registry.as(Extensions10.Workbench).registerWorkbenchContribution(SCMActiveRepositoryController, 3 /* Restored */);

Registry.as(Extensions10.Workbench).registerWorkbenchContribution(SCMActiveResourceContextKeyController, 3 /* Restored */);

registerWorkbenchContribution2(
  SCMWorkingSetController.ID,
  SCMWorkingSetController,
  WorkbenchPhase.AfterRestored
);

registerWorkbenchContribution2(
  SCMHistoryItemContextContribution.ID,
  SCMHistoryItemContextContribution,
  WorkbenchPhase.AfterRestored
);

Registry.as(Extensions4.Configuration).registerConfiguration({
  id: "scm",
  order: 5,
  title: localize(18836, null),
  type: "object",
  scope: 5 /* RESOURCE */,
  properties: {
    "scm.diffDecorations": {
      type: "string",
      enum: ["all", "gutter", "overview", "minimap", "none"],
      enumDescriptions: [
        localize(18797, null),
        localize(18798, null),
        localize(18801, null),
        localize(18799, null),
        localize(18800, null)
      ],
      default: "all",
      description: localize(18763, null)
    },
    "scm.diffDecorationsGutterWidth": {
      type: "number",
      enum: [1, 2, 3, 4, 5],
      default: 3,
      description: localize(18768, null)
    },
    "scm.diffDecorationsGutterVisibility": {
      type: "string",
      enum: ["always", "hover"],
      enumDescriptions: [
        localize(18806, null),
        localize(18807, null)
      ],
      description: localize(18805, null),
      default: "always"
    },
    "scm.diffDecorationsGutterAction": {
      type: "string",
      enum: ["diff", "none"],
      enumDescriptions: [
        localize(18803, null),
        localize(18804, null)
      ],
      description: localize(18802, null),
      default: "diff"
    },
    "scm.diffDecorationsGutterPattern": {
      type: "object",
      description: localize(18765, null),
      additionalProperties: false,
      properties: {
        "added": {
          type: "boolean",
          description: localize(18766, null)
        },
        "modified": {
          type: "boolean",
          description: localize(18767, null)
        }
      },
      default: {
        "added": false,
        "modified": true
      }
    },
    "scm.diffDecorationsIgnoreTrimWhitespace": {
      type: "string",
      enum: ["true", "false", "inherit"],
      enumDescriptions: [
        localize(18810, null),
        localize(18808, null),
        localize(18809, null)
      ],
      description: localize(18764, null),
      default: "false"
    },
    "scm.alwaysShowActions": {
      type: "boolean",
      description: localize(18760, null),
      default: false
    },
    "scm.countBadge": {
      type: "string",
      enum: ["all", "focused", "off"],
      enumDescriptions: [
        localize(18787, null),
        localize(18788, null),
        localize(18789, null)
      ],
      description: localize(18786, null),
      default: "all"
    },
    "scm.providerCountBadge": {
      type: "string",
      enum: ["hidden", "auto", "visible"],
      enumDescriptions: [
        localize(18820, null),
        localize(18819, null),
        localize(18821, null)
      ],
      markdownDescription: localize(18818, null, "`#scm.alwaysShowRepositories#`"),
      default: "hidden"
    },
    "scm.defaultViewMode": {
      type: "string",
      enum: ["tree", "list"],
      enumDescriptions: [
        localize(18792, null),
        localize(18791, null)
      ],
      description: localize(18790, null),
      default: "list"
    },
    "scm.defaultViewSortKey": {
      type: "string",
      enum: ["name", "path", "status"],
      enumDescriptions: [
        localize(18794, null),
        localize(18795, null),
        localize(18796, null)
      ],
      description: localize(18793, null),
      default: "path"
    },
    "scm.autoReveal": {
      type: "boolean",
      description: localize(18762, null),
      default: true
    },
    "scm.inputFontFamily": {
      type: "string",
      markdownDescription: localize(18769, null),
      default: "default"
    },
    "scm.inputFontSize": {
      type: "number",
      markdownDescription: localize(18770, null),
      default: 13
    },
    "scm.inputMaxLineCount": {
      type: "number",
      markdownDescription: localize(18771, null),
      minimum: 1,
      maximum: 50,
      default: 10
    },
    "scm.inputMinLineCount": {
      type: "number",
      markdownDescription: localize(18772, null),
      minimum: 1,
      maximum: 50,
      default: 1
    },
    "scm.alwaysShowRepositories": {
      type: "boolean",
      markdownDescription: localize(18761, null),
      default: false
    },
    "scm.repositories.sortOrder": {
      type: "string",
      enum: ["discovery time", "name", "path"],
      enumDescriptions: [
        localize(18826, null),
        localize(18827, null),
        localize(18828, null)
      ],
      description: localize(18781, null),
      default: "discovery time"
    },
    "scm.repositories.visible": {
      type: "number",
      description: localize(18780, null),
      default: 10
    },
    "scm.repositories.selectionMode": {
      type: "string",
      enum: ["multiple", "single"],
      enumDescriptions: [
        localize(18824, null),
        localize(18825, null)
      ],
      description: localize(18823, null),
      default: "multiple"
    },
    "scm.repositories.explorer": {
      type: "boolean",
      markdownDescription: localize(18822, null, "`#scm.repositories.selectionMode#`", "single"),
      default: false,
      tags: ["experimental"]
    },
    "scm.showActionButton": {
      type: "boolean",
      markdownDescription: localize(18840, null),
      default: true
    },
    "scm.showInputActionButton": {
      type: "boolean",
      markdownDescription: localize(18841, null),
      default: true
    },
    "scm.workingSets.enabled": {
      type: "boolean",
      description: localize(18832, null),
      default: false
    },
    "scm.workingSets.default": {
      type: "string",
      enum: ["empty", "current"],
      enumDescriptions: [
        localize(18831, null),
        localize(18830, null)
      ],
      description: localize(18829, null),
      default: "current"
    },
    "scm.compactFolders": {
      type: "boolean",
      description: localize(18785, null),
      default: true
    },
    "scm.graph.pageOnScroll": {
      type: "boolean",
      description: localize(18814, null),
      default: true
    },
    "scm.graph.pageSize": {
      type: "number",
      description: localize(18815, null),
      minimum: 1,
      maximum: 1e3,
      default: 50
    },
    "scm.graph.badges": {
      type: "string",
      enum: ["all", "filter"],
      enumDescriptions: [
        localize(18812, null),
        localize(18813, null)
      ],
      description: localize(18811, null),
      default: "filter"
    },
    "scm.graph.showIncomingChanges": {
      type: "boolean",
      description: localize(18816, null),
      default: true
    },
    "scm.graph.showOutgoingChanges": {
      type: "boolean",
      description: localize(18817, null),
      default: true
    }
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "scm.acceptInput",
  metadata: { description: localize(18782, null), args: [] },
  weight: 200 /* WorkbenchContrib */,
  when: ContextKeyExpr.has("scmRepository"),
  primary: 2048 /* CtrlCmd */ | 3 /* Enter */,
  handler: (accessor) => {
    const contextKeyService = accessor.get(IContextKeyService);
    const context2 = contextKeyService.getContext(getActiveElement());
    const repositoryId = context2.getValue("scmRepository");
    if (!repositoryId) {
      return Promise.resolve(null);
    }
    const scmService = accessor.get(ISCMService);
    const repository = scmService.getRepository(repositoryId);
    if (!repository?.provider.acceptInputCommand) {
      return Promise.resolve(null);
    }
    const id2 = repository.provider.acceptInputCommand.id;
    const args2 = repository.provider.acceptInputCommand.arguments;
    const commandService = accessor.get(ICommandService);
    return commandService.executeCommand(id2, ...args2 || []);
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "scm.clearValidation",
  weight: 200 /* WorkbenchContrib */,
  when: ContextKeyExpr.and(
    ContextKeyExpr.has("scmRepository"),
    SCMInputContextKeys.SCMInputHasValidationMessage
  ),
  primary: 9 /* Escape */,
  handler: async (accessor) => {
    const scmViewService = accessor.get(ISCMViewService);
    scmViewService.activeRepository.get()?.repository.input.clearValidation();
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "scm.clearInput",
  weight: 200 /* WorkbenchContrib */,
  when: ContextKeyExpr.and(
    ContextKeyExpr.has("scmRepository"),
    Context.Visible.toNegated(),
    InlineCompletionContextKeys.inlineSuggestionVisible.toNegated(),
    SCMInputContextKeys.SCMInputHasValidationMessage.toNegated(),
    EditorContextKeys.hasNonEmptySelection.toNegated()
  ),
  primary: 9 /* Escape */,
  handler: async (accessor) => {
    const scmService = accessor.get(ISCMService);
    const contextKeyService = accessor.get(IContextKeyService);
    const context2 = contextKeyService.getContext(getActiveElement());
    const repositoryId = context2.getValue("scmRepository");
    const repository = repositoryId ? scmService.getRepository(repositoryId) : void 0;
    repository?.input.setValue("", true);
  }
});

var viewNextCommitCommand = {
  description: { description: localize(18783, null), args: [] },
  weight: 200 /* WorkbenchContrib */,
  handler: (accessor) => {
    const contextKeyService = accessor.get(IContextKeyService);
    const scmService = accessor.get(ISCMService);
    const context2 = contextKeyService.getContext(getActiveElement());
    const repositoryId = context2.getValue("scmRepository");
    const repository = repositoryId ? scmService.getRepository(repositoryId) : void 0;
    repository?.input.showNextHistoryValue();
  }
};

var viewPreviousCommitCommand = {
  description: { description: localize(18784, null), args: [] },
  weight: 200 /* WorkbenchContrib */,
  handler: (accessor) => {
    const contextKeyService = accessor.get(IContextKeyService);
    const scmService = accessor.get(ISCMService);
    const context2 = contextKeyService.getContext(getActiveElement());
    const repositoryId = context2.getValue("scmRepository");
    const repository = repositoryId ? scmService.getRepository(repositoryId) : void 0;
    repository?.input.showPreviousHistoryValue();
  }
};

KeybindingsRegistry.registerCommandAndKeybindingRule({
  ...viewNextCommitCommand,
  id: "scm.viewNextCommit",
  when: ContextKeyExpr.and(ContextKeyExpr.has("scmRepository"), ContextKeyExpr.has("scmInputIsInLastPosition"), Context.Visible.toNegated()),
  primary: 18 /* DownArrow */
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  ...viewPreviousCommitCommand,
  id: "scm.viewPreviousCommit",
  when: ContextKeyExpr.and(ContextKeyExpr.has("scmRepository"), ContextKeyExpr.has("scmInputIsInFirstPosition"), Context.Visible.toNegated()),
  primary: 16 /* UpArrow */
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  ...viewNextCommitCommand,
  id: "scm.forceViewNextCommit",
  when: ContextKeyExpr.has("scmRepository"),
  primary: 512 /* Alt */ | 18 /* DownArrow */
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  ...viewPreviousCommitCommand,
  id: "scm.forceViewPreviousCommit",
  when: ContextKeyExpr.has("scmRepository"),
  primary: 512 /* Alt */ | 16 /* UpArrow */
});

CommandsRegistry.registerCommand("scm.openInIntegratedTerminal", async (accessor, ...providers2) => {
  if (!providers2 || providers2.length === 0) {
    return;
  }
  const commandService = accessor.get(ICommandService);
  const listService = accessor.get(IListService);
  let provider = providers2.length === 1 ? providers2[0] : void 0;
  if (!provider) {
    const list2 = listService.lastFocusedList;
    const element = list2?.getHTMLElement();
    if (list2 instanceof WorkbenchList && element && isActiveElement(element)) {
      const [index2] = list2.getFocus();
      const focusedElement = list2.element(index2);
      if (isSCMRepository(focusedElement)) {
        provider = focusedElement.provider;
      }
    }
  }
  if (!provider?.rootUri) {
    return;
  }
  await commandService.executeCommand("openInIntegratedTerminal", provider.rootUri);
});

CommandsRegistry.registerCommand("scm.openInTerminal", async (accessor, provider) => {
  if (!provider || !provider.rootUri) {
    return;
  }
  const commandService = accessor.get(ICommandService);
  await commandService.executeCommand("openInTerminal", provider.rootUri);
});

CommandsRegistry.registerCommand("scm.setActiveProvider", async (accessor) => {
  const instantiationService = accessor.get(IInstantiationService);
  const scmViewService = accessor.get(ISCMViewService);
  const placeHolder = localize(18834, null);
  const autoQuickItemDescription = localize(18833, null);
  const repositoryPicker = instantiationService.createInstance(RepositoryPicker, placeHolder, autoQuickItemDescription);
  const result = await repositoryPicker.pickRepository();
  if (result?.repository) {
    const repository = result.repository !== "auto" ? result.repository : void 0;
    scmViewService.pinActiveRepository(repository);
  }
});

MenuRegistry.appendMenuItem(MenuId.SCMSourceControl, {
  group: "99_terminal",
  command: {
    id: "scm.openInTerminal",
    title: localize(18778, null)
  },
  when: ContextKeyExpr.and(
    RemoteNameContext.isEqualTo(""),
    ContextKeyExpr.equals("scmProviderHasRootUri", true),
    ContextKeyExpr.or(
      ContextKeyExpr.equals("config.terminal.sourceControlRepositoriesKind", "external"),
      ContextKeyExpr.equals("config.terminal.sourceControlRepositoriesKind", "both")
    )
  )
});

MenuRegistry.appendMenuItem(MenuId.SCMSourceControl, {
  group: "99_terminal",
  command: {
    id: "scm.openInIntegratedTerminal",
    title: localize(18779, null)
  },
  when: ContextKeyExpr.and(
    ContextKeyExpr.equals("scmProviderHasRootUri", true),
    ContextKeyExpr.or(
      ContextKeyExpr.equals("config.terminal.sourceControlRepositoriesKind", "integrated"),
      ContextKeyExpr.equals("config.terminal.sourceControlRepositoriesKind", "both")
    )
  )
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "workbench.scm.action.focusPreviousInput",
  weight: 200 /* WorkbenchContrib */,
  when: ContextKeys.RepositoryVisibilityCount.notEqualsTo(0),
  handler: async (accessor) => {
    const viewsService = accessor.get(IViewsService);
    const scmView = await viewsService.openView(VIEW_PANE_ID);
    if (scmView) {
      scmView.focusPreviousInput();
    }
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "workbench.scm.action.focusNextInput",
  weight: 200 /* WorkbenchContrib */,
  when: ContextKeys.RepositoryVisibilityCount.notEqualsTo(0),
  handler: async (accessor) => {
    const viewsService = accessor.get(IViewsService);
    const scmView = await viewsService.openView(VIEW_PANE_ID);
    if (scmView) {
      scmView.focusNextInput();
    }
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "workbench.scm.action.focusPreviousResourceGroup",
  weight: 200 /* WorkbenchContrib */,
  handler: async (accessor) => {
    const viewsService = accessor.get(IViewsService);
    const scmView = await viewsService.openView(VIEW_PANE_ID);
    if (scmView) {
      scmView.focusPreviousResourceGroup();
    }
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "workbench.scm.action.focusNextResourceGroup",
  weight: 200 /* WorkbenchContrib */,
  handler: async (accessor) => {
    const viewsService = accessor.get(IViewsService);
    const scmView = await viewsService.openView(VIEW_PANE_ID);
    if (scmView) {
      scmView.focusNextResourceGroup();
    }
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "scm.editor.triggerSetup",
      title: localize(18837, null),
      icon: Codicon.chatSparkle,
      f1: false,
      menu: {
        id: MenuId.EditorContent,
        when: ContextKeyExpr.and(
          ChatContextKeys.Setup.hidden.negate(),
          ChatContextKeys.Setup.disabledInWorkspace.negate(),
          ChatContextKeys.Setup.completed.negate(),
          ContextKeyExpr.in(ResourceContextKey.Resource.key, "git.mergeChanges"),
          ContextKeyExpr.equals("git.activeResourceHasMergeConflicts", true)
        )
      }
    });
  }
  async run(accessor, ...args2) {
    const commandService = accessor.get(ICommandService);
    const result = await commandService.executeCommand(CHAT_SETUP_SUPPORT_ANONYMOUS_ACTION_ID);
    if (!result) {
      return;
    }
    const command4 = product_default.defaultChatAgent?.resolveMergeConflictsCommand;
    if (!command4) {
      return;
    }
    await commandService.executeCommand(command4, ...args2);
  }
});

AccessibleViewRegistry.register(new SCMAccessibilityHelp());
export { sourceControlViewIcon, viewContainer3, viewsRegistry5, containerTitle, viewNextCommitCommand, viewPreviousCommitCommand };
