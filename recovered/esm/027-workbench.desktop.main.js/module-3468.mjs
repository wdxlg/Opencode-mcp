// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/tasks/common/jsonSchema_v2.ts
import { localize } from "./module-0001.mjs";
import { getAllCodicons } from "./module-0085.mjs";
import { deepClone } from "./module-0098.mjs";
import { jsonSchemaCommon_default } from "./module-3466.mjs";
import { TaskDefinitionRegistry } from "./module-1402.mjs";
import { inputsSchema } from "./module-1420.mjs";
import { applyDeprecatedVariableMessage } from "./module-3184.mjs";
import { ProblemMatcherRegistry } from "./module-3464.mjs";


// src/vs/workbench/contrib/tasks/common/jsonSchema_v2.ts
function fixReferences2(literal) {
  if (Array.isArray(literal)) {
    literal.forEach((element) => {
      if (typeof element === "object" && element !== null) {
        fixReferences2(element);
      }
    });
  } else if (typeof literal === "object") {
    if (literal["$ref"]) {
      literal["$ref"] = literal["$ref"] + "2";
    }
    Object.getOwnPropertyNames(literal).forEach((property) => {
      const value2 = literal[property];
      if (Array.isArray(value2) || typeof value2 === "object" && value2 !== null) {
        fixReferences2(value2);
      }
    });
  }
}

var shellCommand2 = {
  anyOf: [
    {
      type: "boolean",
      default: true,
      description: localize(19691, null)
    },
    {
      $ref: "#/definitions/shellConfiguration"
    }
  ],
  deprecationMessage: localize(19725, null)
};

var hide2 = {
  type: "boolean",
  description: localize(19687, null),
  default: true
};

var inAgents = {
  type: "boolean",
  description: localize(19688, null),
  default: false
};

var taskIdentifier = {
  type: "object",
  additionalProperties: true,
  properties: {
    type: {
      type: "string",
      description: localize(19697, null)
    }
  }
};

var dependsOn = {
  anyOf: [
    {
      type: "string",
      description: localize(19698, null)
    },
    taskIdentifier,
    {
      type: "array",
      description: localize(19696, null),
      items: {
        anyOf: [
          {
            type: "string"
          },
          taskIdentifier
        ]
      }
    }
  ],
  description: localize(19695, null)
};

var dependsOrder = {
  type: "string",
  enum: ["parallel", "sequence"],
  enumDescriptions: [
    localize(19700, null),
    localize(19701, null)
  ],
  default: "parallel",
  description: localize(19699, null)
};

var detail = {
  type: "string",
  description: localize(19702, null)
};

var icon = {
  type: "object",
  description: localize(19712, null),
  properties: {
    id: {
      description: localize(19714, null),
      type: ["string", "null"],
      enum: Array.from(getAllCodicons(), (icon2) => icon2.id),
      markdownEnumDescriptions: Array.from(getAllCodicons(), (icon2) => `$(${icon2.id})`)
    },
    color: {
      description: localize(19713, null),
      type: ["string", "null"],
      enum: [
        "terminal.ansiBlack",
        "terminal.ansiRed",
        "terminal.ansiGreen",
        "terminal.ansiYellow",
        "terminal.ansiBlue",
        "terminal.ansiMagenta",
        "terminal.ansiCyan",
        "terminal.ansiWhite"
      ]
    }
  }
};

var presentation = {
  type: "object",
  default: {
    echo: true,
    reveal: "always",
    focus: false,
    panel: "shared",
    showReuseMessage: true,
    clear: false
  },
  description: localize(19729, null),
  additionalProperties: false,
  properties: {
    echo: {
      type: "boolean",
      default: true,
      description: localize(19732, null)
    },
    focus: {
      type: "boolean",
      default: false,
      description: localize(19733, null)
    },
    revealProblems: {
      type: "string",
      enum: ["always", "onProblem", "never"],
      enumDescriptions: [
        localize(19742, null),
        localize(19744, null),
        localize(19743, null)
      ],
      default: "never",
      description: localize(19741, null)
    },
    reveal: {
      type: "string",
      enum: ["always", "silent", "never"],
      enumDescriptions: [
        localize(19738, null),
        localize(19740, null),
        localize(19739, null)
      ],
      default: "always",
      description: localize(19737, null)
    },
    panel: {
      type: "string",
      enum: ["shared", "dedicated", "new"],
      default: "shared",
      description: localize(19735, null)
    },
    showReuseMessage: {
      type: "boolean",
      default: true,
      description: localize(19745, null)
    },
    clear: {
      type: "boolean",
      default: false,
      description: localize(19730, null)
    },
    group: {
      type: "string",
      description: localize(19734, null)
    },
    close: {
      type: "boolean",
      description: localize(19731, null)
    },
    preserveTerminalName: {
      type: "boolean",
      default: false,
      description: localize(19736, null)
    }
  }
};

