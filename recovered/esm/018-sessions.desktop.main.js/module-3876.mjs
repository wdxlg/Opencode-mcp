// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/configuration/common/configurationEditing.ts
import { ErrorNoTelemetry } from "./module-0004.mjs";
import { Queue } from "./module-0036.mjs";
import { localize } from "./module-0001.mjs";
import { Range2 } from "./module-0106.mjs";
import { EditOperation } from "./module-0162.mjs";
import { Selection } from "./module-0107.mjs";
import { setProperty } from "./module-1377.mjs";
import { APPLICATION_SCOPES, FOLDER_SCOPES, FOLDER_SETTINGS_PATH, IWorkbenchConfigurationService, LAUNCH_CONFIGURATION_KEY, MCP_CONFIGURATION_KEY, TASKS_CONFIGURATION_KEY, TASKS_DEFAULT, USER_STANDALONE_CONFIGURATIONS, WORKSPACE_STANDALONE_CONFIGURATIONS } from "./module-1198.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { parse5 } from "./module-0885.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4, OVERRIDE_PROPERTY_REGEX, keyFromOverrideIdentifiers } from "./module-0140.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IUserDataProfileService } from "./module-0998.mjs";
import { IUserDataProfilesService } from "./module-0511.mjs";
import { IFileService } from "./module-0269.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { ITextFileService } from "./module-1064.mjs";
import { IPreferencesService } from "./module-1293.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IFilesConfigurationService } from "./module-0931.mjs";


// src/vs/workbench/services/configuration/common/configurationEditing.ts
var ConfigurationEditingError = class extends ErrorNoTelemetry {
  constructor(message, code) {
    super(message);
    this.code = code;
  }
};

