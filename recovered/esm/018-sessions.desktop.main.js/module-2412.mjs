// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/contrib/cellStatusBar/statusBarProviders.ts
import { localize } from "./module-0001.mjs";
import { CHANGE_CELL_LANGUAGE, DETECT_CELL_LANGUAGE } from "./module-0942.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { INotebookService } from "./module-0927.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { INotebookKernelService } from "./module-1387.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ILanguageDetectionService } from "./module-1098.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { Disposable } from "./module-0012.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { INotebookCellStatusBarService } from "./module-1383.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions10 } from "./module-0872.mjs";


// src/vs/workbench/contrib/notebook/browser/contrib/cellStatusBar/statusBarProviders.ts
var CellStatusBarLanguagePickerProvider = class {
  constructor(_notebookService, _languageService) {
    this._notebookService = _notebookService;
    this._languageService = _languageService;
    this.viewType = "*";
  }
  async provideCellStatusBarItems(uri4, index2, _token) {
    const doc = this._notebookService.getNotebookTextModel(uri4);
    const cell = doc?.cells[index2];
    if (!cell) {
      return;
    }
    const statusBarItems = [];
    let displayLanguage = cell.language;
    if (cell.cellKind === 1 /* Markup */) {
      displayLanguage = "markdown";
    } else {
      const registeredId = this._languageService.getLanguageIdByLanguageName(cell.language);
      if (registeredId) {
        displayLanguage = this._languageService.getLanguageName(displayLanguage) ?? displayLanguage;
      } else {
        const searchTooltip = localize(17417, null, cell.language);
        statusBarItems.push({
          text: `$(dialog-warning)`,
          command: { id: "workbench.extensions.search", arguments: [`@tag:${cell.language}`], title: "Search Extensions" },
          tooltip: searchTooltip,
          alignment: 2 /* Right */,
          priority: -Number.MAX_SAFE_INTEGER + 1
        });
      }
    }
    statusBarItems.push({
      text: displayLanguage,
      command: CHANGE_CELL_LANGUAGE,
      tooltip: localize(17416, null),
      alignment: 2 /* Right */,
      priority: -Number.MAX_SAFE_INTEGER
    });
    return {
      items: statusBarItems
    };
  }
};

CellStatusBarLanguagePickerProvider = __decorateClass([
  __decorateParam(0, INotebookService),
  __decorateParam(1, ILanguageService)
], CellStatusBarLanguagePickerProvider);

var CellStatusBarLanguageDetectionProvider = class {
  constructor(_notebookService, _notebookKernelService, _languageService, _configurationService, _languageDetectionService, _keybindingService) {
    this._notebookService = _notebookService;
    this._notebookKernelService = _notebookKernelService;
    this._languageService = _languageService;
    this._configurationService = _configurationService;
    this._languageDetectionService = _languageDetectionService;
    this._keybindingService = _keybindingService;
    this.viewType = "*";
    this.cache = new ResourceMap();
  }
  async provideCellStatusBarItems(uri4, index2, token) {
    const doc = this._notebookService.getNotebookTextModel(uri4);
    const cell = doc?.cells[index2];
    if (!cell) {
      return;
    }
    const enablementConfig = this._configurationService.getValue("workbench.editor.languageDetectionHints");
    const enabled = typeof enablementConfig === "object" && enablementConfig?.notebookEditors;
    if (!enabled) {
      return;
    }
    const cellUri = cell.uri;
    const contentVersion = cell.textModel?.getVersionId();
    if (!contentVersion) {
      return;
    }
    const currentLanguageId = cell.cellKind === 1 /* Markup */ ? "markdown" : this._languageService.getLanguageIdByLanguageName(cell.language) || cell.language;
    if (!this.cache.has(cellUri)) {
      this.cache.set(cellUri, {
        cellLanguage: currentLanguageId,
        // force a re-compute upon a change in configured language
        updateTimestamp: 0,
        // facilitates a disposable-free debounce operation
        contentVersion: 1
        // dont run for the initial contents, only on update
      });
    }
    const cached = this.cache.get(cellUri);
    if (cached.cellLanguage !== currentLanguageId || cached.updateTimestamp < Date.now() - 1e3 && cached.contentVersion !== contentVersion) {
      cached.updateTimestamp = Date.now();
      cached.cellLanguage = currentLanguageId;
      cached.contentVersion = contentVersion;
      const kernel = this._notebookKernelService.getSelectedOrSuggestedKernel(doc);
      if (kernel) {
        const supportedLangs = [...kernel.supportedLanguages, "markdown"];
        cached.guess = await this._languageDetectionService.detectLanguage(cell.uri, supportedLangs);
      }
    }
    const items = [];
    if (cached.guess && currentLanguageId !== cached.guess) {
      const detectedName = this._languageService.getLanguageName(cached.guess) || cached.guess;
      const tooltip = this._keybindingService.appendKeybinding(
        localize(17415, null, detectedName),
        DETECT_CELL_LANGUAGE
      );
      items.push({
        text: "$(lightbulb-autofix)",
        command: DETECT_CELL_LANGUAGE,
        tooltip,
        alignment: 2 /* Right */,
        priority: -Number.MAX_SAFE_INTEGER + 1
      });
    }
    return { items };
  }
};

CellStatusBarLanguageDetectionProvider = __decorateClass([
  __decorateParam(0, INotebookService),
  __decorateParam(1, INotebookKernelService),
  __decorateParam(2, ILanguageService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, ILanguageDetectionService),
  __decorateParam(5, IKeybindingService)
], CellStatusBarLanguageDetectionProvider);

var BuiltinCellStatusBarProviders = class extends Disposable {
  constructor(instantiationService, notebookCellStatusBarService) {
    super();
    const builtinProviders = [
      CellStatusBarLanguagePickerProvider,
      CellStatusBarLanguageDetectionProvider
    ];
    builtinProviders.forEach((p) => {
      this._register(notebookCellStatusBarService.registerCellStatusBarItemProvider(instantiationService.createInstance(p)));
    });
  }
};

BuiltinCellStatusBarProviders = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, INotebookCellStatusBarService)
], BuiltinCellStatusBarProviders);

Registry.as(Extensions10.Workbench).registerWorkbenchContribution(BuiltinCellStatusBarProviders, 3 /* Restored */);
export { CellStatusBarLanguagePickerProvider, CellStatusBarLanguageDetectionProvider, BuiltinCellStatusBarProviders };
