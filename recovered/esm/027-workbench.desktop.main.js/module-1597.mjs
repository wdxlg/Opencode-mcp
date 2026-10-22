// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/editor/modalEditorPart.ts
import { CLOSE_MODAL_EDITOR_COMMAND_ID, MOVE_MODAL_EDITOR_TO_MAIN_COMMAND_ID, MOVE_MODAL_EDITOR_TO_WINDOW_COMMAND_ID, NAVIGATE_MODAL_EDITOR_NEXT_COMMAND_ID, NAVIGATE_MODAL_EDITOR_PREVIOUS_COMMAND_ID, TOGGLE_MODAL_EDITOR_MAXIMIZED_COMMAND_ID, TOGGLE_MODAL_EDITOR_SIDEBAR_COMMAND_ID } from "./module-1538.mjs";
import { DisposableStore, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { $, Dimension, EventHelper, EventType, addDisposableListener, append, hide, isHTMLElement, setVisibility, show } from "./module-0075.mjs";
import { IEditorService, USE_MODAL_EDITOR_SETTING } from "./module-0934.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { ResizableHTMLElement } from "./module-0585.mjs";
import { Codicon } from "./module-0085.mjs";
import { Action, Separator } from "./module-0082.mjs";
import { localize } from "./module-0001.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { ActionBar, prepareActions } from "./module-0477.mjs";
import { Button } from "./module-0546.mjs";
import { ServiceCollection } from "./module-0440.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { mainWindow } from "./module-0002.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { MenuWorkbenchToolBar, WorkbenchToolBar } from "./module-0519.mjs";
import { MenuId } from "./module-0092.mjs";
import { ResourceLabel } from "./module-1323.mjs";
import { EditorResourceAccessor } from "./module-0925.mjs";
import { GlobalPointerMoveMonitor } from "./module-0225.mjs";
import { isModalEditorOptionsProvider } from "./module-0156.mjs";
import { Sash } from "./module-0496.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IWorkbenchLayoutService } from "./module-1118.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IHostService } from "./module-1117.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { EditorPart } from "./module-1588.mjs";
import { EditorPartModalContext, EditorPartModalMaximizedContext, EditorPartModalNavigationContext, EditorPartModalSidebarContext, EditorPartModalSidebarVisibleContext } from "./module-0949.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IStorageService } from "./module-0512.mjs";


// src/vs/workbench/browser/parts/editor/modalEditorPart.ts
var MODAL_MIN_WIDTH = 400;

var MODAL_MIN_HEIGHT = 300;

var MODAL_MAX_DEFAULT_WIDTH = 1400;

var MODAL_MAX_DEFAULT_HEIGHT = 900;

var MODAL_BORDER_WIDTH = 1;

var MODAL_BORDER_SIZE = MODAL_BORDER_WIDTH * 2;

var MODAL_HEADER_HEIGHT = 33;

var MODAL_SNAP_THRESHOLD = 20;

var MODAL_MAXIMIZED_PADDING = 16;

var MODAL_SIDEBAR_MIN_WIDTH = 160;

var MODAL_SIDEBAR_DEFAULT_WIDTH = 260;

var MODAL_SIDEBAR_PADDING = 8;

var MODAL_SIDEBAR_BORDER_RIGHT = 1;

var defaultModalEditorAllowableCommands = /* @__PURE__ */ new Set([
  // Application
  "workbench.action.quit",
  "workbench.action.reloadWindow",
  "workbench.action.toggleFullScreen",
  // Quick access
  "workbench.action.gotoSymbol",
  "workbench.action.gotoLine",
  // Zoom
  "workbench.action.zoomIn",
  "workbench.action.zoomOut",
  "workbench.action.zoomReset",
  // File operations
  "workbench.action.files.save",
  "workbench.action.files.saveAll",
  "workbench.action.files.revert",
  // Close editors
  "workbench.action.closeActiveEditor",
  "workbench.action.closeAllEditors",
  "workbench.action.closeEditorsInGroup",
  "workbench.action.closeUnmodifiedEditors",
  // Settings
  "workbench.action.openSettings",
  "workbench.action.openSettings2",
  "workbench.action.openSettingsJson",
  "workbench.action.openGlobalSettings",
  "workbench.action.openApplicationSettingsJson",
  "workbench.action.openRawDefaultSettings",
  "workbench.action.openWorkspaceSettings",
  "workbench.action.openWorkspaceSettingsFile",
  "workbench.action.openFolderSettings",
  "workbench.action.openFolderSettingsFile",
  "workbench.action.openRemoteSettings",
  "workbench.action.openRemoteSettingsFile",
  "workbench.action.openAccessibilitySettings",
  "workbench.action.configureLanguageBasedSettings",
  // Keybindings
  "workbench.action.openGlobalKeybindings",
  "workbench.action.openDefaultKeybindingsFile",
  "workbench.action.openGlobalKeybindingsFile",
  "workbench.action.openKeyboardLayoutPicker",
  // Modal editor
  CLOSE_MODAL_EDITOR_COMMAND_ID,
  MOVE_MODAL_EDITOR_TO_MAIN_COMMAND_ID,
  MOVE_MODAL_EDITOR_TO_WINDOW_COMMAND_ID,
  TOGGLE_MODAL_EDITOR_MAXIMIZED_COMMAND_ID,
  NAVIGATE_MODAL_EDITOR_PREVIOUS_COMMAND_ID,
  NAVIGATE_MODAL_EDITOR_NEXT_COMMAND_ID,
  TOGGLE_MODAL_EDITOR_SIDEBAR_COMMAND_ID
]);

