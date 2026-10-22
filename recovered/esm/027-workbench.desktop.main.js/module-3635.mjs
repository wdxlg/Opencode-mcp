// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/remoteCodingAgents/browser/remoteCodingAgents.contribution.ts
import { ExtensionsRegistry } from "./module-0876.mjs";
import { localize } from "./module-0001.mjs";
import { Disposable } from "./module-0012.mjs";
import { isProposedApiEnabled } from "./module-0887.mjs";
import { MenuRegistry } from "./module-0092.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IRemoteCodingAgentsService } from "./module-2804.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions10 } from "./module-0870.mjs";


// src/vs/workbench/contrib/remoteCodingAgents/browser/remoteCodingAgents.contribution.ts
var extensionPoint4 = ExtensionsRegistry.registerExtensionPoint({
  extensionPoint: "remoteCodingAgents",
  jsonSchema: {
    description: localize(18648, null),
    type: "array",
    items: {
      type: "object",
      properties: {
        id: {
          description: localize(18653, null),
          type: "string"
        },
        command: {
          description: localize(18649, null),
          type: "string"
        },
        displayName: {
          description: localize(18651, null),
          type: "string"
        },
        description: {
          description: localize(18650, null),
          type: "string"
        },
        followUpRegex: {
          description: localize(18652, null),
          type: "string"
        },
        when: {
          description: localize(18654, null),
          type: "string"
        }
      },
      required: ["command", "displayName"]
    }
  }
});

var RemoteCodingAgentsContribution = class extends Disposable {
  constructor(remoteCodingAgentsService) {
    super();
    this.remoteCodingAgentsService = remoteCodingAgentsService;
    extensionPoint4.setHandler((extensions) => {
      for (const ext of extensions) {
        if (!isProposedApiEnabled(ext.description, "remoteCodingAgents")) {
          continue;
        }
        if (!Array.isArray(ext.value)) {
          continue;
        }
        for (const contribution of ext.value) {
          const command4 = MenuRegistry.getCommand(contribution.command);
          if (!command4) {
            continue;
          }
          const agent = {
            id: contribution.id,
            command: contribution.command,
            displayName: contribution.displayName,
            description: contribution.description,
            followUpRegex: contribution.followUpRegex,
            when: contribution.when
          };
          this.remoteCodingAgentsService.registerAgent(agent);
        }
      }
    });
  }
};

RemoteCodingAgentsContribution = __decorateClass([
  __decorateParam(0, IRemoteCodingAgentsService)
], RemoteCodingAgentsContribution);

var workbenchRegistry7 = Registry.as(Extensions10.Workbench);

workbenchRegistry7.registerWorkbenchContribution(RemoteCodingAgentsContribution, 3 /* Restored */);
export { extensionPoint4, RemoteCodingAgentsContribution, workbenchRegistry7 };
