// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/debug/browser/debugChatIntegration.ts
import { localize } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { autorun } from "./module-0052.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { debouncedObservable } from "./module-0059.mjs";
import { derived } from "./module-0054.mjs";
import { ObservablePromise } from "./module-0055.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IDebugService } from "./module-1057.mjs";
import { Range2 } from "./module-0106.mjs";
import { basename2 } from "./module-0034.mjs";
import { IChatContextPickService } from "./module-1453.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { ChatContextKeys } from "./module-0965.mjs";
import { IChatWidgetService } from "./module-0981.mjs";
import { Variable3 } from "./module-1064.mjs";


// src/vs/workbench/contrib/debug/browser/debugChatIntegration.ts
var DebugSessionContextPick = class {
  constructor(debugService) {
    this.debugService = debugService;
    this.type = "pickerPick";
    this.label = localize(14376, null);
    this.icon = Codicon.debug;
    this.ordinal = -200;
  }
  isEnabled() {
    const viewModel = this.debugService.getViewModel();
    const focusedSession = viewModel.focusedSession;
    return !!focusedSession && focusedSession.state === 2 /* Stopped */;
  }
  asPicker(_widget) {
    const store = new DisposableStore();
    const mode = observableValue("debugPicker.mode", "main" /* Main */);
    const query = observableValue("debugPicker.query", "");
    const picksObservable = this.createPicksObservable(mode, query, store);
    return {
      placeholder: localize(14381, null),
      picks: (_queryObs, token) => {
        store.add(autorun((reader) => {
          query.set(_queryObs.read(reader), void 0);
        }));
        const cts = new CancellationTokenSource(token);
        store.add(toDisposable(() => cts.dispose(true)));
        return picksObservable;
      },
      goBack: () => {
        if (mode.get() === "expression" /* Expression */) {
          mode.set("main" /* Main */, void 0);
          return true;
        }
        return false;
      },
      dispose: () => store.dispose()
    };
  }
  createPicksObservable(mode, query, store) {
    const debouncedQuery = debouncedObservable(query, 300);
    return derived((reader) => {
      const currentMode = mode.read(reader);
      if (currentMode === "expression" /* Expression */) {
        return this.getExpressionPicks(debouncedQuery, store);
      } else {
        return this.getMainPicks(mode);
      }
    }).flatten();
  }
  getMainPicks(mode) {
    const promise = derived((_reader) => {
      return new ObservablePromise(this.buildMainPicks(mode));
    });
    return promise.map((value2, reader) => {
      const result = value2.promiseResult.read(reader);
      return { picks: result?.data || [], busy: result === void 0 };
    });
  }
  async buildMainPicks(mode) {
    const picks = [];
    const viewModel = this.debugService.getViewModel();
    const stackFrame = viewModel.focusedStackFrame;
    const session = viewModel.focusedSession;
    if (!session || !stackFrame) {
      return picks;
    }
    picks.push({
      label: localize(14378, null),
      iconClass: ThemeIcon.asClassName(Codicon.symbolVariable),
      asAttachment: () => {
        mode.set("expression" /* Expression */, void 0);
        return "noop";
      }
    });
    const watches = this.debugService.getModel().getWatchExpressions();
    if (watches.length > 0) {
      picks.push({ type: "separator", label: localize(14383, null) });
      for (const watch2 of watches) {
        picks.push({
          label: watch2.name,
          description: watch2.value,
          iconClass: ThemeIcon.asClassName(Codicon.eye),
          asAttachment: () => createDebugAttachments(stackFrame, createDebugVariableEntry(watch2))
        });
      }
    }
    let scopes = [];
    try {
      scopes = await stackFrame.getScopes();
    } catch {
    }
    for (const scope of scopes) {
      if (scope.expensive && !scope.childrenHaveBeenLoaded) {
        continue;
      }
      picks.push({ type: "separator", label: scope.name });
      try {
        const variables = await scope.getChildren();
        if (variables.length > 1) {
          picks.push({
            label: localize(14375, null, scope.name),
            iconClass: ThemeIcon.asClassName(Codicon.symbolNamespace),
            asAttachment: () => createDebugAttachments(stackFrame, createScopeEntry(scope, variables))
          });
        }
        for (const variable of variables) {
          picks.push({
            label: variable.name,
            description: formatVariableDescription(variable),
            iconClass: ThemeIcon.asClassName(Codicon.symbolVariable),
            asAttachment: () => createDebugAttachments(stackFrame, createDebugVariableEntry(variable))
          });
        }
      } catch {
      }
    }
    return picks;
  }
  getExpressionPicks(query, _store) {
    const promise = derived((reader) => {
      const queryValue = query.read(reader);
      const cts = new CancellationTokenSource();
      reader.store.add(toDisposable(() => cts.dispose(true)));
      return new ObservablePromise(this.evaluateExpression(queryValue, cts.token));
    });
    return promise.map((value2, r2) => {
      const result = value2.promiseResult.read(r2);
      return { picks: result?.data || [], busy: result === void 0 };
    });
  }
  async evaluateExpression(expression, token) {
    if (!expression.trim()) {
      return [{
        label: localize(14382, null),
        disabled: true,
        asAttachment: () => "noop"
      }];
    }
    const viewModel = this.debugService.getViewModel();
    const session = viewModel.focusedSession;
    const stackFrame = viewModel.focusedStackFrame;
    if (!session || !stackFrame) {
      return [{
        label: localize(14379, null),
        disabled: true,
        asAttachment: () => "noop"
      }];
    }
    try {
      const response = await session.evaluate(expression, stackFrame.frameId, "watch");
      if (token.isCancellationRequested) {
        return [];
      }
      if (response?.body) {
        const resultValue = response.body.result;
        const resultType = response.body.type;
        return [{
          label: expression,
          description: formatExpressionResult(resultValue, resultType),
          iconClass: ThemeIcon.asClassName(Codicon.symbolVariable),
          asAttachment: () => createDebugAttachments(stackFrame, {
            kind: "debugVariable",
            id: `debug-expression:${expression}`,
            name: expression,
            fullName: expression,
            icon: Codicon.debug,
            value: resultValue,
            expression,
            type: resultType,
            modelDescription: formatModelDescription(expression, resultValue, resultType)
          })
        }];
      } else {
        return [{
          label: expression,
          description: localize(14380, null),
          disabled: true,
          asAttachment: () => "noop"
        }];
      }
    } catch (err) {
      return [{
        label: expression,
        description: err instanceof Error ? err.message : localize(14377, null),
        disabled: true,
        asAttachment: () => "noop"
      }];
    }
  }
};