var ConfigurationEditing = class {
  constructor(remoteSettingsResource, configurationService, contextService, userDataProfileService, userDataProfilesService, fileService, textModelResolverService, textFileService, notificationService, preferencesService, editorService, uriIdentityService, filesConfigurationService) {
    this.remoteSettingsResource = remoteSettingsResource;
    this.configurationService = configurationService;
    this.contextService = contextService;
    this.userDataProfileService = userDataProfileService;
    this.userDataProfilesService = userDataProfilesService;
    this.fileService = fileService;
    this.textModelResolverService = textModelResolverService;
    this.textFileService = textFileService;
    this.notificationService = notificationService;
    this.preferencesService = preferencesService;
    this.editorService = editorService;
    this.uriIdentityService = uriIdentityService;
    this.filesConfigurationService = filesConfigurationService;
    this.queue = new Queue();
  }
  async writeConfiguration(target, value2, options3 = {}) {
    const operation = this.getConfigurationEditOperation(target, value2, options3.scopes || {});
    return this.queue.queue(async () => {
      try {
        await this.doWriteConfiguration(operation, options3);
      } catch (error) {
        if (options3.donotNotifyError) {
          throw error;
        }
        await this.onError(error, operation, options3.scopes);
      }
    });
  }
  async doWriteConfiguration(operation, options3) {
    await this.validate(operation.target, operation, !options3.handleDirtyFile, options3.scopes || {});
    const resource = operation.resource;
    const reference = await this.resolveModelReference(resource);
    try {
      const formattingOptions = this.getFormattingOptions(reference.object.textEditorModel);
      await this.updateConfiguration(operation, reference.object.textEditorModel, formattingOptions, options3);
    } finally {
      reference.dispose();
    }
  }
  async updateConfiguration(operation, model, formattingOptions, options3) {
    if (this.hasParseErrors(model.getValue(), operation)) {
      throw this.toConfigurationEditingError(11 /* ERROR_INVALID_CONFIGURATION */, operation.target, operation);
    }
    if (this.textFileService.isDirty(model.uri) && options3.handleDirtyFile) {
      switch (options3.handleDirtyFile) {
        case "save":
          await this.save(model, operation);
          break;
        case "revert":
          await this.textFileService.revert(model.uri);
          break;
      }
    }
    const edit3 = this.getEdits(operation, model.getValue(), formattingOptions)[0];
    if (edit3) {
      let disposable;
      try {
        disposable = this.filesConfigurationService.enableAutoSaveAfterShortDelay(model.uri);
        if (this.applyEditsToBuffer(edit3, model)) {
          await this.save(model, operation);
        }
      } finally {
        disposable?.dispose();
      }
    }
  }
  async save(model, operation) {
    try {
      await this.textFileService.save(model.uri, { ignoreErrorHandler: true });
    } catch (error) {
      if (error.fileOperationResult === 3 /* FILE_MODIFIED_SINCE */) {
        throw this.toConfigurationEditingError(10 /* ERROR_CONFIGURATION_FILE_MODIFIED_SINCE */, operation.target, operation);
      }
      throw new ConfigurationEditingError(localize(22805, null, this.stringifyTarget(operation.target), error.message), 13 /* ERROR_INTERNAL */);
    }
  }
  applyEditsToBuffer(edit3, model) {
    const startPosition = model.getPositionAt(edit3.offset);
    const endPosition = model.getPositionAt(edit3.offset + edit3.length);
    const range2 = new Range2(startPosition.lineNumber, startPosition.column, endPosition.lineNumber, endPosition.column);
    const currentText = model.getValueInRange(range2);
    if (edit3.content !== currentText) {
      const editOperation = currentText ? EditOperation.replace(range2, edit3.content) : EditOperation.insert(startPosition, edit3.content);
      model.pushEditOperations([new Selection(startPosition.lineNumber, startPosition.column, startPosition.lineNumber, startPosition.column)], [editOperation], () => []);
      return true;
    }
    return false;
  }
  getEdits({ value: value2, jsonPath }, modelContent, formattingOptions) {
    if (jsonPath.length) {
      return setProperty(modelContent, jsonPath, value2, formattingOptions);
    }
    const content = JSON.stringify(value2, null, formattingOptions.insertSpaces && formattingOptions.tabSize ? " ".repeat(formattingOptions.tabSize) : "	");
    return [{
      content,
      length: modelContent.length,
      offset: 0
    }];
  }
  getFormattingOptions(model) {
    const { insertSpaces, tabSize } = model.getOptions();
    const eol = model.getEOL();
    return { insertSpaces, tabSize, eol };
  }
  async onError(error, operation, scopes) {
    switch (error.code) {
      case 11 /* ERROR_INVALID_CONFIGURATION */:
        this.onInvalidConfigurationError(error, operation);
        break;
      case 9 /* ERROR_CONFIGURATION_FILE_DIRTY */:
        this.onConfigurationFileDirtyError(error, operation, scopes);
        break;
      case 10 /* ERROR_CONFIGURATION_FILE_MODIFIED_SINCE */:
        return this.doWriteConfiguration(operation, { scopes, handleDirtyFile: "revert" });
      default:
        this.notificationService.error(error.message);
    }
  }
  onInvalidConfigurationError(error, operation) {
    const openStandAloneConfigurationActionLabel = operation.workspaceStandAloneConfigurationKey === TASKS_CONFIGURATION_KEY ? localize(22809, null) : operation.workspaceStandAloneConfigurationKey === LAUNCH_CONFIGURATION_KEY ? localize(22807, null) : operation.workspaceStandAloneConfigurationKey === MCP_CONFIGURATION_KEY ? localize(22808, null) : null;
    if (openStandAloneConfigurationActionLabel) {
      this.notificationService.prompt(
        Severity2.Error,
        error.message,
        [{
          label: openStandAloneConfigurationActionLabel,
          run: () => this.openFile(operation.resource)
        }]
      );
    } else {
      this.notificationService.prompt(
        Severity2.Error,
        error.message,
        [{
          label: localize(22806, null),
          run: () => this.openSettings(operation)
        }]
      );
    }
  }
  onConfigurationFileDirtyError(error, operation, scopes) {
    const openStandAloneConfigurationActionLabel = operation.workspaceStandAloneConfigurationKey === TASKS_CONFIGURATION_KEY ? localize(22809, null) : operation.workspaceStandAloneConfigurationKey === LAUNCH_CONFIGURATION_KEY ? localize(22807, null) : null;
    if (openStandAloneConfigurationActionLabel) {
      this.notificationService.prompt(
        Severity2.Error,
        error.message,
        [
          {
            label: localize(22811, null),
            run: () => {
              const key3 = operation.key ? `${operation.workspaceStandAloneConfigurationKey}.${operation.key}` : operation.workspaceStandAloneConfigurationKey;
              this.writeConfiguration(operation.target, { key: key3, value: operation.value }, { handleDirtyFile: "save", scopes });
            }
          },
          {
            label: openStandAloneConfigurationActionLabel,
            run: () => this.openFile(operation.resource)
          }
        ]
      );
    } else {
      this.notificationService.prompt(
        Severity2.Error,
        error.message,
        [
          {
            label: localize(22811, null),
            run: () => this.writeConfiguration(operation.target, { key: operation.key, value: operation.value }, { handleDirtyFile: "save", scopes })
          },
          {
            label: localize(22806, null),
            run: () => this.openSettings(operation)
          }
        ]
      );
    }
  }
  openSettings(operation) {
    const options3 = { jsonEditor: true };
    switch (operation.target) {
      case 1 /* USER_LOCAL */:
        this.preferencesService.openUserSettings(options3);
        break;
      case 2 /* USER_REMOTE */:
        this.preferencesService.openRemoteSettings(options3);
        break;
      case 3 /* WORKSPACE */:
        this.preferencesService.openWorkspaceSettings(options3);
        break;
      case 4 /* WORKSPACE_FOLDER */:
        if (operation.resource) {
          const workspaceFolder = this.contextService.getWorkspaceFolder(operation.resource);
          if (workspaceFolder) {
            this.preferencesService.openFolderSettings({ folderUri: workspaceFolder.uri, jsonEditor: true });
          }
        }
        break;
    }
  }
  openFile(resource) {
    this.editorService.openEditor({ resource, options: { pinned: true } });
  }
  toConfigurationEditingError(code, target, operation) {
    const message = this.toErrorMessage(code, target, operation);
    return new ConfigurationEditingError(message, code);
  }
  toErrorMessage(error, target, operation) {
    switch (error) {
      // API constraints
      case 12 /* ERROR_POLICY_CONFIGURATION */:
        return localize(22797, null, operation.key);
      case 0 /* ERROR_UNKNOWN_KEY */:
        return localize(22803, null, this.stringifyTarget(target), operation.key);
      case 1 /* ERROR_INVALID_WORKSPACE_CONFIGURATION_APPLICATION */:
        return localize(22789, null, operation.key);
      case 2 /* ERROR_INVALID_WORKSPACE_CONFIGURATION_MACHINE */:
        return localize(22790, null, operation.key);
      case 3 /* ERROR_INVALID_FOLDER_CONFIGURATION */:
        return localize(22781, null, operation.key);
      case 4 /* ERROR_INVALID_USER_TARGET */:
        return localize(22788, null, operation.key);
      case 5 /* ERROR_INVALID_WORKSPACE_TARGET */:
        return localize(22791, null, operation.key);
      case 6 /* ERROR_INVALID_FOLDER_TARGET */:
        return localize(22782, null);
      case 7 /* ERROR_INVALID_RESOURCE_LANGUAGE_CONFIGURATION */:
        return localize(22786, null, operation.key);
      case 8 /* ERROR_NO_WORKSPACE_OPENED */:
        return localize(22796, null, this.stringifyTarget(target));
      // User issues
      case 11 /* ERROR_INVALID_CONFIGURATION */: {
        if (operation.workspaceStandAloneConfigurationKey === TASKS_CONFIGURATION_KEY) {
          return localize(22787, null);
        }
        if (operation.workspaceStandAloneConfigurationKey === LAUNCH_CONFIGURATION_KEY) {
          return localize(22783, null);
        }
        if (operation.workspaceStandAloneConfigurationKey === MCP_CONFIGURATION_KEY) {
          return localize(22784, null);
        }
        switch (target) {
          case 1 /* USER_LOCAL */:
            return localize(22778, null);
          case 2 /* USER_REMOTE */:
            return localize(22785, null);
          case 3 /* WORKSPACE */:
            return localize(22780, null);
          case 4 /* WORKSPACE_FOLDER */: {
            let workspaceFolderName = "<<unknown>>";
            if (operation.resource) {
              const folder = this.contextService.getWorkspaceFolder(operation.resource);
              if (folder) {
                workspaceFolderName = folder.name;
              }
            }
            return localize(22779, null, workspaceFolderName);
          }
          default:
            return "";
        }
      }
      case 9 /* ERROR_CONFIGURATION_FILE_DIRTY */: {
        if (operation.workspaceStandAloneConfigurationKey === TASKS_CONFIGURATION_KEY) {
          return localize(22800, null);
        }
        if (operation.workspaceStandAloneConfigurationKey === LAUNCH_CONFIGURATION_KEY) {
          return localize(22792, null);
        }
        if (operation.workspaceStandAloneConfigurationKey === MCP_CONFIGURATION_KEY) {
          return localize(22794, null);
        }
        switch (target) {
          case 1 /* USER_LOCAL */:
            return localize(22772, null);
          case 2 /* USER_REMOTE */:
            return localize(22798, null);
          case 3 /* WORKSPACE */:
            return localize(22774, null);
          case 4 /* WORKSPACE_FOLDER */: {
            let workspaceFolderName = "<<unknown>>";
            if (operation.resource) {
              const folder = this.contextService.getWorkspaceFolder(operation.resource);
              if (folder) {
                workspaceFolderName = folder.name;
              }
            }
            return localize(22773, null, workspaceFolderName);
          }
          default:
            return "";
        }
      }
      case 10 /* ERROR_CONFIGURATION_FILE_MODIFIED_SINCE */:
        if (operation.workspaceStandAloneConfigurationKey === TASKS_CONFIGURATION_KEY) {
          return localize(22801, null);
        }
        if (operation.workspaceStandAloneConfigurationKey === LAUNCH_CONFIGURATION_KEY) {
          return localize(22793, null);
        }
        if (operation.workspaceStandAloneConfigurationKey === MCP_CONFIGURATION_KEY) {
          return localize(22795, null);
        }
        switch (target) {
          case 1 /* USER_LOCAL */:
            return localize(22775, null);
          case 2 /* USER_REMOTE */:
            return localize(22799, null);
          case 3 /* WORKSPACE */:
            return localize(22777, null);
          case 4 /* WORKSPACE_FOLDER */:
            return localize(22776, null);
        }
      case 13 /* ERROR_INTERNAL */:
        return localize(22802, null, this.stringifyTarget(target));
    }
  }
  stringifyTarget(target) {
    switch (target) {
      case 1 /* USER_LOCAL */:
        return localize(22812, null);
      case 2 /* USER_REMOTE */:
        return localize(22810, null);
      case 3 /* WORKSPACE */:
        return localize(22813, null);
      case 4 /* WORKSPACE_FOLDER */:
        return localize(22804, null);
      default:
        return "";
    }
  }
  defaultResourceValue(resource) {
    const basename3 = this.uriIdentityService.extUri.basename(resource);
    const configurationValue = basename3.substr(0, basename3.length - this.uriIdentityService.extUri.extname(resource).length);
    switch (configurationValue) {
      case TASKS_CONFIGURATION_KEY:
        return TASKS_DEFAULT;
      default:
        return "{}";
    }
  }
  async resolveModelReference(resource) {
    const exists = await this.fileService.exists(resource);
    if (!exists) {
      await this.textFileService.write(resource, this.defaultResourceValue(resource), { encoding: "utf8" });
    }
    return this.textModelResolverService.createModelReference(resource);
  }
  hasParseErrors(content, operation) {
    if (operation.workspaceStandAloneConfigurationKey && !operation.key) {
      return false;
    }
    const parseErrors = [];
    parse5(content, parseErrors, { allowTrailingComma: true, allowEmptyContent: true });
    return parseErrors.length > 0;
  }
  async validate(target, operation, checkDirty, overrides) {
    if (this.configurationService.inspect(operation.key).policyValue !== void 0) {
      throw this.toConfigurationEditingError(12 /* ERROR_POLICY_CONFIGURATION */, target, operation);
    }
    const configurationProperties = Registry.as(Extensions4.Configuration).getConfigurationProperties();
    const configurationScope = configurationProperties[operation.key]?.scope;
    if (!operation.workspaceStandAloneConfigurationKey) {
      const validKeys = this.configurationService.keys().default;
      if (validKeys.indexOf(operation.key) < 0 && !OVERRIDE_PROPERTY_REGEX.test(operation.key) && operation.value !== void 0) {
        throw this.toConfigurationEditingError(0 /* ERROR_UNKNOWN_KEY */, target, operation);
      }
    }
    if (operation.workspaceStandAloneConfigurationKey) {
      if (operation.workspaceStandAloneConfigurationKey !== TASKS_CONFIGURATION_KEY && operation.workspaceStandAloneConfigurationKey !== MCP_CONFIGURATION_KEY && (target === 1 /* USER_LOCAL */ || target === 2 /* USER_REMOTE */)) {
        throw this.toConfigurationEditingError(4 /* ERROR_INVALID_USER_TARGET */, target, operation);
      }
    }
    if ((target === 3 /* WORKSPACE */ || target === 4 /* WORKSPACE_FOLDER */) && this.contextService.getWorkbenchState() === 1 /* EMPTY */) {
      throw this.toConfigurationEditingError(8 /* ERROR_NO_WORKSPACE_OPENED */, target, operation);
    }
    if (target === 3 /* WORKSPACE */) {
      if (!operation.workspaceStandAloneConfigurationKey && !OVERRIDE_PROPERTY_REGEX.test(operation.key)) {
        if (configurationScope && APPLICATION_SCOPES.includes(configurationScope)) {
          throw this.toConfigurationEditingError(1 /* ERROR_INVALID_WORKSPACE_CONFIGURATION_APPLICATION */, target, operation);
        }
        if (configurationScope === 2 /* MACHINE */) {
          throw this.toConfigurationEditingError(2 /* ERROR_INVALID_WORKSPACE_CONFIGURATION_MACHINE */, target, operation);
        }
      }
    }
    if (target === 4 /* WORKSPACE_FOLDER */) {
      if (!operation.resource) {
        throw this.toConfigurationEditingError(6 /* ERROR_INVALID_FOLDER_TARGET */, target, operation);
      }
      if (!operation.workspaceStandAloneConfigurationKey && !OVERRIDE_PROPERTY_REGEX.test(operation.key)) {
        if (configurationScope !== void 0 && !FOLDER_SCOPES.includes(configurationScope)) {
          throw this.toConfigurationEditingError(3 /* ERROR_INVALID_FOLDER_CONFIGURATION */, target, operation);
        }
      }
    }
    if (overrides.overrideIdentifiers?.length) {
      if (configurationScope !== 6 /* LANGUAGE_OVERRIDABLE */) {
        throw this.toConfigurationEditingError(7 /* ERROR_INVALID_RESOURCE_LANGUAGE_CONFIGURATION */, target, operation);
      }
    }
    if (!operation.resource) {
      throw this.toConfigurationEditingError(6 /* ERROR_INVALID_FOLDER_TARGET */, target, operation);
    }
    if (checkDirty && this.textFileService.isDirty(operation.resource)) {
      throw this.toConfigurationEditingError(9 /* ERROR_CONFIGURATION_FILE_DIRTY */, target, operation);
    }
  }
  getConfigurationEditOperation(target, config, overrides) {
    if (config.key) {
      const standaloneConfigurationMap = target === 1 /* USER_LOCAL */ ? USER_STANDALONE_CONFIGURATIONS : WORKSPACE_STANDALONE_CONFIGURATIONS;
      const standaloneConfigurationKeys = Object.keys(standaloneConfigurationMap);
      for (const key4 of standaloneConfigurationKeys) {
        const resource2 = this.getConfigurationFileResource(target, key4, standaloneConfigurationMap[key4], overrides.resource, void 0);
        if (config.key === key4) {
          const jsonPath2 = this.isWorkspaceConfigurationResource(resource2) ? [key4] : [];
          return { key: jsonPath2[jsonPath2.length - 1], jsonPath: jsonPath2, value: config.value, resource: resource2 ?? void 0, workspaceStandAloneConfigurationKey: key4, target };
        }
        const keyPrefix = `${key4}.`;
        if (config.key.indexOf(keyPrefix) === 0) {
          const jsonPath2 = this.isWorkspaceConfigurationResource(resource2) ? [key4, config.key.substring(keyPrefix.length)] : [config.key.substring(keyPrefix.length)];
          return { key: jsonPath2[jsonPath2.length - 1], jsonPath: jsonPath2, value: config.value, resource: resource2 ?? void 0, workspaceStandAloneConfigurationKey: key4, target };
        }
      }
    }
    const key3 = config.key;
    const configurationProperties = Registry.as(Extensions4.Configuration).getConfigurationProperties();
    const configurationScope = configurationProperties[key3]?.scope;
    let jsonPath = overrides.overrideIdentifiers?.length ? [keyFromOverrideIdentifiers(overrides.overrideIdentifiers), key3] : [key3];
    if (target === 1 /* USER_LOCAL */ || target === 2 /* USER_REMOTE */) {
      return { key: key3, jsonPath, value: config.value, resource: this.getConfigurationFileResource(target, key3, "", null, configurationScope) ?? void 0, target };
    }
    const resource = this.getConfigurationFileResource(target, key3, FOLDER_SETTINGS_PATH, overrides.resource, configurationScope);
    if (this.isWorkspaceConfigurationResource(resource)) {
      jsonPath = ["settings", ...jsonPath];
    }
    return { key: key3, jsonPath, value: config.value, resource: resource ?? void 0, target };
  }
  isWorkspaceConfigurationResource(resource) {
    const workspace = this.contextService.getWorkspace();
    return !!(workspace.configuration && resource && workspace.configuration.fsPath === resource.fsPath);
  }
  getConfigurationFileResource(target, key3, relativePath2, resource, scope) {
    if (target === 1 /* USER_LOCAL */) {
      if (key3 === TASKS_CONFIGURATION_KEY) {
        return this.userDataProfileService.currentProfile.tasksResource;
      }
      if (key3 === MCP_CONFIGURATION_KEY) {
        return this.userDataProfileService.currentProfile.mcpResource;
      } else {
        if (!this.userDataProfileService.currentProfile.isDefault && this.configurationService.isSettingAppliedForAllProfiles(key3)) {
          return this.userDataProfilesService.defaultProfile.settingsResource;
        }
        return this.userDataProfileService.currentProfile.settingsResource;
      }
    }
    if (target === 2 /* USER_REMOTE */) {
      return this.remoteSettingsResource;
    }
    const workbenchState = this.contextService.getWorkbenchState();
    if (workbenchState !== 1 /* EMPTY */) {
      const workspace = this.contextService.getWorkspace();
      if (target === 3 /* WORKSPACE */) {
        if (workbenchState === 3 /* WORKSPACE */) {
          return workspace.configuration ?? null;
        }
        if (workbenchState === 2 /* FOLDER */) {
          return workspace.folders[0].toResource(relativePath2);
        }
      }
      if (target === 4 /* WORKSPACE_FOLDER */) {
        if (resource) {
          const folder = this.contextService.getWorkspaceFolder(resource);
          if (folder) {
            return folder.toResource(relativePath2);
          }
        }
      }
    }
    return null;
  }
};

ConfigurationEditing = __decorateClass([
  __decorateParam(1, IWorkbenchConfigurationService),
  __decorateParam(2, IWorkspaceContextService),
  __decorateParam(3, IUserDataProfileService),
  __decorateParam(4, IUserDataProfilesService),
  __decorateParam(5, IFileService),
  __decorateParam(6, ITextModelService),
  __decorateParam(7, ITextFileService),
  __decorateParam(8, INotificationService),
  __decorateParam(9, IPreferencesService),
  __decorateParam(10, IEditorService),
  __decorateParam(11, IUriIdentityService),
  __decorateParam(12, IFilesConfigurationService)
], ConfigurationEditing);
export { ConfigurationEditingError, ConfigurationEditing };
