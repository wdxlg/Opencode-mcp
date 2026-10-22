// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/layout/browser/singlePane/singlePaneDetailPanelCoordinator.ts
import { Disposable } from "./module-0012.mjs";
import { Sequencer } from "./module-0036.mjs";
import { HasDockedDetailsContext } from "./module-1770.mjs";
import { autorun } from "./module-0052.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { CHANGES_VIEW_CONTAINER_ID } from "./module-3620.mjs";
import { SESSIONS_FILES_CONTAINER_ID } from "./module-3748.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentWorkbenchLayoutService } from "./module-3474.mjs";
import { IViewsService } from "./module-1246.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { IContextKeyService } from "./module-0089.mjs";


// src/vs/sessions/contrib/layout/browser/singlePane/singlePaneDetailPanelCoordinator.ts
var SinglePaneDetailPanelCoordinator = class extends Disposable {
  constructor(_layoutService, _viewsService, sessionsService, contextKeyService) {
    super();
    this._layoutService = _layoutService;
    this._viewsService = _viewsService;
    this._sequencer = new Sequencer();
    this._generation = 0;
    this._target = 6 /* Preserve */;
    this._hasDockedDetailsContext = HasDockedDetailsContext.bindTo(contextKeyService);
    this._register(this._layoutService.onDidChangePartVisibility((event) => {
      if (event.partId === "workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */ && event.visible) {
        this._queueTarget(this._target);
      }
    }));
    this._register(autorun((reader) => {
      const activeSession = sessionsService.activeSession.read(reader);
      if (!activeSession || !(activeSession.isQuickChat?.read(reader) ?? false) && !activeSession.workspace.read(reader)) {
        this.sync(6 /* Preserve */);
      }
    }));
  }
  /**
   * Publishes the target context and serializes Changes/Files container selection.
   */
  sync(target) {
    this._target = target;
    this._hasDockedDetailsContext.set(target === 2 /* Changes */ || target === 3 /* ChangesForced */ || target === 4 /* Files */ || target === 5 /* FilesForced */);
    this._queueTarget(target);
  }
  _queueTarget(target) {
    const generation = ++this._generation;
    void this._sequencer.queue(() => this._syncTarget(target, generation)).catch(onUnexpectedError);
  }
  async _syncTarget(target, generation) {
    if (generation !== this._generation || !this._layoutService.isVisible("workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */)) {
      return;
    }
    switch (target) {
      case 2 /* Changes */:
      case 3 /* ChangesForced */:
        await this._viewsService.openViewContainer(CHANGES_VIEW_CONTAINER_ID, false);
        return;
      case 4 /* Files */:
      case 5 /* FilesForced */:
        await this._viewsService.openViewContainer(SESSIONS_FILES_CONTAINER_ID, false);
        return;
      case 0 /* Hidden */:
      case 1 /* EditorHidden */:
      case 6 /* Preserve */:
        return;
    }
  }
};

SinglePaneDetailPanelCoordinator = __decorateClass([
  __decorateParam(0, IAgentWorkbenchLayoutService),
  __decorateParam(1, IViewsService),
  __decorateParam(2, ISessionsService),
  __decorateParam(3, IContextKeyService)
], SinglePaneDetailPanelCoordinator);
export { SinglePaneDetailPanelCoordinator };
