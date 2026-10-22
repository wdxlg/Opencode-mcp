// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/welcomeGettingStarted/browser/gettingStartedInput.ts
import { EditorInput } from "./module-0929.mjs";
import { URI } from "./module-0032.mjs";
import { Schemas } from "./module-0033.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/welcomeGettingStarted/browser/gettingStartedInput.ts
var gettingStartedInputTypeId = "workbench.editors.gettingStartedInput";

var GettingStartedInput = class _GettingStartedInput extends EditorInput {
  static {
    this.ID = gettingStartedInputTypeId;
  }
  static {
    this.RESOURCE = URI.from({ scheme: Schemas.walkThrough, authority: "vscode_getting_started_page" });
  }
  get typeId() {
    return _GettingStartedInput.ID;
  }
  get editorId() {
    return this.typeId;
  }
  toUntyped() {
    return {
      resource: _GettingStartedInput.RESOURCE,
      options: {
        override: _GettingStartedInput.ID,
        pinned: false
      }
    };
  }
  get resource() {
    return _GettingStartedInput.RESOURCE;
  }
  matches(other) {
    if (super.matches(other)) {
      return true;
    }
    return other instanceof _GettingStartedInput;
  }
  constructor(options3) {
    super();
    this._selectedCategory = options3.selectedCategory;
    this._selectedStep = options3.selectedStep;
    this._showTelemetryNotice = !!options3.showTelemetryNotice;
    this._showWelcome = options3.showWelcome ?? true;
    this._walkthroughPageTitle = options3.walkthroughPageTitle;
    this._returnToCommand = options3.returnToCommand;
  }
  getName() {
    return this.walkthroughPageTitle ? localize(21993, null, this.walkthroughPageTitle) : localize(21992, null);
  }
  get selectedCategory() {
    return this._selectedCategory;
  }
  set selectedCategory(selectedCategory) {
    this._selectedCategory = selectedCategory;
    this._onDidChangeLabel.fire();
  }
  get selectedStep() {
    return this._selectedStep;
  }
  set selectedStep(selectedStep) {
    this._selectedStep = selectedStep;
  }
  get showTelemetryNotice() {
    return this._showTelemetryNotice;
  }
  set showTelemetryNotice(value2) {
    this._showTelemetryNotice = value2;
  }
  get showWelcome() {
    return this._showWelcome;
  }
  set showWelcome(value2) {
    this._showWelcome = value2;
  }
  get walkthroughPageTitle() {
    return this._walkthroughPageTitle;
  }
  set walkthroughPageTitle(value2) {
    this._walkthroughPageTitle = value2;
  }
  get returnToCommand() {
    return this._returnToCommand;
  }
  set returnToCommand(value2) {
    this._returnToCommand = value2;
  }
};
export { gettingStartedInputTypeId, GettingStartedInput };
