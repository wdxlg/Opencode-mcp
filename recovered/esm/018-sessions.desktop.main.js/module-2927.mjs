// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/files/common/dirtyFilesIndicator.ts
import { Disposable, MutableDisposable } from "./module-0012.mjs";
import { VIEWLET_ID4 } from "./module-1534.mjs";
import { IActivityService, NumberBadge } from "./module-1448.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IWorkingCopyService } from "./module-1073.mjs";
import { IFilesConfigurationService } from "./module-0931.mjs";


// src/vs/workbench/contrib/files/common/dirtyFilesIndicator.ts
var DirtyFilesIndicator = class extends Disposable {
  constructor(activityService, workingCopyService, filesConfigurationService) {
    super();
    this.activityService = activityService;
    this.workingCopyService = workingCopyService;
    this.filesConfigurationService = filesConfigurationService;
    this.badgeHandle = this._register(new MutableDisposable());
    this.lastKnownDirtyCount = 0;
    this.updateActivityBadge();
    this.registerListeners();
  }
  static {
    this.ID = "workbench.contrib.dirtyFilesIndicator";
  }
  registerListeners() {
    this._register(this.workingCopyService.onDidChangeDirty((workingCopy) => this.onWorkingCopyDidChangeDirty(workingCopy)));
  }
  onWorkingCopyDidChangeDirty(workingCopy) {
    const gotDirty = workingCopy.isDirty();
    if (gotDirty && !(workingCopy.capabilities & 2 /* Untitled */) && this.filesConfigurationService.hasShortAutoSaveDelay(workingCopy.resource)) {
      return;
    }
    if (gotDirty || this.lastKnownDirtyCount > 0) {
      this.updateActivityBadge();
    }
  }
  updateActivityBadge() {
    const dirtyCount = this.lastKnownDirtyCount = this.workingCopyService.dirtyCount;
    if (dirtyCount > 0) {
      this.badgeHandle.value = this.activityService.showViewContainerActivity(
        VIEWLET_ID4,
        {
          badge: new NumberBadge(dirtyCount, (num) => num === 1 ? localize(16041, null) : localize(16042, null, dirtyCount))
        }
      );
    } else {
      this.badgeHandle.clear();
    }
  }
};

DirtyFilesIndicator = __decorateClass([
  __decorateParam(0, IActivityService),
  __decorateParam(1, IWorkingCopyService),
  __decorateParam(2, IFilesConfigurationService)
], DirtyFilesIndicator);
export { DirtyFilesIndicator };
