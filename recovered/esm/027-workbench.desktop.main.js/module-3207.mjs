// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/markers/browser/markers.contribution.ts
import { KeybindingsRegistry } from "./module-0091.mjs";
import { Markers, MarkersContextKeys } from "./module-3192.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { IViewsService } from "./module-1246.mjs";
import { Marker3, RelatedInformation, ResourceMarkers } from "./module-3198.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { problemsConfigurationNodeBase } from "./module-1112.mjs";
import { Messages } from "./module-3200.mjs";
import { registerIcon } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Extensions13 } from "./module-1093.mjs";
import { SyncDescriptor } from "./module-0134.mjs";
import { ViewPaneContainer } from "./module-1382.mjs";
import { MarkersView } from "./module-3204.mjs";
import { Extensions10, WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0870.mjs";
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { ViewAction } from "./module-1335.mjs";
import { viewFilterSubmenu } from "./module-1333.mjs";
import { Categories } from "./module-0847.mjs";
import { FocusedViewContext, getVisbileViewContextKey } from "./module-0949.mjs";
import { IClipboardService } from "./module-0487.mjs";
import { Disposable, MutableDisposable } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IMarkerService } from "./module-0560.mjs";
import { IStatusbarService } from "./module-0893.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { MarkerChatContextContribution } from "./module-3205.mjs";
import { IActivityService, NumberBadge } from "./module-1449.mjs";
import { AccessibleViewRegistry } from "./module-0693.mjs";
import { ProblemsAccessibilityHelp } from "./module-3206.mjs";


