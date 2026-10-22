// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/gotoError/browser/gotoError.ts
import { DisposableStore } from "./module-0012.mjs";
import { MarkerNavigationWidget } from "./module-0700.mjs";
import { Range2 } from "./module-0106.mjs";
import { Position } from "./module-0079.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IMarkerNavigationService } from "./module-0698.mjs";
import { IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { EditorAction, EditorCommand, registerEditorAction, registerEditorCommand, registerEditorContribution } from "./module-0097.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { registerIcon } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";
import { MenuId } from "./module-0092.mjs";


// src/vs/editor/contrib/gotoError/browser/gotoError.ts
var MarkerController = class {
  constructor(editor, _markerNavigationService, _contextKeyService, _editorService, _instantiationService) {
    this._markerNavigationService = _markerNavigationService;
    this._contextKeyService = _contextKeyService;
    this._editorService = _editorService;
    this._instantiationService = _instantiationService;
    this._sessionDispoables = new DisposableStore();
    this._editor = editor;
    this._widgetVisible = CONTEXT_MARKERS_NAVIGATION_VISIBLE.bindTo(this._contextKeyService);
  }
  static {
    this.ID = "editor.contrib.markerController";
  }
  static get(editor) {
    return editor.getContribution(MarkerController.ID);
  }
  dispose() {
    this._cleanUp();
    this._sessionDispoables.dispose();
  }
  _cleanUp() {
    this._widgetVisible.reset();
    this._sessionDispoables.clear();
    this._widget = void 0;
    this._model = void 0;
  }
  _getOrCreateModel(uri4) {
    if (this._model && this._model.matches(uri4)) {
      return this._model;
    }
    let reusePosition = false;
    if (this._model) {
      reusePosition = true;
      this._cleanUp();
    }
    this._model = this._markerNavigationService.getMarkerList(uri4);
    if (reusePosition) {
      this._model.move(true, this._editor.getModel(), this._editor.getPosition());
    }
    this._widget = this._instantiationService.createInstance(MarkerNavigationWidget, this._editor);
    this._widget.onDidClose(() => this.close(), this, this._sessionDispoables);
    this._widgetVisible.set(true);
    this._sessionDispoables.add(this._model);
    this._sessionDispoables.add(this._widget);
    this._sessionDispoables.add(this._editor.onDidChangeCursorPosition((e4) => {
      if (!this._model?.selected || !Range2.containsPosition(this._model?.selected.marker, e4.position)) {
        this._model?.resetIndex();
      }
    }));
    this._sessionDispoables.add(this._model.onDidChange(() => {
      if (!this._widget || !this._widget.position || !this._model) {
        return;
      }
      const info = this._model.find(this._editor.getModel().uri, this._widget.position);
      if (info) {
        this._widget.updateMarker(info.marker);
      } else {
        this._widget.showStale();
      }
    }));
    this._sessionDispoables.add(this._widget.onDidSelectRelatedInformation((related) => {
      this._editorService.openCodeEditor({
        resource: related.resource,
        options: { pinned: true, revealIfOpened: true, selection: Range2.lift(related).collapseToStart() }
      }, this._editor);
      this.close(false);
    }));
    this._sessionDispoables.add(this._editor.onDidChangeModel(() => this._cleanUp()));
    return this._model;
  }
  close(focusEditor = true) {
    this._cleanUp();
    if (focusEditor) {
      this._editor.focus();
    }
  }
  showAtMarker(marker) {
    if (!this._editor.hasModel()) {
      return;
    }
    const textModel = this._editor.getModel();
    const model = this._getOrCreateModel(textModel.uri);
    model.resetIndex();
    model.move(true, textModel, new Position(marker.startLineNumber, marker.startColumn));
    if (model.selected) {
      this._widget.showAtMarker(model.selected.marker, model.selected.index, model.selected.total);
    }
  }
  async navigate(next, multiFile) {
    if (!this._editor.hasModel()) {
      return;
    }
    const textModel = this._editor.getModel();
    const model = this._getOrCreateModel(multiFile ? void 0 : textModel.uri);
    model.move(next, textModel, this._editor.getPosition());
    if (!model.selected) {
      return;
    }
    if (model.selected.marker.resource.toString() !== textModel.uri.toString()) {
      this._cleanUp();
      const otherEditor = await this._editorService.openCodeEditor({
        resource: model.selected.marker.resource,
        options: { pinned: false, revealIfOpened: true, selectionRevealType: 2 /* NearTop */, selection: model.selected.marker }
      }, this._editor);
      if (otherEditor) {
        MarkerController.get(otherEditor)?.close();
        MarkerController.get(otherEditor)?.navigate(next, multiFile);
      }
    } else {
      this._widget.showAtMarker(model.selected.marker, model.selected.index, model.selected.total);
    }
  }
};

MarkerController = __decorateClass([
  __decorateParam(1, IMarkerNavigationService),
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, ICodeEditorService),
  __decorateParam(4, IInstantiationService)
], MarkerController);

