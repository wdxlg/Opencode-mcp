// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/keybindings/electron-browser/systemWideKeybindings.contribution.ts
import { Disposable } from "./module-0012.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { localize } from "./module-0001.mjs";
import { equals } from "./module-0007.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { INativeHostService } from "./module-2591.mjs";
import { IProductService } from "./module-0873.mjs";
import { ILogService } from "./module-0095.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0870.mjs";


// src/vs/workbench/contrib/keybindings/electron-browser/systemWideKeybindings.contribution.ts
function selectSystemWideKeybindings(items) {
  const seen = /* @__PURE__ */ new Set();
  const candidates = [];
  const unsupported2 = [];
  const duplicates = [];
  for (const item of items) {
    if (!item.systemWide || item.isDefault || !item.command) {
      continue;
    }
    const resolved = item.resolvedKeybinding;
    if (!resolved) {
      continue;
    }
    const accelerator = resolved.getElectronAccelerator();
    if (!accelerator) {
      unsupported2.push(resolved.getUserSettingsLabel() ?? item.command);
      continue;
    }
    if (seen.has(accelerator)) {
      duplicates.push(resolved.getUserSettingsLabel() ?? accelerator);
      continue;
    }
    seen.add(accelerator);
    candidates.push({
      accelerator,
      commandId: item.command,
      args: item.commandArgs ?? void 0,
      userSettingsLabel: resolved.getUserSettingsLabel() ?? accelerator,
      hasWhen: !!item.when
    });
  }
  return { candidates, unsupported: unsupported2, duplicates };
}

var SystemWideKeybindingsContribution = class extends Disposable {
  constructor(keybindingService, nativeHostService, notificationService, productService, logService) {
    super();
    this.keybindingService = keybindingService;
    this.nativeHostService = nativeHostService;
    this.notificationService = notificationService;
    this.productService = productService;
    this.logService = logService;
    /** Accelerators that failed to register on the last sync, to avoid re-notifying unchanged failures. */
    this.lastReportedFailures = [];
    /** User settings labels whose ignored `when` clause we already warned about. */
    this.warnedWhenLabels = /* @__PURE__ */ new Set();
    this.syncScheduler = this._register(new RunOnceScheduler(() => this.sync(), 200));
    this._register(this.keybindingService.onDidUpdateKeybindings(() => this.scheduleSync()));
    this.scheduleSync();
  }
  static {
    this.ID = "workbench.contrib.systemWideKeybindings";
  }
  scheduleSync() {
    this.syncScheduler.schedule();
  }
  async sync() {
    const candidates = this.collectCandidates();
    if (candidates.length === 0) {
      await this.pushToMainProcess([]);
      return;
    }
    this.warnAboutIgnoredWhenClauses(candidates);
    await this.pushToMainProcess(candidates);
  }
  collectCandidates() {
    const { candidates, unsupported: unsupported2, duplicates } = selectSystemWideKeybindings(this.keybindingService.getKeybindings());
    for (const label3 of unsupported2) {
      this.logService.warn(`[SystemWideKeybindings] '${label3}' cannot be registered as a system-wide shortcut (only single key combinations are supported).`);
    }
    for (const label3 of duplicates) {
      this.logService.warn(`[SystemWideKeybindings] duplicate system-wide accelerator for '${label3}', keeping the first binding.`);
    }
    return candidates;
  }
  warnAboutIgnoredWhenClauses(candidates) {
    const newlyWarned = [];
    for (const candidate of candidates) {
      if (candidate.hasWhen && !this.warnedWhenLabels.has(candidate.userSettingsLabel)) {
        this.warnedWhenLabels.add(candidate.userSettingsLabel);
        newlyWarned.push(candidate.userSettingsLabel);
      }
    }
    if (newlyWarned.length > 0) {
      this.notificationService.notify({
        severity: Severity2.Warning,
        message: localize(16491, null, newlyWarned.join(", "), this.productName())
      });
    }
  }
  async pushToMainProcess(candidates) {
    const payload = candidates.map((candidate) => ({
      accelerator: candidate.accelerator,
      commandId: candidate.commandId,
      args: candidate.args,
      userSettingsLabel: candidate.userSettingsLabel
    }));
    try {
      const result = await this.nativeHostService.syncSystemWideKeybindings(payload);
      this.reportFailures(result.failed);
    } catch (error) {
      this.logService.error("[SystemWideKeybindings] failed to sync system-wide keybindings with the main process", error);
    }
  }
  reportFailures(failed) {
    const sorted = [...failed].sort();
    if (equals(sorted, this.lastReportedFailures)) {
      return;
    }
    this.lastReportedFailures = sorted;
    if (sorted.length === 0) {
      return;
    }
    this.notificationService.notify({
      severity: Severity2.Warning,
      message: localize(16490, null, sorted.join(", "))
    });
  }
  productName() {
    return this.productService.nameLong;
  }
};

SystemWideKeybindingsContribution = __decorateClass([
  __decorateParam(0, IKeybindingService),
  __decorateParam(1, INativeHostService),
  __decorateParam(2, INotificationService),
  __decorateParam(3, IProductService),
  __decorateParam(4, ILogService)
], SystemWideKeybindingsContribution);

registerWorkbenchContribution2(
  SystemWideKeybindingsContribution.ID,
  SystemWideKeybindingsContribution,
  WorkbenchPhase.AfterRestored
);
export { selectSystemWideKeybindings, SystemWideKeybindingsContribution };