// src/vs/workbench/contrib/markers/browser/markers.contribution.ts
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: Markers.MARKER_OPEN_ACTION_ID,
  weight: 200 /* WorkbenchContrib */,
  when: ContextKeyExpr.and(MarkersContextKeys.MarkerFocusContextKey),
  primary: 3 /* Enter */,
  mac: {
    primary: 3 /* Enter */,
    secondary: [2048 /* CtrlCmd */ | 18 /* DownArrow */]
  },
  handler: (accessor, args2) => {
    const markersView = accessor.get(IViewsService).getActiveViewWithId(Markers.MARKERS_VIEW_ID);
    markersView.openFileAtElement(markersView.getFocusElement(), false, false, true);
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: Markers.MARKER_OPEN_SIDE_ACTION_ID,
  weight: 200 /* WorkbenchContrib */,
  when: ContextKeyExpr.and(MarkersContextKeys.MarkerFocusContextKey),
  primary: 2048 /* CtrlCmd */ | 3 /* Enter */,
  mac: {
    primary: 256 /* WinCtrl */ | 3 /* Enter */
  },
  handler: (accessor, args2) => {
    const markersView = accessor.get(IViewsService).getActiveViewWithId(Markers.MARKERS_VIEW_ID);
    markersView.openFileAtElement(markersView.getFocusElement(), false, true, true);
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: Markers.MARKER_SHOW_PANEL_ID,
  weight: 200 /* WorkbenchContrib */,
  when: void 0,
  primary: void 0,
  handler: async (accessor, args2) => {
    await accessor.get(IViewsService).openView(Markers.MARKERS_VIEW_ID);
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: Markers.MARKER_SHOW_QUICK_FIX,
  weight: 200 /* WorkbenchContrib */,
  when: MarkersContextKeys.MarkerFocusContextKey,
  primary: 2048 /* CtrlCmd */ | 89 /* Period */,
  handler: (accessor, args2) => {
    const markersView = accessor.get(IViewsService).getActiveViewWithId(Markers.MARKERS_VIEW_ID);
    const focusedElement = markersView.getFocusElement();
    if (focusedElement instanceof Marker3) {
      markersView.showQuickFixes(focusedElement);
    }
  }
});

Registry.as(Extensions4.Configuration).registerConfiguration({
  ...problemsConfigurationNodeBase,
  "properties": {
    "problems.autoReveal": {
      "description": Messages.PROBLEMS_PANEL_CONFIGURATION_AUTO_REVEAL,
      "type": "boolean",
      "default": true
    },
    "problems.defaultViewMode": {
      "description": Messages.PROBLEMS_PANEL_CONFIGURATION_VIEW_MODE,
      "type": "string",
      "default": "tree",
      "enum": ["table", "tree"]
    },
    "problems.showCurrentInStatus": {
      "description": Messages.PROBLEMS_PANEL_CONFIGURATION_SHOW_CURRENT_STATUS,
      "type": "boolean",
      "default": false
    },
    "problems.sortOrder": {
      "description": Messages.PROBLEMS_PANEL_CONFIGURATION_COMPARE_ORDER,
      "type": "string",
      "default": "severity",
      "enum": ["severity", "position"],
      "enumDescriptions": [
        Messages.PROBLEMS_PANEL_CONFIGURATION_COMPARE_ORDER_SEVERITY,
        Messages.PROBLEMS_PANEL_CONFIGURATION_COMPARE_ORDER_POSITION
      ]
    }
  }
});

var markersViewIcon = registerIcon("markers-view-icon", Codicon.warning, localize(16628, null));

var VIEW_CONTAINER4 = Registry.as(Extensions13.ViewContainersRegistry).registerViewContainer({
  id: Markers.MARKERS_CONTAINER_ID,
  title: Messages.MARKERS_PANEL_TITLE_PROBLEMS,
  icon: markersViewIcon,
  hideIfEmpty: true,
  order: 0,
  ctorDescriptor: new SyncDescriptor(ViewPaneContainer, [Markers.MARKERS_CONTAINER_ID, { mergeViewWithContainerWhenSingleView: true }]),
  storageId: Markers.MARKERS_VIEW_STORAGE_ID,
  windowEnablement: 3 /* Both */
}, 1 /* Panel */, { doNotRegisterOpenCommand: true });

Registry.as(Extensions13.ViewsRegistry).registerViews([{
  id: Markers.MARKERS_VIEW_ID,
  containerIcon: markersViewIcon,
  name: Messages.MARKERS_PANEL_TITLE_PROBLEMS,
  canToggleVisibility: true,
  canMoveView: true,
  ctorDescriptor: new SyncDescriptor(MarkersView),
  openCommandActionDescriptor: {
    id: "workbench.actions.view.problems",
    mnemonicTitle: localize(16629, null),
    keybindings: { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 43 /* KeyM */ },
    order: 0
  },
  windowEnablement: 3 /* Both */
}], VIEW_CONTAINER4);

var workbenchRegistry2 = Registry.as(Extensions10.Workbench);

registerAction2(class extends ViewAction {
  constructor() {
    super({
      id: `workbench.actions.table.${Markers.MARKERS_VIEW_ID}.viewAsTree`,
      title: localize(16653, null),
      metadata: {
        description: localize2(16654, "Show the problems view as a tree.")
      },
      menu: {
        id: MenuId.ViewTitle,
        when: ContextKeyExpr.and(ContextKeyExpr.equals("view", Markers.MARKERS_VIEW_ID), MarkersContextKeys.MarkersViewModeContextKey.isEqualTo("table" /* Table */)),
        group: "navigation",
        order: 3
      },
      icon: Codicon.listTree,
      viewId: Markers.MARKERS_VIEW_ID
    });
  }
  async runInView(serviceAccessor, view) {
    view.setViewMode("tree" /* Tree */);
  }
});

registerAction2(class extends ViewAction {
  constructor() {
    super({
      id: `workbench.actions.table.${Markers.MARKERS_VIEW_ID}.viewAsTable`,
      title: localize(16651, null),
      metadata: {
        description: localize2(16652, "Show the problems view as a table.")
      },
      menu: {
        id: MenuId.ViewTitle,
        when: ContextKeyExpr.and(ContextKeyExpr.equals("view", Markers.MARKERS_VIEW_ID), MarkersContextKeys.MarkersViewModeContextKey.isEqualTo("tree" /* Tree */)),
        group: "navigation",
        order: 3
      },
      icon: Codicon.listFlat,
      viewId: Markers.MARKERS_VIEW_ID
    });
  }
  async runInView(serviceAccessor, view) {
    view.setViewMode("table" /* Table */);
  }
});

registerAction2(class extends ViewAction {
  constructor() {
    super({
      id: `workbench.actions.${Markers.MARKERS_VIEW_ID}.toggleErrors`,
      title: localize(16633, null),
      metadata: {
        description: localize2(16643, "Show or hide errors in the problems view.")
      },
      category: localize(16631, null),
      toggled: MarkersContextKeys.ShowErrorsFilterContextKey,
      menu: {
        id: viewFilterSubmenu,
        group: "1_filter",
        when: ContextKeyExpr.equals("view", Markers.MARKERS_VIEW_ID),
        order: 1
      },
      viewId: Markers.MARKERS_VIEW_ID
    });
  }
  async runInView(serviceAccessor, view) {
    view.filters.showErrors = !view.filters.showErrors;
  }
});

registerAction2(class extends ViewAction {
  constructor() {
    super({
      id: `workbench.actions.${Markers.MARKERS_VIEW_ID}.toggleWarnings`,
      title: localize(16638, null),
      metadata: {
        description: localize2(16646, "Show or hide warnings in the problems view.")
      },
      category: localize(16631, null),
      toggled: MarkersContextKeys.ShowWarningsFilterContextKey,
      menu: {
        id: viewFilterSubmenu,
        group: "1_filter",
        when: ContextKeyExpr.equals("view", Markers.MARKERS_VIEW_ID),
        order: 2
      },
      viewId: Markers.MARKERS_VIEW_ID
    });
  }
  async runInView(serviceAccessor, view) {
    view.filters.showWarnings = !view.filters.showWarnings;
  }
});

registerAction2(class extends ViewAction {
  constructor() {
    super({
      id: `workbench.actions.${Markers.MARKERS_VIEW_ID}.toggleInfos`,
      title: localize(16635, null),
      category: localize(16631, null),
      toggled: MarkersContextKeys.ShowInfoFilterContextKey,
      metadata: {
        description: localize2(16645, "Show or hide infos in the problems view.")
      },
      menu: {
        id: viewFilterSubmenu,
        group: "1_filter",
        when: ContextKeyExpr.equals("view", Markers.MARKERS_VIEW_ID),
        order: 3
      },
      viewId: Markers.MARKERS_VIEW_ID
    });
  }
  async runInView(serviceAccessor, view) {
    view.filters.showInfos = !view.filters.showInfos;
  }
});

registerAction2(class extends ViewAction {
  constructor() {
    super({
      id: `workbench.actions.${Markers.MARKERS_VIEW_ID}.toggleActiveFile`,
      title: localize(16632, null),
      metadata: {
        description: localize2(16642, "Show or hide problems (errors, warnings, info) only from the active file in the problems view.")
      },
      category: localize(16631, null),
      toggled: MarkersContextKeys.ShowActiveFileFilterContextKey,
      menu: {
        id: viewFilterSubmenu,
        group: "2_filter",
        when: ContextKeyExpr.equals("view", Markers.MARKERS_VIEW_ID),
        order: 1
      },
      viewId: Markers.MARKERS_VIEW_ID
    });
  }
  async runInView(serviceAccessor, view) {
    view.filters.activeFile = !view.filters.activeFile;
  }
});

registerAction2(class extends ViewAction {
  constructor() {
    super({
      id: `workbench.actions.${Markers.MARKERS_VIEW_ID}.toggleExcludedFiles`,
      title: localize(16634, null),
      metadata: {
        description: localize2(16644, "Show or hide excluded files in the problems view.")
      },
      category: localize(16631, null),
      toggled: MarkersContextKeys.ShowExcludedFilesFilterContextKey.negate(),
      menu: {
        id: viewFilterSubmenu,
        group: "2_filter",
        when: ContextKeyExpr.equals("view", Markers.MARKERS_VIEW_ID),
        order: 2
      },
      viewId: Markers.MARKERS_VIEW_ID
    });
  }
  async runInView(serviceAccessor, view) {
    view.filters.excludedFiles = !view.filters.excludedFiles;
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.problems.focus",
      title: Messages.MARKERS_PANEL_SHOW_LABEL,
      category: Categories.View,
      f1: true
    });
  }
  async run(accessor) {
    accessor.get(IViewsService).openView(Markers.MARKERS_VIEW_ID, true);
  }
});

