// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/views/treeView.ts
import { ViewPane, getLocationBasedViewColors } from "./module-1335.mjs";
import { Action2, IMenuService, MenuId, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions13, IViewDescriptorService, ResolvableTreeItem } from "./module-1093.mjs";
import { Disposable, DisposableStore, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { FileThemeIcon, FolderThemeIcon, IThemeService } from "./module-0287.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IHoverService, WorkbenchHoverDelegate } from "./module-0520.mjs";
import { IAccessibleViewInformationService } from "./module-1540.mjs";
import { CommandsRegistry, ICommandService } from "./module-0087.mjs";
import { localize } from "./module-0001.mjs";
import { WorkbenchAsyncDataTree } from "./module-0636.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { IActivityService, NumberBadge } from "./module-1449.mjs";
import { Codicon } from "./module-0085.mjs";
import { CollapseAllAction } from "./module-1527.mjs";
import { $, append, clearNode, getActiveElement, getLargestChildWidth, getTotalHeight, hide, isHTMLElement, prepend, show, trackFocus } from "./module-0075.mjs";
import { setTimeout0 } from "./module-0014.mjs";
import { createActionViewItem, getContextMenuActions } from "./module-0516.mjs";
import { ResourceLabels } from "./module-1323.mjs";
import { CheckboxStateHandler, TreeItemCheckbox } from "./module-1539.mjs";
import { isString } from "./module-0010.mjs";
import { MarkdownString, isMarkdownString } from "./module-0462.mjs";
import { basename2, dirname2 } from "./module-0034.mjs";
import { URI } from "./module-0032.mjs";
import { API_OPEN_DIFF_EDITOR_COMMAND_ID, API_OPEN_EDITOR_COMMAND_ID } from "./module-1538.mjs";
import { CancellationToken, CancellationTokenSource } from "./module-0025.mjs";
import { ActionViewItem } from "./module-0476.mjs";
import { parseLinkedText } from "./module-1329.mjs";
import { Button } from "./module-0546.mjs";
import { defaultButtonStyles } from "./module-0513.mjs";
import { Schemas } from "./module-0033.mjs";
import { isFalsyOrWhitespace } from "./module-0030.mjs";
import { IProgressService } from "./module-0446.mjs";
import { ILogService } from "./module-0095.mjs";
import { IMarkdownRendererService } from "./module-0541.mjs";
import { ActionBar } from "./module-0477.mjs";
import { renderAsPlaintext } from "./module-0468.mjs";
import { isDark } from "./module-0247.mjs";
import { createMatches } from "./module-0453.mjs";
import { asCSSUrl } from "./module-0449.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { ILabelService } from "./module-0641.mjs";
import { ActionRunner, Separator } from "./module-0082.mjs";
import { isCancellationError } from "./module-0004.mjs";
import { TelemetryTrustedValue } from "./module-0885.mjs";
import { timeout } from "./module-0036.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { CodeDataTransfers, LocalSelectionTransfer } from "./module-0273.mjs";
import { generateUuid } from "./module-0190.mjs";
import { DraggedTreeItemsIdentifier } from "./module-0669.mjs";
import { Mimes } from "./module-0136.mjs";
import { DataTransfers } from "./module-0263.mjs";
import { fillEditorsDragData } from "./module-1381.mjs";
import { toExternalVSDataTransfer } from "./module-0274.mjs";
import { VSDataTransfer } from "./module-0264.mjs";
import { ITreeViewsDnDService } from "./module-0670.mjs";


// src/vs/workbench/browser/parts/views/treeView.ts
var TreeViewPane = class extends ViewPane {
  constructor(options3, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, notificationService, hoverService, accessibleViewService) {
    super({ ...options3, titleMenuId: MenuId.ViewTitle, donotForwardArgs: false }, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService, accessibleViewService);
    const { treeView } = Registry.as(Extensions13.ViewsRegistry).getView(options3.id);
    this.treeView = treeView;
    this._register(this.treeView.onDidChangeActions(() => this.updateActions(), this));
    this._register(this.treeView.onDidChangeTitle((newTitle) => this.updateTitle(newTitle)));
    this._register(this.treeView.onDidChangeDescription((newDescription) => this.updateTitleDescription(newDescription)));
    this._register(toDisposable(() => {
      if (this._container && this.treeView.container && this._container === this.treeView.container) {
        this.treeView.setVisibility(false);
      }
    }));
    this._register(this.onDidChangeBodyVisibility(() => this.updateTreeVisibility()));
    this._register(this.treeView.onDidChangeWelcomeState(() => this._onDidChangeViewWelcomeState.fire()));
    if (options3.title !== this.treeView.title) {
      this.updateTitle(this.treeView.title);
    }
    if (options3.titleDescription !== this.treeView.description) {
      this.updateTitleDescription(this.treeView.description);
    }
    this._actionRunner = this._register(new MultipleSelectionActionRunner(notificationService, () => this.treeView.getSelection()));
    this.updateTreeVisibility();
  }
  focus() {
    super.focus();
    this.treeView.focus();
  }
  renderBody(container3) {
    this._container = container3;
    super.renderBody(container3);
    this.renderTreeView(container3);
  }
  shouldShowWelcome() {
    return (this.treeView.dataProvider === void 0 || !!this.treeView.dataProvider.isTreeEmpty) && (this.treeView.message === void 0 || this.treeView.message === "");
  }
  layoutBody(height, width2) {
    super.layoutBody(height, width2);
    this.layoutTreeView(height, width2);
  }
  getOptimalWidth() {
    return this.treeView.getOptimalWidth();
  }
  renderTreeView(container3) {
    this.treeView.show(container3);
  }
  layoutTreeView(height, width2) {
    this.treeView.layout(height, width2);
  }
  updateTreeVisibility() {
    this.treeView.setVisibility(this.isBodyVisible());
  }
  getActionRunner() {
    return this._actionRunner;
  }
  getActionsContext() {
    return { $treeViewId: this.id, $focusedTreeItem: true, $selectedTreeItems: true };
  }
};

TreeViewPane = __decorateClass([
  __decorateParam(1, IKeybindingService),
  __decorateParam(2, IContextMenuService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, IViewDescriptorService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, IOpenerService),
  __decorateParam(8, IThemeService),
  __decorateParam(9, INotificationService),
  __decorateParam(10, IHoverService),
  __decorateParam(11, IAccessibleViewInformationService)
], TreeViewPane);

var Root = class {
  constructor() {
    this.label = { label: "root" };
    this.handle = "0";
    this.parentHandle = void 0;
    this.collapsibleState = 2 /* Expanded */;
    this.children = void 0;
  }
};

function commandPreconditions(commandId) {
  const command4 = CommandsRegistry.getCommand(commandId);
  if (command4) {
    const commandAction = MenuRegistry.getCommand(command4.id);
    return commandAction?.precondition;
  }
  return void 0;
}

function isTreeCommandEnabled(treeCommand, contextKeyService) {
  const commandId = treeCommand.originalId ? treeCommand.originalId : treeCommand.id;
  const precondition2 = commandPreconditions(commandId);
  if (precondition2) {
    return contextKeyService.contextMatchesRules(precondition2);
  }
  return true;
}

function isRenderedMessageValue(messageValue) {
  return !!messageValue && typeof messageValue !== "string" && !!messageValue.element && !!messageValue.disposables;
}

var noDataProviderMessage = localize(6967, null);

var RawCustomTreeViewContextKey = new RawContextKey("customTreeView", false);

var Tree = class extends WorkbenchAsyncDataTree {
};

var AbstractTreeView = class extends Disposable {
  constructor(id2, _title, themeService, instantiationService, commandService, configurationService, progressService, contextMenuService, keybindingService, notificationService, viewDescriptorService, hoverService, contextKeyService, activityService, logService, openerService, markdownRendererService) {
    super();
    this.id = id2;
    this._title = _title;
    this.themeService = themeService;
    this.instantiationService = instantiationService;
    this.commandService = commandService;
    this.configurationService = configurationService;
    this.progressService = progressService;
    this.contextMenuService = contextMenuService;
    this.keybindingService = keybindingService;
    this.notificationService = notificationService;
    this.viewDescriptorService = viewDescriptorService;
    this.hoverService = hoverService;
    this.contextKeyService = contextKeyService;
    this.activityService = activityService;
    this.logService = logService;
    this.openerService = openerService;
    this.markdownRendererService = markdownRendererService;
    this.isVisible = false;
    this._hasIconForParentNode = false;
    this._hasIconForLeafNode = false;
    this.focused = false;
    this._canSelectMany = false;
    this._manuallyManageCheckboxes = false;
    this.elementsToRefresh = [];
    this.lastSelection = [];
    this._onDidExpandItem = this._register(new Emitter());
    this._onDidCollapseItem = this._register(new Emitter());
    this._onDidChangeSelectionAndFocus = this._register(new Emitter());
    this._onDidChangeVisibility = this._register(new Emitter());
    this._onDidChangeActions = this._register(new Emitter());
    this._onDidChangeWelcomeState = this._register(new Emitter());
    this._onDidChangeTitle = this._register(new Emitter());
    this._onDidChangeDescription = this._register(new Emitter());
    this._onDidChangeCheckboxState = this._register(new Emitter());
    this._onDidCompleteRefresh = this._register(new Emitter());
    this._isInitialized = false;
    this._activity = this._register(new MutableDisposable());
    this.activated = false;
    this.treeDisposables = this._register(new DisposableStore());
    this._height = 0;
    this._width = 0;
    this.refreshing = false;
    this.root = new Root();
    this.lastActive = this.root;
  }
  get onDidExpandItem() {
    return this._onDidExpandItem.event;
  }
  get onDidCollapseItem() {
    return this._onDidCollapseItem.event;
  }
  get onDidChangeSelectionAndFocus() {
    return this._onDidChangeSelectionAndFocus.event;
  }
  get onDidChangeVisibility() {
    return this._onDidChangeVisibility.event;
  }
  get onDidChangeActions() {
    return this._onDidChangeActions.event;
  }
  get onDidChangeWelcomeState() {
    return this._onDidChangeWelcomeState.event;
  }
  get onDidChangeTitle() {
    return this._onDidChangeTitle.event;
  }
  get onDidChangeDescription() {
    return this._onDidChangeDescription.event;
  }
  get onDidChangeCheckboxState() {
    return this._onDidChangeCheckboxState.event;
  }
  initialize() {
    if (this._isInitialized) {
      return;
    }
    this._isInitialized = true;
    this.contextKeyService.bufferChangeEvents(() => {
      this.initializeShowCollapseAllAction();
      this.initializeCollapseAllToggle();
      this.initializeShowRefreshAction();
    });
    this.treeViewDnd = this.instantiationService.createInstance(CustomTreeViewDragAndDrop, this.id);
    if (this._dragAndDropController) {
      this.treeViewDnd.controller = this._dragAndDropController;
    }
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("explorer.decorations")) {
        this.doRefresh([this.root]);
      }
    }));
    this._register(this.viewDescriptorService.onDidChangeLocation(({ views, from, to }) => {
      if (views.some((v2) => v2.id === this.id)) {
        this.tree?.updateOptions({ overrideStyles: getLocationBasedViewColors(this.viewLocation).listOverrideStyles });
      }
    }));
    this.registerActions();
    this.create();
  }
  get viewContainer() {
    return this.viewDescriptorService.getViewContainerByViewId(this.id);
  }
  get viewLocation() {
    return this.viewDescriptorService.getViewLocationById(this.id);
  }
  get dragAndDropController() {
    return this._dragAndDropController;
  }
  set dragAndDropController(dnd) {
    this._dragAndDropController = dnd;
    if (this.treeViewDnd) {
      this.treeViewDnd.controller = dnd;
    }
  }
  get dataProvider() {
    return this._dataProvider;
  }
  set dataProvider(dataProvider) {
    if (dataProvider) {
      if (this.visible) {
        this.activate();
      }
      const self2 = this;
      this._dataProvider = new class {
        constructor() {
          this._isEmpty = true;
          this._onDidChangeEmpty = new Emitter();
          this.onDidChangeEmpty = this._onDidChangeEmpty.event;
        }
        get isTreeEmpty() {
          return this._isEmpty;
        }
        async getChildren(element) {
          const batches = await this.getChildrenBatch(element ? [element] : void 0);
          return batches?.[0];
        }
        updateEmptyState(nodes, childrenGroups) {
          if (nodes.length === 1 && nodes[0] instanceof Root) {
            const oldEmpty = this._isEmpty;
            this._isEmpty = childrenGroups.length === 0 || childrenGroups[0].length === 0;
            if (oldEmpty !== this._isEmpty) {
              this._onDidChangeEmpty.fire();
            }
          }
        }
        findCheckboxesUpdated(nodes, childrenGroups) {
          if (childrenGroups.length === 0) {
            return [];
          }
          const checkboxesUpdated = [];
          for (let i2 = 0; i2 < nodes.length; i2++) {
            const node = nodes[i2];
            const children = childrenGroups[i2];
            for (const child of children) {
              child.parent = node;
              if (!self2.manuallyManageCheckboxes && node?.checkbox?.isChecked === true && child.checkbox?.isChecked === false) {
                child.checkbox.isChecked = true;
                checkboxesUpdated.push(child);
              }
            }
          }
          return checkboxesUpdated;
        }
        async getChildrenBatch(nodes) {
          let childrenGroups;
          let checkboxesUpdated = [];
          if (nodes?.every((node) => !!node.children)) {
            childrenGroups = nodes.map((node) => node.children);
          } else {
            nodes = nodes ?? [self2.root];
            const batchedChildren = await (nodes.length === 1 && nodes[0] instanceof Root ? doGetChildrenOrBatch(dataProvider, void 0) : doGetChildrenOrBatch(dataProvider, nodes));
            for (let i2 = 0; i2 < nodes.length; i2++) {
              const node = nodes[i2];
              node.children = batchedChildren ? batchedChildren[i2] : void 0;
            }
            childrenGroups = batchedChildren ?? [];
            checkboxesUpdated = this.findCheckboxesUpdated(nodes, childrenGroups);
          }
          this.updateEmptyState(nodes, childrenGroups);
          if (checkboxesUpdated.length > 0) {
            self2._onDidChangeCheckboxState.fire(checkboxesUpdated);
          }
          return childrenGroups;
        }
      }();
      if (this._dataProvider.onDidChangeEmpty) {
        this._register(this._dataProvider.onDidChangeEmpty(() => {
          this.updateCollapseAllToggle();
          this._onDidChangeWelcomeState.fire();
        }));
      }
      this.updateMessage();
      this.refresh();
    } else {
      this._dataProvider = void 0;
      this.treeDisposables.clear();
      this.activated = false;
      this.updateMessage();
    }
    this._onDidChangeWelcomeState.fire();
  }
  get message() {
    return this._message;
  }
  set message(message) {
    this._message = message;
    this.updateMessage();
    this._onDidChangeWelcomeState.fire();
  }
  get title() {
    return this._title;
  }
  set title(name) {
    this._title = name;
    if (this.tree) {
      this.tree.ariaLabel = this._title;
    }
    this._onDidChangeTitle.fire(this._title);
  }
  get description() {
    return this._description;
  }
  set description(description) {
    this._description = description;
    this._onDidChangeDescription.fire(this._description);
  }
  get badge() {
    return this._badge;
  }
  set badge(badge) {
    if (this._badge?.value === badge?.value && this._badge?.tooltip === badge?.tooltip) {
      return;
    }
    this._badge = badge;
    if (badge) {
      const activity = {
        badge: new NumberBadge(badge.value, () => badge.tooltip),
        priority: 50
      };
      this._activity.value = this.activityService.showViewActivity(this.id, activity);
    } else {
      this._activity.clear();
    }
  }
  get canSelectMany() {
    return this._canSelectMany;
  }
  set canSelectMany(canSelectMany) {
    const oldCanSelectMany = this._canSelectMany;
    this._canSelectMany = canSelectMany;
    if (this._canSelectMany !== oldCanSelectMany) {
      this.tree?.updateOptions({ multipleSelectionSupport: this.canSelectMany });
    }
  }
  get manuallyManageCheckboxes() {
    return this._manuallyManageCheckboxes;
  }
  set manuallyManageCheckboxes(manuallyManageCheckboxes) {
    this._manuallyManageCheckboxes = manuallyManageCheckboxes;
  }
  get hasIconForParentNode() {
    return this._hasIconForParentNode;
  }
  get hasIconForLeafNode() {
    return this._hasIconForLeafNode;
  }
  get visible() {
    return this.isVisible;
  }
  initializeShowCollapseAllAction(startingValue = false) {
    if (!this.collapseAllContext) {
      this.collapseAllContextKey = new RawContextKey(`treeView.${this.id}.enableCollapseAll`, startingValue, localize(6974, null, this.id));
      this.collapseAllContext = this.collapseAllContextKey.bindTo(this.contextKeyService);
    }
    return true;
  }
  get showCollapseAllAction() {
    this.initializeShowCollapseAllAction();
    return !!this.collapseAllContext?.get();
  }
  set showCollapseAllAction(showCollapseAllAction) {
    this.initializeShowCollapseAllAction(showCollapseAllAction);
    this.collapseAllContext?.set(showCollapseAllAction);
  }
  initializeShowRefreshAction(startingValue = false) {
    if (!this.refreshContext) {
      this.refreshContextKey = new RawContextKey(`treeView.${this.id}.enableRefresh`, startingValue, localize(6975, null, this.id));
      this.refreshContext = this.refreshContextKey.bindTo(this.contextKeyService);
    }
  }
  get showRefreshAction() {
    this.initializeShowRefreshAction();
    return !!this.refreshContext?.get();
  }
  set showRefreshAction(showRefreshAction) {
    this.initializeShowRefreshAction(showRefreshAction);
    this.refreshContext?.set(showRefreshAction);
  }
  registerActions() {
    const that = this;
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: `workbench.actions.treeView.${that.id}.refresh`,
          title: localize(6968, null),
          menu: {
            id: MenuId.ViewTitle,
            when: ContextKeyExpr.and(ContextKeyExpr.equals("view", that.id), that.refreshContextKey),
            group: "navigation",
            order: Number.MAX_SAFE_INTEGER - 1
          },
          icon: Codicon.refresh
        });
      }
      async run() {
        return that.refresh();
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: `workbench.actions.treeView.${that.id}.collapseAll`,
          title: localize(6965, null),
          menu: {
            id: MenuId.ViewTitle,
            when: ContextKeyExpr.and(ContextKeyExpr.equals("view", that.id), that.collapseAllContextKey),
            group: "navigation",
            order: Number.MAX_SAFE_INTEGER
          },
          precondition: that.collapseAllToggleContextKey,
          icon: Codicon.collapseAll
        });
      }
      async run() {
        if (that.tree) {
          return new CollapseAllAction(that.tree, true).run();
        }
      }
    }));
  }
  setVisibility(isVisible) {
    this.initialize();
    isVisible = !!isVisible;
    if (this.isVisible === isVisible) {
      return;
    }
    this.isVisible = isVisible;
    if (this.tree) {
      if (this.isVisible) {
        show(this.tree.getHTMLElement());
      } else {
        hide(this.tree.getHTMLElement());
      }
      if (this.isVisible && this.elementsToRefresh.length && this.dataProvider) {
        this.doRefresh(this.elementsToRefresh);
        this.elementsToRefresh = [];
      }
    }
    setTimeout0(() => {
      if (this.dataProvider) {
        this._onDidChangeVisibility.fire(this.isVisible);
      }
    });
    if (this.visible) {
      this.activate();
    }
  }
  focus(reveal = true, revealItem) {
    if (this.tree && this.root.children && this.root.children.length > 0) {
      const element = revealItem ?? this.tree.getSelection()[0];
      if (element && reveal) {
        this.tree.reveal(element, 0.5);
      }
      this.tree.domFocus();
    } else if (this.tree && this.treeContainer && !this.treeContainer.classList.contains("hide")) {
      this.tree.domFocus();
    } else {
      this.domNode.focus();
    }
  }
  show(container3) {
    this._container = container3;
    append(container3, this.domNode);
  }
  create() {
    this.domNode = $(".tree-explorer-viewlet-tree-view");
    this.messageElement = append(this.domNode, $(".message"));
    this.updateMessage();
    this.treeContainer = append(this.domNode, $(".customview-tree"));
    this.treeContainer.classList.add("file-icon-themable-tree", "show-file-icons");
    const focusTracker = this._register(trackFocus(this.domNode));
    this._register(focusTracker.onDidFocus(() => this.focused = true));
    this._register(focusTracker.onDidBlur(() => this.focused = false));
  }
  createTree() {
    this.treeDisposables.clear();
    const actionViewItemProvider = createActionViewItem.bind(void 0, this.instantiationService);
    const treeMenus = this.treeDisposables.add(this.instantiationService.createInstance(TreeMenus, this.id));
    this.treeLabels = this.treeDisposables.add(this.instantiationService.createInstance(ResourceLabels, this));
    const dataSource = this.instantiationService.createInstance(TreeDataSource, this, (task) => this.progressService.withProgress({ location: this.id }, () => task));
    const aligner = this.treeDisposables.add(new Aligner(this.themeService, this.logService));
    const checkboxStateHandler = this.treeDisposables.add(new CheckboxStateHandler());
    const renderer = this.treeDisposables.add(this.instantiationService.createInstance(TreeRenderer2, this.id, treeMenus, this.treeLabels, actionViewItemProvider, aligner, checkboxStateHandler, () => this.manuallyManageCheckboxes));
    this.treeDisposables.add(renderer.onDidChangeCheckboxState((e) => this._onDidChangeCheckboxState.fire(e)));
    const widgetAriaLabel = this._title;
    this.tree = this.treeDisposables.add(this.instantiationService.createInstance(
      Tree,
      this.id,
      this.treeContainer,
      new TreeViewDelegate(),
      [renderer],
      dataSource,
      {
        identityProvider: new TreeViewIdentityProvider(),
        accessibilityProvider: {
          getAriaLabel(element) {
            if (element.accessibilityInformation) {
              return element.accessibilityInformation.label;
            }
            if (isString(element.tooltip)) {
              return treeMenus.getResourceActions([element]).length > 0 ? localize(6973, null, element.tooltip) : element.tooltip;
            } else {
              if (element.resourceUri && !element.label) {
                return null;
              }
              let buildAriaLabel = "";
              if (element.label) {
                const labelText = isMarkdownString(element.label.label) ? element.label.label.value : element.label.label;
                buildAriaLabel += labelText + " ";
              }
              if (element.description) {
                buildAriaLabel += element.description;
              }
              if (treeMenus.getResourceActions([element]).length > 0) {
                buildAriaLabel = buildAriaLabel ? localize(6972, null, buildAriaLabel.trim()) : localize(6971, null);
              }
              return buildAriaLabel;
            }
          },
          getRole(element) {
            return element.accessibilityInformation?.role ?? "treeitem";
          },
          getWidgetAriaLabel() {
            return widgetAriaLabel;
          }
        },
        keyboardNavigationLabelProvider: {
          getKeyboardNavigationLabel: (item) => {
            if (item.label) {
              return isMarkdownString(item.label.label) ? item.label.label.value : item.label.label;
            }
            return item.resourceUri ? basename2(URI.revive(item.resourceUri)) : void 0;
          }
        },
        expandOnlyOnTwistieClick: (e) => {
          return !!e.command || !!e.checkbox || this.configurationService.getValue("workbench.tree.expandMode") === "doubleClick";
        },
        collapseByDefault: (e) => {
          return e.collapsibleState !== 2 /* Expanded */;
        },
        multipleSelectionSupport: this.canSelectMany,
        dnd: this.treeViewDnd,
        overrideStyles: getLocationBasedViewColors(this.viewLocation).listOverrideStyles
      }
    ));
    this.treeDisposables.add(renderer.onDidChangeMenuContext((e) => e.forEach((e2) => this.tree?.rerender(e2))));
    this.treeDisposables.add(this.tree);
    treeMenus.setContextKeyService(this.tree.contextKeyService);
    aligner.tree = this.tree;
    const actionRunner = this.treeDisposables.add(new MultipleSelectionActionRunner(this.notificationService, () => this.tree.getSelection()));
    renderer.actionRunner = actionRunner;
    this.tree.contextKeyService.createKey(this.id, true);
    const customTreeKey = RawCustomTreeViewContextKey.bindTo(this.tree.contextKeyService);
    customTreeKey.set(true);
    this.treeDisposables.add(this.tree.onContextMenu((e) => this.onContextMenu(treeMenus, e, actionRunner)));
    this.treeDisposables.add(this.tree.onDidChangeSelection((e) => {
      this.lastSelection = e.elements;
      this.lastActive = this.tree?.getFocus()[0] ?? this.lastActive;
      this._onDidChangeSelectionAndFocus.fire({ selection: this.lastSelection, focus: this.lastActive });
    }));
    this.treeDisposables.add(this.tree.onDidChangeFocus((e) => {
      if (e.elements.length && e.elements[0] !== this.lastActive) {
        this.lastActive = e.elements[0];
        this.lastSelection = this.tree?.getSelection() ?? this.lastSelection;
        this._onDidChangeSelectionAndFocus.fire({ selection: this.lastSelection, focus: this.lastActive });
      }
    }));
    this.treeDisposables.add(this.tree.onDidChangeCollapseState((e) => {
      if (!e.node.element) {
        return;
      }
      const element = Array.isArray(e.node.element.element) ? e.node.element.element[0] : e.node.element.element;
      if (e.node.collapsed) {
        this._onDidCollapseItem.fire(element);
      } else {
        this._onDidExpandItem.fire(element);
      }
    }));
    this.tree.setInput(this.root).then(() => this.updateContentAreas());
    this.treeDisposables.add(this.tree.onDidOpen(async (e) => {
      if (!e.browserEvent) {
        return;
      }
      if (e.browserEvent.target && e.browserEvent.target.classList.contains(TreeItemCheckbox.checkboxClass)) {
        return;
      }
      const selection = this.tree.getSelection();
      const command4 = await this.resolveCommand(selection.length === 1 ? selection[0] : void 0);
      if (command4 && isTreeCommandEnabled(command4, this.contextKeyService)) {
        let args2 = command4.arguments || [];
        if (command4.id === API_OPEN_EDITOR_COMMAND_ID || command4.id === API_OPEN_DIFF_EDITOR_COMMAND_ID) {
          args2 = [...args2, e];
        }
        try {
          await this.commandService.executeCommand(command4.id, ...args2);
        } catch (err) {
          this.notificationService.error(err);
        }
      }
    }));
    this.treeDisposables.add(treeMenus.onDidChange((changed) => {
      if (this.tree?.hasNode(changed)) {
        this.tree?.rerender(changed);
      }
    }));
  }
  async resolveCommand(element) {
    let command4 = element?.command;
    if (element && !command4) {
      if (element instanceof ResolvableTreeItem && element.hasResolve) {
        await element.resolve(CancellationToken.None);
        command4 = element.command;
      }
    }
    return command4;
  }
  onContextMenu(treeMenus, treeEvent, actionRunner) {
    this.hoverService.hideHover();
    const node = treeEvent.element;
    if (node === null) {
      return;
    }
    const event = treeEvent.browserEvent;
    event.preventDefault();
    event.stopPropagation();
    this.tree.setFocus([node]);
    let selected = this.canSelectMany ? this.getSelection() : [];
    if (!selected.find((item) => item.handle === node.handle)) {
      selected = [node];
    }
    const actions = treeMenus.getResourceContextActions(selected);
    if (!actions.length) {
      return;
    }
    this.contextMenuService.showContextMenu({
      getAnchor: () => treeEvent.anchor,
      getActions: () => actions,
      getActionViewItem: (action) => {
        const keybinding = this.keybindingService.lookupKeybinding(action.id);
        if (keybinding) {
          return new ActionViewItem(action, action, { label: true, keybinding: keybinding.getLabel() });
        }
        return void 0;
      },
      onHide: (wasCancelled) => {
        if (wasCancelled) {
          this.tree.domFocus();
        }
      },
      getActionsContext: () => ({ $treeViewId: this.id, $treeItemHandle: node.handle }),
      actionRunner
    });
  }
  updateMessage() {
    if (this._message) {
      this.showMessage(this._message);
    } else if (!this.dataProvider) {
      this.showMessage(noDataProviderMessage);
    } else {
      this.hideMessage();
    }
    this.updateContentAreas();
  }
  processMessage(message, disposables) {
    const lines = message.value.split("\n");
    const result = [];
    let hasFoundButton = false;
    for (const line of lines) {
      const linkedText = parseLinkedText(line);
      if (linkedText.nodes.length === 1 && typeof linkedText.nodes[0] !== "string") {
        const node = linkedText.nodes[0];
        const buttonContainer = document.createElement("div");
        buttonContainer.classList.add("button-container");
        const button = new Button(buttonContainer, { title: node.title, secondary: hasFoundButton, supportIcons: true, ...defaultButtonStyles });
        button.label = node.label;
        button.onDidClick((_) => {
          this.openerService.open(node.href, { allowCommands: true });
        }, null, disposables);
        const href = URI.parse(node.href);
        if (href.scheme === Schemas.command) {
          const preConditions = commandPreconditions(href.path);
          if (preConditions) {
            button.enabled = this.contextKeyService.contextMatchesRules(preConditions);
            disposables.add(this.contextKeyService.onDidChangeContext((e) => {
              if (e.affectsSome(new Set(preConditions.keys()))) {
                button.enabled = this.contextKeyService.contextMatchesRules(preConditions);
              }
            }));
          }
        }
        disposables.add(button);
        hasFoundButton = true;
        result.push(buttonContainer);
      } else {
        hasFoundButton = false;
        const rendered = this.markdownRendererService.render(new MarkdownString(line, { isTrusted: message.isTrusted, supportThemeIcons: message.supportThemeIcons, supportHtml: message.supportHtml }));
        result.push(rendered.element);
        disposables.add(rendered);
      }
    }
    const container3 = document.createElement("div");
    container3.classList.add("rendered-message");
    for (const child of result) {
      if (isHTMLElement(child)) {
        container3.appendChild(child);
      } else {
        container3.appendChild(child.element);
      }
    }
    return container3;
  }
  showMessage(message) {
    if (isRenderedMessageValue(this._messageValue)) {
      this._messageValue.disposables.dispose();
    }
    if (isMarkdownString(message)) {
      const disposables = new DisposableStore();
      const renderedMessage = this.processMessage(message, disposables);
      this._messageValue = { element: renderedMessage, disposables };
    } else {
      this._messageValue = message;
    }
    if (!this.messageElement) {
      return;
    }
    this.messageElement.classList.remove("hide");
    this.resetMessageElement();
    if (typeof this._messageValue === "string" && !isFalsyOrWhitespace(this._messageValue)) {
      this.messageElement.textContent = this._messageValue;
    } else if (isRenderedMessageValue(this._messageValue)) {
      this.messageElement.appendChild(this._messageValue.element);
    }
    this.layout(this._height, this._width);
  }
  hideMessage() {
    this.resetMessageElement();
    this.messageElement?.classList.add("hide");
    this.layout(this._height, this._width);
  }
  resetMessageElement() {
    if (this.messageElement) {
      clearNode(this.messageElement);
    }
  }
  layout(height, width2) {
    if (height && width2 && this.messageElement && this.treeContainer) {
      this._height = height;
      this._width = width2;
      const treeHeight = height - getTotalHeight(this.messageElement);
      this.treeContainer.style.height = treeHeight + "px";
      this.tree?.layout(treeHeight, width2);
    }
  }
  getOptimalWidth() {
    if (this.tree) {
      const parentNode = this.tree.getHTMLElement();
      const childNodes = [].slice.call(parentNode.querySelectorAll(".outline-item-label > a"));
      return getLargestChildWidth(parentNode, childNodes);
    }
    return 0;
  }
  updateCheckboxes(elements) {
    return setCascadingCheckboxUpdates(elements);
  }
  async refresh(elements, checkboxes) {
    if (this.dataProvider && this.tree) {
      if (this.refreshing) {
        await Event2.toPromise(this._onDidCompleteRefresh.event);
      }
      if (!elements) {
        elements = [this.root];
        this.elementsToRefresh = [];
      }
      for (const element of elements) {
        element.children = void 0;
      }
      if (this.isVisible) {
        const affectedElements = this.updateCheckboxes(checkboxes ?? []);
        return this.doRefresh(elements.concat(affectedElements));
      } else {
        if (this.elementsToRefresh.length) {
          const seen = /* @__PURE__ */ new Set();
          this.elementsToRefresh.forEach((element) => seen.add(element.handle));
          for (const element of elements) {
            if (!seen.has(element.handle)) {
              this.elementsToRefresh.push(element);
            }
          }
        } else {
          this.elementsToRefresh.push(...elements);
        }
      }
    }
    return void 0;
  }
  async expand(itemOrItems) {
    const tree = this.tree;
    if (!tree) {
      return;
    }
    try {
      itemOrItems = Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems];
      for (const element of itemOrItems) {
        await tree.expand(element, false);
      }
    } catch (e) {
    }
  }
  isCollapsed(item) {
    return !!this.tree?.isCollapsed(item);
  }
  setSelection(items) {
    this.tree?.setSelection(items);
  }
  getSelection() {
    return this.tree?.getSelection() ?? [];
  }
  setFocus(item) {
    if (this.tree) {
      if (item) {
        this.focus(true, item);
        this.tree.setFocus([item]);
      } else if (this.tree.getFocus().length === 0) {
        this.tree.setFocus([]);
      }
    }
  }
  async reveal(item) {
    if (this.tree) {
      return this.tree.reveal(item);
    }
  }
  async doRefresh(elements) {
    const tree = this.tree;
    if (tree && this.visible) {
      this.refreshing = true;
      const oldSelection = tree.getSelection();
      try {
        await Promise.all(elements.map((element) => tree.updateChildren(element, true, true)));
      } catch (e) {
        this.logService.error(e);
      }
      const newSelection = tree.getSelection();
      if (oldSelection.length !== newSelection.length || oldSelection.some((value2, index2) => value2.handle !== newSelection[index2].handle)) {
        this.lastSelection = newSelection;
        this._onDidChangeSelectionAndFocus.fire({ selection: this.lastSelection, focus: this.lastActive });
      }
      this.refreshing = false;
      this._onDidCompleteRefresh.fire();
      this.updateContentAreas();
      if (this.focused) {
        this.focus(false);
      }
      this.updateCollapseAllToggle();
    }
  }
  initializeCollapseAllToggle() {
    if (!this.collapseAllToggleContext) {
      this.collapseAllToggleContextKey = new RawContextKey(`treeView.${this.id}.toggleCollapseAll`, false, localize(6976, null, this.id));
      this.collapseAllToggleContext = this.collapseAllToggleContextKey.bindTo(this.contextKeyService);
    }
  }
  updateCollapseAllToggle() {
    if (this.showCollapseAllAction) {
      this.initializeCollapseAllToggle();
      this.collapseAllToggleContext?.set(!!this.root.children && this.root.children.length > 0 && this.root.children.some((value2) => value2.collapsibleState !== 0 /* None */));
    }
  }
  updateContentAreas() {
    const isTreeEmpty = !this.root.children || this.root.children.length === 0;
    if (this._messageValue && isTreeEmpty && !this.refreshing && this.treeContainer) {
      if (!this.dragAndDropController) {
        this.treeContainer.classList.add("hide");
      }
      this.domNode.setAttribute("tabindex", "0");
    } else if (this.treeContainer) {
      this.treeContainer.classList.remove("hide");
      if (this.domNode === getActiveElement()) {
        this.focus();
      }
      this.domNode.removeAttribute("tabindex");
    }
  }
  get container() {
    return this._container;
  }
};

