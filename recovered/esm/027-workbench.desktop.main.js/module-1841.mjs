// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/preferences/browser/preferencesActions.ts
import { Action } from "./module-0082.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { URI } from "./module-0032.mjs";
import { getIconClasses } from "./module-0755.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IModelService } from "./module-0080.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IPreferencesService } from "./module-1294.mjs";
import { CommandsRegistry } from "./module-0087.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { IFileService } from "./module-0269.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { IWorkbenchExtensionEnablementService, IWorkbenchExtensionManagementService } from "./module-1046.mjs";
import { ExtensionIdentifierSet } from "./module-0688.mjs";
import { timeout } from "./module-0036.mjs";
import { VSBuffer } from "./module-0038.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { EditorExtensionsRegistry } from "./module-0097.mjs";
import { isLocalizedString } from "./module-0505.mjs";
import { MenuId, MenuRegistry, isIMenuItem } from "./module-0092.mjs";


// src/vs/workbench/contrib/preferences/browser/preferencesActions.ts
var ConfigureLanguageBasedSettingsAction = class extends Action {
  constructor(id2, label3, modelService, languageService, quickInputService, preferencesService) {
    super(id2, label3);
    this.modelService = modelService;
    this.languageService = languageService;
    this.quickInputService = quickInputService;
    this.preferencesService = preferencesService;
  }
  static {
    this.ID = "workbench.action.configureLanguageBasedSettings";
  }
  static {
    this.LABEL = localize2(18144, "Configure Language Specific Settings...");
  }
  async run() {
    const languages = this.languageService.getSortedRegisteredLanguageNames();
    const picks = languages.map(({ languageName, languageId }) => {
      const description = localize(18145, null, languageId);
      let fakeResource;
      const extensions = this.languageService.getExtensions(languageId);
      if (extensions.length) {
        fakeResource = URI.file(extensions[0]);
      } else {
        const filenames = this.languageService.getFilenames(languageId);
        if (filenames.length) {
          fakeResource = URI.file(filenames[0]);
        }
      }
      return {
        label: languageName,
        iconClasses: getIconClasses(this.modelService, this.languageService, fakeResource),
        description
      };
    });
    await this.quickInputService.pick(picks, { placeHolder: localize(18146, null) }).then((pick) => {
      if (pick) {
        const languageId = this.languageService.getLanguageIdByLanguageName(pick.label);
        if (typeof languageId === "string") {
          return this.preferencesService.openLanguageSpecificSettings(languageId);
        }
      }
      return void 0;
    });
  }
};

ConfigureLanguageBasedSettingsAction = __decorateClass([
  __decorateParam(2, IModelService),
  __decorateParam(3, ILanguageService),
  __decorateParam(4, IQuickInputService),
  __decorateParam(5, IPreferencesService)
], ConfigureLanguageBasedSettingsAction);

CommandsRegistry.registerCommand({
  id: "_getAllSettings",
  handler: () => {
    const configRegistry = Registry.as(Extensions4.Configuration);
    const allSettings2 = configRegistry.getConfigurationProperties();
    return allSettings2;
  }
});

CommandsRegistry.registerCommand({
  id: "_developer.getConfigurationInformation",
  handler: async (accessor, path) => {
    const configRegistry = Registry.as(Extensions4.Configuration);
    const fileService = accessor.get(IFileService);
    const extensionService = accessor.get(IExtensionService);
    const extensionManagementService = accessor.get(IWorkbenchExtensionManagementService);
    const extensionEnablementService = accessor.get(IWorkbenchExtensionEnablementService);
    await extensionService.whenInstalledExtensionsRegistered();
    const installed = await extensionManagementService.getInstalled();
    const toEnable = installed.filter((e) => e.isBuiltin && extensionEnablementService.canChangeEnablement(e) && !extensionEnablementService.isEnabled(e));
    if (toEnable.length) {
      const pending = new ExtensionIdentifierSet(toEnable.map((e) => e.identifier.id));
      for (const ext of extensionService.extensions) {
        pending.delete(ext.identifier);
      }
      let sub;
      const allRegistered = pending.size === 0 ? Promise.resolve() : new Promise((resolve3) => {
        sub = extensionService.onDidChangeExtensions(({ added }) => {
          for (const ext of added) {
            pending.delete(ext.identifier);
          }
          if (pending.size === 0) {
            resolve3();
          }
        });
      });
      try {
        await extensionEnablementService.setEnablement(toEnable, 12 /* EnabledGlobally */);
        await Promise.race([allRegistered, timeout(15e3)]);
      } finally {
        sub?.dispose();
      }
      await extensionService.whenInstalledExtensionsRegistered();
    }
    const configurationProperties = configRegistry.getConfigurationProperties();
    const configurationInformation = Object.fromEntries(Object.entries(configurationProperties).map(([key3, property]) => {
      const { defaultValueSource, ...schema10 } = property;
      return [key3, schema10];
    }));
    const content2 = JSON.stringify(configurationInformation);
    if (!path) {
      return content2;
    }
    const targetUri = URI.isUri(path) ? path : /^[a-zA-Z][a-zA-Z\d+.-]*:\/\//.test(path) ? URI.parse(path) : URI.file(path);
    await fileService.writeFile(targetUri, VSBuffer.fromString(content2));
    return targetUri;
  }
});

CommandsRegistry.registerCommand("_getAllCommands", function(accessor, filterByPrecondition) {
  const keybindingService = accessor.get(IKeybindingService);
  const contextKeyService = accessor.get(IContextKeyService);
  const actions = [];
  for (const editorAction of EditorExtensionsRegistry.getEditorActions()) {
    const keybinding = keybindingService.lookupKeybinding(editorAction.id);
    if (filterByPrecondition && !contextKeyService.contextMatchesRules(editorAction.precondition)) {
      continue;
    }
    actions.push({
      command: editorAction.id,
      label: editorAction.label,
      description: isLocalizedString(editorAction.metadata?.description) ? editorAction.metadata.description.value : editorAction.metadata?.description,
      precondition: editorAction.precondition?.serialize(),
      keybinding: keybinding?.getLabel() ?? "Not set"
    });
  }
  for (const menuItem of MenuRegistry.getMenuItems(MenuId.CommandPalette)) {
    if (isIMenuItem(menuItem)) {
      if (filterByPrecondition && !contextKeyService.contextMatchesRules(menuItem.when)) {
        continue;
      }
      const title = typeof menuItem.command.title === "string" ? menuItem.command.title : menuItem.command.title.value;
      const category11 = menuItem.command.category ? typeof menuItem.command.category === "string" ? menuItem.command.category : menuItem.command.category.value : void 0;
      const label3 = category11 ? `${category11}: ${title}` : title;
      const description = isLocalizedString(menuItem.command.metadata?.description) ? menuItem.command.metadata.description.value : menuItem.command.metadata?.description;
      const keybinding = keybindingService.lookupKeybinding(menuItem.command.id);
      actions.push({
        command: menuItem.command.id,
        label: label3,
        description,
        precondition: menuItem.when?.serialize(),
        keybinding: keybinding?.getLabel() ?? "Not set"
      });
    }
  }
  return actions;
});
export { ConfigureLanguageBasedSettingsAction };
