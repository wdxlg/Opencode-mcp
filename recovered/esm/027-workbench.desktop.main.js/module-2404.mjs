// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/debug/browser/breakpointsView.ts
import { $, addDisposableListener, addStandardDisposableListener, append, hide, isEditableElement, isMouseEvent, show } from "./module-0075.mjs";
import { Checkbox, TriStateCheckbox } from "./module-0549.mjs";
import { defaultCheckboxStyles, defaultInputBoxStyles } from "./module-0513.mjs";
import { Breakpoint2, DataBreakpoint2, ExceptionBreakpoint, FunctionBreakpoint2, InstructionBreakpoint } from "./module-1064.mjs";
import { ViewAction, ViewPane } from "./module-1335.mjs";
import { Action2, IMenuService, MenuId, registerAction2 } from "./module-0092.mjs";
import { BREAKPOINTS_VIEW_ID, BREAKPOINT_EDITOR_CONTRIBUTION_ID, CONTEXT_BREAKPOINTS_EXIST, CONTEXT_BREAKPOINTS_FOCUSED, CONTEXT_BREAKPOINT_HAS_MODES, CONTEXT_BREAKPOINT_INPUT_FOCUSED, CONTEXT_BREAKPOINT_ITEM_IS_DATA_BYTES, CONTEXT_BREAKPOINT_ITEM_TYPE, CONTEXT_BREAKPOINT_SUPPORTS_CONDITION, CONTEXT_DEBUGGERS_AVAILABLE, CONTEXT_IN_DEBUG_MODE, CONTEXT_SET_DATA_BREAKPOINT_BYTES_SUPPORTED, DEBUG_SCHEME, IDebugService } from "./module-1057.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { WorkbenchCompressibleObjectTree } from "./module-0636.mjs";
import { basenameOrAuthority, dirname2 } from "./module-0034.mjs";
import { DisassemblyViewInput } from "./module-1062.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { IconLabel } from "./module-0640.mjs";
import { getActionBarActions, getContextMenuActions } from "./module-0516.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { equals } from "./module-0007.mjs";
import { URI } from "./module-0032.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextMenuService, IContextViewService } from "./module-0488.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IThemeService } from "./module-0287.mjs";
import { ACTIVE_GROUP, IEditorService, SIDE_GROUP } from "./module-0934.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IViewDescriptorService } from "./module-1093.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IHoverService } from "./module-0520.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { DisposableStore, dispose, toDisposable } from "./module-0012.mjs";
import { ActionBar } from "./module-0477.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { Action } from "./module-0082.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { InputBox } from "./module-0600.mjs";
import { breakpoint, breakpointsActivate, breakpointsRemoveAll, breakpointsViewIcon, conditionalBreakpoint, dataBreakpoint, debugBreakpointUnsupported, functionBreakpoint, logBreakpoint, watchExpressionsAddDataBreakpoint, watchExpressionsAddFuncBreakpoint } from "./module-1891.mjs";
import { IViewsService } from "./module-1246.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { INotificationService } from "./module-0336.mjs";
import { hasKey } from "./module-0010.mjs";
import { isCodeEditor } from "./module-0223.mjs";


// src/vs/workbench/contrib/debug/browser/breakpointsView.ts
var $60 = $;

function createCheckbox(disposables) {
  const checkbox = new Checkbox("", false, defaultCheckboxStyles);
  checkbox.domNode.tabIndex = -1;
  disposables.add(checkbox);
  return checkbox;
}

var MAX_VISIBLE_BREAKPOINTS = 9;

var BreakpointsFolderItem = class {
  constructor(uri5, breakpoints) {
    this.uri = uri5;
    this.breakpoints = breakpoints;
  }
  getId() {
    return this.uri.toString();
  }
  get enabled() {
    return this.breakpoints.every((bp) => bp.enabled);
  }
  get indeterminate() {
    const enabledCount = this.breakpoints.filter((bp) => bp.enabled).length;
    return enabledCount > 0 && enabledCount < this.breakpoints.length;
  }
};

function getModeKindForBreakpoint(breakpoint2) {
  const kind = breakpoint2 instanceof Breakpoint2 ? "source" : breakpoint2 instanceof InstructionBreakpoint ? "instruction" : "exception";
  return kind;
}

