// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/inlineCompletions/browser/hintsWidget/inlineCompletionsHintsWidget.ts
import { Disposable, toDisposable } from "./module-0012.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { derived } from "./module-0054.mjs";
import { Position } from "./module-0079.mjs";
import { autorun, autorunWithStore } from "./module-0052.mjs";
import { derivedObservableWithCache } from "./module-0059.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { registerIcon } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { renderMarkdown } from "./module-0468.mjs";
import { h, n } from "./module-0075.mjs";
import { showNextInlineSuggestionActionId, showPreviousInlineSuggestionActionId } from "./module-0580.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Action, Separator } from "./module-0082.mjs";
import { IMenuService, MenuId, MenuItemAction } from "./module-0092.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { createHotClass } from "./module-0443.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { ActionViewItem } from "./module-0476.mjs";
import { MenuEntryActionViewItem, getActionBarActions } from "./module-0516.mjs";
import { KeybindingLabel, unthemedKeybindingLabelOptions } from "./module-0547.mjs";
import { OS } from "./module-0014.mjs";
import { WorkbenchToolBar } from "./module-0519.mjs";
import { equals } from "./module-0007.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { ITelemetryService } from "./module-0093.mjs";


// src/vs/editor/contrib/inlineCompletions/browser/hintsWidget/inlineCompletionsHintsWidget.ts
var InlineCompletionsHintsWidget = class extends Disposable {
  constructor(editor, model, instantiationService) {
    super();
    this.editor = editor;
    this.model = model;
    this.instantiationService = instantiationService;
    this.alwaysShowToolbar = observableFromEvent(this, this.editor.onDidChangeConfiguration, () => this.editor.getOption(71 /* inlineSuggest */).showToolbar === "always");
    this.sessionPosition = void 0;
    this.position = derived(this, (reader) => {
      const ghostText = this.model.read(reader)?.primaryGhostText.read(reader);
      if (!this.alwaysShowToolbar.read(reader) || !ghostText || ghostText.parts.length === 0) {
        this.sessionPosition = void 0;
        return null;
      }
      const firstColumn = ghostText.parts[0].column;
      if (this.sessionPosition && this.sessionPosition.lineNumber !== ghostText.lineNumber) {
        this.sessionPosition = void 0;
      }
      const position2 = new Position(ghostText.lineNumber, Math.min(firstColumn, this.sessionPosition?.column ?? Number.MAX_SAFE_INTEGER));
      this.sessionPosition = position2;
      return position2;
    });
    this._register(autorunWithStore((reader, store) => {
      const model2 = this.model.read(reader);
      if (!model2 || !this.alwaysShowToolbar.read(reader)) {
        return;
      }
      const contentWidgetValue = derived((reader2) => {
        const contentWidget = reader2.store.add(this.instantiationService.createInstance(
          InlineSuggestionHintsContentWidget.hot.read(reader2),
          this.editor,
          true,
          this.position,
          model2.selectedInlineCompletionIndex,
          model2.inlineCompletionsCount,
          model2.activeCommands,
          model2.warning,
          () => {
          }
        ));
        editor.addContentWidget(contentWidget);
        reader2.store.add(toDisposable(() => editor.removeContentWidget(contentWidget)));
        reader2.store.add(autorun((reader3) => {
          const position2 = this.position.read(reader3);
          if (!position2) {
            return;
          }
          if (model2.lastTriggerKind.read(reader3) !== 1 /* Explicit */) {
            model2.triggerExplicitly();
          }
        }));
        return contentWidget;
      });
      const hadPosition = derivedObservableWithCache(this, (reader2, lastValue) => !!this.position.read(reader2) || !!lastValue);
      store.add(autorun((reader2) => {
        if (hadPosition.read(reader2)) {
          contentWidgetValue.read(reader2);
        }
      }));
    }));
  }
};

InlineCompletionsHintsWidget = __decorateClass([
  __decorateParam(2, IInstantiationService)
], InlineCompletionsHintsWidget);

var inlineSuggestionHintsNextIcon = registerIcon("inline-suggestion-hints-next", Codicon.chevronRight, localize(1391, null));

var inlineSuggestionHintsPreviousIcon = registerIcon("inline-suggestion-hints-previous", Codicon.chevronLeft, localize(1392, null));

