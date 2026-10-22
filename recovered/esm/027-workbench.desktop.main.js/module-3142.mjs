// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/scm/browser/scmViewPane.ts
import { createMatches } from "./module-0453.mjs";
import { basename2, dirname2 } from "./module-0034.mjs";
import { $, append, clearNode, isActiveElement, isPointerEvent } from "./module-0075.mjs";
import { Disposable, DisposableMap, DisposableStore, MutableDisposable, combinedDisposable, dispose, toDisposable } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { INotificationService } from "./module-0336.mjs";
import { collectContextMenuActions, connectPrimaryMenu, getActionViewItemProvider, isSCMActionButton, isSCMInput, isSCMRepository, isSCMResource, isSCMResourceGroup, isSCMResourceNode, isSCMViewService } from "./module-2028.mjs";
import { fillEditorsDragData } from "./module-1381.mjs";
import { Schemas } from "./module-0033.mjs";
import { CodeDataTransfers } from "./module-0273.mjs";
import { SCMInputWidget } from "./module-3141.mjs";
import { Sequencer, Throttler, disposableTimeout } from "./module-0036.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { WorkbenchToolBar } from "./module-0519.mjs";
import { CountBadge } from "./module-0638.mjs";
import { defaultButtonStyles, defaultCountBadgeStyles } from "./module-0513.mjs";
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { Action2, IMenuService, MenuId, MenuItemAction, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { ISCMService, ISCMViewService, VIEW_PANE_ID } from "./module-1080.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { ActionRunner, Separator, toAction } from "./module-0082.mjs";
import { ResourceTree } from "./module-1258.mjs";
import { isDark } from "./module-0247.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { asCSSUrl } from "./module-0449.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IThemeService } from "./module-0287.mjs";
import { RepositoryActionRunner, RepositoryRenderer } from "./module-3138.mjs";
import { compareFileNames, comparePaths } from "./module-1529.mjs";
import { compare } from "./module-0030.mjs";
import { localize } from "./module-0001.mjs";
import { IAccessibilityService } from "./module-0104.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { Iterable } from "./module-0011.mjs";
import { ViewAction, ViewPane } from "./module-1335.mjs";
import { Codicon } from "./module-0085.mjs";
import { RepositoryContextKeys } from "./module-3140.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { ResourceLabels } from "./module-1323.mjs";
import { observableConfigValue } from "./module-0444.mjs";
import { WorkbenchCompressibleAsyncDataTree } from "./module-0636.mjs";
import { autorun } from "./module-0052.mjs";
import { API_OPEN_DIFF_EDITOR_COMMAND_ID, API_OPEN_EDITOR_COMMAND_ID } from "./module-1538.mjs";
import { OpenScmGroupAction } from "./module-1466.mjs";
import { EditorResourceAccessor } from "./module-0925.mjs";
import { getFlatContextMenuActions } from "./module-0516.mjs";
import { rot } from "./module-0040.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IViewDescriptorService } from "./module-1093.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IHoverService } from "./module-0520.mjs";
import { Button, ButtonWithDropdown } from "./module-0546.mjs";


// src/vs/workbench/contrib/scm/browser/scmViewPane.ts
function processResourceFilterData(uri5, filterData) {
  if (!filterData) {
    return [void 0, void 0];
  }
  if (!filterData.label) {
    const matches3 = createMatches(filterData);
    return [matches3, void 0];
  }
  const fileName = basename2(uri5);
  const label3 = filterData.label;
  const pathLength = label3.length - fileName.length;
  const matches2 = createMatches(filterData.score);
  if (label3 === fileName) {
    return [matches2, void 0];
  }
  const labelMatches = [];
  const descriptionMatches = [];
  for (const match2 of matches2) {
    if (match2.start > pathLength) {
      labelMatches.push({
        start: match2.start - pathLength,
        end: match2.end - pathLength
      });
    } else if (match2.end < pathLength) {
      descriptionMatches.push(match2);
    } else {
      labelMatches.push({
        start: 0,
        end: match2.end - pathLength
      });
      descriptionMatches.push({
        start: match2.start,
        end: pathLength
      });
    }
  }
  return [labelMatches, descriptionMatches];
}

var ActionButtonRenderer = class {
  constructor(commandService, contextMenuService, notificationService) {
    this.commandService = commandService;
    this.contextMenuService = contextMenuService;
    this.notificationService = notificationService;
    this.actionButtons = /* @__PURE__ */ new Map();
  }
  static {
    this.DEFAULT_HEIGHT = 28;
  }
  static {
    this.TEMPLATE_ID = "actionButton";
  }
  get templateId() {
    return ActionButtonRenderer.TEMPLATE_ID;
  }
  renderTemplate(container3) {
    container3.parentElement.parentElement.classList.add("cursor-default", "force-no-hover");
    const buttonContainer = append(container3, $(".button-container"));
    const actionButton = new SCMActionButton(buttonContainer, this.contextMenuService, this.commandService, this.notificationService);
    return { actionButton, disposable: Disposable.None, templateDisposable: actionButton };
  }
  renderElement(node, index2, templateData) {
    templateData.disposable.dispose();
    const disposables = new DisposableStore();
    const actionButton = node.element;
    templateData.actionButton.setButton(node.element.button);
    this.actionButtons.set(actionButton, templateData.actionButton);
    disposables.add({ dispose: () => this.actionButtons.delete(actionButton) });
    templateData.disposable = disposables;
  }
  renderCompressedElements() {
    throw new Error("Should never happen since node is incompressible");
  }
  focusActionButton(actionButton) {
    this.actionButtons.get(actionButton)?.focus();
  }
  disposeElement(node, index2, template2) {
    template2.disposable.dispose();
  }
  disposeTemplate(templateData) {
    templateData.disposable.dispose();
    templateData.templateDisposable.dispose();
  }
};

ActionButtonRenderer = __decorateClass([
  __decorateParam(0, ICommandService),
  __decorateParam(1, IContextMenuService),
  __decorateParam(2, INotificationService)
], ActionButtonRenderer);

var SCMTreeDragAndDrop = class _SCMTreeDragAndDrop {
  constructor(instantiationService) {
    this.instantiationService = instantiationService;
  }
  getDragURI(element) {
    if (isSCMResource(element)) {
      return element.sourceUri.toString();
    }
    return null;
  }
  onDragStart(data, originalEvent) {
    const items = _SCMTreeDragAndDrop.getResourcesFromDragAndDropData(data);
    if (originalEvent.dataTransfer && items?.length) {
      this.instantiationService.invokeFunction((accessor) => fillEditorsDragData(accessor, items, originalEvent));
      const fileResources = items.filter((s) => s.scheme === Schemas.file).map((r2) => r2.fsPath);
      if (fileResources.length) {
        originalEvent.dataTransfer.setData(CodeDataTransfers.FILES, JSON.stringify(fileResources));
      }
    }
  }
  getDragLabel(elements, originalEvent) {
    if (elements.length === 1) {
      const element = elements[0];
      if (isSCMResource(element)) {
        return basename2(element.sourceUri);
      }
    }
    return String(elements.length);
  }
  onDragOver(data, targetElement, targetIndex, targetSector, originalEvent) {
    return true;
  }
  drop(data, targetElement, targetIndex, targetSector, originalEvent) {
  }
  static getResourcesFromDragAndDropData(data) {
    const uris = [];
    for (const element of [...data.context ?? [], ...data.elements]) {
      if (isSCMResource(element)) {
        uris.push(element.sourceUri);
      }
    }
    return uris;
  }
  dispose() {
  }
};

var InputRenderer = class {
  constructor(outerLayout, overflowWidgetsDomNode, updateHeight, instantiationService) {
    this.outerLayout = outerLayout;
    this.overflowWidgetsDomNode = overflowWidgetsDomNode;
    this.updateHeight = updateHeight;
    this.instantiationService = instantiationService;
    this.inputWidgets = /* @__PURE__ */ new Map();
    this.contentHeights = /* @__PURE__ */ new WeakMap();
    this.editorSelections = /* @__PURE__ */ new WeakMap();
  }
  static {
    this.DEFAULT_HEIGHT = 26;
  }
  static {
    this.TEMPLATE_ID = "input";
  }
  get templateId() {
    return InputRenderer.TEMPLATE_ID;
  }
  renderTemplate(container3) {
    container3.parentElement.parentElement.classList.add("force-no-hover");
    const templateDisposable = new DisposableStore();
    const inputElement = append(container3, $(".scm-input"));
    const inputWidget = this.instantiationService.createInstance(SCMInputWidget, inputElement, this.overflowWidgetsDomNode);
    templateDisposable.add(inputWidget);
    return { inputWidget, inputWidgetHeight: InputRenderer.DEFAULT_HEIGHT, elementDisposables: new DisposableStore(), templateDisposable };
  }
  renderElement(node, index2, templateData) {
    const input = node.element;
    templateData.inputWidget.input = input;
    this.inputWidgets.set(input, templateData.inputWidget);
    templateData.elementDisposables.add({
      dispose: () => this.inputWidgets.delete(input)
    });
    const selections = this.editorSelections.get(input);
    if (selections) {
      templateData.inputWidget.selections = selections;
    }
    templateData.elementDisposables.add(toDisposable(() => {
      const selections2 = templateData.inputWidget.selections;
      if (selections2) {
        this.editorSelections.set(input, selections2);
      }
    }));
    templateData.inputWidgetHeight = InputRenderer.DEFAULT_HEIGHT;
    const onDidChangeContentHeight = () => {
      const contentHeight = templateData.inputWidget.getContentHeight();
      this.contentHeights.set(input, contentHeight);
      if (templateData.inputWidgetHeight !== contentHeight) {
        this.updateHeight(input, contentHeight + 10);
        templateData.inputWidgetHeight = contentHeight;
        templateData.inputWidget.layout();
      }
    };
    const startListeningContentHeightChange = () => {
      templateData.elementDisposables.add(templateData.inputWidget.onDidChangeContentHeight(onDidChangeContentHeight));
      onDidChangeContentHeight();
    };
    disposableTimeout(startListeningContentHeightChange, 0, templateData.elementDisposables);
    const layoutEditor = () => templateData.inputWidget.layout();
    templateData.elementDisposables.add(this.outerLayout.onDidChange(layoutEditor));
    layoutEditor();
  }
  renderCompressedElements() {
    throw new Error("Should never happen since node is incompressible");
  }
  disposeElement(group2, index2, template2) {
    template2.elementDisposables.clear();
  }
  disposeTemplate(templateData) {
    templateData.elementDisposables.dispose();
    templateData.templateDisposable.dispose();
  }
  getHeight(input) {
    return (this.contentHeights.get(input) ?? InputRenderer.DEFAULT_HEIGHT) + 10;
  }
  getRenderedInputWidget(input) {
    return this.inputWidgets.get(input);
  }
  getFocusedInput() {
    for (const [input, inputWidget] of this.inputWidgets) {
      if (inputWidget.hasFocus()) {
        return input;
      }
    }
    return void 0;
  }
  clearValidation() {
    for (const [, inputWidget] of this.inputWidgets) {
      inputWidget.clearValidation();
    }
  }
};