var BreakpointsView = class extends ViewPane {
  constructor(options3, contextMenuService, debugService, keybindingService, instantiationService, themeService, editorService, contextViewService, configurationService, viewDescriptorService, contextKeyService, openerService, labelService, menuService, hoverService, languageService) {
    super(options3, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService);
    this.debugService = debugService;
    this.editorService = editorService;
    this.contextViewService = contextViewService;
    this.labelService = labelService;
    this.languageService = languageService;
    this.needsRefresh = false;
    this.needsStateChange = false;
    this.ignoreLayout = false;
    this.collapsedState = /* @__PURE__ */ new Set();
    this.menu = menuService.createMenu(MenuId.DebugBreakpointsContext, contextKeyService);
    this._register(this.menu);
    this.breakpointItemType = CONTEXT_BREAKPOINT_ITEM_TYPE.bindTo(contextKeyService);
    this.breakpointIsDataBytes = CONTEXT_BREAKPOINT_ITEM_IS_DATA_BYTES.bindTo(contextKeyService);
    this.breakpointHasMultipleModes = CONTEXT_BREAKPOINT_HAS_MODES.bindTo(contextKeyService);
    this.breakpointSupportsCondition = CONTEXT_BREAKPOINT_SUPPORTS_CONDITION.bindTo(contextKeyService);
    this.breakpointInputFocused = CONTEXT_BREAKPOINT_INPUT_FOCUSED.bindTo(contextKeyService);
    this._register(this.debugService.getModel().onDidChangeBreakpoints(() => this.onBreakpointsChange()));
    this._register(this.debugService.getViewModel().onDidFocusSession(() => this.onBreakpointsChange()));
    this._register(this.debugService.onDidChangeState(() => this.onStateChange()));
    this.hintDelayer = this._register(new RunOnceScheduler(() => this.updateBreakpointsHint(true), 4e3));
  }
  getPresentation() {
    return this.configurationService.getValue("debug.breakpointsView.presentation");
  }
  renderBody(container3) {
    super.renderBody(container3);
    this.element.classList.add("debug-pane");
    container3.classList.add("debug-breakpoints");
    this.tree = this.instantiationService.createInstance(
      WorkbenchCompressibleObjectTree,
      "BreakpointsView",
      container3,
      new BreakpointsDelegate(this),
      [
        this.instantiationService.createInstance(BreakpointsFolderRenderer),
        this.instantiationService.createInstance(BreakpointsRenderer, this.menu, this.breakpointHasMultipleModes, this.breakpointSupportsCondition, this.breakpointItemType),
        new ExceptionBreakpointsRenderer(this.menu, this.breakpointHasMultipleModes, this.breakpointSupportsCondition, this.breakpointItemType, this.debugService, this.hoverService),
        new ExceptionBreakpointInputRenderer(this, this.debugService, this.contextViewService),
        this.instantiationService.createInstance(FunctionBreakpointsRenderer, this.menu, this.breakpointSupportsCondition, this.breakpointItemType),
        new FunctionBreakpointInputRenderer(this, this.debugService, this.contextViewService, this.hoverService, this.labelService),
        this.instantiationService.createInstance(DataBreakpointsRenderer, this.menu, this.breakpointHasMultipleModes, this.breakpointSupportsCondition, this.breakpointItemType, this.breakpointIsDataBytes),
        new DataBreakpointInputRenderer(this, this.debugService, this.contextViewService, this.hoverService, this.labelService),
        this.instantiationService.createInstance(InstructionBreakpointsRenderer)
      ],
      {
        compressionEnabled: this.getPresentation() === "tree",
        hideTwistiesOfChildlessElements: true,
        identityProvider: {
          getId: (element) => element.getId()
        },
        keyboardNavigationLabelProvider: {
          getKeyboardNavigationLabel: (element) => {
            if (element instanceof BreakpointsFolderItem) {
              return basenameOrAuthority(element.uri);
            }
            if (element instanceof Breakpoint2) {
              return `${basenameOrAuthority(element.uri)}:${element.lineNumber}`;
            }
            if (element instanceof FunctionBreakpoint2) {
              return element.name;
            }
            if (element instanceof DataBreakpoint2) {
              return element.description;
            }
            if (element instanceof ExceptionBreakpoint) {
              return element.label || element.filter;
            }
            if (element instanceof InstructionBreakpoint) {
              return `0x${element.address.toString(16)}`;
            }
            return "";
          },
          getCompressedNodeKeyboardNavigationLabel: (elements) => {
            return elements.map((e) => {
              if (e instanceof BreakpointsFolderItem) {
                return basenameOrAuthority(e.uri);
              }
              return "";
            }).join("/");
          }
        },
        accessibilityProvider: new BreakpointsAccessibilityProvider(this.debugService, this.labelService),
        multipleSelectionSupport: false,
        overrideStyles: this.getLocationBasedColors().listOverrideStyles
      }
    );
    this._register(this.tree);
    CONTEXT_BREAKPOINTS_FOCUSED.bindTo(this.tree.contextKeyService);
    this._register(this.tree.onContextMenu(this.onTreeContextMenu, this));
    this._register(this.tree.onMouseMiddleClick(async ({ element }) => {
      if (element instanceof Breakpoint2) {
        await this.debugService.removeBreakpoints(element.getId());
      } else if (element instanceof FunctionBreakpoint2) {
        await this.debugService.removeFunctionBreakpoints(element.getId());
      } else if (element instanceof DataBreakpoint2) {
        await this.debugService.removeDataBreakpoints(element.getId());
      } else if (element instanceof InstructionBreakpoint) {
        await this.debugService.removeInstructionBreakpoints(element.instructionReference, element.offset);
      } else if (element instanceof BreakpointsFolderItem) {
        await this.debugService.removeBreakpoints(element.breakpoints.map((bp) => bp.getId()));
      }
    }));
    this._register(this.tree.onDidOpen(async (e) => {
      const element = e.element;
      if (!element) {
        return;
      }
      if (isMouseEvent(e.browserEvent) && e.browserEvent.button === 1) {
        return;
      }
      if (element instanceof Breakpoint2) {
        openBreakpointSource(element, e.sideBySide, e.editorOptions.preserveFocus || false, e.editorOptions.pinned || !e.editorOptions.preserveFocus, this.debugService, this.editorService);
      }
      if (element instanceof InstructionBreakpoint) {
        const disassemblyView = await this.editorService.openEditor(DisassemblyViewInput.instance);
        disassemblyView.goToInstructionAndOffset(element.instructionReference, element.offset, isMouseEvent(e.browserEvent) && e.browserEvent.detail === 2);
      }
      if (isMouseEvent(e.browserEvent) && e.browserEvent.detail === 2 && element instanceof FunctionBreakpoint2 && element !== this.inputBoxData?.breakpoint) {
        this.renderInputBox({ breakpoint: element, type: "name" });
      }
    }));
    this._register(this.tree.onKeyDown((e) => {
      const event = new StandardKeyboardEvent(e);
      if (event.equals(10 /* Space */) && !isEditableElement(e.target)) {
        const focused = this.tree.getFocus();
        if (focused.length > 0) {
          const element = focused[0];
          if (element && !(element instanceof BreakpointsFolderItem)) {
            this.debugService.enableOrDisableBreakpoints(!element.enabled, element);
            event.preventDefault();
            event.stopPropagation();
          }
        }
      }
    }));
    this._register(this.tree.onDidChangeCollapseState((e) => {
      const element = e.node.element;
      if (element instanceof BreakpointsFolderItem) {
        if (e.node.collapsed) {
          this.collapsedState.add(element.getId());
        } else {
          this.collapsedState.delete(element.getId());
        }
        this.updateSize();
      }
    }));
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("debug.breakpointsView.presentation")) {
        const presentation2 = this.getPresentation();
        this.tree.updateOptions({ compressionEnabled: presentation2 === "tree" });
        this.onBreakpointsChange();
      }
    }));
    this.setTreeInput();
    this._register(this.onDidChangeBodyVisibility((visible) => {
      if (visible) {
        if (this.needsRefresh) {
          this.onBreakpointsChange();
        }
        if (this.needsStateChange) {
          this.onStateChange();
        }
      }
    }));
    const containerModel = this.viewDescriptorService.getViewContainerModel(this.viewDescriptorService.getViewContainerByViewId(this.id));
    this._register(containerModel.onDidChangeAllViewDescriptors(() => {
      this.updateSize();
    }));
  }
  renderHeaderTitle(container3, title) {
    super.renderHeaderTitle(container3, title);
    const iconLabelContainer = append(container3, $60("span.breakpoint-warning"));
    this.hintContainer = this._register(new IconLabel(iconLabelContainer, {
      supportIcons: true,
      hoverDelegate: {
        showHover: (options3, focus) => this.hoverService.showInstantHover({ content: options3.content, target: this.hintContainer.element }, focus),
        delay: this.configurationService.getValue("workbench.hover.delay")
      }
    }));
    hide(this.hintContainer.element);
  }
  focus() {
    super.focus();
    this.tree?.domFocus();
  }
  renderInputBox(data) {
    this._inputBoxData = data;
    this.onBreakpointsChange();
    this._inputBoxData = void 0;
  }
  get inputBoxData() {
    return this._inputBoxData;
  }
  layoutBody(height, width2) {
    if (this.ignoreLayout) {
      return;
    }
    super.layoutBody(height, width2);
    this.tree?.layout(height, width2);
    try {
      this.ignoreLayout = true;
      this.updateSize();
    } finally {
      this.ignoreLayout = false;
    }
  }
  onTreeContextMenu(e) {
    const element = e.element;
    if (element instanceof BreakpointsFolderItem) {
      this.breakpointItemType.set("breakpointFolder");
      const { secondary: secondary2 } = getContextMenuActions(this.menu.getActions({ arg: element, shouldForwardArgs: false }), "inline");
      this.contextMenuService.showContextMenu({
        getAnchor: () => e.anchor,
        getActions: () => secondary2,
        getActionsContext: () => element
      });
      return;
    }
    const type = element instanceof Breakpoint2 ? "breakpoint" : element instanceof ExceptionBreakpoint ? "exceptionBreakpoint" : element instanceof FunctionBreakpoint2 ? "functionBreakpoint" : element instanceof DataBreakpoint2 ? "dataBreakpoint" : element instanceof InstructionBreakpoint ? "instructionBreakpoint" : void 0;
    this.breakpointItemType.set(type);
    const session = this.debugService.getViewModel().focusedSession;
    const conditionSupported = element instanceof ExceptionBreakpoint ? element.supportsCondition : !session || !!session.capabilities.supportsConditionalBreakpoints;
    this.breakpointSupportsCondition.set(conditionSupported);
    this.breakpointIsDataBytes.set(element instanceof DataBreakpoint2 && element.src.type === 1 /* Address */);
    this.breakpointHasMultipleModes.set(this.debugService.getModel().getBreakpointModes(getModeKindForBreakpoint(element)).length > 1);
    const { secondary } = getContextMenuActions(this.menu.getActions({ arg: e.element, shouldForwardArgs: false }), "inline");
    this.contextMenuService.showContextMenu({
      getAnchor: () => e.anchor,
      getActions: () => secondary,
      getActionsContext: () => element
    });
  }
  updateSize() {
    const containerModel = this.viewDescriptorService.getViewContainerModel(this.viewDescriptorService.getViewContainerByViewId(this.id));
    const rowHeight = 22;
    this.minimumBodySize = this.orientation === 0 /* VERTICAL */ ? Math.min(MAX_VISIBLE_BREAKPOINTS * rowHeight, this.tree.contentHeight) : 170;
    this.maximumBodySize = this.orientation === 0 /* VERTICAL */ && containerModel.visibleViewDescriptors.length > 1 ? this.tree.contentHeight : Number.POSITIVE_INFINITY;
  }
  updateBreakpointsHint(delayed = false) {
    if (!this.hintContainer) {
      return;
    }
    const currentType = this.debugService.getViewModel().focusedSession?.configuration.type;
    const dbg = currentType ? this.debugService.getAdapterManager().getDebugger(currentType) : void 0;
    const message = dbg?.strings?.["unverifiedBreakpoints" /* UnverifiedBreakpoints */];
    const debuggerHasUnverifiedBps = message && this.debugService.getModel().getBreakpoints().filter((bp) => {
      if (bp.verified || !bp.enabled) {
        return false;
      }
      const langId = this.languageService.guessLanguageIdByFilepathOrFirstLine(bp.uri);
      return langId && dbg.interestedInLanguage(langId);
    });
    if (message && debuggerHasUnverifiedBps?.length && this.debugService.getModel().areBreakpointsActivated()) {
      if (delayed) {
        const mdown = new MarkdownString(void 0, { isTrusted: true }).appendMarkdown(message);
        this.hintContainer.setLabel("$(warning)", void 0, { title: { markdown: mdown, markdownNotSupportedFallback: message } });
        show(this.hintContainer.element);
      } else {
        this.hintDelayer.schedule();
      }
    } else {
      hide(this.hintContainer.element);
    }
  }
  onBreakpointsChange() {
    if (this.isBodyVisible()) {
      if (this.tree) {
        this.setTreeInput();
        this.needsRefresh = false;
      }
      this.updateBreakpointsHint();
      this.updateSize();
    } else {
      this.needsRefresh = true;
    }
  }
  onStateChange() {
    if (this.isBodyVisible()) {
      this.needsStateChange = false;
      const thread = this.debugService.getViewModel().focusedThread;
      let found = false;
      if (thread && thread.stoppedDetails && thread.stoppedDetails.hitBreakpointIds && thread.stoppedDetails.hitBreakpointIds.length > 0) {
        const hitBreakpointIds = thread.stoppedDetails.hitBreakpointIds;
        const elements = this.flatElements;
        const hitElement = elements.find((e) => {
          const id2 = e.getIdFromAdapter(thread.session.getId());
          return typeof id2 === "number" && hitBreakpointIds.indexOf(id2) !== -1;
        });
        if (hitElement) {
          this.tree.setFocus([hitElement]);
          this.tree.setSelection([hitElement]);
          found = true;
          this.autoFocusedElement = hitElement;
        }
      }
      if (!found) {
        const focus = this.tree.getFocus();
        const selection = this.tree.getSelection();
        if (this.autoFocusedElement && equals(focus, selection) && selection.includes(this.autoFocusedElement)) {
          this.tree.setFocus([]);
          this.tree.setSelection([]);
        }
        this.autoFocusedElement = void 0;
      }
      this.updateBreakpointsHint();
    } else {
      this.needsStateChange = true;
    }
  }
  setTreeInput() {
    const treeInput = this.getTreeElements();
    this.tree.setChildren(null, treeInput);
  }
  getTreeElements() {
    const model = this.debugService.getModel();
    const sessionId = this.debugService.getViewModel().focusedSession?.getId();
    const showAsTree = this.getPresentation() === "tree";
    const result = [];
    for (const exBp of model.getExceptionBreakpointsForSession(sessionId)) {
      result.push({ element: exBp, incompressible: true });
    }
    for (const funcBp of model.getFunctionBreakpoints()) {
      result.push({ element: funcBp, incompressible: true });
    }
    for (const dataBp of model.getDataBreakpoints()) {
      result.push({ element: dataBp, incompressible: true });
    }
    const sourceBreakpoints = model.getBreakpoints();
    if (showAsTree && sourceBreakpoints.length > 0) {
      const breakpointsByUri = /* @__PURE__ */ new Map();
      for (const bp of sourceBreakpoints) {
        const key3 = bp.uri.toString();
        if (!breakpointsByUri.has(key3)) {
          breakpointsByUri.set(key3, []);
        }
        breakpointsByUri.get(key3).push(bp);
      }
      for (const [uriStr, breakpoints] of breakpointsByUri) {
        const uri5 = URI.parse(uriStr);
        const folderItem = new BreakpointsFolderItem(uri5, breakpoints);
        breakpoints.sort((a, b) => a.lineNumber - b.lineNumber);
        const children = breakpoints.map((bp) => ({
          element: bp,
          incompressible: false
        }));
        result.push({
          element: folderItem,
          incompressible: false,
          collapsed: this.collapsedState.has(folderItem.getId()),
          children
        });
      }
    } else {
      for (const bp of sourceBreakpoints) {
        result.push({ element: bp, incompressible: true });
      }
    }
    for (const instrBp of model.getInstructionBreakpoints()) {
      result.push({ element: instrBp, incompressible: true });
    }
    return result;
  }
  get flatElements() {
    const model = this.debugService.getModel();
    const sessionId = this.debugService.getViewModel().focusedSession?.getId();
    const elements = model.getExceptionBreakpointsForSession(sessionId).concat(model.getFunctionBreakpoints()).concat(model.getDataBreakpoints()).concat(model.getBreakpoints()).concat(model.getInstructionBreakpoints());
    return elements;
  }
};

BreakpointsView = __decorateClass([
  __decorateParam(1, IContextMenuService),
  __decorateParam(2, IDebugService),
  __decorateParam(3, IKeybindingService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IThemeService),
  __decorateParam(6, IEditorService),
  __decorateParam(7, IContextViewService),
  __decorateParam(8, IConfigurationService),
  __decorateParam(9, IViewDescriptorService),
  __decorateParam(10, IContextKeyService),
  __decorateParam(11, IOpenerService),
  __decorateParam(12, ILabelService),
  __decorateParam(13, IMenuService),
  __decorateParam(14, IHoverService),
  __decorateParam(15, ILanguageService)
], BreakpointsView);

