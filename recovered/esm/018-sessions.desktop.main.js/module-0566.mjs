// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/codeAction/browser/codeActionController.ts
import { Disposable, MutableDisposable } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { derivedOpts } from "./module-0054.mjs";
import { CodeActionModel, CodeActionsState } from "./module-0564.mjs";
import { Event2 } from "./module-0017.mjs";
import { applyCodeAction, autoFixCommandId, quickFixCommandId } from "./module-0559.mjs";
import { Lazy } from "./module-0028.mjs";
import { LightBulbWidget, computeLightBulbInfo } from "./module-0565.mjs";
import { CodeActionKeybindingResolver } from "./module-0561.mjs";
import { MessageController } from "./module-0542.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { ModelDecorationOptions } from "./module-0423.mjs";
import { Position } from "./module-0079.mjs";
import { HierarchicalKind } from "./module-0535.mjs";
import { CodeActionKind } from "./module-0558.mjs";
import { status } from "./module-0076.mjs";
import { localize } from "./module-0001.mjs";
import { toMenuItems } from "./module-0563.mjs";
import { getDomNodePagePosition } from "./module-0075.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IMarkerService } from "./module-0560.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { IEditorProgressService } from "./module-0446.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IActionWidgetService } from "./module-0553.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { registerThemingParticipant } from "./module-0287.mjs";
import { editorFindMatchHighlight, editorFindMatchHighlightBorder } from "./module-0229.mjs";
import { isHighContrast } from "./module-0247.mjs";


// src/vs/editor/contrib/codeAction/browser/codeActionController.ts
var DECORATION_CLASS_NAME = "quickfix-edit-highlight";

