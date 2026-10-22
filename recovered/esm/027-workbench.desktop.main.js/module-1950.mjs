// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/viewParts/notebookTopCellToolbar.ts
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { $, clearNode } from "./module-0075.mjs";
import { MenuWorkbenchToolBar } from "./module-0519.mjs";
import { IMenuService, MenuItemAction } from "./module-0092.mjs";
import { CodiconActionViewItem } from "./module-1924.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IContextMenuService } from "./module-0488.mjs";


// src/vs/workbench/contrib/notebook/browser/viewParts/notebookTopCellToolbar.ts
var ListTopCellToolbar = class extends Disposable {
  constructor(notebookEditor, notebookOptions, instantiationService, contextMenuService, menuService) {
    super();
    this.notebookEditor = notebookEditor;
    this.notebookOptions = notebookOptions;
    this.instantiationService = instantiationService;
    this.contextMenuService = contextMenuService;
    this.menuService = menuService;
    this.viewZone = this._register(new MutableDisposable());
    this._modelDisposables = this._register(new DisposableStore());
    this.topCellToolbarContainer = $("div");
    this.topCellToolbar = $(".cell-list-top-cell-toolbar-container");
    this.topCellToolbarContainer.appendChild(this.topCellToolbar);
    this._register(this.notebookEditor.onDidAttachViewModel(() => {
      this.updateTopToolbar();
    }));
    this._register(this.notebookOptions.onDidChangeOptions((e) => {
      if (e.insertToolbarAlignment || e.insertToolbarPosition || e.cellToolbarLocation) {
        this.updateTopToolbar();
      }
    }));
  }
  updateTopToolbar() {
    const layoutInfo = this.notebookOptions.getLayoutConfiguration();
    this.viewZone.value = new DisposableStore();
    if (layoutInfo.insertToolbarPosition === "hidden" || layoutInfo.insertToolbarPosition === "notebookToolbar") {
      const height = this.notebookOptions.computeTopInsertToolbarHeight(this.notebookEditor.textModel?.viewType);
      if (height !== 0) {
        this.notebookEditor.changeViewZones((accessor) => {
          const id2 = accessor.addZone({
            afterModelPosition: 0,
            heightInPx: height,
            domNode: $("div")
          });
          accessor.layoutZone(id2);
          this.viewZone.value?.add({
            dispose: () => {
              if (!this.notebookEditor.isDisposed) {
                this.notebookEditor.changeViewZones((accessor2) => {
                  accessor2.removeZone(id2);
                });
              }
            }
          });
        });
      }
      return;
    }
    this.notebookEditor.changeViewZones((accessor) => {
      const height = this.notebookOptions.computeTopInsertToolbarHeight(this.notebookEditor.textModel?.viewType);
      const id2 = accessor.addZone({
        afterModelPosition: 0,
        heightInPx: height,
        domNode: this.topCellToolbarContainer
      });
      accessor.layoutZone(id2);
      this.viewZone.value?.add({
        dispose: () => {
          if (!this.notebookEditor.isDisposed) {
            this.notebookEditor.changeViewZones((accessor2) => {
              accessor2.removeZone(id2);
            });
          }
        }
      });
      clearNode(this.topCellToolbar);
      const toolbar = this.instantiationService.createInstance(MenuWorkbenchToolBar, this.topCellToolbar, this.notebookEditor.creationOptions.menuIds.cellTopInsertToolbar, {
        actionViewItemProvider: (action, options3) => {
          if (action instanceof MenuItemAction) {
            const item = this.instantiationService.createInstance(CodiconActionViewItem, action, { hoverDelegate: options3.hoverDelegate });
            return item;
          }
          return void 0;
        },
        menuOptions: {
          shouldForwardArgs: true
        },
        toolbarOptions: {
          primaryGroup: (g) => /^inline/.test(g)
        },
        hiddenItemStrategy: 0 /* Ignore */
      });
      if (this.notebookEditor.hasModel()) {
        toolbar.context = {
          notebookEditor: this.notebookEditor
        };
      }
      this.viewZone.value?.add(toolbar);
      this.viewZone.value?.add(this.notebookEditor.onDidChangeModel(() => {
        this._modelDisposables.clear();
        if (this.notebookEditor.hasModel()) {
          this._modelDisposables.add(this.notebookEditor.onDidChangeViewCells(() => {
            this.updateClass();
          }));
          this.updateClass();
        }
      }));
      this.updateClass();
    });
  }
  updateClass() {
    if (this.notebookEditor.hasModel() && this.notebookEditor.getLength() === 0) {
      this.topCellToolbar.classList.add("emptyNotebook");
    } else {
      this.topCellToolbar.classList.remove("emptyNotebook");
    }
  }
};

ListTopCellToolbar = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IContextMenuService),
  __decorateParam(4, IMenuService)
], ListTopCellToolbar);
export { ListTopCellToolbar };
