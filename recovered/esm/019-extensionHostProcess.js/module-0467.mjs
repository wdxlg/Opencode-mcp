// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/common/views.ts
import { localize } from "./module-0013.mjs";
import { registerIcon } from "./module-0208.mjs";
import { Codicon } from "./module-0083.mjs";
import { Disposable, toDisposable } from "./module-0011.mjs";
import { Emitter } from "./module-0017.mjs";
import { SetMap, getOrSet } from "./module-0007.mjs";
import { Registry } from "./module-0097.mjs";
import { createDecorator2 } from "./module-0048.mjs";


// src/vs/workbench/common/views.ts
var VIEWS_LOG_NAME = localize(7579, null);

var defaultViewIcon = registerIcon("default-view-icon", Codicon.window, localize(7576, null));

var Extensions7;

((Extensions8) => {
  Extensions8.ViewContainersRegistry = "workbench.registry.view.containers";
  Extensions8.ViewsRegistry = "workbench.registry.view";
})(Extensions7 || (Extensions7 = {}));

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
  registerViewContainer(viewContainerDescriptor, viewContainerLocation, options2) {
    const existing = this.get(viewContainerDescriptor.id);
    if (existing) {
      return existing;
    }
    const viewContainer = viewContainerDescriptor;
    viewContainer.openCommandActionDescriptor = options2?.doNotRegisterOpenCommand ? void 0 : viewContainer.openCommandActionDescriptor ?? { id: viewContainer.id };
    const viewContainers = getOrSet(this.viewContainers, viewContainerLocation, []);
    viewContainers.push(viewContainer);
    if (options2?.isDefault) {
      this.defaultViewContainers.push(viewContainer);
    }
    this._onDidRegister.fire({ viewContainer, viewContainerLocation });
    return viewContainer;
  }
  deregisterViewContainer(viewContainer) {
    for (const viewContainerLocation of this.viewContainers.keys()) {
      const viewContainers = this.viewContainers.get(viewContainerLocation);
      const index = viewContainers?.indexOf(viewContainer);
      if (index !== -1) {
        viewContainers?.splice(index, 1);
        if (viewContainers.length === 0) {
          this.viewContainers.delete(viewContainerLocation);
        }
        this._onDidDeregister.fire({ viewContainer, viewContainerLocation });
        return;
      }
    }
  }
  get(id2) {
    return this.all.filter((viewContainer) => viewContainer.id === id2)[0];
  }
  getViewContainers(location2) {
    return [...this.viewContainers.get(location2) || []];
  }
  getViewContainerLocation(container) {
    return [...this.viewContainers.keys()].filter((location2) => this.getViewContainers(location2).filter((viewContainer) => viewContainer?.id === container.id).length > 0)[0];
  }
  getDefaultViewContainers(location2) {
    return this.defaultViewContainers.filter((viewContainer) => this.getViewContainerLocation(viewContainer) === location2);
  }
};

Registry.add(Extensions7.ViewContainersRegistry, new ViewContainersRegistryImpl());

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
  registerViews(views, viewContainer) {
    this.registerViews2([{ views, viewContainer }]);
  }
  registerViews2(views) {
    views.forEach(({ views: views2, viewContainer }) => this.addViews(views2, viewContainer));
    this._onViewsRegistered.fire(views);
  }
  deregisterViews(viewDescriptors, viewContainer) {
    const views = this.removeViews(viewDescriptors, viewContainer);
    if (views.length) {
      this._onViewsDeregistered.fire({ views, viewContainer });
    }
  }
  moveViews(viewsToMove, viewContainer) {
    for (const container of this._views.keys()) {
      if (container !== viewContainer) {
        const views = this.removeViews(viewsToMove, container);
        if (views.length) {
          this.addViews(views, viewContainer);
          this._onDidChangeContainer.fire({ views, from: container, to: viewContainer });
        }
      }
    }
  }
  getViews(loc) {
    return this._views.get(loc) || [];
  }
  getView(id2) {
    for (const viewContainer of this._viewContainers) {
      const viewDescriptor = (this._views.get(viewContainer) || []).filter((v) => v.id === id2)[0];
      if (viewDescriptor) {
        return viewDescriptor;
      }
    }
    return null;
  }
  getViewContainer(viewId) {
    for (const viewContainer of this._viewContainers) {
      const viewDescriptor = (this._views.get(viewContainer) || []).filter((v) => v.id === viewId)[0];
      if (viewDescriptor) {
        return viewContainer;
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
    for (const [key, content] of viewContentMap) {
      this._viewWelcomeContents.add(id2, content);
      disposables.set(key, toDisposable(() => {
        this._viewWelcomeContents.delete(id2, content);
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
  addViews(viewDescriptors, viewContainer) {
    let views = this._views.get(viewContainer);
    if (!views) {
      views = [];
      this._views.set(viewContainer, views);
      this._viewContainers.push(viewContainer);
    }
    for (const viewDescriptor of viewDescriptors) {
      if (this.getView(viewDescriptor.id) !== null) {
        throw new Error(localize(7577, null, viewDescriptor.id));
      }
      views.push(viewDescriptor);
    }
  }
  removeViews(viewDescriptors, viewContainer) {
    const views = this._views.get(viewContainer);
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
        this._views.set(viewContainer, remaningViews);
      } else {
        this._views.delete(viewContainer);
        this._viewContainers.splice(this._viewContainers.indexOf(viewContainer), 1);
      }
    }
    return viewsToDeregister;
  }
};

Registry.add(Extensions7.ViewsRegistry, new ViewsRegistry());

var IViewDescriptorService = createDecorator2("viewDescriptorService");

var NoTreeViewError = class extends Error {
  constructor(treeViewId) {
    super(localize(7578, null, treeViewId));
    this.name = "NoTreeViewError";
  }
  static is(err) {
    return !!err && err.name === "NoTreeViewError";
  }
};
export { compareViewContentDescriptors, VIEWS_LOG_NAME, defaultViewIcon, Extensions7, ViewContainersRegistryImpl, ViewsRegistry, IViewDescriptorService, NoTreeViewError };
