// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/browserView/electron-browser/features/browserFavoritesFeature.ts
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { WorkbenchHoverDelegate } from "./module-0520.mjs";
import { $ } from "./module-0075.mjs";
import { Button } from "./module-0546.mjs";
import { Codicon } from "./module-0085.mjs";
import { BrowserViewCommandId } from "./module-1237.mjs";
import { BROWSER_EDITOR_ACTIVE, BrowserActionCategory, BrowserEditor, BrowserEditorContribution, CONTEXT_BROWSER_HAS_URL } from "./module-4159.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { IEditorService } from "./module-0935.mjs";


// src/vs/workbench/contrib/browserView/electron-browser/features/browserFavoritesFeature.ts
var CONTEXT_BROWSER_URL_IS_FAVORITED = new RawContextKey("browserUrlIsFavorited", false, localize(8115, null));

var FavoriteIndicator = class extends Disposable {
  constructor(instantiationService, _keybindingService) {
    super();
    this._keybindingService = _keybindingService;
    this._onDidClick = this._register(new Emitter());
    this.onDidClick = this._onDidClick.event;
    const hoverDelegate = this._register(instantiationService.createInstance(
      WorkbenchHoverDelegate,
      "element",
      void 0,
      { position: { hoverPosition: 3 /* ABOVE */ } }
    ));
    this.element = $(".browser-favorite-indicator-container");
    this.element.style.display = "none";
    this._button = this._register(new Button(this.element, {
      supportIcons: true,
      title: this._tooltip(),
      small: true,
      hoverDelegate
    }));
    this._button.element.classList.add("browser-favorite-indicator");
    this._button.label = `$(${Codicon.starFull.id})`;
    this._button.element.setAttribute("aria-label", localize(8113, null));
    this._register(this._button.onDidClick(() => this._onDidClick.fire()));
    this._register(this._keybindingService.onDidUpdateKeybindings(() => {
      this._button.setTitle(this._tooltip());
    }));
  }
  _tooltip() {
    const kb = this._keybindingService.lookupKeybinding(BrowserViewCommandId.ToggleFavorite)?.getLabel();
    return kb ? localize(8114, null, kb) : localize(8113, null);
  }
  setVisible(visible) {
    this.element.style.display = visible ? "" : "none";
  }
};

