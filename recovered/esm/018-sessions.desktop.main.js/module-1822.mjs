// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/preferences/browser/preferencesRenderers.ts
import { Disposable } from "./module-0012.mjs";
import { Delayer } from "./module-0036.mjs";
import { Extensions4, OVERRIDE_PROPERTY_REGEX, overrideIdentifiersFromKey } from "./module-0140.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IPreferencesService } from "./module-1293.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { EditPreferenceWidget } from "./module-1811.mjs";
import { DefaultSettingsEditorModel, WorkspaceConfigurationEditorModel } from "./module-1591.mjs";
import { localize } from "./module-0001.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { settingsEditIcon } from "./module-1810.mjs";
import { EventHelper, getDomNodePagePosition } from "./module-0075.mjs";
import { SubmenuAction } from "./module-0082.mjs";
import { Position } from "./module-0079.mjs";
import { Registry } from "./module-0090.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { RangeHighlightDecorations } from "./module-1821.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { mcpConfigurationSection } from "./module-1420.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { APPLICATION_SCOPES, APPLY_ALL_PROFILES_SETTING, IWorkbenchConfigurationService } from "./module-1198.mjs";
import { CodeActionKind } from "./module-0558.mjs";
import { EXPERIMENTAL_INDICATOR_DESCRIPTION, PREVIEW_INDICATOR_DESCRIPTION } from "./module-1807.mjs";
import { Range2 } from "./module-0106.mjs";
import { IMarkerService } from "./module-0560.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { IWorkspaceTrustManagementService } from "./module-0854.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { IUserDataProfileService } from "./module-0998.mjs";
import { IUserDataProfilesService } from "./module-0511.mjs";
import { ModelDecorationOptions } from "./module-0423.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";


// src/vs/workbench/contrib/preferences/browser/preferencesRenderers.ts
var UserSettingsRenderer = class extends Disposable {
  constructor(editor, preferencesModel, preferencesService, configurationService, instantiationService) {
    super();
    this.editor = editor;
    this.preferencesModel = preferencesModel;
    this.preferencesService = preferencesService;
    this.configurationService = configurationService;
    this.instantiationService = instantiationService;
    this.modelChangeDelayer = this._register(new Delayer(200));
    this.settingHighlighter = this._register(instantiationService.createInstance(SettingHighlighter, editor));
    this.editSettingActionRenderer = this._register(this.instantiationService.createInstance(EditSettingRenderer, this.editor, this.preferencesModel, this.settingHighlighter));
    this._register(this.editSettingActionRenderer.onUpdateSetting(({ key: key3, value: value2, source }) => this.updatePreference(key3, value2, source)));
    this._register(this.editor.getModel().onDidChangeContent(() => this.modelChangeDelayer.trigger(() => this.onModelChanged())));
    this.unsupportedSettingsRenderer = this._register(instantiationService.createInstance(UnsupportedSettingsRenderer, editor, preferencesModel));
    this.mcpSettingsRenderer = this._register(instantiationService.createInstance(McpSettingsRenderer, editor, preferencesModel));
  }
  render() {
    this.editSettingActionRenderer.render(this.preferencesModel.settingsGroups, this.associatedPreferencesModel);
    this.unsupportedSettingsRenderer.render();
    this.mcpSettingsRenderer.render();
  }
  updatePreference(key3, value2, source) {
    const overrideIdentifiers = source.overrideOf ? overrideIdentifiersFromKey(source.overrideOf.key) : null;
    const resource = this.preferencesModel.uri;
    this.configurationService.updateValue(key3, value2, { overrideIdentifiers, resource }, this.preferencesModel.configurationTarget).then(() => this.onSettingUpdated(source));
  }
  onModelChanged() {
    if (!this.editor.hasModel()) {
      return;
    }
    this.render();
  }
  onSettingUpdated(setting) {
    this.editor.focus();
    setting = this.getSetting(setting);
    if (setting) {
      this.editor.setSelection(setting.valueRange);
      this.settingHighlighter.highlight(setting, true);
    }
  }
  getSetting(setting) {
    const { key: key3, overrideOf } = setting;
    if (overrideOf) {
      const setting2 = this.getSetting(overrideOf);
      for (const override of setting2.overrides) {
        if (override.key === key3) {
          return override;
        }
      }
      return void 0;
    }
    return this.preferencesModel.getPreference(key3);
  }
  focusPreference(setting) {
    const s = this.getSetting(setting);
    if (s) {
      this.settingHighlighter.highlight(s, true);
      this.editor.setPosition({ lineNumber: s.keyRange.startLineNumber, column: s.keyRange.startColumn });
    } else {
      this.settingHighlighter.clear(true);
    }
  }
  clearFocus(setting) {
    this.settingHighlighter.clear(true);
  }
  editPreference(setting) {
    const editableSetting = this.getSetting(setting);
    return !!(editableSetting && this.editSettingActionRenderer.activateOnSetting(editableSetting));
  }
};

