// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/welcomeWalkthrough/browser/editor/editorWalkThrough.ts
import { walkThroughContentRegistry } from "./module-3563.mjs";
import { content } from "./module-3568.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { FileAccess, Schemas } from "./module-0033.mjs";
import { Action2 } from "./module-0092.mjs";
import { Categories } from "./module-0847.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { WalkThroughInput } from "./module-3564.mjs";


// src/vs/workbench/contrib/welcomeWalkthrough/browser/editor/editorWalkThrough.ts
walkThroughContentRegistry.registerProvider("vs/workbench/contrib/welcomeWalkthrough/browser/editor/vs_code_editor_walkthrough", content);

var typeId = "workbench.editors.walkThroughInput";

var inputOptions = {
  typeId,
  name: localize(22262, null),
  resource: FileAccess.asBrowserUri("vs/workbench/contrib/welcomeWalkthrough/browser/editor/vs_code_editor_walkthrough.md").with({
    scheme: Schemas.walkThrough,
    query: JSON.stringify({ moduleId: "vs/workbench/contrib/welcomeWalkthrough/browser/editor/vs_code_editor_walkthrough" })
  }),
  telemetryFrom: "walkThrough"
};

var EditorWalkThroughAction = class _EditorWalkThroughAction extends Action2 {
  static {
    this.ID = "workbench.action.showInteractivePlayground";
  }
  static {
    this.LABEL = localize2(22261, "Interactive Editor Playground");
  }
  constructor() {
    super({
      id: _EditorWalkThroughAction.ID,
      title: _EditorWalkThroughAction.LABEL,
      category: Categories.Help,
      f1: true,
      metadata: {
        description: localize2(22263, "Opens an interactive playground for learning about the editor.")
      }
    });
  }
  run(serviceAccessor) {
    const editorService = serviceAccessor.get(IEditorService);
    const instantiationService = serviceAccessor.get(IInstantiationService);
    const input = instantiationService.createInstance(WalkThroughInput, inputOptions);
    return editorService.openEditor(input, { pinned: true }).then(() => void 0);
  }
};

var EditorWalkThroughInputSerializer = class {
  static {
    this.ID = typeId;
  }
  canSerialize(editorInput) {
    return true;
  }
  serialize(editorInput) {
    return "";
  }
  deserialize(instantiationService) {
    return instantiationService.createInstance(WalkThroughInput, inputOptions);
  }
};
export { typeId, inputOptions, EditorWalkThroughAction, EditorWalkThroughInputSerializer };
