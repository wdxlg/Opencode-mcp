// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/extensionManagement/common/extensionGalleryService.ts
import { isWeb, platform } from "./module-0014.mjs";
import { EXTENSION_IDENTIFIER_REGEX, ExtensionGalleryError, ExtensionRequestsTimeoutConfigKey, IAllowedExtensionsService, WEB_EXTENSION_TAG, getTargetPlatform, isNotWebExtensionInWebTargetPlatform, isTargetPlatformCompatible, toTargetPlatform } from "./module-0874.mjs";
import { arch } from "./module-0015.mjs";
import { distinct } from "./module-0007.mjs";
import { adoptToGalleryExtensionId, areSameExtensions, getGalleryExtensionId, getGalleryExtensionTelemetryData } from "./module-0888.mjs";
import { IExtensionGalleryManifestService, getExtensionGalleryManifestResourceUri } from "./module-0892.mjs";
import { format22 } from "./module-0030.mjs";
import { resolveMarketplaceHeaders } from "./module-1635.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { isBoolean, isNumber, isString } from "./module-0010.mjs";
import { CancellationError, getErrorMessage, isCancellationError } from "./module-0004.mjs";
import { gt, lt, satisfies } from "./module-1045.mjs";
import { isEngineValid } from "./module-1634.mjs";
import { IRequestService, asJson, asTextOrError, isClientError, isServerError, isSuccess } from "./module-0947.mjs";
import { StopWatch } from "./module-0016.mjs";
import { isOfflineError } from "./module-1633.mjs";
import { TelemetryTrustedValue } from "./module-0887.mjs";
import { URI } from "./module-0032.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0095.mjs";
import { IEnvironmentService } from "./module-0508.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IFileService } from "./module-0269.mjs";
import { IProductService } from "./module-0875.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IStorageService } from "./module-0512.mjs";


// src/vs/platform/extensionManagement/common/extensionGalleryService.ts
var CURRENT_TARGET_PLATFORM = isWeb ? "web" /* WEB */ : getTargetPlatform(platform, arch);

var SEARCH_ACTIVITY_HEADER_NAME = "X-Market-Search-Activity-Id";

var ACTIVITY_HEADER_NAME = "Activityid";

var SERVER_HEADER_NAME = "Server";

var END_END_ID_HEADER_NAME = "X-Vss-E2eid";

var AssetType = {
  Icon: "Microsoft.VisualStudio.Services.Icons.Default",
  Details: "Microsoft.VisualStudio.Services.Content.Details",
  Changelog: "Microsoft.VisualStudio.Services.Content.Changelog",
  Manifest: "Microsoft.VisualStudio.Code.Manifest",
  VSIX: "Microsoft.VisualStudio.Services.VSIXPackage",
  License: "Microsoft.VisualStudio.Services.Content.License",
  Repository: "Microsoft.VisualStudio.Services.Links.Source",
  Signature: "Microsoft.VisualStudio.Services.VsixSignature"
};

var PropertyType = {
  Dependency: "Microsoft.VisualStudio.Code.ExtensionDependencies",
  ExtensionPack: "Microsoft.VisualStudio.Code.ExtensionPack",
  Engine: "Microsoft.VisualStudio.Code.Engine",
  PreRelease: "Microsoft.VisualStudio.Code.PreRelease",
  EnabledApiProposals: "Microsoft.VisualStudio.Code.EnabledApiProposals",
  LocalizedLanguages: "Microsoft.VisualStudio.Code.LocalizedLanguages",
  WebExtension: "Microsoft.VisualStudio.Code.WebExtension",
  SponsorLink: "Microsoft.VisualStudio.Code.SponsorLink",
  SupportLink: "Microsoft.VisualStudio.Services.Links.Support",
  ExecutesCode: "Microsoft.VisualStudio.Code.ExecutesCode",
  Private: "PrivateMarketplace"
};

var DefaultPageSize = 10;

var DefaultQueryState = {
  pageNumber: 1,
  pageSize: DefaultPageSize,
  sortBy: "NoneOrRelevance" /* NoneOrRelevance */,
  sortOrder: 0 /* Default */,
  flags: [],
  criteria: [],
  assetTypes: []
};

var Query = class _Query {
  constructor(state = DefaultQueryState) {
    this.state = state;
  }
  get pageNumber() {
    return this.state.pageNumber;
  }
  get pageSize() {
    return this.state.pageSize;
  }
  get sortBy() {
    return this.state.sortBy;
  }
  get sortOrder() {
    return this.state.sortOrder;
  }
  get flags() {
    return this.state.flags;
  }
  get criteria() {
    return this.state.criteria;
  }
  get assetTypes() {
    return this.state.assetTypes;
  }
  get source() {
    return this.state.source;
  }
  get searchText() {
    const criterium = this.state.criteria.filter((criterium2) => criterium2.filterType === "SearchText" /* SearchText */)[0];
    return criterium && criterium.value ? criterium.value : "";
  }
  withPage(pageNumber, pageSize = this.state.pageSize) {
    return new _Query({ ...this.state, pageNumber, pageSize });
  }
  withFilter(filterType, ...values) {
    const criteria = [
      ...this.state.criteria,
      ...values.length ? values.map((value2) => ({ filterType, value: value2 })) : [{ filterType }]
    ];
    return new _Query({ ...this.state, criteria });
  }
  withSortBy(sortBy) {
    return new _Query({ ...this.state, sortBy });
  }
  withSortOrder(sortOrder) {
    return new _Query({ ...this.state, sortOrder });
  }
  withFlags(...flags) {
    return new _Query({ ...this.state, flags: distinct(flags) });
  }
  withAssetTypes(...assetTypes) {
    return new _Query({ ...this.state, assetTypes });
  }
  withSource(source) {
    return new _Query({ ...this.state, source });
  }
};

function getStatistic(statistics, name) {
  const result = (statistics || []).filter((s) => s.statisticName === name)[0];
  return result ? result.value : 0;
}

function getCoreTranslationAssets(version2) {
  const coreTranslationAssetPrefix = "Microsoft.VisualStudio.Code.Translation.";
  const result = version2.files.filter((f) => f.assetType.indexOf(coreTranslationAssetPrefix) === 0);
  return result.reduce((result2, file) => {
    const asset = getVersionAsset(version2, file.assetType);
    if (asset) {
      result2.push([file.assetType.substring(coreTranslationAssetPrefix.length), asset]);
    }
    return result2;
  }, []);
}

function getRepositoryAsset(version2) {
  if (version2.properties) {
    const results = version2.properties.filter((p) => p.key === AssetType.Repository);
    const gitRegExp = new RegExp("((git|ssh|http(s)?)|(git@[\\w.]+))(:(//)?)([\\w.@:/\\-~]+)(.git)(/)?");
    const uri4 = results.filter((r2) => gitRegExp.test(r2.value))[0];
    return uri4 ? { uri: uri4.value, fallbackUri: uri4.value } : null;
  }
  return getVersionAsset(version2, AssetType.Repository);
}

function getDownloadAsset(version2) {
  return {
    // always use fallbackAssetUri for download asset to hit the Marketplace API so that downloads are counted
    uri: `${version2.fallbackAssetUri}/${AssetType.VSIX}?redirect=true${version2.targetPlatform ? `&targetPlatform=${version2.targetPlatform}` : ""}`,
    fallbackUri: `${version2.fallbackAssetUri}/${AssetType.VSIX}${version2.targetPlatform ? `?targetPlatform=${version2.targetPlatform}` : ""}`
  };
}

function getVersionAsset(version2, type) {
  const result = version2.files.filter((f) => f.assetType === type)[0];
  return result ? {
    uri: `${version2.assetUri}/${type}${version2.targetPlatform ? `?targetPlatform=${version2.targetPlatform}` : ""}`,
    fallbackUri: `${version2.fallbackAssetUri}/${type}${version2.targetPlatform ? `?targetPlatform=${version2.targetPlatform}` : ""}`
  } : null;
}

function getExtensions(version2, property) {
  const values = version2.properties ? version2.properties.filter((p) => p.key === property) : [];
  const value2 = values.length > 0 && values[0].value;
  return value2 ? value2.split(",").map((v2) => adoptToGalleryExtensionId(v2)) : [];
}

function getEngine(version2) {
  const values = version2.properties ? version2.properties.filter((p) => p.key === PropertyType.Engine) : [];
  return values.length > 0 && values[0].value || "";
}

function setEngine(version2, engine) {
  version2.properties = version2.properties ?? [];
  version2.properties.push({ key: PropertyType.Engine, value: engine });
}

function isPreReleaseVersion(version2) {
  const values = version2.properties ? version2.properties.filter((p) => p.key === PropertyType.PreRelease) : [];
  return values.length > 0 && values[0].value === "true";
}

