// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/extensions/common/extensions.ts
import { localize2 } from "./module-0001.mjs";
import { createDecorator } from "./module-0077.mjs";
import { Disposable } from "./module-0012.mjs";
import { areSameExtensions } from "./module-0888.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { RawContextKey } from "./module-0089.mjs";
import { MenuId } from "./module-0092.mjs";


// src/vs/workbench/contrib/extensions/common/extensions.ts
var VIEWLET_ID = "workbench.view.extensions";

var EXTENSIONS_CATEGORY = localize2(15599, "Extensions");

var IExtensionsWorkbenchService = createDecorator("extensionsWorkbenchService");

var AutoUpdateConfigurationKey = "extensions.autoUpdate";

var AutoUpdateDelayConfigurationKey = "extensions.autoUpdateDelay";

var AutoCheckUpdatesConfigurationKey = "extensions.autoCheckUpdates";

var AutoRestartConfigurationKey = "extensions.autoRestart";

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
    for (const container2 of this.containers) {
      if (extension && container2.extension) {
        if (areSameExtensions(container2.extension.identifier, extension.identifier)) {
          if (container2.extension.server && extension.server && container2.extension.server !== extension.server) {
            if (container2.updateWhenCounterExtensionChanges) {
              container2.update();
            }
          } else {
            container2.extension = extension;
          }
        }
      } else {
        container2.update();
      }
    }
  }
};

ExtensionContainers = __decorateClass([
  __decorateParam(1, IExtensionsWorkbenchService)
], ExtensionContainers);

var TOGGLE_IGNORE_EXTENSION_ACTION_ID = "workbench.extensions.action.toggleIgnoreExtension";

var SELECT_INSTALL_VSIX_EXTENSION_COMMAND_ID = "workbench.extensions.action.installVSIX";

var LIST_WORKSPACE_UNSUPPORTED_EXTENSIONS_COMMAND_ID = "workbench.extensions.action.listWorkspaceUnsupportedExtensions";

var DefaultViewsContext = new RawContextKey("defaultExtensionViews", true);

var HasOutdatedExtensionsContext = new RawContextKey("hasOutdatedExtensions", false);

var CONTEXT_HAS_GALLERY = new RawContextKey("hasGallery", false);

var CONTEXT_EXTENSIONS_GALLERY_STATUS = new RawContextKey("extensionsGalleryStatus", "unavailable" /* Unavailable */);

var ExtensionResultsListFocused = new RawContextKey("extensionResultListFocused ", true);

var SearchMcpServersContext = new RawContextKey("searchMcpServers", false);

var SearchAgentPluginsContext = new RawContextKey("searchAgentPlugins", false);

var THEME_ACTIONS_GROUP = "_theme_";

var INSTALL_ACTIONS_GROUP = "0_install";

var UPDATE_ACTIONS_GROUP = "0_update";

var extensionsSearchActionsMenu = new MenuId("extensionsSearchActionsMenu");

var extensionsFilterSubMenu = new MenuId("extensionsFilterSubMenu");
export { VIEWLET_ID, EXTENSIONS_CATEGORY, IExtensionsWorkbenchService, AutoUpdateConfigurationKey, AutoUpdateDelayConfigurationKey, AutoCheckUpdatesConfigurationKey, AutoRestartConfigurationKey, ExtensionContainers, TOGGLE_IGNORE_EXTENSION_ACTION_ID, SELECT_INSTALL_VSIX_EXTENSION_COMMAND_ID, LIST_WORKSPACE_UNSUPPORTED_EXTENSIONS_COMMAND_ID, DefaultViewsContext, HasOutdatedExtensionsContext, CONTEXT_HAS_GALLERY, CONTEXT_EXTENSIONS_GALLERY_STATUS, ExtensionResultsListFocused, SearchMcpServersContext, SearchAgentPluginsContext, THEME_ACTIONS_GROUP, INSTALL_ACTIONS_GROUP, UPDATE_ACTIONS_GROUP, extensionsSearchActionsMenu, extensionsFilterSubMenu };
