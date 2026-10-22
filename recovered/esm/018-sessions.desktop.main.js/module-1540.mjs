// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/viewsExtensionPoint.ts
import { localize } from "./module-0001.mjs";
import { ExtensionsRegistry } from "./module-0878.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions13 } from "./module-1094.mjs";
import { ExtensionIdentifier, ExtensionIdentifierSet } from "./module-0688.mjs";
import { isFalsyOrWhitespace } from "./module-0030.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { joinPath } from "./module-0034.mjs";
import { SyncDescriptor } from "./module-0134.mjs";
import { ViewPaneContainer } from "./module-1381.mjs";
import { Extensions17 } from "./module-1518.mjs";
import { isProposedApiEnabled } from "./module-0889.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { CustomTreeView, TreeViewPane } from "./module-1533.mjs";
import { WebviewViewPane } from "./module-1539.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { VIEWLET_ID5 } from "./module-1538.mjs";
import { VIEWLET_ID4 } from "./module-1534.mjs";
import { VIEWLET_ID2 } from "./module-1058.mjs";
import { VIEWLET_ID3 } from "./module-1081.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ILogService } from "./module-0095.mjs";
import { Disposable } from "./module-0012.mjs";
import { Extensions11 } from "./module-0879.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";


// src/vs/workbench/api/browser/viewsExtensionPoint.ts
var viewsContainerSchema = {
  type: "object",
  properties: {
    id: {
      description: localize(5804, null),
      type: "string",
      pattern: "^[a-zA-Z0-9_-]+$"
    },
    title: {
      description: localize(5805, null),
      type: "string"
    },
    icon: {
      description: localize(5803, null),
      type: "string"
    }
  },
  required: ["id", "title", "icon"]
};

var viewsContainersContribution = {
  description: localize(5806, null),
  type: "object",
  properties: {
    "activitybar": {
      description: localize(5777, null),
      type: "array",
      items: viewsContainerSchema
    },
    "panel": {
      description: localize(5778, null),
      type: "array",
      items: viewsContainerSchema
    },
    "secondarySidebar": {
      description: localize(5779, null),
      type: "array",
      items: viewsContainerSchema
    }
  },
  additionalProperties: false
};

var InitialVisibility = /* @__PURE__ */ ((InitialVisibility2) => {
  InitialVisibility2["Visible"] = "visible";
  InitialVisibility2["Hidden"] = "hidden";
  InitialVisibility2["Collapsed"] = "collapsed";
  return InitialVisibility2;
})(InitialVisibility || {});

var viewDescriptor = {
  type: "object",
  required: ["id", "name", "icon"],
  defaultSnippets: [{ body: { id: "${1:id}", name: "${2:name}", icon: "${3:icon}" } }],
  properties: {
    type: {
      markdownDescription: localize(5799, null),
      type: "string",
      enum: [
        "tree",
        "webview"
      ],
      markdownEnumDescriptions: [
        localize(5798, null),
        localize(5800, null)
      ]
    },
    id: {
      markdownDescription: localize(5791, null),
      type: "string"
    },
    name: {
      description: localize(5796, null),
      type: "string"
    },
    when: {
      description: localize(5801, null),
      type: "string"
    },
    icon: {
      description: localize(5790, null),
      type: "string"
    },
    contextualTitle: {
      description: localize(5788, null),
      type: "string"
    },
    visibility: {
      description: localize(5792, null),
      type: "string",
      enum: [
        "visible",
        "hidden",
        "collapsed"
      ],
      default: "visible",
      enumDescriptions: [
        localize(5795, null),
        localize(5794, null),
        localize(5793, null)
      ]
    },
    initialSize: {
      type: "number",
      description: localize(5807, null)
    },
    accessibilityHelpContent: {
      type: "string",
      markdownDescription: localize(5787, null)
    }
  }
};

var remoteViewDescriptor = {
  type: "object",
  required: ["id", "name"],
  properties: {
    id: {
      description: localize(5791, null),
      type: "string"
    },
    name: {
      description: localize(5796, null),
      type: "string"
    },
    when: {
      description: localize(5801, null),
      type: "string"
    },
    group: {
      description: localize(5789, null),
      type: "string"
    },
    remoteName: {
      description: localize(5797, null),
      type: ["string", "array"],
      items: {
        type: "string"
      }
    }
  }
};

