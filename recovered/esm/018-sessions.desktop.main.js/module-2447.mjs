// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/extensions/common/extensionsUtils.ts
import { Disposable } from "./module-0012.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { areSameExtensions } from "./module-0888.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IWorkbenchExtensionEnablementService } from "./module-1047.mjs";
import { IExtensionRecommendationsService } from "./module-1645.mjs";
import { ILifecycleService } from "./module-0870.mjs";
import { IExtensionManagementService } from "./module-0874.mjs";
import { Event2 } from "./module-0017.mjs";


// src/vs/workbench/contrib/extensions/common/extensionsUtils.ts
var KeymapExtensions = class extends Disposable {
  constructor(instantiationService, extensionEnablementService, tipsService, lifecycleService, notificationService) {
    super();
    this.instantiationService = instantiationService;
    this.extensionEnablementService = extensionEnablementService;
    this.tipsService = tipsService;
    this.notificationService = notificationService;
    this._register(lifecycleService.onDidShutdown(() => this.dispose()));
    this._register(instantiationService.invokeFunction(onExtensionChanged)(((identifiers2) => {
      Promise.all(identifiers2.map((identifier2) => this.checkForOtherKeymaps(identifier2))).then(void 0, onUnexpectedError);
    })));
  }
  checkForOtherKeymaps(extensionIdentifier) {
    return this.instantiationService.invokeFunction(getInstalledExtensions).then((extensions) => {
      const keymaps = extensions.filter((extension2) => isKeymapExtension(this.tipsService, extension2));
      const extension = keymaps.find((extension2) => areSameExtensions(extension2.identifier, extensionIdentifier));
      if (extension && extension.globallyEnabled) {
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
      localize(15606, null, oldKeymaps.map((k) => `'${k.local.manifest.displayName}'`).join(", ")),
      [{
        label: localize(15608, null),
        run: () => onPrompt(true)
      }, {
        label: localize(15607, null),
        run: () => onPrompt(false)
      }]
    );
  }
};

KeymapExtensions = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IWorkbenchExtensionEnablementService),
  __decorateParam(2, IExtensionRecommendationsService),
  __decorateParam(3, ILifecycleService),
  __decorateParam(4, INotificationService)
], KeymapExtensions);

function onExtensionChanged(accessor) {
  const extensionService = accessor.get(IExtensionManagementService);
  const extensionEnablementService = accessor.get(IWorkbenchExtensionEnablementService);
  const onDidInstallExtensions = Event2.chain(
    extensionService.onDidInstallExtensions,
    ($129) => $129.filter((e4) => e4.some(({ operation }) => operation === 2 /* Install */)).map((e4) => e4.map(({ identifier: identifier2 }) => identifier2))
  );
  return Event2.debounce(Event2.any(
    Event2.any(onDidInstallExtensions, Event2.map(extensionService.onDidUninstallExtension, (e4) => [e4.identifier])),
    Event2.map(extensionEnablementService.onEnablementChanged, (extensions) => extensions.map((e4) => e4.identifier))
  ), (result, identifiers2) => {
    result = result || [];
    for (const identifier2 of identifiers2) {
      if (result.some((l) => !areSameExtensions(l, identifier2))) {
        result.push(identifier2);
      }
    }
    return result;
  });
}

async function getInstalledExtensions(accessor) {
  const extensionService = accessor.get(IExtensionManagementService);
  const extensionEnablementService = accessor.get(IWorkbenchExtensionEnablementService);
  const extensions = await extensionService.getInstalled();
  return extensions.map((extension) => {
    return {
      identifier: extension.identifier,
      local: extension,
      globallyEnabled: extensionEnablementService.isEnabled(extension)
    };
  });
}

function isKeymapExtension(tipsService, extension) {
  const cats = extension.local.manifest.categories;
  return cats && cats.indexOf("Keymaps") !== -1 || tipsService.getKeymapRecommendations().some((extensionId) => areSameExtensions({ id: extensionId }, extension.local.identifier));
}
export { onExtensionChanged, getInstalledExtensions, isKeymapExtension, KeymapExtensions };