AbstractTreeView = __decorateClass([
  __decorateParam(2, IThemeService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, ICommandService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, IProgressService),
  __decorateParam(7, IContextMenuService),
  __decorateParam(8, IKeybindingService),
  __decorateParam(9, INotificationService),
  __decorateParam(10, IViewDescriptorService),
  __decorateParam(11, IHoverService),
  __decorateParam(12, IContextKeyService),
  __decorateParam(13, IActivityService),
  __decorateParam(14, ILogService),
  __decorateParam(15, IOpenerService),
  __decorateParam(16, IMarkdownRendererService)
], AbstractTreeView);

var TreeViewIdentityProvider = class {
  getId(element) {
    return element.handle;
  }
};

var TreeViewDelegate = class {
  getHeight(element) {
    return TreeRenderer2.ITEM_HEIGHT;
  }
  getTemplateId(element) {
    return TreeRenderer2.TREE_TEMPLATE_ID;
  }
};

async function doGetChildrenOrBatch(dataProvider, nodes) {
  if (dataProvider.getChildrenBatch) {
    return dataProvider.getChildrenBatch(nodes);
  } else {
    if (nodes) {
      return Promise.all(nodes.map((node) => dataProvider.getChildren(node).then((children) => children ?? [])));
    } else {
      return [await dataProvider.getChildren()].filter((children) => children !== void 0);
    }
  }
}

