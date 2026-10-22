// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/tasks/common/jsonSchema_v1.ts
import { localize } from "./module-0001.mjs";
import { deepClone } from "./module-0098.mjs";
import { jsonSchemaCommon_default } from "./module-3252.mjs";
import { ProblemMatcherRegistry } from "./module-3250.mjs";


// src/vs/workbench/contrib/tasks/common/jsonSchema_v1.ts
var schema7 = {
  oneOf: [
    {
      allOf: [
        {
          type: "object",
          required: ["version"],
          properties: {
            version: {
              type: "string",
              enum: ["0.1.0"],
              deprecationMessage: localize(19678, null),
              description: localize(19677, null)
            },
            _runner: {
              deprecationMessage: localize(19672, null)
            },
            runner: {
              type: "string",
              enum: ["process", "terminal"],
              default: "process",
              description: localize(19675, null)
            },
            windows: {
              $ref: "#/definitions/taskRunnerConfiguration",
              description: localize(19679, null)
            },
            osx: {
              $ref: "#/definitions/taskRunnerConfiguration",
              description: localize(19674, null)
            },
            linux: {
              $ref: "#/definitions/taskRunnerConfiguration",
              description: localize(19673, null)
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

var shellCommand = {
  type: "boolean",
  default: true,
  description: localize(19676, null)
};

schema7.definitions = deepClone(jsonSchemaCommon_default.definitions);

var definitions = schema7.definitions;

definitions["commandConfiguration"]["properties"]["isShellCommand"] = deepClone(shellCommand);

definitions["taskDescription"]["properties"]["isShellCommand"] = deepClone(shellCommand);

definitions["taskRunnerConfiguration"]["properties"]["isShellCommand"] = deepClone(shellCommand);

Object.getOwnPropertyNames(definitions).forEach((key3) => {
  const newKey = key3 + "1";
  definitions[newKey] = definitions[key3];
  delete definitions[key3];
});

function fixReferences(literal) {
  if (Array.isArray(literal)) {
    literal.forEach((element) => {
      if (typeof element === "object" && element !== null) {
        fixReferences(element);
      }
    });
  } else if (typeof literal === "object") {
    if (literal["$ref"]) {
      literal["$ref"] = literal["$ref"] + "1";
    }
    Object.getOwnPropertyNames(literal).forEach((property) => {
      const value2 = literal[property];
      if (Array.isArray(value2) || typeof value2 === "object") {
        fixReferences(value2);
      }
    });
  }
}

fixReferences(schema7);

ProblemMatcherRegistry.onReady().then(() => {
  try {
    const matcherIds = ProblemMatcherRegistry.keys().map((key3) => "$" + key3);
    definitions.problemMatcherType1.oneOf[0].enum = matcherIds;
    definitions.problemMatcherType1.oneOf[2].items.anyOf[1].enum = matcherIds;
  } catch (err) {
    console.log("Installing problem matcher ids failed");
  }
});

var jsonSchema_v1_default = schema7;
export { fixReferences, schema7, shellCommand, definitions, jsonSchema_v1_default };
