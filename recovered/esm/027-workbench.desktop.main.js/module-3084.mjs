// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/quickaccess/browser/viewQuickAccess.ts
import { PickerQuickAccessProvider } from "./module-1528.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { matchesFuzzy } from "./module-0453.mjs";
import { fuzzyContains } from "./module-0030.mjs";
import { IDebugService, REPL_VIEW_ID } from "./module-1057.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IViewDescriptorService } from "./module-1093.mjs";
import { IViewsService } from "./module-1246.mjs";
import { IOutputService } from "./module-1245.mjs";
import { ITerminalGroupService, ITerminalService } from "./module-1149.mjs";
import { IPaneCompositePartService } from "./module-1092.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { Action2 } from "./module-0092.mjs";
import { Categories } from "./module-0847.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IKeybindingService } from "./module-0352.mjs";


// src/vs/workbench/contrib/quickaccess/browser/viewQuickAccess.ts
var ViewQuickAccessProvider = class extends PickerQuickAccessProvider {
  constructor(viewDescriptorService, viewsService, outputService, terminalService, terminalGroupService, debugService, paneCompositeService, contextKeyService) {
    super(ViewQuickAccessProvider.PREFIX, {
      noResultsPick: {
        label: localize(18445, null),
        containerLabel: ""
      }
    });
    this.viewDescriptorService = viewDescriptorService;
    this.viewsService = viewsService;
    this.outputService = outputService;
    this.terminalService = terminalService;
    this.terminalGroupService = terminalGroupService;
    this.debugService = debugService;
    this.paneCompositeService = paneCompositeService;
    this.contextKeyService = contextKeyService;
  }
  static {
    this.PREFIX = "view ";
  }
  _getPicks(filter2) {
    const filteredViewEntries = this.doGetViewPickItems().filter((entry) => {
      if (!filter2) {
        return true;
      }
      entry.highlights = { label: matchesFuzzy(filter2, entry.label, true) ?? void 0 };
      return entry.highlights.label || fuzzyContains(entry.containerLabel, filter2);
    });
    const mapEntryToContainer = /* @__PURE__ */ new Map();
    for (const entry of filteredViewEntries) {
      if (!mapEntryToContainer.has(entry.label)) {
        mapEntryToContainer.set(entry.label, entry.containerLabel);
      }
    }
    const filteredViewEntriesWithSeparators = [];
    let lastContainer = void 0;
    for (const entry of filteredViewEntries) {
      if (lastContainer !== entry.containerLabel) {
        lastContainer = entry.containerLabel;
        let separatorLabel;
        if (mapEntryToContainer.has(lastContainer)) {
          separatorLabel = `${mapEntryToContainer.get(lastContainer)} / ${lastContainer}`;
        } else {
          separatorLabel = lastContainer;
        }
        filteredViewEntriesWithSeparators.push({ type: "separator", label: separatorLabel });
      }
      filteredViewEntriesWithSeparators.push(entry);
    }
    return filteredViewEntriesWithSeparators;
  }
  doGetViewPickItems() {
    const viewEntries = [];
    const getViewEntriesForPaneComposite = (paneComposite, viewContainer5) => {
      const viewContainerModel = this.viewDescriptorService.getViewContainerModel(viewContainer5);
      const result = [];
      for (const view of viewContainerModel.allViewDescriptors) {
        if (this.contextKeyService.contextMatchesRules(view.when)) {
          result.push({
            label: view.name.value,
            containerLabel: viewContainerModel.title,
            accept: () => this.viewsService.openView(view.id, true)
          });
        }
      }
      return result;
    };
    const addPaneComposites = (location2, containerLabel) => {
      const paneComposites = this.paneCompositeService.getPaneComposites(location2);
      const visiblePaneCompositeIds = this.paneCompositeService.getVisiblePaneCompositeIds(location2);
      paneComposites.sort((a, b) => {
        let aIndex = visiblePaneCompositeIds.findIndex((id2) => a.id === id2);
        let bIndex = visiblePaneCompositeIds.findIndex((id2) => b.id === id2);
        if (aIndex < 0) {
          aIndex = paneComposites.indexOf(a) + visiblePaneCompositeIds.length;
        }
        if (bIndex < 0) {
          bIndex = paneComposites.indexOf(b) + visiblePaneCompositeIds.length;
        }
        return aIndex - bIndex;
      });
      for (const paneComposite of paneComposites) {
        if (this.includeViewContainer(paneComposite)) {
          const viewContainer5 = this.viewDescriptorService.getViewContainerById(paneComposite.id);
          if (viewContainer5) {
            viewEntries.push({
              label: this.viewDescriptorService.getViewContainerModel(viewContainer5).title,
              containerLabel,
              accept: () => this.paneCompositeService.openPaneComposite(paneComposite.id, location2, true)
            });
          }
        }
      }
    };
    addPaneComposites(0 /* Sidebar */, localize(18452, null));
    addPaneComposites(1 /* Panel */, localize(18447, null));
    addPaneComposites(2 /* AuxiliaryBar */, localize(18449, null));
    const addPaneCompositeViews = (location2) => {
      const paneComposites = this.paneCompositeService.getPaneComposites(location2);
      for (const paneComposite of paneComposites) {
        const viewContainer5 = this.viewDescriptorService.getViewContainerById(paneComposite.id);
        if (viewContainer5) {
          viewEntries.push(...getViewEntriesForPaneComposite(paneComposite, viewContainer5));
        }
      }
    };
    addPaneCompositeViews(0 /* Sidebar */);
    addPaneCompositeViews(1 /* Panel */);
    addPaneCompositeViews(2 /* AuxiliaryBar */);
    this.terminalGroupService.groups.forEach((group2, groupIndex) => {
      group2.terminalInstances.forEach((terminal2, terminalIndex) => {
        const label3 = localize(18451, null, `${groupIndex + 1}.${terminalIndex + 1}`, terminal2.title);
        viewEntries.push({
          label: label3,
          containerLabel: localize(18450, null),
          accept: async () => {
            await this.terminalGroupService.showPanel(true);
            this.terminalService.setActiveInstance(terminal2);
          }
        });
      });
    });
    this.debugService.getModel().getSessions(true).filter((s) => s.hasSeparateRepl()).forEach((session, _) => {
      const label3 = session.name;
      viewEntries.push({
        label: label3,
        containerLabel: localize(18444, null),
        accept: async () => {
          await this.debugService.focusStackFrame(void 0, void 0, session, { explicit: true });
          if (!this.viewsService.isViewVisible(REPL_VIEW_ID)) {
            await this.viewsService.openView(REPL_VIEW_ID, true);
          }
        }
      });
    });
    const channels = this.outputService.getChannelDescriptors();
    for (const channel of channels) {
      viewEntries.push({
        label: channel.label,
        containerLabel: localize(18443, null),
        accept: () => this.outputService.showChannel(channel.id)
      });
    }
    return viewEntries;
  }
  includeViewContainer(container3) {
    const viewContainer5 = this.viewDescriptorService.getViewContainerById(container3.id);
    if (viewContainer5?.hideIfEmpty) {
      return this.viewDescriptorService.getViewContainerModel(viewContainer5).activeViewDescriptors.length > 0;
    }
    return true;
  }
};

