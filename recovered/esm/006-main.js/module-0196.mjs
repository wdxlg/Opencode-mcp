// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/process/electron-main/processMainService.ts
import { __decorateClass, __decorateParam, __esm } from "./module-0000.mjs";
import { init_ps, listProcesses } from "./module-0195.mjs";
import { init_nls, localize } from "./module-0005.mjs";
import { IDiagnosticsService, init_diagnostics, isRemoteDiagnosticError } from "./module-0119.mjs";
import { IDiagnosticsMainService, init_diagnosticsMainService } from "./module-0133.mjs";
import { ILogService, init_log } from "./module-0075.mjs";
import { UtilityProcess, init_utilityProcess } from "./module-0132.mjs";


// src/vs/platform/process/electron-main/processMainService.ts
var ProcessMainService;

var init_processMainService = __esm({
  "src/vs/platform/process/electron-main/processMainService.ts"() {
    init_ps();
    init_nls();
    init_diagnostics();
    init_diagnosticsMainService();
    init_log();
    init_utilityProcess();
    ProcessMainService = class {
      constructor(logService, diagnosticsService, diagnosticsMainService) {
        this.logService = logService;
        this.diagnosticsService = diagnosticsService;
        this.diagnosticsMainService = diagnosticsMainService;
      }
      async resolveProcesses() {
        const mainProcessInfo = await this.diagnosticsMainService.getMainDiagnostics();
        const pidToNames = [];
        for (const window2 of mainProcessInfo.windows) {
          pidToNames.push([window2.pid, `window [${window2.id}] (${window2.title})`]);
        }
        for (const { pid, name } of UtilityProcess.getAll()) {
          pidToNames.push([pid, name]);
        }
        const processes = [];
        try {
          processes.push({ name: localize(3181, null), rootProcess: await listProcesses(process.pid) });
          const remoteDiagnostics = await this.diagnosticsMainService.getRemoteDiagnostics({ includeProcesses: true });
          remoteDiagnostics.forEach((data) => {
            if (isRemoteDiagnosticError(data)) {
              processes.push({
                name: data.hostName,
                rootProcess: data
              });
            } else {
              if (data.processes) {
                processes.push({
                  name: data.hostName,
                  rootProcess: data.processes
                });
              }
            }
          });
        } catch (e) {
          this.logService.error(`Listing processes failed: ${e}`);
        }
        return { pidToNames, processes };
      }
      async getSystemStatus() {
        const [info, remoteData] = await Promise.all([this.diagnosticsMainService.getMainDiagnostics(), this.diagnosticsMainService.getRemoteDiagnostics({ includeProcesses: false, includeWorkspaceMetadata: false })]);
        return this.diagnosticsService.getDiagnostics(info, remoteData);
      }
      async getSystemInfo() {
        const [info, remoteData] = await Promise.all([this.diagnosticsMainService.getMainDiagnostics(), this.diagnosticsMainService.getRemoteDiagnostics({ includeProcesses: false, includeWorkspaceMetadata: false })]);
        const msg = await this.diagnosticsService.getSystemInfo(info, remoteData);
        return msg;
      }
      async getPerformanceInfo(options) {
        try {
          const [info, remoteData] = await Promise.all([this.diagnosticsMainService.getMainDiagnostics(), this.diagnosticsMainService.getRemoteDiagnostics({ includeProcesses: true, includeWorkspaceMetadata: true })]);
          return await this.diagnosticsService.getPerformanceInfo(info, remoteData, options);
        } catch (error) {
          this.logService.warn("issueService#getPerformanceInfo ", error.message);
          throw error;
        }
      }
    };
    ProcessMainService = __decorateClass([
      __decorateParam(0, ILogService),
      __decorateParam(1, IDiagnosticsService),
      __decorateParam(2, IDiagnosticsMainService)
    ], ProcessMainService);
  }
});
export { ProcessMainService, init_processMainService };
