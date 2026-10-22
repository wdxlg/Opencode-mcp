// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/compositeBar.ts
import { $, EventHelper, EventType, addDisposableListener, getWindow, isAncestor } from "./module-0075.mjs";
import { CompositeDragAndDropObserver, toggleDropEffect } from "./module-1380.mjs";
import { Widget } from "./module-0252.mjs";
import { Emitter } from "./module-0017.mjs";
import { MutableDisposable } from "./module-0012.mjs";
import { ActionBar } from "./module-0477.mjs";
import { CompositeActionViewItem, CompositeOverflowActivityAction, CompositeOverflowActivityActionViewItem } from "./module-1556.mjs";
import { localize } from "./module-0001.mjs";
import { EventType2, Gesture } from "./module-0251.mjs";
import { StandardMouseEvent } from "./module-0024.mjs";
import { toAction } from "./module-0082.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IViewDescriptorService } from "./module-1094.mjs";
import { isUndefinedOrNull } from "./module-0010.mjs";


// src/vs/workbench/browser/parts/compositeBar.ts
var CompositeDragAndDrop = class {
  constructor(viewDescriptorService, targetContainerLocation, orientation, openComposite, moveComposite, getItems) {
    this.viewDescriptorService = viewDescriptorService;
    this.targetContainerLocation = targetContainerLocation;
    this.orientation = orientation;
    this.openComposite = openComposite;
    this.moveComposite = moveComposite;
    this.getItems = getItems;
  }
  drop(data, targetCompositeId, originalEvent, before) {
    const dragData = data.getData();
    if (dragData.type === "composite") {
      const currentContainer = this.viewDescriptorService.getViewContainerById(dragData.id);
      const currentLocation = this.viewDescriptorService.getViewContainerLocation(currentContainer);
      let moved = false;
      if (currentLocation === this.targetContainerLocation) {
        if (targetCompositeId) {
          this.moveComposite(dragData.id, targetCompositeId, before);
          moved = true;
        }
      } else {
        this.viewDescriptorService.moveViewContainerToLocation(currentContainer, this.targetContainerLocation, this.getTargetIndex(targetCompositeId, before), "dnd");
        moved = true;
      }
      if (moved) {
        this.openComposite(currentContainer.id, true);
      }
    }
    if (dragData.type === "view") {
      const viewToMove = this.viewDescriptorService.getViewDescriptorById(dragData.id);
      if (viewToMove.canMoveView) {
        this.viewDescriptorService.moveViewToLocation(viewToMove, this.targetContainerLocation, "dnd");
        const newContainer = this.viewDescriptorService.getViewContainerByViewId(viewToMove.id);
        if (targetCompositeId) {
          this.moveComposite(newContainer.id, targetCompositeId, before);
        }
        this.openComposite(newContainer.id, true).then((composite) => {
          composite?.openView(viewToMove.id, true);
        });
      }
    }
  }
  onDragEnter(data, targetCompositeId, originalEvent) {
    return this.canDrop(data, targetCompositeId);
  }
  onDragOver(data, targetCompositeId, originalEvent) {
    return this.canDrop(data, targetCompositeId);
  }
  getTargetIndex(targetId, before2d) {
    if (!targetId) {
      return void 0;
    }
    const items = this.getItems();
    const before = this.orientation === 0 /* HORIZONTAL */ ? before2d?.horizontallyBefore : before2d?.verticallyBefore;
    return items.filter((item) => item.visible).findIndex((item) => item.id === targetId) + (before ? 0 : 1);
  }
  canDrop(data, targetCompositeId) {
    const dragData = data.getData();
    if (dragData.type === "composite") {
      const currentContainer = this.viewDescriptorService.getViewContainerById(dragData.id);
      const currentLocation = this.viewDescriptorService.getViewContainerLocation(currentContainer);
      if (currentLocation === this.targetContainerLocation) {
        return dragData.id !== targetCompositeId;
      }
      return true;
    } else {
      const viewDescriptor3 = this.viewDescriptorService.getViewDescriptorById(dragData.id);
      if (!viewDescriptor3?.canMoveView) {
        return false;
      }
      return true;
    }
  }
};

