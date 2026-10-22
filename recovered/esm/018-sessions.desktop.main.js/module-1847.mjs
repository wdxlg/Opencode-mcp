// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/viewParts/notebookKernelQuickPickStrategy.ts
import { localize } from "./module-0001.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { createCancelablePromise } from "./module-0036.mjs";
import { Event2 } from "./module-0017.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { areSameExtensions } from "./module-0888.mjs";
import { uppercaseFirstLetter } from "./module-0030.mjs";
import { Codicon } from "./module-0085.mjs";
import { JUPYTER_EXTENSION_ID, KERNEL_RECOMMENDATIONS } from "./module-0942.mjs";
import { URI } from "./module-0032.mjs";
import { groupBy2 } from "./module-0007.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { executingStateIcon, selectKernelIcon } from "./module-1846.mjs";
import { SELECT_KERNEL_ID } from "./module-1845.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { INotebookKernelHistoryService, INotebookKernelService } from "./module-1387.mjs";
import { IProductService } from "./module-0875.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { ILabelService } from "./module-0641.mjs";
import { ILogService } from "./module-0095.mjs";
import { IExtensionsWorkbenchService } from "./module-1023.mjs";
import { IExtensionService } from "./module-0889.mjs";
import { IExtensionManagementServerService } from "./module-1047.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IOpenerService } from "./module-0272.mjs";


// src/vs/workbench/contrib/notebook/browser/viewParts/notebookKernelQuickPickStrategy.ts
function isKernelPick(item) {
  return "kernel" in item;
}

function isGroupedKernelsPick(item) {
  return "kernels" in item;
}

function isSourcePick(item) {
  return "action" in item;
}

function isInstallExtensionPick(item) {
  return item.id === "installSuggested" && "extensionIds" in item;
}

function isSearchMarketplacePick(item) {
  return item.id === "install";
}

function isKernelSourceQuickPickItem(item) {
  return "command" in item;
}

function supportAutoRun(item) {
  return "autoRun" in item && !!item.autoRun;
}

var KERNEL_PICKER_UPDATE_DEBOUNCE = 200;

function toKernelQuickPick(kernel, selected) {
  const res = {
    kernel,
    picked: kernel.id === selected?.id,
    label: kernel.label,
    description: kernel.description,
    detail: kernel.detail
  };
  if (kernel.id === selected?.id) {
    if (!res.description) {
      res.description = localize(17900, null);
    } else {
      res.description = localize(17901, null, res.description);
    }
  }
  return res;
}

