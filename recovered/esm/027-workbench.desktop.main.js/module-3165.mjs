// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/debug/browser/debugProgress.ts
import { Event2 } from "./module-0017.mjs";
import { IDebugService, VIEWLET_ID3 } from "./module-1057.mjs";
import { dispose } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IProgressService } from "./module-0446.mjs";
import { IViewsService } from "./module-1246.mjs";


// src/vs/workbench/contrib/debug/browser/debugProgress.ts
var DebugProgressContribution = class {
  constructor(debugService, progressService, viewsService) {
    this.toDispose = [];
    let progressListener;
    const listenOnProgress = (session) => {
      if (progressListener) {
        progressListener.dispose();
        progressListener = void 0;
      }
      if (session) {
        progressListener = session.onDidProgressStart(async (progressStartEvent) => {
          const promise = new Promise((r2) => {
            const listener = Event2.any(
              Event2.filter(session.onDidProgressEnd, (e) => e.body.progressId === progressStartEvent.body.progressId),
              session.onDidEndAdapter
            )(() => {
              listener.dispose();
              r2();
            });
          });
          if (viewsService.isViewContainerVisible(VIEWLET_ID3)) {
            progressService.withProgress({ location: VIEWLET_ID3 }, () => promise);
          }
          const source = debugService.getAdapterManager().getDebuggerLabel(session.configuration.type);
          progressService.withProgress({
            location: 15 /* Notification */,
            title: progressStartEvent.body.title,
            cancellable: progressStartEvent.body.cancellable,
            source,
            delay: 500
          }, (progressStep) => {
            let total = 0;
            const reportProgress = (progress) => {
              let increment = void 0;
              if (typeof progress.percentage === "number") {
                increment = progress.percentage - total;
                total += increment;
              }
              progressStep.report({
                message: progress.message,
                increment,
                total: typeof increment === "number" ? 100 : void 0
              });
            };
            if (progressStartEvent.body.message) {
              reportProgress(progressStartEvent.body);
            }
            const progressUpdateListener = session.onDidProgressUpdate((e) => {
              if (e.body.progressId === progressStartEvent.body.progressId) {
                reportProgress(e.body);
              }
            });
            return promise.then(() => progressUpdateListener.dispose());
          }, () => session.cancel(progressStartEvent.body.progressId));
        });
      }
    };
    this.toDispose.push(debugService.getViewModel().onDidFocusSession(listenOnProgress));
    listenOnProgress(debugService.getViewModel().focusedSession);
    this.toDispose.push(debugService.onWillNewSession((session) => {
      if (!progressListener) {
        listenOnProgress(session);
      }
    }));
  }
  dispose() {
    dispose(this.toDispose);
  }
};

DebugProgressContribution = __decorateClass([
  __decorateParam(0, IDebugService),
  __decorateParam(1, IProgressService),
  __decorateParam(2, IViewsService)
], DebugProgressContribution);
export { DebugProgressContribution };