var CompositeBarDndCallbacks = class {
  constructor(compositeBarContainer, actionBarContainer, compositeBarModel, dndHandler, orientation) {
    this.compositeBarContainer = compositeBarContainer;
    this.actionBarContainer = actionBarContainer;
    this.compositeBarModel = compositeBarModel;
    this.dndHandler = dndHandler;
    this.orientation = orientation;
    this.insertDropBefore = void 0;
  }
  onDragOver(e4) {
    const visibleItems = this.compositeBarModel.visibleItems;
    if (!visibleItems.length || e4.eventData.target && isAncestor(e4.eventData.target, this.actionBarContainer)) {
      this.insertDropBefore = this.updateFromDragging(this.compositeBarContainer, false, false, true);
      return;
    }
    const insertAtFront = this.insertAtFront(this.actionBarContainer, e4.eventData);
    const target = insertAtFront ? visibleItems[0] : visibleItems[visibleItems.length - 1];
    const validDropTarget = this.dndHandler.onDragOver(e4.dragAndDropData, target.id, e4.eventData);
    toggleDropEffect(e4.eventData.dataTransfer, "move", validDropTarget);
    this.insertDropBefore = this.updateFromDragging(this.compositeBarContainer, validDropTarget, insertAtFront, true);
  }
  onDragLeave(e4) {
    this.insertDropBefore = this.updateFromDragging(this.compositeBarContainer, false, false, false);
  }
  onDragEnd(e4) {
    this.insertDropBefore = this.updateFromDragging(this.compositeBarContainer, false, false, false);
  }
  onDrop(e4) {
    const visibleItems = this.compositeBarModel.visibleItems;
    let targetId = void 0;
    if (visibleItems.length) {
      targetId = this.insertAtFront(this.actionBarContainer, e4.eventData) ? visibleItems[0].id : visibleItems[visibleItems.length - 1].id;
    }
    this.dndHandler.drop(e4.dragAndDropData, targetId, e4.eventData, this.insertDropBefore);
    this.insertDropBefore = this.updateFromDragging(this.compositeBarContainer, false, false, false);
  }
  insertAtFront(element, event) {
    const rect = element.getBoundingClientRect();
    const posX = event.clientX;
    const posY = event.clientY;
    switch (this.orientation) {
      case 0 /* HORIZONTAL */:
        return posX < rect.left;
      case 1 /* VERTICAL */:
        return posY < rect.top;
    }
  }
  updateFromDragging(element, showFeedback, front, isDragging) {
    element.classList.toggle("dragged-over", isDragging);
    element.classList.toggle("dragged-over-head", showFeedback && front);
    element.classList.toggle("dragged-over-tail", showFeedback && !front);
    if (!showFeedback) {
      return void 0;
    }
    return { verticallyBefore: front, horizontallyBefore: front };
  }
};

