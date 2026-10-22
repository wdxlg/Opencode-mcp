// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/userDataProfile/browser/userDataProfileImportExportService.ts
import { isUndefined } from "./module-0010.mjs";
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { Schemas } from "./module-0033.mjs";
import { localize } from "./module-0001.mjs";
import { createCancelablePromise } from "./module-0036.mjs";
import { ExtensionsResource, ExtensionsResourceExportTreeItem, ExtensionsResourceTreeItem } from "./module-1716.mjs";
import { SettingsResource, SettingsResourceTreeItem } from "./module-1710.mjs";
import { KeybindingsResource, KeybindingsResourceTreeItem } from "./module-1711.mjs";
import { TasksResource, TasksResourceTreeItem } from "./module-1713.mjs";
import { SnippetsResource, SnippetsResourceTreeItem } from "./module-1712.mjs";
import { GlobalStateResource, GlobalStateResourceExportTreeItem, GlobalStateResourceTreeItem } from "./module-1717.mjs";
import { IUserDataProfileImportExportService, IUserDataProfileManagementService, IUserDataProfileService, PROFILES_CATEGORY, PROFILE_EXTENSION, PROFILE_FILTER, PROFILE_URL_AUTHORITY, PROFILE_URL_AUTHORITY_PREFIX, isProfileURL, toUserDataProfileUri } from "./module-0997.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { severity_default } from "./module-0266.mjs";
import { URI } from "./module-0032.mjs";
import { IRequestService, asText } from "./module-0946.mjs";
import { escapeRegExpCharacters } from "./module-0030.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IUserDataProfilesService } from "./module-0511.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IProgressService } from "./module-0446.mjs";
import { IDialogService, IFileDialogService } from "./module-0267.mjs";
import { IClipboardService } from "./module-0487.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IProductService } from "./module-0873.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IFileService } from "./module-0269.mjs";
import { ITextFileService } from "./module-1063.mjs";
import { Emitter } from "./module-0017.mjs";
import { isMarkdownString } from "./module-0462.mjs";
import { InMemoryFileSystemProvider } from "./module-1718.mjs";
import { joinPath } from "./module-0034.mjs";
import { VSBuffer } from "./module-0038.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/services/userDataProfile/browser/userDataProfileImportExportService.ts
function isUserDataProfileTemplate(thing) {
  const candidate = thing;
  return !!(candidate && typeof candidate === "object" && (candidate.name && typeof candidate.name === "string") && (isUndefined(candidate.icon) || typeof candidate.icon === "string") && (isUndefined(candidate.settings) || typeof candidate.settings === "string") && (isUndefined(candidate.globalState) || typeof candidate.globalState === "string") && (isUndefined(candidate.extensions) || typeof candidate.extensions === "string"));
}

