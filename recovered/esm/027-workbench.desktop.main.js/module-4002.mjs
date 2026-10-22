// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/surveys/browser/surveyEditorInput.ts
import { registerIcon } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { EditorInput } from "./module-0928.mjs";
import { URI } from "./module-0032.mjs";


// src/vs/workbench/contrib/surveys/browser/surveyEditorInput.ts
var surveyIcon = registerIcon("survey", Codicon.feedback, localize(19422, null));

var SurveyEditorInput = class _SurveyEditorInput extends EditorInput {
  constructor(survey, source) {
    super();
    this.survey = survey;
    this._source = source;
  }
  static {
    this.ID = "workbench.input.survey";
  }
  get source() {
    return this._source;
  }
  /** Update the source when re-triggered while already open. */
  updateSource(source) {
    this._source = source;
  }
  get typeId() {
    return _SurveyEditorInput.ID;
  }
  get editorId() {
    return this.typeId;
  }
  get resource() {
    return URI.from({ scheme: "vscode-survey", path: `/${this.survey.id}` });
  }
  getName() {
    return this.survey.title;
  }
  getIcon() {
    return surveyIcon;
  }
  matches(other) {
    return other instanceof _SurveyEditorInput && other.survey.id === this.survey.id;
  }
  get capabilities() {
    return 8 /* Singleton */ | 2 /* Readonly */;
  }
};
export { surveyIcon, SurveyEditorInput };
