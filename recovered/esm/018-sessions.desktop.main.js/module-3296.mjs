// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/codeEditor/browser/inspectKeybindings.ts
import { Action2, registerAction2 } from "./module-0092.mjs";
import { localize2 } from "./module-0001.mjs";
import { Categories } from "./module-0847.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IEditorService } from "./module-0935.mjs";


// src/vs/workbench/contrib/codeEditor/browser/inspectKeybindings.ts
var InspectKeyMap = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.inspectKeyMappings",
      title: localize2(13802, "Inspect Key Mappings"),
      category: Categories.Developer,
      f1: true
    });
  }
  run(accessor, editor) {
    const keybindingService = accessor.get(IKeybindingService);
    const editorService = accessor.get(IEditorService);
    editorService.openEditor({ resource: void 0, contents: keybindingService._dumpDebugInfo(), options: { pinned: true } });
  }
};

registerAction2(InspectKeyMap);

var InspectKeyMapJSON = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.inspectKeyMappingsJSON",
      title: localize2(13803, "Inspect Key Mappings (JSON)"),
      category: Categories.Developer,
      f1: true
    });
  }
  async run(accessor) {
    const editorService = accessor.get(IEditorService);
    const keybindingService = accessor.get(IKeybindingService);
    await editorService.openEditor({ resource: void 0, contents: keybindingService._dumpDebugInfoJSON(), options: { pinned: true } });
  }
};

registerAction2(InspectKeyMapJSON);
export { InspectKeyMap, InspectKeyMapJSON };
