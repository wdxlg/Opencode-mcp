// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/codeEditor/browser/editorLineNumberMenu.ts
import { Registry } from "./module-0090.mjs";
import { Disposable } from "./module-0012.mjs";
import { isMacintosh } from "./module-0014.mjs";
import { IMenuService, MenuId } from "./module-0092.mjs";
import { Separator } from "./module-0082.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { registerEditorContribution } from "./module-0097.mjs";


// src/vs/workbench/contrib/codeEditor/browser/editorLineNumberMenu.ts
var GutterActionsRegistryImpl = class {
  constructor() {
    this._registeredGutterActionsGenerators = /* @__PURE__ */ new Set();
  }
  /**
   *
   * This exists solely to allow the debug and test contributions to add actions to the gutter context menu
   * which cannot be trivially expressed using when clauses and therefore cannot be statically registered.
   * If you want an action to show up in the gutter context menu, you should generally use MenuId.EditorLineNumberMenu instead.
   */
  registerGutterActionsGenerator(gutterActionsGenerator) {
    this._registeredGutterActionsGenerators.add(gutterActionsGenerator);
    return {
      dispose: () => {
        this._registeredGutterActionsGenerators.delete(gutterActionsGenerator);
      }
    };
  }
  getGutterActionsGenerators() {
    return Array.from(this._registeredGutterActionsGenerators.values());
  }
};

Registry.add("gutterActionsRegistry", new GutterActionsRegistryImpl());

var GutterActionsRegistry = Registry.as("gutterActionsRegistry");

var EditorLineNumberContextMenu = class extends Disposable {
  constructor(editor, contextMenuService, menuService, contextKeyService, instantiationService) {
    super();
    this.editor = editor;
    this.contextMenuService = contextMenuService;
    this.menuService = menuService;
    this.contextKeyService = contextKeyService;
    this.instantiationService = instantiationService;
    this._register(this.editor.onMouseDown((e4) => this.doShow(e4, false)));
  }
  static {
    this.ID = "workbench.contrib.editorLineNumberContextMenu";
  }
  show(e4) {
    this.doShow(e4, true);
  }
  doShow(e4, force) {
    const model = this.editor.getModel();
    if (!e4.event.rightButton && !(isMacintosh && e4.event.leftButton && e4.event.ctrlKey) && !force || e4.target.type !== 3 /* GUTTER_LINE_NUMBERS */ && e4.target.type !== 2 /* GUTTER_GLYPH_MARGIN */ || !e4.target.position || !model) {
      return;
    }
    const lineNumber = e4.target.position.lineNumber;
    const contextKeyService = this.contextKeyService.createOverlay([["editorLineNumber", lineNumber]]);
    const menu = this.menuService.createMenu(MenuId.EditorLineNumberContext, contextKeyService);
    const allActions = [];
    this.instantiationService.invokeFunction((accessor) => {
      for (const generator of GutterActionsRegistry.getGutterActionsGenerators()) {
        const collectedActions = /* @__PURE__ */ new Map();
        generator({ lineNumber, editor: this.editor, accessor }, {
          push: (action, group2 = "navigation") => {
            const actions = collectedActions.get(group2) ?? [];
            actions.push(action);
            collectedActions.set(group2, actions);
          }
        });
        for (const [group2, actions] of collectedActions.entries()) {
          allActions.push([group2, actions]);
        }
      }
      allActions.sort((a, b) => a[0].localeCompare(b[0]));
      const menuActions = menu.getActions({ arg: { lineNumber, uri: model.uri }, shouldForwardArgs: true });
      allActions.push(...menuActions);
      if (e4.target.type === 3 /* GUTTER_LINE_NUMBERS */) {
        const currentSelections = this.editor.getSelections();
        const lineRange = {
          startLineNumber: lineNumber,
          endLineNumber: lineNumber,
          startColumn: 1,
          endColumn: model.getLineLength(lineNumber) + 1
        };
        const containsSelection = currentSelections?.some((selection) => !selection.isEmpty() && selection.intersectRanges(lineRange) !== null);
        if (!containsSelection) {
          this.editor.setSelection(lineRange, "api" /* PROGRAMMATIC */);
        }
      }
      this.contextMenuService.showContextMenu({
        getAnchor: () => e4.event,
        getActions: () => Separator.join(...allActions.map((a) => a[1])),
        onHide: () => menu.dispose()
      });
    });
  }
};

EditorLineNumberContextMenu = __decorateClass([
  __decorateParam(1, IContextMenuService),
  __decorateParam(2, IMenuService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IInstantiationService)
], EditorLineNumberContextMenu);

registerEditorContribution(EditorLineNumberContextMenu.ID, EditorLineNumberContextMenu, 1 /* AfterFirstRender */);
export { GutterActionsRegistryImpl, GutterActionsRegistry, EditorLineNumberContextMenu };