var ModalEditorPart = class {
  constructor(editorPartsView, instantiationService, editorService, layoutService, keybindingService, hostService, configurationService, contextMenuService, contextKeyService) {
    this.editorPartsView = editorPartsView;
    this.instantiationService = instantiationService;
    this.editorService = editorService;
    this.layoutService = layoutService;
    this.keybindingService = keybindingService;
    this.hostService = hostService;
    this.configurationService = configurationService;
    this.contextMenuService = contextMenuService;
    this.contextKeyService = contextKeyService;
  }
  async create(options3) {
    const disposables = new DisposableStore();
    const modalElement = $(".monaco-modal-editor-block");
    this.layoutService.mainContainer.appendChild(modalElement);
    disposables.add(toDisposable(() => modalElement.remove()));
    const modalContextKeyService = disposables.add(this.contextKeyService.createScoped(modalElement));
    disposables.add(addDisposableListener(modalElement, EventType.MOUSE_DOWN, (e) => {
      if (e.target === modalElement) {
        EventHelper.stop(e, true);
        void editorPart.close();
      }
    }));
    let useModalMode = this.configurationService.getValue(USE_MODAL_EDITOR_SETTING);
    disposables.add(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(USE_MODAL_EDITOR_SETTING)) {
        useModalMode = this.configurationService.getValue(USE_MODAL_EDITOR_SETTING);
      }
    }));
    disposables.add(addDisposableListener(modalElement, EventType.KEY_DOWN, (e) => {
      const event = new StandardKeyboardEvent(e);
      if (useModalMode !== "all") {
        const resolved = this.keybindingService.softDispatch(event, this.layoutService.mainContainer);
        if (resolved.kind === 2 /* KbFound */ && resolved.commandId) {
          if (resolved.commandId.startsWith("workbench.") && !defaultModalEditorAllowableCommands.has(resolved.commandId)) {
            EventHelper.stop(event, true);
          }
        }
      }
    }));
    const resizableElement = new ResizableHTMLElement();
    disposables.add(toDisposable(() => resizableElement.dispose()));
    resizableElement.domNode.classList.add("modal-editor-resizable");
    const effectiveMinWidth = MODAL_MIN_WIDTH + (options3?.sidebar ? MODAL_SIDEBAR_MIN_WIDTH : 0);
    resizableElement.minSize = new Dimension(effectiveMinWidth, MODAL_MIN_HEIGHT);
    modalElement.appendChild(resizableElement.domNode);
    const shadowElement = resizableElement.domNode.appendChild($(".modal-editor-shadow"));
    const titleId = "modal-editor-title";
    const editorPartContainer = $(".part.editor.modal-editor-part", {
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": titleId
    });
    shadowElement.appendChild(editorPartContainer);
    const headerElement = editorPartContainer.appendChild($(".modal-editor-header"));
    const sidebarToggleContainer = append(headerElement, $("div.modal-editor-sidebar-toggle"));
    if (!options3?.sidebar) {
      hide(sidebarToggleContainer);
    }
    const sidebarToggleIcon = options3?.sidebar?.sidebarHidden ? Codicon.layoutSidebarLeftOff : Codicon.layoutSidebarLeft;
    const sidebarToggleAction = disposables.add(new Action(TOGGLE_MODAL_EDITOR_SIDEBAR_COMMAND_ID, localize(6764, null), ThemeIcon.asClassName(sidebarToggleIcon), true));
    const sidebarToggleActionBar = disposables.add(new ActionBar(sidebarToggleContainer));
    sidebarToggleActionBar.push(sidebarToggleAction, { icon: true, label: false });
    const titleElement = append(headerElement, $("div.modal-editor-title.show-file-icons"));
    titleElement.id = titleId;
    titleElement.textContent = "";
    const navigationContainer = append(headerElement, $("div.modal-editor-navigation"));
    hide(navigationContainer);
    disposables.add(addDisposableListener(navigationContainer, EventType.DBLCLICK, (e) => EventHelper.stop(e, true)));
    const previousButton = disposables.add(new Button(navigationContainer, { title: localize(6763, null) }));
    previousButton.icon = Codicon.chevronLeft;
    previousButton.element.classList.add("modal-editor-nav-button");
    disposables.add(previousButton.onDidClick(() => {
      const navigation = editorPart.navigation;
      if (navigation && navigation.current > 0) {
        navigation.navigate(navigation.current - 1);
      }
    }));
    const navigationLabel = append(navigationContainer, $("span.modal-editor-nav-label"));
    navigationLabel.setAttribute("aria-live", "polite");
    const nextButton = disposables.add(new Button(navigationContainer, { title: localize(6762, null) }));
    nextButton.icon = Codicon.chevronRight;
    nextButton.element.classList.add("modal-editor-nav-button");
    disposables.add(nextButton.onDidClick(() => {
      const navigation = editorPart.navigation;
      if (navigation && navigation.current < navigation.total - 1) {
        navigation.navigate(navigation.current + 1);
      }
    }));
    const actionBarContainer = append(headerElement, $("div.modal-editor-action-container"));
    const sidebarResult = this.createSidebar(editorPartContainer, headerElement, options3?.sidebar, modalContextKeyService, disposables);
    if (sidebarResult) {
      if (sidebarResult.isVisible()) {
        editorPartContainer.classList.add("has-sidebar");
      }
      disposables.add(sidebarResult.onDidResize(() => layoutModal()));
    }
    const modalInstantiationService = disposables.add(this.instantiationService.createChild(new ServiceCollection(
      [IContextKeyService, modalContextKeyService]
    )));
    const editorPart = disposables.add(modalInstantiationService.createInstance(
      ModalEditorPartImpl,
      mainWindow.vscodeWindowId,
      this.editorPartsView,
      modalElement,
      options3
    ));
    disposables.add(this.editorPartsView.registerPart(editorPart));
    editorPart.create(editorPartContainer);
    disposables.add(Event2.once(editorPart.onWillClose)(() => disposables.dispose()));
    const pendingBubbleCloseEvents = /* @__PURE__ */ new WeakSet();
    disposables.add(addDisposableListener(mainWindow, EventType.KEY_DOWN, (e) => pendingBubbleCloseEvents.delete(e)));
    disposables.add(addDisposableListener(modalElement, EventType.KEY_DOWN, (e) => {
      const event = new StandardKeyboardEvent(e);
      const resolved = this.keybindingService.softDispatch(event, event.target);
      if (resolved.kind === 2 /* KbFound */ && resolved.commandId === CLOSE_MODAL_EDITOR_COMMAND_ID) {
        if (resolved.isBubble) {
          pendingBubbleCloseEvents.add(e);
          queueMicrotask(() => {
            if (pendingBubbleCloseEvents.delete(e)) {
              this.keybindingService.dispatchEvent(event, event.target);
            }
          });
          return;
        }
        const shouldPreventDefault = this.keybindingService.dispatchEvent(event, event.target);
        event.stopPropagation();
        if (shouldPreventDefault) {
          event.preventDefault();
        }
      }
    }, true));
    disposables.add(Event2.runAndSubscribe(editorPart.onDidChangeNavigation, ((navigation) => {
      if (navigation && navigation.total > 1) {
        show(navigationContainer);
        navigationLabel.textContent = localize(6761, null, navigation.current + 1, navigation.total);
        previousButton.enabled = navigation.current > 0;
        nextButton.enabled = navigation.current < navigation.total - 1;
      } else {
        hide(navigationContainer);
      }
    }), editorPart.navigation));
    if (sidebarResult) {
      disposables.add(Event2.runAndSubscribe(sidebarResult.onDidResize, () => {
        if (sidebarResult.isVisible()) {
          editorPart.sidebarWidth = sidebarResult.hasCustomWidth() ? sidebarResult.getWidth() : void 0;
        }
      }));
      disposables.add(editorPart.onDidToggleSidebar(() => {
        sidebarResult.setVisible(!editorPart.sidebarHidden);
        sidebarToggleAction.class = ThemeIcon.asClassName(editorPart.sidebarHidden ? Codicon.layoutSidebarLeftOff : Codicon.layoutSidebarLeft);
        layoutModal();
      }));
    }
    disposables.add(sidebarToggleActionBar.onDidRun(() => editorPart.toggleSidebar()));
    const modalEditorService = this.editorService.createScoped(editorPart, disposables);
    const scopedInstantiationService = disposables.add(editorPart.scopedInstantiationService.createChild(new ServiceCollection(
      [IEditorService, modalEditorService]
    )));
    const editorActionsToolbarContainer = append(actionBarContainer, $("div.modal-editor-editor-actions"));
    const editorActionsToolbar = disposables.add(scopedInstantiationService.createInstance(WorkbenchToolBar, editorActionsToolbarContainer, {
      hiddenItemStrategy: -1 /* NoHide */,
      highlightToggledItems: true
    }));
    const editorActionsSeparator = append(actionBarContainer, $("div.modal-editor-action-separator"));
    const editorActionsDisposables = disposables.add(new DisposableStore());
    const updateEditorActions = () => {
      editorActionsDisposables.clear();
      const editorActions = editorPart.activeGroup.createEditorActions(editorActionsDisposables, MenuId.ModalEditorEditorTitle);
      editorActionsDisposables.add(editorActions.onDidChange(() => updateEditorActions()));
      const { primary, secondary } = editorActions.actions;
      editorActionsToolbar.setActions(prepareActions(primary), prepareActions(secondary));
      const hasActions = primary.length > 0 || secondary.length > 0;
      setVisibility(hasActions, editorActionsSeparator);
    };
    disposables.add(Event2.runAndSubscribe(modalEditorService.onDidActiveEditorChange, () => updateEditorActions()));
    disposables.add(modalEditorService.onDidEditorsChange(() => editorPart.enforceModalPartOptions()));
    disposables.add(scopedInstantiationService.createInstance(MenuWorkbenchToolBar, actionBarContainer, MenuId.ModalEditorTitle, {
      hiddenItemStrategy: -1 /* NoHide */,
      highlightToggledItems: true,
      menuOptions: { shouldForwardArgs: true }
    }));
    const label3 = disposables.add(scopedInstantiationService.createInstance(ResourceLabel, titleElement, {}));
    const labelChangeDisposable = disposables.add(new MutableDisposable());
    let trackedEditor;
    const updateLabel = () => {
      const activeEditor = editorPart.activeGroup.activeEditor;
      if (activeEditor) {
        const { labelFormat } = editorPart.partOptions;
        label3.element.setResource(
          {
            resource: EditorResourceAccessor.getOriginalUri(activeEditor, { supportSideBySide: 3 /* BOTH */ }),
            name: activeEditor.getName(),
            description: activeEditor.getDescription(labelFormat === "short" ? 0 /* SHORT */ : labelFormat === "long" ? 2 /* LONG */ : 1 /* MEDIUM */) || ""
          },
          {
            title: activeEditor.getTitle(2 /* LONG */),
            icon: activeEditor.getIcon(),
            extraClasses: activeEditor.getLabelExtraClasses()
          }
        );
        if (trackedEditor !== activeEditor) {
          trackedEditor = activeEditor;
          labelChangeDisposable.value = activeEditor.onDidChangeLabel(() => updateLabel());
        }
      } else {
        label3.element.clear();
        trackedEditor = void 0;
        labelChangeDisposable.clear();
      }
    };
    disposables.add(Event2.runAndSubscribe(modalEditorService.onDidActiveEditorChange, updateLabel));
    disposables.add(addDisposableListener(headerElement, EventType.DBLCLICK, (e) => {
      EventHelper.stop(e);
      editorPart.handleHeaderDoubleClick();
    }));
    disposables.add(addDisposableListener(headerElement, EventType.CONTEXT_MENU, (e) => {
      const target = e.target;
      if (isHTMLElement(target) && (target.closest(".monaco-button") || target.closest(".action-item"))) {
        return;
      }
      EventHelper.stop(e, true);
      const contextMenuDisposables = new DisposableStore();
      const activeGroup = editorPart.activeGroup;
      const activeEditor = activeGroup.activeEditor;
      const editorScopedContextKeyService = activeGroup.activeEditorPane?.scopedContextKeyService ?? activeGroup.scopedContextKeyService;
      const editorActions = activeGroup.createEditorActions(contextMenuDisposables, MenuId.EditorTitle);
      const { primary, secondary } = editorActions.actions;
      this.contextMenuService.showContextMenu({
        menuId: MenuId.ModalEditorTitleContext,
        contextKeyService: editorScopedContextKeyService,
        getAnchor: () => ({ x: e.clientX, y: e.clientY }),
        getActions: () => Separator.join(primary, secondary),
        getActionsContext: () => ({ groupId: activeGroup.id, editorIndex: activeEditor ? activeGroup.getIndexOfEditor(activeEditor) : void 0 }),
        getKeyBinding: (action) => this.keybindingService.lookupKeybinding(action.id, editorScopedContextKeyService),
        onHide: () => contextMenuDisposables.dispose()
      });
    }));
    const layout2 = (sizeChanged) => {
      const { width: modalWidth, height: modalHeight } = resizableElement.size;
      const { top: topPx, left: leftPx } = resizableElement.domNode.style;
      const sidebarWidth = sidebarResult?.getWidth() ?? 0;
      const headerHeight = headerElement.offsetHeight;
      editorPart.layout(
        Math.max(0, modalWidth - MODAL_BORDER_SIZE - sidebarWidth),
        modalHeight - MODAL_BORDER_SIZE - headerHeight,
        parseFloat(topPx) + MODAL_BORDER_WIDTH + headerHeight,
        parseFloat(leftPx) + MODAL_BORDER_WIDTH + sidebarWidth
      );
      if (sizeChanged) {
        sidebarResult?.layout(modalHeight - MODAL_BORDER_SIZE - headerHeight);
      }
    };
    const dragMonitor = disposables.add(new GlobalPointerMoveMonitor());
    const dragDisposables = disposables.add(new DisposableStore());
    let didDrag = false;
    disposables.add(addDisposableListener(headerElement, EventType.POINTER_DOWN, (e) => {
      if (editorPart.maximized) {
        return;
      }
      if (e.button !== 0) {
        return;
      }
      const target = e.target;
      if (!isHTMLElement(target)) {
        return;
      }
      if (target.closest(".monaco-button") || target.closest(".action-item")) {
        return;
      }
      EventHelper.stop(e, true);
      dragDisposables.clear();
      headerElement.classList.add("dragging");
      dragDisposables.add(toDisposable(() => headerElement.classList.remove("dragging")));
      const startX = e.clientX;
      const startY = e.clientY;
      const startLeft = parseFloat(resizableElement.domNode.style.left) || 0;
      const startTop = parseFloat(resizableElement.domNode.style.top) || 0;
      didDrag = false;
      const onPointerMove = (moveEvent) => {
        didDrag = true;
        EventHelper.stop(moveEvent, true);
        const containerDimension = this.layoutService.mainContainerDimension;
        const titleBarOffset = this.layoutService.mainContainerOffset.top;
        const dialogWidth = resizableElement.size.width;
        const dialogHeight = resizableElement.size.height;
        const minLeft = 0;
        const minTop = titleBarOffset;
        const maxLeft = Math.max(minLeft, containerDimension.width - dialogWidth);
        const maxTop = Math.max(minTop, containerDimension.height - dialogHeight);
        let newLeft = Math.max(minLeft, Math.min(maxLeft, startLeft + (moveEvent.clientX - startX)));
        let newTop = Math.max(minTop, Math.min(maxTop, startTop + (moveEvent.clientY - startY)));
        const centerLeft = (containerDimension.width - dialogWidth) / 2;
        const centerTop = Math.max(titleBarOffset, (containerDimension.height - dialogHeight) / 2);
        if (Math.abs(newLeft - centerLeft) < MODAL_SNAP_THRESHOLD && Math.abs(newTop - centerTop) < MODAL_SNAP_THRESHOLD) {
          newLeft = centerLeft;
          newTop = centerTop;
        }
        resizableElement.domNode.style.left = `${newLeft}px`;
        resizableElement.domNode.style.top = `${newTop}px`;
        layout2(false);
      };
      const onStop = () => {
        dragDisposables.clear();
        if (didDrag) {
          const currentLeft = parseFloat(resizableElement.domNode.style.left) || 0;
          const currentTop = parseFloat(resizableElement.domNode.style.top) || 0;
          const containerDimension = this.layoutService.mainContainerDimension;
          const titleBarOffset = this.layoutService.mainContainerOffset.top;
          const centerLeft = (containerDimension.width - resizableElement.size.width) / 2;
          const centerTop = Math.max(titleBarOffset, (containerDimension.height - resizableElement.size.height) / 2);
          if (Math.abs(currentLeft - centerLeft) < 1 && Math.abs(currentTop - centerTop) < 1) {
            editorPart.position = void 0;
          } else {
            editorPart.position = { left: currentLeft, top: currentTop };
          }
        }
      };
      dragMonitor.startMonitoring(headerElement, e.pointerId, e.buttons, onPointerMove, onStop);
    }));
    disposables.add(addDisposableListener(headerElement, EventType.CLICK, (e) => {
      const wasDrag = didDrag;
      didDrag = false;
      if (wasDrag) {
        return;
      }
      EventHelper.stop(e);
      editorPart.activeGroup.focus();
    }));
    let isResizing = false;
    let resizeStartLeft = 0;
    let resizeStartTop = 0;
    let resizeStartSize = Dimension.None;
    disposables.add(resizableElement.onDidWillResize(() => {
      isResizing = true;
      resizeStartLeft = parseFloat(resizableElement.domNode.style.left) || 0;
      resizeStartTop = parseFloat(resizableElement.domNode.style.top) || 0;
      resizeStartSize = new Dimension(resizableElement.size.width, resizableElement.size.height);
    }));
    disposables.add(resizableElement.onDidResize((e) => {
      if (!e.done) {
        const containerDimension = this.layoutService.mainContainerDimension;
        const titleBarOffset = this.layoutService.mainContainerOffset.top;
        const deltaWidth = e.dimension.width - resizeStartSize.width;
        const deltaHeight = e.dimension.height - resizeStartSize.height;
        let newLeft = e.west ? resizeStartLeft - deltaWidth : resizeStartLeft;
        let newTop = e.north ? resizeStartTop - deltaHeight : resizeStartTop;
        let newWidth = e.dimension.width;
        let newHeight = e.dimension.height;
        if (newLeft < 0) {
          newWidth += newLeft;
          newLeft = 0;
        }
        if (newTop < titleBarOffset) {
          newHeight += newTop - titleBarOffset;
          newTop = titleBarOffset;
        }
        if (newLeft + newWidth > containerDimension.width) {
          newWidth = containerDimension.width - newLeft;
        }
        if (newTop + newHeight > containerDimension.height) {
          newHeight = containerDimension.height - newTop;
        }
        if (newWidth !== e.dimension.width || newHeight !== e.dimension.height) {
          resizableElement.layout(newHeight, newWidth);
        }
        if (e.west) {
          resizableElement.domNode.style.left = `${newLeft}px`;
        }
        if (e.north) {
          resizableElement.domNode.style.top = `${newTop}px`;
        }
      }
      layout2(true);
      if (e.done) {
        isResizing = false;
        const defaultSize = getDefaultSize();
        const size3 = resizableElement.size;
        if (size3.width === defaultSize.width && size3.height === defaultSize.height) {
          editorPart.size = void 0;
          editorPart.position = void 0;
          layoutModal();
        } else {
          editorPart.size = new Dimension(size3.width, size3.height);
          editorPart.position = {
            left: parseFloat(resizableElement.domNode.style.left) || 0,
            top: parseFloat(resizableElement.domNode.style.top) || 0
          };
        }
      }
    }));
    const getDefaultSize = () => {
      const containerDimension = this.layoutService.mainContainerDimension;
      const titleBarOffset = this.layoutService.mainContainerOffset.top;
      const availableHeight = Math.max(containerDimension.height - titleBarOffset, 0);
      const targetWidth = containerDimension.width * 0.8;
      const targetHeight = availableHeight * 0.8;
      const width2 = Math.min(targetWidth, MODAL_MAX_DEFAULT_WIDTH, containerDimension.width);
      const height = Math.min(targetHeight, MODAL_MAX_DEFAULT_HEIGHT, availableHeight);
      return new Dimension(width2, height);
    };
    let isFirstLayout = true;
    const layoutModal = () => {
      if (isResizing) {
        return;
      }
      const containerDimension = this.layoutService.mainContainerDimension;
      const titleBarOffset = this.layoutService.mainContainerOffset.top;
      const availableHeight = Math.max(containerDimension.height - titleBarOffset, 0);
      const defaultSize = getDefaultSize();
      let width2;
      let height;
      if (editorPart.maximized) {
        const verticalPadding = Math.max(titleBarOffset, MODAL_MAXIMIZED_PADDING);
        width2 = Math.max(containerDimension.width - MODAL_MAXIMIZED_PADDING, 0);
        height = Math.max(availableHeight - verticalPadding, 0);
      } else if (editorPart.size) {
        width2 = Math.min(editorPart.size.width, containerDimension.width);
        height = Math.min(editorPart.size.height, availableHeight);
      } else {
        width2 = defaultSize.width;
        height = defaultSize.height;
      }
      height = Math.min(height, availableHeight);
      if (isFirstLayout) {
        isFirstLayout = false;
        sidebarResult?.clampWidth(width2);
      }
      resizableElement.maxSize = new Dimension(containerDimension.width, availableHeight);
      resizableElement.preferredSize = defaultSize;
      resizableElement.layout(height, width2);
      const canResize = !editorPart.maximized;
      resizableElement.enableSashes(canResize, canResize, canResize, canResize);
      if (!editorPart.maximized && editorPart.position) {
        const clampedLeft = Math.max(0, Math.min(editorPart.position.left, containerDimension.width - width2));
        const clampedTop = Math.max(titleBarOffset, Math.min(editorPart.position.top, titleBarOffset + availableHeight - height));
        resizableElement.domNode.style.left = `${clampedLeft}px`;
        resizableElement.domNode.style.top = `${clampedTop}px`;
      } else {
        const left = (containerDimension.width - width2) / 2;
        const top2 = Math.max(titleBarOffset, (containerDimension.height - height) / 2);
        resizableElement.domNode.style.left = `${left}px`;
        resizableElement.domNode.style.top = `${top2}px`;
      }
      layout2(true);
    };
    disposables.add(Event2.runAndSubscribe(this.layoutService.onDidLayoutMainContainer, layoutModal));
    disposables.add(editorPart.onDidChangeMaximized(() => layoutModal()));
    disposables.add(editorPart.onDidRequestLayout(() => layoutModal()));
    disposables.add(Event2.runAndSubscribe(modalEditorService.onDidActiveEditorChange, () => {
      const activeEditor = editorPart.activeGroup.activeEditor;
      const editorModalOptions = isModalEditorOptionsProvider(activeEditor) ? activeEditor.getModalEditorOptions() : void 0;
      modalElement.classList.toggle("compact-header", !!editorModalOptions?.compactHeader);
      layoutModal();
    }));
    this.hostService.setWindowDimmed(mainWindow, true);
    disposables.add(toDisposable(() => this.hostService.setWindowDimmed(mainWindow, false)));
    editorPart.activeGroup.focus();
    return {
      part: editorPart,
      instantiationService: scopedInstantiationService,
      disposables
    };
  }
  createSidebar(container3, headerElement, content2, modalContextKeyService, disposables) {
    if (!content2) {
      return void 0;
    }
    let sidebarWidth = content2.sidebarWidth && content2.sidebarWidth > 0 ? content2.sidebarWidth : MODAL_SIDEBAR_DEFAULT_WIDTH;
    let customWidth = content2.sidebarWidth !== void 0 && content2.sidebarWidth > 0;
    let visible = !content2.sidebarHidden;
    const sidebarContainer = append(container3, $("div.modal-editor-sidebar.show-file-icons"));
    sidebarContainer.style.width = `${sidebarWidth}px`;
    setVisibility(visible, sidebarContainer);
    const sidebarContextKeyService = disposables.add(modalContextKeyService.createScoped(sidebarContainer));
    const onDidLayoutEmitter = disposables.add(new Emitter());
    const contentDisposable = disposables.add(new MutableDisposable());
    contentDisposable.value = content2.render(sidebarContainer, onDidLayoutEmitter.event, sidebarContextKeyService);
    const getHeaderHeight = () => headerElement.offsetHeight || MODAL_HEADER_HEIGHT;
    const sash = disposables.add(new Sash(container3, {
      getVerticalSashLeft: () => sidebarWidth,
      getVerticalSashTop: () => getHeaderHeight(),
      getVerticalSashHeight: () => container3.clientHeight - getHeaderHeight()
    }, { orientation: 0 /* VERTICAL */ }));
    if (!visible) {
      sash.state = 0 /* Disabled */;
    }
    const onDidResizeEmitter = disposables.add(new Emitter());
    let sashStartWidth;
    disposables.add(sash.onDidStart(() => sashStartWidth = sidebarWidth));
    disposables.add(sash.onDidEnd(() => sashStartWidth = void 0));
    disposables.add(sash.onDidChange((e) => {
      if (sashStartWidth === void 0) {
        return;
      }
      const delta2 = e.currentX - e.startX;
      const maxWidth = Math.max(MODAL_SIDEBAR_MIN_WIDTH, container3.clientWidth - MODAL_MIN_WIDTH);
      sidebarWidth = Math.min(maxWidth, Math.max(MODAL_SIDEBAR_MIN_WIDTH, sashStartWidth + delta2));
      customWidth = true;
      sidebarContainer.style.width = `${sidebarWidth}px`;
      sash.layout();
      onDidResizeEmitter.fire();
    }));
    disposables.add(sash.onDidReset(() => {
      const maxWidth = Math.max(MODAL_SIDEBAR_MIN_WIDTH, container3.clientWidth - MODAL_MIN_WIDTH);
      sidebarWidth = Math.min(maxWidth, MODAL_SIDEBAR_DEFAULT_WIDTH);
      customWidth = false;
      sidebarContainer.style.width = `${sidebarWidth}px`;
      sash.layout();
      onDidResizeEmitter.fire();
    }));
    return {
      onDidResize: onDidResizeEmitter.event,
      getWidth: () => visible ? sidebarWidth : 0,
      hasCustomWidth: () => customWidth,
      clampWidth: (modalWidth) => {
        if (sidebarWidth + MODAL_MIN_WIDTH > modalWidth) {
          sidebarWidth = Math.min(MODAL_SIDEBAR_DEFAULT_WIDTH, Math.max(MODAL_SIDEBAR_MIN_WIDTH, modalWidth - MODAL_MIN_WIDTH));
          customWidth = false;
          sidebarContainer.style.width = `${sidebarWidth}px`;
          sash.layout();
          onDidResizeEmitter.fire();
        }
      },
      isVisible: () => visible,
      setVisible: (value2) => {
        visible = value2;
        setVisibility(visible, sidebarContainer);
        container3.classList.toggle("has-sidebar", visible);
        sash.state = visible ? 3 /* Enabled */ : 0 /* Disabled */;
        onDidResizeEmitter.fire();
      },
      layout: (height) => {
        if (visible) {
          onDidLayoutEmitter.fire({
            height: height - MODAL_SIDEBAR_PADDING * 2,
            width: sidebarWidth - MODAL_SIDEBAR_PADDING * 2 - MODAL_SIDEBAR_BORDER_RIGHT
          });
        }
        sash.layout();
      },
      updateContent: (newContent) => {
        contentDisposable.clear();
        sidebarContainer.textContent = "";
        contentDisposable.value = newContent.render(sidebarContainer, onDidLayoutEmitter.event, sidebarContextKeyService);
      }
    };
  }
};