var CompositeBar = class extends Widget {
  constructor(items, options3, instantiationService, contextMenuService, viewDescriptorService) {
    super();
    this.options = options3;
    this.instantiationService = instantiationService;
    this.contextMenuService = contextMenuService;
    this.viewDescriptorService = viewDescriptorService;
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this.compositeOverflowAction = this._register(new MutableDisposable());
    this.compositeOverflowActionViewItem = this._register(new MutableDisposable());
    this.model = new CompositeBarModel(items, options3);
    this.visibleComposites = [];
    this.compositeSizeInBar = /* @__PURE__ */ new Map();
    this.computeSizes(this.model.visibleItems);
  }
  getCompositeBarItems() {
    return [...this.model.items];
  }
  setCompositeBarItems(items) {
    this.model.setItems(items);
    this.updateCompositeSwitcher(true);
  }
  getPinnedComposites() {
    return this.model.pinnedItems;
  }
  getPinnedCompositeIds() {
    return this.getPinnedComposites().map((c) => c.id);
  }
  getVisibleComposites() {
    return this.model.visibleItems;
  }
  create(parent) {
    const actionBarDiv = parent.appendChild($(".composite-bar"));
    this.compositeSwitcherBar = this._register(new ActionBar(actionBarDiv, {
      actionViewItemProvider: (action, options3) => {
        if (action instanceof CompositeOverflowActivityAction) {
          return this.compositeOverflowActionViewItem.value;
        }
        const item = this.model.findItem(action.id);
        return item && this.instantiationService.createInstance(
          CompositeActionViewItem,
          { ...options3, draggable: true, colors: this.options.colors, icon: this.options.icon, hoverOptions: this.options.activityHoverOptions, compact: this.options.compact },
          action,
          item.pinnedAction,
          item.toggleBadgeAction,
          (compositeId) => this.options.getContextMenuActionsForComposite(compositeId),
          () => this.getContextMenuActions(),
          this.options.dndHandler,
          this
        );
      },
      orientation: this.options.orientation,
      ariaLabel: localize(6253, null),
      ariaRole: "tablist",
      preventLoopNavigation: this.options.preventLoopNavigation,
      triggerKeys: { keyDown: true }
    }));
    this._register(addDisposableListener(parent, EventType.CONTEXT_MENU, (e4) => this.showContextMenu(getWindow(parent), e4)));
    this._register(Gesture.addTarget(parent));
    this._register(addDisposableListener(parent, EventType2.Contextmenu, (e4) => this.showContextMenu(getWindow(parent), e4)));
    const dndCallback = new CompositeBarDndCallbacks(parent, actionBarDiv, this.model, this.options.dndHandler, this.options.orientation);
    this._register(CompositeDragAndDropObserver.INSTANCE.registerTarget(parent, dndCallback));
    return actionBarDiv;
  }
  focus(index2) {
    this.compositeSwitcherBar?.focus(index2);
  }
  recomputeSizes() {
    this.computeSizes(this.model.visibleItems);
    this.updateCompositeSwitcher();
  }
  layout(dimension) {
    this.dimension = dimension;
    if (dimension.height === 0 || dimension.width === 0) {
      return;
    }
    if (this.compositeSizeInBar.size === 0) {
      this.computeSizes(this.model.visibleItems);
    }
    this.updateCompositeSwitcher();
  }
  addComposite({ id: id2, name, order, requestedIndex }) {
    if (this.model.add(id2, name, order, requestedIndex)) {
      this.computeSizes([this.model.findItem(id2)]);
      this.updateCompositeSwitcher();
    }
  }
  removeComposite(id2) {
    if (this.isPinned(id2)) {
      this.unpin(id2);
    }
    if (this.model.remove(id2)) {
      this.updateCompositeSwitcher();
    }
  }
  hideComposite(id2) {
    if (this.model.hide(id2)) {
      this.resetActiveComposite(id2);
      this.updateCompositeSwitcher();
    }
  }
  activateComposite(id2) {
    const previousActiveItem = this.model.activeItem;
    if (this.model.activate(id2)) {
      if (this.visibleComposites.indexOf(id2) === -1 || !!this.model.activeItem && !this.model.activeItem.pinned || previousActiveItem && !previousActiveItem.pinned) {
        this.updateCompositeSwitcher();
      }
    }
  }
  deactivateComposite(id2) {
    const previousActiveItem = this.model.activeItem;
    if (this.model.deactivate()) {
      if (previousActiveItem && !previousActiveItem.pinned) {
        this.updateCompositeSwitcher();
      }
    }
  }
  async pin(compositeId, open2) {
    if (this.model.setPinned(compositeId, true)) {
      this.updateCompositeSwitcher();
      if (open2) {
        await this.options.openComposite(compositeId);
        this.activateComposite(compositeId);
      }
    }
  }
  unpin(compositeId) {
    if (this.model.setPinned(compositeId, false)) {
      this.updateCompositeSwitcher();
      this.resetActiveComposite(compositeId);
    }
  }
  areBadgesEnabled(compositeId) {
    return this.viewDescriptorService.getViewContainerBadgeEnablementState(compositeId);
  }
  toggleBadgeEnablement(compositeId) {
    this.viewDescriptorService.setViewContainerBadgeEnablementState(compositeId, !this.areBadgesEnabled(compositeId));
    this.updateCompositeSwitcher();
    const item = this.model.findItem(compositeId);
    if (item) {
      item.activityAction.activities = item.activityAction.activities;
    }
  }
  resetActiveComposite(compositeId) {
    const defaultCompositeId = this.options.getDefaultCompositeId();
    if (!this.model.activeItem || this.model.activeItem.id !== compositeId) {
      return;
    }
    this.deactivateComposite(compositeId);
    if (defaultCompositeId && defaultCompositeId !== compositeId && this.isPinned(defaultCompositeId)) {
      this.options.openComposite(defaultCompositeId, true);
    } else {
      const visibleComposite = this.visibleComposites.find((cid) => cid !== compositeId);
      if (visibleComposite) {
        this.options.openComposite(visibleComposite);
      }
    }
  }
  isPinned(compositeId) {
    const item = this.model.findItem(compositeId);
    return item?.pinned;
  }
  move(compositeId, toCompositeId, before) {
    if (before !== void 0) {
      const fromIndex = this.model.items.findIndex((c) => c.id === compositeId);
      let toIndex = this.model.items.findIndex((c) => c.id === toCompositeId);
      if (fromIndex >= 0 && toIndex >= 0) {
        if (!before && fromIndex > toIndex) {
          toIndex++;
        }
        if (before && fromIndex < toIndex) {
          toIndex--;
        }
        if (toIndex < this.model.items.length && toIndex >= 0 && toIndex !== fromIndex) {
          if (this.model.move(this.model.items[fromIndex].id, this.model.items[toIndex].id)) {
            setTimeout(() => this.updateCompositeSwitcher(), 0);
          }
        }
      }
    } else {
      if (this.model.move(compositeId, toCompositeId)) {
        setTimeout(() => this.updateCompositeSwitcher(), 0);
      }
    }
  }
  getAction(compositeId) {
    const item = this.model.findItem(compositeId);
    return item?.activityAction;
  }
  computeSizes(items) {
    const size3 = this.options.compositeSize;
    if (size3) {
      items.forEach((composite) => this.compositeSizeInBar.set(composite.id, size3));
    } else {
      const compositeSwitcherBar = this.compositeSwitcherBar;
      if (compositeSwitcherBar && this.dimension && this.dimension.height !== 0 && this.dimension.width !== 0) {
        const currentItemsLength = compositeSwitcherBar.viewItems.length;
        compositeSwitcherBar.push(items.map((composite) => composite.activityAction));
        items.map((composite, index2) => this.compositeSizeInBar.set(
          composite.id,
          this.options.orientation === 1 /* VERTICAL */ ? compositeSwitcherBar.getHeight(currentItemsLength + index2) : compositeSwitcherBar.getWidth(currentItemsLength + index2)
        ));
        items.forEach(() => compositeSwitcherBar.pull(compositeSwitcherBar.viewItems.length - 1));
      }
    }
  }
  updateCompositeSwitcher(donotTrigger) {
    const compositeSwitcherBar = this.compositeSwitcherBar;
    if (!compositeSwitcherBar || !this.dimension) {
      return;
    }
    let compositesToShow = this.model.visibleItems.filter(
      (item) => item.pinned || this.model.activeItem && this.model.activeItem.id === item.id
      /* Show the active composite even if it is not pinned */
    ).map((item) => item.id);
    let maxVisible = compositesToShow.length;
    const totalComposites = compositesToShow.length;
    let size3 = 0;
    const limit = this.options.orientation === 1 /* VERTICAL */ ? this.dimension.height : this.dimension.width;
    for (let i2 = 0; i2 < compositesToShow.length; i2++) {
      const compositeSize = this.compositeSizeInBar.get(compositesToShow[i2]);
      if (size3 + compositeSize > limit) {
        maxVisible = i2;
        break;
      }
      size3 += compositeSize;
    }
    if (totalComposites > maxVisible) {
      compositesToShow = compositesToShow.slice(0, maxVisible);
    }
    if (this.model.activeItem && compositesToShow.every((compositeId) => !!this.model.activeItem && compositeId !== this.model.activeItem.id)) {
      size3 += this.compositeSizeInBar.get(this.model.activeItem.id);
      compositesToShow.push(this.model.activeItem.id);
    }
    while (size3 > limit && compositesToShow.length) {
      const removedComposite = compositesToShow.length > 1 ? compositesToShow.splice(compositesToShow.length - 2, 1)[0] : compositesToShow.pop();
      size3 -= this.compositeSizeInBar.get(removedComposite);
    }
    if (totalComposites > compositesToShow.length) {
      size3 += this.options.overflowActionSize;
    }
    while (size3 > limit && compositesToShow.length) {
      const removedComposite = compositesToShow.length > 1 && compositesToShow[compositesToShow.length - 1] === this.model.activeItem?.id ? compositesToShow.splice(compositesToShow.length - 2, 1)[0] : compositesToShow.pop();
      size3 -= this.compositeSizeInBar.get(removedComposite);
    }
    if (totalComposites === compositesToShow.length && this.compositeOverflowAction.value) {
      compositeSwitcherBar.pull(compositeSwitcherBar.length() - 1);
      this.compositeOverflowAction.value = void 0;
      this.compositeOverflowActionViewItem.value = void 0;
    }
    const compositesToRemove = [];
    this.visibleComposites.forEach((compositeId, index2) => {
      if (!compositesToShow.includes(compositeId)) {
        compositesToRemove.push(index2);
      }
    });
    compositesToRemove.reverse().forEach((index2) => {
      compositeSwitcherBar.pull(index2);
      this.visibleComposites.splice(index2, 1);
    });
    compositesToShow.forEach((compositeId, newIndex) => {
      const currentIndex = this.visibleComposites.indexOf(compositeId);
      if (newIndex !== currentIndex) {
        if (currentIndex !== -1) {
          compositeSwitcherBar.pull(currentIndex);
          this.visibleComposites.splice(currentIndex, 1);
        }
        compositeSwitcherBar.push(this.model.findItem(compositeId).activityAction, { label: true, icon: this.options.icon, index: newIndex });
        this.visibleComposites.splice(newIndex, 0, compositeId);
      }
    });
    if (totalComposites > compositesToShow.length && !this.compositeOverflowAction.value) {
      this.compositeOverflowAction.value = this.instantiationService.createInstance(CompositeOverflowActivityAction, () => {
        this.compositeOverflowActionViewItem.value?.showMenu();
      });
      this.compositeOverflowActionViewItem.value = this.instantiationService.createInstance(
        CompositeOverflowActivityActionViewItem,
        this.compositeOverflowAction.value,
        () => this.getOverflowingComposites(),
        () => this.model.activeItem ? this.model.activeItem.id : void 0,
        (compositeId) => {
          const item = this.model.findItem(compositeId);
          return item?.activity[0]?.badge;
        },
        this.options.getOnCompositeClickAction,
        this.options.colors,
        this.options.activityHoverOptions
      );
      compositeSwitcherBar.push(this.compositeOverflowAction.value, { label: false, icon: true });
    }
    if (!donotTrigger) {
      this._onDidChange.fire();
    }
  }
  getOverflowingComposites() {
    let overflowingIds = this.model.visibleItems.filter((item) => item.pinned).map((item) => item.id);
    if (this.model.activeItem && !this.model.activeItem.pinned) {
      overflowingIds.push(this.model.activeItem.id);
    }
    overflowingIds = overflowingIds.filter((compositeId) => !this.visibleComposites.includes(compositeId));
    return this.model.visibleItems.filter((c) => overflowingIds.includes(c.id)).map((item) => {
      return { id: item.id, name: this.getAction(item.id)?.label || item.name };
    });
  }
  showContextMenu(targetWindow, e4) {
    EventHelper.stop(e4, true);
    const event = new StandardMouseEvent(targetWindow, e4);
    this.contextMenuService.showContextMenu({
      getAnchor: () => event,
      getActions: () => this.getContextMenuActions(e4)
    });
  }
  getContextMenuActions(e4) {
    const actions = this.model.visibleItems.map(({ id: id2, name, activityAction }) => {
      const isPinned = this.isPinned(id2);
      return toAction({
        id: id2,
        label: this.getAction(id2).label || name || id2,
        checked: isPinned,
        enabled: activityAction.enabled && (!isPinned || this.getPinnedCompositeIds().length > 1),
        run: () => {
          if (this.isPinned(id2)) {
            this.unpin(id2);
          } else {
            this.pin(id2, true);
          }
        }
      });
    });
    this.options.fillExtraContextMenuActions(actions, e4);
    return actions;
  }
};

