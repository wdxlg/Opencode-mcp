// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/editor/editorHeaderControl.ts
import { Disposable, DisposableStore, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { $, Dimension, append, reset } from "./module-0075.mjs";
import { BreadcrumbsControl, BreadcrumbsControlFactory } from "./module-1578.mjs";
import { EditorResourceAccessor } from "./module-0925.mjs";
import { MenuWorkbenchToolBar } from "./module-0519.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/workbench/browser/parts/editor/editorHeaderControl.ts
var EditorHeaderControl = class extends Disposable {
  constructor(parent, groupView, groupsView, menuIds, showHeader, instantiationService) {
    super();
    this.groupView = groupView;
    this.menuIds = menuIds;
    this.instantiationService = instantiationService;
    this.headerActions = this._register(new MutableDisposable());
    this.breadcrumbsVisible = false;
    this.visible = false;
    let breadcrumbsParent = parent;
    if (showHeader) {
      this.headerContainer = breadcrumbsParent = append(parent, $(".editor-group-header.breadcrumbs-in-header"));
      this.actionsContainer = $(".editor-group-header-actions");
      this.primaryActionsContainer = append(this.actionsContainer, $(".editor-group-header-primary-actions"));
      this.secondaryActionsContainer = append(this.actionsContainer, $(".editor-group-header-secondary-actions"));
      this.layoutActionsContainer = append(this.actionsContainer, $(".editor-group-header-layout-actions"));
      this._register(toDisposable(() => this.headerContainer?.remove()));
      this._register(this.groupView.onDidActiveEditorChange(() => this.renderActions(true)));
    }
    if (showHeader || groupsView.partOptions.showTabs !== "single") {
      this.breadcrumbsContainer = append(breadcrumbsParent, $(".breadcrumbs-below-tabs"));
      this.breadcrumbsControlFactory = this._register(this.instantiationService.createInstance(BreadcrumbsControlFactory, this.breadcrumbsContainer, this.groupView, {
        showFileIcons: true,
        showSymbolIcons: true,
        showDecorationColors: false,
        showPlaceholder: true,
        dragEditor: false,
        showEditorTypePicker: true
      }));
      this._register(this.breadcrumbsControlFactory.onDidEnablementChange(() => this.updateBreadcrumbsVisibility(true)));
      this._register(this.breadcrumbsControlFactory.onDidVisibilityChange(() => this.updateBreadcrumbsVisibility(true)));
      this.updateBreadcrumbsVisibility(false);
    }
    if (this.headerContainer && this.actionsContainer) {
      this.headerContainer.appendChild(this.actionsContainer);
      this.renderActions(false);
    }
  }
  static {
    this.HEIGHT = 29;
  }
  get breadcrumbsControl() {
    return this.breadcrumbsControlFactory?.control;
  }
  get height() {
    if (this.headerContainer) {
      return this.visible ? EditorHeaderControl.HEIGHT : 0;
    }
    return this.breadcrumbsControl?.isHidden() === false ? BreadcrumbsControl.HEIGHT : 0;
  }
  handleEditorsChange(changed) {
    if (changed) {
      this.breadcrumbsControl?.update();
    } else {
      this.breadcrumbsControl?.revealLast();
    }
  }
  layout(width2) {
    if (this.breadcrumbsControl?.isHidden() === false && this.breadcrumbsContainer) {
      let breadcrumbsWidth = 0;
      if (this.headerContainer) {
        breadcrumbsWidth = Math.max(0, this.breadcrumbsControl.domNode.clientWidth);
      } else {
        breadcrumbsWidth = Math.max(0, width2);
        this.breadcrumbsContainer.style.width = `${breadcrumbsWidth}px`;
      }
      this.breadcrumbsControl.layout(new Dimension(breadcrumbsWidth, BreadcrumbsControl.HEIGHT));
    }
  }
  updateBreadcrumbsVisibility(relayout) {
    this.breadcrumbsVisible = this.breadcrumbsControl?.isHidden() === false;
    this.breadcrumbsContainer?.classList.toggle("hidden", !this.breadcrumbsVisible);
    this.updateVisibility(relayout);
  }
  updateVisibility(relayout) {
    if (!this.headerContainer || !this.actionsContainer || !this.primaryActionsContainer || !this.secondaryActionsContainer || !this.layoutActionsContainer) {
      if (relayout) {
        this.groupView.relayout();
      }
      return;
    }
    const hasPrimaryActions = (this.primaryActionsToolbar?.getItemsLength() ?? 0) > 0;
    const hasSecondaryActions = (this.secondaryActionsToolbar?.getItemsLength() ?? 0) > 0;
    const hasLayoutActions = (this.layoutActionsToolbar?.getItemsLength() ?? 0) > 0;
    const hasMenuActions = hasPrimaryActions || hasSecondaryActions || hasLayoutActions;
    this.primaryActionsContainer.style.display = hasPrimaryActions ? "" : "none";
    this.secondaryActionsContainer.style.display = hasSecondaryActions ? "" : "none";
    this.secondaryActionsContainer.style.marginLeft = hasPrimaryActions ? "var(--vscode-spacing-size80, 8px)" : "";
    this.layoutActionsContainer.style.display = hasLayoutActions ? "" : "none";
    this.layoutActionsContainer.style.marginLeft = hasSecondaryActions && hasLayoutActions ? "var(--vscode-spacing-size40, 4px)" : "";
    this.actionsContainer.style.display = hasMenuActions ? "" : "none";
    this.actionsContainer.style.flex = this.breadcrumbsVisible ? "0 1 auto" : "1 1 auto";
    this.actionsContainer.style.gridTemplateColumns = this.breadcrumbsVisible ? "auto auto auto" : "minmax(0, 1fr) auto auto";
    this.visible = this.breadcrumbsVisible || hasMenuActions;
    this.headerContainer.style.display = this.visible ? "" : "none";
    if (relayout) {
      this.groupView.relayout();
    }
  }
  renderActions(relayout) {
    if (!this.primaryActionsContainer || !this.secondaryActionsContainer || !this.layoutActionsContainer) {
      return;
    }
    this.headerActions.clear();
    this.primaryActionsToolbar = void 0;
    this.secondaryActionsToolbar = void 0;
    this.layoutActionsToolbar = void 0;
    reset(this.primaryActionsContainer);
    reset(this.secondaryActionsContainer);
    reset(this.layoutActionsContainer);
    const headerPrimaryMenuId = this.menuIds?.headerPrimary;
    const headerSecondaryMenuId = this.menuIds?.headerSecondary;
    const headerLayoutMenuId = this.menuIds?.headerLayout;
    if (!headerPrimaryMenuId && !headerSecondaryMenuId && !headerLayoutMenuId) {
      this.updateVisibility(relayout);
      return;
    }
    const store = new DisposableStore();
    const scopedInstantiationService = this.groupView.activeEditorPane?.scopedInstantiationService ?? this.instantiationService;
    const createToolbarOptions = (ariaLabel, trailingSeparator = false) => ({
      ariaLabel,
      trailingSeparator,
      menuOptions: {
        arg: EditorResourceAccessor.getOriginalUri(this.groupView.activeEditor, { supportSideBySide: 1 /* PRIMARY */ }),
        shouldForwardArgs: true
      },
      highlightToggledItems: true,
      toolbarOptions: { primaryGroup: (group2) => !group2.startsWith("secondary/"), useSeparatorsInPrimaryActions: true }
    });
    if (headerPrimaryMenuId) {
      this.primaryActionsToolbar = store.add(scopedInstantiationService.createInstance(MenuWorkbenchToolBar, this.primaryActionsContainer, headerPrimaryMenuId, createToolbarOptions(localize(6669, null))));
      store.add(this.primaryActionsToolbar.onDidChangeMenuItems(() => this.updateVisibility(true)));
    }
    if (headerLayoutMenuId) {
      this.layoutActionsToolbar = store.add(scopedInstantiationService.createInstance(MenuWorkbenchToolBar, this.layoutActionsContainer, headerLayoutMenuId, createToolbarOptions(localize(6668, null))));
      store.add(this.layoutActionsToolbar.onDidChangeMenuItems(() => this.renderActions(true)));
    }
    if (headerSecondaryMenuId) {
      const hasLayoutActions = (this.layoutActionsToolbar?.getItemsLength() ?? 0) > 0;
      this.secondaryActionsToolbar = store.add(scopedInstantiationService.createInstance(MenuWorkbenchToolBar, this.secondaryActionsContainer, headerSecondaryMenuId, createToolbarOptions(localize(6667, null), hasLayoutActions)));
      store.add(this.secondaryActionsToolbar.onDidChangeMenuItems(() => this.updateVisibility(true)));
    }
    this.headerActions.value = store;
    this.updateVisibility(relayout);
  }
};

EditorHeaderControl = __decorateClass([
  __decorateParam(5, IInstantiationService)
], EditorHeaderControl);
export { EditorHeaderControl };