var BreakpointsDelegate = class {
  constructor(view) {
    this.view = view;
  }
  getHeight(_element) {
    return 22;
  }
  getTemplateId(element) {
    if (element instanceof BreakpointsFolderItem) {
      return BreakpointsFolderRenderer.ID;
    }
    if (element instanceof Breakpoint2) {
      return BreakpointsRenderer.ID;
    }
    if (element instanceof FunctionBreakpoint2) {
      const inputBoxBreakpoint = this.view.inputBoxData?.breakpoint;
      if (!element.name || inputBoxBreakpoint && inputBoxBreakpoint.getId() === element.getId()) {
        return FunctionBreakpointInputRenderer.ID;
      }
      return FunctionBreakpointsRenderer.ID;
    }
    if (element instanceof ExceptionBreakpoint) {
      const inputBoxBreakpoint = this.view.inputBoxData?.breakpoint;
      if (inputBoxBreakpoint && inputBoxBreakpoint.getId() === element.getId()) {
        return ExceptionBreakpointInputRenderer.ID;
      }
      return ExceptionBreakpointsRenderer.ID;
    }
    if (element instanceof DataBreakpoint2) {
      const inputBoxBreakpoint = this.view.inputBoxData?.breakpoint;
      if (inputBoxBreakpoint && inputBoxBreakpoint.getId() === element.getId()) {
        return DataBreakpointInputRenderer.ID;
      }
      return DataBreakpointsRenderer.ID;
    }
    if (element instanceof InstructionBreakpoint) {
      return InstructionBreakpointsRenderer.ID;
    }
    return "";
  }
};

var breakpointIdToActionBarDomeNode = /* @__PURE__ */ new Map();

var BreakpointsFolderRenderer = class {
  constructor(debugService, labelService, hoverService) {
    this.debugService = debugService;
    this.labelService = labelService;
    this.hoverService = hoverService;
  }
  static {
    this.ID = "breakpointFolder";
  }
  get templateId() {
    return BreakpointsFolderRenderer.ID;
  }
  renderTemplate(container3) {
    const data = /* @__PURE__ */ Object.create(null);
    data.elementDisposables = new DisposableStore();
    data.templateDisposables = new DisposableStore();
    data.templateDisposables.add(data.elementDisposables);
    data.container = container3;
    container3.classList.add("breakpoint", "breakpoint-folder");
    data.templateDisposables.add(toDisposable(() => {
      container3.classList.remove("breakpoint", "breakpoint-folder");
    }));
    data.checkbox = new TriStateCheckbox("", false, defaultCheckboxStyles);
    data.checkbox.domNode.tabIndex = -1;
    data.templateDisposables.add(data.checkbox);
    data.templateDisposables.add(data.checkbox.onChange(() => {
      const checked = data.checkbox.checked;
      const enabled = checked === "mixed" ? true : checked;
      for (const bp of data.context.breakpoints) {
        this.debugService.enableOrDisableBreakpoints(enabled, bp);
      }
    }));
    append(data.container, data.checkbox.domNode);
    data.name = append(data.container, $60("span.name"));
    append(data.container, $60("span.file-path"));
    data.actionBar = new ActionBar(data.container);
    data.templateDisposables.add(data.actionBar);
    return data;
  }
  renderElement(node, _index, data) {
    const folderItem = node.element;
    data.context = folderItem;
    data.name.textContent = this.labelService.getUriBasenameLabel(folderItem.uri);
    data.container.classList.toggle("disabled", !this.debugService.getModel().areBreakpointsActivated());
    const fullPath = this.labelService.getUriLabel(folderItem.uri, { relative: true });
    data.elementDisposables.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), data.container, fullPath));
    if (folderItem.indeterminate) {
      data.checkbox.checked = "mixed";
    } else {
      data.checkbox.checked = folderItem.enabled;
    }
    data.actionBar.clear();
    const removeAction = data.elementDisposables.add(new Action(
      "debug.removeBreakpointsInFile",
      localize(14202, null),
      ThemeIcon.asClassName(Codicon.close),
      true,
      async () => {
        for (const bp of folderItem.breakpoints) {
          await this.debugService.removeBreakpoints(bp.getId());
        }
      }
    ));
    data.actionBar.push(removeAction, { icon: true, label: false });
  }
  renderCompressedElements(node, _index, data) {
    const elements = node.element.elements;
    const folderItem = elements[elements.length - 1];
    data.context = folderItem;
    const names = elements.map((e) => basenameOrAuthority(e.uri));
    data.name.textContent = names.join("/");
    const fullPath = this.labelService.getUriLabel(folderItem.uri, { relative: true });
    data.elementDisposables.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), data.container, fullPath));
    if (folderItem.indeterminate) {
      data.checkbox.checked = "mixed";
    } else {
      data.checkbox.checked = folderItem.enabled;
    }
    data.actionBar.clear();
    const removeAction = data.elementDisposables.add(new Action(
      "debug.removeBreakpointsInFile",
      localize(14202, null),
      ThemeIcon.asClassName(Codicon.close),
      true,
      async () => {
        for (const bp of folderItem.breakpoints) {
          await this.debugService.removeBreakpoints(bp.getId());
        }
      }
    ));
    data.actionBar.push(removeAction, { icon: true, label: false });
  }
  disposeElement(element, index2, templateData) {
    templateData.elementDisposables.clear();
  }
  disposeCompressedElements(node, index2, templateData) {
    templateData.elementDisposables.clear();
  }
  disposeTemplate(templateData) {
    templateData.templateDisposables.dispose();
  }
};

BreakpointsFolderRenderer = __decorateClass([
  __decorateParam(0, IDebugService),
  __decorateParam(1, ILabelService),
  __decorateParam(2, IHoverService)
], BreakpointsFolderRenderer);

var BreakpointsRenderer = class {
  constructor(menu, breakpointHasMultipleModes, breakpointSupportsCondition, breakpointItemType, debugService, hoverService, labelService, textModelService) {
    this.menu = menu;
    this.breakpointHasMultipleModes = breakpointHasMultipleModes;
    this.breakpointSupportsCondition = breakpointSupportsCondition;
    this.breakpointItemType = breakpointItemType;
    this.debugService = debugService;
    this.hoverService = hoverService;
    this.labelService = labelService;
    this.textModelService = textModelService;
  }
  static {
    this.ID = "breakpoints";
  }
  get templateId() {
    return BreakpointsRenderer.ID;
  }
  renderTemplate(container3) {
    const data = /* @__PURE__ */ Object.create(null);
    data.elementDisposables = new DisposableStore();
    data.templateDisposables = new DisposableStore();
    data.templateDisposables.add(data.elementDisposables);
    data.breakpoint = container3;
    container3.classList.add("breakpoint");
    data.templateDisposables.add(toDisposable(() => {
      container3.classList.remove("breakpoint");
    }));
    data.icon = $60(".icon");
    data.checkbox = createCheckbox(data.templateDisposables);
    data.templateDisposables.add(data.checkbox.onChange(() => {
      this.debugService.enableOrDisableBreakpoints(!data.context.enabled, data.context);
    }));
    append(data.breakpoint, data.icon);
    append(data.breakpoint, data.checkbox.domNode);
    data.name = append(data.breakpoint, $60("span.name"));
    data.filePath = append(data.breakpoint, $60("span.file-path"));
    data.actionBar = new ActionBar(data.breakpoint);
    data.templateDisposables.add(data.actionBar);
    const badgeContainer = append(data.breakpoint, $60(".badge-container"));
    data.badge = append(badgeContainer, $60("span.line-number.monaco-count-badge"));
    return data;
  }
  renderElement(node, index2, data) {
    const breakpoint2 = node.element;
    data.context = breakpoint2;
    if (node.depth > 1) {
      this.renderBreakpointLineLabel(breakpoint2, data);
    } else {
      this.renderBreakpointFileLabel(breakpoint2, data);
    }
    this.renderBreakpointCommon(breakpoint2, data);
  }
  renderCompressedElements(node, index2, data) {
    const breakpoint2 = node.element.elements[node.element.elements.length - 1];
    data.context = breakpoint2;
    this.renderBreakpointFileLabel(breakpoint2, data);
    this.renderBreakpointCommon(breakpoint2, data);
  }
  renderBreakpointCommon(breakpoint2, data) {
    data.breakpoint.classList.toggle("disabled", !this.debugService.getModel().areBreakpointsActivated());
    let badgeContent = breakpoint2.lineNumber.toString();
    if (breakpoint2.column) {
      badgeContent += `:${breakpoint2.column}`;
    }
    if (breakpoint2.modeLabel) {
      badgeContent = `${breakpoint2.modeLabel}: ${badgeContent}`;
    }
    data.badge.textContent = badgeContent;
    data.checkbox.checked = breakpoint2.enabled;
    const { message, icon: icon2 } = getBreakpointMessageAndIcon(this.debugService.state, this.debugService.getModel().areBreakpointsActivated(), breakpoint2, this.labelService, this.debugService.getModel());
    data.icon.className = ThemeIcon.asClassName(icon2);
    data.elementDisposables.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), data.breakpoint, breakpoint2.message || message || ""));
    const debugActive = this.debugService.state === 3 /* Running */ || this.debugService.state === 2 /* Stopped */;
    if (debugActive && !breakpoint2.verified) {
      data.breakpoint.classList.add("disabled");
    }
    const session = this.debugService.getViewModel().focusedSession;
    this.breakpointSupportsCondition.set(!session || !!session.capabilities.supportsConditionalBreakpoints);
    this.breakpointItemType.set("breakpoint");
    this.breakpointHasMultipleModes.set(this.debugService.getModel().getBreakpointModes("source").length > 1);
    const { primary } = getActionBarActions(this.menu.getActions({ arg: breakpoint2, shouldForwardArgs: true }), "inline");
    data.actionBar.clear();
    data.actionBar.push(primary, { icon: true, label: false });
    breakpointIdToActionBarDomeNode.set(breakpoint2.getId(), data.actionBar.domNode);
  }
  renderBreakpointFileLabel(breakpoint2, data) {
    data.name.textContent = basenameOrAuthority(breakpoint2.uri);
    data.filePath.textContent = this.labelService.getUriLabel(dirname2(breakpoint2.uri), { relative: true });
  }
  renderBreakpointLineLabel(breakpoint2, data) {
    data.name.textContent = localize(14191, null);
    data.filePath.textContent = "";
    this.textModelService.createModelReference(breakpoint2.uri).then((reference) => {
      if (data.context !== breakpoint2) {
        reference.dispose();
        return;
      }
      data.elementDisposables.add(reference);
      const model = reference.object.textEditorModel;
      if (model && breakpoint2.lineNumber <= model.getLineCount()) {
        const lineContent = model.getLineContent(breakpoint2.lineNumber).trim();
        data.name.textContent = lineContent || localize(14170, null);
      } else {
        data.name.textContent = localize(14190, null);
      }
    }).catch(() => {
      if (data.context === breakpoint2) {
        data.name.textContent = localize(14146, null);
      }
    });
  }
  disposeElement(node, index2, template2) {
    template2.elementDisposables.clear();
  }
  disposeCompressedElements(node, index2, template2) {
    template2.elementDisposables.clear();
  }
  disposeTemplate(templateData) {
    templateData.templateDisposables.dispose();
  }
};

