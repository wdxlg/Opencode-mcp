// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/extensions/common/extensionManifestPropertiesService.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable } from "./module-0012.mjs";
import { ALL_EXTENSION_KINDS, ExtensionIdentifierMap } from "./module-0688.mjs";
import { WORKSPACE_TRUST_EXTENSION_SUPPORT } from "./module-1048.mjs";
import { isWeb } from "./module-0014.mjs";
import { isBoolean } from "./module-0010.mjs";
import { isNonEmptyArray } from "./module-0007.mjs";
import { getGalleryExtensionId } from "./module-0888.mjs";
import { ExtensionsRegistry } from "./module-0878.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IProductService } from "./module-0875.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IWorkspaceTrustEnablementService } from "./module-0854.mjs";
import { ILogService } from "./module-0095.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/services/extensions/common/extensionManifestPropertiesService.ts
var IExtensionManifestPropertiesService = createDecorator("extensionManifestPropertiesService");

var EXTENSIONS_SUPPORT_AGENTS_WINDOW = "extensions.supportAgentsWindow";

var SESSIONS_WINDOW_ALLOWED_CONTRIBUTION_POINTS = /* @__PURE__ */ new Set([
  "themes",
  "iconThemes",
  "productIconThemes",
  "colors",
  "keybindings",
  "jsonValidation",
  "jsonValidationRegistry",
  "localizations",
  "grammars",
  "languages"
]);

