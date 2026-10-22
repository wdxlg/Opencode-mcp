// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/preferences/browser/preferencesService.ts
import { Disposable, MutableDisposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { ResourceSet } from "./module-0008.mjs";
import { URI } from "./module-0032.mjs";
import { Schemas } from "./module-0033.mjs";
import { DefaultKeybindingsEditorModel, DefaultRawSettingsEditorModel, DefaultSettings, DefaultSettingsEditorModel, Settings2EditorModel, SettingsEditorModel, WorkspaceConfigurationEditorModel, defaultKeybindingsContents } from "./module-1650.mjs";
import { DEFAULT_SETTINGS_EDITOR_SETTING, FOLDER_SETTINGS_PATH2, IPreferencesService, SETTINGS_AUTHORITY, USE_SPLIT_JSON_SETTING, validateSettingsEditorOptions } from "./module-1294.mjs";
import { PreferencesEditorInput, SettingsEditor2Input } from "./module-1648.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { ACTIVE_GROUP, IEditorService, MODAL_GROUP, SIDE_GROUP } from "./module-0934.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4, OVERRIDE_PROPERTY_REGEX, getDefaultValue } from "./module-0140.mjs";
import { localize } from "./module-0001.mjs";
import { DEFAULT_EDITOR_ASSOCIATION } from "./module-0925.mjs";
import { KeybindingsEditorInput } from "./module-1647.mjs";
import { SideBySideEditorInput } from "./module-1095.mjs";
import { parse5 } from "./module-0883.mjs";
import { getErrorMessage } from "./module-0004.mjs";
import { getCodeEditor } from "./module-0223.mjs";
import { SuggestController } from "./module-0758.mjs";
import { isObject } from "./module-0010.mjs";
import { CoreEditingCommands } from "./module-0157.mjs";
import { compareIgnoreCase } from "./module-0030.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEditorGroupsService } from "./module-0933.mjs";
import { ITextFileService } from "./module-1063.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IUserDataProfileService } from "./module-0997.mjs";
import { IUserDataProfilesService } from "./module-0511.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IModelService } from "./module-0080.mjs";
import { IJSONEditingService } from "./module-1643.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IRemoteAgentService } from "./module-0937.mjs";
import { ITextEditorService } from "./module-1561.mjs";
import { IURLService } from "./module-1286.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { IProgressService } from "./module-0446.mjs";
import { IWorkbenchEnvironmentService } from "./module-0935.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/services/preferences/browser/preferencesService.ts
var emptyEditableSettingsContent = "{\n}";

