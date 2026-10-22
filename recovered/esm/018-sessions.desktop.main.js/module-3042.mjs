// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminal/browser/terminalTabsList.ts
import { $, EventType, addDisposableListener, addStandardDisposableListener, append } from "./module-0075.mjs";
import { IListService, WorkbenchList } from "./module-0636.mjs";
import { DEFAULT_LABELS_CONTAINER, ResourceLabels } from "./module-1322.mjs";
import { Disposable, DisposableStore, dispose, toDisposable } from "./module-0012.mjs";
import { TerminalContextKeys } from "./module-1176.mjs";
import { getInstanceHoverInfo } from "./module-3040.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ITerminalConfigurationService, ITerminalEditingService, ITerminalGroupService, ITerminalService } from "./module-1150.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IDecorationsService } from "./module-1068.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ILifecycleService } from "./module-0870.mjs";
import { IHoverService } from "./module-0520.mjs";
import { ActionBar } from "./module-0477.mjs";
import { TerminalContextActionRunner } from "./module-3039.mjs";
import { MenuItemAction } from "./module-0092.mjs";
import { MenuEntryActionViewItem } from "./module-0516.mjs";
import { getColorClass, getIconId, getUriClasses } from "./module-1175.mjs";
import { severity_default } from "./module-0266.mjs";
import { InputBox } from "./module-0600.mjs";
import { localize } from "./module-0001.mjs";
import { defaultInputBoxStyles } from "./module-0513.mjs";
import { createSingleCallFunction } from "./module-0005.mjs";
import { Action } from "./module-0082.mjs";
import { terminalStrings } from "./module-3030.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IContextViewService } from "./module-0488.mjs";
import { ICommandService } from "./module-0087.mjs";
import { ElementsDragAndDropData, NativeDragAndDropData } from "./module-0459.mjs";
import { CodeDataTransfers, containsDragType, getPathForFile } from "./module-0273.mjs";
import { DataTransfers } from "./module-0263.mjs";
import { disposableTimeout } from "./module-0036.mjs";
import { getTerminalResourcesFromDragEvent, parseTerminalUri } from "./module-2131.mjs";
import { URI } from "./module-0032.mjs";
import { Emitter } from "./module-0017.mjs";
import { Schemas } from "./module-0033.mjs";
import { getColorForSeverity } from "./module-3041.mjs";
import { isObject } from "./module-0010.mjs";


// src/vs/workbench/contrib/terminal/browser/terminalTabsList.ts
var $103 = $;

