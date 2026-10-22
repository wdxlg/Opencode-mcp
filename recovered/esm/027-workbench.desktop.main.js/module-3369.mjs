// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/taskHelpers.ts
import { isString } from "./module-0010.mjs";
import { URI } from "./module-0032.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { getOutput } from "./module-3324.mjs";
import { timeout } from "./module-0036.mjs";
import { OutputMonitor } from "./module-3353.mjs";
import { Event2 } from "./module-0017.mjs";
import { Range2 } from "./module-0106.mjs";


// src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/taskHelpers.ts
function getTaskDefinition(id2) {
  const idx = id2.indexOf(": ");
  const taskType2 = id2.substring(0, idx);
  let taskLabel = idx > 0 ? id2.substring(idx + 2) : id2;
  if (/^\d+$/.test(taskLabel)) {
    taskLabel = id2;
  }
  return { taskLabel, taskType: taskType2 };
}

function getTaskRepresentation(task) {
  if (Object.hasOwn(task, "label") && task.label) {
    return task.label;
  } else if (Object.hasOwn(task, "script") && task.script) {
    return task.script;
  } else if (Object.hasOwn(task, "command") && task.command) {
    const command4 = task.command;
    return isString(command4) ? command4 : command4.name?.toString() || "";
  }
  return "";
}

function getTaskKey(task) {
  return task.getKey() ?? task.getMapKey();
}

function tasksMatch(a, b) {
  if (!a || !b) {
    return false;
  }
  if (getTaskKey(a) === getTaskKey(b)) {
    return true;
  }
  if (a.getCommonTaskId?.() === b.getCommonTaskId?.()) {
    return true;
  }
  return a._id === b._id;
}

async function getTaskForTool(id2, taskDefinition, workspaceFolder, configurationService, taskService, allowParentTask) {
  let index2 = 0;
  let task;
  const workspaceFolderToTaskMap = await taskService.getWorkspaceTasks();
  let configTasks = [];
  for (const folder of workspaceFolderToTaskMap.keys()) {
    const tasksConfig = configurationService.getValue("tasks", { resource: URI.parse(folder) });
    if (tasksConfig?.tasks) {
      configTasks = configTasks.concat(tasksConfig.tasks);
    }
  }
  for (const configTask of configTasks) {
    if (!allowParentTask && !configTask.type || Object.hasOwn(configTask, "hide") && configTask.hide) {
      continue;
    }
    if ((configTask.type && taskDefinition.taskType ? configTask.type === taskDefinition.taskType : true) && (getTaskRepresentation(configTask) === taskDefinition?.taskLabel || id2 === configTask.label)) {
      task = configTask;
      break;
    } else if (!configTask.label && id2 === `${configTask.type}: ${index2}`) {
      task = configTask;
      break;
    }
    index2++;
  }
  if (!task) {
    return;
  }
  let tasksForWorkspace;
  const getPathForCompare = (uri5) => uri5.path.replace(/\/$/, "").toLowerCase();
  const workspaceFolderPath = getPathForCompare(URI.file(workspaceFolder));
  for (const [folder, tasks2] of workspaceFolderToTaskMap) {
    if (getPathForCompare(URI.parse(folder)) === workspaceFolderPath) {
      tasksForWorkspace = tasks2;
      break;
    }
  }
  if (!tasksForWorkspace) {
    return;
  }
  const configuringTasks = tasksForWorkspace.configurations?.byIdentifier;
  const configuredTask = Object.values(configuringTasks ?? {}).find((t2) => {
    return t2.type === task.type && (t2._label === task.label || t2._label === `${task.type}: ${getTaskRepresentation(task)}` || t2._label === getTaskRepresentation(task));
  });
  let resolvedTask;
  if (configuredTask) {
    resolvedTask = await taskService.tryResolveTask(configuredTask);
  }
  if (!resolvedTask) {
    const customTasks = tasksForWorkspace.set?.tasks;
    resolvedTask = customTasks?.find((t2) => task.label === t2._label || task.label === t2._label);
  }
  return resolvedTask;
}