InputRenderer = __decorateClass([
  __decorateParam(3, IInstantiationService)
], InputRenderer);

var ResourceGroupRenderer = class {
  constructor(actionViewItemProvider, actionRunner, commandService, contextKeyService, contextMenuService, keybindingService, menuService, scmViewService, telemetryService) {
    this.actionViewItemProvider = actionViewItemProvider;
    this.actionRunner = actionRunner;
    this.commandService = commandService;
    this.contextKeyService = contextKeyService;
    this.contextMenuService = contextMenuService;
    this.keybindingService = keybindingService;
    this.menuService = menuService;
    this.scmViewService = scmViewService;
    this.telemetryService = telemetryService;
  }
  static {
    this.TEMPLATE_ID = "resource group";
  }
  get templateId() {
    return ResourceGroupRenderer.TEMPLATE_ID;
  }
  renderTemplate(container3) {
    const element = append(container3, $(".resource-group"));
    const name = append(element, $(".name"));
    const actionsContainer = append(element, $(".actions"));
    const actionBar3 = new WorkbenchToolBar(actionsContainer, {
      actionViewItemProvider: this.actionViewItemProvider,
      actionRunner: this.actionRunner
    }, this.menuService, this.contextKeyService, this.contextMenuService, this.keybindingService, this.commandService, this.telemetryService);
    const countContainer = append(element, $(".count"));
    const count2 = new CountBadge(countContainer, {}, defaultCountBadgeStyles);
    const disposables = combinedDisposable(actionBar3, count2);
    return { name, count: count2, actionBar: actionBar3, elementDisposables: new DisposableStore(), disposables };
  }
  renderElement(node, index2, template2) {
    const group2 = node.element;
    template2.name.textContent = group2.label;
    template2.count.setCount(group2.resources.length);
    const menus = this.scmViewService.menus.getRepositoryMenus(group2.provider);
    template2.elementDisposables.add(connectPrimaryMenu(menus.getResourceGroupMenu(group2), (primary) => {
      template2.actionBar.setActions(primary);
    }, "inline"));
    template2.actionBar.context = group2;
  }
  renderCompressedElements(node) {
    throw new Error("Should never happen since node is incompressible");
  }
  disposeElement(group2, index2, template2) {
    template2.elementDisposables.clear();
  }
  disposeTemplate(template2) {
    template2.elementDisposables.dispose();
    template2.disposables.dispose();
  }
};

ResourceGroupRenderer = __decorateClass([
  __decorateParam(2, ICommandService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IContextMenuService),
  __decorateParam(5, IKeybindingService),
  __decorateParam(6, IMenuService),
  __decorateParam(7, ISCMViewService),
  __decorateParam(8, ITelemetryService)
], ResourceGroupRenderer);

var RepositoryPaneActionRunner = class extends ActionRunner {
  constructor(getSelectedResources) {
    super();
    this.getSelectedResources = getSelectedResources;
  }
  async runAction(action, context2) {
    if (!(action instanceof MenuItemAction)) {
      return super.runAction(action, context2);
    }
    const isContextResourceGroup = isSCMResourceGroup(context2);
    const selection = this.getSelectedResources().filter((r2) => isSCMResourceGroup(r2) === isContextResourceGroup);
    const contextIsSelected = selection.some((s) => s === context2);
    const actualContext = contextIsSelected ? selection : [context2];
    const args2 = actualContext.map((e) => ResourceTree.isResourceNode(e) ? ResourceTree.collect(e) : [e]).flat();
    await action.run(...args2);
  }
};

var ResourceRenderer = class {
  constructor(viewMode, labels2, actionViewItemProvider, actionRunner, commandService, contextKeyService, contextMenuService, keybindingService, labelService, menuService, scmViewService, telemetryService, themeService) {
    this.viewMode = viewMode;
    this.labels = labels2;
    this.actionViewItemProvider = actionViewItemProvider;
    this.actionRunner = actionRunner;
    this.commandService = commandService;
    this.contextKeyService = contextKeyService;
    this.contextMenuService = contextMenuService;
    this.keybindingService = keybindingService;
    this.labelService = labelService;
    this.menuService = menuService;
    this.scmViewService = scmViewService;
    this.telemetryService = telemetryService;
    this.themeService = themeService;
    this.disposables = new DisposableStore();
    this.renderedResources = /* @__PURE__ */ new Map();
    themeService.onDidColorThemeChange(this.onDidColorThemeChange, this, this.disposables);
  }
  static {
    this.TEMPLATE_ID = "resource";
  }
  get templateId() {
    return ResourceRenderer.TEMPLATE_ID;
  }
  renderTemplate(container3) {
    const element = append(container3, $(".resource"));
    const name = append(element, $(".name"));
    const fileLabel = this.labels.create(name, { supportDescriptionHighlights: true, supportHighlights: true });
    const actionsContainer = append(fileLabel.element, $(".actions"));
    const actionBar3 = new WorkbenchToolBar(actionsContainer, {
      actionViewItemProvider: this.actionViewItemProvider,
      actionRunner: this.actionRunner
    }, this.menuService, this.contextKeyService, this.contextMenuService, this.keybindingService, this.commandService, this.telemetryService);
    const decorationIcon = append(element, $(".decoration-icon"));
    const actionBarMenuListener = new MutableDisposable();
    const disposables = combinedDisposable(actionBar3, fileLabel, actionBarMenuListener);
    return { element, name, fileLabel, decorationIcon, actionBar: actionBar3, actionBarMenu: void 0, actionBarMenuListener, elementDisposables: new DisposableStore(), disposables };
  }
  renderElement(node, index2, template2) {
    const resourceOrFolder = node.element;
    const iconResource = ResourceTree.isResourceNode(resourceOrFolder) ? resourceOrFolder.element : resourceOrFolder;
    const uri5 = ResourceTree.isResourceNode(resourceOrFolder) ? resourceOrFolder.uri : resourceOrFolder.sourceUri;
    const fileKind = ResourceTree.isResourceNode(resourceOrFolder) ? 1 /* FOLDER */ : 0 /* FILE */;
    const tooltip = !ResourceTree.isResourceNode(resourceOrFolder) && resourceOrFolder.decorations.tooltip || "";
    const hidePath = this.viewMode() === "tree" /* Tree */;
    let matches2;
    let descriptionMatches;
    let strikethrough;
    if (ResourceTree.isResourceNode(resourceOrFolder)) {
      if (resourceOrFolder.element) {
        const menus = this.scmViewService.menus.getRepositoryMenus(resourceOrFolder.element.resourceGroup.provider);
        this._renderActionBar(template2, resourceOrFolder, menus.getResourceMenu(resourceOrFolder.element));
        template2.element.classList.toggle("faded", resourceOrFolder.element.decorations.faded);
        strikethrough = resourceOrFolder.element.decorations.strikeThrough;
      } else {
        const menus = this.scmViewService.menus.getRepositoryMenus(resourceOrFolder.context.provider);
        this._renderActionBar(template2, resourceOrFolder, menus.getResourceFolderMenu(resourceOrFolder.context));
        matches2 = createMatches(node.filterData);
        template2.element.classList.remove("faded");
      }
    } else {
      const menus = this.scmViewService.menus.getRepositoryMenus(resourceOrFolder.resourceGroup.provider);
      this._renderActionBar(template2, resourceOrFolder, menus.getResourceMenu(resourceOrFolder));
      [matches2, descriptionMatches] = processResourceFilterData(uri5, node.filterData);
      template2.element.classList.toggle("faded", resourceOrFolder.decorations.faded);
      strikethrough = resourceOrFolder.decorations.strikeThrough;
    }
    const renderedData = {
      tooltip,
      uri: uri5,
      fileLabelOptions: { hidePath, fileKind, matches: matches2, descriptionMatches, strikethrough },
      iconResource
    };
    this.renderIcon(template2, renderedData);
    this.renderedResources.set(template2, renderedData);
    template2.elementDisposables.add(toDisposable(() => this.renderedResources.delete(template2)));
    template2.element.setAttribute("data-tooltip", tooltip);
  }
  disposeElement(resource, index2, template2) {
    template2.elementDisposables.clear();
  }
  renderCompressedElements(node, index2, template2) {
    const compressed = node.element;
    const folder = compressed.elements[compressed.elements.length - 1];
    const label3 = compressed.elements.map((e) => e.name);
    const fileKind = 1 /* FOLDER */;
    const matches2 = createMatches(node.filterData);
    template2.fileLabel.setResource({ resource: folder.uri, name: label3 }, {
      fileDecorations: { colors: false, badges: true },
      fileKind,
      matches: matches2,
      separator: this.labelService.getSeparator(folder.uri.scheme)
    });
    const menus = this.scmViewService.menus.getRepositoryMenus(folder.context.provider);
    this._renderActionBar(template2, folder, menus.getResourceFolderMenu(folder.context));
    template2.name.classList.remove("strike-through");
    template2.element.classList.remove("faded");
    template2.decorationIcon.style.display = "none";
    template2.decorationIcon.style.backgroundImage = "";
    template2.element.setAttribute("data-tooltip", "");
  }
  disposeCompressedElements(node, index2, template2) {
    template2.elementDisposables.clear();
  }
  disposeTemplate(template2) {
    template2.elementDisposables.dispose();
    template2.disposables.dispose();
  }
  _renderActionBar(template2, resourceOrFolder, menu) {
    if (!template2.actionBarMenu || template2.actionBarMenu !== menu) {
      template2.actionBarMenu = menu;
      template2.actionBarMenuListener.value = connectPrimaryMenu(menu, (primary) => {
        template2.actionBar.setActions(primary);
      }, "inline");
    }
    template2.actionBar.context = resourceOrFolder;
  }
  onDidColorThemeChange() {
    for (const [template2, data] of this.renderedResources) {
      this.renderIcon(template2, data);
    }
  }
  renderIcon(template2, data) {
    const theme = this.themeService.getColorTheme();
    const icon2 = isDark(theme.type) ? data.iconResource?.decorations.iconDark : data.iconResource?.decorations.icon;
    template2.fileLabel.setFile(data.uri, {
      ...data.fileLabelOptions,
      fileDecorations: { colors: false, badges: !icon2 }
    });
    if (icon2) {
      if (ThemeIcon.isThemeIcon(icon2)) {
        template2.decorationIcon.className = `decoration-icon ${ThemeIcon.asClassName(icon2)}`;
        if (icon2.color) {
          template2.decorationIcon.style.color = theme.getColor(icon2.color.id)?.toString() ?? "";
        }
        template2.decorationIcon.style.display = "";
        template2.decorationIcon.style.backgroundImage = "";
      } else {
        template2.decorationIcon.className = "decoration-icon";
        template2.decorationIcon.style.color = "";
        template2.decorationIcon.style.display = "";
        template2.decorationIcon.style.backgroundImage = asCSSUrl(icon2);
      }
      template2.decorationIcon.title = data.tooltip;
    } else {
      template2.decorationIcon.className = "decoration-icon";
      template2.decorationIcon.style.color = "";
      template2.decorationIcon.style.display = "none";
      template2.decorationIcon.style.backgroundImage = "";
      template2.decorationIcon.title = "";
    }
  }
  dispose() {
    this.disposables.dispose();
  }
};

