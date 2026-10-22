// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/tasks/common/jsonSchemaCommon.ts
import { localize } from "./module-0001.mjs";
import { Schemas2 } from "./module-3464.mjs";


// src/vs/workbench/contrib/tasks/common/jsonSchemaCommon.ts
var schema6 = {
  definitions: {
    showOutputType: {
      type: "string",
      enum: ["always", "silent", "never"]
    },
    options: {
      type: "object",
      description: localize(19768, null),
      properties: {
        cwd: {
          type: "string",
          description: localize(19769, null)
        },
        env: {
          type: "object",
          additionalProperties: {
            type: "string"
          },
          description: localize(19770, null)
        }
      },
      additionalProperties: {
        type: ["string", "array", "object"]
      }
    },
    problemMatcherType: {
      oneOf: [
        {
          type: "string",
          errorMessage: localize(19783, null)
        },
        Schemas2.LegacyProblemMatcher,
        {
          type: "array",
          items: {
            anyOf: [
              {
                type: "string",
                errorMessage: localize(19783, null)
              },
              Schemas2.LegacyProblemMatcher
            ]
          }
        }
      ]
    },
    shellConfiguration: {
      type: "object",
      additionalProperties: false,
      description: localize(19774, null),
      properties: {
        executable: {
          type: "string",
          description: localize(19773, null)
        },
        args: {
          type: "array",
          description: localize(19772, null),
          items: {
            type: "string"
          }
        }
      }
    },
    commandConfiguration: {
      type: "object",
      additionalProperties: false,
      properties: {
        command: {
          type: "string",
          description: localize(19765, null)
        },
        args: {
          type: "array",
          description: localize(19778, null),
          items: {
            type: "string"
          }
        },
        options: {
          $ref: "#/definitions/options"
        }
      }
    },
    taskDescription: {
      type: "object",
      required: ["taskName"],
      additionalProperties: false,
      properties: {
        taskName: {
          type: "string",
          description: localize(19788, null)
        },
        command: {
          type: "string",
          description: localize(19765, null)
        },
        args: {
          type: "array",
          description: localize(19778, null),
          items: {
            type: "string"
          }
        },
        options: {
          $ref: "#/definitions/options"
        },
        windows: {
          anyOf: [
            {
              $ref: "#/definitions/commandConfiguration",
              description: localize(19792, null)
            },
            {
              properties: {
                problemMatcher: {
                  $ref: "#/definitions/problemMatcherType",
                  description: localize(19784, null)
                }
              }
            }
          ]
        },
        osx: {
          anyOf: [
            {
              $ref: "#/definitions/commandConfiguration",
              description: localize(19782, null)
            },
            {
              properties: {
                problemMatcher: {
                  $ref: "#/definitions/problemMatcherType",
                  description: localize(19784, null)
                }
              }
            }
          ]
        },
        linux: {
          anyOf: [
            {
              $ref: "#/definitions/commandConfiguration",
              description: localize(19781, null)
            },
            {
              properties: {
                problemMatcher: {
                  $ref: "#/definitions/problemMatcherType",
                  description: localize(19784, null)
                }
              }
            }
          ]
        },
        suppressTaskName: {
          type: "boolean",
          description: localize(19787, null),
          default: true
        },
        showOutput: {
          $ref: "#/definitions/showOutputType",
          description: localize(19786, null)
        },
        echoCommand: {
          type: "boolean",
          description: localize(19766, null),
          default: true
        },
        isWatching: {
          type: "boolean",
          deprecationMessage: localize(19791, null),
          description: localize(19790, null),
          default: true
        },
        isBackground: {
          type: "boolean",
          description: localize(19779, null),
          default: true
        },
        promptOnClose: {
          type: "boolean",
          description: localize(19785, null),
          default: false
        },
        isBuildCommand: {
          type: "boolean",
          description: localize(19780, null),
          default: true
        },
        isTestCommand: {
          type: "boolean",
          description: localize(19789, null),
          default: true
        },
        problemMatcher: {
          $ref: "#/definitions/problemMatcherType",
          description: localize(19784, null)
        }
      }
    },
    taskRunnerConfiguration: {
      type: "object",
      required: [],
      properties: {
        command: {
          type: "string",
          description: localize(19765, null)
        },
        args: {
          type: "array",
          description: localize(19763, null),
          items: {
            type: "string"
          }
        },
        options: {
          $ref: "#/definitions/options"
        },
        showOutput: {
          $ref: "#/definitions/showOutputType",
          description: localize(19775, null)
        },
        isWatching: {
          type: "boolean",
          deprecationMessage: localize(19795, null),
          description: localize(19794, null),
          default: true
        },
        isBackground: {
          type: "boolean",
          description: localize(19764, null),
          default: true
        },
        promptOnClose: {
          type: "boolean",
          description: localize(19771, null),
          default: false
        },
        echoCommand: {
          type: "boolean",
          description: localize(19766, null),
          default: true
        },
        suppressTaskName: {
          type: "boolean",
          description: localize(19776, null),
          default: true
        },
        taskSelector: {
          type: "string",
          description: localize(19793, null)
        },
        problemMatcher: {
          $ref: "#/definitions/problemMatcherType",
          description: localize(19767, null)
        },
        tasks: {
          type: "array",
          description: localize(19777, null),
          items: {
            type: "object",
            $ref: "#/definitions/taskDescription"
          }
        }
      }
    }
  }
};

var jsonSchemaCommon_default = schema6;
export { schema6, jsonSchemaCommon_default };
