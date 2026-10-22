// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/scrollLocking/browser/scrollLocking.ts
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { ReentrancyBarrier } from "./module-1137.mjs";
import { isEditorPaneWithScrolling } from "./module-0926.mjs";
import { SideBySideEditor2 } from "./module-1524.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Action2, registerAction2 } from "./module-0092.mjs";
import { Categories } from "./module-0847.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IStatusbarService } from "./module-0895.mjs";


// src/vs/workbench/contrib/scrollLocking/browser/scrollLocking.ts
var SyncScroll = class extends Disposable {
  constructor(editorService, statusbarService) {
    super();
    this.editorService = editorService;
    this.statusbarService = statusbarService;
    this.paneInitialScrollTop = /* @__PURE__ */ new Map();
    this.syncScrollDispoasbles = this._register(new DisposableStore());
    this.paneDisposables = this._register(new DisposableStore());
    this.statusBarEntry = this._register(new MutableDisposable());
    this.isActive = false;
    // makes sure that the onDidEditorPaneScroll is not called multiple times for the same event
    this._reentrancyBarrier = new ReentrancyBarrier();
    this.registerActions();
  }
  static {
    this.ID = "workbench.contrib.syncScrolling";
  }
  registerActiveListeners() {
    this.syncScrollDispoasbles.add(this.editorService.onDidVisibleEditorsChange(() => this.trackVisiblePanes()));
  }
  activate() {
    this.registerActiveListeners();
    this.trackVisiblePanes();
  }
  toggle() {
    if (this.isActive) {
      this.deactivate();
    } else {
      this.activate();
    }
    this.isActive = !this.isActive;
    this.toggleStatusbarItem(this.isActive);
  }
  trackVisiblePanes() {
    this.paneDisposables.clear();
    this.paneInitialScrollTop.clear();
    for (const pane of this.getAllVisiblePanes()) {
      if (!isEditorPaneWithScrolling(pane)) {
        continue;
      }
      this.paneInitialScrollTop.set(pane, pane.getScrollPosition());
      this.paneDisposables.add(pane.onDidChangeScroll(
        () => this._reentrancyBarrier.runExclusivelyOrSkip(() => {
          this.onDidEditorPaneScroll(pane);
        })
      ));
    }
  }
  onDidEditorPaneScroll(scrolledPane) {
    const scrolledPaneInitialOffset = this.paneInitialScrollTop.get(scrolledPane);
    if (scrolledPaneInitialOffset === void 0) {
      throw new Error("Scrolled pane not tracked");
    }
    if (!isEditorPaneWithScrolling(scrolledPane)) {
      throw new Error("Scrolled pane does not support scrolling");
    }
    const scrolledPaneCurrentPosition = scrolledPane.getScrollPosition();
    const scrolledFromInitial = {
      scrollTop: scrolledPaneCurrentPosition.scrollTop - scrolledPaneInitialOffset.scrollTop,
      scrollLeft: scrolledPaneCurrentPosition.scrollLeft !== void 0 && scrolledPaneInitialOffset.scrollLeft !== void 0 ? scrolledPaneCurrentPosition.scrollLeft - scrolledPaneInitialOffset.scrollLeft : void 0
    };
    for (const pane of this.getAllVisiblePanes()) {
      if (pane === scrolledPane) {
        continue;
      }
      if (!isEditorPaneWithScrolling(pane)) {
        continue;
      }
      const initialOffset = this.paneInitialScrollTop.get(pane);
      if (initialOffset === void 0) {
        throw new Error("Could not find initial offset for pane");
      }
      const currentPanePosition = pane.getScrollPosition();
      const newPaneScrollPosition = {
        scrollTop: initialOffset.scrollTop + scrolledFromInitial.scrollTop,
        scrollLeft: initialOffset.scrollLeft !== void 0 && scrolledFromInitial.scrollLeft !== void 0 ? initialOffset.scrollLeft + scrolledFromInitial.scrollLeft : void 0
      };
      if (currentPanePosition.scrollTop === newPaneScrollPosition.scrollTop && currentPanePosition.scrollLeft === newPaneScrollPosition.scrollLeft) {
        continue;
      }
      pane.setScrollPosition(newPaneScrollPosition);
    }
  }
  getAllVisiblePanes() {
    const panes = [];
    for (const pane of this.editorService.visibleEditorPanes) {
      if (pane instanceof SideBySideEditor2) {
        const primaryPane = pane.getPrimaryEditorPane();
        const secondaryPane = pane.getSecondaryEditorPane();
        if (primaryPane) {
          panes.push(primaryPane);
        }
        if (secondaryPane) {
          panes.push(secondaryPane);
        }
        continue;
      }
      panes.push(pane);
    }
    return panes;
  }
  deactivate() {
    this.paneDisposables.clear();
    this.syncScrollDispoasbles.clear();
    this.paneInitialScrollTop.clear();
  }
  // Actions & Commands
  toggleStatusbarItem(active) {
    if (active) {
      if (!this.statusBarEntry.value) {
        const text2 = localize(18957, null);
        const tooltip = localize(18956, null);
        this.statusBarEntry.value = this.statusbarService.addEntry({
          name: text2,
          text: text2,
          tooltip,
          ariaLabel: text2,
          command: {
            id: "workbench.action.toggleLockedScrolling",
            title: ""
          },
          kind: "prominent",
          showInAllWindows: true
        }, "status.scrollLockingEnabled", 1 /* RIGHT */, 102);
      }
    } else {
      this.statusBarEntry.clear();
    }
  }
  registerActions() {
    const $this = this;
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: "workbench.action.toggleLockedScrolling",
          title: {
            ...localize2(18959, "Toggle Locked Scrolling Across Editors"),
            mnemonicTitle: localize(18955, null)
          },
          category: Categories.View,
          f1: true,
          metadata: {
            description: localize(18958, null)
          }
        });
      }
      run() {
        $this.toggle();
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: "workbench.action.holdLockedScrolling",
          title: {
            ...localize2(18953, "Hold Locked Scrolling Across Editors"),
            mnemonicTitle: localize(18954, null)
          },
          category: Categories.View
        });
      }
      run(accessor) {
        const keybindingService = accessor.get(IKeybindingService);
        $this.toggle();
        const holdMode = keybindingService.enableKeybindingHoldMode("workbench.action.holdLockedScrolling");
        if (!holdMode) {
          return;
        }
        holdMode.finally(() => {
          $this.toggle();
        });
      }
    }));
  }
  dispose() {
    this.deactivate();
    super.dispose();
  }
};

SyncScroll = __decorateClass([
  __decorateParam(0, IEditorService),
  __decorateParam(1, IStatusbarService)
], SyncScroll);
export { SyncScroll };