var TerminalTabList = class extends WorkbenchList {
  constructor(container2, contextKeyService, listService, _configurationService, _terminalService, _terminalGroupService, _terminalEditingService, instantiationService, decorationsService, _themeService, _storageService, lifecycleService, _hoverService) {
    super(
      "TerminalTabsList",
      container2,
      {
        getHeight: () => 22 /* TabHeight */,
        getTemplateId: () => "terminal.tabs"
      },
      [instantiationService.createInstance(TerminalTabsRenderer, container2, instantiationService.createInstance(ResourceLabels, DEFAULT_LABELS_CONTAINER), () => this.getSelectedElements(), {
        getHasText: () => this.hasText,
        getHasActionBar: () => this.hasActionBar
      })],
      {
        horizontalScrolling: false,
        supportDynamicHeights: false,
        selectionNavigation: true,
        identityProvider: {
          getId: (e4) => e4?.instanceId
        },
        accessibilityProvider: instantiationService.createInstance(TerminalTabsAccessibilityProvider),
        smoothScrolling: _configurationService.getValue("workbench.list.smoothScrolling"),
        multipleSelectionSupport: true,
        paddingBottom: 22 /* TabHeight */,
        dnd: instantiationService.createInstance(TerminalTabsDragAndDrop),
        openOnSingleClick: true
      },
      contextKeyService,
      listService,
      _configurationService,
      instantiationService
    );
    this._configurationService = _configurationService;
    this._terminalService = _terminalService;
    this._terminalGroupService = _terminalGroupService;
    this._terminalEditingService = _terminalEditingService;
    this._themeService = _themeService;
    this._storageService = _storageService;
    this._hoverService = _hoverService;
    this._hasText = true;
    this._hasActionBar = true;
    const instanceDisposables = [
      this._terminalGroupService.onDidChangeInstances(() => this.refresh()),
      this._terminalGroupService.onDidChangeGroups(() => this.refresh()),
      this._terminalGroupService.onDidShow(() => this.refresh()),
      this._terminalGroupService.onDidChangeInstanceCapability(() => this.refresh()),
      this._terminalService.onAnyInstanceTitleChange(() => this.refresh()),
      this._terminalService.onAnyInstanceIconChange(() => this.refresh()),
      this._terminalService.onAnyInstancePrimaryStatusChange(() => this.refresh()),
      this._terminalService.onDidChangeConnectionState(() => this.refresh()),
      this._themeService.onDidColorThemeChange(() => this.refresh()),
      this._terminalGroupService.onDidChangeActiveInstance((e4) => {
        if (e4) {
          const i2 = this._terminalGroupService.instances.indexOf(e4);
          this.setSelection([i2]);
          this.reveal(i2);
        }
        this.refresh();
      }),
      this._storageService.onDidChangeValue(-1 /* APPLICATION */, "terminal.integrated.tabs.showDetailed" /* TabsShowDetailed */, this.disposables)(() => this.refresh())
    ];
    this.disposables.add(lifecycleService.onWillShutdown((e4) => {
      dispose(instanceDisposables);
      instanceDisposables.length = 0;
    }));
    this.disposables.add(toDisposable(() => {
      dispose(instanceDisposables);
      instanceDisposables.length = 0;
    }));
    this.disposables.add(this.onMouseDblClick(async (e4) => {
      if (!e4.element) {
        e4.browserEvent.preventDefault();
        e4.browserEvent.stopPropagation();
        const instance2 = await this._terminalService.createTerminal({ location: 1 /* Panel */ });
        this._terminalGroupService.setActiveInstance(instance2);
        await instance2.focusWhenReady();
        return;
      }
      if (this._terminalEditingService.getEditingTerminal()?.instanceId === e4.element.instanceId) {
        return;
      }
      if (this._getFocusMode() === "doubleClick" && this.getFocus().length === 1) {
        e4.element.focus(true);
      }
    }));
    this.disposables.add(this.onMouseClick(async (e4) => {
      if (this._terminalEditingService.getEditingTerminal()?.instanceId === e4.element?.instanceId) {
        return;
      }
      if (e4.browserEvent.altKey && e4.element) {
        await this._terminalService.createTerminal({ location: { parentTerminal: e4.element } });
      } else if (this._getFocusMode() === "singleClick") {
        if (this.getSelection().length <= 1) {
          e4.element?.focus(true);
        }
      }
    }));
    this.disposables.add(this.onContextMenu((e4) => {
      if (!e4.element) {
        this.setSelection([]);
        return;
      }
      const selection = this.getSelectedElements();
      if (!selection || !selection.find((s) => e4.element === s)) {
        this.setFocus(e4.index !== void 0 ? [e4.index] : []);
      }
    }));
    this._terminalTabsSingleSelectedContextKey = TerminalContextKeys.tabsSingularSelection.bindTo(contextKeyService);
    this._isSplitContextKey = TerminalContextKeys.splitTerminalTabFocused.bindTo(contextKeyService);
    this.disposables.add(this.onDidChangeSelection((e4) => this._updateContextKey()));
    this.disposables.add(this.onDidChangeFocus(() => this._updateContextKey()));
    this.disposables.add(this.onDidOpen(async (e4) => {
      const instance2 = e4.element;
      if (!instance2) {
        return;
      }
      this._terminalGroupService.setActiveInstance(instance2);
      if (!e4.editorOptions.preserveFocus) {
        await instance2.focusWhenReady();
      }
    }));
    if (!this._decorationsProvider) {
      this._decorationsProvider = this.disposables.add(instantiationService.createInstance(TabDecorationsProvider));
      this.disposables.add(decorationsService.registerDecorationsProvider(this._decorationsProvider));
    }
    this.refresh();
  }
  get hasText() {
    return this._hasText;
  }
  get hasActionBar() {
    return this._hasActionBar;
  }
  _getFocusMode() {
    return this._configurationService.getValue("terminal.integrated.tabs.focusMode" /* TabsFocusMode */);
  }
  refresh(cancelEditing = true) {
    if (cancelEditing && this._terminalEditingService.isEditable(void 0)) {
      this.domFocus();
    }
    this.splice(0, this.length, this._terminalGroupService.instances.slice());
  }
  focusHover() {
    const instance2 = this.getSelectedElements()[0];
    if (!instance2) {
      return;
    }
    this._hoverService.showInstantHover({
      ...getInstanceHoverInfo(instance2, this._storageService),
      target: this.getHTMLElement(),
      trapFocus: true
    }, true);
  }
  _updateContextKey() {
    this._terminalTabsSingleSelectedContextKey.set(this.getSelectedElements().length === 1);
    const instance2 = this.getFocusedElements();
    this._isSplitContextKey.set(instance2.length > 0 && this._terminalGroupService.instanceIsSplit(instance2[0]));
  }
  layout(height, width2) {
    super.layout(height, width2);
    const actualWidth = width2 ?? this.getHTMLElement().clientWidth;
    const newHasText = actualWidth >= 63 /* MidpointViewWidth */;
    const newHasActionBar = actualWidth > 105 /* ActionbarMinimumWidth */;
    if (this._hasText !== newHasText || this._hasActionBar !== newHasActionBar) {
      this._hasText = newHasText;
      this._hasActionBar = newHasActionBar;
      this.refresh();
    }
  }
};