var viewsContribution = {
  description: localize(5802, null),
  type: "object",
  properties: {
    "explorer": {
      description: localize(5782, null),
      type: "array",
      items: viewDescriptor,
      default: []
    },
    "debug": {
      description: localize(5781, null),
      type: "array",
      items: viewDescriptor,
      default: []
    },
    "scm": {
      description: localize(5784, null),
      type: "array",
      items: viewDescriptor,
      default: []
    },
    "test": {
      description: localize(5785, null),
      type: "array",
      items: viewDescriptor,
      default: []
    },
    "remote": {
      description: localize(5783, null),
      type: "array",
      items: remoteViewDescriptor,
      default: []
    }
  },
  additionalProperties: {
    description: localize(5780, null),
    type: "array",
    items: viewDescriptor,
    default: []
  }
};

var viewsContainersExtensionPoint = ExtensionsRegistry.registerExtensionPoint({
  extensionPoint: "viewsContainers",
  jsonSchema: viewsContainersContribution
});

var viewsExtensionPoint = ExtensionsRegistry.registerExtensionPoint({
  extensionPoint: "views",
  deps: [viewsContainersExtensionPoint],
  jsonSchema: viewsContribution,
  activationEventsGenerator: function* (viewExtensionPointTypeArray) {
    for (const viewExtensionPointType of viewExtensionPointTypeArray) {
      for (const viewDescriptors of Object.values(viewExtensionPointType)) {
        for (const viewDescriptor3 of viewDescriptors) {
          if (viewDescriptor3.id) {
            yield `onView:${viewDescriptor3.id}`;
          }
        }
      }
    }
  }
});

var CUSTOM_VIEWS_START_ORDER = 7;

