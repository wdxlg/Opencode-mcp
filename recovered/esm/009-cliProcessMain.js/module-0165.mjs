// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/node/cliProcessMain.js
// Original module marker: src/vs/platform/extensionManagement/common/extensionGalleryManifestService.ts
import { Disposable } from "./module-0011.mjs";
import { Event } from "./module-0017.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IProductService } from "./module-0074.mjs";


// src/vs/platform/extensionManagement/common/extensionGalleryManifestService.ts
var ExtensionGalleryManifestService = class extends Disposable {
  constructor(productService) {
    super();
    this.productService = productService;
    this.onDidChangeExtensionGalleryManifest = Event.None;
    this.onDidChangeExtensionGalleryManifestStatus = Event.None;
  }
  get extensionGalleryManifestStatus() {
    return !!this.productService.extensionsGallery?.serviceUrl ? "available" /* Available */ : "unavailable" /* Unavailable */;
  }
  async getExtensionGalleryManifest() {
    const extensionsGallery = this.productService.extensionsGallery;
    if (!extensionsGallery?.serviceUrl) {
      return null;
    }
    const resources = [
      {
        id: `${extensionsGallery.serviceUrl}/extensionquery`,
        type: "ExtensionQueryService" /* ExtensionQueryService */
      },
      {
        id: `${extensionsGallery.serviceUrl}/vscode/{publisher}/{name}/latest`,
        type: "ExtensionLatestVersionUriTemplate" /* ExtensionLatestVersionUri */
      },
      {
        id: `${extensionsGallery.serviceUrl}/publishers/{publisher}/extensions/{name}/{version}/stats?statType={statTypeName}`,
        type: "ExtensionStatisticsUriTemplate" /* ExtensionStatisticsUri */
      }
    ];
    if (extensionsGallery.publisherUrl) {
      resources.push({
        id: `${extensionsGallery.publisherUrl}/{publisher}`,
        type: "PublisherViewUriTemplate" /* PublisherViewUri */
      });
    }
    if (extensionsGallery.itemUrl) {
      resources.push({
        id: `${extensionsGallery.itemUrl}?itemName={publisher}.{name}`,
        type: "ExtensionDetailsViewUriTemplate" /* ExtensionDetailsViewUri */
      });
      resources.push({
        id: `${extensionsGallery.itemUrl}?itemName={publisher}.{name}&ssr=false#review-details`,
        type: "ExtensionRatingViewUriTemplate" /* ExtensionRatingViewUri */
      });
    }
    if (extensionsGallery.resourceUrlTemplate) {
      resources.push({
        id: extensionsGallery.resourceUrlTemplate,
        type: "ExtensionResourceUriTemplate" /* ExtensionResourceUri */
      });
    }
    const filtering = [
      {
        name: "Tag" /* Tag */,
        value: 1
      },
      {
        name: "ExtensionId" /* ExtensionId */,
        value: 4
      },
      {
        name: "Category" /* Category */,
        value: 5
      },
      {
        name: "ExtensionName" /* ExtensionName */,
        value: 7
      },
      {
        name: "Target" /* Target */,
        value: 8
      },
      {
        name: "Featured" /* Featured */,
        value: 9
      },
      {
        name: "SearchText" /* SearchText */,
        value: 10
      },
      {
        name: "ExcludeWithFlags" /* ExcludeWithFlags */,
        value: 12
      }
    ];
    const sorting = [
      {
        name: "NoneOrRelevance" /* NoneOrRelevance */,
        value: 0
      },
      {
        name: "LastUpdatedDate" /* LastUpdatedDate */,
        value: 1
      },
      {
        name: "Title" /* Title */,
        value: 2
      },
      {
        name: "PublisherName" /* PublisherName */,
        value: 3
      },
      {
        name: "InstallCount" /* InstallCount */,
        value: 4
      },
      {
        name: "AverageRating" /* AverageRating */,
        value: 6
      },
      {
        name: "PublishedDate" /* PublishedDate */,
        value: 10
      },
      {
        name: "WeightedRating" /* WeightedRating */,
        value: 12
      }
    ];
    const flags = [
      {
        name: "None" /* None */,
        value: 0
      },
      {
        name: "IncludeVersions" /* IncludeVersions */,
        value: 1
      },
      {
        name: "IncludeFiles" /* IncludeFiles */,
        value: 2
      },
      {
        name: "IncludeCategoryAndTags" /* IncludeCategoryAndTags */,
        value: 4
      },
      {
        name: "IncludeSharedAccounts" /* IncludeSharedAccounts */,
        value: 8
      },
      {
        name: "IncludeVersionProperties" /* IncludeVersionProperties */,
        value: 16
      },
      {
        name: "ExcludeNonValidated" /* ExcludeNonValidated */,
        value: 32
      },
      {
        name: "IncludeInstallationTargets" /* IncludeInstallationTargets */,
        value: 64
      },
      {
        name: "IncludeAssetUri" /* IncludeAssetUri */,
        value: 128
      },
      {
        name: "IncludeStatistics" /* IncludeStatistics */,
        value: 256
      },
      {
        name: "IncludeLatestVersionOnly" /* IncludeLatestVersionOnly */,
        value: 512
      },
      {
        name: "Unpublished" /* Unpublished */,
        value: 4096
      },
      {
        name: "IncludeNameConflictInfo" /* IncludeNameConflictInfo */,
        value: 32768
      },
      {
        name: "IncludeLatestPrereleaseAndStableVersionOnly" /* IncludeLatestPrereleaseAndStableVersionOnly */,
        value: 65536
      }
    ];
    return {
      version: "",
      resources,
      capabilities: {
        extensionQuery: {
          filtering,
          sorting,
          flags
        },
        signing: {
          allPublicRepositorySigned: true
        }
      }
    };
  }
};

ExtensionGalleryManifestService = __decorateClass([
  __decorateParam(0, IProductService)
], ExtensionGalleryManifestService);
export { ExtensionGalleryManifestService };