var terminal = deepClone(presentation);

terminal.deprecationMessage = localize(19759, null);

var groupStrings = {
  type: "string",
  enum: [
    "build",
    "test",
    "none"
  ],
  enumDescriptions: [
    localize(19705, null),
    localize(19711, null),
    localize(19710, null)
  ],
  description: localize(19709, null)
};

var group = {
  oneOf: [
    groupStrings,
    {
      type: "object",
      properties: {
        kind: groupStrings,
        isDefault: {
          type: ["boolean", "string"],
          default: false,
          description: localize(19708, null)
        }
      }
    }
  ],
  defaultSnippets: [
    {
      body: { kind: "build", isDefault: true },
      description: localize(19706, null)
    },
    {
      body: { kind: "test", isDefault: true },
      description: localize(19707, null)
    }
  ],
  description: localize(19704, null)
};

var taskType = {
  type: "string",
  enum: ["shell"],
  default: "process",
  description: localize(19760, null)
};

var command2 = {
  oneOf: [
    {
      oneOf: [
        {
          type: "string"
        },
        {
          type: "array",
          items: {
            type: "string"
          },
          description: localize(19685, null)
        }
      ]
    },
    {
      type: "object",
      required: ["value", "quoting"],
      properties: {
        value: {
          oneOf: [
            {
              type: "string"
            },
            {
              type: "array",
              items: {
                type: "string"
              },
              description: localize(19685, null)
            }
          ],
          description: localize(19683, null)
        },
        quoting: {
          type: "string",
          enum: ["escape", "strong", "weak"],
          enumDescriptions: [
            localize(19747, null),
            localize(19748, null),
            localize(19749, null)
          ],
          default: "strong",
          description: localize(19684, null)
        }
      }
    }
  ],
  description: localize(19682, null)
};

var args = {
  type: "array",
  items: {
    oneOf: [
      {
        type: "string"
      },
      {
        type: "object",
        required: ["value", "quoting"],
        properties: {
          value: {
            type: "string",
            description: localize(19680, null)
          },
          quoting: {
            type: "string",
            enum: ["escape", "strong", "weak"],
            enumDescriptions: [
              localize(19747, null),
              localize(19748, null),
              localize(19749, null)
            ],
            default: "strong",
            description: localize(19681, null)
          }
        }
      }
    ]
  },
  description: localize(19692, null)
};

var label = {
  type: "string",
  description: localize(19727, null)
};

var version = {
  type: "string",
  enum: ["2.0.0"],
  description: localize(19761, null)
};

var identifier = {
  type: "string",
  description: localize(19715, null),
  deprecationMessage: localize(19716, null)
};

var runOptions = {
  type: "object",
  additionalProperties: false,
  properties: {
    reevaluateOnRerun: {
      type: "boolean",
      description: localize(19750, null),
      default: true
    },
    runOn: {
      type: "string",
      enum: ["default", "folderOpen", "worktreeCreated"],
      description: localize(19751, null),
      default: "default"
    },
    instanceLimit: {
      type: "number",
      description: localize(19717, null),
      default: 1
    },
    instancePolicy: {
      type: "string",
      enum: ["terminateNewest", "terminateOldest", "prompt", "warn", "silent"],
      enumDescriptions: [
        localize(19721, null),
        localize(19722, null),
        localize(19719, null),
        localize(19723, null),
        localize(19720, null)
      ],
      description: localize(19718, null),
      default: "prompt"
    }
  },
  description: localize(19752, null)
};

var commonSchemaDefinitions = jsonSchemaCommon_default.definitions;

var options2 = deepClone(commonSchemaDefinitions.options);

var optionsProperties = options2.properties;

optionsProperties.shell = deepClone(commonSchemaDefinitions.shellConfiguration);