UserSettingsRenderer = __decorateClass([
  __decorateParam(2, IPreferencesService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IInstantiationService)
], UserSettingsRenderer);

var WorkspaceSettingsRenderer = class extends UserSettingsRenderer {
  constructor(editor, preferencesModel, preferencesService, configurationService, instantiationService) {
    super(editor, preferencesModel, preferencesService, configurationService, instantiationService);
    this.workspaceConfigurationRenderer = this._register(instantiationService.createInstance(WorkspaceConfigurationRenderer, editor, preferencesModel));
  }
  render() {
    super.render();
    this.workspaceConfigurationRenderer.render();
  }
};

WorkspaceSettingsRenderer = __decorateClass([
  __decorateParam(2, IPreferencesService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IInstantiationService)
], WorkspaceSettingsRenderer);

var EditSettingRenderer = class extends Disposable {
  constructor(editor, primarySettingsModel, settingHighlighter, configurationService, instantiationService, contextMenuService) {
    super();
    this.editor = editor;
    this.primarySettingsModel = primarySettingsModel;
    this.settingHighlighter = settingHighlighter;
    this.configurationService = configurationService;
    this.instantiationService = instantiationService;
    this.contextMenuService = contextMenuService;
    this.settingsGroups = [];
    this._onUpdateSetting = this._register(new Emitter());
    this.onUpdateSetting = this._onUpdateSetting.event;
    this.editPreferenceWidgetForCursorPosition = this._register(this.instantiationService.createInstance(EditPreferenceWidget, editor));
    this.editPreferenceWidgetForMouseMove = this._register(this.instantiationService.createInstance(EditPreferenceWidget, editor));
    this.toggleEditPreferencesForMouseMoveDelayer = this._register(new Delayer(75));
    this._register(this.editPreferenceWidgetForCursorPosition.onClick((e4) => this.onEditSettingClicked(this.editPreferenceWidgetForCursorPosition, e4)));
    this._register(this.editPreferenceWidgetForMouseMove.onClick((e4) => this.onEditSettingClicked(this.editPreferenceWidgetForMouseMove, e4)));
    this._register(this.editor.onDidChangeCursorPosition((positionChangeEvent) => this.onPositionChanged(positionChangeEvent)));
    this._register(this.editor.onMouseMove((mouseMoveEvent) => this.onMouseMoved(mouseMoveEvent)));
    this._register(this.editor.onDidChangeConfiguration(() => this.onConfigurationChanged()));
  }
  render(settingsGroups, associatedPreferencesModel) {
    this.editPreferenceWidgetForCursorPosition.hide();
    this.editPreferenceWidgetForMouseMove.hide();
    this.settingsGroups = settingsGroups;
    this.associatedPreferencesModel = associatedPreferencesModel;
    const settings = this.getSettings(this.editor.getPosition().lineNumber);
    if (settings.length) {
      this.showEditPreferencesWidget(this.editPreferenceWidgetForCursorPosition, settings);
    }
  }
  isDefaultSettings() {
    return this.primarySettingsModel instanceof DefaultSettingsEditorModel;
  }
  onConfigurationChanged() {
    if (!this.editor.getOption(66 /* glyphMargin */)) {
      this.editPreferenceWidgetForCursorPosition.hide();
      this.editPreferenceWidgetForMouseMove.hide();
    }
  }
  onPositionChanged(positionChangeEvent) {
    this.editPreferenceWidgetForMouseMove.hide();
    const settings = this.getSettings(positionChangeEvent.position.lineNumber);
    if (settings.length) {
      this.showEditPreferencesWidget(this.editPreferenceWidgetForCursorPosition, settings);
    } else {
      this.editPreferenceWidgetForCursorPosition.hide();
    }
  }
  onMouseMoved(mouseMoveEvent) {
    const editPreferenceWidget = this.getEditPreferenceWidgetUnderMouse(mouseMoveEvent);
    if (editPreferenceWidget) {
      this.onMouseOver(editPreferenceWidget);
      return;
    }
    this.settingHighlighter.clear();
    this.toggleEditPreferencesForMouseMoveDelayer.trigger(() => this.toggleEditPreferenceWidgetForMouseMove(mouseMoveEvent));
  }
  getEditPreferenceWidgetUnderMouse(mouseMoveEvent) {
    if (mouseMoveEvent.target.type === 2 /* GUTTER_GLYPH_MARGIN */) {
      const line = mouseMoveEvent.target.position.lineNumber;
      if (this.editPreferenceWidgetForMouseMove.getLine() === line && this.editPreferenceWidgetForMouseMove.isVisible()) {
        return this.editPreferenceWidgetForMouseMove;
      }
      if (this.editPreferenceWidgetForCursorPosition.getLine() === line && this.editPreferenceWidgetForCursorPosition.isVisible()) {
        return this.editPreferenceWidgetForCursorPosition;
      }
    }
    return void 0;
  }
  toggleEditPreferenceWidgetForMouseMove(mouseMoveEvent) {
    const settings = mouseMoveEvent.target.position ? this.getSettings(mouseMoveEvent.target.position.lineNumber) : null;
    if (settings && settings.length) {
      this.showEditPreferencesWidget(this.editPreferenceWidgetForMouseMove, settings);
    } else {
      this.editPreferenceWidgetForMouseMove.hide();
    }
  }
  showEditPreferencesWidget(editPreferencesWidget, settings) {
    const line = settings[0].valueRange.startLineNumber;
    if (this.editor.getOption(66 /* glyphMargin */) && this.marginFreeFromOtherDecorations(line)) {
      editPreferencesWidget.show(line, localize(18165, null), settings);
      const editPreferenceWidgetToHide = editPreferencesWidget === this.editPreferenceWidgetForCursorPosition ? this.editPreferenceWidgetForMouseMove : this.editPreferenceWidgetForCursorPosition;
      editPreferenceWidgetToHide.hide();
    }
  }
  marginFreeFromOtherDecorations(line) {
    const decorations = this.editor.getLineDecorations(line);
    if (decorations) {
      for (const { options: options3 } of decorations) {
        if (options3.glyphMarginClassName && options3.glyphMarginClassName.indexOf(ThemeIcon.asClassName(settingsEditIcon)) === -1) {
          return false;
        }
      }
    }
    return true;
  }
  getSettings(lineNumber) {
    const configurationMap = this.getConfigurationsMap();
    return this.getSettingsAtLineNumber(lineNumber).filter((setting) => {
      const configurationNode = configurationMap[setting.key];
      if (configurationNode) {
        if (configurationNode.policy && this.configurationService.inspect(setting.key).policyValue !== void 0) {
          return false;
        }
        if (this.isDefaultSettings()) {
          if (setting.key === "launch") {
            return false;
          }
          return true;
        }
        if (configurationNode.type === "boolean" || configurationNode.enum) {
          if (this.primarySettingsModel.configurationTarget !== 6 /* WORKSPACE_FOLDER */) {
            return true;
          }
          if (configurationNode.scope === 5 /* RESOURCE */ || configurationNode.scope === 6 /* LANGUAGE_OVERRIDABLE */) {
            return true;
          }
        }
      }
      return false;
    });
  }
  getSettingsAtLineNumber(lineNumber) {
    let index2 = 0;
    const settings = [];
    for (const group2 of this.settingsGroups) {
      if (group2.range.startLineNumber > lineNumber) {
        break;
      }
      if (lineNumber >= group2.range.startLineNumber && lineNumber <= group2.range.endLineNumber) {
        for (const section of group2.sections) {
          for (const setting of section.settings) {
            if (setting.range.startLineNumber > lineNumber) {
              break;
            }
            if (lineNumber >= setting.range.startLineNumber && lineNumber <= setting.range.endLineNumber) {
              if (!this.isDefaultSettings() && setting.overrides.length) {
                for (const overrideSetting of setting.overrides) {
                  if (lineNumber >= overrideSetting.range.startLineNumber && lineNumber <= overrideSetting.range.endLineNumber) {
                    settings.push({ ...overrideSetting, index: index2, groupId: group2.id });
                  }
                }
              } else {
                settings.push({ ...setting, index: index2, groupId: group2.id });
              }
            }
            index2++;
          }
        }
      }
    }
    return settings;
  }
  onMouseOver(editPreferenceWidget) {
    this.settingHighlighter.highlight(editPreferenceWidget.preferences[0]);
  }
  onEditSettingClicked(editPreferenceWidget, e4) {
    EventHelper.stop(e4.event, true);
    const actions = this.getSettings(editPreferenceWidget.getLine()).length === 1 ? this.getActions(editPreferenceWidget.preferences[0], this.getConfigurationsMap()[editPreferenceWidget.preferences[0].key]) : editPreferenceWidget.preferences.map((setting) => new SubmenuAction(`preferences.submenu.${setting.key}`, setting.key, this.getActions(setting, this.getConfigurationsMap()[setting.key])));
    this.contextMenuService.showContextMenu({
      getAnchor: () => e4.event,
      getActions: () => actions
    });
  }
  activateOnSetting(setting) {
    const startLine = setting.keyRange.startLineNumber;
    const settings = this.getSettings(startLine);
    if (!settings.length) {
      return false;
    }
    this.editPreferenceWidgetForMouseMove.show(startLine, "", settings);
    const actions = this.getActions(this.editPreferenceWidgetForMouseMove.preferences[0], this.getConfigurationsMap()[this.editPreferenceWidgetForMouseMove.preferences[0].key]);
    this.contextMenuService.showContextMenu({
      getAnchor: () => this.toAbsoluteCoords(new Position(startLine, 1)),
      getActions: () => actions
    });
    return true;
  }
  toAbsoluteCoords(position2) {
    const positionCoords = this.editor.getScrolledVisiblePosition(position2);
    const editorCoords = getDomNodePagePosition(this.editor.getDomNode());
    const x = editorCoords.left + positionCoords.left;
    const y = editorCoords.top + positionCoords.top + positionCoords.height;
    return { x, y: y + 10 };
  }
  getConfigurationsMap() {
    return Registry.as(Extensions4.Configuration).getConfigurationProperties();
  }
  getActions(setting, jsonSchema) {
    if (jsonSchema.type === "boolean") {
      return [{
        id: "truthyValue",
        label: "true",
        tooltip: "true",
        enabled: true,
        run: () => this.updateSetting(setting.key, true, setting),
        class: void 0
      }, {
        id: "falsyValue",
        label: "false",
        tooltip: "false",
        enabled: true,
        run: () => this.updateSetting(setting.key, false, setting),
        class: void 0
      }];
    }
    if (jsonSchema.enum) {
      return jsonSchema.enum.map((value2) => {
        return {
          id: value2,
          label: JSON.stringify(value2),
          tooltip: JSON.stringify(value2),
          enabled: true,
          run: () => this.updateSetting(setting.key, value2, setting),
          class: void 0
        };
      });
    }
    return this.getDefaultActions(setting);
  }
  getDefaultActions(setting) {
    if (this.isDefaultSettings()) {
      const settingInOtherModel = this.associatedPreferencesModel.getPreference(setting.key);
      return [{
        id: "setDefaultValue",
        label: settingInOtherModel ? localize(18171, null) : localize(18163, null),
        tooltip: settingInOtherModel ? localize(18171, null) : localize(18163, null),
        enabled: true,
        run: () => this.updateSetting(setting.key, setting.value, setting),
        class: void 0
      }];
    }
    return [];
  }
  updateSetting(key3, value2, source) {
    this._onUpdateSetting.fire({ key: key3, value: value2, source });
  }
};