BreakpointsRenderer = __decorateClass([
  __decorateParam(4, IDebugService),
  __decorateParam(5, IHoverService),
  __decorateParam(6, ILabelService),
  __decorateParam(7, ITextModelService)
], BreakpointsRenderer);

var ExceptionBreakpointsRenderer = class _ExceptionBreakpointsRenderer {
  constructor(menu, breakpointHasMultipleModes, breakpointSupportsCondition, breakpointItemType, debugService, hoverService) {
    this.menu = menu;
    this.breakpointHasMultipleModes = breakpointHasMultipleModes;
    this.breakpointSupportsCondition = breakpointSupportsCondition;
    this.breakpointItemType = breakpointItemType;
    this.debugService = debugService;
    this.hoverService = hoverService;
  }
  static {
    this.ID = "exceptionbreakpoints";
  }
  get templateId() {
    return _ExceptionBreakpointsRenderer.ID;
  }
  renderTemplate(container3) {
    const data = /* @__PURE__ */ Object.create(null);
    data.elementDisposables = new DisposableStore();
    data.templateDisposables = new DisposableStore();
    data.templateDisposables.add(data.elementDisposables);
    data.breakpoint = append(container3, $60(".breakpoint"));
    data.checkbox = createCheckbox(data.templateDisposables);
    data.templateDisposables.add(data.checkbox.onChange(() => {
      this.debugService.enableOrDisableBreakpoints(!data.context.enabled, data.context);
    }));
    append(data.breakpoint, data.checkbox.domNode);
    data.name = append(data.breakpoint, $60("span.name"));
    data.condition = append(data.breakpoint, $60("span.condition"));
    data.breakpoint.classList.add("exception");
    data.actionBar = new ActionBar(data.breakpoint);
    data.templateDisposables.add(data.actionBar);
    const badgeContainer = append(data.breakpoint, $60(".badge-container"));
    data.badge = append(badgeContainer, $60("span.line-number.monaco-count-badge"));
    return data;
  }
  renderElement(node, index2, data) {
    const exceptionBreakpoint = node.element;
    this.renderExceptionBreakpoint(exceptionBreakpoint, data);
  }
  renderCompressedElements(node, index2, data) {
    const exceptionBreakpoint = node.element.elements[node.element.elements.length - 1];
    this.renderExceptionBreakpoint(exceptionBreakpoint, data);
  }
  renderExceptionBreakpoint(exceptionBreakpoint, data) {
    data.context = exceptionBreakpoint;
    data.name.textContent = exceptionBreakpoint.label || `${exceptionBreakpoint.filter} exceptions`;
    const exceptionBreakpointtitle = exceptionBreakpoint.verified ? exceptionBreakpoint.description || data.name.textContent : exceptionBreakpoint.message || localize(14207, null);
    data.elementDisposables.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), data.breakpoint, exceptionBreakpointtitle));
    data.breakpoint.classList.toggle("disabled", !exceptionBreakpoint.verified);
    data.checkbox.checked = exceptionBreakpoint.enabled;
    data.condition.textContent = exceptionBreakpoint.condition || "";
    data.elementDisposables.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), data.condition, localize(14176, null, exceptionBreakpoint.condition)));
    if (exceptionBreakpoint.modeLabel) {
      data.badge.textContent = exceptionBreakpoint.modeLabel;
      data.badge.style.display = "block";
    } else {
      data.badge.style.display = "none";
    }
    this.breakpointSupportsCondition.set(exceptionBreakpoint.supportsCondition);
    this.breakpointItemType.set("exceptionBreakpoint");
    this.breakpointHasMultipleModes.set(this.debugService.getModel().getBreakpointModes("exception").length > 1);
    const { primary } = getActionBarActions(this.menu.getActions({ arg: exceptionBreakpoint, shouldForwardArgs: true }), "inline");
    data.actionBar.clear();
    data.actionBar.push(primary, { icon: true, label: false });
    breakpointIdToActionBarDomeNode.set(exceptionBreakpoint.getId(), data.actionBar.domNode);
  }
  disposeElement(node, index2, templateData) {
    templateData.elementDisposables.clear();
  }
  disposeCompressedElements(node, index2, templateData) {
    templateData.elementDisposables.clear();
  }
  disposeTemplate(templateData) {
    templateData.templateDisposables.dispose();
  }
};

var FunctionBreakpointsRenderer = class {
  constructor(menu, breakpointSupportsCondition, breakpointItemType, debugService, hoverService, labelService) {
    this.menu = menu;
    this.breakpointSupportsCondition = breakpointSupportsCondition;
    this.breakpointItemType = breakpointItemType;
    this.debugService = debugService;
    this.hoverService = hoverService;
    this.labelService = labelService;
  }
  static {
    this.ID = "functionbreakpoints";
  }
  get templateId() {
    return FunctionBreakpointsRenderer.ID;
  }
  renderTemplate(container3) {
    const data = /* @__PURE__ */ Object.create(null);
    data.elementDisposables = new DisposableStore();
    data.templateDisposables = new DisposableStore();
    data.templateDisposables.add(data.elementDisposables);
    data.breakpoint = append(container3, $60(".breakpoint"));
    data.icon = $60(".icon");
    data.checkbox = createCheckbox(data.templateDisposables);
    data.templateDisposables.add(data.checkbox.onChange(() => {
      this.debugService.enableOrDisableBreakpoints(!data.context.enabled, data.context);
    }));
    append(data.breakpoint, data.icon);
    append(data.breakpoint, data.checkbox.domNode);
    data.name = append(data.breakpoint, $60("span.name"));
    data.condition = append(data.breakpoint, $60("span.condition"));
    data.actionBar = new ActionBar(data.breakpoint);
    data.templateDisposables.add(data.actionBar);
    const badgeContainer = append(data.breakpoint, $60(".badge-container"));
    data.badge = append(badgeContainer, $60("span.line-number.monaco-count-badge"));
    return data;
  }
  renderElement(node, _index, data) {
    this.renderFunctionBreakpoint(node.element, data);
  }
  renderCompressedElements(node, _index, data) {
    this.renderFunctionBreakpoint(node.element.elements[node.element.elements.length - 1], data);
  }
  renderFunctionBreakpoint(functionBreakpoint2, data) {
    data.context = functionBreakpoint2;
    data.name.textContent = functionBreakpoint2.name;
    const { icon: icon2, message } = getBreakpointMessageAndIcon(this.debugService.state, this.debugService.getModel().areBreakpointsActivated(), functionBreakpoint2, this.labelService, this.debugService.getModel());
    data.icon.className = ThemeIcon.asClassName(icon2);
    data.elementDisposables.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), data.icon, message ? message : ""));
    data.checkbox.checked = functionBreakpoint2.enabled;
    data.elementDisposables.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), data.breakpoint, message ? message : ""));
    if (functionBreakpoint2.condition && functionBreakpoint2.hitCondition) {
      data.condition.textContent = localize(14175, null, functionBreakpoint2.condition, functionBreakpoint2.hitCondition);
    } else {
      data.condition.textContent = functionBreakpoint2.condition || functionBreakpoint2.hitCondition || "";
    }
    if (functionBreakpoint2.modeLabel) {
      data.badge.textContent = functionBreakpoint2.modeLabel;
      data.badge.style.display = "block";
    } else {
      data.badge.style.display = "none";
    }
    const session = this.debugService.getViewModel().focusedSession;
    data.breakpoint.classList.toggle("disabled", session && !session.capabilities.supportsFunctionBreakpoints || !this.debugService.getModel().areBreakpointsActivated());
    if (session && !session.capabilities.supportsFunctionBreakpoints) {
      data.elementDisposables.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), data.breakpoint, localize(14184, null)));
    }
    this.breakpointSupportsCondition.set(!session || !!session.capabilities.supportsConditionalBreakpoints);
    this.breakpointItemType.set("functionBreakpoint");
    const { primary } = getActionBarActions(this.menu.getActions({ arg: functionBreakpoint2, shouldForwardArgs: true }), "inline");
    data.actionBar.clear();
    data.actionBar.push(primary, { icon: true, label: false });
    breakpointIdToActionBarDomeNode.set(functionBreakpoint2.getId(), data.actionBar.domNode);
  }
  disposeElement(node, index2, templateData) {
    templateData.elementDisposables.clear();
  }
  disposeCompressedElements(node, index2, templateData) {
    templateData.elementDisposables.clear();
  }
  disposeTemplate(templateData) {
    templateData.templateDisposables.dispose();
  }
};

FunctionBreakpointsRenderer = __decorateClass([
  __decorateParam(3, IDebugService),
  __decorateParam(4, IHoverService),
  __decorateParam(5, ILabelService)
], FunctionBreakpointsRenderer);

