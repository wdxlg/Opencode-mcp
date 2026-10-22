// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/debug/common/debugVisualizers.ts
import { createDecorator } from "./module-0077.mjs";
import { ExtensionIdentifier } from "./module-0688.mjs";
import { Scope, Variable3, VisualizedExpression } from "./module-1064.mjs";
import { getContextForVariable } from "./module-1060.mjs";
import { CONTEXT_VARIABLE_NAME, CONTEXT_VARIABLE_TYPE, CONTEXT_VARIABLE_VALUE } from "./module-1057.mjs";
import { isDefined } from "./module-0010.mjs";
import { toDisposable } from "./module-0012.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { ILogService } from "./module-0095.mjs";
import { ExtensionsRegistry } from "./module-0876.mjs";


// src/vs/workbench/contrib/debug/common/debugVisualizers.ts
var IDebugVisualizerService = createDecorator("debugVisualizerService");

var DebugVisualizer = class {
  constructor(handle2, viz) {
    this.handle = handle2;
    this.viz = viz;
  }
  get name() {
    return this.viz.name;
  }
  get iconPath() {
    return this.viz.iconPath;
  }
  get iconClass() {
    return this.viz.iconClass;
  }
  async resolve(token) {
    return this.viz.visualization ??= await this.handle.resolveDebugVisualizer(this.viz, token);
  }
  async execute() {
    await this.handle.executeDebugVisualizerCommand(this.viz.id);
  }
};

var emptyRef = { object: [], dispose: () => {
} };