EditSettingRenderer = __decorateClass([
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IContextMenuService)
], EditSettingRenderer);

var SettingHighlighter = class extends Disposable {
  constructor(editor, instantiationService) {
    super();
    this.editor = editor;
    this.fixedHighlighter = this._register(instantiationService.createInstance(RangeHighlightDecorations));
    this.volatileHighlighter = this._register(instantiationService.createInstance(RangeHighlightDecorations));
  }
  highlight(setting, fix = false) {
    this.volatileHighlighter.removeHighlightRange();
    this.fixedHighlighter.removeHighlightRange();
    const highlighter = fix ? this.fixedHighlighter : this.volatileHighlighter;
    highlighter.highlightRange({
      range: setting.valueRange,
      resource: this.editor.getModel().uri
    }, this.editor);
    this.editor.revealLineInCenterIfOutsideViewport(setting.valueRange.startLineNumber, 0 /* Smooth */);
  }
  clear(fix = false) {
    this.volatileHighlighter.removeHighlightRange();
    if (fix) {
      this.fixedHighlighter.removeHighlightRange();
    }
  }
};

SettingHighlighter = __decorateClass([
  __decorateParam(1, IInstantiationService)
], SettingHighlighter);

var UnsupportedSettingsRenderer = class extends Disposable {
  constructor(editor, settingsEditorModel, markerService, environmentService, configurationService, workspaceTrustManagementService, uriIdentityService, languageFeaturesService, userDataProfileService, userDataProfilesService) {
    super();
    this.editor = editor;
    this.settingsEditorModel = settingsEditorModel;
    this.markerService = markerService;
    this.environmentService = environmentService;
    this.configurationService = configurationService;
    this.workspaceTrustManagementService = workspaceTrustManagementService;
    this.uriIdentityService = uriIdentityService;
    this.userDataProfileService = userDataProfileService;
    this.userDataProfilesService = userDataProfilesService;
    this.renderingDelayer = this._register(new Delayer(200));
    this.codeActions = new ResourceMap((uri4) => this.uriIdentityService.extUri.getComparisonKey(uri4));
    this._register(this.editor.getModel().onDidChangeContent(() => this.delayedRender()));
    this._register(Event2.filter(this.configurationService.onDidChangeConfiguration, (e4) => e4.source === 7 /* DEFAULT */)(() => this.delayedRender()));
    this._register(languageFeaturesService.codeActionProvider.register({ pattern: settingsEditorModel.uri.path }, this));
    this._register(userDataProfileService.onDidChangeCurrentProfile(() => this.delayedRender()));
  }
  delayedRender() {
    this.renderingDelayer.trigger(() => this.render());
  }
  render() {
    this.codeActions.clear();
    const markerData = this.generateMarkerData();
    if (markerData.length) {
      this.markerService.changeOne("UnsupportedSettingsRenderer", this.settingsEditorModel.uri, markerData);
    } else {
      this.markerService.remove("UnsupportedSettingsRenderer", [this.settingsEditorModel.uri]);
    }
  }
  async provideCodeActions(model, range2, context2, token) {
    const actions = [];
    const codeActionsByRange = this.codeActions.get(model.uri);
    if (codeActionsByRange) {
      for (const [codeActionsRange, codeActions] of codeActionsByRange) {
        if (codeActionsRange.containsRange(range2)) {
          actions.push(...codeActions);
        }
      }
    }
    return {
      actions,
      dispose: () => {
      }
    };
  }
  generateMarkerData() {
    const markerData = [];
    const configurationRegistry25 = Registry.as(Extensions4.Configuration).getConfigurationProperties();
    for (const settingsGroup of this.settingsEditorModel.settingsGroups) {
      for (const section of settingsGroup.sections) {
        for (const setting of section.settings) {
          if (OVERRIDE_PROPERTY_REGEX.test(setting.key)) {
            if (setting.overrides) {
              this.handleOverrides(setting.overrides, configurationRegistry25, markerData);
            }
            continue;
          }
          if (setting.key === mcpConfigurationSection && this.settingsEditorModel instanceof WorkspaceConfigurationEditorModel) {
            continue;
          }
          const configuration2 = configurationRegistry25[setting.key];
          if (configuration2) {
            this.handleUnstableSettingConfiguration(setting, configuration2, markerData);
            if (this.handlePolicyConfiguration(setting, configuration2, markerData)) {
              continue;
            }
            switch (this.settingsEditorModel.configurationTarget) {
              case 3 /* USER_LOCAL */:
                this.handleLocalUserConfiguration(setting, configuration2, markerData);
                break;
              case 4 /* USER_REMOTE */:
                this.handleRemoteUserConfiguration(setting, configuration2, markerData);
                break;
              case 5 /* WORKSPACE */:
                this.handleWorkspaceConfiguration(setting, configuration2, markerData);
                break;
              case 6 /* WORKSPACE_FOLDER */:
                this.handleWorkspaceFolderConfiguration(setting, configuration2, markerData);
                break;
            }
          } else {
            markerData.push(this.generateUnknownConfigurationMarker(setting));
          }
        }
      }
    }
    return markerData;
  }
  handlePolicyConfiguration(setting, configuration2, markerData) {
    if (!configuration2.policy) {
      return false;
    }
    if (this.configurationService.inspect(setting.key).policyValue === void 0) {
      return false;
    }
    if (this.settingsEditorModel.configurationTarget === 7 /* DEFAULT */) {
      return false;
    }
    markerData.push({
      severity: 1 /* Hint */,
      tags: [1 /* Unnecessary */],
      ...setting.range,
      message: localize(18175, null)
    });
    return true;
  }
  handleOverrides(overrides, configurationRegistry25, markerData) {
    for (const setting of overrides || []) {
      const configuration2 = configurationRegistry25[setting.key];
      if (configuration2) {
        if (configuration2.scope !== 6 /* LANGUAGE_OVERRIDABLE */) {
          markerData.push({
            severity: 1 /* Hint */,
            tags: [1 /* Unnecessary */],
            ...setting.range,
            message: localize(18179, null)
          });
        }
      } else {
        markerData.push(this.generateUnknownConfigurationMarker(setting));
      }
    }
  }
  handleLocalUserConfiguration(setting, configuration2, markerData) {
    if (!this.userDataProfileService.currentProfile.isDefault && !this.userDataProfileService.currentProfile.useDefaultFlags?.settings) {
      if (isEqual2(this.userDataProfilesService.defaultProfile.settingsResource, this.settingsEditorModel.uri) && !this.configurationService.isSettingAppliedForAllProfiles(setting.key)) {
        markerData.push({
          severity: 1 /* Hint */,
          tags: [1 /* Unnecessary */],
          ...setting.range,
          message: localize(18164, null)
        });
      } else if (isEqual2(this.userDataProfileService.currentProfile.settingsResource, this.settingsEditorModel.uri)) {
        if (configuration2.scope && APPLICATION_SCOPES.includes(configuration2.scope)) {
          markerData.push(this.generateUnsupportedApplicationSettingMarker(setting));
        } else if (this.configurationService.isSettingAppliedForAllProfiles(setting.key)) {
          markerData.push({
            severity: 1 /* Hint */,
            tags: [1 /* Unnecessary */],
            ...setting.range,
            message: localize(18162, null, APPLY_ALL_PROFILES_SETTING)
          });
        }
      }
    }
    if (this.environmentService.remoteAuthority && (configuration2.scope === 2 /* MACHINE */ || configuration2.scope === 3 /* APPLICATION_MACHINE */ || configuration2.scope === 7 /* MACHINE_OVERRIDABLE */)) {
      markerData.push({
        severity: 1 /* Hint */,
        tags: [1 /* Unnecessary */],
        ...setting.range,
        message: localize(18177, null)
      });
    }
  }
  handleRemoteUserConfiguration(setting, configuration2, markerData) {
    if (configuration2.scope === 1 /* APPLICATION */) {
      markerData.push(this.generateUnsupportedApplicationSettingMarker(setting));
    }
  }
  handleWorkspaceConfiguration(setting, configuration2, markerData) {
    if (configuration2.scope && APPLICATION_SCOPES.includes(configuration2.scope)) {
      markerData.push(this.generateUnsupportedApplicationSettingMarker(setting));
    }
    if (configuration2.scope === 2 /* MACHINE */) {
      markerData.push(this.generateUnsupportedMachineSettingMarker(setting));
    }
    if (!this.workspaceTrustManagementService.isWorkspaceTrusted() && configuration2.restricted) {
      const marker = this.generateUntrustedSettingMarker(setting);
      markerData.push(marker);
      const codeActions = this.generateUntrustedSettingCodeActions([marker]);
      this.addCodeActions(marker, codeActions);
    }
  }
  handleWorkspaceFolderConfiguration(setting, configuration2, markerData) {
    if (configuration2.scope && APPLICATION_SCOPES.includes(configuration2.scope)) {
      markerData.push(this.generateUnsupportedApplicationSettingMarker(setting));
    }
    if (configuration2.scope === 2 /* MACHINE */) {
      markerData.push(this.generateUnsupportedMachineSettingMarker(setting));
    }
    if (configuration2.scope === 4 /* WINDOW */) {
      markerData.push({
        severity: 1 /* Hint */,
        tags: [1 /* Unnecessary */],
        ...setting.range,
        message: localize(18178, null)
      });
    }
    if (!this.workspaceTrustManagementService.isWorkspaceTrusted() && configuration2.restricted) {
      const marker = this.generateUntrustedSettingMarker(setting);
      markerData.push(marker);
      const codeActions = this.generateUntrustedSettingCodeActions([marker]);
      this.addCodeActions(marker, codeActions);
    }
  }
  handleUnstableSettingConfiguration(setting, configuration2, markerData) {
    if (configuration2.tags?.includes("preview")) {
      markerData.push(this.generatePreviewSettingMarker(setting));
    } else if (configuration2.tags?.includes("experimental")) {
      markerData.push(this.generateExperimentalSettingMarker(setting));
    }
  }
  generateUnsupportedApplicationSettingMarker(setting) {
    return {
      severity: 1 /* Hint */,
      tags: [1 /* Unnecessary */],
      ...setting.range,
      message: localize(18173, null)
    };
  }
  generateUnsupportedMachineSettingMarker(setting) {
    return {
      severity: 1 /* Hint */,
      tags: [1 /* Unnecessary */],
      ...setting.range,
      message: localize(18174, null)
    };
  }
  generateUntrustedSettingMarker(setting) {
    return {
      severity: 4 /* Warning */,
      ...setting.range,
      message: localize(18180, null)
    };
  }
  generateUnknownConfigurationMarker(setting) {
    return {
      severity: 1 /* Hint */,
      tags: [1 /* Unnecessary */],
      ...setting.range,
      message: localize(18172, null)
    };
  }
  generateUntrustedSettingCodeActions(diagnostics) {
    return [{
      title: localize(18166, null),
      command: {
        id: "workbench.trust.manage",
        title: localize(18166, null)
      },
      diagnostics,
      kind: CodeActionKind.QuickFix.value
    }];
  }
  generatePreviewSettingMarker(setting) {
    return {
      severity: 1 /* Hint */,
      ...setting.range,
      message: PREVIEW_INDICATOR_DESCRIPTION
    };
  }
  generateExperimentalSettingMarker(setting) {
    return {
      severity: 1 /* Hint */,
      ...setting.range,
      message: EXPERIMENTAL_INDICATOR_DESCRIPTION
    };
  }
  addCodeActions(range2, codeActions) {
    let actions = this.codeActions.get(this.settingsEditorModel.uri);
    if (!actions) {
      actions = [];
      this.codeActions.set(this.settingsEditorModel.uri, actions);
    }
    actions.push([Range2.lift(range2), codeActions]);
  }
  dispose() {
    this.markerService.remove("UnsupportedSettingsRenderer", [this.settingsEditorModel.uri]);
    this.codeActions.clear();
    super.dispose();
  }
};