TerminalTabList = __decorateClass([
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, IListService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, ITerminalService),
  __decorateParam(5, ITerminalGroupService),
  __decorateParam(6, ITerminalEditingService),
  __decorateParam(7, IInstantiationService),
  __decorateParam(8, IDecorationsService),
  __decorateParam(9, IThemeService),
  __decorateParam(10, IStorageService),
  __decorateParam(11, ILifecycleService),
  __decorateParam(12, IHoverService)
], TerminalTabList);

var TerminalTabsRenderer = class {
  constructor(_container, _labels, _getSelection, _getVisibilityState, _instantiationService, _terminalConfigurationService, _terminalService, _terminalGroupService, _terminalEditingService, _hoverService, _keybindingService, _listService, _storageService, _themeService, _contextViewService, _commandService) {
    this._labels = _labels;
    this._getSelection = _getSelection;
    this._getVisibilityState = _getVisibilityState;
    this._instantiationService = _instantiationService;
    this._terminalConfigurationService = _terminalConfigurationService;
    this._terminalService = _terminalService;
    this._terminalGroupService = _terminalGroupService;
    this._terminalEditingService = _terminalEditingService;
    this._hoverService = _hoverService;
    this._keybindingService = _keybindingService;
    this._listService = _listService;
    this._storageService = _storageService;
    this._themeService = _themeService;
    this._contextViewService = _contextViewService;
    this._commandService = _commandService;
    this.templateId = "terminal.tabs";
  }
  renderTemplate(container2) {
    const element = append(container2, $103(".terminal-tabs-entry"));
    const context2 = {};
    const templateDisposables = new DisposableStore();
    const label3 = templateDisposables.add(this._labels.create(element, {
      supportHighlights: true,
      supportDescriptionHighlights: true,
      supportIcons: true,
      hoverDelegate: {
        delay: 0,
        showHover: (options3) => {
          return this._hoverService.showDelayedHover({
            ...options3,
            actions: context2.hoverActions,
            target: element,
            appearance: {
              showPointer: true
            },
            position: {
              hoverPosition: this._terminalConfigurationService.config.tabs.location === "left" ? 1 /* RIGHT */ : 0 /* LEFT */
            }
          }, { groupId: "terminal-tabs-list" });
        }
      }
    }));
    const actionsContainer = append(label3.element, $103(".actions"));
    const actionBar3 = templateDisposables.add(new ActionBar(actionsContainer, {
      actionRunner: templateDisposables.add(new TerminalContextActionRunner()),
      actionViewItemProvider: (action, options3) => action instanceof MenuItemAction ? templateDisposables.add(this._instantiationService.createInstance(MenuEntryActionViewItem, action, { hoverDelegate: options3.hoverDelegate })) : void 0
    }));
    return {
      element,
      label: label3,
      actionBar: actionBar3,
      context: context2,
      elementDisposables: new DisposableStore(),
      templateDisposables
    };
  }
  renderElement(instance2, index2, template2) {
    const hasText = this._getVisibilityState.getHasText();
    const hasActionBar = this._getVisibilityState.getHasActionBar();
    const group2 = this._terminalGroupService.getGroupForInstance(instance2);
    if (!group2) {
      throw new Error(`Could not find group for instance "${instance2.instanceId}"`);
    }
    template2.element.classList.toggle("has-text", hasText);
    template2.element.classList.toggle("is-active", this._terminalGroupService.activeInstance === instance2);
    let prefix = "";
    if (group2.terminalInstances.length > 1) {
      const terminalIndex = group2.terminalInstances.indexOf(instance2);
      if (terminalIndex === 0) {
        prefix = `\u250C `;
      } else if (terminalIndex === group2.terminalInstances.length - 1) {
        prefix = `\u2514 `;
      } else {
        prefix = `\u251C `;
      }
    }
    const hoverInfo = getInstanceHoverInfo(instance2, this._storageService);
    template2.context.hoverActions = hoverInfo.actions;
    const iconId = this._instantiationService.invokeFunction(getIconId, instance2);
    let label3 = "";
    if (!hasText) {
      const primaryStatus = instance2.statusList.primary;
      if (primaryStatus && primaryStatus.severity > severity_default.Ignore) {
        label3 = `${prefix}$(${primaryStatus.icon?.id || iconId})`;
      } else {
        label3 = `${prefix}$(${iconId})`;
      }
    } else {
      this.fillActionBar(instance2, template2);
      label3 = prefix;
      if (instance2.icon) {
        label3 += `$(${iconId}) ${instance2.title}`;
      }
    }
    if (!hasActionBar) {
      template2.actionBar.clear();
    }
    template2.elementDisposables.add(addDisposableListener(template2.element, EventType.AUXCLICK, (e4) => {
      e4.stopImmediatePropagation();
      if (e4.button === 1) {
        this._terminalService.safeDisposeTerminal(instance2);
      }
    }));
    const extraClasses = [];
    const colorClass = getColorClass(instance2);
    if (colorClass) {
      extraClasses.push(colorClass);
    }
    const uriClasses = getUriClasses(instance2, this._themeService.getColorTheme().type);
    if (uriClasses) {
      extraClasses.push(...uriClasses);
    }
    template2.label.setResource({
      resource: instance2.resource,
      name: label3,
      description: hasText ? instance2.description : void 0
    }, {
      fileDecorations: {
        colors: true,
        badges: hasText
      },
      title: {
        markdown: hoverInfo.content,
        markdownNotSupportedFallback: void 0
      },
      extraClasses
    });
    const editableData = this._terminalEditingService.getEditableData(instance2);
    template2.label.element.classList.toggle("editable-tab", !!editableData);
    if (editableData) {
      template2.elementDisposables.add(this._renderInputBox(template2.label.element.querySelector(".monaco-icon-label-container"), instance2, editableData));
      template2.actionBar.clear();
    }
  }
  _renderInputBox(container2, instance2, editableData) {
    const value2 = instance2.title || "";
    const inputBox = new InputBox(container2, this._contextViewService, {
      validationOptions: {
        validation: (value3) => {
          const message = editableData.validationMessage(value3);
          if (!message || message.severity !== severity_default.Error) {
            return null;
          }
          return {
            content: message.content,
            formatContent: true,
            type: 3 /* ERROR */
          };
        }
      },
      ariaLabel: localize(20090, null),
      inputBoxStyles: defaultInputBoxStyles
    });
    inputBox.element.style.height = "22px";
    inputBox.value = value2;
    inputBox.focus();
    inputBox.select({ start: 0, end: value2.length });
    const done = createSingleCallFunction((success, finishEditing) => {
      inputBox.element.style.display = "none";
      const value3 = inputBox.value;
      dispose(toDispose);
      inputBox.element.remove();
      if (finishEditing) {
        editableData.onFinish(value3, success);
      }
    });
    const showInputBoxNotification = () => {
      if (inputBox.isInputValid()) {
        const message = editableData.validationMessage(inputBox.value);
        if (message) {
          inputBox.showMessage({
            content: message.content,
            formatContent: true,
            type: message.severity === severity_default.Info ? 1 /* INFO */ : message.severity === severity_default.Warning ? 2 /* WARNING */ : 3 /* ERROR */
          });
        } else {
          inputBox.hideMessage();
        }
      }
    };
    showInputBoxNotification();
    const toDispose = [
      inputBox,
      addStandardDisposableListener(inputBox.inputElement, EventType.KEY_DOWN, (e4) => {
        e4.stopPropagation();
        if (e4.equals(3 /* Enter */)) {
          done(inputBox.isInputValid(), true);
        } else if (e4.equals(9 /* Escape */)) {
          done(false, true);
        }
      }),
      addStandardDisposableListener(inputBox.inputElement, EventType.KEY_UP, (e4) => {
        showInputBoxNotification();
      }),
      addDisposableListener(inputBox.inputElement, EventType.BLUR, () => {
        done(inputBox.isInputValid(), true);
      })
    ];
    return toDisposable(() => {
      done(false, false);
    });
  }
  disposeElement(instance2, index2, templateData) {
    templateData.elementDisposables.clear();
    templateData.actionBar.clear();
  }
  disposeTemplate(templateData) {
    templateData.elementDisposables.dispose();
    templateData.templateDisposables.dispose();
  }
  fillActionBar(instance2, template2) {
    const actions = [
      template2.elementDisposables.add(new Action("workbench.action.terminal.splitActiveTab" /* SplitActiveTab */, terminalStrings.split.short, ThemeIcon.asClassName(Codicon.splitHorizontal), true, async () => {
        this._runForSelectionOrInstance(instance2, async (e4) => {
          this._terminalService.createTerminal({ location: { parentTerminal: e4 } });
        });
      }))
    ];
    if (instance2.shellLaunchConfig.tabActions) {
      for (const action of instance2.shellLaunchConfig.tabActions) {
        actions.push(template2.elementDisposables.add(new Action(action.id, action.label, action.icon ? ThemeIcon.asClassName(action.icon) : void 0, true, async () => {
          this._runForSelectionOrInstance(instance2, (e4) => this._commandService.executeCommand(action.id, instance2));
        })));
      }
    }
    actions.push(template2.elementDisposables.add(new Action("workbench.action.terminal.killActiveTab" /* KillActiveTab */, terminalStrings.kill.short, ThemeIcon.asClassName(Codicon.trashcan), true, async () => {
      this._runForSelectionOrInstance(instance2, (e4) => this._terminalService.safeDisposeTerminal(e4));
    })));
    template2.actionBar.clear();
    for (const action of actions) {
      template2.actionBar.push(action, { icon: true, label: false, keybinding: this._keybindingService.lookupKeybinding(action.id)?.getLabel() });
    }
  }
  _runForSelectionOrInstance(instance2, callback) {
    const selection = this._getSelection();
    if (selection.includes(instance2)) {
      for (const s of selection) {
        if (s) {
          callback(s);
        }
      }
    } else {
      callback(instance2);
    }
    this._terminalGroupService.focusTabs();
    this._listService.lastFocusedList?.focusNext();
  }
};

