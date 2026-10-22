// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/tools/task/runTaskTool.ts
import { collectTerminalResults, getTaskDefinition, getTaskForTool, resolveDependencyTasks, tasksMatch } from "./module-3158.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { localize } from "./module-0001.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { timeout } from "./module-0036.mjs";
import { toolResultDetailsFromResponse, toolResultMessageFromResponse } from "./module-3159.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITaskService } from "./module-1403.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { ITerminalService } from "./module-1150.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { Codicon } from "./module-0085.mjs";
import { ToolDataSource } from "./module-0991.mjs";


// src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/tools/task/runTaskTool.ts
var RunTaskTool = class {
  constructor(_tasksService, _telemetryService, _terminalService, _configurationService, _instantiationService) {
    this._tasksService = _tasksService;
    this._telemetryService = _telemetryService;
    this._terminalService = _terminalService;
    this._configurationService = _configurationService;
    this._instantiationService = _instantiationService;
  }
  async invoke(invocation, _countTokens, _progress, token) {
    const args2 = invocation.parameters;
    if (!invocation.context) {
      return { content: [{ kind: "text", value: `No invocation context` }], toolResultMessage: `No invocation context` };
    }
    const taskDefinition = getTaskDefinition(args2.id);
    const task = await getTaskForTool(args2.id, taskDefinition, args2.workspaceFolder, this._configurationService, this._tasksService, true);
    if (!task) {
      return { content: [{ kind: "text", value: `Task not found: ${args2.id}` }], toolResultMessage: new MarkdownString(localize(20605, null, args2.id)) };
    }
    const taskLabel = task._label;
    const activeTasks = await this._tasksService.getActiveTasks();
    if (activeTasks.includes(task)) {
      return { content: [{ kind: "text", value: `The task ${taskLabel} is already running.` }], toolResultMessage: new MarkdownString(localize(20603, null, taskLabel)) };
    }
    const dependencyTasks = await resolveDependencyTasks(task, args2.workspaceFolder, this._configurationService, this._tasksService);
    const startMarkersByTerminalInstanceId = /* @__PURE__ */ new Map();
    const startMarkersDisposableStore = new DisposableStore();
    for (const terminal2 of this._terminalService.instances) {
      const marker = terminal2.registerMarker();
      startMarkersByTerminalInstanceId.set(terminal2.instanceId, marker);
      if (marker) {
        startMarkersDisposableStore.add(marker);
      }
    }
    try {
      const raceResult = await Promise.race([this._tasksService.run(task, void 0, 5 /* ChatAgent */), timeout(3e3)]);
      const result = raceResult && typeof raceResult === "object" ? raceResult : void 0;
      const resources = this._tasksService.getTerminalsForTasks(dependencyTasks ?? task);
      if (!resources || resources.length === 0) {
        return { content: [{ kind: "text", value: `Task started but no terminal was found for: ${taskLabel}` }], toolResultMessage: new MarkdownString(localize(20598, null, taskLabel)) };
      }
      const terminals = this._terminalService.instances.filter((t2) => resources.some((r2) => r2.path === t2.resource.path && r2.scheme === t2.resource.scheme));
      if (terminals.length === 0) {
        return { content: [{ kind: "text", value: `Task started but no terminal was found for: ${taskLabel}` }], toolResultMessage: new MarkdownString(localize(20598, null, taskLabel)) };
      }
      const store = new DisposableStore();
      let terminalResults = [];
      try {
        terminalResults = await collectTerminalResults(
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
      } finally {
        store.dispose();
      }
      for (const r2 of terminalResults) {
        this._telemetryService.publicLog2?.("copilotChat.runTaskTool.run", {
          taskId: args2.id,
          bufferLength: r2.output.length ?? 0,
          pollDurationMs: r2.pollDurationMs ?? 0,
          inputToolManualAcceptCount: r2.inputToolManualAcceptCount ?? 0,
          inputToolManualRejectCount: r2.inputToolManualRejectCount ?? 0,
          inputToolManualChars: r2.inputToolManualChars ?? 0,
          inputToolManualShownCount: r2.inputToolManualShownCount ?? 0,
          inputToolFreeFormInputShownCount: r2.inputToolFreeFormInputShownCount ?? 0,
          inputToolFreeFormInputCount: r2.inputToolFreeFormInputCount ?? 0
        });
      }
      const details = terminalResults.map((r2) => `Terminal: ${r2.name}
Output:
${r2.output}`);
      const uniqueDetails = Array.from(new Set(details)).join("\n\n");
      const toolResultDetails = toolResultDetailsFromResponse(terminalResults);
      const toolResultMessage = toolResultMessageFromResponse(result, taskLabel, toolResultDetails, terminalResults, void 0, task.configurationProperties.isBackground);
      return {
        content: [{ kind: "text", value: uniqueDetails }],
        toolResultMessage,
        toolResultDetails
      };
    } finally {
      startMarkersDisposableStore.dispose();
    }
  }
  async _isTaskActive(task) {
    const busyTasks = await this._tasksService.getBusyTasks();
    return busyTasks?.some((t2) => tasksMatch(t2, task)) ?? false;
  }
  async prepareToolInvocation(context2, token) {
    const args2 = context2.parameters;
    const taskDefinition = getTaskDefinition(args2.id);
    const task = await getTaskForTool(args2.id, taskDefinition, args2.workspaceFolder, this._configurationService, this._tasksService, true);
    if (!task) {
      return { invocationMessage: new MarkdownString(localize(20605, null, args2.id)) };
    }
    const taskLabel = task._label;
    const activeTasks = await this._tasksService.getActiveTasks();
    if (task && activeTasks.includes(task)) {
      return { invocationMessage: new MarkdownString(localize(20602, null)) };
    }
    if (await this._isTaskActive(task)) {
      return {
        invocationMessage: new MarkdownString(localize(20604, null, taskLabel)),
        pastTenseMessage: new MarkdownString(localize(20606, null, taskLabel)),
        confirmationMessages: void 0
      };
    }
    return {
      invocationMessage: new MarkdownString(localize(20600, null, taskLabel)),
      pastTenseMessage: new MarkdownString(task?.configurationProperties.isBackground ? localize(20601, null, taskLabel) : localize(20599, null, taskLabel)),
      confirmationMessages: task ? { title: localize(20597, null), message: localize(20596, null, taskLabel) } : void 0
    };
  }
};

RunTaskTool = __decorateClass([
  __decorateParam(0, ITaskService),
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, ITerminalService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IInstantiationService)
], RunTaskTool);

var RunTaskToolData = {
  id: "run_task" /* RunTask */,
  toolReferenceName: "runTask",
  legacyToolReferenceFullNames: ["runTasks/runTask"],
  displayName: localize(20607, null),
  modelDescription: `Runs a VS Code task.

- If you see that an appropriate task exists for building or running code, prefer to use this tool to run the task instead of using the ${"run_in_terminal" /* RunInTerminal */} tool.
- Make sure that any appropriate build or watch task is running before trying to run tests or execute code.
- If the user asks to run a task, use this tool to do so.`,
  userDescription: localize(20608, null),
  icon: Codicon.tools,
  source: ToolDataSource.Internal,
  inputSchema: {
    "type": "object",
    "properties": {
      "workspaceFolder": {
        "type": "string",
        "description": "The workspace folder path containing the task"
      },
      "id": {
        "type": "string",
        "description": "The task ID to run."
      }
    },
    "required": [
      "workspaceFolder",
      "id"
    ]
  }
};
export { RunTaskTool, RunTaskToolData };