var TreeDataSource = class {
  constructor(treeView, withProgress) {
    this.treeView = treeView;
    this.withProgress = withProgress;
  }
  hasChildren(element) {
    return !!this.treeView.dataProvider && element.collapsibleState !== 0 /* None */;
  }
  async getChildren(element) {
    const dataProvider = this.treeView.dataProvider;
    if (!dataProvider) {
      return [];
    }
    if (this.batch === void 0) {
      this.batch = [element];
      this.batchPromise = void 0;
    } else {
      this.batch.push(element);
    }
    const indexInBatch = this.batch.length - 1;
    return new Promise((resolve3, reject) => {
      setTimeout(async () => {
        const batch = this.batch;
        this.batch = void 0;
        if (!this.batchPromise) {
          this.batchPromise = this.withProgress(doGetChildrenOrBatch(dataProvider, batch));
        }
        try {
          const result = await this.batchPromise;
          resolve3(result && indexInBatch < result.length ? result[indexInBatch] : []);
        } catch (e) {
          if (!e.message.startsWith("Bad progress location:")) {
            reject(e);
          }
        }
      }, 0);
    });
  }
};

var TreeRenderer2 = class extends Disposable {
  // tree item handle to template data
  constructor(treeViewId, menus, labels2, actionViewItemProvider, aligner, checkboxStateHandler, manuallyManageCheckboxes, themeService, configurationService, labelService, contextKeyService, hoverService, instantiationService) {
    super();
    this.treeViewId = treeViewId;
    this.menus = menus;
    this.labels = labels2;
    this.actionViewItemProvider = actionViewItemProvider;
    this.aligner = aligner;
    this.checkboxStateHandler = checkboxStateHandler;
    this.manuallyManageCheckboxes = manuallyManageCheckboxes;
    this.themeService = themeService;
    this.configurationService = configurationService;
    this.labelService = labelService;
    this.contextKeyService = contextKeyService;
    this.hoverService = hoverService;
    this._onDidChangeCheckboxState = this._register(new Emitter());
    this.onDidChangeCheckboxState = this._onDidChangeCheckboxState.event;
    this._onDidChangeMenuContext = this._register(new Emitter());
    this.onDidChangeMenuContext = this._onDidChangeMenuContext.event;
    this._hasCheckbox = false;
    this._renderedElements = /* @__PURE__ */ new Map();
    this._hoverDelegate = this._register(instantiationService.createInstance(WorkbenchHoverDelegate, "mouse", void 0, {}));
    this._register(this.themeService.onDidFileIconThemeChange(() => this.rerender()));
    this._register(this.themeService.onDidColorThemeChange(() => this.rerender()));
    this._register(checkboxStateHandler.onDidChangeCheckboxState((items) => {
      this.updateCheckboxes(items);
    }));
    this._register(this.contextKeyService.onDidChangeContext((e) => this.onDidChangeContext(e)));
  }
  static {
    this.ITEM_HEIGHT = 22;
  }
  static {
    this.TREE_TEMPLATE_ID = "treeExplorer";
  }
  get templateId() {
    return TreeRenderer2.TREE_TEMPLATE_ID;
  }
  set actionRunner(actionRunner) {
    this._actionRunner = actionRunner;
  }
  renderTemplate(container3) {
    container3.classList.add("custom-view-tree-node-item");
    const checkboxContainer = append(container3, $(""));
    const resourceLabel = this.labels.create(container3, { supportHighlights: true, hoverDelegate: this._hoverDelegate });
    const icon2 = prepend(resourceLabel.element, $(".custom-view-tree-node-item-icon"));
    const actionsContainer = append(resourceLabel.element, $(".actions"));
    const actionBar3 = new ActionBar(actionsContainer, {
      actionViewItemProvider: this.actionViewItemProvider
    });
    return { resourceLabel, icon: icon2, checkboxContainer, actionBar: actionBar3, container: container3 };
  }
  getHover(label3, resource, node) {
    if (!(node instanceof ResolvableTreeItem) || !node.hasResolve) {
      if (resource && !node.tooltip) {
        return void 0;
      } else if (node.tooltip === void 0) {
        if (isMarkdownString(label3)) {
          return { markdown: label3, markdownNotSupportedFallback: label3.value };
        } else {
          return label3;
        }
      } else if (!isString(node.tooltip)) {
        return { markdown: node.tooltip, markdownNotSupportedFallback: resource ? void 0 : renderAsPlaintext(node.tooltip) };
      } else if (node.tooltip !== "") {
        return node.tooltip;
      } else {
        return void 0;
      }
    }
    return {
      markdown: typeof node.tooltip === "string" ? node.tooltip : (token) => {
        return new Promise((resolve3) => {
          node.resolve(token).then(() => resolve3(node.tooltip));
        });
      },
      markdownNotSupportedFallback: resource ? void 0 : label3 ? isMarkdownString(label3) ? label3.value : label3 : ""
      // Passing undefined as the fallback for a resource falls back to the old native hover
    };
  }
  processLabel(label3, matches2) {
    if (!isMarkdownString(label3)) {
      return { label: label3 };
    }
    let text2 = label3.value.trim();
    let bold = false;
    let italic = false;
    let strikethrough = false;
    function moveMatches(offset) {
      if (matches2) {
        for (const match2 of matches2) {
          match2.start -= offset;
          match2.end -= offset;
        }
      }
    }
    const syntaxes = [
      { open: "~~", close: "~~", mark: () => {
        strikethrough = true;
      } },
      { open: "**", close: "**", mark: () => {
        bold = true;
      } },
      { open: "*", close: "*", mark: () => {
        italic = true;
      } },
      { open: "_", close: "_", mark: () => {
        italic = true;
      } }
    ];
    function checkSyntaxes() {
      let didChange = false;
      for (const syntax of syntaxes) {
        if (text2.startsWith(syntax.open) && text2.endsWith(syntax.close)) {
          if (matches2?.some((match2) => match2.start < syntax.open.length || match2.end > text2.length - syntax.close.length)) {
            return false;
          }
          syntax.mark();
          text2 = text2.substring(syntax.open.length, text2.length - syntax.close.length);
          moveMatches(syntax.open.length);
          didChange = true;
        }
      }
      return didChange;
    }
    for (let i2 = 0; i2 < 10; i2++) {
      if (!checkSyntaxes()) {
        break;
      }
    }
    return {
      label: text2,
      bold,
      italic,
      strikethrough,
      supportIcons: label3.supportThemeIcons
    };
  }
  renderElement(element, index2, templateData) {
    const node = element.element;
    const resource = node.resourceUri ? URI.revive(node.resourceUri) : null;
    const treeItemLabel = node.label ? node.label : resource ? { label: basename2(resource) } : void 0;
    const description = isString(node.description) ? node.description : resource && node.description === true ? this.labelService.getUriLabel(dirname2(resource), { relative: true }) : void 0;
    const labelStr = treeItemLabel ? isMarkdownString(treeItemLabel.label) ? treeItemLabel.label.value : treeItemLabel.label : void 0;
    const matches2 = treeItemLabel?.highlights && labelStr ? treeItemLabel.highlights.map(([start, end]) => {
      if (start < 0) {
        start = labelStr.length + start;
      }
      if (end < 0) {
        end = labelStr.length + end;
      }
      if (start >= labelStr.length || end > labelStr.length) {
        return { start: 0, end: 0 };
      }
      if (start > end) {
        const swap = start;
        start = end;
        end = swap;
      }
      return { start, end };
    }) : void 0;
    const { label: label3, bold, italic, strikethrough, supportIcons } = this.processLabel(treeItemLabel?.label, matches2);
    const icon2 = !isDark(this.themeService.getColorTheme().type) ? node.icon : node.iconDark;
    const iconUrl = icon2 ? URI.revive(icon2) : void 0;
    const title = this.getHover(treeItemLabel?.label, resource, node);
    templateData.actionBar.clear();
    templateData.icon.style.color = "";
    let commandEnabled = true;
    if (node.command) {
      commandEnabled = isTreeCommandEnabled(node.command, this.contextKeyService);
    }
    this.renderCheckbox(node, templateData);
    if (resource) {
      const fileDecorations = this.configurationService.getValue("explorer.decorations");
      const labelResource = resource ? resource : URI.parse("missing:_icon_resource");
      templateData.resourceLabel.setResource({ name: label3, description, resource: labelResource }, {
        fileKind: this.getFileKind(node),
        title,
        hideIcon: this.shouldHideResourceLabelIcon(iconUrl, node.themeIcon),
        fileDecorations,
        extraClasses: ["custom-view-tree-node-item-resourceLabel"],
        matches: matches2 ? matches2 : createMatches(element.filterData),
        bold,
        italic,
        strikethrough,
        disabledCommand: !commandEnabled,
        labelEscapeNewLines: true,
        forceLabel: !!node.label,
        supportIcons
      });
    } else {
      templateData.resourceLabel.setResource({ name: label3, description }, {
        title,
        hideIcon: true,
        extraClasses: ["custom-view-tree-node-item-resourceLabel"],
        matches: matches2 ? matches2 : createMatches(element.filterData),
        bold,
        italic,
        strikethrough,
        disabledCommand: !commandEnabled,
        labelEscapeNewLines: true,
        supportIcons
      });
    }
    if (iconUrl) {
      templateData.icon.className = "custom-view-tree-node-item-icon";
      templateData.icon.style.backgroundImage = asCSSUrl(iconUrl);
    } else {
      let iconClass;
      if (this.shouldShowThemeIcon(!!resource, node.themeIcon)) {
        iconClass = ThemeIcon.asClassName(node.themeIcon);
        if (node.themeIcon.color) {
          templateData.icon.style.color = this.themeService.getColorTheme().getColor(node.themeIcon.color.id)?.toString() ?? "";
        } else {
          iconClass = iconClass + " codicon-colored";
        }
      }
      templateData.icon.className = iconClass ? `custom-view-tree-node-item-icon ${iconClass}` : "";
      templateData.icon.style.backgroundImage = "";
    }
    if (!commandEnabled) {
      templateData.icon.className = templateData.icon.className + " disabled";
      if (templateData.container.parentElement) {
        templateData.container.parentElement.className = templateData.container.parentElement.className + " disabled";
      }
    }
    templateData.actionBar.context = { $treeViewId: this.treeViewId, $treeItemHandle: node.handle };
    const menuActions = this.menus.getResourceActions([node]);
    templateData.actionBar.push(menuActions, { icon: true, label: false });
    if (menuActions.length > 0) {
      const itemName = [label3, description].filter((part) => !!part).join(" ").trim();
      templateData.actionBar.setAriaLabel(itemName ? localize(6969, null, itemName) : localize(6970, null));
    } else {
      templateData.actionBar.setAriaLabel("");
    }
    if (this._actionRunner) {
      templateData.actionBar.actionRunner = this._actionRunner;
    }
    this.setAlignment(templateData.container, node);
    const renderedItems = this._renderedElements.get(element.element.handle) ?? [];
    this._renderedElements.set(element.element.handle, [...renderedItems, { original: element, rendered: templateData }]);
  }
  rerender() {
    const keys = new Set(this._renderedElements.keys());
    for (const key3 of keys) {
      const values = this._renderedElements.get(key3) ?? [];
      for (const value2 of values) {
        this.disposeElement(value2.original, 0, value2.rendered);
        this.renderElement(value2.original, 0, value2.rendered);
      }
    }
  }
  renderCheckbox(node, templateData) {
    if (node.checkbox) {
      if (!this._hasCheckbox) {
        this._hasCheckbox = true;
        this.rerender();
      }
      if (!templateData.checkbox) {
        const checkbox = new TreeItemCheckbox(templateData.checkboxContainer, this.checkboxStateHandler, this._hoverDelegate, this.hoverService);
        templateData.checkbox = checkbox;
      }
      templateData.checkbox.render(node);
    } else if (templateData.checkbox) {
      templateData.checkbox.dispose();
      templateData.checkbox = void 0;
    }
  }
  setAlignment(container3, treeItem) {
    container3.parentElement.classList.toggle("align-icon-with-twisty", this.aligner.alignIconWithTwisty(treeItem));
  }
  shouldHideResourceLabelIcon(iconUrl, icon2) {
    return !!iconUrl || !!icon2 && !this.isFileKindThemeIcon(icon2);
  }
  shouldShowThemeIcon(hasResource, icon2) {
    if (!icon2) {
      return false;
    }
    return !(hasResource && this.isFileKindThemeIcon(icon2));
  }
  isFileKindThemeIcon(icon2) {
    return ThemeIcon.isFile(icon2) || ThemeIcon.isFolder(icon2);
  }
  getFileKind(node) {
    if (node.themeIcon) {
      switch (node.themeIcon.id) {
        case FileThemeIcon.id:
          return 0 /* FILE */;
        case FolderThemeIcon.id:
          return 1 /* FOLDER */;
      }
    }
    return node.collapsibleState === 1 /* Collapsed */ || node.collapsibleState === 2 /* Expanded */ ? 1 /* FOLDER */ : 0 /* FILE */;
  }
  onDidChangeContext(e) {
    const affectsEntireMenuContexts = e.affectsSome(this.menus.getEntireMenuContexts());
    const items = [];
    for (const [_, elements] of this._renderedElements) {
      for (const element of elements) {
        if (affectsEntireMenuContexts || e.affectsSome(this.menus.getElementOverlayContexts(element.original.element))) {
          items.push(element.original.element);
        }
      }
    }
    if (items.length) {
      this._onDidChangeMenuContext.fire(items);
    }
  }
  updateCheckboxes(items) {
    let allItems = [];
    if (!this.manuallyManageCheckboxes()) {
      allItems = setCascadingCheckboxUpdates(items);
    } else {
      allItems = items;
    }
    allItems.forEach((item) => {
      const renderedItems = this._renderedElements.get(item.handle);
      if (renderedItems) {
        renderedItems.forEach((renderedItems2) => renderedItems2.rendered.checkbox?.render(item));
      }
    });
    this._onDidChangeCheckboxState.fire(allItems);
  }
  disposeElement(resource, index2, templateData) {
    const itemRenders = this._renderedElements.get(resource.element.handle) ?? [];
    const renderedIndex = itemRenders.findIndex((renderedItem) => templateData === renderedItem.rendered);
    if (itemRenders.length === 1) {
      this._renderedElements.delete(resource.element.handle);
    } else if (itemRenders.length > 0) {
      itemRenders.splice(renderedIndex, 1);
    }
    templateData.checkbox?.dispose();
    templateData.checkbox = void 0;
  }
  disposeTemplate(templateData) {
    templateData.resourceLabel.dispose();
    templateData.actionBar.dispose();
  }
};

