// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/extensions/browser/extensionsViews.ts
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { ViewPane } from "./module-1335.mjs";
import { ActionRunner } from "./module-0082.mjs";
import { CountBadge } from "./module-0638.mjs";
import { $, append } from "./module-0075.mjs";
import { defaultCountBadgeStyles } from "./module-0513.mjs";
import { ExtensionsList } from "./module-2283.mjs";
import { ExtensionResultsListFocused, IExtensionsWorkbenchService } from "./module-1022.mjs";
import { coalesce, distinct, range } from "./module-0007.mjs";
import { Query3 } from "./module-2917.mjs";
import { ThrottledDelayer, createCancelablePromise } from "./module-0036.mjs";
import { DelayedPagedModel, PagedModel } from "./module-2282.mjs";
import { CancellationError, getErrorMessage, isCancellationError } from "./module-0004.mjs";
import { areSameExtensions, getExtensionDependencies } from "./module-0886.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { ExtensionIdentifier, ExtensionIdentifierMap, isLanguagePackExtension } from "./module-0688.mjs";
import { IExtensionService, toExtension } from "./module-0887.mjs";
import { isVirtualWorkspace } from "./module-0936.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions11, IExtensionFeaturesManagementService } from "./module-0877.mjs";
import { ExtensionGalleryError } from "./module-0872.mjs";
import { localize } from "./module-0001.mjs";
import { CancellationToken, CancellationTokenSource } from "./module-0025.mjs";
import { isString } from "./module-0010.mjs";
import { SeverityIcon } from "./module-0699.mjs";
import { alert } from "./module-0076.mjs";
import { isOfflineError } from "./module-1690.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IExtensionRecommendationsService } from "./module-1702.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IExtensionManagementServerService, IWorkbenchExtensionEnablementService, IWorkbenchExtensionManagementService } from "./module-1046.mjs";
import { IExtensionManifestPropertiesService } from "./module-1048.mjs";
import { IProductService } from "./module-0873.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IViewDescriptorService } from "./module-1093.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IWorkspaceTrustManagementService } from "./module-0854.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/workbench/contrib/extensions/browser/extensionsViews.ts
var NONE_CATEGORY = "none";

var ExtensionsViewState = class extends Disposable {
  constructor() {
    super(...arguments);
    this._onFocus = this._register(new Emitter());
    this.onFocus = this._onFocus.event;
    this._onBlur = this._register(new Emitter());
    this.onBlur = this._onBlur.event;
    this.currentlyFocusedItems = [];
    this.filters = {};
  }
  onFocusChange(extensions) {
    this.currentlyFocusedItems.forEach((extension) => this._onBlur.fire(extension));
    this.currentlyFocusedItems = extensions;
    this.currentlyFocusedItems.forEach((extension) => this._onFocus.fire(extension));
  }
};

function isLocalSortBy(value2) {
  switch (value2) {
    case "UpdateDate" /* UpdateDate */:
      return true;
  }
}

var AbstractExtensionsListView = class extends ViewPane {
};

