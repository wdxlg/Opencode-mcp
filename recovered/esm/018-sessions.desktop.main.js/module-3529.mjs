// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/sessions/browser/views/sessionsView.ts
import { $, addDisposableListener, append, getWindow, scheduleAtNextAnimationFrame } from "./module-0075.mjs";
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { ViewPane } from "./module-1334.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { SessionsGrouping, SessionsList, SessionsSorting } from "./module-3523.mjs";
import { agentsBackground } from "./module-1496.mjs";
import { isPhoneLayout } from "./module-3445.mjs";
import { localize } from "./module-0001.mjs";
import { ServiceCollection } from "./module-0440.mjs";
import { MenuWorkbenchToolBar } from "./module-0519.mjs";
import { Menus } from "./module-3437.mjs";
import { isWeb } from "./module-0014.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { MobileSessionFilterChips } from "./module-3527.mjs";
import { autorun } from "./module-0052.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { AICustomizationShortcutsWidget } from "./module-3525.mjs";
import { Sizing, SplitView } from "./module-0625.mjs";
import { PANEL_SECTION_BORDER } from "./module-0868.mjs";
import { Color } from "./module-0197.mjs";
import { IsAuxiliaryWindowContext, IsSessionsWindowContext } from "./module-0950.mjs";
import { IsPhoneLayoutContext } from "./module-1770.mjs";
import { AgentHostShortcutsWidget } from "./module-3526.mjs";
import { ChatSessionArchiveActionWordingSettingId, getChatSessionArchiveActionWording, getChatSessionArchivedSectionLabel } from "./module-2468.mjs";
import { showMobileSortGroupSheet } from "./module-3528.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IViewDescriptorService } from "./module-1094.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IHoverService } from "./module-0520.mjs";
import { ISessionsManagementService } from "./module-1766.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { IHostService } from "./module-1118.mjs";
import { IWorkbenchLayoutService } from "./module-1119.mjs";
import { IStorageService } from "./module-0512.mjs";


// src/vs/sessions/contrib/sessions/browser/views/sessionsView.ts
var $115 = $;

var SessionsViewId = "sessions.workbench.view.sessionsView";

var GROUPING_STORAGE_KEY = "sessionsViewPane.grouping";

var SORTING_STORAGE_KEY = "sessionsViewPane.sorting";

var CUSTOMIZATIONS_MIN_HEIGHT = 129;

var SESSIONS_SECTION_MIN_HEIGHT = 120;

var SESSIONS_HEADER_ELLIPSIS_MIN_WIDTH = 8;

var SessionsViewFilterSubMenu = new MenuId("SessionsViewPaneFilterSubMenu");

var SessionsViewFilterOptionsSubMenu = new MenuId("SessionsViewPaneFilterOptionsSubMenu");

var SessionsViewGroupingContext = new RawContextKey("sessionsViewPane.grouping", "workspace" /* Workspace */);

var SessionsViewSortingContext = new RawContextKey("sessionsViewPane.sorting", "created" /* Created */);

var IsWorkspaceGroupCappedContext = new RawContextKey("sessionsViewPane.workspaceGroupCapped", true);