var PreferencesService = class extends Disposable {
  constructor(editorService, editorGroupService, textFileService, configurationService, notificationService, contextService, instantiationService, userDataProfileService, userDataProfilesService, textModelResolverService, keybindingService, modelService, jsonEditingService, labelService, remoteAgentService, textEditorService, urlService, extensionService, progressService, environmentService) {
    super();
    this.editorService = editorService;
    this.editorGroupService = editorGroupService;
    this.textFileService = textFileService;
    this.configurationService = configurationService;
    this.notificationService = notificationService;
    this.contextService = contextService;
    this.instantiationService = instantiationService;
    this.userDataProfileService = userDataProfileService;
    this.userDataProfilesService = userDataProfilesService;
    this.textModelResolverService = textModelResolverService;
    this.jsonEditingService = jsonEditingService;
    this.labelService = labelService;
    this.remoteAgentService = remoteAgentService;
    this.textEditorService = textEditorService;
    this.extensionService = extensionService;
    this.progressService = progressService;
    this.environmentService = environmentService;
    this._onDispose = this._register(new Emitter());
    this._onDidDefaultSettingsContentChanged = this._register(new Emitter());
    this.onDidDefaultSettingsContentChanged = this._onDidDefaultSettingsContentChanged.event;
    this._requestedDefaultSettings = new ResourceSet();
    this._settingsGroups = void 0;
    this._cachedSettingsEditor2Input = void 0;
    this.defaultKeybindingsResource = URI.from({ scheme: Schemas.vscode, authority: "defaultsettings", path: "/keybindings.json" });
    this.defaultSettingsRawResource = URI.from({ scheme: Schemas.vscode, authority: "defaultsettings", path: "/defaultSettings.jsonc" });
    this._register(keybindingService.onDidUpdateKeybindings(() => {
      const model = modelService.getModel(this.defaultKeybindingsResource);
      if (!model) {
        return;
      }
      modelService.updateModel(model, defaultKeybindingsContents(keybindingService));
    }));
    this._register(urlService.registerHandler(this));
  }
  get userSettingsResource() {
    return this.userDataProfileService.currentProfile.settingsResource;
  }
  get workspaceSettingsResource() {
    if (this.contextService.getWorkbenchState() === 1 /* EMPTY */) {
      return null;
    }
    const workspace = this.contextService.getWorkspace();
    return workspace.configuration || workspace.folders[0].toResource(FOLDER_SETTINGS_PATH2);
  }
  createOrGetCachedSettingsEditor2Input() {
    if (!this._cachedSettingsEditor2Input || this._cachedSettingsEditor2Input.isDisposed()) {
      this._cachedSettingsEditor2Input = new SettingsEditor2Input(this);
    }
    return this._cachedSettingsEditor2Input;
  }
  getFolderSettingsResource(resource) {
    const folder = this.contextService.getWorkspaceFolder(resource);
    return folder ? folder.toResource(FOLDER_SETTINGS_PATH2) : null;
  }
  hasDefaultSettingsContent(uri5) {
    return this.isDefaultSettingsResource(uri5) || isEqual2(uri5, this.defaultSettingsRawResource) || isEqual2(uri5, this.defaultKeybindingsResource);
  }
  getDefaultSettingsContent(uri5) {
    if (this.isDefaultSettingsResource(uri5)) {
      const target = this.getConfigurationTargetFromDefaultSettingsResource(uri5);
      const defaultSettings = this.getDefaultSettings(target);
      if (!this._requestedDefaultSettings.has(uri5)) {
        this._register(defaultSettings.onDidChange(() => this._onDidDefaultSettingsContentChanged.fire(uri5)));
        this._requestedDefaultSettings.add(uri5);
      }
      return defaultSettings.getContentWithoutMostCommonlyUsed(true);
    }
    if (isEqual2(uri5, this.defaultSettingsRawResource)) {
      if (!this._defaultRawSettingsEditorModel) {
        this._defaultRawSettingsEditorModel = this._register(this.instantiationService.createInstance(DefaultRawSettingsEditorModel, this.getDefaultSettings(3 /* USER_LOCAL */)));
        this._register(this._defaultRawSettingsEditorModel.onDidContentChanged(() => this._onDidDefaultSettingsContentChanged.fire(uri5)));
      }
      return this._defaultRawSettingsEditorModel.content;
    }
    if (isEqual2(uri5, this.defaultKeybindingsResource)) {
      const defaultKeybindingsEditorModel = this.instantiationService.createInstance(DefaultKeybindingsEditorModel, uri5);
      return defaultKeybindingsEditorModel.content;
    }
    return void 0;
  }
  async createPreferencesEditorModel(uri5) {
    if (this.isDefaultSettingsResource(uri5)) {
      return this.createDefaultSettingsEditorModel(uri5);
    }
    if (this.userSettingsResource.toString() === uri5.toString() || this.userDataProfilesService.defaultProfile.settingsResource.toString() === uri5.toString()) {
      return this.createEditableSettingsEditorModel(3 /* USER_LOCAL */, uri5);
    }
    const workspaceSettingsUri = await this.getEditableSettingsURI(5 /* WORKSPACE */);
    if (workspaceSettingsUri && workspaceSettingsUri.toString() === uri5.toString()) {
      return this.createEditableSettingsEditorModel(5 /* WORKSPACE */, workspaceSettingsUri);
    }
    if (this.contextService.getWorkbenchState() === 3 /* WORKSPACE */) {
      const settingsUri = await this.getEditableSettingsURI(6 /* WORKSPACE_FOLDER */, uri5);
      if (settingsUri && settingsUri.toString() === uri5.toString()) {
        return this.createEditableSettingsEditorModel(6 /* WORKSPACE_FOLDER */, uri5);
      }
    }
    const remoteEnvironment = await this.remoteAgentService.getEnvironment();
    const remoteSettingsUri = remoteEnvironment ? remoteEnvironment.settingsPath : null;
    if (remoteSettingsUri && remoteSettingsUri.toString() === uri5.toString()) {
      return this.createEditableSettingsEditorModel(4 /* USER_REMOTE */, uri5);
    }
    return null;
  }
  openRawDefaultSettings() {
    return this.editorService.openEditor({ resource: this.defaultSettingsRawResource });
  }
  openRawUserSettings() {
    return this.editorService.openEditor({ resource: this.userSettingsResource });
  }
  shouldOpenJsonByDefault() {
    return this.configurationService.getValue("workbench.settings.editor") === "json";
  }
  async openPreferences() {
    await this.editorService.openEditor(this.instantiationService.createInstance(PreferencesEditorInput), void 0, MODAL_GROUP);
  }
  openSettings(options3 = {}) {
    options3 = {
      ...options3,
      target: 3 /* USER_LOCAL */
    };
    if (options3.query) {
      options3.jsonEditor = false;
    }
    return this.open(this.userSettingsResource, options3);
  }
  openLanguageSpecificSettings(languageId, options3 = {}) {
    if (this.shouldOpenJsonByDefault()) {
      options3.query = void 0;
      options3.revealSetting = { key: `[${languageId}]`, edit: true };
    } else {
      options3.query = `@lang:${languageId}${options3.query ? ` ${options3.query}` : ""}`;
    }
    options3.target = options3.target ?? 3 /* USER_LOCAL */;
    return this.open(this.userSettingsResource, options3);
  }
  open(settingsResource, options3) {
    options3 = {
      ...options3,
      jsonEditor: options3.jsonEditor ?? this.shouldOpenJsonByDefault()
    };
    if (options3.jsonEditor && options3.query && !options3.revealSetting) {
      const query = options3.query.trim();
      const idMatch = query.match(/^@id:(.+)$/);
      let key3;
      if (idMatch) {
        key3 = idMatch[1].trim();
      } else if (Registry.as(Extensions4.Configuration).getConfigurationProperties()[query.trim()]) {
        key3 = query.trim();
      }
      options3.query = void 0;
      if (key3) {
        options3.revealSetting = { key: key3 };
      }
    }
    return options3.jsonEditor ? this.openSettingsJson(settingsResource, options3) : this.openSettings2(options3);
  }
  async openSettings2(options3) {
    const input = this.createOrGetCachedSettingsEditor2Input();
    options3 = {
      ...options3,
      focusSearch: true
    };
    const group2 = this.getEditorGroupFromOptions(options3);
    return this.editorService.openEditor(input, validateSettingsEditorOptions(options3), group2);
  }
  openApplicationSettings(options3 = {}) {
    options3 = {
      ...options3,
      target: 3 /* USER_LOCAL */
    };
    return this.open(this.userDataProfilesService.defaultProfile.settingsResource, options3);
  }
  openUserSettings(options3 = {}) {
    options3 = {
      ...options3,
      target: 3 /* USER_LOCAL */
    };
    return this.open(this.userSettingsResource, options3);
  }
  async openRemoteSettings(options3 = {}) {
    const environment = await this.remoteAgentService.getEnvironment();
    if (environment) {
      options3 = {
        ...options3,
        target: 4 /* USER_REMOTE */
      };
      this.open(environment.settingsPath, options3);
    }
    return void 0;
  }
  openWorkspaceSettings(options3 = {}) {
    if (!this.workspaceSettingsResource) {
      this.notificationService.info(localize(23286, null));
      return Promise.reject(null);
    }
    options3 = {
      ...options3,
      target: 5 /* WORKSPACE */
    };
    return this.open(this.workspaceSettingsResource, options3);
  }
  async openFolderSettings(options3 = {}) {
    options3 = {
      ...options3,
      target: 6 /* WORKSPACE_FOLDER */
    };
    if (!options3.folderUri) {
      throw new Error(`Missing folder URI`);
    }
    const folderSettingsUri = await this.getEditableSettingsURI(6 /* WORKSPACE_FOLDER */, options3.folderUri);
    if (!folderSettingsUri) {
      throw new Error(`Invalid folder URI - ${options3.folderUri.toString()}`);
    }
    return this.open(folderSettingsUri, options3);
  }
  async openGlobalKeybindingSettings(textual, options3) {
    options3 = { pinned: true, revealIfOpened: true, ...options3 };
    if (textual) {
      const emptyContents = "// " + localize(23284, null) + "\n[\n]";
      const editableKeybindings = this.userDataProfileService.currentProfile.keybindingsResource;
      const openDefaultKeybindings = !!this.configurationService.getValue("workbench.settings.openDefaultKeybindings");
      await this.createIfNotExists(editableKeybindings, emptyContents);
      if (openDefaultKeybindings) {
        const sourceGroupId = options3.groupId ?? this.editorGroupService.activeGroup.id;
        const sideEditorGroup = this.editorGroupService.addGroup(sourceGroupId, 3 /* RIGHT */);
        await Promise.all([
          this.editorService.openEditor({ resource: this.defaultKeybindingsResource, options: { pinned: true, preserveFocus: true, revealIfOpened: true, override: DEFAULT_EDITOR_ASSOCIATION.id }, label: localize(23283, null), description: "" }, sourceGroupId),
          this.editorService.openEditor({ resource: editableKeybindings, options: options3 }, sideEditorGroup.id)
        ]);
      } else {
        await this.editorService.openEditor({ resource: editableKeybindings, options: options3 }, this.getEditorGroupFromOptions(options3));
      }
    } else {
      const group2 = this.getEditorGroupFromOptions(options3);
      const editor = await this.editorService.openEditor(this.instantiationService.createInstance(KeybindingsEditorInput), { ...options3 }, group2);
      if (options3.query) {
        editor.search(options3.query);
      }
    }
  }
  openDefaultKeybindingsFile() {
    return this.editorService.openEditor({ resource: this.defaultKeybindingsResource, label: localize(23283, null) });
  }
  getEditorGroupFromOptions(options3) {
    if (options3?.groupId !== void 0 && !options3.openToSide) {
      const group2 = this.editorGroupService.getGroup(options3.groupId);
      if (group2) {
        const modalEditorPart = this.editorGroupService.activeModalEditorPart;
        if (modalEditorPart?.groups.some((modalGroup) => modalGroup.id === group2.id)) {
          return MODAL_GROUP;
        }
        return group2;
      }
    }
    if (this.configurationService.getValue("workbench.editor.useModal") !== "off" && // modal editors enabled in settings
    !this.environmentService.enableSmokeTestDriver && !this.environmentService.extensionTestsLocationURI) {
      return MODAL_GROUP;
    }
    if (options3.openToSide) {
      return SIDE_GROUP;
    }
    if (options3?.groupId !== void 0) {
      return this.editorGroupService.getGroup(options3.groupId) ?? this.editorGroupService.activeGroup;
    }
    return ACTIVE_GROUP;
  }
  async openSettingsJson(resource, options3) {
    const group2 = this.getEditorGroupFromOptions(options3);
    const editor = await this.doOpenSettingsJson(resource, options3, group2);
    if (editor && options3?.revealSetting) {
      await this.revealSetting(options3.revealSetting.key, !!options3.revealSetting.edit, editor, resource);
    }
    return editor;
  }
  async doOpenSettingsJson(resource, options3, group2) {
    const openSplitJSON = !!this.configurationService.getValue(USE_SPLIT_JSON_SETTING);
    const openDefaultSettings = !!this.configurationService.getValue(DEFAULT_SETTINGS_EDITOR_SETTING);
    if (openSplitJSON || openDefaultSettings) {
      return this.doOpenSplitJSON(resource, options3, group2);
    }
    const configurationTarget = options3?.target ?? 2 /* USER */;
    const editableSettingsEditorInput = await this.getOrCreateEditableSettingsEditorInput(configurationTarget, resource);
    options3 = { ...options3, pinned: true };
    return await this.editorService.openEditor(editableSettingsEditorInput, { ...validateSettingsEditorOptions(options3) }, group2);
  }
  async doOpenSplitJSON(resource, options3 = {}, group2) {
    const configurationTarget = options3.target ?? 2 /* USER */;
    await this.createSettingsIfNotExists(configurationTarget, resource);
    const preferencesEditorInput = this.createSplitJsonEditorInput(configurationTarget, resource);
    options3 = { ...options3, pinned: true };
    return this.editorService.openEditor(preferencesEditorInput, validateSettingsEditorOptions(options3), group2);
  }
  createSplitJsonEditorInput(configurationTarget, resource) {
    const editableSettingsEditorInput = this.textEditorService.createTextEditor({ resource });
    const defaultPreferencesEditorInput = this.textEditorService.createTextEditor({ resource: this.getDefaultSettingsResource(configurationTarget) });
    return this.instantiationService.createInstance(SideBySideEditorInput, editableSettingsEditorInput.getName(), void 0, defaultPreferencesEditorInput, editableSettingsEditorInput);
  }
  createSettings2EditorModel() {
    return this.instantiationService.createInstance(Settings2EditorModel, this.getDefaultSettings(3 /* USER_LOCAL */));
  }
  getConfigurationTargetFromDefaultSettingsResource(uri5) {
    return this.isDefaultWorkspaceSettingsResource(uri5) ? 5 /* WORKSPACE */ : this.isDefaultFolderSettingsResource(uri5) ? 6 /* WORKSPACE_FOLDER */ : 3 /* USER_LOCAL */;
  }
  isDefaultSettingsResource(uri5) {
    return this.isDefaultUserSettingsResource(uri5) || this.isDefaultWorkspaceSettingsResource(uri5) || this.isDefaultFolderSettingsResource(uri5);
  }
  isDefaultUserSettingsResource(uri5) {
    return uri5.authority === "defaultsettings" && uri5.scheme === Schemas.vscode && !!uri5.path.match(/\/(\d+\/)?settings\.json$/);
  }
  isDefaultWorkspaceSettingsResource(uri5) {
    return uri5.authority === "defaultsettings" && uri5.scheme === Schemas.vscode && !!uri5.path.match(/\/(\d+\/)?workspaceSettings\.json$/);
  }
  isDefaultFolderSettingsResource(uri5) {
    return uri5.authority === "defaultsettings" && uri5.scheme === Schemas.vscode && !!uri5.path.match(/\/(\d+\/)?resourceSettings\.json$/);
  }
  getDefaultSettingsResource(configurationTarget) {
    switch (configurationTarget) {
      case 5 /* WORKSPACE */:
        return URI.from({ scheme: Schemas.vscode, authority: "defaultsettings", path: `/workspaceSettings.json` });
      case 6 /* WORKSPACE_FOLDER */:
        return URI.from({ scheme: Schemas.vscode, authority: "defaultsettings", path: `/resourceSettings.json` });
    }
    return URI.from({ scheme: Schemas.vscode, authority: "defaultsettings", path: `/settings.json` });
  }
  async getOrCreateEditableSettingsEditorInput(target, resource) {
    await this.createSettingsIfNotExists(target, resource);
    return this.textEditorService.createTextEditor({ resource });
  }
  async createEditableSettingsEditorModel(configurationTarget, settingsUri) {
    const workspace = this.contextService.getWorkspace();
    if (workspace.configuration && workspace.configuration.toString() === settingsUri.toString()) {
      const reference2 = await this.textModelResolverService.createModelReference(settingsUri);
      return this.instantiationService.createInstance(WorkspaceConfigurationEditorModel, reference2, configurationTarget);
    }
    const reference = await this.textModelResolverService.createModelReference(settingsUri);
    return this.instantiationService.createInstance(SettingsEditorModel, reference, configurationTarget);
  }
  async createDefaultSettingsEditorModel(defaultSettingsUri) {
    const reference = await this.textModelResolverService.createModelReference(defaultSettingsUri);
    const target = this.getConfigurationTargetFromDefaultSettingsResource(defaultSettingsUri);
    return this.instantiationService.createInstance(DefaultSettingsEditorModel, defaultSettingsUri, reference, this.getDefaultSettings(target));
  }
  getDefaultSettings(target) {
    if (target === 5 /* WORKSPACE */) {
      this._defaultWorkspaceSettingsContentModel ??= this._register(new DefaultSettings(this.getMostCommonlyUsedSettings(), target, this.configurationService));
      return this._defaultWorkspaceSettingsContentModel;
    }
    if (target === 6 /* WORKSPACE_FOLDER */) {
      this._defaultFolderSettingsContentModel ??= this._register(new DefaultSettings(this.getMostCommonlyUsedSettings(), target, this.configurationService));
      return this._defaultFolderSettingsContentModel;
    }
    this._defaultUserSettingsContentModel ??= this._register(new DefaultSettings(this.getMostCommonlyUsedSettings(), target, this.configurationService));
    return this._defaultUserSettingsContentModel;
  }
  async getEditableSettingsURI(configurationTarget, resource) {
    switch (configurationTarget) {
      case 1 /* APPLICATION */:
        return this.userDataProfilesService.defaultProfile.settingsResource;
      case 2 /* USER */:
      case 3 /* USER_LOCAL */:
        return this.userSettingsResource;
      case 4 /* USER_REMOTE */: {
        const remoteEnvironment = await this.remoteAgentService.getEnvironment();
        return remoteEnvironment ? remoteEnvironment.settingsPath : null;
      }
      case 5 /* WORKSPACE */:
        return this.workspaceSettingsResource;
      case 6 /* WORKSPACE_FOLDER */:
        if (resource) {
          return this.getFolderSettingsResource(resource);
        }
    }
    return null;
  }
  async createSettingsIfNotExists(target, resource) {
    if (this.contextService.getWorkbenchState() === 3 /* WORKSPACE */ && target === 5 /* WORKSPACE */) {
      const workspaceConfig = this.contextService.getWorkspace().configuration;
      if (!workspaceConfig) {
        return;
      }
      const content2 = await this.textFileService.read(workspaceConfig);
      if (Object.keys(parse5(content2.value)).indexOf("settings") === -1) {
        await this.jsonEditingService.write(resource, [{ path: ["settings"], value: {} }], true);
      }
      return void 0;
    }
    await this.createIfNotExists(resource, emptyEditableSettingsContent);
  }
  async createIfNotExists(resource, contents) {
    try {
      await this.textFileService.read(resource, { acceptTextOnly: true });
    } catch (error) {
      if (error.fileOperationResult === 1 /* FILE_NOT_FOUND */) {
        try {
          await this.textFileService.write(resource, contents);
          return;
        } catch (error2) {
          throw new Error(localize(23285, null, this.labelService.getUriLabel(resource, { relative: true }), getErrorMessage(error2)));
        }
      } else {
        throw error;
      }
    }
  }
  getMostCommonlyUsedSettings() {
    return [
      "editor.fontSize",
      "editor.formatOnSave",
      "files.autoSave",
      "editor.defaultFormatter",
      "editor.fontFamily",
      "editor.wordWrap",
      "chat.agent.maxRequests",
      "files.exclude",
      "workbench.colorTheme",
      "editor.tabSize",
      "editor.mouseWheelZoom",
      "editor.formatOnPaste"
    ];
  }
  async revealSetting(settingKey, edit3, editor, settingsResource) {
    const codeEditor = editor ? getCodeEditor(editor.getControl()) : null;
    if (!codeEditor) {
      return;
    }
    const settingsModel = await this.createPreferencesEditorModel(settingsResource);
    if (!settingsModel) {
      return;
    }
    const position2 = await this.getPositionToReveal(settingKey, edit3, settingsModel, codeEditor);
    if (position2) {
      codeEditor.setPosition(position2);
      codeEditor.revealPositionNearTop(position2);
      codeEditor.focus();
      if (edit3) {
        SuggestController.get(codeEditor)?.triggerSuggest();
      }
    }
  }
  async getPositionToReveal(settingKey, edit3, settingsModel, codeEditor) {
    const model = codeEditor.getModel();
    if (!model) {
      return null;
    }
    const schema10 = Registry.as(Extensions4.Configuration).getConfigurationProperties()[settingKey];
    const isOverrideProperty = OVERRIDE_PROPERTY_REGEX.test(settingKey);
    if (!schema10 && !isOverrideProperty) {
      return null;
    }
    let position2 = null;
    const type = schema10?.type ?? "object";
    let setting = settingsModel.getPreference(settingKey);
    if (!setting && edit3) {
      let defaultValue = type === "object" || type === "array" ? this.configurationService.inspect(settingKey).defaultValue : getDefaultValue(type);
      defaultValue = defaultValue === void 0 && isOverrideProperty ? {} : defaultValue;
      if (defaultValue !== void 0) {
        const key3 = settingsModel instanceof WorkspaceConfigurationEditorModel ? ["settings", settingKey] : [settingKey];
        await this.jsonEditingService.write(settingsModel.uri, [{ path: key3, value: defaultValue }], false);
        setting = settingsModel.getPreference(settingKey);
      }
    }
    if (setting) {
      if (edit3) {
        if (isObject(setting.value) || Array.isArray(setting.value)) {
          position2 = { lineNumber: setting.valueRange.startLineNumber, column: setting.valueRange.startColumn + 1 };
          codeEditor.setPosition(position2);
          await this.instantiationService.invokeFunction((accessor) => {
            return CoreEditingCommands.LineBreakInsert.runEditorCommand(accessor, codeEditor, null);
          });
          position2 = { lineNumber: position2.lineNumber + 1, column: model.getLineMaxColumn(position2.lineNumber + 1) };
          const firstNonWhiteSpaceColumn = model.getLineFirstNonWhitespaceColumn(position2.lineNumber);
          if (firstNonWhiteSpaceColumn) {
            codeEditor.setPosition({ lineNumber: position2.lineNumber, column: firstNonWhiteSpaceColumn });
            await this.instantiationService.invokeFunction((accessor) => {
              return CoreEditingCommands.LineBreakInsert.runEditorCommand(accessor, codeEditor, null);
            });
            position2 = { lineNumber: position2.lineNumber, column: model.getLineMaxColumn(position2.lineNumber) };
          }
        } else {
          position2 = { lineNumber: setting.valueRange.startLineNumber, column: setting.valueRange.endColumn };
        }
      } else {
        position2 = { lineNumber: setting.keyRange.startLineNumber, column: setting.keyRange.startColumn };
      }
    }
    return position2;
  }
  getSetting(settingId) {
    if (!this._settingsGroups) {
      const defaultSettings = this.getDefaultSettings(2 /* USER */);
      const defaultsChangedDisposable = this._register(new MutableDisposable());
      defaultsChangedDisposable.value = defaultSettings.onDidChange(() => {
        this._settingsGroups = void 0;
        defaultsChangedDisposable.clear();
      });
      this._settingsGroups = defaultSettings.getSettingsGroups();
    }
    for (const group2 of this._settingsGroups) {
      for (const section of group2.sections) {
        for (const setting of section.settings) {
          if (compareIgnoreCase(setting.key, settingId) === 0) {
            return setting;
          }
        }
      }
    }
    return void 0;
  }
  /**
   * Should be of the format:
   * 	code://settings/settingName
   * Examples:
   * 	code://settings/files.autoSave
   *
   */
  async handleURL(uri5) {
    if (compareIgnoreCase(uri5.authority, SETTINGS_AUTHORITY) !== 0) {
      return false;
    }
    const settingInfo = uri5.path.split("/").filter((part) => !!part);
    const settingId = settingInfo.length > 0 ? settingInfo[0] : void 0;
    if (!settingId) {
      this.openSettings();
      return true;
    }
    let setting = this.getSetting(settingId);
    if (!setting && this.extensionService.extensions.length === 0) {
      await this.progressService.withProgress({ location: 10 /* Window */ }, () => Event2.toPromise(this.extensionService.onDidRegisterExtensions));
      setting = this.getSetting(settingId);
    }
    const openSettingsOptions = {};
    if (setting) {
      openSettingsOptions.query = settingId;
    }
    this.openSettings(openSettingsOptions);
    return true;
  }
  dispose() {
    if (this._cachedSettingsEditor2Input && !this._cachedSettingsEditor2Input.isDisposed()) {
      this._cachedSettingsEditor2Input.dispose();
    }
    this._onDispose.fire();
    super.dispose();
  }
};

PreferencesService = __decorateClass([
  __decorateParam(0, IEditorService),
  __decorateParam(1, IEditorGroupsService),
  __decorateParam(2, ITextFileService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, INotificationService),
  __decorateParam(5, IWorkspaceContextService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, IUserDataProfileService),
  __decorateParam(8, IUserDataProfilesService),
  __decorateParam(9, ITextModelService),
  __decorateParam(10, IKeybindingService),
  __decorateParam(11, IModelService),
  __decorateParam(12, IJSONEditingService),
  __decorateParam(13, ILabelService),
  __decorateParam(14, IRemoteAgentService),
  __decorateParam(15, ITextEditorService),
  __decorateParam(16, IURLService),
  __decorateParam(17, IExtensionService),
  __decorateParam(18, IProgressService),
  __decorateParam(19, IWorkbenchEnvironmentService)
], PreferencesService);

registerSingleton(IPreferencesService, PreferencesService, 1 /* Delayed */);
export { emptyEditableSettingsContent, PreferencesService };