var ExtensionsListView = class extends AbstractExtensionsListView {
  constructor(options3, viewletViewOptions, notificationService, keybindingService, contextMenuService, instantiationService, themeService, extensionService, extensionsWorkbenchService, extensionRecommendationsService, telemetryService, hoverService, configurationService, contextService, extensionManagementServerService, extensionManifestPropertiesService, extensionManagementService, workspaceService, productService, contextKeyService, viewDescriptorService, openerService, storageService, workspaceTrustManagementService, extensionEnablementService, extensionFeaturesManagementService, uriIdentityService, logService) {
    super({
      ...viewletViewOptions,
      showActions: 2 /* Always */,
      maximumBodySize: options3.flexibleHeight ? storageService.getNumber(`${viewletViewOptions.id}.size`, 0 /* PROFILE */, 0) ? void 0 : 0 : void 0
    }, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService);
    this.options = options3;
    this.notificationService = notificationService;
    this.extensionService = extensionService;
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.extensionRecommendationsService = extensionRecommendationsService;
    this.telemetryService = telemetryService;
    this.contextService = contextService;
    this.extensionManagementServerService = extensionManagementServerService;
    this.extensionManifestPropertiesService = extensionManifestPropertiesService;
    this.extensionManagementService = extensionManagementService;
    this.workspaceService = workspaceService;
    this.productService = productService;
    this.storageService = storageService;
    this.workspaceTrustManagementService = workspaceTrustManagementService;
    this.extensionEnablementService = extensionEnablementService;
    this.extensionFeaturesManagementService = extensionFeaturesManagementService;
    this.uriIdentityService = uriIdentityService;
    this.logService = logService;
    this.list = null;
    this.queryRequest = null;
    this.contextMenuActionRunner = this._register(new ActionRunner());
    if (this.options.onDidChangeTitle) {
      this._register(this.options.onDidChangeTitle((title) => this.updateTitle(title)));
    }
    this._register(this.contextMenuActionRunner.onDidRun(({ error }) => error && this.notificationService.error(error)));
    this.registerActions();
  }
  static {
    this.RECENT_UPDATE_DURATION = 7 * 24 * 60 * 60 * 1e3;
  }
  registerActions() {
  }
  renderHeader(container3) {
    container3.classList.add("extension-view-header");
    super.renderHeader(container3);
    if (!this.options.hideBadge) {
      this.badge = this._register(new CountBadge(append(container3, $(".count-badge-wrapper")), {}, defaultCountBadgeStyles));
    }
  }
  renderBody(container3) {
    super.renderBody(container3);
    const messageContainer = append(container3, $(".message-container"));
    const messageSeverityIcon = append(messageContainer, $(""));
    const messageBox = append(messageContainer, $(".message"));
    const extensionsList = append(container3, $(".extensions-list"));
    this.extensionsViewState = this._register(new ExtensionsViewState());
    this.list = this._register(this.instantiationService.createInstance(ExtensionsList, extensionsList, this.id, {}, this.extensionsViewState)).list;
    ExtensionResultsListFocused.bindTo(this.list.contextKeyService);
    this._register(this.list.onDidChangeFocus((e) => this.extensionsViewState?.onFocusChange(coalesce(e.elements)), this));
    this.bodyTemplate = {
      extensionsList,
      messageBox,
      messageContainer,
      messageSeverityIcon
    };
    if (this.queryResult) {
      this.setModel(this.queryResult.model);
    }
  }
  layoutBody(height, width2) {
    super.layoutBody(height, width2);
    if (this.bodyTemplate) {
      this.bodyTemplate.extensionsList.style.height = height + "px";
    }
    this.list?.layout(height, width2);
  }
  async show(query, refresh) {
    if (this.queryRequest) {
      if (!refresh && this.queryRequest.query === query) {
        return this.queryRequest.request;
      }
      this.queryRequest.request.cancel();
      this.queryRequest = null;
    }
    if (this.queryResult) {
      this.queryResult.disposables.dispose();
      this.queryResult = void 0;
      if (this.extensionsViewState) {
        this.extensionsViewState.filters = {};
      }
    }
    const parsedQuery = Query3.parse(query);
    const options3 = {
      sortOrder: 0 /* Default */
    };
    switch (parsedQuery.sortBy) {
      case "installs":
        options3.sortBy = "InstallCount" /* InstallCount */;
        break;
      case "rating":
        options3.sortBy = "WeightedRating" /* WeightedRating */;
        break;
      case "name":
        options3.sortBy = "Title" /* Title */;
        break;
      case "publishedDate":
        options3.sortBy = "PublishedDate" /* PublishedDate */;
        break;
      case "updateDate":
        options3.sortBy = "UpdateDate" /* UpdateDate */;
        break;
    }
    const request2 = createCancelablePromise(async (token) => {
      try {
        this.queryResult = await this.query(parsedQuery, options3, token);
        const model = this.queryResult.model;
        this.setModel(model, this.queryResult.message);
        if (this.queryResult.onDidChangeModel) {
          this.queryResult.disposables.add(this.queryResult.onDidChangeModel((model2) => {
            if (this.queryResult) {
              this.queryResult.model = model2;
              this.updateModel(model2);
            }
          }));
        }
        return model;
      } catch (e) {
        const model = new PagedModel([]);
        if (!isCancellationError(e)) {
          this.logService.error(e);
          this.setModel(model, this.getMessage(e));
        }
        return this.list ? this.list.model : model;
      }
    });
    request2.finally(() => this.queryRequest = null);
    this.queryRequest = { query, request: request2 };
    return request2;
  }
  count() {
    return this.queryResult?.model.length ?? 0;
  }
  showEmptyModel() {
    const emptyModel = new PagedModel([]);
    this.setModel(emptyModel);
    return Promise.resolve(emptyModel);
  }
  async query(query, options3, token) {
    const idRegex2 = /@id:(([a-z0-9A-Z][a-z0-9\-A-Z]*)\.([a-z0-9A-Z][a-z0-9\-A-Z]*))/g;
    const ids = [];
    let idMatch;
    while ((idMatch = idRegex2.exec(query.value)) !== null) {
      const name = idMatch[1];
      ids.push(name);
    }
    if (ids.length) {
      const model = await this.queryByIds(ids, options3, token);
      return { model, disposables: new DisposableStore() };
    }
    if (ExtensionsListView.isLocalExtensionsQuery(query.value, query.sortBy)) {
      return this.queryLocal(query, options3);
    }
    if (ExtensionsListView.isSearchPopularQuery(query.value)) {
      query.value = query.value.replace("@popular", "");
      options3.sortBy = !options3.sortBy ? "InstallCount" /* InstallCount */ : options3.sortBy;
    } else if (ExtensionsListView.isSearchRecentlyPublishedQuery(query.value)) {
      query.value = query.value.replace("@recentlyPublished", "");
      options3.sortBy = !options3.sortBy ? "PublishedDate" /* PublishedDate */ : options3.sortBy;
    }
    const galleryQueryOptions = { ...options3, sortBy: isLocalSortBy(options3.sortBy) ? void 0 : options3.sortBy };
    return this.queryGallery(query, galleryQueryOptions, token);
  }
  async queryByIds(ids, options3, token) {
    const idsSet = ids.reduce((result2, id2) => {
      result2.add(id2.toLowerCase());
      return result2;
    }, /* @__PURE__ */ new Set());
    const result = (await this.extensionsWorkbenchService.queryLocal(this.options.server)).filter((e) => idsSet.has(e.identifier.id.toLowerCase()));
    const galleryIds = result.length ? ids.filter((id2) => result.every((r2) => !areSameExtensions(r2.identifier, { id: id2 }))) : ids;
    if (galleryIds.length) {
      const galleryResult = await this.extensionsWorkbenchService.getExtensions(galleryIds.map((id2) => ({ id: id2 })), { source: "queryById" }, token);
      result.push(...galleryResult);
    }
    return new PagedModel(result);
  }
  async queryLocal(query, options3) {
    const local = await this.extensionsWorkbenchService.queryLocal(this.options.server);
    let { extensions, canIncludeInstalledExtensions, description } = await this.filterLocal(local, this.extensionService.extensions, query, options3);
    const disposables = new DisposableStore();
    const onDidChangeModel = disposables.add(new Emitter());
    if (canIncludeInstalledExtensions) {
      let isDisposed = false;
      disposables.add(toDisposable(() => isDisposed = true));
      disposables.add(Event2.debounce(Event2.any(
        Event2.filter(this.extensionsWorkbenchService.onChange, (e) => e?.state === 1 /* Installed */),
        this.extensionService.onDidChangeExtensions
      ), () => void 0)(async () => {
        const local2 = this.options.server ? this.extensionsWorkbenchService.installed.filter((e) => e.server === this.options.server) : this.extensionsWorkbenchService.local;
        const { extensions: newExtensions } = await this.filterLocal(local2, this.extensionService.extensions, query, options3);
        if (!isDisposed) {
          const mergedExtensions = this.mergeAddedExtensions(extensions, newExtensions);
          if (mergedExtensions) {
            extensions = mergedExtensions;
            onDidChangeModel.fire(new PagedModel(extensions));
          }
        }
      }));
    }
    return {
      model: new PagedModel(extensions),
      message: description ? { text: description, severity: Severity2.Info } : void 0,
      onDidChangeModel: onDidChangeModel.event,
      disposables
    };
  }
  async filterLocal(local, runningExtensions, query, options3) {
    const value2 = query.value;
    let extensions = [];
    let description;
    const includeBuiltin = /@builtin/i.test(value2);
    const canIncludeInstalledExtensions = !includeBuiltin;
    if (/@installed/i.test(value2)) {
      extensions = this.filterInstalledExtensions(local, runningExtensions, query, options3);
    } else if (/@outdated/i.test(value2)) {
      extensions = this.filterOutdatedExtensions(local, query, options3);
    } else if (/@disabled/i.test(value2)) {
      extensions = this.filterDisabledExtensions(local, runningExtensions, query, options3, includeBuiltin);
    } else if (/@enabled/i.test(value2)) {
      extensions = this.filterEnabledExtensions(local, runningExtensions, query, options3, includeBuiltin);
    } else if (/@workspaceUnsupported/i.test(value2)) {
      extensions = this.filterWorkspaceUnsupportedExtensions(local, query, options3);
    } else if (/@deprecated/i.test(query.value)) {
      extensions = await this.filterDeprecatedExtensions(local, query, options3);
    } else if (/@recentlyUpdated/i.test(query.value)) {
      extensions = this.filterRecentlyUpdatedExtensions(local, query, options3);
    } else if (/@restartrequired/i.test(query.value)) {
      extensions = this.filterRestartRequiredExtensions(local, query, options3);
    } else if (/@contribute:/i.test(query.value)) {
      extensions = this.filterExtensionsByFeature(local, query);
    } else if (includeBuiltin) {
      extensions = this.filterBuiltinExtensions(local, query, options3);
    }
    return { extensions, canIncludeInstalledExtensions, description };
  }
  filterBuiltinExtensions(local, query, options3) {
    let { value: value2, includedCategories, excludedCategories } = this.parseCategories(query.value);
    value2 = value2.replaceAll(/@builtin/gi, "").replaceAll(/@sort:(\w+)(-\w*)?/g, "").trim().toLowerCase();
    const result = local.filter((e) => e.isBuiltin && (e.name.toLowerCase().indexOf(value2) > -1 || e.displayName.toLowerCase().indexOf(value2) > -1) && this.filterExtensionByCategory(e, includedCategories, excludedCategories));
    return this.sortExtensions(result, options3);
  }
  filterExtensionByCategory(e, includedCategories, excludedCategories) {
    if (!includedCategories.length && !excludedCategories.length) {
      return true;
    }
    if (e.categories.length) {
      if (excludedCategories.length && e.categories.some((category11) => excludedCategories.includes(category11.toLowerCase()))) {
        return false;
      }
      return e.categories.some((category11) => includedCategories.includes(category11.toLowerCase()));
    } else {
      return includedCategories.includes(NONE_CATEGORY);
    }
  }
  parseCategories(value2) {
    const includedCategories = [];
    const excludedCategories = [];
    value2 = value2.replace(/\bcategory:("([^"]*)"|([^"]\S*))(\s+|\b|$)/g, (_, quotedCategory, category11) => {
      const entry = (category11 || quotedCategory || "").toLowerCase();
      if (entry.startsWith("-")) {
        if (excludedCategories.indexOf(entry) === -1) {
          excludedCategories.push(entry);
        }
      } else {
        if (includedCategories.indexOf(entry) === -1) {
          includedCategories.push(entry);
        }
      }
      return "";
    });
    return { value: value2, includedCategories, excludedCategories };
  }
  filterInstalledExtensions(local, runningExtensions, query, options3) {
    let { value: value2, includedCategories, excludedCategories } = this.parseCategories(query.value);
    value2 = value2.replace(/@installed/g, "").replace(/@sort:(\w+)(-\w*)?/g, "").trim().toLowerCase();
    const matchingText = (e) => (e.name.toLowerCase().indexOf(value2) > -1 || e.displayName.toLowerCase().indexOf(value2) > -1 || e.description.toLowerCase().indexOf(value2) > -1) && this.filterExtensionByCategory(e, includedCategories, excludedCategories);
    let result;
    if (options3.sortBy !== void 0) {
      result = local.filter((e) => !e.isBuiltin && matchingText(e));
      result = this.sortExtensions(result, options3);
    } else {
      result = local.filter((e) => (!e.isBuiltin || e.outdated || e.runtimeState !== void 0) && matchingText(e));
      const runningExtensionsById = runningExtensions.reduce((result2, e) => {
        result2.set(e.identifier.value, e);
        return result2;
      }, new ExtensionIdentifierMap());
      const defaultSort = (e1, e2) => {
        const running1 = runningExtensionsById.get(e1.identifier.id);
        const isE1Running = !!running1 && this.extensionManagementServerService.getExtensionManagementServer(toExtension(running1)) === e1.server;
        const running2 = runningExtensionsById.get(e2.identifier.id);
        const isE2Running = running2 && this.extensionManagementServerService.getExtensionManagementServer(toExtension(running2)) === e2.server;
        if (isE1Running && isE2Running) {
          return e1.displayName.localeCompare(e2.displayName);
        }
        const isE1LanguagePackExtension = e1.local && isLanguagePackExtension(e1.local.manifest);
        const isE2LanguagePackExtension = e2.local && isLanguagePackExtension(e2.local.manifest);
        if (!isE1Running && !isE2Running) {
          if (isE1LanguagePackExtension) {
            return -1;
          }
          if (isE2LanguagePackExtension) {
            return 1;
          }
          return e1.displayName.localeCompare(e2.displayName);
        }
        if (isE1Running && isE2LanguagePackExtension || isE2Running && isE1LanguagePackExtension) {
          return e1.displayName.localeCompare(e2.displayName);
        }
        return isE1Running ? -1 : 1;
      };
      const incompatible = [];
      const deprecated = [];
      const outdated = [];
      const actionRequired = [];
      const noActionRequired = [];
      for (const e of result) {
        if (e.enablementState === 6 /* DisabledByInvalidExtension */) {
          incompatible.push(e);
        } else if (e.deprecationInfo) {
          deprecated.push(e);
        } else if (e.outdated && this.extensionEnablementService.isEnabledEnablementState(e.enablementState)) {
          outdated.push(e);
        } else if (e.runtimeState) {
          actionRequired.push(e);
        } else {
          noActionRequired.push(e);
        }
      }
      result = [
        ...incompatible.sort(defaultSort),
        ...deprecated.sort(defaultSort),
        ...outdated.sort(defaultSort),
        ...actionRequired.sort(defaultSort),
        ...noActionRequired.sort(defaultSort)
      ];
    }
    return result;
  }
  filterOutdatedExtensions(local, query, options3) {
    let { value: value2, includedCategories, excludedCategories } = this.parseCategories(query.value);
    value2 = value2.replace(/@outdated/g, "").replace(/@sort:(\w+)(-\w*)?/g, "").trim().toLowerCase();
    const result = local.sort((e1, e2) => e1.displayName.localeCompare(e2.displayName)).filter((extension) => extension.outdated && (extension.name.toLowerCase().indexOf(value2) > -1 || extension.displayName.toLowerCase().indexOf(value2) > -1) && this.filterExtensionByCategory(extension, includedCategories, excludedCategories));
    return this.sortExtensions(result, options3);
  }
  filterDisabledExtensions(local, runningExtensions, query, options3, includeBuiltin) {
    let { value: value2, includedCategories, excludedCategories } = this.parseCategories(query.value);
    value2 = value2.replaceAll(/@disabled|@builtin/gi, "").replaceAll(/@sort:(\w+)(-\w*)?/g, "").trim().toLowerCase();
    if (includeBuiltin) {
      local = local.filter((e) => e.isBuiltin);
    }
    const result = local.sort((e1, e2) => e1.displayName.localeCompare(e2.displayName)).filter((e) => runningExtensions.every((r2) => !areSameExtensions({ id: r2.identifier.value, uuid: r2.uuid }, e.identifier)) && (e.name.toLowerCase().indexOf(value2) > -1 || e.displayName.toLowerCase().indexOf(value2) > -1) && this.filterExtensionByCategory(e, includedCategories, excludedCategories));
    return this.sortExtensions(result, options3);
  }
  filterEnabledExtensions(local, runningExtensions, query, options3, includeBuiltin) {
    let { value: value2, includedCategories, excludedCategories } = this.parseCategories(query.value);
    value2 = value2 ? value2.replaceAll(/@enabled|@builtin/gi, "").replaceAll(/@sort:(\w+)(-\w*)?/g, "").trim().toLowerCase() : "";
    local = local.filter((e) => e.isBuiltin === includeBuiltin);
    const result = local.sort((e1, e2) => e1.displayName.localeCompare(e2.displayName)).filter((e) => runningExtensions.some((r2) => areSameExtensions({ id: r2.identifier.value, uuid: r2.uuid }, e.identifier)) && (e.name.toLowerCase().indexOf(value2) > -1 || e.displayName.toLowerCase().indexOf(value2) > -1) && this.filterExtensionByCategory(e, includedCategories, excludedCategories));
    return this.sortExtensions(result, options3);
  }
  filterWorkspaceUnsupportedExtensions(local, query, options3) {
    const queryString = query.value;
    const match2 = queryString.match(/^\s*@workspaceUnsupported(?::(untrusted|virtual)(Partial)?)?(?:\s+([^\s]*))?/i);
    if (!match2) {
      return [];
    }
    const type = match2[1]?.toLowerCase();
    const partial = !!match2[2];
    const nameFilter = match2[3]?.toLowerCase();
    if (nameFilter) {
      local = local.filter((extension) => extension.name.toLowerCase().indexOf(nameFilter) > -1 || extension.displayName.toLowerCase().indexOf(nameFilter) > -1);
    }
    const hasVirtualSupportType = (extension, supportType) => {
      return extension.local && this.extensionManifestPropertiesService.getExtensionVirtualWorkspaceSupportType(extension.local.manifest) === supportType;
    };
    const hasRestrictedSupportType = (extension, supportType) => {
      if (!extension.local) {
        return false;
      }
      const enablementState = this.extensionEnablementService.getEnablementState(extension.local);
      if (enablementState !== 12 /* EnabledGlobally */ && enablementState !== 13 /* EnabledWorkspace */ && enablementState !== 0 /* DisabledByTrustRequirement */ && enablementState !== 8 /* DisabledByExtensionDependency */) {
        return false;
      }
      if (this.extensionManifestPropertiesService.getExtensionUntrustedWorkspaceSupportType(extension.local.manifest) === supportType) {
        return true;
      }
      if (supportType === false) {
        const dependencies = getExtensionDependencies(local.map((ext) => ext.local), extension.local);
        return dependencies.some((ext) => this.extensionManifestPropertiesService.getExtensionUntrustedWorkspaceSupportType(ext.manifest) === supportType);
      }
      return false;
    };
    const inVirtualWorkspace = isVirtualWorkspace(this.workspaceService.getWorkspace());
    const inRestrictedWorkspace = !this.workspaceTrustManagementService.isWorkspaceTrusted();
    if (type === "virtual") {
      local = local.filter((extension) => inVirtualWorkspace && hasVirtualSupportType(extension, partial ? "limited" : false) && !(inRestrictedWorkspace && hasRestrictedSupportType(extension, false)));
    } else if (type === "untrusted") {
      local = local.filter((extension) => hasRestrictedSupportType(extension, partial ? "limited" : false) && !(inVirtualWorkspace && hasVirtualSupportType(extension, false)));
    } else {
      local = local.filter((extension) => inVirtualWorkspace && !hasVirtualSupportType(extension, true) || inRestrictedWorkspace && !hasRestrictedSupportType(extension, true));
    }
    return this.sortExtensions(local, options3);
  }
  async filterDeprecatedExtensions(local, query, options3) {
    const value2 = query.value.replace(/@deprecated/g, "").replace(/@sort:(\w+)(-\w*)?/g, "").trim().toLowerCase();
    const extensionsControlManifest = await this.extensionManagementService.getExtensionsControlManifest();
    const deprecatedExtensionIds = Object.keys(extensionsControlManifest.deprecated);
    local = local.filter((e) => deprecatedExtensionIds.includes(e.identifier.id) && (!value2 || e.name.toLowerCase().indexOf(value2) > -1 || e.displayName.toLowerCase().indexOf(value2) > -1));
    return this.sortExtensions(local, options3);
  }
  filterRecentlyUpdatedExtensions(local, query, options3) {
    let { value: value2, includedCategories, excludedCategories } = this.parseCategories(query.value);
    const currentTime = Date.now();
    local = local.filter((e) => !e.isBuiltin && !e.outdated && e.local?.updated && e.local?.installedTimestamp !== void 0 && currentTime - e.local.installedTimestamp < ExtensionsListView.RECENT_UPDATE_DURATION);
    value2 = value2.replace(/@recentlyUpdated/g, "").replace(/@sort:(\w+)(-\w*)?/g, "").trim().toLowerCase();
    const result = local.filter((e) => (e.name.toLowerCase().indexOf(value2) > -1 || e.displayName.toLowerCase().indexOf(value2) > -1) && this.filterExtensionByCategory(e, includedCategories, excludedCategories));
    options3.sortBy = options3.sortBy ?? "UpdateDate" /* UpdateDate */;
    return this.sortExtensions(result, options3);
  }
  filterRestartRequiredExtensions(local, query, options3) {
    let { value: value2, includedCategories, excludedCategories } = this.parseCategories(query.value);
    local = local.filter((e) => e.runtimeState !== void 0);
    value2 = value2.replace(/@restartrequired/gi, "").replace(/@sort:(\w+)(-\w*)?/g, "").trim().toLowerCase();
    const result = local.filter((e) => (e.name.toLowerCase().indexOf(value2) > -1 || e.displayName.toLowerCase().indexOf(value2) > -1) && this.filterExtensionByCategory(e, includedCategories, excludedCategories));
    return this.sortExtensions(result, options3);
  }
  filterExtensionsByFeature(local, query) {
    const value2 = query.value.replace(/@contribute:/g, "").trim();
    const featureId = value2.split(" ")[0];
    const feature = Registry.as(Extensions11.ExtensionFeaturesRegistry).getExtensionFeature(featureId);
    if (!feature) {
      return [];
    }
    if (this.extensionsViewState) {
      this.extensionsViewState.filters.featureId = featureId;
    }
    const renderer = feature.renderer ? this.instantiationService.createInstance(feature.renderer) : void 0;
    try {
      const result = [];
      for (const e of local) {
        if (!e.local) {
          continue;
        }
        const accessData = this.extensionFeaturesManagementService.getAccessData(new ExtensionIdentifier(e.identifier.id), featureId);
        const shouldRender = renderer?.shouldRender(e.local.manifest);
        if (accessData || shouldRender) {
          result.push([e, accessData?.accessTimes.length ?? 0]);
        }
      }
      return result.sort(([, a], [, b]) => b - a).map(([e]) => e);
    } finally {
      renderer?.dispose();
    }
  }
  mergeAddedExtensions(extensions, newExtensions) {
    const oldExtensions = [...extensions];
    const findPreviousExtensionIndex = (from) => {
      let index2 = -1;
      const previousExtensionInNew = newExtensions[from];
      if (previousExtensionInNew) {
        index2 = oldExtensions.findIndex((e) => areSameExtensions(e.identifier, previousExtensionInNew.identifier));
        if (index2 === -1) {
          return findPreviousExtensionIndex(from - 1);
        }
      }
      return index2;
    };
    let hasChanged = false;
    for (let index2 = 0; index2 < newExtensions.length; index2++) {
      const extension = newExtensions[index2];
      if (extensions.every((r2) => !areSameExtensions(r2.identifier, extension.identifier))) {
        hasChanged = true;
        extensions.splice(findPreviousExtensionIndex(index2 - 1) + 1, 0, extension);
      }
    }
    return hasChanged ? extensions : void 0;
  }
  async queryGallery(query, options3, token) {
    const hasUserDefinedSortOrder = options3.sortBy !== void 0;
    if (!hasUserDefinedSortOrder && !query.value.trim()) {
      options3.sortBy = "InstallCount" /* InstallCount */;
    }
    if (this.isRecommendationsQuery(query)) {
      const model = await this.queryRecommendations(query, options3, token);
      return { model, disposables: new DisposableStore() };
    }
    const text2 = query.value;
    if (!text2) {
      options3.source = "viewlet";
      const pager = await this.extensionsWorkbenchService.queryGallery(options3, token);
      return { model: new PagedModel(pager), disposables: new DisposableStore() };
    }
    if (/\bext:([^\s]+)\b/g.test(text2)) {
      options3.text = text2;
      options3.source = "file-extension-tags";
      const pager = await this.extensionsWorkbenchService.queryGallery(options3, token);
      return { model: new PagedModel(pager), disposables: new DisposableStore() };
    }
    options3.text = text2.substring(0, 350);
    options3.source = "searchText";
    if (hasUserDefinedSortOrder || /\b(category|tag):([^\s]+)\b/gi.test(text2) || /\bfeatured(\s+|\b|$)/gi.test(text2)) {
      const pager = await this.extensionsWorkbenchService.queryGallery(options3, token);
      return { model: new PagedModel(pager), disposables: new DisposableStore() };
    }
    try {
      const [pager, preferredExtensions] = await Promise.all([
        this.extensionsWorkbenchService.queryGallery(options3, token),
        this.getPreferredExtensions(options3.text.toLowerCase(), token).catch(() => [])
      ]);
      const model = preferredExtensions.length ? new PreferredExtensionsPagedModel(preferredExtensions, pager) : new PagedModel(pager);
      return { model, disposables: new DisposableStore() };
    } catch (error) {
      if (isCancellationError(error)) {
        throw error;
      }
      if (!(error instanceof ExtensionGalleryError)) {
        throw error;
      }
      const searchText = options3.text.toLowerCase();
      const localExtensions = this.extensionsWorkbenchService.local.filter((e) => !e.isBuiltin && (e.name.toLowerCase().indexOf(searchText) > -1 || e.displayName.toLowerCase().indexOf(searchText) > -1 || e.description.toLowerCase().indexOf(searchText) > -1));
      if (localExtensions.length) {
        const message = this.getMessage(error);
        return { model: new PagedModel(localExtensions), disposables: new DisposableStore(), message: { text: localize(15486, null, message.text), severity: message.severity } };
      }
      throw error;
    }
  }
  async getPreferredExtensions(searchText, token) {
    const preferredExtensions = this.extensionsWorkbenchService.local.filter((e) => !e.isBuiltin && (e.name.toLowerCase().indexOf(searchText) > -1 || e.displayName.toLowerCase().indexOf(searchText) > -1 || e.description.toLowerCase().indexOf(searchText) > -1));
    const preferredExtensionUUIDs = /* @__PURE__ */ new Set();
    if (preferredExtensions.length) {
      const extesionsToFetch = [];
      for (const extension of preferredExtensions) {
        if (extension.identifier.uuid) {
          preferredExtensionUUIDs.add(extension.identifier.uuid);
        }
        if (!extension.gallery && extension.identifier.uuid) {
          extesionsToFetch.push(extension.identifier);
        }
      }
      if (extesionsToFetch.length) {
        this.extensionsWorkbenchService.getExtensions(extesionsToFetch, CancellationToken.None).catch(
          (e) => null
          /*ignore error*/
        );
      }
    }
    const preferredResults = [];
    try {
      const manifest = await this.extensionManagementService.getExtensionsControlManifest();
      if (Array.isArray(manifest.search)) {
        for (const s of manifest.search) {
          if (s.query && s.query.toLowerCase() === searchText && Array.isArray(s.preferredResults)) {
            preferredResults.push(...s.preferredResults);
            break;
          }
        }
      }
      if (preferredResults.length) {
        const result = await this.extensionsWorkbenchService.getExtensions(preferredResults.map((id2) => ({ id: id2 })), token);
        for (const extension of result) {
          if (extension.identifier.uuid && !preferredExtensionUUIDs.has(extension.identifier.uuid)) {
            preferredExtensions.push(extension);
          }
        }
      }
    } catch (e) {
      this.logService.warn("Failed to get preferred results from the extensions control manifest.", e);
    }
    return preferredExtensions;
  }
  sortExtensions(extensions, options3) {
    switch (options3.sortBy) {
      case "InstallCount" /* InstallCount */:
        extensions = extensions.sort((e1, e2) => typeof e2.installCount === "number" && typeof e1.installCount === "number" ? e2.installCount - e1.installCount : NaN);
        break;
      case "UpdateDate" /* UpdateDate */:
        extensions = extensions.sort((e1, e2) => typeof e2.local?.installedTimestamp === "number" && typeof e1.local?.installedTimestamp === "number" ? e2.local.installedTimestamp - e1.local.installedTimestamp : typeof e2.local?.installedTimestamp === "number" ? 1 : typeof e1.local?.installedTimestamp === "number" ? -1 : NaN);
        break;
      case "AverageRating" /* AverageRating */:
      case "WeightedRating" /* WeightedRating */:
        extensions = extensions.sort((e1, e2) => typeof e2.rating === "number" && typeof e1.rating === "number" ? e2.rating - e1.rating : NaN);
        break;
      default:
        extensions = extensions.sort((e1, e2) => e1.displayName.localeCompare(e2.displayName));
        break;
    }
    if (options3.sortOrder === 2 /* Descending */) {
      extensions = extensions.reverse();
    }
    return extensions;
  }
  isRecommendationsQuery(query) {
    return ExtensionsListView.isWorkspaceRecommendedExtensionsQuery(query.value) || ExtensionsListView.isKeymapsRecommendedExtensionsQuery(query.value) || ExtensionsListView.isLanguageRecommendedExtensionsQuery(query.value) || ExtensionsListView.isExeRecommendedExtensionsQuery(query.value) || ExtensionsListView.isRemoteRecommendedExtensionsQuery(query.value) || /@recommended:all/i.test(query.value) || ExtensionsListView.isSearchRecommendedExtensionsQuery(query.value) || ExtensionsListView.isRecommendedExtensionsQuery(query.value);
  }
  async queryRecommendations(query, options3, token) {
    if (ExtensionsListView.isWorkspaceRecommendedExtensionsQuery(query.value)) {
      return this.getWorkspaceRecommendationsModel(query, options3, token);
    }
    if (ExtensionsListView.isKeymapsRecommendedExtensionsQuery(query.value)) {
      return this.getKeymapRecommendationsModel(query, options3, token);
    }
    if (ExtensionsListView.isLanguageRecommendedExtensionsQuery(query.value)) {
      return this.getLanguageRecommendationsModel(query, options3, token);
    }
    if (ExtensionsListView.isExeRecommendedExtensionsQuery(query.value)) {
      return this.getExeRecommendationsModel(query, options3, token);
    }
    if (ExtensionsListView.isRemoteRecommendedExtensionsQuery(query.value)) {
      return this.getRemoteRecommendationsModel(query, options3, token);
    }
    if (/@recommended:all/i.test(query.value)) {
      return this.getAllRecommendationsModel(options3, token);
    }
    if (ExtensionsListView.isSearchRecommendedExtensionsQuery(query.value) || ExtensionsListView.isRecommendedExtensionsQuery(query.value) && options3.sortBy !== void 0) {
      return this.searchRecommendations(query, options3, token);
    }
    if (ExtensionsListView.isRecommendedExtensionsQuery(query.value)) {
      return this.getOtherRecommendationsModel(query, options3, token);
    }
    return new PagedModel([]);
  }
  async getInstallableRecommendations(recommendations, options3, token) {
    const result = [];
    if (recommendations.length) {
      const galleryExtensions = [];
      const resourceExtensions = [];
      for (const recommendation of recommendations) {
        if (typeof recommendation === "string") {
          galleryExtensions.push(recommendation);
        } else {
          resourceExtensions.push(recommendation);
        }
      }
      if (galleryExtensions.length) {
        try {
          const extensions = await this.extensionsWorkbenchService.getExtensions(galleryExtensions.map((id2) => ({ id: id2 })), { source: options3.source }, token);
          for (const extension of extensions) {
            if (extension.gallery && !extension.deprecationInfo && await this.extensionManagementService.canInstall(extension.gallery) === true) {
              result.push(extension);
            }
          }
        } catch (error) {
          if (!resourceExtensions.length || !this.isOfflineError(error)) {
            throw error;
          }
        }
      }
      if (resourceExtensions.length) {
        const extensions = await this.extensionsWorkbenchService.getResourceExtensions(resourceExtensions, true);
        for (const extension of extensions) {
          if (await this.extensionsWorkbenchService.canInstall(extension) === true) {
            result.push(extension);
          }
        }
      }
    }
    return result;
  }
  async getWorkspaceRecommendations() {
    const recommendations = await this.extensionRecommendationsService.getWorkspaceRecommendations();
    const { important } = await this.extensionRecommendationsService.getConfigBasedRecommendations();
    for (const configBasedRecommendation of important) {
      if (!recommendations.find((extensionId) => extensionId === configBasedRecommendation)) {
        recommendations.push(configBasedRecommendation);
      }
    }
    return recommendations;
  }
  async getWorkspaceRecommendationsModel(query, options3, token) {
    const recommendations = await this.getWorkspaceRecommendations();
    const installableRecommendations = await this.getInstallableRecommendations(recommendations, { ...options3, source: "recommendations-workspace" }, token);
    return new PagedModel(installableRecommendations);
  }
  async getKeymapRecommendationsModel(query, options3, token) {
    const value2 = query.value.replace(/@recommended:keymaps/g, "").trim().toLowerCase();
    const recommendations = this.extensionRecommendationsService.getKeymapRecommendations();
    const installableRecommendations = (await this.getInstallableRecommendations(recommendations, { ...options3, source: "recommendations-keymaps" }, token)).filter((extension) => extension.identifier.id.toLowerCase().indexOf(value2) > -1);
    return new PagedModel(installableRecommendations);
  }
  async getLanguageRecommendationsModel(query, options3, token) {
    const value2 = query.value.replace(/@recommended:languages/g, "").trim().toLowerCase();
    const recommendations = this.extensionRecommendationsService.getLanguageRecommendations();
    const installableRecommendations = (await this.getInstallableRecommendations(recommendations, { ...options3, source: "recommendations-languages" }, token)).filter((extension) => extension.identifier.id.toLowerCase().indexOf(value2) > -1);
    return new PagedModel(installableRecommendations);
  }
  async getRemoteRecommendationsModel(query, options3, token) {
    const value2 = query.value.replace(/@recommended:remotes/g, "").trim().toLowerCase();
    const recommendations = this.extensionRecommendationsService.getRemoteRecommendations();
    const installableRecommendations = (await this.getInstallableRecommendations(recommendations, { ...options3, source: "recommendations-remotes" }, token)).filter((extension) => extension.identifier.id.toLowerCase().indexOf(value2) > -1);
    return new PagedModel(installableRecommendations);
  }
  async getExeRecommendationsModel(query, options3, token) {
    const exe = query.value.replace(/@exe:/g, "").trim().toLowerCase();
    const { important, others } = await this.extensionRecommendationsService.getExeBasedRecommendations(exe.startsWith('"') ? exe.substring(1, exe.length - 1) : exe);
    const installableRecommendations = await this.getInstallableRecommendations([...important, ...others], { ...options3, source: "recommendations-exe" }, token);
    return new PagedModel(installableRecommendations);
  }
  async getOtherRecommendationsModel(query, options3, token) {
    const otherRecommendations = await this.getOtherRecommendations();
    const installableRecommendations = await this.getInstallableRecommendations(otherRecommendations, { ...options3, source: "recommendations-other", sortBy: void 0 }, token);
    const result = coalesce(otherRecommendations.map((id2) => installableRecommendations.find((i2) => areSameExtensions(i2.identifier, { id: id2 }))));
    return new PagedModel(result);
  }
  async getOtherRecommendations() {
    const local = (await this.extensionsWorkbenchService.queryLocal(this.options.server)).map((e) => e.identifier.id.toLowerCase());
    const workspaceRecommendations = (await this.getWorkspaceRecommendations()).map((extensionId) => isString(extensionId) ? extensionId.toLowerCase() : extensionId);
    return distinct(
      (await Promise.all([
        // Order is important
        this.extensionRecommendationsService.getImportantRecommendations(),
        this.extensionRecommendationsService.getFileBasedRecommendations(),
        this.extensionRecommendationsService.getOtherRecommendations()
      ])).flat().filter(
        (extensionId) => !local.includes(extensionId.toLowerCase()) && !workspaceRecommendations.includes(extensionId.toLowerCase())
      ),
      (extensionId) => extensionId.toLowerCase()
    );
  }
  // Get All types of recommendations, trimmed to show a max of 8 at any given time
  async getAllRecommendationsModel(options3, token) {
    const localExtensions = await this.extensionsWorkbenchService.queryLocal(this.options.server);
    const localExtensionIds = localExtensions.map((e) => e.identifier.id.toLowerCase());
    const allRecommendations = distinct(
      (await Promise.all([
        // Order is important
        this.getWorkspaceRecommendations(),
        this.extensionRecommendationsService.getImportantRecommendations(),
        this.extensionRecommendationsService.getFileBasedRecommendations(),
        this.extensionRecommendationsService.getOtherRecommendations()
      ])).flat().filter((extensionId) => {
        if (isString(extensionId)) {
          return !localExtensionIds.includes(extensionId.toLowerCase());
        }
        return !localExtensions.some((localExtension) => localExtension.local && this.uriIdentityService.extUri.isEqual(localExtension.local.location, extensionId));
      })
    );
    const installableRecommendations = await this.getInstallableRecommendations(allRecommendations, { ...options3, source: "recommendations-all", sortBy: void 0 }, token);
    const result = [];
    for (let i2 = 0; i2 < installableRecommendations.length && result.length < 8; i2++) {
      const recommendation = allRecommendations[i2];
      if (isString(recommendation)) {
        const extension = installableRecommendations.find((extension2) => areSameExtensions(extension2.identifier, { id: recommendation }));
        if (extension) {
          result.push(extension);
        }
      } else {
        const extension = installableRecommendations.find((extension2) => extension2.resourceExtension && this.uriIdentityService.extUri.isEqual(extension2.resourceExtension.location, recommendation));
        if (extension) {
          result.push(extension);
        }
      }
    }
    return new PagedModel(result);
  }
  async searchRecommendations(query, options3, token) {
    const value2 = query.value.replace(/@recommended/g, "").trim().toLowerCase();
    const recommendations = distinct([...await this.getWorkspaceRecommendations(), ...await this.getOtherRecommendations()]);
    const installableRecommendations = (await this.getInstallableRecommendations(recommendations, { ...options3, source: "recommendations", sortBy: void 0 }, token)).filter((extension) => extension.identifier.id.toLowerCase().indexOf(value2) > -1);
    return new PagedModel(this.sortExtensions(installableRecommendations, options3));
  }
  setModel(model, message, donotResetScrollTop) {
    if (this.list) {
      this.list.model = new DelayedPagedModel(model);
      this.updateBody(message);
      if (!donotResetScrollTop) {
        this.list.scrollTop = 0;
      }
    }
    if (this.badge) {
      this.badge.setCount(this.count());
    }
  }
  updateModel(model) {
    if (this.list) {
      this.list.model = new DelayedPagedModel(model);
      this.updateBody();
    }
    if (this.badge) {
      this.badge.setCount(this.count());
    }
  }
  updateBody(message) {
    if (this.bodyTemplate) {
      const count2 = this.count();
      this.bodyTemplate.extensionsList.classList.toggle("hidden", count2 === 0);
      this.bodyTemplate.messageContainer.classList.toggle("hidden", !message && count2 > 0);
      if (this.isBodyVisible()) {
        if (message) {
          this.bodyTemplate.messageSeverityIcon.className = SeverityIcon.className(message.severity);
          this.bodyTemplate.messageBox.textContent = message.text;
        } else if (this.count() === 0) {
          this.bodyTemplate.messageSeverityIcon.className = "";
          this.bodyTemplate.messageBox.textContent = localize(15483, null);
        }
        if (this.bodyTemplate.messageBox.textContent) {
          alert(this.bodyTemplate.messageBox.textContent);
        }
      }
    }
    this.updateSize();
  }
  getMessage(error) {
    if (this.isOfflineError(error)) {
      return { text: localize(15485, null), severity: Severity2.Warning };
    } else {
      return { text: localize(15482, null, getErrorMessage(error)), severity: Severity2.Error };
    }
  }
  isOfflineError(error) {
    if (error instanceof ExtensionGalleryError) {
      return error.code === "Offline" /* Offline */;
    }
    return isOfflineError(error);
  }
  updateSize() {
    if (this.options.flexibleHeight) {
      this.maximumBodySize = this.list?.model.length ? Number.POSITIVE_INFINITY : 0;
      this.storageService.store(`${this.id}.size`, this.list?.model.length || 0, 0 /* PROFILE */, 1 /* MACHINE */);
    }
  }
  dispose() {
    super.dispose();
    if (this.queryRequest) {
      this.queryRequest.request.cancel();
      this.queryRequest = null;
    }
    if (this.queryResult) {
      this.queryResult.disposables.dispose();
      this.queryResult = void 0;
    }
    this.list = null;
  }
  static isLocalExtensionsQuery(query, sortBy) {
    return this.isInstalledExtensionsQuery(query) || this.isSearchInstalledExtensionsQuery(query) || this.isOutdatedExtensionsQuery(query) || this.isEnabledExtensionsQuery(query) || this.isDisabledExtensionsQuery(query) || this.isBuiltInExtensionsQuery(query) || this.isSearchBuiltInExtensionsQuery(query) || this.isBuiltInGroupExtensionsQuery(query) || this.isSearchDeprecatedExtensionsQuery(query) || this.isSearchWorkspaceUnsupportedExtensionsQuery(query) || this.isSearchRecentlyUpdatedQuery(query) || this.isRestartRequiredQuery(query) || this.isSearchExtensionUpdatesQuery(query) || this.isSortInstalledExtensionsQuery(query, sortBy) || this.isFeatureExtensionsQuery(query);
  }
  static isSearchBuiltInExtensionsQuery(query) {
    return /@builtin\s.+|.+\s@builtin/i.test(query);
  }
  static isBuiltInExtensionsQuery(query) {
    return /^@builtin$/i.test(query.trim());
  }
  static isBuiltInGroupExtensionsQuery(query) {
    return /^@builtin:.+$/i.test(query.trim());
  }
  static isSearchWorkspaceUnsupportedExtensionsQuery(query) {
    return /^\s*@workspaceUnsupported(:(untrusted|virtual)(Partial)?)?(\s|$)/i.test(query);
  }
  static isInstalledExtensionsQuery(query) {
    return /@installed$/i.test(query) && !/@mcp/i.test(query) && !/@agentPlugins/i.test(query);
  }
  static isSearchInstalledExtensionsQuery(query) {
    return /@installed\s./i.test(query) && !/@mcp/i.test(query) && !/@agentPlugins/i.test(query) || this.isFeatureExtensionsQuery(query);
  }
  static isOutdatedExtensionsQuery(query) {
    return /@outdated/i.test(query);
  }
  static isEnabledExtensionsQuery(query) {
    return /@enabled/i.test(query) && !/@builtin/i.test(query);
  }
  static isDisabledExtensionsQuery(query) {
    return /@disabled/i.test(query) && !/@builtin/i.test(query);
  }
  static isSearchDeprecatedExtensionsQuery(query) {
    return /@deprecated\s?.*/i.test(query);
  }
  static isRecommendedExtensionsQuery(query) {
    return /^@recommended$/i.test(query.trim());
  }
  static isSearchRecommendedExtensionsQuery(query) {
    return /@recommended\s.+/i.test(query);
  }
  static isWorkspaceRecommendedExtensionsQuery(query) {
    return /@recommended:workspace/i.test(query);
  }
  static isExeRecommendedExtensionsQuery(query) {
    return /@exe:.+/i.test(query);
  }
  static isRemoteRecommendedExtensionsQuery(query) {
    return /@recommended:remotes/i.test(query);
  }
  static isKeymapsRecommendedExtensionsQuery(query) {
    return /@recommended:keymaps/i.test(query);
  }
  static isLanguageRecommendedExtensionsQuery(query) {
    return /@recommended:languages/i.test(query);
  }
  static isSortInstalledExtensionsQuery(query, sortBy) {
    return sortBy !== void 0 && sortBy !== "" && query === "" || !sortBy && /^@sort:\S*$/i.test(query);
  }
  static isSearchPopularQuery(query) {
    return /@popular/i.test(query);
  }
  static isSearchRecentlyPublishedQuery(query) {
    return /@recentlyPublished/i.test(query);
  }
  static isSearchRecentlyUpdatedQuery(query) {
    return /@recentlyUpdated/i.test(query);
  }
  static isRestartRequiredQuery(query) {
    return /@restartrequired/i.test(query);
  }
  static isSearchExtensionUpdatesQuery(query) {
    return /@updates/i.test(query);
  }
  static isSortUpdateDateQuery(query) {
    return /@sort:updateDate/i.test(query);
  }
  static isFeatureExtensionsQuery(query) {
    return /@contribute:/i.test(query);
  }
  focus() {
    super.focus();
    if (!this.list) {
      return;
    }
    if (!(this.list.getFocus().length || this.list.getSelection().length)) {
      this.list.focusNext();
    }
    this.list.domFocus();
  }
};

