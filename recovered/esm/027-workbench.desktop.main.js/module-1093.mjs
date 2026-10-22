// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/common/views.ts
import { localize } from "./module-0001.mjs";
import { registerIcon } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";
import { Disposable, toDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { SetMap, getOrSet } from "./module-0008.mjs";
import { Registry } from "./module-0090.mjs";
import { createDecorator } from "./module-0077.mjs";
import { mixin } from "./module-0098.mjs";


// src/vs/workbench/common/views.ts
var VIEWS_LOG_ID = "views";

var VIEWS_LOG_NAME = localize(7579, null);

var defaultViewIcon = registerIcon("default-view-icon", Codicon.window, localize(7576, null));

var Extensions13;

((Extensions21) => {
  Extensions21.ViewContainersRegistry = "workbench.registry.view.containers";
  Extensions21.ViewsRegistry = "workbench.registry.view";
})(Extensions13 || (Extensions13 = {}));

function ViewContainerLocationToString(viewContainerLocation) {
  switch (viewContainerLocation) {
    case 0 /* Sidebar */:
      return "sidebar";
    case 1 /* Panel */:
      return "panel";
    case 2 /* AuxiliaryBar */:
      return "auxiliarybar";
  }
}

var ViewContainersRegistryImpl = class extends Disposable {
  constructor() {
    super(...arguments);
    this._onDidRegister = this._register(new Emitter());
    this.onDidRegister = this._onDidRegister.event;
    this._onDidDeregister = this._register(new Emitter());
    this.onDidDeregister = this._onDidDeregister.event;
    this.viewContainers = /* @__PURE__ */ new Map();
    this.defaultViewContainers = [];
  }
  get all() {
    return [...this.viewContainers.values()].flat();
  }
  registerViewContainer(viewContainerDescriptor, viewContainerLocation, options3) {
    const existing = this.get(viewContainerDescriptor.id);
    if (existing) {
      return existing;
    }
    const viewContainer5 = viewContainerDescriptor;
    viewContainer5.openCommandActionDescriptor = options3?.doNotRegisterOpenCommand ? void 0 : viewContainer5.openCommandActionDescriptor ?? { id: viewContainer5.id };
    const viewContainers = getOrSet(this.viewContainers, viewContainerLocation, []);
    viewContainers.push(viewContainer5);
    if (options3?.isDefault) {
      this.defaultViewContainers.push(viewContainer5);
    }
    this._onDidRegister.fire({ viewContainer: viewContainer5, viewContainerLocation });
    return viewContainer5;
  }
  deregisterViewContainer(viewContainer5) {
    for (const viewContainerLocation of this.viewContainers.keys()) {
      const viewContainers = this.viewContainers.get(viewContainerLocation);
      const index2 = viewContainers?.indexOf(viewContainer5);
      if (index2 !== -1) {
        viewContainers?.splice(index2, 1);
        if (viewContainers.length === 0) {
          this.viewContainers.delete(viewContainerLocation);
        }
        this._onDidDeregister.fire({ viewContainer: viewContainer5, viewContainerLocation });
        return;
      }
    }
  }
  get(id2) {
    return this.all.filter((viewContainer5) => viewContainer5.id === id2)[0];
  }
  getViewContainers(location2) {
    return [...this.viewContainers.get(location2) || []];
  }
  getViewContainerLocation(container3) {
    return [...this.viewContainers.keys()].filter((location2) => this.getViewContainers(location2).filter((viewContainer5) => viewContainer5?.id === container3.id).length > 0)[0];
  }
  getDefaultViewContainers(location2) {
    return this.defaultViewContainers.filter((viewContainer5) => this.getViewContainerLocation(viewContainer5) === location2);
  }
};

Registry.add(Extensions13.ViewContainersRegistry, new ViewContainersRegistryImpl());

function compareViewContentDescriptors(a, b) {
  const aGroup = a.group ?? "9_more" /* More */;
  const bGroup = b.group ?? "9_more" /* More */;
  if (aGroup !== bGroup) {
    return aGroup.localeCompare(bGroup);
  }
  return (a.order ?? 5) - (b.order ?? 5);
}

var ViewsRegistry = class extends Disposable {
  constructor() {
    super(...arguments);
    this._onViewsRegistered = this._register(new Emitter());
    this.onViewsRegistered = this._onViewsRegistered.event;
    this._onViewsDeregistered = this._register(new Emitter());
    this.onViewsDeregistered = this._onViewsDeregistered.event;
    this._onDidChangeContainer = this._register(new Emitter());
    this.onDidChangeContainer = this._onDidChangeContainer.event;
    this._onDidChangeViewWelcomeContent = this._register(new Emitter());
    this.onDidChangeViewWelcomeContent = this._onDidChangeViewWelcomeContent.event;
    this._viewContainers = [];
    this._views = /* @__PURE__ */ new Map();
    this._viewWelcomeContents = new SetMap();
  }
  registerViews(views, viewContainer5) {
    this.registerViews2([{ views, viewContainer: viewContainer5 }]);
  }
  registerViews2(views) {
    views.forEach(({ views: views2, viewContainer: viewContainer5 }) => this.addViews(views2, viewContainer5));
    this._onViewsRegistered.fire(views);
  }
  deregisterViews(viewDescriptors, viewContainer5) {
    const views = this.removeViews(viewDescriptors, viewContainer5);
    if (views.length) {
      this._onViewsDeregistered.fire({ views, viewContainer: viewContainer5 });
    }
  }
  moveViews(viewsToMove, viewContainer5) {
    for (const container3 of this._views.keys()) {
      if (container3 !== viewContainer5) {
        const views = this.removeViews(viewsToMove, container3);
        if (views.length) {
          this.addViews(views, viewContainer5);
          this._onDidChangeContainer.fire({ views, from: container3, to: viewContainer5 });
        }
      }
    }
  }
  getViews(loc) {
    return this._views.get(loc) || [];
  }
  getView(id2) {
    for (const viewContainer5 of this._viewContainers) {
      const viewDescriptor4 = (this._views.get(viewContainer5) || []).filter((v2) => v2.id === id2)[0];
      if (viewDescriptor4) {
        return viewDescriptor4;
      }
    }
    return null;
  }
  getViewContainer(viewId) {
    for (const viewContainer5 of this._viewContainers) {
      const viewDescriptor4 = (this._views.get(viewContainer5) || []).filter((v2) => v2.id === viewId)[0];
      if (viewDescriptor4) {
        return viewContainer5;
      }
    }
    return null;
  }
  registerViewWelcomeContent(id2, viewContent) {
    this._viewWelcomeContents.add(id2, viewContent);
    this._onDidChangeViewWelcomeContent.fire(id2);
    return toDisposable(() => {
      this._viewWelcomeContents.delete(id2, viewContent);
      this._onDidChangeViewWelcomeContent.fire(id2);
    });
  }
  registerViewWelcomeContent2(id2, viewContentMap) {
    const disposables = /* @__PURE__ */ new Map();
    for (const [key3, content2] of viewContentMap) {
      this._viewWelcomeContents.add(id2, content2);
      disposables.set(key3, toDisposable(() => {
        this._viewWelcomeContents.delete(id2, content2);
        this._onDidChangeViewWelcomeContent.fire(id2);
      }));
    }
    this._onDidChangeViewWelcomeContent.fire(id2);
    return disposables;
  }
  getViewWelcomeContent(id2) {
    const result = [];
    this._viewWelcomeContents.forEach(id2, (descriptor) => result.push(descriptor));
    return result.sort(compareViewContentDescriptors);
  }
  addViews(viewDescriptors, viewContainer5) {
    let views = this._views.get(viewContainer5);
    if (!views) {
      views = [];
      this._views.set(viewContainer5, views);
      this._viewContainers.push(viewContainer5);
    }
    for (const viewDescriptor4 of viewDescriptors) {
      if (this.getView(viewDescriptor4.id) !== null) {
        throw new Error(localize(7577, null, viewDescriptor4.id));
      }
      views.push(viewDescriptor4);
    }
  }
  removeViews(viewDescriptors, viewContainer5) {
    const views = this._views.get(viewContainer5);
    if (!views) {
      return [];
    }
    const viewsToDeregister = [];
    const remaningViews = [];
    for (const view of views) {
      if (!viewDescriptors.includes(view)) {
        remaningViews.push(view);
      } else {
        viewsToDeregister.push(view);
      }
    }
    if (viewsToDeregister.length) {
      if (remaningViews.length) {
        this._views.set(viewContainer5, remaningViews);
      } else {
        this._views.delete(viewContainer5);
        this._viewContainers.splice(this._viewContainers.indexOf(viewContainer5), 1);
      }
    }
    return viewsToDeregister;
  }
};

Registry.add(Extensions13.ViewsRegistry, new ViewsRegistry());

var IViewDescriptorService = createDecorator("viewDescriptorService");

var ResolvableTreeItem = class {
  constructor(treeItem, resolve3) {
    this.resolved = false;
    this._hasResolve = false;
    mixin(this, treeItem);
    this._hasResolve = !!resolve3;
    this.resolve = async (token) => {
      if (resolve3 && !this.resolved) {
        const resolvedItem = await resolve3(token);
        if (resolvedItem) {
          this.tooltip = this.tooltip ?? resolvedItem.tooltip;
          this.command = this.command ?? resolvedItem.command;
        }
      }
      if (!token.isCancellationRequested) {
        this.resolved = true;
      }
    };
  }
  get hasResolve() {
    return this._hasResolve;
  }
  resetResolve() {
    this.resolved = false;
  }
  asTreeItem() {
    return {
      handle: this.handle,
      parentHandle: this.parentHandle,
      collapsibleState: this.collapsibleState,
      label: this.label,
      description: this.description,
      icon: this.icon,
      iconDark: this.iconDark,
      themeIcon: this.themeIcon,
      resourceUri: this.resourceUri,
      tooltip: this.tooltip,
      contextValue: this.contextValue,
      command: this.command,
      children: this.children,
      accessibilityInformation: this.accessibilityInformation
    };
  }
};

var NoTreeViewError = class extends Error {
  constructor(treeViewId) {
    super(localize(7578, null, treeViewId));
    this.name = "NoTreeViewError";
  }
  static is(err) {
    return !!err && err.name === "NoTreeViewError";
  }
};
export { ViewContainerLocationToString, compareViewContentDescriptors, VIEWS_LOG_ID, VIEWS_LOG_NAME, defaultViewIcon, Extensions13, ViewContainersRegistryImpl, ViewsRegistry, IViewDescriptorService, ResolvableTreeItem, NoTreeViewError };