ModalEditorPart = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IEditorService),
  __decorateParam(3, IWorkbenchLayoutService),
  __decorateParam(4, IKeybindingService),
  __decorateParam(5, IHostService),
  __decorateParam(6, IConfigurationService),
  __decorateParam(7, IContextMenuService),
  __decorateParam(8, IContextKeyService)
], ModalEditorPart);

var ModalEditorPartImpl = class extends EditorPart {
  constructor(windowId, editorPartsView, modalElement, options3, instantiationService, themeService, configurationService, storageService, layoutService, hostService, modalContextKeyService) {
    const id2 = ModalEditorPartImpl.COUNTER++;
    super(editorPartsView, `workbench.parts.modalEditor.${id2}`, localize(6760, null), windowId, instantiationService, themeService, configurationService, storageService, layoutService, hostService, modalContextKeyService);
    this.modalElement = modalElement;
    this.modalContextKeyService = modalContextKeyService;
    this._onWillClose = this._register(new Emitter());
    this.onWillClose = this._onWillClose.event;
    this._onDidChangeMaximized = this._register(new Emitter());
    this.onDidChangeMaximized = this._onDidChangeMaximized.event;
    this._onDidRequestLayout = this._register(new Emitter());
    this.onDidRequestLayout = this._onDidRequestLayout.event;
    this._onDidChangeNavigation = this._register(new Emitter());
    this.onDidChangeNavigation = this._onDidChangeNavigation.event;
    this._sidebarHidden = false;
    this._hasSidebar = false;
    this._onDidToggleSidebar = this._register(new Emitter());
    this.onDidToggleSidebar = this._onDidToggleSidebar.event;
    this.optionsDisposable = this._register(new MutableDisposable());
    this.previousMainWindowActiveElement = null;
    this._maximized = options3?.maximized ?? false;
    this._size = options3?.size;
    this._position = options3?.position;
    this._navigation = options3?.navigation;
    this._hasSidebar = !!options3?.sidebar;
    this._sidebarHidden = options3?.sidebar?.sidebarHidden ?? false;
    this._sidebarWidth = options3?.sidebar?.sidebarWidth;
    if (this._maximized) {
      this.savedSize = this._size;
      this.savedPosition = this._position;
    }
    this.enforceModalPartOptions();
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(USE_MODAL_EDITOR_SETTING)) {
        this.enforceModalPartOptions();
      }
    }));
  }
  static {
    this.COUNTER = 1;
  }
  get maximized() {
    return this._maximized;
  }
  get size() {
    return this._size;
  }
  set size(value2) {
    this._size = value2;
  }
  get position() {
    return this._position;
  }
  set position(value2) {
    this._position = value2;
  }
  get sidebarWidth() {
    return this._sidebarWidth;
  }
  set sidebarWidth(value2) {
    this._sidebarWidth = value2;
  }
  get sidebarHidden() {
    return this._sidebarHidden;
  }
  set sidebarHidden(value2) {
    this._sidebarHidden = value2;
  }
  get hasSidebar() {
    return this._hasSidebar;
  }
  set hasSidebar(value2) {
    this._hasSidebar = value2;
  }
  get navigation() {
    return this._navigation;
  }
  create(parent, options3) {
    this.previousMainWindowActiveElement = mainWindow.document.activeElement;
    super.create(parent, options3);
  }
  enforceModalPartOptions() {
    const useModalForAll = this.configurationService.getValue(USE_MODAL_EDITOR_SETTING) === "all";
    const editorCount = this.groups.reduce((count2, group2) => count2 + group2.count, 0);
    const showTabs = useModalForAll && editorCount > 1 ? "multiple" : "none";
    this.optionsDisposable.value = this.enforcePartOptions({
      showTabs,
      enablePreview: true,
      closeEmptyGroups: true,
      tabActionCloseVisibility: showTabs !== "none",
      editorActionsLocation: "hidden",
      tabHeight: "default",
      wrapTabs: false,
      allowDropIntoGroup: false
    });
  }
  updateOptions(options3) {
    if (typeof options3?.maximized === "boolean" && options3.maximized !== this._maximized) {
      this.toggleMaximized();
    }
    this._navigation = options3?.navigation;
    this._onDidChangeNavigation.fire(options3?.navigation);
  }
  toggleMaximized() {
    this._maximized = !this._maximized;
    if (this._maximized) {
      this.savedSize = this._size;
      this.savedPosition = this._position;
    } else {
      this._size = this.savedSize;
      this._position = this.savedPosition;
      this.savedSize = void 0;
      this.savedPosition = void 0;
    }
    this._onDidChangeMaximized.fire(this._maximized);
  }
  toggleSidebar() {
    this._sidebarHidden = !this._sidebarHidden;
    this._onDidToggleSidebar.fire();
  }
  handleHeaderDoubleClick() {
    if (this._maximized) {
      this.savedSize = void 0;
      this.savedPosition = void 0;
      this.toggleMaximized();
    } else if (this._size) {
      this._size = void 0;
      this._position = void 0;
      this._onDidRequestLayout.fire();
    } else {
      this.toggleMaximized();
    }
  }
  handleContextKeys() {
    const isModalEditorPartContext = EditorPartModalContext.bindTo(this.modalContextKeyService);
    isModalEditorPartContext.set(true);
    const isMaximizedContext = EditorPartModalMaximizedContext.bindTo(this.modalContextKeyService);
    isMaximizedContext.set(this._maximized);
    this._register(this.onDidChangeMaximized((maximized) => isMaximizedContext.set(maximized)));
    const hasNavigationContext = EditorPartModalNavigationContext.bindTo(this.modalContextKeyService);
    hasNavigationContext.set(!!this._navigation && this._navigation.total > 1);
    this._register(this.onDidChangeNavigation((navigation) => hasNavigationContext.set(!!navigation && navigation.total > 1)));
    const sidebarContext = EditorPartModalSidebarContext.bindTo(this.modalContextKeyService);
    sidebarContext.set(this._hasSidebar);
    const sidebarVisibleContext = EditorPartModalSidebarVisibleContext.bindTo(this.modalContextKeyService);
    sidebarVisibleContext.set(this._hasSidebar && !this._sidebarHidden);
    this._register(this.onDidToggleSidebar(() => sidebarVisibleContext.set(this._hasSidebar && !this._sidebarHidden)));
    super.handleContextKeys();
  }
  removeGroup(group2, preserveFocus) {
    const groupView = this.assertGroupView(group2);
    if (this.count === 1 && this.activeGroup === groupView) {
      this.doRemoveLastGroup();
    } else {
      super.removeGroup(group2, preserveFocus);
    }
  }
  doRemoveLastGroup() {
    const activeMainGroup = this.editorPartsView.mainPart.activeGroup;
    this.editorPartsView.mainPart.activateGroup(activeMainGroup, void 0, 1 /* PART_CLOSE */);
    const mainEditorPartContainer = this.layoutService.getContainer(mainWindow, "workbench.parts.editor" /* EDITOR_PART */);
    if (!isHTMLElement(this.previousMainWindowActiveElement) || // invalid previous element
    !this.previousMainWindowActiveElement.isConnected || // previous element no longer in the DOM
    mainEditorPartContainer?.contains(this.previousMainWindowActiveElement)) {
      activeMainGroup.focus();
    } else {
      this.previousMainWindowActiveElement.focus();
    }
    this._onWillClose.fire();
  }
  saveState() {
    return;
  }
  async close(options3) {
    if (options3?.mergeAllEditorsToMainPart) {
      const result = this.mergeGroupsToMainPart();
      if (!result) {
        return false;
      }
    } else {
      for (const group2 of this.groups) {
        const closed = await group2.closeAllEditors();
        if (!closed) {
          return false;
        }
      }
    }
    this._onWillClose.fire();
    return true;
  }
  mergeGroupsToMainPart() {
    if (!this.groups.some((group2) => group2.count > 0)) {
      return true;
    }
    let targetGroup = void 0;
    for (const group2 of this.editorPartsView.mainPart.getGroups(1 /* MOST_RECENTLY_ACTIVE */)) {
      if (!group2.isLocked) {
        targetGroup = group2;
        break;
      }
    }
    if (!targetGroup) {
      targetGroup = this.editorPartsView.mainPart.addGroup(this.editorPartsView.mainPart.activeGroup, this.partOptions.openSideBySideDirection === "right" ? 3 /* RIGHT */ : 1 /* DOWN */);
    }
    const result = this.mergeAllGroups(targetGroup, {
      // Try to reduce the impact of closing the modal
      // as much as possible by not changing existing editors
      // in the main window.
      preserveExistingIndex: true
    });
    targetGroup.focus();
    return result;
  }
  dispose() {
    this._navigation = void 0;
    super.dispose();
  }
};

ModalEditorPartImpl = __decorateClass([
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IThemeService),
  __decorateParam(6, IConfigurationService),
  __decorateParam(7, IStorageService),
  __decorateParam(8, IWorkbenchLayoutService),
  __decorateParam(9, IHostService),
  __decorateParam(10, IContextKeyService)
], ModalEditorPartImpl);
export { MODAL_MIN_WIDTH, MODAL_MIN_HEIGHT, MODAL_MAX_DEFAULT_WIDTH, MODAL_MAX_DEFAULT_HEIGHT, MODAL_BORDER_WIDTH, MODAL_BORDER_SIZE, MODAL_HEADER_HEIGHT, MODAL_SNAP_THRESHOLD, MODAL_MAXIMIZED_PADDING, MODAL_SIDEBAR_MIN_WIDTH, MODAL_SIDEBAR_DEFAULT_WIDTH, MODAL_SIDEBAR_PADDING, MODAL_SIDEBAR_BORDER_RIGHT, defaultModalEditorAllowableCommands, ModalEditorPart, ModalEditorPartImpl };