ExtensionsListView = __decorateClass([
  __decorateParam(2, INotificationService),
  __decorateParam(3, IKeybindingService),
  __decorateParam(4, IContextMenuService),
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, IThemeService),
  __decorateParam(7, IExtensionService),
  __decorateParam(8, IExtensionsWorkbenchService),
  __decorateParam(9, IExtensionRecommendationsService),
  __decorateParam(10, ITelemetryService),
  __decorateParam(11, IHoverService),
  __decorateParam(12, IConfigurationService),
  __decorateParam(13, IWorkspaceContextService),
  __decorateParam(14, IExtensionManagementServerService),
  __decorateParam(15, IExtensionManifestPropertiesService),
  __decorateParam(16, IWorkbenchExtensionManagementService),
  __decorateParam(17, IWorkspaceContextService),
  __decorateParam(18, IProductService),
  __decorateParam(19, IContextKeyService),
  __decorateParam(20, IViewDescriptorService),
  __decorateParam(21, IOpenerService),
  __decorateParam(22, IStorageService),
  __decorateParam(23, IWorkspaceTrustManagementService),
  __decorateParam(24, IWorkbenchExtensionEnablementService),
  __decorateParam(25, IExtensionFeaturesManagementService),
  __decorateParam(26, IUriIdentityService),
  __decorateParam(27, ILogService)
], ExtensionsListView);

