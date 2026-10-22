// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/files/browser/views/openEditorsView.ts
import { $, EventHelper, EventType, addDisposableListener, append, getLargestChildWidth, isMouseEvent } from "./module-0075.mjs";
import { ExplorerFocusedContext, OpenEditor, OpenEditorsFocusedContext } from "./module-1542.mjs";
import { ViewPane } from "./module-1335.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { DisposableMap, dispose } from "./module-0012.mjs";
import { asCssVariable } from "./module-0226.mjs";
import { badgeBackground, badgeForeground } from "./module-0228.mjs";
import { contrastBorder } from "./module-0227.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { EventType2, Gesture } from "./module-0251.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { ResourceLabels } from "./module-1323.mjs";
import { WorkbenchList } from "./module-0636.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { EditorResourceAccessor, preventEditorClose } from "./module-0925.mjs";
import { NEW_UNTITLED_FILE_COMMAND_ID, OpenEditorsDirtyEditorContext, OpenEditorsGroupContext, OpenEditorsReadonlyEditorContext, OpenEditorsSelectedFileOrUntitledContext, SAVE_ALL_COMMAND_ID, SAVE_ALL_LABEL } from "./module-2017.mjs";
import { MultipleEditorGroupsContext, ResourceContextKey } from "./module-0949.mjs";
import { Schemas } from "./module-0033.mjs";
import { compareFileNamesDefault } from "./module-1529.mjs";
import { extUriIgnorePathCase } from "./module-0034.mjs";
import { Action2, MenuId, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IViewDescriptorService } from "./module-1093.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IEditorGroupsService } from "./module-0933.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { IThemeService } from "./module-0287.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IWorkingCopyService } from "./module-1072.mjs";
import { IFilesConfigurationService } from "./module-0930.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IFileService } from "./module-0269.mjs";
import { ActionRunner } from "./module-0082.mjs";
import { ActionBar } from "./module-0477.mjs";
import { CloseGroupAction, SaveAllInGroupAction } from "./module-2022.mjs";
import { CloseAllEditorsAction, CloseEditorAction, UnpinEditorAction } from "./module-1558.mjs";
import { ResourcesDropHandler, fillEditorsDragData } from "./module-1381.mjs";
import { ElementsDragAndDropData, NativeDragAndDropData } from "./module-0459.mjs";
import { CodeDataTransfers, containsDragType } from "./module-0273.mjs";
import { DataTransfers } from "./module-0263.mjs";
import { EditorGroupView } from "./module-1584.mjs";
import { mainWindow } from "./module-0002.mjs";
import { memoize } from "./module-0250.mjs";
import { Codicon } from "./module-0085.mjs";
import { ICommandService } from "./module-0087.mjs";


// src/vs/workbench/contrib/files/browser/views/openEditorsView.ts
var $36 = $;

function findFirstDirtyEditor(groups) {
  for (const group2 of groups) {
    for (const editor of group2.editors) {
      if (editor.isDirty()) {
        return new OpenEditor(editor, group2);
      }
    }
  }
  return void 0;
}