var SessionsView = class extends ViewPane {
  constructor(options3, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService, sessionsManagementService, sessionsService, hostService, layoutService, storageService) {
    super(options3, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService);
    this.sessionsManagementService = sessionsManagementService;
    this.sessionsService = sessionsService;
    this.hostService = hostService;
    this.layoutService = layoutService;
    this.storageService = storageService;
    this.isFindWidgetOpen = false;
    this.currentGrouping = "workspace" /* Workspace */;
    this.currentSorting = "created" /* Created */;
    this.filterContextKeys = /* @__PURE__ */ new Map();
    this.currentBodyHeight = 0;
    this.currentBodyWidth = 0;
    this.didInitializePaneSizes = false;
    this.registeredFilterTypeIds = /* @__PURE__ */ new Set();
    this.archivedFilterRegistration = this._register(new DisposableStore());
    const storedGrouping = this.storageService.get(GROUPING_STORAGE_KEY, 0 /* PROFILE */);
    if (storedGrouping && Object.values(SessionsGrouping).includes(storedGrouping)) {
      this.currentGrouping = storedGrouping;
    }
    const storedSorting = this.storageService.get(SORTING_STORAGE_KEY, 0 /* PROFILE */);
    if (storedSorting && Object.values(SessionsSorting).includes(storedSorting)) {
      this.currentSorting = storedSorting;
    }
    this.groupingContextKey = SessionsViewGroupingContext.bindTo(contextKeyService);
    this.groupingContextKey.set(this.currentGrouping);
    this.sortingContextKey = SessionsViewSortingContext.bindTo(contextKeyService);
    this.sortingContextKey.set(this.currentSorting);
    this.workspaceGroupCappedContextKey = IsWorkspaceGroupCappedContext.bindTo(contextKeyService);
  }
  renderBody(parent) {
    super.renderBody(parent);
    this.viewPaneContainer = parent;
    this.viewPaneContainer.classList.add("agent-sessions-viewpane");
    this.createControls(parent);
  }
  getLocationBasedColors() {
    const colors = super.getLocationBasedColors();
    return {
      ...colors,
      background: void 0,
      listOverrideStyles: {
        ...colors.listOverrideStyles,
        listBackground: void 0,
        treeStickyScrollBackground: agentsBackground
      }
    };
  }
  createControls(parent) {
    const sessionsContainer = append(parent, $115(".agent-sessions-container"));
    this.sidebarSplitViewContainer = append(sessionsContainer, $115(".agent-sessions-sidebar-splitview-container"));
    const sessionsSection = append(this.sidebarSplitViewContainer, $115(".agent-sessions-section"));
    const sessionsContent = append(sessionsSection, $115(".agent-sessions-content"));
    const headerRow = this.headerRow = append(sessionsContent, $115(".agent-sessions-header-row"));
    const headerLabel = this.headerLabel = append(headerRow, $115(".agent-sessions-header-label"));
    const headerActions = this.headerActions = append(headerRow, $115(".agent-sessions-header-actions"));
    const phoneLayout = isPhoneLayout(this.layoutService);
    if (!phoneLayout) {
      headerLabel.textContent = localize(5553, null);
      const scopedInstantiationService = this._register(this.instantiationService.createChild(new ServiceCollection([IContextKeyService, this.scopedContextKeyService])));
      this._register(scopedInstantiationService.createInstance(MenuWorkbenchToolBar, headerActions, Menus.SidebarSessionsHeader, {
        hiddenItemStrategy: -1 /* NoHide */,
        telemetrySource: "sessionsView.header",
        toolbarOptions: { primaryGroup: () => true }
      }));
    } else {
      headerRow.classList.add("phone-layout-empty");
    }
    const findWidgetContainer = this.findWidgetContainer = append(headerRow, $115(".agent-sessions-find-widget-container"));
    findWidgetContainer.style.display = "none";
    const filterChipsContainer = isPhoneLayout(this.layoutService) ? append(sessionsContent, $115(".mobile-session-filter-chips-slot")) : void 0;
    this.sessionsControlContainer = append(sessionsContent, $115(".agent-sessions-control-container"));
    const sessionsControl = this.sessionsControl = this._register(this.instantiationService.createInstance(SessionsList, this.sessionsControlContainer, {
      overrideStyles: this.getLocationBasedColors().listOverrideStyles,
      grouping: () => this.currentGrouping,
      sorting: () => this.currentSorting,
      findWidgetContainer,
      onSessionOpen: (resource, preserveFocus, sideBySide) => {
        const onOpened = () => {
          if (isWeb && isPhoneLayout(this.layoutService)) {
            this.layoutService.setPartHidden(true, "workbench.parts.sidebar" /* SIDEBAR_PART */);
          }
        };
        const session = this.sessionsManagementService.getSession(resource);
        if (!session) {
          onUnexpectedError(new Error(`Unable to open session because '${resource.toString()}' is not available`));
          return;
        }
        const mainChat = session.mainChat.get();
        if (sideBySide) {
          this.sessionsService.openSessionToSide(session, { preserveFocus, chatResource: mainChat.resource, source: "sessionsList" }).then(onOpened).catch(onUnexpectedError);
          return;
        }
        this.sessionsService.openChat(session, mainChat.resource, { preserveFocus, source: "sessionsList" }).then(onOpened).catch(onUnexpectedError);
      },
      canOpenSession: (session) => this.sessionsService.canOpenSession(session),
      onChatOpen: (session, chat, preserveFocus, sideBySide) => {
        const onOpened = () => {
          if (isWeb && isPhoneLayout(this.layoutService)) {
            this.layoutService.setPartHidden(true, "workbench.parts.sidebar" /* SIDEBAR_PART */);
          }
        };
        if (sideBySide) {
          this.sessionsService.openChatToSide(session, chat.resource, { preserveFocus }).then(onOpened).catch(onUnexpectedError);
          return;
        }
        this.sessionsService.openChat(session, chat.resource, { preserveFocus }).then(onOpened).catch(onUnexpectedError);
      }
    }));
    this._register(this.onDidChangeBodyVisibility((visible) => sessionsControl.setVisible(visible)));
    this._register(sessionsControl.onDidChangeFindOpenState((open2) => {
      this.isFindWidgetOpen = open2;
      findWidgetContainer.style.display = open2 ? "" : "none";
      this.updateHeaderLayout();
    }));
    this._register(addDisposableListener(findWidgetContainer, "keydown", (e4) => {
      if (e4.key === "Escape") {
        sessionsControl.closeFind();
        e4.stopPropagation();
      }
    }));
    this.workspaceGroupCappedContextKey?.set(sessionsControl.isWorkspaceGroupCapped());
    this.registerSessionTypeFilters(sessionsControl);
    this._register(this.sessionsManagementService.onDidChangeSessionTypes(() => {
      this.registerSessionTypeFilters(sessionsControl);
    }));
    this.registerStatusFilters(sessionsControl);
    this._register(this.hostService.onDidChangeFocus((hasFocus) => {
      if (hasFocus) {
        sessionsControl.refresh();
      }
    }));
    this._register(sessionsControl.onDidUpdate(() => {
      if (!sessionsControl.hasFocusOrSelection()) {
        this.restoreLastSelectedSession();
      }
    }));
    if (filterChipsContainer) {
      const chips = this._register(new MobileSessionFilterChips(filterChipsContainer, sessionsControl));
      this._register(chips.onDidRequestSortGroup(() => {
        this.openSortGroupSheet();
      }));
      this._register(chips.onDidRequestFind(() => {
        this.openFind();
      }));
    }
    this._register(autorun((reader) => {
      const activeSession = this.sessionsService.activeSession.read(reader);
      if (activeSession) {
        if (!sessionsControl.reveal(activeSession.resource)) {
          sessionsControl.clearFocus();
        }
      } else {
        sessionsControl.clearFocus();
      }
    }));
    const customizationsSection = append(this.sidebarSplitViewContainer, $115(".agent-sessions-customizations-section"));
    const customizationsSizeChange = this._register(new Emitter());
    const customizationsWidget = this._customizationsWidget = this._register(this.instantiationService.createInstance(AICustomizationShortcutsWidget, customizationsSection, {
      onDidChangeLayout: () => {
        customizationsSizeChange.fire();
        this.layoutSidebarSplitView();
      }
    }));
    this.sidebarSplitView = this._register(new SplitView(this.sidebarSplitViewContainer, {
      orientation: 0 /* VERTICAL */,
      proportionalLayout: false
    }));
    const sessionsPane = {
      element: sessionsSection,
      minimumSize: SESSIONS_SECTION_MIN_HEIGHT,
      maximumSize: Number.POSITIVE_INFINITY,
      onDidChange: Event2.None,
      layout: (height) => {
        sessionsSection.style.height = `${height}px`;
        this.sessionsControl?.layout(this.sessionsControlContainer?.offsetHeight ?? 0, this.currentBodyWidth);
      }
    };
    const customizationsPane = {
      element: customizationsSection,
      get minimumSize() {
        return customizationsWidget.collapsed ? customizationsWidget.collapsedHeight : CUSTOMIZATIONS_MIN_HEIGHT;
      },
      get maximumSize() {
        return customizationsWidget.collapsed ? customizationsWidget.collapsedHeight : Math.max(CUSTOMIZATIONS_MIN_HEIGHT, customizationsWidget.desiredHeight);
      },
      onDidChange: Event2.map(Event2.any(customizationsWidget.onDidChangeHeight, customizationsSizeChange.event), () => this.getCustomizationsPaneHeight()),
      layout: (height) => {
        customizationsSection.style.height = `${height}px`;
        this._customizationsWidget?.layout(height, this.currentBodyWidth);
      }
    };
    this.sidebarSplitView.addView(sessionsPane, Sizing.Distribute, 0, true);
    this.sidebarSplitView.addView(customizationsPane, this.getCustomizationsPaneHeight(), 1, true);
    let savedCustomizationsPaneHeight = this.getCustomizationsPaneHeight();
    this._register(customizationsWidget.onDidToggleCollapsed((collapsed2) => {
      if (!this.sidebarSplitView) {
        return;
      }
      if (collapsed2) {
        const currentSize = this.sidebarSplitView.getViewSize(1);
        if (currentSize > customizationsWidget.collapsedHeight) {
          savedCustomizationsPaneHeight = currentSize;
        }
        this.sidebarSplitView.resizeView(1, customizationsWidget.collapsedHeight);
      } else {
        this.sidebarSplitView.resizeView(1, savedCustomizationsPaneHeight);
      }
      this.layoutSidebarSplitView();
    }));
    const updateSplitViewStyles = () => {
      const borderColor = this.themeService.getColorTheme().getColor(PANEL_SECTION_BORDER);
      this.sidebarSplitView?.style({ separatorBorder: borderColor ?? Color.transparent });
    };
    updateSplitViewStyles();
    this._register(this.themeService.onDidColorThemeChange(updateSplitViewStyles));
    if (isWeb && this.scopedContextKeyService.contextMatchesRules(ContextKeyExpr.and(
      IsSessionsWindowContext,
      IsAuxiliaryWindowContext.toNegated(),
      IsPhoneLayoutContext.negate()
    ))) {
      this._register(this.instantiationService.createInstance(AgentHostShortcutsWidget, sessionsContainer, {
        onDidChangeLayout: () => {
          this.layoutSidebarSplitView();
        }
      }));
    }
    this._register(scheduleAtNextAnimationFrame(getWindow(parent), () => this.layoutSidebarSplitView()));
  }
  focusCustomizations() {
    this._customizationsWidget?.focus();
  }
  restoreLastSelectedSession() {
    const activeSession = this.sessionsService.activeSession.get();
    if (activeSession && this.sessionsControl) {
      this.sessionsControl.reveal(activeSession.resource);
    }
  }
  registerSessionTypeFilters(sessionsControl) {
    const sessionTypes = this.sessionsManagementService.getAllSessionTypes();
    for (let i2 = 0; i2 < sessionTypes.length; i2++) {
      const type = sessionTypes[i2];
      if (this.registeredFilterTypeIds.has(type.id)) {
        continue;
      }
      this.registeredFilterTypeIds.add(type.id);
      const contextKey = new RawContextKey(`sessionsViewPane.filterType.${type.id}`, !sessionsControl.isSessionTypeExcluded(type.id));
      const contextKeyInstance = contextKey.bindTo(this.scopedContextKeyService);
      this.filterContextKeys.set(contextKey.key, { key: contextKeyInstance, getDefault: () => true });
      this._register(registerAction2(class extends Action2 {
        constructor() {
          super({
            id: `sessionsViewPane.filterType.${type.id}`,
            title: type.label,
            toggled: ContextKeyExpr.equals(contextKey.key, true),
            menu: [{
              id: SessionsViewFilterOptionsSubMenu,
              group: "1_types",
              order: i2
            }]
          });
        }
        run() {
          const isExcluded = sessionsControl.isSessionTypeExcluded(type.id);
          sessionsControl.setSessionTypeExcluded(type.id, !isExcluded);
          contextKeyInstance.set(isExcluded);
        }
      }));
    }
  }
  registerStatusFilters(sessionsControl) {
    const statusFilters = [
      { status: 3 /* Completed */, label: localize(5559, null) },
      { status: 1 /* InProgress */, label: localize(5561, null) },
      { status: 2 /* NeedsInput */, label: localize(5562, null) },
      { status: 4 /* Error */, label: localize(5560, null) }
    ];
    for (let i2 = 0; i2 < statusFilters.length; i2++) {
      const { status: status2, label: label3 } = statusFilters[i2];
      const contextKey = new RawContextKey(`sessionsViewPane.filterStatus.${status2}`, !sessionsControl.isStatusExcluded(status2));
      const contextKeyInstance = contextKey.bindTo(this.scopedContextKeyService);
      this.filterContextKeys.set(contextKey.key, { key: contextKeyInstance, getDefault: () => true });
      this._register(registerAction2(class extends Action2 {
        constructor() {
          super({
            id: `sessionsViewPane.filterStatus.${status2}`,
            title: label3,
            toggled: ContextKeyExpr.equals(contextKey.key, true),
            menu: [{
              id: SessionsViewFilterOptionsSubMenu,
              group: "2_status",
              order: i2
            }]
          });
        }
        run() {
          const isExcluded = sessionsControl.isStatusExcluded(status2);
          sessionsControl.setStatusExcluded(status2, !isExcluded);
          contextKeyInstance.set(isExcluded);
        }
      }));
    }
    const archivedContextKey = new RawContextKey("sessionsViewPane.filter.showArchived", !sessionsControl.isExcludeArchived());
    const archivedContextKeyInstance = archivedContextKey.bindTo(this.scopedContextKeyService);
    this.filterContextKeys.set(archivedContextKey.key, { key: archivedContextKeyInstance, getDefault: () => false });
    const registerArchivedFilter = () => {
      this.archivedFilterRegistration.clear();
      const title = getChatSessionArchivedSectionLabel(getChatSessionArchiveActionWording(this.configurationService));
      this.archivedFilterRegistration.add(registerAction2(class extends Action2 {
        constructor() {
          super({
            id: "sessionsViewPane.filterArchived",
            title,
            toggled: ContextKeyExpr.equals(archivedContextKey.key, true),
            menu: [{
              id: SessionsViewFilterOptionsSubMenu,
              group: "3_props",
              order: 0
            }]
          });
        }
        run() {
          const excluding = sessionsControl.isExcludeArchived();
          sessionsControl.setExcludeArchived(!excluding);
          archivedContextKeyInstance.set(excluding);
        }
      }));
    };
    registerArchivedFilter();
    this._register(this.configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration(ChatSessionArchiveActionWordingSettingId)) {
        registerArchivedFilter();
      }
    }));
    const readContextKey = new RawContextKey("sessionsViewPane.filter.showRead", !sessionsControl.isExcludeRead());
    const readContextKeyInstance = readContextKey.bindTo(this.scopedContextKeyService);
    this.filterContextKeys.set(readContextKey.key, { key: readContextKeyInstance, getDefault: () => true });
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: "sessionsViewPane.filterRead",
          title: localize(5549, null),
          toggled: ContextKeyExpr.equals(readContextKey.key, true),
          menu: [{
            id: SessionsViewFilterOptionsSubMenu,
            group: "3_props",
            order: 1
          }]
        });
      }
      run() {
        const excluding = sessionsControl.isExcludeRead();
        sessionsControl.setExcludeRead(!excluding);
        readContextKeyInstance.set(excluding);
      }
    }));
    const filterContextKeys = this.filterContextKeys;
    const workspaceGroupCappedContextKey = this.workspaceGroupCappedContextKey;
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: "sessionsViewPane.resetFilters",
          title: localize(5552, null),
          menu: [{
            id: SessionsViewFilterOptionsSubMenu,
            group: "4_reset",
            order: 0
          }]
        });
      }
      run() {
        sessionsControl.resetFilters();
        for (const { key: key3, getDefault } of filterContextKeys.values()) {
          key3.set(getDefault());
        }
        workspaceGroupCappedContextKey?.set(sessionsControl.isWorkspaceGroupCapped());
      }
    }));
  }
  layoutBody(height, width2) {
    super.layoutBody(height, width2);
    this.currentBodyHeight = height;
    this.currentBodyWidth = width2;
    this.updateHeaderLayout();
    this.layoutSidebarSplitView();
    if (this.sidebarSplitView || !this.sessionsControl || !this.sessionsControlContainer) {
      return;
    }
    this.sessionsControl.layout(this.sessionsControlContainer.offsetHeight, width2);
  }
  layoutSidebarSplitView() {
    if (!this.sidebarSplitView || !this.sidebarSplitViewContainer) {
      return;
    }
    const height = this.sidebarSplitViewContainer.offsetHeight || this.currentBodyHeight || this.viewPaneContainer?.offsetHeight || 0;
    if (height <= 0) {
      return;
    }
    if (this.sidebarSplitViewContainer.offsetHeight === 0) {
      this.sidebarSplitViewContainer.style.height = `${height}px`;
    }
    this.sidebarSplitView.layout(height);
    if (!this.didInitializePaneSizes) {
      this.didInitializePaneSizes = true;
      this.sidebarSplitView.resizeView(1, this.getCustomizationsPaneHeight());
    }
  }
  getCustomizationsPaneHeight() {
    if (this._customizationsWidget?.collapsed) {
      return this._customizationsWidget.collapsedHeight;
    }
    const desiredHeight = this._customizationsWidget?.desiredHeight ?? 0;
    return Math.max(CUSTOMIZATIONS_MIN_HEIGHT, Number.isFinite(desiredHeight) ? desiredHeight : 0);
  }
  focus() {
    super.focus();
    this.sessionsControl?.focus();
  }
  refresh() {
    this.sessionsControl?.refresh();
  }
  openFind() {
    this.isFindWidgetOpen = true;
    if (this.findWidgetContainer) {
      this.findWidgetContainer.style.display = "";
    }
    this.updateHeaderLayout();
    this.sessionsControl?.openFind();
  }
  updateHeaderLayout() {
    if (!this.headerRow || !this.headerLabel || !this.headerActions) {
      return;
    }
    if (isPhoneLayout(this.layoutService)) {
      this.headerRow.classList.toggle("phone-layout-empty", !this.isFindWidgetOpen);
      return;
    }
    if (this.isFindWidgetOpen) {
      this.headerLabel.style.display = "none";
      this.headerActions.style.display = "none";
      return;
    }
    this.headerLabel.style.display = "";
    this.headerActions.style.display = "";
    if (this.headerLabel.clientWidth < SESSIONS_HEADER_ELLIPSIS_MIN_WIDTH) {
      this.headerLabel.style.display = "none";
    }
  }
  /**
   * Phone-only: present a bottom sheet with the four sort/group toggles.
   * Filtering on phone is performed via the status filter chips, so the
   * sheet intentionally omits "Filter", "Show Recent/All Sessions", and
   * "Collapse All Groups" actions found in the desktop submenu.
   */
  openSortGroupSheet() {
    const sortTitle = localize(5557, null);
    const groupTitle = localize(5556, null);
    const items = [
      {
        id: "created" /* Created */,
        label: localize(5554, null),
        checked: this.currentSorting === "created" /* Created */,
        group: "sort",
        groupTitle: sortTitle
      },
      {
        id: "updated" /* Updated */,
        label: localize(5555, null),
        checked: this.currentSorting === "updated" /* Updated */,
        group: "sort"
      },
      {
        id: "workspace" /* Workspace */,
        label: localize(5551, null),
        checked: this.currentGrouping === "workspace" /* Workspace */,
        group: "group",
        groupTitle
      },
      {
        id: "date" /* Date */,
        label: localize(5550, null),
        checked: this.currentGrouping === "date" /* Date */,
        group: "group"
      }
    ];
    showMobileSortGroupSheet(this.layoutService.mainContainer, localize(5558, null), items).then((selectedId) => {
      if (!selectedId) {
        return;
      }
      if (selectedId === "created" /* Created */ || selectedId === "updated" /* Updated */) {
        this.setSorting(selectedId);
      } else if (selectedId === "workspace" /* Workspace */ || selectedId === "date" /* Date */) {
        this.setGrouping(selectedId);
      }
    });
  }
  setGrouping(grouping) {
    if (this.currentGrouping === grouping) {
      return;
    }
    this.currentGrouping = grouping;
    this.storageService.store(GROUPING_STORAGE_KEY, this.currentGrouping, 0 /* PROFILE */, 0 /* USER */);
    this.groupingContextKey?.set(this.currentGrouping);
    this.sessionsControl?.resetSectionCollapseState();
    this.sessionsControl?.update(true);
  }
  setSorting(sorting) {
    if (this.currentSorting === sorting) {
      return;
    }
    this.currentSorting = sorting;
    this.storageService.store(SORTING_STORAGE_KEY, this.currentSorting, 0 /* PROFILE */, 0 /* USER */);
    this.sortingContextKey?.set(this.currentSorting);
    this.sessionsControl?.update();
  }
};

SessionsView = __decorateClass([
  __decorateParam(1, IKeybindingService),
  __decorateParam(2, IContextMenuService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, IViewDescriptorService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, IOpenerService),
  __decorateParam(8, IThemeService),
  __decorateParam(9, IHoverService),
  __decorateParam(10, ISessionsManagementService),
  __decorateParam(11, ISessionsService),
  __decorateParam(12, IHostService),
  __decorateParam(13, IWorkbenchLayoutService),
  __decorateParam(14, IStorageService)
], SessionsView);
export { $115, SessionsViewId, GROUPING_STORAGE_KEY, SORTING_STORAGE_KEY, CUSTOMIZATIONS_MIN_HEIGHT, SESSIONS_SECTION_MIN_HEIGHT, SESSIONS_HEADER_ELLIPSIS_MIN_WIDTH, SessionsViewFilterSubMenu, SessionsViewFilterOptionsSubMenu, SessionsViewGroupingContext, SessionsViewSortingContext, IsWorkspaceGroupCappedContext, SessionsView };
