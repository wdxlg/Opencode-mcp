// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/themes/browser/themes.contribution.ts
import { registerIcon } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Emitter } from "./module-0017.mjs";
import { ThrottledDelayer } from "./module-0036.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { isCancellationError, onUnexpectedError } from "./module-0004.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtensionGalleryService, IExtensionManagementService } from "./module-0872.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { ILogService } from "./module-0095.mjs";
import { IProgressService } from "./module-0446.mjs";
import { IExtensionsWorkbenchService } from "./module-1022.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IWorkbenchEnvironmentService } from "./module-0935.mjs";
import { mainWindow } from "./module-0002.mjs";
import { IExtensionResourceLoaderService } from "./module-0891.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { Action2, MenuId, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { Categories } from "./module-0847.mjs";
import { KeyChord } from "./module-0019.mjs";
import { IWorkbenchThemeService, ThemeSettingDefaults } from "./module-0916.mjs";
import { IPreferencesService } from "./module-1294.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { isHighContrast } from "./module-0247.mjs";
import { FileIconThemeData } from "./module-1677.mjs";
import { DEFAULT_PRODUCT_ICON_THEME_ID, ProductIconThemeData } from "./module-1681.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { CommandsRegistry } from "./module-0087.mjs";
import { equalsIgnoreCase } from "./module-0030.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions6 } from "./module-0226.mjs";
import { Color } from "./module-0197.mjs";
import { colorThemeSchemaId } from "./module-1678.mjs";
import { IEditorService } from "./module-0934.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";


// src/vs/workbench/contrib/themes/browser/themes.contribution.ts
var manageExtensionIcon2 = registerIcon("theme-selection-manage-extension", Codicon.gear, localize(21388, null));

