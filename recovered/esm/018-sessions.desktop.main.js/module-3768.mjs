// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/editor/browser/emptyFileEditor.ts
import { CompactButtonActionViewItem } from "./module-3711.mjs";
import { localize } from "./module-0001.mjs";
import { EditorPane } from "./module-1090.mjs";
import { EmptyFileEditorInput } from "./module-3767.mjs";
import { $, append } from "./module-0075.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Action } from "./module-0082.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/sessions/contrib/editor/browser/emptyFileEditor.ts
var QUICK_OPEN_COMMAND_ID = "workbench.action.quickOpen";

var SearchFilesActionViewItem = class extends CompactButtonActionViewItem {
  get commandId() {
    return QUICK_OPEN_COMMAND_ID;
  }
  get label() {
    return localize(4770, null);
  }
  getHoverContent(keybindingLabel2) {
    return keybindingLabel2 ? localize(4773, null, keybindingLabel2) : localize(4774, null);
  }
  getAriaLabel(keybindingAriaLabel) {
    return keybindingAriaLabel ? localize(4771, null, keybindingAriaLabel) : localize(4772, null);
  }
};

var EmptyFileEditor = class extends EditorPane {
  constructor(group2, telemetryService, themeService, storageService, commandService, instantiationService) {
    super(EmptyFileEditor.ID, group2, telemetryService, themeService, storageService);
    this.commandService = commandService;
    this.instantiationService = instantiationService;
  }
  static {
    this.ID = EmptyFileEditorInput.EDITOR_ID;
  }
  createEditor(parent) {
    const container2 = append(parent, $(".empty-file-editor"));
    const content = append(container2, $(".empty-file-editor-content"));
    append(content, $(`.empty-file-editor-icon${ThemeIcon.asCSSSelector(EmptyFileEditorInput.ICON)}`));
    const description = append(content, $(".empty-file-editor-description"));
    description.textContent = localize(4769, null);
    const actions = append(content, $(".empty-file-editor-actions"));
    const action = this._register(this.createSearchAction());
    const actionViewItem = this._register(this.instantiationService.createInstance(SearchFilesActionViewItem, action));
    actionViewItem.render(actions);
  }
  createSearchAction() {
    return new Action(QUICK_OPEN_COMMAND_ID, localize(4770, null), void 0, true, () => this.commandService.executeCommand(QUICK_OPEN_COMMAND_ID, ""));
  }
  focus() {
  }
  layout(_dimension) {
  }
};

EmptyFileEditor = __decorateClass([
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IThemeService),
  __decorateParam(3, IStorageService),
  __decorateParam(4, ICommandService),
  __decorateParam(5, IInstantiationService)
], EmptyFileEditor);
export { QUICK_OPEN_COMMAND_ID, SearchFilesActionViewItem, EmptyFileEditor };