var DefaultPopularExtensionsView = class extends ExtensionsListView {
  async show() {
    const query = this.extensionManagementServerService.webExtensionManagementServer && !this.extensionManagementServerService.localExtensionManagementServer && !this.extensionManagementServerService.remoteExtensionManagementServer ? "@web" : "";
    return super.show(query);
  }
};

var ServerInstalledExtensionsView = class extends ExtensionsListView {
  async show(query) {
    query = query ? query : "@installed";
    if (!ExtensionsListView.isLocalExtensionsQuery(query) || ExtensionsListView.isSortInstalledExtensionsQuery(query)) {
      query = query += " @installed";
    }
    return super.show(query.trim());
  }
};

var EnabledExtensionsView = class extends ExtensionsListView {
  async show(query) {
    query = query || "@enabled";
    return ExtensionsListView.isEnabledExtensionsQuery(query) ? super.show(query) : ExtensionsListView.isSortInstalledExtensionsQuery(query) ? super.show("@enabled " + query) : this.showEmptyModel();
  }
};

var DisabledExtensionsView = class extends ExtensionsListView {
  async show(query) {
    query = query || "@disabled";
    return ExtensionsListView.isDisabledExtensionsQuery(query) ? super.show(query) : ExtensionsListView.isSortInstalledExtensionsQuery(query) ? super.show("@disabled " + query) : this.showEmptyModel();
  }
};

