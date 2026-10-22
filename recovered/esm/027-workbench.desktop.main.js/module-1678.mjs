// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/themes/common/colorThemeSchema.ts
import { localize } from "./module-0001.mjs";
import { workbenchColorsSchemaId } from "./module-0226.mjs";
import { tokenStylingSchemaId } from "./module-0881.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions3 } from "./module-0138.mjs";


// src/vs/workbench/services/themes/common/colorThemeSchema.ts
var textMateScopes = [
  "comment",
  "comment.block",
  "comment.block.documentation",
  "comment.line",
  "constant",
  "constant.character",
  "constant.character.escape",
  "constant.numeric",
  "constant.numeric.integer",
  "constant.numeric.float",
  "constant.numeric.hex",
  "constant.numeric.octal",
  "constant.other",
  "constant.regexp",
  "constant.rgb-value",
  "emphasis",
  "entity",
  "entity.name",
  "entity.name.class",
  "entity.name.function",
  "entity.name.method",
  "entity.name.section",
  "entity.name.selector",
  "entity.name.tag",
  "entity.name.type",
  "entity.other",
  "entity.other.attribute-name",
  "entity.other.inherited-class",
  "invalid",
  "invalid.deprecated",
  "invalid.illegal",
  "keyword",
  "keyword.control",
  "keyword.operator",
  "keyword.operator.new",
  "keyword.operator.assignment",
  "keyword.operator.arithmetic",
  "keyword.operator.logical",
  "keyword.other",
  "markup",
  "markup.bold",
  "markup.changed",
  "markup.deleted",
  "markup.heading",
  "markup.inline.raw",
  "markup.inserted",
  "markup.italic",
  "markup.list",
  "markup.list.numbered",
  "markup.list.unnumbered",
  "markup.other",
  "markup.quote",
  "markup.raw",
  "markup.underline",
  "markup.underline.link",
  "meta",
  "meta.block",
  "meta.cast",
  "meta.class",
  "meta.function",
  "meta.function-call",
  "meta.preprocessor",
  "meta.return-type",
  "meta.selector",
  "meta.tag",
  "meta.type.annotation",
  "meta.type",
  "punctuation.definition.string.begin",
  "punctuation.definition.string.end",
  "punctuation.separator",
  "punctuation.separator.continuation",
  "punctuation.terminator",
  "storage",
  "storage.modifier",
  "storage.type",
  "string",
  "string.interpolated",
  "string.other",
  "string.quoted",
  "string.quoted.double",
  "string.quoted.other",
  "string.quoted.single",
  "string.quoted.triple",
  "string.regexp",
  "string.unquoted",
  "strong",
  "support",
  "support.class",
  "support.constant",
  "support.function",
  "support.other",
  "support.type",
  "support.type.property-name",
  "support.variable",
  "variable",
  "variable.language",
  "variable.name",
  "variable.other",
  "variable.other.readwrite",
  "variable.parameter"
];

var textmateColorsSchemaId = "vscode://schemas/textmate-colors";

var textmateColorGroupSchemaId = `${textmateColorsSchemaId}#/definitions/colorGroup`;

var textmateColorSchema = {
  type: "array",
  definitions: {
    colorGroup: {
      default: "#FF0000",
      anyOf: [
        {
          type: "string",
          format: "color-hex"
        },
        {
          $ref: "#/definitions/settings"
        }
      ]
    },
    settings: {
      type: "object",
      description: localize(23473, null),
      properties: {
        foreground: {
          type: "string",
          description: localize(23471, null),
          format: "color-hex",
          default: "#ff0000"
        },
        background: {
          type: "string",
          deprecationMessage: localize(23466, null)
        },
        fontStyle: {
          type: "string",
          description: localize(23469, null),
          pattern: "^(\\s*\\b(italic|bold|underline|strikethrough))*\\s*$",
          patternErrorMessage: localize(23461, null),
          defaultSnippets: [
            { label: localize(23470, null), bodyText: '""' },
            { body: "italic" },
            { body: "bold" },
            { body: "underline" },
            { body: "strikethrough" },
            { body: "italic bold" },
            { body: "italic underline" },
            { body: "italic strikethrough" },
            { body: "bold underline" },
            { body: "bold strikethrough" },
            { body: "underline strikethrough" },
            { body: "italic bold underline" },
            { body: "italic bold strikethrough" },
            { body: "italic underline strikethrough" },
            { body: "bold underline strikethrough" },
            { body: "italic bold underline strikethrough" }
          ]
        },
        fontFamily: {
          type: "string",
          description: localize(23467, null)
        },
        fontSize: {
          type: "number",
          description: localize(23468, null)
        },
        lineHeight: {
          type: "number",
          description: localize(23472, null)
        }
      },
      additionalProperties: false,
      defaultSnippets: [{ body: { foreground: "${1:#FF0000}", fontStyle: "${2:bold}" } }]
    }
  },
  items: {
    type: "object",
    defaultSnippets: [{ body: { scope: "${1:keyword.operator}", settings: { foreground: "${2:#FF0000}" } } }],
    properties: {
      name: {
        type: "string",
        description: localize(23462, null)
      },
      scope: {
        description: localize(23463, null),
        anyOf: [
          {
            enum: textMateScopes
          },
          {
            type: "string"
          },
          {
            type: "array",
            items: {
              enum: textMateScopes
            }
          },
          {
            type: "array",
            items: {
              type: "string"
            }
          }
        ]
      },
      settings: {
        $ref: "#/definitions/settings"
      }
    },
    required: [
      "settings"
    ],
    additionalProperties: false
  }
};

var colorThemeSchemaId = "vscode://schemas/color-theme";

var colorThemeSchema = {
  type: "object",
  allowComments: true,
  allowTrailingCommas: true,
  properties: {
    colors: {
      description: localize(23475, null),
      $ref: workbenchColorsSchemaId,
      additionalProperties: false
    },
    tokenColors: {
      anyOf: [
        {
          type: "string",
          description: localize(23474, null)
        },
        {
          description: localize(23460, null),
          $ref: textmateColorsSchemaId
        }
      ]
    },
    semanticHighlighting: {
      type: "boolean",
      description: localize(23465, null)
    },
    semanticTokenColors: {
      type: "object",
      description: localize(23464, null),
      $ref: tokenStylingSchemaId
    }
  }
};

function registerColorThemeSchemas() {
  const schemaRegistry8 = Registry.as(Extensions3.JSONContribution);
  schemaRegistry8.registerSchema(colorThemeSchemaId, colorThemeSchema);
  schemaRegistry8.registerSchema(textmateColorsSchemaId, textmateColorSchema);
}
export { registerColorThemeSchemas, textMateScopes, textmateColorsSchemaId, textmateColorGroupSchemaId, textmateColorSchema, colorThemeSchemaId, colorThemeSchema };