var OpenEditorsView = class extends ViewPane {
  constructor(options3, instantiationService, viewDescriptorService, contextMenuService, editorGroupService, configurationService, keybindingService, contextKeyService, themeService, telemetryService, hoverService, workingCopyService, filesConfigurationService, openerService, fileService) {
    super(options3, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService);
    this.editorGroupService = editorGroupService;
    this.telemetryService = telemetryService;
    this.workingCopyService = workingCopyService;
    this.filesConfigurationService = filesConfigurationService;
    this.fileService = fileService;
    this.needsRefresh = false;
    this.elements = [];
    this.blockFocusActiveEditorTracking = false;
    this.preserveSelectionOnRefresh = false;
    this.editorIds = /* @__PURE__ */ new WeakMap();
    this.editorIdPool = 0;
    this.structuralRefreshDelay = 0;
    this.sortOrder = configurationService.getValue("explorer.openEditors.sortOrder");
    this.registerUpdateEvents();
    this._register(this.configurationService.onDidChangeConfiguration((e) => this.onConfigurationChange(e)));
    this._register(this.workingCopyService.onDidChangeDirty((workingCopy) => this.updateDirtyIndicator(workingCopy)));
  }
  static {
    this.DEFAULT_VISIBLE_OPEN_EDITORS = 9;
  }
  static {
    this.DEFAULT_MIN_VISIBLE_OPEN_EDITORS = 0;
  }
  static {
    this.ID = "workbench.explorer.openEditorsView";
  }
  static {
    this.NAME = localize2(16034, "Open Editors");
  }
  registerUpdateEvents() {
    const updateWholeList = () => {
      if (!this.isBodyVisible() || !this.list) {
        this.needsRefresh = true;
        return;
      }
      this.scheduleListRefresh(false, this.structuralRefreshDelay);
    };
    const groupDisposables = this._register(new DisposableMap());
    const addGroupListener = (group2) => {
      const groupModelChangeListener = group2.onDidModelChange((e) => {
        if (this.listRefreshScheduler?.isScheduled()) {
          switch (e.kind) {
            case 8 /* EDITOR_ACTIVE */:
            case 5 /* EDITOR_OPEN */:
            case 7 /* EDITOR_MOVE */:
            case 6 /* EDITOR_CLOSE */:
              this.preserveSelectionOnRefresh = false;
          }
          return;
        }
        if (!this.isBodyVisible() || !this.list) {
          this.needsRefresh = true;
          return;
        }
        const index2 = this.getIndex(group2, e.editor);
        switch (e.kind) {
          case 8 /* EDITOR_ACTIVE */:
            this.focusActiveEditor();
            break;
          case 1 /* GROUP_INDEX */:
          case 2 /* GROUP_LABEL */:
            if (index2 >= 0) {
              this.list.splice(index2, 1, [group2]);
            }
            break;
          case 14 /* EDITOR_DIRTY */:
          case 13 /* EDITOR_STICKY */:
          case 10 /* EDITOR_CAPABILITIES */:
          case 11 /* EDITOR_PIN */:
          case 9 /* EDITOR_LABEL */:
            this.list.splice(index2, 1, [new OpenEditor(e.editor, group2)]);
            this.focusActiveEditor(true);
            break;
          case 5 /* EDITOR_OPEN */:
          case 7 /* EDITOR_MOVE */:
          case 6 /* EDITOR_CLOSE */:
            updateWholeList();
            break;
        }
      });
      groupDisposables.set(group2.id, groupModelChangeListener);
    };
    this.editorGroupService.groups.forEach((g) => addGroupListener(g));
    this._register(this.editorGroupService.onDidAddGroup((group2) => {
      addGroupListener(group2);
      updateWholeList();
    }));
    this._register(this.editorGroupService.onDidMoveGroup(() => updateWholeList()));
    this._register(this.editorGroupService.onDidChangeActiveGroup(() => this.focusActiveEditor()));
    this._register(this.editorGroupService.onDidRemoveGroup((group2) => {
      groupDisposables.deleteAndDispose(group2.id);
      updateWholeList();
    }));
  }
  renderHeaderTitle(container3) {
    super.renderHeaderTitle(container3, this.title);
    const count2 = append(container3, $36(".open-editors-dirty-count-container"));
    this.dirtyCountElement = append(count2, $36(".dirty-count.monaco-count-badge.long"));
    this.dirtyCountElement.style.backgroundColor = asCssVariable(badgeBackground);
    this.dirtyCountElement.style.color = asCssVariable(badgeForeground);
    this.dirtyCountElement.style.border = `1px solid ${asCssVariable(contrastBorder)}`;
    this.dirtyCountElement.tabIndex = 0;
    this.dirtyCountElement.setAttribute("role", "button");
    this._register(this.hoverService.setupManagedHover(getDefaultHoverDelegate("element"), this.dirtyCountElement, localize(16036, null)));
    this._register(Gesture.addTarget(this.dirtyCountElement));
    for (const eventType of [EventType.CLICK, EventType2.Tap]) {
      this._register(addDisposableListener(this.dirtyCountElement, eventType, (e) => {
        EventHelper.stop(e, true);
        this.openFirstDirtyEditor();
      }));
    }
    this._register(addDisposableListener(this.dirtyCountElement, EventType.KEY_DOWN, (e) => {
      const event = new StandardKeyboardEvent(e);
      if (event.equals(3 /* Enter */) || event.equals(10 /* Space */)) {
        EventHelper.stop(e, true);
        this.openFirstDirtyEditor();
      }
    }));
    this.updateDirtyIndicator();
  }
  openFirstDirtyEditor() {
    const openEditor = findFirstDirtyEditor(this.editorGroupService.getGroups(2 /* GRID_APPEARANCE */));
    if (openEditor) {
      this.openEditor(openEditor, { pinned: true });
    }
  }
  renderBody(container3) {
    super.renderBody(container3);
    container3.classList.add("open-editors");
    container3.classList.add("show-file-icons");
    const delegate = new OpenEditorsDelegate();
    if (this.list) {
      this.list.dispose();
    }
    if (this.listLabels) {
      this.listLabels.clear();
    }
    this.dnd = new OpenEditorsDragAndDrop(this.sortOrder, this.instantiationService, this.editorGroupService);
    this.listLabels = this.instantiationService.createInstance(ResourceLabels, { onDidChangeVisibility: this.onDidChangeBodyVisibility });
    this.list = this.instantiationService.createInstance(WorkbenchList, "OpenEditors", container3, delegate, [
      new EditorGroupRenderer(this.keybindingService, this.instantiationService),
      new OpenEditorRenderer(this.listLabels, this.instantiationService, this.keybindingService, this.configurationService)
    ], {
      identityProvider: { getId: (element) => this.getElementId(element) },
      dnd: this.dnd,
      overrideStyles: this.getLocationBasedColors().listOverrideStyles,
      accessibilityProvider: new OpenEditorsAccessibilityProvider(),
      openOnSingleClick: true
    });
    this._register(this.list);
    this._register(this.listLabels);
    let labelChangeListeners = [];
    this.listRefreshScheduler = this._register(new RunOnceScheduler(() => {
      const preserveSelection = this.preserveSelectionOnRefresh;
      this.preserveSelectionOnRefresh = false;
      if (!this.list) {
        return;
      }
      labelChangeListeners = dispose(labelChangeListeners);
      const previousLength = this.list.length;
      const elements = this.getElements();
      this.list.splice(0, this.list.length, elements);
      this.focusActiveEditor(preserveSelection);
      if (previousLength !== this.list.length) {
        this.updateSize();
      }
      this.needsRefresh = false;
      if (this.sortOrder === "alphabetical" || this.sortOrder === "fullPath") {
        elements.forEach((e) => {
          if (e instanceof OpenEditor) {
            labelChangeListeners.push(e.editor.onDidChangeLabel(() => this.scheduleListRefresh(true)));
          }
        });
      }
    }, this.structuralRefreshDelay));
    this.updateSize();
    this.handleContextKeys();
    this._register(this.list.onContextMenu((e) => this.onListContextMenu(e)));
    this._register(this.list.onMouseMiddleClick((e) => {
      if (e && e.element instanceof OpenEditor) {
        if (preventEditorClose(e.element.group, e.element.editor, 2 /* MOUSE */, this.editorGroupService.partOptions)) {
          return;
        }
        e.element.group.closeEditor(e.element.editor, { preserveFocus: true });
      }
    }));
    this._register(this.list.onDidOpen((e) => {
      const element = e.element;
      if (!element) {
        return;
      } else if (element instanceof OpenEditor) {
        if (isMouseEvent(e.browserEvent) && e.browserEvent.button === 1) {
          return;
        }
        this.withActiveEditorFocusTrackingDisabled(() => {
          this.openEditor(element, { preserveFocus: e.editorOptions.preserveFocus, pinned: e.editorOptions.pinned, sideBySide: e.sideBySide });
        });
      } else {
        this.withActiveEditorFocusTrackingDisabled(() => {
          this.editorGroupService.activateGroup(element);
          if (!e.editorOptions.preserveFocus) {
            element.focus();
          }
        });
      }
    }));
    this.scheduleListRefresh(false, 0);
    this._register(this.onDidChangeBodyVisibility((visible) => {
      if (visible && this.needsRefresh) {
        this.scheduleListRefresh(false, 0);
      }
    }));
    const containerModel = this.viewDescriptorService.getViewContainerModel(this.viewDescriptorService.getViewContainerByViewId(this.id));
    this._register(containerModel.onDidChangeAllViewDescriptors(() => {
      this.updateSize();
    }));
  }
  handleContextKeys() {
    if (!this.list) {
      return;
    }
    OpenEditorsFocusedContext.bindTo(this.list.contextKeyService);
    ExplorerFocusedContext.bindTo(this.list.contextKeyService);
    const groupFocusedContext = OpenEditorsGroupContext.bindTo(this.contextKeyService);
    const dirtyEditorFocusedContext = OpenEditorsDirtyEditorContext.bindTo(this.contextKeyService);
    const readonlyEditorFocusedContext = OpenEditorsReadonlyEditorContext.bindTo(this.contextKeyService);
    const openEditorsSelectedFileOrUntitledContext = OpenEditorsSelectedFileOrUntitledContext.bindTo(this.contextKeyService);
    const resourceContext = this.instantiationService.createInstance(ResourceContextKey);
    this._register(resourceContext);
    this._register(this.list.onDidChangeFocus((e) => {
      resourceContext.reset();
      groupFocusedContext.reset();
      dirtyEditorFocusedContext.reset();
      readonlyEditorFocusedContext.reset();
      const element = e.elements.length ? e.elements[0] : void 0;
      if (element instanceof OpenEditor) {
        const resource = element.getResource();
        dirtyEditorFocusedContext.set(element.editor.isDirty() && !element.editor.isSaving());
        readonlyEditorFocusedContext.set(!!element.editor.isReadonly());
        resourceContext.set(resource ?? null);
      } else if (element) {
        groupFocusedContext.set(true);
      }
    }));
    this._register(this.list.onDidChangeSelection((e) => {
      const selectedAreFileOrUntitled = e.elements.every((e2) => {
        if (e2 instanceof OpenEditor) {
          const resource = e2.getResource();
          return resource && (resource.scheme === Schemas.untitled || this.fileService.hasProvider(resource));
        }
        return false;
      });
      openEditorsSelectedFileOrUntitledContext.set(selectedAreFileOrUntitled);
    }));
  }
  focus() {
    super.focus();
    this.list?.domFocus();
  }
  layoutBody(height, width2) {
    super.layoutBody(height, width2);
    this.list?.layout(height, width2);
  }
  get showGroups() {
    return this.editorGroupService.groups.length > 1;
  }
  getElements() {
    this.elements = [];
    this.editorGroupService.getGroups(2 /* GRID_APPEARANCE */).forEach((g) => {
      if (this.showGroups) {
        this.elements.push(g);
      }
      let editors = g.editors.map((ei) => new OpenEditor(ei, g));
      if (this.sortOrder === "alphabetical") {
        editors = editors.sort((first2, second) => compareFileNamesDefault(first2.editor.getName(), second.editor.getName()));
      } else if (this.sortOrder === "fullPath") {
        editors = editors.sort((first2, second) => {
          const firstResource = first2.editor.resource;
          const secondResource = second.editor.resource;
          if (firstResource === void 0 && secondResource === void 0) {
            return compareFileNamesDefault(first2.editor.getName(), second.editor.getName());
          } else if (firstResource === void 0) {
            return -1;
          } else if (secondResource === void 0) {
            return 1;
          } else {
            const firstScheme = firstResource.scheme;
            const secondScheme = secondResource.scheme;
            if (firstScheme !== Schemas.file && secondScheme !== Schemas.file) {
              return extUriIgnorePathCase.compare(firstResource, secondResource);
            } else if (firstScheme !== Schemas.file) {
              return -1;
            } else if (secondScheme !== Schemas.file) {
              return 1;
            } else {
              return extUriIgnorePathCase.compare(firstResource, secondResource);
            }
          }
        });
      }
      this.elements.push(...editors);
    });
    return this.elements;
  }
  getIndex(group2, editor) {
    if (!editor) {
      return this.elements.findIndex((e) => !(e instanceof OpenEditor) && e.id === group2.id);
    }
    return this.elements.findIndex((e) => e instanceof OpenEditor && e.editor === editor && e.group.id === group2.id);
  }
  openEditor(element, options3) {
    if (element) {
      this.telemetryService.publicLog2("workbenchActionExecuted", { id: "workbench.files.openFile", from: "openEditors" });
      const preserveActivateGroup = options3.sideBySide && options3.preserveFocus;
      if (!preserveActivateGroup) {
        this.editorGroupService.activateGroup(element.group);
      }
      const targetGroup = options3.sideBySide ? this.editorGroupService.sideGroup : element.group;
      targetGroup.openEditor(element.editor, options3);
    }
  }
  onListContextMenu(e) {
    if (!e.element) {
      return;
    }
    const element = e.element;
    this.contextMenuService.showContextMenu({
      menuId: MenuId.OpenEditorsContext,
      menuActionOptions: { shouldForwardArgs: true, arg: element instanceof OpenEditor ? EditorResourceAccessor.getOriginalUri(element.editor) : {} },
      contextKeyService: this.list?.contextKeyService,
      getAnchor: () => e.anchor,
      getActionsContext: () => element instanceof OpenEditor ? { groupId: element.groupId, editorIndex: element.group.getIndexOfEditor(element.editor) } : { groupId: element.id }
    });
  }
  withActiveEditorFocusTrackingDisabled(fn) {
    this.blockFocusActiveEditorTracking = true;
    try {
      fn();
    } finally {
      this.blockFocusActiveEditorTracking = false;
    }
  }
  scheduleListRefresh(preserveSelection, delay) {
    if (!this.listRefreshScheduler) {
      return;
    }
    if (!preserveSelection || !this.listRefreshScheduler.isScheduled()) {
      this.preserveSelectionOnRefresh = preserveSelection;
    }
    this.listRefreshScheduler.schedule(delay);
  }
  getElementId(element) {
    if (!(element instanceof OpenEditor)) {
      return element.id.toString();
    }
    let editorId = this.editorIds.get(element.editor);
    if (editorId === void 0) {
      editorId = this.editorIdPool++;
      this.editorIds.set(element.editor, editorId);
    }
    return `openeditor:${element.groupId}:${editorId}`;
  }
  focusActiveEditor(preserveSelection = false) {
    if (!this.list || this.blockFocusActiveEditorTracking) {
      return;
    }
    if (this.list.length && this.editorGroupService.activeGroup) {
      const index2 = this.getIndex(this.editorGroupService.activeGroup, this.editorGroupService.activeGroup.activeEditor);
      if (index2 >= 0) {
        try {
          this.list.setFocus([index2]);
          if (!preserveSelection) {
            this.list.setSelection([index2]);
          }
          this.list.reveal(index2);
        } catch (e) {
        }
        return;
      }
    }
    this.list.setFocus([]);
    if (!preserveSelection) {
      this.list.setSelection([]);
    }
  }
  onConfigurationChange(event) {
    if (event.affectsConfiguration("explorer.openEditors")) {
      this.updateSize();
    }
    if (event.affectsConfiguration("explorer.decorations") || event.affectsConfiguration("explorer.openEditors.sortOrder")) {
      this.sortOrder = this.configurationService.getValue("explorer.openEditors.sortOrder");
      if (this.dnd) {
        this.dnd.sortOrder = this.sortOrder;
      }
      this.scheduleListRefresh(false);
    }
  }
  updateSize() {
    this.minimumBodySize = this.orientation === 0 /* VERTICAL */ ? this.getMinExpandedBodySize() : 170;
    this.maximumBodySize = this.orientation === 0 /* VERTICAL */ ? this.getMaxExpandedBodySize() : Number.POSITIVE_INFINITY;
  }
  updateDirtyIndicator(workingCopy) {
    if (workingCopy) {
      const gotDirty = workingCopy.isDirty();
      if (gotDirty && !(workingCopy.capabilities & 2 /* Untitled */) && this.filesConfigurationService.hasShortAutoSaveDelay(workingCopy.resource)) {
        return;
      }
    }
    const dirty = this.workingCopyService.dirtyCount;
    if (dirty === 0) {
      this.dirtyCountElement.classList.add("hidden");
    } else {
      this.dirtyCountElement.textContent = localize(16028, null, dirty);
      this.dirtyCountElement.setAttribute("aria-label", localize(16029, null, dirty));
      this.dirtyCountElement.classList.remove("hidden");
    }
  }
  get elementCount() {
    return this.editorGroupService.groups.map((g) => g.count).reduce((first2, second) => first2 + second, this.showGroups ? this.editorGroupService.groups.length : 0);
  }
  getMaxExpandedBodySize() {
    let minVisibleOpenEditors = this.configurationService.getValue("explorer.openEditors.minVisible");
    if (typeof minVisibleOpenEditors !== "number") {
      minVisibleOpenEditors = OpenEditorsView.DEFAULT_MIN_VISIBLE_OPEN_EDITORS;
    }
    const containerModel = this.viewDescriptorService.getViewContainerModel(this.viewDescriptorService.getViewContainerByViewId(this.id));
    if (containerModel.visibleViewDescriptors.length <= 1) {
      return Number.POSITIVE_INFINITY;
    }
    return Math.max(this.elementCount, minVisibleOpenEditors) * OpenEditorsDelegate.ITEM_HEIGHT;
  }
  getMinExpandedBodySize() {
    let visibleOpenEditors = this.configurationService.getValue("explorer.openEditors.visible");
    if (typeof visibleOpenEditors !== "number") {
      visibleOpenEditors = OpenEditorsView.DEFAULT_VISIBLE_OPEN_EDITORS;
    }
    return this.computeMinExpandedBodySize(visibleOpenEditors);
  }
  computeMinExpandedBodySize(visibleOpenEditors = OpenEditorsView.DEFAULT_VISIBLE_OPEN_EDITORS) {
    const itemsToShow = Math.min(Math.max(visibleOpenEditors, 1), this.elementCount);
    return itemsToShow * OpenEditorsDelegate.ITEM_HEIGHT;
  }
  setStructuralRefreshDelay(delay) {
    this.structuralRefreshDelay = delay;
  }
  getOptimalWidth() {
    if (!this.list) {
      return super.getOptimalWidth();
    }
    const parentNode = this.list.getHTMLElement();
    const childNodes = [].slice.call(parentNode.querySelectorAll(".open-editor > a"));
    return getLargestChildWidth(parentNode, childNodes);
  }
};

