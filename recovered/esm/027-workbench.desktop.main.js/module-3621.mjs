// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/userDataProfile/browser/userDataProfilesEditorModel.ts
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { RunOnceScheduler, createCancelablePromise } from "./module-0036.mjs";
import { equals } from "./module-0007.mjs";
import { equals4 } from "./module-0098.mjs";
import { localize } from "./module-0001.mjs";
import { Action, Separator, toAction } from "./module-0082.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { SettingsResource, SettingsResourceTreeItem } from "./module-1710.mjs";
import { KeybindingsResource, KeybindingsResourceTreeItem } from "./module-1711.mjs";
import { SnippetsResource, SnippetsResourceTreeItem } from "./module-1712.mjs";
import { TasksResource, TasksResourceTreeItem } from "./module-1713.mjs";
import { McpProfileResource, McpResourceTreeItem } from "./module-3620.mjs";
import { ExtensionsResourceExportTreeItem, ExtensionsResourceImportTreeItem } from "./module-1716.mjs";
import { isMarkdownString } from "./module-0462.mjs";
import { isString } from "./module-0010.mjs";
import { URI } from "./module-0032.mjs";
import { API_OPEN_EDITOR_COMMAND_ID } from "./module-1538.mjs";
import { SIDE_GROUP } from "./module-0934.mjs";
import { IWorkspaceContextService, WORKSPACE_SUFFIX } from "./module-0509.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IUserDataProfileImportExportService, IUserDataProfileManagementService, IUserDataProfileService, isProfileURL } from "./module-0997.mjs";
import { IUserDataProfilesService, isUserDataProfile, toUserDataProfile } from "./module-0511.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IHostService } from "./module-1117.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IFileService } from "./module-0269.mjs";
import { IWorkbenchExtensionManagementService } from "./module-1046.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { CONFIG_NEW_WINDOW_PROFILE } from "./module-1112.mjs";
import { ResourceMap, ResourceSet } from "./module-0008.mjs";
import { areSameExtensions } from "./module-0886.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { InMemoryFileSystemProvider } from "./module-1718.mjs";
import { generateUuid } from "./module-0190.mjs";
import { EditorModel } from "./module-1096.mjs";
import { getErrorMessage } from "./module-0004.mjs";
import { CancellationToken, CancellationTokenSource } from "./module-0025.mjs";
import { isWeb } from "./module-0014.mjs";
import { IDialogService } from "./module-0267.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IProductService } from "./module-0873.mjs";
import { IOpenerService } from "./module-0272.mjs";


// src/vs/workbench/contrib/userDataProfile/browser/userDataProfilesEditorModel.ts
function isProfileResourceTypeElement(element) {
  return element.resourceType !== void 0;
}

function isProfileResourceChildElement(element) {
  return element.label !== void 0;
}