TreeRenderer2 = __decorateClass([
  __decorateParam(7, IThemeService),
  __decorateParam(8, IConfigurationService),
  __decorateParam(9, ILabelService),
  __decorateParam(10, IContextKeyService),
  __decorateParam(11, IHoverService),
  __decorateParam(12, IInstantiationService)
], TreeRenderer2);

var Aligner = class extends Disposable {
  constructor(themeService, logService) {
    super();
    this.themeService = themeService;
    this.logService = logService;
  }
  set tree(tree) {
    this._tree = tree;
  }
  alignIconWithTwisty(treeItem) {
    if (treeItem.collapsibleState !== 0 /* None */) {
      return false;
    }
    if (!this.hasIconOrCheckbox(treeItem)) {
      return false;
    }
    if (this._tree) {
      const root = this._tree.getInput();
      let parent;
      try {
        parent = this._tree.getParentElement(treeItem) || root;
      } catch (error) {
        this.logService.error(`[TreeView] Failed to resolve parent for ${treeItem.handle}`, error);
        return false;
      }
      if (this.hasIconOrCheckbox(parent)) {
        return !!parent.children && parent.children.some((c) => c.collapsibleState !== 0 /* None */ && !this.hasIconOrCheckbox(c));
      }
      return !!parent.children && parent.children.every((c) => c.collapsibleState === 0 /* None */ || !this.hasIconOrCheckbox(c));
    } else {
      return false;
    }
  }
  hasIconOrCheckbox(node) {
    return this.hasIcon(node) || !!node.checkbox;
  }
  hasIcon(node) {
    const icon2 = !isDark(this.themeService.getColorTheme().type) ? node.icon : node.iconDark;
    if (icon2) {
      return true;
    }
    if (node.themeIcon && (!node.resourceUri || node.themeIcon.id !== FileThemeIcon.id && node.themeIcon.id !== FolderThemeIcon.id)) {
      return true;
    }
    if (node.resourceUri || node.themeIcon) {
      const fileIconTheme = this.themeService.getFileIconTheme();
      const isFolder = node.themeIcon ? node.themeIcon.id === FolderThemeIcon.id : node.collapsibleState !== 0 /* None */;
      if (isFolder) {
        return fileIconTheme.hasFileIcons && fileIconTheme.hasFolderIcons;
      }
      return fileIconTheme.hasFileIcons;
    }
    return false;
  }
};

