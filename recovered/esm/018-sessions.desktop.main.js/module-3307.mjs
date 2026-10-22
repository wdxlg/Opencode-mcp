// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/codeEditor/browser/workbenchReferenceSearch.ts
import { ReferencesController } from "./module-0644.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { registerEditorContribution } from "./module-0097.mjs";


// src/vs/workbench/contrib/codeEditor/browser/workbenchReferenceSearch.ts
var WorkbenchReferencesController = class extends ReferencesController {
  constructor(editor, contextKeyService, editorService, notificationService, instantiationService, storageService, configurationService) {
    super(
      false,
      editor,
      contextKeyService,
      editorService,
      notificationService,
      instantiationService,
      storageService,
      configurationService
    );
  }
};

WorkbenchReferencesController = __decorateClass([
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, ICodeEditorService),
  __decorateParam(3, INotificationService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IStorageService),
  __decorateParam(6, IConfigurationService)
], WorkbenchReferencesController);

registerEditorContribution(ReferencesController.ID, WorkbenchReferencesController, 4 /* Lazy */);
export { WorkbenchReferencesController };