var OutdatedExtensionsView = class extends ExtensionsListView {
  async show(query) {
    query = query ? query : "@outdated";
    if (ExtensionsListView.isSearchExtensionUpdatesQuery(query)) {
      query = query.replace("@updates", "@outdated");
    }
    return super.show(query.trim());
  }
  updateSize() {
    super.updateSize();
    this.setExpanded(this.count() > 0);
  }
};

var RecentlyUpdatedExtensionsView = class extends ExtensionsListView {
  async show(query) {
    query = query ? query : "@recentlyUpdated";
    if (ExtensionsListView.isSearchExtensionUpdatesQuery(query)) {
      query = query.replace("@updates", "@recentlyUpdated");
    }
    return super.show(query.trim());
  }
};

var StaticQueryExtensionsView = class extends ExtensionsListView {
  constructor(options3, viewletViewOptions, notificationService, keybindingService, contextMenuService, instantiationService, themeService, extensionService, extensionsWorkbenchService, extensionRecommendationsService, telemetryService, hoverService, configurationService, contextService, extensionManagementServerService, extensionManifestPropertiesService, extensionManagementService, workspaceService, productService, contextKeyService, viewDescriptorService, openerService, storageService, workspaceTrustManagementService, extensionEnablementService, extensionFeaturesManagementService, uriIdentityService, logService) {
    super(
      options3,
      viewletViewOptions,
      notificationService,
      keybindingService,
      contextMenuService,
      instantiationService,
      themeService,
      extensionService,
      extensionsWorkbenchService,
      extensionRecommendationsService,
      telemetryService,
      hoverService,
      configurationService,
      contextService,
      extensionManagementServerService,
      extensionManifestPropertiesService,
      extensionManagementService,
      workspaceService,
      productService,
      contextKeyService,
      viewDescriptorService,
      openerService,
      storageService,
      workspaceTrustManagementService,
      extensionEnablementService,
      extensionFeaturesManagementService,
      uriIdentityService,
      logService
    );
    this.options = options3;
  }
  show() {
    return super.show(this.options.query);
  }
};

