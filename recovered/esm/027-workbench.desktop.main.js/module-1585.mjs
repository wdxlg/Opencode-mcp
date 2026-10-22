// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/editor/editorDropTarget.ts
import { IThemeService, Themable } from "./module-0287.mjs";
import { CodeDataTransfers, Extensions7, LocalSelectionTransfer, containsDragType } from "./module-0273.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { $, DragAndDropObserver, EventHelper, EventType, addDisposableListener, getWindow, isAncestor } from "./module-0075.mjs";
import { toDisposable } from "./module-0012.mjs";
import { renderFormattedText } from "./module-0597.mjs";
import { localize } from "./module-0001.mjs";
import { isMacintosh, isWeb } from "./module-0014.mjs";
import { assertReturnsAllDefined, assertReturnsDefined } from "./module-0010.mjs";
import { EDITOR_DRAG_AND_DROP_BACKGROUND, EDITOR_DROP_INTO_PROMPT_BACKGROUND, EDITOR_DROP_INTO_PROMPT_BORDER, EDITOR_DROP_INTO_PROMPT_FOREGROUND } from "./module-0912.mjs";
import { activeContrastBorder } from "./module-0227.mjs";
import { DraggedEditorGroupIdentifier, DraggedEditorIdentifier, ResourcesDropHandler, extractTreeDropData } from "./module-1381.mjs";
import { prepareMoveCopyEditors } from "./module-1088.mjs";
import { DraggedTreeItemsIdentifier } from "./module-0669.mjs";
import { IWorkspaceContextService, isTemporaryWorkspace } from "./module-0509.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IEditorGroupsService } from "./module-0933.mjs";
import { ITreeViewsDnDService } from "./module-0670.mjs";
import { Registry } from "./module-0090.mjs";
import { DataTransfers } from "./module-0263.mjs";


// src/vs/workbench/browser/parts/editor/editorDropTarget.ts
function isDropIntoEditorEnabledGlobally(configurationService) {
  return configurationService.getValue("editor.dropIntoEditor.enabled");
}

function isDragIntoEditorEvent(e) {
  return e.shiftKey;
}

