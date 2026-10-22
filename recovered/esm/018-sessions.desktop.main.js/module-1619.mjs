// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/themes/common/fileIconThemeSchema.ts
import { localize } from "./module-0001.mjs";
import { fontColorRegex, fontIdErrorMessage, fontIdRegex, fontSizeRegex, fontStyleRegex, fontWeightRegex } from "./module-0479.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions3 } from "./module-0138.mjs";


// src/vs/workbench/services/themes/common/fileIconThemeSchema.ts
var schemaId3 = "vscode://schemas/icon-theme";

var schema4 = {
  type: "object",
  allowComments: true,
  allowTrailingCommas: true,
  definitions: {
    folderExpanded: {
      type: "string",
      description: localize(23482, null)
    },
    folder: {
      type: "string",
      description: localize(23481, null)
    },
    file: {
      type: "string",
      description: localize(23476, null)
    },
    rootFolder: {
      type: "string",
      description: localize(23506, null)
    },
    rootFolderExpanded: {
      type: "string",
      description: localize(23507, null)
    },
    rootFolderNames: {
      type: "object",
      description: localize(23509, null),
      additionalProperties: {
        type: "string",
        description: localize(23483, null)
      }
    },
    rootFolderNamesExpanded: {
      type: "object",
      description: localize(23510, null),
      additionalProperties: {
        type: "string",
        description: localize(23508, null)
      }
    },
    folderNames: {
      type: "object",
      description: localize(23485, null),
      additionalProperties: {
        type: "string",
        description: localize(23483, null)
      }
    },
    folderNamesExpanded: {
      type: "object",
      description: localize(23486, null),
      additionalProperties: {
        type: "string",
        description: localize(23484, null)
      }
    },
    fileExtensions: {
      type: "object",
      description: localize(23478, null),
      additionalProperties: {
        type: "string",
        description: localize(23477, null)
      }
    },
    fileNames: {
      type: "object",
      description: localize(23480, null),
      additionalProperties: {
        type: "string",
        description: localize(23479, null)
      }
    },
    languageIds: {
      type: "object",
      description: localize(23504, null),
      additionalProperties: {
        type: "string",
        description: localize(23503, null)
      }
    },
    associations: {
      type: "object",
      properties: {
        folderExpanded: {
          $ref: "#/definitions/folderExpanded"
        },
        folder: {
          $ref: "#/definitions/folder"
        },
        file: {
          $ref: "#/definitions/file"
        },
        folderNames: {
          $ref: "#/definitions/folderNames"
        },
        folderNamesExpanded: {
          $ref: "#/definitions/folderNamesExpanded"
        },
        rootFolder: {
          $ref: "#/definitions/rootFolder"
        },
        rootFolderExpanded: {
          $ref: "#/definitions/rootFolderExpanded"
        },
        rootFolderNames: {
          $ref: "#/definitions/rootFolderNames"
        },
        rootFolderNamesExpanded: {
          $ref: "#/definitions/rootFolderNamesExpanded"
        },
        fileExtensions: {
          $ref: "#/definitions/fileExtensions"
        },
        fileNames: {
          $ref: "#/definitions/fileNames"
        },
        languageIds: {
          $ref: "#/definitions/languageIds"
        }
      }
    }
  },
  properties: {
    fonts: {
      type: "array",
      description: localize(23495, null),
      items: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: localize(23502, null),
            pattern: fontIdRegex.source,
            patternErrorMessage: fontIdErrorMessage
          },
          src: {
            type: "array",
            description: localize(23512, null),
            items: {
              type: "object",
              properties: {
                path: {
                  type: "string",
                  description: localize(23488, null)
                },
                format: {
                  type: "string",
                  description: localize(23487, null),
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
            description: localize(23491, null),
            pattern: fontWeightRegex.source
          },
          style: {
            type: "string",
            description: localize(23490, null),
            pattern: fontStyleRegex.source
          },
          size: {
            type: "string",
            description: localize(23489, null),
            pattern: fontSizeRegex.source
          }
        },
        required: [
          "id",
          "src"
        ]
      }
    },
    iconDefinitions: {
      type: "object",
      description: localize(23500, null),
      additionalProperties: {
        type: "object",
        description: localize(23499, null),
        properties: {
          iconPath: {
            type: "string",
            description: localize(23501, null)
          },
          fontCharacter: {
            type: "string",
            description: localize(23492, null)
          },
          fontColor: {
            type: "string",
            format: "color-hex",
            description: localize(23493, null),
            pattern: fontColorRegex.source
          },
          fontSize: {
            type: "string",
            description: localize(23496, null),
            pattern: fontSizeRegex.source
          },
          fontId: {
            type: "string",
            description: localize(23494, null),
            pattern: fontIdRegex.source,
            patternErrorMessage: fontIdErrorMessage
          }
        }
      }
    },
    usesCurrentColor: {
      type: "boolean",
      description: localize(23513, null)
    },
    folderExpanded: {
      $ref: "#/definitions/folderExpanded"
    },
    folder: {
      $ref: "#/definitions/folder"
    },
    file: {
      $ref: "#/definitions/file"
    },
    folderNames: {
      $ref: "#/definitions/folderNames"
    },
    folderNamesExpanded: {
      $ref: "#/definitions/folderNamesExpanded"
    },
    rootFolder: {
      $ref: "#/definitions/rootFolder"
    },
    rootFolderExpanded: {
      $ref: "#/definitions/rootFolderExpanded"
    },
    rootFolderNames: {
      $ref: "#/definitions/rootFolderNames"
    },
    rootFolderNamesExpanded: {
      $ref: "#/definitions/rootFolderNamesExpanded"
    },
    fileExtensions: {
      $ref: "#/definitions/fileExtensions"
    },
    fileNames: {
      $ref: "#/definitions/fileNames"
    },
    languageIds: {
      $ref: "#/definitions/languageIds"
    },
    light: {
      $ref: "#/definitions/associations",
      description: localize(23505, null)
    },
    highContrast: {
      $ref: "#/definitions/associations",
      description: localize(23498, null)
    },
    hidesExplorerArrows: {
      type: "boolean",
      description: localize(23497, null)
    },
    showLanguageModeIcons: {
      type: "boolean",
      description: localize(23511, null)
    }
  }
};

function registerFileIconThemeSchemas() {
  const schemaRegistry8 = Registry.as(Extensions3.JSONContribution);
  schemaRegistry8.registerSchema(schemaId3, schema4);
}
export { registerFileIconThemeSchemas, schemaId3, schema4 };
