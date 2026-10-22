// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/preferences/browser/preferences.contribution.ts
import { Registry } from "./module-0090.mjs";
import { EditorExtensions } from "./module-0926.mjs";
import { EditorPaneDescriptor } from "./module-1085.mjs";
import { SettingsEditor2 } from "./module-1830.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { SyncDescriptor } from "./module-0134.mjs";
import { PreferencesEditorInput, SettingsEditor2Input } from "./module-1589.mjs";
import { PreferencesEditor } from "./module-1819.mjs";
import { KeybindingsEditor } from "./module-1816.mjs";
import { KeybindingsEditorInput } from "./module-1588.mjs";
import { Categories } from "./module-0847.mjs";
import { isBoolean, isObject, isString } from "./module-0010.mjs";
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { Action2, MenuId, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { DEFINE_KEYBINDING_EDITOR_CONTRIB_ID, IPreferencesService } from "./module-1293.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { CURRENT_PROFILE_CONTEXT, IUserDataProfileService } from "./module-0998.mjs";
import { ConfigureLanguageBasedSettingsAction } from "./module-1817.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { RemoteNameContext, ResourceContextKey, WorkbenchStateContext } from "./module-0950.mjs";
import { CommandsRegistry, ICommandService } from "./module-0087.mjs";
import { PICK_WORKSPACE_FOLDER_COMMAND_ID } from "./module-1513.mjs";
import { ExplorerFolderContext, ExplorerRootContext } from "./module-1534.mjs";
import { URI } from "./module-0032.mjs";
import { IEditorService } from "./module-0935.mjs";
import { CONTEXT_AI_SETTING_RESULTS_AVAILABLE, CONTEXT_KEYBINDINGS_EDITOR, CONTEXT_KEYBINDINGS_SEARCH_FOCUS, CONTEXT_KEYBINDINGS_SEARCH_HAS_VALUE, CONTEXT_KEYBINDING_FOCUS, CONTEXT_SETTINGS_EDITOR, CONTEXT_SETTINGS_FIRST_ROW_FOCUS, CONTEXT_SETTINGS_JSON_EDITOR, CONTEXT_SETTINGS_ROW_FOCUS, CONTEXT_SETTINGS_SEARCH_FOCUS, CONTEXT_TOC_ROW_FOCUS, CONTEXT_WHEN_FOCUS, KEYBINDINGS_EDITOR_COMMAND_ACCEPT_WHEN, KEYBINDINGS_EDITOR_COMMAND_ADD, KEYBINDINGS_EDITOR_COMMAND_CLEAR_SEARCH_HISTORY, KEYBINDINGS_EDITOR_COMMAND_CLEAR_SEARCH_RESULTS, KEYBINDINGS_EDITOR_COMMAND_COPY, KEYBINDINGS_EDITOR_COMMAND_COPY_COMMAND, KEYBINDINGS_EDITOR_COMMAND_COPY_COMMAND_TITLE, KEYBINDINGS_EDITOR_COMMAND_DEFINE, KEYBINDINGS_EDITOR_COMMAND_DEFINE_WHEN, KEYBINDINGS_EDITOR_COMMAND_FOCUS_KEYBINDINGS, KEYBINDINGS_EDITOR_COMMAND_RECORD_SEARCH_KEYS, KEYBINDINGS_EDITOR_COMMAND_REJECT_WHEN, KEYBINDINGS_EDITOR_COMMAND_REMOVE, KEYBINDINGS_EDITOR_COMMAND_RESET, KEYBINDINGS_EDITOR_COMMAND_SEARCH, KEYBINDINGS_EDITOR_COMMAND_SHOW_SIMILAR, KEYBINDINGS_EDITOR_COMMAND_SORTBY_PRECEDENCE, KEYBINDINGS_EDITOR_SHOW_DEFAULT_KEYBINDINGS, KEYBINDINGS_EDITOR_SHOW_EXTENSION_KEYBINDINGS, KEYBINDINGS_EDITOR_SHOW_USER_KEYBINDINGS, REQUIRE_TRUSTED_WORKSPACE_SETTING_TAG, SETTINGS_EDITOR_COMMAND_CLEAR_SEARCH_RESULTS, SETTINGS_EDITOR_COMMAND_SHOW_CONTEXT_MENU, SETTINGS_EDITOR_COMMAND_TOGGLE_AI_SEARCH } from "./module-1807.mjs";
import { Schemas } from "./module-0033.mjs";
import { Context } from "./module-0696.mjs";
import { preferencesOpenSettingsIcon } from "./module-1810.mjs";
import { KeyChord } from "./module-0019.mjs";
import { KeybindingsRegistry } from "./module-0091.mjs";
import { InputFocusedContext, IsMacNativeContext } from "./module-0635.mjs";
import { isCodeEditor } from "./module-0223.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IExtensionService } from "./module-0889.mjs";
import { IUserDataProfilesService } from "./module-0511.mjs";
import { SettingsEditorModel } from "./module-1591.mjs";
import { UserSettingsRenderer, WorkspaceSettingsRenderer } from "./module-1822.mjs";
import { resolveCommandsContext } from "./module-1529.mjs";
import { IEditorGroupsService } from "./module-0934.mjs";
import { IListService } from "./module-0636.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";
import { PreferencesContribution } from "./module-1809.mjs";
import { registerEditorContribution } from "./module-0097.mjs";


// src/vs/workbench/contrib/preferences/browser/preferences.contribution.ts
var SETTINGS_EDITOR_COMMAND_SEARCH = "settings.action.search";

var SETTINGS_EDITOR_COMMAND_FOCUS_FILE = "settings.action.focusSettingsFile";

var SETTINGS_EDITOR_COMMAND_FOCUS_SETTINGS_FROM_SEARCH = "settings.action.focusSettingsFromSearch";

var SETTINGS_EDITOR_COMMAND_SHOW_PREVIOUS_SEARCH = "settings.action.showPreviousSearch";

var SETTINGS_EDITOR_COMMAND_FOCUS_SETTINGS_FROM_SEARCH_ON_ENTER = "settings.action.focusSettingsFromSearchOnEnter";

var SETTINGS_EDITOR_COMMAND_FOCUS_SEARCH_FROM_SETTINGS = "settings.action.focusSearchFromSettings";

var SETTINGS_EDITOR_COMMAND_FOCUS_SETTINGS_LIST = "settings.action.focusSettingsList";

var SETTINGS_EDITOR_COMMAND_FOCUS_TOC = "settings.action.focusTOC";

var SETTINGS_EDITOR_COMMAND_FOCUS_CONTROL = "settings.action.focusSettingControl";

var SETTINGS_EDITOR_COMMAND_FOCUS_UP = "settings.action.focusLevelUp";

var SETTINGS_EDITOR_COMMAND_SWITCH_TO_JSON = "settings.switchToJSON";

var SETTINGS_EDITOR_COMMAND_FILTER_ONLINE = "settings.filterByOnline";

var SETTINGS_EDITOR_COMMAND_FILTER_UNTRUSTED = "settings.filterUntrusted";

var SETTINGS_COMMAND_OPEN_SETTINGS = "workbench.action.openSettings";

var SETTINGS_COMMAND_FILTER_TELEMETRY = "settings.filterByTelemetry";

Registry.as(EditorExtensions.EditorPane).registerEditorPane(
  EditorPaneDescriptor.create(
    SettingsEditor2,
    SettingsEditor2.ID,
    localize(18139, null)
  ),
  [
    new SyncDescriptor(SettingsEditor2Input)
  ]
);

Registry.as(EditorExtensions.EditorPane).registerEditorPane(
  EditorPaneDescriptor.create(
    PreferencesEditor,
    PreferencesEditor.ID,
    localize(18125, null)
  ),
  [
    new SyncDescriptor(PreferencesEditorInput)
  ]
);

var PreferencesEditorInputSerializer = class {
  canSerialize(editorInput) {
    return true;
  }
  serialize(editorInput) {
    return "";
  }
  deserialize(instantiationService) {
    return instantiationService.createInstance(PreferencesEditorInput);
  }
};

Registry.as(EditorExtensions.EditorPane).registerEditorPane(
  EditorPaneDescriptor.create(
    KeybindingsEditor,
    KeybindingsEditor.ID,
    localize(18101, null)
  ),
  [
    new SyncDescriptor(KeybindingsEditorInput)
  ]
);

var KeybindingsEditorInputSerializer = class {
  canSerialize(editorInput) {
    return true;
  }
  serialize(editorInput) {
    return "";
  }
  deserialize(instantiationService) {
    return instantiationService.createInstance(KeybindingsEditorInput);
  }
};

var SettingsEditor2InputSerializer = class {
  canSerialize(editorInput) {
    return true;
  }
  serialize(input) {
    return "";
  }
  deserialize(instantiationService) {
    return instantiationService.createInstance(SettingsEditor2Input);
  }
};

Registry.as(EditorExtensions.EditorFactory).registerEditorSerializer(PreferencesEditorInput.ID, PreferencesEditorInputSerializer);

Registry.as(EditorExtensions.EditorFactory).registerEditorSerializer(KeybindingsEditorInput.ID, KeybindingsEditorInputSerializer);

Registry.as(EditorExtensions.EditorFactory).registerEditorSerializer(SettingsEditor2Input.ID, SettingsEditor2InputSerializer);

var OPEN_USER_SETTINGS_UI_TITLE = localize2(18119, "Open Settings (UI)");

var OPEN_USER_SETTINGS_JSON_TITLE = localize2(18121, "Open User Settings (JSON)");

var OPEN_APPLICATION_SETTINGS_JSON_TITLE = localize2(18108, "Open Application Settings (JSON)");

var category = Categories.Preferences;

function sanitizeBoolean(arg) {
  return isBoolean(arg) ? arg : void 0;
}

function sanitizeString(arg) {
  return isString(arg) ? arg : void 0;
}

function sanitizeOpenSettingsArgs(args2) {
  if (!isObject(args2)) {
    args2 = {};
  }
  let sanitizedObject = {
    focusSearch: sanitizeBoolean(args2?.focusSearch),
    openToSide: sanitizeBoolean(args2?.openToSide),
    query: sanitizeString(args2?.query)
  };
  if (isString(args2?.revealSetting?.key)) {
    sanitizedObject = {
      ...sanitizedObject,
      revealSetting: {
        key: args2.revealSetting.key,
        edit: sanitizeBoolean(args2.revealSetting?.edit)
      }
    };
  }
  return sanitizedObject;
}

var PreferencesActionsContribution = class extends Disposable {
  constructor(environmentService, userDataProfileService, preferencesService, workspaceContextService, labelService, extensionService, userDataProfilesService) {
    super();
    this.environmentService = environmentService;
    this.userDataProfileService = userDataProfileService;
    this.preferencesService = preferencesService;
    this.workspaceContextService = workspaceContextService;
    this.labelService = labelService;
    this.extensionService = extensionService;
    this.userDataProfilesService = userDataProfilesService;
    this.registerSettingsActions();
    this.registerKeybindingsActions();
    this.updatePreferencesEditorMenuItem();
    this._register(workspaceContextService.onDidChangeWorkbenchState(() => this.updatePreferencesEditorMenuItem()));
    this._register(workspaceContextService.onDidChangeWorkspaceFolders(() => this.updatePreferencesEditorMenuItemForWorkspaceFolders()));
  }
  static {
    this.ID = "workbench.contrib.preferencesActions";
  }
  registerSettingsActions() {
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: SETTINGS_COMMAND_OPEN_SETTINGS,
          title: {
            ...localize2(18126, "Settings"),
            mnemonicTitle: localize(18104, null)
          },
          keybinding: {
            weight: 200 /* WorkbenchContrib */,
            when: null,
            primary: 2048 /* CtrlCmd */ | 87 /* Comma */
          },
          menu: [{
            id: MenuId.GlobalActivity,
            group: "2_configuration",
            order: 2
          }, {
            id: MenuId.MenubarPreferencesMenu,
            group: "2_configuration",
            order: 2
          }]
        });
      }
      run(accessor, args2) {
        const opts = typeof args2 === "string" ? { query: args2 } : sanitizeOpenSettingsArgs(args2);
        return accessor.get(IPreferencesService).openSettings({ ...opts });
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: "workbench.action.openSettings2",
          title: localize2(18119, "Open Settings (UI)"),
          category,
          f1: true
        });
      }
      run(accessor, args2) {
        args2 = sanitizeOpenSettingsArgs(args2);
        return accessor.get(IPreferencesService).openSettings({ jsonEditor: false, ...args2 });
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: "workbench.action.openSettingsJson",
          title: OPEN_USER_SETTINGS_JSON_TITLE,
          metadata: {
            description: localize2(18143, "Opens the JSON file containing the current user profile settings")
          },
          category,
          f1: true
        });
      }
      run(accessor, args2) {
        args2 = sanitizeOpenSettingsArgs(args2);
        return accessor.get(IPreferencesService).openSettings({ jsonEditor: true, ...args2 });
      }
    }));
    const that = this;
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: "workbench.action.openApplicationSettingsJson",
          title: OPEN_APPLICATION_SETTINGS_JSON_TITLE,
          category,
          menu: {
            id: MenuId.CommandPalette,
            when: ContextKeyExpr.notEquals(CURRENT_PROFILE_CONTEXT.key, that.userDataProfilesService.defaultProfile.id)
          }
        });
      }
      run(accessor, args2) {
        args2 = sanitizeOpenSettingsArgs(args2);
        return accessor.get(IPreferencesService).openApplicationSettings({ jsonEditor: true, ...args2 });
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: "workbench.action.openGlobalSettings",
          title: localize2(18115, "Open User Settings"),
          category,
          f1: true
        });
      }
      run(accessor, args2) {
        args2 = sanitizeOpenSettingsArgs(args2);
        return accessor.get(IPreferencesService).openUserSettings(args2);
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: "workbench.action.openRawDefaultSettings",
          title: localize2(18116, "Open Default Settings (JSON)"),
          category,
          f1: true
        });
      }
      run(accessor) {
        return accessor.get(IPreferencesService).openRawDefaultSettings();
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: ConfigureLanguageBasedSettingsAction.ID,
          title: ConfigureLanguageBasedSettingsAction.LABEL,
          category,
          f1: true
        });
      }
      run(accessor) {
        return accessor.get(IInstantiationService).createInstance(ConfigureLanguageBasedSettingsAction, ConfigureLanguageBasedSettingsAction.ID, ConfigureLanguageBasedSettingsAction.LABEL.value).run();
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: "workbench.action.openWorkspaceSettings",
          title: localize2(18122, "Open Workspace Settings"),
          category,
          menu: {
            id: MenuId.CommandPalette,
            when: WorkbenchStateContext.notEqualsTo("empty")
          }
        });
      }
      run(accessor, args2) {
        args2 = typeof args2 === "string" ? { query: args2 } : sanitizeOpenSettingsArgs(args2);
        return accessor.get(IPreferencesService).openWorkspaceSettings(args2);
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: "workbench.action.openAccessibilitySettings",
          title: localize2(18107, "Open Accessibility Settings"),
          category,
          menu: {
            id: MenuId.CommandPalette,
            when: WorkbenchStateContext.notEqualsTo("empty")
          }
        });
      }
      async run(accessor) {
        await accessor.get(IPreferencesService).openSettings({ jsonEditor: false, query: "@tag:accessibility" });
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: "workbench.action.openWorkspaceSettingsFile",
          title: localize2(18123, "Open Workspace Settings (JSON)"),
          category,
          menu: {
            id: MenuId.CommandPalette,
            when: WorkbenchStateContext.notEqualsTo("empty")
          }
        });
      }
      run(accessor, args2) {
        args2 = sanitizeOpenSettingsArgs(args2);
        return accessor.get(IPreferencesService).openWorkspaceSettings({ jsonEditor: true, ...args2 });
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: "workbench.action.openFolderSettings",
          title: localize2(18110, "Open Folder Settings"),
          category,
          menu: {
            id: MenuId.CommandPalette,
            when: WorkbenchStateContext.isEqualTo("workspace")
          }
        });
      }
      async run(accessor, args2) {
        const commandService = accessor.get(ICommandService);
        const preferencesService = accessor.get(IPreferencesService);
        const workspaceFolder = await commandService.executeCommand(PICK_WORKSPACE_FOLDER_COMMAND_ID);
        if (workspaceFolder) {
          args2 = sanitizeOpenSettingsArgs(args2);
          await preferencesService.openFolderSettings({ folderUri: workspaceFolder.uri, ...args2 });
        }
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: "workbench.action.openFolderSettingsFile",
          title: localize2(18112, "Open Folder Settings (JSON)"),
          category,
          menu: {
            id: MenuId.CommandPalette,
            when: WorkbenchStateContext.isEqualTo("workspace")
          }
        });
      }
      async run(accessor, args2) {
        const commandService = accessor.get(ICommandService);
        const preferencesService = accessor.get(IPreferencesService);
        const workspaceFolder = await commandService.executeCommand(PICK_WORKSPACE_FOLDER_COMMAND_ID);
        if (workspaceFolder) {
          args2 = sanitizeOpenSettingsArgs(args2);
          await preferencesService.openFolderSettings({ folderUri: workspaceFolder.uri, jsonEditor: true, ...args2 });
        }
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: "_workbench.action.openFolderSettings",
          title: localize(18111, null),
          category,
          menu: {
            id: MenuId.ExplorerContext,
            group: "2_workspace",
            order: 20,
            when: ContextKeyExpr.and(ExplorerRootContext, ExplorerFolderContext)
          }
        });
      }
      async run(accessor, resource) {
        if (URI.isUri(resource)) {
          await accessor.get(IPreferencesService).openFolderSettings({ folderUri: resource });
        } else {
          const commandService = accessor.get(ICommandService);
          const preferencesService = accessor.get(IPreferencesService);
          const workspaceFolder = await commandService.executeCommand(PICK_WORKSPACE_FOLDER_COMMAND_ID);
          if (workspaceFolder) {
            await preferencesService.openFolderSettings({ folderUri: workspaceFolder.uri });
          }
        }
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: SETTINGS_EDITOR_COMMAND_FILTER_ONLINE,
          title: localize(18103, null),
          menu: {
            id: MenuId.MenubarPreferencesMenu,
            group: "3_settings",
            order: 1
          }
        });
      }
      run(accessor) {
        const editorPane = accessor.get(IEditorService).activeEditorPane;
        if (editorPane instanceof SettingsEditor2) {
          editorPane.focusSearch(`@tag:usesOnlineServices`);
        } else {
          accessor.get(IPreferencesService).openSettings({ jsonEditor: false, query: "@tag:usesOnlineServices" });
        }
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: SETTINGS_EDITOR_COMMAND_TOGGLE_AI_SEARCH,
          precondition: CONTEXT_SETTINGS_EDITOR,
          keybinding: {
            primary: 2048 /* CtrlCmd */ | 39 /* KeyI */,
            weight: 100 /* EditorContrib */,
            when: CONTEXT_AI_SETTING_RESULTS_AVAILABLE
          },
          category,
          f1: true,
          title: localize2(18138, "Toggle AI Settings Search")
        });
      }
      run(accessor) {
        const editorPane = accessor.get(IEditorService).activeEditorPane;
        if (editorPane instanceof SettingsEditor2) {
          editorPane.toggleAiSearch();
        }
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: SETTINGS_EDITOR_COMMAND_FILTER_UNTRUSTED,
          title: localize2(18100, "Show untrusted workspace settings")
        });
      }
      run(accessor) {
        accessor.get(IPreferencesService).openWorkspaceSettings({ jsonEditor: false, query: `@tag:${REQUIRE_TRUSTED_WORKSPACE_SETTING_TAG}` });
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: SETTINGS_COMMAND_FILTER_TELEMETRY,
          title: localize(18105, null)
        });
      }
      run(accessor) {
        const editorPane = accessor.get(IEditorService).activeEditorPane;
        if (editorPane instanceof SettingsEditor2) {
          editorPane.focusSearch(`@tag:telemetry`);
        } else {
          accessor.get(IPreferencesService).openSettings({ jsonEditor: false, query: "@tag:telemetry" });
        }
      }
    }));
    this.registerSettingsEditorActions();
    this.extensionService.whenInstalledExtensionsRegistered().then(() => {
      const remoteAuthority = this.environmentService.remoteAuthority;
      const hostLabel = this.labelService.getHostLabel(Schemas.vscodeRemote, remoteAuthority) || remoteAuthority;
      this._register(registerAction2(class extends Action2 {
        constructor() {
          super({
            id: "workbench.action.openRemoteSettings",
            title: localize2(18117, "Open Remote Settings ({0})", hostLabel),
            category,
            menu: {
              id: MenuId.CommandPalette,
              when: RemoteNameContext.notEqualsTo("")
            }
          });
        }
        run(accessor, args2) {
          args2 = sanitizeOpenSettingsArgs(args2);
          return accessor.get(IPreferencesService).openRemoteSettings(args2);
        }
      }));
      this._register(registerAction2(class extends Action2 {
        constructor() {
          super({
            id: "workbench.action.openRemoteSettingsFile",
            title: localize2(18118, "Open Remote Settings (JSON) ({0})", hostLabel),
            category,
            menu: {
              id: MenuId.CommandPalette,
              when: RemoteNameContext.notEqualsTo("")
            }
          });
        }
        run(accessor, args2) {
          args2 = sanitizeOpenSettingsArgs(args2);
          return accessor.get(IPreferencesService).openRemoteSettings({ jsonEditor: true, ...args2 });
        }
      }));
    });
  }
  registerSettingsEditorActions() {
    function getPreferencesEditor(accessor) {
      const activeEditorPane = accessor.get(IEditorService).activeEditorPane;
      if (activeEditorPane instanceof SettingsEditor2) {
        return activeEditorPane;
      }
      return null;
    }
    function settingsEditorFocusSearch(accessor) {
      const preferencesEditor = getPreferencesEditor(accessor);
      preferencesEditor?.focusSearch();
    }
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: SETTINGS_EDITOR_COMMAND_SEARCH,
          precondition: CONTEXT_SETTINGS_EDITOR,
          keybinding: {
            primary: 2048 /* CtrlCmd */ | 36 /* KeyF */,
            weight: 100 /* EditorContrib */,
            when: null
          },
          category,
          f1: true,
          title: localize2(18130, "Focus Settings Search")
        });
      }
      run(accessor) {
        settingsEditorFocusSearch(accessor);
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: SETTINGS_EDITOR_COMMAND_CLEAR_SEARCH_RESULTS,
          precondition: CONTEXT_SETTINGS_EDITOR,
          keybinding: {
            primary: 9 /* Escape */,
            weight: 100 /* EditorContrib */,
            when: CONTEXT_SETTINGS_SEARCH_FOCUS
          },
          category,
          f1: true,
          title: localize2(18127, "Clear Settings Search Results")
        });
      }
      run(accessor) {
        const preferencesEditor = getPreferencesEditor(accessor);
        preferencesEditor?.clearSearchResults();
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: SETTINGS_EDITOR_COMMAND_FOCUS_FILE,
          precondition: ContextKeyExpr.and(CONTEXT_SETTINGS_SEARCH_FOCUS, Context.Visible.toNegated()),
          title: localize(18128, null)
        });
      }
      run(accessor) {
        const preferencesEditor = getPreferencesEditor(accessor);
        preferencesEditor?.navigateSearchHistoryNextOrFocusSettings();
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: SETTINGS_EDITOR_COMMAND_FOCUS_SETTINGS_FROM_SEARCH,
          precondition: ContextKeyExpr.and(CONTEXT_SETTINGS_SEARCH_FOCUS, Context.Visible.toNegated()),
          keybinding: {
            primary: 18 /* DownArrow */,
            weight: 200 /* WorkbenchContrib */ + 1,
            when: ContextKeyExpr.and(CONTEXT_SETTINGS_SEARCH_FOCUS, Context.Visible.toNegated())
          },
          title: localize(18128, null)
        });
      }
      run(accessor) {
        const preferencesEditor = getPreferencesEditor(accessor);
        preferencesEditor?.navigateSearchHistoryNextOrFocusSettings();
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: SETTINGS_EDITOR_COMMAND_SHOW_PREVIOUS_SEARCH,
          precondition: ContextKeyExpr.and(CONTEXT_SETTINGS_SEARCH_FOCUS, Context.Visible.toNegated()),
          keybinding: {
            primary: 16 /* UpArrow */,
            weight: 200 /* WorkbenchContrib */ + 1,
            when: ContextKeyExpr.and(CONTEXT_SETTINGS_SEARCH_FOCUS, Context.Visible.toNegated())
          },
          title: localize(18137, null)
        });
      }
      run(accessor) {
        const preferencesEditor = getPreferencesEditor(accessor);
        preferencesEditor?.navigateSearchHistoryPrevious();
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: SETTINGS_EDITOR_COMMAND_FOCUS_SETTINGS_FROM_SEARCH_ON_ENTER,
          precondition: ContextKeyExpr.and(CONTEXT_SETTINGS_SEARCH_FOCUS, Context.Visible.toNegated()),
          keybinding: {
            primary: 3 /* Enter */,
            weight: 200 /* WorkbenchContrib */,
            when: ContextKeyExpr.and(CONTEXT_SETTINGS_SEARCH_FOCUS, Context.Visible.toNegated())
          },
          title: localize(18133, null)
        });
      }
      run(accessor) {
        const preferencesEditor = getPreferencesEditor(accessor);
        preferencesEditor?.focusFirstSettingFromSearch();
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: SETTINGS_EDITOR_COMMAND_FOCUS_SEARCH_FROM_SETTINGS,
          precondition: ContextKeyExpr.and(CONTEXT_SETTINGS_EDITOR, CONTEXT_SETTINGS_ROW_FOCUS, CONTEXT_SETTINGS_FIRST_ROW_FOCUS),
          keybinding: {
            primary: 16 /* UpArrow */,
            // Win over the list's own `list.focusUp` command so the first row moves focus back to search.
            weight: 200 /* WorkbenchContrib */ + 1,
            when: null
          },
          title: localize(18131, null)
        });
      }
      run(accessor) {
        const preferencesEditor = getPreferencesEditor(accessor);
        preferencesEditor?.focusSearch();
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: SETTINGS_EDITOR_COMMAND_FOCUS_SETTINGS_LIST,
          precondition: ContextKeyExpr.and(CONTEXT_SETTINGS_EDITOR, CONTEXT_TOC_ROW_FOCUS),
          keybinding: {
            primary: 3 /* Enter */,
            weight: 200 /* WorkbenchContrib */,
            when: null
          },
          title: localize(18134, null)
        });
      }
      run(accessor) {
        const preferencesEditor = getPreferencesEditor(accessor);
        if (preferencesEditor instanceof SettingsEditor2) {
          preferencesEditor.focusSettings();
        }
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: SETTINGS_EDITOR_COMMAND_FOCUS_TOC,
          precondition: CONTEXT_SETTINGS_EDITOR,
          f1: true,
          keybinding: [
            {
              primary: 15 /* LeftArrow */,
              weight: 200 /* WorkbenchContrib */,
              when: CONTEXT_SETTINGS_ROW_FOCUS
            }
          ],
          category,
          title: localize2(18135, "Focus Settings Table of Contents")
        });
      }
      run(accessor) {
        const preferencesEditor = getPreferencesEditor(accessor);
        if (!(preferencesEditor instanceof SettingsEditor2)) {
          return;
        }
        preferencesEditor.focusTOC();
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: SETTINGS_EDITOR_COMMAND_FOCUS_CONTROL,
          precondition: ContextKeyExpr.and(CONTEXT_SETTINGS_EDITOR, CONTEXT_SETTINGS_ROW_FOCUS),
          keybinding: {
            primary: 3 /* Enter */,
            weight: 200 /* WorkbenchContrib */
          },
          title: localize(18132, null)
        });
      }
      run(accessor) {
        const preferencesEditor = getPreferencesEditor(accessor);
        if (!(preferencesEditor instanceof SettingsEditor2)) {
          return;
        }
        const activeElement = preferencesEditor.getContainer()?.ownerDocument.activeElement;
        if (activeElement?.classList.contains("monaco-list")) {
          preferencesEditor.focusSettings(true);
        }
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: SETTINGS_EDITOR_COMMAND_SHOW_CONTEXT_MENU,
          precondition: CONTEXT_SETTINGS_EDITOR,
          keybinding: {
            primary: 1024 /* Shift */ | 67 /* F9 */,
            weight: 200 /* WorkbenchContrib */,
            when: null
          },
          f1: true,
          category,
          title: localize2(18136, "Show Setting Context Menu")
        });
      }
      run(accessor) {
        const preferencesEditor = getPreferencesEditor(accessor);
        if (preferencesEditor instanceof SettingsEditor2) {
          preferencesEditor.showContextMenu();
        }
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: SETTINGS_EDITOR_COMMAND_FOCUS_UP,
          precondition: ContextKeyExpr.and(CONTEXT_SETTINGS_EDITOR, CONTEXT_SETTINGS_SEARCH_FOCUS.toNegated(), CONTEXT_SETTINGS_JSON_EDITOR.toNegated()),
          keybinding: {
            primary: 9 /* Escape */,
            weight: 200 /* WorkbenchContrib */,
            when: null
          },
          f1: true,
          category,
          title: localize2(18129, "Move Focus Up One Level")
        });
      }
      run(accessor) {
        const preferencesEditor = getPreferencesEditor(accessor);
        if (!(preferencesEditor instanceof SettingsEditor2)) {
          return;
        }
        if (preferencesEditor.currentFocusContext === 3 /* SettingControl */) {
          preferencesEditor.focusSettings();
        } else if (preferencesEditor.currentFocusContext === 2 /* SettingTree */) {
          preferencesEditor.focusTOC();
        } else if (preferencesEditor.currentFocusContext === 1 /* TableOfContents */) {
          preferencesEditor.focusSearch();
        }
      }
    }));
  }
  registerKeybindingsActions() {
    const that = this;
    const category9 = localize2(18124, "Preferences");
    const id2 = "workbench.action.openGlobalKeybindings";
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: id2,
          title: localize2(18113, "Open Keyboard Shortcuts"),
          shortTitle: localize(18102, null),
          category: category9,
          icon: preferencesOpenSettingsIcon,
          keybinding: {
            when: null,
            weight: 200 /* WorkbenchContrib */,
            primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 49 /* KeyS */)
          },
          menu: [
            { id: MenuId.CommandPalette },
            {
              id: MenuId.EditorTitle,
              when: ResourceContextKey.Resource.isEqualTo(that.userDataProfileService.currentProfile.keybindingsResource.toString()),
              group: "navigation",
              order: 1
            },
            {
              id: MenuId.ModalEditorEditorTitle,
              when: ResourceContextKey.Resource.isEqualTo(that.userDataProfileService.currentProfile.keybindingsResource.toString()),
              group: "navigation",
              order: 1
            },
            {
              id: MenuId.GlobalActivity,
              group: "2_configuration",
              order: 4
            }
          ]
        });
      }
      run(accessor, ...args2) {
        const query = typeof args2[0] === "string" ? args2[0] : void 0;
        const groupId = getEditorGroupFromArguments(accessor, args2)?.id;
        return accessor.get(IPreferencesService).openGlobalKeybindingSettings(false, { query, groupId });
      }
    }));
    this._register(MenuRegistry.appendMenuItem(MenuId.MenubarPreferencesMenu, {
      command: {
        id: id2,
        title: localize(18102, null)
      },
      group: "2_configuration",
      order: 4
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: "workbench.action.openDefaultKeybindingsFile",
          title: localize2(18109, "Open Default Keyboard Shortcuts (JSON)"),
          category: category9,
          menu: { id: MenuId.CommandPalette }
        });
      }
      run(accessor) {
        return accessor.get(IPreferencesService).openDefaultKeybindingsFile();
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: "workbench.action.openGlobalKeybindingsFile",
          title: localize2(18114, "Open Keyboard Shortcuts (JSON)"),
          category: category9,
          icon: preferencesOpenSettingsIcon,
          menu: [
            { id: MenuId.CommandPalette },
            {
              id: MenuId.EditorTitle,
              when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR),
              group: "navigation"
            },
            {
              id: MenuId.ModalEditorEditorTitle,
              when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR),
              group: "navigation"
            }
          ]
        });
      }
      run(accessor, ...args2) {
        const groupId = getEditorGroupFromArguments(accessor, args2)?.id;
        return accessor.get(IPreferencesService).openGlobalKeybindingSettings(true, { groupId });
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: KEYBINDINGS_EDITOR_SHOW_DEFAULT_KEYBINDINGS,
          title: localize2(18140, "Show System Keybindings"),
          menu: [
            {
              id: MenuId.EditorTitle,
              when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR),
              group: "1_keyboard_preferences_actions"
            }
          ]
        });
      }
      run(accessor, ...args2) {
        const group2 = getEditorGroupFromArguments(accessor, args2);
        const editorPane = group2?.activeEditorPane;
        if (editorPane instanceof KeybindingsEditor) {
          editorPane.search("@source:system");
        }
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: KEYBINDINGS_EDITOR_SHOW_EXTENSION_KEYBINDINGS,
          title: localize2(18141, "Show Extension Keybindings"),
          menu: [
            {
              id: MenuId.EditorTitle,
              when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR),
              group: "1_keyboard_preferences_actions"
            }
          ]
        });
      }
      run(accessor, ...args2) {
        const group2 = getEditorGroupFromArguments(accessor, args2);
        const editorPane = group2?.activeEditorPane;
        if (editorPane instanceof KeybindingsEditor) {
          editorPane.search("@source:extension");
        }
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: KEYBINDINGS_EDITOR_SHOW_USER_KEYBINDINGS,
          title: localize2(18142, "Show User Keybindings"),
          menu: [
            {
              id: MenuId.EditorTitle,
              when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR),
              group: "1_keyboard_preferences_actions"
            }
          ]
        });
      }
      run(accessor, ...args2) {
        const group2 = getEditorGroupFromArguments(accessor, args2);
        const editorPane = group2?.activeEditorPane;
        if (editorPane instanceof KeybindingsEditor) {
          editorPane.search("@source:user");
        }
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: KEYBINDINGS_EDITOR_COMMAND_CLEAR_SEARCH_RESULTS,
          title: localize(18097, null),
          keybinding: {
            weight: 200 /* WorkbenchContrib */,
            when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR, CONTEXT_KEYBINDINGS_SEARCH_FOCUS, CONTEXT_KEYBINDINGS_SEARCH_HAS_VALUE),
            primary: 9 /* Escape */
          }
        });
      }
      run(accessor) {
        const editorPane = accessor.get(IEditorService).activeEditorPane;
        if (editorPane instanceof KeybindingsEditor) {
          editorPane.clearSearchResults();
        }
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: KEYBINDINGS_EDITOR_COMMAND_CLEAR_SEARCH_HISTORY,
          title: localize(18098, null),
          category: category9,
          menu: [
            {
              id: MenuId.CommandPalette,
              when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR)
            }
          ]
        });
      }
      run(accessor) {
        const editorPane = accessor.get(IEditorService).activeEditorPane;
        if (editorPane instanceof KeybindingsEditor) {
          editorPane.clearKeyboardShortcutSearchHistory();
        }
      }
    }));
    this.registerKeybindingEditorActions();
  }
  registerKeybindingEditorActions() {
    const that = this;
    KeybindingsRegistry.registerCommandAndKeybindingRule({
      id: KEYBINDINGS_EDITOR_COMMAND_DEFINE,
      weight: 200 /* WorkbenchContrib */,
      when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR, CONTEXT_KEYBINDING_FOCUS, CONTEXT_WHEN_FOCUS.toNegated()),
      primary: 3 /* Enter */,
      handler: (accessor, args2) => {
        const editorPane = accessor.get(IEditorService).activeEditorPane;
        if (editorPane instanceof KeybindingsEditor) {
          editorPane.defineKeybinding(editorPane.activeKeybindingEntry, false);
        }
      }
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
      id: KEYBINDINGS_EDITOR_COMMAND_ADD,
      weight: 200 /* WorkbenchContrib */,
      when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR, CONTEXT_KEYBINDING_FOCUS),
      primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 31 /* KeyA */),
      handler: (accessor, args2) => {
        const editorPane = accessor.get(IEditorService).activeEditorPane;
        if (editorPane instanceof KeybindingsEditor) {
          editorPane.defineKeybinding(editorPane.activeKeybindingEntry, true);
        }
      }
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
      id: KEYBINDINGS_EDITOR_COMMAND_DEFINE_WHEN,
      weight: 200 /* WorkbenchContrib */,
      when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR, CONTEXT_KEYBINDING_FOCUS),
      primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 35 /* KeyE */),
      handler: (accessor, args2) => {
        const editorPane = accessor.get(IEditorService).activeEditorPane;
        if (editorPane instanceof KeybindingsEditor && editorPane.activeKeybindingEntry.keybindingItem.keybinding) {
          editorPane.defineWhenExpression(editorPane.activeKeybindingEntry);
        }
      }
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
      id: KEYBINDINGS_EDITOR_COMMAND_REMOVE,
      weight: 200 /* WorkbenchContrib */,
      when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR, CONTEXT_KEYBINDING_FOCUS, InputFocusedContext.toNegated()),
      primary: 20 /* Delete */,
      mac: {
        primary: 2048 /* CtrlCmd */ | 1 /* Backspace */
      },
      handler: (accessor, args2) => {
        const editorPane = accessor.get(IEditorService).activeEditorPane;
        if (editorPane instanceof KeybindingsEditor) {
          editorPane.removeKeybinding(editorPane.activeKeybindingEntry);
        }
      }
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
      id: KEYBINDINGS_EDITOR_COMMAND_RESET,
      weight: 200 /* WorkbenchContrib */,
      when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR, CONTEXT_KEYBINDING_FOCUS),
      primary: 0,
      handler: (accessor, args2) => {
        const editorPane = accessor.get(IEditorService).activeEditorPane;
        if (editorPane instanceof KeybindingsEditor) {
          editorPane.resetKeybinding(editorPane.activeKeybindingEntry);
        }
      }
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
      id: KEYBINDINGS_EDITOR_COMMAND_SEARCH,
      weight: 200 /* WorkbenchContrib */,
      when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR),
      primary: 2048 /* CtrlCmd */ | 36 /* KeyF */,
      handler: (accessor, args2) => {
        const editorPane = accessor.get(IEditorService).activeEditorPane;
        if (editorPane instanceof KeybindingsEditor) {
          editorPane.focusSearch();
        }
      }
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
      id: KEYBINDINGS_EDITOR_COMMAND_RECORD_SEARCH_KEYS,
      weight: 200 /* WorkbenchContrib */,
      when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR, CONTEXT_KEYBINDINGS_SEARCH_FOCUS),
      primary: 512 /* Alt */ | 41 /* KeyK */,
      mac: { primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 41 /* KeyK */ },
      handler: (accessor, args2) => {
        const editorPane = accessor.get(IEditorService).activeEditorPane;
        if (editorPane instanceof KeybindingsEditor) {
          editorPane.recordSearchKeys();
        }
      }
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
      id: KEYBINDINGS_EDITOR_COMMAND_SORTBY_PRECEDENCE,
      weight: 200 /* WorkbenchContrib */,
      when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR),
      primary: 512 /* Alt */ | 46 /* KeyP */,
      mac: { primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 46 /* KeyP */ },
      handler: (accessor, args2) => {
        const editorPane = accessor.get(IEditorService).activeEditorPane;
        if (editorPane instanceof KeybindingsEditor) {
          editorPane.toggleSortByPrecedence();
        }
      }
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
      id: KEYBINDINGS_EDITOR_COMMAND_SHOW_SIMILAR,
      weight: 200 /* WorkbenchContrib */,
      when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR, CONTEXT_KEYBINDING_FOCUS),
      primary: 0,
      handler: (accessor, args2) => {
        const editorPane = accessor.get(IEditorService).activeEditorPane;
        if (editorPane instanceof KeybindingsEditor) {
          editorPane.showSimilarKeybindings(editorPane.activeKeybindingEntry);
        }
      }
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
      id: KEYBINDINGS_EDITOR_COMMAND_COPY,
      weight: 200 /* WorkbenchContrib */,
      when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR, CONTEXT_KEYBINDING_FOCUS, CONTEXT_WHEN_FOCUS.negate()),
      primary: 2048 /* CtrlCmd */ | 33 /* KeyC */,
      handler: async (accessor, args2) => {
        const editorPane = accessor.get(IEditorService).activeEditorPane;
        if (editorPane instanceof KeybindingsEditor) {
          await editorPane.copyKeybinding(editorPane.activeKeybindingEntry);
        }
      }
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
      id: KEYBINDINGS_EDITOR_COMMAND_COPY_COMMAND,
      weight: 200 /* WorkbenchContrib */,
      when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR, CONTEXT_KEYBINDING_FOCUS),
      primary: 0,
      handler: async (accessor, args2) => {
        const editorPane = accessor.get(IEditorService).activeEditorPane;
        if (editorPane instanceof KeybindingsEditor) {
          await editorPane.copyKeybindingCommand(editorPane.activeKeybindingEntry);
        }
      }
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
      id: KEYBINDINGS_EDITOR_COMMAND_COPY_COMMAND_TITLE,
      weight: 200 /* WorkbenchContrib */,
      when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR, CONTEXT_KEYBINDING_FOCUS),
      primary: 0,
      handler: async (accessor, args2) => {
        const editorPane = accessor.get(IEditorService).activeEditorPane;
        if (editorPane instanceof KeybindingsEditor) {
          await editorPane.copyKeybindingCommandTitle(editorPane.activeKeybindingEntry);
        }
      }
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
      id: KEYBINDINGS_EDITOR_COMMAND_FOCUS_KEYBINDINGS,
      weight: 200 /* WorkbenchContrib */,
      when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR, CONTEXT_KEYBINDINGS_SEARCH_FOCUS),
      primary: 2048 /* CtrlCmd */ | 18 /* DownArrow */,
      handler: (accessor, args2) => {
        const editorPane = accessor.get(IEditorService).activeEditorPane;
        if (editorPane instanceof KeybindingsEditor) {
          editorPane.focusKeybindings();
        }
      }
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
      id: KEYBINDINGS_EDITOR_COMMAND_REJECT_WHEN,
      weight: 200 /* WorkbenchContrib */,
      when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR, CONTEXT_WHEN_FOCUS, Context.Visible.toNegated()),
      primary: 9 /* Escape */,
      handler: async (accessor, args2) => {
        const editorPane = accessor.get(IEditorService).activeEditorPane;
        if (editorPane instanceof KeybindingsEditor) {
          editorPane.rejectWhenExpression(editorPane.activeKeybindingEntry);
        }
      }
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
      id: KEYBINDINGS_EDITOR_COMMAND_ACCEPT_WHEN,
      weight: 200 /* WorkbenchContrib */,
      when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR, CONTEXT_WHEN_FOCUS, Context.Visible.toNegated()),
      primary: 3 /* Enter */,
      handler: async (accessor, args2) => {
        const editorPane = accessor.get(IEditorService).activeEditorPane;
        if (editorPane instanceof KeybindingsEditor) {
          editorPane.acceptWhenExpression(editorPane.activeKeybindingEntry);
        }
      }
    });
    const profileScopedActionDisposables = this._register(new DisposableStore());
    const registerProfileScopedActions = () => {
      profileScopedActionDisposables.clear();
      profileScopedActionDisposables.add(registerAction2(class DefineKeybindingAction extends Action2 {
        constructor() {
          const when = ResourceContextKey.Resource.isEqualTo(that.userDataProfileService.currentProfile.keybindingsResource.toString());
          super({
            id: "editor.action.defineKeybinding",
            title: localize2(18099, "Define Keybinding"),
            f1: true,
            precondition: when,
            keybinding: {
              weight: 200 /* WorkbenchContrib */,
              when,
              primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 41 /* KeyK */)
            },
            menu: {
              id: MenuId.EditorContent,
              when
            }
          });
        }
        async run(accessor) {
          const codeEditor = accessor.get(IEditorService).activeTextEditorControl;
          if (isCodeEditor(codeEditor)) {
            codeEditor.getContribution(DEFINE_KEYBINDING_EDITOR_CONTRIB_ID)?.showDefineKeybindingWidget();
          }
        }
      }));
    };
    registerProfileScopedActions();
    this._register(this.userDataProfileService.onDidChangeCurrentProfile(() => registerProfileScopedActions()));
  }
  updatePreferencesEditorMenuItem() {
    const commandId = "_workbench.openWorkspaceSettingsEditor";
    if (this.workspaceContextService.getWorkbenchState() === 3 /* WORKSPACE */ && !CommandsRegistry.getCommand(commandId)) {
      CommandsRegistry.registerCommand(commandId, () => this.preferencesService.openWorkspaceSettings({ jsonEditor: false }));
      const when = ContextKeyExpr.and(ResourceContextKey.Resource.isEqualTo(this.preferencesService.workspaceSettingsResource.toString()), WorkbenchStateContext.isEqualTo("workspace"), ContextKeyExpr.not("isInDiffEditor"));
      MenuRegistry.appendMenuItem(MenuId.EditorTitle, {
        command: {
          id: commandId,
          title: OPEN_USER_SETTINGS_UI_TITLE,
          icon: preferencesOpenSettingsIcon
        },
        when,
        group: "navigation",
        order: 1
      });
      MenuRegistry.appendMenuItem(MenuId.ModalEditorEditorTitle, {
        command: {
          id: commandId,
          title: OPEN_USER_SETTINGS_UI_TITLE,
          icon: preferencesOpenSettingsIcon
        },
        when,
        group: "navigation",
        order: 1
      });
    }
    this.updatePreferencesEditorMenuItemForWorkspaceFolders();
  }
  updatePreferencesEditorMenuItemForWorkspaceFolders() {
    for (const folder of this.workspaceContextService.getWorkspace().folders) {
      const commandId = `_workbench.openFolderSettings.${folder.uri.toString()}`;
      if (!CommandsRegistry.getCommand(commandId)) {
        CommandsRegistry.registerCommand(commandId, (accessor, ...args2) => {
          const groupId = getEditorGroupFromArguments(accessor, args2)?.id;
          if (this.workspaceContextService.getWorkbenchState() === 2 /* FOLDER */) {
            return this.preferencesService.openWorkspaceSettings({ jsonEditor: false, groupId });
          } else {
            return this.preferencesService.openFolderSettings({ folderUri: folder.uri, jsonEditor: false, groupId });
          }
        });
        const when = ContextKeyExpr.and(ResourceContextKey.Resource.isEqualTo(this.preferencesService.getFolderSettingsResource(folder.uri).toString()), ContextKeyExpr.not("isInDiffEditor"));
        MenuRegistry.appendMenuItem(MenuId.EditorTitle, {
          command: {
            id: commandId,
            title: OPEN_USER_SETTINGS_UI_TITLE,
            icon: preferencesOpenSettingsIcon
          },
          when,
          group: "navigation",
          order: 1
        });
        MenuRegistry.appendMenuItem(MenuId.ModalEditorEditorTitle, {
          command: {
            id: commandId,
            title: OPEN_USER_SETTINGS_UI_TITLE,
            icon: preferencesOpenSettingsIcon
          },
          when,
          group: "navigation",
          order: 1
        });
      }
    }
  }
};