var DebugVisualizerService = class {
  constructor(contextKeyService, extensionService, logService) {
    this.contextKeyService = contextKeyService;
    this.extensionService = extensionService;
    this.logService = logService;
    this.handles = /* @__PURE__ */ new Map();
    this.trees = /* @__PURE__ */ new Map();
    this.didActivate = /* @__PURE__ */ new Map();
    this.registrations = [];
    visualizersExtensionPoint.setHandler((_, { added, removed }) => {
      this.registrations = this.registrations.filter((r2) => !removed.some((e) => ExtensionIdentifier.equals(e.description.identifier, r2.extensionId)));
      added.forEach((e) => this.processExtensionRegistration(e.description));
    });
  }
  /** @inheritdoc */
  async getApplicableFor(variable, token) {
    if (!(variable instanceof Variable3)) {
      return emptyRef;
    }
    const threadId = variable.getThreadId();
    if (threadId === void 0) {
      return emptyRef;
    }
    const context2 = this.getVariableContext(threadId, variable);
    const overlay = getContextForVariable(this.contextKeyService, variable, [
      [CONTEXT_VARIABLE_NAME.key, variable.name],
      [CONTEXT_VARIABLE_VALUE.key, variable.value],
      [CONTEXT_VARIABLE_TYPE.key, variable.type]
    ]);
    const maybeVisualizers = await Promise.all(this.registrations.map(async (registration) => {
      if (!overlay.contextMatchesRules(registration.expr)) {
        return;
      }
      let prom = this.didActivate.get(registration.id);
      if (!prom) {
        prom = this.extensionService.activateByEvent(`onDebugVisualizer:${registration.id}`);
        this.didActivate.set(registration.id, prom);
      }
      await prom;
      if (token.isCancellationRequested) {
        return;
      }
      const handle2 = this.handles.get(toKey(registration.extensionId, registration.id));
      return handle2 && { handle: handle2, result: await handle2.provideDebugVisualizers(context2, token) };
    }));
    const ref = {
      object: maybeVisualizers.filter(isDefined).flatMap((v2) => v2.result.map((r2) => new DebugVisualizer(v2.handle, r2))),
      dispose: () => {
        for (const viz of maybeVisualizers) {
          viz?.handle.disposeDebugVisualizers(viz.result.map((r2) => r2.id));
        }
      }
    };
    if (token.isCancellationRequested) {
      ref.dispose();
    }
    return ref;
  }
  /** @inheritdoc */
  register(handle2) {
    const key3 = toKey(handle2.extensionId, handle2.id);
    this.handles.set(key3, handle2);
    return toDisposable(() => this.handles.delete(key3));
  }
  /** @inheritdoc */
  registerTree(treeId, handle2) {
    this.trees.set(treeId, handle2);
    return toDisposable(() => this.trees.delete(treeId));
  }
  /** @inheritdoc */
  async getVisualizedNodeFor(treeId, expr) {
    if (!(expr instanceof Variable3)) {
      return;
    }
    const threadId = expr.getThreadId();
    if (threadId === void 0) {
      return;
    }
    const tree = this.trees.get(treeId);
    if (!tree) {
      return;
    }
    try {
      const treeItem = await tree.getTreeItem(this.getVariableContext(threadId, expr));
      if (!treeItem) {
        return;
      }
      return new VisualizedExpression(expr.getSession(), this, treeId, treeItem, expr);
    } catch (e) {
      this.logService.warn("Failed to get visualized node", e);
      return;
    }
  }
  /** @inheritdoc */
  async getVisualizedChildren(session, treeId, treeElementId) {
    const node = this.trees.get(treeId);
    const children = await node?.getChildren(treeElementId) || [];
    return children.map((c) => new VisualizedExpression(session, this, treeId, c, void 0));
  }
  /** @inheritdoc */
  async editTreeItem(treeId, treeItem, newValue) {
    const newItem = await this.trees.get(treeId)?.editItem?.(treeItem.id, newValue);
    if (newItem) {
      Object.assign(treeItem, newItem);
    }
  }
  getVariableContext(threadId, variable) {
    const context2 = {
      sessionId: variable.getSession()?.getId() || "",
      containerId: variable.parent instanceof Variable3 ? variable.reference : void 0,
      threadId,
      variable: {
        name: variable.name,
        value: variable.value,
        type: variable.type,
        evaluateName: variable.evaluateName,
        variablesReference: variable.reference || 0,
        indexedVariables: variable.indexedVariables,
        memoryReference: variable.memoryReference,
        namedVariables: variable.namedVariables,
        presentationHint: variable.presentationHint
      }
    };
    for (let p = variable; p instanceof Variable3; p = p.parent) {
      if (p.parent instanceof Scope) {
        context2.frameId = p.parent.stackFrame.frameId;
      }
    }
    return context2;
  }
  processExtensionRegistration(ext) {
    const viz = ext.contributes?.debugVisualizers;
    if (!(viz instanceof Array)) {
      return;
    }
    for (const { when, id: id2 } of viz) {
      try {
        const expr = ContextKeyExpr.deserialize(when);
        if (expr) {
          this.registrations.push({ expr, id: id2, extensionId: ext.identifier });
        }
      } catch (e) {
        this.logService.error(`Error processing debug visualizer registration from extension '${ext.identifier.value}'`, e);
      }
    }
  }
};

DebugVisualizerService = __decorateClass([
  __decorateParam(0, IContextKeyService),
  __decorateParam(1, IExtensionService),
  __decorateParam(2, ILogService)
], DebugVisualizerService);

var toKey = (extensionId, id2) => `${ExtensionIdentifier.toKey(extensionId)}\0${id2}`;

var visualizersExtensionPoint = ExtensionsRegistry.registerExtensionPoint({
  extensionPoint: "debugVisualizers",
  jsonSchema: {
    type: "array",
    items: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "Name of the debug visualizer"
        },
        when: {
          type: "string",
          description: "Condition when the debug visualizer is applicable"
        }
      },
      required: ["id", "when"]
    }
  },
  activationEventsGenerator: function* (contribs) {
    for (const contrib of contribs) {
      if (contrib.id) {
        yield `onDebugVisualizer:${contrib.id}`;
      }
    }
  }
});
export { IDebugVisualizerService, DebugVisualizer, emptyRef, DebugVisualizerService, toKey, visualizersExtensionPoint };
