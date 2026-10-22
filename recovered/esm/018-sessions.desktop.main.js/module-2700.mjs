// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatEditing/notebook/overlayToolbarDecorator.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { ServiceCollection } from "./module-0440.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { MenuWorkbenchToolBar } from "./module-0519.mjs";
import { MenuId } from "./module-0092.mjs";
import { AccessibilitySignal, IAccessibilitySignalService } from "./module-0445.mjs";
import { ActionViewItem } from "./module-0476.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/workbench/contrib/chat/browser/chatEditing/notebook/overlayToolbarDecorator.ts
var OverlayToolbarDecorator = class extends Disposable {
  constructor(notebookEditor, notebookModel, instantiationService, accessibilitySignalService) {
    super();
    this.notebookEditor = notebookEditor;
    this.notebookModel = notebookModel;
    this.instantiationService = instantiationService;
    this.accessibilitySignalService = accessibilitySignalService;
    this._timeout = void 0;
    this.overlayDisposables = this._register(new DisposableStore());
  }
  decorate(changes) {
    if (this._timeout !== void 0) {
      clearTimeout(this._timeout);
    }
    this._timeout = setTimeout(() => {
      this._timeout = void 0;
      this.createMarkdownPreviewToolbars(changes);
    }, 100);
  }
  createMarkdownPreviewToolbars(changes) {
    this.overlayDisposables.clear();
    const accessibilitySignalService = this.accessibilitySignalService;
    const editor = this.notebookEditor;
    for (const change of changes) {
      const cellViewModel = this.getCellViewModel(change);
      if (!cellViewModel || cellViewModel.cellKind !== 1 /* Markup */) {
        continue;
      }
      const toolbarContainer = document.createElement("div");
      let overlayId = void 0;
      editor.changeCellOverlays((accessor) => {
        toolbarContainer.style.right = "44px";
        overlayId = accessor.addOverlay({
          cell: cellViewModel,
          domNode: toolbarContainer
        });
      });
      const removeOverlay = () => {
        editor.changeCellOverlays((accessor) => {
          if (overlayId) {
            accessor.removeOverlay(overlayId);
          }
        });
      };
      this.overlayDisposables.add({ dispose: removeOverlay });
      const toolbar = document.createElement("div");
      toolbarContainer.appendChild(toolbar);
      toolbar.className = "chat-diff-change-content-widget";
      toolbar.classList.add("hover");
      toolbar.style.position = "relative";
      toolbar.style.top = "18px";
      toolbar.style.zIndex = "10";
      toolbar.style.display = cellViewModel.getEditState() === 1 /* Editing */ ? "none" : "block";
      this.overlayDisposables.add(cellViewModel.onDidChangeState((e4) => {
        if (e4.editStateChanged) {
          if (cellViewModel.getEditState() === 1 /* Editing */) {
            toolbar.style.display = "none";
          } else {
            toolbar.style.display = "block";
          }
        }
      }));
      const scopedInstaService = this._register(this.instantiationService.createChild(new ServiceCollection([IContextKeyService, this.notebookEditor.scopedContextKeyService])));
      const toolbarWidget = scopedInstaService.createInstance(MenuWorkbenchToolBar, toolbar, MenuId.ChatEditingEditorHunk, {
        telemetrySource: "chatEditingNotebookHunk",
        hiddenItemStrategy: -1 /* NoHide */,
        toolbarOptions: { primaryGroup: () => true },
        menuOptions: {
          renderShortTitle: true,
          arg: {
            async accept() {
              accessibilitySignalService.playSignal(AccessibilitySignal.editsKept, { allowManyInParallel: true });
              removeOverlay();
              toolbarWidget.dispose();
              for (const singleChange of change.diff.get().changes) {
                await change.keep(singleChange);
              }
              return true;
            },
            async reject() {
              accessibilitySignalService.playSignal(AccessibilitySignal.editsUndone, { allowManyInParallel: true });
              removeOverlay();
              toolbarWidget.dispose();
              for (const singleChange of change.diff.get().changes) {
                await change.undo(singleChange);
              }
              return true;
            }
          }
        },
        actionViewItemProvider: (action, options3) => {
          if (!action.class) {
            return new class extends ActionViewItem {
              constructor() {
                super(void 0, action, { ...options3, keybindingNotRenderedWithLabel: true, icon: false, label: true });
              }
            }();
          }
          return void 0;
        }
      });
      this.overlayDisposables.add(toolbarWidget);
    }
  }
  getCellViewModel(change) {
    if (change.type === "delete" || change.modifiedCellIndex === void 0) {
      return void 0;
    }
    const cell = this.notebookModel.cells[change.modifiedCellIndex];
    const cellViewModel = this.notebookEditor.getViewModel()?.viewCells.find((c) => c.handle === cell.handle);
    return cellViewModel;
  }
  dispose() {
    super.dispose();
    if (this._timeout !== void 0) {
      clearTimeout(this._timeout);
    }
  }
};

OverlayToolbarDecorator = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IAccessibilitySignalService)
], OverlayToolbarDecorator);
export { OverlayToolbarDecorator };
