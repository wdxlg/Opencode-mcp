// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostDownloadProgress.ts
import { Disposable, toDisposable } from "./module-0012.mjs";
import { ChatAIDisabledSettingId } from "./module-0951.mjs";
import { DeferredPromise } from "./module-0036.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IProgressService } from "./module-0446.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostDownloadProgress.ts
var AgentHostDownloadProgress = class extends Disposable {
  constructor(_progressService, _configurationService) {
    super();
    this._progressService = _progressService;
    this._configurationService = _configurationService;
    /**
     * Active progress indicators keyed by `progressToken`. The host emits a
     * single stream per download keyed by the download's own stable identity
     * (so distinct sessions of a provider share one indicator). Each entry owns
     * one long-running notification progress (opened on the first frame), driven
     * via {@link IActiveDownload.report} and dismissed via
     * {@link IActiveDownload.complete} once `progress >= total`.
     */
    this._activeDownloads = /* @__PURE__ */ new Map();
    this._register(toDisposable(() => {
      for (const download of this._activeDownloads.values()) {
        download.complete();
      }
      this._activeDownloads.clear();
    }));
  }
  handleProgress(progress) {
    if (this._configurationService.getValue(ChatAIDisabledSettingId)) {
      return;
    }
    const isComplete = progress.total !== void 0 && progress.progress >= progress.total;
    if (isComplete) {
      this._activeDownloads.get(progress.progressToken)?.complete();
      this._activeDownloads.delete(progress.progressToken);
      return;
    }
    let entry = this._activeDownloads.get(progress.progressToken);
    if (!entry) {
      const deferred = new DeferredPromise();
      let report;
      const title = progress.message ?? localize(8967, null);
      this._progressService.withProgress(
        {
          location: 15 /* Notification */,
          title
        },
        (p) => {
          report = (step) => p.report(step);
          return deferred.p;
        }
      );
      entry = {
        lastPercent: 0,
        report: (step) => report?.(step),
        complete: () => deferred.complete()
      };
      this._activeDownloads.set(progress.progressToken, entry);
    }
    if (progress.total && progress.total > 0) {
      const percent = Math.max(0, Math.min(100, Math.round(progress.progress / progress.total * 100)));
      const increment = percent - entry.lastPercent;
      entry.lastPercent = percent;
      entry.report({
        message: localize(8966, null, percent),
        increment: increment > 0 ? increment : 0,
        total: 100
      });
    } else {
      const megabytes = (progress.progress / (1024 * 1024)).toFixed(1);
      entry.report({ message: localize(8965, null, megabytes) });
    }
  }
};

AgentHostDownloadProgress = __decorateClass([
  __decorateParam(0, IProgressService),
  __decorateParam(1, IConfigurationService)
], AgentHostDownloadProgress);
export { AgentHostDownloadProgress };