DebugSessionContextPick = __decorateClass([
  __decorateParam(0, IDebugService)
], DebugSessionContextPick);

function createDebugVariableEntry(expression) {
  return {
    kind: "debugVariable",
    id: `debug-variable:${expression.getId()}`,
    name: expression.name,
    fullName: expression.name,
    icon: Codicon.debug,
    value: expression.value,
    expression: expression.name,
    type: expression.type,
    modelDescription: formatModelDescription(expression.name, expression.value, expression.type)
  };
}

function createPausedLocationEntry(stackFrame) {
  const uri5 = stackFrame.source.uri;
  let range2 = Range2.lift(stackFrame.range);
  if (range2.isEmpty()) {
    range2 = range2.setEndPosition(range2.startLineNumber + 1, 1);
  }
  return {
    kind: "file",
    value: { uri: uri5, range: range2 },
    id: `debug-paused-location:${uri5.toString()}:${range2.startLineNumber}`,
    name: basename2(uri5),
    modelDescription: "The debugger is currently paused at this location"
  };
}

function createDebugAttachments(stackFrame, variableEntry) {
  return [
    createPausedLocationEntry(stackFrame),
    variableEntry
  ];
}

function createScopeEntry(scope, variables) {
  const variablesSummary = variables.map((v2) => `${v2.name}: ${v2.value}`).join("\n");
  return {
    kind: "debugVariable",
    id: `debug-scope:${scope.name}`,
    name: `Scope: ${scope.name}`,
    fullName: `Scope: ${scope.name}`,
    icon: Codicon.debug,
    value: variablesSummary,
    expression: scope.name,
    type: "scope",
    modelDescription: `Debug scope "${scope.name}" with ${variables.length} variables:
${variablesSummary}`
  };
}

function formatVariableDescription(expression) {
  const value2 = expression.value;
  const type = expression.type;
  if (type && value2) {
    return `${type}: ${value2}`;
  }
  return value2 || type || "";
}

function formatExpressionResult(value2, type) {
  if (type && value2) {
    return `${type}: ${value2}`;
  }
  return value2 || type || "";
}

