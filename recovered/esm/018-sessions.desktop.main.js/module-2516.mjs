// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/codeEditor/browser/quickaccess/gotoSymbolQuickAccess.ts
import { AbstractGotoSymbolQuickAccessProvider } from "./module-2513.mjs";
import { isCompositeEditor } from "./module-0223.mjs";
import { IEditorService, SIDE_GROUP } from "./module-0935.mjs";
import { timeout } from "./module-0036.mjs";
import { prepareQuery } from "./module-1522.mjs";
import { isAncestorOfActiveElement } from "./module-0075.mjs";
import { isRequestVM } from "./module-0979.mjs";
import { Disposable, DisposableStore, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { ChatOutline } from "./module-0981.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { matchesFuzzyIconAware, parseLabelWithIcons } from "./module-0461.mjs";
import { fuzzyScore } from "./module-0453.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { IOutlineService } from "./module-0972.mjs";
import { IOutlineModelService } from "./module-0691.mjs";
import { IChatWidgetService } from "./module-0982.mjs";
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { accessibilityHelpIsShown, accessibleViewIsShown } from "./module-1369.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions18 } from "./module-1552.mjs";


// src/vs/workbench/contrib/codeEditor/browser/quickaccess/gotoSymbolQuickAccess.ts
var GotoSymbolQuickAccessProvider = class extends AbstractGotoSymbolQuickAccessProvider {
  constructor(editorService, configurationService, languageFeaturesService, outlineService, outlineModelService, chatWidgetService) {
    super(languageFeaturesService, outlineModelService, {
      openSideBySideDirection: () => this.configuration.openSideBySideDirection
    });
    this.editorService = editorService;
    this.configurationService = configurationService;
    this.outlineService = outlineService;
    this.chatWidgetService = chatWidgetService;
    this.onDidActiveTextEditorControlChange = this.editorService.onDidActiveEditorChange;
  }
  //#region DocumentSymbols (text editor required)
  get configuration() {
    const editorConfig = this.configurationService.getValue().workbench?.editor;
    return {
      openEditorPinned: !editorConfig?.enablePreviewFromQuickOpen || !editorConfig?.enablePreview,
      openSideBySideDirection: editorConfig?.openSideBySideDirection
    };
  }
  get activeTextEditorControl() {
    if (isCompositeEditor(this.editorService.activeEditorPane?.getControl())) {
      return void 0;
    }
    return this.editorService.activeTextEditorControl;
  }
  gotoLocation(context2, options3) {
    if ((options3.keyMods.alt || this.configuration.openEditorPinned && options3.keyMods.ctrlCmd || options3.forceSideBySide) && this.editorService.activeEditor) {
      context2.restoreViewState?.();
      const editorOptions = {
        selection: options3.range,
        pinned: options3.keyMods.ctrlCmd || this.configuration.openEditorPinned,
        preserveFocus: options3.preserveFocus
      };
      this.editorService.openEditor(this.editorService.activeEditor, editorOptions, SIDE_GROUP);
    } else {
      super.gotoLocation(context2, options3);
    }
  }
  static {
    //#endregion
    //#region public methods to use this picker from other pickers
    this.SYMBOL_PICKS_TIMEOUT = 8e3;
  }
  async getSymbolPicks(model, filter2, options3, disposables, token) {
    const result = await Promise.race([
      this.waitForLanguageSymbolRegistry(model, disposables),
      timeout(GotoSymbolQuickAccessProvider.SYMBOL_PICKS_TIMEOUT)
    ]);
    if (!result || token.isCancellationRequested) {
      return [];
    }
    return this.doGetSymbolPicks(this.getDocumentSymbols(model, token), prepareQuery(filter2), options3, token, model);
  }
  async doGetSymbolPicks(symbolsPromise, query, options3, token, model) {
    const picks = await super.doGetSymbolPicks(symbolsPromise, query, options3, token, model);
    const modelUri = model.uri;
    for (const pick of picks) {
      const symbolPick = pick;
      if (symbolPick.range && !symbolPick.attach) {
        symbolPick.attach = () => {
          const widget = this.chatWidgetService.lastFocusedWidget;
          if (!widget) {
            return;
          }
          const entry = {
            kind: "symbol",
            id: JSON.stringify({ uri: modelUri.toString(), range: symbolPick.range.decoration }),
            name: symbolPick.symbolName ?? symbolPick.label,
            value: { uri: modelUri, range: symbolPick.range.decoration },
            symbolKind: symbolPick.kind
          };
          widget.attachmentModel.addContext(entry);
        };
      }
    }
    return picks;
  }
  //#endregion
  provide(picker, token, runOptions2) {
    const chatWidget = this.getActiveChatWidget();
    if (chatWidget) {
      picker.canAcceptInBackground = !!this.options?.canAcceptInBackground;
      picker.matchOnLabel = picker.matchOnDescription = picker.matchOnDetail = picker.sortByLabel = false;
      return this.doGetChatWidgetPicks(picker, chatWidget);
    }
    return super.provide(picker, token, runOptions2);
  }
  provideWithoutTextEditor(picker) {
    if (this.canPickWithOutlineService()) {
      return this.doGetOutlinePicks(picker);
    }
    return super.provideWithoutTextEditor(picker);
  }
  canPickWithOutlineService() {
    return this.editorService.activeEditorPane ? this.outlineService.canCreateOutline(this.editorService.activeEditorPane) : false;
  }
  getActiveChatWidget() {
    const widget = this.chatWidgetService.lastFocusedWidget;
    if (!widget || !isAncestorOfActiveElement(widget.domNode)) {
      return void 0;
    }
    return widget.viewModel?.getItems().some(isRequestVM) ? widget : void 0;
  }
  doGetChatWidgetPicks(picker, widget) {
    const disposables = new DisposableStore();
    const outline = disposables.add(new ChatOutline(widget, 4 /* QuickPick */));
    this.installNavigablePicks(picker, disposables, this.outlineToNavigableEntries(outline));
    return disposables;
  }
  doGetOutlinePicks(picker) {
    const pane = this.editorService.activeEditorPane;
    if (!pane) {
      return Disposable.None;
    }
    const cts = new CancellationTokenSource();
    const disposables = new DisposableStore();
    disposables.add(toDisposable(() => cts.dispose(true)));
    picker.busy = true;
    this.outlineService.createOutline(pane, 4 /* QuickPick */, cts.token).then((outline) => {
      if (!outline) {
        return;
      }
      if (cts.token.isCancellationRequested) {
        outline.dispose();
        return;
      }
      disposables.add(outline);
      const viewState = outline.captureViewState();
      disposables.add(toDisposable(() => {
        if (picker.selectedItems.length === 0) {
          viewState.dispose();
        }
      }));
      this.installNavigablePicks(picker, disposables, this.outlineToNavigableEntries(outline));
    }).catch((err) => {
      onUnexpectedError(err);
      picker.hide();
    }).finally(() => {
      picker.busy = false;
    });
    return disposables;
  }
  outlineToNavigableEntries(outline) {
    return outline.config.quickPickDataSource.getQuickPickElements().map((element) => ({
      label: element.label,
      description: element.description,
      ariaLabel: element.ariaLabel,
      iconClasses: element.iconClasses,
      reveal: () => outline.reveal(element.element, {}, false, false),
      preview: () => outline.preview(element.element)
    }));
  }
  installNavigablePicks(picker, disposables, entries2) {
    const items = entries2.map((entry, index2) => {
      return {
        kind: 0 /* File */,
        index: index2,
        score: 0,
        label: entry.label,
        description: entry.description,
        ariaLabel: entry.ariaLabel,
        iconClasses: entry.iconClasses
      };
    });
    disposables.add(picker.onDidAccept(() => {
      picker.hide();
      const [item] = picker.selectedItems;
      if (item) {
        entries2[item.index]?.reveal();
      }
    }));
    const updatePickerItems = () => {
      const filteredItems = items.filter((item) => {
        if (picker.value === "@") {
          item.score = 0;
          item.highlights = void 0;
          return true;
        }
        const trimmedQuery = picker.value.substring(AbstractGotoSymbolQuickAccessProvider.PREFIX.length).trim();
        const parsedLabel = parseLabelWithIcons(item.label);
        const score3 = fuzzyScore(
          trimmedQuery,
          trimmedQuery.toLowerCase(),
          0,
          parsedLabel.text,
          parsedLabel.text.toLowerCase(),
          0,
          { firstMatchCanBeWeak: true, boostFullMatch: true }
        );
        if (!score3) {
          return false;
        }
        item.score = score3[1];
        item.highlights = { label: matchesFuzzyIconAware(trimmedQuery, parsedLabel) ?? void 0 };
        return true;
      });
      if (filteredItems.length === 0) {
        const label3 = localize(13817, null);
        picker.items = [{ label: label3, index: -1, kind: 14 /* String */ }];
        picker.ariaLabel = label3;
      } else {
        picker.items = filteredItems;
      }
    };
    updatePickerItems();
    disposables.add(picker.onDidChangeValue(updatePickerItems));
    const previewDisposable = new MutableDisposable();
    disposables.add(previewDisposable);
    disposables.add(picker.onDidChangeActive(() => {
      const [item] = picker.activeItems;
      if (item) {
        previewDisposable.value = entries2[item.index]?.preview();
      } else {
        previewDisposable.clear();
      }
    }));
  }
};

GotoSymbolQuickAccessProvider = __decorateClass([
  __decorateParam(0, IEditorService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, ILanguageFeaturesService),
  __decorateParam(3, IOutlineService),
  __decorateParam(4, IOutlineModelService),
  __decorateParam(5, IChatWidgetService)
], GotoSymbolQuickAccessProvider);

var GotoSymbolAction = class _GotoSymbolAction extends Action2 {
  static {
    this.ID = "workbench.action.gotoSymbol";
  }
  constructor() {
    super({
      id: _GotoSymbolAction.ID,
      title: {
        ...localize2(13818, "Go to Symbol in Editor..."),
        mnemonicTitle: localize(13822, null)
      },
      f1: true,
      keybinding: {
        when: ContextKeyExpr.and(accessibleViewIsShown.negate(), accessibilityHelpIsShown.negate()),
        weight: 200 /* WorkbenchContrib */,
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 45 /* KeyO */
      },
      menu: [{
        id: MenuId.MenubarGoMenu,
        group: "4_symbol_nav",
        order: 1
      }]
    });
  }
  run(accessor) {
    accessor.get(IQuickInputService).quickAccess.show(GotoSymbolQuickAccessProvider.PREFIX, { itemActivation: 0 /* NONE */ });
  }
};

registerAction2(GotoSymbolAction);

Registry.as(Extensions18.Quickaccess).registerQuickAccessProvider({
  ctor: GotoSymbolQuickAccessProvider,
  prefix: AbstractGotoSymbolQuickAccessProvider.PREFIX,
  contextKey: "inFileSymbolsPicker",
  placeholder: localize(13821, null),
  helpEntries: [
    {
      description: localize(13820, null),
      prefix: AbstractGotoSymbolQuickAccessProvider.PREFIX,
      commandId: GotoSymbolAction.ID,
      commandCenterOrder: 40
    },
    {
      description: localize(13819, null),
      prefix: AbstractGotoSymbolQuickAccessProvider.PREFIX_BY_CATEGORY
    }
  ]
});
export { GotoSymbolQuickAccessProvider, GotoSymbolAction };