var ViewsExtensionHandler = class {
  constructor(instantiationService, logService) {
    this.instantiationService = instantiationService;
    this.logService = logService;
    this.viewContainersRegistry = Registry.as(Extensions13.ViewContainersRegistry);
    this.viewsRegistry = Registry.as(Extensions13.ViewsRegistry);
    this.handleAndRegisterCustomViewContainers();
    this.handleAndRegisterCustomViews();
  }
  static {
    this.ID = "workbench.contrib.viewsExtensionHandler";
  }
  handleAndRegisterCustomViewContainers() {
    viewsContainersExtensionPoint.setHandler((extensions, { added, removed }) => {
      if (removed.length) {
        this.removeCustomViewContainers(removed);
      }
      if (added.length) {
        this.addCustomViewContainers(added, this.viewContainersRegistry.all);
      }
    });
  }
  addCustomViewContainers(extensionPoints, existingViewContainers) {
    const viewContainersRegistry3 = Registry.as(Extensions13.ViewContainersRegistry);
    let activityBarOrder = CUSTOM_VIEWS_START_ORDER + viewContainersRegistry3.all.filter((v2) => !!v2.extensionId && viewContainersRegistry3.getViewContainerLocation(v2) === 0 /* Sidebar */).length;
    let panelOrder = 5 + viewContainersRegistry3.all.filter((v2) => !!v2.extensionId && viewContainersRegistry3.getViewContainerLocation(v2) === 1 /* Panel */).length + 1;
    let auxiliaryBarOrder = 100 + viewContainersRegistry3.all.filter((v2) => !!v2.extensionId && viewContainersRegistry3.getViewContainerLocation(v2) === 2 /* AuxiliaryBar */).length + 1;
    for (const { value: value2, collector, description } of extensionPoints) {
      Object.entries(value2).forEach(([key3, value3]) => {
        if (!this.isValidViewsContainer(value3, collector)) {
          return;
        }
        switch (key3) {
          case "activitybar":
            activityBarOrder = this.registerCustomViewContainers(value3, description, activityBarOrder, existingViewContainers, 0 /* Sidebar */);
            break;
          case "panel":
            panelOrder = this.registerCustomViewContainers(value3, description, panelOrder, existingViewContainers, 1 /* Panel */);
            break;
          case "secondarySidebar":
            auxiliaryBarOrder = this.registerCustomViewContainers(value3, description, auxiliaryBarOrder, existingViewContainers, 2 /* AuxiliaryBar */);
            break;
        }
      });
    }
  }
  removeCustomViewContainers(extensionPoints) {
    const viewContainersRegistry3 = Registry.as(Extensions13.ViewContainersRegistry);
    const removedExtensions = extensionPoints.reduce((result, e4) => {
      result.add(e4.description.identifier);
      return result;
    }, new ExtensionIdentifierSet());
    for (const viewContainer of viewContainersRegistry3.all) {
      if (viewContainer.extensionId && removedExtensions.has(viewContainer.extensionId)) {
        const views = this.viewsRegistry.getViews(viewContainer);
        if (views.length) {
          this.viewsRegistry.moveViews(views, this.getDefaultViewContainer());
        }
        this.deregisterCustomViewContainer(viewContainer);
      }
    }
  }
  isValidViewsContainer(viewsContainersDescriptors, collector) {
    if (!Array.isArray(viewsContainersDescriptors)) {
      collector.error(localize(5773, null));
      return false;
    }
    for (const descriptor of viewsContainersDescriptors) {
      if (typeof descriptor.id !== "string" && isFalsyOrWhitespace(descriptor.id)) {
        collector.error(localize(5763, null, "id"));
        return false;
      }
      if (!/^[a-z0-9_-]+$/i.test(descriptor.id)) {
        collector.error(localize(5763, null, "id"));
        return false;
      }
      if (typeof descriptor.title !== "string") {
        collector.error(localize(5766, null, "title"));
        return false;
      }
      if (typeof descriptor.icon !== "string") {
        collector.error(localize(5766, null, "icon"));
        return false;
      }
      if (isFalsyOrWhitespace(descriptor.title)) {
        collector.warn(localize(5764, null, "title"));
        return true;
      }
    }
    return true;
  }
  registerCustomViewContainers(containers, extension, order, existingViewContainers, location2) {
    containers.forEach((descriptor) => {
      const themeIcon = ThemeIcon.fromString(descriptor.icon);
      const icon2 = themeIcon || joinPath(extension.extensionLocation, descriptor.icon);
      const id2 = `workbench.view.extension.${descriptor.id}`;
      const title = descriptor.title || id2;
      const viewContainer = this.registerCustomViewContainer(id2, title, icon2, order++, extension.identifier, location2);
      if (existingViewContainers.length) {
        const viewsToMove = [];
        for (const existingViewContainer of existingViewContainers) {
          if (viewContainer !== existingViewContainer) {
            viewsToMove.push(...this.viewsRegistry.getViews(existingViewContainer).filter((view) => view.originalContainerId === descriptor.id));
          }
        }
        if (viewsToMove.length) {
          this.viewsRegistry.moveViews(viewsToMove, viewContainer);
        }
      }
    });
    return order;
  }
  registerCustomViewContainer(id2, title, icon2, order, extensionId, location2) {
    let viewContainer = this.viewContainersRegistry.get(id2);
    if (!viewContainer) {
      viewContainer = this.viewContainersRegistry.registerViewContainer({
        id: id2,
        title: { value: title, original: title },
        extensionId,
        ctorDescriptor: new SyncDescriptor(
          ViewPaneContainer,
          [id2, { mergeViewWithContainerWhenSingleView: true }]
        ),
        hideIfEmpty: true,
        order,
        icon: icon2
      }, location2);
    }
    return viewContainer;
  }
  deregisterCustomViewContainer(viewContainer) {
    this.viewContainersRegistry.deregisterViewContainer(viewContainer);
    Registry.as(Extensions17.Viewlets).deregisterPaneComposite(viewContainer.id);
  }
  handleAndRegisterCustomViews() {
    viewsExtensionPoint.setHandler((extensions, { added, removed }) => {
      if (removed.length) {
        this.removeViews(removed);
      }
      if (added.length) {
        this.addViews(added);
      }
    });
  }
  addViews(extensions) {
    const viewIds = /* @__PURE__ */ new Set();
    const allViewDescriptors = [];
    for (const extension of extensions) {
      const { value: value2, collector } = extension;
      Object.entries(value2).forEach(([key3, value3]) => {
        if (!this.isValidViewDescriptors(value3, collector)) {
          return;
        }
        if (key3 === "remote" && !isProposedApiEnabled(extension.description, "contribViewsRemote")) {
          collector.warn(localize(5775, null, key3));
          return;
        }
        if (key3 === "agentSessions" && !isProposedApiEnabled(extension.description, "chatSessionsProvider")) {
          collector.warn(localize(5765, null, key3));
          return;
        }
        const viewContainer = this.getViewContainer(key3);
        if (!viewContainer) {
          collector.warn(localize(5774, null, key3));
        }
        const container2 = viewContainer || this.getDefaultViewContainer();
        const viewDescriptors = [];
        for (let index2 = 0; index2 < value3.length; index2++) {
          const item = value3[index2];
          if (viewIds.has(item.id)) {
            collector.error(localize(5758, null, item.id));
            continue;
          }
          if (this.viewsRegistry.getView(item.id) !== null) {
            collector.error(localize(5759, null, item.id));
            continue;
          }
          const order = ExtensionIdentifier.equals(extension.description.identifier, container2.extensionId) ? index2 + 1 : container2.viewOrderDelegate ? container2.viewOrderDelegate.getOrder(item.group) : void 0;
          let icon2;
          if (typeof item.icon === "string") {
            icon2 = ThemeIcon.fromString(item.icon) || joinPath(extension.description.extensionLocation, item.icon);
          }
          const initialVisibility = this.convertInitialVisibility(item.visibility);
          const type = this.getViewType(item.type);
          if (!type) {
            collector.error(localize(5767, null, item.type));
            continue;
          }
          let weight5 = void 0;
          if (typeof item.initialSize === "number") {
            if (container2.extensionId?.value === extension.description.identifier.value) {
              weight5 = item.initialSize;
            } else {
              this.logService.warn(`${extension.description.identifier.value} tried to set the view size of ${item.id} but it was ignored because the view container does not belong to it.`);
            }
          }
          let accessibilityHelpContent;
          if (isProposedApiEnabled(extension.description, "contribAccessibilityHelpContent") && item.accessibilityHelpContent) {
            accessibilityHelpContent = new MarkdownString(item.accessibilityHelpContent);
          }
          const viewDescriptor3 = {
            type,
            ctorDescriptor: type === "tree" /* Tree */ ? new SyncDescriptor(TreeViewPane) : new SyncDescriptor(WebviewViewPane),
            id: item.id,
            name: { value: item.name, original: item.name },
            when: ContextKeyExpr.deserialize(item.when),
            containerIcon: icon2 || viewContainer?.icon,
            containerTitle: item.contextualTitle || viewContainer && (typeof viewContainer.title === "string" ? viewContainer.title : viewContainer.title.value),
            canToggleVisibility: true,
            canMoveView: viewContainer?.id !== VIEWLET_ID5,
            treeView: type === "tree" /* Tree */ ? this.instantiationService.createInstance(CustomTreeView, item.id, item.name, extension.description.identifier.value) : void 0,
            collapsed: this.showCollapsed(container2) || initialVisibility === "collapsed" /* Collapsed */,
            order,
            extensionId: extension.description.identifier,
            originalContainerId: key3,
            group: item.group,
            // eslint-disable-next-line local/code-no-any-casts, @typescript-eslint/no-explicit-any
            remoteAuthority: item.remoteName || item.remoteAuthority,
            // TODO@roblou - delete after remote extensions are updated
            virtualWorkspace: item.virtualWorkspace,
            hideByDefault: initialVisibility === "hidden" /* Hidden */,
            workspace: viewContainer?.id === VIEWLET_ID5 ? true : void 0,
            weight: weight5,
            accessibilityHelpContent
          };
          viewIds.add(viewDescriptor3.id);
          viewDescriptors.push(viewDescriptor3);
        }
        allViewDescriptors.push({ viewContainer: container2, views: viewDescriptors });
      });
    }
    this.viewsRegistry.registerViews2(allViewDescriptors);
  }
  getViewType(type) {
    if (type === "webview" /* Webview */) {
      return "webview" /* Webview */;
    }
    if (!type || type === "tree" /* Tree */) {
      return "tree" /* Tree */;
    }
    return void 0;
  }
  getDefaultViewContainer() {
    return this.viewContainersRegistry.get(VIEWLET_ID4);
  }
  removeViews(extensions) {
    const removedExtensions = extensions.reduce((result, e4) => {
      result.add(e4.description.identifier);
      return result;
    }, new ExtensionIdentifierSet());
    for (const viewContainer of this.viewContainersRegistry.all) {
      const removedViews = this.viewsRegistry.getViews(viewContainer).filter((v2) => v2.extensionId && removedExtensions.has(v2.extensionId));
      if (removedViews.length) {
        this.viewsRegistry.deregisterViews(removedViews, viewContainer);
        for (const view of removedViews) {
          const anyView = view;
          if (anyView.treeView) {
            anyView.treeView.dispose();
          }
        }
      }
    }
  }
  convertInitialVisibility(value2) {
    if (Object.values(InitialVisibility).includes(value2)) {
      return value2;
    }
    return void 0;
  }
  isValidViewDescriptors(viewDescriptors, collector) {
    if (!Array.isArray(viewDescriptors)) {
      collector.error(localize(5762, null));
      return false;
    }
    for (const descriptor of viewDescriptors) {
      if (typeof descriptor.id !== "string") {
        collector.error(localize(5766, null, "id"));
        return false;
      }
      if (typeof descriptor.name !== "string") {
        collector.error(localize(5766, null, "name"));
        return false;
      }
      if (descriptor.when && typeof descriptor.when !== "string") {
        collector.error(localize(5761, null, "when"));
        return false;
      }
      if (descriptor.icon && typeof descriptor.icon !== "string") {
        collector.error(localize(5761, null, "icon"));
        return false;
      }
      if (descriptor.contextualTitle && typeof descriptor.contextualTitle !== "string") {
        collector.error(localize(5761, null, "contextualTitle"));
        return false;
      }
      if (descriptor.visibility && !this.convertInitialVisibility(descriptor.visibility)) {
        collector.error(localize(5760, null, "visibility", Object.values(InitialVisibility).join(", ")));
        return false;
      }
    }
    return true;
  }
  getViewContainer(value2) {
    switch (value2) {
      case "explorer":
        return this.viewContainersRegistry.get(VIEWLET_ID4);
      case "debug":
        return this.viewContainersRegistry.get(VIEWLET_ID2);
      case "scm":
        return this.viewContainersRegistry.get(VIEWLET_ID3);
      case "remote":
        return this.viewContainersRegistry.get(VIEWLET_ID5);
      default:
        return this.viewContainersRegistry.get(`workbench.view.extension.${value2}`);
    }
  }
  showCollapsed(container2) {
    switch (container2.id) {
      case VIEWLET_ID4:
      case VIEWLET_ID3:
      case VIEWLET_ID2:
        return true;
    }
    return false;
  }
};

