// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/codeAction/browser/codeActionModel.ts
import { RawContextKey } from "./module-0089.mjs";
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { TimeoutTimer, createCancelablePromise } from "./module-0036.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { isCancellationError } from "./module-0004.mjs";
import { Emitter } from "./module-0017.mjs";
import { CodeActionKind } from "./module-0558.mjs";
import { getCodeActions } from "./module-0559.mjs";
import { Progress } from "./module-0446.mjs";
import { HierarchicalKind } from "./module-0535.mjs";
import { Position } from "./module-0079.mjs";
import { Selection } from "./module-0107.mjs";


// src/vs/editor/contrib/codeAction/browser/codeActionModel.ts
var SUPPORTED_CODE_ACTIONS = new RawContextKey("supportedCodeAction", "");

var APPLY_FIX_ALL_COMMAND_ID = "_typescript.applyFixAllCodeAction";

var CodeActionOracle = class extends Disposable {
  constructor(_editor, _markerService, _signalChange, _delay = 250) {
    super();
    this._editor = _editor;
    this._markerService = _markerService;
    this._signalChange = _signalChange;
    this._delay = _delay;
    this._autoTriggerTimer = this._register(new TimeoutTimer());
    this.ignoreLightbulbOff = false;
    this._register(this._markerService.onMarkerChanged((e) => this._onMarkerChanges(e)));
    this._register(this._editor.onDidChangeCursorPosition(() => this._tryAutoTrigger()));
  }
  trigger(trigger) {
    const selection = this._getRangeOfSelectionUnlessWhitespaceEnclosed(trigger);
    this._signalChange(selection ? { trigger, selection } : void 0);
  }
  _onMarkerChanges(resources) {
    const model = this._editor.getModel();
    if (model && resources.some((resource) => isEqual2(resource, model.uri))) {
      this._tryAutoTrigger();
    }
  }
  _tryAutoTrigger() {
    this._autoTriggerTimer.cancelAndSet(() => {
      this.trigger({ type: 2 /* Auto */, triggerAction: "other (default)" /* Default */ });
    }, this._delay);
  }
  _getRangeOfSelectionUnlessWhitespaceEnclosed(trigger) {
    if (!this._editor.hasModel()) {
      return void 0;
    }
    const selection = this._editor.getSelection();
    if (trigger.type === 1 /* Invoke */) {
      return selection;
    }
    const enabled = this._editor.getOption(73 /* lightbulb */).enabled;
    if (enabled === "off" /* Off */ && !this.ignoreLightbulbOff) {
      return void 0;
    } else if (enabled === "off" /* Off */ || enabled === "on" /* On */) {
      return selection;
    } else if (enabled === "onCode" /* OnCode */) {
      const isSelectionEmpty = selection.isEmpty();
      if (!isSelectionEmpty) {
        return selection;
      }
      const model = this._editor.getModel();
      const { lineNumber, column } = selection.getPosition();
      const line = model.getLineContent(lineNumber);
      if (line.length === 0) {
        return void 0;
      } else if (column === 1) {
        if (/\s/.test(line[0])) {
          return void 0;
        }
      } else if (column === model.getLineMaxColumn(lineNumber)) {
        if (/\s/.test(line[line.length - 1])) {
          return void 0;
        }
      } else {
        if (/\s/.test(line[column - 2]) && /\s/.test(line[column - 1])) {
          return void 0;
        }
      }
    }
    return selection;
  }
};

var CodeActionsState;

((CodeActionsState2) => {
  let Type3;
  ((Type4) => {
    Type4[Type4["Empty"] = 0] = "Empty";
    Type4[Type4["Triggered"] = 1] = "Triggered";
  })(Type3 = CodeActionsState2.Type || (CodeActionsState2.Type = {}));
  CodeActionsState2.Empty = { type: 0 /* Empty */ };
  class Triggered {
    constructor(trigger, position2, _cancellablePromise) {
      this.trigger = trigger;
      this.position = position2;
      this._cancellablePromise = _cancellablePromise;
      this.type = 1 /* Triggered */;
      this.actions = _cancellablePromise.catch((e) => {
        if (isCancellationError(e)) {
          return emptyCodeActionSet;
        }
        throw e;
      });
    }
    cancel() {
      this._cancellablePromise.cancel();
    }
  }
  CodeActionsState2.Triggered = Triggered;
})(CodeActionsState || (CodeActionsState = {}));

var emptyCodeActionSet = Object.freeze({
  allActions: [],
  validActions: [],
  dispose: () => {
  },
  documentation: [],
  hasAutoFix: false,
  hasAIFix: false,
  allAIFixes: false
});