ResourceRenderer = __decorateClass([
  __decorateParam(4, ICommandService),
  __decorateParam(5, IContextKeyService),
  __decorateParam(6, IContextMenuService),
  __decorateParam(7, IKeybindingService),
  __decorateParam(8, ILabelService),
  __decorateParam(9, IMenuService),
  __decorateParam(10, ISCMViewService),
  __decorateParam(11, ITelemetryService),
  __decorateParam(12, IThemeService)
], ResourceRenderer);

var ListDelegate2 = class {
  constructor(inputRenderer) {
    this.inputRenderer = inputRenderer;
  }
  getHeight(element) {
    if (isSCMInput(element)) {
      return this.inputRenderer.getHeight(element);
    } else if (isSCMActionButton(element)) {
      return ActionButtonRenderer.DEFAULT_HEIGHT + 8;
    } else {
      return 22;
    }
  }
  getTemplateId(element) {
    if (isSCMRepository(element)) {
      return RepositoryRenderer.TEMPLATE_ID;
    } else if (isSCMInput(element)) {
      return InputRenderer.TEMPLATE_ID;
    } else if (isSCMActionButton(element)) {
      return ActionButtonRenderer.TEMPLATE_ID;
    } else if (isSCMResourceGroup(element)) {
      return ResourceGroupRenderer.TEMPLATE_ID;
    } else if (isSCMResource(element) || isSCMResourceNode(element)) {
      return ResourceRenderer.TEMPLATE_ID;
    } else {
      throw new Error("Unknown element");
    }
  }
};

var SCMTreeCompressionDelegate = class {
  isIncompressible(element) {
    if (ResourceTree.isResourceNode(element)) {
      return element.childrenCount === 0 || !element.parent || !element.parent.parent;
    }
    return true;
  }
};

var SCMTreeFilter = class {
  filter(element) {
    if (isSCMResourceGroup(element)) {
      return element.resources.length > 0 || !element.hideWhenEmpty;
    } else {
      return true;
    }
  }
};

var SCMTreeSorter = class {
  constructor(viewMode, viewSortKey) {
    this.viewMode = viewMode;
    this.viewSortKey = viewSortKey;
  }
  compare(one, other) {
    if (isSCMRepository(one)) {
      if (!isSCMRepository(other)) {
        throw new Error("Invalid comparison");
      }
      return 0;
    }
    if (isSCMInput(one)) {
      return -1;
    } else if (isSCMInput(other)) {
      return 1;
    }
    if (isSCMActionButton(one)) {
      return -1;
    } else if (isSCMActionButton(other)) {
      return 1;
    }
    if (isSCMResourceGroup(one)) {
      return isSCMResourceGroup(other) ? 0 : -1;
    }
    if (this.viewMode() === "list" /* List */) {
      if (this.viewSortKey() === "name" /* Name */) {
        const oneName2 = basename2(one.sourceUri);
        const otherName2 = basename2(other.sourceUri);
        return compareFileNames(oneName2, otherName2);
      }
      if (this.viewSortKey() === "status" /* Status */) {
        const oneTooltip = one.decorations.tooltip ?? "";
        const otherTooltip = other.decorations.tooltip ?? "";
        if (oneTooltip !== otherTooltip) {
          return compare(oneTooltip, otherTooltip);
        }
      }
      const onePath = one.sourceUri.fsPath;
      const otherPath = other.sourceUri.fsPath;
      return comparePaths(onePath, otherPath);
    }
    const oneIsDirectory = ResourceTree.isResourceNode(one);
    const otherIsDirectory = ResourceTree.isResourceNode(other);
    if (oneIsDirectory !== otherIsDirectory) {
      return oneIsDirectory ? -1 : 1;
    }
    const oneName = ResourceTree.isResourceNode(one) ? one.name : basename2(one.sourceUri);
    const otherName = ResourceTree.isResourceNode(other) ? other.name : basename2(other.sourceUri);
    return compareFileNames(oneName, otherName);
  }
};

var SCMTreeKeyboardNavigationLabelProvider = class {
  constructor(viewMode, labelService) {
    this.viewMode = viewMode;
    this.labelService = labelService;
  }
  getKeyboardNavigationLabel(element) {
    if (ResourceTree.isResourceNode(element)) {
      return element.name;
    } else if (isSCMRepository(element) || isSCMInput(element) || isSCMActionButton(element)) {
      return void 0;
    } else if (isSCMResourceGroup(element)) {
      return element.label;
    } else {
      if (this.viewMode() === "list" /* List */) {
        const fileName = basename2(element.sourceUri);
        const filePath = this.labelService.getUriLabel(element.sourceUri, { relative: true });
        return [fileName, filePath];
      } else {
        return basename2(element.sourceUri);
      }
    }
  }
  getCompressedNodeKeyboardNavigationLabel(elements) {
    const folders = elements;
    return folders.map((e) => e.name).join("/");
  }
};

SCMTreeKeyboardNavigationLabelProvider = __decorateClass([
  __decorateParam(1, ILabelService)
], SCMTreeKeyboardNavigationLabelProvider);

function getSCMResourceId(element) {
  if (isSCMRepository(element)) {
    const provider = element.provider;
    return `repo:${provider.id}`;
  } else if (isSCMInput(element)) {
    const provider = element.repository.provider;
    return `input:${provider.id}`;
  } else if (isSCMActionButton(element)) {
    const provider = element.repository.provider;
    return `actionButton:${provider.id}`;
  } else if (isSCMResourceGroup(element)) {
    const provider = element.provider;
    return `resourceGroup:${provider.id}/${element.id}`;
  } else if (isSCMResource(element)) {
    const group2 = element.resourceGroup;
    const provider = group2.provider;
    return `resource:${provider.id}/${group2.id}/${element.sourceUri.toString()}`;
  } else if (isSCMResourceNode(element)) {
    const group2 = element.context;
    return `folder:${group2.provider.id}/${group2.id}/$FOLDER/${element.uri.toString()}`;
  } else {
    throw new Error("Invalid tree element");
  }
}

var SCMResourceIdentityProvider = class {
  getId(element) {
    return getSCMResourceId(element);
  }
};

var SCMAccessibilityProvider = class {
  constructor(accessibilityService, configurationService, keybindingService, labelService) {
    this.accessibilityService = accessibilityService;
    this.configurationService = configurationService;
    this.keybindingService = keybindingService;
    this.labelService = labelService;
  }
  getWidgetAriaLabel() {
    return localize(18927, null);
  }
  getAriaLabel(element) {
    if (ResourceTree.isResourceNode(element)) {
      return this.labelService.getUriLabel(element.uri, { relative: true, noPrefix: true }) || element.name;
    } else if (isSCMRepository(element)) {
      return `${element.provider.name} ${element.provider.label}`;
    } else if (isSCMInput(element)) {
      const verbosity = this.configurationService.getValue("accessibility.verbosity.sourceControl" /* SourceControl */) === true;
      if (!verbosity || !this.accessibilityService.isScreenReaderOptimized()) {
        return localize(18929, null);
      }
      const kbLabel = this.keybindingService.lookupKeybinding("editor.action.accessibilityHelp" /* OpenAccessibilityHelp */)?.getLabel();
      return kbLabel ? localize(18930, null, kbLabel) : localize(18931, null);
    } else if (isSCMActionButton(element)) {
      return element.button?.command.title ?? "";
    } else if (isSCMResourceGroup(element)) {
      return element.label;
    } else {
      const result = [];
      result.push(basename2(element.sourceUri));
      if (element.decorations.tooltip) {
        result.push(element.decorations.tooltip);
      }
      const path = this.labelService.getUriLabel(dirname2(element.sourceUri), { relative: true, noPrefix: true });
      if (path) {
        result.push(path);
      }
      return result.join(", ");
    }
  }
};

SCMAccessibilityProvider = __decorateClass([
  __decorateParam(0, IAccessibilityService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IKeybindingService),
  __decorateParam(3, ILabelService)
], SCMAccessibilityProvider);

var Menus = {
  ViewSort: new MenuId("SCMViewSort"),
  Repositories: new MenuId("SCMRepositories"),
  ChangesSettings: new MenuId("SCMChangesSettings")
};

