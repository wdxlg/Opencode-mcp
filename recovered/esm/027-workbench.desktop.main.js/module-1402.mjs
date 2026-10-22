// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/tasks/common/taskDefinitionRegistry.ts
import { localize } from "./module-0001.mjs";
import { isString } from "./module-0010.mjs";
import { deepClone } from "./module-0098.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { ExtensionsRegistry } from "./module-0876.mjs";
import { Emitter } from "./module-0017.mjs";


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

var Configuration;

((Configuration4) => {
  function from(value2, extensionId, messageCollector) {
    if (!value2) {
      return void 0;
    }
    const taskType2 = isString(value2.type) ? value2.type : void 0;
    if (!taskType2 || taskType2.length === 0) {
      messageCollector.error(localize(19885, null));
      return void 0;
    }
    const required = [];
    if (Array.isArray(value2.required)) {
      for (const element of value2.required) {
        if (isString(element)) {
          required.push(element);
        }
      }
    }
    return {
      extensionId: extensionId.value,
      taskType: taskType2,
      required,
      properties: value2.properties ? deepClone(value2.properties) : {},
      when: value2.when ? ContextKeyExpr.deserialize(value2.when) : void 0
    };
  }
  Configuration4.from = from;
})(Configuration || (Configuration = {}));

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
    this.readyPromise = new Promise((resolve3, reject) => {
      taskDefinitionsExtPoint.setHandler((extensions, delta2) => {
        this._schema = void 0;
        try {
          for (const extension of delta2.removed) {
            const taskTypes = extension.value;
            for (const taskType2 of taskTypes) {
              if (this.taskTypes && taskType2.type && this.taskTypes[taskType2.type]) {
                delete this.taskTypes[taskType2.type];
              }
            }
          }
          for (const extension of delta2.added) {
            const taskTypes = extension.value;
            for (const taskType2 of taskTypes) {
              const type = Configuration.from(taskType2, extension.description.identifier, extension.collector);
              if (type) {
                this.taskTypes[type.taskType] = type;
              }
            }
          }
          if (delta2.removed.length > 0 || delta2.added.length > 0) {
            this._onDefinitionsChanged.fire();
          }
        } catch (error) {
        }
        resolve3(void 0);
      });
    });
  }
  onReady() {
    return this.readyPromise;
  }
  get(key3) {
    return this.taskTypes[key3];
  }
  all() {
    return Object.keys(this.taskTypes).map((key3) => this.taskTypes[key3]);
  }
  getJsonSchema() {
    if (this._schema === void 0) {
      const schemas2 = [];
      for (const definition of this.all()) {
        const schema10 = {
          type: "object",
          additionalProperties: false
        };
        if (definition.required.length > 0) {
          schema10.required = definition.required.slice(0);
        }
        if (definition.properties !== void 0) {
          schema10.properties = deepClone(definition.properties);
        } else {
          schema10.properties = /* @__PURE__ */ Object.create(null);
        }
        schema10.properties.type = {
          type: "string",
          enum: [definition.taskType]
        };
        schemas2.push(schema10);
      }
      this._schema = { oneOf: schemas2 };
    }
    return this._schema;
  }
};

var TaskDefinitionRegistry = new TaskDefinitionRegistryImpl();
export { taskDefinitionSchema, Configuration, taskDefinitionsExtPoint, TaskDefinitionRegistryImpl, TaskDefinitionRegistry };