UnsupportedSettingsRenderer = __decorateClass([
  __decorateParam(2, IMarkerService),
  __decorateParam(3, IWorkbenchEnvironmentService),
  __decorateParam(4, IWorkbenchConfigurationService),
  __decorateParam(5, IWorkspaceTrustManagementService),
  __decorateParam(6, IUriIdentityService),
  __decorateParam(7, ILanguageFeaturesService),
  __decorateParam(8, IUserDataProfileService),
  __decorateParam(9, IUserDataProfilesService)
], UnsupportedSettingsRenderer);

var McpSettingsRenderer = class extends Disposable {
  constructor(editor, settingsEditorModel, markerService, uriIdentityService, languageFeaturesService) {
    super();
    this.editor = editor;
    this.settingsEditorModel = settingsEditorModel;
    this.markerService = markerService;
    this.uriIdentityService = uriIdentityService;
    this.renderingDelayer = this._register(new Delayer(200));
    this.codeActions = new ResourceMap((uri4) => this.uriIdentityService.extUri.getComparisonKey(uri4));
    this._register(this.editor.getModel().onDidChangeContent(() => this.delayedRender()));
    this._register(languageFeaturesService.codeActionProvider.register({ pattern: settingsEditorModel.uri.path }, this));
  }
  delayedRender() {
    this.renderingDelayer.trigger(() => this.render());
  }
  render() {
    this.codeActions.clear();
    const markerData = this.generateMarkerData();
    if (markerData.length) {
      this.markerService.changeOne("McpSettingsRenderer", this.settingsEditorModel.uri, markerData);
    } else {
      this.markerService.remove("McpSettingsRenderer", [this.settingsEditorModel.uri]);
    }
  }
  async provideCodeActions(model, range2, context2, token) {
    const actions = [];
    const codeActionsByRange = this.codeActions.get(model.uri);
    if (codeActionsByRange) {
      for (const [codeActionsRange, codeActions] of codeActionsByRange) {
        if (codeActionsRange.containsRange(range2)) {
          actions.push(...codeActions);
        }
      }
    }
    return {
      actions,
      dispose: () => {
      }
    };
  }
  generateMarkerData() {
    const markerData = [];
    if (this.settingsEditorModel.configurationTarget !== 3 /* USER_LOCAL */ && this.settingsEditorModel.configurationTarget !== 4 /* USER_REMOTE */) {
      return markerData;
    }
    for (const settingsGroup of this.settingsEditorModel.settingsGroups) {
      for (const section of settingsGroup.sections) {
        for (const setting of section.settings) {
          if (setting.key === mcpConfigurationSection) {
            const marker = this.generateMcpConfigurationMarker(setting);
            markerData.push(marker);
            const codeActions = this.generateMcpConfigurationCodeActions([marker]);
            this.addCodeActions(setting.range, codeActions);
          }
        }
      }
    }
    return markerData;
  }
  generateMcpConfigurationMarker(setting) {
    const isRemote = this.settingsEditorModel.configurationTarget === 4 /* USER_REMOTE */;
    const message = isRemote ? localize(18169, null) : localize(18170, null);
    return {
      severity: 4 /* Warning */,
      ...setting.range,
      message
    };
  }
  generateMcpConfigurationCodeActions(diagnostics) {
    const isRemote = this.settingsEditorModel.configurationTarget === 4 /* USER_REMOTE */;
    const openConfigLabel = isRemote ? localize(18167, null) : localize(18168, null);
    const commandId = isRemote ? "workbench.mcp.openRemoteUserMcpJson" /* OpenRemoteUserMcp */ : "workbench.mcp.openUserMcpJson" /* OpenUserMcp */;
    return [{
      title: openConfigLabel,
      command: {
        id: commandId,
        title: openConfigLabel
      },
      diagnostics,
      kind: CodeActionKind.QuickFix.value
    }];
  }
  addCodeActions(range2, codeActions) {
    let actions = this.codeActions.get(this.settingsEditorModel.uri);
    if (!actions) {
      actions = [];
      this.codeActions.set(this.settingsEditorModel.uri, actions);
    }
    actions.push([Range2.lift(range2), codeActions]);
  }
  dispose() {
    this.markerService.remove("McpSettingsRenderer", [this.settingsEditorModel.uri]);
    this.codeActions.clear();
    super.dispose();
  }
};