var DataBreakpointsRenderer = class {
  constructor(menu, breakpointHasMultipleModes, breakpointSupportsCondition, breakpointItemType, breakpointIsDataBytes, debugService, hoverService, labelService) {
    this.menu = menu;
    this.breakpointHasMultipleModes = breakpointHasMultipleModes;
    this.breakpointSupportsCondition = breakpointSupportsCondition;
    this.breakpointItemType = breakpointItemType;
    this.breakpointIsDataBytes = breakpointIsDataBytes;
    this.debugService = debugService;
    this.hoverService = hoverService;
    this.labelService = labelService;
  }
  static {
    this.ID = "databreakpoints";
  }
  get templateId() {
    return DataBreakpointsRenderer.ID;
  }
  renderTemplate(container3) {
    const data = /* @__PURE__ */ Object.create(null);
    data.breakpoint = append(container3, $60(".breakpoint"));
    data.elementDisposables = new DisposableStore();
    data.templateDisposables = new DisposableStore();
    data.templateDisposables.add(data.elementDisposables);
    data.icon = $60(".icon");
    data.checkbox = createCheckbox(data.templateDisposables);
    data.templateDisposables.add(data.checkbox.onChange(() => {
      this.debugService.enableOrDisableBreakpoints(!data.context.enabled, data.context);
    }));
    append(data.breakpoint, data.icon);
    append(data.breakpoint, data.checkbox.domNode);
    data.name = append(data.breakpoint, $60("span.name"));
    data.accessType = append(data.breakpoint, $60("span.access-type"));
    data.condition = append(data.breakpoint, $60("span.condition"));
    data.actionBar = new ActionBar(data.breakpoint);
    data.templateDisposables.add(data.actionBar);
    const badgeContainer = append(data.breakpoint, $60(".badge-container"));
    data.badge = append(badgeContainer, $60("span.line-number.monaco-count-badge"));
    return data;
  }
  renderElement(node, _index, data) {
    this.renderDataBreakpoint(node.element, data);
  }
  renderCompressedElements(node, _index, data) {
    this.renderDataBreakpoint(node.element.elements[node.element.elements.length - 1], data);
  }
  renderDataBreakpoint(dataBreakpoint2, data) {
    data.context = dataBreakpoint2;
    data.name.textContent = dataBreakpoint2.description;
    const { icon: icon2, message } = getBreakpointMessageAndIcon(this.debugService.state, this.debugService.getModel().areBreakpointsActivated(), dataBreakpoint2, this.labelService, this.debugService.getModel());
    data.icon.className = ThemeIcon.asClassName(icon2);
    data.elementDisposables.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), data.icon, message ? message : ""));
    data.checkbox.checked = dataBreakpoint2.enabled;
    data.elementDisposables.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), data.breakpoint, message ? message : ""));
    if (dataBreakpoint2.modeLabel) {
      data.badge.textContent = dataBreakpoint2.modeLabel;
      data.badge.style.display = "block";
    } else {
      data.badge.style.display = "none";
    }
    const session = this.debugService.getViewModel().focusedSession;
    data.breakpoint.classList.toggle("disabled", session && !session.capabilities.supportsDataBreakpoints || !this.debugService.getModel().areBreakpointsActivated());
    if (session && !session.capabilities.supportsDataBreakpoints) {
      data.elementDisposables.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), data.breakpoint, localize(14159, null)));
    }
    if (dataBreakpoint2.accessType) {
      const accessType = dataBreakpoint2.accessType === "read" ? localize(14198, null) : dataBreakpoint2.accessType === "write" ? localize(14209, null) : localize(14138, null);
      data.accessType.textContent = accessType;
    } else {
      data.accessType.textContent = "";
    }
    if (dataBreakpoint2.condition && dataBreakpoint2.hitCondition) {
      data.condition.textContent = localize(14175, null, dataBreakpoint2.condition, dataBreakpoint2.hitCondition);
    } else {
      data.condition.textContent = dataBreakpoint2.condition || dataBreakpoint2.hitCondition || "";
    }
    this.breakpointSupportsCondition.set(!session || !!session.capabilities.supportsConditionalBreakpoints);
    this.breakpointHasMultipleModes.set(this.debugService.getModel().getBreakpointModes("data").length > 1);
    this.breakpointItemType.set("dataBreakpoint");
    this.breakpointIsDataBytes.set(dataBreakpoint2.src.type === 1 /* Address */);
    const { primary } = getActionBarActions(this.menu.getActions({ arg: dataBreakpoint2, shouldForwardArgs: true }), "inline");
    data.actionBar.clear();
    data.actionBar.push(primary, { icon: true, label: false });
    breakpointIdToActionBarDomeNode.set(dataBreakpoint2.getId(), data.actionBar.domNode);
    this.breakpointIsDataBytes.reset();
  }
  disposeElement(node, index2, templateData) {
    templateData.elementDisposables.clear();
  }
  disposeCompressedElements(node, index2, templateData) {
    templateData.elementDisposables.clear();
  }
  disposeTemplate(templateData) {
    templateData.templateDisposables.dispose();
  }
};

DataBreakpointsRenderer = __decorateClass([
  __decorateParam(5, IDebugService),
  __decorateParam(6, IHoverService),
  __decorateParam(7, ILabelService)
], DataBreakpointsRenderer);

var InstructionBreakpointsRenderer = class {
  constructor(debugService, hoverService, labelService) {
    this.debugService = debugService;
    this.hoverService = hoverService;
    this.labelService = labelService;
  }
  static {
    this.ID = "instructionBreakpoints";
  }
  get templateId() {
    return InstructionBreakpointsRenderer.ID;
  }
  renderTemplate(container3) {
    const data = /* @__PURE__ */ Object.create(null);
    data.elementDisposables = new DisposableStore();
    data.templateDisposables = new DisposableStore();
    data.templateDisposables.add(data.elementDisposables);
    data.breakpoint = append(container3, $60(".breakpoint"));
    data.icon = $60(".icon");
    data.checkbox = createCheckbox(data.templateDisposables);
    data.templateDisposables.add(data.checkbox.onChange(() => {
      this.debugService.enableOrDisableBreakpoints(!data.context.enabled, data.context);
    }));
    append(data.breakpoint, data.icon);
    append(data.breakpoint, data.checkbox.domNode);
    data.name = append(data.breakpoint, $60("span.name"));
    data.address = append(data.breakpoint, $60("span.file-path"));
    data.actionBar = new ActionBar(data.breakpoint);
    data.templateDisposables.add(data.actionBar);
    const badgeContainer = append(data.breakpoint, $60(".badge-container"));
    data.badge = append(badgeContainer, $60("span.line-number.monaco-count-badge"));
    return data;
  }
  renderElement(node, index2, data) {
    this.renderInstructionBreakpoint(node.element, data);
  }
  renderCompressedElements(node, index2, data) {
    this.renderInstructionBreakpoint(node.element.elements[node.element.elements.length - 1], data);
  }
  renderInstructionBreakpoint(breakpoint2, data) {
    data.context = breakpoint2;
    data.breakpoint.classList.toggle("disabled", !this.debugService.getModel().areBreakpointsActivated());
    data.name.textContent = "0x" + breakpoint2.address.toString(16);
    data.elementDisposables.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), data.name, localize(14161, null, breakpoint2.address.toString())));
    data.checkbox.checked = breakpoint2.enabled;
    const { message, icon: icon2 } = getBreakpointMessageAndIcon(this.debugService.state, this.debugService.getModel().areBreakpointsActivated(), breakpoint2, this.labelService, this.debugService.getModel());
    data.icon.className = ThemeIcon.asClassName(icon2);
    data.elementDisposables.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), data.breakpoint, breakpoint2.message || message || ""));
    const debugActive = this.debugService.state === 3 /* Running */ || this.debugService.state === 2 /* Stopped */;
    if (debugActive && !breakpoint2.verified) {
      data.breakpoint.classList.add("disabled");
    }
    if (breakpoint2.modeLabel) {
      data.badge.textContent = breakpoint2.modeLabel;
      data.badge.style.display = "block";
    } else {
      data.badge.style.display = "none";
    }
  }
  disposeElement(node, index2, templateData) {
    templateData.elementDisposables.clear();
  }
  disposeCompressedElements(node, index2, templateData) {
    templateData.elementDisposables.clear();
  }
  disposeTemplate(templateData) {
    templateData.templateDisposables.dispose();
  }
};

InstructionBreakpointsRenderer = __decorateClass([
  __decorateParam(0, IDebugService),
  __decorateParam(1, IHoverService),
  __decorateParam(2, ILabelService)
], InstructionBreakpointsRenderer);

var FunctionBreakpointInputRenderer = class _FunctionBreakpointInputRenderer {
  constructor(view, debugService, contextViewService, hoverService, labelService) {
    this.view = view;
    this.debugService = debugService;
    this.contextViewService = contextViewService;
    this.hoverService = hoverService;
    this.labelService = labelService;
  }
  static {
    this.ID = "functionbreakpointinput";
  }
  get templateId() {
    return _FunctionBreakpointInputRenderer.ID;
  }
  renderTemplate(container3) {
    const template2 = /* @__PURE__ */ Object.create(null);
    const toDispose = new DisposableStore();
    const breakpoint2 = append(container3, $60(".breakpoint"));
    template2.icon = $60(".icon");
    template2.checkbox = createCheckbox(toDispose);
    append(breakpoint2, template2.icon);
    append(breakpoint2, template2.checkbox.domNode);
    this.view.breakpointInputFocused.set(true);
    const inputBoxContainer = append(breakpoint2, $60(".inputBoxContainer"));
    const inputBox = new InputBox(inputBoxContainer, this.contextViewService, { inputBoxStyles: defaultInputBoxStyles });
    toDispose.add(inputBox);
    const wrapUp = (success) => {
      template2.updating = true;
      try {
        this.view.breakpointInputFocused.set(false);
        const id2 = template2.breakpoint.getId();
        if (success) {
          if (template2.type === "name") {
            this.debugService.updateFunctionBreakpoint(id2, { name: inputBox.value });
          }
          if (template2.type === "condition") {
            this.debugService.updateFunctionBreakpoint(id2, { condition: inputBox.value });
          }
          if (template2.type === "hitCount") {
            this.debugService.updateFunctionBreakpoint(id2, { hitCondition: inputBox.value });
          }
        } else {
          if (template2.type === "name" && !template2.breakpoint.name) {
            this.debugService.removeFunctionBreakpoints(id2);
          } else {
            this.view.renderInputBox(void 0);
          }
        }
      } finally {
        template2.updating = false;
      }
    };
    toDispose.add(addStandardDisposableListener(inputBox.inputElement, "keydown", (e) => {
      const isEscape = e.equals(9 /* Escape */);
      const isEnter = e.equals(3 /* Enter */);
      if (isEscape || isEnter) {
        e.preventDefault();
        e.stopPropagation();
        wrapUp(isEnter);
      }
    }));
    toDispose.add(addDisposableListener(inputBox.inputElement, "blur", () => {
      if (!template2.updating) {
        wrapUp(!!inputBox.value);
      }
    }));
    template2.inputBox = inputBox;
    template2.elementDisposables = new DisposableStore();
    template2.templateDisposables = toDispose;
    template2.templateDisposables.add(template2.elementDisposables);
    return template2;
  }
  renderElement(node, _index, data) {
    const functionBreakpoint2 = node.element;
    data.breakpoint = functionBreakpoint2;
    data.type = this.view.inputBoxData?.type || "name";
    const { icon: icon2, message } = getBreakpointMessageAndIcon(this.debugService.state, this.debugService.getModel().areBreakpointsActivated(), functionBreakpoint2, this.labelService, this.debugService.getModel());
    data.icon.className = ThemeIcon.asClassName(icon2);
    data.elementDisposables.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), data.icon, message ? message : ""));
    data.checkbox.checked = functionBreakpoint2.enabled;
    data.checkbox.disable();
    data.inputBox.value = functionBreakpoint2.name || "";
    let placeholder = localize(14183, null);
    let ariaLabel = localize(14182, null);
    if (data.type === "condition") {
      data.inputBox.value = functionBreakpoint2.condition || "";
      placeholder = localize(14179, null);
      ariaLabel = localize(14178, null);
    } else if (data.type === "hitCount") {
      data.inputBox.value = functionBreakpoint2.hitCondition || "";
      placeholder = localize(14181, null);
      ariaLabel = localize(14180, null);
    }
    data.inputBox.setAriaLabel(ariaLabel);
    data.inputBox.setPlaceHolder(placeholder);
    setTimeout(() => {
      data.inputBox.focus();
      data.inputBox.select();
    }, 0);
  }
  renderCompressedElements(node, _index, data) {
  }
  disposeElement(node, index2, templateData) {
    templateData.elementDisposables.clear();
  }
  disposeCompressedElements(node, index2, templateData) {
    templateData.elementDisposables.clear();
  }
  disposeTemplate(templateData) {
    templateData.templateDisposables.dispose();
  }
};