var UserDataProfileImportExportService = class extends Disposable {
  constructor(instantiationService, userDataProfileService, userDataProfileManagementService, userDataProfilesService, extensionService, quickInputService, progressService, dialogService, clipboardService, openerService, requestService, productService, uriIdentityService) {
    super();
    this.instantiationService = instantiationService;
    this.userDataProfileService = userDataProfileService;
    this.userDataProfileManagementService = userDataProfileManagementService;
    this.userDataProfilesService = userDataProfilesService;
    this.extensionService = extensionService;
    this.quickInputService = quickInputService;
    this.progressService = progressService;
    this.dialogService = dialogService;
    this.clipboardService = clipboardService;
    this.openerService = openerService;
    this.requestService = requestService;
    this.productService = productService;
    this.uriIdentityService = uriIdentityService;
    this.profileContentHandlers = /* @__PURE__ */ new Map();
    this.registerProfileContentHandler(Schemas.file, this.fileUserDataProfileContentHandler = instantiationService.createInstance(FileUserDataProfileContentHandler));
  }
  registerProfileContentHandler(id2, profileContentHandler) {
    if (this.profileContentHandlers.has(id2)) {
      throw new Error(`Profile content handler with id '${id2}' already registered.`);
    }
    this.profileContentHandlers.set(id2, profileContentHandler);
    return toDisposable(() => this.unregisterProfileContentHandler(id2));
  }
  unregisterProfileContentHandler(id2) {
    this.profileContentHandlers.delete(id2);
  }
  async createFromProfile(from, options3, token) {
    const disposables = new DisposableStore();
    let creationPromise;
    disposables.add(token.onCancellationRequested(() => creationPromise.cancel()));
    let profile;
    return this.progressService.withProgress({
      location: 15 /* Notification */,
      delay: 500,
      sticky: true,
      cancellable: true
    }, async (progress) => {
      const reportProgress = (message) => progress.report({ message: localize(23630, null, message) });
      creationPromise = createCancelablePromise(async (token2) => {
        const userDataProfilesExportState = disposables.add(this.instantiationService.createInstance(UserDataProfileExportState, from, { ...options3?.resourceTypeFlags, extensions: false }));
        const profileTemplate = await userDataProfilesExportState.getProfileTemplate(options3.name ?? from.name, options3?.icon);
        profile = await this.getProfileToImport({ ...profileTemplate, name: options3.name ?? profileTemplate.name }, !!options3.transient, options3);
        if (!profile) {
          return;
        }
        if (token2.isCancellationRequested) {
          return;
        }
        await this.applyProfileTemplate(profileTemplate, profile, options3, reportProgress, token2);
      });
      try {
        await creationPromise;
        if (profile && (options3?.resourceTypeFlags?.extensions ?? true)) {
          reportProgress(localize(23641, null));
          await this.instantiationService.createInstance(ExtensionsResource).copy(from, profile, false);
        }
      } catch (error) {
        if (profile) {
          await this.userDataProfilesService.removeProfile(profile);
          profile = void 0;
        }
      }
      return profile;
    }, () => creationPromise.cancel()).finally(() => disposables.dispose());
  }
  async createProfileFromTemplate(profileTemplate, options3, token) {
    const disposables = new DisposableStore();
    let creationPromise;
    disposables.add(token.onCancellationRequested(() => creationPromise.cancel()));
    let profile;
    return this.progressService.withProgress({
      location: 15 /* Notification */,
      delay: 500,
      sticky: true,
      cancellable: true
    }, async (progress) => {
      const reportProgress = (message) => progress.report({ message: localize(23630, null, message) });
      creationPromise = createCancelablePromise(async (token2) => {
        profile = await this.getProfileToImport({ ...profileTemplate, name: options3.name ?? profileTemplate.name }, !!options3.transient, options3);
        if (!profile) {
          return;
        }
        if (token2.isCancellationRequested) {
          return;
        }
        await this.applyProfileTemplate(profileTemplate, profile, options3, reportProgress, token2);
      });
      try {
        await creationPromise;
      } catch (error) {
        if (profile) {
          await this.userDataProfilesService.removeProfile(profile);
          profile = void 0;
        }
      }
      return profile;
    }, () => creationPromise.cancel()).finally(() => disposables.dispose());
  }
  async applyProfileTemplate(profileTemplate, profile, options3, reportProgress, token) {
    if (profileTemplate.settings && (options3.resourceTypeFlags?.settings ?? true) && !profile.useDefaultFlags?.settings) {
      reportProgress(localize(23634, null));
      await this.instantiationService.createInstance(SettingsResource).apply(profileTemplate.settings, profile);
    }
    if (token.isCancellationRequested) {
      return;
    }
    if (profileTemplate.keybindings && (options3.resourceTypeFlags?.keybindings ?? true) && !profile.useDefaultFlags?.keybindings) {
      reportProgress(localize(23631, null));
      await this.instantiationService.createInstance(KeybindingsResource).apply(profileTemplate.keybindings, profile);
    }
    if (token.isCancellationRequested) {
      return;
    }
    if (profileTemplate.tasks && (options3.resourceTypeFlags?.tasks ?? true) && !profile.useDefaultFlags?.tasks) {
      reportProgress(localize(23633, null));
      await this.instantiationService.createInstance(TasksResource).apply(profileTemplate.tasks, profile);
    }
    if (token.isCancellationRequested) {
      return;
    }
    if (profileTemplate.snippets && (options3.resourceTypeFlags?.snippets ?? true) && !profile.useDefaultFlags?.snippets) {
      reportProgress(localize(23632, null));
      await this.instantiationService.createInstance(SnippetsResource).apply(profileTemplate.snippets, profile);
    }
    if (token.isCancellationRequested) {
      return;
    }
    if (profileTemplate.globalState && !profile.useDefaultFlags?.globalState) {
      reportProgress(localize(23627, null));
      await this.instantiationService.createInstance(GlobalStateResource).apply(profileTemplate.globalState, profile);
    }
    if (token.isCancellationRequested) {
      return;
    }
    if (profileTemplate.extensions && (options3.resourceTypeFlags?.extensions ?? true) && !profile.useDefaultFlags?.extensions) {
      reportProgress(localize(23641, null));
      await this.instantiationService.createInstance(ExtensionsResource).apply(profileTemplate.extensions, profile, reportProgress, token);
    }
  }
  async exportProfile(profile, exportFlags) {
    const disposables = new DisposableStore();
    try {
      const userDataProfilesExportState = disposables.add(this.instantiationService.createInstance(UserDataProfileExportState, profile, exportFlags));
      await this.doExportProfile(userDataProfilesExportState, 15 /* Notification */);
    } finally {
      disposables.dispose();
    }
  }
  async createTroubleshootProfile() {
    const userDataProfilesExportState = this.instantiationService.createInstance(UserDataProfileExportState, this.userDataProfileService.currentProfile, void 0);
    try {
      const profileTemplate = await userDataProfilesExportState.getProfileTemplate(localize(23660, null), void 0);
      await this.progressService.withProgress({
        location: 15 /* Notification */,
        delay: 1e3,
        sticky: true
      }, async (progress) => {
        const reportProgress = (message) => progress.report({ message: localize(23661, null, message) });
        const profile = await this.doCreateProfile(profileTemplate, true, false, { useDefaultFlags: this.userDataProfileService.currentProfile.useDefaultFlags }, reportProgress);
        if (profile) {
          reportProgress(localize(23650, null));
          await this.instantiationService.createInstance(ExtensionsResource).copy(this.userDataProfileService.currentProfile, profile, true);
          reportProgress(localize(23659, null));
          await this.userDataProfileManagementService.switchProfile(profile);
        }
      });
    } finally {
      userDataProfilesExportState.dispose();
    }
  }
  async doExportProfile(userDataProfilesExportState, location2) {
    const profile = await userDataProfilesExportState.getProfileToExport();
    if (!profile) {
      return;
    }
    const disposables = new DisposableStore();
    try {
      await this.progressService.withProgress({
        location: location2,
        title: localize(23649, null, PROFILES_CATEGORY.value)
      }, async (progress) => {
        const id2 = await this.pickProfileContentHandler(profile.name);
        if (!id2) {
          return;
        }
        const profileContentHandler = this.profileContentHandlers.get(id2);
        if (!profileContentHandler) {
          return;
        }
        const saveResult = await profileContentHandler.saveProfile(profile.name.replace("/", "-"), JSON.stringify(profile), CancellationToken.None);
        if (!saveResult) {
          return;
        }
        const message = localize(23638, null, profile.name);
        if (profileContentHandler.extensionId) {
          const buttons = [];
          const link2 = this.productService.webUrl ? `${this.productService.webUrl}/${PROFILE_URL_AUTHORITY}/${id2}/${saveResult.id}` : toUserDataProfileUri(`/${id2}/${saveResult.id}`, this.productService).toString();
          buttons.push({
            label: localize(23629, null),
            run: () => this.clipboardService.writeText(link2)
          });
          if (this.productService.webUrl) {
            buttons.push({
              label: localize(23644, null),
              run: async () => {
                await this.openerService.open(link2);
              }
            });
          } else {
            buttons.push({
              label: localize(23645, null, profileContentHandler.name),
              run: async () => {
                await this.openerService.open(saveResult.link.toString());
              }
            });
          }
          await this.dialogService.prompt({
            type: severity_default.Info,
            message,
            buttons,
            cancelButton: localize(23628, null)
          });
        } else {
          await this.dialogService.info(message);
        }
      });
    } finally {
      disposables.dispose();
    }
  }
  async resolveProfileTemplate(uri5, options3) {
    const profileContent = await this.resolveProfileContent(uri5);
    if (profileContent === null) {
      return null;
    }
    let profileTemplate;
    try {
      profileTemplate = JSON.parse(profileContent);
    } catch (error) {
      throw new Error(localize(23642, null));
    }
    if (!isUserDataProfileTemplate(profileTemplate)) {
      return null;
    }
    if (options3?.name) {
      profileTemplate.name = options3.name;
    }
    if (options3?.icon) {
      profileTemplate.icon = options3.icon;
    }
    if (options3?.resourceTypeFlags?.settings === false) {
      profileTemplate.settings = void 0;
    }
    if (options3?.resourceTypeFlags?.keybindings === false) {
      profileTemplate.keybindings = void 0;
    }
    if (options3?.resourceTypeFlags?.snippets === false) {
      profileTemplate.snippets = void 0;
    }
    if (options3?.resourceTypeFlags?.tasks === false) {
      profileTemplate.tasks = void 0;
    }
    if (options3?.resourceTypeFlags?.globalState === false) {
      profileTemplate.globalState = void 0;
    }
    if (options3?.resourceTypeFlags?.extensions === false) {
      profileTemplate.extensions = void 0;
    }
    return profileTemplate;
  }
  async doCreateProfile(profileTemplate, temporaryProfile, extensions, options3, progress) {
    const profile = await this.getProfileToImport(profileTemplate, temporaryProfile, options3);
    if (!profile) {
      return void 0;
    }
    if (profileTemplate.settings && !profile.useDefaultFlags?.settings) {
      progress(localize(23653, null));
      await this.instantiationService.createInstance(SettingsResource).apply(profileTemplate.settings, profile);
    }
    if (profileTemplate.keybindings && !profile.useDefaultFlags?.keybindings) {
      progress(localize(23652, null));
      await this.instantiationService.createInstance(KeybindingsResource).apply(profileTemplate.keybindings, profile);
    }
    if (profileTemplate.tasks && !profile.useDefaultFlags?.tasks) {
      progress(localize(23655, null));
      await this.instantiationService.createInstance(TasksResource).apply(profileTemplate.tasks, profile);
    }
    if (profileTemplate.snippets && !profile.useDefaultFlags?.snippets) {
      progress(localize(23654, null));
      await this.instantiationService.createInstance(SnippetsResource).apply(profileTemplate.snippets, profile);
    }
    if (profileTemplate.globalState && !profile.useDefaultFlags?.globalState) {
      progress(localize(23651, null));
      await this.instantiationService.createInstance(GlobalStateResource).apply(profileTemplate.globalState, profile);
    }
    if (profileTemplate.extensions && extensions && !profile.useDefaultFlags?.extensions) {
      progress(localize(23650, null));
      await this.instantiationService.createInstance(ExtensionsResource).apply(profileTemplate.extensions, profile);
    }
    return profile;
  }
  async resolveProfileContent(resource) {
    if (await this.fileUserDataProfileContentHandler.canHandle(resource)) {
      return this.fileUserDataProfileContentHandler.readProfile(resource, CancellationToken.None);
    }
    if (isProfileURL(resource)) {
      let handlerId, idOrUri;
      if (resource.authority === PROFILE_URL_AUTHORITY) {
        idOrUri = this.uriIdentityService.extUri.basename(resource);
        handlerId = this.uriIdentityService.extUri.basename(this.uriIdentityService.extUri.dirname(resource));
      } else {
        handlerId = resource.authority.substring(PROFILE_URL_AUTHORITY_PREFIX.length);
        idOrUri = URI.parse(resource.path.substring(1));
      }
      await this.extensionService.activateByEvent(`onProfile:${handlerId}`);
      const profileContentHandler = this.profileContentHandlers.get(handlerId);
      if (profileContentHandler) {
        return profileContentHandler.readProfile(idOrUri, CancellationToken.None);
      }
    }
    await this.extensionService.activateByEvent("onProfile");
    for (const profileContentHandler of this.profileContentHandlers.values()) {
      const content2 = await profileContentHandler.readProfile(resource, CancellationToken.None);
      if (content2 !== null) {
        return content2;
      }
    }
    const context2 = await this.requestService.request({ type: "GET", url: resource.toString(true), callSite: "userDataProfileImportExportService.resolveContent" }, CancellationToken.None);
    if (context2.res.statusCode === 200) {
      return await asText(context2);
    } else {
      const message = await asText(context2);
      throw new Error(`Failed to get profile from URL: ${resource.toString()}. Status code: ${context2.res.statusCode}. Message: ${message}`);
    }
  }
  async pickProfileContentHandler(name) {
    await this.extensionService.activateByEvent("onProfile");
    if (this.profileContentHandlers.size === 1) {
      return this.profileContentHandlers.keys().next().value;
    }
    const options3 = [];
    for (const [id2, profileContentHandler] of this.profileContentHandlers) {
      options3.push({ id: id2, label: profileContentHandler.name, description: profileContentHandler.description });
    }
    const result = await this.quickInputService.pick(
      options3.reverse(),
      {
        title: localize(23658, null, name),
        hideInput: true
      }
    );
    return result?.id;
  }
  async getProfileToImport(profileTemplate, temp, options3) {
    const profileName = profileTemplate.name;
    const profile = this.userDataProfilesService.profiles.find((p) => p.name === profileName);
    if (profile) {
      if (temp) {
        return this.userDataProfilesService.createNamedProfile(`${profileName} ${this.getProfileNameIndex(profileName)}`, { ...options3, transient: temp });
      }
      const { confirmed } = await this.dialogService.confirm({
        type: severity_default.Info,
        message: localize(23647, null, profileName),
        primaryButton: localize(23646, null)
      });
      if (!confirmed) {
        return void 0;
      }
      return profile.isDefault ? profile : this.userDataProfilesService.updateProfile(profile, options3);
    } else {
      return this.userDataProfilesService.createNamedProfile(profileName, { ...options3, transient: temp });
    }
  }
  getProfileNameIndex(name) {
    const nameRegEx = new RegExp(`${escapeRegExpCharacters(name)}\\s(\\d+)`);
    let nameIndex = 0;
    for (const profile of this.userDataProfilesService.profiles) {
      const matches2 = nameRegEx.exec(profile.name);
      const index2 = matches2 ? parseInt(matches2[1]) : 0;
      nameIndex = index2 > nameIndex ? index2 : nameIndex;
    }
    return nameIndex + 1;
  }
};