OpenEditorsView = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IViewDescriptorService),
  __decorateParam(3, IContextMenuService),
  __decorateParam(4, IEditorGroupsService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, IKeybindingService),
  __decorateParam(7, IContextKeyService),
  __decorateParam(8, IThemeService),
  __decorateParam(9, ITelemetryService),
  __decorateParam(10, IHoverService),
  __decorateParam(11, IWorkingCopyService),
  __decorateParam(12, IFilesConfigurationService),
  __decorateParam(13, IOpenerService),
  __decorateParam(14, IFileService)
], OpenEditorsView);

var OpenEditorActionRunner = class extends ActionRunner {
  async run(action) {
    if (!this.editor) {
      return;
    }
    return super.run(action, { groupId: this.editor.groupId, editorIndex: this.editor.group.getIndexOfEditor(this.editor.editor) });
  }
};

var OpenEditorsDelegate = class _OpenEditorsDelegate {
  static {
    this.ITEM_HEIGHT = 22;
  }
  getHeight(_element) {
    return _OpenEditorsDelegate.ITEM_HEIGHT;
  }
  getTemplateId(element) {
    if (element instanceof OpenEditor) {
      return OpenEditorRenderer.ID;
    }
    return EditorGroupRenderer.ID;
  }
};

var EditorGroupRenderer = class _EditorGroupRenderer {
  constructor(keybindingService, instantiationService) {
    this.keybindingService = keybindingService;
    this.instantiationService = instantiationService;
  }
  static {
    this.ID = "editorgroup";
  }
  get templateId() {
    return _EditorGroupRenderer.ID;
  }
  renderTemplate(container3) {
    const editorGroupTemplate = /* @__PURE__ */ Object.create(null);
    editorGroupTemplate.root = append(container3, $36(".editor-group"));
    editorGroupTemplate.name = append(editorGroupTemplate.root, $36("span.name"));
    editorGroupTemplate.actionBar = new ActionBar(container3);
    const saveAllInGroupAction = this.instantiationService.createInstance(SaveAllInGroupAction, SaveAllInGroupAction.ID, SaveAllInGroupAction.LABEL);
    const saveAllInGroupKey = this.keybindingService.lookupKeybinding(saveAllInGroupAction.id);
    editorGroupTemplate.actionBar.push(saveAllInGroupAction, { icon: true, label: false, keybinding: saveAllInGroupKey ? saveAllInGroupKey.getLabel() : void 0 });
    const closeGroupAction = this.instantiationService.createInstance(CloseGroupAction, CloseGroupAction.ID, CloseGroupAction.LABEL);
    const closeGroupActionKey = this.keybindingService.lookupKeybinding(closeGroupAction.id);
    editorGroupTemplate.actionBar.push(closeGroupAction, { icon: true, label: false, keybinding: closeGroupActionKey ? closeGroupActionKey.getLabel() : void 0 });
    return editorGroupTemplate;
  }
  renderElement(editorGroup, _index, templateData) {
    templateData.editorGroup = editorGroup;
    templateData.name.textContent = editorGroup.label;
    templateData.actionBar.context = { groupId: editorGroup.id };
  }
  disposeTemplate(templateData) {
    templateData.actionBar.dispose();
  }
};

