// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/contrib/tasks/common/taskDefinitionRegistry.ts
import { localize } from "./module-0015.mjs";
import { isString } from "./module-0009.mjs";
import { deepClone } from "./module-0055.mjs";
import { ContextKeyExpr } from "./module-0044.mjs";
import { ExtensionsRegistry } from "./module-0169.mjs";
import { Emitter } from "./module-0019.mjs";


// src/vs/workbench/contrib/tasks/common/taskDefinitionRegistry.ts
var taskDefinitionSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    type: {
      type: "string",
      description: localize(19880, null)
    },
    required: {
      type: "array",
      markdownDescription: localize(19882, null),
      items: {
        type: "string"
      }
    },
    properties: {
      type: "object",
      description: localize(19881, null),
      additionalProperties: {
        $ref: "http://json-schema.org/draft-07/schema#"
      }
    },
    when: {
      type: "string",
      markdownDescription: localize(19883, null),
      default: ""
    }
  }
};

var Configuration2;

((Configuration3) => {
  function from(value, extensionId, messageCollector) {
    if (!value) {
      return void 0;
    }
    const taskType = isString(value.type) ? value.type : void 0;
    if (!taskType || taskType.length === 0) {
      messageCollector.error(localize(19885, null));
      return void 0;
    }
    const required = [];
    if (Array.isArray(value.required)) {
      for (const element of value.required) {
        if (isString(element)) {
          required.push(element);
        }
      }
    }
    return {
      extensionId: extensionId.value,
      taskType,
      required,
      properties: value.properties ? deepClone(value.properties) : {},
      when: value.when ? ContextKeyExpr.deserialize(value.when) : void 0
    };
  }
  Configuration3.from = from;
})(Configuration2 || (Configuration2 = {}));

var taskDefinitionsExtPoint = ExtensionsRegistry.registerExtensionPoint({
  extensionPoint: "taskDefinitions",
  activationEventsGenerator: function* (contributions) {
    for (const task of contributions) {
      if (task.type) {
        yield `onTaskType:${task.type}`;
      }
    }
  },
  jsonSchema: {
    description: localize(19884, null),
    type: "array",
    items: taskDefinitionSchema
  }
});

var TaskDefinitionRegistryImpl = class {
  constructor() {
    this._onDefinitionsChanged = new Emitter();
    this.onDefinitionsChanged = this._onDefinitionsChanged.event;
    this.taskTypes = /* @__PURE__ */ Object.create(null);
    this.readyPromise = new Promise((resolve2, reject) => {
      taskDefinitionsExtPoint.setHandler((extensions, delta3) => {
        this._schema = void 0;
        try {
          for (const extension of delta3.removed) {
            const taskTypes = extension.value;
            for (const taskType of taskTypes) {
              if (this.taskTypes && taskType.type && this.taskTypes[taskType.type]) {
                delete this.taskTypes[taskType.type];
              }
            }
          }
          for (const extension of delta3.added) {
            const taskTypes = extension.value;
            for (const taskType of taskTypes) {
              const type = Configuration2.from(taskType, extension.description.identifier, extension.collector);
              if (type) {
                this.taskTypes[type.taskType] = type;
              }
            }
          }
          if (delta3.removed.length > 0 || delta3.added.length > 0) {
            this._onDefinitionsChanged.fire();
          }
        } catch (error) {
        }
        resolve2(void 0);
      });
    });
  }
  onReady() {
    return this.readyPromise;
  }
  get(key) {
    return this.taskTypes[key];
  }
  all() {
    return Object.keys(this.taskTypes).map((key) => this.taskTypes[key]);
  }
  getJsonSchema() {
    if (this._schema === void 0) {
      const schemas = [];
      for (const definition of this.all()) {
        const schema2 = {
          type: "object",
          additionalProperties: false
        };
        if (definition.required.length > 0) {
          schema2.required = definition.required.slice(0);
        }
        if (definition.properties !== void 0) {
          schema2.properties = deepClone(definition.properties);
        } else {
          schema2.properties = /* @__PURE__ */ Object.create(null);
        }
        schema2.properties.type = {
          type: "string",
          enum: [definition.taskType]
        };
        schemas.push(schema2);
      }
      this._schema = { oneOf: schemas };
    }
    return this._schema;
  }
};

var TaskDefinitionRegistry = new TaskDefinitionRegistryImpl();
export { taskDefinitionSchema, Configuration2, taskDefinitionsExtPoint, TaskDefinitionRegistryImpl, TaskDefinitionRegistry };
