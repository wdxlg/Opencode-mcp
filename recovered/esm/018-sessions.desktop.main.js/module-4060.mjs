// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/localization/common/localizationsActions.ts
import { Action2, MenuId } from "./module-0092.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { ILanguagePackService } from "./module-0924.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { ILocaleService } from "./module-1665.mjs";
import { IExtensionsWorkbenchService } from "./module-1023.mjs";
import { DisposableStore } from "./module-0012.mjs";


// src/vs/workbench/contrib/localization/common/localizationsActions.ts
var ConfigureDisplayLanguageAction = class _ConfigureDisplayLanguageAction extends Action2 {
  static {
    this.ID = "workbench.action.configureLocale";
  }
  constructor() {
    super({
      id: _ConfigureDisplayLanguageAction.ID,
      title: localize2(16574, "Configure Display Language"),
      menu: {
        id: MenuId.CommandPalette
      },
      metadata: {
        description: localize2(16575, "Changes the locale of VS Code based on installed language packs. Common languages include French, Chinese, Spanish, Japanese, German, Korean, and more.")
      }
    });
  }
  async run(accessor) {
    const languagePackService = accessor.get(ILanguagePackService);
    const quickInputService = accessor.get(IQuickInputService);
    const localeService = accessor.get(ILocaleService);
    const extensionWorkbenchService = accessor.get(IExtensionsWorkbenchService);
    const installedLanguages = await languagePackService.getInstalledLanguages();
    const disposables = new DisposableStore();
    const qp = disposables.add(quickInputService.createQuickPick({ useSeparators: true }));
    qp.matchOnDescription = true;
    qp.placeholder = localize(16572, null);
    if (installedLanguages?.length) {
      const items = [{ type: "separator", label: localize(16576, null) }];
      qp.items = items.concat(this.withMoreInfoButton(installedLanguages));
    }
    disposables.add(qp.onDidHide(() => {
      disposables.dispose();
    }));
    const installedSet = new Set(installedLanguages?.map((language2) => language2.id) ?? []);
    languagePackService.getAvailableLanguages().then((availableLanguages) => {
      const newLanguages = availableLanguages.filter((l) => l.id && !installedSet.has(l.id));
      if (newLanguages.length) {
        qp.items = [
          ...qp.items,
          { type: "separator", label: localize(16571, null) },
          ...this.withMoreInfoButton(newLanguages)
        ];
      }
      qp.busy = false;
    });
    disposables.add(qp.onDidAccept(async () => {
      const selectedLanguage = qp.activeItems[0];
      if (selectedLanguage) {
        qp.hide();
        await localeService.setLocale(selectedLanguage);
      }
    }));
    disposables.add(qp.onDidTriggerItemButton(async (e4) => {
      qp.hide();
      if (e4.item.extensionId) {
        await extensionWorkbenchService.open(e4.item.extensionId);
      }
    }));
    qp.show();
    qp.busy = true;
  }
  withMoreInfoButton(items) {
    for (const item of items) {
      if (item.extensionId) {
        item.buttons = [{
          tooltip: localize(16577, null),
          iconClass: "codicon-info"
        }];
      }
    }
    return items;
  }
};

var ClearDisplayLanguageAction = class _ClearDisplayLanguageAction extends Action2 {
  static {
    this.ID = "workbench.action.clearLocalePreference";
  }
  static {
    this.LABEL = localize2(16573, "Clear Display Language Preference");
  }
  constructor() {
    super({
      id: _ClearDisplayLanguageAction.ID,
      title: _ClearDisplayLanguageAction.LABEL,
      menu: {
        id: MenuId.CommandPalette
      }
    });
  }
  async run(accessor) {
    const localeService = accessor.get(ILocaleService);
    await localeService.clearLocalePreference();
  }
};
export { ConfigureDisplayLanguageAction, ClearDisplayLanguageAction };