PreferencesActionsContribution = __decorateClass([
  __decorateParam(0, IWorkbenchEnvironmentService),
  __decorateParam(1, IUserDataProfileService),
  __decorateParam(2, IPreferencesService),
  __decorateParam(3, IWorkspaceContextService),
  __decorateParam(4, ILabelService),
  __decorateParam(5, IExtensionService),
  __decorateParam(6, IUserDataProfilesService)
], PreferencesActionsContribution);

var SettingsEditorTitleContribution = class extends Disposable {
  constructor(userDataProfileService, userDataProfilesService) {
    super();
    this.userDataProfileService = userDataProfileService;
    this.userDataProfilesService = userDataProfilesService;
    this.registerSettingsEditorTitleActions();
  }
  static {
    this.ID = "workbench.contrib.settingsEditorTitleBarActions";
  }
  registerSettingsEditorTitleActions() {
    const registerOpenUserSettingsEditorFromJsonActionDisposables = this._register(new MutableDisposable());
    const registerOpenUserSettingsEditorFromJsonAction = () => {
      const openUserSettingsEditorWhen = ContextKeyExpr.and(
        CONTEXT_SETTINGS_EDITOR.toNegated(),
        ContextKeyExpr.or(
          ResourceContextKey.Resource.isEqualTo(this.userDataProfileService.currentProfile.settingsResource.toString()),
          ResourceContextKey.Resource.isEqualTo(this.userDataProfilesService.defaultProfile.settingsResource.toString())
        ),
        ContextKeyExpr.not("isInDiffEditor")
      );
      registerOpenUserSettingsEditorFromJsonActionDisposables.clear();
      registerOpenUserSettingsEditorFromJsonActionDisposables.value = registerAction2(class extends Action2 {
        constructor() {
          super({
            id: "_workbench.openUserSettingsEditor",
            title: OPEN_USER_SETTINGS_UI_TITLE,
            icon: preferencesOpenSettingsIcon,
            menu: [{
              id: MenuId.EditorTitle,
              when: openUserSettingsEditorWhen,
              group: "navigation",
              order: 1
            }, {
              id: MenuId.ModalEditorEditorTitle,
              when: openUserSettingsEditorWhen,
              group: "navigation",
              order: 1
            }]
          });
        }
        run(accessor, ...args2) {
          const sanitizedArgs = sanitizeOpenSettingsArgs(args2[0]);
          const groupId = getEditorGroupFromArguments(accessor, args2)?.id;
          return accessor.get(IPreferencesService).openUserSettings({ jsonEditor: false, ...sanitizedArgs, groupId });
        }
      });
    };
    registerOpenUserSettingsEditorFromJsonAction();
    this._register(this.userDataProfileService.onDidChangeCurrentProfile(() => {
      registerOpenUserSettingsEditorFromJsonAction();
    }));
    const openSettingsJsonWhen = ContextKeyExpr.and(CONTEXT_SETTINGS_JSON_EDITOR.toNegated(), CONTEXT_SETTINGS_EDITOR);
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: SETTINGS_EDITOR_COMMAND_SWITCH_TO_JSON,
          title: localize2(18120, "Open Settings (JSON)"),
          icon: preferencesOpenSettingsIcon,
          menu: [{
            id: MenuId.EditorTitle,
            when: openSettingsJsonWhen,
            group: "navigation",
            order: 1
          }, {
            id: MenuId.ModalEditorEditorTitle,
            when: openSettingsJsonWhen,
            group: "navigation",
            order: 1
          }]
        });
      }
      run(accessor, ...args2) {
        const group2 = getEditorGroupFromArguments(accessor, args2);
        const editorPane = group2?.activeEditorPane;
        if (editorPane instanceof SettingsEditor2) {
          return editorPane.switchToSettingsFile();
        }
        return null;
      }
    }));
  }
};