var taskConfiguration = {
  type: "object",
  additionalProperties: false,
  properties: {
    label: {
      type: "string",
      description: localize(19755, null)
    },
    taskName: {
      type: "string",
      description: localize(19756, null),
      deprecationMessage: localize(19757, null)
    },
    identifier: deepClone(identifier),
    group: deepClone(group),
    isBackground: {
      type: "boolean",
      description: localize(19693, null),
      default: true
    },
    promptOnClose: {
      type: "boolean",
      description: localize(19746, null),
      default: false
    },
    presentation: deepClone(presentation),
    icon: deepClone(icon),
    hide: deepClone(hide2),
    inAgents: deepClone(inAgents),
    options: options2,
    problemMatcher: {
      $ref: "#/definitions/problemMatcherType",
      description: localize(19728, null)
    },
    runOptions: deepClone(runOptions),
    dependsOn: deepClone(dependsOn),
    dependsOrder: deepClone(dependsOrder),
    detail: deepClone(detail)
  }
};

var taskDefinitions = [];

TaskDefinitionRegistry.onReady().then(() => {
  updateTaskDefinitions();
});

function updateTaskDefinitions() {
  for (const taskType2 of TaskDefinitionRegistry.all()) {
    if (taskDefinitions.find((schema11) => {
      return schema11.properties?.type?.enum?.find ? schema11.properties?.type.enum.find((element) => element === taskType2.taskType) : void 0;
    })) {
      continue;
    }
    const schema10 = deepClone(taskConfiguration);
    const schemaProperties = schema10.properties;
    schemaProperties.type = {
      type: "string",
      description: localize(19686, null),
      enum: [taskType2.taskType]
    };
    if (taskType2.required) {
      schema10.required = taskType2.required.slice();
    } else {
      schema10.required = [];
    }
    schema10.required.push("type");
    if (taskType2.properties) {
      for (const key3 of Object.keys(taskType2.properties)) {
        const property = taskType2.properties[key3];
        schemaProperties[key3] = deepClone(property);
      }
    }
    fixReferences2(schema10);
    taskDefinitions.push(schema10);
  }
}

var customize = deepClone(taskConfiguration);

customize.properties.customize = {
  type: "string",
  deprecationMessage: localize(19694, null)
};

if (!customize.required) {
  customize.required = [];
}

customize.required.push("customize");

taskDefinitions.push(customize);

var definitions2 = deepClone(commonSchemaDefinitions);

var taskDescription = definitions2.taskDescription;

taskDescription.required = ["label"];

var taskDescriptionProperties = taskDescription.properties;

taskDescriptionProperties.label = deepClone(label);

taskDescriptionProperties.command = deepClone(command2);

taskDescriptionProperties.args = deepClone(args);

taskDescriptionProperties.isShellCommand = deepClone(shellCommand2);

taskDescriptionProperties.dependsOn = dependsOn;

taskDescriptionProperties.hide = deepClone(hide2);

taskDescriptionProperties.inAgents = deepClone(inAgents);

taskDescriptionProperties.dependsOrder = dependsOrder;

taskDescriptionProperties.identifier = deepClone(identifier);

taskDescriptionProperties.type = deepClone(taskType);

taskDescriptionProperties.presentation = deepClone(presentation);

taskDescriptionProperties.terminal = terminal;

taskDescriptionProperties.icon = deepClone(icon);

taskDescriptionProperties.group = deepClone(group);

taskDescriptionProperties.runOptions = deepClone(runOptions);

taskDescriptionProperties.detail = detail;

taskDescriptionProperties.taskName.deprecationMessage = localize(
  19757,
  null
);

var processTask = deepClone(taskDescription);

taskDescription.default = {
  label: "My Task",
  type: "shell",
  command: "echo Hello",
  problemMatcher: []
};

definitions2.showOutputType.deprecationMessage = localize(
  19753,
  null
);

taskDescriptionProperties.echoCommand.deprecationMessage = localize(
  19703,
  null
);

taskDescriptionProperties.suppressTaskName.deprecationMessage = localize(
  19754,
  null
);

taskDescriptionProperties.isBuildCommand.deprecationMessage = localize(
  19724,
  null
);

taskDescriptionProperties.isTestCommand.deprecationMessage = localize(
  19726,
  null
);

processTask.properties.type = {
  type: "string",
  enum: ["process"],
  default: "process",
  description: localize(19760, null)
};

