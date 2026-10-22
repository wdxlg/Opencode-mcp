// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/themes/common/productIconThemeSchema.ts
import { localize } from "./module-0001.mjs";
import { fontIdErrorMessage, fontIdRegex, fontStyleRegex, fontWeightRegex, iconsSchemaId } from "./module-0479.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions3 } from "./module-0138.mjs";


// src/vs/workbench/services/themes/common/productIconThemeSchema.ts
var schemaId4 = "vscode://schemas/product-icon-theme";

var schema5 = {
  type: "object",
  allowComments: true,
  allowTrailingCommas: true,
  properties: {
    fonts: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: localize(23532, null),
            pattern: fontIdRegex.source,
            patternErrorMessage: fontIdErrorMessage
          },
          src: {
            type: "array",
            description: localize(23533, null),
            items: {
              type: "object",
              properties: {
                path: {
                  type: "string",
                  description: localize(23528, null)
                },
                format: {
                  type: "string",
                  description: localize(23527, null),
                  enum: ["woff", "woff2", "truetype", "opentype", "embedded-opentype", "svg"]
                }
              },
              required: [
                "path",
                "format"
              ]
            }
          },
          weight: {
            type: "string",
            description: localize(23530, null),
            anyOf: [
              { enum: ["normal", "bold", "lighter", "bolder"] },
              { type: "string", pattern: fontWeightRegex.source }
            ]
          },
          style: {
            type: "string",
            description: localize(23529, null),
            anyOf: [
              { enum: ["normal", "italic", "oblique"] },
              { type: "string", pattern: fontStyleRegex.source }
            ]
          }
        },
        required: [
          "id",
          "src"
        ]
      }
    },
    iconDefinitions: {
      description: localize(23531, null),
      $ref: iconsSchemaId
    }
  }
};

function registerProductIconThemeSchemas() {
  const schemaRegistry8 = Registry.as(Extensions3.JSONContribution);
  schemaRegistry8.registerSchema(schemaId4, schema5);
}
export { registerProductIconThemeSchemas, schemaId4, schema5 };