var DataBreakpointInputRenderer = class _DataBreakpointInputRenderer {
  constructor(view, debugService, contextViewService, hoverService, labelService) {
    this.view = view;
    this.debugService = debugService;
    this.contextViewService = contextViewService;
    this.hoverService = hoverService;
    this.labelService = labelService;
  }
  static {
    this.ID = "databreakpointinput";
  }
  get templateId() {
    return _DataBreakpointInputRenderer.ID;
  }
  renderTemplate(container3) {
    const template2 = /* @__PURE__ */ Object.create(null);
    const toDispose = new DisposableStore();
    const breakpoint2 = append(container3, $60(".breakpoint"));
    template2.icon = $60(".icon");
    template2.checkbox = createCheckbox(toDispose);
    append(breakpoint2, template2.icon);
    append(breakpoint2, template2.checkbox.domNode);
    this.view.breakpointInputFocused.set(true);
    const inputBoxContainer = append(breakpoint2, $60(".inputBoxContainer"));
    const inputBox = new InputBox(inputBoxContainer, this.contextViewService, { inputBoxStyles: defaultInputBoxStyles });
    toDispose.add(inputBox);
    const wrapUp = (success) => {
      template2.updating = true;
      try {
        this.view.breakpointInputFocused.set(false);
        const id2 = template2.breakpoint.getId();
        if (success) {
          if (template2.type === "condition") {
            this.debugService.updateDataBreakpoint(id2, { condition: inputBox.value });
          }
          if (template2.type === "hitCount") {
            this.debugService.updateDataBreakpoint(id2, { hitCondition: inputBox.value });
          }
        } else {
          this.view.renderInputBox(void 0);
        }
      } finally {
        template2.updating = false;
      }
    };
    toDispose.add(addStandardDisposableListener(inputBox.inputElement, "keydown", (e) => {
      const isEscape = e.equals(9 /* Escape */);
      const isEnter = e.equals(3 /* Enter */);
      if (isEscape || isEnter) {
        e.preventDefault();
        e.stopPropagation();
        wrapUp(isEnter);
      }
    }));
    toDispose.add(addDisposableListener(inputBox.inputElement, "blur", () => {
      if (!template2.updating) {
        wrapUp(!!inputBox.value);
      }
    }));
    template2.inputBox = inputBox;
    template2.elementDisposables = new DisposableStore();
    template2.templateDisposables = toDispose;
    template2.templateDisposables.add(template2.elementDisposables);
    return template2;
  }
  renderElement(node, _index, data) {
    const dataBreakpoint2 = node.element;
    data.breakpoint = dataBreakpoint2;
    data.type = this.view.inputBoxData?.type || "condition";
    const { icon: icon2, message } = getBreakpointMessageAndIcon(this.debugService.state, this.debugService.getModel().areBreakpointsActivated(), dataBreakpoint2, this.labelService, this.debugService.getModel());
    data.icon.className = ThemeIcon.asClassName(icon2);
    data.elementDisposables.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), data.icon, message ?? ""));
    data.checkbox.checked = dataBreakpoint2.enabled;
    data.checkbox.disable();
    data.inputBox.value = "";
    let placeholder = "";
    let ariaLabel = "";
    if (data.type === "condition") {
      data.inputBox.value = dataBreakpoint2.condition || "";
      placeholder = localize(14154, null);
      ariaLabel = localize(14153, null);
    } else if (data.type === "hitCount") {
      data.inputBox.value = dataBreakpoint2.hitCondition || "";
      placeholder = localize(14156, null);
      ariaLabel = localize(14155, null);
    }
    data.inputBox.setAriaLabel(ariaLabel);
    data.inputBox.setPlaceHolder(placeholder);
    setTimeout(() => {
      data.inputBox.focus();
      data.inputBox.select();
    }, 0);
  }
  renderCompressedElements(node, _index, data) {
  }
  disposeElement(node, index2, templateData) {
    templateData.elementDisposables.clear();
  }
  disposeCompressedElements(node, index2, templateData) {
    templateData.elementDisposables.clear();
  }
  disposeTemplate(templateData) {
    templateData.templateDisposables.dispose();
  }
};

var ExceptionBreakpointInputRenderer = class _ExceptionBreakpointInputRenderer {
  constructor(view, debugService, contextViewService) {
    this.view = view;
    this.debugService = debugService;
    this.contextViewService = contextViewService;
  }
  static {
    this.ID = "exceptionbreakpointinput";
  }
  get templateId() {
    return _ExceptionBreakpointInputRenderer.ID;
  }
  renderTemplate(container3) {
    const toDispose = new DisposableStore();
    const breakpoint2 = append(container3, $60(".breakpoint"));
    breakpoint2.classList.add("exception");
    const checkbox = createCheckbox(toDispose);
    append(breakpoint2, checkbox.domNode);
    this.view.breakpointInputFocused.set(true);
    const inputBoxContainer = append(breakpoint2, $60(".inputBoxContainer"));
    const inputBox = new InputBox(inputBoxContainer, this.contextViewService, {
      ariaLabel: localize(14172, null),
      inputBoxStyles: defaultInputBoxStyles
    });
    toDispose.add(inputBox);
    const wrapUp = (success) => {
      if (!templateData.currentBreakpoint) {
        return;
      }
      this.view.breakpointInputFocused.set(false);
      let newCondition = templateData.currentBreakpoint.condition;
      if (success) {
        newCondition = inputBox.value !== "" ? inputBox.value : void 0;
      }
      this.debugService.setExceptionBreakpointCondition(templateData.currentBreakpoint, newCondition);
    };
    toDispose.add(addStandardDisposableListener(inputBox.inputElement, "keydown", (e) => {
      const isEscape = e.equals(9 /* Escape */);
      const isEnter = e.equals(3 /* Enter */);
      if (isEscape || isEnter) {
        e.preventDefault();
        e.stopPropagation();
        wrapUp(isEnter);
      }
    }));
    toDispose.add(addDisposableListener(inputBox.inputElement, "blur", () => {
      setTimeout(() => {
        wrapUp(true);
      });
    }));
    const elementDisposables = new DisposableStore();
    toDispose.add(elementDisposables);
    const templateData = {
      inputBox,
      checkbox,
      templateDisposables: toDispose,
      elementDisposables: new DisposableStore()
    };
    return templateData;
  }
  renderElement(node, _index, data) {
    const exceptionBreakpoint = node.element;
    const placeHolder = exceptionBreakpoint.conditionDescription || localize(14173, null);
    data.inputBox.setPlaceHolder(placeHolder);
    data.currentBreakpoint = exceptionBreakpoint;
    data.checkbox.checked = exceptionBreakpoint.enabled;
    data.checkbox.disable();
    data.inputBox.value = exceptionBreakpoint.condition || "";
    setTimeout(() => {
      data.inputBox.focus();
      data.inputBox.select();
    }, 0);
  }
  renderCompressedElements(node, _index, data) {
  }
  disposeElement(node, index2, templateData) {
    templateData.elementDisposables.clear();
  }
  disposeCompressedElements(node, index2, templateData) {
    templateData.elementDisposables.clear();
  }
  disposeTemplate(templateData) {
    templateData.templateDisposables.dispose();
  }
};

var BreakpointsAccessibilityProvider = class {
  constructor(debugService, labelService) {
    this.debugService = debugService;
    this.labelService = labelService;
  }
  getWidgetAriaLabel() {
    return localize(14144, null);
  }
  getRole() {
    return "checkbox";
  }
  isChecked(element) {
    if (element instanceof BreakpointsFolderItem) {
      return element.enabled;
    }
    return element.enabled;
  }
  getAriaLabel(element) {
    if (element instanceof BreakpointsFolderItem) {
      return localize(14143, null, basenameOrAuthority(element.uri), element.breakpoints.length);
    }
    if (element instanceof ExceptionBreakpoint) {
      return element.toString();
    }
    const { message } = getBreakpointMessageAndIcon(this.debugService.state, this.debugService.getModel().areBreakpointsActivated(), element, this.labelService, this.debugService.getModel());
    const toString = element.toString();
    return message ? `${toString}, ${message}` : toString;
  }
};

function openBreakpointSource(breakpoint2, sideBySide, preserveFocus, pinned, debugService, editorService) {
  if (breakpoint2.uri.scheme === DEBUG_SCHEME && debugService.state === 0 /* Inactive */) {
    return Promise.resolve(void 0);
  }
  const selection = breakpoint2.endLineNumber ? {
    startLineNumber: breakpoint2.lineNumber,
    endLineNumber: breakpoint2.endLineNumber,
    startColumn: breakpoint2.column || 1,
    endColumn: breakpoint2.endColumn || 1073741824 /* MAX_SAFE_SMALL_INTEGER */
  } : {
    startLineNumber: breakpoint2.lineNumber,
    startColumn: breakpoint2.column || 1,
    endLineNumber: breakpoint2.lineNumber,
    endColumn: breakpoint2.column || 1073741824 /* MAX_SAFE_SMALL_INTEGER */
  };
  return editorService.openEditor({
    resource: breakpoint2.uri,
    options: {
      preserveFocus,
      selection,
      revealIfOpened: true,
      selectionRevealType: 1 /* CenterIfOutsideViewport */,
      pinned
    }
  }, sideBySide ? SIDE_GROUP : ACTIVE_GROUP);
}