var KernelPickerStrategyBase = class {
  constructor(_notebookKernelService, _productService, _quickInputService, _labelService, _logService, _extensionWorkbenchService, _extensionService, _commandService, _extensionManagementServerService) {
    this._notebookKernelService = _notebookKernelService;
    this._productService = _productService;
    this._quickInputService = _quickInputService;
    this._labelService = _labelService;
    this._logService = _logService;
    this._extensionWorkbenchService = _extensionWorkbenchService;
    this._extensionService = _extensionService;
    this._commandService = _commandService;
    this._extensionManagementServerService = _extensionManagementServerService;
  }
  async showQuickPick(editor, wantedId, skipAutoRun) {
    const notebook = editor.textModel;
    const scopedContextKeyService = editor.scopedContextKeyService;
    const matchResult = this._getMatchingResult(notebook);
    const { selected, all } = matchResult;
    let newKernel;
    if (wantedId) {
      for (const candidate of all) {
        if (candidate.id === wantedId) {
          newKernel = candidate;
          break;
        }
      }
      if (!newKernel) {
        this._logService.warn(`wanted kernel DOES NOT EXIST, wanted: ${wantedId}, all: ${all.map((k) => k.id)}`);
        return false;
      }
    }
    if (newKernel) {
      this._selecteKernel(notebook, newKernel);
      return true;
    }
    const localDisposableStore = new DisposableStore();
    const quickPick = localDisposableStore.add(this._quickInputService.createQuickPick({ useSeparators: true }));
    const quickPickItems = this._getKernelPickerQuickPickItems(notebook, matchResult, this._notebookKernelService, scopedContextKeyService);
    if (quickPickItems.length === 1 && supportAutoRun(quickPickItems[0]) && !skipAutoRun) {
      const picked = await this._handleQuickPick(editor, quickPickItems[0], quickPickItems);
      localDisposableStore.dispose();
      return picked;
    }
    quickPick.items = quickPickItems;
    quickPick.canSelectMany = false;
    quickPick.placeholder = selected ? localize(17906, null, this._labelService.getUriLabel(notebook.uri, { relative: true })) : localize(17907, null, this._labelService.getUriLabel(notebook.uri, { relative: true }));
    quickPick.busy = this._notebookKernelService.getKernelDetectionTasks(notebook).length > 0;
    const kernelDetectionTaskListener = this._notebookKernelService.onDidChangeKernelDetectionTasks(() => {
      quickPick.busy = this._notebookKernelService.getKernelDetectionTasks(notebook).length > 0;
    });
    const extensionRecommendataionPromise = quickPickItems.length === 0 ? createCancelablePromise((token) => this._showInstallKernelExtensionRecommendation(notebook, quickPick, this._extensionWorkbenchService, token)) : void 0;
    const kernelChangeEventListener = Event2.debounce(
      Event2.any(
        this._notebookKernelService.onDidChangeSourceActions,
        this._notebookKernelService.onDidAddKernel,
        this._notebookKernelService.onDidRemoveKernel,
        this._notebookKernelService.onDidChangeNotebookAffinity
      ),
      (last, _current) => last,
      KERNEL_PICKER_UPDATE_DEBOUNCE
    )(async () => {
      quickPick.busy = false;
      extensionRecommendataionPromise?.cancel();
      const currentActiveItems = quickPick.activeItems;
      const matchResult2 = this._getMatchingResult(notebook);
      const quickPickItems2 = this._getKernelPickerQuickPickItems(notebook, matchResult2, this._notebookKernelService, scopedContextKeyService);
      quickPick.keepScrollPosition = true;
      const activeItems = [];
      for (const item of currentActiveItems) {
        if (isKernelPick(item)) {
          const kernelId = item.kernel.id;
          const sameItem = quickPickItems2.find((pi) => isKernelPick(pi) && pi.kernel.id === kernelId);
          if (sameItem) {
            activeItems.push(sameItem);
          }
        } else if (isSourcePick(item)) {
          const sameItem = quickPickItems2.find((pi) => isSourcePick(pi) && pi.action.action.id === item.action.action.id);
          if (sameItem) {
            activeItems.push(sameItem);
          }
        }
      }
      quickPick.items = quickPickItems2;
      quickPick.activeItems = activeItems;
    }, this);
    const pick = await new Promise((resolve3, reject) => {
      localDisposableStore.add(quickPick.onDidAccept(() => {
        const item = quickPick.selectedItems[0];
        if (item) {
          resolve3({ selected: item, items: quickPick.items });
        } else {
          resolve3({ selected: void 0, items: quickPick.items });
        }
        quickPick.hide();
      }));
      localDisposableStore.add(quickPick.onDidHide(() => {
        kernelDetectionTaskListener.dispose();
        kernelChangeEventListener.dispose();
        quickPick.dispose();
        resolve3({ selected: void 0, items: quickPick.items });
      }));
      quickPick.show();
    });
    localDisposableStore.dispose();
    if (pick.selected) {
      return await this._handleQuickPick(editor, pick.selected, pick.items);
    }
    return false;
  }
  _getMatchingResult(notebook) {
    return this._notebookKernelService.getMatchingKernel(notebook);
  }
  async _handleQuickPick(editor, pick, quickPickItems) {
    if (isKernelPick(pick)) {
      const newKernel = pick.kernel;
      this._selecteKernel(editor.textModel, newKernel);
      return true;
    }
    if (isSearchMarketplacePick(pick)) {
      await this._showKernelExtension(
        this._extensionWorkbenchService,
        this._extensionService,
        this._extensionManagementServerService,
        editor.textModel.viewType,
        []
      );
    } else if (isInstallExtensionPick(pick)) {
      await this._showKernelExtension(
        this._extensionWorkbenchService,
        this._extensionService,
        this._extensionManagementServerService,
        editor.textModel.viewType,
        pick.extensionIds,
        this._productService.quality !== "stable"
      );
    } else if (isSourcePick(pick)) {
      pick.action.runAction();
    }
    return true;
  }
  _selecteKernel(notebook, kernel) {
    this._notebookKernelService.selectKernelForNotebook(kernel, notebook);
  }
  async _showKernelExtension(extensionWorkbenchService, extensionService, extensionManagementServerService, viewType, extIds, isInsiders) {
    const extensionsToInstall = [];
    const extensionsToInstallOnRemote = [];
    const extensionsToEnable = [];
    for (const extId of extIds) {
      const extension = (await extensionWorkbenchService.getExtensions([{ id: extId }], CancellationToken.None))[0];
      if (extension.enablementState === 10 /* DisabledGlobally */ || extension.enablementState === 11 /* DisabledWorkspace */ || extension.enablementState === 2 /* DisabledByEnvironment */) {
        extensionsToEnable.push(extension);
      } else if (!extensionWorkbenchService.installed.some((e4) => areSameExtensions(e4.identifier, extension.identifier))) {
        const canInstall = await extensionWorkbenchService.canInstall(extension);
        if (canInstall === true) {
          extensionsToInstall.push(extension);
        }
      } else if (extensionManagementServerService.remoteExtensionManagementServer) {
        if (extensionWorkbenchService.installed.some((e4) => areSameExtensions(e4.identifier, extension.identifier) && e4.server === extensionManagementServerService.remoteExtensionManagementServer)) {
          continue;
        } else {
          const canInstall = await extensionWorkbenchService.canInstall(extension);
          if (canInstall) {
            extensionsToInstallOnRemote.push(extension);
          }
        }
      }
    }
    if (extensionsToInstall.length || extensionsToEnable.length || extensionsToInstallOnRemote.length) {
      await Promise.all([...extensionsToInstall.map(async (extension) => {
        await extensionWorkbenchService.install(
          extension,
          {
            installPreReleaseVersion: isInsiders ?? false,
            context: { skipWalkthrough: true }
          },
          15 /* Notification */
        );
      }), ...extensionsToEnable.map(async (extension) => {
        switch (extension.enablementState) {
          case 11 /* DisabledWorkspace */:
            await extensionWorkbenchService.setEnablement([extension], 13 /* EnabledWorkspace */);
            return;
          case 10 /* DisabledGlobally */:
            await extensionWorkbenchService.setEnablement([extension], 12 /* EnabledGlobally */);
            return;
          case 2 /* DisabledByEnvironment */:
            await extensionWorkbenchService.setEnablement([extension], 3 /* EnabledByEnvironment */);
            return;
          default:
            break;
        }
      }), ...extensionsToInstallOnRemote.map(async (extension) => {
        await extensionWorkbenchService.installInServer(extension, this._extensionManagementServerService.remoteExtensionManagementServer);
      })]);
      await extensionService.activateByEvent(`onNotebook:${viewType}`);
      return;
    }
    const pascalCased = viewType.split(/[^a-z0-9]/ig).map(uppercaseFirstLetter).join("");
    await extensionWorkbenchService.openSearch(`@tag:notebookKernel${pascalCased}`);
  }
  async _showInstallKernelExtensionRecommendation(notebookTextModel, quickPick, extensionWorkbenchService, token) {
    quickPick.busy = true;
    const newQuickPickItems = await this._getKernelRecommendationsQuickPickItems(notebookTextModel, extensionWorkbenchService);
    quickPick.busy = false;
    if (token.isCancellationRequested) {
      return;
    }
    if (newQuickPickItems && quickPick.items.length === 0) {
      quickPick.items = newQuickPickItems;
    }
  }
  async _getKernelRecommendationsQuickPickItems(notebookTextModel, extensionWorkbenchService) {
    const quickPickItems = [];
    const language2 = this.getSuggestedLanguage(notebookTextModel);
    const suggestedExtension = language2 ? this.getSuggestedKernelFromLanguage(notebookTextModel.viewType, language2) : void 0;
    if (suggestedExtension) {
      await extensionWorkbenchService.queryLocal();
      const extensions = extensionWorkbenchService.installed.filter(
        (e4) => (e4.enablementState === 3 /* EnabledByEnvironment */ || e4.enablementState === 12 /* EnabledGlobally */ || e4.enablementState === 13 /* EnabledWorkspace */) && suggestedExtension.extensionIds.includes(e4.identifier.id)
      );
      if (extensions.length === suggestedExtension.extensionIds.length) {
        return void 0;
      }
      quickPickItems.push({
        id: "installSuggested",
        description: suggestedExtension.displayName ?? suggestedExtension.extensionIds.join(", "),
        label: `$(${Codicon.lightbulb.id}) ` + localize(17902, null),
        extensionIds: suggestedExtension.extensionIds
      });
    }
    quickPickItems.push({
      id: "install",
      label: localize(17908, null)
    });
    return quickPickItems;
  }
  /**
   * Examine the most common language in the notebook
   * @param notebookTextModel The notebook text model
   * @returns What the suggested language is for the notebook. Used for kernal installing
   */
  getSuggestedLanguage(notebookTextModel) {
    const metaData = notebookTextModel.metadata;
    const language_info = metaData?.metadata?.language_info;
    let suggestedKernelLanguage = language_info?.name;
    if (!suggestedKernelLanguage) {
      const cellLanguages = notebookTextModel.cells.map((cell) => cell.language).filter((language2) => language2 !== "markdown");
      if (cellLanguages.length > 1) {
        const firstLanguage = cellLanguages[0];
        if (cellLanguages.every((language2) => language2 === firstLanguage)) {
          suggestedKernelLanguage = firstLanguage;
        }
      }
    }
    return suggestedKernelLanguage;
  }
  /**
   * Given a language and notebook view type suggest a kernel for installation
   * @param language The language to find a suggested kernel extension for
   * @returns A recommednation object for the recommended extension, else undefined
   */
  getSuggestedKernelFromLanguage(viewType, language2) {
    const recommendation = KERNEL_RECOMMENDATIONS.get(viewType)?.get(language2);
    return recommendation;
  }
};