function hasPreReleaseForExtension(id2, productService) {
  return productService.extensionProperties?.[id2.toLowerCase()]?.hasPrereleaseVersion;
}

function getExcludeVersionRangeForExtension(id2, productService) {
  return productService.extensionProperties?.[id2.toLowerCase()]?.excludeVersionRange;
}

function isPrivateExtension(version2) {
  const values = version2.properties ? version2.properties.filter((p) => p.key === PropertyType.Private) : [];
  return values.length > 0 && values[0].value === "true";
}

function executesCode(version2) {
  const values = version2.properties ? version2.properties.filter((p) => p.key === PropertyType.ExecutesCode) : [];
  return values.length > 0 ? values[0].value === "true" : void 0;
}

function getEnabledApiProposals(version2) {
  const values = version2.properties ? version2.properties.filter((p) => p.key === PropertyType.EnabledApiProposals) : [];
  const value2 = values.length > 0 && values[0].value || "";
  return value2 ? value2.split(",") : [];
}

function getLocalizedLanguages(version2) {
  const values = version2.properties ? version2.properties.filter((p) => p.key === PropertyType.LocalizedLanguages) : [];
  const value2 = values.length > 0 && values[0].value || "";
  return value2 ? value2.split(",") : [];
}

function getSponsorLink(version2) {
  return version2.properties?.find((p) => p.key === PropertyType.SponsorLink)?.value;
}

function getSupportLink(version2) {
  return version2.properties?.find((p) => p.key === PropertyType.SupportLink)?.value;
}

function getIsPreview(flags) {
  return flags.indexOf("preview") !== -1;
}

function getTargetPlatformForExtensionVersion(version2) {
  return version2.targetPlatform ? toTargetPlatform(version2.targetPlatform) : "undefined" /* UNDEFINED */;
}

function getAllTargetPlatforms(rawGalleryExtension) {
  const allTargetPlatforms = distinct(rawGalleryExtension.versions.map(getTargetPlatformForExtensionVersion));
  const isWebExtension = !!rawGalleryExtension.tags?.includes(WEB_EXTENSION_TAG);
  const webTargetPlatformIndex = allTargetPlatforms.indexOf("web" /* WEB */);
  if (isWebExtension) {
    if (webTargetPlatformIndex === -1) {
      allTargetPlatforms.push("web" /* WEB */);
    }
  } else {
    if (webTargetPlatformIndex !== -1) {
      allTargetPlatforms.splice(webTargetPlatformIndex, 1);
    }
  }
  return allTargetPlatforms;
}

function sortExtensionVersions(versions, preferredTargetPlatform) {
  for (let index2 = 0; index2 < versions.length; index2++) {
    const version2 = versions[index2];
    if (version2.version === versions[index2 - 1]?.version) {
      let insertionIndex = index2;
      const versionTargetPlatform = getTargetPlatformForExtensionVersion(version2);
      if (versionTargetPlatform === preferredTargetPlatform) {
        while (insertionIndex > 0 && versions[insertionIndex - 1].version === version2.version) {
          insertionIndex--;
        }
      }
      if (insertionIndex !== index2) {
        versions.splice(index2, 1);
        versions.splice(insertionIndex, 0, version2);
      }
    }
  }
  return versions;
}

function filterLatestExtensionVersionsForTargetPlatform(versions, targetPlatform, allTargetPlatforms) {
  const latestVersions = [];
  let preReleaseVersionIndex = -1;
  let releaseVersionIndex = -1;
  for (const version2 of versions) {
    const versionTargetPlatform = getTargetPlatformForExtensionVersion(version2);
    const isCompatibleWithTargetPlatform = isTargetPlatformCompatible(versionTargetPlatform, allTargetPlatforms, targetPlatform);
    if (!isCompatibleWithTargetPlatform) {
      latestVersions.push(version2);
      continue;
    }
    if (isPreReleaseVersion(version2)) {
      if (preReleaseVersionIndex === -1) {
        preReleaseVersionIndex = latestVersions.length;
        latestVersions.push(version2);
      } else if (versionTargetPlatform === targetPlatform && latestVersions[preReleaseVersionIndex].version === version2.version) {
        latestVersions[preReleaseVersionIndex] = version2;
      }
    } else {
      if (releaseVersionIndex === -1) {
        releaseVersionIndex = latestVersions.length;
        latestVersions.push(version2);
      } else if (versionTargetPlatform === targetPlatform && latestVersions[releaseVersionIndex].version === version2.version) {
        latestVersions[releaseVersionIndex] = version2;
      }
    }
  }
  return latestVersions;
}

function setTelemetry(extension, index2, querySource) {
  extension.telemetryData = { index: index2, querySource, queryActivityId: extension.queryContext?.[SEARCH_ACTIVITY_HEADER_NAME] };
}

function toExtension2(galleryExtension, version2, allTargetPlatforms, extensionGalleryManifest, productService, queryContext) {
  const latestVersion = galleryExtension.versions[0];
  const assets = {
    manifest: getVersionAsset(version2, AssetType.Manifest),
    readme: getVersionAsset(version2, AssetType.Details),
    changelog: getVersionAsset(version2, AssetType.Changelog),
    license: getVersionAsset(version2, AssetType.License),
    repository: getRepositoryAsset(version2),
    download: getDownloadAsset(version2),
    icon: getVersionAsset(version2, AssetType.Icon),
    signature: getVersionAsset(version2, AssetType.Signature),
    coreTranslations: getCoreTranslationAssets(version2)
  };
  const detailsViewUri = getExtensionGalleryManifestResourceUri(extensionGalleryManifest, galleryExtension.linkType ?? "ExtensionDetailsViewUriTemplate" /* ExtensionDetailsViewUri */);
  const publisherViewUri = getExtensionGalleryManifestResourceUri(extensionGalleryManifest, galleryExtension.publisher.linkType ?? "PublisherViewUriTemplate" /* PublisherViewUri */);
  const ratingViewUri = getExtensionGalleryManifestResourceUri(extensionGalleryManifest, galleryExtension.ratingLinkType ?? "ExtensionRatingViewUriTemplate" /* ExtensionRatingViewUri */);
  const id2 = getGalleryExtensionId(galleryExtension.publisher.publisherName, galleryExtension.extensionName);
  return {
    type: "gallery",
    identifier: {
      id: id2,
      uuid: galleryExtension.extensionId
    },
    name: galleryExtension.extensionName,
    version: version2.version,
    displayName: galleryExtension.displayName,
    publisherId: galleryExtension.publisher.publisherId,
    publisher: galleryExtension.publisher.publisherName,
    publisherDisplayName: galleryExtension.publisher.displayName,
    publisherDomain: galleryExtension.publisher.domain ? { link: galleryExtension.publisher.domain, verified: !!galleryExtension.publisher.isDomainVerified } : void 0,
    publisherSponsorLink: getSponsorLink(latestVersion),
    description: galleryExtension.shortDescription ?? "",
    installCount: getStatistic(galleryExtension.statistics, "install"),
    rating: getStatistic(galleryExtension.statistics, "averagerating"),
    ratingCount: getStatistic(galleryExtension.statistics, "ratingcount"),
    categories: galleryExtension.categories || [],
    tags: galleryExtension.tags || [],
    releaseDate: Date.parse(galleryExtension.releaseDate),
    lastUpdated: Date.parse(galleryExtension.lastUpdated),
    allTargetPlatforms,
    assets,
    properties: {
      dependencies: getExtensions(version2, PropertyType.Dependency),
      extensionPack: getExtensions(version2, PropertyType.ExtensionPack),
      engine: getEngine(version2),
      enabledApiProposals: getEnabledApiProposals(version2),
      localizedLanguages: getLocalizedLanguages(version2),
      targetPlatform: getTargetPlatformForExtensionVersion(version2),
      isPreReleaseVersion: isPreReleaseVersion(version2),
      executesCode: executesCode(version2)
    },
    hasPreReleaseVersion: hasPreReleaseForExtension(id2, productService) ?? isPreReleaseVersion(latestVersion),
    hasReleaseVersion: true,
    private: isPrivateExtension(latestVersion),
    preview: getIsPreview(galleryExtension.flags),
    isSigned: !!assets.signature,
    queryContext,
    supportLink: getSupportLink(latestVersion),
    detailsLink: detailsViewUri ? format22(detailsViewUri, { publisher: galleryExtension.publisher.publisherName, name: galleryExtension.extensionName }) : void 0,
    publisherLink: publisherViewUri ? format22(publisherViewUri, { publisher: galleryExtension.publisher.publisherName }) : void 0,
    ratingLink: ratingViewUri ? format22(ratingViewUri, { publisher: galleryExtension.publisher.publisherName, name: galleryExtension.extensionName }) : void 0
  };
}

