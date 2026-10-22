// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/services/notebookKeymapServiceImpl.ts
import { IExtensionManagementService } from "./module-0872.mjs";
import { IWorkbenchExtensionEnablementService } from "./module-1046.mjs";
import { Event2 } from "./module-0017.mjs";
import { areSameExtensions } from "./module-0886.mjs";
import { Disposable } from "./module-0012.mjs";
import { Memento } from "./module-1041.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { getInstalledExtensions } from "./module-2472.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { localize } from "./module-0001.mjs";
import { distinct } from "./module-0007.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ILifecycleService } from "./module-0868.mjs";


// src/vs/workbench/contrib/notebook/browser/services/notebookKeymapServiceImpl.ts
function onExtensionChanged2(accessor) {
  const extensionService = accessor.get(IExtensionManagementService);
  const extensionEnablementService = accessor.get(IWorkbenchExtensionEnablementService);
  const onDidInstallExtensions = Event2.chain(
    extensionService.onDidInstallExtensions,
    ($110) => $110.filter((e) => e.some(({ operation }) => operation === 2 /* Install */)).map((e) => e.map(({ identifier: identifier2 }) => identifier2))
  );
  return Event2.debounce(Event2.any(
    Event2.any(onDidInstallExtensions, Event2.map(extensionService.onDidUninstallExtension, (e) => [e.identifier])),
    Event2.map(extensionEnablementService.onEnablementChanged, (extensions) => extensions.map((e) => e.identifier))
  ), (result, identifiers2) => {
    result = result || (identifiers2.length ? [identifiers2[0]] : []);
    for (const identifier2 of identifiers2) {
      if (result.some((l) => !areSameExtensions(l, identifier2))) {
        result.push(identifier2);
      }
    }
    return result;
  });
}

var hasRecommendedKeymapKey = "hasRecommendedKeymap";

var NotebookKeymapService = class extends Disposable {
  constructor(instantiationService, extensionEnablementService, notificationService, storageService, lifecycleService) {
    super();
    this.instantiationService = instantiationService;
    this.extensionEnablementService = extensionEnablementService;
    this.notificationService = notificationService;
    this.notebookKeymapMemento = new Memento("notebookKeymap", storageService);
    this.notebookKeymap = this.notebookKeymapMemento.getMemento(0 /* PROFILE */, 0 /* USER */);
    this._register(lifecycleService.onDidShutdown(() => this.dispose()));
    this._register(this.instantiationService.invokeFunction(onExtensionChanged2)(((identifiers2) => {
      Promise.all(identifiers2.map((identifier2) => this.checkForOtherKeymaps(identifier2))).then(void 0, onUnexpectedError);
    })));
  }
  checkForOtherKeymaps(extensionIdentifier) {
    return this.instantiationService.invokeFunction(getInstalledExtensions).then((extensions) => {
      const keymaps = extensions.filter((extension2) => isNotebookKeymapExtension(extension2));
      const extension = keymaps.find((extension2) => areSameExtensions(extension2.identifier, extensionIdentifier));
      if (extension && extension.globallyEnabled) {
        this.notebookKeymap[hasRecommendedKeymapKey] = true;
        this.notebookKeymapMemento.saveMemento();
        const otherKeymaps = keymaps.filter((extension2) => !areSameExtensions(extension2.identifier, extensionIdentifier) && extension2.globallyEnabled);
        if (otherKeymaps.length) {
          return this.promptForDisablingOtherKeymaps(extension, otherKeymaps);
        }
      }
      return void 0;
    });
  }
  promptForDisablingOtherKeymaps(newKeymap, oldKeymaps) {
    const onPrompt = (confirmed) => {
      if (confirmed) {
        this.extensionEnablementService.setEnablement(oldKeymaps.map((keymap) => keymap.local), 10 /* DisabledGlobally */);
      }
    };
    this.notificationService.prompt(
      Severity2.Info,
      localize(17862, null, distinct(oldKeymaps.map((k) => k.local.manifest.displayName)).map((name) => `'${name}'`).join(", ")),
      [{
        label: localize(17864, null),
        run: () => onPrompt(true)
      }, {
        label: localize(17863, null),
        run: () => onPrompt(false)
      }]
    );
  }
};

NotebookKeymapService = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IWorkbenchExtensionEnablementService),
  __decorateParam(2, INotificationService),
  __decorateParam(3, IStorageService),
  __decorateParam(4, ILifecycleService)
], NotebookKeymapService);

function isNotebookKeymapExtension(extension) {
  if (extension.local.manifest.extensionPack) {
    return false;
  }
  const keywords = extension.local.manifest.keywords;
  if (!keywords) {
    return false;
  }
  return keywords.indexOf("notebook-keymap") !== -1;
}
export { onExtensionChanged2, isNotebookKeymapExtension, hasRecommendedKeymapKey, NotebookKeymapService };