SettingsEditorTitleContribution = __decorateClass([
  __decorateParam(0, IUserDataProfileService),
  __decorateParam(1, IUserDataProfilesService)
], SettingsEditorTitleContribution);

var SettingsEditorContribution = class extends Disposable {
  constructor(editor, instantiationService, preferencesService, workspaceContextService) {
    super();
    this.editor = editor;
    this.instantiationService = instantiationService;
    this.preferencesService = preferencesService;
    this.workspaceContextService = workspaceContextService;
    this.disposables = this._register(new DisposableStore());
    this._createPreferencesRenderer();
    this._register(this.editor.onDidChangeModel((e4) => this._createPreferencesRenderer()));
    this._register(this.workspaceContextService.onDidChangeWorkbenchState(() => this._createPreferencesRenderer()));
  }
  static {
    this.ID = "editor.contrib.settings";
  }
  async _createPreferencesRenderer() {
    this.disposables.clear();
    this.currentRenderer = void 0;
    const model = this.editor.getModel();
    if (model && /\.(json|code-workspace)$/.test(model.uri.path)) {
      const settingsModel = await this.preferencesService.createPreferencesEditorModel(model.uri);
      if (settingsModel instanceof SettingsEditorModel && this.editor.getModel()) {
        this.disposables.add(settingsModel);
        switch (settingsModel.configurationTarget) {
          case 5 /* WORKSPACE */:
            this.currentRenderer = this.disposables.add(this.instantiationService.createInstance(WorkspaceSettingsRenderer, this.editor, settingsModel));
            break;
          default:
            this.currentRenderer = this.disposables.add(this.instantiationService.createInstance(UserSettingsRenderer, this.editor, settingsModel));
            break;
        }
      }
      this.currentRenderer?.render();
    }
  }
};

