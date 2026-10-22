// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/api/node/extHostTask.ts
import { CustomExecutionDTO, ExtHostTaskBase, TaskDTO, TaskHandleDTO } from "./module-0304.mjs";
import { Schemas } from "./module-0026.mjs";
import { URI } from "./module-0025.mjs";
import { WorkspaceFolder } from "./module-0076.mjs";
import { basename2 } from "./module-0027.mjs";
import { delimiter, isAbsolute, join } from "./module-0019.mjs";
import { findExecutable } from "./module-0334.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtHostRpcService } from "./module-0069.mjs";
import { IExtHostInitDataService } from "./module-0066.mjs";
import { IExtHostWorkspace } from "./module-0251.mjs";
import { IExtHostDocumentsAndEditors } from "./module-0301.mjs";
import { IExtHostConfiguration } from "./module-0253.mjs";
import { IExtHostTerminalService } from "./module-0269.mjs";
import { ILogService } from "./module-0062.mjs";
import { IExtHostApiDeprecationService } from "./module-0289.mjs";
import { IExtHostVariableResolverProvider } from "./module-0313.mjs";


// src/vs/workbench/api/node/extHostTask.ts
import { homedir } from "os";

var ExtHostTask = class extends ExtHostTaskBase {
  constructor(extHostRpc, initData, workspaceService, editorService, configurationService, extHostTerminalService, logService, deprecationService, variableResolver) {
    super(extHostRpc, initData, workspaceService, editorService, configurationService, extHostTerminalService, logService, deprecationService);
    this.workspaceService = workspaceService;
    this.variableResolver = variableResolver;
    if (initData.remote.isRemote && initData.remote.authority) {
      this.registerTaskSystem(Schemas.vscodeRemote, {
        scheme: Schemas.vscodeRemote,
        authority: initData.remote.authority,
        platform: process.platform
      });
    } else {
      this.registerTaskSystem(Schemas.file, {
        scheme: Schemas.file,
        authority: "",
        platform: process.platform
      });
    }
    this._proxy.$registerSupportedExecutions(true, true, true);
  }
  async executeTask(extension, task) {
    const tTask = task;
    if (!task.execution && tTask._id === void 0) {
      throw new Error("Tasks to execute must include an execution");
    }
    if (tTask._id !== void 0) {
      const handleDto = TaskHandleDTO.from(tTask, this.workspaceService);
      const executionDTO = await this._proxy.$getTaskExecution(handleDto);
      if (executionDTO.task === void 0) {
        throw new Error("Task from execution DTO is undefined");
      }
      const execution = await this.getTaskExecution(executionDTO, task);
      this._proxy.$executeTask(handleDto).catch(() => {
      });
      return execution;
    } else {
      const dto = TaskDTO.from(task, extension);
      if (dto === void 0) {
        return Promise.reject(new Error("Task is not valid"));
      }
      if (CustomExecutionDTO.is(dto.execution)) {
        await this.addCustomExecution(dto, task, false);
      }
      const execution = await this.getTaskExecution(await this._proxy.$getTaskExecution(dto), task);
      this._proxy.$executeTask(dto).catch(() => {
      });
      return execution;
    }
  }
  provideTasksInternal(validTypes, taskIdPromises, handler, value) {
    const taskDTOs = [];
    if (value) {
      for (const task of value) {
        this.checkDeprecation(task, handler);
        if (!task.definition || !validTypes[task.definition.type]) {
          this._logService.warn(`The task [${task.source}, ${task.name}] uses an undefined task type. The task will be ignored in the future.`);
        }
        const taskDTO = TaskDTO.from(task, handler.extension);
        if (taskDTO) {
          taskDTOs.push(taskDTO);
          if (CustomExecutionDTO.is(taskDTO.execution)) {
            taskIdPromises.push(this.addCustomExecution(taskDTO, task, true));
          }
        }
      }
    }
    return {
      tasks: taskDTOs,
      extension: handler.extension
    };
  }
  async resolveTaskInternal(resolvedTaskDTO) {
    return resolvedTaskDTO;
  }
  async getAFolder(workspaceFolders) {
    let folder = workspaceFolders && workspaceFolders.length > 0 ? workspaceFolders[0] : void 0;
    if (!folder) {
      const userhome = URI.file(homedir());
      folder = new WorkspaceFolder({ uri: userhome, name: basename2(userhome), index: 0 });
    }
    return {
      uri: folder.uri,
      name: folder.name,
      index: folder.index,
      toResource: () => {
        throw new Error("Not implemented");
      }
    };
  }
  async $resolveVariables(uriComponents, toResolve) {
    const uri2 = URI.revive(uriComponents);
    const result = {
      process: void 0,
      variables: /* @__PURE__ */ Object.create(null)
    };
    const workspaceFolder = await this._workspaceProvider.resolveWorkspaceFolder(uri2);
    const workspaceFolders = await this._workspaceProvider.getWorkspaceFolders2() ?? [];
    const resolver = await this.variableResolver.getResolver();
    const ws = workspaceFolder ? {
      uri: workspaceFolder.uri,
      name: workspaceFolder.name,
      index: workspaceFolder.index,
      toResource: () => {
        throw new Error("Not implemented");
      }
    } : await this.getAFolder(workspaceFolders);
    for (const variable of toResolve.variables) {
      result.variables[variable] = await resolver.resolveAsync(ws, variable);
    }
    if (toResolve.process !== void 0) {
      let paths = void 0;
      if (toResolve.process.path !== void 0) {
        paths = toResolve.process.path.split(delimiter);
        for (let i = 0; i < paths.length; i++) {
          paths[i] = await resolver.resolveAsync(ws, paths[i]);
        }
      }
      const processName = await resolver.resolveAsync(ws, toResolve.process.name);
      const cwd2 = toResolve.process.cwd !== void 0 ? await resolver.resolveAsync(ws, toResolve.process.cwd) : void 0;
      const foundExecutable = await findExecutable(processName, cwd2, paths);
      if (foundExecutable) {
        result.process = foundExecutable;
      } else if (isAbsolute(processName)) {
        result.process = processName;
      } else {
        result.process = join(cwd2 ?? "", processName);
      }
    }
    return result;
  }
  async $jsonTasksSupported() {
    return true;
  }
  async $findExecutable(command, cwd2, paths) {
    return findExecutable(command, cwd2, paths);
  }
};

ExtHostTask = __decorateClass([
  __decorateParam(0, IExtHostRpcService),
  __decorateParam(1, IExtHostInitDataService),
  __decorateParam(2, IExtHostWorkspace),
  __decorateParam(3, IExtHostDocumentsAndEditors),
  __decorateParam(4, IExtHostConfiguration),
  __decorateParam(5, IExtHostTerminalService),
  __decorateParam(6, ILogService),
  __decorateParam(7, IExtHostApiDeprecationService),
  __decorateParam(8, IExtHostVariableResolverProvider)
], ExtHostTask);
export { homedir, ExtHostTask };