function getBreakpointMessageAndIcon(state, breakpointsActivated, breakpoint2, labelService, debugModel) {
  const debugActive = state === 3 /* Running */ || state === 2 /* Stopped */;
  const breakpointIcon = breakpoint2 instanceof DataBreakpoint2 ? dataBreakpoint : breakpoint2 instanceof FunctionBreakpoint2 ? functionBreakpoint : breakpoint2.logMessage ? logBreakpoint : breakpoint;
  if (!breakpoint2.enabled || !breakpointsActivated) {
    return {
      icon: breakpointIcon.disabled,
      message: breakpoint2.logMessage ? localize(14164, null) : localize(14163, null)
    };
  }
  const appendMessage = (text2) => {
    return breakpoint2.message ? text2.concat(", " + breakpoint2.message) : text2;
  };
  if (debugActive && breakpoint2 instanceof Breakpoint2 && breakpoint2.pending) {
    return {
      icon: breakpoint.pending
    };
  }
  if (debugActive && !breakpoint2.verified) {
    return {
      icon: breakpointIcon.unverified,
      message: breakpoint2.message ? breakpoint2.message : breakpoint2.logMessage ? localize(14208, null) : localize(14206, null),
      showAdapterUnverifiedMessage: true
    };
  }
  if (breakpoint2 instanceof DataBreakpoint2) {
    if (!breakpoint2.supported) {
      return {
        icon: breakpointIcon.unverified,
        message: localize(14160, null)
      };
    }
    return {
      icon: breakpointIcon.regular,
      message: breakpoint2.message || localize(14147, null)
    };
  }
  if (breakpoint2 instanceof FunctionBreakpoint2) {
    if (!breakpoint2.supported) {
      return {
        icon: breakpointIcon.unverified,
        message: localize(14185, null)
      };
    }
    const messages = [];
    messages.push(breakpoint2.message || localize(14177, null));
    if (breakpoint2.condition) {
      messages.push(localize(14174, null, breakpoint2.condition));
    }
    if (breakpoint2.hitCondition) {
      messages.push(localize(14186, null, breakpoint2.hitCondition));
    }
    return {
      icon: breakpointIcon.regular,
      message: appendMessage(messages.join("\n"))
    };
  }
  if (breakpoint2 instanceof InstructionBreakpoint) {
    if (!breakpoint2.supported) {
      return {
        icon: breakpointIcon.unverified,
        message: localize(14189, null)
      };
    }
    const messages = [];
    if (breakpoint2.message) {
      messages.push(breakpoint2.message);
    } else if (breakpoint2.instructionReference) {
      messages.push(localize(14188, null, breakpoint2.instructionReference));
    } else {
      messages.push(localize(14187, null));
    }
    if (breakpoint2.hitCondition) {
      messages.push(localize(14186, null, breakpoint2.hitCondition));
    }
    return {
      icon: breakpointIcon.regular,
      message: appendMessage(messages.join("\n"))
    };
  }
  let triggeringBreakpoint;
  if (breakpoint2 instanceof Breakpoint2 && breakpoint2.triggeredBy) {
    triggeringBreakpoint = debugModel.getBreakpoints().find((bp) => bp.getId() === breakpoint2.triggeredBy);
  }
  if (breakpoint2.logMessage || breakpoint2.condition || breakpoint2.hitCondition || triggeringBreakpoint) {
    const messages = [];
    let icon2 = breakpoint2.logMessage ? logBreakpoint.regular : conditionalBreakpoint.regular;
    if (!breakpoint2.supported) {
      icon2 = debugBreakpointUnsupported;
      messages.push(localize(14145, null));
    }
    if (breakpoint2.logMessage) {
      messages.push(localize(14192, null, breakpoint2.logMessage));
    }
    if (breakpoint2.condition) {
      messages.push(localize(14174, null, breakpoint2.condition));
    }
    if (breakpoint2.hitCondition) {
      messages.push(localize(14186, null, breakpoint2.hitCondition));
    }
    if (triggeringBreakpoint) {
      messages.push(localize(14205, null, `${labelService.getUriLabel(triggeringBreakpoint.uri, { relative: true })}: ${triggeringBreakpoint.lineNumber}`));
    }
    return {
      icon: icon2,
      message: appendMessage(messages.join("\n"))
    };
  }
  const message = breakpoint2.message ? breakpoint2.message : breakpoint2 instanceof Breakpoint2 && labelService ? labelService.getUriLabel(breakpoint2.uri) : localize(14142, null);
  return {
    icon: breakpointIcon.regular,
    message
  };
}

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.debug.viewlet.action.addFunctionBreakpointAction",
      title: {
        ...localize2(14141, "Add Function Breakpoint"),
        mnemonicTitle: localize(14196, null)
      },
      f1: true,
      icon: watchExpressionsAddFuncBreakpoint,
      menu: [{
        id: MenuId.ViewTitle,
        group: "navigation",
        order: 10,
        when: ContextKeyExpr.equals("view", BREAKPOINTS_VIEW_ID)
      }, {
        id: MenuId.MenubarNewBreakpointMenu,
        group: "1_breakpoints",
        order: 3,
        when: CONTEXT_DEBUGGERS_AVAILABLE
      }]
    });
  }
  async run(accessor) {
    const debugService = accessor.get(IDebugService);
    const viewService = accessor.get(IViewsService);
    await viewService.openView(BREAKPOINTS_VIEW_ID);
    debugService.addFunctionBreakpoint();
  }
});

var MemoryBreakpointAction = class extends Action2 {
  async run(accessor, existingBreakpoint) {
    const debugService = accessor.get(IDebugService);
    const session = debugService.getViewModel().focusedSession;
    if (!session) {
      return;
    }
    let defaultValue = void 0;
    if (existingBreakpoint && existingBreakpoint.src.type === 1 /* Address */) {
      defaultValue = `${existingBreakpoint.src.address} + ${existingBreakpoint.src.bytes}`;
    }
    const quickInput = accessor.get(IQuickInputService);
    const notifications = accessor.get(INotificationService);
    const range2 = await this.getRange(quickInput, defaultValue);
    if (!range2) {
      return;
    }
    let info;
    try {
      info = await session.dataBytesBreakpointInfo(range2.address, range2.bytes);
    } catch (e) {
      notifications.error(localize(14152, null, range2.address, e.message));
    }
    if (!info?.dataId) {
      return;
    }
    let accessType = "write";
    if (info.accessTypes && info.accessTypes?.length > 1) {
      const accessTypes = info.accessTypes.map((type) => ({ label: type }));
      const selectedAccessType = await quickInput.pick(accessTypes, { placeHolder: localize(14148, null) });
      if (!selectedAccessType) {
        return;
      }
      accessType = selectedAccessType.label;
    }
    const src = { type: 1 /* Address */, ...range2 };
    if (existingBreakpoint) {
      await debugService.removeDataBreakpoints(existingBreakpoint.getId());
    }
    await debugService.addDataBreakpoint({
      description: info.description,
      src,
      canPersist: true,
      accessTypes: info.accessTypes,
      accessType,
      initialSessionData: { session, dataId: info.dataId }
    });
  }
  getRange(quickInput, defaultValue) {
    return new Promise((resolve3) => {
      const disposables = new DisposableStore();
      const input = disposables.add(quickInput.createInputBox());
      input.prompt = localize(14158, null);
      input.placeholder = localize(14157, null);
      if (defaultValue) {
        input.value = defaultValue;
        input.valueSelection = [0, defaultValue.length];
      }
      disposables.add(input.onDidChangeValue((e) => {
        const err = this.parseAddress(e, false);
        input.validationMessage = err?.error;
      }));
      disposables.add(input.onDidAccept(() => {
        const r2 = this.parseAddress(input.value, true);
        if (hasKey(r2, { error: true })) {
          input.validationMessage = r2.error;
        } else {
          resolve3(r2);
        }
        input.dispose();
      }));
      disposables.add(input.onDidHide(() => {
        resolve3(void 0);
        disposables.dispose();
      }));
      input.ignoreFocusOut = true;
      input.show();
    });
  }
  parseAddress(range2, isFinal) {
    const parts = /^(\S+)\s*(?:([+-])\s*(\S+))?/.exec(range2);
    if (!parts) {
      return { error: localize(14149, null) };
    }
    const isNum = (e) => isFinal ? /^0x[0-9a-f]*|[0-9]*$/i.test(e) : /^0x[0-9a-f]+|[0-9]+$/i.test(e);
    const [, startStr, sign = "+", endStr = "1"] = parts;
    for (const n2 of [startStr, endStr]) {
      if (!isNum(n2)) {
        return { error: localize(14151, null, n2) };
      }
    }
    if (!isFinal) {
      return;
    }
    const start = BigInt(startStr);
    const end = BigInt(endStr);
    const address = `0x${start.toString(16)}`;
    if (sign === "-") {
      if (start > end) {
        return { error: localize(14150, null, startStr, endStr) };
      }
      return { address, bytes: Number(end - start) };
    }
    return { address, bytes: Number(end) };
  }
};

registerAction2(class extends MemoryBreakpointAction {
  constructor() {
    super({
      id: "workbench.debug.viewlet.action.addDataBreakpointOnAddress",
      title: {
        ...localize2(14140, "Add Data Breakpoint at Address"),
        mnemonicTitle: localize(14193, null)
      },
      f1: true,
      icon: watchExpressionsAddDataBreakpoint,
      menu: [{
        id: MenuId.ViewTitle,
        group: "navigation",
        order: 11,
        when: ContextKeyExpr.and(CONTEXT_SET_DATA_BREAKPOINT_BYTES_SUPPORTED, ContextKeyExpr.equals("view", BREAKPOINTS_VIEW_ID))
      }, {
        id: MenuId.MenubarNewBreakpointMenu,
        group: "1_breakpoints",
        order: 4,
        when: CONTEXT_SET_DATA_BREAKPOINT_BYTES_SUPPORTED
      }]
    });
  }
});