async function resolveDependencyTasks(parentTask, workspaceFolder, configurationService, taskService) {
  if (!parentTask.configurationProperties?.dependsOn) {
    return void 0;
  }
  const dependencyTasks = await Promise.all(parentTask.configurationProperties.dependsOn.map(async (dep) => {
    const depId = isString(dep.task) ? dep.task : dep.task?._key;
    if (!depId) {
      return void 0;
    }
    return await getTaskForTool(depId, { taskLabel: depId }, workspaceFolder, configurationService, taskService);
  }));
  return dependencyTasks.filter((t2) => t2 !== void 0);
}

async function collectTerminalResults(terminals, task, instantiationService, invocationContext, progress, token, disposableStore, isActive2, dependencyTasks, taskService, startMarkersByTerminalInstanceId) {
  const results = [];
  if (token.isCancellationRequested) {
    return results;
  }
  const commonTaskIdToTaskMap = {};
  const taskIdToTaskMap = {};
  const taskLabelToTaskMap = {};
  for (const dependencyTask of dependencyTasks ?? []) {
    commonTaskIdToTaskMap[dependencyTask.getCommonTaskId()] = dependencyTask;
    taskIdToTaskMap[dependencyTask._id] = dependencyTask;
    taskLabelToTaskMap[dependencyTask._label] = dependencyTask;
  }
  const terminalNames = terminals.map((t2) => t2.shellLaunchConfig.name ?? t2.title ?? "unknown");
  progress.report({ message: new MarkdownString(`Checking output for ${terminalNames.map((n2) => `\`${n2}\``).join(", ")}`) });
  const terminalPromises = terminals.map(async (instance2) => {
    const startMarker = startMarkersByTerminalInstanceId ? startMarkersByTerminalInstanceId.get(instance2.instanceId) : instance2.registerMarker();
    let terminalTask = task;
    if (dependencyTasks?.length) {
      const reconnectionData = instance2.reconnectionProperties?.data;
      if (reconnectionData) {
        if (Object.hasOwn(commonTaskIdToTaskMap, reconnectionData.lastTask)) {
          terminalTask = commonTaskIdToTaskMap[reconnectionData.lastTask];
        } else if (Object.hasOwn(taskIdToTaskMap, reconnectionData.id)) {
          terminalTask = taskIdToTaskMap[reconnectionData.id];
        }
      } else {
        if (instance2.shellLaunchConfig.name && Object.hasOwn(taskLabelToTaskMap, instance2.shellLaunchConfig.name)) {
          terminalTask = taskLabelToTaskMap[instance2.shellLaunchConfig.name];
        } else if (Object.hasOwn(taskLabelToTaskMap, instance2.title)) {
          terminalTask = taskLabelToTaskMap[instance2.title];
        }
      }
    }
    const execution = {
      getOutput: (marker) => getOutput(instance2, marker ?? startMarker) ?? "",
      task: terminalTask,
      isActive: isActive2 ? () => isActive2(terminalTask) : void 0,
      instance: instance2,
      dependencyTasks,
      sessionResource: invocationContext.sessionResource
    };
    if (terminalTask.configurationProperties.problemMatchers && terminalTask.configurationProperties.problemMatchers.length > 0 && taskService) {
      const maxWaitTime = 1e3;
      const startTime = Date.now();
      while (!token.isCancellationRequested && Date.now() - startTime < maxWaitTime) {
        const busyTasks = await taskService.getBusyTasks();
        if (busyTasks.some((t2) => tasksMatch(t2, terminalTask))) {
          break;
        }
        await timeout(100);
      }
    }
    try {
      const hasProblemMatchers = terminalTask.configurationProperties.problemMatchers && terminalTask.configurationProperties.problemMatchers.length > 0;
      const outputMonitor = disposableStore.add(instantiationService.createInstance(OutputMonitor, execution, hasProblemMatchers ? taskProblemPollFn : void 0, invocationContext, token, task._label));
      await Promise.race([
        Event2.toPromise(outputMonitor.onDidFinishCommand),
        Event2.toPromise(token.onCancellationRequested)
      ]);
      const pollingResult = outputMonitor.pollingResult;
      return {
        name: instance2.shellLaunchConfig.name ?? instance2.title ?? "unknown",
        output: pollingResult?.output ?? "",
        pollDurationMs: pollingResult?.pollDurationMs ?? 0,
        resources: pollingResult?.resources,
        state: pollingResult?.state || "Idle" /* Idle */,
        inputToolManualAcceptCount: outputMonitor.outputMonitorTelemetryCounters.inputToolManualAcceptCount ?? 0,
        inputToolManualRejectCount: outputMonitor.outputMonitorTelemetryCounters.inputToolManualRejectCount ?? 0,
        inputToolManualChars: outputMonitor.outputMonitorTelemetryCounters.inputToolManualChars ?? 0,
        inputToolAutoAcceptCount: outputMonitor.outputMonitorTelemetryCounters.inputToolAutoAcceptCount ?? 0,
        inputToolAutoChars: outputMonitor.outputMonitorTelemetryCounters.inputToolAutoChars ?? 0,
        inputToolManualShownCount: outputMonitor.outputMonitorTelemetryCounters.inputToolManualShownCount ?? 0,
        inputToolFreeFormInputShownCount: outputMonitor.outputMonitorTelemetryCounters.inputToolFreeFormInputShownCount ?? 0,
        inputToolFreeFormInputCount: outputMonitor.outputMonitorTelemetryCounters.inputToolFreeFormInputCount ?? 0
      };
    } finally {
      startMarker?.dispose();
    }
  });
  const parallelResults = await Promise.all(terminalPromises);
  results.push(...parallelResults);
  if (startMarkersByTerminalInstanceId) {
    const activeInstanceIds = new Set(terminals.map((instance2) => instance2.instanceId));
    for (const [instanceId, marker] of startMarkersByTerminalInstanceId) {
      if (!activeInstanceIds.has(instanceId)) {
        marker?.dispose();
        startMarkersByTerminalInstanceId.delete(instanceId);
      }
    }
  }
  return results;
}

async function taskProblemPollFn(execution, token, taskService) {
  if (token.isCancellationRequested) {
    return;
  }
  if (execution.task) {
    const data = taskService.getTaskProblems(execution.instance.instanceId);
    if (data) {
      const problemList = [];
      const resultResources = [];
      for (const [owner, { resources, markers }] of data.entries()) {
        for (let i2 = 0; i2 < markers.length; i2++) {
          const uri5 = resources[i2];
          const marker = markers[i2];
          resultResources.push({
            uri: uri5,
            range: marker.startLineNumber !== void 0 && marker.startColumn !== void 0 && marker.endLineNumber !== void 0 && marker.endColumn !== void 0 ? new Range2(marker.startLineNumber, marker.startColumn, marker.endLineNumber, marker.endColumn) : void 0
          });
          const message = marker.message ?? "";
          problemList.push(`Problem: ${message} in ${uri5.fsPath} coming from ${owner} starting on line ${marker.startLineNumber}${marker.startColumn ? `, column ${marker.startColumn} and ending on line ${marker.endLineNumber}${marker.endColumn ? `, column ${marker.endColumn}` : ""}` : ""}`);
        }
      }
      if (problemList.length === 0) {
        const lastTenLines = execution.getOutput().split("\n").filter((line) => line !== "").slice(-10).join("\n");
        return {
          state: "Idle" /* Idle */,
          output: `Task completed with output:
${lastTenLines}`
        };
      }
      return {
        state: "Idle" /* Idle */,
        output: problemList.join("\n"),
        resources: resultResources
      };
    }
  }
  throw new Error("Polling failed");
}
export { getTaskDefinition, getTaskRepresentation, getTaskKey, tasksMatch, getTaskForTool, resolveDependencyTasks, collectTerminalResults, taskProblemPollFn };