var MarkersViewAction = class extends ViewAction {
  getSelectedMarkers(markersView) {
    const selection = markersView.getFocusedSelectedElements() || markersView.getAllResourceMarkers();
    const markers = [];
    const addMarker = (marker) => {
      if (!markers.includes(marker)) {
        markers.push(marker);
      }
    };
    for (const selected of selection) {
      if (selected instanceof ResourceMarkers) {
        selected.markers.forEach(addMarker);
      } else if (selected instanceof Marker3) {
        addMarker(selected);
      }
    }
    return markers;
  }
};

registerAction2(class extends MarkersViewAction {
  constructor() {
    const when = ContextKeyExpr.and(FocusedViewContext.isEqualTo(Markers.MARKERS_VIEW_ID), MarkersContextKeys.MarkersTreeVisibilityContextKey, MarkersContextKeys.RelatedInformationFocusContextKey.toNegated());
    super({
      id: Markers.MARKER_COPY_ACTION_ID,
      title: localize2(16623, "Copy"),
      menu: {
        id: MenuId.ProblemsPanelContext,
        when,
        group: "navigation"
      },
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: 2048 /* CtrlCmd */ | 33 /* KeyC */,
        when
      },
      viewId: Markers.MARKERS_VIEW_ID
    });
  }
  async runInView(serviceAccessor, markersView) {
    const clipboardService = serviceAccessor.get(IClipboardService);
    const markers = this.getSelectedMarkers(markersView);
    if (markers.length) {
      await clipboardService.writeText(`[${markers}]`);
    }
  }
});