var ContextKeys = {
  SCMViewMode: new RawContextKey("scmViewMode", "list" /* List */),
  SCMViewSortKey: new RawContextKey("scmViewSortKey", "path" /* Path */),
  SCMViewAreAllRepositoriesCollapsed: new RawContextKey("scmViewAreAllRepositoriesCollapsed", false),
  SCMViewIsAnyRepositoryCollapsible: new RawContextKey("scmViewIsAnyRepositoryCollapsible", false),
  SCMProvider: new RawContextKey("scmProvider", void 0),
  SCMProviderRootUri: new RawContextKey("scmProviderRootUri", void 0),
  SCMProviderHasRootUri: new RawContextKey("scmProviderHasRootUri", void 0),
  SCMHistoryItemCount: new RawContextKey("scmHistoryItemCount", 0),
  SCMHistoryViewMode: new RawContextKey("scmHistoryViewMode", "list" /* List */),
  SCMCurrentHistoryItemRefHasRemote: new RawContextKey("scmCurrentHistoryItemRefHasRemote", false),
  SCMCurrentHistoryItemRefHasBase: new RawContextKey("scmCurrentHistoryItemRefHasBase", false),
  SCMCurrentHistoryItemRefInFilter: new RawContextKey("scmCurrentHistoryItemRefInFilter", false),
  RepositoryCount: new RawContextKey("scmRepositoryCount", 0),
  RepositoryVisibilityCount: new RawContextKey("scmRepositoryVisibleCount", 0),
  RepositoryVisibility(repository) {
    return new RawContextKey(`scmRepositoryVisible:${repository.provider.id}`, false);
  }
};

MenuRegistry.appendMenuItem(MenuId.SCMTitle, {
  title: localize(18934, null),
  submenu: Menus.ViewSort,
  when: ContextKeyExpr.and(ContextKeyExpr.equals("view", VIEW_PANE_ID), ContextKeys.RepositoryCount.notEqualsTo(0)),
  group: "0_view&sort",
  order: 1
});

MenuRegistry.appendMenuItem(Menus.ViewSort, {
  title: localize(18921, null),
  submenu: Menus.Repositories,
  when: ContextKeyExpr.greater(ContextKeys.RepositoryCount.key, 1),
  group: "0_repositories"
});

var RepositoryVisibilityAction = class extends Action2 {
  constructor(repository) {
    super({
      id: `workbench.scm.action.toggleRepositoryVisibility.${repository.provider.id}`,
      title: repository.provider.name,
      f1: false,
      precondition: ContextKeyExpr.or(ContextKeys.RepositoryVisibilityCount.notEqualsTo(1), ContextKeys.RepositoryVisibility(repository).isEqualTo(false)),
      toggled: ContextKeys.RepositoryVisibility(repository).isEqualTo(true),
      menu: { id: Menus.Repositories, group: "0_repositories" }
    });
    this.repository = repository;
  }
  run(accessor) {
    const scmViewService = accessor.get(ISCMViewService);
    scmViewService.toggleVisibility(this.repository);
  }
};

var RepositoryVisibilityActionController = class {
  constructor(contextKeyService, scmViewService, scmService) {
    this.contextKeyService = contextKeyService;
    this.scmViewService = scmViewService;
    this.items = /* @__PURE__ */ new Map();
    this.disposables = new DisposableStore();
    this.repositoryCountContextKey = ContextKeys.RepositoryCount.bindTo(contextKeyService);
    this.repositoryVisibilityCountContextKey = ContextKeys.RepositoryVisibilityCount.bindTo(contextKeyService);
    scmViewService.onDidChangeVisibleRepositories(this.onDidChangeVisibleRepositories, this, this.disposables);
    scmService.onDidAddRepository(this.onDidAddRepository, this, this.disposables);
    scmService.onDidRemoveRepository(this.onDidRemoveRepository, this, this.disposables);
    for (const repository of scmService.repositories) {
      this.onDidAddRepository(repository);
    }
  }
  onDidAddRepository(repository) {
    if (repository.provider.isHidden) {
      return;
    }
    const action = registerAction2(class extends RepositoryVisibilityAction {
      constructor() {
        super(repository);
      }
    });
    const contextKey = ContextKeys.RepositoryVisibility(repository).bindTo(this.contextKeyService);
    contextKey.set(this.scmViewService.isVisible(repository));
    this.items.set(repository, {
      contextKey,
      dispose() {
        contextKey.reset();
        action.dispose();
      }
    });
    this.updateRepositoryContextKeys();
  }
  onDidRemoveRepository(repository) {
    this.items.get(repository)?.dispose();
    this.items.delete(repository);
    this.updateRepositoryContextKeys();
  }
  onDidChangeVisibleRepositories() {
    let count2 = 0;
    for (const [repository, item] of this.items) {
      const isVisible = this.scmViewService.isVisible(repository);
      item.contextKey.set(isVisible);
      if (isVisible) {
        count2++;
      }
    }
    this.repositoryCountContextKey.set(this.items.size);
    this.repositoryVisibilityCountContextKey.set(count2);
  }
  updateRepositoryContextKeys() {
    this.repositoryCountContextKey.set(this.items.size);
    this.repositoryVisibilityCountContextKey.set(Iterable.reduce(this.items.keys(), (r2, repository) => r2 + (this.scmViewService.isVisible(repository) ? 1 : 0), 0));
  }
  dispose() {
    this.disposables.dispose();
    dispose(this.items.values());
    this.items.clear();
  }
};

RepositoryVisibilityActionController = __decorateClass([
  __decorateParam(0, IContextKeyService),
  __decorateParam(1, ISCMViewService),
  __decorateParam(2, ISCMService)
], RepositoryVisibilityActionController);

var SetListViewModeAction = class extends ViewAction {
  constructor(id2 = "workbench.scm.action.setListViewMode", menu = {}) {
    super({
      id: id2,
      title: localize(18932, null),
      viewId: VIEW_PANE_ID,
      f1: false,
      icon: Codicon.listTree,
      toggled: ContextKeys.SCMViewMode.isEqualTo("list" /* List */),
      menu: { id: Menus.ViewSort, group: "1_viewmode", ...menu }
    });
  }
  async runInView(_, view) {
    view.viewMode = "list" /* List */;
  }
};

var SetListViewModeNavigationAction = class extends SetListViewModeAction {
  constructor() {
    super(
      "workbench.scm.action.setListViewModeNavigation",
      {
        id: MenuId.SCMTitle,
        when: ContextKeyExpr.and(ContextKeyExpr.equals("view", VIEW_PANE_ID), ContextKeys.RepositoryCount.notEqualsTo(0), ContextKeys.SCMViewMode.isEqualTo("tree" /* Tree */)),
        group: "navigation",
        isHiddenByDefault: true,
        order: -1e3
      }
    );
  }
};

var SetTreeViewModeAction = class extends ViewAction {
  constructor(id2 = "workbench.scm.action.setTreeViewMode", menu = {}) {
    super(
      {
        id: id2,
        title: localize(18933, null),
        viewId: VIEW_PANE_ID,
        f1: false,
        icon: Codicon.listFlat,
        toggled: ContextKeys.SCMViewMode.isEqualTo("tree" /* Tree */),
        menu: { id: Menus.ViewSort, group: "1_viewmode", ...menu }
      }
    );
  }
  async runInView(_, view) {
    view.viewMode = "tree" /* Tree */;
  }
};

var SetTreeViewModeNavigationAction = class extends SetTreeViewModeAction {
  constructor() {
    super(
      "workbench.scm.action.setTreeViewModeNavigation",
      {
        id: MenuId.SCMTitle,
        when: ContextKeyExpr.and(ContextKeyExpr.equals("view", VIEW_PANE_ID), ContextKeys.RepositoryCount.notEqualsTo(0), ContextKeys.SCMViewMode.isEqualTo("list" /* List */)),
        group: "navigation",
        isHiddenByDefault: true,
        order: -1e3
      }
    );
  }
};

registerAction2(SetListViewModeAction);

registerAction2(SetTreeViewModeAction);

registerAction2(SetListViewModeNavigationAction);

registerAction2(SetTreeViewModeNavigationAction);

var RepositorySortAction = class extends Action2 {
  constructor(sortKey2, title) {
    super({
      id: `workbench.scm.action.repositories.setSortKey.${sortKey2}`,
      title,
      f1: false,
      toggled: RepositoryContextKeys.RepositorySortKey.isEqualTo(sortKey2),
      menu: [
        {
          id: Menus.Repositories,
          group: "1_sort"
        },
        {
          id: MenuId.SCMSourceControlTitle,
          group: "1_sort"
        }
      ]
    });
    this.sortKey = sortKey2;
  }
  run(accessor) {
    accessor.get(ISCMViewService).toggleSortKey(this.sortKey);
  }
};

var RepositorySortByDiscoveryTimeAction = class extends RepositorySortAction {
  constructor() {
    super("discoveryTime" /* DiscoveryTime */, localize(18924, null));
  }
};

var RepositorySortByNameAction = class extends RepositorySortAction {
  constructor() {
    super("name" /* Name */, localize(18925, null));
  }
};

var RepositorySortByPathAction = class extends RepositorySortAction {
  constructor() {
    super("path" /* Path */, localize(18926, null));
  }
};

registerAction2(RepositorySortByDiscoveryTimeAction);

registerAction2(RepositorySortByNameAction);

registerAction2(RepositorySortByPathAction);

var RepositorySelectionModeAction = class extends Action2 {
  constructor(selectionMode, title, order) {
    super({
      id: `workbench.scm.action.repositories.setSelectionMode.${selectionMode}`,
      title,
      f1: false,
      toggled: RepositoryContextKeys.RepositorySelectionMode.isEqualTo(selectionMode),
      menu: [
        {
          id: Menus.Repositories,
          when: ContextKeyExpr.and(
            ContextKeyExpr.has("scm.providerCount"),
            ContextKeyExpr.greater("scm.providerCount", 1)
          ),
          group: "2_selectionMode",
          order
        },
        {
          id: MenuId.SCMSourceControlTitle,
          when: ContextKeyExpr.and(
            ContextKeyExpr.has("scm.providerCount"),
            ContextKeyExpr.greater("scm.providerCount", 1)
          ),
          group: "2_selectionMode",
          order
        }
      ]
    });
    this.selectionMode = selectionMode;
  }
  run(accessor) {
    accessor.get(ISCMViewService).toggleSelectionMode(this.selectionMode);
  }
};

var RepositorySingleSelectionModeAction = class extends RepositorySelectionModeAction {
  constructor() {
    super("single" /* Single */, localize(18923, null), 1);
  }
};

