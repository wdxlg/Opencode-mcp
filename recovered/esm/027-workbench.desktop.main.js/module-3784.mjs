// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/textfile/common/textFileSaveParticipant.ts
import { Disposable, toDisposable } from "./module-0012.mjs";
import { LinkedList } from "./module-0013.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { localize } from "./module-0001.mjs";
import { raceCancellation } from "./module-0036.mjs";
import { CancellationError, isCancellationError } from "./module-0004.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0095.mjs";
import { IProgressService } from "./module-0446.mjs";


// src/vs/workbench/services/textfile/common/textFileSaveParticipant.ts
var TextFileSaveParticipant = class extends Disposable {
  constructor(logService, progressService) {
    super();
    this.logService = logService;
    this.progressService = progressService;
    this.saveParticipants = new LinkedList();
  }
  addSaveParticipant(participant) {
    const remove2 = this.saveParticipants.push(participant);
    return toDisposable(() => remove2());
  }
  async participate(model, context2, progress, token) {
    const cts = new CancellationTokenSource(token);
    model.textEditorModel?.pushStackElement();
    progress.report({
      message: localize(23384, null)
    });
    let bubbleCancel = false;
    await this.progressService.withProgress({
      priority: 3 /* URGENT */,
      location: 15 /* Notification */,
      cancellable: localize(23385, null),
      delay: model.isDirty() ? 5e3 : 3e3
    }, async (progress2) => {
      const participants = Array.from(this.saveParticipants).sort((a, b) => {
        const aValue = a.ordinal ?? 0;
        const bValue = b.ordinal ?? 0;
        return aValue - bValue;
      });
      for (const saveParticipant of participants) {
        if (cts.token.isCancellationRequested || !model.textEditorModel) {
          break;
        }
        try {
          const promise = saveParticipant.participate(model, context2, progress2, cts.token);
          await raceCancellation(promise, cts.token);
        } catch (err) {
          if (!isCancellationError(err)) {
            this.logService.error(err);
          } else if (!cts.token.isCancellationRequested) {
            cts.cancel();
            bubbleCancel = true;
          }
        }
      }
    }, () => {
      cts.cancel();
    });
    model.textEditorModel?.pushStackElement();
    cts.dispose();
    if (bubbleCancel) {
      throw new CancellationError();
    }
  }
  dispose() {
    this.saveParticipants.clear();
    super.dispose();
  }
};

TextFileSaveParticipant = __decorateClass([
  __decorateParam(0, ILogService),
  __decorateParam(1, IProgressService)
], TextFileSaveParticipant);
export { TextFileSaveParticipant };