StaticQueryExtensionsView = __decorateClass([
  __decorateParam(2, INotificationService),
  __decorateParam(3, IKeybindingService),
  __decorateParam(4, IContextMenuService),
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, IThemeService),
  __decorateParam(7, IExtensionService),
  __decorateParam(8, IExtensionsWorkbenchService),
  __decorateParam(9, IExtensionRecommendationsService),
  __decorateParam(10, ITelemetryService),
  __decorateParam(11, IHoverService),
  __decorateParam(12, IConfigurationService),
  __decorateParam(13, IWorkspaceContextService),
  __decorateParam(14, IExtensionManagementServerService),
  __decorateParam(15, IExtensionManifestPropertiesService),
  __decorateParam(16, IWorkbenchExtensionManagementService),
  __decorateParam(17, IWorkspaceContextService),
  __decorateParam(18, IProductService),
  __decorateParam(19, IContextKeyService),
  __decorateParam(20, IViewDescriptorService),
  __decorateParam(21, IOpenerService),
  __decorateParam(22, IStorageService),
  __decorateParam(23, IWorkspaceTrustManagementService),
  __decorateParam(24, IWorkbenchExtensionEnablementService),
  __decorateParam(25, IExtensionFeaturesManagementService),
  __decorateParam(26, IUriIdentityService),
  __decorateParam(27, ILogService)
], StaticQueryExtensionsView);