registerAction2(class extends MarkersViewAction {
  constructor() {
    super({
      id: Markers.MARKER_COPY_MESSAGE_ACTION_ID,
      title: localize2(16624, "Copy Message"),
      menu: {
        id: MenuId.ProblemsPanelContext,
        when: MarkersContextKeys.MarkerFocusContextKey,
        group: "navigation"
      },
      viewId: Markers.MARKERS_VIEW_ID
    });
  }
  async runInView(serviceAccessor, markersView) {
    const clipboardService = serviceAccessor.get(IClipboardService);
    const markers = this.getSelectedMarkers(markersView);
    if (markers.length) {
      await clipboardService.writeText(markers.map((m) => m.marker.message).join("\n"));
    }
  }
});

registerAction2(class extends ViewAction {
  constructor() {
    super({
      id: Markers.RELATED_INFORMATION_COPY_MESSAGE_ACTION_ID,
      title: localize2(16624, "Copy Message"),
      menu: {
        id: MenuId.ProblemsPanelContext,
        when: MarkersContextKeys.RelatedInformationFocusContextKey,
        group: "navigation"
      },
      viewId: Markers.MARKERS_VIEW_ID
    });
  }
  async runInView(serviceAccessor, markersView) {
    const clipboardService = serviceAccessor.get(IClipboardService);
    const element = markersView.getFocusElement();
    if (element instanceof RelatedInformation) {
      await clipboardService.writeText(element.raw.message);
    }
  }
});

registerAction2(class extends ViewAction {
  constructor() {
    super({
      id: Markers.FOCUS_PROBLEMS_FROM_FILTER,
      title: localize(16626, null),
      keybinding: {
        when: MarkersContextKeys.MarkerViewFilterFocusContextKey,
        weight: 200 /* WorkbenchContrib */,
        primary: 2048 /* CtrlCmd */ | 18 /* DownArrow */
      },
      viewId: Markers.MARKERS_VIEW_ID
    });
  }
  async runInView(serviceAccessor, markersView) {
    markersView.focus();
  }
});

registerAction2(class extends ViewAction {
  constructor() {
    super({
      id: Markers.MARKERS_VIEW_FOCUS_FILTER,
      title: localize(16625, null),
      keybinding: {
        when: FocusedViewContext.isEqualTo(Markers.MARKERS_VIEW_ID),
        weight: 200 /* WorkbenchContrib */,
        primary: 2048 /* CtrlCmd */ | 36 /* KeyF */
      },
      viewId: Markers.MARKERS_VIEW_ID
    });
  }
  async runInView(serviceAccessor, markersView) {
    markersView.focusFilter();
  }
});