var OpenEditorRenderer = class _OpenEditorRenderer {
  constructor(labels2, instantiationService, keybindingService, configurationService) {
    this.labels = labels2;
    this.instantiationService = instantiationService;
    this.keybindingService = keybindingService;
    this.configurationService = configurationService;
    this.closeEditorAction = this.instantiationService.createInstance(CloseEditorAction, CloseEditorAction.ID, CloseEditorAction.LABEL);
    this.unpinEditorAction = this.instantiationService.createInstance(UnpinEditorAction, UnpinEditorAction.ID, UnpinEditorAction.LABEL);
  }
  static {
    this.ID = "openeditor";
  }
  get templateId() {
    return _OpenEditorRenderer.ID;
  }
  renderTemplate(container3) {
    const editorTemplate = /* @__PURE__ */ Object.create(null);
    editorTemplate.container = container3;
    editorTemplate.actionRunner = new OpenEditorActionRunner();
    editorTemplate.actionBar = new ActionBar(container3, { actionRunner: editorTemplate.actionRunner });
    editorTemplate.root = this.labels.create(container3);
    return editorTemplate;
  }
  renderElement(openedEditor, _index, templateData) {
    const editor = openedEditor.editor;
    templateData.actionRunner.editor = openedEditor;
    templateData.container.classList.toggle("dirty", editor.isDirty() && !editor.isSaving());
    templateData.container.classList.toggle("sticky", openedEditor.isSticky());
    templateData.root.setResource({
      resource: EditorResourceAccessor.getOriginalUri(editor, { supportSideBySide: 3 /* BOTH */ }),
      name: editor.getName(),
      description: editor.getDescription(1 /* MEDIUM */)
    }, {
      italic: openedEditor.isPreview(),
      extraClasses: ["open-editor"].concat(openedEditor.editor.getLabelExtraClasses()),
      fileDecorations: this.configurationService.getValue().explorer.decorations,
      title: editor.getTitle(2 /* LONG */),
      icon: editor.getIcon()
    });
    const editorAction = openedEditor.isSticky() ? this.unpinEditorAction : this.closeEditorAction;
    if (!templateData.actionBar.hasAction(editorAction)) {
      if (!templateData.actionBar.isEmpty()) {
        templateData.actionBar.clear();
      }
      templateData.actionBar.push(editorAction, { icon: true, label: false, keybinding: this.keybindingService.lookupKeybinding(editorAction.id)?.getLabel() });
    }
  }
  disposeTemplate(templateData) {
    templateData.actionBar.dispose();
    templateData.root.dispose();
    templateData.actionRunner.dispose();
  }
};

