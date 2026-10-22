// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/extensions/common/reportExtensionIssueAction.ts
import { Action } from "./module-0082.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IWorkbenchIssueService } from "./module-1876.mjs";


// src/vs/workbench/contrib/extensions/common/reportExtensionIssueAction.ts
var ReportExtensionIssueAction = class extends Action {
  // TODO: Consider passing in IExtensionStatus or IExtensionHostProfile for additional data
  constructor(extension, issueService) {
    super(ReportExtensionIssueAction._id, ReportExtensionIssueAction._label, "extension-action report-issue");
    this.extension = extension;
    this.issueService = issueService;
    this.enabled = extension.isBuiltin || !!extension.repository && !!extension.repository.url;
  }
  static {
    this._id = "workbench.extensions.action.reportExtensionIssue";
  }
  static {
    this._label = localize(15609, null);
  }
  async run() {
    await this.issueService.openReporter({
      extensionId: this.extension.identifier.value
    });
  }
};

ReportExtensionIssueAction = __decorateClass([
  __decorateParam(1, IWorkbenchIssueService)
], ReportExtensionIssueAction);
export { ReportExtensionIssueAction };
