// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/sessions/browser/aiCustomizationShortcutsWidget.ts
import { $, EventType, addDisposableListener, append, clearNode, getActiveElement } from "./module-0075.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { derived } from "./module-0054.mjs";
import { CUSTOMIZATION_ITEMS } from "./module-3524.mjs";
import { localize } from "./module-0001.mjs";
import { autorun } from "./module-0052.mjs";
import { DomScrollableElement } from "./module-0259.mjs";
import { MenuWorkbenchToolBar } from "./module-0519.mjs";
import { Menus } from "./module-3437.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IMcpService } from "./module-1206.mjs";
import { IAICustomizationItemsModel } from "./module-2618.mjs";
import { ICustomizationHarnessService } from "./module-1032.mjs";
import { IStorageService } from "./module-0512.mjs";


// src/vs/sessions/contrib/sessions/browser/aiCustomizationShortcutsWidget.ts
var $111 = $;

var CUSTOMIZATIONS_VERTICAL_PADDING = 6;

var CUSTOMIZATIONS_COLLAPSED_STORAGE_KEY = "agentSessions.customizationsShortcuts.collapsed";

var AICustomizationShortcutsWidget = class extends Disposable {
  constructor(container2, options3, instantiationService, mcpService, itemsModel, harnessService, storageService) {
    super();
    this.instantiationService = instantiationService;
    this.mcpService = mcpService;
    this.itemsModel = itemsModel;
    this.harnessService = harnessService;
    this.storageService = storageService;
    this._renderDisposables = this._register(new DisposableStore());
    this._rootVerticalPadding = 0;
    this._headerTotalCount = 0;
    this._collapsed = false;
    this._onDidChangeHeight = this._register(new Emitter());
    this.onDidChangeHeight = this._onDidChangeHeight.event;
    this._onDidToggleCollapsed = this._register(new Emitter());
    this.onDidToggleCollapsed = this._onDidToggleCollapsed.event;
    this._collapsed = this.storageService.getBoolean(CUSTOMIZATIONS_COLLAPSED_STORAGE_KEY, 0 /* PROFILE */, false);
    this._wrapper = append(container2, $111(".ai-customization-shortcuts-widget"));
    this._options = options3;
    this._renderForCurrentMode();
  }
  get collapsed() {
    return this._collapsed;
  }
  get collapsedHeight() {
    const headerHeight = this._headerElement?.offsetHeight ?? 30;
    return this._rootVerticalPadding + headerHeight;
  }
  _renderForCurrentMode() {
    if (!this._wrapper) {
      return;
    }
    this._renderDisposables.clear();
    this._scrollableElement = void 0;
    this._toolbar = void 0;
    this._headerElement = void 0;
    this._headerTotalCountElement = void 0;
    this._chevronElement = void 0;
    this._toolbarContentElement = void 0;
    this._scrollableDomNode = void 0;
    this._rootVerticalPadding = 0;
    this._headerTotalCount = 0;
    clearNode(this._wrapper);
    this._render(this._wrapper, this._options);
    this._setCollapsed(this._collapsed);
  }
  _totalCount() {
    return derived((reader) => {
      this.harnessService.activeHarness.read(reader);
      this.harnessService.availableHarnesses.read(reader);
      const hidden = new Set(this.harnessService.getActiveDescriptor().hiddenSections ?? []);
      let total = 0;
      for (const config of CUSTOMIZATION_ITEMS) {
        if (config.section && hidden.has(config.section)) {
          continue;
        }
        if (config.modelSection) {
          total += this.itemsModel.getCount(config.modelSection).read(reader);
        } else if (config.isMcp) {
          total += this.mcpService.servers.read(reader).length;
        } else if (config.isPlugins) {
          total += this.itemsModel.getPluginCount().read(reader);
        }
      }
      return total;
    });
  }
  _render(parent, options3) {
    const container2 = append(parent, $111(".ai-customization-toolbar"));
    this._setRootPadding(container2, CUSTOMIZATIONS_VERTICAL_PADDING, CUSTOMIZATIONS_VERTICAL_PADDING);
    const header2 = append(container2, $111(".ai-customization-header"));
    this._headerElement = header2;
    header2.setAttribute("role", "button");
    header2.setAttribute("aria-expanded", "true");
    header2.tabIndex = 0;
    const headerLabel = append(header2, $111("span.ai-customization-header-label"));
    headerLabel.textContent = localize(5301, null);
    this._headerTotalCountElement = append(header2, $111("span.ai-customization-header-total-count.hidden"));
    this._chevronElement = append(header2, $111("span.ai-customization-chevron"));
    this._chevronElement.setAttribute("aria-hidden", "true");
    this._updateChevron();
    const totalCount = this._totalCount();
    this._renderDisposables.add(autorun((reader) => {
      this._headerTotalCount = totalCount.read(reader);
      this._renderHeaderTotalCount();
    }));
    this._renderDisposables.add(addDisposableListener(header2, EventType.CLICK, () => this._toggleCollapsed()));
    this._renderDisposables.add(addDisposableListener(header2, EventType.KEY_DOWN, (e4) => {
      if (e4.key === "Enter" || e4.key === " ") {
        e4.preventDefault();
        this._toggleCollapsed();
      }
    }));
    const scrollContent = $111(".ai-customization-toolbar-content-scrollable");
    const toolbarContainer = append(scrollContent, $111(".ai-customization-toolbar-content.sidebar-action-list"));
    this._toolbarContentElement = toolbarContainer;
    const scrollableElement = this._renderDisposables.add(new DomScrollableElement(scrollContent, {
      horizontal: 2 /* Hidden */,
      vertical: 1 /* Auto */,
      useShadows: false
    }));
    this._scrollableElement = scrollableElement;
    this._scrollableDomNode = append(container2, scrollableElement.getDomNode());
    const toolbar = this._renderDisposables.add(this.instantiationService.createInstance(MenuWorkbenchToolBar, toolbarContainer, Menus.SidebarCustomizations, {
      hiddenItemStrategy: -1 /* NoHide */,
      toolbarOptions: { primaryGroup: () => true },
      telemetrySource: "sidebarCustomizations"
    }));
    this._toolbar = toolbar;
    this._renderDisposables.add(toolbar.onDidChangeMenuItems(() => {
      this._scrollableElement?.scanDomNode();
      this._onDidChangeHeight.fire();
      options3?.onDidChangeLayout?.();
    }));
  }
  get desiredHeight() {
    const content = this._toolbarContentElement;
    if (!content) {
      return 0;
    }
    if (this._collapsed) {
      return this.collapsedHeight;
    }
    const headerHeight = this._headerElement?.offsetHeight ?? 0;
    const height = Math.ceil(this._rootVerticalPadding + headerHeight + content.scrollHeight);
    return Number.isFinite(height) ? height : 0;
  }
  _setRootPadding(element, top2, bottom) {
    element.style.padding = `${top2}px 0 ${bottom}px 0`;
    this._rootVerticalPadding = top2 + bottom;
  }
  _toggleCollapsed() {
    this._setCollapsed(!this._collapsed);
    this.storageService.store(CUSTOMIZATIONS_COLLAPSED_STORAGE_KEY, this._collapsed, 0 /* PROFILE */, 0 /* USER */);
    this._onDidToggleCollapsed.fire(this._collapsed);
    this._onDidChangeHeight.fire();
  }
  _setCollapsed(collapsed2) {
    if (collapsed2 && this._scrollableDomNode?.contains(getActiveElement())) {
      this._headerElement?.focus();
    }
    this._collapsed = collapsed2;
    this._headerElement?.classList.toggle("collapsed", collapsed2);
    this._headerElement?.setAttribute("aria-expanded", String(!collapsed2));
    if (this._scrollableDomNode) {
      this._scrollableDomNode.style.display = collapsed2 ? "none" : "";
    }
    this._updateChevron();
    this._renderHeaderTotalCount();
  }
  _updateChevron() {
    if (!this._chevronElement) {
      return;
    }
    this._chevronElement.className = "ai-customization-chevron";
    this._chevronElement.classList.add(...ThemeIcon.asClassNameArray(this._collapsed ? Codicon.chevronRight : Codicon.chevronDown));
  }
  _renderHeaderTotalCount() {
    if (!this._headerTotalCountElement) {
      return;
    }
    this._headerTotalCountElement.textContent = this._headerTotalCount > 0 ? `${this._headerTotalCount}` : "";
    this._headerTotalCountElement.classList.toggle("hidden", !this._collapsed || this._headerTotalCount === 0);
  }
  layout(_height, _width) {
    if (this._collapsed) {
      return;
    }
    this._scrollableElement?.scanDomNode();
  }
  focus() {
    if (this._collapsed) {
      this._headerElement?.focus();
      return;
    }
    this._toolbar?.focus();
  }
};

AICustomizationShortcutsWidget = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IMcpService),
  __decorateParam(4, IAICustomizationItemsModel),
  __decorateParam(5, ICustomizationHarnessService),
  __decorateParam(6, IStorageService)
], AICustomizationShortcutsWidget);
export { $111, CUSTOMIZATIONS_VERTICAL_PADDING, CUSTOMIZATIONS_COLLAPSED_STORAGE_KEY, AICustomizationShortcutsWidget };