var InlineSuggestionHintsContentWidget = class extends Disposable {
  constructor(editor, withBorder, _position, _currentSuggestionIdx, _suggestionCount, _extraCommands, _warning, _relayout, _commandService, instantiationService, keybindingService, _contextKeyService, _menuService) {
    super();
    this.editor = editor;
    this.withBorder = withBorder;
    this._position = _position;
    this._currentSuggestionIdx = _currentSuggestionIdx;
    this._suggestionCount = _suggestionCount;
    this._extraCommands = _extraCommands;
    this._warning = _warning;
    this._relayout = _relayout;
    this._commandService = _commandService;
    this.keybindingService = keybindingService;
    this._contextKeyService = _contextKeyService;
    this._menuService = _menuService;
    this.id = `InlineSuggestionHintsContentWidget${InlineSuggestionHintsContentWidget.id++}`;
    this.allowEditorOverflow = true;
    this.suppressMouseDown = false;
    this._warningMessageContentNode = derived((reader) => {
      const warning = this._warning.read(reader);
      if (!warning) {
        return void 0;
      }
      if (typeof warning.message === "string") {
        return warning.message;
      }
      const markdownElement = reader.store.add(renderMarkdown(warning.message));
      return markdownElement.element;
    });
    this._warningMessageNode = n.div({
      class: "warningMessage",
      style: {
        maxWidth: 400,
        margin: 4,
        marginBottom: 4,
        display: derived((reader) => this._warning.read(reader) ? "block" : "none")
      }
    }, [
      this._warningMessageContentNode
    ]).keepUpdated(this._store);
    this.nodes = h("div.inlineSuggestionsHints", { className: this.withBorder ? "monaco-hover monaco-hover-content" : "" }, [
      this._warningMessageNode.element,
      h("div@toolBar")
    ]);
    this.previousAction = this._register(this.createCommandAction(showPreviousInlineSuggestionActionId, localize(1393, null), ThemeIcon.asClassName(inlineSuggestionHintsPreviousIcon)));
    this.availableSuggestionCountAction = this._register(new Action("inlineSuggestionHints.availableSuggestionCount", "", void 0, false));
    this.nextAction = this._register(this.createCommandAction(showNextInlineSuggestionActionId, localize(1390, null), ThemeIcon.asClassName(inlineSuggestionHintsNextIcon)));
    this.inlineCompletionsActionsMenus = this._register(this._menuService.createMenu(
      MenuId.InlineCompletionsActions,
      this._contextKeyService
    ));
    this.clearAvailableSuggestionCountLabelDebounced = this._register(new RunOnceScheduler(() => {
      this.availableSuggestionCountAction.label = "";
    }, 100));
    this.disableButtonsDebounced = this._register(new RunOnceScheduler(() => {
      this.previousAction.enabled = this.nextAction.enabled = false;
    }, 100));
    this._register(autorun((reader) => {
      this._warningMessageContentNode.read(reader);
      this._warningMessageNode.readEffect(reader);
      this._relayout();
    }));
    this.toolBar = this._register(instantiationService.createInstance(CustomizedMenuWorkbenchToolBar, this.nodes.toolBar, MenuId.InlineSuggestionToolbar, {
      menuOptions: { renderShortTitle: true },
      toolbarOptions: { primaryGroup: (g) => g.startsWith("primary") },
      actionViewItemProvider: (action, options3) => {
        if (action instanceof MenuItemAction) {
          return instantiationService.createInstance(StatusBarViewItem, action, void 0);
        }
        if (action === this.availableSuggestionCountAction) {
          const a = new ActionViewItemWithClassName(void 0, action, { label: true, icon: false });
          a.setClass("availableSuggestionCount");
          return a;
        }
        return void 0;
      },
      telemetrySource: "InlineSuggestionToolbar"
    }));
    this.toolBar.setPrependedPrimaryActions([
      this.previousAction,
      this.availableSuggestionCountAction,
      this.nextAction
    ]);
    this._register(this.toolBar.onDidChangeDropdownVisibility((e4) => {
      InlineSuggestionHintsContentWidget._dropDownVisible = e4;
    }));
    this._register(autorun((reader) => {
      this._position.read(reader);
      this.editor.layoutContentWidget(this);
    }));
    this._register(autorun((reader) => {
      const suggestionCount = this._suggestionCount.read(reader);
      const currentSuggestionIdx = this._currentSuggestionIdx.read(reader);
      if (suggestionCount !== void 0) {
        this.clearAvailableSuggestionCountLabelDebounced.cancel();
        this.availableSuggestionCountAction.label = `${currentSuggestionIdx + 1}/${suggestionCount}`;
      } else {
        this.clearAvailableSuggestionCountLabelDebounced.schedule();
      }
      if (suggestionCount !== void 0 && suggestionCount > 1) {
        this.disableButtonsDebounced.cancel();
        this.previousAction.enabled = this.nextAction.enabled = true;
      } else {
        this.disableButtonsDebounced.schedule();
      }
    }));
    this._register(autorun((reader) => {
      const extraCommands = this._extraCommands.read(reader);
      const extraActions = extraCommands.map((c) => ({
        class: void 0,
        id: c.command.id,
        enabled: true,
        tooltip: c.command.tooltip || "",
        label: c.command.title,
        run: () => this._commandService.executeCommand(c.command.id, ...c.command.arguments ?? [])
      }));
      for (const [_, group2] of this.inlineCompletionsActionsMenus.getActions()) {
        for (const action of group2) {
          if (action instanceof MenuItemAction) {
            extraActions.push(action);
          }
        }
      }
      if (extraActions.length > 0) {
        extraActions.unshift(new Separator());
      }
      this.toolBar.setAdditionalSecondaryActions(extraActions);
    }));
  }
  static {
    this.hot = createHotClass(this);
  }
  static {
    this._dropDownVisible = false;
  }
  static get dropDownVisible() {
    return this._dropDownVisible;
  }
  static {
    this.id = 0;
  }
  createCommandAction(commandId, label3, iconClassName) {
    const action = new Action(
      commandId,
      label3,
      iconClassName,
      true,
      () => this._commandService.executeCommand(commandId)
    );
    action.tooltip = this.keybindingService.appendKeybinding(label3, commandId, this._contextKeyService);
    return action;
  }
  getId() {
    return this.id;
  }
  getDomNode() {
    return this.nodes.root;
  }
  getPosition() {
    return {
      position: this._position.get(),
      preference: [1 /* ABOVE */, 2 /* BELOW */],
      positionAffinity: 3 /* LeftOfInjectedText */
    };
  }
};