registerAction2(class extends MemoryBreakpointAction {
  constructor() {
    super({
      id: "workbench.debug.viewlet.action.editDataBreakpointOnAddress",
      title: localize2(14167, "Edit Address..."),
      menu: [{
        id: MenuId.DebugBreakpointsContext,
        when: ContextKeyExpr.and(CONTEXT_SET_DATA_BREAKPOINT_BYTES_SUPPORTED, CONTEXT_BREAKPOINT_ITEM_IS_DATA_BYTES),
        group: "navigation",
        order: 15
      }]
    });
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.debug.viewlet.action.toggleBreakpointsActivatedAction",
      title: localize2(14139, "Toggle Activate Breakpoints"),
      f1: true,
      icon: breakpointsActivate,
      menu: {
        id: MenuId.ViewTitle,
        group: "navigation",
        order: 20,
        when: ContextKeyExpr.equals("view", BREAKPOINTS_VIEW_ID)
      }
    });
  }
  run(accessor) {
    const debugService = accessor.get(IDebugService);
    debugService.setBreakpointsActivated(!debugService.getModel().areBreakpointsActivated());
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.debug.viewlet.action.removeBreakpoint",
      title: localize(14201, null),
      icon: Codicon.removeClose,
      menu: [{
        id: MenuId.DebugBreakpointsContext,
        group: "3_modification",
        order: 10,
        when: CONTEXT_BREAKPOINT_ITEM_TYPE.notEqualsTo("exceptionBreakpoint")
      }, {
        id: MenuId.DebugBreakpointsContext,
        group: "inline",
        order: 20,
        when: CONTEXT_BREAKPOINT_ITEM_TYPE.notEqualsTo("exceptionBreakpoint")
      }]
    });
  }
  async run(accessor, breakpoint2) {
    const debugService = accessor.get(IDebugService);
    if (breakpoint2 instanceof Breakpoint2) {
      await debugService.removeBreakpoints(breakpoint2.getId());
    } else if (breakpoint2 instanceof FunctionBreakpoint2) {
      await debugService.removeFunctionBreakpoints(breakpoint2.getId());
    } else if (breakpoint2 instanceof DataBreakpoint2) {
      await debugService.removeDataBreakpoints(breakpoint2.getId());
    } else if (breakpoint2 instanceof InstructionBreakpoint) {
      await debugService.removeInstructionBreakpoints(breakpoint2.instructionReference, breakpoint2.offset);
    }
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.debug.viewlet.action.removeAllBreakpoints",
      title: {
        ...localize2(14200, "Remove All Breakpoints"),
        mnemonicTitle: localize(14197, null)
      },
      f1: true,
      icon: breakpointsRemoveAll,
      menu: [{
        id: MenuId.ViewTitle,
        group: "navigation",
        order: 30,
        when: ContextKeyExpr.equals("view", BREAKPOINTS_VIEW_ID)
      }, {
        id: MenuId.DebugBreakpointsContext,
        group: "3_modification",
        order: 20,
        when: ContextKeyExpr.and(CONTEXT_BREAKPOINTS_EXIST, CONTEXT_BREAKPOINT_ITEM_TYPE.notEqualsTo("exceptionBreakpoint"))
      }, {
        id: MenuId.MenubarDebugMenu,
        group: "5_breakpoints",
        order: 3,
        when: CONTEXT_DEBUGGERS_AVAILABLE
      }]
    });
  }
  run(accessor) {
    const debugService = accessor.get(IDebugService);
    debugService.removeBreakpoints();
    debugService.removeFunctionBreakpoints();
    debugService.removeDataBreakpoints();
    debugService.removeInstructionBreakpoints();
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.debug.viewlet.action.enableAllBreakpoints",
      title: {
        ...localize2(14171, "Enable All Breakpoints"),
        mnemonicTitle: localize(14195, null)
      },
      f1: true,
      precondition: CONTEXT_DEBUGGERS_AVAILABLE,
      menu: [{
        id: MenuId.DebugBreakpointsContext,
        group: "z_commands",
        order: 10,
        when: ContextKeyExpr.and(CONTEXT_BREAKPOINTS_EXIST, CONTEXT_BREAKPOINT_ITEM_TYPE.notEqualsTo("exceptionBreakpoint"))
      }, {
        id: MenuId.MenubarDebugMenu,
        group: "5_breakpoints",
        order: 1,
        when: CONTEXT_DEBUGGERS_AVAILABLE
      }]
    });
  }
  async run(accessor) {
    const debugService = accessor.get(IDebugService);
    await debugService.enableOrDisableBreakpoints(true);
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.debug.viewlet.action.disableAllBreakpoints",
      title: {
        ...localize2(14162, "Disable All Breakpoints"),
        mnemonicTitle: localize(14194, null)
      },
      f1: true,
      precondition: CONTEXT_DEBUGGERS_AVAILABLE,
      menu: [{
        id: MenuId.DebugBreakpointsContext,
        group: "z_commands",
        order: 20,
        when: ContextKeyExpr.and(CONTEXT_BREAKPOINTS_EXIST, CONTEXT_BREAKPOINT_ITEM_TYPE.notEqualsTo("exceptionBreakpoint"))
      }, {
        id: MenuId.MenubarDebugMenu,
        group: "5_breakpoints",
        order: 2,
        when: CONTEXT_DEBUGGERS_AVAILABLE
      }]
    });
  }
  async run(accessor) {
    const debugService = accessor.get(IDebugService);
    await debugService.enableOrDisableBreakpoints(false);
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.debug.viewlet.action.reapplyBreakpointsAction",
      title: localize2(14199, "Reapply All Breakpoints"),
      f1: true,
      precondition: CONTEXT_IN_DEBUG_MODE,
      menu: [{
        id: MenuId.DebugBreakpointsContext,
        group: "z_commands",
        order: 30,
        when: ContextKeyExpr.and(CONTEXT_BREAKPOINTS_EXIST, CONTEXT_BREAKPOINT_ITEM_TYPE.notEqualsTo("exceptionBreakpoint"))
      }]
    });
  }
  async run(accessor) {
    const debugService = accessor.get(IDebugService);
    await debugService.setBreakpointsActivated(true);
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.debug.viewlet.action.toggleBreakpointsPresentation",
      title: localize2(14204, "Toggle Breakpoints View Presentation"),
      f1: true,
      icon: breakpointsViewIcon,
      menu: {
        id: MenuId.ViewTitle,
        group: "navigation",
        order: 10,
        when: ContextKeyExpr.equals("view", BREAKPOINTS_VIEW_ID)
      }
    });
  }
  async run(accessor) {
    const configurationService = accessor.get(IConfigurationService);
    const currentPresentation = configurationService.getValue("debug.breakpointsView.presentation");
    const newPresentation = currentPresentation === "tree" ? "list" : "tree";
    await configurationService.updateValue("debug.breakpointsView.presentation", newPresentation);
  }
});

registerAction2(class extends ViewAction {
  constructor() {
    super({
      id: "debug.editBreakpoint",
      viewId: BREAKPOINTS_VIEW_ID,
      title: localize(14166, null),
      icon: Codicon.edit,
      precondition: CONTEXT_BREAKPOINT_SUPPORTS_CONDITION,
      menu: [{
        id: MenuId.DebugBreakpointsContext,
        when: CONTEXT_BREAKPOINT_ITEM_TYPE.notEqualsTo("functionBreakpoint"),
        group: "navigation",
        order: 10
      }, {
        id: MenuId.DebugBreakpointsContext,
        group: "inline",
        order: 10
      }]
    });
  }
  async runInView(accessor, view, breakpoint2) {
    const debugService = accessor.get(IDebugService);
    const editorService = accessor.get(IEditorService);
    if (breakpoint2 instanceof Breakpoint2) {
      const editor = await openBreakpointSource(breakpoint2, false, false, true, debugService, editorService);
      if (editor) {
        const codeEditor = editor.getControl();
        if (isCodeEditor(codeEditor)) {
          codeEditor.getContribution(BREAKPOINT_EDITOR_CONTRIBUTION_ID)?.showBreakpointWidget(breakpoint2.lineNumber, breakpoint2.column);
        }
      }
    } else if (breakpoint2 instanceof FunctionBreakpoint2) {
      const contextMenuService = accessor.get(IContextMenuService);
      const actions = [
        new Action("breakpoint.editCondition", localize(14166, null), void 0, true, async () => view.renderInputBox({ breakpoint: breakpoint2, type: "condition" })),
        new Action("breakpoint.editCondition", localize(14168, null), void 0, true, async () => view.renderInputBox({ breakpoint: breakpoint2, type: "hitCount" }))
      ];
      const domNode = breakpointIdToActionBarDomeNode.get(breakpoint2.getId());
      if (domNode) {
        contextMenuService.showContextMenu({
          getActions: () => actions,
          getAnchor: () => domNode,
          onHide: () => dispose(actions)
        });
      }
    } else {
      view.renderInputBox({ breakpoint: breakpoint2, type: "condition" });
    }
  }
});

registerAction2(class extends ViewAction {
  constructor() {
    super({
      id: "debug.editFunctionBreakpoint",
      viewId: BREAKPOINTS_VIEW_ID,
      title: localize(14165, null),
      menu: [{
        id: MenuId.DebugBreakpointsContext,
        group: "navigation",
        order: 10,
        when: CONTEXT_BREAKPOINT_ITEM_TYPE.isEqualTo("functionBreakpoint")
      }]
    });
  }
  runInView(_accessor, view, breakpoint2) {
    view.renderInputBox({ breakpoint: breakpoint2, type: "name" });
  }
});

registerAction2(class extends ViewAction {
  constructor() {
    super({
      id: "debug.editFunctionBreakpointHitCount",
      viewId: BREAKPOINTS_VIEW_ID,
      title: localize(14168, null),
      precondition: CONTEXT_BREAKPOINT_SUPPORTS_CONDITION,
      menu: [{
        id: MenuId.DebugBreakpointsContext,
        group: "navigation",
        order: 20,
        when: ContextKeyExpr.or(CONTEXT_BREAKPOINT_ITEM_TYPE.isEqualTo("functionBreakpoint"), CONTEXT_BREAKPOINT_ITEM_TYPE.isEqualTo("dataBreakpoint"))
      }]
    });
  }
  runInView(_accessor, view, breakpoint2) {
    view.renderInputBox({ breakpoint: breakpoint2, type: "hitCount" });
  }
});

registerAction2(class extends ViewAction {
  constructor() {
    super({
      id: "debug.editBreakpointMode",
      viewId: BREAKPOINTS_VIEW_ID,
      title: localize(14169, null),
      menu: [{
        id: MenuId.DebugBreakpointsContext,
        group: "navigation",
        order: 20,
        when: ContextKeyExpr.and(
          CONTEXT_BREAKPOINT_HAS_MODES,
          ContextKeyExpr.or(CONTEXT_BREAKPOINT_ITEM_TYPE.isEqualTo("breakpoint"), CONTEXT_BREAKPOINT_ITEM_TYPE.isEqualTo("exceptionBreakpoint"), CONTEXT_BREAKPOINT_ITEM_TYPE.isEqualTo("instructionBreakpoint"))
        )
      }]
    });
  }
  async runInView(accessor, view, breakpoint2) {
    const debugService = accessor.get(IDebugService);
    const kind = getModeKindForBreakpoint(breakpoint2);
    const modes = debugService.getModel().getBreakpointModes(kind);
    const picked = await accessor.get(IQuickInputService).pick(
      modes.map((mode) => ({ label: mode.label, description: mode.description, mode: mode.mode })),
      { placeHolder: localize(14203, null) }
    );
    if (!picked) {
      return;
    }
    if (kind === "source") {
      const data = /* @__PURE__ */ new Map();
      data.set(breakpoint2.getId(), { mode: picked.mode, modeLabel: picked.label });
      debugService.updateBreakpoints(breakpoint2.originalUri, data, false);
    } else if (breakpoint2 instanceof InstructionBreakpoint) {
      debugService.removeInstructionBreakpoints(breakpoint2.instructionReference, breakpoint2.offset);
      debugService.addInstructionBreakpoint({ ...breakpoint2.toJSON(), mode: picked.mode, modeLabel: picked.label });
    } else if (breakpoint2 instanceof ExceptionBreakpoint) {
      breakpoint2.mode = picked.mode;
      breakpoint2.modeLabel = picked.label;
      debugService.setExceptionBreakpointCondition(breakpoint2, breakpoint2.condition);
    }
  }
});
export { createCheckbox, getModeKindForBreakpoint, openBreakpointSource, getBreakpointMessageAndIcon, $60, MAX_VISIBLE_BREAKPOINTS, BreakpointsFolderItem, BreakpointsView, BreakpointsDelegate, breakpointIdToActionBarDomeNode, BreakpointsFolderRenderer, BreakpointsRenderer, ExceptionBreakpointsRenderer, FunctionBreakpointsRenderer, DataBreakpointsRenderer, InstructionBreakpointsRenderer, FunctionBreakpointInputRenderer, DataBreakpointInputRenderer, ExceptionBreakpointInputRenderer, BreakpointsAccessibilityProvider, MemoryBreakpointAction };
