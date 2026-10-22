// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/dropOrPasteInto/browser/postEditWidget.ts
import { Disposable, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { Event2 } from "./module-0017.mjs";
import { $, EventType, addDisposableListener, getDomNodePagePosition } from "./module-0075.mjs";
import { Button } from "./module-0546.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IActionWidgetService } from "./module-0553.mjs";
import { isCancellationError } from "./module-0004.mjs";
import { EditorStateCancellationTokenSource } from "./module-0539.mjs";
import { raceCancellationError } from "./module-0036.mjs";
import { localize } from "./module-0001.mjs";
import { toErrorMessage } from "./module-0094.mjs";
import { createCombinedWorkspaceEdit } from "./module-0545.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IBulkEditService } from "./module-0537.mjs";
import { INotificationService } from "./module-0336.mjs";


// src/vs/editor/contrib/dropOrPasteInto/browser/postEditWidget.ts
var PostEditWidget = class extends Disposable {
  constructor(typeId, editor, visibleContext, showCommand, range2, edits, onSelectNewEdit, additionalActions, contextKeyService, _keybindingService, _actionWidgetService) {
    super();
    this.typeId = typeId;
    this.editor = editor;
    this.showCommand = showCommand;
    this.range = range2;
    this.edits = edits;
    this.onSelectNewEdit = onSelectNewEdit;
    this.additionalActions = additionalActions;
    this._keybindingService = _keybindingService;
    this._actionWidgetService = _actionWidgetService;
    this.allowEditorOverflow = true;
    this.suppressMouseDown = true;
    this.create();
    this.visibleContext = visibleContext.bindTo(contextKeyService);
    this.visibleContext.set(true);
    this._register(toDisposable(() => this.visibleContext.reset()));
    this.editor.addContentWidget(this);
    this.editor.layoutContentWidget(this);
    this._register(toDisposable((() => this.editor.removeContentWidget(this))));
    this._register(this.editor.onDidChangeCursorPosition((e4) => {
      this.dispose();
    }));
    this._register(Event2.runAndSubscribe(_keybindingService.onDidUpdateKeybindings, () => {
      this._updateButtonTitle();
    }));
  }
  static {
    this.baseId = "editor.widget.postEditWidget";
  }
  _updateButtonTitle() {
    this.button.element.title = this._keybindingService.appendKeybinding(this.showCommand.label, this.showCommand.id);
  }
  create() {
    this.domNode = $(".post-edit-widget");
    this.button = this._register(new Button(this.domNode, {
      supportIcons: true
    }));
    this.button.label = "$(insert)";
    this._register(addDisposableListener(this.domNode, EventType.CLICK, () => this.showSelector()));
  }
  getId() {
    return PostEditWidget.baseId + "." + this.typeId;
  }
  getDomNode() {
    return this.domNode;
  }
  getPosition() {
    return {
      position: this.range.getEndPosition(),
      preference: [2 /* BELOW */]
    };
  }
  showSelector() {
    const pos = getDomNodePagePosition(this.button.element);
    const anchor = { x: pos.left + pos.width, y: pos.top + pos.height };
    this._actionWidgetService.show(
      "postEditWidget",
      false,
      this.edits.allEdits.map((edit3, i2) => {
        return {
          kind: "action" /* Action */,
          item: edit3,
          label: edit3.title,
          disabled: false,
          canPreview: false,
          group: { title: "", icon: ThemeIcon.fromId(i2 === this.edits.activeEditIndex ? Codicon.check.id : Codicon.blank.id) }
        };
      }),
      {
        onHide: () => {
          this.editor.focus();
        },
        onSelect: (item) => {
          this._actionWidgetService.hide(false);
          const i2 = this.edits.allEdits.findIndex((edit3) => edit3 === item);
          if (i2 !== this.edits.activeEditIndex) {
            return this.onSelectNewEdit(i2);
          }
        }
      },
      anchor,
      this.editor.getDomNode() ?? void 0,
      this.additionalActions
    );
  }
};

PostEditWidget = __decorateClass([
  __decorateParam(8, IContextKeyService),
  __decorateParam(9, IKeybindingService),
  __decorateParam(10, IActionWidgetService)
], PostEditWidget);

var PostEditWidgetManager = class extends Disposable {
  constructor(_id, _editor, _visibleContext, _showCommand, _getAdditionalActions, _instantiationService, _bulkEditService, _notificationService) {
    super();
    this._id = _id;
    this._editor = _editor;
    this._visibleContext = _visibleContext;
    this._showCommand = _showCommand;
    this._getAdditionalActions = _getAdditionalActions;
    this._instantiationService = _instantiationService;
    this._bulkEditService = _bulkEditService;
    this._notificationService = _notificationService;
    this._currentWidget = this._register(new MutableDisposable());
    this._register(Event2.any(
      _editor.onDidChangeModel,
      _editor.onDidChangeModelContent
    )(() => this.clear()));
  }
  async applyEditAndShowIfNeeded(ranges, edits, canShowWidget, resolve3, token) {
    if (!ranges.length || !this._editor.hasModel()) {
      return;
    }
    const model = this._editor.getModel();
    const edit3 = edits.allEdits.at(edits.activeEditIndex);
    if (!edit3) {
      return;
    }
    const onDidSelectEdit = async (newEditIndex) => {
      const model2 = this._editor.getModel();
      if (!model2) {
        return;
      }
      await model2.undo();
      this.applyEditAndShowIfNeeded(ranges, { activeEditIndex: newEditIndex, allEdits: edits.allEdits }, canShowWidget, resolve3, token);
    };
    const handleError = (e4, message) => {
      if (isCancellationError(e4)) {
        return;
      }
      this._notificationService.error(message);
      if (canShowWidget) {
        this.show(ranges[0], edits, onDidSelectEdit);
      }
    };
    const editorStateCts = new EditorStateCancellationTokenSource(this._editor, 1 /* Value */ | 2 /* Selection */, void 0, token);
    let resolvedEdit;
    try {
      resolvedEdit = await raceCancellationError(resolve3(edit3, editorStateCts.token), editorStateCts.token);
    } catch (e4) {
      return handleError(e4, localize(1114, null, edit3.title, toErrorMessage(e4)));
    } finally {
      editorStateCts.dispose();
    }
    if (token.isCancellationRequested) {
      return;
    }
    const combinedWorkspaceEdit = createCombinedWorkspaceEdit(model.uri, ranges, resolvedEdit);
    const primaryRange = ranges[0];
    const editTrackingDecoration = model.deltaDecorations([], [{
      range: primaryRange,
      options: { description: "paste-line-suffix", stickiness: 0 /* AlwaysGrowsWhenTypingAtEdges */ }
    }]);
    this._editor.focus();
    let editResult;
    let editRange;
    try {
      editResult = await this._bulkEditService.apply(combinedWorkspaceEdit, { editor: this._editor, token });
      editRange = model.getDecorationRange(editTrackingDecoration[0]);
    } catch (e4) {
      return handleError(e4, localize(1113, null, edit3.title, toErrorMessage(e4)));
    } finally {
      model.deltaDecorations(editTrackingDecoration, []);
    }
    if (token.isCancellationRequested) {
      return;
    }
    if (canShowWidget && editResult.isApplied && edits.allEdits.length > 1) {
      this.show(editRange ?? primaryRange, edits, onDidSelectEdit);
    }
  }
  show(range2, edits, onDidSelectEdit) {
    this.clear();
    if (this._editor.hasModel()) {
      this._currentWidget.value = this._instantiationService.createInstance(PostEditWidget, this._id, this._editor, this._visibleContext, this._showCommand, range2, edits, onDidSelectEdit, this._getAdditionalActions());
    }
  }
  clear() {
    this._currentWidget.clear();
  }
  tryShowSelector() {
    this._currentWidget.value?.showSelector();
  }
};

PostEditWidgetManager = __decorateClass([
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, IBulkEditService),
  __decorateParam(7, INotificationService)
], PostEditWidgetManager);
export { PostEditWidget, PostEditWidgetManager };
