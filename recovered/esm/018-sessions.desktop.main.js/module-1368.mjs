// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/browser/actions/widgetNavigationCommands.ts
import { Disposable, combinedDisposable, toDisposable } from "./module-0012.mjs";
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0095.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";
import { KeybindingsRegistry } from "./module-0091.mjs";
import { WorkbenchListFocusContextKey, WorkbenchListScrollAtBottomContextKey, WorkbenchListScrollAtTopContextKey } from "./module-0636.mjs";


// src/vs/workbench/browser/actions/widgetNavigationCommands.ts
function handleFocusEventsGroup(group2, handler, onPartFocusChange) {
  const focusedIndices = /* @__PURE__ */ new Set();
  return combinedDisposable(...group2.map((events, index2) => combinedDisposable(
    events.onDidFocus(() => {
      onPartFocusChange?.(index2, "focus");
      if (!focusedIndices.size) {
        handler(true);
      }
      focusedIndices.add(index2);
    }),
    events.onDidBlur(() => {
      onPartFocusChange?.(index2, "blur");
      focusedIndices.delete(index2);
      if (!focusedIndices.size) {
        handler(false);
      }
    })
  )));
}

var NavigableContainerFocusedContextKey = new RawContextKey("navigableContainerFocused", false);

var NavigableContainerManager = class {
  constructor(contextKeyService, logService, configurationService) {
    this.logService = logService;
    this.configurationService = configurationService;
    this.containers = /* @__PURE__ */ new Set();
    this.focused = NavigableContainerFocusedContextKey.bindTo(contextKeyService);
    NavigableContainerManager.INSTANCE = this;
  }
  static {
    this.ID = "workbench.contrib.navigableContainerManager";
  }
  dispose() {
    this.containers.clear();
    this.focused.reset();
    NavigableContainerManager.INSTANCE = void 0;
  }
  get debugEnabled() {
    return this.configurationService.getValue("workbench.navigibleContainer.enableDebug");
  }
  log(msg, ...args2) {
    if (this.debugEnabled) {
      this.logService.debug(msg, ...args2);
    }
  }
  static register(container2) {
    const instance2 = this.INSTANCE;
    if (!instance2) {
      return Disposable.None;
    }
    instance2.containers.add(container2);
    instance2.log("NavigableContainerManager.register", container2.name);
    return combinedDisposable(
      handleFocusEventsGroup(container2.focusNotifiers, (isFocus) => {
        if (isFocus) {
          instance2.log("NavigableContainerManager.focus", container2.name);
          instance2.focused.set(true);
          instance2.lastContainer = container2;
        } else {
          instance2.log("NavigableContainerManager.blur", container2.name, instance2.lastContainer?.name);
          if (instance2.lastContainer === container2) {
            instance2.focused.set(false);
            instance2.lastContainer = void 0;
          }
        }
      }, (index2, event) => {
        instance2.log("NavigableContainerManager.partFocusChange", container2.name, index2, event);
      }),
      toDisposable(() => {
        instance2.containers.delete(container2);
        instance2.log("NavigableContainerManager.unregister", container2.name, instance2.lastContainer?.name);
        if (instance2.lastContainer === container2) {
          instance2.focused.set(false);
          instance2.lastContainer = void 0;
        }
      })
    );
  }
  static getActive() {
    return this.INSTANCE?.lastContainer;
  }
};

NavigableContainerManager = __decorateClass([
  __decorateParam(0, IContextKeyService),
  __decorateParam(1, ILogService),
  __decorateParam(2, IConfigurationService)
], NavigableContainerManager);

function registerNavigableContainer(container2) {
  return NavigableContainerManager.register(container2);
}

registerWorkbenchContribution2(NavigableContainerManager.ID, NavigableContainerManager, WorkbenchPhase.BlockStartup);

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "widgetNavigation.focusPrevious",
  weight: 200 /* WorkbenchContrib */,
  when: ContextKeyExpr.and(
    NavigableContainerFocusedContextKey,
    ContextKeyExpr.or(
      WorkbenchListFocusContextKey?.negate(),
      WorkbenchListScrollAtTopContextKey
    )
  ),
  primary: 2048 /* CtrlCmd */ | 16 /* UpArrow */,
  handler: () => {
    const activeContainer = NavigableContainerManager.getActive();
    activeContainer?.focusPreviousWidget();
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "widgetNavigation.focusNext",
  weight: 200 /* WorkbenchContrib */,
  when: ContextKeyExpr.and(
    NavigableContainerFocusedContextKey,
    ContextKeyExpr.or(
      WorkbenchListFocusContextKey?.negate(),
      WorkbenchListScrollAtBottomContextKey
    )
  ),
  primary: 2048 /* CtrlCmd */ | 18 /* DownArrow */,
  handler: () => {
    const activeContainer = NavigableContainerManager.getActive();
    activeContainer?.focusNextWidget();
  }
});
export { handleFocusEventsGroup, registerNavigableContainer, NavigableContainerFocusedContextKey, NavigableContainerManager };
