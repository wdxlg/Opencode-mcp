// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/surveys/browser/survey.contribution.ts
import { Registry } from "./module-0090.mjs";
import { EditorExtensions } from "./module-0926.mjs";
import { EditorPaneDescriptor } from "./module-1085.mjs";
import { SurveyEditorPane } from "./module-4117.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { SyncDescriptor } from "./module-0134.mjs";
import { SurveyEditorInput } from "./module-4115.mjs";
import { Action2, registerAction2 } from "./module-0092.mjs";
import { Categories } from "./module-0847.mjs";
import { IsDevelopmentContext } from "./module-0635.mjs";
import { IProductService } from "./module-0875.mjs";
import { CommandsRegistry } from "./module-0087.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IEditorGroupsService } from "./module-0934.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { CopilotPMFSurvey } from "./module-4116.mjs";
import { ActiveEditorContext } from "./module-0950.mjs";
import { AccessibleContentProvider } from "./module-0799.mjs";
import { AccessibleViewRegistry } from "./module-0693.mjs";


// src/vs/workbench/contrib/surveys/browser/survey.contribution.ts
Registry.as(EditorExtensions.EditorPane).registerEditorPane(
  EditorPaneDescriptor.create(
    SurveyEditorPane,
    SurveyEditorPane.ID,
    localize(19421, null)
  ),
  [new SyncDescriptor(SurveyEditorInput)]
);

var OpenSurveyAction = class _OpenSurveyAction extends Action2 {
  static {
    this.ID = "workbench.action.openSurvey";
  }
  constructor() {
    super({
      id: _OpenSurveyAction.ID,
      title: localize2(19417, "Open Survey"),
      category: Categories.Developer,
      f1: true,
      precondition: IsDevelopmentContext
    });
  }
  async run(accessor) {
    const productService = accessor.get(IProductService);
    if (productService.quality === "stable") {
      return;
    }
    return openSurveyEditor(accessor, "dev-command");
  }
};

registerAction2(OpenSurveyAction);

var KNOWN_SOURCE_PREFIXES = [
  "completions",
  "panel.",
  "inline.",
  "terminal",
  "agent.",
  "agents",
  "sessions",
  "nps",
  "churn",
  "dev-command"
];

function sanitizeSurveySource(source) {
  if (typeof source !== "string") {
    return "unknown";
  }
  const trimmed = source.trim().slice(0, 64);
  if (KNOWN_SOURCE_PREFIXES.some((prefix) => trimmed === prefix || trimmed.startsWith(prefix))) {
    return trimmed;
  }
  return "unknown";
}

CommandsRegistry.registerCommand("_workbench.action.openCopilotSurvey", (accessor, source) => {
  return openSurveyEditor(accessor, sanitizeSurveySource(source));
});

function openSurveyEditor(accessor, source) {
  const instantiationService = accessor.get(IInstantiationService);
  const editorService = accessor.get(IEditorService);
  const editorGroupsService = accessor.get(IEditorGroupsService);
  const environmentService = accessor.get(IWorkbenchEnvironmentService);
  const surveySource = environmentService.isSessionsWindow ? "agents" : source;
  const input = instantiationService.createInstance(SurveyEditorInput, CopilotPMFSurvey, surveySource);
  for (const editor of editorService.editors) {
    if (editor instanceof SurveyEditorInput && editor.matches(input)) {
      editor.updateSource(surveySource);
      break;
    }
  }
  const preferredGroup = environmentService.isSessionsWindow ? editorGroupsService.mainPart.activeGroup : void 0;
  return editorService.openEditor(input, { pinned: true }, preferredGroup).then(() => void 0);
}

var SurveyAccessibilityHelp = class {
  constructor() {
    this.priority = 100;
    this.name = "survey";
    this.type = "help" /* Help */;
    this.when = ActiveEditorContext.isEqualTo(SurveyEditorPane.ID);
  }
  getProvider(accessor) {
    const editorService = accessor.get(IEditorService);
    const helpText = [
      localize(19418, null),
      localize(19419, null),
      localize(19420, null)
    ].join("\n");
    return new AccessibleContentProvider(
      "survey" /* Survey */,
      { type: "help" /* Help */ },
      () => helpText,
      () => {
        editorService.activeEditorPane?.focus();
      },
      "accessibility.verbosity.survey" /* Survey */
    );
  }
};

AccessibleViewRegistry.register(new SurveyAccessibilityHelp());
export { sanitizeSurveySource, openSurveyEditor, OpenSurveyAction, KNOWN_SOURCE_PREFIXES, SurveyAccessibilityHelp };
