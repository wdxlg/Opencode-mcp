// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadCLICommands.ts
import { CommandsRegistry, ICommandService } from "./module-0087.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { isString } from "./module-0010.mjs";
import { URI } from "./module-0032.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IExtensionManagementServerService } from "./module-1047.mjs";
import { AbstractMessageLogger } from "./module-0095.mjs";
import { ServiceCollection } from "./module-0440.mjs";
import { IExtensionGalleryService, IExtensionManagementService } from "./module-0874.mjs";
import { ExtensionManagementCLI } from "./module-1046.mjs";
import { Schemas } from "./module-0033.mjs";
import { isWeb } from "./module-0014.mjs";
import { localize } from "./module-0001.mjs";
import { getExtensionId } from "./module-0888.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { IExtensionManifestPropertiesService } from "./module-1049.mjs";
import { IProductService } from "./module-0875.mjs";


// src/vs/workbench/api/browser/mainThreadCLICommands.ts
CommandsRegistry.registerCommand("_remoteCLI.openExternal", function(accessor, uri4) {
  const openerService = accessor.get(IOpenerService);
  return openerService.open(isString(uri4) ? uri4 : URI.revive(uri4), { openExternal: true, allowTunneling: true });
});

CommandsRegistry.registerCommand("_remoteCLI.windowOpen", function(accessor, toOpen, options3) {
  const commandService = accessor.get(ICommandService);
  if (!toOpen.length) {
    return commandService.executeCommand("_files.newWindow", options3);
  }
  return commandService.executeCommand("_files.windowOpen", toOpen, options3);
});

CommandsRegistry.registerCommand("_remoteCLI.getSystemStatus", function(accessor) {
  const commandService = accessor.get(ICommandService);
  return commandService.executeCommand("_issues.getSystemStatus");
});

CommandsRegistry.registerCommand("_remoteCLI.manageExtensions", async function(accessor, args2) {
  const instantiationService = accessor.get(IInstantiationService);
  const extensionManagementServerService = accessor.get(IExtensionManagementServerService);
  const remoteExtensionManagementService = extensionManagementServerService.remoteExtensionManagementServer?.extensionManagementService;
  if (!remoteExtensionManagementService) {
    return;
  }
  const lines = [];
  const logger = new class extends AbstractMessageLogger {
    log(level, message) {
      lines.push(message);
    }
  }();
  const childInstantiationService = instantiationService.createChild(new ServiceCollection([IExtensionManagementService, remoteExtensionManagementService]));
  try {
    const cliService = childInstantiationService.createInstance(RemoteExtensionManagementCLI, logger);
    if (args2.list) {
      await cliService.listExtensions(!!args2.list.showVersions, args2.list.category, void 0);
    } else {
      const revive2 = (inputs) => inputs.map((input) => isString(input) ? input : URI.revive(input));
      if (Array.isArray(args2.install) && args2.install.length) {
        try {
          await cliService.installExtensions(revive2(args2.install), [], { isMachineScoped: true }, !!args2.force);
        } catch (e4) {
          lines.push(e4.message);
        }
      }
      if (Array.isArray(args2.uninstall) && args2.uninstall.length) {
        try {
          await cliService.uninstallExtensions(revive2(args2.uninstall), !!args2.force, void 0);
        } catch (e4) {
          lines.push(e4.message);
        }
      }
    }
    return lines.join("\n");
  } finally {
    childInstantiationService.dispose();
  }
});

var RemoteExtensionManagementCLI = class extends ExtensionManagementCLI {
  constructor(logger, extensionManagementService, extensionGalleryService, labelService, envService, _extensionManifestPropertiesService, productService) {
    super([], logger, extensionManagementService, extensionGalleryService, productService);
    this._extensionManifestPropertiesService = _extensionManifestPropertiesService;
    const remoteAuthority = envService.remoteAuthority;
    this._location = remoteAuthority ? labelService.getHostLabel(Schemas.vscodeRemote, remoteAuthority) : void 0;
  }
  get location() {
    return this._location;
  }
  validateExtensionKind(manifest) {
    if (!this._extensionManifestPropertiesService.canExecuteOnWorkspace(manifest) && !(isWeb && this._extensionManifestPropertiesService.canExecuteOnWeb(manifest))) {
      this.logger.info(localize(5672, null, getExtensionId(manifest.publisher, manifest.name)));
      return false;
    }
    return true;
  }
};

RemoteExtensionManagementCLI = __decorateClass([
  __decorateParam(1, IExtensionManagementService),
  __decorateParam(2, IExtensionGalleryService),
  __decorateParam(3, ILabelService),
  __decorateParam(4, IWorkbenchEnvironmentService),
  __decorateParam(5, IExtensionManifestPropertiesService),
  __decorateParam(6, IProductService)
], RemoteExtensionManagementCLI);
export { RemoteExtensionManagementCLI };