var MarketplaceThemesPicker = class {
  constructor(getMarketplaceColorThemes, marketplaceQuery, extensionGalleryService, extensionManagementService, quickInputService, logService, progressService, extensionsWorkbenchService, dialogService, environmentService) {
    this.getMarketplaceColorThemes = getMarketplaceColorThemes;
    this.marketplaceQuery = marketplaceQuery;
    this.extensionGalleryService = extensionGalleryService;
    this.extensionManagementService = extensionManagementService;
    this.quickInputService = quickInputService;
    this.logService = logService;
    this.progressService = progressService;
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.dialogService = dialogService;
    this.environmentService = environmentService;
    this._marketplaceExtensions = /* @__PURE__ */ new Set();
    this._marketplaceThemes = [];
    this._searchOngoing = false;
    this._searchError = void 0;
    this._onDidChange = new Emitter();
    this._queryDelayer = new ThrottledDelayer(200);
    this._installedExtensions = extensionManagementService.getInstalled().then((installed) => {
      const result = /* @__PURE__ */ new Set();
      for (const ext of installed) {
        result.add(ext.identifier.id);
      }
      return result;
    });
  }
  get themes() {
    return this._marketplaceThemes;
  }
  get onDidChange() {
    return this._onDidChange.event;
  }
  trigger(value2) {
    if (this._tokenSource) {
      this._tokenSource.cancel();
      this._tokenSource = void 0;
    }
    this._queryDelayer.trigger(() => {
      this._tokenSource = new CancellationTokenSource();
      return this.doSearch(value2, this._tokenSource.token);
    });
  }
  async doSearch(value2, token) {
    this._searchOngoing = true;
    this._onDidChange.fire();
    try {
      const installedExtensions = await this._installedExtensions;
      const options3 = { text: `${this.marketplaceQuery} ${value2}`, pageSize: 20 };
      const pager = await this.extensionGalleryService.query(options3, token);
      for (let i2 = 0; i2 < pager.total && i2 < 1; i2++) {
        if (token.isCancellationRequested) {
          break;
        }
        const nThemes = this._marketplaceThemes.length;
        const gallery = i2 === 0 ? pager.firstPage : await pager.getPage(i2, token);
        const promises = [];
        const promisesGalleries = [];
        for (let i3 = 0; i3 < gallery.length; i3++) {
          if (token.isCancellationRequested) {
            break;
          }
          const ext = gallery[i3];
          if (this.environmentService.isSessionsWindow && ext.properties.executesCode) {
            continue;
          }
          if (!installedExtensions.has(ext.identifier.id) && !this._marketplaceExtensions.has(ext.identifier.id)) {
            this._marketplaceExtensions.add(ext.identifier.id);
            promises.push(this.getMarketplaceColorThemes(ext.publisher, ext.name, ext.version));
            promisesGalleries.push(ext);
          }
        }
        const allThemes = await Promise.all(promises);
        for (let i3 = 0; i3 < allThemes.length; i3++) {
          const ext = promisesGalleries[i3];
          for (const theme of allThemes[i3]) {
            this._marketplaceThemes.push({ id: theme.id, theme, label: theme.label, description: `${ext.displayName} \xB7 ${ext.publisherDisplayName}`, galleryExtension: ext, buttons: [configureButton] });
          }
        }
        if (nThemes !== this._marketplaceThemes.length) {
          this._marketplaceThemes.sort((t1, t2) => t1.label.localeCompare(t2.label));
          this._onDidChange.fire();
        }
      }
    } catch (e) {
      if (!isCancellationError(e)) {
        this.logService.error(`Error while searching for themes:`, e);
        this._searchError = "message" in e ? e.message : String(e);
      }
    } finally {
      this._searchOngoing = false;
      this._onDidChange.fire();
    }
  }
  openQuickPick(value2, currentTheme, selectTheme) {
    let result = void 0;
    const disposables = new DisposableStore();
    return new Promise((s, _) => {
      const quickpick = disposables.add(this.quickInputService.createQuickPick());
      quickpick.items = [];
      quickpick.sortByLabel = false;
      quickpick.matchOnDescription = true;
      quickpick.buttons = [this.quickInputService.backButton];
      quickpick.title = "Marketplace Themes";
      quickpick.placeholder = localize(21407, null);
      quickpick.canSelectMany = false;
      disposables.add(quickpick.onDidChangeValue(() => this.trigger(quickpick.value)));
      disposables.add(quickpick.onDidAccept(async (_2) => {
        const themeItem = quickpick.selectedItems[0];
        if (themeItem?.galleryExtension) {
          result = "selected";
          quickpick.hide();
          const success = await this.installExtension(themeItem.galleryExtension);
          if (success) {
            selectTheme(themeItem.theme, true);
          } else {
            selectTheme(currentTheme, true);
          }
        }
      }));
      disposables.add(quickpick.onDidTriggerItemButton((e) => {
        if (isItem(e.item)) {
          const extensionId = e.item.theme?.extensionData?.extensionId;
          if (extensionId) {
            this.extensionsWorkbenchService.openSearch(`@id:${extensionId}`);
          } else {
            this.extensionsWorkbenchService.openSearch(`${this.marketplaceQuery} ${quickpick.value}`);
          }
        }
      }));
      disposables.add(quickpick.onDidChangeActive((themes) => {
        if (result === void 0) {
          selectTheme(themes[0]?.theme, false);
        }
      }));
      disposables.add(quickpick.onDidHide(() => {
        if (result === void 0) {
          selectTheme(currentTheme, true);
          result = "cancelled";
        }
        s(result);
      }));
      disposables.add(quickpick.onDidTriggerButton((e) => {
        if (e === this.quickInputService.backButton) {
          result = "back";
          quickpick.hide();
        }
      }));
      disposables.add(this.onDidChange(() => {
        let items = this.themes;
        if (this._searchOngoing) {
          items = items.concat({ label: "$(loading~spin) Searching for themes...", id: void 0, alwaysShow: true });
        } else if (items.length === 0 && this._searchError) {
          items = [{ label: `$(error) ${localize(21394, null, this._searchError)}`, id: void 0, alwaysShow: true }];
        }
        const activeItemId = quickpick.activeItems[0]?.id;
        const newActiveItem = activeItemId ? items.find((i2) => isItem(i2) && i2.id === activeItemId) : void 0;
        quickpick.items = items;
        if (newActiveItem) {
          quickpick.activeItems = [newActiveItem];
        }
      }));
      this.trigger(value2);
      quickpick.show();
    }).finally(() => {
      disposables.dispose();
    });
  }
  async installExtension(galleryExtension) {
    this.extensionsWorkbenchService.openSearch(`@id:${galleryExtension.identifier.id}`);
    const result = await this.dialogService.confirm({
      message: localize(21383, null, galleryExtension.displayName, galleryExtension.publisherDisplayName),
      primaryButton: localize(21382, null)
    });
    if (!result.confirmed) {
      return false;
    }
    try {
      await this.progressService.withProgress({
        location: 15 /* Notification */,
        title: localize(21385, null, galleryExtension.displayName)
      }, async () => {
        await this.extensionManagementService.installFromGallery(galleryExtension, {
          // Setting this to false is how you get the extension to be synced with Settings Sync (if enabled).
          isMachineScoped: false
        });
      });
      return true;
    } catch (e) {
      this.logService.error(`Problem installing extension ${galleryExtension.identifier.id}`, e);
      return false;
    }
  }
  dispose() {
    if (this._tokenSource) {
      this._tokenSource.cancel();
      this._tokenSource = void 0;
    }
    this._queryDelayer.dispose();
    this._marketplaceExtensions.clear();
    this._marketplaceThemes.length = 0;
    this._onDidChange.dispose();
  }
};