var BrowserFavoritesFeature = class extends BrowserEditorContribution {
  constructor(editor, _storageService, instantiationService, contextKeyService, _keybindingService) {
    super(editor);
    this._storageService = _storageService;
    this._keybindingService = _keybindingService;
    this._onDidChangeState = this._register(new Emitter());
    this._urls = /* @__PURE__ */ new Set();
    this._load();
    this._isFavoriteContext = CONTEXT_BROWSER_URL_IS_FAVORITED.bindTo(contextKeyService);
    this._indicator = this._register(new FavoriteIndicator(instantiationService, this._keybindingService));
    this._register(this._indicator.onDidClick(() => this.toggleCurrent()));
    const storageListenerStore = this._register(new DisposableStore());
    this._register(this._storageService.onDidChangeValue(
      1 /* WORKSPACE */,
      BrowserFavoritesFeature.STORAGE_KEY,
      storageListenerStore
    )(() => {
      this._load();
      this._refresh();
      this._onDidChangeState.fire();
    }));
    this._suggestionProvider = {
      label: localize(8112, null),
      order: 50,
      actions: [],
      onDidChange: this._onDidChangeState.event,
      getSuggestions: async ({ input }) => {
        const suggestions = [];
        const current = input.url;
        for (const url of this._urls) {
          if (url === current) {
            continue;
          }
          const deleteAction = {
            id: "browser.favorites.delete",
            iconClass: ThemeIcon.asClassName(Codicon.trash),
            tooltip: localize(8113, null),
            run: () => this._remove(url)
          };
          suggestions.push({
            id: "favorite:" + url,
            label: url,
            icon: Codicon.star,
            apply: (target) => target.navigate(url),
            actions: [deleteAction]
          });
        }
        return suggestions;
      }
    };
    this._actionProvider = {
      onDidChange: this._onDidChangeState.event,
      getActions: (input) => {
        const url = input.url;
        if (!url) {
          return [];
        }
        const favorite = this._urls.has(url);
        const tooltip = favorite ? localize(8113, null) : localize(8110, null);
        const action = {
          id: "browser.toggleFavorite",
          iconClass: ThemeIcon.asClassName(favorite ? Codicon.starFull : Codicon.star),
          tooltip,
          alwaysVisible: true,
          toggle: { checked: favorite },
          location: 3 /* Input */,
          run: (target) => {
            const u = target.url;
            if (u) {
              this._toggle(u);
            }
          }
        };
        return [action];
      }
    };
  }
  static {
    this.STORAGE_KEY = "workbench.browser.favorites";
  }
  get widgets() {
    return [{ location: "postUrl" /* PostUrl */, element: this._indicator.element, order: 60 }];
  }
  get urlSuggestionProviders() {
    return [this._suggestionProvider];
  }
  get urlPickerActionProviders() {
    return [this._actionProvider];
  }
  onModelAttached(model, store) {
    store.add(model.onDidNavigate(() => {
      this._refresh();
      this._onDidChangeState.fire();
    }));
    this._refresh();
  }
  onModelDetached() {
    this._isFavoriteContext.reset();
    this._indicator.setVisible(false);
  }
  isFavorite(url) {
    return this._urls.has(url);
  }
  toggleCurrent() {
    const url = this.editor.model?.url;
    if (url) {
      this._toggle(url);
    }
  }
  _refresh() {
    const url = this.editor.model?.url ?? "";
    const favorite = !!url && this._urls.has(url);
    this._isFavoriteContext.set(favorite);
    this._indicator.setVisible(favorite);
  }
  _load() {
    const raw = this._storageService.get(BrowserFavoritesFeature.STORAGE_KEY, 1 /* WORKSPACE */);
    if (!raw) {
      this._urls = /* @__PURE__ */ new Set();
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      this._urls = new Set(
        Array.isArray(parsed) ? parsed.filter((u) => typeof u === "string") : []
      );
    } catch {
      this._urls = /* @__PURE__ */ new Set();
    }
  }
  _toggle(url) {
    if (this._urls.has(url)) {
      this._urls.delete(url);
    } else {
      this._urls.add(url);
    }
    this._storageService.store(
      BrowserFavoritesFeature.STORAGE_KEY,
      JSON.stringify([...this._urls]),
      1 /* WORKSPACE */,
      0 /* USER */
    );
    this._refresh();
    this._onDidChangeState.fire();
  }
  // Idempotent: callers that should never re-add a favorite (e.g. the per-item
  // delete button on suggestions) must use this rather than `_toggle`.
  _remove(url) {
    if (!this._urls.has(url)) {
      return;
    }
    this._urls.delete(url);
    this._storageService.store(
      BrowserFavoritesFeature.STORAGE_KEY,
      JSON.stringify([...this._urls]),
      1 /* WORKSPACE */,
      0 /* USER */
    );
    this._refresh();
    this._onDidChangeState.fire();
  }
};

BrowserFavoritesFeature = __decorateClass([
  __decorateParam(1, IStorageService),
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IKeybindingService)
], BrowserFavoritesFeature);

BrowserEditor.registerContribution(BrowserFavoritesFeature);

var ToggleFavoriteAction = class _ToggleFavoriteAction extends Action2 {
  static {
    this.ID = BrowserViewCommandId.ToggleFavorite;
  }
  constructor() {
    super({
      id: _ToggleFavoriteAction.ID,
      title: localize2(8111, "Add to Favorites"),
      category: BrowserActionCategory,
      icon: Codicon.star,
      f1: true,
      precondition: ContextKeyExpr.and(BROWSER_EDITOR_ACTIVE, CONTEXT_BROWSER_HAS_URL),
      toggled: {
        condition: CONTEXT_BROWSER_URL_IS_FAVORITED,
        icon: Codicon.starFull
      },
      menu: {
        id: MenuId.BrowserActionsToolbar,
        group: "4_data" /* Data */,
        order: 2,
        isHiddenByDefault: true
      },
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        when: ContextKeyExpr.and(BROWSER_EDITOR_ACTIVE, CONTEXT_BROWSER_HAS_URL),
        primary: 2048 /* CtrlCmd */ | 34 /* KeyD */
      }
    });
  }
  async run(accessor, browserEditor = accessor.get(IEditorService).activeEditorPane) {
    if (browserEditor instanceof BrowserEditor) {
      browserEditor.getContribution(BrowserFavoritesFeature)?.toggleCurrent();
    }
  }
};

registerAction2(ToggleFavoriteAction);
export { CONTEXT_BROWSER_URL_IS_FAVORITED, FavoriteIndicator, BrowserFavoritesFeature, ToggleFavoriteAction };
