// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/model/common/modelService.ts
import { ModelService } from "./module-1669.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ITextResourcePropertiesService } from "./module-0204.mjs";
import { IUndoRedoService } from "./module-0374.mjs";
import { IPathService } from "./module-0938.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { IModelService } from "./module-0080.mjs";


// src/vs/workbench/services/model/common/modelService.ts
var WorkbenchModelService = class extends ModelService {
  constructor(configurationService, resourcePropertiesService, undoRedoService, _pathService, instantiationService) {
    super(configurationService, resourcePropertiesService, undoRedoService, instantiationService);
    this._pathService = _pathService;
  }
  _schemaShouldMaintainUndoRedoElements(resource) {
    return super._schemaShouldMaintainUndoRedoElements(resource) || resource.scheme === this._pathService.defaultUriScheme;
  }
};

WorkbenchModelService = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, ITextResourcePropertiesService),
  __decorateParam(2, IUndoRedoService),
  __decorateParam(3, IPathService),
  __decorateParam(4, IInstantiationService)
], WorkbenchModelService);

registerSingleton(IModelService, WorkbenchModelService, 1 /* Delayed */);
export { WorkbenchModelService };
