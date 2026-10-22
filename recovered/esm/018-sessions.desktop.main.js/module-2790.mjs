// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/viewsWelcome/chatViewsWelcomeHandler.ts
import { localize } from "./module-0001.mjs";
import { ExtensionsRegistry } from "./module-0878.mjs";
import { checkProposedApiEnabled } from "./module-0889.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { Registry } from "./module-0090.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/workbench/contrib/chat/browser/viewsWelcome/chatViewsWelcomeHandler.ts
var chatViewsWelcomeJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["icon", "title", "contents", "when"],
  properties: {
    icon: {
      type: "string",
      description: localize(11768, null)
    },
    title: {
      type: "string",
      description: localize(11769, null)
    },
    content: {
      type: "string",
      description: localize(11767, null)
    },
    when: {
      type: "string",
      description: localize(11770, null)
    }
  }
};

var chatViewsWelcomeExtensionPoint = ExtensionsRegistry.registerExtensionPoint({
  extensionPoint: "chatViewsWelcome",
  jsonSchema: {
    description: localize(11771, null),
    type: "array",
    items: chatViewsWelcomeJsonSchema
  }
});

var ChatViewsWelcomeHandler = class {
  constructor(logService) {
    this.logService = logService;
    chatViewsWelcomeExtensionPoint.setHandler((extensions, delta2) => {
      for (const extension of delta2.added) {
        for (const providerDescriptor of extension.value) {
          checkProposedApiEnabled(extension.description, "chatParticipantPrivate");
          const when = ContextKeyExpr.deserialize(providerDescriptor.when);
          if (!when) {
            this.logService.error(`Could not deserialize 'when' clause for chatViewsWelcome contribution: ${providerDescriptor.when}`);
            continue;
          }
          const descriptor = {
            ...providerDescriptor,
            when,
            icon: ThemeIcon.fromString(providerDescriptor.icon),
            content: new MarkdownString(providerDescriptor.content, { isTrusted: true })
            // private API with command links
          };
          Registry.as("workbench.registry.chat.viewsWelcome" /* ChatViewsWelcomeRegistry */).register(descriptor);
        }
      }
    });
  }
  static {
    this.ID = "workbench.contrib.chatViewsWelcomeHandler";
  }
};

ChatViewsWelcomeHandler = __decorateClass([
  __decorateParam(0, ILogService)
], ChatViewsWelcomeHandler);
export { chatViewsWelcomeJsonSchema, chatViewsWelcomeExtensionPoint, ChatViewsWelcomeHandler };