UserDataProfileImportExportService = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IUserDataProfileService),
  __decorateParam(2, IUserDataProfileManagementService),
  __decorateParam(3, IUserDataProfilesService),
  __decorateParam(4, IExtensionService),
  __decorateParam(5, IQuickInputService),
  __decorateParam(6, IProgressService),
  __decorateParam(7, IDialogService),
  __decorateParam(8, IClipboardService),
  __decorateParam(9, IOpenerService),
  __decorateParam(10, IRequestService),
  __decorateParam(11, IProductService),
  __decorateParam(12, IUriIdentityService)
], UserDataProfileImportExportService);

var FileUserDataProfileContentHandler = class {
  constructor(fileDialogService, uriIdentityService, fileService, productService, textFileService) {
    this.fileDialogService = fileDialogService;
    this.uriIdentityService = uriIdentityService;
    this.fileService = fileService;
    this.productService = productService;
    this.textFileService = textFileService;
    this.name = localize(23643, null);
    this.description = localize(23639, null);
  }
  async saveProfile(name, content2, token) {
    const link2 = await this.fileDialogService.showSaveDialog({
      title: localize(23635, null),
      filters: PROFILE_FILTER,
      defaultUri: this.uriIdentityService.extUri.joinPath(await this.fileDialogService.defaultFilePath(), `${name}.${PROFILE_EXTENSION}`)
    });
    if (!link2) {
      return null;
    }
    await this.textFileService.create([{ resource: link2, value: content2, options: { overwrite: true } }]);
    return { link: link2, id: link2.toString() };
  }
  async canHandle(uri5) {
    return uri5.scheme !== Schemas.http && uri5.scheme !== Schemas.https && uri5.scheme !== this.productService.urlProtocol && await this.fileService.canHandleResource(uri5);
  }
  async readProfile(uri5, token) {
    if (await this.canHandle(uri5)) {
      return (await this.fileService.readFile(uri5, void 0, token)).value.toString();
    }
    return null;
  }
  async selectProfile() {
    const profileLocation = await this.fileDialogService.showOpenDialog({
      canSelectFolders: false,
      canSelectFiles: true,
      canSelectMany: false,
      filters: PROFILE_FILTER,
      title: localize(23657, null)
    });
    return profileLocation ? profileLocation[0] : null;
  }
};