var MultipleSelectionActionRunner = class extends ActionRunner {
  constructor(notificationService, getSelectedResources) {
    super();
    this.getSelectedResources = getSelectedResources;
    this._register(this.onDidRun((e) => {
      if (e.error && !isCancellationError(e.error)) {
        notificationService.error(localize(6966, null, e.error.message, e.action.id));
      }
    }));
  }
  async runAction(action, context2) {
    const selection = this.getSelectedResources();
    let selectionHandleArgs = void 0;
    let actionInSelected = false;
    if (selection.length > 1) {
      selectionHandleArgs = selection.map((selected) => {
        if (selected.handle === context2.$treeItemHandle || context2.$selectedTreeItems) {
          actionInSelected = true;
        }
        return { $treeViewId: context2.$treeViewId, $treeItemHandle: selected.handle };
      });
    }
    if (!actionInSelected && selectionHandleArgs) {
      selectionHandleArgs = void 0;
    }
    await action.run(context2, selectionHandleArgs);
  }
};

var TreeMenus = class {
  constructor(id2, menuService) {
    this.id = id2;
    this.menuService = menuService;
    this._onDidChange = new Emitter();
    this.onDidChange = this._onDidChange.event;
  }
  /**
   * Gets only the actions that apply to all of the given elements.
   */
  getResourceActions(elements) {
    const actions = this.getActions(this.getMenuId(), elements);
    return actions.primary;
  }
  /**
   * Gets only the actions that apply to all of the given elements.
   */
  getResourceContextActions(elements) {
    return this.getActions(this.getMenuId(), elements).secondary;
  }
  setContextKeyService(service) {
    this.contextKeyService = service;
  }
  filterNonUniversalActions(groups, newActions) {
    const newActionsSet = new Set(newActions.map((a) => a.id));
    for (const group2 of groups) {
      const actions = group2.keys();
      for (const action of actions) {
        if (!newActionsSet.has(action)) {
          group2.delete(action);
        }
      }
    }
  }
  buildMenu(groups) {
    const result = [];
    for (const group2 of groups) {
      if (group2.size > 0) {
        if (result.length) {
          result.push(new Separator());
        }
        result.push(...group2.values());
      }
    }
    return result;
  }
  createGroups(actions) {
    const groups = [];
    let group2 = /* @__PURE__ */ new Map();
    for (const action of actions) {
      if (action instanceof Separator) {
        groups.push(group2);
        group2 = /* @__PURE__ */ new Map();
      } else {
        group2.set(action.id, action);
      }
    }
    groups.push(group2);
    return groups;
  }
  getElementOverlayContexts(element) {
    return /* @__PURE__ */ new Map([
      ["view", this.id],
      ["viewItem", element.contextValue]
    ]);
  }
  getEntireMenuContexts() {
    return this.menuService.getMenuContexts(this.getMenuId());
  }
  getMenuId() {
    return MenuId.ViewItemContext;
  }
  getActions(menuId, elements) {
    if (!this.contextKeyService) {
      return { primary: [], secondary: [] };
    }
    let primaryGroups = [];
    let secondaryGroups = [];
    for (let i2 = 0; i2 < elements.length; i2++) {
      const element = elements[i2];
      const contextKeyService = this.contextKeyService.createOverlay(this.getElementOverlayContexts(element));
      const menuData = this.menuService.getMenuActions(menuId, contextKeyService, { shouldForwardArgs: true });
      const result = getContextMenuActions(menuData, "inline");
      if (i2 === 0) {
        primaryGroups = this.createGroups(result.primary);
        secondaryGroups = this.createGroups(result.secondary);
      } else {
        this.filterNonUniversalActions(primaryGroups, result.primary);
        this.filterNonUniversalActions(secondaryGroups, result.secondary);
      }
    }
    return { primary: this.buildMenu(primaryGroups), secondary: this.buildMenu(secondaryGroups) };
  }
  dispose() {
    this.contextKeyService = void 0;
    this._onDidChange.dispose();
  }
};