var RepositoryMultiSelectionModeAction = class extends RepositorySelectionModeAction {
  constructor() {
    super("multiple" /* Multiple */, localize(18922, null), 2);
  }
};

registerAction2(RepositorySingleSelectionModeAction);

registerAction2(RepositoryMultiSelectionModeAction);

var SetSortKeyAction = class extends ViewAction {
  constructor(sortKey2, title) {
    super({
      id: `workbench.scm.action.setSortKey.${sortKey2}`,
      title,
      viewId: VIEW_PANE_ID,
      f1: false,
      toggled: ContextKeys.SCMViewSortKey.isEqualTo(sortKey2),
      precondition: ContextKeys.SCMViewMode.isEqualTo("list" /* List */),
      menu: { id: Menus.ViewSort, group: "2_sort" }
    });
    this.sortKey = sortKey2;
  }
  async runInView(_, view) {
    view.viewSortKey = this.sortKey;
  }
};

var SetSortByNameAction = class extends SetSortKeyAction {
  constructor() {
    super("name" /* Name */, localize(18935, null));
  }
};

var SetSortByPathAction = class extends SetSortKeyAction {
  constructor() {
    super("path" /* Path */, localize(18936, null));
  }
};

var SetSortByStatusAction = class extends SetSortKeyAction {
  constructor() {
    super("status" /* Status */, localize(18937, null));
  }
};

registerAction2(SetSortByNameAction);

registerAction2(SetSortByPathAction);

registerAction2(SetSortByStatusAction);

var CollapseAllRepositoriesAction = class extends ViewAction {
  constructor() {
    super({
      id: `workbench.scm.action.collapseAllRepositories`,
      title: localize(18919, null),
      viewId: VIEW_PANE_ID,
      f1: false,
      icon: Codicon.collapseAll,
      menu: {
        id: MenuId.SCMTitle,
        group: "navigation",
        when: ContextKeyExpr.and(ContextKeyExpr.equals("view", VIEW_PANE_ID), ContextKeys.SCMViewIsAnyRepositoryCollapsible.isEqualTo(true), ContextKeys.SCMViewAreAllRepositoriesCollapsed.isEqualTo(false))
      }
    });
  }
  async runInView(_, view) {
    view.collapseAllRepositories();
  }
};

var ExpandAllRepositoriesAction = class extends ViewAction {
  constructor() {
    super({
      id: `workbench.scm.action.expandAllRepositories`,
      title: localize(18920, null),
      viewId: VIEW_PANE_ID,
      f1: false,
      icon: Codicon.expandAll,
      menu: {
        id: MenuId.SCMTitle,
        group: "navigation",
        when: ContextKeyExpr.and(ContextKeyExpr.equals("view", VIEW_PANE_ID), ContextKeys.SCMViewIsAnyRepositoryCollapsible.isEqualTo(true), ContextKeys.SCMViewAreAllRepositoriesCollapsed.isEqualTo(true))
      }
    });
  }
  async runInView(_, view) {
    view.expandAllRepositories();
  }
};

registerAction2(CollapseAllRepositoriesAction);

registerAction2(ExpandAllRepositoriesAction);

var CollapseAllAction3 = class extends ViewAction {
  constructor() {
    super({
      id: `workbench.scm.action.collapseAll`,
      title: localize(18928, null),
      viewId: VIEW_PANE_ID,
      f1: false,
      icon: Codicon.collapseAll,
      menu: {
        id: MenuId.SCMResourceGroupContext,
        group: "9_collapse",
        when: ContextKeys.SCMViewMode.isEqualTo("tree" /* Tree */)
      }
    });
  }
  async runInView(_accessor, view, context2) {
    if (context2) {
      view.collapseAllResources(context2);
    }
  }
};

registerAction2(CollapseAllAction3);

