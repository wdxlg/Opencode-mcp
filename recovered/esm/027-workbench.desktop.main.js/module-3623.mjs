// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/userDataProfile/browser/userDataProfile.ts
import { Action2, MenuId, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { CURRENT_PROFILE_CONTEXT, HAS_PROFILES_CONTEXT, IUserDataProfileImportExportService, IUserDataProfileManagementService, IUserDataProfileService, PROFILES_CATEGORY, PROFILES_TITLE, PROFILE_EXTENSION, isProfileURL } from "./module-0997.mjs";
import { isWeb } from "./module-0014.mjs";
import { URI } from "./module-0032.mjs";
import { UserDataProfilesEditor, UserDataProfilesEditorInput, UserDataProfilesEditorInputSerializer } from "./module-3622.mjs";
import { Registry } from "./module-0090.mjs";
import { EditorExtensions } from "./module-0925.mjs";
import { EditorPaneDescriptor } from "./module-1084.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { SyncDescriptor } from "./module-0134.mjs";
import { Extensions7 } from "./module-0273.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IEditorService } from "./module-0934.mjs";
import { ITextEditorService } from "./module-1561.mjs";
import { INotificationService } from "./module-0336.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { IsSessionsWindowContext } from "./module-0949.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IUserDataProfilesService } from "./module-0511.mjs";
import { IHostService } from "./module-1117.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { Categories } from "./module-0847.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IWorkspaceTagsService } from "./module-3619.mjs";
import { ILifecycleService } from "./module-0868.mjs";
import { IURLService } from "./module-1286.mjs";
import { IBrowserWorkbenchEnvironmentService } from "./module-0915.mjs";


// src/vs/workbench/contrib/userDataProfile/browser/userDataProfile.ts
var OpenProfileMenu = new MenuId("OpenProfile");

var ProfilesMenu = new MenuId("Profiles");