TreeMenus = __decorateClass([
  __decorateParam(1, IMenuService)
], TreeMenus);

var CustomTreeView = class extends AbstractTreeView {
  constructor(id2, title, extensionId, themeService, instantiationService, commandService, configurationService, progressService, contextMenuService, keybindingService, notificationService, viewDescriptorService, contextKeyService, hoverService, extensionService, activityService, telemetryService, logService, openerService, markdownRendererService) {
    super(id2, title, themeService, instantiationService, commandService, configurationService, progressService, contextMenuService, keybindingService, notificationService, viewDescriptorService, hoverService, contextKeyService, activityService, logService, openerService, markdownRendererService);
    this.extensionId = extensionId;
    this.extensionService = extensionService;
    this.telemetryService = telemetryService;
  }
  activate() {
    if (!this.activated) {
      this.telemetryService.publicLog2("Extension:ViewActivate", {
        extensionId: new TelemetryTrustedValue(this.extensionId),
        id: this.id
      });
      this.createTree();
      this.progressService.withProgress({ location: this.id }, () => this.extensionService.activateByEvent(`onView:${this.id}`)).then(() => timeout(2e3)).then(() => {
        this.updateMessage();
      });
      this.activated = true;
    }
  }
};

CustomTreeView = __decorateClass([
  __decorateParam(3, IThemeService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, ICommandService),
  __decorateParam(6, IConfigurationService),
  __decorateParam(7, IProgressService),
  __decorateParam(8, IContextMenuService),
  __decorateParam(9, IKeybindingService),
  __decorateParam(10, INotificationService),
  __decorateParam(11, IViewDescriptorService),
  __decorateParam(12, IContextKeyService),
  __decorateParam(13, IHoverService),
  __decorateParam(14, IExtensionService),
  __decorateParam(15, IActivityService),
  __decorateParam(16, ITelemetryService),
  __decorateParam(17, ILogService),
  __decorateParam(18, IOpenerService),
  __decorateParam(19, IMarkdownRendererService)
], CustomTreeView);