TerminalTabsRenderer = __decorateClass([
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, ITerminalConfigurationService),
  __decorateParam(6, ITerminalService),
  __decorateParam(7, ITerminalGroupService),
  __decorateParam(8, ITerminalEditingService),
  __decorateParam(9, IHoverService),
  __decorateParam(10, IKeybindingService),
  __decorateParam(11, IListService),
  __decorateParam(12, IStorageService),
  __decorateParam(13, IThemeService),
  __decorateParam(14, IContextViewService),
  __decorateParam(15, ICommandService)
], TerminalTabsRenderer);

var TerminalTabsAccessibilityProvider = class {
  constructor(_terminalGroupService) {
    this._terminalGroupService = _terminalGroupService;
  }
  getWidgetAriaLabel() {
    return localize(20088, null);
  }
  getAriaLabel(instance2) {
    let ariaLabel = "";
    const tab = this._terminalGroupService.getGroupForInstance(instance2);
    if (tab && tab.terminalInstances?.length > 1) {
      const terminalIndex = tab.terminalInstances.indexOf(instance2);
      ariaLabel = localize(20087, null, instance2.instanceId, instance2.title, terminalIndex + 1, tab.terminalInstances.length);
    } else {
      ariaLabel = localize(20089, null, instance2.instanceId, instance2.title);
    }
    return ariaLabel;
  }
};