var SCMViewPane = class extends ViewPane {
  constructor(options3, commandService, editorService, menuService, scmService, scmViewService, storageService, uriIdentityService, keybindingService, themeService, contextMenuService, instantiationService, viewDescriptorService, configurationService, contextKeyService, openerService, hoverService) {
    super({ ...options3, titleMenuId: MenuId.SCMTitle }, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService);
    this.commandService = commandService;
    this.editorService = editorService;
    this.menuService = menuService;
    this.scmService = scmService;
    this.scmViewService = scmViewService;
    this.storageService = storageService;
    this.uriIdentityService = uriIdentityService;
    this._onDidChangeViewMode = this._register(new Emitter());
    this.onDidChangeViewMode = this._onDidChangeViewMode.event;
    this._onDidChangeViewSortKey = this._register(new Emitter());
    this.onDidChangeViewSortKey = this._onDidChangeViewSortKey.event;
    this.items = new DisposableMap();
    this.visibilityDisposables = new DisposableStore();
    this.treeOperationSequencer = new Sequencer();
    this.revealResourceThrottler = new Throttler();
    this.updateChildrenThrottler = new Throttler();
    this.disposables = new DisposableStore();
    this._viewMode = this.getViewMode();
    this._viewSortKey = this.getViewSortKey();
    this.viewModeContextKey = ContextKeys.SCMViewMode.bindTo(contextKeyService);
    this.viewModeContextKey.set(this._viewMode);
    this.viewSortKeyContextKey = ContextKeys.SCMViewSortKey.bindTo(contextKeyService);
    this.viewSortKeyContextKey.set(this.viewSortKey);
    this.areAllRepositoriesCollapsedContextKey = ContextKeys.SCMViewAreAllRepositoriesCollapsed.bindTo(contextKeyService);
    this.isAnyRepositoryCollapsibleContextKey = ContextKeys.SCMViewIsAnyRepositoryCollapsible.bindTo(contextKeyService);
    this.scmProviderContextKey = ContextKeys.SCMProvider.bindTo(contextKeyService);
    this.scmProviderRootUriContextKey = ContextKeys.SCMProviderRootUri.bindTo(contextKeyService);
    this.scmProviderHasRootUriContextKey = ContextKeys.SCMProviderHasRootUri.bindTo(contextKeyService);
    this._onDidLayout = this._register(new Emitter());
    this.layoutCache = { height: void 0, width: void 0, onDidChange: this._onDidLayout.event };
    this.storageService.onDidChangeValue(1 /* WORKSPACE */, void 0, this.disposables)((e) => {
      switch (e.key) {
        case "scm.viewMode":
          this.viewMode = this.getViewMode();
          break;
        case "scm.viewSortKey":
          this.viewSortKey = this.getViewSortKey();
          break;
      }
    }, this, this.disposables);
    this.storageService.onWillSaveState((e) => {
      this.viewMode = this.getViewMode();
      this.viewSortKey = this.getViewSortKey();
      this.storeTreeViewState();
    }, this, this.disposables);
    Event2.any(this.scmService.onDidAddRepository, this.scmService.onDidRemoveRepository)(() => this._onDidChangeViewWelcomeState.fire(), this, this.disposables);
    this.disposables.add(this.revealResourceThrottler);
    this.disposables.add(this.updateChildrenThrottler);
  }
  get viewMode() {
    return this._viewMode;
  }
  set viewMode(mode) {
    if (this._viewMode === mode) {
      return;
    }
    this._viewMode = mode;
    this.viewSortKey = this.getViewSortKey();
    this.updateChildren();
    this.onDidActiveEditorChange();
    this._onDidChangeViewMode.fire(mode);
    this.viewModeContextKey.set(mode);
    this.updateIndentStyles(this.themeService.getFileIconTheme());
    this.storageService.store(`scm.viewMode`, mode, 1 /* WORKSPACE */, 0 /* USER */);
  }
  get viewSortKey() {
    return this._viewSortKey;
  }
  set viewSortKey(sortKey2) {
    if (this._viewSortKey === sortKey2) {
      return;
    }
    this._viewSortKey = sortKey2;
    this.updateChildren();
    this.viewSortKeyContextKey.set(sortKey2);
    this._onDidChangeViewSortKey.fire(sortKey2);
    if (this._viewMode === "list" /* List */) {
      this.storageService.store(`scm.viewSortKey`, sortKey2, 1 /* WORKSPACE */, 0 /* USER */);
    }
  }
  layoutBody(height = this.layoutCache.height, width2 = this.layoutCache.width) {
    if (height === void 0) {
      return;
    }
    if (width2 !== void 0) {
      super.layoutBody(height, width2);
    }
    this.layoutCache.height = height;
    this.layoutCache.width = width2;
    this._onDidLayout.fire();
    this.treeContainer.style.height = `${height}px`;
    this.tree.layout(height, width2);
  }
  renderBody(container3) {
    super.renderBody(container3);
    this.treeContainer = append(container3, $(".scm-view.show-file-icons"));
    this.treeContainer.classList.add("file-icon-themable-tree");
    this.treeContainer.classList.add("show-file-icons");
    const updateActionsVisibility = () => this.treeContainer.classList.toggle("show-actions", this.configurationService.getValue("scm.alwaysShowActions"));
    Event2.filter(this.configurationService.onDidChangeConfiguration, (e) => e.affectsConfiguration("scm.alwaysShowActions"), this.disposables)(updateActionsVisibility, this, this.disposables);
    updateActionsVisibility();
    const updateProviderCountVisibility = () => {
      const value2 = this.configurationService.getValue("scm.providerCountBadge");
      this.treeContainer.classList.toggle("hide-provider-counts", value2 === "hidden");
      this.treeContainer.classList.toggle("auto-provider-counts", value2 === "auto");
    };
    Event2.filter(this.configurationService.onDidChangeConfiguration, (e) => e.affectsConfiguration("scm.providerCountBadge"), this.disposables)(updateProviderCountVisibility, this, this.disposables);
    updateProviderCountVisibility();
    const viewState = this.loadTreeViewState();
    this.createTree(this.treeContainer, viewState);
    this.onDidChangeBodyVisibility(async (visible) => {
      if (visible) {
        this.treeOperationSequencer.queue(async () => {
          await this.tree.setInput(this.scmViewService, viewState);
          Event2.filter(
            this.configurationService.onDidChangeConfiguration,
            (e) => e.affectsConfiguration("scm.alwaysShowRepositories"),
            this.visibilityDisposables
          )(() => {
            this.updateActions();
            this.updateChildren();
          }, this, this.visibilityDisposables);
          Event2.filter(
            this.configurationService.onDidChangeConfiguration,
            (e) => e.affectsConfiguration("scm.inputMinLineCount") || e.affectsConfiguration("scm.inputMaxLineCount") || e.affectsConfiguration("scm.showActionButton"),
            this.visibilityDisposables
          )(() => this.updateChildren(), this, this.visibilityDisposables);
          this.editorService.onDidActiveEditorChange(this.onDidActiveEditorChange, this, this.visibilityDisposables);
          this.scmViewService.onDidChangeVisibleRepositories(this.onDidChangeVisibleRepositories, this, this.visibilityDisposables);
          this.onDidChangeVisibleRepositories({ added: this.scmViewService.visibleRepositories, removed: Iterable.empty() });
          if (typeof this.treeScrollTop === "number") {
            this.tree.scrollTop = this.treeScrollTop;
            this.treeScrollTop = void 0;
          }
          this.updateRepositoryCollapseAllContextKeys();
        });
      } else {
        this.visibilityDisposables.clear();
        this.onDidChangeVisibleRepositories({ added: Iterable.empty(), removed: [...this.items.keys()] });
        this.treeScrollTop = this.tree.scrollTop;
        this.updateRepositoryCollapseAllContextKeys();
      }
    }, this, this.disposables);
    this.disposables.add(this.instantiationService.createInstance(RepositoryVisibilityActionController));
    this.themeService.onDidFileIconThemeChange(this.updateIndentStyles, this, this.disposables);
    this.updateIndentStyles(this.themeService.getFileIconTheme());
  }
  createTree(container3, viewState) {
    const overflowWidgetsDomNode = $(".scm-overflow-widgets-container.monaco-editor");
    this.inputRenderer = this.instantiationService.createInstance(InputRenderer, this.layoutCache, overflowWidgetsDomNode, (input, height) => {
      try {
        this.tree.updateElementHeight(input, height);
      } catch {
      }
    });
    this.actionButtonRenderer = this.instantiationService.createInstance(ActionButtonRenderer);
    this.listLabels = this.instantiationService.createInstance(ResourceLabels, { onDidChangeVisibility: this.onDidChangeBodyVisibility });
    this.disposables.add(this.listLabels);
    const resourceActionRunner = new RepositoryPaneActionRunner(() => this.getSelectedResources());
    resourceActionRunner.onWillRun(() => this.tree.domFocus(), this, this.disposables);
    this.disposables.add(resourceActionRunner);
    const treeDataSource = this.instantiationService.createInstance(SCMTreeDataSource, () => this.viewMode);
    this.disposables.add(treeDataSource);
    const compressionEnabled = observableConfigValue("scm.compactFolders", true, this.configurationService);
    this.tree = this.instantiationService.createInstance(
      WorkbenchCompressibleAsyncDataTree,
      "SCM Tree Repo",
      container3,
      new ListDelegate2(this.inputRenderer),
      new SCMTreeCompressionDelegate(),
      [
        this.inputRenderer,
        this.actionButtonRenderer,
        this.instantiationService.createInstance(RepositoryRenderer, MenuId.SCMTitle, getActionViewItemProvider(this.instantiationService)),
        this.instantiationService.createInstance(ResourceGroupRenderer, getActionViewItemProvider(this.instantiationService), resourceActionRunner),
        this.disposables.add(this.instantiationService.createInstance(ResourceRenderer, () => this.viewMode, this.listLabels, getActionViewItemProvider(this.instantiationService), resourceActionRunner))
      ],
      treeDataSource,
      {
        horizontalScrolling: false,
        setRowLineHeight: false,
        transformOptimization: false,
        filter: new SCMTreeFilter(),
        dnd: new SCMTreeDragAndDrop(this.instantiationService),
        identityProvider: new SCMResourceIdentityProvider(),
        sorter: new SCMTreeSorter(() => this.viewMode, () => this.viewSortKey),
        keyboardNavigationLabelProvider: this.instantiationService.createInstance(SCMTreeKeyboardNavigationLabelProvider, () => this.viewMode),
        overrideStyles: this.getLocationBasedColors().listOverrideStyles,
        compressionEnabled: compressionEnabled.get(),
        collapseByDefault: (e) => {
          return !(isSCMRepository(e) || isSCMResourceGroup(e) || isSCMResourceNode(e));
        },
        accessibilityProvider: this.instantiationService.createInstance(SCMAccessibilityProvider),
        twistieAdditionalCssClass: (e) => {
          if (isSCMActionButton(e) || isSCMInput(e)) {
            return "force-no-twistie";
          }
          return void 0;
        }
      }
    );
    this.disposables.add(this.tree);
    this.tree.onDidOpen(this.open, this, this.disposables);
    this.tree.onContextMenu(this.onListContextMenu, this, this.disposables);
    this.tree.onDidScroll(this.inputRenderer.clearValidation, this.inputRenderer, this.disposables);
    Event2.filter(this.tree.onDidChangeCollapseState, (e) => isSCMRepository(e.node.element?.element), this.disposables)(this.updateRepositoryCollapseAllContextKeys, this, this.disposables);
    this.disposables.add(autorun((reader) => {
      this.tree.updateOptions({
        compressionEnabled: compressionEnabled.read(reader)
      });
    }));
    append(container3, overflowWidgetsDomNode);
  }
  async open(e) {
    if (!e.element) {
      return;
    } else if (isSCMRepository(e.element)) {
      this.scmViewService.focus(e.element);
      return;
    } else if (isSCMInput(e.element)) {
      this.scmViewService.focus(e.element.repository);
      const widget = this.inputRenderer.getRenderedInputWidget(e.element);
      if (widget) {
        widget.focus();
        this.tree.setFocus([], e.browserEvent);
        const selection = this.tree.getSelection();
        if (selection.length === 1 && selection[0] === e.element) {
          setTimeout(() => this.tree.setSelection([]));
        }
      }
      return;
    } else if (isSCMActionButton(e.element)) {
      this.scmViewService.focus(e.element.repository);
      this.actionButtonRenderer.focusActionButton(e.element);
      this.tree.setFocus([], e.browserEvent);
      return;
    } else if (isSCMResourceGroup(e.element)) {
      const provider = e.element.provider;
      const repository = Iterable.find(this.scmService.repositories, (r2) => r2.provider === provider);
      if (repository) {
        this.scmViewService.focus(repository);
      }
      return;
    } else if (isSCMResource(e.element)) {
      if (e.element.command?.id === API_OPEN_EDITOR_COMMAND_ID || e.element.command?.id === API_OPEN_DIFF_EDITOR_COMMAND_ID) {
        if (isPointerEvent(e.browserEvent) && e.browserEvent.button === 1) {
          const resourceGroup = e.element.resourceGroup;
          const title = `${resourceGroup.provider.label}: ${resourceGroup.label}`;
          await OpenScmGroupAction.openMultiFileDiffEditor(this.editorService, title, resourceGroup.provider.rootUri, resourceGroup.id, {
            ...e.editorOptions,
            viewState: {
              revealData: {
                resource: {
                  original: e.element.multiDiffEditorOriginalUri,
                  modified: e.element.multiDiffEditorModifiedUri
                }
              }
            },
            preserveFocus: true
          });
        } else {
          await this.commandService.executeCommand(e.element.command.id, ...e.element.command.arguments || [], e);
        }
      } else {
        await e.element.open(!!e.editorOptions.preserveFocus);
        if (e.editorOptions.pinned) {
          const activeEditorPane = this.editorService.activeEditorPane;
          activeEditorPane?.group.pinEditor(activeEditorPane.input);
        }
      }
      const provider = e.element.resourceGroup.provider;
      const repository = Iterable.find(this.scmService.repositories, (r2) => r2.provider === provider);
      if (repository) {
        this.scmViewService.focus(repository);
      }
    } else if (isSCMResourceNode(e.element)) {
      const provider = e.element.context.provider;
      const repository = Iterable.find(this.scmService.repositories, (r2) => r2.provider === provider);
      if (repository) {
        this.scmViewService.focus(repository);
      }
      return;
    }
  }
  onDidActiveEditorChange() {
    if (!this.configurationService.getValue("scm.autoReveal")) {
      return;
    }
    const uri5 = EditorResourceAccessor.getOriginalUri(this.editorService.activeEditor, { supportSideBySide: 1 /* PRIMARY */ });
    if (!uri5) {
      return;
    }
    if (this.tree.getFocus().some((e) => isSCMResource(e) && this.uriIdentityService.extUri.isEqual(e.sourceUri, uri5)) && this.tree.getSelection().some((e) => isSCMResource(e) && this.uriIdentityService.extUri.isEqual(e.sourceUri, uri5))) {
      return;
    }
    this.revealResourceThrottler.queue(
      () => this.treeOperationSequencer.queue(
        async () => {
          for (const repository of this.scmViewService.visibleRepositories) {
            const item = this.items.get(repository);
            if (!item) {
              continue;
            }
            for (let j = repository.provider.groups.length - 1; j >= 0; j--) {
              const groupItem = repository.provider.groups[j];
              const resource = this.viewMode === "tree" /* Tree */ ? groupItem.resourceTree.getNode(uri5)?.element : groupItem.resources.find((r2) => this.uriIdentityService.extUri.isEqual(r2.sourceUri, uri5));
              if (resource) {
                await this.tree.expandTo(resource);
                this.tree.reveal(resource);
                this.tree.setSelection([resource]);
                this.tree.setFocus([resource]);
                return;
              }
            }
          }
        }
      )
    );
  }
  onDidChangeVisibleRepositories({ added, removed }) {
    for (const repository of added) {
      const repositoryDisposables = new DisposableStore();
      repositoryDisposables.add(autorun((reader) => {
        repository.provider.actionButton.read(reader);
        this.updateChildren(repository);
      }));
      repositoryDisposables.add(repository.input.onDidChangeVisibility(() => this.updateChildren(repository)));
      repositoryDisposables.add(repository.provider.onDidChangeResourceGroups(() => this.updateChildren(repository)));
      const resourceGroupDisposables = repositoryDisposables.add(new DisposableMap());
      const onDidChangeResourceGroups = () => {
        for (const [resourceGroup] of resourceGroupDisposables) {
          if (!repository.provider.groups.includes(resourceGroup)) {
            resourceGroupDisposables.deleteAndDispose(resourceGroup);
          }
        }
        for (const resourceGroup of repository.provider.groups) {
          if (!resourceGroupDisposables.has(resourceGroup)) {
            const disposableStore = new DisposableStore();
            disposableStore.add(resourceGroup.onDidChange(() => this.updateChildren(repository)));
            disposableStore.add(resourceGroup.onDidChangeResources(() => this.updateChildren(repository)));
            resourceGroupDisposables.set(resourceGroup, disposableStore);
          }
        }
      };
      repositoryDisposables.add(repository.provider.onDidChangeResourceGroups(onDidChangeResourceGroups));
      onDidChangeResourceGroups();
      this.items.set(repository, repositoryDisposables);
    }
    for (const repository of removed) {
      this.items.deleteAndDispose(repository);
    }
    this.updateChildren();
    this.onDidActiveEditorChange();
  }
  onListContextMenu(e) {
    if (!e.element) {
      const menu = this.menuService.getMenuActions(Menus.ViewSort, this.contextKeyService);
      const actions2 = getFlatContextMenuActions(menu);
      return this.contextMenuService.showContextMenu({
        getAnchor: () => e.anchor,
        getActions: () => actions2,
        onHide: () => {
        }
      });
    }
    const element = e.element;
    let context2 = element;
    let actions = [];
    const disposables = new DisposableStore();
    let actionRunner = new RepositoryPaneActionRunner(() => this.getSelectedResources());
    disposables.add(actionRunner);
    if (isSCMRepository(element)) {
      const menus = this.scmViewService.menus.getRepositoryMenus(element.provider);
      const menu = menus.getRepositoryContextMenu(element);
      context2 = element.provider;
      actionRunner = new RepositoryActionRunner(() => this.getSelectedRepositories());
      disposables.add(actionRunner);
      actions = collectContextMenuActions(menu);
    } else if (isSCMInput(element) || isSCMActionButton(element)) {
    } else if (isSCMResourceGroup(element)) {
      const menus = this.scmViewService.menus.getRepositoryMenus(element.provider);
      const menu = menus.getResourceGroupMenu(element);
      actions = collectContextMenuActions(menu);
    } else if (isSCMResource(element)) {
      const menus = this.scmViewService.menus.getRepositoryMenus(element.resourceGroup.provider);
      const menu = menus.getResourceMenu(element);
      actions = collectContextMenuActions(menu);
    } else if (isSCMResourceNode(element)) {
      if (element.element) {
        const menus = this.scmViewService.menus.getRepositoryMenus(element.element.resourceGroup.provider);
        const menu = menus.getResourceMenu(element.element);
        actions = collectContextMenuActions(menu);
      } else {
        const menus = this.scmViewService.menus.getRepositoryMenus(element.context.provider);
        const menu = menus.getResourceFolderMenu(element.context);
        actions = collectContextMenuActions(menu);
      }
    }
    disposables.add(actionRunner.onWillRun(() => this.tree.domFocus()));
    this.contextMenuService.showContextMenu({
      actionRunner,
      getAnchor: () => e.anchor,
      getActions: () => actions,
      getActionsContext: () => context2,
      onHide: () => disposables.dispose()
    });
  }
  getSelectedRepositories() {
    const focusedRepositories = this.tree.getFocus().filter((r2) => !!r2 && isSCMRepository(r2));
    const selectedRepositories = this.tree.getSelection().filter((r2) => !!r2 && isSCMRepository(r2));
    return Array.from(/* @__PURE__ */ new Set([...focusedRepositories, ...selectedRepositories]));
  }
  getSelectedResources() {
    return this.tree.getSelection().filter((r2) => isSCMResourceGroup(r2) || isSCMResource(r2) || isSCMResourceNode(r2));
  }
  getViewMode() {
    let mode = this.configurationService.getValue("scm.defaultViewMode") === "list" ? "list" /* List */ : "tree" /* Tree */;
    const storageMode = this.storageService.get(`scm.viewMode`, 1 /* WORKSPACE */);
    if (typeof storageMode === "string") {
      mode = storageMode;
    }
    return mode;
  }
  getViewSortKey() {
    if (this._viewMode === "tree" /* Tree */) {
      return "path" /* Path */;
    }
    let viewSortKey;
    const viewSortKeyString = this.configurationService.getValue("scm.defaultViewSortKey");
    switch (viewSortKeyString) {
      case "name":
        viewSortKey = "name" /* Name */;
        break;
      case "status":
        viewSortKey = "status" /* Status */;
        break;
      default:
        viewSortKey = "path" /* Path */;
        break;
    }
    const storageSortKey = this.storageService.get(`scm.viewSortKey`, 1 /* WORKSPACE */);
    if (typeof storageSortKey === "string") {
      viewSortKey = storageSortKey;
    }
    return viewSortKey;
  }
  loadTreeViewState() {
    const storageViewState = this.storageService.get("scm.viewState2", 1 /* WORKSPACE */);
    if (!storageViewState) {
      return void 0;
    }
    try {
      const treeViewState = JSON.parse(storageViewState);
      return treeViewState;
    } catch {
      return void 0;
    }
  }
  storeTreeViewState() {
    if (this.tree) {
      this.storageService.store("scm.viewState2", JSON.stringify(this.tree.getViewState()), 1 /* WORKSPACE */, 1 /* MACHINE */);
    }
  }
  updateChildren(element) {
    this.updateChildrenThrottler.queue(
      () => this.treeOperationSequencer.queue(
        async () => {
          const focusedInput = this.inputRenderer.getFocusedInput();
          if (element && this.tree.hasNode(element)) {
            await this.tree.updateChildren(element);
          } else {
            await this.tree.updateChildren(void 0);
          }
          if (focusedInput) {
            this.inputRenderer.getRenderedInputWidget(focusedInput)?.focus();
          }
          this.updateScmProviderContextKeys();
          this.updateRepositoryCollapseAllContextKeys();
        }
      )
    );
  }
  updateIndentStyles(theme) {
    this.treeContainer.classList.toggle("list-view-mode", this.viewMode === "list" /* List */);
    this.treeContainer.classList.toggle("tree-view-mode", this.viewMode === "tree" /* Tree */);
    this.treeContainer.classList.toggle("align-icons-and-twisties", this.viewMode === "list" /* List */ && theme.hasFileIcons || theme.hasFileIcons && !theme.hasFolderIcons);
    this.treeContainer.classList.toggle("hide-arrows", this.viewMode === "tree" /* Tree */ && theme.hidesExplorerArrows === true);
  }
  updateScmProviderContextKeys() {
    const alwaysShowRepositories = this.configurationService.getValue("scm.alwaysShowRepositories");
    if (!alwaysShowRepositories && this.items.size === 1) {
      const provider = Iterable.first(this.items.keys()).provider;
      this.scmProviderContextKey.set(provider.providerId);
      this.scmProviderRootUriContextKey.set(provider.rootUri?.toString());
      this.scmProviderHasRootUriContextKey.set(!!provider.rootUri);
    } else {
      this.scmProviderContextKey.set(void 0);
      this.scmProviderRootUriContextKey.set(void 0);
      this.scmProviderHasRootUriContextKey.set(false);
    }
  }
  updateRepositoryCollapseAllContextKeys() {
    if (!this.isBodyVisible() || this.items.size === 1) {
      this.isAnyRepositoryCollapsibleContextKey.set(false);
      this.areAllRepositoriesCollapsedContextKey.set(false);
      return;
    }
    this.isAnyRepositoryCollapsibleContextKey.set(this.scmViewService.visibleRepositories.some((r2) => this.tree.hasNode(r2) && this.tree.isCollapsible(r2)));
    this.areAllRepositoriesCollapsedContextKey.set(this.scmViewService.visibleRepositories.every((r2) => this.tree.hasNode(r2) && (!this.tree.isCollapsible(r2) || this.tree.isCollapsed(r2))));
  }
  collapseAllRepositories() {
    for (const repository of this.scmViewService.visibleRepositories) {
      if (this.tree.isCollapsible(repository)) {
        this.tree.collapse(repository);
      }
    }
  }
  expandAllRepositories() {
    for (const repository of this.scmViewService.visibleRepositories) {
      if (this.tree.isCollapsible(repository)) {
        this.tree.expand(repository);
      }
    }
  }
  collapseAllResources(group2) {
    for (const { element } of this.tree.getNode(group2).children) {
      if (!isSCMViewService(element)) {
        this.tree.collapse(element, true);
      }
    }
  }
  focusPreviousInput() {
    this.treeOperationSequencer.queue(() => this.focusInput(-1));
  }
  focusNextInput() {
    this.treeOperationSequencer.queue(() => this.focusInput(1));
  }
  async focusInput(delta2) {
    if (!this.scmViewService.focusedRepository || this.scmViewService.visibleRepositories.length === 0) {
      return;
    }
    let input = this.scmViewService.focusedRepository.input;
    const repositories = this.scmViewService.visibleRepositories;
    if (repositories.length === 1 && this.inputRenderer.getRenderedInputWidget(input)?.hasFocus() === true) {
      return;
    }
    if (repositories.length > 1 && this.inputRenderer.getRenderedInputWidget(input)?.hasFocus() === true) {
      const focusedRepositoryIndex = repositories.indexOf(this.scmViewService.focusedRepository);
      const newFocusedRepositoryIndex = rot(focusedRepositoryIndex + delta2, repositories.length);
      input = repositories[newFocusedRepositoryIndex].input;
    }
    await this.tree.expandTo(input);
    this.tree.reveal(input);
    this.inputRenderer.getRenderedInputWidget(input)?.focus();
  }
  focusPreviousResourceGroup() {
    this.treeOperationSequencer.queue(() => this.focusResourceGroup(-1));
  }
  focusNextResourceGroup() {
    this.treeOperationSequencer.queue(() => this.focusResourceGroup(1));
  }
  async focusResourceGroup(delta2) {
    if (!this.scmViewService.focusedRepository || this.scmViewService.visibleRepositories.length === 0) {
      return;
    }
    const treeHasDomFocus = isActiveElement(this.tree.getHTMLElement());
    const resourceGroups = this.scmViewService.focusedRepository.provider.groups;
    const focusedResourceGroup = this.tree.getFocus().find((e) => isSCMResourceGroup(e));
    const focusedResourceGroupIndex = treeHasDomFocus && focusedResourceGroup ? resourceGroups.indexOf(focusedResourceGroup) : -1;
    let resourceGroupNext;
    if (focusedResourceGroupIndex === -1) {
      for (const resourceGroup of resourceGroups) {
        if (this.tree.hasNode(resourceGroup)) {
          resourceGroupNext = resourceGroup;
          break;
        }
      }
    } else {
      let index2 = rot(focusedResourceGroupIndex + delta2, resourceGroups.length);
      while (index2 !== focusedResourceGroupIndex) {
        if (this.tree.hasNode(resourceGroups[index2])) {
          resourceGroupNext = resourceGroups[index2];
          break;
        }
        index2 = rot(index2 + delta2, resourceGroups.length);
      }
    }
    if (resourceGroupNext) {
      await this.tree.expandTo(resourceGroupNext);
      this.tree.reveal(resourceGroupNext);
      this.tree.setSelection([resourceGroupNext]);
      this.tree.setFocus([resourceGroupNext]);
      this.tree.domFocus();
    }
  }
  shouldShowWelcome() {
    return this.scmService.repositoryCount === 0;
  }
  getActionsContext() {
    return this.scmViewService.visibleRepositories.length === 1 ? this.scmViewService.visibleRepositories[0].provider : void 0;
  }
  focus() {
    super.focus();
    this.treeOperationSequencer.queue(() => {
      return new Promise((resolve3) => {
        if (this.isExpanded()) {
          if (this.tree.getFocus().length === 0) {
            for (const repository of this.scmViewService.visibleRepositories) {
              const widget = this.inputRenderer.getRenderedInputWidget(repository.input);
              if (widget) {
                widget.focus();
                resolve3();
                return;
              }
            }
          }
          this.tree.domFocus();
          resolve3();
        }
      });
    });
  }
  dispose() {
    this._onDidChangeViewMode.dispose();
    this._onDidChangeViewSortKey.dispose();
    this.visibilityDisposables.dispose();
    this.disposables.dispose();
    this.items.dispose();
    super.dispose();
  }
};