var AbstractUserDataProfileElement = class extends Disposable {
  constructor(name, icon2, flags, workspaces, isActive2, userDataProfileManagementService, userDataProfilesService, commandService, workspaceContextService, hostService, uriIdentityService, fileService, extensionManagementService, instantiationService) {
    super();
    this.userDataProfileManagementService = userDataProfileManagementService;
    this.userDataProfilesService = userDataProfilesService;
    this.commandService = commandService;
    this.workspaceContextService = workspaceContextService;
    this.hostService = hostService;
    this.uriIdentityService = uriIdentityService;
    this.fileService = fileService;
    this.extensionManagementService = extensionManagementService;
    this.instantiationService = instantiationService;
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this.saveScheduler = this._register(new RunOnceScheduler(() => this.doSave(), 500));
    this._name = "";
    this._active = false;
    this._disabled = false;
    this._name = name;
    this._icon = icon2;
    this._flags = flags;
    this._workspaces = workspaces;
    this._active = isActive2;
    this._register(this.onDidChange((e) => {
      if (!e.message) {
        this.validate();
      }
      this.save();
    }));
    this._register(this.extensionManagementService.onProfileAwareDidInstallExtensions((results) => {
      const profile = this.getProfileToWatch();
      if (profile && results.some((r2) => !r2.error && (r2.applicationScoped || this.uriIdentityService.extUri.isEqual(r2.profileLocation, profile.extensionsResource)))) {
        this._onDidChange.fire({ extensions: true });
      }
    }));
    this._register(this.extensionManagementService.onProfileAwareDidUninstallExtension((e) => {
      const profile = this.getProfileToWatch();
      if (profile && !e.error && (e.applicationScoped || this.uriIdentityService.extUri.isEqual(e.profileLocation, profile.extensionsResource))) {
        this._onDidChange.fire({ extensions: true });
      }
    }));
    this._register(this.extensionManagementService.onProfileAwareDidUpdateExtensionMetadata((e) => {
      const profile = this.getProfileToWatch();
      if (profile && e.local.isApplicationScoped || this.uriIdentityService.extUri.isEqual(e.profileLocation, profile?.extensionsResource)) {
        this._onDidChange.fire({ extensions: true });
      }
    }));
  }
  get name() {
    return this._name;
  }
  set name(name) {
    name = name.trim();
    if (this._name !== name) {
      this._name = name;
      this._onDidChange.fire({ name: true });
    }
  }
  get icon() {
    return this._icon;
  }
  set icon(icon2) {
    if (this._icon !== icon2) {
      this._icon = icon2;
      this._onDidChange.fire({ icon: true });
    }
  }
  get workspaces() {
    return this._workspaces;
  }
  set workspaces(workspaces) {
    if (!equals(this._workspaces, workspaces, (a, b) => a.toString() === b.toString())) {
      this._workspaces = workspaces;
      this._onDidChange.fire({ workspaces: true });
    }
  }
  get flags() {
    return this._flags;
  }
  set flags(flags) {
    if (!equals4(this._flags, flags)) {
      this._flags = flags;
      this._onDidChange.fire({ flags: true });
    }
  }
  get active() {
    return this._active;
  }
  set active(active) {
    if (this._active !== active) {
      this._active = active;
      this._onDidChange.fire({ active: true });
    }
  }
  get message() {
    return this._message;
  }
  set message(message) {
    if (this._message !== message) {
      this._message = message;
      this._onDidChange.fire({ message: true });
    }
  }
  get disabled() {
    return this._disabled;
  }
  set disabled(saving) {
    if (this._disabled !== saving) {
      this._disabled = saving;
      this._onDidChange.fire({ disabled: true });
    }
  }
  getFlag(key3) {
    return this.flags?.[key3] ?? false;
  }
  setFlag(key3, value2) {
    const flags = this.flags ? { ...this.flags } : {};
    if (value2) {
      flags[key3] = true;
    } else {
      delete flags[key3];
    }
    this.flags = flags;
  }
  validate() {
    if (!this.name) {
      this.message = localize(21698, null);
      return;
    }
    if (this.shouldValidateName() && this.name !== this.getInitialName() && this.userDataProfilesService.profiles.some((p) => p.name === this.name)) {
      this.message = localize(21703, null, this.name);
      return;
    }
    if (this.flags && this.flags.settings && this.flags.keybindings && this.flags.tasks && this.flags.snippets && this.flags.extensions) {
      this.message = localize(21697, null);
      return;
    }
    this.message = void 0;
  }
  async getChildren(resourceType) {
    if (resourceType === void 0) {
      const resourceTypes = [
        "settings" /* Settings */,
        "keybindings" /* Keybindings */,
        "tasks" /* Tasks */,
        "mcp" /* Mcp */,
        "snippets" /* Snippets */,
        "extensions" /* Extensions */
      ];
      return Promise.all(resourceTypes.map(async (r2) => {
        const children = r2 === "settings" /* Settings */ || r2 === "keybindings" /* Keybindings */ || r2 === "tasks" /* Tasks */ || r2 === "mcp" /* Mcp */ ? await this.getChildrenForResourceType(r2) : [];
        return {
          handle: r2,
          checkbox: void 0,
          resourceType: r2,
          openAction: children.length ? toAction({
            id: "_open",
            label: localize(21700, null),
            class: ThemeIcon.asClassName(Codicon.goToFile),
            run: () => children[0]?.openAction?.run()
          }) : void 0
        };
      }));
    }
    return this.getChildrenForResourceType(resourceType);
  }
  async getChildrenForResourceType(resourceType) {
    return [];
  }
  async getChildrenFromProfile(profile, resourceType) {
    profile = this.getFlag(resourceType) ? this.userDataProfilesService.defaultProfile : profile;
    let children = [];
    switch (resourceType) {
      case "settings" /* Settings */:
        children = await this.instantiationService.createInstance(SettingsResourceTreeItem, profile).getChildren();
        break;
      case "keybindings" /* Keybindings */:
        children = await this.instantiationService.createInstance(KeybindingsResourceTreeItem, profile).getChildren();
        break;
      case "snippets" /* Snippets */:
        children = await this.instantiationService.createInstance(SnippetsResourceTreeItem, profile).getChildren() ?? [];
        break;
      case "tasks" /* Tasks */:
        children = await this.instantiationService.createInstance(TasksResourceTreeItem, profile).getChildren();
        break;
      case "mcp" /* Mcp */:
        children = await this.instantiationService.createInstance(McpResourceTreeItem, profile).getChildren();
        break;
      case "extensions" /* Extensions */:
        children = await this.instantiationService.createInstance(ExtensionsResourceExportTreeItem, profile).getChildren();
        break;
    }
    return children.map((child) => this.toUserDataProfileResourceChildElement(child));
  }
  toUserDataProfileResourceChildElement(child, primaryActions, contextMenuActions) {
    return {
      handle: child.handle,
      checkbox: child.checkbox,
      label: child.label ? isMarkdownString(child.label.label) ? child.label.label.value : child.label.label : "",
      description: isString(child.description) ? child.description : void 0,
      resource: URI.revive(child.resourceUri),
      icon: child.themeIcon,
      openAction: toAction({
        id: "_openChild",
        label: localize(21700, null),
        class: ThemeIcon.asClassName(Codicon.goToFile),
        run: async () => {
          if (child.parent.type === "extensions" /* Extensions */) {
            await this.commandService.executeCommand("extension.open", child.handle, void 0, true, void 0, true);
          } else if (child.resourceUri) {
            await this.commandService.executeCommand(API_OPEN_EDITOR_COMMAND_ID, child.resourceUri, [SIDE_GROUP], void 0);
          }
        }
      }),
      actions: {
        primary: primaryActions,
        contextMenu: contextMenuActions
      }
    };
  }
  getInitialName() {
    return "";
  }
  shouldValidateName() {
    return true;
  }
  getCurrentWorkspace() {
    const workspace = this.workspaceContextService.getWorkspace();
    return workspace.configuration ?? workspace.folders[0]?.uri;
  }
  openWorkspace(workspace) {
    if (this.uriIdentityService.extUri.extname(workspace) === WORKSPACE_SUFFIX) {
      this.hostService.openWindow([{ workspaceUri: workspace }], { forceNewWindow: true });
    } else {
      this.hostService.openWindow([{ folderUri: workspace }], { forceNewWindow: true });
    }
  }
  save() {
    this.saveScheduler.schedule();
  }
  hasUnsavedChanges(profile) {
    if (this.name !== profile.name) {
      return true;
    }
    if (this.icon !== profile.icon) {
      return true;
    }
    if (!equals4(this.flags ?? {}, profile.useDefaultFlags ?? {})) {
      return true;
    }
    if (!equals(this.workspaces ?? [], profile.workspaces ?? [], (a, b) => a.toString() === b.toString())) {
      return true;
    }
    return false;
  }
  async saveProfile(profile) {
    if (!this.hasUnsavedChanges(profile)) {
      return;
    }
    this.validate();
    if (this.message) {
      return;
    }
    const useDefaultFlags = this.flags ? this.flags.settings && this.flags.keybindings && this.flags.tasks && this.flags.globalState && this.flags.extensions ? void 0 : this.flags : void 0;
    return await this.userDataProfileManagementService.updateProfile(profile, {
      name: this.name,
      icon: this.icon,
      useDefaultFlags: profile.useDefaultFlags && !useDefaultFlags ? {} : useDefaultFlags,
      workspaces: this.workspaces
    });
  }
};