var UserDataProfilesWorkbenchContribution = class extends Disposable {
  constructor(userDataProfileService, userDataProfilesService, userDataProfileManagementService, telemetryService, workspaceContextService, workspaceTagsService, contextKeyService, editorService, instantiationService, lifecycleService, urlService, environmentService) {
    super();
    this.userDataProfileService = userDataProfileService;
    this.userDataProfilesService = userDataProfilesService;
    this.userDataProfileManagementService = userDataProfileManagementService;
    this.telemetryService = telemetryService;
    this.workspaceContextService = workspaceContextService;
    this.workspaceTagsService = workspaceTagsService;
    this.editorService = editorService;
    this.instantiationService = instantiationService;
    this.lifecycleService = lifecycleService;
    this.urlService = urlService;
    this.profilesDisposable = this._register(new MutableDisposable());
    this.currentProfileContext = CURRENT_PROFILE_CONTEXT.bindTo(contextKeyService);
    this.currentProfileContext.set(this.userDataProfileService.currentProfile.id);
    this._register(this.userDataProfileService.onDidChangeCurrentProfile((e) => {
      this.currentProfileContext.set(this.userDataProfileService.currentProfile.id);
    }));
    this.hasProfilesContext = HAS_PROFILES_CONTEXT.bindTo(contextKeyService);
    this.hasProfilesContext.set(this.userDataProfilesService.profiles.filter((p) => !p.isInternal).length > 1);
    this._register(this.userDataProfilesService.onDidChangeProfiles((e) => this.hasProfilesContext.set(this.userDataProfilesService.profiles.filter((p) => !p.isInternal).length > 1)));
    this.registerEditor();
    this.registerActions();
    this._register(this.urlService.registerHandler(this));
    if (isWeb) {
      lifecycleService.when(4 /* Eventually */).then(() => userDataProfilesService.cleanUp());
    }
    this.reportWorkspaceProfileInfo();
    if (environmentService.options?.profileToPreview) {
      lifecycleService.when(3 /* Restored */).then(() => this.handleURL(URI.revive(environmentService.options.profileToPreview)));
    }
    this.registerDropHandler();
  }
  static {
    this.ID = "workbench.contrib.userDataProfiles";
  }
  async handleURL(uri5) {
    if (isProfileURL(uri5)) {
      const editor = await this.openProfilesEditor();
      if (editor) {
        editor.createNewProfile(uri5);
        return true;
      }
    }
    return false;
  }
  async openProfilesEditor() {
    const editor = await this.editorService.openEditor(new UserDataProfilesEditorInput(this.instantiationService));
    return editor;
  }
  registerEditor() {
    Registry.as(EditorExtensions.EditorPane).registerEditorPane(
      EditorPaneDescriptor.create(
        UserDataProfilesEditor,
        UserDataProfilesEditor.ID,
        localize(21610, null)
      ),
      [
        new SyncDescriptor(UserDataProfilesEditorInput)
      ]
    );
    Registry.as(EditorExtensions.EditorFactory).registerEditorSerializer(UserDataProfilesEditorInput.ID, UserDataProfilesEditorInputSerializer);
  }
  registerDropHandler() {
    const dndRegistry = Registry.as(Extensions7.DragAndDropContribution);
    const that = this;
    this._register(dndRegistry.registerDropHandler(new class UserDataProfileDropHandler {
      async handleDrop(resource, accessor) {
        const uriIdentityService = accessor.get(IUriIdentityService);
        const userDataProfileImportExportService = accessor.get(IUserDataProfileImportExportService);
        const editorService = accessor.get(IEditorService);
        const textEditorService = accessor.get(ITextEditorService);
        const notificationService = accessor.get(INotificationService);
        if (uriIdentityService.extUri.extname(resource) === `.${PROFILE_EXTENSION}`) {
          const template2 = await userDataProfileImportExportService.resolveProfileTemplate(resource);
          if (!template2) {
            notificationService.warn(localize(21594, null));
            editorService.openEditor(textEditorService.createTextEditor({ resource }));
            return true;
          }
          const editor = await that.openProfilesEditor();
          if (editor) {
            try {
              await editor.createNewProfile(resource);
            } catch (error) {
              return false;
            }
          }
          return true;
        }
        return false;
      }
    }()));
  }
  registerActions() {
    this.registerProfileSubMenu();
    this._register(this.registerManageProfilesAction());
    this._register(this.registerSwitchProfileAction());
    this.registerOpenProfileSubMenu();
    this.registerNewWindowWithProfileAction();
    this.registerProfilesActions();
    this._register(this.userDataProfilesService.onDidChangeProfiles(() => this.registerProfilesActions()));
    this._register(this.registerExportCurrentProfileAction());
    this.registerCreateFromCurrentProfileAction();
    this.registerNewProfileAction();
    this.registerDeleteProfileAction();
    this.registerHelpAction();
  }
  registerProfileSubMenu() {
    const getProfilesTitle = () => {
      return localize(21606, null, this.userDataProfileService.currentProfile.name);
    };
    MenuRegistry.appendMenuItem(MenuId.GlobalActivity, {
      get title() {
        return getProfilesTitle();
      },
      submenu: ProfilesMenu,
      group: "2_configuration",
      order: 1,
      when: HAS_PROFILES_CONTEXT
    });
    MenuRegistry.appendMenuItem(MenuId.MenubarPreferencesMenu, {
      get title() {
        return getProfilesTitle();
      },
      submenu: ProfilesMenu,
      group: "2_configuration",
      order: 1,
      when: ContextKeyExpr.and(HAS_PROFILES_CONTEXT, IsSessionsWindowContext.negate())
    });
  }
  registerOpenProfileSubMenu() {
    MenuRegistry.appendMenuItem(MenuId.MenubarFileMenu, {
      title: localize(21597, null),
      submenu: OpenProfileMenu,
      group: "1_new",
      order: 4
    });
  }
  registerProfilesActions() {
    this.profilesDisposable.value = new DisposableStore();
    for (const profile of this.userDataProfilesService.profiles) {
      if (!profile.isInternal) {
        this.profilesDisposable.value.add(this.registerProfileEntryAction(profile));
        this.profilesDisposable.value.add(this.registerNewWindowAction(profile));
      }
    }
  }
  registerProfileEntryAction(profile) {
    const that = this;
    return registerAction2(class ProfileEntryAction extends Action2 {
      constructor() {
        super({
          id: `workbench.profiles.actions.profileEntry.${profile.id}`,
          title: profile.name,
          metadata: {
            description: localize2(21587, "Switch to {0} profile", profile.name)
          },
          toggled: ContextKeyExpr.equals(CURRENT_PROFILE_CONTEXT.key, profile.id),
          menu: [
            {
              id: ProfilesMenu,
              group: "0_profiles"
            }
          ]
        });
      }
      async run(accessor) {
        if (that.userDataProfileService.currentProfile.id !== profile.id) {
          return that.userDataProfileManagementService.switchProfile(profile);
        }
      }
    });
  }
  registerNewWindowWithProfileAction() {
    return registerAction2(class NewWindowWithProfileAction extends Action2 {
      constructor() {
        super({
          id: `workbench.profiles.actions.newWindowWithProfile`,
          title: localize2(21599, "New Window with Profile..."),
          category: PROFILES_CATEGORY,
          precondition: HAS_PROFILES_CONTEXT,
          f1: true
        });
      }
      async run(accessor) {
        const quickInputService = accessor.get(IQuickInputService);
        const userDataProfilesService = accessor.get(IUserDataProfilesService);
        const hostService = accessor.get(IHostService);
        const pick = await quickInputService.pick(
          userDataProfilesService.profiles.filter((profile) => !profile.isInternal).map((profile) => ({
            label: profile.name,
            profile
          })),
          {
            title: localize(21598, null),
            placeHolder: localize(21604, null),
            canPickMany: false
          }
        );
        if (pick) {
          return hostService.openWindow({ remoteAuthority: null, forceProfile: pick.profile.name });
        }
      }
    });
  }
  registerNewWindowAction(profile) {
    const disposables = new DisposableStore();
    const id2 = `workbench.action.openProfile.${profile.name.replace("/s+/", "_")}`;
    const precondition2 = HAS_PROFILES_CONTEXT;
    disposables.add(registerAction2(class NewWindowAction extends Action2 {
      constructor() {
        super({
          id: id2,
          title: localize2(21603, "{0}", profile.name),
          metadata: {
            description: localize2(21601, "Open New Window with {0} Profile", profile.name)
          },
          menu: {
            id: OpenProfileMenu,
            group: "0_profiles",
            when: precondition2
          }
        });
      }
      run(accessor) {
        const hostService = accessor.get(IHostService);
        return hostService.openWindow({ remoteAuthority: null, forceProfile: profile.name });
      }
    }));
    disposables.add(MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
      command: {
        id: id2,
        category: PROFILES_CATEGORY,
        title: localize2(21600, "Open {0} Profile", profile.name),
        precondition: precondition2
      }
    }));
    return disposables;
  }
  registerSwitchProfileAction() {
    const that = this;
    return registerAction2(class SwitchProfileAction extends Action2 {
      constructor() {
        super({
          id: `workbench.profiles.actions.switchProfile`,
          title: localize2(21609, "Switch Profile..."),
          category: PROFILES_CATEGORY,
          f1: true
        });
      }
      async run(accessor) {
        const quickInputService = accessor.get(IQuickInputService);
        const items = [];
        for (const profile of that.userDataProfilesService.profiles) {
          if (profile.isInternal) {
            continue;
          }
          items.push({
            id: profile.id,
            label: profile.id === that.userDataProfileService.currentProfile.id ? `$(check) ${profile.name}` : profile.name,
            profile
          });
        }
        const result = await quickInputService.pick(items.sort((a, b) => a.profile.name.localeCompare(b.profile.name)), {
          placeHolder: localize(21608, null)
        });
        if (result) {
          await that.userDataProfileManagementService.switchProfile(result.profile);
        }
      }
    });
  }
  registerManageProfilesAction() {
    const disposables = new DisposableStore();
    disposables.add(registerAction2(class ManageProfilesAction extends Action2 {
      constructor() {
        super({
          id: `workbench.profiles.actions.manageProfiles`,
          title: {
            ...localize2(21595, "Profiles"),
            mnemonicTitle: localize(21596, null)
          },
          menu: [
            {
              id: MenuId.GlobalActivity,
              group: "2_configuration",
              order: 1,
              when: HAS_PROFILES_CONTEXT.negate()
            },
            {
              id: MenuId.MenubarPreferencesMenu,
              group: "2_configuration",
              order: 1,
              when: ContextKeyExpr.and(HAS_PROFILES_CONTEXT.negate(), IsSessionsWindowContext.negate())
            },
            {
              id: ProfilesMenu,
              group: "1_manage",
              order: 1
            }
          ]
        });
      }
      run(accessor) {
        const editorService = accessor.get(IEditorService);
        const instantiationService = accessor.get(IInstantiationService);
        return editorService.openEditor(new UserDataProfilesEditorInput(instantiationService));
      }
    }));
    disposables.add(MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
      command: {
        id: "workbench.profiles.actions.manageProfiles",
        category: Categories.Preferences,
        title: localize2(21602, "Open Profiles (UI)")
      }
    }));
    return disposables;
  }
  registerExportCurrentProfileAction() {
    const that = this;
    const disposables = new DisposableStore();
    const id2 = "workbench.profiles.actions.exportProfile";
    disposables.add(registerAction2(class ExportProfileAction extends Action2 {
      constructor() {
        super({
          id: id2,
          title: localize2(21592, "Export Profile..."),
          category: PROFILES_CATEGORY,
          f1: true
        });
      }
      async run() {
        const editor = await that.openProfilesEditor();
        editor?.selectProfile(that.userDataProfileService.currentProfile);
      }
    }));
    disposables.add(MenuRegistry.appendMenuItem(MenuId.MenubarShare, {
      command: {
        id: id2,
        title: localize2(21593, "Export Profile ({0})...", that.userDataProfileService.currentProfile.name)
      }
    }));
    return disposables;
  }
  registerCreateFromCurrentProfileAction() {
    const that = this;
    this._register(registerAction2(class CreateFromCurrentProfileAction extends Action2 {
      constructor() {
        super({
          id: "workbench.profiles.actions.createFromCurrentProfile",
          title: localize2(21607, "Save Current Profile As..."),
          category: PROFILES_CATEGORY,
          f1: true
        });
      }
      async run() {
        const editor = await that.openProfilesEditor();
        editor?.createNewProfile(that.userDataProfileService.currentProfile);
      }
    }));
  }
  registerNewProfileAction() {
    const that = this;
    this._register(registerAction2(class CreateProfileAction extends Action2 {
      constructor() {
        super({
          id: "workbench.profiles.actions.createProfile",
          title: localize2(21588, "New Profile..."),
          category: PROFILES_CATEGORY,
          f1: true,
          menu: [
            {
              id: OpenProfileMenu,
              group: "1_manage_profiles",
              order: 1
            }
          ]
        });
      }
      async run(accessor) {
        const editor = await that.openProfilesEditor();
        return editor?.createNewProfile();
      }
    }));
  }
  registerDeleteProfileAction() {
    this._register(registerAction2(class DeleteProfileAction extends Action2 {
      constructor() {
        super({
          id: "workbench.profiles.actions.deleteProfile",
          title: localize2(21590, "Delete Profile..."),
          category: PROFILES_CATEGORY,
          f1: true,
          precondition: HAS_PROFILES_CONTEXT
        });
      }
      async run(accessor) {
        const quickInputService = accessor.get(IQuickInputService);
        const userDataProfileService = accessor.get(IUserDataProfileService);
        const userDataProfilesService = accessor.get(IUserDataProfilesService);
        const userDataProfileManagementService = accessor.get(IUserDataProfileManagementService);
        const notificationService = accessor.get(INotificationService);
        const profiles2 = userDataProfilesService.profiles.filter((p) => !p.isDefault && !p.isInternal);
        if (profiles2.length) {
          const picks = await quickInputService.pick(
            profiles2.map((profile) => ({
              label: profile.name,
              description: profile.id === userDataProfileService.currentProfile.id ? localize(21589, null) : void 0,
              profile
            })),
            {
              title: localize(21591, null),
              placeHolder: localize(21605, null),
              canPickMany: true
            }
          );
          if (picks) {
            try {
              await Promise.all(picks.map((pick) => userDataProfileManagementService.removeProfile(pick.profile)));
            } catch (error) {
              notificationService.error(error);
            }
          }
        }
      }
    }));
  }
  registerHelpAction() {
    this._register(registerAction2(class HelpAction extends Action2 {
      constructor() {
        super({
          id: "workbench.profiles.actions.help",
          title: PROFILES_TITLE,
          category: Categories.Help,
          menu: [{
            id: MenuId.CommandPalette
          }]
        });
      }
      run(accessor) {
        return accessor.get(IOpenerService).open(URI.parse("https://aka.ms/vscode-profiles-help"));
      }
    }));
  }
  async reportWorkspaceProfileInfo() {
    await this.lifecycleService.when(4 /* Eventually */);
    const count2 = this.userDataProfilesService.profiles.filter((p) => !p.isInternal).length - 1;
    if (count2 > 0) {
      this.telemetryService.publicLog2("profiles:count", { count: count2 });
    }
    const workspaceId = await this.workspaceTagsService.getTelemetryWorkspaceId(this.workspaceContextService.getWorkspace(), this.workspaceContextService.getWorkbenchState());
    this.telemetryService.publicLog2("workspaceProfileInfo", {
      workspaceId,
      defaultProfile: this.userDataProfileService.currentProfile.isDefault
    });
  }
};

UserDataProfilesWorkbenchContribution = __decorateClass([
  __decorateParam(0, IUserDataProfileService),
  __decorateParam(1, IUserDataProfilesService),
  __decorateParam(2, IUserDataProfileManagementService),
  __decorateParam(3, ITelemetryService),
  __decorateParam(4, IWorkspaceContextService),
  __decorateParam(5, IWorkspaceTagsService),
  __decorateParam(6, IContextKeyService),
  __decorateParam(7, IEditorService),
  __decorateParam(8, IInstantiationService),
  __decorateParam(9, ILifecycleService),
  __decorateParam(10, IURLService),
  __decorateParam(11, IBrowserWorkbenchEnvironmentService)
], UserDataProfilesWorkbenchContribution);
export { OpenProfileMenu, ProfilesMenu, UserDataProfilesWorkbenchContribution };
