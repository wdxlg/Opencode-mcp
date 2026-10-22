// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/editor/singleEditorTabsControl.ts
import { EditorTabsControl } from "./module-1570.mjs";
import { EventType2, Gesture } from "./module-0251.mjs";
import { $, Dimension, DragAndDropObserver, EventHelper, EventType, addDisposableListener, isAncestor, isHTMLElement } from "./module-0075.mjs";
import { ResourceLabel } from "./module-1323.mjs";
import { BreadcrumbsControlFactory } from "./module-1578.mjs";
import { defaultBreadcrumbsWidgetStyles } from "./module-0513.mjs";
import { Color } from "./module-0197.mjs";
import { toDisposable } from "./module-0012.mjs";
import { EditorResourceAccessor, preventEditorClose } from "./module-0925.mjs";
import { assertReturnsAllDefined, assertReturnsDefined } from "./module-0010.mjs";
import { equals4 } from "./module-0098.mjs";
import { TAB_ACTIVE_FOREGROUND, TAB_UNFOCUSED_ACTIVE_FOREGROUND } from "./module-0912.mjs";
import { CLOSE_EDITOR_COMMAND_ID, UNLOCK_GROUP_COMMAND_ID } from "./module-1538.mjs";


// src/vs/workbench/browser/parts/editor/singleEditorTabsControl.ts
var SingleEditorTabsControl = class extends EditorTabsControl {
  constructor() {
    super(...arguments);
    this.activeLabel = /* @__PURE__ */ Object.create(null);
  }
  get breadcrumbsControl() {
    return this.breadcrumbsControlFactory?.control;
  }
  create(parent) {
    super.create(parent);
    const titleContainer = this.titleContainer = parent;
    titleContainer.draggable = true;
    this.registerContainerListeners(titleContainer);
    this._register(Gesture.addTarget(titleContainer));
    const labelContainer = $(".label-container");
    titleContainer.appendChild(labelContainer);
    this.editorLabel = this._register(this.instantiationService.createInstance(ResourceLabel, labelContainer, {})).element;
    this._register(addDisposableListener(this.editorLabel.element, EventType.CLICK, (e) => this.onTitleLabelClick(e)));
    if (!this.breadcrumbsInHeader) {
      this.breadcrumbsControlFactory = this._register(this.instantiationService.createInstance(BreadcrumbsControlFactory, labelContainer, this.groupView, {
        showFileIcons: false,
        showSymbolIcons: true,
        showDecorationColors: false,
        widgetStyles: { ...defaultBreadcrumbsWidgetStyles, breadcrumbsBackground: Color.transparent.toString() },
        showPlaceholder: false,
        dragEditor: true
      }));
      this._register(this.breadcrumbsControlFactory.onDidEnablementChange(() => this.handleBreadcrumbsEnablementChange()));
    }
    titleContainer.classList.toggle("breadcrumbs", Boolean(this.breadcrumbsControl));
    this._register(toDisposable(() => titleContainer.classList.remove("breadcrumbs")));
    if (this.menuIds?.tabsBarAddTab) {
      this.createAddTabControl(labelContainer, this.menuIds.tabsBarAddTab);
    }
    this.createEditorActionsToolBar(titleContainer, ["title-actions"]);
    return titleContainer;
  }
  registerContainerListeners(titleContainer) {
    let lastDragEvent = void 0;
    let isNewWindowOperation = false;
    this._register(new DragAndDropObserver(titleContainer, {
      onDragStart: (e) => {
        isNewWindowOperation = this.onGroupDragStart(e, titleContainer);
      },
      onDrag: (e) => {
        lastDragEvent = e;
      },
      onDragEnd: (e) => {
        this.onGroupDragEnd(e, lastDragEvent, titleContainer, isNewWindowOperation);
      }
    }));
    this._register(addDisposableListener(titleContainer, EventType.DBLCLICK, (e) => this.onTitleDoubleClick(e)));
    this._register(addDisposableListener(titleContainer, EventType.AUXCLICK, (e) => this.onTitleAuxClick(e)));
    this._register(addDisposableListener(titleContainer, EventType2.Tap, (e) => this.onTitleTap(e)));
    for (const event of [EventType.CONTEXT_MENU, EventType2.Contextmenu]) {
      this._register(addDisposableListener(titleContainer, event, (e) => {
        if (this.tabsModel.activeEditor) {
          this.onTabContextMenu(this.tabsModel.activeEditor, e, titleContainer);
        }
      }));
    }
  }
  onTitleLabelClick(e) {
    EventHelper.stop(e, false);
    setTimeout(() => this.quickInputService.quickAccess.show());
  }
  onTitleDoubleClick(e) {
    EventHelper.stop(e);
    this.groupView.pinEditor();
  }
  onTitleAuxClick(e) {
    if (e.button === 1 && this.tabsModel.activeEditor) {
      EventHelper.stop(
        e,
        true
        /* for https://github.com/microsoft/vscode/issues/56715 */
      );
      if (!this.tabsModel.activeEditor.hasCapability(8192 /* CannotClose */) && !preventEditorClose(this.tabsModel, this.tabsModel.activeEditor, 2 /* MOUSE */, this.groupsView.partOptions)) {
        this.groupView.closeEditor(this.tabsModel.activeEditor);
      }
    }
  }
  onTitleTap(e) {
    const target = e.initialTarget;
    if (!isHTMLElement(target) || !this.editorLabel || !isAncestor(target, this.editorLabel.element)) {
      return;
    }
    setTimeout(() => this.quickInputService.quickAccess.show(), 50);
  }
  openEditor(editor) {
    return this.doHandleOpenEditor();
  }
  openEditors(editors) {
    return this.doHandleOpenEditor();
  }
  doHandleOpenEditor() {
    const activeEditorChanged = this.ifActiveEditorChanged(() => this.redraw());
    if (!activeEditorChanged) {
      this.ifActiveEditorPropertiesChanged(() => this.redraw());
    }
    return activeEditorChanged;
  }
  beforeCloseEditor(editor) {
  }
  closeEditor(editor) {
    this.ifActiveEditorChanged(() => this.redraw());
  }
  closeEditors(editors) {
    this.ifActiveEditorChanged(() => this.redraw());
  }
  moveEditor(editor, fromIndex, targetIndex) {
    this.ifActiveEditorChanged(() => this.redraw());
  }
  pinEditor(editor) {
    this.ifEditorIsActive(editor, () => this.redraw());
  }
  stickEditor(editor) {
  }
  unstickEditor(editor) {
  }
  setActive(isActive2) {
    this.redraw();
  }
  updateEditorSelections() {
  }
  updateEditorLabel(editor) {
    this.ifEditorIsActive(editor, () => this.redraw());
  }
  updateEditorCapabilities(editor) {
    this.ifEditorIsActive(editor, () => this.redraw());
  }
  updateEditorDirty(editor) {
    this.ifEditorIsActive(editor, () => {
      const titleContainer = assertReturnsDefined(this.titleContainer);
      if (editor.isDirty() && !editor.isSaving()) {
        titleContainer.classList.add("dirty");
      } else {
        titleContainer.classList.remove("dirty");
      }
    });
  }
  updateOptions(oldOptions, newOptions) {
    super.updateOptions(oldOptions, newOptions);
    if (oldOptions.labelFormat !== newOptions.labelFormat || !equals4(oldOptions.decorations, newOptions.decorations)) {
      this.redraw();
    }
  }
  updateStyles() {
    this.redraw();
  }
  handleBreadcrumbsEnablementChange() {
    const titleContainer = assertReturnsDefined(this.titleContainer);
    titleContainer.classList.toggle("breadcrumbs", Boolean(this.breadcrumbsControl));
    this.redraw();
  }
  ifActiveEditorChanged(fn) {
    if (!this.activeLabel.editor && this.tabsModel.activeEditor || // active editor changed from null => editor
    this.activeLabel.editor && !this.tabsModel.activeEditor || // active editor changed from editor => null
    (!this.activeLabel.editor || !this.tabsModel.isActive(this.activeLabel.editor))) {
      fn();
      return true;
    }
    return false;
  }
  ifActiveEditorPropertiesChanged(fn) {
    if (!this.activeLabel.editor || !this.tabsModel.activeEditor) {
      return;
    }
    if (this.activeLabel.pinned !== this.tabsModel.isPinned(this.tabsModel.activeEditor)) {
      fn();
    }
  }
  ifEditorIsActive(editor, fn) {
    if (this.tabsModel.isActive(editor)) {
      fn();
    }
  }
  redraw() {
    const editor = this.tabsModel.activeEditor ?? void 0;
    const options3 = this.groupsView.partOptions;
    const isEditorPinned = editor ? this.tabsModel.isPinned(editor) : false;
    const isGroupActive = this.groupsView.activeGroup === this.groupView;
    this.activeLabel = { editor, pinned: isEditorPinned };
    if (this.breadcrumbsControl) {
      if (isGroupActive) {
        this.breadcrumbsControl.update();
        this.breadcrumbsControl.domNode.classList.toggle("preview", !isEditorPinned);
      } else {
        this.breadcrumbsControl.hide();
      }
    }
    const [titleContainer, editorLabel] = assertReturnsAllDefined(this.titleContainer, this.editorLabel);
    if (!editor) {
      titleContainer.classList.remove("dirty");
      editorLabel.clear();
      this.clearEditorActionsToolbar();
    } else {
      this.updateEditorDirty(editor);
      const { labelFormat } = this.groupsView.partOptions;
      let description;
      if (this.breadcrumbsInHeader || this.breadcrumbsControl && !this.breadcrumbsControl.isHidden()) {
        description = "";
      } else if (labelFormat === "default" && !isGroupActive) {
        description = "";
      } else {
        description = editor.getDescription(this.getVerbosity(labelFormat)) || "";
      }
      editorLabel.setResource(
        {
          resource: EditorResourceAccessor.getOriginalUri(editor, { supportSideBySide: 3 /* BOTH */ }),
          name: editor.getName(),
          description
        },
        {
          title: this.getHoverTitle(editor),
          italic: !isEditorPinned,
          extraClasses: ["single-tab", "title-label"].concat(editor.getLabelExtraClasses()),
          fileDecorations: {
            colors: Boolean(options3.decorations?.colors),
            badges: Boolean(options3.decorations?.badges)
          },
          icon: editor.getIcon(),
          hideIcon: options3.showIcons === false
        }
      );
      if (isGroupActive) {
        titleContainer.style.color = this.getColor(TAB_ACTIVE_FOREGROUND) || "";
      } else {
        titleContainer.style.color = this.getColor(TAB_UNFOCUSED_ACTIVE_FOREGROUND) || "";
      }
      this.updateEditorActionsToolbar();
    }
  }
  getVerbosity(style) {
    switch (style) {
      case "short":
        return 0 /* SHORT */;
      case "long":
        return 2 /* LONG */;
      default:
        return 1 /* MEDIUM */;
    }
  }
  prepareEditorActions(editorActions) {
    const isGroupActive = this.groupsView.activeGroup === this.groupView;
    if (isGroupActive) {
      return editorActions;
    } else {
      return {
        primary: this.groupsView.partOptions.alwaysShowEditorActions ? editorActions.primary : editorActions.primary.filter((action) => action.id === CLOSE_EDITOR_COMMAND_ID || action.id === UNLOCK_GROUP_COMMAND_ID),
        secondary: editorActions.secondary
      };
    }
  }
  prepareEditorLayoutActions(editorActions) {
    return editorActions;
  }
  getHeight() {
    return this.tabHeight;
  }
  layout(dimensions) {
    this.breadcrumbsControl?.layout(void 0);
    return new Dimension(dimensions.container.width, this.getHeight());
  }
};
export { SingleEditorTabsControl };