AbstractUserDataProfileElement = __decorateClass([
  __decorateParam(5, IUserDataProfileManagementService),
  __decorateParam(6, IUserDataProfilesService),
  __decorateParam(7, ICommandService),
  __decorateParam(8, IWorkspaceContextService),
  __decorateParam(9, IHostService),
  __decorateParam(10, IUriIdentityService),
  __decorateParam(11, IFileService),
  __decorateParam(12, IWorkbenchExtensionManagementService),
  __decorateParam(13, IInstantiationService)
], AbstractUserDataProfileElement);

var UserDataProfileElement = class extends AbstractUserDataProfileElement {
  constructor(_profile, titleButtons, actions, userDataProfileService, configurationService, userDataProfileManagementService, userDataProfilesService, commandService, workspaceContextService, hostService, uriIdentityService, fileService, extensionManagementService, instantiationService) {
    super(
      _profile.name,
      _profile.icon,
      _profile.useDefaultFlags,
      _profile.workspaces,
      userDataProfileService.currentProfile.id === _profile.id,
      userDataProfileManagementService,
      userDataProfilesService,
      commandService,
      workspaceContextService,
      hostService,
      uriIdentityService,
      fileService,
      extensionManagementService,
      instantiationService
    );
    this._profile = _profile;
    this.titleButtons = titleButtons;
    this.actions = actions;
    this.userDataProfileService = userDataProfileService;
    this.configurationService = configurationService;
    this._isNewWindowProfile = false;
    this._isNewWindowProfile = this.configurationService.getValue(CONFIG_NEW_WINDOW_PROFILE) === this.profile.name;
    this._register(configurationService.onDidChangeConfiguration(
      (e) => {
        if (e.affectsConfiguration(CONFIG_NEW_WINDOW_PROFILE)) {
          this.isNewWindowProfile = this.configurationService.getValue(CONFIG_NEW_WINDOW_PROFILE) === this.profile.name;
        }
      }
    ));
    this._register(this.userDataProfileService.onDidChangeCurrentProfile(() => this.active = this.userDataProfileService.currentProfile.id === this.profile.id));
    this._register(this.userDataProfilesService.onDidChangeProfiles(({ updated }) => {
      const profile = updated.find((p) => p.id === this.profile.id);
      if (profile) {
        this._profile = profile;
        this.reset();
        this._onDidChange.fire({ profile: true });
      }
    }));
    this._register(fileService.watch(this.profile.snippetsHome));
    this._register(fileService.onDidFilesChange((e) => {
      if (e.affects(this.profile.snippetsHome)) {
        this._onDidChange.fire({ snippets: true });
      }
    }));
  }
  get profile() {
    return this._profile;
  }
  getProfileToWatch() {
    return this.profile;
  }
  reset() {
    this.name = this._profile.name;
    this.icon = this._profile.icon;
    this.flags = this._profile.useDefaultFlags;
    this.workspaces = this._profile.workspaces;
  }
  updateWorkspaces(toAdd, toRemove) {
    const workspaces = new ResourceSet(this.workspaces ?? []);
    for (const workspace of toAdd) {
      workspaces.add(workspace);
    }
    for (const workspace of toRemove) {
      workspaces.delete(workspace);
    }
    this.workspaces = [...workspaces.values()];
  }
  async toggleNewWindowProfile() {
    if (this._isNewWindowProfile) {
      await this.configurationService.updateValue(CONFIG_NEW_WINDOW_PROFILE, null);
    } else {
      await this.configurationService.updateValue(CONFIG_NEW_WINDOW_PROFILE, this.profile.name);
    }
  }
  get isNewWindowProfile() {
    return this._isNewWindowProfile;
  }
  set isNewWindowProfile(isNewWindowProfile) {
    if (this._isNewWindowProfile !== isNewWindowProfile) {
      this._isNewWindowProfile = isNewWindowProfile;
      this._onDidChange.fire({ newWindowProfile: true });
    }
  }
  async toggleCurrentWindowProfile() {
    if (this.userDataProfileService.currentProfile.id === this.profile.id) {
      await this.userDataProfileManagementService.switchProfile(this.userDataProfilesService.defaultProfile);
    } else {
      await this.userDataProfileManagementService.switchProfile(this.profile);
    }
  }
  async doSave() {
    await this.saveProfile(this.profile);
  }
  async getChildrenForResourceType(resourceType) {
    if (resourceType === "extensions" /* Extensions */) {
      const children = await this.instantiationService.createInstance(ExtensionsResourceExportTreeItem, this.profile).getChildren();
      return children.map((child) => this.toUserDataProfileResourceChildElement(
        child,
        void 0,
        [{
          id: "applyToAllProfiles",
          label: localize(21687, null),
          checked: child.applicationScoped,
          enabled: true,
          class: "",
          tooltip: "",
          run: async () => {
            const extensions = await this.extensionManagementService.getInstalled(void 0, this.profile.extensionsResource);
            const extension = extensions.find((e) => areSameExtensions(e.identifier, child.identifier));
            if (extension) {
              await this.extensionManagementService.toggleApplicationScope(extension, this.profile.extensionsResource);
            }
          }
        }]
      ));
    }
    return this.getChildrenFromProfile(this.profile, resourceType);
  }
  getInitialName() {
    return this.profile.name;
  }
};