var CodeActionModel = class extends Disposable {
  constructor(_editor, _registry2, _markerService, contextKeyService, _progressService, _configurationService) {
    super();
    this._editor = _editor;
    this._registry = _registry2;
    this._markerService = _markerService;
    this._progressService = _progressService;
    this._configurationService = _configurationService;
    this._codeActionOracle = this._register(new MutableDisposable());
    this._state = CodeActionsState.Empty;
    this._onDidChangeState = this._register(new Emitter());
    this.onDidChangeState = this._onDidChangeState.event;
    this.codeActionsDisposable = this._register(new MutableDisposable());
    this._disposed = false;
    this._ignoreLightbulbOff = false;
    this._supportedCodeActions = SUPPORTED_CODE_ACTIONS.bindTo(contextKeyService);
    this._register(this._editor.onDidChangeModel(() => this._update()));
    this._register(this._editor.onDidChangeModelLanguage(() => this._update()));
    this._register(this._registry.onDidChange(() => this._update()));
    this._register(this._editor.onDidChangeConfiguration((e) => {
      if (e.hasChanged(73 /* lightbulb */)) {
        this._update();
      }
    }));
    this._update();
  }
  set ignoreLightbulbOff(value2) {
    if (this._ignoreLightbulbOff === value2) {
      return;
    }
    this._ignoreLightbulbOff = value2;
    const oracle = this._codeActionOracle.value;
    if (oracle) {
      oracle.ignoreLightbulbOff = value2;
      if (value2) {
        oracle.trigger({ type: 2 /* Auto */, triggerAction: "other (default)" /* Default */ });
      }
    }
  }
  dispose() {
    if (this._disposed) {
      return;
    }
    this._disposed = true;
    super.dispose();
    this.setState(CodeActionsState.Empty, true);
  }
  _settingEnabledNearbyQuickfixes() {
    const model = this._editor?.getModel();
    return this._configurationService ? this._configurationService.getValue("editor.codeActionWidget.includeNearbyQuickFixes", { resource: model?.uri }) : false;
  }
  _update() {
    if (this._disposed) {
      return;
    }
    this._codeActionOracle.value = void 0;
    this.setState(CodeActionsState.Empty);
    this.codeActionsDisposable.clear();
    const model = this._editor.getModel();
    if (model && this._registry.has(model) && !this._editor.getOption(104 /* readOnly */)) {
      const supportedActions = this._registry.all(model).flatMap((provider) => provider.providedCodeActionKinds ?? []);
      this._supportedCodeActions.set(supportedActions.join(" "));
      const oracle = new CodeActionOracle(this._editor, this._markerService, (trigger) => {
        if (!trigger) {
          this.setState(CodeActionsState.Empty);
          return;
        }
        const startPosition = trigger.selection.getStartPosition();
        const actions = createCancelablePromise(async (token) => {
          if (this._settingEnabledNearbyQuickfixes() && trigger.trigger.type === 1 /* Invoke */ && (trigger.trigger.triggerAction === "quick fix action" /* QuickFix */ || trigger.trigger.filter?.include?.contains(CodeActionKind.QuickFix))) {
            const codeActionSets = new DisposableStore();
            let codeActionSetsOwnedByResult = false;
            try {
              const codeActionSet2 = codeActionSets.add(await getCodeActions(this._registry, model, trigger.selection, trigger.trigger, Progress.None, token));
              const allCodeActions = [...codeActionSet2.allActions];
              if (token.isCancellationRequested) {
                return emptyCodeActionSet;
              }
              const foundQuickfix = codeActionSet2.validActions?.some((action) => {
                return action.action.kind && CodeActionKind.QuickFix.contains(new HierarchicalKind(action.action.kind)) && !action.action.isAI;
              });
              const allMarkers = this._markerService.read({ resource: model.uri });
              if (foundQuickfix) {
                for (const action of codeActionSet2.validActions) {
                  if (action.action.command?.arguments?.some((arg) => typeof arg === "string" && arg.includes(APPLY_FIX_ALL_COMMAND_ID))) {
                    action.action.diagnostics = [...allMarkers.filter((marker) => marker.relatedInformation)];
                  }
                }
                const result = this._setCodeActions({ validActions: codeActionSet2.validActions, allActions: allCodeActions, documentation: codeActionSet2.documentation, hasAutoFix: codeActionSet2.hasAutoFix, hasAIFix: codeActionSet2.hasAIFix, allAIFixes: codeActionSet2.allAIFixes, dispose: () => codeActionSets.dispose() });
                codeActionSetsOwnedByResult = true;
                return result;
              } else if (!foundQuickfix) {
                if (allMarkers.length > 0) {
                  const currPosition = trigger.selection.getPosition();
                  let trackedPosition = currPosition;
                  let distance = Number.MAX_VALUE;
                  const currentActions = [...codeActionSet2.validActions];
                  for (const marker of allMarkers) {
                    const col = marker.endColumn;
                    const row = marker.endLineNumber;
                    const startRow = marker.startLineNumber;
                    if (row === currPosition.lineNumber || startRow === currPosition.lineNumber) {
                      trackedPosition = new Position(row, col);
                      const newCodeActionTrigger = {
                        type: trigger.trigger.type,
                        triggerAction: trigger.trigger.triggerAction,
                        filter: { include: trigger.trigger.filter?.include ? trigger.trigger.filter?.include : CodeActionKind.QuickFix },
                        autoApply: trigger.trigger.autoApply,
                        context: { notAvailableMessage: trigger.trigger.context?.notAvailableMessage || "", position: trackedPosition }
                      };
                      const selectionAsPosition = new Selection(trackedPosition.lineNumber, trackedPosition.column, trackedPosition.lineNumber, trackedPosition.column);
                      const actionsAtMarker = codeActionSets.add(await getCodeActions(this._registry, model, selectionAsPosition, newCodeActionTrigger, Progress.None, token));
                      if (token.isCancellationRequested) {
                        return emptyCodeActionSet;
                      }
                      if (actionsAtMarker.validActions.length !== 0) {
                        for (const action of actionsAtMarker.validActions) {
                          if (action.action.command?.arguments?.some((arg) => typeof arg === "string" && arg.includes(APPLY_FIX_ALL_COMMAND_ID))) {
                            action.action.diagnostics = [...allMarkers.filter((marker2) => marker2.relatedInformation)];
                          }
                        }
                        if (codeActionSet2.allActions.length === 0) {
                          allCodeActions.push(...actionsAtMarker.allActions);
                        }
                        if (Math.abs(currPosition.column - col) < distance) {
                          currentActions.unshift(...actionsAtMarker.validActions);
                        } else {
                          currentActions.push(...actionsAtMarker.validActions);
                        }
                      }
                      distance = Math.abs(currPosition.column - col);
                    }
                  }
                  const filteredActions = currentActions.filter((action, index2, self2) => self2.findIndex((a) => a.action.title === action.action.title) === index2);
                  filteredActions.sort((a, b) => {
                    if (a.action.isPreferred && !b.action.isPreferred) {
                      return -1;
                    } else if (!a.action.isPreferred && b.action.isPreferred) {
                      return 1;
                    } else if (a.action.isAI && !b.action.isAI) {
                      return 1;
                    } else if (!a.action.isAI && b.action.isAI) {
                      return -1;
                    } else {
                      return 0;
                    }
                  });
                  const result = this._setCodeActions({ validActions: filteredActions, allActions: allCodeActions, documentation: codeActionSet2.documentation, hasAutoFix: codeActionSet2.hasAutoFix, hasAIFix: codeActionSet2.hasAIFix, allAIFixes: codeActionSet2.allAIFixes, dispose: () => codeActionSets.dispose() });
                  codeActionSetsOwnedByResult = true;
                  return result;
                }
              }
            } finally {
              if (!codeActionSetsOwnedByResult) {
                codeActionSets.dispose();
              }
            }
          }
          if (trigger.trigger.type === 1 /* Invoke */) {
            const codeActions = await getCodeActions(this._registry, model, trigger.selection, trigger.trigger, Progress.None, token);
            if (token.isCancellationRequested) {
              codeActions.dispose();
              return emptyCodeActionSet;
            }
            return this._setCodeActions(codeActions);
          }
          const codeActionSet = await getCodeActions(this._registry, model, trigger.selection, trigger.trigger, Progress.None, token);
          if (token.isCancellationRequested) {
            codeActionSet.dispose();
            return emptyCodeActionSet;
          }
          return this._setCodeActions(codeActionSet);
        });
        if (trigger.trigger.type === 1 /* Invoke */) {
          this._progressService?.showWhile(actions, 250);
        }
        const newState = new CodeActionsState.Triggered(trigger.trigger, startPosition, actions);
        let isManualToAutoTransition = false;
        if (this._state.type === 1 /* Triggered */) {
          isManualToAutoTransition = this._state.trigger.type === 1 /* Invoke */ && newState.type === 1 /* Triggered */ && newState.trigger.type === 2 /* Auto */ && this._state.position !== newState.position;
        }
        if (!isManualToAutoTransition) {
          this.setState(newState);
        } else {
          setTimeout(() => {
            this.setState(newState);
          }, 500);
        }
      }, void 0);
      oracle.ignoreLightbulbOff = this._ignoreLightbulbOff;
      this._codeActionOracle.value = oracle;
      this._codeActionOracle.value.trigger({ type: 2 /* Auto */, triggerAction: "other (default)" /* Default */ });
    } else {
      this._supportedCodeActions.reset();
    }
  }
  _setCodeActions(actions) {
    this.codeActionsDisposable.value = actions;
    return actions;
  }
  /**
   * Transfers ownership of the current code actions to the caller.
   */
  takeCodeActions(actions) {
    if (this.codeActionsDisposable.value !== actions) {
      return void 0;
    }
    this.codeActionsDisposable.clearAndLeak();
    return actions;
  }
  trigger(trigger) {
    this._codeActionOracle.value?.trigger(trigger);
    this.codeActionsDisposable.clear();
  }
  setState(newState, skipNotify) {
    if (newState === this._state) {
      return;
    }
    if (this._state.type === 1 /* Triggered */) {
      this._state.cancel();
    }
    this._state = newState;
    if (!skipNotify && !this._disposed) {
      this._onDidChangeState.fire(newState);
    }
  }
};
export { SUPPORTED_CODE_ACTIONS, APPLY_FIX_ALL_COMMAND_ID, CodeActionOracle, CodeActionsState, emptyCodeActionSet, CodeActionModel };
