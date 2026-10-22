// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/workingCopy/common/workingCopyFileOperationParticipant.ts
import { Disposable, toDisposable } from "./module-0012.mjs";
import { LinkedList } from "./module-0013.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0095.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/services/workingCopy/common/workingCopyFileOperationParticipant.ts
var WorkingCopyFileOperationParticipant = class extends Disposable {
  constructor(logService, configurationService) {
    super();
    this.logService = logService;
    this.configurationService = configurationService;
    this.participants = new LinkedList();
  }
  addFileOperationParticipant(participant) {
    const remove2 = this.participants.push(participant);
    return toDisposable(() => remove2());
  }
  async participate(files, operation, undoInfo, token) {
    const timeout2 = this.configurationService.getValue("files.participants.timeout");
    if (typeof timeout2 !== "number" || timeout2 <= 0) {
      return;
    }
    for (const participant of this.participants) {
      try {
        await participant.participate(files, operation, undoInfo, timeout2, token);
      } catch (err) {
        this.logService.warn(err);
      }
    }
  }
  dispose() {
    this.participants.clear();
    super.dispose();
  }
};

WorkingCopyFileOperationParticipant = __decorateClass([
  __decorateParam(0, ILogService),
  __decorateParam(1, IConfigurationService)
], WorkingCopyFileOperationParticipant);
export { WorkingCopyFileOperationParticipant };