MarketplaceThemesPicker = __decorateClass([
  __decorateParam(2, IExtensionGalleryService),
  __decorateParam(3, IExtensionManagementService),
  __decorateParam(4, IQuickInputService),
  __decorateParam(5, ILogService),
  __decorateParam(6, IProgressService),
  __decorateParam(7, IExtensionsWorkbenchService),
  __decorateParam(8, IDialogService),
  __decorateParam(9, IWorkbenchEnvironmentService)
], MarketplaceThemesPicker);

var InstalledThemesPicker = class {
  constructor(options3, setTheme, getMarketplaceColorThemes, quickInputService, extensionGalleryService, extensionsWorkbenchService, extensionResourceLoaderService, instantiationService) {
    this.options = options3;
    this.setTheme = setTheme;
    this.getMarketplaceColorThemes = getMarketplaceColorThemes;
    this.quickInputService = quickInputService;
    this.extensionGalleryService = extensionGalleryService;
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.extensionResourceLoaderService = extensionResourceLoaderService;
    this.instantiationService = instantiationService;
  }
  async openQuickPick(picks, currentTheme) {
    let marketplaceThemePicker;
    if (this.extensionGalleryService.isEnabled()) {
      if (await this.extensionResourceLoaderService.supportsExtensionGalleryResources() && this.options.browseMessage) {
        marketplaceThemePicker = this.instantiationService.createInstance(MarketplaceThemesPicker, this.getMarketplaceColorThemes.bind(this), this.options.marketplaceTag);
        picks = [configurationEntry(this.options.browseMessage, "marketplace" /* BROWSE_GALLERY */), ...picks];
      } else {
        picks = [...picks, { type: "separator" }, configurationEntry(this.options.installMessage, "extensions" /* EXTENSIONS_VIEW */)];
      }
    }
    let selectThemeTimeout;
    const selectTheme = (theme, applyTheme) => {
      if (selectThemeTimeout) {
        clearTimeout(selectThemeTimeout);
      }
      selectThemeTimeout = mainWindow.setTimeout(() => {
        selectThemeTimeout = void 0;
        const newTheme = theme ?? currentTheme;
        this.setTheme(newTheme, applyTheme ? "auto" : "preview").then(
          void 0,
          (err) => {
            onUnexpectedError(err);
            this.setTheme(currentTheme, void 0);
          }
        );
      }, applyTheme ? 0 : 200);
    };
    const pickInstalledThemes = (activeItemId) => {
      const disposables = new DisposableStore();
      return new Promise((s, _) => {
        let isCompleted = false;
        const autoFocusIndex = picks.findIndex((p) => isItem(p) && p.id === activeItemId);
        const quickpick = disposables.add(this.quickInputService.createQuickPick({ useSeparators: true }));
        quickpick.items = picks;
        quickpick.title = this.options.title;
        quickpick.description = this.options.description;
        quickpick.placeholder = this.options.placeholderMessage;
        quickpick.activeItems = [picks[autoFocusIndex]];
        quickpick.canSelectMany = false;
        quickpick.buttons = this.options.buttons ?? [];
        disposables.add(quickpick.onDidTriggerButton((button) => this.options.onButton?.(button, quickpick)));
        quickpick.matchOnDescription = true;
        disposables.add(quickpick.onDidAccept(async (_2) => {
          isCompleted = true;
          const theme = quickpick.selectedItems[0];
          if (!theme || theme.configureItem) {
            if (!theme || theme.configureItem === "extensions" /* EXTENSIONS_VIEW */) {
              this.extensionsWorkbenchService.openSearch(`${this.options.marketplaceTag} ${quickpick.value}`);
            } else if (theme.configureItem === "marketplace" /* BROWSE_GALLERY */) {
              if (marketplaceThemePicker) {
                const res = await marketplaceThemePicker.openQuickPick(quickpick.value, currentTheme, selectTheme);
                if (res === "back") {
                  await pickInstalledThemes(void 0);
                }
              }
            }
          } else {
            selectTheme(theme.theme, true);
          }
          quickpick.hide();
          s();
        }));
        disposables.add(quickpick.onDidChangeActive((themes) => selectTheme(themes[0]?.theme, false)));
        disposables.add(quickpick.onDidHide(() => {
          if (!isCompleted) {
            selectTheme(currentTheme, true);
            s();
          }
          quickpick.dispose();
        }));
        disposables.add(quickpick.onDidTriggerItemButton((e) => {
          if (isItem(e.item)) {
            const extensionId = e.item.theme?.extensionData?.extensionId;
            if (extensionId) {
              this.extensionsWorkbenchService.openSearch(`@id:${extensionId}`);
            } else {
              this.extensionsWorkbenchService.openSearch(`${this.options.marketplaceTag} ${quickpick.value}`);
            }
          }
        }));
        quickpick.show();
      }).finally(() => {
        disposables.dispose();
      });
    };
    await pickInstalledThemes(currentTheme.id);
    marketplaceThemePicker?.dispose();
  }
};