SettingsEditorContribution = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IPreferencesService),
  __decorateParam(3, IWorkspaceContextService)
], SettingsEditorContribution);

function getEditorGroupFromArguments(accessor, args2) {
  const context2 = resolveCommandsContext(args2, accessor.get(IEditorService), accessor.get(IEditorGroupsService), accessor.get(IListService));
  return context2.groupedEditors[0]?.group;
}

registerWorkbenchContribution2(PreferencesActionsContribution.ID, PreferencesActionsContribution, WorkbenchPhase.BlockStartup);

registerWorkbenchContribution2(PreferencesContribution.ID, PreferencesContribution, WorkbenchPhase.BlockStartup);

registerWorkbenchContribution2(SettingsEditorTitleContribution.ID, SettingsEditorTitleContribution, WorkbenchPhase.AfterRestored);

registerEditorContribution(SettingsEditorContribution.ID, SettingsEditorContribution, 1 /* AfterFirstRender */);

MenuRegistry.appendMenuItem(MenuId.MenubarFileMenu, {
  title: localize(18106, null),
  submenu: MenuId.MenubarPreferencesMenu,
  group: "5_autosave",
  order: 2,
  when: IsMacNativeContext.toNegated()
  // on macOS native the preferences menu is separate under the application menu
});
export { sanitizeBoolean, sanitizeString, sanitizeOpenSettingsArgs, getEditorGroupFromArguments, SETTINGS_EDITOR_COMMAND_SEARCH, SETTINGS_EDITOR_COMMAND_FOCUS_FILE, SETTINGS_EDITOR_COMMAND_FOCUS_SETTINGS_FROM_SEARCH, SETTINGS_EDITOR_COMMAND_SHOW_PREVIOUS_SEARCH, SETTINGS_EDITOR_COMMAND_FOCUS_SETTINGS_FROM_SEARCH_ON_ENTER, SETTINGS_EDITOR_COMMAND_FOCUS_SEARCH_FROM_SETTINGS, SETTINGS_EDITOR_COMMAND_FOCUS_SETTINGS_LIST, SETTINGS_EDITOR_COMMAND_FOCUS_TOC, SETTINGS_EDITOR_COMMAND_FOCUS_CONTROL, SETTINGS_EDITOR_COMMAND_FOCUS_UP, SETTINGS_EDITOR_COMMAND_SWITCH_TO_JSON, SETTINGS_EDITOR_COMMAND_FILTER_ONLINE, SETTINGS_EDITOR_COMMAND_FILTER_UNTRUSTED, SETTINGS_COMMAND_OPEN_SETTINGS, SETTINGS_COMMAND_FILTER_TELEMETRY, PreferencesEditorInputSerializer, KeybindingsEditorInputSerializer, SettingsEditor2InputSerializer, OPEN_USER_SETTINGS_UI_TITLE, OPEN_USER_SETTINGS_JSON_TITLE, OPEN_APPLICATION_SETTINGS_JSON_TITLE, category, PreferencesActionsContribution, SettingsEditorTitleContribution, SettingsEditorContribution };
