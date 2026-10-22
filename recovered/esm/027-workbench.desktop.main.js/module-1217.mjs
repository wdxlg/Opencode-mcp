// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/typeHierarchy/common/typeHierarchy.ts
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
import { Range2 } from "./module-0106.mjs";


// src/vs/workbench/contrib/typeHierarchy/common/typeHierarchy.ts
var TypeHierarchyProviderRegistry = new LanguageFeatureRegistry();

var TypeHierarchyModel = class _TypeHierarchyModel {
  constructor(id2, provider, roots, ref) {
    this.id = id2;
    this.provider = provider;
    this.roots = roots;
    this.ref = ref;
    this.root = roots[0];
  }
  static async create(model, position2, token) {
    const [provider] = TypeHierarchyProviderRegistry.ordered(model);
    if (!provider) {
      return void 0;
    }
    const session = await provider.prepareTypeHierarchy(model, position2, token);
    if (!session) {
      return void 0;
    }
    return new _TypeHierarchyModel(session.roots.reduce((p, c) => p + c._sessionId, ""), provider, session.roots, new RefCountedDisposable(session));
  }
  dispose() {
    this.ref.release();
  }
  fork(item) {
    const that = this;
    return new class extends _TypeHierarchyModel {
      constructor() {
        super(that.id, that.provider, [item], that.ref.acquire());
      }
    }();
  }
  async provideSupertypes(item, token) {
    try {
      const result = await this.provider.provideSupertypes(item, token);
      if (isNonEmptyArray(result)) {
        return result;
      }
    } catch (e) {
      onUnexpectedExternalError(e);
    }
    return [];
  }
  async provideSubtypes(item, token) {
    try {
      const result = await this.provider.provideSubtypes(item, token);
      if (isNonEmptyArray(result)) {
        return result;
      }
    } catch (e) {
      onUnexpectedExternalError(e);
    }
    return [];
  }
};

var _models2 = /* @__PURE__ */ new Map();

CommandsRegistry.registerCommand("_executePrepareTypeHierarchy", async (accessor, ...args2) => {
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
    const model = await TypeHierarchyModel.create(textModel, position2, CancellationToken.None);
    if (!model) {
      return [];
    }
    _models2.forEach((value2, key3, map) => {
      if (map.size > 10) {
        value2.dispose();
        _models2.delete(key3);
      }
    });
    for (const root of model.roots) {
      _models2.set(root._sessionId, model);
    }
    return model.roots;
  } finally {
    textModelReference?.dispose();
  }
});

function isTypeHierarchyItemDto(obj) {
  const item = obj;
  return typeof obj === "object" && typeof item.name === "string" && typeof item.kind === "number" && URI.isUri(item.uri) && Range2.isIRange(item.range) && Range2.isIRange(item.selectionRange);
}

CommandsRegistry.registerCommand("_executeProvideSupertypes", async (_accessor, ...args2) => {
  const [item] = args2;
  assertType(isTypeHierarchyItemDto(item));
  const model = _models2.get(item._sessionId);
  if (!model) {
    return [];
  }
  return model.provideSupertypes(item, CancellationToken.None);
});

CommandsRegistry.registerCommand("_executeProvideSubtypes", async (_accessor, ...args2) => {
  const [item] = args2;
  assertType(isTypeHierarchyItemDto(item));
  const model = _models2.get(item._sessionId);
  if (!model) {
    return [];
  }
  return model.provideSubtypes(item, CancellationToken.None);
});
export { isTypeHierarchyItemDto, TypeHierarchyProviderRegistry, TypeHierarchyModel, _models2 };