SCMViewPane = __decorateClass([
  __decorateParam(1, ICommandService),
  __decorateParam(2, IEditorService),
  __decorateParam(3, IMenuService),
  __decorateParam(4, ISCMService),
  __decorateParam(5, ISCMViewService),
  __decorateParam(6, IStorageService),
  __decorateParam(7, IUriIdentityService),
  __decorateParam(8, IKeybindingService),
  __decorateParam(9, IThemeService),
  __decorateParam(10, IContextMenuService),
  __decorateParam(11, IInstantiationService),
  __decorateParam(12, IViewDescriptorService),
  __decorateParam(13, IConfigurationService),
  __decorateParam(14, IContextKeyService),
  __decorateParam(15, IOpenerService),
  __decorateParam(16, IHoverService)
], SCMViewPane);

var SCMTreeDataSource = class extends Disposable {
  constructor(viewMode, configurationService, scmViewService) {
    super();
    this.viewMode = viewMode;
    this.configurationService = configurationService;
    this.scmViewService = scmViewService;
  }
  async getChildren(inputOrElement) {
    const repositoryCount = this.scmViewService.visibleRepositories.length;
    const showActionButton = this.configurationService.getValue("scm.showActionButton") === true;
    const alwaysShowRepositories = this.configurationService.getValue("scm.alwaysShowRepositories") === true;
    if (isSCMViewService(inputOrElement) && (repositoryCount > 1 || alwaysShowRepositories)) {
      return this.scmViewService.visibleRepositories;
    } else if (isSCMViewService(inputOrElement) && repositoryCount === 1 && !alwaysShowRepositories || isSCMRepository(inputOrElement)) {
      const children = [];
      inputOrElement = isSCMRepository(inputOrElement) ? inputOrElement : this.scmViewService.visibleRepositories[0];
      const actionButton = inputOrElement.provider.actionButton.get();
      const resourceGroups = inputOrElement.provider.groups;
      if (inputOrElement.input.visible) {
        children.push(inputOrElement.input);
      }
      if (showActionButton && actionButton) {
        children.push({
          type: "actionButton",
          repository: inputOrElement,
          button: actionButton
        });
      }
      const hasSomeChanges = resourceGroups.some((group2) => group2.resources.length > 0);
      if (hasSomeChanges || repositoryCount === 1 && (!showActionButton || !actionButton)) {
        children.push(...resourceGroups);
      }
      return children;
    } else if (isSCMResourceGroup(inputOrElement)) {
      if (this.viewMode() === "list" /* List */) {
        return inputOrElement.resources;
      } else if (this.viewMode() === "tree" /* Tree */) {
        const children = [];
        for (const node of inputOrElement.resourceTree.root.children) {
          children.push(node.element && node.childrenCount === 0 ? node.element : node);
        }
        return children;
      }
    } else if (isSCMResourceNode(inputOrElement)) {
      const children = [];
      for (const node of inputOrElement.children) {
        children.push(node.element && node.childrenCount === 0 ? node.element : node);
      }
      return children;
    }
    return [];
  }
  getParent(element) {
    if (isSCMResourceNode(element)) {
      if (element.parent === element.context.resourceTree.root) {
        return element.context;
      } else if (element.parent) {
        return element.parent;
      } else {
        throw new Error("Invalid element passed to getParent");
      }
    } else if (isSCMResource(element)) {
      if (this.viewMode() === "list" /* List */) {
        return element.resourceGroup;
      }
      const node = element.resourceGroup.resourceTree.getNode(element.sourceUri);
      const result = node?.parent;
      if (!result) {
        throw new Error("Invalid element passed to getParent");
      }
      if (result === element.resourceGroup.resourceTree.root) {
        return element.resourceGroup;
      }
      return result;
    } else if (isSCMInput(element)) {
      return element.repository;
    } else if (isSCMActionButton(element)) {
      return element.repository;
    } else if (isSCMResourceGroup(element)) {
      const repository = this.scmViewService.visibleRepositories.find((r2) => r2.provider === element.provider);
      if (!repository) {
        throw new Error("Invalid element passed to getParent");
      }
      return repository;
    } else if (isSCMRepository(element)) {
      return this.scmViewService;
    } else {
      throw new Error("Unexpected call to getParent");
    }
  }
  hasChildren(inputOrElement) {
    if (isSCMViewService(inputOrElement)) {
      return this.scmViewService.visibleRepositories.length !== 0;
    } else if (isSCMRepository(inputOrElement)) {
      return true;
    } else if (isSCMInput(inputOrElement)) {
      return false;
    } else if (isSCMActionButton(inputOrElement)) {
      return false;
    } else if (isSCMResourceGroup(inputOrElement)) {
      return true;
    } else if (isSCMResource(inputOrElement)) {
      return false;
    } else if (ResourceTree.isResourceNode(inputOrElement)) {
      return inputOrElement.childrenCount > 0;
    } else {
      throw new Error("hasChildren not implemented.");
    }
  }
};