var DropOverlay = class extends Themable {
  constructor(groupView, supportsSplitting, themeService, configurationService, instantiationService, editorService, editorGroupService, treeViewsDragAndDropService, contextService) {
    super(themeService);
    this.groupView = groupView;
    this.supportsSplitting = supportsSplitting;
    this.configurationService = configurationService;
    this.instantiationService = instantiationService;
    this.editorService = editorService;
    this.editorGroupService = editorGroupService;
    this.treeViewsDragAndDropService = treeViewsDragAndDropService;
    this.contextService = contextService;
    this.editorTransfer = LocalSelectionTransfer.getInstance();
    this.groupTransfer = LocalSelectionTransfer.getInstance();
    this.treeItemsTransfer = LocalSelectionTransfer.getInstance();
    this.cleanupOverlayScheduler = this._register(new RunOnceScheduler(() => this.dispose(), 300));
    this.enableDropIntoEditor = isDropIntoEditorEnabledGlobally(this.configurationService) && this.isDropIntoActiveEditorEnabled();
    this.create();
  }
  static {
    this.OVERLAY_ID = "monaco-workbench-editor-drop-overlay";
  }
  get disposed() {
    return !!this._disposed;
  }
  create() {
    const overlayOffsetHeight = this.getOverlayOffsetHeight();
    const container3 = this.container = $("div", { id: DropOverlay.OVERLAY_ID });
    container3.style.top = `${overlayOffsetHeight}px`;
    this.groupView.element.appendChild(container3);
    this.groupView.element.classList.add("dragged-over");
    this._register(toDisposable(() => {
      container3.remove();
      this.groupView.element.classList.remove("dragged-over");
    }));
    this.overlay = $(".editor-group-overlay-indicator");
    container3.appendChild(this.overlay);
    if (this.enableDropIntoEditor) {
      this.dropIntoPromptElement = renderFormattedText(localize(6646, null, isMacintosh ? "\u21E7" : "Shift"), {});
      this.dropIntoPromptElement.classList.add("editor-group-overlay-drop-into-prompt");
      this.overlay.appendChild(this.dropIntoPromptElement);
    }
    this.registerListeners(container3);
    this.updateStyles();
  }
  updateStyles() {
    const overlay = assertReturnsDefined(this.overlay);
    overlay.style.backgroundColor = this.getColor(EDITOR_DRAG_AND_DROP_BACKGROUND) || "";
    const activeContrastBorderColor = this.getColor(activeContrastBorder);
    overlay.style.outlineColor = activeContrastBorderColor || "";
    overlay.style.outlineOffset = activeContrastBorderColor ? "-2px" : "";
    overlay.style.outlineStyle = activeContrastBorderColor ? "dashed" : "";
    overlay.style.outlineWidth = activeContrastBorderColor ? "2px" : "";
    if (this.dropIntoPromptElement) {
      this.dropIntoPromptElement.style.backgroundColor = this.getColor(EDITOR_DROP_INTO_PROMPT_BACKGROUND) ?? "";
      this.dropIntoPromptElement.style.color = this.getColor(EDITOR_DROP_INTO_PROMPT_FOREGROUND) ?? "";
      const borderColor = this.getColor(EDITOR_DROP_INTO_PROMPT_BORDER);
      if (borderColor) {
        this.dropIntoPromptElement.style.borderWidth = "1px";
        this.dropIntoPromptElement.style.borderStyle = "solid";
        this.dropIntoPromptElement.style.borderColor = borderColor;
      } else {
        this.dropIntoPromptElement.style.borderWidth = "0";
      }
    }
  }
  registerListeners(container3) {
    this._register(new DragAndDropObserver(container3, {
      onDragOver: (e) => {
        if (this.enableDropIntoEditor && isDragIntoEditorEvent(e)) {
          this.dispose();
          return;
        }
        const isDraggingGroup = this.groupTransfer.hasData(DraggedEditorGroupIdentifier.prototype);
        const isDraggingEditor = this.editorTransfer.hasData(DraggedEditorIdentifier.prototype);
        if (!isDraggingEditor && !isDraggingGroup && e.dataTransfer) {
          e.dataTransfer.dropEffect = "copy";
        }
        let isCopy = true;
        if (isDraggingGroup) {
          isCopy = this.isCopyOperation(e);
        } else if (isDraggingEditor) {
          const data = this.editorTransfer.getData(DraggedEditorIdentifier.prototype);
          if (Array.isArray(data) && data.length > 0) {
            isCopy = this.isCopyOperation(e, data[0].identifier);
          }
        }
        if (!isCopy) {
          const sourceGroupView = this.findSourceGroupView();
          if (sourceGroupView === this.groupView) {
            if (isDraggingGroup || isDraggingEditor && sourceGroupView.count < 2) {
              this.hideOverlay();
              return;
            }
          }
        }
        let splitOnDragAndDrop = this.supportsSplitting && !!this.groupView.groupsView.partOptions.splitOnDragAndDrop;
        if (this.supportsSplitting && this.isToggleSplitOperation(e)) {
          splitOnDragAndDrop = !splitOnDragAndDrop;
        }
        this.positionOverlay(e.offsetX, e.offsetY, isDraggingGroup, splitOnDragAndDrop);
        if (this.cleanupOverlayScheduler.isScheduled()) {
          this.cleanupOverlayScheduler.cancel();
        }
      },
      onDragLeave: (e) => this.dispose(),
      onDragEnd: (e) => this.dispose(),
      onDrop: (e) => {
        EventHelper.stop(e, true);
        this.dispose();
        if (this.currentDropOperation) {
          this.handleDrop(e, this.currentDropOperation.splitDirection);
        }
      }
    }));
    this._register(addDisposableListener(container3, EventType.MOUSE_OVER, () => {
      if (!this.cleanupOverlayScheduler.isScheduled()) {
        this.cleanupOverlayScheduler.schedule();
      }
    }));
  }
  isDropIntoActiveEditorEnabled() {
    return !!this.groupView.activeEditor?.hasCapability(128 /* CanDropIntoEditor */);
  }
  findSourceGroupView() {
    if (this.groupTransfer.hasData(DraggedEditorGroupIdentifier.prototype)) {
      const data = this.groupTransfer.getData(DraggedEditorGroupIdentifier.prototype);
      if (Array.isArray(data) && data.length > 0) {
        return this.editorGroupService.getGroup(data[0].identifier);
      }
    } else if (this.editorTransfer.hasData(DraggedEditorIdentifier.prototype)) {
      const data = this.editorTransfer.getData(DraggedEditorIdentifier.prototype);
      if (Array.isArray(data) && data.length > 0) {
        return this.editorGroupService.getGroup(data[0].identifier.groupId);
      }
    }
    return void 0;
  }
  async handleDrop(event, splitDirection) {
    const ensureTargetGroup = () => {
      let targetGroup;
      if (typeof splitDirection === "number") {
        targetGroup = this.editorGroupService.addGroup(this.groupView, splitDirection);
      } else {
        targetGroup = this.groupView;
      }
      return targetGroup;
    };
    if (this.groupTransfer.hasData(DraggedEditorGroupIdentifier.prototype)) {
      const data = this.groupTransfer.getData(DraggedEditorGroupIdentifier.prototype);
      if (Array.isArray(data) && data.length > 0) {
        const sourceGroup = this.editorGroupService.getGroup(data[0].identifier);
        if (sourceGroup) {
          if (typeof splitDirection !== "number" && sourceGroup === this.groupView) {
            return;
          }
          let targetGroup;
          if (typeof splitDirection === "number") {
            if (this.isCopyOperation(event)) {
              targetGroup = this.editorGroupService.copyGroup(sourceGroup, this.groupView, splitDirection);
            } else {
              targetGroup = this.editorGroupService.moveGroup(sourceGroup, this.groupView, splitDirection);
            }
          } else {
            let mergeGroupOptions = void 0;
            if (this.isCopyOperation(event)) {
              mergeGroupOptions = { mode: 0 /* COPY_EDITORS */ };
            }
            this.editorGroupService.mergeGroup(sourceGroup, this.groupView, mergeGroupOptions);
          }
          if (targetGroup) {
            this.editorGroupService.activateGroup(targetGroup);
          }
        }
        this.groupTransfer.clearData(DraggedEditorGroupIdentifier.prototype);
      }
    } else if (this.editorTransfer.hasData(DraggedEditorIdentifier.prototype)) {
      const data = this.editorTransfer.getData(DraggedEditorIdentifier.prototype);
      if (Array.isArray(data) && data.length > 0) {
        const draggedEditors = data;
        const firstDraggedEditor = data[0].identifier;
        const sourceGroup = this.editorGroupService.getGroup(firstDraggedEditor.groupId);
        if (sourceGroup) {
          const copyEditor = this.isCopyOperation(event, firstDraggedEditor);
          let targetGroup = void 0;
          if (this.groupView.groupsView.partOptions.closeEmptyGroups && sourceGroup.count === 1 && typeof splitDirection === "number" && !copyEditor) {
            targetGroup = this.editorGroupService.moveGroup(sourceGroup, this.groupView, splitDirection);
          } else {
            targetGroup = ensureTargetGroup();
            if (sourceGroup === targetGroup) {
              return;
            }
            const editorsWithOptions = prepareMoveCopyEditors(this.groupView, draggedEditors.map((editor) => editor.identifier.editor));
            if (!copyEditor) {
              sourceGroup.moveEditors(editorsWithOptions, targetGroup);
            } else {
              sourceGroup.copyEditors(editorsWithOptions, targetGroup);
            }
          }
          targetGroup.focus();
        }
        this.editorTransfer.clearData(DraggedEditorIdentifier.prototype);
      }
    } else if (this.treeItemsTransfer.hasData(DraggedTreeItemsIdentifier.prototype)) {
      const data = this.treeItemsTransfer.getData(DraggedTreeItemsIdentifier.prototype);
      if (Array.isArray(data) && data.length > 0) {
        const editors = [];
        for (const id2 of data) {
          const dataTransferItem = await this.treeViewsDragAndDropService.removeDragOperationTransfer(id2.identifier);
          if (dataTransferItem) {
            const treeDropData = await extractTreeDropData(dataTransferItem);
            editors.push(...treeDropData.map((editor) => ({ ...editor, options: { ...editor.options, pinned: true } })));
          }
        }
        if (editors.length) {
          this.editorService.openEditors(editors, ensureTargetGroup(), { validateTrust: true });
        }
      }
      this.treeItemsTransfer.clearData(DraggedTreeItemsIdentifier.prototype);
    } else {
      const dropHandler = this.instantiationService.createInstance(ResourcesDropHandler, { allowWorkspaceOpen: !isWeb || isTemporaryWorkspace(this.contextService.getWorkspace()) });
      dropHandler.handleDrop(event, getWindow(this.groupView.element), () => ensureTargetGroup(), (targetGroup) => targetGroup?.focus());
    }
  }
  isCopyOperation(e, draggedEditor) {
    if (draggedEditor?.editor.hasCapability(8 /* Singleton */)) {
      return false;
    }
    return e.ctrlKey && !isMacintosh || e.altKey && isMacintosh;
  }
  isToggleSplitOperation(e) {
    return e.altKey && !isMacintosh || e.shiftKey && isMacintosh;
  }
  positionOverlay(mousePosX, mousePosY, isDraggingGroup, enableSplitting) {
    const preferSplitVertically = this.groupView.groupsView.partOptions.openSideBySideDirection === "right";
    const editorControlWidth = this.groupView.element.clientWidth;
    const editorControlHeight = this.groupView.element.clientHeight - this.getOverlayOffsetHeight();
    if (!enableSplitting) {
      this.doPositionOverlay({ top: "0", left: "0", width: "100%", height: "100%" });
      this.toggleDropIntoPrompt(true);
      const overlay2 = assertReturnsDefined(this.overlay);
      overlay2.style.opacity = "1";
      setTimeout(() => overlay2.classList.add("overlay-move-transition"), 0);
      this.currentDropOperation = { splitDirection: void 0 };
      return;
    }
    let edgeWidthThresholdFactor;
    let edgeHeightThresholdFactor;
    if (enableSplitting) {
      if (isDraggingGroup) {
        edgeWidthThresholdFactor = preferSplitVertically ? 0.3 : 0.1;
      } else {
        edgeWidthThresholdFactor = 0.1;
      }
      if (isDraggingGroup) {
        edgeHeightThresholdFactor = preferSplitVertically ? 0.1 : 0.3;
      } else {
        edgeHeightThresholdFactor = 0.1;
      }
    } else {
      edgeWidthThresholdFactor = 0;
      edgeHeightThresholdFactor = 0;
    }
    const edgeWidthThreshold = editorControlWidth * edgeWidthThresholdFactor;
    const edgeHeightThreshold = editorControlHeight * edgeHeightThresholdFactor;
    const splitWidthThreshold = editorControlWidth / 3;
    const splitHeightThreshold = editorControlHeight / 3;
    let splitDirection;
    if (mousePosX > edgeWidthThreshold && mousePosX < editorControlWidth - edgeWidthThreshold && mousePosY > edgeHeightThreshold && mousePosY < editorControlHeight - edgeHeightThreshold) {
      splitDirection = void 0;
    } else {
      if (preferSplitVertically) {
        if (mousePosX < splitWidthThreshold) {
          splitDirection = 2 /* LEFT */;
        } else if (mousePosX > splitWidthThreshold * 2) {
          splitDirection = 3 /* RIGHT */;
        } else if (mousePosY < editorControlHeight / 2) {
          splitDirection = 0 /* UP */;
        } else {
          splitDirection = 1 /* DOWN */;
        }
      } else {
        if (mousePosY < splitHeightThreshold) {
          splitDirection = 0 /* UP */;
        } else if (mousePosY > splitHeightThreshold * 2) {
          splitDirection = 1 /* DOWN */;
        } else if (mousePosX < editorControlWidth / 2) {
          splitDirection = 2 /* LEFT */;
        } else {
          splitDirection = 3 /* RIGHT */;
        }
      }
    }
    switch (splitDirection) {
      case 0 /* UP */:
        this.doPositionOverlay({ top: "0", left: "0", width: "100%", height: "50%" });
        this.toggleDropIntoPrompt(false);
        break;
      case 1 /* DOWN */:
        this.doPositionOverlay({ top: "50%", left: "0", width: "100%", height: "50%" });
        this.toggleDropIntoPrompt(false);
        break;
      case 2 /* LEFT */:
        this.doPositionOverlay({ top: "0", left: "0", width: "50%", height: "100%" });
        this.toggleDropIntoPrompt(false);
        break;
      case 3 /* RIGHT */:
        this.doPositionOverlay({ top: "0", left: "50%", width: "50%", height: "100%" });
        this.toggleDropIntoPrompt(false);
        break;
      default:
        this.doPositionOverlay({ top: "0", left: "0", width: "100%", height: "100%" });
        this.toggleDropIntoPrompt(true);
    }
    const overlay = assertReturnsDefined(this.overlay);
    overlay.style.opacity = "1";
    setTimeout(() => overlay.classList.add("overlay-move-transition"), 0);
    this.currentDropOperation = { splitDirection };
  }
  doPositionOverlay(options3) {
    const [container3, overlay] = assertReturnsAllDefined(this.container, this.overlay);
    const offsetHeight = this.getOverlayOffsetHeight();
    if (offsetHeight) {
      container3.style.height = `calc(100% - ${offsetHeight}px)`;
    } else {
      container3.style.height = "100%";
    }
    overlay.style.top = options3.top;
    overlay.style.left = options3.left;
    overlay.style.width = options3.width;
    overlay.style.height = options3.height;
  }
  getOverlayOffsetHeight() {
    if (!this.groupView.isEmpty && this.groupView.groupsView.partOptions.showTabs === "multiple") {
      return this.groupView.titleHeight.offset;
    }
    return 0;
  }
  hideOverlay() {
    const overlay = assertReturnsDefined(this.overlay);
    this.doPositionOverlay({ top: "0", left: "0", width: "100%", height: "100%" });
    overlay.style.opacity = "0";
    overlay.classList.remove("overlay-move-transition");
    this.currentDropOperation = void 0;
  }
  toggleDropIntoPrompt(showing) {
    if (!this.dropIntoPromptElement) {
      return;
    }
    this.dropIntoPromptElement.style.opacity = showing ? "1" : "0";
  }
  contains(element) {
    return element === this.container || element === this.overlay;
  }
  dispose() {
    super.dispose();
    this._disposed = true;
  }
};

