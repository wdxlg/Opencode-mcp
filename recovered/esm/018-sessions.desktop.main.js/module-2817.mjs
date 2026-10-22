// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/searchEditor/browser/searchEditorModel.ts
import { Emitter } from "./module-0017.mjs";
import { assertReturnsDefined } from "./module-0010.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { IModelService } from "./module-0080.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IWorkingCopyBackupService } from "./module-1122.mjs";
import { SEARCH_RESULT_LANGUAGE_ID } from "./module-1000.mjs";
import { parseSavedSearchEditor, parseSerializedSearchEditor } from "./module-2816.mjs";
import { SearchEditorWorkingCopyTypeId } from "./module-2808.mjs";
import { createTextBufferFactoryFromStream } from "./module-0423.mjs";


// src/vs/workbench/contrib/searchEditor/browser/searchEditorModel.ts
var SearchConfigurationModel = class {
  constructor(config) {
    this.config = config;
    this._onConfigDidUpdate = new Emitter();
    this.onConfigDidUpdate = this._onConfigDidUpdate.event;
  }
  updateConfig(config) {
    this.config = config;
    this._onConfigDidUpdate.fire(config);
  }
};

var SearchEditorModel = class {
  constructor(resource) {
    this.resource = resource;
  }
  async resolve() {
    return assertReturnsDefined(searchEditorModelFactory.models.get(this.resource)).resolve();
  }
};

var SearchEditorModelFactory = class {
  constructor() {
    this.models = new ResourceMap();
  }
  initializeModelFromExistingModel(accessor, resource, config) {
    if (this.models.has(resource)) {
      throw Error("Unable to contruct model for resource that already exists");
    }
    const languageService = accessor.get(ILanguageService);
    const modelService = accessor.get(IModelService);
    const instantiationService = accessor.get(IInstantiationService);
    const workingCopyBackupService = accessor.get(IWorkingCopyBackupService);
    let ongoingResolve;
    this.models.set(resource, {
      resolve: () => {
        if (!ongoingResolve) {
          ongoingResolve = (async () => {
            const backup = await this.tryFetchModelFromBackupService(resource, languageService, modelService, workingCopyBackupService, instantiationService);
            if (backup) {
              return backup;
            }
            return Promise.resolve({
              resultsModel: modelService.getModel(resource) ?? modelService.createModel("", languageService.createById(SEARCH_RESULT_LANGUAGE_ID), resource),
              configurationModel: new SearchConfigurationModel(config)
            });
          })();
        }
        return ongoingResolve;
      }
    });
  }
  initializeModelFromRawData(accessor, resource, config, contents) {
    if (this.models.has(resource)) {
      throw Error("Unable to contruct model for resource that already exists");
    }
    const languageService = accessor.get(ILanguageService);
    const modelService = accessor.get(IModelService);
    const instantiationService = accessor.get(IInstantiationService);
    const workingCopyBackupService = accessor.get(IWorkingCopyBackupService);
    let ongoingResolve;
    this.models.set(resource, {
      resolve: () => {
        if (!ongoingResolve) {
          ongoingResolve = (async () => {
            const backup = await this.tryFetchModelFromBackupService(resource, languageService, modelService, workingCopyBackupService, instantiationService);
            if (backup) {
              return backup;
            }
            return Promise.resolve({
              resultsModel: modelService.createModel(contents ?? "", languageService.createById(SEARCH_RESULT_LANGUAGE_ID), resource),
              configurationModel: new SearchConfigurationModel(config)
            });
          })();
        }
        return ongoingResolve;
      }
    });
  }
  initializeModelFromExistingFile(accessor, resource, existingFile) {
    if (this.models.has(resource)) {
      throw Error("Unable to contruct model for resource that already exists");
    }
    const languageService = accessor.get(ILanguageService);
    const modelService = accessor.get(IModelService);
    const instantiationService = accessor.get(IInstantiationService);
    const workingCopyBackupService = accessor.get(IWorkingCopyBackupService);
    let ongoingResolve;
    this.models.set(resource, {
      resolve: async () => {
        if (!ongoingResolve) {
          ongoingResolve = (async () => {
            const backup = await this.tryFetchModelFromBackupService(resource, languageService, modelService, workingCopyBackupService, instantiationService);
            if (backup) {
              return backup;
            }
            const { text: text2, config } = await instantiationService.invokeFunction(parseSavedSearchEditor, existingFile);
            return {
              resultsModel: modelService.createModel(text2 ?? "", languageService.createById(SEARCH_RESULT_LANGUAGE_ID), resource),
              configurationModel: new SearchConfigurationModel(config)
            };
          })();
        }
        return ongoingResolve;
      }
    });
  }
  async tryFetchModelFromBackupService(resource, languageService, modelService, workingCopyBackupService, instantiationService) {
    const backup = await workingCopyBackupService.resolve({ resource, typeId: SearchEditorWorkingCopyTypeId });
    let model = modelService.getModel(resource);
    if (!model && backup) {
      const factory = await createTextBufferFactoryFromStream(backup.value);
      model = modelService.createModel(factory, languageService.createById(SEARCH_RESULT_LANGUAGE_ID), resource);
    }
    if (model) {
      const existingFile = model.getValue();
      const { text: text2, config } = parseSerializedSearchEditor(existingFile);
      modelService.destroyModel(resource);
      return {
        resultsModel: modelService.createModel(text2 ?? "", languageService.createById(SEARCH_RESULT_LANGUAGE_ID), resource),
        configurationModel: new SearchConfigurationModel(config)
      };
    } else {
      return void 0;
    }
  }
};

var searchEditorModelFactory = new SearchEditorModelFactory();
export { SearchConfigurationModel, SearchEditorModel, SearchEditorModelFactory, searchEditorModelFactory };