InstalledThemesPicker = __decorateClass([
  __decorateParam(3, IQuickInputService),
  __decorateParam(4, IExtensionGalleryService),
  __decorateParam(5, IExtensionsWorkbenchService),
  __decorateParam(6, IExtensionResourceLoaderService),
  __decorateParam(7, IInstantiationService)
], InstalledThemesPicker);

var SelectColorThemeCommandId = "workbench.action.selectTheme";

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: SelectColorThemeCommandId,
      title: localize2(21397, "Color Theme"),
      category: Categories.Preferences,
      f1: true,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 50 /* KeyT */)
      }
    });
  }
  getTitle(colorScheme) {
    switch (colorScheme) {
      case "dark" /* DARK */:
        return localize(21411, null);
      case "light" /* LIGHT */:
        return localize(21414, null);
      case "hcDark" /* HIGH_CONTRAST_DARK */:
        return localize(21410, null);
      case "hcLight" /* HIGH_CONTRAST_LIGHT */:
        return localize(21413, null);
      default:
        return localize(21412, null);
    }
  }
  async run(accessor) {
    const themeService = accessor.get(IWorkbenchThemeService);
    const preferencesService = accessor.get(IPreferencesService);
    const preferredColorScheme = themeService.getPreferredColorScheme();
    const modeConfigureButton = {
      tooltip: preferredColorScheme ? localize(21404, null) : localize(21403, null),
      iconClass: ThemeIcon.asClassName(Codicon.colorMode),
      location: 2 /* Inline */
    };
    const options3 = {
      installMessage: localize(21381, null),
      browseMessage: "$(plus) " + localize(21372, null),
      placeholderMessage: this.getTitle(preferredColorScheme),
      marketplaceTag: "category:themes",
      buttons: [modeConfigureButton],
      onButton: async (_button, picker2) => {
        picker2.hide();
        await preferencesService.openSettings({ query: "window.autoDetectColorScheme" /* DETECT_COLOR_SCHEME */ });
      }
    };
    const setTheme = (theme, settingsTarget) => themeService.setColorTheme(theme, settingsTarget);
    const getMarketplaceColorThemes = (publisher, name, version2) => themeService.getMarketplaceColorThemes(publisher, name, version2);
    const instantiationService = accessor.get(IInstantiationService);
    const picker = instantiationService.createInstance(InstalledThemesPicker, options3, setTheme, getMarketplaceColorThemes);
    const themes = await themeService.getColorThemes();
    const currentTheme = themeService.getColorTheme();
    const lightEntries = toEntries(themes.filter((t2) => t2.type === "light" /* LIGHT */), localize(21402, null));
    const darkEntries = toEntries(themes.filter((t2) => t2.type === "dark" /* DARK */), localize(21400, null));
    const hcEntries = toEntries(themes.filter((t2) => isHighContrast(t2.type)), localize(21401, null));
    let picks;
    switch (preferredColorScheme) {
      case "dark" /* DARK */:
        picks = [...darkEntries, ...lightEntries, ...hcEntries];
        break;
      case "hcDark" /* HIGH_CONTRAST_DARK */:
      case "hcLight" /* HIGH_CONTRAST_LIGHT */:
        picks = [...hcEntries, ...lightEntries, ...darkEntries];
        break;
      case "light" /* LIGHT */:
      default:
        picks = [...lightEntries, ...darkEntries, ...hcEntries];
        break;
    }
    await picker.openQuickPick(picks, currentTheme);
  }
});