TerminalTabsAccessibilityProvider = __decorateClass([
  __decorateParam(0, ITerminalGroupService)
], TerminalTabsAccessibilityProvider);

var TerminalTabsDragAndDrop = class extends Disposable {
  constructor(_terminalService, _terminalGroupService, _terminalEditingService, _listService) {
    super();
    this._terminalService = _terminalService;
    this._terminalGroupService = _terminalGroupService;
    this._terminalEditingService = _terminalEditingService;
    this._listService = _listService;
    this._autoFocusDisposable = Disposable.None;
    this._primaryBackend = this._terminalService.getPrimaryBackend();
  }
  getDragURI(instance2) {
    if (this._terminalEditingService.getEditingTerminal()?.instanceId === instance2.instanceId) {
      return null;
    }
    return instance2.resource.toString();
  }
  getDragLabel(elements, originalEvent) {
    return elements.length === 1 ? elements[0].title : void 0;
  }
  onDragLeave() {
    this._autoFocusInstance = void 0;
    this._autoFocusDisposable.dispose();
    this._autoFocusDisposable = Disposable.None;
  }
  onDragStart(data, originalEvent) {
    if (!originalEvent.dataTransfer) {
      return;
    }
    const dndData = data.getData();
    if (!Array.isArray(dndData)) {
      return;
    }
    const terminals = dndData.filter(isTerminalInstance);
    if (terminals.length > 0) {
      originalEvent.dataTransfer.setData("Terminals" /* Terminals */, JSON.stringify(terminals.map((e4) => e4.resource.toString())));
    }
  }
  onDragOver(data, targetInstance, targetIndex, targetSector, originalEvent) {
    if (data instanceof NativeDragAndDropData) {
      if (!containsDragType(originalEvent, DataTransfers.FILES, DataTransfers.RESOURCES, "Terminals" /* Terminals */, CodeDataTransfers.FILES)) {
        return false;
      }
    }
    const didChangeAutoFocusInstance = this._autoFocusInstance !== targetInstance;
    if (didChangeAutoFocusInstance) {
      this._autoFocusDisposable.dispose();
      this._autoFocusInstance = targetInstance;
    }
    if (!targetInstance && !containsDragType(originalEvent, "Terminals" /* Terminals */)) {
      return data instanceof ElementsDragAndDropData;
    }
    if (didChangeAutoFocusInstance && targetInstance) {
      this._autoFocusDisposable = disposableTimeout(() => {
        this._terminalService.setActiveInstance(targetInstance);
        this._autoFocusInstance = void 0;
      }, 500, this._store);
    }
    return {
      feedback: targetIndex ? [targetIndex] : void 0,
      accept: true,
      effect: { type: 1 /* Move */, position: "drop-target" /* Over */ }
    };
  }
  async drop(data, targetInstance, targetIndex, targetSector, originalEvent) {
    this._autoFocusDisposable.dispose();
    this._autoFocusInstance = void 0;
    let sourceInstances;
    const promises = [];
    const resources = getTerminalResourcesFromDragEvent(originalEvent);
    if (resources) {
      for (const uri4 of resources) {
        const instance2 = this._terminalService.getInstanceFromResource(uri4);
        if (instance2) {
          if (Array.isArray(sourceInstances)) {
            sourceInstances.push(instance2);
          } else {
            sourceInstances = [instance2];
          }
          this._terminalService.moveToTerminalView(instance2);
        } else if (this._primaryBackend) {
          const terminalIdentifier = parseTerminalUri(uri4);
          if (terminalIdentifier.instanceId) {
            promises.push(this._primaryBackend.requestDetachInstance(terminalIdentifier.workspaceId, terminalIdentifier.instanceId));
          }
        }
      }
    }
    if (promises.length) {
      let processes = await Promise.all(promises);
      processes = processes.filter((p) => p !== void 0);
      let lastInstance;
      for (const attachPersistentProcess of processes) {
        lastInstance = await this._terminalService.createTerminal({ config: { attachPersistentProcess } });
      }
      if (lastInstance) {
        this._terminalService.setActiveInstance(lastInstance);
      }
      return;
    }
    if (sourceInstances === void 0) {
      if (!(data instanceof ElementsDragAndDropData)) {
        this._handleExternalDrop(targetInstance, originalEvent);
        return;
      }
      const draggedElement = data.getData();
      if (!draggedElement || !Array.isArray(draggedElement)) {
        return;
      }
      sourceInstances = [];
      for (const e4 of draggedElement) {
        if (isTerminalInstance(e4)) {
          sourceInstances.push(e4);
        }
      }
    }
    if (!targetInstance) {
      this._terminalGroupService.moveGroupToEnd(sourceInstances);
      this._terminalService.setActiveInstance(sourceInstances[0]);
      const targetGroup2 = this._terminalGroupService.getGroupForInstance(sourceInstances[0]);
      if (targetGroup2) {
        const index2 = this._terminalGroupService.groups.indexOf(targetGroup2);
        this._listService.lastFocusedList?.setSelection([index2]);
      }
      return;
    }
    this._terminalGroupService.moveGroup(sourceInstances, targetInstance);
    this._terminalService.setActiveInstance(sourceInstances[0]);
    const targetGroup = this._terminalGroupService.getGroupForInstance(sourceInstances[0]);
    if (targetGroup) {
      const index2 = this._terminalGroupService.groups.indexOf(targetGroup);
      this._listService.lastFocusedList?.setSelection([index2]);
    }
  }
  async _handleExternalDrop(instance2, e4) {
    if (!instance2 || !e4.dataTransfer) {
      return;
    }
    let resource;
    const rawResources = e4.dataTransfer.getData(DataTransfers.RESOURCES);
    if (rawResources) {
      resource = URI.parse(JSON.parse(rawResources)[0]);
    }
    const rawCodeFiles = e4.dataTransfer.getData(CodeDataTransfers.FILES);
    if (!resource && rawCodeFiles) {
      resource = URI.file(JSON.parse(rawCodeFiles)[0]);
    }
    if (!resource && e4.dataTransfer.files.length > 0 && getPathForFile(e4.dataTransfer.files[0])) {
      resource = URI.file(getPathForFile(e4.dataTransfer.files[0]));
    }
    if (!resource) {
      return;
    }
    this._terminalService.setActiveInstance(instance2);
    instance2.focus();
    await instance2.sendPath(resource, false);
  }
};