UserDataProfileElement = __decorateClass([
  __decorateParam(3, IUserDataProfileService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IUserDataProfileManagementService),
  __decorateParam(6, IUserDataProfilesService),
  __decorateParam(7, ICommandService),
  __decorateParam(8, IWorkspaceContextService),
  __decorateParam(9, IHostService),
  __decorateParam(10, IUriIdentityService),
  __decorateParam(11, IFileService),
  __decorateParam(12, IWorkbenchExtensionManagementService),
  __decorateParam(13, IInstantiationService)
], UserDataProfileElement);

var USER_DATA_PROFILE_TEMPLATE_PREVIEW_SCHEME = "userdataprofiletemplatepreview";

var NewProfileElement = class extends AbstractUserDataProfileElement {
  constructor(copyFrom, titleButtons, actions, userDataProfileImportExportService, userDataProfileManagementService, userDataProfilesService, commandService, workspaceContextService, hostService, uriIdentityService, fileService, extensionManagementService, instantiationService) {
    super(
      "",
      void 0,
      void 0,
      void 0,
      false,
      userDataProfileManagementService,
      userDataProfilesService,
      commandService,
      workspaceContextService,
      hostService,
      uriIdentityService,
      fileService,
      extensionManagementService,
      instantiationService
    );
    this.titleButtons = titleButtons;
    this.actions = actions;
    this.userDataProfileImportExportService = userDataProfileImportExportService;
    this._copyFromTemplates = new ResourceMap();
    this.template = null;
    this.previewProfileWatchDisposables = this._register(new DisposableStore());
    this.name = this.defaultName = this.getNewProfileName();
    this._copyFrom = copyFrom;
    this._copyFlags = this.getCopyFlagsFrom(copyFrom);
    this.initialize();
    this._register(this.fileService.registerProvider(USER_DATA_PROFILE_TEMPLATE_PREVIEW_SCHEME, this._register(new InMemoryFileSystemProvider())));
    this._register(toDisposable(() => {
      if (this.previewProfile) {
        this.userDataProfilesService.removeProfile(this.previewProfile);
      }
    }));
  }
  get copyFromTemplates() {
    return this._copyFromTemplates;
  }
  get copyFrom() {
    return this._copyFrom;
  }
  set copyFrom(copyFrom) {
    if (this._copyFrom !== copyFrom) {
      this._copyFrom = copyFrom;
      this._onDidChange.fire({ copyFrom: true });
      this.flags = void 0;
      this.copyFlags = this.getCopyFlagsFrom(copyFrom);
      if (copyFrom instanceof URI) {
        this.templatePromise?.cancel();
        this.templatePromise = void 0;
      }
      this.initialize();
    }
  }
  get copyFlags() {
    return this._copyFlags;
  }
  set copyFlags(flags) {
    if (!equals4(this._copyFlags, flags)) {
      this._copyFlags = flags;
      this._onDidChange.fire({ copyFlags: true });
    }
  }
  get previewProfile() {
    return this._previewProfile;
  }
  set previewProfile(profile) {
    if (this._previewProfile !== profile) {
      this._previewProfile = profile;
      this._onDidChange.fire({ preview: true });
      this.previewProfileWatchDisposables.clear();
      if (this._previewProfile) {
        this.previewProfileWatchDisposables.add(this.fileService.watch(this._previewProfile.snippetsHome));
        this.previewProfileWatchDisposables.add(this.fileService.onDidFilesChange((e) => {
          if (!this._previewProfile) {
            return;
          }
          if (e.affects(this._previewProfile.snippetsHome)) {
            this._onDidChange.fire({ snippets: true });
          }
        }));
      }
    }
  }
  getProfileToWatch() {
    return this.previewProfile;
  }
  getCopyFlagsFrom(copyFrom) {
    return copyFrom ? {
      settings: true,
      keybindings: true,
      snippets: true,
      tasks: true,
      extensions: true,
      mcp: true
    } : void 0;
  }
  async initialize() {
    this.disabled = true;
    try {
      if (this.copyFrom instanceof URI) {
        await this.resolveTemplate(this.copyFrom);
        if (this.template) {
          this.copyFromTemplates.set(this.copyFrom, this.template.name);
          if (this.defaultName === this.name) {
            this.name = this.defaultName = this.template.name ?? "";
          }
          if (this.defaultIcon === this.icon) {
            this.icon = this.defaultIcon = this.template.icon;
          }
          this.setCopyFlag("settings" /* Settings */, !!this.template.settings);
          this.setCopyFlag("keybindings" /* Keybindings */, !!this.template.keybindings);
          this.setCopyFlag("tasks" /* Tasks */, !!this.template.tasks);
          this.setCopyFlag("snippets" /* Snippets */, !!this.template.snippets);
          this.setCopyFlag("extensions" /* Extensions */, !!this.template.extensions);
          this.setCopyFlag("mcp" /* Mcp */, !!this.template.mcp);
          this._onDidChange.fire({ copyFromInfo: true });
        }
        return;
      }
      if (isUserDataProfile(this.copyFrom)) {
        if (this.defaultName === this.name) {
          this.name = this.defaultName = localize(21689, null, this.copyFrom.name);
        }
        if (this.defaultIcon === this.icon) {
          this.icon = this.defaultIcon = this.copyFrom.icon;
        }
        this.setCopyFlag("settings" /* Settings */, true);
        this.setCopyFlag("keybindings" /* Keybindings */, true);
        this.setCopyFlag("tasks" /* Tasks */, true);
        this.setCopyFlag("snippets" /* Snippets */, true);
        this.setCopyFlag("extensions" /* Extensions */, true);
        this.setCopyFlag("mcp" /* Mcp */, true);
        this._onDidChange.fire({ copyFromInfo: true });
        return;
      }
      if (this.defaultName === this.name) {
        this.name = this.defaultName = this.getNewProfileName();
      }
      if (this.defaultIcon === this.icon) {
        this.icon = this.defaultIcon = void 0;
      }
      this.setCopyFlag("settings" /* Settings */, false);
      this.setCopyFlag("keybindings" /* Keybindings */, false);
      this.setCopyFlag("tasks" /* Tasks */, false);
      this.setCopyFlag("snippets" /* Snippets */, false);
      this.setCopyFlag("extensions" /* Extensions */, false);
      this.setCopyFlag("mcp" /* Mcp */, false);
      this._onDidChange.fire({ copyFromInfo: true });
    } finally {
      this.disabled = false;
    }
  }
  getNewProfileName() {
    const name = localize(21705, null);
    const nameRegEx = new RegExp(`${name}\\s(\\d+)`);
    let nameIndex = 0;
    for (const profile of this.userDataProfilesService.profiles) {
      const matches2 = nameRegEx.exec(profile.name);
      const index2 = matches2 ? parseInt(matches2[1]) : 0;
      nameIndex = index2 > nameIndex ? index2 : nameIndex;
    }
    return `${name} ${nameIndex + 1}`;
  }
  async resolveTemplate(uri5) {
    if (!this.templatePromise) {
      this.templatePromise = createCancelablePromise(async (token) => {
        const template2 = await this.userDataProfileImportExportService.resolveProfileTemplate(uri5);
        if (!token.isCancellationRequested) {
          this.template = template2;
        }
      });
    }
    await this.templatePromise;
    return this.template;
  }
  hasResource(resourceType) {
    if (this.template) {
      switch (resourceType) {
        case "settings" /* Settings */:
          return !!this.template.settings;
        case "keybindings" /* Keybindings */:
          return !!this.template.keybindings;
        case "snippets" /* Snippets */:
          return !!this.template.snippets;
        case "tasks" /* Tasks */:
          return !!this.template.tasks;
        case "extensions" /* Extensions */:
          return !!this.template.extensions;
      }
    }
    return true;
  }
  getCopyFlag(key3) {
    return this.copyFlags?.[key3] ?? false;
  }
  setCopyFlag(key3, value2) {
    const flags = this.copyFlags ? { ...this.copyFlags } : {};
    flags[key3] = value2;
    this.copyFlags = flags;
  }
  getCopyFromName() {
    if (isUserDataProfile(this.copyFrom)) {
      return this.copyFrom.name;
    }
    if (this.copyFrom instanceof URI) {
      return this.copyFromTemplates.get(this.copyFrom);
    }
    return void 0;
  }
  async getChildrenForResourceType(resourceType) {
    if (this.getFlag(resourceType)) {
      return this.getChildrenFromProfile(this.userDataProfilesService.defaultProfile, resourceType);
    }
    if (!this.getCopyFlag(resourceType)) {
      return [];
    }
    if (this.previewProfile) {
      return this.getChildrenFromProfile(this.previewProfile, resourceType);
    }
    if (this.copyFrom instanceof URI) {
      await this.resolveTemplate(this.copyFrom);
      if (!this.template) {
        return [];
      }
      return this.getChildrenFromProfileTemplate(this.template, resourceType);
    }
    if (this.copyFrom) {
      return this.getChildrenFromProfile(this.copyFrom, resourceType);
    }
    return [];
  }
  async getChildrenFromProfileTemplate(profileTemplate, resourceType) {
    const location2 = URI.from({ scheme: USER_DATA_PROFILE_TEMPLATE_PREVIEW_SCHEME, path: `/root/profiles/${profileTemplate.name}` });
    const cacheLocation = URI.from({ scheme: USER_DATA_PROFILE_TEMPLATE_PREVIEW_SCHEME, path: `/root/cache/${profileTemplate.name}` });
    const profile = toUserDataProfile(generateUuid(), this.name, location2, cacheLocation);
    switch (resourceType) {
      case "settings" /* Settings */:
        if (profileTemplate.settings) {
          await this.instantiationService.createInstance(SettingsResource).apply(profileTemplate.settings, profile);
          return this.getChildrenFromProfile(profile, resourceType);
        }
        return [];
      case "keybindings" /* Keybindings */:
        if (profileTemplate.keybindings) {
          await this.instantiationService.createInstance(KeybindingsResource).apply(profileTemplate.keybindings, profile);
          return this.getChildrenFromProfile(profile, resourceType);
        }
        return [];
      case "snippets" /* Snippets */:
        if (profileTemplate.snippets) {
          await this.instantiationService.createInstance(SnippetsResource).apply(profileTemplate.snippets, profile);
          return this.getChildrenFromProfile(profile, resourceType);
        }
        return [];
      case "tasks" /* Tasks */:
        if (profileTemplate.tasks) {
          await this.instantiationService.createInstance(TasksResource).apply(profileTemplate.tasks, profile);
          return this.getChildrenFromProfile(profile, resourceType);
        }
        return [];
      case "mcp" /* Mcp */:
        if (profileTemplate.mcp) {
          await this.instantiationService.createInstance(McpProfileResource).apply(profileTemplate.mcp, profile);
          return this.getChildrenFromProfile(profile, resourceType);
        }
        return [];
      case "extensions" /* Extensions */:
        if (profileTemplate.extensions) {
          const children = await this.instantiationService.createInstance(ExtensionsResourceImportTreeItem, profileTemplate.extensions).getChildren();
          return children.map((child) => this.toUserDataProfileResourceChildElement(child));
        }
        return [];
    }
    return [];
  }
  shouldValidateName() {
    return !this.copyFrom;
  }
  getInitialName() {
    return this.previewProfile?.name ?? "";
  }
  async doSave() {
    if (this.previewProfile) {
      const profile = await this.saveProfile(this.previewProfile);
      if (profile) {
        this.previewProfile = profile;
      }
    }
  }
};