var TreeView = class extends AbstractTreeView {
  activate() {
    if (!this.activated) {
      this.createTree();
      this.activated = true;
    }
  }
};

var CustomTreeViewDragAndDrop = class {
  constructor(treeId, labelService, instantiationService, treeViewsDragAndDropService, logService) {
    this.treeId = treeId;
    this.labelService = labelService;
    this.instantiationService = instantiationService;
    this.treeViewsDragAndDropService = treeViewsDragAndDropService;
    this.logService = logService;
    this.treeItemsTransfer = LocalSelectionTransfer.getInstance();
    this.treeMimeType = `application/vnd.code.tree.${treeId.toLowerCase()}`;
  }
  set controller(controller) {
    this.dndController = controller;
  }
  handleDragAndLog(dndController, itemHandles, uuid, dragCancellationToken) {
    return dndController.handleDrag(itemHandles, uuid, dragCancellationToken).then((additionalDataTransfer) => {
      if (additionalDataTransfer) {
        const unlistedTypes = [];
        for (const item of additionalDataTransfer) {
          if (item[0] !== this.treeMimeType && dndController.dragMimeTypes.findIndex((value2) => value2 === item[0]) < 0) {
            unlistedTypes.push(item[0]);
          }
        }
        if (unlistedTypes.length) {
          this.logService.warn(`Drag and drop controller for tree ${this.treeId} adds the following data transfer types but does not declare them in dragMimeTypes: ${unlistedTypes.join(", ")}`);
        }
      }
      return additionalDataTransfer;
    });
  }
  addExtensionProvidedTransferTypes(originalEvent, itemHandles) {
    if (!originalEvent.dataTransfer || !this.dndController) {
      return;
    }
    const uuid = generateUuid();
    this.dragCancellationToken = new CancellationTokenSource();
    this.treeViewsDragAndDropService.addDragOperationTransfer(uuid, this.handleDragAndLog(this.dndController, itemHandles, uuid, this.dragCancellationToken.token));
    this.treeItemsTransfer.setData([new DraggedTreeItemsIdentifier(uuid)], DraggedTreeItemsIdentifier.prototype);
    originalEvent.dataTransfer.clearData(Mimes.text);
    if (this.dndController.dragMimeTypes.find((element) => element === Mimes.uriList)) {
      originalEvent.dataTransfer?.setData(DataTransfers.RESOURCES, "");
    }
    this.dndController.dragMimeTypes.forEach((supportedType) => {
      originalEvent.dataTransfer?.setData(supportedType, "");
    });
  }
  addResourceInfoToTransfer(originalEvent, resources) {
    if (resources.length && originalEvent.dataTransfer) {
      this.instantiationService.invokeFunction((accessor) => fillEditorsDragData(accessor, resources, originalEvent));
      const fileResources = resources.filter((s) => s.scheme === Schemas.file).map((r2) => r2.fsPath);
      if (fileResources.length) {
        originalEvent.dataTransfer.setData(CodeDataTransfers.FILES, JSON.stringify(fileResources));
      }
    }
  }
  onDragStart(data, originalEvent) {
    if (originalEvent.dataTransfer) {
      const treeItemsData = data.getData();
      const resources = [];
      const sourceInfo = {
        id: this.treeId,
        itemHandles: []
      };
      treeItemsData.forEach((item) => {
        sourceInfo.itemHandles.push(item.handle);
        if (item.resourceUri) {
          resources.push(URI.revive(item.resourceUri));
        }
      });
      this.addResourceInfoToTransfer(originalEvent, resources);
      this.addExtensionProvidedTransferTypes(originalEvent, sourceInfo.itemHandles);
      originalEvent.dataTransfer.setData(
        this.treeMimeType,
        JSON.stringify(sourceInfo)
      );
    }
  }
  debugLog(types) {
    if (types.size) {
      this.logService.debug(`TreeView dragged mime types: ${Array.from(types).join(", ")}`);
    } else {
      this.logService.debug(`TreeView dragged with no supported mime types.`);
    }
  }
  onDragOver(data, targetElement, targetIndex, targetSector, originalEvent) {
    const dataTransfer = toExternalVSDataTransfer(originalEvent.dataTransfer);
    const types = new Set(Array.from(dataTransfer, (x) => x[0]));
    if (originalEvent.dataTransfer) {
      for (const item of originalEvent.dataTransfer.items) {
        if (item.kind === "file" || item.type === DataTransfers.RESOURCES.toLowerCase()) {
          types.add(Mimes.uriList);
          break;
        }
      }
    }
    this.debugLog(types);
    const dndController = this.dndController;
    if (!dndController || !originalEvent.dataTransfer || dndController.dropMimeTypes.length === 0) {
      return false;
    }
    const dragContainersSupportedType = Array.from(types).some((value2, index2) => {
      if (value2 === this.treeMimeType) {
        return true;
      } else {
        return dndController.dropMimeTypes.indexOf(value2) >= 0;
      }
    });
    if (dragContainersSupportedType) {
      return { accept: true, bubble: 0 /* Down */, autoExpand: true };
    }
    return false;
  }
  getDragURI(element) {
    if (!this.dndController) {
      return null;
    }
    return element.resourceUri ? URI.revive(element.resourceUri).toString() : element.handle;
  }
  getDragLabel(elements) {
    if (!this.dndController) {
      return void 0;
    }
    if (elements.length > 1) {
      return String(elements.length);
    }
    const element = elements[0];
    if (element.label) {
      return isMarkdownString(element.label.label) ? element.label.label.value : element.label.label;
    }
    return element.resourceUri ? this.labelService.getUriLabel(URI.revive(element.resourceUri)) : void 0;
  }
  async drop(data, targetNode, targetIndex, targetSector, originalEvent) {
    const dndController = this.dndController;
    if (!originalEvent.dataTransfer || !dndController) {
      return;
    }
    let treeSourceInfo;
    let willDropUuid;
    if (this.treeItemsTransfer.hasData(DraggedTreeItemsIdentifier.prototype)) {
      willDropUuid = this.treeItemsTransfer.getData(DraggedTreeItemsIdentifier.prototype)[0].identifier;
    }
    const originalDataTransfer = toExternalVSDataTransfer(originalEvent.dataTransfer, true);
    const outDataTransfer = new VSDataTransfer();
    for (const [type, item] of originalDataTransfer) {
      if (type === this.treeMimeType || dndController.dropMimeTypes.includes(type) || item.asFile() && dndController.dropMimeTypes.includes(DataTransfers.FILES.toLowerCase())) {
        outDataTransfer.append(type, item);
        if (type === this.treeMimeType) {
          try {
            treeSourceInfo = JSON.parse(await item.asString());
          } catch {
          }
        }
      }
    }
    const additionalDataTransfer = await this.treeViewsDragAndDropService.removeDragOperationTransfer(willDropUuid);
    if (additionalDataTransfer) {
      for (const [type, item] of additionalDataTransfer) {
        outDataTransfer.append(type, item);
      }
    }
    return dndController.handleDrop(outDataTransfer, targetNode, CancellationToken.None, willDropUuid, treeSourceInfo?.id, treeSourceInfo?.itemHandles);
  }
  onDragEnd(originalEvent) {
    if (originalEvent.dataTransfer?.dropEffect === "none") {
      this.dragCancellationToken?.cancel();
    }
  }
  dispose() {
  }
};