function toSpecificWorkspaceUnsupportedQuery(query, qualifier) {
  if (!query) {
    return "@workspaceUnsupported:" + qualifier;
  }
  const match2 = query.match(new RegExp(`@workspaceUnsupported(:${qualifier})?(\\s|$)`, "i"));
  if (match2) {
    if (!match2[1]) {
      return query.replace(/@workspaceUnsupported/gi, "@workspaceUnsupported:" + qualifier);
    }
    return query;
  }
  return void 0;
}

var UntrustedWorkspaceUnsupportedExtensionsView = class extends ExtensionsListView {
  async show(query) {
    const updatedQuery = toSpecificWorkspaceUnsupportedQuery(query, "untrusted");
    return updatedQuery ? super.show(updatedQuery) : this.showEmptyModel();
  }
};

var UntrustedWorkspacePartiallySupportedExtensionsView = class extends ExtensionsListView {
  async show(query) {
    const updatedQuery = toSpecificWorkspaceUnsupportedQuery(query, "untrustedPartial");
    return updatedQuery ? super.show(updatedQuery) : this.showEmptyModel();
  }
};

var VirtualWorkspaceUnsupportedExtensionsView = class extends ExtensionsListView {
  async show(query) {
    const updatedQuery = toSpecificWorkspaceUnsupportedQuery(query, "virtual");
    return updatedQuery ? super.show(updatedQuery) : this.showEmptyModel();
  }
};

var VirtualWorkspacePartiallySupportedExtensionsView = class extends ExtensionsListView {
  async show(query) {
    const updatedQuery = toSpecificWorkspaceUnsupportedQuery(query, "virtualPartial");
    return updatedQuery ? super.show(updatedQuery) : this.showEmptyModel();
  }
};

var DeprecatedExtensionsView = class extends ExtensionsListView {
  async show(query) {
    return ExtensionsListView.isSearchDeprecatedExtensionsQuery(query) ? super.show(query) : this.showEmptyModel();
  }
};

