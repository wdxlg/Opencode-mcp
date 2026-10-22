// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/contrib/layout/layoutActions.ts
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { localize2 } from "./module-0001.mjs";
import { NOTEBOOK_ACTIONS_CATEGORY } from "./module-1869.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { NotebookSetting } from "./module-0909.mjs";


// src/vs/workbench/contrib/notebook/browser/contrib/layout/layoutActions.ts
var TOGGLE_CELL_TOOLBAR_POSITION = "notebook.toggleCellToolbarPosition";

var ToggleCellToolbarPositionAction = class extends Action2 {
  constructor() {
    super({
      id: TOGGLE_CELL_TOOLBAR_POSITION,
      title: localize2(17463, "Toggle Cell Toolbar Position"),
      menu: [{
        id: MenuId.NotebookCellTitle,
        group: "View",
        order: 1
      }],
      category: NOTEBOOK_ACTIONS_CATEGORY,
      f1: false
    });
  }
  async run(accessor, context2) {
    const editor = context2 && context2.ui ? context2.notebookEditor : void 0;
    if (editor && editor.hasModel()) {
      const viewType = editor.textModel.viewType;
      const configurationService = accessor.get(IConfigurationService);
      const toolbarPosition = configurationService.getValue(NotebookSetting.cellToolbarLocation);
      const newConfig = this.togglePosition(viewType, toolbarPosition);
      await configurationService.updateValue(NotebookSetting.cellToolbarLocation, newConfig);
    }
  }
  togglePosition(viewType, toolbarPosition) {
    if (typeof toolbarPosition === "string") {
      if (["left", "right", "hidden"].indexOf(toolbarPosition) >= 0) {
        const newViewValue = toolbarPosition === "right" ? "left" : "right";
        const config = {
          default: toolbarPosition
        };
        config[viewType] = newViewValue;
        return config;
      } else {
        const config = {
          default: "right"
        };
        config[viewType] = "left";
        return config;
      }
    } else {
      const oldValue = toolbarPosition[viewType] ?? toolbarPosition["default"] ?? "right";
      const newViewValue = oldValue === "right" ? "left" : "right";
      const newConfig = {
        ...toolbarPosition
      };
      newConfig[viewType] = newViewValue;
      return newConfig;
    }
  }
};

registerAction2(ToggleCellToolbarPositionAction);
export { TOGGLE_CELL_TOOLBAR_POSITION, ToggleCellToolbarPositionAction };
