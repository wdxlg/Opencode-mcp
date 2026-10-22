// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/extensions/common/extensionsFileTemplate.ts
import { localize } from "./module-0001.mjs";
import { EXTENSION_IDENTIFIER_PATTERN } from "./module-0874.mjs";


// src/vs/workbench/contrib/extensions/common/extensionsFileTemplate.ts
var ExtensionsConfigurationSchemaId = "vscode://schemas/extensions";

var ExtensionsConfigurationSchema = {
  id: ExtensionsConfigurationSchemaId,
  allowComments: true,
  allowTrailingCommas: true,
  type: "object",
  title: localize(15602, null),
  additionalProperties: false,
  properties: {
    recommendations: {
      type: "array",
      description: localize(15601, null),
      items: {
        type: "string",
        pattern: EXTENSION_IDENTIFIER_PATTERN,
        errorMessage: localize(15600, null)
      }
    },
    unwantedRecommendations: {
      type: "array",
      description: localize(15603, null),
      items: {
        type: "string",
        pattern: EXTENSION_IDENTIFIER_PATTERN,
        errorMessage: localize(15600, null)
      }
    }
  }
};

var ExtensionsConfigurationInitialContent = [
  "{",
  "	// See https://go.microsoft.com/fwlink/?LinkId=827846 to learn about workspace recommendations.",
  "	// Extension identifier format: ${publisher}.${name}. Example: vscode.csharp",
  "",
  "	// List of extensions which should be recommended for users of this workspace.",
  '	"recommendations": [',
  "		",
  "	],",
  "	// List of extensions recommended by VS Code that should not be recommended for users of this workspace.",
  '	"unwantedRecommendations": [',
  "		",
  "	]",
  "}"
].join("\n");
export { ExtensionsConfigurationSchemaId, ExtensionsConfigurationSchema, ExtensionsConfigurationInitialContent };
