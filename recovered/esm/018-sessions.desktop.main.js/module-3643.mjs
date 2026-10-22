// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/sessions/browser/mobile/mobileOverlayContribution.ts
import { MutableDisposable } from "./module-0012.mjs";
import { Action2, registerAction2 } from "./module-0092.mjs";
import { MOBILE_OPEN_DIFF_VIEW_COMMAND_ID, openMobileDiffView } from "./module-3639.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { IsPhoneLayoutContext } from "./module-1770.mjs";
import { ILayoutService } from "./module-0551.mjs";
import { ITextFileService } from "./module-1064.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { Event2 } from "./module-0017.mjs";
import { MOBILE_OPEN_CHANGES_VIEW_COMMAND_ID, rowToDiffData, toRow } from "./module-3470.mjs";
import { IFileService } from "./module-0269.mjs";
import { INotificationService } from "./module-0336.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { ICommandService } from "./module-0087.mjs";
import { MobileMultiDiffView } from "./module-3642.mjs";


// src/vs/sessions/contrib/sessions/browser/mobile/mobileOverlayContribution.ts
var activeDiffView = new MutableDisposable();

var activeMultiDiffView = new MutableDisposable();

var MobileOpenDiffViewAction = class extends Action2 {
  constructor() {
    super({
      id: MOBILE_OPEN_DIFF_VIEW_COMMAND_ID,
      title: localize2(5326, "Open File Diff"),
      precondition: IsPhoneLayoutContext,
      f1: false
    });
  }
  run(accessor, arg) {
    const layoutService = accessor.get(ILayoutService);
    const textFileService = accessor.get(ITextFileService);
    const languageService = accessor.get(ILanguageService);
    const data = isMobileDiffViewData(arg) ? arg : { diff: arg };
    activeDiffView.value = openMobileDiffView(layoutService.mainContainer, data, textFileService, languageService);
    const view = activeDiffView.value;
    Event2.once(view.onDidDispose)(() => {
      if (activeDiffView.value === view) {
        activeDiffView.clear();
      }
    });
  }
};

var MobileOpenChangesViewAction = class extends Action2 {
  constructor() {
    super({
      id: MOBILE_OPEN_CHANGES_VIEW_COMMAND_ID,
      title: localize2(5327, "Open Session Changes"),
      precondition: IsPhoneLayoutContext,
      f1: false
    });
  }
  run(accessor) {
    const layoutService = accessor.get(ILayoutService);
    const textFileService = accessor.get(ITextFileService);
    const fileService = accessor.get(IFileService);
    const languageService = accessor.get(ILanguageService);
    const notificationService = accessor.get(INotificationService);
    const sessionsService = accessor.get(ISessionsService);
    const session = sessionsService.activeSession.get();
    const changes = session?.changes.get() ?? [];
    const rows = changes.map((c) => toRow(c));
    const diffs = rows.map((r2) => rowToDiffData(r2)).filter((d) => d.originalURI || d.modifiedURI);
    if (diffs.length === 0) {
      notificationService.info(localize(5325, null));
      return;
    }
    if (diffs.length === 1) {
      const commandService = accessor.get(ICommandService);
      commandService.executeCommand(MOBILE_OPEN_DIFF_VIEW_COMMAND_ID, { diff: diffs[0] });
      return;
    }
    const data = { diffs };
    activeMultiDiffView.value = new MobileMultiDiffView(
      layoutService.mainContainer,
      data,
      textFileService,
      fileService,
      languageService
    );
    const view = activeMultiDiffView.value;
    Event2.once(view.onDidDispose)(() => {
      if (activeMultiDiffView.value === view) {
        activeMultiDiffView.clear();
      }
    });
  }
};

function isMobileDiffViewData(arg) {
  return arg && typeof arg === "object" && "diff" in arg;
}

registerAction2(MobileOpenDiffViewAction);

registerAction2(MobileOpenChangesViewAction);
export { isMobileDiffViewData, activeDiffView, activeMultiDiffView, MobileOpenDiffViewAction, MobileOpenChangesViewAction };