var SearchMarketplaceExtensionsView = class extends ExtensionsListView {
  constructor() {
    super(...arguments);
    this.reportSearchFinishedDelayer = this._register(new ThrottledDelayer(2e3));
    this.searchWaitPromise = Promise.resolve();
  }
  async show(query) {
    const queryPromise = super.show(query);
    this.reportSearchFinishedDelayer.trigger(() => this.reportSearchFinished());
    this.searchWaitPromise = queryPromise.then(null, null);
    return queryPromise;
  }
  async reportSearchFinished() {
    await this.searchWaitPromise;
    this.telemetryService.publicLog2("extensionsView:MarketplaceSearchFinished");
  }
};

var DefaultRecommendedExtensionsView = class extends ExtensionsListView {
  constructor() {
    super(...arguments);
    this.recommendedExtensionsQuery = "@recommended:all";
  }
  renderBody(container3) {
    super.renderBody(container3);
    this._register(this.extensionRecommendationsService.onDidChangeRecommendations(() => {
      this.show("");
    }));
  }
  async show(query) {
    if (query && query.trim() !== this.recommendedExtensionsQuery) {
      return this.showEmptyModel();
    }
    const model = await super.show(this.recommendedExtensionsQuery);
    if (!this.extensionsWorkbenchService.local.some((e) => !e.isBuiltin)) {
      this.setExpanded(model.length > 0);
    }
    return model;
  }
};

var RecommendedExtensionsView = class extends ExtensionsListView {
  constructor() {
    super(...arguments);
    this.recommendedExtensionsQuery = "@recommended";
  }
  renderBody(container3) {
    super.renderBody(container3);
    this._register(this.extensionRecommendationsService.onDidChangeRecommendations(() => {
      this.show("");
    }));
  }
  async show(query) {
    return query && query.trim() !== this.recommendedExtensionsQuery ? this.showEmptyModel() : super.show(this.recommendedExtensionsQuery);
  }
};

var WorkspaceRecommendedExtensionsView = class extends ExtensionsListView {
  constructor() {
    super(...arguments);
    this.recommendedExtensionsQuery = "@recommended:workspace";
  }
  renderBody(container3) {
    super.renderBody(container3);
    this._register(this.extensionRecommendationsService.onDidChangeRecommendations(() => this.show(this.recommendedExtensionsQuery)));
    this._register(this.contextService.onDidChangeWorkbenchState(() => this.show(this.recommendedExtensionsQuery)));
  }
  async show(query) {
    const shouldShowEmptyView = query && query.trim() !== "@recommended" && query.trim() !== "@recommended:workspace";
    const model = await (shouldShowEmptyView ? this.showEmptyModel() : super.show(this.recommendedExtensionsQuery));
    this.setExpanded(model.length > 0);
    return model;
  }
  async getInstallableWorkspaceRecommendations() {
    const installed = (await this.extensionsWorkbenchService.queryLocal()).filter((l) => l.enablementState !== 1 /* DisabledByExtensionKind */);
    const recommendations = (await this.getWorkspaceRecommendations()).filter((recommendation) => installed.every((local) => isString(recommendation) ? !areSameExtensions({ id: recommendation }, local.identifier) : !this.uriIdentityService.extUri.isEqual(recommendation, local.local?.location)));
    return this.getInstallableRecommendations(recommendations, { source: "install-all-workspace-recommendations" }, CancellationToken.None);
  }
  async installWorkspaceRecommendations() {
    const installableRecommendations = await this.getInstallableWorkspaceRecommendations();
    if (installableRecommendations.length) {
      const galleryExtensions = [];
      const resourceExtensions = [];
      for (const recommendation of installableRecommendations) {
        if (recommendation.gallery) {
          galleryExtensions.push({ extension: recommendation.gallery, options: {} });
        } else {
          resourceExtensions.push(recommendation);
        }
      }
      await Promise.all([
        this.extensionManagementService.installGalleryExtensions(galleryExtensions),
        ...resourceExtensions.map((extension) => this.extensionsWorkbenchService.install(extension))
      ]);
    } else {
      this.notificationService.notify({
        severity: Severity2.Info,
        message: localize(15484, null)
      });
    }
  }
};

var PreferredExtensionsPagedModel = class {
  constructor(preferredExtensions, pager) {
    this.preferredExtensions = preferredExtensions;
    this.pager = pager;
    this.resolved = /* @__PURE__ */ new Map();
    this.preferredGalleryExtensions = /* @__PURE__ */ new Set();
    this.resolvedGalleryExtensionsFromQuery = [];
    for (let i2 = 0; i2 < this.preferredExtensions.length; i2++) {
      this.resolved.set(i2, this.preferredExtensions[i2]);
    }
    for (const e of preferredExtensions) {
      if (e.identifier.uuid) {
        this.preferredGalleryExtensions.add(e.identifier.uuid);
      }
    }
    this.length = preferredExtensions.length - this.preferredGalleryExtensions.size + this.pager.total;
    const totalPages = Math.ceil(this.pager.total / this.pager.pageSize);
    this.populateResolvedExtensions(0, this.pager.firstPage);
    this.pages = range(totalPages - 1).map(() => ({
      promise: null,
      cts: null,
      promiseIndexes: /* @__PURE__ */ new Set()
    }));
  }
  get onDidIncrementLength() {
    return Event2.None;
  }
  isResolved(index2) {
    return this.resolved.has(index2);
  }
  get(index2) {
    return this.resolved.get(index2);
  }
  async resolve(index2, cancellationToken) {
    if (cancellationToken.isCancellationRequested) {
      throw new CancellationError();
    }
    if (this.isResolved(index2)) {
      return this.get(index2);
    }
    const indexInPagedModel = index2 - this.preferredExtensions.length + this.resolvedGalleryExtensionsFromQuery.length;
    const pageIndex = Math.floor(indexInPagedModel / this.pager.pageSize);
    const page = this.pages[pageIndex - 1];
    if (!page.promise) {
      page.cts = new CancellationTokenSource();
      page.promise = this.pager.getPage(pageIndex, page.cts.token).then((extensions) => this.populateResolvedExtensions(pageIndex, extensions)).catch((e) => {
        page.promise = null;
        throw e;
      }).finally(() => page.cts = null);
    }
    const listener = cancellationToken.onCancellationRequested(() => {
      if (!page.cts) {
        return;
      }
      page.promiseIndexes.delete(index2);
      if (page.promiseIndexes.size === 0) {
        page.cts.cancel();
      }
    });
    page.promiseIndexes.add(index2);
    try {
      await page.promise;
    } finally {
      listener.dispose();
    }
    return this.get(index2);
  }
  populateResolvedExtensions(pageIndex, extensions) {
    let adjustIndexOfNextPagesBy = 0;
    const pageStartIndex = pageIndex * this.pager.pageSize;
    for (let i2 = 0; i2 < extensions.length; i2++) {
      const e = extensions[i2];
      if (e.gallery?.identifier.uuid && this.preferredGalleryExtensions.has(e.gallery.identifier.uuid)) {
        this.resolvedGalleryExtensionsFromQuery.push(e);
        adjustIndexOfNextPagesBy++;
      } else {
        this.resolved.set(this.preferredExtensions.length - this.resolvedGalleryExtensionsFromQuery.length + pageStartIndex + i2, e);
      }
    }
    if (pageIndex !== 0 && adjustIndexOfNextPagesBy) {
      const nextPageStartIndex = (pageIndex + 1) * this.pager.pageSize;
      const indices = [...this.resolved.keys()].sort((a, b) => a - b);
      for (const index2 of indices) {
        if (index2 >= nextPageStartIndex) {
          const e = this.resolved.get(index2);
          if (e) {
            this.resolved.delete(index2);
            this.resolved.set(index2 - adjustIndexOfNextPagesBy, e);
          }
        }
      }
    }
  }
};
export { isLocalSortBy, toSpecificWorkspaceUnsupportedQuery, NONE_CATEGORY, ExtensionsViewState, AbstractExtensionsListView, ExtensionsListView, DefaultPopularExtensionsView, ServerInstalledExtensionsView, EnabledExtensionsView, DisabledExtensionsView, OutdatedExtensionsView, RecentlyUpdatedExtensionsView, StaticQueryExtensionsView, UntrustedWorkspaceUnsupportedExtensionsView, UntrustedWorkspacePartiallySupportedExtensionsView, VirtualWorkspaceUnsupportedExtensionsView, VirtualWorkspacePartiallySupportedExtensionsView, DeprecatedExtensionsView, SearchMarketplaceExtensionsView, DefaultRecommendedExtensionsView, RecommendedExtensionsView, WorkspaceRecommendedExtensionsView, PreferredExtensionsPagedModel };