registerAction2(class extends ViewAction {
  constructor() {
    super({
      id: Markers.MARKERS_VIEW_SHOW_MULTILINE_MESSAGE,
      title: localize2(16636, "Show message in multiple lines"),
      category: localize(16631, null),
      menu: {
        id: MenuId.CommandPalette,
        when: ContextKeyExpr.has(getVisbileViewContextKey(Markers.MARKERS_VIEW_ID))
      },
      viewId: Markers.MARKERS_VIEW_ID
    });
  }
  async runInView(serviceAccessor, markersView) {
    markersView.setMultiline(true);
  }
});

registerAction2(class extends ViewAction {
  constructor() {
    super({
      id: Markers.MARKERS_VIEW_SHOW_SINGLELINE_MESSAGE,
      title: localize2(16637, "Show message in single line"),
      category: localize(16631, null),
      menu: {
        id: MenuId.CommandPalette,
        when: ContextKeyExpr.has(getVisbileViewContextKey(Markers.MARKERS_VIEW_ID))
      },
      viewId: Markers.MARKERS_VIEW_ID
    });
  }
  async runInView(serviceAccessor, markersView) {
    markersView.setMultiline(false);
  }
});

registerAction2(class extends ViewAction {
  constructor() {
    super({
      id: Markers.MARKERS_VIEW_CLEAR_FILTER_TEXT,
      title: localize(16621, null),
      category: localize(16631, null),
      keybinding: {
        when: MarkersContextKeys.MarkerViewFilterFocusContextKey,
        weight: 200 /* WorkbenchContrib */,
        primary: 9 /* Escape */
      },
      viewId: Markers.MARKERS_VIEW_ID
    });
  }
  async runInView(serviceAccessor, markersView) {
    markersView.clearFilterText();
  }
});

registerAction2(class extends ViewAction {
  constructor() {
    super({
      id: `workbench.actions.treeView.${Markers.MARKERS_VIEW_ID}.collapseAll`,
      title: localize(16622, null),
      menu: {
        id: MenuId.ViewTitle,
        when: ContextKeyExpr.and(ContextKeyExpr.equals("view", Markers.MARKERS_VIEW_ID), MarkersContextKeys.MarkersViewModeContextKey.isEqualTo("tree" /* Tree */)),
        group: "navigation",
        order: 2
      },
      icon: Codicon.collapseAll,
      viewId: Markers.MARKERS_VIEW_ID
    });
  }
  async runInView(serviceAccessor, view) {
    return view.collapseAll();
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: Markers.TOGGLE_MARKERS_VIEW_ACTION_ID,
      title: Messages.MARKERS_PANEL_TOGGLE_LABEL
    });
  }
  async run(accessor) {
    const viewsService = accessor.get(IViewsService);
    if (viewsService.isViewVisible(Markers.MARKERS_VIEW_ID)) {
      viewsService.closeView(Markers.MARKERS_VIEW_ID);
    } else {
      viewsService.openView(Markers.MARKERS_VIEW_ID, true);
    }
  }
});

