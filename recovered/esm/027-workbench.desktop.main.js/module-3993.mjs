// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/issue/browser/issueReporterService.ts
import { BaseIssueReporterService } from "./module-3992.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IIssueFormService } from "./module-1876.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IFileService } from "./module-0269.mjs";
import { IFileDialogService } from "./module-0267.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IAuthenticationService } from "./module-0951.mjs";
import { IOpenerService } from "./module-0272.mjs";


// src/vs/workbench/contrib/issue/browser/issueReporterService.ts
var IssueWebReporter = class extends BaseIssueReporterService {
  constructor(disableExtensions, data, os, product2, window2, issueFormService, themeService, fileService, fileDialogService, contextMenuService, authenticationService, openerService) {
    super(disableExtensions, data, os, product2, window2, true, issueFormService, themeService, fileService, fileDialogService, contextMenuService, authenticationService, openerService);
    const target = this.window.document.querySelector(".block-system .block-info");
    const webInfo = this.window.navigator.userAgent;
    if (webInfo) {
      target?.appendChild(this.window.document.createTextNode(webInfo));
      this.receivedSystemInfo = true;
      this.issueReporterModel.update({ systemInfoWeb: webInfo });
    }
    this.setEventHandlers();
  }
  setEventHandlers() {
    super.setEventHandlers();
    this.addEventListener("issue-type", "change", (event) => {
      const issueType = parseInt(event.target.value);
      this.issueReporterModel.update({ issueType });
      const descriptionTextArea = this.getElementById("issue-title");
      if (descriptionTextArea) {
        descriptionTextArea.placeholder = localize(16416, null);
      }
      this.updateButtonStates();
      this.setSourceOptions();
      this.render();
    });
  }
};

IssueWebReporter = __decorateClass([
  __decorateParam(5, IIssueFormService),
  __decorateParam(6, IThemeService),
  __decorateParam(7, IFileService),
  __decorateParam(8, IFileDialogService),
  __decorateParam(9, IContextMenuService),
  __decorateParam(10, IAuthenticationService),
  __decorateParam(11, IOpenerService)
], IssueWebReporter);
export { IssueWebReporter };