McpSettingsRenderer = __decorateClass([
  __decorateParam(2, IMarkerService),
  __decorateParam(3, IUriIdentityService),
  __decorateParam(4, ILanguageFeaturesService)
], McpSettingsRenderer);

var WorkspaceConfigurationRenderer = class extends Disposable {
  constructor(editor, workspaceSettingsEditorModel, workspaceContextService, markerService) {
    super();
    this.editor = editor;
    this.workspaceSettingsEditorModel = workspaceSettingsEditorModel;
    this.workspaceContextService = workspaceContextService;
    this.markerService = markerService;
    this.renderingDelayer = this._register(new Delayer(200));
    this.decorations = this.editor.createDecorationsCollection();
    this._register(this.editor.getModel().onDidChangeContent(() => this.renderingDelayer.trigger(() => this.render())));
  }
  static {
    this.supportedKeys = ["folders", "tasks", "launch", mcpConfigurationSection, "extensions", "settings", "remoteAuthority", "transient"];
  }
  render() {
    const markerData = [];
    if (this.workspaceContextService.getWorkbenchState() === 3 /* WORKSPACE */ && this.workspaceSettingsEditorModel instanceof WorkspaceConfigurationEditorModel) {
      const ranges = [];
      for (const settingsGroup of this.workspaceSettingsEditorModel.configurationGroups) {
        for (const section of settingsGroup.sections) {
          for (const setting of section.settings) {
            if (!WorkspaceConfigurationRenderer.supportedKeys.includes(setting.key)) {
              markerData.push({
                severity: 1 /* Hint */,
                tags: [1 /* Unnecessary */],
                ...setting.range,
                message: localize(18176, null)
              });
            }
          }
        }
      }
      this.decorations.set(ranges.map((range2) => this.createDecoration(range2)));
    }
    if (markerData.length) {
      this.markerService.changeOne("WorkspaceConfigurationRenderer", this.workspaceSettingsEditorModel.uri, markerData);
    } else {
      this.markerService.remove("WorkspaceConfigurationRenderer", [this.workspaceSettingsEditorModel.uri]);
    }
  }
  static {
    this._DIM_CONFIGURATION_ = ModelDecorationOptions.register({
      description: "dim-configuration",
      stickiness: 1 /* NeverGrowsWhenTypingAtEdges */,
      inlineClassName: "dim-configuration"
    });
  }
  createDecoration(range2) {
    return {
      range: range2,
      options: WorkspaceConfigurationRenderer._DIM_CONFIGURATION_
    };
  }
  dispose() {
    this.markerService.remove("WorkspaceConfigurationRenderer", [this.workspaceSettingsEditorModel.uri]);
    this.decorations.clear();
    super.dispose();
  }
};

WorkspaceConfigurationRenderer = __decorateClass([
  __decorateParam(2, IWorkspaceContextService),
  __decorateParam(3, IMarkerService)
], WorkspaceConfigurationRenderer);
export { UserSettingsRenderer, WorkspaceSettingsRenderer, EditSettingRenderer, SettingHighlighter, UnsupportedSettingsRenderer, McpSettingsRenderer, WorkspaceConfigurationRenderer };