var MarkersStatusBarContributions = class extends Disposable {
  constructor(markerService, statusbarService, configurationService) {
    super();
    this.markerService = markerService;
    this.statusbarService = statusbarService;
    this.configurationService = configurationService;
    this.markersStatusItem = this._register(this.statusbarService.addEntry(
      this.getMarkersItem(),
      "status.problems",
      0 /* LEFT */,
      50
      /* Medium Priority */
    ));
    const addStatusBarEntry = () => {
      this.markersStatusItemOff = this.statusbarService.addEntry(this.getMarkersItemTurnedOff(), "status.problemsVisibility", 0 /* LEFT */, 49);
    };
    let config = this.configurationService.getValue("problems.visibility");
    if (!config) {
      addStatusBarEntry();
    }
    this._register(this.markerService.onMarkerChanged(() => {
      this.markersStatusItem.update(this.getMarkersItem());
    }));
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("problems.visibility")) {
        this.markersStatusItem.update(this.getMarkersItem());
        config = this.configurationService.getValue("problems.visibility");
        if (!config && !this.markersStatusItemOff) {
          addStatusBarEntry();
        } else if (config && this.markersStatusItemOff) {
          this.markersStatusItemOff.dispose();
          this.markersStatusItemOff = void 0;
        }
      }
    }));
  }
  getMarkersItem() {
    const markersStatistics = this.markerService.getStatistics();
    const tooltip = this.getMarkersTooltip(markersStatistics);
    return {
      name: localize(16639, null),
      text: this.getMarkersText(markersStatistics),
      ariaLabel: tooltip,
      tooltip,
      command: "workbench.actions.view.toggleProblems"
    };
  }
  getMarkersItemTurnedOff() {
    this.statusbarService.updateEntryVisibility("status.problemsVisibility", true);
    const openSettingsCommand3 = "workbench.action.openSettings";
    const configureSettingsLabel2 = "@id:problems.visibility";
    const tooltip = localize(16641, null);
    return {
      name: localize(16640, null),
      text: "$(whole-word)",
      ariaLabel: tooltip,
      tooltip,
      kind: "warning",
      command: { title: openSettingsCommand3, arguments: [configureSettingsLabel2], id: openSettingsCommand3 }
    };
  }
  getMarkersTooltip(stats) {
    const errorTitle = (n2) => localize(16647, null, n2);
    const warningTitle = (n2) => localize(16650, null, n2);
    const infoTitle = (n2) => localize(16648, null, n2);
    const titles = [];
    if (stats.errors > 0) {
      titles.push(errorTitle(stats.errors));
    }
    if (stats.warnings > 0) {
      titles.push(warningTitle(stats.warnings));
    }
    if (stats.infos > 0) {
      titles.push(infoTitle(stats.infos));
    }
    if (titles.length === 0) {
      return localize(16630, null);
    }
    return titles.join(", ");
  }
  getMarkersText(stats) {
    const problemsText = [];
    problemsText.push("$(error) " + this.packNumber(stats.errors));
    problemsText.push("$(warning) " + this.packNumber(stats.warnings));
    if (stats.infos > 0) {
      problemsText.push("$(info) " + this.packNumber(stats.infos));
    }
    return problemsText.join(" ");
  }
  packNumber(n2) {
    const manyProblems = localize(16627, null);
    return n2 > 9999 ? manyProblems : n2 > 999 ? n2.toString().charAt(0) + "K" : n2.toString();
  }
};

MarkersStatusBarContributions = __decorateClass([
  __decorateParam(0, IMarkerService),
  __decorateParam(1, IStatusbarService),
  __decorateParam(2, IConfigurationService)
], MarkersStatusBarContributions);

workbenchRegistry2.registerWorkbenchContribution(MarkersStatusBarContributions, 3 /* Restored */);

registerWorkbenchContribution2(MarkerChatContextContribution.ID, MarkerChatContextContribution, WorkbenchPhase.AfterRestored);

var ActivityUpdater = class extends Disposable {
  constructor(activityService, markerService) {
    super();
    this.activityService = activityService;
    this.markerService = markerService;
    this.activity = this._register(new MutableDisposable());
    this._register(this.markerService.onMarkerChanged(() => this.updateBadge()));
    this.updateBadge();
  }
  updateBadge() {
    const { errors, warnings, infos } = this.markerService.getStatistics();
    const total = errors + warnings + infos;
    if (total > 0) {
      const message = localize(16649, null, total);
      this.activity.value = this.activityService.showViewActivity(Markers.MARKERS_VIEW_ID, { badge: new NumberBadge(total, () => message) });
    } else {
      this.activity.value = void 0;
    }
  }
};

ActivityUpdater = __decorateClass([
  __decorateParam(0, IActivityService),
  __decorateParam(1, IMarkerService)
], ActivityUpdater);

workbenchRegistry2.registerWorkbenchContribution(ActivityUpdater, 3 /* Restored */);

AccessibleViewRegistry.register(new ProblemsAccessibilityHelp());
export { markersViewIcon, VIEW_CONTAINER4, workbenchRegistry2, MarkersViewAction, MarkersStatusBarContributions, ActivityUpdater };
