// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/contextContrib/chatContext.contribution.ts
import { ExtensionsRegistry } from "./module-0878.mjs";
import { localize } from "./module-0001.mjs";
import { Disposable } from "./module-0012.mjs";
import { isProposedApiEnabled } from "./module-0889.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatContextService } from "./module-1453.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";


// src/vs/workbench/contrib/chat/browser/contextContrib/chatContext.contribution.ts
var extensionPoint2 = ExtensionsRegistry.registerExtensionPoint({
  extensionPoint: "chatContext",
  jsonSchema: {
    description: localize(11319, null),
    type: "array",
    items: {
      type: "object",
      properties: {
        id: {
          description: localize(11321, null),
          type: "string"
        },
        icon: {
          description: localize(11320, null),
          type: "string"
        },
        displayName: {
          description: localize(11323, null),
          type: "string"
        }
      },
      required: ["id", "icon", "displayName"]
    }
  },
  activationEventsGenerator: function* (contributions) {
    for (const contrib of contributions) {
      yield `onChatContextProvider:${contrib.id}`;
    }
  }
});

var ChatContextContribution = class extends Disposable {
  constructor(_chatContextService) {
    super();
    this._chatContextService = _chatContextService;
    extensionPoint2.setHandler((extensions) => {
      for (const ext of extensions) {
        if (!isProposedApiEnabled(ext.description, "chatContextProvider")) {
          continue;
        }
        if (!Array.isArray(ext.value)) {
          continue;
        }
        for (const contribution of ext.value) {
          const icon2 = contribution.icon ? ThemeIcon.fromString(contribution.icon) : void 0;
          if (!icon2 && contribution.icon) {
            ext.collector.error(localize(11322, null, contribution.id, "$(iconId)", "$(iconId~spin)", "$(copilot)"));
            continue;
          }
          if (!icon2) {
            continue;
          }
          this._chatContextService.setChatContextProvider(`${ext.description.id}-${contribution.id}`, { title: contribution.displayName, icon: icon2 });
        }
      }
    });
  }
  static {
    this.ID = "workbench.contrib.chatContextContribution";
  }
};

ChatContextContribution = __decorateClass([
  __decorateParam(0, IChatContextService)
], ChatContextContribution);

registerWorkbenchContribution2(ChatContextContribution.ID, ChatContextContribution, WorkbenchPhase.AfterRestored);
export { extensionPoint2, ChatContextContribution };
