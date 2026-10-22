// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/actionWidget/browser/tabbedActionListWidget.ts
import { Disposable, DisposableStore, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { $, EventHelper, addStandardDisposableListener, append, getActiveElement, trackFocus } from "./module-0075.mjs";
import { Radio } from "./module-2555.mjs";
import { ActionList } from "./module-0552.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextViewService } from "./module-0488.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/platform/actionWidget/browser/tabbedActionListWidget.ts
var TabbedActionListWidget = class extends Disposable {
  constructor(_contextViewService, _instantiationService) {
    super();
    this._contextViewService = _contextViewService;
    this._instantiationService = _instantiationService;
    this._onDidChangeTab = this._register(new Emitter());
    this.onDidChangeTab = this._onDidChangeTab.event;
    this._onDidHide = this._register(new Emitter());
    this.onDidHide = this._onDidHide.event;
    this._activePopup = this._register(new MutableDisposable());
    this._swappingTab = false;
  }
  get isVisible() {
    return !!this._activePopup.value;
  }
  /**
   * Shows the popup anchored to {@link ITabbedActionListShowOptions.anchor}.
   * If a popup is already visible, it is replaced in place.
   */
  show(options3) {
    const isSwap = this.isVisible;
    if (isSwap) {
      this._swappingTab = true;
      this._activePopup.value = void 0;
    }
    let activeTab = options3.initialTab;
    const popupDisposables = new DisposableStore();
    const hide4 = () => {
      if (this._activePopup.value === popupDisposables) {
        this._activePopup.value = void 0;
      }
    };
    this._activePopup.value = popupDisposables;
    popupDisposables.add(toDisposable(() => {
      this._contextViewService.hideContextView();
    }));
    let listRef;
    this._contextViewService.showContextView({
      getAnchor: () => options3.anchor,
      render: (container2) => {
        const renderDisposables = new DisposableStore();
        const widget = append(container2, $(".action-widget"));
        const tabBar = append(widget, $(".tabbed-action-list-tabbar"));
        if (options3.tabBarClassName) {
          tabBar.classList.add(options3.tabBarClassName);
        }
        const radio = renderDisposables.add(new Radio({
          items: options3.tabs.map((tab) => {
            const label3 = tab.label ?? tab.id;
            const text2 = tab.icon ? `$(${tab.icon.id}) ${label3}` : label3;
            return { text: text2, tooltip: tab.tooltip ?? label3, isActive: tab.id === activeTab };
          })
        }));
        tabBar.appendChild(radio.domNode);
        const activateTab = (next) => {
          if (next === activeTab) {
            return;
          }
          activeTab = next;
          this._onDidChangeTab.fire(next);
          this.show({ ...options3, initialTab: next });
        };
        renderDisposables.add(radio.onDidSelect((index2) => {
          const next = options3.tabs[index2];
          if (next) {
            activateTab(next.id);
          }
        }));
        const { items, listOptions } = options3.createActionList(activeTab);
        const list2 = renderDisposables.add(this._instantiationService.createInstance(
          ActionList,
          options3.user,
          false,
          items,
          options3.delegate,
          options3.accessibilityProvider,
          listOptions,
          options3.anchor
        ));
        listRef = list2;
        if (list2.filterContainer) {
          widget.appendChild(list2.filterContainer);
        }
        widget.appendChild(list2.domNode);
        const width2 = list2.layout(0);
        widget.style.width = `${options3.width ?? width2}px`;
        list2.focus();
        renderDisposables.add(addStandardDisposableListener(widget, "keydown", (e4) => {
          const target = e4.target;
          const onTabBar = !!target?.closest(".tabbed-action-list-tabbar");
          const onEditable = !!target?.closest('input, textarea, [contenteditable="true"]');
          if (e4.keyCode === 9 /* Escape */) {
            EventHelper.stop(e4, true);
            hide4();
            return;
          }
          if (e4.keyCode === 3 /* Enter */ && !onTabBar) {
            EventHelper.stop(e4, true);
            list2.acceptSelected();
            return;
          }
          if (e4.keyCode === 16 /* UpArrow */ && !onTabBar) {
            EventHelper.stop(e4, true);
            list2.focusPrevious();
            return;
          }
          if (e4.keyCode === 18 /* DownArrow */ && !onTabBar) {
            EventHelper.stop(e4, true);
            list2.focusNext();
            return;
          }
          if (e4.keyCode !== 15 /* LeftArrow */ && e4.keyCode !== 17 /* RightArrow */) {
            return;
          }
          if (onEditable && !onTabBar) {
            return;
          }
          const currentIndex = options3.tabs.findIndex((t2) => t2.id === activeTab);
          if (currentIndex < 0) {
            return;
          }
          const delta2 = e4.keyCode === 17 /* RightArrow */ ? 1 : -1;
          const nextIndex = (currentIndex + delta2 + options3.tabs.length) % options3.tabs.length;
          e4.preventDefault();
          e4.stopPropagation();
          activateTab(options3.tabs[nextIndex].id);
        }));
        const focusTracker = renderDisposables.add(trackFocus(container2));
        renderDisposables.add(focusTracker.onDidBlur(() => {
          if (this._swappingTab) {
            return;
          }
          const activeElement = getActiveElement();
          if (activeElement && (activeElement.closest(".action-widget-hover") || activeElement.closest(".action-list-submenu-panel"))) {
            return;
          }
          hide4();
        }));
        return renderDisposables;
      },
      onHide: () => {
        listRef = void 0;
        if (this._swappingTab) {
          return;
        }
        if (this._activePopup.value === popupDisposables) {
          this._activePopup.value = void 0;
        }
        options3.delegate.onHide?.();
        this._onDidHide.fire();
      },
      get anchorPosition() {
        return listRef?.anchorPosition;
      }
    }, void 0, false);
    if (isSwap) {
      this._swappingTab = false;
    }
  }
  hide() {
    this._activePopup.value = void 0;
  }
  dispose() {
    this._activePopup.value = void 0;
    super.dispose();
  }
};

TabbedActionListWidget = __decorateClass([
  __decorateParam(0, IContextViewService),
  __decorateParam(1, IInstantiationService)
], TabbedActionListWidget);
export { TabbedActionListWidget };
