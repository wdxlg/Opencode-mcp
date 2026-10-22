// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/modernUI/browser/modernUI.contribution.ts
import { Action2, MenuId, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { Disposable } from "./module-0012.mjs";
import { DEFAULT_SCROLLBAR_SIZE, setGlobalDefaultScrollbarSize } from "./module-0259.mjs";
import { COMPACT_NOTIFICATION_ROW_HEIGHT, DEFAULT_NOTIFICATION_ROW_HEIGHT, setNotificationRowHeight } from "./module-3460.mjs";
import { DEFAULT_PANE_HEADER_SIZE, setGlobalPaneHeaderSize } from "./module-1328.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IWorkbenchLayoutService } from "./module-1118.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0870.mjs";


// src/vs/workbench/contrib/modernUI/browser/modernUI.contribution.ts
var MODERN_UI_SCROLLBAR_SIZE = 8;

var MODERN_UI_PANE_HEADER_SIZE = 28;

var MODERN_UI_CLASS = "modern-ui";

var MODERN_UI_COMPACT_CLASS = "modern-ui-compact";

var MODERN_UI_TABS_CLASS = "modern-ui-tabs";

var MODERN_UI_NOTIFICATIONS_DIALOGS_CLASS = "modern-ui-notifications-dialogs";

var MODERN_UI_UPPERCASE_VIEW_HEADERS_CLASS = "modern-ui-uppercase-view-headers";

var LayoutDensityMenu = new MenuId("LayoutDensityMenu");

var layoutDensityOptions = [
  { density: "default" /* Default */, title: localize2(17369, "Default") },
  { density: "compact" /* Compact */, title: localize2(17368, "Compact") }
];

MenuRegistry.appendMenuItem(MenuId.GlobalActivity, {
  title: localize(17367, null),
  submenu: LayoutDensityMenu,
  group: "2_configuration",
  order: 8,
  when: ContextKeyExpr.equals(`config.${"workbench.experimental.modernUI" /* MODERN_UI */}`, true)
});

for (let index2 = 0; index2 < layoutDensityOptions.length; index2++) {
  const option2 = layoutDensityOptions[index2];
  registerAction2(class extends Action2 {
    constructor() {
      super({
        id: `workbench.action.setLayoutDensity.${option2.density}`,
        title: option2.title,
        toggled: ContextKeyExpr.equals(`config.${"window.density.layout" /* MODERN_UI_DENSITY */}`, option2.density),
        menu: {
          id: LayoutDensityMenu,
          order: index2 + 1
        }
      });
    }
    run(accessor) {
      return accessor.get(IConfigurationService).updateValue("window.density.layout" /* MODERN_UI_DENSITY */, option2.density);
    }
  });
}

var MODERN_UI_MODULES = [
  { id: "activityBar" },
  { id: "commandCenter" },
  { id: "editorBorder" },
  { id: "fontRamp" },
  { id: "keyboardFocusOnly" },
  { id: "padding" },
  { id: "paneHeaders", layoutAffecting: true },
  { id: "roundedCorners" },
  { id: "sashHandles" },
  { id: "scrollShadows" },
  { id: "shadows" },
  { id: "statusBar" },
  { id: "tabs" },
  { id: "titlebar" },
  { id: "notificationsDialogs" }
];

var ModernUIContribution = class extends Disposable {
  constructor(configurationService, layoutService) {
    super();
    this.configurationService = configurationService;
    this.layoutService = layoutService;
    this.hasLayoutAffectingModule = MODERN_UI_MODULES.some((m) => m.layoutAffecting);
    this.layoutAffectingState = "disabled";
    this.layoutAffectingState = this.getLayoutAffectingState();
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("workbench.experimental.modernUI" /* MODERN_UI */) || e.affectsConfiguration("window.density.layout" /* MODERN_UI_DENSITY */) || e.affectsConfiguration("workbench.experimental.modernUIUppercaseViewHeaders" /* MODERN_UI_UPPERCASE_VIEW_HEADERS */)) {
        this.update();
        const layoutAffectingState = this.getLayoutAffectingState();
        if (layoutAffectingState !== this.layoutAffectingState) {
          this.layoutAffectingState = layoutAffectingState;
          this.layoutService.layout();
        }
      }
    }));
    this._register(this.layoutService.onDidAddContainer(({ container: container3 }) => {
      const enabled = this.isEnabled();
      this.applyTo(container3, enabled, enabled && this.isCompact(), enabled && this.useUppercaseViewHeaders());
    }));
    this.update();
  }
  static {
    this.ID = "workbench.contrib.modernUI";
  }
  isEnabled() {
    return this.configurationService.getValue("workbench.experimental.modernUI" /* MODERN_UI */) === true;
  }
  useUppercaseViewHeaders() {
    return this.configurationService.getValue("workbench.experimental.modernUIUppercaseViewHeaders" /* MODERN_UI_UPPERCASE_VIEW_HEADERS */) === true;
  }
  isCompact() {
    return this.configurationService.getValue("window.density.layout" /* MODERN_UI_DENSITY */) === "compact" /* Compact */;
  }
  getLayoutAffectingState() {
    if (!this.isEnabled() || !this.hasLayoutAffectingModule) {
      return "disabled";
    }
    return this.isCompact() ? "compact" /* Compact */ : "default" /* Default */;
  }
  update() {
    const enabled = this.isEnabled();
    const compact2 = enabled && this.isCompact();
    const useUppercaseViewHeaders = enabled && this.useUppercaseViewHeaders();
    this.applyPaneHeaderSize(enabled);
    for (const container3 of this.layoutService.containers) {
      this.applyTo(container3, enabled, compact2, useUppercaseViewHeaders);
    }
    this.applyScrollbarSize(enabled);
    this.applyNotificationRowHeight(enabled);
  }
  applyTo(container3, enabled, compact2, useUppercaseViewHeaders) {
    container3.classList.toggle(MODERN_UI_CLASS, enabled);
    container3.classList.toggle(MODERN_UI_COMPACT_CLASS, compact2);
    container3.classList.toggle(MODERN_UI_TABS_CLASS, enabled);
    container3.classList.toggle(MODERN_UI_NOTIFICATIONS_DIALOGS_CLASS, enabled);
    container3.classList.toggle(MODERN_UI_UPPERCASE_VIEW_HEADERS_CLASS, useUppercaseViewHeaders);
  }
  applyScrollbarSize(enabled) {
    setGlobalDefaultScrollbarSize(enabled ? MODERN_UI_SCROLLBAR_SIZE : DEFAULT_SCROLLBAR_SIZE);
  }
  applyNotificationRowHeight(enabled) {
    setNotificationRowHeight(enabled ? COMPACT_NOTIFICATION_ROW_HEIGHT : DEFAULT_NOTIFICATION_ROW_HEIGHT);
  }
  applyPaneHeaderSize(enabled) {
    let paneHeaderSize = DEFAULT_PANE_HEADER_SIZE;
    if (enabled) {
      paneHeaderSize = MODERN_UI_PANE_HEADER_SIZE;
    }
    setGlobalPaneHeaderSize(paneHeaderSize);
  }
  dispose() {
    for (const container3 of this.layoutService.containers) {
      container3.classList.remove(MODERN_UI_CLASS);
      container3.classList.remove(MODERN_UI_COMPACT_CLASS);
      container3.classList.remove(MODERN_UI_TABS_CLASS);
      container3.classList.remove(MODERN_UI_NOTIFICATIONS_DIALOGS_CLASS);
      container3.classList.remove(MODERN_UI_UPPERCASE_VIEW_HEADERS_CLASS);
    }
    setGlobalDefaultScrollbarSize(DEFAULT_SCROLLBAR_SIZE);
    setNotificationRowHeight(DEFAULT_NOTIFICATION_ROW_HEIGHT);
    setGlobalPaneHeaderSize(DEFAULT_PANE_HEADER_SIZE);
    super.dispose();
  }
};

ModernUIContribution = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, IWorkbenchLayoutService)
], ModernUIContribution);

registerWorkbenchContribution2(ModernUIContribution.ID, ModernUIContribution, WorkbenchPhase.BlockRestore);
export { MODERN_UI_SCROLLBAR_SIZE, MODERN_UI_PANE_HEADER_SIZE, MODERN_UI_CLASS, MODERN_UI_COMPACT_CLASS, MODERN_UI_TABS_CLASS, MODERN_UI_NOTIFICATIONS_DIALOGS_CLASS, MODERN_UI_UPPERCASE_VIEW_HEADERS_CLASS, LayoutDensityMenu, layoutDensityOptions, MODERN_UI_MODULES, ModernUIContribution };