SCMTreeDataSource = __decorateClass([
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, ISCMViewService)
], SCMTreeDataSource);

var SCMActionButton = class {
  constructor(container3, contextMenuService, commandService, notificationService) {
    this.container = container3;
    this.contextMenuService = contextMenuService;
    this.commandService = commandService;
    this.notificationService = notificationService;
    this.disposables = new MutableDisposable();
  }
  dispose() {
    this.disposables?.dispose();
  }
  setButton(button) {
    this.clear();
    if (!button) {
      return;
    }
    if (button.secondaryCommands?.length) {
      const actions = [];
      for (let index2 = 0; index2 < button.secondaryCommands.length; index2++) {
        const commands = button.secondaryCommands[index2];
        for (const command4 of commands) {
          actions.push(toAction({
            id: command4.id,
            label: command4.title,
            enabled: true,
            run: async () => {
              await this.executeCommand(command4.id, ...command4.arguments || []);
            }
          }));
        }
        if (commands.length) {
          actions.push(new Separator());
        }
      }
      actions.pop();
      this.button = new ButtonWithDropdown(this.container, {
        actions,
        addPrimaryActionToDropdown: false,
        contextMenuProvider: this.contextMenuService,
        title: button.command.tooltip,
        supportIcons: true,
        ...defaultButtonStyles
      });
    } else {
      this.button = new Button(this.container, { supportIcons: true, supportShortLabel: !!button.command.shortTitle, title: button.command.tooltip, ...defaultButtonStyles });
    }
    this.button.enabled = button.enabled;
    this.button.label = button.command.title;
    if (this.button instanceof Button && button.command.shortTitle) {
      this.button.labelShort = button.command.shortTitle;
    }
    this.button.onDidClick(async () => await this.executeCommand(button.command.id, ...button.command.arguments || []), null, this.disposables.value);
    this.disposables.value.add(this.button);
  }
  focus() {
    this.button?.focus();
  }
  clear() {
    this.disposables.value = new DisposableStore();
    this.button = void 0;
    clearNode(this.container);
  }
  async executeCommand(commandId, ...args2) {
    try {
      await this.commandService.executeCommand(commandId, ...args2);
    } catch (ex) {
      this.notificationService.error(ex);
    }
  }
};
export { processResourceFilterData, getSCMResourceId, ActionButtonRenderer, SCMTreeDragAndDrop, InputRenderer, ResourceGroupRenderer, RepositoryPaneActionRunner, ResourceRenderer, ListDelegate2, SCMTreeCompressionDelegate, SCMTreeFilter, SCMTreeSorter, SCMTreeKeyboardNavigationLabelProvider, SCMResourceIdentityProvider, SCMAccessibilityProvider, Menus, ContextKeys, RepositoryVisibilityAction, RepositoryVisibilityActionController, SetListViewModeAction, SetListViewModeNavigationAction, SetTreeViewModeAction, SetTreeViewModeNavigationAction, RepositorySortAction, RepositorySortByDiscoveryTimeAction, RepositorySortByNameAction, RepositorySortByPathAction, RepositorySelectionModeAction, RepositorySingleSelectionModeAction, RepositoryMultiSelectionModeAction, SetSortKeyAction, SetSortByNameAction, SetSortByPathAction, SetSortByStatusAction, CollapseAllRepositoriesAction, ExpandAllRepositoriesAction, CollapseAllAction3, SCMViewPane, SCMTreeDataSource, SCMActionButton };