ViewsExtensionHandler = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, ILogService)
], ViewsExtensionHandler);

var ViewContainersDataRenderer = class extends Disposable {
  constructor() {
    super(...arguments);
    this.type = "table";
  }
  shouldRender(manifest) {
    return !!manifest.contributes?.viewsContainers;
  }
  render(manifest) {
    const contrib = manifest.contributes?.viewsContainers || {};
    const viewContainers = Object.keys(contrib).reduce((result, location2) => {
      const viewContainersForLocation = contrib[location2];
      result.push(...viewContainersForLocation.map((viewContainer) => ({ ...viewContainer, location: location2 })));
      return result;
    }, []);
    if (!viewContainers.length) {
      return { data: { headers: [], rows: [] }, dispose: () => {
      } };
    }
    const headers = [
      localize(5768, null),
      localize(5770, null),
      localize(5769, null)
    ];
    const rows = viewContainers.sort((a, b) => a.id.localeCompare(b.id)).map((viewContainer) => {
      return [
        viewContainer.id,
        viewContainer.title,
        viewContainer.location
      ];
    });
    return {
      data: {
        headers,
        rows
      },
      dispose: () => {
      }
    };
  }
};

var ViewsDataRenderer = class extends Disposable {
  constructor() {
    super(...arguments);
    this.type = "table";
  }
  shouldRender(manifest) {
    return !!manifest.contributes?.views;
  }
  render(manifest) {
    const contrib = manifest.contributes?.views || {};
    const views = Object.keys(contrib).reduce((result, location2) => {
      const viewsForLocation = contrib[location2];
      result.push(...viewsForLocation.map((view) => ({ ...view, location: location2 })));
      return result;
    }, []);
    if (!views.length) {
      return { data: { headers: [], rows: [] }, dispose: () => {
      } };
    }
    const headers = [
      localize(5771, null),
      localize(5772, null),
      localize(5769, null)
    ];
    const rows = views.sort((a, b) => a.id.localeCompare(b.id)).map((view) => {
      return [
        view.id,
        view.name,
        view.location
      ];
    });
    return {
      data: {
        headers,
        rows
      },
      dispose: () => {
      }
    };
  }
};

Registry.as(Extensions11.ExtensionFeaturesRegistry).registerExtensionFeature({
  id: "viewsContainers",
  label: localize(5786, null),
  access: {
    canToggle: false
  },
  renderer: new SyncDescriptor(ViewContainersDataRenderer)
});

Registry.as(Extensions11.ExtensionFeaturesRegistry).registerExtensionFeature({
  id: "views",
  label: localize(5776, null),
  access: {
    canToggle: false
  },
  renderer: new SyncDescriptor(ViewsDataRenderer)
});

registerWorkbenchContribution2(ViewsExtensionHandler.ID, ViewsExtensionHandler, WorkbenchPhase.BlockStartup);
export { viewsContainerSchema, viewsContainersContribution, InitialVisibility, viewDescriptor, remoteViewDescriptor, viewsContribution, viewsContainersExtensionPoint, viewsExtensionPoint, CUSTOM_VIEWS_START_ORDER, ViewsExtensionHandler, ViewContainersDataRenderer, ViewsDataRenderer };
