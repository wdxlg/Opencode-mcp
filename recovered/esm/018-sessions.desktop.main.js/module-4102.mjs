// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/issue/common/issue.contribution.ts
import { Disposable } from "./module-0012.mjs";
import { CommandsRegistry } from "./module-0087.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IWorkbenchIssueService } from "./module-1852.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Categories } from "./module-0847.mjs";
import { MenuId, MenuRegistry } from "./module-0092.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IProductService } from "./module-0875.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/contrib/issue/common/issue.contribution.ts
var OpenIssueReporterActionId = "workbench.action.openIssueReporter";

var OpenIssueReporterApiId = "vscode.openIssueReporter";

var OpenIssueReporterCommandMetadata = {
  description: "Open the issue reporter and optionally prefill part of the form.",
  args: [
    {
      name: "options",
      description: "Data to use to prefill the issue reporter with.",
      isOptional: true,
      schema: {
        oneOf: [
          {
            type: "string",
            description: "The extension id to preselect."
          },
          {
            type: "object",
            properties: {
              extensionId: {
                type: "string"
              },
              issueTitle: {
                type: "string"
              },
              issueBody: {
                type: "string"
              }
            }
          }
        ]
      }
    }
  ]
};

var BaseIssueContribution = class extends Disposable {
  constructor(productService, configurationService) {
    super();
    if (!configurationService.getValue("telemetry.feedback.enabled")) {
      this._register(CommandsRegistry.registerCommand({
        id: "workbench.action.openIssueReporter",
        handler: function(accessor) {
          const data = accessor.get(INotificationService);
          data.info("Feedback is disabled.");
        }
      }));
      return;
    }
    if (!productService.reportIssueUrl) {
      return;
    }
    this._register(CommandsRegistry.registerCommand({
      id: OpenIssueReporterActionId,
      handler: function(accessor, args2) {
        const data = typeof args2 === "string" ? { extensionId: args2 } : Array.isArray(args2) ? { extensionId: args2[0] } : args2 ?? {};
        return accessor.get(IWorkbenchIssueService).openReporter(data);
      },
      metadata: OpenIssueReporterCommandMetadata
    }));
    this._register(CommandsRegistry.registerCommand({
      id: OpenIssueReporterApiId,
      handler: function(accessor, args2) {
        const data = typeof args2 === "string" ? { extensionId: args2 } : Array.isArray(args2) ? { extensionId: args2[0] } : args2 ?? {};
        return accessor.get(IWorkbenchIssueService).openReporter(data);
      },
      metadata: OpenIssueReporterCommandMetadata
    }));
    const reportIssue = {
      id: OpenIssueReporterActionId,
      title: localize2(16470, "Report Issue..."),
      category: Categories.Help
    };
    this._register(MenuRegistry.appendMenuItem(MenuId.CommandPalette, { command: reportIssue }));
    this._register(MenuRegistry.appendMenuItem(MenuId.MenubarHelpMenu, {
      group: "3_feedback",
      command: {
        id: OpenIssueReporterActionId,
        title: localize(16469, null)
      },
      order: 3
    }));
  }
};

BaseIssueContribution = __decorateClass([
  __decorateParam(0, IProductService),
  __decorateParam(1, IConfigurationService)
], BaseIssueContribution);
export { OpenIssueReporterActionId, OpenIssueReporterApiId, OpenIssueReporterCommandMetadata, BaseIssueContribution };