var SelectFileIconThemeCommandId = "workbench.action.selectIconTheme";

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: SelectFileIconThemeCommandId,
      title: localize2(21395, "File Icon Theme"),
      category: Categories.Preferences,
      f1: true
    });
  }
  async run(accessor) {
    const themeService = accessor.get(IWorkbenchThemeService);
    const options3 = {
      installMessage: localize(21384, null),
      placeholderMessage: localize(21405, null),
      marketplaceTag: "tag:icon-theme"
    };
    const setTheme = (theme, settingsTarget) => themeService.setFileIconTheme(theme, settingsTarget);
    const getMarketplaceColorThemes = (publisher, name, version2) => themeService.getMarketplaceFileIconThemes(publisher, name, version2);
    const instantiationService = accessor.get(IInstantiationService);
    const picker = instantiationService.createInstance(InstalledThemesPicker, options3, setTheme, getMarketplaceColorThemes);
    const picks = [
      { type: "separator", label: localize(21378, null) },
      { id: "", theme: FileIconThemeData.noIconTheme, label: localize(21391, null), description: localize(21390, null) },
      ...toEntries(await themeService.getFileIconThemes())
    ];
    await picker.openQuickPick(picks, themeService.getFileIconTheme());
  }
});

var SelectProductIconThemeCommandId = "workbench.action.selectProductIconTheme";

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: SelectProductIconThemeCommandId,
      title: localize2(21396, "Product Icon Theme"),
      category: Categories.Preferences,
      f1: true
    });
  }
  async run(accessor) {
    const themeService = accessor.get(IWorkbenchThemeService);
    const options3 = {
      installMessage: localize(21386, null),
      browseMessage: "$(plus) " + localize(21373, null),
      placeholderMessage: localize(21408, null),
      marketplaceTag: "tag:product-icon-theme"
    };
    const setTheme = (theme, settingsTarget) => themeService.setProductIconTheme(theme, settingsTarget);
    const getMarketplaceColorThemes = (publisher, name, version2) => themeService.getMarketplaceProductIconThemes(publisher, name, version2);
    const instantiationService = accessor.get(IInstantiationService);
    const picker = instantiationService.createInstance(InstalledThemesPicker, options3, setTheme, getMarketplaceColorThemes);
    const picks = [
      { type: "separator", label: localize(21393, null) },
      { id: DEFAULT_PRODUCT_ICON_THEME_ID, theme: ProductIconThemeData.defaultTheme, label: localize(21377, null) },
      ...toEntries(await themeService.getProductIconThemes())
    ];
    await picker.openQuickPick(picks, themeService.getProductIconTheme());
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.tryNewDefaultThemes",
      title: localize2(21416, "Try New Default Themes"),
      category: Categories.Preferences,
      f1: true
    });
  }
  async run(accessor) {
    const themeService = accessor.get(IWorkbenchThemeService);
    const quickInputService = accessor.get(IQuickInputService);
    const configurationService = accessor.get(IConfigurationService);
    const previousTheme = themeService.getColorTheme();
    const allThemes = await themeService.getColorThemes();
    const newThemeSettingsIds = /* @__PURE__ */ new Set([ThemeSettingDefaults.COLOR_THEME_LIGHT, ThemeSettingDefaults.COLOR_THEME_DARK]);
    const themes = allThemes.filter((t2) => newThemeSettingsIds.has(t2.settingsId));
    const items = themes.map((t2) => ({
      id: t2.id,
      label: t2.label,
      description: t2.description
    }));
    const disposables = new DisposableStore();
    const picker = disposables.add(quickInputService.createQuickPick());
    picker.items = items;
    picker.placeholder = localize(21392, null);
    picker.canSelectMany = false;
    const preferredId = previousTheme.type === "light" /* LIGHT */ || previousTheme.type === "hcLight" /* HIGH_CONTRAST_LIGHT */ ? ThemeSettingDefaults.COLOR_THEME_LIGHT : ThemeSettingDefaults.COLOR_THEME_DARK;
    const activeItem = items.find((i2) => themes.find((t2) => t2.id === i2.id)?.settingsId === preferredId);
    if (activeItem) {
      picker.activeItems = [activeItem];
    }
    disposables.add(picker.onDidChangeActive((selected) => {
      if (selected[0]) {
        const theme = themes.find((t2) => t2.id === selected[0].id);
        if (theme) {
          themeService.setColorTheme(theme, "preview");
        }
      }
    }));
    disposables.add(picker.onDidAccept(() => {
      const selected = picker.activeItems[0];
      const theme = selected ? themes.find((t2) => t2.id === selected.id) : void 0;
      picker.hide();
      if (!theme) {
        return;
      }
      (async () => {
        try {
          await themeService.setColorTheme(theme, "auto");
          await configurationService.updateValue("workbench.preferredLightColorTheme" /* PREFERRED_LIGHT_THEME */, ThemeSettingDefaults.COLOR_THEME_LIGHT);
          await configurationService.updateValue("workbench.preferredDarkColorTheme" /* PREFERRED_DARK_THEME */, ThemeSettingDefaults.COLOR_THEME_DARK);
        } catch (error) {
          if (!isCancellationError(error)) {
            onUnexpectedError(error);
          }
        }
      })();
    }));
    const result = new Promise((resolve3) => {
      disposables.add(picker.onDidHide(() => {
        if (!picker.selectedItems.length) {
          themeService.setColorTheme(previousTheme, void 0);
        }
        resolve3();
      }));
    }).finally(() => disposables.dispose());
    picker.show();
    return result;
  }
});

