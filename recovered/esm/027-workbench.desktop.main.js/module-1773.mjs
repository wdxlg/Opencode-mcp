// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/textMate/common/TMGrammars.ts
import { ExtensionsRegistry } from "./module-0876.mjs";
import { languagesExtPoint } from "./module-1357.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/services/textMate/common/TMGrammars.ts
var grammarsExtPoint = ExtensionsRegistry.registerExtensionPoint({
  extensionPoint: "grammars",
  deps: [languagesExtPoint],
  jsonSchema: {
    description: localize(23398, null),
    type: "array",
    defaultSnippets: [{ body: [{ language: "${1:id}", scopeName: "source.${2:id}", path: "./syntaxes/${3:id}.tmLanguage." }] }],
    items: {
      type: "object",
      defaultSnippets: [{ body: { language: "${1:id}", scopeName: "source.${2:id}", path: "./syntaxes/${3:id}.tmLanguage." } }],
      properties: {
        language: {
          description: localize(23402, null),
          type: "string"
        },
        scopeName: {
          description: localize(23404, null),
          type: "string"
        },
        path: {
          description: localize(23403, null),
          type: "string"
        },
        embeddedLanguages: {
          description: localize(23400, null),
          type: "object"
        },
        tokenTypes: {
          description: localize(23405, null),
          type: "object",
          additionalProperties: {
            enum: ["string", "comment", "other", "regex"]
          }
        },
        injectTo: {
          description: localize(23401, null),
          type: "array",
          items: {
            type: "string"
          }
        },
        balancedBracketScopes: {
          description: localize(23399, null),
          type: "array",
          items: {
            type: "string"
          },
          default: ["*"]
        },
        unbalancedBracketScopes: {
          description: localize(23406, null),
          type: "array",
          items: {
            type: "string"
          },
          default: []
        }
      },
      required: ["scopeName", "path"]
    }
  }
});
export { grammarsExtPoint };