processTask.required.push("command");

processTask.required.push("type");

taskDefinitions.push(processTask);

taskDefinitions.push({
  $ref: "#/definitions/taskDescription"
});

var definitionsTaskRunnerConfigurationProperties = definitions2.taskRunnerConfiguration.properties;

var tasks = definitionsTaskRunnerConfigurationProperties.tasks;

tasks.items = {
  oneOf: taskDefinitions
};

definitionsTaskRunnerConfigurationProperties.inputs = inputsSchema.definitions.inputs;

definitions2.commandConfiguration.properties.isShellCommand = deepClone(shellCommand2);

definitions2.commandConfiguration.properties.args = deepClone(args);

definitions2.options.properties.shell = {
  $ref: "#/definitions/shellConfiguration"
};

definitionsTaskRunnerConfigurationProperties.isShellCommand = deepClone(shellCommand2);

definitionsTaskRunnerConfigurationProperties.type = deepClone(taskType);

definitionsTaskRunnerConfigurationProperties.group = deepClone(group);

definitionsTaskRunnerConfigurationProperties.presentation = deepClone(presentation);

definitionsTaskRunnerConfigurationProperties.suppressTaskName.deprecationMessage = localize(
  19754,
  null
);

definitionsTaskRunnerConfigurationProperties.taskSelector.deprecationMessage = localize(
  19758,
  null
);

var osSpecificTaskRunnerConfiguration = deepClone(definitions2.taskRunnerConfiguration);

delete osSpecificTaskRunnerConfiguration.properties.tasks;

osSpecificTaskRunnerConfiguration.additionalProperties = false;

definitions2.osSpecificTaskRunnerConfiguration = osSpecificTaskRunnerConfiguration;

definitionsTaskRunnerConfigurationProperties.version = deepClone(version);

var schema8 = {
  oneOf: [
    {
      "allOf": [
        {
          type: "object",
          required: ["version"],
          properties: {
            version: deepClone(version),
            windows: {
              "$ref": "#/definitions/osSpecificTaskRunnerConfiguration",
              "description": localize(19762, null)
            },
            osx: {
              "$ref": "#/definitions/osSpecificTaskRunnerConfiguration",
              "description": localize(19690, null)
            },
            linux: {
              "$ref": "#/definitions/osSpecificTaskRunnerConfiguration",
              "description": localize(19689, null)
            }
          }
        },
        {
          $ref: "#/definitions/taskRunnerConfiguration"
        }
      ]
    }
  ]
};

schema8.definitions = definitions2;

function deprecatedVariableMessage(schemaMap, property) {
  const mapAtProperty = schemaMap[property].properties;
  if (mapAtProperty) {
    Object.keys(mapAtProperty).forEach((name) => {
      deprecatedVariableMessage(mapAtProperty, name);
    });
  } else {
    applyDeprecatedVariableMessage(schemaMap[property]);
  }
}

Object.getOwnPropertyNames(definitions2).forEach((key3) => {
  const newKey = key3 + "2";
  definitions2[newKey] = definitions2[key3];
  delete definitions2[key3];
  deprecatedVariableMessage(definitions2, newKey);
});

fixReferences2(schema8);

function updateProblemMatchers() {
  try {
    const matcherIds = ProblemMatcherRegistry.keys().map((key3) => "$" + key3);
    definitions2.problemMatcherType2.oneOf[0].enum = matcherIds;
    definitions2.problemMatcherType2.oneOf[2].items.anyOf[0].enum = matcherIds;
  } catch (err) {
    console.log("Installing problem matcher ids failed");
  }
}

ProblemMatcherRegistry.onReady().then(() => {
  updateProblemMatchers();
});

var jsonSchema_v2_default = schema8;
export { fixReferences2, updateTaskDefinitions, deprecatedVariableMessage, updateProblemMatchers, shellCommand2, hide2, inAgents, taskIdentifier, dependsOn, dependsOrder, detail, icon, presentation, terminal, groupStrings, group, taskType, command2, args, label, version, identifier, runOptions, commonSchemaDefinitions, options2, optionsProperties, taskConfiguration, taskDefinitions, customize, definitions2, taskDescription, taskDescriptionProperties, processTask, definitionsTaskRunnerConfigurationProperties, tasks, osSpecificTaskRunnerConfiguration, schema8, jsonSchema_v2_default };
