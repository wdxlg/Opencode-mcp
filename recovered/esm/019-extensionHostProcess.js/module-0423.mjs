// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/contrib/chat/common/tools/builtinTools/tools.ts
import { Disposable, MutableDisposable } from "./module-0011.mjs";
import { EditTool, EditToolData } from "./module-0401.mjs";
import { AskQuestionsTool, AskQuestionsToolData } from "./module-0402.mjs";
import { ReviewPlanTool, ReviewPlanToolData } from "./module-0407.mjs";
import { ManageTodoListTool, createManageTodoListToolData } from "./module-0406.mjs";
import { ConfirmationTool, ConfirmationToolData, ConfirmationToolWithOptionsData, ModifiedFilesConfirmationTool, ModifiedFilesConfirmationToolData } from "./module-0403.mjs";
import { TaskCompleteTool, TaskCompleteToolData } from "./module-0422.mjs";
import { SetArtifactsTool, SetArtifactsToolData } from "./module-0420.mjs";
import { SetArtifactRulesTool, SetArtifactRulesToolData } from "./module-0421.mjs";
import { RunSubagentTool } from "./module-0417.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILanguageModelToolsService } from "./module-0191.mjs";
import { IInstantiationService } from "./module-0048.mjs";
import { IConfigurationService } from "./module-0131.mjs";


// src/vs/workbench/contrib/chat/common/tools/builtinTools/tools.ts
var BuiltinToolsContribution = class extends Disposable {
  static {
    this.ID = "chat.builtinTools";
  }
  constructor(toolsService, instantiationService, configurationService) {
    super();
    const editTool = instantiationService.createInstance(EditTool);
    this._register(toolsService.registerTool(EditToolData, editTool));
    const askQuestionsTool = this._register(instantiationService.createInstance(AskQuestionsTool));
    this._register(toolsService.registerTool(AskQuestionsToolData, askQuestionsTool));
    this._register(toolsService.vscodeToolSet.addTool(AskQuestionsToolData));
    const reviewPlanTool = this._register(instantiationService.createInstance(ReviewPlanTool));
    this._register(toolsService.registerTool(ReviewPlanToolData, reviewPlanTool));
    const todoToolData = createManageTodoListToolData();
    const manageTodoListTool = this._register(instantiationService.createInstance(ManageTodoListTool));
    this._register(toolsService.registerTool(todoToolData, manageTodoListTool));
    const confirmationTool = instantiationService.createInstance(ConfirmationTool);
    this._register(toolsService.registerTool(ConfirmationToolData, confirmationTool));
    this._register(toolsService.registerTool(ConfirmationToolWithOptionsData, confirmationTool));
    const modifiedFilesConfirmationTool = instantiationService.createInstance(ModifiedFilesConfirmationTool);
    this._register(toolsService.registerTool(ModifiedFilesConfirmationToolData, modifiedFilesConfirmationTool));
    const taskCompleteTool = instantiationService.createInstance(TaskCompleteTool);
    this._register(toolsService.registerTool(TaskCompleteToolData, taskCompleteTool));
    const setArtifactsTool = instantiationService.createInstance(SetArtifactsTool);
    const setArtifactRulesTool = instantiationService.createInstance(SetArtifactRulesTool);
    const setArtifactsRegistration = this._register(new MutableDisposable());
    const setArtifactRulesRegistration = this._register(new MutableDisposable());
    const updateArtifactsRegistration = () => {
      if (configurationService.getValue("chat.artifacts.enabled" /* ArtifactsEnabled */)) {
        if (!setArtifactsRegistration.value) {
          setArtifactsRegistration.value = toolsService.registerTool(SetArtifactsToolData, setArtifactsTool);
        }
        if (!setArtifactRulesRegistration.value) {
          setArtifactRulesRegistration.value = toolsService.registerTool(SetArtifactRulesToolData, setArtifactRulesTool);
        }
      } else {
        setArtifactsRegistration.clear();
        setArtifactRulesRegistration.clear();
      }
    };
    updateArtifactsRegistration();
    this._register(configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("chat.artifacts.enabled" /* ArtifactsEnabled */)) {
        updateArtifactsRegistration();
      }
    }));
    const runSubagentTool = this._register(instantiationService.createInstance(RunSubagentTool));
    let runSubagentRegistration;
    let toolSetRegistration;
    const registerRunSubagentTool = () => {
      runSubagentRegistration?.dispose();
      toolSetRegistration?.dispose();
      toolsService.flushToolUpdates();
      const runSubagentToolData = runSubagentTool.getToolData();
      runSubagentRegistration = toolsService.registerTool(runSubagentToolData, runSubagentTool);
      toolSetRegistration = toolsService.agentToolSet.addTool(runSubagentToolData);
    };
    registerRunSubagentTool();
    this._register(runSubagentTool.onDidUpdateToolData(registerRunSubagentTool));
    this._register({
      dispose: () => {
        runSubagentRegistration?.dispose();
        toolSetRegistration?.dispose();
      }
    });
  }
};

BuiltinToolsContribution = __decorateClass([
  __decorateParam(0, ILanguageModelToolsService),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IConfigurationService)
], BuiltinToolsContribution);

var InternalFetchWebPageToolId = "vscode_fetchWebPage_internal";
export { BuiltinToolsContribution, InternalFetchWebPageToolId };
