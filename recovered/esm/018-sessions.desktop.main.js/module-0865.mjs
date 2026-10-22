// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/floatingMenu/browser/floatingMenu.ts
import { Disposable, toDisposable } from "./module-0012.mjs";
import { observableCodeEditor } from "./module-0493.mjs";
import { derived } from "./module-0054.mjs";
import { IMenuService, MenuId, MenuItemAction } from "./module-0092.mjs";
import { autorun } from "./module-0052.mjs";
import { constObservable } from "./module-0061.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { MenuEntryActionViewItem, getActionBarActions } from "./module-0516.mjs";
import { Separator } from "./module-0082.mjs";
import { h } from "./module-0075.mjs";
import { MenuWorkbenchToolBar } from "./module-0519.mjs";


// src/vs/editor/contrib/floatingMenu/browser/floatingMenu.ts
var FloatingEditorToolbar = class extends Disposable {
  static {
    this.ID = "editor.contrib.floatingToolbar";
  }
  constructor(editor, instantiationService, keybindingService, menuService) {
    super();
    const editorObs = this._register(observableCodeEditor(editor));
    const editorUriObs = derived((reader) => editorObs.model.read(reader)?.uri);
    const widget = this._register(instantiationService.createInstance(
      FloatingEditorToolbarWidget,
      MenuId.EditorContent,
      editor.contextKeyService,
      editorUriObs
    ));
    this._register(autorun((reader) => {
      const hasActions = widget.hasActions.read(reader);
      if (!hasActions) {
        return;
      }
      reader.store.add(editorObs.createOverlayWidget({
        allowEditorOverflow: false,
        domNode: widget.element,
        minContentWidthInPx: constObservable(0),
        position: constObservable({
          preference: 1 /* BOTTOM_RIGHT_CORNER */
        })
      }));
    }));
  }
};

FloatingEditorToolbar = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IKeybindingService),
  __decorateParam(3, IMenuService)
], FloatingEditorToolbar);

var FloatingEditorToolbarWidget = class extends Disposable {
  constructor(_menuId, _scopedContextKeyService, _toolbarContext, instantiationService, keybindingService, menuService) {
    super();
    const menu = this._register(menuService.createMenu(_menuId, _scopedContextKeyService));
    const menuGroupsObs = observableFromEvent(this, menu.onDidChange, () => menu.getActions());
    const menuPrimaryActionsObs = derived((reader) => {
      const menuGroups = menuGroupsObs.read(reader);
      const { primary } = getActionBarActions(menuGroups, () => true);
      return primary.filter((a) => a.id !== Separator.ID);
    });
    this.hasActions = derived((reader) => menuPrimaryActionsObs.read(reader).length > 0);
    this.element = h("div.floating-menu-overlay-widget").root;
    this._register(toDisposable(() => this.element.remove()));
    this._register(autorun((reader) => {
      const primaryActions = menuPrimaryActionsObs.read(reader);
      const hasActions = primaryActions.length > 0;
      const menuPrimaryActionId = hasActions ? primaryActions[0].id : void 0;
      const isSingleButton = primaryActions.length === 1;
      this.element.classList.toggle("single-button", isSingleButton);
      this.element.style.height = isSingleButton ? "28px" : "26px";
      if (!hasActions) {
        return;
      }
      const toolbar = instantiationService.createInstance(MenuWorkbenchToolBar, this.element, _menuId, {
        actionViewItemProvider: (action, options3) => {
          if (!(action instanceof MenuItemAction)) {
            return void 0;
          }
          return instantiationService.createInstance(class extends MenuEntryActionViewItem {
            render(container2) {
              super.render(container2);
              if (action.id === menuPrimaryActionId) {
                this.element?.classList.add("primary");
              }
            }
            updateLabel() {
              const keybinding = keybindingService.lookupKeybinding(action.id);
              const keybindingLabel2 = keybinding ? keybinding.getLabel() : void 0;
              if (this.options.label && this.label) {
                this.label.textContent = keybindingLabel2 ? `${this._commandAction.label} (${keybindingLabel2})` : this._commandAction.label;
              }
            }
          }, action, { ...options3, keybindingNotRenderedWithLabel: true });
        },
        hiddenItemStrategy: 0 /* Ignore */,
        menuOptions: {
          shouldForwardArgs: true
        },
        telemetrySource: "editor.overlayToolbar",
        toolbarOptions: {
          primaryGroup: () => true,
          useSeparatorsInPrimaryActions: true
        }
      });
      reader.store.add(toolbar);
      reader.store.add(autorun((reader2) => {
        const context2 = _toolbarContext.read(reader2);
        toolbar.context = context2;
      }));
    }));
  }
};

FloatingEditorToolbarWidget = __decorateClass([
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IKeybindingService),
  __decorateParam(5, IMenuService)
], FloatingEditorToolbarWidget);
export { FloatingEditorToolbar, FloatingEditorToolbarWidget };