InlineSuggestionHintsContentWidget = __decorateClass([
  __decorateParam(8, ICommandService),
  __decorateParam(9, IInstantiationService),
  __decorateParam(10, IKeybindingService),
  __decorateParam(11, IContextKeyService),
  __decorateParam(12, IMenuService)
], InlineSuggestionHintsContentWidget);

var ActionViewItemWithClassName = class extends ActionViewItem {
  constructor() {
    super(...arguments);
    this._className = void 0;
  }
  setClass(className2) {
    this._className = className2;
  }
  render(container2) {
    super.render(container2);
    if (this._className) {
      container2.classList.add(this._className);
    }
  }
  updateTooltip() {
  }
};

var StatusBarViewItem = class extends MenuEntryActionViewItem {
  updateLabel() {
    const kb = this._keybindingService.lookupKeybinding(this._action.id, this._contextKeyService, true);
    if (!kb) {
      return super.updateLabel();
    }
    if (this.label) {
      const div = h("div.keybinding").root;
      const k = this._register(new KeybindingLabel(div, OS, { disableTitle: true, ...unthemedKeybindingLabelOptions }));
      k.set(kb);
      this.label.textContent = this._action.label;
      this.label.appendChild(div);
      this.label.classList.add("inlineSuggestionStatusBarItemLabel");
    }
  }
  updateTooltip() {
  }
};

var CustomizedMenuWorkbenchToolBar = class extends WorkbenchToolBar {
  constructor(container2, menuId, options22, menuService, contextKeyService, contextMenuService, keybindingService, commandService, telemetryService) {
    super(container2, { resetMenu: menuId, ...options22 }, menuService, contextKeyService, contextMenuService, keybindingService, commandService, telemetryService);
    this.menuId = menuId;
    this.options2 = options22;
    this.menuService = menuService;
    this.contextKeyService = contextKeyService;
    this.menu = this._store.add(this.menuService.createMenu(this.menuId, this.contextKeyService, { emitEventsForSubmenuChanges: true }));
    this.additionalActions = [];
    this.prependedPrimaryActions = [];
    this.additionalPrimaryActions = [];
    this._store.add(this.menu.onDidChange(() => this.updateToolbar()));
    this.updateToolbar();
  }
  updateToolbar() {
    const { primary, secondary } = getActionBarActions(
      this.menu.getActions(this.options2?.menuOptions),
      this.options2?.toolbarOptions?.primaryGroup,
      this.options2?.toolbarOptions?.shouldInlineSubmenu,
      this.options2?.toolbarOptions?.useSeparatorsInPrimaryActions
    );
    secondary.push(...this.additionalActions);
    primary.unshift(...this.prependedPrimaryActions);
    primary.push(...this.additionalPrimaryActions);
    this.setActions(primary, secondary);
  }
  setPrependedPrimaryActions(actions) {
    if (equals(this.prependedPrimaryActions, actions, (a, b) => a === b)) {
      return;
    }
    this.prependedPrimaryActions = actions;
    this.updateToolbar();
  }
  setAdditionalPrimaryActions(actions) {
    if (equals(this.additionalPrimaryActions, actions, (a, b) => a === b)) {
      return;
    }
    this.additionalPrimaryActions = actions;
    this.updateToolbar();
  }
  setAdditionalSecondaryActions(actions) {
    if (equals(this.additionalActions, actions, (a, b) => a === b)) {
      return;
    }
    this.additionalActions = actions;
    this.updateToolbar();
  }
};

CustomizedMenuWorkbenchToolBar = __decorateClass([
  __decorateParam(3, IMenuService),
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, IContextMenuService),
  __decorateParam(6, IKeybindingService),
  __decorateParam(7, ICommandService),
  __decorateParam(8, ITelemetryService)
], CustomizedMenuWorkbenchToolBar);
export { InlineCompletionsHintsWidget, inlineSuggestionHintsNextIcon, inlineSuggestionHintsPreviousIcon, InlineSuggestionHintsContentWidget, ActionViewItemWithClassName, StatusBarViewItem, CustomizedMenuWorkbenchToolBar };