FileUserDataProfileContentHandler = __decorateClass([
  __decorateParam(0, IFileDialogService),
  __decorateParam(1, IUriIdentityService),
  __decorateParam(2, IFileService),
  __decorateParam(3, IProductService),
  __decorateParam(4, ITextFileService)
], FileUserDataProfileContentHandler);

var USER_DATA_PROFILE_EXPORT_SCHEME = "userdataprofileexport";

var USER_DATA_PROFILE_EXPORT_PREVIEW_SCHEME = "userdataprofileexportpreview";

var UserDataProfileImportExportState = class extends Disposable {
  constructor(quickInputService) {
    super();
    this.quickInputService = quickInputService;
    this._onDidChangeRoots = this._register(new Emitter());
    this.onDidChangeRoots = this._onDidChangeRoots.event;
    this.roots = [];
  }
  async getChildren(element) {
    if (element) {
      const children = await element.getChildren();
      if (children) {
        for (const child of children) {
          if (child.parent.checkbox && child.checkbox) {
            child.checkbox.isChecked = child.parent.checkbox.isChecked && child.checkbox.isChecked;
          }
        }
      }
      return children;
    } else {
      this.rootsPromise = void 0;
      this._onDidChangeRoots.fire();
      return this.getRoots();
    }
  }
  getRoots() {
    if (!this.rootsPromise) {
      this.rootsPromise = (async () => {
        this.roots = await this.fetchRoots();
        for (const root of this.roots) {
          const labelText = isMarkdownString(root.label.label) ? root.label.label.value : root.label.label;
          root.checkbox = {
            isChecked: !root.isFromDefaultProfile(),
            tooltip: localize(23656, null, labelText),
            accessibilityInformation: {
              label: localize(23656, null, labelText)
            }
          };
          if (root.isFromDefaultProfile()) {
            root.description = localize(23640, null);
          }
        }
        return this.roots;
      })();
    }
    return this.rootsPromise;
  }
  isEnabled(resourceType) {
    if (resourceType !== void 0) {
      return this.roots.some((root) => root.type === resourceType && this.isSelected(root));
    }
    return this.roots.some((root) => this.isSelected(root));
  }
  async getProfileTemplate(name, icon2) {
    const roots = await this.getRoots();
    let settings;
    let keybindings;
    let tasks2;
    let snippets;
    let extensions;
    let globalState;
    for (const root of roots) {
      if (!this.isSelected(root)) {
        continue;
      }
      if (root instanceof SettingsResourceTreeItem) {
        settings = await root.getContent();
      } else if (root instanceof KeybindingsResourceTreeItem) {
        keybindings = await root.getContent();
      } else if (root instanceof TasksResourceTreeItem) {
        tasks2 = await root.getContent();
      } else if (root instanceof SnippetsResourceTreeItem) {
        snippets = await root.getContent();
      } else if (root instanceof ExtensionsResourceTreeItem) {
        extensions = await root.getContent();
      } else if (root instanceof GlobalStateResourceTreeItem) {
        globalState = await root.getContent();
      }
    }
    return {
      name,
      icon: icon2,
      settings,
      keybindings,
      tasks: tasks2,
      snippets,
      extensions,
      globalState
    };
  }
  isSelected(treeItem) {
    if (treeItem.checkbox) {
      return treeItem.checkbox.isChecked || !!treeItem.children?.some((child) => child.checkbox?.isChecked);
    }
    return true;
  }
};

