// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/history/browser/contextScopedHistoryWidget.ts
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { localize } from "./module-0001.mjs";
import { DisposableStore, toDisposable } from "./module-0012.mjs";
import { isActiveElement } from "./module-0075.mjs";
import { HistoryInputBox } from "./module-0600.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { FindInput } from "./module-0601.mjs";
import { ReplaceInput } from "./module-0602.mjs";
import { KeybindingsRegistry } from "./module-0091.mjs";


// src/vs/platform/history/browser/contextScopedHistoryWidget.ts
var historyNavigationVisible = new RawContextKey("suggestWidgetVisible", false, localize(3058, null));

var HistoryNavigationWidgetFocusContext = "historyNavigationWidgetFocus";

var HistoryNavigationForwardsEnablementContext = "historyNavigationForwardsEnabled";

var HistoryNavigationBackwardsEnablementContext = "historyNavigationBackwardsEnabled";

var lastFocusedWidget = void 0;

var widgets = [];

function registerAndCreateHistoryNavigationContext(scopedContextKeyService, widget) {
  if (widgets.includes(widget)) {
    throw new Error("Cannot register the same widget multiple times");
  }
  widgets.push(widget);
  const disposableStore = new DisposableStore();
  const historyNavigationWidgetFocus = new RawContextKey(HistoryNavigationWidgetFocusContext, false).bindTo(scopedContextKeyService);
  const historyNavigationForwardsEnablement = new RawContextKey(HistoryNavigationForwardsEnablementContext, true).bindTo(scopedContextKeyService);
  const historyNavigationBackwardsEnablement = new RawContextKey(HistoryNavigationBackwardsEnablementContext, true).bindTo(scopedContextKeyService);
  const onDidFocus = () => {
    historyNavigationWidgetFocus.set(true);
    lastFocusedWidget = widget;
  };
  const onDidBlur = () => {
    historyNavigationWidgetFocus.set(false);
    if (lastFocusedWidget === widget) {
      lastFocusedWidget = void 0;
    }
  };
  if (isActiveElement(widget.element)) {
    onDidFocus();
  }
  disposableStore.add(widget.onDidFocus(() => onDidFocus()));
  disposableStore.add(widget.onDidBlur(() => onDidBlur()));
  disposableStore.add(toDisposable(() => {
    widgets.splice(widgets.indexOf(widget), 1);
    onDidBlur();
  }));
  return {
    historyNavigationForwardsEnablement,
    historyNavigationBackwardsEnablement,
    dispose() {
      disposableStore.dispose();
    }
  };
}

var ContextScopedHistoryInputBox = class extends HistoryInputBox {
  constructor(container2, contextViewProvider, options3, contextKeyService) {
    super(container2, contextViewProvider, options3);
    const scopedContextKeyService = this._register(contextKeyService.createScoped(this.element));
    this._register(registerAndCreateHistoryNavigationContext(scopedContextKeyService, this));
  }
};

ContextScopedHistoryInputBox = __decorateClass([
  __decorateParam(3, IContextKeyService)
], ContextScopedHistoryInputBox);

var ContextScopedFindInput = class extends FindInput {
  constructor(container2, contextViewProvider, options3, contextKeyService) {
    super(container2, contextViewProvider, options3);
    const scopedContextKeyService = this._register(contextKeyService.createScoped(this.inputBox.element));
    this._register(registerAndCreateHistoryNavigationContext(scopedContextKeyService, this.inputBox));
  }
};

ContextScopedFindInput = __decorateClass([
  __decorateParam(3, IContextKeyService)
], ContextScopedFindInput);

var ContextScopedReplaceInput = class extends ReplaceInput {
  constructor(container2, contextViewProvider, options3, contextKeyService, showReplaceOptions = false) {
    super(container2, contextViewProvider, showReplaceOptions, options3);
    const scopedContextKeyService = this._register(contextKeyService.createScoped(this.inputBox.element));
    this._register(registerAndCreateHistoryNavigationContext(scopedContextKeyService, this.inputBox));
  }
};

ContextScopedReplaceInput = __decorateClass([
  __decorateParam(3, IContextKeyService)
], ContextScopedReplaceInput);

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "history.showPrevious",
  weight: 200 /* WorkbenchContrib */,
  when: ContextKeyExpr.and(
    ContextKeyExpr.has(HistoryNavigationWidgetFocusContext),
    ContextKeyExpr.equals(HistoryNavigationBackwardsEnablementContext, true),
    historyNavigationVisible.isEqualTo(false)
  ),
  primary: 16 /* UpArrow */,
  secondary: [512 /* Alt */ | 16 /* UpArrow */],
  handler: (accessor) => {
    lastFocusedWidget?.showPreviousValue();
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "history.showNext",
  weight: 200 /* WorkbenchContrib */,
  when: ContextKeyExpr.and(
    ContextKeyExpr.has(HistoryNavigationWidgetFocusContext),
    ContextKeyExpr.equals(HistoryNavigationForwardsEnablementContext, true),
    historyNavigationVisible.isEqualTo(false)
  ),
  primary: 18 /* DownArrow */,
  secondary: [512 /* Alt */ | 18 /* DownArrow */],
  handler: (accessor) => {
    lastFocusedWidget?.showNextValue();
  }
});
export { registerAndCreateHistoryNavigationContext, historyNavigationVisible, HistoryNavigationWidgetFocusContext, HistoryNavigationForwardsEnablementContext, HistoryNavigationBackwardsEnablementContext, lastFocusedWidget, widgets, ContextScopedHistoryInputBox, ContextScopedFindInput, ContextScopedReplaceInput };