NewProfileElement = __decorateClass([
  __decorateParam(3, IUserDataProfileImportExportService),
  __decorateParam(4, IUserDataProfileManagementService),
  __decorateParam(5, IUserDataProfilesService),
  __decorateParam(6, ICommandService),
  __decorateParam(7, IWorkspaceContextService),
  __decorateParam(8, IHostService),
  __decorateParam(9, IUriIdentityService),
  __decorateParam(10, IFileService),
  __decorateParam(11, IWorkbenchExtensionManagementService),
  __decorateParam(12, IInstantiationService)
], NewProfileElement);

var UserDataProfilesEditorModel = class extends EditorModel {
  constructor(userDataProfileService, userDataProfilesService, userDataProfileManagementService, userDataProfileImportExportService, dialogService, telemetryService, hostService, productService, openerService, instantiationService) {
    super();
    this.userDataProfileService = userDataProfileService;
    this.userDataProfilesService = userDataProfilesService;
    this.userDataProfileManagementService = userDataProfileManagementService;
    this.userDataProfileImportExportService = userDataProfileImportExportService;
    this.dialogService = dialogService;
    this.telemetryService = telemetryService;
    this.hostService = hostService;
    this.productService = productService;
    this.openerService = openerService;
    this.instantiationService = instantiationService;
    this._profiles = [];
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    for (const profile of userDataProfilesService.profiles) {
      if (!profile.isInternal) {
        this._profiles.push(this.createProfileElement(profile));
      }
    }
    this._register(toDisposable(() => this._profiles.splice(0, this._profiles.length).map(([, disposables]) => disposables.dispose())));
    this._register(userDataProfilesService.onDidChangeProfiles((e) => this.onDidChangeProfiles(e)));
  }
  static getInstance(instantiationService) {
    if (!UserDataProfilesEditorModel.INSTANCE) {
      UserDataProfilesEditorModel.INSTANCE = instantiationService.createInstance(UserDataProfilesEditorModel);
    }
    return UserDataProfilesEditorModel.INSTANCE;
  }
  get profiles() {
    return this._profiles.map(([profile]) => profile).sort((a, b) => {
      if (a instanceof NewProfileElement) {
        return 1;
      }
      if (b instanceof NewProfileElement) {
        return -1;
      }
      if (a instanceof UserDataProfileElement && a.profile.isDefault) {
        return -1;
      }
      if (b instanceof UserDataProfileElement && b.profile.isDefault) {
        return 1;
      }
      return a.name.localeCompare(b.name);
    });
  }
  onDidChangeProfiles(e) {
    let changed = false;
    for (const profile of e.added) {
      if (!profile.isInternal && profile.name !== this.newProfileElement?.name) {
        changed = true;
        this._profiles.push(this.createProfileElement(profile));
      }
    }
    for (const profile of e.removed) {
      if (profile.id === this.newProfileElement?.previewProfile?.id) {
        this.newProfileElement.previewProfile = void 0;
      }
      const index2 = this._profiles.findIndex(([p]) => p instanceof UserDataProfileElement && p.profile.id === profile.id);
      if (index2 !== -1) {
        changed = true;
        this._profiles.splice(index2, 1).map(([, disposables]) => disposables.dispose());
      }
    }
    if (changed) {
      this._onDidChange.fire(void 0);
    }
  }
  getTemplates() {
    if (!this.templates) {
      this.templates = this.userDataProfileManagementService.getBuiltinProfileTemplates();
    }
    return this.templates;
  }
  createProfileElement(profile) {
    const disposables = new DisposableStore();
    const activateAction = disposables.add(new Action(
      "userDataProfile.activate",
      localize(21686, null),
      ThemeIcon.asClassName(Codicon.check),
      true,
      () => this.userDataProfileManagementService.switchProfile(profileElement.profile)
    ));
    const copyFromProfileAction = disposables.add(new Action(
      "userDataProfile.copyFromProfile",
      localize(21690, null),
      ThemeIcon.asClassName(Codicon.copy),
      true,
      () => this.createNewProfile(profileElement.profile)
    ));
    const exportAction = disposables.add(new Action(
      "userDataProfile.export",
      localize(21695, null),
      ThemeIcon.asClassName(Codicon.export),
      true,
      () => this.userDataProfileImportExportService.exportProfile(profile)
    ));
    const deleteAction = disposables.add(new Action(
      "userDataProfile.delete",
      localize(21692, null),
      ThemeIcon.asClassName(Codicon.trash),
      true,
      () => this.removeProfile(profileElement.profile)
    ));
    const newWindowAction = disposables.add(new Action(
      "userDataProfile.newWindow",
      localize(21701, null),
      ThemeIcon.asClassName(Codicon.emptyWindow),
      true,
      () => this.openWindow(profileElement.profile)
    ));
    const primaryActions = [];
    primaryActions.push(activateAction);
    primaryActions.push(newWindowAction);
    const secondaryActions = [];
    secondaryActions.push(copyFromProfileAction);
    secondaryActions.push(exportAction);
    if (!profile.isDefault) {
      secondaryActions.push(new Separator());
      secondaryActions.push(deleteAction);
    }
    const profileElement = disposables.add(this.instantiationService.createInstance(
      UserDataProfileElement,
      profile,
      [[], []],
      [primaryActions, secondaryActions]
    ));
    activateAction.enabled = this.userDataProfileService.currentProfile.id !== profileElement.profile.id;
    disposables.add(this.userDataProfileService.onDidChangeCurrentProfile(() => activateAction.enabled = this.userDataProfileService.currentProfile.id !== profileElement.profile.id));
    return [profileElement, disposables];
  }
  async createNewProfile(copyFrom) {
    if (this.newProfileElement) {
      const result = await this.dialogService.confirm({
        type: "info",
        message: localize(21699, null),
        primaryButton: localize(21694, null),
        cancelButton: localize(21688, null)
      });
      if (!result.confirmed) {
        return;
      }
      this.revert();
    }
    if (copyFrom instanceof URI) {
      try {
        await this.userDataProfileImportExportService.resolveProfileTemplate(copyFrom);
      } catch (error) {
        this.dialogService.error(getErrorMessage(error));
        return;
      }
    }
    if (!this.newProfileElement) {
      const disposables = new DisposableStore();
      const cancellationTokenSource = new CancellationTokenSource();
      disposables.add(toDisposable(() => cancellationTokenSource.dispose(true)));
      const primaryActions = [];
      const secondaryActions = [];
      const createAction = disposables.add(new Action(
        "userDataProfile.create",
        localize(21691, null),
        void 0,
        true,
        () => this.saveNewProfile(false, cancellationTokenSource.token)
      ));
      primaryActions.push(createAction);
      if (isWeb && copyFrom instanceof URI && isProfileURL(copyFrom)) {
        primaryActions.push(disposables.add(new Action(
          "userDataProfile.createInDesktop",
          localize(21696, null, this.productService.nameLong),
          void 0,
          true,
          () => this.openerService.open(copyFrom, { openExternal: true })
        )));
      }
      const cancelAction = disposables.add(new Action(
        "userDataProfile.cancel",
        localize(21688, null),
        ThemeIcon.asClassName(Codicon.trash),
        true,
        () => this.discardNewProfile()
      ));
      secondaryActions.push(cancelAction);
      const previewProfileAction = disposables.add(new Action(
        "userDataProfile.preview",
        localize(21702, null),
        ThemeIcon.asClassName(Codicon.openPreview),
        true,
        () => this.previewNewProfile(cancellationTokenSource.token)
      ));
      secondaryActions.push(previewProfileAction);
      const exportAction = disposables.add(new Action(
        "userDataProfile.export",
        localize(21695, null),
        ThemeIcon.asClassName(Codicon.export),
        isUserDataProfile(copyFrom),
        () => this.exportNewProfile(cancellationTokenSource.token)
      ));
      this.newProfileElement = disposables.add(this.instantiationService.createInstance(
        NewProfileElement,
        copyFrom,
        [primaryActions, secondaryActions],
        [[cancelAction], [exportAction]]
      ));
      const updateCreateActionLabel = () => {
        if (createAction.enabled) {
          if (this.newProfileElement?.copyFrom && this.userDataProfilesService.profiles.some((p) => !p.isInternal && p.name === this.newProfileElement?.name)) {
            createAction.label = localize(21704, null);
          } else {
            createAction.label = localize(21691, null);
          }
        }
      };
      updateCreateActionLabel();
      disposables.add(this.newProfileElement.onDidChange((e) => {
        if (e.preview || e.disabled || e.message) {
          createAction.enabled = !this.newProfileElement?.disabled && !this.newProfileElement?.message;
          previewProfileAction.enabled = !this.newProfileElement?.previewProfile && !this.newProfileElement?.disabled && !this.newProfileElement?.message;
        }
        if (e.name || e.copyFrom) {
          updateCreateActionLabel();
          exportAction.enabled = isUserDataProfile(this.newProfileElement?.copyFrom);
        }
      }));
      disposables.add(this.userDataProfilesService.onDidChangeProfiles((e) => {
        updateCreateActionLabel();
        this.newProfileElement?.validate();
      }));
      this._profiles.push([this.newProfileElement, disposables]);
      this._onDidChange.fire(this.newProfileElement);
    }
    return this.newProfileElement;
  }
  revert() {
    this.removeNewProfile();
    this._onDidChange.fire(void 0);
  }
  removeNewProfile() {
    if (this.newProfileElement) {
      const index2 = this._profiles.findIndex(([p]) => p === this.newProfileElement);
      if (index2 !== -1) {
        this._profiles.splice(index2, 1).map(([, disposables]) => disposables.dispose());
      }
      this.newProfileElement = void 0;
    }
  }
  async previewNewProfile(token) {
    if (!this.newProfileElement) {
      return;
    }
    if (this.newProfileElement.previewProfile) {
      return;
    }
    const profile = await this.saveNewProfile(true, token);
    if (profile) {
      this.newProfileElement.previewProfile = profile;
      if (isWeb) {
        await this.userDataProfileManagementService.switchProfile(profile);
      } else {
        await this.openWindow(profile);
      }
    }
  }
  async exportNewProfile(token) {
    if (!this.newProfileElement) {
      return;
    }
    if (!isUserDataProfile(this.newProfileElement.copyFrom)) {
      return;
    }
    const profile = toUserDataProfile(
      generateUuid(),
      this.newProfileElement.name,
      this.newProfileElement.copyFrom.location,
      this.newProfileElement.copyFrom.cacheHome,
      {
        icon: this.newProfileElement.icon,
        useDefaultFlags: this.newProfileElement.flags
      },
      this.userDataProfilesService.defaultProfile
    );
    await this.userDataProfileImportExportService.exportProfile(profile, this.newProfileElement.copyFlags);
  }
  async saveNewProfile(transient, token) {
    if (!this.newProfileElement) {
      return void 0;
    }
    this.newProfileElement.validate();
    if (this.newProfileElement.message) {
      return void 0;
    }
    this.newProfileElement.disabled = true;
    let profile;
    try {
      if (this.newProfileElement.previewProfile) {
        if (!transient) {
          profile = await this.userDataProfileManagementService.updateProfile(this.newProfileElement.previewProfile, { transient: false });
        }
      } else {
        const { flags, icon: icon2, name, copyFrom } = this.newProfileElement;
        const useDefaultFlags = flags ? flags.settings && flags.keybindings && flags.tasks && flags.globalState && flags.extensions ? void 0 : flags : void 0;
        const createProfileTelemetryData = { source: copyFrom instanceof URI ? "template" : isUserDataProfile(copyFrom) ? "profile" : copyFrom ? "external" : void 0 };
        if (copyFrom instanceof URI) {
          const template2 = await this.newProfileElement.resolveTemplate(copyFrom);
          if (template2) {
            this.telemetryService.publicLog2("userDataProfile.createFromTemplate", createProfileTelemetryData);
            profile = await this.userDataProfileImportExportService.createProfileFromTemplate(
              template2,
              {
                name,
                useDefaultFlags,
                icon: icon2,
                resourceTypeFlags: this.newProfileElement.copyFlags,
                transient
              },
              token ?? CancellationToken.None
            );
          }
        } else if (isUserDataProfile(copyFrom)) {
          profile = await this.userDataProfileImportExportService.createFromProfile(
            copyFrom,
            {
              name,
              useDefaultFlags,
              icon: icon2,
              resourceTypeFlags: this.newProfileElement.copyFlags,
              transient
            },
            token ?? CancellationToken.None
          );
        } else {
          profile = await this.userDataProfileManagementService.createProfile(name, { useDefaultFlags, icon: icon2, transient });
        }
      }
    } finally {
      if (this.newProfileElement) {
        this.newProfileElement.disabled = false;
      }
    }
    if (token?.isCancellationRequested) {
      if (profile) {
        try {
          await this.userDataProfileManagementService.removeProfile(profile);
        } catch (error) {
        }
      }
      return;
    }
    if (profile && !profile.isInternal && this.newProfileElement) {
      this.removeNewProfile();
      const existing = this._profiles.find(([p]) => p.name === profile.name);
      if (existing) {
        this._onDidChange.fire(existing[0]);
      } else {
        this.onDidChangeProfiles({ added: [profile], removed: [], updated: [], all: this.userDataProfilesService.profiles });
      }
    }
    return profile;
  }
  async discardNewProfile() {
    if (!this.newProfileElement) {
      return;
    }
    if (this.newProfileElement.previewProfile) {
      await this.userDataProfileManagementService.removeProfile(this.newProfileElement.previewProfile);
      return;
    }
    this.removeNewProfile();
    this._onDidChange.fire(void 0);
  }
  async removeProfile(profile) {
    const result = await this.dialogService.confirm({
      type: "info",
      message: localize(21693, null, profile.name),
      primaryButton: localize(21692, null),
      cancelButton: localize(21688, null)
    });
    if (result.confirmed) {
      await this.userDataProfileManagementService.removeProfile(profile);
    }
  }
  async openWindow(profile) {
    await this.hostService.openWindow({ forceProfile: profile.name });
  }
};

UserDataProfilesEditorModel = __decorateClass([
  __decorateParam(0, IUserDataProfileService),
  __decorateParam(1, IUserDataProfilesService),
  __decorateParam(2, IUserDataProfileManagementService),
  __decorateParam(3, IUserDataProfileImportExportService),
  __decorateParam(4, IDialogService),
  __decorateParam(5, ITelemetryService),
  __decorateParam(6, IHostService),
  __decorateParam(7, IProductService),
  __decorateParam(8, IOpenerService),
  __decorateParam(9, IInstantiationService)
], UserDataProfilesEditorModel);
export { isProfileResourceTypeElement, isProfileResourceChildElement, AbstractUserDataProfileElement, UserDataProfileElement, USER_DATA_PROFILE_TEMPLATE_PREVIEW_SCHEME, NewProfileElement, UserDataProfilesEditorModel };