var ExtensionManifestPropertiesService = class extends Disposable {
  constructor(productService, configurationService, workspaceTrustEnablementService, logService) {
    super();
    this.productService = productService;
    this.configurationService = configurationService;
    this.workspaceTrustEnablementService = workspaceTrustEnablementService;
    this.logService = logService;
    this._extensionPointExtensionKindsMap = null;
    this._productExtensionKindsMap = null;
    this._configuredExtensionKindsMap = null;
    this._productVirtualWorkspaceSupportMap = null;
    this._configuredVirtualWorkspaceSupportMap = null;
    this._configuredSessionsWindowSupportMap = null;
    this._configuredExtensionWorkspaceTrustRequestMap = new ExtensionIdentifierMap();
    const configuredExtensionWorkspaceTrustRequests = configurationService.inspect(WORKSPACE_TRUST_EXTENSION_SUPPORT).userValue || {};
    for (const id2 of Object.keys(configuredExtensionWorkspaceTrustRequests)) {
      this._configuredExtensionWorkspaceTrustRequestMap.set(id2, configuredExtensionWorkspaceTrustRequests[id2]);
    }
    this._productExtensionWorkspaceTrustRequestMap = /* @__PURE__ */ new Map();
    if (productService.extensionUntrustedWorkspaceSupport) {
      for (const id2 of Object.keys(productService.extensionUntrustedWorkspaceSupport)) {
        this._productExtensionWorkspaceTrustRequestMap.set(id2, productService.extensionUntrustedWorkspaceSupport[id2]);
      }
    }
  }
  canExecuteOnSessionsWindow(manifest) {
    const configuredSessionsWindowSupport = this.getConfiguredSessionsWindowSupport(manifest);
    if (configuredSessionsWindowSupport !== void 0) {
      return configuredSessionsWindowSupport;
    }
    if (manifest.main || manifest.browser) {
      return false;
    }
    const contributionPoints = Object.keys(manifest.contributes || {});
    return contributionPoints.every((point) => SESSIONS_WINDOW_ALLOWED_CONTRIBUTION_POINTS.has(point));
  }
  prefersExecuteOnUI(manifest) {
    const extensionKind = this.getExtensionKind(manifest);
    return extensionKind.length > 0 && extensionKind[0] === "ui";
  }
  prefersExecuteOnWorkspace(manifest) {
    const extensionKind = this.getExtensionKind(manifest);
    return extensionKind.length > 0 && extensionKind[0] === "workspace";
  }
  prefersExecuteOnWeb(manifest) {
    const extensionKind = this.getExtensionKind(manifest);
    return extensionKind.length > 0 && extensionKind[0] === "web";
  }
  canExecuteOnUI(manifest) {
    const extensionKind = this.getExtensionKind(manifest);
    return extensionKind.some((kind) => kind === "ui");
  }
  canExecuteOnWorkspace(manifest) {
    const extensionKind = this.getExtensionKind(manifest);
    return extensionKind.some((kind) => kind === "workspace");
  }
  canExecuteOnWeb(manifest) {
    const extensionKind = this.getExtensionKind(manifest);
    return extensionKind.some((kind) => kind === "web");
  }
  getExtensionKind(manifest) {
    const deducedExtensionKind = this.deduceExtensionKind(manifest);
    const configuredExtensionKind = this.getConfiguredExtensionKind(manifest);
    if (configuredExtensionKind && configuredExtensionKind.length > 0) {
      const result = [];
      for (const extensionKind of configuredExtensionKind) {
        if (extensionKind !== "-web") {
          result.push(extensionKind);
        }
      }
      if (configuredExtensionKind.includes("-web") && !result.length) {
        result.push("ui");
        result.push("workspace");
      }
      if (isWeb && !configuredExtensionKind.includes("-web") && !configuredExtensionKind.includes("web") && deducedExtensionKind.includes("web")) {
        result.push("web");
      }
      return result;
    }
    return deducedExtensionKind;
  }
  getUserConfiguredExtensionKind(extensionIdentifier) {
    if (this._configuredExtensionKindsMap === null) {
      const configuredExtensionKindsMap = new ExtensionIdentifierMap();
      const configuredExtensionKinds = this.configurationService.getValue("remote.extensionKind") || {};
      for (const id2 of Object.keys(configuredExtensionKinds)) {
        configuredExtensionKindsMap.set(id2, configuredExtensionKinds[id2]);
      }
      this._configuredExtensionKindsMap = configuredExtensionKindsMap;
    }
    const userConfiguredExtensionKind = this._configuredExtensionKindsMap.get(extensionIdentifier.id);
    return userConfiguredExtensionKind ? this.toArray(userConfiguredExtensionKind) : void 0;
  }
  getExtensionUntrustedWorkspaceSupportType(manifest) {
    if (!this.workspaceTrustEnablementService.isWorkspaceTrustEnabled() || !manifest.main) {
      return true;
    }
    const configuredWorkspaceTrustRequest = this.getConfiguredExtensionWorkspaceTrustRequest(manifest);
    const productWorkspaceTrustRequest = this.getProductExtensionWorkspaceTrustRequest(manifest);
    if (configuredWorkspaceTrustRequest !== void 0) {
      return configuredWorkspaceTrustRequest;
    }
    if (productWorkspaceTrustRequest?.override !== void 0) {
      return productWorkspaceTrustRequest.override;
    }
    if (manifest.capabilities?.untrustedWorkspaces?.supported !== void 0) {
      return manifest.capabilities.untrustedWorkspaces.supported;
    }
    if (productWorkspaceTrustRequest?.default !== void 0) {
      return productWorkspaceTrustRequest.default;
    }
    return false;
  }
  getExtensionVirtualWorkspaceSupportType(manifest) {
    const userConfiguredVirtualWorkspaceSupport = this.getConfiguredVirtualWorkspaceSupport(manifest);
    if (userConfiguredVirtualWorkspaceSupport !== void 0) {
      return userConfiguredVirtualWorkspaceSupport;
    }
    const productConfiguredWorkspaceSchemes = this.getProductVirtualWorkspaceSupport(manifest);
    if (productConfiguredWorkspaceSchemes?.override !== void 0) {
      return productConfiguredWorkspaceSchemes.override;
    }
    const virtualWorkspaces = manifest.capabilities?.virtualWorkspaces;
    if (isBoolean(virtualWorkspaces)) {
      return virtualWorkspaces;
    } else if (virtualWorkspaces) {
      const supported3 = virtualWorkspaces.supported;
      if (isBoolean(supported3) || supported3 === "limited") {
        return supported3;
      }
    }
    if (productConfiguredWorkspaceSchemes?.default !== void 0) {
      return productConfiguredWorkspaceSchemes.default;
    }
    return true;
  }
  deduceExtensionKind(manifest) {
    if (manifest.main) {
      if (manifest.browser) {
        return isWeb ? ["workspace", "web"] : ["workspace"];
      }
      return ["workspace"];
    }
    if (manifest.browser) {
      return ["web"];
    }
    let result = [...ALL_EXTENSION_KINDS];
    if (isNonEmptyArray(manifest.extensionPack) || isNonEmptyArray(manifest.extensionDependencies)) {
      result = isWeb ? ["workspace", "web"] : ["workspace"];
    }
    if (manifest.contributes) {
      for (const contribution of Object.keys(manifest.contributes)) {
        const supportedExtensionKinds = this.getSupportedExtensionKindsForExtensionPoint(contribution);
        if (supportedExtensionKinds.length) {
          result = result.filter((extensionKind) => supportedExtensionKinds.includes(extensionKind));
        }
      }
    }
    if (!result.length) {
      this.logService.warn("Cannot deduce extensionKind for extension", getGalleryExtensionId(manifest.publisher, manifest.name));
    }
    return result;
  }
  getSupportedExtensionKindsForExtensionPoint(extensionPoint5) {
    if (this._extensionPointExtensionKindsMap === null) {
      const extensionPointExtensionKindsMap = /* @__PURE__ */ new Map();
      ExtensionsRegistry.getExtensionPoints().forEach((e4) => extensionPointExtensionKindsMap.set(
        e4.name,
        e4.defaultExtensionKind || []
        /* supports all */
      ));
      this._extensionPointExtensionKindsMap = extensionPointExtensionKindsMap;
    }
    let extensionPointExtensionKind = this._extensionPointExtensionKindsMap.get(extensionPoint5);
    if (extensionPointExtensionKind) {
      return extensionPointExtensionKind;
    }
    extensionPointExtensionKind = this.productService.extensionPointExtensionKind ? this.productService.extensionPointExtensionKind[extensionPoint5] : void 0;
    if (extensionPointExtensionKind) {
      return extensionPointExtensionKind;
    }
    return isWeb ? ["workspace", "web"] : ["workspace"];
  }
  getConfiguredExtensionKind(manifest) {
    const extensionIdentifier = { id: getGalleryExtensionId(manifest.publisher, manifest.name) };
    let result = this.getUserConfiguredExtensionKind(extensionIdentifier);
    if (typeof result !== "undefined") {
      return this.toArray(result);
    }
    result = this.getProductExtensionKind(manifest);
    if (typeof result !== "undefined") {
      return result;
    }
    result = manifest.extensionKind;
    if (typeof result !== "undefined") {
      result = this.toArray(result);
      return result.filter((r2) => ["ui", "workspace"].includes(r2));
    }
    return null;
  }
  getProductExtensionKind(manifest) {
    if (this._productExtensionKindsMap === null) {
      const productExtensionKindsMap = new ExtensionIdentifierMap();
      if (this.productService.extensionKind) {
        for (const id2 of Object.keys(this.productService.extensionKind)) {
          productExtensionKindsMap.set(id2, this.productService.extensionKind[id2]);
        }
      }
      this._productExtensionKindsMap = productExtensionKindsMap;
    }
    const extensionId = getGalleryExtensionId(manifest.publisher, manifest.name);
    return this._productExtensionKindsMap.get(extensionId);
  }
  getProductVirtualWorkspaceSupport(manifest) {
    if (this._productVirtualWorkspaceSupportMap === null) {
      const productWorkspaceSchemesMap = new ExtensionIdentifierMap();
      if (this.productService.extensionVirtualWorkspacesSupport) {
        for (const id2 of Object.keys(this.productService.extensionVirtualWorkspacesSupport)) {
          productWorkspaceSchemesMap.set(id2, this.productService.extensionVirtualWorkspacesSupport[id2]);
        }
      }
      this._productVirtualWorkspaceSupportMap = productWorkspaceSchemesMap;
    }
    const extensionId = getGalleryExtensionId(manifest.publisher, manifest.name);
    return this._productVirtualWorkspaceSupportMap.get(extensionId);
  }
  getConfiguredVirtualWorkspaceSupport(manifest) {
    if (this._configuredVirtualWorkspaceSupportMap === null) {
      const configuredWorkspaceSchemesMap = new ExtensionIdentifierMap();
      const configuredWorkspaceSchemes = this.configurationService.getValue("extensions.supportVirtualWorkspaces") || {};
      for (const id2 of Object.keys(configuredWorkspaceSchemes)) {
        if (configuredWorkspaceSchemes[id2] !== void 0) {
          configuredWorkspaceSchemesMap.set(id2, configuredWorkspaceSchemes[id2]);
        }
      }
      this._configuredVirtualWorkspaceSupportMap = configuredWorkspaceSchemesMap;
    }
    const extensionId = getGalleryExtensionId(manifest.publisher, manifest.name);
    return this._configuredVirtualWorkspaceSupportMap.get(extensionId);
  }
  getConfiguredSessionsWindowSupport(manifest) {
    if (this._configuredSessionsWindowSupportMap === null) {
      const configuredSessionsWindowSupportMap = new ExtensionIdentifierMap();
      const configuredSessionsWindowSupport = this.configurationService.getValue(EXTENSIONS_SUPPORT_AGENTS_WINDOW) || {};
      for (const id2 of Object.keys(configuredSessionsWindowSupport)) {
        if (configuredSessionsWindowSupport[id2] !== void 0) {
          configuredSessionsWindowSupportMap.set(id2, configuredSessionsWindowSupport[id2]);
        }
      }
      this._configuredSessionsWindowSupportMap = configuredSessionsWindowSupportMap;
    }
    const extensionId = getGalleryExtensionId(manifest.publisher, manifest.name);
    return this._configuredSessionsWindowSupportMap.get(extensionId);
  }
  getConfiguredExtensionWorkspaceTrustRequest(manifest) {
    const extensionId = getGalleryExtensionId(manifest.publisher, manifest.name);
    const extensionWorkspaceTrustRequest = this._configuredExtensionWorkspaceTrustRequestMap.get(extensionId);
    if (extensionWorkspaceTrustRequest && (extensionWorkspaceTrustRequest.version === void 0 || extensionWorkspaceTrustRequest.version === manifest.version)) {
      return extensionWorkspaceTrustRequest.supported;
    }
    return void 0;
  }
  getProductExtensionWorkspaceTrustRequest(manifest) {
    const extensionId = getGalleryExtensionId(manifest.publisher, manifest.name);
    return this._productExtensionWorkspaceTrustRequestMap.get(extensionId);
  }
  toArray(extensionKind) {
    if (Array.isArray(extensionKind)) {
      return extensionKind;
    }
    return extensionKind === "ui" ? ["ui", "workspace"] : [extensionKind];
  }
};

ExtensionManifestPropertiesService = __decorateClass([
  __decorateParam(0, IProductService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IWorkspaceTrustEnablementService),
  __decorateParam(3, ILogService)
], ExtensionManifestPropertiesService);

registerSingleton(IExtensionManifestPropertiesService, ExtensionManifestPropertiesService, 1 /* Delayed */);
export { IExtensionManifestPropertiesService, EXTENSIONS_SUPPORT_AGENTS_WINDOW, SESSIONS_WINDOW_ALLOWED_CONTRIBUTION_POINTS, ExtensionManifestPropertiesService };
