// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/configurationResolver/browser/baseConfigurationResolverService.ts
import { AbstractVariableResolverService } from "./module-3823.mjs";
import { EditorResourceAccessor } from "./module-0925.mjs";
import { Schemas } from "./module-0033.mjs";
import { isCodeEditor, isDiffEditor } from "./module-0223.mjs";
import { Queue } from "./module-0036.mjs";
import { ConfigurationResolverExpression } from "./module-1406.mjs";
import { isString, isUndefinedOrNull } from "./module-0010.mjs";
import { VariableError } from "./module-1405.mjs";
import { localize } from "./module-0001.mjs";
import { Iterable } from "./module-0011.mjs";
import { LRUCache } from "./module-0008.mjs";


// src/vs/workbench/services/configurationResolver/browser/baseConfigurationResolverService.ts
var LAST_INPUT_STORAGE_KEY = "configResolveInputLru";

var LAST_INPUT_CACHE_SIZE = 5;

var BaseConfigurationResolverService = class extends AbstractVariableResolverService {
  constructor(context2, envVariablesPromise, editorService, configurationService, commandService, workspaceContextService, quickInputService, labelService, pathService, extensionService, storageService) {
    super({
      getFolderUri: (folderName) => {
        const folder = workspaceContextService.getWorkspace().folders.filter((f) => f.name === folderName).pop();
        return folder ? folder.uri : void 0;
      },
      getWorkspaceFolderCount: () => {
        return workspaceContextService.getWorkspace().folders.length;
      },
      getConfigurationValue: (folderUri, section) => {
        return configurationService.getValue(section, folderUri ? { resource: folderUri } : {});
      },
      getAppRoot: () => {
        return context2.getAppRoot();
      },
      getExecPath: () => {
        return context2.getExecPath();
      },
      getFilePath: () => {
        const fileResource = EditorResourceAccessor.getOriginalUri(editorService.activeEditor, {
          supportSideBySide: 1 /* PRIMARY */,
          filterByScheme: [Schemas.file, Schemas.vscodeUserData, this.pathService.defaultUriScheme]
        });
        if (!fileResource) {
          return void 0;
        }
        return this.labelService.getUriLabel(fileResource, { noPrefix: true });
      },
      getWorkspaceFolderPathForFile: () => {
        const fileResource = EditorResourceAccessor.getOriginalUri(editorService.activeEditor, {
          supportSideBySide: 1 /* PRIMARY */,
          filterByScheme: [Schemas.file, Schemas.vscodeUserData, this.pathService.defaultUriScheme]
        });
        if (!fileResource) {
          return void 0;
        }
        const wsFolder = workspaceContextService.getWorkspaceFolder(fileResource);
        if (!wsFolder) {
          return void 0;
        }
        return this.labelService.getUriLabel(wsFolder.uri, { noPrefix: true });
      },
      getSelectedText: () => {
        const activeTextEditorControl = editorService.activeTextEditorControl;
        let activeControl = null;
        if (isCodeEditor(activeTextEditorControl)) {
          activeControl = activeTextEditorControl;
        } else if (isDiffEditor(activeTextEditorControl)) {
          const original = activeTextEditorControl.getOriginalEditor();
          const modified = activeTextEditorControl.getModifiedEditor();
          activeControl = original.hasWidgetFocus() ? original : modified;
        }
        const activeModel = activeControl?.getModel();
        const activeSelection = activeControl?.getSelection();
        if (activeModel && activeSelection) {
          return activeModel.getValueInRange(activeSelection);
        }
        return void 0;
      },
      getLineNumber: () => {
        const activeTextEditorControl = editorService.activeTextEditorControl;
        if (isCodeEditor(activeTextEditorControl)) {
          const selection = activeTextEditorControl.getSelection();
          if (selection) {
            const lineNumber = selection.positionLineNumber;
            return String(lineNumber);
          }
        }
        return void 0;
      },
      getColumnNumber: () => {
        const activeTextEditorControl = editorService.activeTextEditorControl;
        if (isCodeEditor(activeTextEditorControl)) {
          const selection = activeTextEditorControl.getSelection();
          if (selection) {
            const columnNumber = selection.positionColumn;
            return String(columnNumber);
          }
        }
        return void 0;
      },
      getExtension: (id2) => {
        return extensionService.getExtension(id2);
      }
    }, labelService, pathService.userHome().then((home2) => home2.path), envVariablesPromise);
    this.configurationService = configurationService;
    this.commandService = commandService;
    this.quickInputService = quickInputService;
    this.labelService = labelService;
    this.pathService = pathService;
    this.storageService = storageService;
    this.userInputAccessQueue = new Queue();
    this.resolvableVariables.add("command");
    this.resolvableVariables.add("input");
  }
  static {
    this.INPUT_OR_COMMAND_VARIABLES_PATTERN = /\${((input|command):(.*?))}/g;
  }
  async resolveWithInteractionReplace(folder, config, section, variables, target) {
    const parsed = ConfigurationResolverExpression.parse(config);
    const resolved = await this.resolveWithInteraction(folder, parsed, section, variables, target);
    if (resolved === void 0) {
      return void 0;
    }
    return parsed.toObject();
  }
  async resolveWithInteraction(folder, config, section, variableToCommandMap, target) {
    const expr = ConfigurationResolverExpression.parse(config);
    for (const variable of expr.unresolved()) {
      let result;
      if (variable.name === "command") {
        const commandId = (variableToCommandMap ? variableToCommandMap[variable.arg] : void 0) || variable.arg;
        const value2 = await this.commandService.executeCommand(commandId, expr.toObject());
        if (!isUndefinedOrNull(value2)) {
          if (typeof value2 !== "string") {
            throw new VariableError("command" /* Command */, localize(22815, null, commandId));
          }
          result = { value: value2 };
        }
      } else if (variable.name === "input") {
        result = await this.showUserInput(section, variable.arg, await this.resolveInputs(folder, section, target), variableToCommandMap);
      } else if (this._contributedVariables.has(variable.inner)) {
        result = { value: await this._contributedVariables.get(variable.inner)() };
      } else {
        const resolvedValue = await this.evaluateSingleVariable(variable, folder?.uri);
        if (resolvedValue === void 0) {
          continue;
        }
        result = typeof resolvedValue === "string" ? { value: resolvedValue } : resolvedValue;
      }
      if (result === void 0) {
        return void 0;
      }
      expr.resolve(variable, result);
    }
    return new Map(Iterable.map(expr.resolved(), ([key3, value2]) => [key3.inner, value2.value]));
  }
  async resolveInputs(folder, section, target) {
    if (!section) {
      return void 0;
    }
    let inputs;
    const overrides = folder ? { resource: folder.uri } : {};
    const result = this.configurationService.inspect(section, overrides);
    if (result) {
      switch (target) {
        case 8 /* MEMORY */:
          inputs = result.memoryValue?.inputs;
          break;
        case 7 /* DEFAULT */:
          inputs = result.defaultValue?.inputs;
          break;
        case 2 /* USER */:
          inputs = result.userValue?.inputs;
          break;
        case 3 /* USER_LOCAL */:
          inputs = result.userLocalValue?.inputs;
          break;
        case 4 /* USER_REMOTE */:
          inputs = result.userRemoteValue?.inputs;
          break;
        case 1 /* APPLICATION */:
          inputs = result.applicationValue?.inputs;
          break;
        case 5 /* WORKSPACE */:
          inputs = result.workspaceValue?.inputs;
          break;
        case 6 /* WORKSPACE_FOLDER */:
        default:
          inputs = result.workspaceFolderValue?.inputs;
          break;
      }
    }
    inputs ??= this.configurationService.getValue(section, overrides)?.inputs;
    return inputs;
  }
  readInputLru() {
    const contents = this.storageService.get(LAST_INPUT_STORAGE_KEY, 1 /* WORKSPACE */);
    const lru = new LRUCache(LAST_INPUT_CACHE_SIZE);
    try {
      if (contents) {
        lru.fromJSON(JSON.parse(contents));
      }
    } catch {
    }
    return lru;
  }
  storeInputLru(lru) {
    this.storageService.store(LAST_INPUT_STORAGE_KEY, JSON.stringify(lru.toJSON()), 1 /* WORKSPACE */, 1 /* MACHINE */);
  }
  async showUserInput(section, variable, inputInfos, variableToCommandMap) {
    if (!inputInfos) {
      throw new VariableError("input" /* Input */, localize(22819, null, variable, "inputs"));
    }
    const info = inputInfos.filter((item) => item.id === variable).pop();
    if (info) {
      const missingAttribute = (attrName) => {
        throw new VariableError("input" /* Input */, localize(22818, null, variable, info.type, attrName));
      };
      const defaultValueMap = this.readInputLru();
      const defaultValueKey = `${section}.${variable}`;
      const previousPickedValue = defaultValueMap.get(defaultValueKey);
      switch (info.type) {
        case "promptString": {
          if (!isString(info.description)) {
            missingAttribute("description");
          }
          const inputOptions2 = { prompt: info.description, ignoreFocusLost: true, value: variableToCommandMap?.[`input:${variable}`] ?? previousPickedValue ?? info.default };
          if (info.password) {
            inputOptions2.password = info.password;
          }
          return this.userInputAccessQueue.queue(() => this.quickInputService.input(inputOptions2)).then((resolvedInput) => {
            if (typeof resolvedInput === "string" && !info.password) {
              this.storeInputLru(defaultValueMap.set(defaultValueKey, resolvedInput));
            }
            return resolvedInput !== void 0 ? { value: resolvedInput, input: info } : void 0;
          });
        }
        case "pickString": {
          if (!isString(info.description)) {
            missingAttribute("description");
          }
          if (Array.isArray(info.options)) {
            for (const pickOption of info.options) {
              if (!isString(pickOption) && !isString(pickOption.value)) {
                missingAttribute("value");
              }
            }
          } else {
            missingAttribute("options");
          }
          const picks = new Array();
          for (const pickOption of info.options) {
            const value2 = isString(pickOption) ? pickOption : pickOption.value;
            const label3 = isString(pickOption) ? void 0 : pickOption.label;
            const item = {
              label: label3 ? `${label3}: ${value2}` : value2,
              value: value2
            };
            const topValue = variableToCommandMap?.[`input:${variable}`] ?? previousPickedValue ?? info.default;
            if (value2 === info.default) {
              item.description = localize(22817, null);
              picks.unshift(item);
            } else if (value2 === topValue) {
              picks.unshift(item);
            } else {
              picks.push(item);
            }
          }
          const pickOptions = { placeHolder: info.description, matchOnDetail: true, ignoreFocusLost: true };
          return this.userInputAccessQueue.queue(() => this.quickInputService.pick(picks, pickOptions, void 0)).then((resolvedInput) => {
            if (resolvedInput) {
              const value2 = resolvedInput.value;
              this.storeInputLru(defaultValueMap.set(defaultValueKey, value2));
              return { value: value2, input: info };
            }
            return void 0;
          });
        }
        case "command": {
          if (!isString(info.command)) {
            missingAttribute("command");
          }
          return this.userInputAccessQueue.queue(() => this.commandService.executeCommand(info.command, info.args)).then((result) => {
            if (typeof result === "string" || isUndefinedOrNull(result)) {
              return { value: result, input: info };
            }
            throw new VariableError("input" /* Input */, localize(22816, null, variable, info.command));
          });
        }
        default:
          throw new VariableError("input" /* Input */, localize(22821, null, variable));
      }
    }
    throw new VariableError("input" /* Input */, localize(22820, null, variable));
  }
};
export { LAST_INPUT_STORAGE_KEY, LAST_INPUT_CACHE_SIZE, BaseConfigurationResolverService };
