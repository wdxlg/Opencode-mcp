// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/agentsVoice/browser/transcriptsView/voiceTranscripts.contribution.ts
import { VoiceTranscriptsViewPane } from "./module-2890.mjs";
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { registerIcon } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions13 } from "./module-1094.mjs";
import { SyncDescriptor } from "./module-0134.mjs";
import { ViewPaneContainer } from "./module-1381.mjs";
import { Action2, MenuId, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { IViewsService } from "./module-1246.mjs";
import { IDialogService } from "./module-0267.mjs";
import { Disposable } from "./module-0012.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";


// src/vs/workbench/contrib/agentsVoice/browser/transcriptsView/voiceTranscripts.contribution.ts
var CONTAINER_ID = "workbench.view.voiceTranscriptsContainer";

var VIEW_ID3 = VoiceTranscriptsViewPane.ID;

var SHOW_VIEW_CONTEXT_KEY = new RawContextKey("voiceTranscripts.showView", false);

var voiceTranscriptsIcon = registerIcon(
  "voice-transcripts-view-icon",
  Codicon.history,
  localize(7860, null)
);

var viewContainersRegistry = Registry.as(Extensions13.ViewContainersRegistry);

var viewsRegistry2 = Registry.as(Extensions13.ViewsRegistry);

var container = viewContainersRegistry.registerViewContainer(
  {
    id: CONTAINER_ID,
    title: localize2(7858, "Voice Transcripts"),
    icon: voiceTranscriptsIcon,
    ctorDescriptor: new SyncDescriptor(ViewPaneContainer, [CONTAINER_ID, { mergeViewWithContainerWhenSingleView: true }]),
    storageId: CONTAINER_ID,
    hideIfEmpty: true,
    order: 10
  },
  0 /* Sidebar */
);

var viewDescriptor2 = {
  id: VIEW_ID3,
  name: localize2(7859, "Voice Transcripts"),
  containerIcon: voiceTranscriptsIcon,
  ctorDescriptor: new SyncDescriptor(VoiceTranscriptsViewPane),
  canToggleVisibility: true,
  canMoveView: true,
  when: SHOW_VIEW_CONTEXT_KEY,
  openCommandActionDescriptor: {
    id: "voiceTranscripts.focus",
    title: localize2(7856, "Focus Voice Transcripts View")
  }
};

viewsRegistry2.registerViews([viewDescriptor2], container);

var SHOW_VIEW_COMMAND_ID = "agentsVoice.showTranscripts";

var ShowVoiceTranscriptsAction = class extends Action2 {
  constructor() {
    super({
      id: SHOW_VIEW_COMMAND_ID,
      title: localize2(7848, "Show Voice Transcripts"),
      f1: true,
      category: localize2(7850, "Agents Voice"),
      precondition: ChatContextKeys.enabled
    });
  }
  async run(accessor) {
    const contextKeyService = accessor.get(IContextKeyService);
    const viewsService = accessor.get(IViewsService);
    SHOW_VIEW_CONTEXT_KEY.bindTo(contextKeyService).set(true);
    await viewsService.openView(VIEW_ID3, true);
  }
};

registerAction2(ShowVoiceTranscriptsAction);

var VIEW_TITLE_WHEN = ContextKeyExpr.equals("view", VIEW_ID3);

var RefreshVoiceTranscriptsAction = class _RefreshVoiceTranscriptsAction extends Action2 {
  static {
    this.ID = "voiceTranscripts.refresh";
  }
  constructor() {
    super({
      id: _RefreshVoiceTranscriptsAction.ID,
      title: localize2(7857, "Refresh"),
      icon: Codicon.refresh,
      menu: [{
        id: MenuId.ViewTitle,
        when: VIEW_TITLE_WHEN,
        group: "navigation",
        order: 1
      }]
    });
  }
  async run(accessor) {
    const viewsService = accessor.get(IViewsService);
    const view = viewsService.getActiveViewWithId(VIEW_ID3);
    await view?.refresh();
  }
};

var ArchiveAllVoiceTranscriptsAction = class _ArchiveAllVoiceTranscriptsAction extends Action2 {
  static {
    this.ID = "voiceTranscripts.archiveAll";
  }
  constructor() {
    super({
      id: _ArchiveAllVoiceTranscriptsAction.ID,
      title: localize2(7851, "Archive All"),
      icon: Codicon.archive,
      menu: [{
        id: MenuId.ViewTitle,
        when: VIEW_TITLE_WHEN,
        group: "1_actions",
        order: 1
      }]
    });
  }
  async run(accessor) {
    const viewsService = accessor.get(IViewsService);
    const view = viewsService.getActiveViewWithId(VIEW_ID3);
    await view?.archiveAll();
  }
};

var DeleteAllVoiceTranscriptsAction = class _DeleteAllVoiceTranscriptsAction extends Action2 {
  static {
    this.ID = "voiceTranscripts.deleteAll";
  }
  constructor() {
    super({
      id: _DeleteAllVoiceTranscriptsAction.ID,
      title: localize2(7852, "Delete All"),
      icon: Codicon.trash,
      menu: [{
        id: MenuId.ViewTitle,
        when: VIEW_TITLE_WHEN,
        group: "1_actions",
        order: 2
      }]
    });
  }
  async run(accessor) {
    const dialogService = accessor.get(IDialogService);
    const viewsService = accessor.get(IViewsService);
    const view = viewsService.getActiveViewWithId(VIEW_ID3);
    if (!view) {
      return;
    }
    const result = await dialogService.confirm({
      type: "warning",
      message: localize(7853, null),
      detail: localize(
        7855,
        null
      ),
      primaryButton: localize(7854, null)
    });
    if (result.confirmed) {
      await view.deleteAll();
    }
  }
};

registerAction2(RefreshVoiceTranscriptsAction);

registerAction2(ArchiveAllVoiceTranscriptsAction);

registerAction2(DeleteAllVoiceTranscriptsAction);

MenuRegistry.appendMenuItem(MenuId.ViewTitle, {
  command: {
    id: SHOW_VIEW_COMMAND_ID,
    title: localize(7849, null)
  },
  when: ContextKeyExpr.equals("view", "workbench.panel.chat.view.copilot"),
  group: "3_show",
  order: 2
});

var VoiceTranscriptsContribution = class extends Disposable {
  static {
    this.ID = "workbench.contrib.voiceTranscripts";
  }
  constructor() {
    super();
  }
};

registerWorkbenchContribution2(VoiceTranscriptsContribution.ID, VoiceTranscriptsContribution, WorkbenchPhase.AfterRestored);
export { CONTAINER_ID, VIEW_ID3, SHOW_VIEW_CONTEXT_KEY, voiceTranscriptsIcon, viewContainersRegistry, viewsRegistry2, container, viewDescriptor2, SHOW_VIEW_COMMAND_ID, ShowVoiceTranscriptsAction, VIEW_TITLE_WHEN, RefreshVoiceTranscriptsAction, ArchiveAllVoiceTranscriptsAction, DeleteAllVoiceTranscriptsAction, VoiceTranscriptsContribution };