var MarkerNavigationAction = class extends EditorAction {
  constructor(_next, _multiFile, opts) {
    super(opts);
    this._next = _next;
    this._multiFile = _multiFile;
  }
  async run(_accessor, editor) {
    if (editor.hasModel()) {
      await MarkerController.get(editor)?.navigate(this._next, this._multiFile);
    }
  }
};

var NextMarkerAction = class _NextMarkerAction extends MarkerNavigationAction {
  static {
    this.ID = "editor.action.marker.next";
  }
  static {
    this.LABEL = localize2(1195, "Go to Next Problem (Error, Warning, Info)");
  }
  constructor() {
    super(true, false, {
      id: _NextMarkerAction.ID,
      label: _NextMarkerAction.LABEL,
      precondition: void 0,
      kbOpts: {
        kbExpr: EditorContextKeys.focus,
        primary: 512 /* Alt */ | 66 /* F8 */,
        weight: 100 /* EditorContrib */
      },
      menuOpts: {
        menuId: MarkerNavigationWidget.TitleMenu,
        title: _NextMarkerAction.LABEL.value,
        icon: registerIcon("marker-navigation-next", Codicon.arrowDown, localize(1201, null)),
        group: "navigation",
        order: 1
      }
    });
  }
};

var PrevMarkerAction = class _PrevMarkerAction extends MarkerNavigationAction {
  static {
    this.ID = "editor.action.marker.prev";
  }
  static {
    this.LABEL = localize2(1197, "Go to Previous Problem (Error, Warning, Info)");
  }
  constructor() {
    super(false, false, {
      id: _PrevMarkerAction.ID,
      label: _PrevMarkerAction.LABEL,
      precondition: void 0,
      kbOpts: {
        kbExpr: EditorContextKeys.focus,
        primary: 1024 /* Shift */ | 512 /* Alt */ | 66 /* F8 */,
        weight: 100 /* EditorContrib */
      },
      menuOpts: {
        menuId: MarkerNavigationWidget.TitleMenu,
        title: _PrevMarkerAction.LABEL.value,
        icon: registerIcon("marker-navigation-previous", Codicon.arrowUp, localize(1202, null)),
        group: "navigation",
        order: 2
      }
    });
  }
};

var NextMarkerInFilesAction = class _NextMarkerInFilesAction extends MarkerNavigationAction {
  static {
    this.ID = "editor.action.marker.nextInFiles";
  }
  constructor() {
    super(true, true, {
      id: _NextMarkerInFilesAction.ID,
      label: localize2(1196, "Go to Next Problem in Files (Error, Warning, Info)"),
      precondition: void 0,
      kbOpts: {
        kbExpr: EditorContextKeys.focus,
        primary: 66 /* F8 */,
        weight: 100 /* EditorContrib */
      },
      menuOpts: {
        menuId: MenuId.MenubarGoMenu,
        title: localize(1199, null),
        group: "6_problem_nav",
        order: 1
      }
    });
  }
};

var PrevMarkerInFilesAction = class _PrevMarkerInFilesAction extends MarkerNavigationAction {
  static {
    this.ID = "editor.action.marker.prevInFiles";
  }
  constructor() {
    super(false, true, {
      id: _PrevMarkerInFilesAction.ID,
      label: localize2(1198, "Go to Previous Problem in Files (Error, Warning, Info)"),
      precondition: void 0,
      kbOpts: {
        kbExpr: EditorContextKeys.focus,
        primary: 1024 /* Shift */ | 66 /* F8 */,
        weight: 100 /* EditorContrib */
      },
      menuOpts: {
        menuId: MenuId.MenubarGoMenu,
        title: localize(1200, null),
        group: "6_problem_nav",
        order: 2
      }
    });
  }
};

registerEditorContribution(MarkerController.ID, MarkerController, 4 /* Lazy */);

registerEditorAction(NextMarkerAction);

registerEditorAction(PrevMarkerAction);

registerEditorAction(NextMarkerInFilesAction);

registerEditorAction(PrevMarkerInFilesAction);

var CONTEXT_MARKERS_NAVIGATION_VISIBLE = new RawContextKey("markersNavigationVisible", false);

var MarkerCommand = EditorCommand.bindToContribution(MarkerController.get);

registerEditorCommand(new MarkerCommand({
  id: "closeMarkersNavigation",
  precondition: CONTEXT_MARKERS_NAVIGATION_VISIBLE,
  handler: (x) => x.close(),
  kbOpts: {
    weight: 100 /* EditorContrib */ + 50,
    kbExpr: EditorContextKeys.focus,
    primary: 9 /* Escape */,
    secondary: [1024 /* Shift */ | 9 /* Escape */]
  }
}));
export { MarkerController, MarkerNavigationAction, NextMarkerAction, PrevMarkerAction, NextMarkerInFilesAction, PrevMarkerInFilesAction, CONTEXT_MARKERS_NAVIGATION_VISIBLE, MarkerCommand };
