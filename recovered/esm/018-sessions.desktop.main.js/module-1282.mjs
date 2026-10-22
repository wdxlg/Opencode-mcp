// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadTreeViews.ts
import { Disposable, DisposableMap, DisposableStore } from "./module-0012.mjs";
import { ExtHostContext, MainContext } from "./module-0922.mjs";
import { isNumber, isUndefinedOrNull } from "./module-0010.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions13, NoTreeViewError, ResolvableTreeItem } from "./module-1094.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0920.mjs";
import { IViewsService } from "./module-1246.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IExtensionService } from "./module-0889.mjs";
import { ILogService } from "./module-0095.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { DataTransferFileCache } from "./module-1213.mjs";
import { DataTransfer2 } from "./module-1212.mjs";
import { UriList, VSDataTransfer, createStringDataTransferItem } from "./module-0264.mjs";
import { Mimes } from "./module-0136.mjs";
import { URI } from "./module-0032.mjs";
import { distinct } from "./module-0007.mjs";


// src/vs/workbench/api/browser/mainThreadTreeViews.ts
var MainThreadTreeViews = class extends Disposable {
  constructor(extHostContext, viewsService, notificationService, extensionService, logService, telemetryService) {
    super();
    this.viewsService = viewsService;
    this.notificationService = notificationService;
    this.extensionService = extensionService;
    this.logService = logService;
    this.telemetryService = telemetryService;
    this._dataProviders = this._register(new DisposableMap());
    this._dndControllers = /* @__PURE__ */ new Map();
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostTreeViews);
  }
  async $registerTreeViewDataProvider(treeViewId, options3) {
    this.logService.trace("MainThreadTreeViews#$registerTreeViewDataProvider", treeViewId, options3);
    this.extensionService.whenInstalledExtensionsRegistered().then(() => {
      const dataProvider = new TreeViewDataProvider(treeViewId, this._proxy, this.notificationService);
      const disposables = new DisposableStore();
      this._dataProviders.set(treeViewId, { dataProvider, dispose: () => disposables.dispose() });
      const dndController = options3.hasHandleDrag || options3.hasHandleDrop ? new TreeViewDragAndDropController(treeViewId, options3.dropMimeTypes, options3.dragMimeTypes, options3.hasHandleDrag, this._proxy) : void 0;
      const viewer = this.getTreeView(treeViewId);
      if (viewer) {
        viewer.showCollapseAllAction = options3.showCollapseAll;
        viewer.canSelectMany = options3.canSelectMany;
        viewer.manuallyManageCheckboxes = options3.manuallyManageCheckboxes;
        viewer.dragAndDropController = dndController;
        if (dndController) {
          this._dndControllers.set(treeViewId, dndController);
        }
        viewer.dataProvider = dataProvider;
        this.registerListeners(treeViewId, viewer, disposables);
        this._proxy.$setVisible(treeViewId, viewer.visible);
      } else {
        this.notificationService.error("No view is registered with id: " + treeViewId);
      }
    });
  }
  $reveal(treeViewId, itemInfo, options3) {
    this.logService.trace("MainThreadTreeViews#$reveal", treeViewId, itemInfo?.item, itemInfo?.parentChain, options3);
    return this.viewsService.openView(treeViewId, options3.focus).then(() => {
      const viewer = this.getTreeView(treeViewId);
      if (viewer && itemInfo) {
        return this.reveal(viewer, this._dataProviders.get(treeViewId).dataProvider, itemInfo.item, itemInfo.parentChain, options3);
      }
      return void 0;
    });
  }
  $refresh(treeViewId, itemsToRefreshByHandle) {
    this.logService.trace("MainThreadTreeViews#$refresh", treeViewId, itemsToRefreshByHandle);
    const viewer = this.getTreeView(treeViewId);
    const dataProvider = this._dataProviders.get(treeViewId);
    if (viewer && dataProvider) {
      const itemsToRefresh = dataProvider.dataProvider.getItemsToRefresh(itemsToRefreshByHandle);
      return viewer.refresh(itemsToRefresh.items.length ? itemsToRefresh.items : void 0, itemsToRefresh.checkboxes.length ? itemsToRefresh.checkboxes : void 0);
    }
    return Promise.resolve();
  }
  $setMessage(treeViewId, message) {
    this.logService.trace("MainThreadTreeViews#$setMessage", treeViewId, message.toString());
    const viewer = this.getTreeView(treeViewId);
    if (viewer) {
      viewer.message = message;
    }
  }
  $setTitle(treeViewId, title, description) {
    this.logService.trace("MainThreadTreeViews#$setTitle", treeViewId, title, description);
    const viewer = this.getTreeView(treeViewId);
    if (viewer) {
      viewer.title = title;
      viewer.description = description;
    }
  }
  $setBadge(treeViewId, badge) {
    this.logService.trace("MainThreadTreeViews#$setBadge", treeViewId, badge?.value, badge?.tooltip);
    const viewer = this.getTreeView(treeViewId);
    if (viewer) {
      viewer.badge = badge;
    }
  }
  $resolveDropFileData(destinationViewId, requestId, dataItemId) {
    const controller = this._dndControllers.get(destinationViewId);
    if (!controller) {
      throw new Error("Unknown tree");
    }
    return controller.resolveDropFileData(requestId, dataItemId);
  }
  async $disposeTree(treeViewId) {
    const viewer = this.getTreeView(treeViewId);
    if (viewer) {
      viewer.dataProvider = void 0;
    }
    this._dataProviders.deleteAndDispose(treeViewId);
  }
  $logResolveTreeNodeFailure(extensionId) {
    this.telemetryService.publicLog2("treeView.resolveFailure", {
      extensionId
    });
  }
  async reveal(treeView, dataProvider, itemIn, parentChain, options3) {
    options3 = options3 ? options3 : { select: false, focus: false };
    const select = isUndefinedOrNull(options3.select) ? false : options3.select;
    const focus = isUndefinedOrNull(options3.focus) ? false : options3.focus;
    let expand = Math.min(isNumber(options3.expand) ? options3.expand : options3.expand === true ? 1 : 0, 3);
    if (dataProvider.isEmpty()) {
      await treeView.refresh();
    }
    for (const parent of parentChain) {
      const parentItem = dataProvider.getItem(parent.handle);
      if (parentItem) {
        await treeView.expand(parentItem);
      }
    }
    const item = dataProvider.getItem(itemIn.handle);
    if (item) {
      await treeView.reveal(item);
      if (select) {
        treeView.setSelection([item]);
      }
      if (focus === false) {
        treeView.setFocus();
      } else if (focus) {
        treeView.setFocus(item);
      }
      let itemsToExpand = [item];
      for (; itemsToExpand.length > 0 && expand > 0; expand--) {
        await treeView.expand(itemsToExpand);
        itemsToExpand = itemsToExpand.reduce((result, itemValue) => {
          const item2 = dataProvider.getItem(itemValue.handle);
          if (item2 && item2.children && item2.children.length) {
            result.push(...item2.children);
          }
          return result;
        }, []);
      }
    }
  }
  registerListeners(treeViewId, treeView, disposables) {
    disposables.add(treeView.onDidExpandItem((item) => this._proxy.$setExpanded(treeViewId, item.handle, true)));
    disposables.add(treeView.onDidCollapseItem((item) => this._proxy.$setExpanded(treeViewId, item.handle, false)));
    disposables.add(treeView.onDidChangeSelectionAndFocus((items) => this._proxy.$setSelectionAndFocus(treeViewId, items.selection.map(({ handle: handle2 }) => handle2), items.focus.handle)));
    disposables.add(treeView.onDidChangeVisibility((isVisible) => this._proxy.$setVisible(treeViewId, isVisible)));
    disposables.add(treeView.onDidChangeCheckboxState((items) => {
      this._proxy.$changeCheckboxState(treeViewId, items.map((item) => {
        return { treeItemHandle: item.handle, newState: item.checkbox?.isChecked ?? false };
      }));
    }));
  }
  getTreeView(treeViewId) {
    const viewDescriptor3 = Registry.as(Extensions13.ViewsRegistry).getView(treeViewId);
    return viewDescriptor3 ? viewDescriptor3.treeView : null;
  }
  dispose() {
    for (const dataprovider of this._dataProviders) {
      const treeView = this.getTreeView(dataprovider[0]);
      if (treeView) {
        treeView.dataProvider = void 0;
      }
    }
    this._dataProviders.dispose();
    this._dndControllers.clear();
    super.dispose();
  }
};

