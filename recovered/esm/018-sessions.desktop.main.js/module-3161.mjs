// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/tools/task/getTaskOutputTool.ts
import { localize } from "./module-0001.mjs";
import { ToolDataSource } from "./module-0991.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { collectTerminalResults, getTaskDefinition, getTaskForTool, resolveDependencyTasks, tasksMatch } from "./module-3158.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { toolResultDetailsFromResponse, toolResultMessageFromResponse } from "./module-3159.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITaskService } from "./module-1403.mjs";
import { ITerminalService } from "./module-1150.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ITelemetryService } from "./module-0093.mjs";


// src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/tools/task/getTaskOutputTool.ts
var GetTaskOutputToolData = {
  id: "get_task_output" /* GetTaskOutput */,
  toolReferenceName: "getTaskOutput",
  legacyToolReferenceFullNames: ["runTasks/getTaskOutput"],
  displayName: localize(20595, null),
  modelDescription: "Get the output of a task",
  source: ToolDataSource.Internal,
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The task ID for which to get the output."
      },
      workspaceFolder: {
        type: "string",
        description: "The workspace folder path containing the task"
      }
    },
    required: [
      "id",
      "workspaceFolder"
    ]
  }
};

var GetTaskOutputTool = class extends Disposable {
  constructor(_tasksService, _terminalService, _configurationService, _instantiationService, _telemetryService) {
    super();
    this._tasksService = _tasksService;
    this._terminalService = _terminalService;
    this._configurationService = _configurationService;
    this._instantiationService = _instantiationService;
    this._telemetryService = _telemetryService;
  }
  async prepareToolInvocation(context2, token) {
    const args2 = context2.parameters;
    const taskDefinition = getTaskDefinition(args2.id);
    const task = await getTaskForTool(args2.id, taskDefinition, args2.workspaceFolder, this._configurationService, this._tasksService, true);
    if (!task) {
      return { invocationMessage: new MarkdownString(localize(20593, null, args2.id)) };
    }
    const taskLabel = task._label;
    const activeTasks = await this._tasksService.getActiveTasks();
    if (activeTasks.includes(task)) {
      return { invocationMessage: new MarkdownString(localize(20592, null, taskLabel)) };
    }
    return {
      invocationMessage: new MarkdownString(localize(20591, null, taskLabel)),
      pastTenseMessage: new MarkdownString(localize(20590, null, taskLabel))
    };
  }
  async invoke(invocation, _countTokens, _progress, token) {
    const args2 = invocation.parameters;
    const taskDefinition = getTaskDefinition(args2.id);
    const task = await getTaskForTool(args2.id, taskDefinition, args2.workspaceFolder, this._configurationService, this._tasksService, true);
    if (!task) {
      return { content: [{ kind: "text", value: `Task not found: ${args2.id}` }], toolResultMessage: new MarkdownString(localize(20593, null, args2.id)) };
    }
    const dependencyTasks = await resolveDependencyTasks(task, args2.workspaceFolder, this._configurationService, this._tasksService);
    const resources = this._tasksService.getTerminalsForTasks(dependencyTasks ?? task);
    const taskLabel = task._label;
    const terminals = resources?.map((resource) => this._terminalService.instances.find((t2) => t2.resource.path === resource?.path && t2.resource.scheme === resource.scheme)).filter((t2) => !!t2);
    if (!terminals || terminals.length === 0) {
      return { content: [{ kind: "text", value: `Terminal not found for task ${taskLabel}` }], toolResultMessage: new MarkdownString(localize(20594, null, taskLabel)) };
    }
    const startMarkersByTerminalInstanceId = task.configurationProperties.isBackground ? /* @__PURE__ */ new Map() : void 0;
    if (startMarkersByTerminalInstanceId) {
      for (const terminal2 of terminals) {
        startMarkersByTerminalInstanceId.set(terminal2.instanceId, void 0);
      }
    }
    const store = new DisposableStore();
    try {
      const terminalResults = await collectTerminalResults(
        terminals,
        task,
        this._instantiationService,
        invocation.context,
        _progress,
        token,
        store,
        (terminalTask) => this._isTaskActive(terminalTask),
        dependencyTasks,
        this._tasksService,
        startMarkersByTerminalInstanceId
      );
      for (const r2 of terminalResults) {
        this._telemetryService.publicLog2?.("copilotChat.getTaskOutputTool.get", {
          taskId: args2.id,
          bufferLength: r2.output.length ?? 0,
          pollDurationMs: r2.pollDurationMs ?? 0,
          inputToolManualAcceptCount: r2.inputToolManualAcceptCount ?? 0,
          inputToolManualRejectCount: r2.inputToolManualRejectCount ?? 0,
          inputToolManualChars: r2.inputToolManualChars ?? 0,
          inputToolManualShownCount: r2.inputToolManualShownCount ?? 0,
          inputToolFreeFormInputCount: r2.inputToolFreeFormInputCount ?? 0,
          inputToolFreeFormInputShownCount: r2.inputToolFreeFormInputShownCount ?? 0
        });
      }
      const details = terminalResults.map((r2) => `Terminal: ${r2.name}
Output:
${r2.output}`);
      const uniqueDetails = Array.from(new Set(details)).join("\n\n");
      const toolResultDetails = toolResultDetailsFromResponse(terminalResults);
      const toolResultMessage = toolResultMessageFromResponse(void 0, taskLabel, toolResultDetails, terminalResults, true, task.configurationProperties.isBackground);
      return {
        content: [{ kind: "text", value: uniqueDetails }],
        toolResultMessage,
        toolResultDetails
      };
    } finally {
      store.dispose();
    }
  }
  async _isTaskActive(task) {
    const busyTasks = await this._tasksService.getBusyTasks();
    return busyTasks?.some((t2) => tasksMatch(t2, task)) ?? false;
  }
};

GetTaskOutputTool = __decorateClass([
  __decorateParam(0, ITaskService),
  __decorateParam(1, ITerminalService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, ITelemetryService)
], GetTaskOutputTool);
export { GetTaskOutputToolData, GetTaskOutputTool };