var OpenEditorsDragAndDrop = class {
  constructor(sortOrder, instantiationService, editorGroupService) {
    this.instantiationService = instantiationService;
    this.editorGroupService = editorGroupService;
    this._sortOrder = sortOrder;
  }
  set sortOrder(value2) {
    this._sortOrder = value2;
  }
  get dropHandler() {
    return this.instantiationService.createInstance(ResourcesDropHandler, { allowWorkspaceOpen: false });
  }
  getDragURI(element) {
    if (element instanceof OpenEditor) {
      const resource = element.getResource();
      if (resource) {
        return resource.toString();
      }
    }
    return null;
  }
  getDragLabel(elements) {
    if (elements.length > 1) {
      return String(elements.length);
    }
    const element = elements[0];
    return element instanceof OpenEditor ? element.editor.getName() : element.label;
  }
  onDragStart(data, originalEvent) {
    const items = data.elements;
    const editors = [];
    if (items) {
      for (const item of items) {
        if (item instanceof OpenEditor) {
          editors.push(item);
        }
      }
    }
    if (editors.length) {
      this.instantiationService.invokeFunction(fillEditorsDragData, editors, originalEvent);
    }
  }
  onDragOver(data, _targetElement, _targetIndex, targetSector, originalEvent) {
    if (data instanceof NativeDragAndDropData) {
      if (!containsDragType(originalEvent, DataTransfers.FILES, CodeDataTransfers.FILES)) {
        return false;
      }
    }
    if (this._sortOrder !== "editorOrder") {
      if (data instanceof ElementsDragAndDropData) {
        return false;
      } else {
        return { accept: true, effect: { type: 1 /* Move */ }, feedback: [-1] };
      }
    }
    let dropEffectPosition = void 0;
    switch (targetSector) {
      case 0 /* TOP */:
      case 1 /* CENTER_TOP */:
        dropEffectPosition = _targetIndex === 0 && _targetElement instanceof EditorGroupView ? "drop-target-after" /* After */ : "drop-target-before" /* Before */;
        break;
      case 2 /* CENTER_BOTTOM */:
      case 3 /* BOTTOM */:
        dropEffectPosition = "drop-target-after" /* After */;
        break;
    }
    return { accept: true, effect: { type: 1 /* Move */, position: dropEffectPosition }, feedback: [_targetIndex] };
  }
  drop(data, targetElement, _targetIndex, targetSector, originalEvent) {
    let group2 = targetElement instanceof OpenEditor ? targetElement.group : targetElement || this.editorGroupService.groups[this.editorGroupService.count - 1];
    let targetEditorIndex = targetElement instanceof OpenEditor ? targetElement.group.getIndexOfEditor(targetElement.editor) : 0;
    switch (targetSector) {
      case 0 /* TOP */:
      case 1 /* CENTER_TOP */:
        if (targetElement instanceof EditorGroupView && group2.index !== 0) {
          group2 = this.editorGroupService.groups[group2.index - 1];
          targetEditorIndex = group2.count;
        }
        break;
      case 3 /* BOTTOM */:
      case 2 /* CENTER_BOTTOM */:
        if (targetElement instanceof OpenEditor) {
          targetEditorIndex++;
        }
        break;
    }
    if (data instanceof ElementsDragAndDropData) {
      for (const oe of data.elements) {
        const sourceEditorIndex = oe.group.getIndexOfEditor(oe.editor);
        if (oe.group === group2 && sourceEditorIndex < targetEditorIndex) {
          targetEditorIndex--;
        }
        oe.group.moveEditor(oe.editor, group2, { index: targetEditorIndex, preserveFocus: true });
        targetEditorIndex++;
      }
      this.editorGroupService.activateGroup(group2);
    } else {
      this.dropHandler.handleDrop(originalEvent, mainWindow, () => group2, () => group2.focus(), { index: targetEditorIndex });
    }
  }
  dispose() {
  }
};