var KernelPickerMRUStrategy = class extends KernelPickerStrategyBase {
  constructor(_notebookKernelService, _productService, _quickInputService, _labelService, _logService, _extensionWorkbenchService, _extensionService, _extensionManagementServerService, _commandService, _notebookKernelHistoryService, _openerService) {
    super(
      _notebookKernelService,
      _productService,
      _quickInputService,
      _labelService,
      _logService,
      _extensionWorkbenchService,
      _extensionService,
      _commandService,
      _extensionManagementServerService
    );
    this._notebookKernelHistoryService = _notebookKernelHistoryService;
    this._openerService = _openerService;
  }
  _getKernelPickerQuickPickItems(notebookTextModel, matchResult, notebookKernelService, scopedContextKeyService) {
    const quickPickItems = [];
    if (matchResult.selected) {
      const kernelItem = toKernelQuickPick(matchResult.selected, matchResult.selected);
      quickPickItems.push(kernelItem);
    }
    matchResult.suggestions.filter((kernel) => kernel.id !== matchResult.selected?.id).map((kernel) => toKernelQuickPick(kernel, matchResult.selected)).forEach((kernel) => {
      quickPickItems.push(kernel);
    });
    const shouldAutoRun = quickPickItems.length === 0;
    if (quickPickItems.length > 0) {
      quickPickItems.push({
        type: "separator"
      });
    }
    quickPickItems.push({
      id: "selectAnother",
      label: localize(17911, null),
      autoRun: shouldAutoRun
    });
    return quickPickItems;
  }
  _selecteKernel(notebook, kernel) {
    const currentInfo = this._notebookKernelService.getMatchingKernel(notebook);
    if (currentInfo.selected) {
      this._notebookKernelHistoryService.addMostRecentKernel(currentInfo.selected);
    }
    super._selecteKernel(notebook, kernel);
    this._notebookKernelHistoryService.addMostRecentKernel(kernel);
  }
  _getMatchingResult(notebook) {
    const { selected, all } = this._notebookKernelHistoryService.getKernels(notebook);
    const matchingResult = this._notebookKernelService.getMatchingKernel(notebook);
    return {
      selected,
      all: matchingResult.all,
      suggestions: all,
      hidden: []
    };
  }
  async _handleQuickPick(editor, pick, items) {
    if (pick.id === "selectAnother") {
      return this.displaySelectAnotherQuickPick(editor, items.length === 1 && items[0] === pick);
    }
    return super._handleQuickPick(editor, pick, items);
  }
  async displaySelectAnotherQuickPick(editor, kernelListEmpty) {
    const notebook = editor.textModel;
    const disposables = new DisposableStore();
    const quickPick = disposables.add(this._quickInputService.createQuickPick({ useSeparators: true }));
    const quickPickItem = await new Promise((resolve3) => {
      quickPick.title = kernelListEmpty ? localize(17909, null) : localize(17910, null);
      quickPick.placeholder = localize(17912, null);
      quickPick.busy = true;
      quickPick.buttons = [this._quickInputService.backButton];
      quickPick.show();
      disposables.add(quickPick.onDidTriggerButton((button) => {
        if (button === this._quickInputService.backButton) {
          resolve3(button);
        }
      }));
      disposables.add(quickPick.onDidTriggerItemButton(async (e4) => {
        if (isKernelSourceQuickPickItem(e4.item) && e4.item.documentation !== void 0) {
          const uri4 = URI.isUri(e4.item.documentation) ? URI.parse(e4.item.documentation) : await this._commandService.executeCommand(e4.item.documentation);
          if (uri4) {
            void this._openerService.open(uri4, { openExternal: true });
          }
        }
      }));
      disposables.add(quickPick.onDidAccept(async () => {
        resolve3(quickPick.selectedItems[0]);
      }));
      disposables.add(quickPick.onDidHide(() => {
        resolve3(void 0);
      }));
      this._calculdateKernelSources(editor).then((quickPickItems) => {
        quickPick.items = quickPickItems;
        if (quickPick.items.length > 0) {
          quickPick.busy = false;
        }
      });
      disposables.add(Event2.debounce(
        Event2.any(
          this._notebookKernelService.onDidChangeSourceActions,
          this._notebookKernelService.onDidAddKernel,
          this._notebookKernelService.onDidRemoveKernel
        ),
        (last, _current) => last,
        KERNEL_PICKER_UPDATE_DEBOUNCE
      )(async () => {
        quickPick.busy = true;
        const quickPickItems = await this._calculdateKernelSources(editor);
        quickPick.items = quickPickItems;
        quickPick.busy = false;
      }));
    });
    quickPick.hide();
    disposables.dispose();
    if (quickPickItem === this._quickInputService.backButton) {
      return this.showQuickPick(editor, void 0, true);
    }
    if (quickPickItem) {
      const selectedKernelPickItem = quickPickItem;
      if (isKernelSourceQuickPickItem(selectedKernelPickItem)) {
        try {
          const selectedKernelId = await this._executeCommand(notebook, selectedKernelPickItem.command);
          if (selectedKernelId) {
            const { all } = await this._getMatchingResult(notebook);
            const kernel = all.find((kernel2) => kernel2.id === `ms-toolsai.jupyter/${selectedKernelId}`);
            if (kernel) {
              await this._selecteKernel(notebook, kernel);
              return true;
            }
            return true;
          } else {
            return this.displaySelectAnotherQuickPick(editor, false);
          }
        } catch (ex) {
          return false;
        }
      } else if (isKernelPick(selectedKernelPickItem)) {
        await this._selecteKernel(notebook, selectedKernelPickItem.kernel);
        return true;
      } else if (isGroupedKernelsPick(selectedKernelPickItem)) {
        await this._selectOneKernel(notebook, selectedKernelPickItem.label, selectedKernelPickItem.kernels);
        return true;
      } else if (isSourcePick(selectedKernelPickItem)) {
        try {
          await selectedKernelPickItem.action.runAction();
          return true;
        } catch (ex) {
          return false;
        }
      } else if (isSearchMarketplacePick(selectedKernelPickItem)) {
        await this._showKernelExtension(
          this._extensionWorkbenchService,
          this._extensionService,
          this._extensionManagementServerService,
          editor.textModel.viewType,
          []
        );
        return true;
      } else if (isInstallExtensionPick(selectedKernelPickItem)) {
        await this._showKernelExtension(
          this._extensionWorkbenchService,
          this._extensionService,
          this._extensionManagementServerService,
          editor.textModel.viewType,
          selectedKernelPickItem.extensionIds,
          this._productService.quality !== "stable"
        );
        return this.displaySelectAnotherQuickPick(editor, false);
      }
    }
    return false;
  }
  async _calculdateKernelSources(editor) {
    const notebook = editor.textModel;
    const sourceActionCommands = this._notebookKernelService.getSourceActions(notebook, editor.scopedContextKeyService);
    const actions = await this._notebookKernelService.getKernelSourceActions2(notebook);
    const matchResult = this._getMatchingResult(notebook);
    if (sourceActionCommands.length === 0 && matchResult.all.length === 0 && actions.length === 0) {
      return await this._getKernelRecommendationsQuickPickItems(notebook, this._extensionWorkbenchService) ?? [];
    }
    const others = matchResult.all.filter((item) => item.extension.value !== JUPYTER_EXTENSION_ID);
    const quickPickItems = [];
    for (const group2 of groupBy2(others, (a, b) => a.extension.value === b.extension.value ? 0 : 1)) {
      const extension = this._extensionService.extensions.find((extension2) => extension2.identifier.value === group2[0].extension.value);
      const source = extension?.displayName ?? extension?.description ?? group2[0].extension.value;
      if (group2.length > 1) {
        quickPickItems.push({
          label: source,
          kernels: group2
        });
      } else {
        quickPickItems.push({
          label: group2[0].label,
          kernel: group2[0]
        });
      }
    }
    const validActions = actions.filter((action) => action.command);
    quickPickItems.push(...validActions.map((action) => {
      const buttons = action.documentation ? [{
        iconClass: ThemeIcon.asClassName(Codicon.info),
        tooltip: localize(17905, null)
      }] : [];
      return {
        id: typeof action.command === "string" ? action.command : action.command.id,
        label: action.label,
        description: action.description,
        command: action.command,
        documentation: action.documentation,
        buttons
      };
    }));
    for (const sourceAction of sourceActionCommands) {
      const res = {
        action: sourceAction,
        picked: false,
        label: sourceAction.action.label,
        tooltip: sourceAction.action.tooltip
      };
      quickPickItems.push(res);
    }
    return quickPickItems;
  }
  async _selectOneKernel(notebook, source, kernels) {
    const quickPickItems = kernels.map((kernel) => toKernelQuickPick(kernel, void 0));
    const localDisposableStore = new DisposableStore();
    const quickPick = localDisposableStore.add(this._quickInputService.createQuickPick({ useSeparators: true }));
    quickPick.items = quickPickItems;
    quickPick.canSelectMany = false;
    quickPick.title = localize(17913, null, source);
    localDisposableStore.add(quickPick.onDidAccept(async () => {
      if (quickPick.selectedItems && quickPick.selectedItems.length > 0 && isKernelPick(quickPick.selectedItems[0])) {
        await this._selecteKernel(notebook, quickPick.selectedItems[0].kernel);
      }
      quickPick.hide();
      quickPick.dispose();
    }));
    localDisposableStore.add(quickPick.onDidHide(() => {
      localDisposableStore.dispose();
    }));
    quickPick.show();
  }
  async _executeCommand(notebook, command4) {
    const id2 = typeof command4 === "string" ? command4 : command4.id;
    const args2 = typeof command4 === "string" ? [] : command4.arguments ?? [];
    if (typeof command4 === "string" || !command4.arguments || !Array.isArray(command4.arguments) || command4.arguments.length === 0) {
      args2.unshift({
        uri: notebook.uri,
        $mid: 14 /* NotebookActionContext */
      });
    }
    if (typeof command4 === "string") {
      return this._commandService.executeCommand(id2);
    } else {
      return this._commandService.executeCommand(id2, ...args2);
    }
  }
  static updateKernelStatusAction(notebook, action, notebookKernelService, notebookKernelHistoryService) {
    const detectionTasks = notebookKernelService.getKernelDetectionTasks(notebook);
    if (detectionTasks.length) {
      const info = notebookKernelService.getMatchingKernel(notebook);
      action.enabled = true;
      action.class = ThemeIcon.asClassName(ThemeIcon.modify(executingStateIcon, "spin"));
      if (info.selected) {
        action.label = info.selected.label;
        const kernelInfo = info.selected.description ?? info.selected.detail;
        action.tooltip = kernelInfo ? localize(17904, null, kernelInfo) : localize(17903, null);
      } else {
        action.label = localize(17903, null);
      }
      return;
    }
    const runningActions = notebookKernelService.getRunningSourceActions(notebook);
    const updateActionFromSourceAction = (sourceAction, running) => {
      const sAction = sourceAction.action;
      action.class = running ? ThemeIcon.asClassName(ThemeIcon.modify(executingStateIcon, "spin")) : ThemeIcon.asClassName(selectKernelIcon);
      action.label = sAction.label;
      action.enabled = true;
    };
    if (runningActions.length) {
      return updateActionFromSourceAction(runningActions[0], true);
    }
    const { selected } = notebookKernelHistoryService.getKernels(notebook);
    if (selected) {
      action.label = selected.label;
      action.class = ThemeIcon.asClassName(selectKernelIcon);
      action.tooltip = selected.description ?? selected.detail ?? "";
    } else {
      action.label = localize(17909, null);
      action.class = ThemeIcon.asClassName(selectKernelIcon);
      action.tooltip = "";
    }
  }
  static async resolveKernel(notebook, notebookKernelService, notebookKernelHistoryService, commandService) {
    const alreadySelected = notebookKernelHistoryService.getKernels(notebook);
    if (alreadySelected.selected) {
      return alreadySelected.selected;
    }
    await commandService.executeCommand(SELECT_KERNEL_ID);
    const { selected } = notebookKernelHistoryService.getKernels(notebook);
    return selected;
  }
};

KernelPickerMRUStrategy = __decorateClass([
  __decorateParam(0, INotebookKernelService),
  __decorateParam(1, IProductService),
  __decorateParam(2, IQuickInputService),
  __decorateParam(3, ILabelService),
  __decorateParam(4, ILogService),
  __decorateParam(5, IExtensionsWorkbenchService),
  __decorateParam(6, IExtensionService),
  __decorateParam(7, IExtensionManagementServerService),
  __decorateParam(8, ICommandService),
  __decorateParam(9, INotebookKernelHistoryService),
  __decorateParam(10, IOpenerService)
], KernelPickerMRUStrategy);
export { isKernelPick, isGroupedKernelsPick, isSourcePick, isInstallExtensionPick, isSearchMarketplacePick, isKernelSourceQuickPickItem, supportAutoRun, toKernelQuickPick, KERNEL_PICKER_UPDATE_DEBOUNCE, KernelPickerStrategyBase, KernelPickerMRUStrategy };
