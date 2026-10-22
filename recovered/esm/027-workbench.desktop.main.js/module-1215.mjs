// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/callHierarchy/common/callHierarchy.ts
import { LanguageFeatureRegistry } from "./module-1214.mjs";
import { RefCountedDisposable } from "./module-0012.mjs";
import { isNonEmptyArray } from "./module-0007.mjs";
import { onUnexpectedExternalError } from "./module-0004.mjs";
import { CommandsRegistry } from "./module-0087.mjs";
import { assertType } from "./module-0010.mjs";
import { URI } from "./module-0032.mjs";
import { Position } from "./module-0079.mjs";
import { IModelService } from "./module-0080.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { CancellationToken } from "./module-0025.mjs";


// src/vs/workbench/contrib/callHierarchy/common/callHierarchy.ts
var CallHierarchyProviderRegistry = new LanguageFeatureRegistry();

var CallHierarchyModel = class _CallHierarchyModel {
  constructor(id2, provider, roots, ref) {
    this.id = id2;
    this.provider = provider;
    this.roots = roots;
    this.ref = ref;
    this.root = roots[0];
  }
  static async create(model, position2, token) {
    const [provider] = CallHierarchyProviderRegistry.ordered(model);
    if (!provider) {
      return void 0;
    }
    const session = await provider.prepareCallHierarchy(model, position2, token);
    if (!session) {
      return void 0;
    }
    return new _CallHierarchyModel(session.roots.reduce((p, c) => p + c._sessionId, ""), provider, session.roots, new RefCountedDisposable(session));
  }
  dispose() {
    this.ref.release();
  }
  fork(item) {
    const that = this;
    return new class extends _CallHierarchyModel {
      constructor() {
        super(that.id, that.provider, [item], that.ref.acquire());
      }
    }();
  }
  async resolveIncomingCalls(item, token) {
    try {
      const result = await this.provider.provideIncomingCalls(item, token);
      if (isNonEmptyArray(result)) {
        return result;
      }
    } catch (e) {
      onUnexpectedExternalError(e);
    }
    return [];
  }
  async resolveOutgoingCalls(item, token) {
    try {
      const result = await this.provider.provideOutgoingCalls(item, token);
      if (isNonEmptyArray(result)) {
        return result;
      }
    } catch (e) {
      onUnexpectedExternalError(e);
    }
    return [];
  }
};

var _models = /* @__PURE__ */ new Map();

CommandsRegistry.registerCommand("_executePrepareCallHierarchy", async (accessor, ...args2) => {
  const [resource, position2] = args2;
  assertType(URI.isUri(resource));
  assertType(Position.isIPosition(position2));
  const modelService = accessor.get(IModelService);
  let textModel = modelService.getModel(resource);
  let textModelReference;
  if (!textModel) {
    const textModelService = accessor.get(ITextModelService);
    const result = await textModelService.createModelReference(resource);
    textModel = result.object.textEditorModel;
    textModelReference = result;
  }
  try {
    const model = await CallHierarchyModel.create(textModel, position2, CancellationToken.None);
    if (!model) {
      return [];
    }
    _models.set(model.id, model);
    _models.forEach((value2, key3, map) => {
      if (map.size > 10) {
        value2.dispose();
        _models.delete(key3);
      }
    });
    return [model.root];
  } finally {
    textModelReference?.dispose();
  }
});

function isCallHierarchyItemDto(obj) {
  return true;
}

CommandsRegistry.registerCommand("_executeProvideIncomingCalls", async (_accessor, ...args2) => {
  const [item] = args2;
  assertType(isCallHierarchyItemDto(item));
  const model = _models.get(item._sessionId);
  if (!model) {
    return [];
  }
  return model.resolveIncomingCalls(item, CancellationToken.None);
});

CommandsRegistry.registerCommand("_executeProvideOutgoingCalls", async (_accessor, ...args2) => {
  const [item] = args2;
  assertType(isCallHierarchyItemDto(item));
  const model = _models.get(item._sessionId);
  if (!model) {
    return [];
  }
  return model.resolveOutgoingCalls(item, CancellationToken.None);
});
export { isCallHierarchyItemDto, CallHierarchyProviderRegistry, CallHierarchyModel, _models };
