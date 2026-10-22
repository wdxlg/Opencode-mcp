// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/pluginUrlHandler.ts
import { Disposable } from "./module-0012.mjs";
import { parseMarketplaceReference, parseMarketplaceReferences, readConfiguredMarketplaces } from "./module-1025.mjs";
import { mainWindow } from "./module-0002.mjs";
import { localize } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { AgentPluginEditorInput } from "./module-2749.mjs";
import { decodeBase64 } from "./module-0038.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IURLService } from "./module-1286.mjs";
import { IPluginInstallService } from "./module-2570.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IExtensionsWorkbenchService } from "./module-1022.mjs";
import { IHostService } from "./module-1117.mjs";
import { ILogService } from "./module-0095.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/workbench/contrib/chat/browser/pluginUrlHandler.ts
var PluginUrlHandler = class extends Disposable {
  constructor(urlService, _pluginInstallService, _dialogService, _configurationService, _extensionsWorkbenchService, _hostService, _logService, _notificationService, _editorService, _instantiationService) {
    super();
    this._pluginInstallService = _pluginInstallService;
    this._dialogService = _dialogService;
    this._configurationService = _configurationService;
    this._extensionsWorkbenchService = _extensionsWorkbenchService;
    this._hostService = _hostService;
    this._logService = _logService;
    this._notificationService = _notificationService;
    this._editorService = _editorService;
    this._instantiationService = _instantiationService;
    this._register(urlService.registerHandler(this));
  }
  static {
    this.ID = "workbench.contrib.pluginUrlHandler";
  }
  async handleURL(uri5) {
    if (uri5.authority !== "chat-plugin") {
      return false;
    }
    switch (uri5.path) {
      case "/install":
        return this._handleInstall(uri5);
      case "/add-marketplace":
        return this._handleAddMarketplace(uri5);
      default:
        return false;
    }
  }
  // --- install a plugin from source ---
  async _handleInstall(uri5) {
    const source = this._decodeQueryParam(uri5, "source");
    if (!source) {
      this._logService.warn('[PluginUrlHandler] Missing or invalid "source" query parameter');
      return true;
    }
    const ref = parseMarketplaceReference(source);
    if (!ref) {
      this._logService.warn(`[PluginUrlHandler] Invalid plugin source: ${source}`);
      return true;
    }
    if (ref.kind === "localFileUri" /* LocalFileUri */) {
      this._logService.warn("[PluginUrlHandler] Local file URIs are not supported for install");
      return true;
    }
    await this._hostService.focus(mainWindow);
    const pluginName = this._decodeStringParam(uri5, "plugin");
    const { confirmed } = await this._dialogService.confirm({
      type: "question",
      message: pluginName ? localize(11399, null, pluginName, ref.displayLabel) : localize(11397, null, ref.displayLabel),
      detail: localize(11398, null, ref.rawValue),
      primaryButton: localize(11400, null),
      custom: { icon: Codicon.shield }
    });
    if (!confirmed) {
      return true;
    }
    if (pluginName) {
      return this._handleInstallTargetedPlugin(source, ref.displayLabel, pluginName);
    }
    const result = await this._pluginInstallService.installPluginFromSource(source);
    if (!result.success && result.message) {
      this._notificationService.notify({ severity: Severity2.Error, message: result.message });
    }
    this._extensionsWorkbenchService.openSearch(`@agentPlugins ${ref.displayLabel}`);
    return true;
  }
  /**
   * Handles the case where a specific plugin is targeted within a
   * marketplace. Delegates trust and discovery to the install service,
   * then opens the plugin details in a modal editor.
   */
  async _handleInstallTargetedPlugin(source, displayLabel, pluginName) {
    const result = await this._pluginInstallService.installPluginFromSource(source, { plugin: pluginName });
    if (!result.success) {
      if (result.message) {
        this._logService.warn(`[PluginUrlHandler] ${result.message}`);
      }
      this._extensionsWorkbenchService.openSearch(`@agentPlugins ${displayLabel}`);
      return true;
    }
    if (!result.matchedPlugin) {
      this._extensionsWorkbenchService.openSearch(`@agentPlugins ${displayLabel}`);
      return true;
    }
    const plugin = result.matchedPlugin;
    const item = {
      kind: "marketplace" /* Marketplace */,
      name: plugin.name,
      description: plugin.description,
      version: plugin.version,
      source: plugin.source,
      sourceDescriptor: plugin.sourceDescriptor,
      marketplace: plugin.marketplace,
      marketplaceReference: plugin.marketplaceReference,
      marketplaceType: plugin.marketplaceType,
      readmeUri: plugin.readmeUri
    };
    const input = this._instantiationService.createInstance(AgentPluginEditorInput, item);
    await this._editorService.openEditor(input);
    return true;
  }
  // --- add a marketplace ---
  async _handleAddMarketplace(uri5) {
    const refValue = this._decodeQueryParam(uri5, "ref");
    if (!refValue) {
      this._logService.warn('[PluginUrlHandler] Missing or invalid "ref" query parameter');
      return true;
    }
    const ref = parseMarketplaceReference(refValue);
    if (!ref) {
      this._logService.warn(`[PluginUrlHandler] Invalid marketplace reference: ${refValue}`);
      return true;
    }
    await this._hostService.focus(mainWindow);
    const { confirmed } = await this._dialogService.confirm({
      type: "question",
      message: localize(11395, null, ref.displayLabel),
      detail: localize(11396, null, ref.rawValue),
      primaryButton: localize(11394, null),
      custom: { icon: Codicon.shield }
    });
    if (!confirmed) {
      return true;
    }
    const { userValues, effectiveValues } = readConfiguredMarketplaces(this._configurationService);
    const existingRefs = parseMarketplaceReferences(effectiveValues);
    if (!existingRefs.some((e) => e.canonicalId === ref.canonicalId)) {
      await this._configurationService.updateValue(
        "chat.plugins.marketplaces" /* PluginMarketplaces */,
        [...userValues, refValue],
        2 /* USER */
      );
    }
    this._extensionsWorkbenchService.openSearch(`@agentPlugins ${ref.displayLabel}`);
    return true;
  }
  // --- helpers ---
  /**
   * Reads a query parameter and attempts to parse it as a marketplace
   * reference. Tries base64-decoding first, then falls back to the raw
   * value so that plain-text `owner/repo` values also work in URLs.
   */
  _decodeQueryParam(uri5, key3) {
    const params = new URLSearchParams(uri5.query);
    const raw = params.get(key3);
    if (!raw) {
      return void 0;
    }
    const decoded = this._tryBase64Decode(raw);
    if (decoded && parseMarketplaceReference(decoded)) {
      return decoded;
    }
    return parseMarketplaceReference(raw) ? raw : void 0;
  }
  /**
   * Reads a query parameter and decodes it. Tries base64-decoding first,
   * then falls back to the raw value.
   */
  _decodeStringParam(uri5, key3) {
    const params = new URLSearchParams(uri5.query);
    return params.get(key3) ?? void 0;
  }
  _tryBase64Decode(raw) {
    try {
      const decoded = decodeBase64(raw).toString();
      return decoded || void 0;
    } catch {
      return void 0;
    }
  }
};

PluginUrlHandler = __decorateClass([
  __decorateParam(0, IURLService),
  __decorateParam(1, IPluginInstallService),
  __decorateParam(2, IDialogService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IExtensionsWorkbenchService),
  __decorateParam(5, IHostService),
  __decorateParam(6, ILogService),
  __decorateParam(7, INotificationService),
  __decorateParam(8, IEditorService),
  __decorateParam(9, IInstantiationService)
], PluginUrlHandler);
export { PluginUrlHandler };
