// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/tools/task/createAndRunTaskTool.ts
import { URI } from "./module-0032.mjs";
import { VSBuffer } from "./module-0038.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { localize } from "./module-0001.mjs";
import { timeout } from "./module-0036.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { collectTerminalResults, resolveDependencyTasks, tasksMatch } from "./module-3369.mjs";
import { toolResultDetailsFromResponse, toolResultMessageFromResponse } from "./module-3370.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITaskService } from "./module-1404.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { ITerminalService } from "./module-1149.mjs";
import { IFileService } from "./module-0269.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ToolDataSource } from "./module-0990.mjs";


// src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/tools/task/createAndRunTaskTool.ts
var CreateAndRunTaskTool = class {
  constructor(_tasksService, _telemetryService, _terminalService, _fileService, _configurationService, _instantiationService) {
    this._tasksService = _tasksService;
    this._telemetryService = _telemetryService;
    this._terminalService = _terminalService;
    this._fileService = _fileService;
    this._configurationService = _configurationService;
    this._instantiationService = _instantiationService;
  }
  async invoke(invocation, _countTokens, _progress, token) {
    const args2 = invocation.parameters;
    if (!invocation.context) {
      return { content: [{ kind: "text", value: `No invocation context` }], toolResultMessage: `No invocation context` };
    }
    const tasksJsonUri = URI.file(args2.workspaceFolder).with({ path: `${args2.workspaceFolder}/.vscode/tasks.json` });
    const exists = await this._fileService.exists(tasksJsonUri);
    const newTask = {
      label: args2.task.label,
      type: args2.task.type,
      command: args2.task.command,
      args: args2.task.args,
      isBackground: args2.task.isBackground,
      problemMatcher: args2.task.problemMatcher,
      group: args2.task.group
    };
    const tasksJsonContent = JSON.stringify({
      version: "2.0.0",
      tasks: [newTask]
    }, null, "	");
    if (!exists) {
      await this._fileService.createFile(tasksJsonUri, VSBuffer.fromString(tasksJsonContent), { overwrite: true });
      _progress.report({ message: "Created tasks.json file" });
    } else {
      const content2 = await this._fileService.readFile(tasksJsonUri);
      const tasksJson = JSON.parse(content2.value.toString());
      tasksJson.tasks.push(newTask);
      await this._fileService.writeFile(tasksJsonUri, VSBuffer.fromString(JSON.stringify(tasksJson, null, "	")));
      _progress.report({ message: "Updated tasks.json file" });
    }
    _progress.report({ message: new MarkdownString(localize(20579, null)) });
    let task;
    const start = Date.now();
    while (Date.now() - start < 5e3 && !token.isCancellationRequested) {
      task = (await this._tasksService.tasks())?.find((t2) => t2._label === args2.task.label);
      if (task) {
        break;
      }
      await timeout(100);
    }
    if (!task) {
      return { content: [{ kind: "text", value: `Task not found: ${args2.task.label}` }], toolResultMessage: new MarkdownString(localize(20582, null, args2.task.label)) };
    }
    const preRunMarkersStore = new DisposableStore();
    let result;
    let terminalResults = [];
    try {
      const dependencyTasks = await resolveDependencyTasks(task, args2.workspaceFolder, this._configurationService, this._tasksService);
      const startMarkersByTerminalInstanceId = /* @__PURE__ */ new Map();
      for (const terminal2 of this._terminalService.instances) {
        const marker = terminal2.registerMarker();
        startMarkersByTerminalInstanceId.set(terminal2.instanceId, marker);
        if (marker) {
          preRunMarkersStore.add(marker);
        }
      }
      _progress.report({ message: new MarkdownString(localize(20581, null, args2.task.label)) });
      const raceResult = await Promise.race([this._tasksService.run(task, void 0, 5 /* ChatAgent */), timeout(3e3)]);
      result = raceResult && typeof raceResult === "object" ? raceResult : void 0;
      const resources = this._tasksService.getTerminalsForTasks(dependencyTasks ?? task);
      const terminals = resources?.map((resource) => this._terminalService.instances.find((t2) => t2.resource.path === resource?.path && t2.resource.scheme === resource.scheme)).filter(Boolean);
      if (!terminals || terminals.length === 0) {
        return { content: [{ kind: "text", value: `Task started but no terminal was found for: ${args2.task.label}` }], toolResultMessage: new MarkdownString(localize(20580, null, args2.task.label)) };
      }
      const store = new DisposableStore();
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
    } finally {
      preRunMarkersStore.dispose();
    }
    for (const r2 of terminalResults) {
      this._telemetryService.publicLog2?.("copilotChat.runTaskTool.createAndRunTask", {
        taskId: args2.task.label,
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
    const toolResultMessage = toolResultMessageFromResponse(result, args2.task.label, toolResultDetails, terminalResults, void 0, task.configurationProperties.isBackground);
    return {
      content: [{ kind: "text", value: uniqueDetails }],
      toolResultMessage,
      toolResultDetails
    };
  }
  async _isTaskActive(task) {
    const busyTasks = await this._tasksService.getBusyTasks();
    return busyTasks?.some((t2) => tasksMatch(t2, task)) ?? false;
  }
  async prepareToolInvocation(context2, token) {
    const args2 = context2.parameters;
    const task = args2.task;
    const allTasks = await this._tasksService.tasks();
    if (allTasks?.find((t2) => t2._label === task.label)) {
      return {
        invocationMessage: new MarkdownString(localize(20588, null, task.label)),
        pastTenseMessage: new MarkdownString(localize(20589, null, task.label)),
        confirmationMessages: void 0
      };
    }
    const activeTasks = await this._tasksService.getActiveTasks();
    if (activeTasks.find((t2) => t2._label === task.label)) {
      return {
        invocationMessage: new MarkdownString(localize(20578, null, task.label)),
        pastTenseMessage: new MarkdownString(localize(20578, null, task.label)),
        confirmationMessages: void 0
      };
    }
    return {
      invocationMessage: new MarkdownString(localize(20585, null, task.label)),
      pastTenseMessage: new MarkdownString(localize(20586, null, task.label)),
      confirmationMessages: {
        title: localize(20577, null),
        message: new MarkdownString(
          localize(
            20587,
            null,
            task.label,
            task.command,
            task.args?.length ? ` and args \`${task.args.join(" ")}\`` : ""
          )
        )
      }
    };
  }
};

CreateAndRunTaskTool = __decorateClass([
  __decorateParam(0, ITaskService),
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, ITerminalService),
  __decorateParam(3, IFileService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IInstantiationService)
], CreateAndRunTaskTool);

var CreateAndRunTaskToolData = {
  id: "create_and_run_task" /* CreateAndRunTask */,
  toolReferenceName: "createAndRunTask",
  legacyToolReferenceFullNames: ["runTasks/createAndRunTask"],
  displayName: localize(20583, null),
  modelDescription: "Creates and runs a build, run, or custom task for the workspace by generating or adding to a tasks.json file based on the project structure (such as package.json or README.md). If the user asks to build, run, launch and they have no tasks.json file, use this tool. If they ask to create or add a task, use this tool.",
  userDescription: localize(20584, null),
  source: ToolDataSource.Internal,
  inputSchema: {
    "type": "object",
    "properties": {
      "workspaceFolder": {
        "type": "string",
        "description": "The absolute path of the workspace folder where the tasks.json file will be created."
      },
      "task": {
        "type": "object",
        "description": "The task to add to the new tasks.json file.",
        "properties": {
          "label": {
            "type": "string",
            "description": "The label of the task."
          },
          "type": {
            "type": "string",
            "description": `The type of the task. The only supported value is 'shell'.`,
            "enum": [
              "shell"
            ]
          },
          "command": {
            "type": "string",
            "description": "The shell command to run for the task. Use this to specify commands for building or running the application."
          },
          "args": {
            "type": "array",
            "description": "The arguments to pass to the command.",
            "items": {
              "type": "string"
            }
          },
          "isBackground": {
            "type": "boolean",
            "description": "Whether the task runs in the background without blocking the UI or other tasks. Set to true for long-running processes like watch tasks or servers that should continue executing without requiring user attention. When false, the task will block the terminal until completion."
          },
          "problemMatcher": {
            "type": "array",
            "description": `The problem matcher to use to parse task output for errors and warnings. Can be a predefined matcher like '$tsc' (TypeScript), '$eslint - stylish', '$gcc', etc., or a custom pattern defined in tasks.json. This helps VS Code display errors in the Problems panel and enables quick navigation to error locations.`,
            "items": {
              "type": "string"
            }
          },
          "group": {
            "type": "string",
            "description": "The group to which the task belongs."
          }
        },
        "required": [
          "label",
          "type",
          "command"
        ]
      }
    },
    "required": [
      "task",
      "workspaceFolder"
    ]
  }
};
export { CreateAndRunTaskTool, CreateAndRunTaskToolData };
