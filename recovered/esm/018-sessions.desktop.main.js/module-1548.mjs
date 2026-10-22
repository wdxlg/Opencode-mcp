// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/editor/binaryDiffEditor.ts
import { SideBySideEditor2 } from "./module-1524.mjs";
import { BINARY_DIFF_EDITOR_ID } from "./module-0926.mjs";
import { BaseBinaryResourceEditor } from "./module-1547.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ITextResourceConfigurationService } from "./module-0204.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IEditorGroupsService } from "./module-0934.mjs";


// src/vs/workbench/browser/parts/editor/binaryDiffEditor.ts
var BinaryResourceDiffEditor = class extends SideBySideEditor2 {
  static {
    this.ID = BINARY_DIFF_EDITOR_ID;
  }
  constructor(group2, telemetryService, instantiationService, themeService, storageService, configurationService, textResourceConfigurationService, editorService, editorGroupService) {
    super(group2, telemetryService, instantiationService, themeService, storageService, configurationService, textResourceConfigurationService, editorService, editorGroupService);
  }
  getMetadata() {
    const primary = this.getPrimaryEditorPane();
    const secondary = this.getSecondaryEditorPane();
    if (primary instanceof BaseBinaryResourceEditor && secondary instanceof BaseBinaryResourceEditor) {
      return localize(6272, null, secondary.getMetadata(), primary.getMetadata());
    }
    return void 0;
  }
};

BinaryResourceDiffEditor = __decorateClass([
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IThemeService),
  __decorateParam(4, IStorageService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, ITextResourceConfigurationService),
  __decorateParam(7, IEditorService),
  __decorateParam(8, IEditorGroupsService)
], BinaryResourceDiffEditor);
export { BinaryResourceDiffEditor };