TerminalTabsDragAndDrop = __decorateClass([
  __decorateParam(0, ITerminalService),
  __decorateParam(1, ITerminalGroupService),
  __decorateParam(2, ITerminalEditingService),
  __decorateParam(3, IListService)
], TerminalTabsDragAndDrop);

var TabDecorationsProvider = class extends Disposable {
  constructor(_terminalService) {
    super();
    this._terminalService = _terminalService;
    this.label = localize(20086, null);
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this._register(this._terminalService.onAnyInstancePrimaryStatusChange((e4) => this._onDidChange.fire([e4.resource])));
  }
  provideDecorations(resource) {
    if (resource.scheme !== Schemas.vscodeTerminal) {
      return void 0;
    }
    const instance2 = this._terminalService.getInstanceFromResource(resource);
    if (!instance2) {
      return void 0;
    }
    const primaryStatus = instance2?.statusList?.primary;
    if (!primaryStatus?.icon) {
      return void 0;
    }
    return {
      color: getColorForSeverity(primaryStatus.severity),
      letter: primaryStatus.icon,
      tooltip: primaryStatus.tooltip
    };
  }
};

TabDecorationsProvider = __decorateClass([
  __decorateParam(0, ITerminalService)
], TabDecorationsProvider);

function isTerminalInstance(obj) {
  return isObject(obj) && "instanceId" in obj;
}
export { isTerminalInstance, $103, TerminalTabList, TerminalTabsRenderer, TerminalTabsAccessibilityProvider, TerminalTabsDragAndDrop, TabDecorationsProvider };