CommandsRegistry.registerCommand("workbench.action.previewColorTheme", async function(accessor, extension, themeSettingsId) {
  const themeService = accessor.get(IWorkbenchThemeService);
  let themes = findBuiltInThemes(await themeService.getColorThemes(), extension);
  if (themes.length === 0) {
    themes = await themeService.getMarketplaceColorThemes(extension.publisher, extension.name, extension.version);
  }
  for (const theme of themes) {
    if (!themeSettingsId || theme.settingsId === themeSettingsId) {
      await themeService.setColorTheme(theme, "preview");
      return theme.settingsId;
    }
  }
  return void 0;
});

function findBuiltInThemes(themes, extension) {
  return themes.filter(({ extensionData }) => extensionData && extensionData.extensionIsBuiltin && equalsIgnoreCase(extensionData.extensionPublisher, extension.publisher) && equalsIgnoreCase(extensionData.extensionName, extension.name));
}

function configurationEntry(label3, configureItem) {
  return {
    id: void 0,
    label: label3,
    alwaysShow: true,
    buttons: [configureButton],
    configureItem
  };
}

function isItem(i2) {
  return i2["type"] !== "separator";
}

var defaultThemeDescriptions = {
  [ThemeSettingDefaults.COLOR_THEME_LIGHT]: localize(21376, null),
  [ThemeSettingDefaults.COLOR_THEME_DARK]: localize(21375, null)
};

function toEntry(theme) {
  const settingId = theme.settingsId ?? void 0;
  const item = {
    id: theme.id,
    theme,
    label: theme.label,
    description: defaultThemeDescriptions[settingId ?? ""] ?? theme.description ?? (theme.label === settingId ? void 0 : settingId)
  };
  if (theme.extensionData) {
    item.buttons = [configureButton];
  }
  return item;
}