ViewQuickAccessProvider = __decorateClass([
  __decorateParam(0, IViewDescriptorService),
  __decorateParam(1, IViewsService),
  __decorateParam(2, IOutputService),
  __decorateParam(3, ITerminalService),
  __decorateParam(4, ITerminalGroupService),
  __decorateParam(5, IDebugService),
  __decorateParam(6, IPaneCompositePartService),
  __decorateParam(7, IContextKeyService)
], ViewQuickAccessProvider);

var OpenViewPickerAction = class _OpenViewPickerAction extends Action2 {
  static {
    this.ID = "workbench.action.openView";
  }
  constructor() {
    super({
      id: _OpenViewPickerAction.ID,
      title: localize2(18446, "Open View"),
      category: Categories.View,
      f1: true
    });
  }
  async run(accessor) {
    accessor.get(IQuickInputService).quickAccess.show(ViewQuickAccessProvider.PREFIX);
  }
};

var QuickAccessViewPickerAction = class _QuickAccessViewPickerAction extends Action2 {
  static {
    this.ID = "workbench.action.quickOpenView";
  }
  static {
    this.KEYBINDING = {
      primary: 2048 /* CtrlCmd */ | 47 /* KeyQ */,
      mac: { primary: 256 /* WinCtrl */ | 47 /* KeyQ */ },
      linux: { primary: 0 }
    };
  }
  constructor() {
    super({
      id: _QuickAccessViewPickerAction.ID,
      title: localize2(18448, "Quick Open View"),
      category: Categories.View,
      f1: false,
      // hide quick pickers from command palette to not confuse with the other entry that shows a input field
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        when: void 0,
        ..._QuickAccessViewPickerAction.KEYBINDING
      }
    });
  }
  async run(accessor) {
    const keybindingService = accessor.get(IKeybindingService);
    const quickInputService = accessor.get(IQuickInputService);
    const keys = keybindingService.lookupKeybindings(_QuickAccessViewPickerAction.ID);
    quickInputService.quickAccess.show(ViewQuickAccessProvider.PREFIX, { quickNavigateConfiguration: { keybindings: keys }, itemActivation: 1 /* FIRST */ });
  }
};
export { ViewQuickAccessProvider, OpenViewPickerAction, QuickAccessViewPickerAction };
