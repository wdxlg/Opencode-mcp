// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/view/cellParts/cellEditorOptions.ts
import { CellContentPart } from "./module-1896.mjs";
import { Emitter } from "./module-0017.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { NOTEBOOK_CELL_LINE_NUMBERS, NOTEBOOK_EDITOR_FOCUSED } from "./module-1868.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { NOTEBOOK_ACTIONS_CATEGORY, NotebookMultiCellAction } from "./module-1869.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ActiveEditorContext } from "./module-0949.mjs";
import { NOTEBOOK_EDITOR_ID } from "./module-0909.mjs";


// src/vs/workbench/contrib/notebook/browser/view/cellParts/cellEditorOptions.ts
var CellEditorOptions = class extends CellContentPart {
  constructor(base, notebookOptions, configurationService) {
    super();
    this.base = base;
    this.notebookOptions = notebookOptions;
    this.configurationService = configurationService;
    this._lineNumbers = "inherit";
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this._register(base.onDidChange(() => {
      this._recomputeOptions();
    }));
    this._value = this._computeEditorOptions();
  }
  set tabSize(value2) {
    if (this._tabSize !== value2) {
      this._tabSize = value2;
      this._onDidChange.fire();
    }
  }
  get tabSize() {
    return this._tabSize;
  }
  set indentSize(value2) {
    if (this._indentSize !== value2) {
      this._indentSize = value2;
      this._onDidChange.fire();
    }
  }
  get indentSize() {
    return this._indentSize;
  }
  set insertSpaces(value2) {
    if (this._insertSpaces !== value2) {
      this._insertSpaces = value2;
      this._onDidChange.fire();
    }
  }
  get insertSpaces() {
    return this._insertSpaces;
  }
  updateState(element, e) {
    if (e.cellLineNumberChanged) {
      this.setLineNumbers(element.lineNumbers);
    }
  }
  _recomputeOptions() {
    this._value = this._computeEditorOptions();
    this._onDidChange.fire();
  }
  _computeEditorOptions() {
    const value2 = this.base.value;
    const cellEditorOverridesRaw = this.notebookOptions.getDisplayOptions().editorOptionsCustomizations;
    const indentSize = cellEditorOverridesRaw?.["editor.indentSize"];
    if (indentSize !== void 0) {
      this.indentSize = indentSize;
    }
    const insertSpaces = cellEditorOverridesRaw?.["editor.insertSpaces"];
    if (insertSpaces !== void 0) {
      this.insertSpaces = insertSpaces;
    }
    const tabSize = cellEditorOverridesRaw?.["editor.tabSize"];
    if (tabSize !== void 0) {
      this.tabSize = tabSize;
    }
    let cellRenderLineNumber = value2.lineNumbers;
    switch (this._lineNumbers) {
      case "inherit":
        if (this.configurationService.getValue("notebook.lineNumbers") === "on") {
          if (value2.lineNumbers === "off") {
            cellRenderLineNumber = "on";
          }
        } else {
          cellRenderLineNumber = "off";
        }
        break;
      case "on":
        if (value2.lineNumbers === "off") {
          cellRenderLineNumber = "on";
        }
        break;
      case "off":
        cellRenderLineNumber = "off";
        break;
    }
    const overrides = {};
    if (value2.lineNumbers !== cellRenderLineNumber) {
      overrides.lineNumbers = cellRenderLineNumber;
    }
    if (this.notebookOptions.getLayoutConfiguration().disableRulers) {
      overrides.rulers = [];
    }
    return {
      ...value2,
      ...overrides
    };
  }
  getUpdatedValue(internalMetadata, cellUri) {
    const options3 = this.getValue(internalMetadata, cellUri);
    delete options3.hover;
    return options3;
  }
  getValue(internalMetadata, cellUri) {
    return {
      ...this._value,
      ...{
        padding: this.notebookOptions.computeEditorPadding(internalMetadata, cellUri)
      }
    };
  }
  getDefaultValue() {
    return {
      ...this._value,
      ...{
        padding: { top: 12, bottom: 12 }
      }
    };
  }
  setLineNumbers(lineNumbers) {
    this._lineNumbers = lineNumbers;
    this._recomputeOptions();
  }
};

Registry.as(Extensions4.Configuration).registerConfiguration({
  id: "notebook",
  order: 100,
  type: "object",
  "properties": {
    "notebook.lineNumbers": {
      type: "string",
      enum: ["off", "on"],
      default: "off",
      markdownDescription: localize(17868, null)
    }
  }
});

registerAction2(class ToggleLineNumberAction extends Action2 {
  constructor() {
    super({
      id: "notebook.toggleLineNumbers",
      title: localize2(17870, "Toggle Notebook Line Numbers"),
      shortTitle: localize2(17871, "Line Numbers"),
      precondition: NOTEBOOK_EDITOR_FOCUSED,
      menu: [
        {
          id: MenuId.NotebookToolbar,
          group: "notebookLayout",
          order: 2,
          when: ContextKeyExpr.equals("config.notebook.globalToolbar", true)
        }
      ],
      category: NOTEBOOK_ACTIONS_CATEGORY,
      f1: true,
      toggled: {
        condition: ContextKeyExpr.notEquals("config.notebook.lineNumbers", "off"),
        title: localize(17869, null)
      }
    });
  }
  async run(accessor) {
    const configurationService = accessor.get(IConfigurationService);
    const renderLiNumbers = configurationService.getValue("notebook.lineNumbers") === "on";
    if (renderLiNumbers) {
      configurationService.updateValue("notebook.lineNumbers", "off");
    } else {
      configurationService.updateValue("notebook.lineNumbers", "on");
    }
  }
});

registerAction2(class ToggleActiveLineNumberAction extends NotebookMultiCellAction {
  constructor() {
    super({
      id: "notebook.cell.toggleLineNumbers",
      title: localize(17867, null),
      precondition: ActiveEditorContext.isEqualTo(NOTEBOOK_EDITOR_ID),
      menu: [{
        id: MenuId.NotebookCellTitle,
        group: "View",
        order: 1
      }],
      toggled: ContextKeyExpr.or(
        NOTEBOOK_CELL_LINE_NUMBERS.isEqualTo("on"),
        ContextKeyExpr.and(NOTEBOOK_CELL_LINE_NUMBERS.isEqualTo("inherit"), ContextKeyExpr.equals("config.notebook.lineNumbers", "on"))
      )
    });
  }
  async runWithContext(accessor, context2) {
    if (context2.ui) {
      this.updateCell(accessor.get(IConfigurationService), context2.cell);
    } else {
      const configurationService = accessor.get(IConfigurationService);
      context2.selectedCells.forEach((cell) => {
        this.updateCell(configurationService, cell);
      });
    }
  }
  updateCell(configurationService, cell) {
    const renderLineNumbers = configurationService.getValue("notebook.lineNumbers") === "on";
    const cellLineNumbers = cell.lineNumbers;
    const currentLineNumberIsOn = cellLineNumbers === "on" || cellLineNumbers === "inherit" && renderLineNumbers;
    if (currentLineNumberIsOn) {
      cell.lineNumbers = "off";
    } else {
      cell.lineNumbers = "on";
    }
  }
});
export { CellEditorOptions };