var AbstractExtensionGalleryService = class {
  constructor(storageService, requestService, logService, environmentService, telemetryService, fileService, productService, configurationService, allowedExtensionsService, extensionGalleryManifestService) {
    this.requestService = requestService;
    this.logService = logService;
    this.environmentService = environmentService;
    this.telemetryService = telemetryService;
    this.fileService = fileService;
    this.productService = productService;
    this.configurationService = configurationService;
    this.allowedExtensionsService = allowedExtensionsService;
    this.extensionGalleryManifestService = extensionGalleryManifestService;
    this.extensionsControlUrl = productService.extensionsGallery?.controlUrl;
    this.unpkgResourceApi = productService.extensionsGallery?.extensionUrlTemplate;
    this.commonHeadersPromise = resolveMarketplaceHeaders(
      productService.version,
      productService,
      this.environmentService,
      this.configurationService,
      this.fileService,
      storageService,
      this.telemetryService
    );
  }
  isEnabled() {
    return this.extensionGalleryManifestService.extensionGalleryManifestStatus === "available" /* Available */;
  }
  async getExtensions(extensionInfos, arg1, arg2) {
    const extensionGalleryManifest = await this.extensionGalleryManifestService.getExtensionGalleryManifest();
    if (!extensionGalleryManifest) {
      throw new Error("No extension gallery service configured.");
    }
    const options3 = CancellationToken.isCancellationToken(arg1) ? {} : arg1;
    const token = CancellationToken.isCancellationToken(arg1) ? arg1 : arg2;
    const resourceApi = this.getResourceApi(extensionGalleryManifest);
    const result = resourceApi ? await this.getExtensionsUsingResourceApi(extensionInfos, options3, resourceApi, extensionGalleryManifest, token) : await this.getExtensionsUsingQueryApi(extensionInfos, options3, extensionGalleryManifest, token);
    const uuids = result.map((r2) => r2.identifier.uuid);
    const extensionInfosByName = [];
    for (const e4 of extensionInfos) {
      if (e4.uuid && !uuids.includes(e4.uuid)) {
        extensionInfosByName.push({ ...e4, uuid: void 0 });
      }
    }
    if (extensionInfosByName.length) {
      this.telemetryService.publicLog2("galleryService:additionalQueryByName", {
        count: extensionInfosByName.length
      });
      const extensions = await this.getExtensionsUsingQueryApi(extensionInfosByName, options3, extensionGalleryManifest, token);
      result.push(...extensions);
    }
    return result;
  }
  getResourceApi(extensionGalleryManifest) {
    const latestVersionResource = getExtensionGalleryManifestResourceUri(extensionGalleryManifest, "ExtensionLatestVersionUriTemplate" /* ExtensionLatestVersionUri */);
    if (latestVersionResource) {
      return {
        uri: latestVersionResource,
        fallback: this.unpkgResourceApi
      };
    }
    return void 0;
  }
  async getExtensionsUsingQueryApi(extensionInfos, options3, extensionGalleryManifest, token) {
    const names = [], ids = [], includePreRelease = [], versions = [];
    let isQueryForReleaseVersionFromPreReleaseVersion = true;
    for (const extensionInfo of extensionInfos) {
      if (extensionInfo.uuid) {
        ids.push(extensionInfo.uuid);
      } else {
        names.push(extensionInfo.id);
      }
      if (extensionInfo.version) {
        versions.push({ id: extensionInfo.id, uuid: extensionInfo.uuid, version: extensionInfo.version });
      } else {
        includePreRelease.push({ id: extensionInfo.id, uuid: extensionInfo.uuid, includePreRelease: !!extensionInfo.preRelease });
      }
      isQueryForReleaseVersionFromPreReleaseVersion = isQueryForReleaseVersionFromPreReleaseVersion && (!!extensionInfo.hasPreRelease && !extensionInfo.preRelease);
    }
    if (!ids.length && !names.length) {
      return [];
    }
    let query = new Query().withPage(1, extensionInfos.length);
    if (ids.length) {
      query = query.withFilter("ExtensionId" /* ExtensionId */, ...ids);
    }
    if (names.length) {
      query = query.withFilter("ExtensionName" /* ExtensionName */, ...names);
    }
    if (options3.queryAllVersions) {
      query = query.withFlags(...query.flags, "IncludeVersions" /* IncludeVersions */);
    }
    if (options3.source) {
      query = query.withSource(options3.source);
    }
    const { extensions } = await this.queryGalleryExtensions(
      query,
      {
        targetPlatform: options3.targetPlatform ?? CURRENT_TARGET_PLATFORM,
        includePreRelease,
        versions,
        compatible: !!options3.compatible,
        productVersion: options3.productVersion ?? { version: this.productService.version, date: this.productService.date },
        isQueryForReleaseVersionFromPreReleaseVersion
      },
      extensionGalleryManifest,
      token
    );
    if (options3.source) {
      extensions.forEach((e4, index2) => setTelemetry(e4, index2, options3.source));
    }
    return extensions;
  }
  async getExtensionsUsingResourceApi(extensionInfos, options3, resourceApi, extensionGalleryManifest, token) {
    const result = [];
    const toQuery2 = [];
    const toFetchLatest = [];
    for (const extensionInfo of extensionInfos) {
      if (!EXTENSION_IDENTIFIER_REGEX.test(extensionInfo.id)) {
        continue;
      }
      if (extensionInfo.version || !extensionInfo.uuid) {
        toQuery2.push(extensionInfo);
      } else {
        toFetchLatest.push(extensionInfo);
      }
    }
    await Promise.all(toFetchLatest.map(async (extensionInfo) => {
      let galleryExtension;
      try {
        galleryExtension = await this.getLatestGalleryExtension(extensionInfo, options3, resourceApi, extensionGalleryManifest, token);
        if (isString(galleryExtension)) {
          if (galleryExtension === "LATEST_IS_OUTDATED") {
            this.logService.debug(`Skipping query API fallback for extension ${extensionInfo.id} because the latest gallery version is older than the current version`);
          } else {
            this.telemetryService.publicLog2("galleryService:fallbacktoquery", {
              extension: extensionInfo.id,
              preRelease: !!extensionInfo.preRelease,
              compatible: !!options3.compatible,
              errorCode: galleryExtension
            });
            toQuery2.push(extensionInfo);
          }
        } else {
          result.push(galleryExtension);
        }
      } catch (error) {
        if (error instanceof ExtensionGalleryError) {
          switch (error.code) {
            case "Offline" /* Offline */:
            case "Cancelled" /* Cancelled */:
            case "Timeout" /* Timeout */:
              throw error;
          }
        }
        this.logService.error(`Error while getting the latest version for the extension ${extensionInfo.id}.`, getErrorMessage(error));
        this.telemetryService.publicLog2("galleryService:fallbacktoquery", {
          extension: extensionInfo.id,
          preRelease: !!extensionInfo.preRelease,
          compatible: !!options3.compatible,
          errorCode: error instanceof ExtensionGalleryError ? error.code : "Unknown"
        });
        toQuery2.push(extensionInfo);
      }
    }));
    if (toQuery2.length) {
      const extensions = await this.getExtensionsUsingQueryApi(toQuery2, options3, extensionGalleryManifest, token);
      result.push(...extensions);
    }
    return result;
  }
  async getLatestGalleryExtension(extensionInfo, options3, resourceApi, extensionGalleryManifest, token) {
    const rawGalleryExtension = await this.getLatestRawGalleryExtensionWithFallback(extensionInfo, resourceApi, token);
    if (!rawGalleryExtension) {
      return "NOT_FOUND";
    }
    if (!Array.isArray(rawGalleryExtension.versions) || rawGalleryExtension.versions.some((version2) => !Array.isArray(version2.files))) {
      return "INVALID_RESPONSE";
    }
    const allTargetPlatforms = getAllTargetPlatforms(rawGalleryExtension);
    const rawGalleryExtensionVersion = await this.getValidRawGalleryExtensionVersionFromLatestVersions(rawGalleryExtension, rawGalleryExtension.versions, extensionInfo, options3, allTargetPlatforms);
    if (!rawGalleryExtensionVersion) {
      if (extensionInfo.currentVersion) {
        const latestVersion = rawGalleryExtension.versions.length > 0 ? rawGalleryExtension.versions[0].version : void 0;
        if (latestVersion && lt(latestVersion, extensionInfo.currentVersion)) {
          return "LATEST_IS_OUTDATED";
        }
      }
      return "NOT_COMPATIBLE";
    }
    return toExtension2(rawGalleryExtension, rawGalleryExtensionVersion, allTargetPlatforms, extensionGalleryManifest, this.productService);
  }
  async getValidRawGalleryExtensionVersionFromLatestVersions(rawGalleryExtension, latestVersions, extensionInfo, options3, allTargetPlatforms) {
    const targetPlatform = options3.targetPlatform ?? CURRENT_TARGET_PLATFORM;
    const latestExtensionVersionsForTargetPlatform = filterLatestExtensionVersionsForTargetPlatform(latestVersions, targetPlatform, allTargetPlatforms);
    const result = await this.getValidRawGalleryExtensionVersion(
      rawGalleryExtension,
      latestExtensionVersionsForTargetPlatform,
      {
        targetPlatform,
        compatible: !!options3.compatible,
        productVersion: options3.productVersion ?? {
          version: this.productService.version,
          date: this.productService.date
        },
        version: extensionInfo.preRelease ? 1 /* Prerelease */ : 0 /* Release */
      },
      allTargetPlatforms
    );
    if (!extensionInfo.preRelease) {
      return result;
    }
    const prereleaseVersion = result;
    const releaseVersion = await this.getValidRawGalleryExtensionVersion(
      rawGalleryExtension,
      latestExtensionVersionsForTargetPlatform,
      {
        targetPlatform,
        compatible: !!options3.compatible,
        productVersion: options3.productVersion ?? {
          version: this.productService.version,
          date: this.productService.date
        },
        version: 0 /* Release */
      },
      allTargetPlatforms
    );
    if (prereleaseVersion && releaseVersion) {
      return gt(releaseVersion.version, prereleaseVersion.version) ? releaseVersion : prereleaseVersion;
    }
    if (options3.compatible) {
      if (releaseVersion) {
        const anyPrereleaseVersion = await this.getValidRawGalleryExtensionVersion(
          rawGalleryExtension,
          latestExtensionVersionsForTargetPlatform,
          {
            targetPlatform,
            compatible: false,
            productVersion: options3.productVersion ?? {
              version: this.productService.version,
              date: this.productService.date
            },
            version: 1 /* Prerelease */
          },
          allTargetPlatforms
        );
        if (!anyPrereleaseVersion || gt(releaseVersion.version, anyPrereleaseVersion.version)) {
          return releaseVersion;
        }
      }
      return prereleaseVersion;
    }
    return prereleaseVersion ?? releaseVersion ?? null;
  }
  async getCompatibleExtension(extension, includePreRelease, targetPlatform, productVersion = { version: this.productService.version, date: this.productService.date }) {
    if (isNotWebExtensionInWebTargetPlatform(extension.allTargetPlatforms, targetPlatform)) {
      return null;
    }
    if (await this.isExtensionCompatible(extension, includePreRelease, targetPlatform)) {
      return extension;
    }
    if (this.allowedExtensionsService.isAllowed({ id: extension.identifier.id, publisherDisplayName: extension.publisherDisplayName }) !== true) {
      return null;
    }
    const result = await this.getExtensions([{
      ...extension.identifier,
      preRelease: includePreRelease,
      hasPreRelease: extension.hasPreReleaseVersion
    }], {
      compatible: true,
      productVersion,
      queryAllVersions: true,
      targetPlatform
    }, CancellationToken.None);
    return result[0] ?? null;
  }
  async isExtensionCompatible(extension, includePreRelease, targetPlatform, productVersion = { version: this.productService.version, date: this.productService.date }) {
    return this.isValidVersion(
      {
        id: extension.identifier.id,
        version: extension.version,
        isPreReleaseVersion: extension.properties.isPreReleaseVersion,
        targetPlatform: extension.properties.targetPlatform,
        manifestAsset: extension.assets.manifest,
        engine: extension.properties.engine,
        enabledApiProposals: extension.properties.enabledApiProposals
      },
      {
        targetPlatform,
        compatible: true,
        productVersion,
        version: includePreRelease ? 2 /* Latest */ : 0 /* Release */
      },
      extension.publisherDisplayName,
      extension.allTargetPlatforms
    );
  }
  async isValidVersion(extension, { targetPlatform, compatible, productVersion, version: version2 }, publisherDisplayName, allTargetPlatforms) {
    const hasPreRelease = hasPreReleaseForExtension(extension.id, this.productService);
    const excludeVersionRange = getExcludeVersionRangeForExtension(extension.id, this.productService);
    if (extension.isPreReleaseVersion && hasPreRelease === false) {
      return false;
    }
    if (excludeVersionRange && satisfies(extension.version, excludeVersionRange)) {
      return false;
    }
    if (isString(version2)) {
      if (extension.version !== version2) {
        return false;
      }
    } else if (version2 === 0 /* Release */ || version2 === 1 /* Prerelease */) {
      if (extension.isPreReleaseVersion !== (version2 === 1 /* Prerelease */)) {
        return false;
      }
    }
    if (targetPlatform && !isTargetPlatformCompatible(extension.targetPlatform, allTargetPlatforms, targetPlatform)) {
      return false;
    }
    if (compatible) {
      if (this.allowedExtensionsService.isAllowed({ id: extension.id, publisherDisplayName, version: extension.version, prerelease: extension.isPreReleaseVersion, targetPlatform: extension.targetPlatform }) !== true) {
        return false;
      }
      if (!await this.isEngineValid(extension.id, extension.version, extension.engine, extension.manifestAsset, productVersion)) {
        return false;
      }
    }
    return true;
  }
  async isEngineValid(extensionId, version2, engine, manifestAsset, productVersion) {
    if (!engine) {
      try {
        engine = await this.getEngine(extensionId, version2, manifestAsset);
      } catch (error) {
        this.logService.error(`Error while getting the engine for the version ${version2}.`, getErrorMessage(error));
        return false;
      }
    }
    if (!engine) {
      this.logService.error(`Missing engine for the extension ${extensionId} with version ${version2}`);
      return false;
    }
    return isEngineValid(engine, productVersion.version, productVersion.date);
  }
  async getEngine(extensionId, version2, manifestAsset) {
    if (!manifestAsset) {
      this.logService.error(`Missing engine and manifest asset for the extension ${extensionId} with version ${version2}`);
      return void 0;
    }
    try {
      this.telemetryService.publicLog2("galleryService:engineFallback", { extension: extensionId, extensionVersion: version2 });
      const headers = { "Accept-Encoding": "gzip" };
      const context2 = await this.getAsset(extensionId, manifestAsset, AssetType.Manifest, version2, "extensionGalleryService.engineVersion", { headers });
      const manifest = await asJson(context2);
      if (!manifest) {
        this.logService.error(`Manifest was not found for the extension ${extensionId} with version ${version2}`);
        return void 0;
      }
      return manifest.engines.vscode;
    } catch (error) {
      this.logService.error(`Error while getting the engine for the version ${version2}.`, getErrorMessage(error));
      return void 0;
    }
  }
  async query(options3, token) {
    const extensionGalleryManifest = await this.extensionGalleryManifestService.getExtensionGalleryManifest();
    if (!extensionGalleryManifest) {
      throw new Error("No extension gallery service configured.");
    }
    let text2 = options3.text || "";
    const pageSize = options3.pageSize ?? 50;
    let query = new Query().withPage(1, pageSize);
    if (text2) {
      text2 = text2.replace(/\bcategory:("([^"]*)"|([^"]\S*))(\s+|\b|$)/g, (_, quotedCategory, category9) => {
        query = query.withFilter("Category" /* Category */, category9 || quotedCategory);
        return "";
      });
      text2 = text2.replace(/\btag:("([^"]*)"|([^"]\S*))(\s+|\b|$)/g, (_, quotedTag, tag2) => {
        query = query.withFilter("Tag" /* Tag */, tag2 || quotedTag);
        return "";
      });
      text2 = text2.replace(/\bfeatured(\s+|\b|$)/g, () => {
        query = query.withFilter("Featured" /* Featured */);
        return "";
      });
      text2 = text2.trim();
      if (text2) {
        text2 = text2.length < 200 ? text2 : text2.substring(0, 200);
        query = query.withFilter("SearchText" /* SearchText */, text2);
      }
      if (extensionGalleryManifest.capabilities.extensionQuery.sorting?.some((c) => c.name === "NoneOrRelevance" /* NoneOrRelevance */)) {
        query = query.withSortBy("NoneOrRelevance" /* NoneOrRelevance */);
      }
    } else {
      if (extensionGalleryManifest.capabilities.extensionQuery.sorting?.some((c) => c.name === "InstallCount" /* InstallCount */)) {
        query = query.withSortBy("InstallCount" /* InstallCount */);
      }
    }
    if (options3.sortBy && extensionGalleryManifest.capabilities.extensionQuery.sorting?.some((c) => c.name === options3.sortBy)) {
      query = query.withSortBy(options3.sortBy);
    }
    if (typeof options3.sortOrder === "number") {
      query = query.withSortOrder(options3.sortOrder);
    }
    if (options3.source) {
      query = query.withSource(options3.source);
    }
    const runQuery = async (query2, token2) => {
      const { extensions: extensions2, total: total2 } = await this.queryGalleryExtensions(query2, { targetPlatform: CURRENT_TARGET_PLATFORM, compatible: false, includePreRelease: !!options3.includePreRelease, productVersion: options3.productVersion ?? { version: this.productService.version, date: this.productService.date } }, extensionGalleryManifest, token2);
      const result = [];
      let defaultChatAgentExtension;
      for (let index2 = 0; index2 < extensions2.length; index2++) {
        const extension = extensions2[index2];
        setTelemetry(extension, (query2.pageNumber - 1) * query2.pageSize + index2, options3.source);
        if (this.productService.defaultChatAgent && areSameExtensions(extension.identifier, { id: this.productService.defaultChatAgent.extensionId })) {
          defaultChatAgentExtension = extension;
        } else {
          result.push(extension);
        }
      }
      if (defaultChatAgentExtension) {
        result.push(defaultChatAgentExtension);
      }
      return { extensions: result, total: total2 };
    };
    const { extensions, total } = await runQuery(query, token);
    const getPage = async (pageIndex, ct) => {
      if (ct.isCancellationRequested) {
        throw new CancellationError();
      }
      const { extensions: extensions2 } = await runQuery(query.withPage(pageIndex + 1), ct);
      return extensions2;
    };
    return { firstPage: extensions, total, pageSize: query.pageSize, getPage };
  }
  async queryGalleryExtensions(query, criteria, extensionGalleryManifest, token) {
    const flags = query.flags;
    if (query.flags.includes("IncludeLatestVersionOnly" /* IncludeLatestVersionOnly */) && query.flags.includes("IncludeVersions" /* IncludeVersions */)) {
      query = query.withFlags(...query.flags.filter((flag) => flag !== "IncludeVersions" /* IncludeVersions */));
    }
    if (!query.flags.includes("IncludeLatestVersionOnly" /* IncludeLatestVersionOnly */) && !query.flags.includes("IncludeVersions" /* IncludeVersions */)) {
      query = query.withFlags(...query.flags, "IncludeLatestVersionOnly" /* IncludeLatestVersionOnly */);
    }
    if (criteria.versions?.length || criteria.isQueryForReleaseVersionFromPreReleaseVersion) {
      query = query.withFlags(...query.flags.filter((flag) => flag !== "IncludeLatestVersionOnly" /* IncludeLatestVersionOnly */), "IncludeVersions" /* IncludeVersions */);
    }
    query = query.withFlags(...query.flags, "IncludeAssetUri" /* IncludeAssetUri */, "IncludeCategoryAndTags" /* IncludeCategoryAndTags */, "IncludeFiles" /* IncludeFiles */, "IncludeStatistics" /* IncludeStatistics */, "IncludeVersionProperties" /* IncludeVersionProperties */);
    const { galleryExtensions: rawGalleryExtensions, total, context: context2 } = await this.queryRawGalleryExtensions(query, extensionGalleryManifest, token);
    const hasAllVersions = !query.flags.includes("IncludeLatestVersionOnly" /* IncludeLatestVersionOnly */);
    if (hasAllVersions) {
      const extensions = [];
      for (const rawGalleryExtension of rawGalleryExtensions) {
        const allTargetPlatforms = getAllTargetPlatforms(rawGalleryExtension);
        const extensionIdentifier = { id: getGalleryExtensionId(rawGalleryExtension.publisher.publisherName, rawGalleryExtension.extensionName), uuid: rawGalleryExtension.extensionId };
        const includePreRelease = isBoolean(criteria.includePreRelease) ? criteria.includePreRelease : !!criteria.includePreRelease.find((extensionIdentifierWithPreRelease) => areSameExtensions(extensionIdentifierWithPreRelease, extensionIdentifier))?.includePreRelease;
        const rawGalleryExtensionVersion = await this.getValidRawGalleryExtensionVersion(
          rawGalleryExtension,
          rawGalleryExtension.versions,
          {
            compatible: criteria.compatible,
            targetPlatform: criteria.targetPlatform,
            productVersion: criteria.productVersion,
            version: criteria.versions?.find((extensionIdentifierWithVersion) => areSameExtensions(extensionIdentifierWithVersion, extensionIdentifier))?.version ?? (includePreRelease ? 2 /* Latest */ : 0 /* Release */)
          },
          allTargetPlatforms
        );
        if (rawGalleryExtensionVersion) {
          extensions.push(toExtension2(rawGalleryExtension, rawGalleryExtensionVersion, allTargetPlatforms, extensionGalleryManifest, this.productService, context2));
        }
      }
      return { extensions, total };
    }
    const result = [];
    const needAllVersions = /* @__PURE__ */ new Map();
    for (let index2 = 0; index2 < rawGalleryExtensions.length; index2++) {
      const rawGalleryExtension = rawGalleryExtensions[index2];
      const extensionIdentifier = { id: getGalleryExtensionId(rawGalleryExtension.publisher.publisherName, rawGalleryExtension.extensionName), uuid: rawGalleryExtension.extensionId };
      const includePreRelease = isBoolean(criteria.includePreRelease) ? criteria.includePreRelease : !!criteria.includePreRelease.find((extensionIdentifierWithPreRelease) => areSameExtensions(extensionIdentifierWithPreRelease, extensionIdentifier))?.includePreRelease;
      const allTargetPlatforms = getAllTargetPlatforms(rawGalleryExtension);
      if (criteria.compatible) {
        if (isNotWebExtensionInWebTargetPlatform(allTargetPlatforms, criteria.targetPlatform)) {
          continue;
        }
        if (this.allowedExtensionsService.isAllowed({ id: extensionIdentifier.id, publisherDisplayName: rawGalleryExtension.publisher.displayName }) !== true) {
          continue;
        }
      }
      const rawGalleryExtensionVersion = await this.getValidRawGalleryExtensionVersion(
        rawGalleryExtension,
        rawGalleryExtension.versions,
        {
          compatible: criteria.compatible,
          targetPlatform: criteria.targetPlatform,
          productVersion: criteria.productVersion,
          version: criteria.versions?.find((extensionIdentifierWithVersion) => areSameExtensions(extensionIdentifierWithVersion, extensionIdentifier))?.version ?? (includePreRelease ? 2 /* Latest */ : 0 /* Release */)
        },
        allTargetPlatforms
      );
      const extension = rawGalleryExtensionVersion ? toExtension2(rawGalleryExtension, rawGalleryExtensionVersion, allTargetPlatforms, extensionGalleryManifest, this.productService, context2) : null;
      if (!extension || extension.properties.isPreReleaseVersion && (!includePreRelease || !extension.hasReleaseVersion) || !extension.properties.isPreReleaseVersion && extension.properties.targetPlatform !== criteria.targetPlatform && extension.hasPreReleaseVersion) {
        needAllVersions.set(rawGalleryExtension.extensionId, index2);
      } else {
        result.push([index2, extension]);
      }
    }
    if (needAllVersions.size) {
      const stopWatch = new StopWatch();
      const query2 = new Query().withFlags(...flags.filter((flag) => flag !== "IncludeLatestVersionOnly" /* IncludeLatestVersionOnly */), "IncludeVersions" /* IncludeVersions */).withPage(1, needAllVersions.size).withFilter("ExtensionId" /* ExtensionId */, ...needAllVersions.keys());
      const { extensions } = await this.queryGalleryExtensions(query2, criteria, extensionGalleryManifest, token);
      this.telemetryService.publicLog2("galleryService:additionalQuery", {
        duration: stopWatch.elapsed(),
        count: needAllVersions.size
      });
      for (const extension of extensions) {
        const index2 = needAllVersions.get(extension.identifier.uuid);
        result.push([index2, extension]);
      }
    }
    return { extensions: result.sort((a, b) => a[0] - b[0]).map(([, extension]) => extension), total };
  }
  async getValidRawGalleryExtensionVersion(rawGalleryExtension, versions, criteria, allTargetPlatforms) {
    const extensionIdentifier = { id: getGalleryExtensionId(rawGalleryExtension.publisher.publisherName, rawGalleryExtension.extensionName), uuid: rawGalleryExtension.extensionId };
    const rawGalleryExtensionVersions = sortExtensionVersions(versions, criteria.targetPlatform);
    if (criteria.compatible && isNotWebExtensionInWebTargetPlatform(allTargetPlatforms, criteria.targetPlatform)) {
      return null;
    }
    const version2 = isString(criteria.version) ? criteria.version : void 0;
    for (let index2 = 0; index2 < rawGalleryExtensionVersions.length; index2++) {
      const rawGalleryExtensionVersion = rawGalleryExtensionVersions[index2];
      if (criteria.compatible) {
        await this.setEngineIfNotExists(extensionIdentifier.id, rawGalleryExtensionVersion);
      }
      if (await this.isValidVersion(
        {
          id: extensionIdentifier.id,
          version: rawGalleryExtensionVersion.version,
          isPreReleaseVersion: isPreReleaseVersion(rawGalleryExtensionVersion),
          targetPlatform: getTargetPlatformForExtensionVersion(rawGalleryExtensionVersion),
          engine: getEngine(rawGalleryExtensionVersion),
          manifestAsset: getVersionAsset(rawGalleryExtensionVersion, AssetType.Manifest),
          enabledApiProposals: getEnabledApiProposals(rawGalleryExtensionVersion)
        },
        criteria,
        rawGalleryExtension.publisher.displayName,
        allTargetPlatforms
      )) {
        return rawGalleryExtensionVersion;
      }
      if (version2 && rawGalleryExtensionVersion.version === version2) {
        return null;
      }
    }
    if (version2 || criteria.compatible) {
      return null;
    }
    return rawGalleryExtension.versions[0];
  }
  async setEngineIfNotExists(extensionId, rawGalleryExtensionVersion) {
    if (getEngine(rawGalleryExtensionVersion)) {
      return;
    }
    try {
      const engine = await this.getEngine(extensionId, rawGalleryExtensionVersion.version, getVersionAsset(rawGalleryExtensionVersion, AssetType.Manifest));
      if (engine) {
        setEngine(rawGalleryExtensionVersion, engine);
      }
    } catch (error) {
      this.logService.error(`Error while getting the engine for the version ${rawGalleryExtensionVersion.version}.`, getErrorMessage(error));
    }
  }
  async queryRawGalleryExtensions(query, extensionGalleryManifest, token) {
    const extensionsQueryApi = getExtensionGalleryManifestResourceUri(extensionGalleryManifest, "ExtensionQueryService" /* ExtensionQueryService */);
    if (!extensionsQueryApi) {
      throw new Error("No extension gallery query service configured.");
    }
    query = query.withFlags(...query.flags, "ExcludeNonValidated" /* ExcludeNonValidated */).withFilter("Target" /* Target */, "Microsoft.VisualStudio.Code");
    const unpublishedFlag = extensionGalleryManifest.capabilities.extensionQuery.flags?.find((f) => f.name === "Unpublished" /* Unpublished */);
    if (unpublishedFlag) {
      query = query.withFilter("ExcludeWithFlags" /* ExcludeWithFlags */, String(unpublishedFlag.value));
    }
    const data = JSON.stringify({
      filters: [
        {
          criteria: query.criteria.reduce((criteria, c) => {
            const criterium = extensionGalleryManifest.capabilities.extensionQuery.filtering?.find((f) => f.name === c.filterType);
            if (criterium) {
              criteria.push({
                filterType: criterium.value,
                value: c.value
              });
            }
            return criteria;
          }, []),
          pageNumber: query.pageNumber,
          pageSize: query.pageSize,
          sortBy: extensionGalleryManifest.capabilities.extensionQuery.sorting?.find((s) => s.name === query.sortBy)?.value,
          sortOrder: query.sortOrder
        }
      ],
      assetTypes: query.assetTypes,
      flags: query.flags.reduce((flags, flag) => {
        const flagValue = extensionGalleryManifest.capabilities.extensionQuery.flags?.find((f) => f.name === flag);
        if (flagValue) {
          flags |= flagValue.value;
        }
        return flags;
      }, 0)
    });
    const commonHeaders = await this.commonHeadersPromise;
    const headers = {
      ...commonHeaders,
      "Content-Type": "application/json",
      "Accept": "application/json;api-version=3.0-preview.1",
      "Accept-Encoding": "gzip",
      "Content-Length": String(data.length)
    };
    const stopWatch = new StopWatch();
    let context2, errorCode, total = 0;
    try {
      context2 = await this.requestService.request({
        type: "POST",
        url: extensionsQueryApi,
        data,
        headers,
        callSite: "extensionGalleryService.queryRawGalleryExtensions"
      }, token);
      if (context2.res.statusCode && context2.res.statusCode >= 400 && context2.res.statusCode < 500) {
        return { galleryExtensions: [], total };
      }
      const result = await asJson(context2);
      if (result) {
        const r2 = result.results[0];
        const galleryExtensions = r2.extensions;
        const resultCount = r2.resultMetadata && r2.resultMetadata.filter((m) => m.metadataType === "ResultCount")[0];
        total = resultCount && resultCount.metadataItems.filter((i2) => i2.name === "TotalCount")[0].count || 0;
        return {
          galleryExtensions,
          total,
          context: context2.res.headers["activityid"] ? {
            [SEARCH_ACTIVITY_HEADER_NAME]: context2.res.headers["activityid"]
          } : {}
        };
      }
      return { galleryExtensions: [], total };
    } catch (e4) {
      if (isCancellationError(e4)) {
        errorCode = "Cancelled" /* Cancelled */;
        throw e4;
      } else {
        const errorMessage = getErrorMessage(e4);
        errorCode = isOfflineError(e4) ? "Offline" /* Offline */ : errorMessage.startsWith("XHR timeout") ? "Timeout" /* Timeout */ : "Failed" /* Failed */;
        throw new ExtensionGalleryError(errorMessage, errorCode);
      }
    } finally {
      this.telemetryService.publicLog2("galleryService:query", {
        filterTypes: query.criteria.map((criterium) => criterium.filterType),
        flags: query.flags,
        sortBy: query.sortBy,
        sortOrder: String(query.sortOrder),
        pageNumber: String(query.pageNumber),
        source: query.source,
        searchTextLength: query.searchText.length,
        requestBodySize: String(data.length),
        duration: stopWatch.elapsed(),
        success: !!context2 && isSuccess(context2),
        responseBodySize: context2?.res.headers["Content-Length"],
        statusCode: context2 ? String(context2.res.statusCode) : void 0,
        errorCode,
        count: String(total),
        server: this.getHeaderValue(context2?.res.headers, SERVER_HEADER_NAME),
        activityId: this.getHeaderValue(context2?.res.headers, ACTIVITY_HEADER_NAME),
        endToEndId: this.getHeaderValue(context2?.res.headers, END_END_ID_HEADER_NAME)
      });
    }
  }
  getHeaderValue(headers, name) {
    const headerValue = headers?.[name.toLowerCase()];
    const value2 = Array.isArray(headerValue) ? headerValue[0] : headerValue;
    return value2 ? new TelemetryTrustedValue(value2) : void 0;
  }
  async getLatestRawGalleryExtensionWithFallback(extensionInfo, resourceApi, token) {
    const [publisher, name] = extensionInfo.id.split(".");
    let errorCode;
    try {
      const uri4 = URI.parse(format22(resourceApi.uri, { publisher, name }));
      return await this.getLatestRawGalleryExtension(extensionInfo.id, uri4, token);
    } catch (error) {
      if (error instanceof ExtensionGalleryError) {
        errorCode = error.code;
        switch (error.code) {
          case "Offline" /* Offline */:
          case "Cancelled" /* Cancelled */:
          case "Timeout" /* Timeout */:
          case "ClientError" /* ClientError */:
            throw error;
        }
      } else {
        errorCode = "Unknown";
      }
      if (!resourceApi.fallback) {
        throw error;
      }
    }
    this.logService.error(`Error while getting the latest version for the extension ${extensionInfo.id} from ${resourceApi.uri}. Trying the fallback ${resourceApi.fallback}`, errorCode);
    try {
      const uri4 = URI.parse(format22(resourceApi.fallback, { publisher, name }));
      return await this.getLatestRawGalleryExtension(extensionInfo.id, uri4, token);
    } catch (error) {
      errorCode = error instanceof ExtensionGalleryError ? error.code : "Unknown";
      throw error;
    } finally {
      this.telemetryService.publicLog2("galleryService:fallbacktounpkg", {
        extension: extensionInfo.id,
        errorCode
      });
    }
  }
  async getLatestRawGalleryExtension(extension, uri4, token) {
    let context2;
    let errorCode;
    const stopWatch = new StopWatch();
    try {
      const commonHeaders = await this.commonHeadersPromise;
      const headers = {
        ...commonHeaders,
        "Content-Type": "application/json",
        "Accept": "application/json;api-version=7.2-preview",
        "Accept-Encoding": "gzip"
      };
      context2 = await this.requestService.request({
        type: "GET",
        url: uri4.toString(true),
        headers,
        timeout: this.getRequestTimeout(),
        callSite: "extensionGalleryService.getLatestRawGalleryExtension"
      }, token);
      if (context2.res.statusCode === 404) {
        errorCode = "NotFound";
        return null;
      }
      if (context2.res.statusCode && context2.res.statusCode !== 200) {
        throw new Error("Unexpected HTTP response: " + context2.res.statusCode);
      }
      const result = await asJson(context2);
      if (!result) {
        errorCode = "NoData";
      }
      return result;
    } catch (error) {
      let galleryErrorCode;
      if (isCancellationError(error)) {
        galleryErrorCode = "Cancelled" /* Cancelled */;
      } else if (isOfflineError(error)) {
        galleryErrorCode = "Offline" /* Offline */;
      } else if (getErrorMessage(error).startsWith("XHR timeout")) {
        galleryErrorCode = "Timeout" /* Timeout */;
      } else if (context2 && isClientError(context2)) {
        galleryErrorCode = "ClientError" /* ClientError */;
      } else if (context2 && isServerError(context2)) {
        galleryErrorCode = "ServerError" /* ServerError */;
      } else {
        galleryErrorCode = "Failed" /* Failed */;
      }
      errorCode = galleryErrorCode;
      throw new ExtensionGalleryError(error, galleryErrorCode);
    } finally {
      this.telemetryService.publicLog2("galleryService:getLatest", {
        extension,
        host: uri4.authority,
        duration: stopWatch.elapsed(),
        errorCode,
        statusCode: context2?.res.statusCode && context2?.res.statusCode !== 200 ? `${context2.res.statusCode}` : void 0,
        server: this.getHeaderValue(context2?.res.headers, SERVER_HEADER_NAME),
        activityId: this.getHeaderValue(context2?.res.headers, ACTIVITY_HEADER_NAME),
        endToEndId: this.getHeaderValue(context2?.res.headers, END_END_ID_HEADER_NAME)
      });
    }
  }
  async reportStatistic(publisher, name, version2, type) {
    if (isWeb) {
      this.logService.info("ExtensionGalleryService#reportStatistic: Skipped in web");
      return void 0;
    }
    const manifest = await this.extensionGalleryManifestService.getExtensionGalleryManifest();
    if (!manifest) {
      return void 0;
    }
    const resource = getExtensionGalleryManifestResourceUri(manifest, "ExtensionStatisticsUriTemplate" /* ExtensionStatisticsUri */);
    if (!resource) {
      return;
    }
    const url = format22(resource, { publisher, name, version: version2, statTypeName: type });
    const Accept = "*/*;api-version=4.0-preview.1";
    const commonHeaders = await this.commonHeadersPromise;
    const headers = { ...commonHeaders, Accept };
    try {
      await this.requestService.request({
        type: "POST",
        url,
        headers,
        callSite: "extensionGalleryService.reportStatistic"
      }, CancellationToken.None);
    } catch (error) {
    }
  }
  async download(extension, location2, operation) {
    this.logService.trace("ExtensionGalleryService#download", extension.identifier.id);
    const data = getGalleryExtensionTelemetryData(extension);
    const startTime = (/* @__PURE__ */ new Date()).getTime();
    const operationParam = operation === 2 /* Install */ ? "install" : operation === 3 /* Update */ ? "update" : "";
    const downloadAsset = operationParam ? {
      uri: `${extension.assets.download.uri}${URI.parse(extension.assets.download.uri).query ? "&" : "?"}${operationParam}=true`,
      fallbackUri: `${extension.assets.download.fallbackUri}${URI.parse(extension.assets.download.fallbackUri).query ? "&" : "?"}${operationParam}=true`
    } : extension.assets.download;
    const activityId = extension.queryContext?.[SEARCH_ACTIVITY_HEADER_NAME];
    const headers = activityId && typeof activityId === "string" ? { [SEARCH_ACTIVITY_HEADER_NAME]: activityId } : void 0;
    const context2 = await this.getAsset(extension.identifier.id, downloadAsset, AssetType.VSIX, extension.version, "extensionGalleryService.download", headers ? { headers } : void 0);
    try {
      await this.fileService.writeFile(location2, context2.stream);
    } catch (error) {
      try {
        await this.fileService.del(location2);
      } catch (e4) {
        this.logService.warn(`Error while deleting the file ${location2.toString()}`, getErrorMessage(e4));
      }
      throw new ExtensionGalleryError(getErrorMessage(error), "DownloadFailedWriting" /* DownloadFailedWriting */);
    }
    this.telemetryService.publicLog("galleryService:downloadVSIX", { ...data, duration: (/* @__PURE__ */ new Date()).getTime() - startTime });
  }
  async downloadSignatureArchive(extension, location2) {
    if (!extension.assets.signature) {
      throw new Error("No signature asset found");
    }
    this.logService.trace("ExtensionGalleryService#downloadSignatureArchive", extension.identifier.id);
    const context2 = await this.getAsset(extension.identifier.id, extension.assets.signature, AssetType.Signature, extension.version, "extensionGalleryService.signature");
    try {
      await this.fileService.writeFile(location2, context2.stream);
    } catch (error) {
      try {
        await this.fileService.del(location2);
      } catch (e4) {
        this.logService.warn(`Error while deleting the file ${location2.toString()}`, getErrorMessage(e4));
      }
      throw new ExtensionGalleryError(getErrorMessage(error), "DownloadFailedWriting" /* DownloadFailedWriting */);
    }
  }
  async getReadme(extension, token) {
    if (extension.assets.readme) {
      const context2 = await this.getAsset(extension.identifier.id, extension.assets.readme, AssetType.Details, extension.version, "extensionGalleryService.readme", {}, token);
      const content = await asTextOrError(context2);
      return content || "";
    }
    return "";
  }
  async getManifest(extension, token) {
    if (extension.assets.manifest) {
      const context2 = await this.getAsset(extension.identifier.id, extension.assets.manifest, AssetType.Manifest, extension.version, "extensionGalleryService.manifest", {}, token);
      const text2 = await asTextOrError(context2);
      return text2 ? JSON.parse(text2) : null;
    }
    return null;
  }
  async getCoreTranslation(extension, languageId) {
    const asset = extension.assets.coreTranslations.filter((t2) => t2[0] === languageId.toUpperCase())[0];
    if (asset) {
      const context2 = await this.getAsset(extension.identifier.id, asset[1], asset[0], extension.version, "extensionGalleryService.coreTranslation");
      const text2 = await asTextOrError(context2);
      return text2 ? JSON.parse(text2) : null;
    }
    return null;
  }
  async getChangelog(extension, token) {
    if (extension.assets.changelog) {
      const context2 = await this.getAsset(extension.identifier.id, extension.assets.changelog, AssetType.Changelog, extension.version, "extensionGalleryService.changelog", {}, token);
      const content = await asTextOrError(context2);
      return content || "";
    }
    return "";
  }
  async getAllVersions(extensionIdentifier) {
    return this.getVersions(extensionIdentifier);
  }
  async getAllCompatibleVersions(extensionIdentifier, includePreRelease, targetPlatform) {
    return this.getVersions(extensionIdentifier, { version: includePreRelease ? 2 /* Latest */ : 0 /* Release */, targetPlatform });
  }
  async getVersions(extensionIdentifier, onlyCompatible) {
    const extensionGalleryManifest = await this.extensionGalleryManifestService.getExtensionGalleryManifest();
    if (!extensionGalleryManifest) {
      throw new Error("No extension gallery service configured.");
    }
    let query = new Query().withFlags("IncludeVersions" /* IncludeVersions */, "IncludeCategoryAndTags" /* IncludeCategoryAndTags */, "IncludeFiles" /* IncludeFiles */, "IncludeVersionProperties" /* IncludeVersionProperties */).withPage(1, 1);
    if (extensionIdentifier.uuid) {
      query = query.withFilter("ExtensionId" /* ExtensionId */, extensionIdentifier.uuid);
    } else {
      query = query.withFilter("ExtensionName" /* ExtensionName */, extensionIdentifier.id);
    }
    const { galleryExtensions } = await this.queryRawGalleryExtensions(query, extensionGalleryManifest, CancellationToken.None);
    if (!galleryExtensions.length) {
      return [];
    }
    const allTargetPlatforms = getAllTargetPlatforms(galleryExtensions[0]);
    if (onlyCompatible && isNotWebExtensionInWebTargetPlatform(allTargetPlatforms, onlyCompatible.targetPlatform)) {
      return [];
    }
    const versions = [];
    const productVersion = { version: this.productService.version, date: this.productService.date };
    await Promise.all(galleryExtensions[0].versions.map(async (version2) => {
      try {
        if (await this.isValidVersion(
          {
            id: extensionIdentifier.id,
            version: version2.version,
            isPreReleaseVersion: isPreReleaseVersion(version2),
            targetPlatform: getTargetPlatformForExtensionVersion(version2),
            engine: getEngine(version2),
            manifestAsset: getVersionAsset(version2, AssetType.Manifest),
            enabledApiProposals: getEnabledApiProposals(version2)
          },
          {
            compatible: !!onlyCompatible,
            productVersion,
            targetPlatform: onlyCompatible?.targetPlatform,
            version: onlyCompatible?.version ?? version2.version
          },
          galleryExtensions[0].publisher.displayName,
          allTargetPlatforms
        )) {
          versions.push(version2);
        }
      } catch (error) {
      }
    }));
    const result = [];
    const seen = /* @__PURE__ */ new Map();
    for (const version2 of sortExtensionVersions(versions, onlyCompatible?.targetPlatform ?? CURRENT_TARGET_PLATFORM)) {
      const index2 = seen.get(version2.version);
      const existing = index2 !== void 0 ? result[index2] : void 0;
      const targetPlatform = getTargetPlatformForExtensionVersion(version2);
      if (!existing) {
        seen.set(version2.version, result.length);
        result.push({ version: version2.version, date: version2.lastUpdated, isPreReleaseVersion: isPreReleaseVersion(version2), targetPlatforms: [targetPlatform] });
      } else {
        existing.targetPlatforms.push(targetPlatform);
      }
    }
    return result;
  }
  async getAsset(extension, asset, assetType, extensionVersion, callSite, options3 = {}, token = CancellationToken.None) {
    const commonHeaders = await this.commonHeadersPromise;
    const baseOptions = { type: "GET" };
    const headers = { ...commonHeaders, ...options3.headers || {} };
    options3 = { ...options3, ...baseOptions, headers };
    const url = asset.uri;
    const fallbackUrl = asset.fallbackUri;
    const firstOptions = { ...options3, url, timeout: this.getRequestTimeout(), callSite };
    let context2;
    try {
      context2 = await this.requestService.request(firstOptions, token);
      if (context2.res.statusCode === 200) {
        return context2;
      }
      const message = await asTextOrError(context2);
      throw new Error(`Expected 200, got back ${context2.res.statusCode} instead.

${message}`);
    } catch (err) {
      if (isCancellationError(err)) {
        throw err;
      }
      const message = getErrorMessage(err);
      this.telemetryService.publicLog2("galleryService:cdnFallback", {
        extension,
        assetType,
        message,
        extensionVersion,
        server: this.getHeaderValue(context2?.res.headers, SERVER_HEADER_NAME),
        activityId: this.getHeaderValue(context2?.res.headers, ACTIVITY_HEADER_NAME),
        endToEndId: this.getHeaderValue(context2?.res.headers, END_END_ID_HEADER_NAME)
      });
      const fallbackOptions = { ...options3, url: fallbackUrl, timeout: this.getRequestTimeout(), callSite: `${callSite}.fallback` };
      return this.requestService.request(fallbackOptions, token);
    }
  }
  async getExtensionsControlManifest() {
    const manifest = await this.extensionGalleryManifestService.getExtensionGalleryManifest();
    if (!manifest) {
      throw new Error("No extension gallery service configured.");
    }
    if (!this.extensionsControlUrl) {
      return { malicious: [], deprecated: {}, search: [], autoUpdate: {} };
    }
    const context2 = await this.requestService.request({
      type: "GET",
      url: this.extensionsControlUrl,
      timeout: this.getRequestTimeout(),
      callSite: "extensionGalleryService.getExtensionsControlManifest"
    }, CancellationToken.None);
    if (context2.res.statusCode !== 200) {
      throw new Error("Could not get extensions report.");
    }
    const result = await asJson(context2);
    const malicious = [];
    const deprecated = {};
    const search2 = [];
    const autoUpdate = result?.autoUpdate ?? {};
    if (result) {
      for (const id2 of result.malicious) {
        if (!isString(id2)) {
          continue;
        }
        const publisherOrExtension = EXTENSION_IDENTIFIER_REGEX.test(id2) ? { id: id2 } : id2;
        malicious.push({ extensionOrPublisher: publisherOrExtension, learnMoreLink: result.learnMoreLinks?.[id2] });
      }
      if (result.migrateToPreRelease) {
        for (const [unsupportedPreReleaseExtensionId, preReleaseExtensionInfo] of Object.entries(result.migrateToPreRelease)) {
          if (!preReleaseExtensionInfo.engine || isEngineValid(preReleaseExtensionInfo.engine, this.productService.version, this.productService.date)) {
            deprecated[unsupportedPreReleaseExtensionId.toLowerCase()] = {
              disallowInstall: true,
              extension: {
                id: preReleaseExtensionInfo.id,
                displayName: preReleaseExtensionInfo.displayName,
                autoMigrate: { storage: !!preReleaseExtensionInfo.migrateStorage },
                preRelease: true
              }
            };
          }
        }
      }
      if (result.deprecated) {
        for (const [deprecatedExtensionId, deprecationInfo] of Object.entries(result.deprecated)) {
          if (deprecationInfo) {
            deprecated[deprecatedExtensionId.toLowerCase()] = isBoolean(deprecationInfo) ? {} : deprecationInfo;
          }
        }
      }
      if (result.search) {
        for (const s of result.search) {
          search2.push(s);
        }
      }
    }
    if (this.productService.defaultChatAgent) {
      deprecated[this.productService.defaultChatAgent.extensionId.toLowerCase()] = {
        disallowInstall: true,
        extension: {
          id: this.productService.defaultChatAgent.chatExtensionId,
          displayName: "GitHub Copilot Chat",
          autoMigrate: { storage: false, donotDisable: true },
          preRelease: this.productService.quality !== "stable"
        }
      };
    }
    return { malicious, deprecated, search: search2, autoUpdate };
  }
  getRequestTimeout() {
    const configuredTimeout = this.configurationService.getValue(ExtensionRequestsTimeoutConfigKey);
    return isNumber(configuredTimeout) && configuredTimeout >= 0 ? configuredTimeout : 6e4;
  }
};