CustomTreeViewDragAndDrop = __decorateClass([
  __decorateParam(1, ILabelService),
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, ITreeViewsDnDService),
  __decorateParam(4, ILogService)
], CustomTreeViewDragAndDrop);

function setCascadingCheckboxUpdates(items) {
  const additionalItems = [];
  for (const item of items) {
    if (item.checkbox !== void 0) {
      const checkChildren = (currentItem) => {
        for (const child of currentItem.children ?? []) {
          if (child.checkbox !== void 0 && currentItem.checkbox !== void 0 && child.checkbox.isChecked !== currentItem.checkbox.isChecked) {
            child.checkbox.isChecked = currentItem.checkbox.isChecked;
            additionalItems.push(child);
            checkChildren(child);
          }
        }
      };
      checkChildren(item);
      const visitedParents = /* @__PURE__ */ new Set();
      const checkParents = (currentItem) => {
        if (currentItem.parent?.checkbox !== void 0 && currentItem.parent.children) {
          if (visitedParents.has(currentItem.parent)) {
            return;
          } else {
            visitedParents.add(currentItem.parent);
          }
          let someUnchecked = false;
          let someChecked = false;
          for (const child of currentItem.parent.children) {
            if (someUnchecked && someChecked) {
              break;
            }
            if (child.checkbox !== void 0) {
              if (child.checkbox.isChecked) {
                someChecked = true;
              } else {
                someUnchecked = true;
              }
            }
          }
          if (someChecked && !someUnchecked && currentItem.parent.checkbox.isChecked !== true) {
            currentItem.parent.checkbox.isChecked = true;
            additionalItems.push(currentItem.parent);
            checkParents(currentItem.parent);
          } else if (someUnchecked && currentItem.parent.checkbox.isChecked !== false) {
            currentItem.parent.checkbox.isChecked = false;
            additionalItems.push(currentItem.parent);
            checkParents(currentItem.parent);
          }
        }
      };
      checkParents(item);
    }
  }
  return items.concat(additionalItems);
}
export { commandPreconditions, isTreeCommandEnabled, isRenderedMessageValue, doGetChildrenOrBatch, setCascadingCheckboxUpdates, TreeViewPane, Root, noDataProviderMessage, RawCustomTreeViewContextKey, Tree, AbstractTreeView, TreeViewIdentityProvider, TreeViewDelegate, TreeDataSource, TreeRenderer2, Aligner, MultipleSelectionActionRunner, TreeMenus, CustomTreeView, TreeView, CustomTreeViewDragAndDrop };