CompositeBar = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IContextMenuService),
  __decorateParam(4, IViewDescriptorService)
], CompositeBar);

var CompositeBarModel = class {
  constructor(items, options3) {
    this._items = [];
    this.options = options3;
    this.setItems(items);
  }
  get items() {
    return this._items;
  }
  setItems(items) {
    this._items = [];
    this._items = items.map((i2) => this.createCompositeBarItem(i2.id, i2.name, i2.order, i2.pinned, i2.visible));
  }
  get visibleItems() {
    return this.items.filter((item) => item.visible);
  }
  get pinnedItems() {
    return this.items.filter((item) => item.visible && item.pinned);
  }
  createCompositeBarItem(id2, name, order, pinned, visible) {
    const options3 = this.options;
    return {
      id: id2,
      name,
      pinned,
      order,
      visible,
      activity: [],
      get activityAction() {
        return options3.getActivityAction(id2);
      },
      get pinnedAction() {
        return options3.getCompositePinnedAction(id2);
      },
      get toggleBadgeAction() {
        return options3.getCompositeBadgeAction(id2);
      }
    };
  }
  add(id2, name, order, requestedIndex) {
    const item = this.findItem(id2);
    if (item) {
      let changed = false;
      item.name = name;
      if (!isUndefinedOrNull(order)) {
        changed = item.order !== order;
        item.order = order;
      }
      if (!item.visible) {
        item.visible = true;
        changed = true;
      }
      return changed;
    } else {
      const item2 = this.createCompositeBarItem(id2, name, order, true, true);
      if (!isUndefinedOrNull(requestedIndex)) {
        let index2 = 0;
        let rIndex = requestedIndex;
        while (rIndex > 0 && index2 < this.items.length) {
          if (this.items[index2++].visible) {
            rIndex--;
          }
        }
        this.items.splice(index2, 0, item2);
      } else if (isUndefinedOrNull(order)) {
        this.items.push(item2);
      } else {
        let index2 = 0;
        while (index2 < this.items.length && typeof this.items[index2].order === "number" && this.items[index2].order < order) {
          index2++;
        }
        this.items.splice(index2, 0, item2);
      }
      return true;
    }
  }
  remove(id2) {
    for (let index2 = 0; index2 < this.items.length; index2++) {
      if (this.items[index2].id === id2) {
        this.items.splice(index2, 1);
        return true;
      }
    }
    return false;
  }
  hide(id2) {
    for (const item of this.items) {
      if (item.id === id2) {
        if (item.visible) {
          item.visible = false;
          return true;
        }
        return false;
      }
    }
    return false;
  }
  move(compositeId, toCompositeId) {
    const fromIndex = this.findIndex(compositeId);
    const toIndex = this.findIndex(toCompositeId);
    if (fromIndex === -1 || toIndex === -1) {
      return false;
    }
    const sourceItem = this.items.splice(fromIndex, 1)[0];
    this.items.splice(toIndex, 0, sourceItem);
    sourceItem.pinned = true;
    return true;
  }
  setPinned(id2, pinned) {
    for (const item of this.items) {
      if (item.id === id2) {
        if (item.pinned !== pinned) {
          item.pinned = pinned;
          return true;
        }
        return false;
      }
    }
    return false;
  }
  activate(id2) {
    if (!this.activeItem || this.activeItem.id !== id2) {
      if (this.activeItem) {
        this.deactivate();
      }
      for (const item of this.items) {
        if (item.id === id2) {
          this.activeItem = item;
          this.activeItem.activityAction.activate();
          return true;
        }
      }
    }
    return false;
  }
  deactivate() {
    if (this.activeItem) {
      this.activeItem.activityAction.deactivate();
      this.activeItem = void 0;
      return true;
    }
    return false;
  }
  findItem(id2) {
    return this.items.filter((item) => item.id === id2)[0];
  }
  findIndex(id2) {
    for (let index2 = 0; index2 < this.items.length; index2++) {
      if (this.items[index2].id === id2) {
        return index2;
      }
    }
    return -1;
  }
};
export { CompositeDragAndDrop, CompositeBarDndCallbacks, CompositeBar, CompositeBarModel };
