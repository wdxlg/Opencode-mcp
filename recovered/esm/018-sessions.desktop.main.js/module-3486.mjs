// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/browser/parts/editorParts.ts
import { EditorParts } from "./module-3481.mjs";
import { IAgentWorkbenchLayoutService } from "./module-3474.mjs";
import { SinglePaneMainEditorPart } from "./module-3485.mjs";
import { MainEditorPart2 } from "./module-3482.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { IEditorGroupsService } from "./module-0934.mjs";


// src/vs/sessions/browser/parts/editorParts.ts
var EditorParts2 = class extends EditorParts {
  createMainEditorPart() {
    const layoutService = this.instantiationService.invokeFunction((accessor) => accessor.get(IAgentWorkbenchLayoutService));
    const editorPart = layoutService.isSinglePaneLayoutEnabled ? this.instantiationService.createInstance(SinglePaneMainEditorPart, this) : this.instantiationService.createInstance(MainEditorPart2, this);
    this._register(editorPart.enforcePartOptions({ tabActionReserveSpace: false }));
    return editorPart;
  }
  moveGroup(group2, location2, direction) {
    if (this.involvesSinglePaneMainPart(group2, location2)) {
      return this.resolveGroup(group2);
    }
    return super.moveGroup(group2, location2, direction);
  }
  copyGroup(group2, location2, direction) {
    if (this.involvesSinglePaneMainPart(group2, location2)) {
      return this.resolveGroup(group2);
    }
    return super.copyGroup(group2, location2, direction);
  }
  involvesSinglePaneMainPart(group2, location2) {
    return this.mainPart instanceof SinglePaneMainEditorPart && (this.getPart(group2) === this.mainPart || this.getPart(location2) === this.mainPart);
  }
  resolveGroup(group2) {
    const resolvedGroup = typeof group2 === "number" ? this.getGroup(group2) : group2;
    if (!resolvedGroup) {
      throw new Error("Invalid editor group provided!");
    }
    return resolvedGroup;
  }
};

registerSingleton(IEditorGroupsService, EditorParts2, 0 /* Eager */);
export { EditorParts2 };
