// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/issue/browser/issueReporterEditorInput.ts
import { registerIcon } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { EditorInput } from "./module-0928.mjs";
import { URI } from "./module-0032.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IDialogService } from "./module-0267.mjs";


// src/vs/workbench/contrib/issue/browser/issueReporterEditorInput.ts
var issueReporterIcon = registerIcon("issue-reporter", Codicon.report, localize(16286, null));

var IssueReporterEditorInput = class extends EditorInput {
  constructor(data, dialogService) {
    super();
    this.dialogService = dialogService;
    this.data = data;
    this.closeHandler = {
      showConfirm: () => !!this.hasUserInputFn?.(),
      confirm: async () => {
        const { confirmed } = await this.dialogService.confirm({
          message: localize(16283, null),
          detail: localize(16284, null),
          primaryButton: localize(16282, null),
          type: "warning"
        });
        return confirmed ? 1 /* DONT_SAVE */ : 2 /* CANCEL */;
      }
    };
  }
  static {
    this.ID = "workbench.input.issueReporter";
  }
  static {
    this.RESOURCE = URI.from({ scheme: "vscode-issue-reporter", path: "reporter" });
  }
  get typeId() {
    return IssueReporterEditorInput.ID;
  }
  get editorId() {
    return this.typeId;
  }
  get resource() {
    return IssueReporterEditorInput.RESOURCE;
  }
  getName() {
    return localize(16285, null);
  }
  getIcon() {
    return issueReporterIcon;
  }
  matches(other) {
    return other instanceof IssueReporterEditorInput;
  }
  get capabilities() {
    return 8 /* Singleton */ | 2 /* Readonly */;
  }
};

IssueReporterEditorInput = __decorateClass([
  __decorateParam(1, IDialogService)
], IssueReporterEditorInput);
export { issueReporterIcon, IssueReporterEditorInput };