DropOverlay = __decorateClass([
  __decorateParam(2, IThemeService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IEditorService),
  __decorateParam(6, IEditorGroupsService),
  __decorateParam(7, ITreeViewsDnDService),
  __decorateParam(8, IWorkspaceContextService)
], DropOverlay);

var EditorDropTarget = class extends Themable {
  constructor(groupsView, container3, delegate, editorGroupService, themeService, configurationService, instantiationService) {
    super(themeService);
    this.groupsView = groupsView;
    this.container = container3;
    this.delegate = delegate;
    this.editorGroupService = editorGroupService;
    this.configurationService = configurationService;
    this.instantiationService = instantiationService;
    this.counter = 0;
    this.editorTransfer = LocalSelectionTransfer.getInstance();
    this.groupTransfer = LocalSelectionTransfer.getInstance();
    this.registerListeners();
  }
  get overlay() {
    if (this._overlay && !this._overlay.disposed) {
      return this._overlay;
    }
    return void 0;
  }
  registerListeners() {
    this._register(addDisposableListener(this.container, EventType.DRAG_ENTER, (e) => this.onDragEnter(e)));
    this._register(addDisposableListener(this.container, EventType.DRAG_LEAVE, () => this.onDragLeave()));
    for (const target of [this.container, getWindow(this.container)]) {
      this._register(addDisposableListener(target, EventType.DRAG_END, () => this.onDragEnd()));
    }
  }
  onDragEnter(event) {
    if (isDropIntoEditorEnabledGlobally(this.configurationService) && isDragIntoEditorEvent(event)) {
      return;
    }
    this.counter++;
    if (!this.editorTransfer.hasData(DraggedEditorIdentifier.prototype) && !this.groupTransfer.hasData(DraggedEditorGroupIdentifier.prototype) && event.dataTransfer) {
      const dndContributions = Registry.as(Extensions7.DragAndDropContribution).getAll();
      const dndContributionKeys = Array.from(dndContributions).map((e) => e.dataFormatKey);
      if (!containsDragType(event, DataTransfers.FILES, CodeDataTransfers.FILES, DataTransfers.RESOURCES, CodeDataTransfers.EDITORS, ...dndContributionKeys)) {
        event.dataTransfer.dropEffect = "none";
        return;
      }
    }
    if (!this.groupsView.partOptions.allowDropIntoGroup) {
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = "none";
      }
      return;
    }
    this.updateContainer(true);
    const target = event.target;
    if (target) {
      if (this.overlay && !this.overlay.contains(target)) {
        this.disposeOverlay();
      }
      if (!this.overlay) {
        const targetGroupView = this.findTargetGroupView(target);
        if (targetGroupView) {
          this._overlay = this.instantiationService.createInstance(DropOverlay, targetGroupView, this.delegate.supportsSplitting !== false);
        }
      }
    }
  }
  onDragLeave() {
    this.counter--;
    if (this.counter === 0) {
      this.updateContainer(false);
    }
  }
  onDragEnd() {
    this.counter = 0;
    this.updateContainer(false);
    this.disposeOverlay();
  }
  findTargetGroupView(child) {
    const groups = this.editorGroupService.groups;
    return groups.find((groupView) => isAncestor(child, groupView.element) || this.delegate.containsGroup?.(groupView));
  }
  updateContainer(isDraggedOver) {
    this.container.classList.toggle("dragged-over", isDraggedOver);
  }
  dispose() {
    super.dispose();
    this.disposeOverlay();
  }
  disposeOverlay() {
    if (this.overlay) {
      this.overlay.dispose();
      this._overlay = void 0;
    }
  }
};

EditorDropTarget = __decorateClass([
  __decorateParam(3, IEditorGroupsService),
  __decorateParam(4, IThemeService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, IInstantiationService)
], EditorDropTarget);
export { isDropIntoEditorEnabledGlobally, isDragIntoEditorEvent, DropOverlay, EditorDropTarget };
