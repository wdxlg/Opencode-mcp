// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/preferences/common/preferencesContribution.ts
import { Disposable, dispose } from "./module-0012.mjs";
import { DEFAULT_SETTINGS_EDITOR_SETTING, FOLDER_SETTINGS_PATH2, IPreferencesService, USE_SPLIT_JSON_SETTING } from "./module-1294.mjs";
import { SettingsFileSystemProvider } from "./module-1832.mjs";
import { SideBySideEditorInput } from "./module-1095.mjs";
import { localize } from "./module-0001.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IFileService } from "./module-0269.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IUserDataProfileService } from "./module-0997.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IEditorResolverService } from "./module-1113.mjs";
import { ITextEditorService } from "./module-1561.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { workbenchConfigurationNodeBase } from "./module-1112.mjs";


// src/vs/workbench/contrib/preferences/common/preferencesContribution.ts
var PreferencesContribution = class extends Disposable {
  constructor(fileService, instantiationService, preferencesService, userDataProfileService, workspaceService, configurationService, editorResolverService, textEditorService) {
    super();
    this.instantiationService = instantiationService;
    this.preferencesService = preferencesService;
    this.userDataProfileService = userDataProfileService;
    this.workspaceService = workspaceService;
    this.configurationService = configurationService;
    this.editorResolverService = editorResolverService;
    this.textEditorService = textEditorService;
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(USE_SPLIT_JSON_SETTING) || e.affectsConfiguration(DEFAULT_SETTINGS_EDITOR_SETTING)) {
        this.handleSettingsEditorRegistration();
      }
    }));
    this.handleSettingsEditorRegistration();
    const fileSystemProvider = this._register(this.instantiationService.createInstance(SettingsFileSystemProvider));
    this._register(fileService.registerProvider(SettingsFileSystemProvider.SCHEMA, fileSystemProvider));
  }
  static {
    this.ID = "workbench.contrib.preferences";
  }
  handleSettingsEditorRegistration() {
    dispose(this.editorOpeningListener);
    if (!!this.configurationService.getValue(USE_SPLIT_JSON_SETTING) || !!this.configurationService.getValue(DEFAULT_SETTINGS_EDITOR_SETTING)) {
      this.editorOpeningListener = this.editorResolverService.registerEditor(
        "**/settings.json",
        {
          id: SideBySideEditorInput.ID,
          label: localize(18383, null),
          priority: "builtin" /* builtin */
        },
        {},
        {
          createEditorInput: ({ resource, options: options3 }) => {
            if (isEqual2(resource, this.userDataProfileService.currentProfile.settingsResource)) {
              return { editor: this.preferencesService.createSplitJsonEditorInput(3 /* USER_LOCAL */, resource), options: options3 };
            }
            const state = this.workspaceService.getWorkbenchState();
            if (state === 2 /* FOLDER */) {
              const folders = this.workspaceService.getWorkspace().folders;
              if (isEqual2(resource, folders[0].toResource(FOLDER_SETTINGS_PATH2))) {
                return { editor: this.preferencesService.createSplitJsonEditorInput(5 /* WORKSPACE */, resource), options: options3 };
              }
            } else if (state === 3 /* WORKSPACE */) {
              const folders = this.workspaceService.getWorkspace().folders;
              for (const folder of folders) {
                if (isEqual2(resource, folder.toResource(FOLDER_SETTINGS_PATH2))) {
                  return { editor: this.preferencesService.createSplitJsonEditorInput(6 /* WORKSPACE_FOLDER */, resource), options: options3 };
                }
              }
            }
            return { editor: this.textEditorService.createTextEditor({ resource }), options: options3 };
          }
        }
      );
    }
  }
  dispose() {
    dispose(this.editorOpeningListener);
    super.dispose();
  }
};

PreferencesContribution = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IPreferencesService),
  __decorateParam(3, IUserDataProfileService),
  __decorateParam(4, IWorkspaceContextService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, IEditorResolverService),
  __decorateParam(7, ITextEditorService)
], PreferencesContribution);

var registry3 = Registry.as(Extensions4.Configuration);

registry3.registerConfiguration({
  ...workbenchConfigurationNodeBase,
  "properties": {
    "workbench.settings.enableNaturalLanguageSearch": {
      "type": "boolean",
      "description": localize(18379, null),
      "default": true,
      "scope": 4 /* WINDOW */,
      "tags": ["usesOnlineServices"]
    },
    "workbench.settings.settingsSearchTocBehavior": {
      "type": "string",
      "enum": ["hide", "filter"],
      "enumDescriptions": [
        localize(18382, null),
        localize(18381, null)
      ],
      "description": localize(18380, null),
      "default": "filter",
      "scope": 4 /* WINDOW */
    }
  }
});
export { PreferencesContribution, registry3 };
