// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/configurationResolver/common/configurationResolverSchema.ts
import { localize } from "./module-0001.mjs";


// src/vs/workbench/services/configurationResolver/common/configurationResolverSchema.ts
var idDescription = localize(22826, null);

var typeDescription = localize(22831, null);

var descriptionDescription = localize(22825, null);

var defaultDescription = localize(22824, null);

var inputsSchema = {
  definitions: {
    inputs: {
      type: "array",
      description: localize(22835, null),
      items: {
        oneOf: [
          {
            type: "object",
            required: ["id", "type", "description"],
            additionalProperties: false,
            properties: {
              id: {
                type: "string",
                description: idDescription
              },
              type: {
                type: "string",
                description: typeDescription,
                enum: ["promptString"],
                enumDescriptions: [
                  localize(22834, null)
                ]
              },
              description: {
                type: "string",
                description: descriptionDescription
              },
              default: {
                type: "string",
                description: defaultDescription
              },
              password: {
                type: "boolean",
                description: localize(22828, null)
              }
            }
          },
          {
            type: "object",
            required: ["id", "type", "description", "options"],
            additionalProperties: false,
            properties: {
              id: {
                type: "string",
                description: idDescription
              },
              type: {
                type: "string",
                description: typeDescription,
                enum: ["pickString"],
                enumDescriptions: [
                  localize(22833, null)
                ]
              },
              description: {
                type: "string",
                description: descriptionDescription
              },
              default: {
                type: "string",
                description: defaultDescription
              },
              options: {
                type: "array",
                description: localize(22827, null),
                items: {
                  oneOf: [
                    {
                      type: "string"
                    },
                    {
                      type: "object",
                      required: ["value"],
                      additionalProperties: false,
                      properties: {
                        label: {
                          type: "string",
                          description: localize(22829, null)
                        },
                        value: {
                          type: "string",
                          description: localize(22830, null)
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          {
            type: "object",
            required: ["id", "type", "command"],
            additionalProperties: false,
            properties: {
              id: {
                type: "string",
                description: idDescription
              },
              type: {
                type: "string",
                description: typeDescription,
                enum: ["command"],
                enumDescriptions: [
                  localize(22832, null)
                ]
              },
              command: {
                type: "string",
                description: localize(22823, null)
              },
              args: {
                oneOf: [
                  {
                    type: "object",
                    description: localize(22822, null)
                  },
                  {
                    type: "array",
                    description: localize(22822, null)
                  },
                  {
                    type: "string",
                    description: localize(22822, null)
                  }
                ]
              }
            }
          }
        ]
      }
    }
  }
};
export { idDescription, typeDescription, descriptionDescription, defaultDescription, inputsSchema };
