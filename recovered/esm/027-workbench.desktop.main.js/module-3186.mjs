// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/debug/common/debugSchemas.ts
import { ExtensionsRegistry } from "./module-0876.mjs";
import { localize } from "./module-0001.mjs";
import { launchSchemaId } from "./module-1198.mjs";
import { inputsSchema } from "./module-1420.mjs";
import { Disposable } from "./module-0012.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions11 } from "./module-0877.mjs";
import { SyncDescriptor } from "./module-0134.mjs";


// src/vs/workbench/contrib/debug/common/debugSchemas.ts
var debuggersExtPoint = ExtensionsRegistry.registerExtensionPoint({
  extensionPoint: "debuggers",
  defaultExtensionKind: ["workspace"],
  jsonSchema: {
    description: localize(14839, null),
    type: "array",
    defaultSnippets: [{ body: [{ type: "" }] }],
    items: {
      additionalProperties: false,
      type: "object",
      defaultSnippets: [{ body: { type: "", program: "", runtime: "" } }],
      properties: {
        type: {
          description: localize(14857, null),
          type: "string"
        },
        label: {
          description: localize(14846, null),
          type: "string"
        },
        program: {
          description: localize(14852, null),
          type: "string"
        },
        args: {
          description: localize(14840, null),
          type: "array"
        },
        runtime: {
          description: localize(14853, null),
          type: "string"
        },
        runtimeArgs: {
          description: localize(14854, null),
          type: "array"
        },
        variables: {
          description: localize(14858, null),
          type: "object"
        },
        initialConfigurations: {
          description: localize(14845, null),
          type: ["array", "string"]
        },
        languages: {
          description: localize(14847, null),
          type: "array"
        },
        configurationSnippets: {
          description: localize(14842, null),
          type: "array"
        },
        configurationAttributes: {
          description: localize(14841, null),
          type: "object"
        },
        when: {
          description: localize(14859, null),
          type: "string",
          default: ""
        },
        hiddenWhen: {
          description: localize(14844, null),
          type: "string",
          default: ""
        },
        deprecated: {
          description: localize(14843, null),
          type: "string",
          default: ""
        },
        windows: {
          description: localize(14860, null),
          type: "object",
          properties: {
            runtime: {
              description: localize(14861, null),
              type: "string"
            }
          }
        },
        osx: {
          description: localize(14850, null),
          type: "object",
          properties: {
            runtime: {
              description: localize(14851, null),
              type: "string"
            }
          }
        },
        linux: {
          description: localize(14848, null),
          type: "object",
          properties: {
            runtime: {
              description: localize(14849, null),
              type: "string"
            }
          }
        },
        strings: {
          description: localize(14855, null),
          type: "object",
          properties: {
            unverifiedBreakpoints: {
              description: localize(14856, null),
              type: "string"
            }
          }
        }
      }
    }
  }
});

var breakpointsExtPoint = ExtensionsRegistry.registerExtensionPoint({
  extensionPoint: "breakpoints",
  jsonSchema: {
    description: localize(14836, null),
    type: "array",
    defaultSnippets: [{ body: [{ language: "" }] }],
    items: {
      type: "object",
      additionalProperties: false,
      defaultSnippets: [{ body: { language: "" } }],
      properties: {
        language: {
          description: localize(14837, null),
          type: "string"
        },
        when: {
          description: localize(14838, null),
          type: "string",
          default: ""
        }
      }
    }
  }
});

var presentationSchema = {
  type: "object",
  description: localize(14831, null),
  properties: {
    hidden: {
      type: "boolean",
      default: false,
      description: localize(14833, null)
    },
    group: {
      type: "string",
      default: "",
      description: localize(14832, null)
    },
    order: {
      type: "number",
      default: 1,
      description: localize(14834, null)
    }
  },
  default: {
    hidden: false,
    group: "",
    order: 1
  }
};

var defaultCompound = { name: "Compound", configurations: [] };

var launchSchema = {
  id: launchSchemaId,
  type: "object",
  title: localize(14825, null),
  allowTrailingCommas: true,
  allowComments: true,
  required: [],
  default: { version: "0.2.0", configurations: [], compounds: [] },
  properties: {
    version: {
      type: "string",
      description: localize(14826, null),
      default: "0.2.0"
    },
    configurations: {
      type: "array",
      description: localize(14824, null),
      items: {
        defaultSnippets: [],
        "type": "object",
        oneOf: []
      }
    },
    compounds: {
      type: "array",
      description: localize(14822, null),
      items: {
        type: "object",
        required: ["name", "configurations"],
        properties: {
          name: {
            type: "string",
            description: localize(14820, null)
          },
          presentation: presentationSchema,
          configurations: {
            type: "array",
            default: [],
            items: {
              oneOf: [{
                enum: [],
                description: localize(14835, null)
              }, {
                type: "object",
                required: ["name"],
                properties: {
                  name: {
                    enum: [],
                    description: localize(14820, null)
                  },
                  folder: {
                    enum: [],
                    description: localize(14819, null)
                  }
                }
              }]
            },
            description: localize(14823, null)
          },
          stopAll: {
            type: "boolean",
            default: false,
            description: localize(14821, null)
          },
          preLaunchTask: {
            type: "string",
            default: "",
            description: localize(14827, null)
          }
        },
        default: defaultCompound
      },
      default: [
        defaultCompound
      ]
    },
    inputs: inputsSchema.definitions.inputs
  }
};

var DebuggersDataRenderer = class extends Disposable {
  constructor() {
    super(...arguments);
    this.type = "table";
  }
  shouldRender(manifest) {
    return !!manifest.contributes?.debuggers;
  }
  render(manifest) {
    const contrib = manifest.contributes?.debuggers || [];
    if (!contrib.length) {
      return { data: { headers: [], rows: [] }, dispose: () => {
      } };
    }
    const headers = [
      localize(14828, null),
      localize(14829, null)
    ];
    const rows = contrib.map((d) => {
      return [
        d.label ?? "",
        d.type
      ];
    });
    return {
      data: {
        headers,
        rows
      },
      dispose: () => {
      }
    };
  }
};

Registry.as(Extensions11.ExtensionFeaturesRegistry).registerExtensionFeature({
  id: "debuggers",
  label: localize(14830, null),
  access: {
    canToggle: false
  },
  renderer: new SyncDescriptor(DebuggersDataRenderer)
});
export { debuggersExtPoint, breakpointsExtPoint, presentationSchema, defaultCompound, launchSchema, DebuggersDataRenderer };