UserDataProfileImportExportState = __decorateClass([
  __decorateParam(0, IQuickInputService)
], UserDataProfileImportExportState);

var UserDataProfileExportState = class extends UserDataProfileImportExportState {
  constructor(profile, exportFlags, quickInputService, fileService, instantiationService) {
    super(quickInputService);
    this.profile = profile;
    this.exportFlags = exportFlags;
    this.fileService = fileService;
    this.instantiationService = instantiationService;
    this.disposables = this._register(new DisposableStore());
  }
  async fetchRoots() {
    this.disposables.clear();
    this.disposables.add(this.fileService.registerProvider(USER_DATA_PROFILE_EXPORT_SCHEME, this._register(new InMemoryFileSystemProvider())));
    const previewFileSystemProvider = this._register(new InMemoryFileSystemProvider());
    this.disposables.add(this.fileService.registerProvider(USER_DATA_PROFILE_EXPORT_PREVIEW_SCHEME, previewFileSystemProvider));
    const roots = [];
    const exportPreviewProfle = this.createExportPreviewProfile(this.profile);
    if (this.exportFlags?.settings ?? true) {
      const settingsResource = this.instantiationService.createInstance(SettingsResource);
      const settingsContent = await settingsResource.getContent(this.profile);
      await settingsResource.apply(settingsContent, exportPreviewProfle);
      const settingsResourceTreeItem = this.instantiationService.createInstance(SettingsResourceTreeItem, exportPreviewProfle);
      if (await settingsResourceTreeItem.hasContent()) {
        roots.push(settingsResourceTreeItem);
      }
    }
    if (this.exportFlags?.keybindings ?? true) {
      const keybindingsResource = this.instantiationService.createInstance(KeybindingsResource);
      const keybindingsContent = await keybindingsResource.getContent(this.profile);
      await keybindingsResource.apply(keybindingsContent, exportPreviewProfle);
      const keybindingsResourceTreeItem = this.instantiationService.createInstance(KeybindingsResourceTreeItem, exportPreviewProfle);
      if (await keybindingsResourceTreeItem.hasContent()) {
        roots.push(keybindingsResourceTreeItem);
      }
    }
    if (this.exportFlags?.snippets ?? true) {
      const snippetsResource = this.instantiationService.createInstance(SnippetsResource);
      const snippetsContent = await snippetsResource.getContent(this.profile);
      await snippetsResource.apply(snippetsContent, exportPreviewProfle);
      const snippetsResourceTreeItem = this.instantiationService.createInstance(SnippetsResourceTreeItem, exportPreviewProfle);
      if (await snippetsResourceTreeItem.hasContent()) {
        roots.push(snippetsResourceTreeItem);
      }
    }
    if (this.exportFlags?.tasks ?? true) {
      const tasksResource = this.instantiationService.createInstance(TasksResource);
      const tasksContent = await tasksResource.getContent(this.profile);
      await tasksResource.apply(tasksContent, exportPreviewProfle);
      const tasksResourceTreeItem = this.instantiationService.createInstance(TasksResourceTreeItem, exportPreviewProfle);
      if (await tasksResourceTreeItem.hasContent()) {
        roots.push(tasksResourceTreeItem);
      }
    }
    if (this.exportFlags?.globalState ?? true) {
      const globalStateResource = joinPath(exportPreviewProfle.globalStorageHome, "globalState.json").with({ scheme: USER_DATA_PROFILE_EXPORT_PREVIEW_SCHEME });
      const globalStateResourceTreeItem = this.instantiationService.createInstance(GlobalStateResourceExportTreeItem, exportPreviewProfle, globalStateResource);
      const content2 = await globalStateResourceTreeItem.getContent();
      if (content2) {
        await this.fileService.writeFile(globalStateResource, VSBuffer.fromString(JSON.stringify(JSON.parse(content2), null, "	")));
        roots.push(globalStateResourceTreeItem);
      }
    }
    if (this.exportFlags?.extensions ?? true) {
      const extensionsResourceTreeItem = this.instantiationService.createInstance(ExtensionsResourceExportTreeItem, exportPreviewProfle);
      if (await extensionsResourceTreeItem.hasContent()) {
        roots.push(extensionsResourceTreeItem);
      }
    }
    previewFileSystemProvider.setReadOnly(true);
    return roots;
  }
  createExportPreviewProfile(profile) {
    return {
      id: profile.id,
      name: profile.name,
      location: profile.location,
      isDefault: profile.isDefault,
      icon: profile.icon,
      globalStorageHome: profile.globalStorageHome,
      settingsResource: profile.settingsResource.with({ scheme: USER_DATA_PROFILE_EXPORT_SCHEME }),
      keybindingsResource: profile.keybindingsResource.with({ scheme: USER_DATA_PROFILE_EXPORT_SCHEME }),
      tasksResource: profile.tasksResource.with({ scheme: USER_DATA_PROFILE_EXPORT_SCHEME }),
      mcpResource: profile.mcpResource.with({ scheme: USER_DATA_PROFILE_EXPORT_SCHEME }),
      languageModelsResource: profile.languageModelsResource.with({ scheme: USER_DATA_PROFILE_EXPORT_SCHEME }),
      snippetsHome: profile.snippetsHome.with({ scheme: USER_DATA_PROFILE_EXPORT_SCHEME }),
      promptsHome: profile.promptsHome.with({ scheme: USER_DATA_PROFILE_EXPORT_SCHEME }),
      extensionsResource: profile.extensionsResource,
      cacheHome: profile.cacheHome,
      agentPluginsHome: profile.agentPluginsHome,
      useDefaultFlags: profile.useDefaultFlags,
      isTransient: profile.isTransient
    };
  }
  async getProfileToExport() {
    let name = this.profile.name;
    if (this.profile.isDefault) {
      name = await this.quickInputService.input({
        placeHolder: localize(23636, null),
        title: localize(23637, null),
        async validateInput(input) {
          if (!input.trim()) {
            return localize(23648, null);
          }
          return void 0;
        }
      });
      if (!name) {
        return null;
      }
    }
    return super.getProfileTemplate(name, this.profile.icon);
  }
};

UserDataProfileExportState = __decorateClass([
  __decorateParam(2, IQuickInputService),
  __decorateParam(3, IFileService),
  __decorateParam(4, IInstantiationService)
], UserDataProfileExportState);

registerSingleton(IUserDataProfileImportExportService, UserDataProfileImportExportService, 1 /* Delayed */);
export { isUserDataProfileTemplate, UserDataProfileImportExportService, FileUserDataProfileContentHandler, USER_DATA_PROFILE_EXPORT_SCHEME, USER_DATA_PROFILE_EXPORT_PREVIEW_SCHEME, UserDataProfileImportExportState, UserDataProfileExportState };