function formatModelDescription(name, value2, type) {
  let description = `Debug variable "${name}"`;
  if (type) {
    description += ` of type ${type}`;
  }
  description += ` with value: ${value2}`;
  return description;
}

var DebugChatContextContribution = class extends Disposable {
  static {
    this.ID = "workbench.contrib.chat.debugChatContextContribution";
  }
  constructor(contextPickService, instantiationService) {
    super();
    this._register(contextPickService.registerChatContextItem(instantiationService.createInstance(DebugSessionContextPick)));
  }
};

DebugChatContextContribution = __decorateClass([
  __decorateParam(0, IChatContextPickService),
  __decorateParam(1, IInstantiationService)
], DebugChatContextContribution);

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.debug.action.addVariableToChat",
      title: localize(14374, null),
      f1: false,
      menu: {
        id: MenuId.DebugVariablesContext,
        group: "z_commands",
        order: 110,
        when: ChatContextKeys.enabled
      }
    });
  }
  async run(accessor, context2) {
    const chatWidgetService = accessor.get(IChatWidgetService);
    const debugService = accessor.get(IDebugService);
    const widget = await chatWidgetService.revealWidget();
    if (!widget) {
      return;
    }
    const entry = createDebugVariableEntryFromContext(context2);
    if (entry) {
      const stackFrame = debugService.getViewModel().focusedStackFrame;
      if (stackFrame) {
        widget.attachmentModel.addContext(createPausedLocationEntry(stackFrame));
      }
      widget.attachmentModel.addContext(entry);
    }
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.debug.action.addWatchExpressionToChat",
      title: localize(14374, null),
      f1: false,
      menu: {
        id: MenuId.DebugWatchContext,
        group: "z_commands",
        order: 110,
        when: ChatContextKeys.enabled
      }
    });
  }
  async run(accessor, context2) {
    const chatWidgetService = accessor.get(IChatWidgetService);
    const debugService = accessor.get(IDebugService);
    const widget = await chatWidgetService.revealWidget();
    if (!context2 || !widget) {
      return;
    }
    const stackFrame = debugService.getViewModel().focusedStackFrame;
    if (stackFrame) {
      widget.attachmentModel.addContext(createPausedLocationEntry(stackFrame));
    }
    widget.attachmentModel.addContext(createDebugVariableEntry(context2));
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.debug.action.addScopeToChat",
      title: localize(14374, null),
      f1: false,
      menu: {
        id: MenuId.DebugScopesContext,
        group: "z_commands",
        order: 1,
        when: ChatContextKeys.enabled
      }
    });
  }
  async run(accessor, context2) {
    const chatWidgetService = accessor.get(IChatWidgetService);
    const debugService = accessor.get(IDebugService);
    const widget = await chatWidgetService.revealWidget();
    if (!context2 || !widget) {
      return;
    }
    const viewModel = debugService.getViewModel();
    const stackFrame = viewModel.focusedStackFrame;
    if (!stackFrame) {
      return;
    }
    try {
      const scopes = await stackFrame.getScopes();
      const scope = scopes.find((s) => s.name === context2.scope.name);
      if (scope) {
        const variables = await scope.getChildren();
        widget.attachmentModel.addContext(createPausedLocationEntry(stackFrame));
        widget.attachmentModel.addContext(createScopeEntry(scope, variables));
      }
    } catch {
    }
  }
});

function isVariablesContext(context2) {
  return typeof context2 === "object" && context2 !== null && "variable" in context2 && "sessionId" in context2;
}

function createDebugVariableEntryFromContext(context2) {
  if (context2 instanceof Variable3) {
    return createDebugVariableEntry(context2);
  }
  if (isVariablesContext(context2)) {
    const variable = context2.variable;
    return {
      kind: "debugVariable",
      id: `debug-variable:${variable.name}`,
      name: variable.name,
      fullName: variable.evaluateName ?? variable.name,
      icon: Codicon.debug,
      value: variable.value,
      expression: variable.evaluateName ?? variable.name,
      type: variable.type,
      modelDescription: formatModelDescription(variable.evaluateName || variable.name, variable.value, variable.type)
    };
  }
  return void 0;
}
export { createDebugVariableEntry, createPausedLocationEntry, createDebugAttachments, createScopeEntry, formatVariableDescription, formatExpressionResult, formatModelDescription, isVariablesContext, createDebugVariableEntryFromContext, DebugSessionContextPick, DebugChatContextContribution };