function toEntries(themes, label3) {
  const pinnedIds = /* @__PURE__ */ new Set([ThemeSettingDefaults.COLOR_THEME_DARK, ThemeSettingDefaults.COLOR_THEME_LIGHT]);
  const sorter3 = (t1, t2) => {
    const pin1 = pinnedIds.has(t1.theme?.settingsId ?? "");
    const pin2 = pinnedIds.has(t2.theme?.settingsId ?? "");
    if (pin1 !== pin2) {
      return pin1 ? -1 : 1;
    }
    return t1.label.localeCompare(t2.label);
  };
  const entries2 = themes.map(toEntry).sort(sorter3);
  if (entries2.length > 0 && label3) {
    entries2.unshift({ type: "separator", label: label3 });
  }
  return entries2;
}

var configureButton = {
  iconClass: ThemeIcon.asClassName(manageExtensionIcon2),
  tooltip: localize(21387, null)
};

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.generateColorTheme",
      title: localize2(21379, "Generate Color Theme From Current Settings"),
      category: Categories.Developer,
      f1: true
    });
  }
  run(accessor) {
    const themeService = accessor.get(IWorkbenchThemeService);
    const theme = themeService.getColorTheme();
    const colors = Registry.as(Extensions6.ColorContribution).getColors();
    const colorIds = colors.filter((c) => !c.deprecationMessage).map((c) => c.id).sort();
    const resultingColors = {};
    const inherited = [];
    for (const colorId of colorIds) {
      const color2 = theme.getColor(colorId, false);
      if (color2) {
        resultingColors[colorId] = Color.Format.CSS.formatHexA(color2, true);
      } else {
        inherited.push(colorId);
      }
    }
    const nullDefaults = [];
    for (const id2 of inherited) {
      const color2 = theme.getColor(id2);
      if (color2) {
        resultingColors["__" + id2] = Color.Format.CSS.formatHexA(color2, true);
      } else {
        nullDefaults.push(id2);
      }
    }
    for (const id2 of nullDefaults) {
      resultingColors["__" + id2] = null;
    }
    let contents = JSON.stringify({
      "$schema": colorThemeSchemaId,
      type: theme.type,
      colors: resultingColors,
      tokenColors: theme.tokenColors.filter((t2) => !!t2.scope)
    }, null, "	");
    contents = contents.replace(/\"__/g, '//"');
    const editorService = accessor.get(IEditorService);
    return editorService.openEditor({ resource: void 0, contents, languageId: "jsonc", options: { pinned: true } });
  }
});

var toggleLightDarkThemesCommandId = "workbench.action.toggleLightDarkThemes";

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: toggleLightDarkThemesCommandId,
      title: localize2(21415, "Toggle between Light/Dark Themes"),
      category: Categories.Preferences,
      f1: true
    });
  }
  async run(accessor) {
    const themeService = accessor.get(IWorkbenchThemeService);
    const configurationService = accessor.get(IConfigurationService);
    const notificationService = accessor.get(INotificationService);
    const preferencesService = accessor.get(IPreferencesService);
    if (configurationService.getValue("window.autoDetectColorScheme" /* DETECT_COLOR_SCHEME */)) {
      const message = localize(21374, null, "window.autoDetectColorScheme" /* DETECT_COLOR_SCHEME */);
      notificationService.prompt(Severity2.Info, message, [
        {
          label: localize(21380, null),
          run: () => {
            return preferencesService.openUserSettings({ query: "window.autoDetectColorScheme" /* DETECT_COLOR_SCHEME */ });
          }
        }
      ]);
      return;
    }
    const currentTheme = themeService.getColorTheme();
    let newSettingsId = "workbench.preferredDarkColorTheme" /* PREFERRED_DARK_THEME */;
    switch (currentTheme.type) {
      case "light" /* LIGHT */:
        newSettingsId = "workbench.preferredDarkColorTheme" /* PREFERRED_DARK_THEME */;
        break;
      case "dark" /* DARK */:
        newSettingsId = "workbench.preferredLightColorTheme" /* PREFERRED_LIGHT_THEME */;
        break;
      case "hcLight" /* HIGH_CONTRAST_LIGHT */:
        newSettingsId = "workbench.preferredHighContrastColorTheme" /* PREFERRED_HC_DARK_THEME */;
        break;
      case "hcDark" /* HIGH_CONTRAST_DARK */:
        newSettingsId = "workbench.preferredHighContrastLightColorTheme" /* PREFERRED_HC_LIGHT_THEME */;
        break;
    }
    const themeSettingId = configurationService.getValue(newSettingsId);
    if (themeSettingId && typeof themeSettingId === "string") {
      const theme = (await themeService.getColorThemes()).find((t2) => t2.settingsId === themeSettingId);
      if (theme) {
        themeService.setColorTheme(theme.id, "auto");
      }
    }
  }
});

