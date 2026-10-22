// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/issue/electron-browser/issue.contribution.ts
import { registerSingleton } from "./module-0135.mjs";
import { IIssueFormService, IWorkbenchIssueService } from "./module-1876.mjs";
import { NativeIssueService } from "./module-3990.mjs";
import { NativeIssueFormService } from "./module-3997.mjs";
import { IScreenshotService } from "./module-3986.mjs";
import { NativeScreenshotService } from "./module-3998.mjs";
import { IRecordingService } from "./module-3983.mjs";
import { NativeRecordingService } from "./module-3999.mjs";
import { IGitHubUploadService } from "./module-3994.mjs";
import { NativeGitHubUploadService } from "./module-4000.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { EditorExtensions } from "./module-0925.mjs";
import { EditorPaneDescriptor } from "./module-1084.mjs";
import { IssueReporterEditorPane } from "./module-3987.mjs";
import { SyncDescriptor } from "./module-0134.mjs";
import { IssueReporterEditorInput } from "./module-3980.mjs";
import { BaseIssueContribution } from "./module-3989.mjs";
import { Action2, registerAction2 } from "./module-0092.mjs";
import { Extensions18 } from "./module-1560.mjs";
import { IssueQuickAccess } from "./module-3978.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IProductService } from "./module-0873.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { Extensions10 } from "./module-0870.mjs";
import { Categories } from "./module-0847.mjs";
import { CommandsRegistry } from "./module-0087.mjs";
import { IProcessService } from "./module-3941.mjs";


// src/vs/workbench/contrib/issue/electron-browser/issue.contribution.ts
registerSingleton(IWorkbenchIssueService, NativeIssueService, 1 /* Delayed */);

registerSingleton(IIssueFormService, NativeIssueFormService, 1 /* Delayed */);

registerSingleton(IScreenshotService, NativeScreenshotService, 1 /* Delayed */);

registerSingleton(IRecordingService, NativeRecordingService, 1 /* Delayed */);

registerSingleton(IGitHubUploadService, NativeGitHubUploadService, 1 /* Delayed */);

Registry.as(Extensions4.Configuration).registerConfiguration({
  id: "issueReporter",
  title: localize(16473, null),
  type: "object",
  properties: {
    "issueReporter.wizard.enabled": {
      type: "boolean",
      default: false,
      description: localize(16471, null),
      experiment: { mode: "auto" }
    },
    "issueReporter.wizard.fullWorkspaceScan": {
      type: "boolean",
      default: true,
      description: localize(16472, null),
      experiment: { mode: "auto" }
    }
  }
});

Registry.as(EditorExtensions.EditorPane).registerEditorPane(
  EditorPaneDescriptor.create(
    IssueReporterEditorPane,
    IssueReporterEditorPane.ID,
    localize(16474, null)
  ),
  [new SyncDescriptor(IssueReporterEditorInput)]
);

var NativeIssueContribution = class extends BaseIssueContribution {
  constructor(productService, configurationService) {
    super(productService, configurationService);
    if (!configurationService.getValue("telemetry.feedback.enabled")) {
      return;
    }
    if (productService.reportIssueUrl) {
      this._register(registerAction2(ReportPerformanceIssueUsingReporterAction));
    }
    let disposable;
    const registerQuickAccessProvider = () => {
      disposable = Registry.as(Extensions18.Quickaccess).registerQuickAccessProvider({
        ctor: IssueQuickAccess,
        prefix: IssueQuickAccess.PREFIX,
        contextKey: "inReportIssuePicker",
        placeholder: localize(16477, null),
        helpEntries: [{
          description: localize(16475, null),
          commandId: "workbench.action.openIssueReporter"
        }]
      });
    };
    this._register(configurationService.onDidChangeConfiguration((e) => {
      if (!configurationService.getValue("extensions.experimental.issueQuickAccess") && disposable) {
        disposable.dispose();
        disposable = void 0;
      } else if (!disposable) {
        registerQuickAccessProvider();
      }
    }));
    if (configurationService.getValue("extensions.experimental.issueQuickAccess")) {
      registerQuickAccessProvider();
    }
  }
};

NativeIssueContribution = __decorateClass([
  __decorateParam(0, IProductService),
  __decorateParam(1, IConfigurationService)
], NativeIssueContribution);

Registry.as(Extensions10.Workbench).registerWorkbenchContribution(NativeIssueContribution, 3 /* Restored */);

var ReportPerformanceIssueUsingReporterAction = class _ReportPerformanceIssueUsingReporterAction extends Action2 {
  static {
    this.ID = "workbench.action.reportPerformanceIssueUsingReporter";
  }
  constructor() {
    super({
      id: _ReportPerformanceIssueUsingReporterAction.ID,
      title: localize2(16476, "Report Performance Issue..."),
      category: Categories.Help,
      f1: true
    });
  }
  async run(accessor) {
    const issueService = accessor.get(IWorkbenchIssueService);
    return issueService.openReporter({ issueType: 1 /* PerformanceIssue */ });
  }
};

CommandsRegistry.registerCommand("_issues.getSystemStatus", (accessor) => {
  return accessor.get(IProcessService).getSystemStatus();
});
export { NativeIssueContribution, ReportPerformanceIssueUsingReporterAction };