var CodeActionController = class extends Disposable {
  constructor(editor, markerService, contextKeyService, instantiationService, languageFeaturesService, progressService, _commandService, _configurationService, _actionWidgetService, _instantiationService, _progressService, _keybindingService) {
    super();
    this._commandService = _commandService;
    this._configurationService = _configurationService;
    this._actionWidgetService = _actionWidgetService;
    this._instantiationService = _instantiationService;
    this._progressService = _progressService;
    this._keybindingService = _keybindingService;
    this._activeCodeActions = this._register(new MutableDisposable());
    this._showDisabled = false;
    this._disposed = false;
    this._onlyLightBulbWithEmptySelection = false;
    this._lightBulbInfoObs = observableValue(this, void 0);
    this._preferredKbLabel = observableValue(this, void 0);
    this._quickFixKbLabel = observableValue(this, void 0);
    this._hasLightBulbStateObservers = false;
    this.lightBulbState = derivedOpts({
      owner: this,
      onLastObserverRemoved: () => {
        this._hasLightBulbStateObservers = false;
        this._model.ignoreLightbulbOff = false;
      }
    }, (reader) => {
      if (!this._hasLightBulbStateObservers) {
        this._hasLightBulbStateObservers = true;
        this._model.ignoreLightbulbOff = true;
      }
      return this._lightBulbInfoObs.read(reader);
    });
    this._editor = editor;
    this._model = this._register(new CodeActionModel(this._editor, languageFeaturesService.codeActionProvider, markerService, contextKeyService, progressService, _configurationService));
    this._register(this._model.onDidChangeState((newState) => this.update(newState)));
    this._register(Event2.runAndSubscribe(this._keybindingService.onDidUpdateKeybindings, () => {
      this._preferredKbLabel.set(this._keybindingService.lookupKeybinding(autoFixCommandId)?.getLabel() ?? void 0, void 0);
      this._quickFixKbLabel.set(this._keybindingService.lookupKeybinding(quickFixCommandId)?.getLabel() ?? void 0, void 0);
    }));
    this._lightBulbWidget = new Lazy(() => {
      const widget = this._editor.getContribution(LightBulbWidget.ID);
      if (widget) {
        this._register(widget.onClick((e4) => this.showCodeActionsFromLightbulb(e4.actions, e4)));
        widget.onlyWithEmptySelection = this._onlyLightBulbWithEmptySelection;
      }
      return widget;
    });
    this._resolver = instantiationService.createInstance(CodeActionKeybindingResolver);
    this._register(this._editor.onDidLayoutChange(() => this._actionWidgetService.hide()));
  }
  static {
    this.ID = "editor.contrib.codeActionController";
  }
  static get(editor) {
    return editor.getContribution(CodeActionController.ID);
  }
  set onlyLightBulbWithEmptySelection(value2) {
    const widget = this._lightBulbWidget.rawValue;
    if (widget) {
      widget.onlyWithEmptySelection = value2;
    }
    this._onlyLightBulbWithEmptySelection = value2;
  }
  dispose() {
    this._disposed = true;
    super.dispose();
  }
  async showCodeActionsFromLightbulb(actions, at) {
    if (actions.allAIFixes && actions.validActions.length === 1) {
      const actionItem = actions.validActions[0];
      const command4 = actionItem.action.command;
      if (command4 && command4.id === "inlineChat.start") {
        if (command4.arguments && command4.arguments.length >= 1 && command4.arguments[0]) {
          command4.arguments[0] = { ...command4.arguments[0], autoSend: false };
        }
      }
      await this.applyCodeAction(actionItem, false, false, "fromAILightbulb" /* FromAILightbulb */);
      return;
    }
    await this.showCodeActionList(actions, at, { includeDisabledActions: false, fromLightbulb: true });
  }
  showCodeActions(_trigger, actions, at) {
    return this.showCodeActionList(actions, at, { includeDisabledActions: false, fromLightbulb: false });
  }
  hideCodeActions() {
    this._actionWidgetService.hide();
  }
  manualTriggerAtCurrentPosition(notAvailableMessage, triggerAction, filter2, autoApply) {
    if (!this._editor.hasModel()) {
      return;
    }
    MessageController.get(this._editor)?.closeMessage();
    const triggerPosition = this._editor.getPosition();
    this._trigger({ type: 1 /* Invoke */, triggerAction, filter: filter2, autoApply, context: { notAvailableMessage, position: triggerPosition } });
  }
  _trigger(trigger) {
    return this._model.trigger(trigger);
  }
  async applyCodeAction(action, retrigger, preview, actionReason) {
    const progress = this._progressService.show(true, 500);
    try {
      await this._instantiationService.invokeFunction(applyCodeAction, action, actionReason, { preview, editor: this._editor });
    } finally {
      if (retrigger) {
        this._trigger({ type: 2 /* Auto */, triggerAction: "quick fix action" /* QuickFix */, filter: {} });
      }
      progress.done();
    }
  }
  hideLightBulbWidget() {
    this._lightBulbWidget.rawValue?.hide();
    this._lightBulbWidget.rawValue?.gutterHide();
  }
  async update(newState) {
    if (newState.type !== CodeActionsState.Type.Triggered) {
      this.hideLightBulbWidget();
      this._lightBulbInfoObs.set(void 0, void 0);
      return;
    }
    let actions;
    try {
      actions = this._model.takeCodeActions(await newState.actions);
    } catch (e4) {
      onUnexpectedError(e4);
      return;
    }
    if (!actions) {
      return;
    }
    if (this._disposed) {
      actions.dispose();
      return;
    }
    const selection = this._editor.getSelection();
    if (selection?.startLineNumber !== newState.position.lineNumber) {
      actions.dispose();
      return;
    }
    this._lightBulbWidget.value?.update(actions, newState.trigger, newState.position);
    this._lightBulbInfoObs.set(computeLightBulbInfo(actions, newState.trigger, this._preferredKbLabel.get(), this._quickFixKbLabel.get()), void 0);
    if (newState.trigger.type === 1 /* Invoke */) {
      if (newState.trigger.filter?.include) {
        const validActionToApply = this.tryGetValidActionToApply(newState.trigger, actions);
        if (validActionToApply) {
          try {
            this.hideLightBulbWidget();
            await this.applyCodeAction(validActionToApply, false, false, "fromCodeActions" /* FromCodeActions */);
          } finally {
            actions.dispose();
          }
          return;
        }
        if (newState.trigger.context) {
          const invalidAction = this.getInvalidActionThatWouldHaveBeenApplied(newState.trigger, actions);
          if (invalidAction && invalidAction.action.disabled) {
            MessageController.get(this._editor)?.showMessage(invalidAction.action.disabled, newState.trigger.context.position);
            actions.dispose();
            return;
          }
        }
      }
      const includeDisabledActions = !!newState.trigger.filter?.include;
      if (newState.trigger.context) {
        if (!actions.allActions.length || !includeDisabledActions && !actions.validActions.length) {
          MessageController.get(this._editor)?.showMessage(newState.trigger.context.notAvailableMessage, newState.trigger.context.position);
          this._activeCodeActions.value = actions;
          actions.dispose();
          return;
        }
      }
      this._activeCodeActions.value = actions;
      this.showCodeActionList(actions, this.toCoords(newState.position), { includeDisabledActions, fromLightbulb: false });
    } else {
      if (this._actionWidgetService.isVisible) {
        actions.dispose();
      } else {
        this._activeCodeActions.value = actions;
      }
    }
  }
  getInvalidActionThatWouldHaveBeenApplied(trigger, actions) {
    if (!actions.allActions.length) {
      return void 0;
    }
    if (trigger.autoApply === "first" /* First */ && actions.validActions.length === 0 || trigger.autoApply === "ifSingle" /* IfSingle */ && actions.allActions.length === 1) {
      return actions.allActions.find(({ action }) => action.disabled);
    }
    return void 0;
  }
  tryGetValidActionToApply(trigger, actions) {
    if (!actions.validActions.length) {
      return void 0;
    }
    if (trigger.autoApply === "first" /* First */ && actions.validActions.length > 0 || trigger.autoApply === "ifSingle" /* IfSingle */ && actions.validActions.length === 1) {
      return actions.validActions[0];
    }
    return void 0;
  }
  static {
    this.DECORATION = ModelDecorationOptions.register({
      description: "quickfix-highlight",
      className: DECORATION_CLASS_NAME
    });
  }
  async showCodeActionList(actions, at, options3) {
    const currentDecorations = this._editor.createDecorationsCollection();
    const editorDom = this._editor.getDomNode();
    if (!editorDom) {
      return;
    }
    const actionsToShow = options3.includeDisabledActions && (this._showDisabled || actions.validActions.length === 0) ? actions.allActions : actions.validActions;
    if (!actionsToShow.length) {
      return;
    }
    const anchor = Position.isIPosition(at) ? this.toCoords(at) : at;
    const delegate = {
      onSelect: async (action, preview) => {
        this.applyCodeAction(
          action,
          /* retrigger */
          true,
          !!preview,
          options3.fromLightbulb ? "fromAILightbulb" /* FromAILightbulb */ : "fromCodeActions" /* FromCodeActions */
        );
        this._actionWidgetService.hide(false);
        currentDecorations.clear();
      },
      onHide: (didCancel) => {
        this._editor?.focus();
        currentDecorations.clear();
      },
      onHover: async (action, token) => {
        if (token.isCancellationRequested) {
          return;
        }
        let canPreview = false;
        const actionKind = action.action.kind;
        if (actionKind) {
          const hierarchicalKind = new HierarchicalKind(actionKind);
          const refactorKinds = [
            CodeActionKind.RefactorExtract,
            CodeActionKind.RefactorInline,
            CodeActionKind.RefactorRewrite,
            CodeActionKind.RefactorMove,
            CodeActionKind.Source
          ];
          canPreview = refactorKinds.some((refactorKind) => refactorKind.contains(hierarchicalKind));
        }
        return { canPreview: canPreview || !!action.action.edit?.edits.length };
      },
      onFocus: (action) => {
        if (action && action.action) {
          const ranges = action.action.ranges;
          const diagnostics = action.action.diagnostics;
          currentDecorations.clear();
          if (ranges && ranges.length > 0) {
            const decorations = diagnostics && diagnostics?.length > 1 ? diagnostics.map((diagnostic) => ({ range: diagnostic, options: CodeActionController.DECORATION })) : ranges.map((range2) => ({ range: range2, options: CodeActionController.DECORATION }));
            currentDecorations.set(decorations);
          } else if (diagnostics && diagnostics.length > 0) {
            const decorations = diagnostics.map((diagnostic2) => ({ range: diagnostic2, options: CodeActionController.DECORATION }));
            currentDecorations.set(decorations);
            const diagnostic = diagnostics[0];
            if (diagnostic.startLineNumber && diagnostic.startColumn) {
              const selectionText = this._editor.getModel()?.getWordAtPosition({ lineNumber: diagnostic.startLineNumber, column: diagnostic.startColumn })?.word;
              status(localize(1036, null, selectionText, diagnostic.startLineNumber, diagnostic.startColumn));
            }
          }
        } else {
          currentDecorations.clear();
        }
      }
    };
    this._actionWidgetService.show(
      "codeActionWidget",
      true,
      toMenuItems(actionsToShow, this._shouldShowHeaders(), this._resolver.getResolver()),
      delegate,
      anchor,
      editorDom,
      this._getActionBarActions(actions, at, options3)
    );
  }
  toCoords(position2) {
    if (!this._editor.hasModel()) {
      return { x: 0, y: 0 };
    }
    this._editor.revealPosition(position2, 1 /* Immediate */);
    this._editor.render();
    const cursorCoords = this._editor.getScrolledVisiblePosition(position2);
    const editorCoords = getDomNodePagePosition(this._editor.getDomNode());
    const x = editorCoords.left + cursorCoords.left;
    const y = editorCoords.top + cursorCoords.top + cursorCoords.height;
    return { x, y };
  }
  _shouldShowHeaders() {
    const model = this._editor?.getModel();
    return this._configurationService.getValue("editor.codeActionWidget.showHeaders", { resource: model?.uri });
  }
  _getActionBarActions(actions, at, options3) {
    if (options3.fromLightbulb) {
      return [];
    }
    const resultActions = actions.documentation.map((command4) => ({
      id: command4.id,
      label: command4.title,
      tooltip: command4.tooltip ?? "",
      class: void 0,
      enabled: true,
      run: () => this._commandService.executeCommand(command4.id, ...command4.arguments ?? [])
    }));
    if (options3.includeDisabledActions && actions.validActions.length > 0 && actions.allActions.length !== actions.validActions.length) {
      resultActions.push(this._showDisabled ? {
        id: "hideMoreActions",
        label: localize(1037, null),
        enabled: true,
        tooltip: "",
        class: void 0,
        run: () => {
          this._showDisabled = false;
          return this.showCodeActionList(actions, at, options3);
        }
      } : {
        id: "showMoreActions",
        label: localize(1038, null),
        enabled: true,
        tooltip: "",
        class: void 0,
        run: () => {
          this._showDisabled = true;
          return this.showCodeActionList(actions, at, options3);
        }
      });
    }
    return resultActions;
  }
};

CodeActionController = __decorateClass([
  __decorateParam(1, IMarkerService),
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, ILanguageFeaturesService),
  __decorateParam(5, IEditorProgressService),
  __decorateParam(6, ICommandService),
  __decorateParam(7, IConfigurationService),
  __decorateParam(8, IActionWidgetService),
  __decorateParam(9, IInstantiationService),
  __decorateParam(10, IEditorProgressService),
  __decorateParam(11, IKeybindingService)
], CodeActionController);

registerThemingParticipant((theme, collector) => {
  const addBackgroundColorRule = (selector, color2) => {
    if (color2) {
      collector.addRule(`.monaco-editor ${selector} { background-color: ${color2}; }`);
    }
  };
  addBackgroundColorRule(".quickfix-edit-highlight", theme.getColor(editorFindMatchHighlight));
  const findMatchHighlightBorder = theme.getColor(editorFindMatchHighlightBorder);
  if (findMatchHighlightBorder) {
    collector.addRule(`.monaco-editor .quickfix-edit-highlight { border: 1px ${isHighContrast(theme.type) ? "dotted" : "solid"} ${findMatchHighlightBorder}; box-sizing: border-box; }`);
  }
});
export { DECORATION_CLASS_NAME, CodeActionController };