var browseColorThemesInMarketplaceCommandId = "workbench.action.browseColorThemesInMarketplace";

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: browseColorThemesInMarketplaceCommandId,
      title: localize2(21371, "Browse Color Themes in Marketplace"),
      category: Categories.Preferences,
      f1: true
    });
  }
  async run(accessor) {
    const marketplaceTag = "category:themes";
    const themeService = accessor.get(IWorkbenchThemeService);
    const extensionGalleryService = accessor.get(IExtensionGalleryService);
    const extensionResourceLoaderService = accessor.get(IExtensionResourceLoaderService);
    const extensionsWorkbenchService = accessor.get(IExtensionsWorkbenchService);
    const instantiationService = accessor.get(IInstantiationService);
    if (!extensionGalleryService.isEnabled()) {
      return;
    }
    if (!await extensionResourceLoaderService.supportsExtensionGalleryResources()) {
      await extensionsWorkbenchService.openSearch(marketplaceTag);
      return;
    }
    const currentTheme = themeService.getColorTheme();
    const getMarketplaceColorThemes = (publisher, name, version2) => themeService.getMarketplaceColorThemes(publisher, name, version2);
    let selectThemeTimeout;
    const selectTheme = (theme, applyTheme) => {
      if (selectThemeTimeout) {
        clearTimeout(selectThemeTimeout);
      }
      selectThemeTimeout = mainWindow.setTimeout(() => {
        selectThemeTimeout = void 0;
        const newTheme = theme ?? currentTheme;
        themeService.setColorTheme(newTheme, applyTheme ? "auto" : "preview").then(
          void 0,
          (err) => {
            onUnexpectedError(err);
            themeService.setColorTheme(currentTheme, void 0);
          }
        );
      }, applyTheme ? 0 : 200);
    };
    const marketplaceThemePicker = instantiationService.createInstance(MarketplaceThemesPicker, getMarketplaceColorThemes, marketplaceTag);
    await marketplaceThemePicker.openQuickPick("", themeService.getColorTheme(), selectTheme).then(void 0, onUnexpectedError);
  }
});

var ThemesSubMenu = new MenuId("ThemesSubMenu");

MenuRegistry.appendMenuItem(MenuId.GlobalActivity, {
  title: localize(21399, null),
  submenu: ThemesSubMenu,
  group: "2_configuration",
  order: 7
});

MenuRegistry.appendMenuItem(MenuId.MenubarPreferencesMenu, {
  title: localize(21389, null),
  submenu: ThemesSubMenu,
  group: "2_configuration",
  order: 7
});

MenuRegistry.appendMenuItem(ThemesSubMenu, {
  command: {
    id: SelectColorThemeCommandId,
    title: localize(21398, null)
  },
  order: 1
});

MenuRegistry.appendMenuItem(ThemesSubMenu, {
  command: {
    id: SelectFileIconThemeCommandId,
    title: localize(21406, null)
  },
  order: 2
});

MenuRegistry.appendMenuItem(ThemesSubMenu, {
  command: {
    id: SelectProductIconThemeCommandId,
    title: localize(21409, null)
  },
  order: 3
});
export { findBuiltInThemes, configurationEntry, isItem, toEntry, toEntries, manageExtensionIcon2, MarketplaceThemesPicker, InstalledThemesPicker, SelectColorThemeCommandId, SelectFileIconThemeCommandId, SelectProductIconThemeCommandId, defaultThemeDescriptions, configureButton, toggleLightDarkThemesCommandId, browseColorThemesInMarketplaceCommandId, ThemesSubMenu };