__decorateClass([
  memoize
], OpenEditorsDragAndDrop.prototype, "dropHandler", 1);

var OpenEditorsAccessibilityProvider = class {
  getWidgetAriaLabel() {
    return localize(16035, null);
  }
  getAriaLabel(element) {
    if (element instanceof OpenEditor) {
      return `${element.editor.getName()}, ${element.editor.getDescription()}`;
    }
    return element.ariaLabel;
  }
};

var toggleEditorGroupLayoutId = "workbench.action.toggleEditorGroupLayout";

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.toggleEditorGroupLayout",
      title: localize2(16030, "Toggle Vertical/Horizontal Editor Layout"),
      f1: true,
      keybinding: {
        primary: 1024 /* Shift */ | 512 /* Alt */ | 21 /* Digit0 */,
        mac: { primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 21 /* Digit0 */ },
        weight: 200 /* WorkbenchContrib */
      },
      icon: Codicon.editorLayout,
      menu: {
        id: MenuId.ViewTitle,
        group: "navigation",
        when: ContextKeyExpr.and(ContextKeyExpr.equals("view", OpenEditorsView.ID), MultipleEditorGroupsContext),
        order: 10
      }
    });
  }
  async run(accessor) {
    const editorGroupService = accessor.get(IEditorGroupsService);
    const newOrientation = editorGroupService.orientation === 1 /* VERTICAL */ ? 0 /* HORIZONTAL */ : 1 /* VERTICAL */;
    editorGroupService.setGroupOrientation(newOrientation);
    editorGroupService.activeGroup.focus();
  }
});