MainThreadTreeViews = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadTreeViews),
  __decorateParam(1, IViewsService),
  __decorateParam(2, INotificationService),
  __decorateParam(3, IExtensionService),
  __decorateParam(4, ILogService),
  __decorateParam(5, ITelemetryService)
], MainThreadTreeViews);

var TreeViewDragAndDropController = class {
  constructor(treeViewId, dropMimeTypes, dragMimeTypes, hasWillDrop, _proxy) {
    this.treeViewId = treeViewId;
    this.dropMimeTypes = dropMimeTypes;
    this.dragMimeTypes = dragMimeTypes;
    this.hasWillDrop = hasWillDrop;
    this._proxy = _proxy;
    this.dataTransfersCache = new DataTransferFileCache();
  }
  async handleDrop(dataTransfer, targetTreeItem, token, operationUuid, sourceTreeId, sourceTreeItemHandles) {
    const request2 = this.dataTransfersCache.add(dataTransfer);
    try {
      const dataTransferDto = await DataTransfer2.fromList(dataTransfer);
      if (token.isCancellationRequested) {
        return;
      }
      return await this._proxy.$handleDrop(this.treeViewId, request2.id, dataTransferDto, targetTreeItem?.handle, token, operationUuid, sourceTreeId, sourceTreeItemHandles);
    } finally {
      request2.dispose();
    }
  }
  async handleDrag(sourceTreeItemHandles, operationUuid, token) {
    if (!this.hasWillDrop) {
      return;
    }
    const additionalDataTransferDTO = await this._proxy.$handleDrag(this.treeViewId, sourceTreeItemHandles, operationUuid, token);
    if (!additionalDataTransferDTO) {
      return;
    }
    const additionalDataTransfer = new VSDataTransfer();
    additionalDataTransferDTO.items.forEach(([type, item]) => {
      const value2 = type === Mimes.uriList && item.uriListData ? UriList.create(item.uriListData.map((part) => typeof part === "string" ? part : URI.revive(part))) : item.asString;
      additionalDataTransfer.replace(type, createStringDataTransferItem(value2));
    });
    return additionalDataTransfer;
  }
  resolveDropFileData(requestId, dataItemId) {
    return this.dataTransfersCache.resolveFileData(requestId, dataItemId);
  }
};