AbstractExtensionGalleryService = __decorateClass([
  __decorateParam(1, IRequestService),
  __decorateParam(2, ILogService),
  __decorateParam(3, IEnvironmentService),
  __decorateParam(4, ITelemetryService),
  __decorateParam(5, IFileService),
  __decorateParam(6, IProductService),
  __decorateParam(7, IConfigurationService),
  __decorateParam(8, IAllowedExtensionsService),
  __decorateParam(9, IExtensionGalleryManifestService)
], AbstractExtensionGalleryService);

var ExtensionGalleryService = class extends AbstractExtensionGalleryService {
  constructor(storageService, requestService, logService, environmentService, telemetryService, fileService, productService, configurationService, allowedExtensionsService, extensionGalleryManifestService) {
    super(storageService, requestService, logService, environmentService, telemetryService, fileService, productService, configurationService, allowedExtensionsService, extensionGalleryManifestService);
  }
};

ExtensionGalleryService = __decorateClass([
  __decorateParam(0, IStorageService),
  __decorateParam(1, IRequestService),
  __decorateParam(2, ILogService),
  __decorateParam(3, IEnvironmentService),
  __decorateParam(4, ITelemetryService),
  __decorateParam(5, IFileService),
  __decorateParam(6, IProductService),
  __decorateParam(7, IConfigurationService),
  __decorateParam(8, IAllowedExtensionsService),
  __decorateParam(9, IExtensionGalleryManifestService)
], ExtensionGalleryService);

