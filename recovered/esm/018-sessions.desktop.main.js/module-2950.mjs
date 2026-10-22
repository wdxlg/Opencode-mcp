// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/files/browser/syncChangesActionViewItem.ts
import { ActionViewItem } from "./module-0476.mjs";
import { MutableDisposable } from "./module-0012.mjs";
import { Iterable } from "./module-0011.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { derivedOpts } from "./module-0054.mjs";
import { structuralEquals } from "./module-0042.mjs";
import { autorun } from "./module-0052.mjs";
import { reset } from "./module-0075.mjs";
import { renderLabelWithIcons } from "./module-0467.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ISCMService } from "./module-1081.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";


// src/vs/sessions/contrib/files/browser/syncChangesActionViewItem.ts
var SyncChangesActionViewItem = class extends ActionViewItem {
  constructor(action, options3, scmService, contextService) {
    super(void 0, action, { ...options3, icon: false, label: true });
    this.scmService = scmService;
    this.contextService = contextService;
    this._labelUpdateDisposable = this._register(new MutableDisposable());
  }
  getTooltip() {
    return this._tooltip ?? super.getTooltip();
  }
  updateLabel() {
    this._labelUpdateDisposable.clear();
    if (!this.label) {
      return;
    }
    this.label.classList.add("sync-changes-action-view-item");
    const workspaceFolder = this.contextService.getWorkspace().folders[0];
    const repository = workspaceFolder ? Iterable.find(this.scmService.repositories, (repo) => isEqual2(repo.provider.rootUri, workspaceFolder.uri)) : void 0;
    const syncActionDetailsObs = derivedOpts(
      { equalsFn: structuralEquals },
      (reader) => {
        const commands = repository?.provider.statusBarCommands.read(reader);
        const syncCommand = commands?.find((c) => c.title.startsWith("$(sync)") || c.title.startsWith("$(sync~spin)"));
        return syncCommand ? {
          title: syncCommand.title,
          tooltip: syncCommand.tooltip
        } : void 0;
      }
    );
    this._labelUpdateDisposable.value = autorun((reader) => {
      const syncActionDetails = syncActionDetailsObs.read(reader);
      reset(this.label, ...syncActionDetails ? renderLabelWithIcons(syncActionDetails.title) : []);
      this._tooltip = syncActionDetails?.tooltip;
      this.updateTooltip();
    });
  }
};

SyncChangesActionViewItem = __decorateClass([
  __decorateParam(2, ISCMService),
  __decorateParam(3, IWorkspaceContextService)
], SyncChangesActionViewItem);
export { SyncChangesActionViewItem };