MenuRegistry.appendMenuItem(MenuId.MenubarLayoutMenu, {
  group: "5_flip",
  command: {
    id: toggleEditorGroupLayoutId,
    title: {
      ...localize2(16032, "Flip Layout"),
      mnemonicTitle: localize(16031, null)
    }
  },
  order: 1
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.files.saveAll",
      title: SAVE_ALL_LABEL,
      f1: true,
      icon: Codicon.saveAll,
      menu: {
        id: MenuId.ViewTitle,
        group: "navigation",
        when: ContextKeyExpr.equals("view", OpenEditorsView.ID),
        order: 20
      }
    });
  }
  async run(accessor) {
    const commandService = accessor.get(ICommandService);
    await commandService.executeCommand(SAVE_ALL_COMMAND_ID);
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "openEditors.closeAll",
      title: CloseAllEditorsAction.LABEL,
      f1: false,
      icon: Codicon.closeAll,
      menu: {
        id: MenuId.ViewTitle,
        group: "navigation",
        when: ContextKeyExpr.equals("view", OpenEditorsView.ID),
        order: 30
      }
    });
  }
  async run(accessor) {
    const instantiationService = accessor.get(IInstantiationService);
    const closeAll = new CloseAllEditorsAction();
    await instantiationService.invokeFunction((accessor2) => closeAll.run(accessor2));
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "openEditors.newUntitledFile",
      title: localize2(16033, "New Untitled Text File"),
      f1: false,
      icon: Codicon.newFile,
      menu: {
        id: MenuId.ViewTitle,
        group: "navigation",
        when: ContextKeyExpr.equals("view", OpenEditorsView.ID),
        order: 5
      }
    });
  }
  async run(accessor) {
    const commandService = accessor.get(ICommandService);
    await commandService.executeCommand(NEW_UNTITLED_FILE_COMMAND_ID);
  }
});
export { findFirstDirtyEditor, $36, OpenEditorsView, OpenEditorActionRunner, OpenEditorsDelegate, EditorGroupRenderer, OpenEditorRenderer, OpenEditorsDragAndDrop, OpenEditorsAccessibilityProvider, toggleEditorGroupLayoutId };