var ExtensionGalleryServiceWithNoStorageService = class extends AbstractExtensionGalleryService {
  constructor(requestService, logService, environmentService, telemetryService, fileService, productService, configurationService, allowedExtensionsService, extensionGalleryManifestService) {
    super(void 0, requestService, logService, environmentService, telemetryService, fileService, productService, configurationService, allowedExtensionsService, extensionGalleryManifestService);
  }
};

ExtensionGalleryServiceWithNoStorageService = __decorateClass([
  __decorateParam(0, IRequestService),
  __decorateParam(1, ILogService),
  __decorateParam(2, IEnvironmentService),
  __decorateParam(3, ITelemetryService),
  __decorateParam(4, IFileService),
  __decorateParam(5, IProductService),
  __decorateParam(6, IConfigurationService),
  __decorateParam(7, IAllowedExtensionsService),
  __decorateParam(8, IExtensionGalleryManifestService)
], ExtensionGalleryServiceWithNoStorageService);
export { getStatistic, getCoreTranslationAssets, getRepositoryAsset, getDownloadAsset, getVersionAsset, getExtensions, getEngine, setEngine, isPreReleaseVersion, hasPreReleaseForExtension, getExcludeVersionRangeForExtension, isPrivateExtension, executesCode, getEnabledApiProposals, getLocalizedLanguages, getSponsorLink, getSupportLink, getIsPreview, getTargetPlatformForExtensionVersion, getAllTargetPlatforms, sortExtensionVersions, filterLatestExtensionVersionsForTargetPlatform, setTelemetry, toExtension2, CURRENT_TARGET_PLATFORM, SEARCH_ACTIVITY_HEADER_NAME, ACTIVITY_HEADER_NAME, SERVER_HEADER_NAME, END_END_ID_HEADER_NAME, AssetType, PropertyType, DefaultPageSize, DefaultQueryState, Query, AbstractExtensionGalleryService, ExtensionGalleryService, ExtensionGalleryServiceWithNoStorageService };
