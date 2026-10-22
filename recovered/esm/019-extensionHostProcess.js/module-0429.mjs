// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/contrib/extensions/common/extensions.ts
import { localize2 } from "./module-0013.mjs";
import { createDecorator2 } from "./module-0048.mjs";
import { Disposable } from "./module-0011.mjs";
import { areSameExtensions } from "./module-0171.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { RawContextKey } from "./module-0049.mjs";
import { MenuId } from "./module-0427.mjs";


// src/vs/workbench/contrib/extensions/common/extensions.ts
var EXTENSIONS_CATEGORY = localize2(15599, "Extensions");

var IExtensionsWorkbenchService = createDecorator2("extensionsWorkbenchService");

var ExtensionContainers = class extends Disposable {
  constructor(containers, extensionsWorkbenchService) {
    super();
    this.containers = containers;
    this._register(extensionsWorkbenchService.onChange(this.update, this));
  }
  set extension(extension) {
    this.containers.forEach((c) => c.extension = extension);
  }
  update(extension) {
    for (const container of this.containers) {
      if (extension && container.extension) {
        if (areSameExtensions(container.extension.identifier, extension.identifier)) {
          if (container.extension.server && extension.server && container.extension.server !== extension.server) {
            if (container.updateWhenCounterExtensionChanges) {
              container.update();
            }
          } else {
            container.extension = extension;
          }
        }
      } else {
        container.update();
      }
    }
  }
};

ExtensionContainers = __decorateClass([
  __decorateParam(1, IExtensionsWorkbenchService)
], ExtensionContainers);

var DefaultViewsContext = new RawContextKey("defaultExtensionViews", true);

var HasOutdatedExtensionsContext = new RawContextKey("hasOutdatedExtensions", false);

var CONTEXT_HAS_GALLERY = new RawContextKey("hasGallery", false);

var CONTEXT_EXTENSIONS_GALLERY_STATUS = new RawContextKey("extensionsGalleryStatus", "unavailable" /* Unavailable */);

var ExtensionResultsListFocused = new RawContextKey("extensionResultListFocused ", true);

var SearchMcpServersContext = new RawContextKey("searchMcpServers", false);

var SearchAgentPluginsContext = new RawContextKey("searchAgentPlugins", false);

var extensionsSearchActionsMenu = new MenuId("extensionsSearchActionsMenu");

var extensionsFilterSubMenu = new MenuId("extensionsFilterSubMenu");
export { EXTENSIONS_CATEGORY, IExtensionsWorkbenchService, ExtensionContainers, DefaultViewsContext, HasOutdatedExtensionsContext, CONTEXT_HAS_GALLERY, CONTEXT_EXTENSIONS_GALLERY_STATUS, ExtensionResultsListFocused, SearchMcpServersContext, SearchAgentPluginsContext, extensionsSearchActionsMenu, extensionsFilterSubMenu };
