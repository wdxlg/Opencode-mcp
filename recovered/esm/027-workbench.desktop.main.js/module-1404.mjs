// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/tasks/common/taskService.ts
import { ContextKeyExpr, RawContextKey } from "./module-0089.mjs";
import { localize } from "./module-0001.mjs";
import { createDecorator } from "./module-0077.mjs";


// src/vs/workbench/contrib/tasks/common/taskService.ts
var CustomExecutionSupportedContext = new RawContextKey("customExecutionSupported", false, localize(19891, null));

var ShellExecutionSupportedContext = new RawContextKey("shellExecutionSupported", false, localize(19894, null));

var TaskCommandsRegistered = new RawContextKey("taskCommandsRegistered", false, localize(19895, null));

var ProcessExecutionSupportedContext = new RawContextKey("processExecutionSupported", false, localize(19892, null));

var ServerlessWebContext = new RawContextKey("serverlessWebContext", false, localize(19893, null));

var TasksAvailableContext = new RawContextKey("tasksAvailable", false, localize(19896, null));

var TaskExecutionSupportedContext = ContextKeyExpr.or(ContextKeyExpr.and(ShellExecutionSupportedContext, ProcessExecutionSupportedContext), CustomExecutionSupportedContext);

var ITaskService = createDecorator("taskService");
export { CustomExecutionSupportedContext, ShellExecutionSupportedContext, TaskCommandsRegistered, ProcessExecutionSupportedContext, ServerlessWebContext, TasksAvailableContext, TaskExecutionSupportedContext, ITaskService };
