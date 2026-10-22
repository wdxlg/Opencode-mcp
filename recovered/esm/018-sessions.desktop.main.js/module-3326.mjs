// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/welcomeViews/common/viewsWelcomeExtensionPoint.ts
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/welcomeViews/common/viewsWelcomeExtensionPoint.ts
var ViewIdentifierMap = {
  "explorer": "workbench.explorer.emptyView",
  "debug": "workbench.debug.welcome",
  "scm": "workbench.scm",
  "testing": "workbench.view.testing"
};

var viewsWelcomeExtensionPointSchema = Object.freeze({
  type: "array",
  description: localize(22254, null),
  items: {
    type: "object",
    description: localize(22255, null),
    required: [
      "view" /* view */,
      "contents" /* contents */
    ],
    properties: {
      ["view" /* view */]: {
        anyOf: [
          {
            type: "string",
            description: localize(22259, null)
          },
          {
            type: "string",
            description: localize(22259, null),
            enum: Object.keys(ViewIdentifierMap)
          }
        ]
      },
      ["contents" /* contents */]: {
        type: "string",
        description: localize(22256, null)
      },
      ["when" /* when */]: {
        type: "string",
        description: localize(22260, null)
      },
      ["group" /* group */]: {
        type: "string",
        description: localize(22258, null)
      },
      ["enablement" /* enablement */]: {
        type: "string",
        description: localize(22257, null)
      }
    }
  }
});

var viewsWelcomeExtensionPointDescriptor = {
  extensionPoint: "viewsWelcome",
  jsonSchema: viewsWelcomeExtensionPointSchema
};
export { ViewIdentifierMap, viewsWelcomeExtensionPointSchema, viewsWelcomeExtensionPointDescriptor };