var TreeViewDataProvider = class {
  constructor(treeViewId, _proxy, notificationService) {
    this.treeViewId = treeViewId;
    this._proxy = _proxy;
    this.notificationService = notificationService;
    this.itemsMap = /* @__PURE__ */ new Map();
    this.hasResolve = this._proxy.$hasResolve(this.treeViewId);
  }
  async getChildren(treeItem) {
    const batches = await this.getChildrenBatch(treeItem ? [treeItem] : void 0);
    return batches?.[0];
  }
  getChildrenBatch(treeItems) {
    if (!treeItems) {
      this.itemsMap.clear();
    }
    return this._proxy.$getChildren(this.treeViewId, treeItems ? treeItems.map((item) => item.handle) : void 0).then(
      (children) => {
        const convertedChildren = this.convertTransferChildren(treeItems ?? [], children);
        return this.postGetChildren(convertedChildren);
      },
      (err) => {
        if (!NoTreeViewError.is(err)) {
          this.notificationService.error(err);
        }
        return [];
      }
    );
  }
  convertTransferChildren(parents, children) {
    const convertedChildren = Array(parents.length);
    if (children) {
      for (const childGroup of children) {
        const childGroupIndex = childGroup[0];
        convertedChildren[childGroupIndex] = childGroup.slice(1);
      }
    }
    return convertedChildren;
  }
  getItemsToRefresh(itemsToRefreshByHandle) {
    const itemsToRefresh = [];
    const checkboxesToRefresh = [];
    if (itemsToRefreshByHandle) {
      for (const newTreeItemHandle of Object.keys(itemsToRefreshByHandle)) {
        const currentTreeItem = this.getItem(newTreeItemHandle);
        if (currentTreeItem) {
          const newTreeItem = itemsToRefreshByHandle[newTreeItemHandle];
          if (currentTreeItem.checkbox?.isChecked !== newTreeItem.checkbox?.isChecked) {
            checkboxesToRefresh.push(currentTreeItem);
          }
          this.updateTreeItem(currentTreeItem, newTreeItem);
          if (newTreeItemHandle === newTreeItem.handle) {
            itemsToRefresh.push(currentTreeItem);
          } else {
            this.itemsMap.delete(newTreeItemHandle);
            this.itemsMap.set(currentTreeItem.handle, currentTreeItem);
            const parent = newTreeItem.parentHandle ? this.itemsMap.get(newTreeItem.parentHandle) : null;
            if (parent) {
              itemsToRefresh.push(parent);
            }
          }
        }
      }
    }
    return { items: itemsToRefresh, checkboxes: checkboxesToRefresh };
  }
  getItem(treeItemHandle) {
    return this.itemsMap.get(treeItemHandle);
  }
  isEmpty() {
    return this.itemsMap.size === 0;
  }
  async postGetChildren(elementGroups) {
    if (elementGroups === void 0) {
      return void 0;
    }
    const resultGroups = [];
    const hasResolve = await this.hasResolve;
    if (elementGroups) {
      for (const elements of elementGroups) {
        const result = [];
        resultGroups.push(result);
        if (!elements) {
          continue;
        }
        for (const element of elements) {
          const resolvable = new ResolvableTreeItem(element, hasResolve ? (token) => {
            return this._proxy.$resolve(this.treeViewId, element.handle, token);
          } : void 0);
          this.itemsMap.set(element.handle, resolvable);
          result.push(resolvable);
        }
      }
    }
    return resultGroups;
  }
  updateTreeItem(current, treeItem) {
    treeItem.children = treeItem.children ? treeItem.children : void 0;
    if (current) {
      const properties = distinct([
        ...Object.keys(current instanceof ResolvableTreeItem ? current.asTreeItem() : current),
        ...Object.keys(treeItem)
      ]);
      for (const property of properties) {
        current[property] = treeItem[property];
      }
      if (current instanceof ResolvableTreeItem) {
        current.resetResolve();
      }
    }
  }
};
export { MainThreadTreeViews, TreeViewDragAndDropController, TreeViewDataProvider };
