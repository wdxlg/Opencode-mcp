// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/mcp/common/mcpGalleryManifestService.ts
import { Disposable } from "./module-0012.mjs";
import { Event2 } from "./module-0017.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { IRequestService, isSuccess } from "./module-0947.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IProductService } from "./module-0875.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/platform/mcp/common/mcpGalleryManifestService.ts
var SUPPORTED_VERSIONS = [
  "v0.1",
  "v0"
];

var McpGalleryManifestService = class extends Disposable {
  constructor(productService, requestService, logService) {
    super();
    this.productService = productService;
    this.requestService = requestService;
    this.logService = logService;
    this.onDidChangeMcpGalleryManifest = Event2.None;
    this.onDidChangeMcpGalleryManifestStatus = Event2.None;
    this.versionByUrl = /* @__PURE__ */ new Map();
  }
  get mcpGalleryManifestStatus() {
    return !!this.productService.mcpGallery?.serviceUrl ? "available" /* Available */ : "unavailable" /* Unavailable */;
  }
  async getMcpGalleryManifest() {
    if (!this.productService.mcpGallery) {
      return null;
    }
    return this.createMcpGalleryManifest(this.productService.mcpGallery.serviceUrl, SUPPORTED_VERSIONS[0]);
  }
  async createMcpGalleryManifest(url, version2) {
    url = url.endsWith("/") ? url.slice(0, -1) : url;
    if (!version2) {
      let versionPromise = this.versionByUrl.get(url);
      if (!versionPromise) {
        this.versionByUrl.set(url, versionPromise = this.getVersion(url));
      }
      version2 = await versionPromise;
    }
    const isProductGalleryUrl = this.productService.mcpGallery?.serviceUrl === url;
    const serversUrl = `${url}/${version2}/servers`;
    const resources = [
      {
        id: serversUrl,
        type: "McpServersQueryService" /* McpServersQueryService */
      },
      {
        id: `${serversUrl}/{name}/versions/{version}`,
        type: "McpServerVersionUriTemplate" /* McpServerVersionUri */
      },
      {
        id: `${serversUrl}/{name}/versions/latest`,
        type: "McpServerLatestVersionUriTemplate" /* McpServerLatestVersionUri */
      }
    ];
    if (isProductGalleryUrl) {
      resources.push({
        id: `${serversUrl}/by-name/{name}`,
        type: "McpServerNamedResourceUriTemplate" /* McpServerNamedResourceUri */
      });
      resources.push({
        id: this.productService.mcpGallery.itemWebUrl,
        type: "McpServerWebUriTemplate" /* McpServerWebUri */
      });
      resources.push({
        id: this.productService.mcpGallery.publisherUrl,
        type: "PublisherUriTemplate" /* PublisherUriTemplate */
      });
      resources.push({
        id: this.productService.mcpGallery.supportUrl,
        type: "ContactSupportUri" /* ContactSupportUri */
      });
      resources.push({
        id: this.productService.mcpGallery.supportUrl,
        type: "ContactSupportUri" /* ContactSupportUri */
      });
      resources.push({
        id: this.productService.mcpGallery.privacyPolicyUrl,
        type: "PrivacyPolicyUri" /* PrivacyPolicyUri */
      });
      resources.push({
        id: this.productService.mcpGallery.termsOfServiceUrl,
        type: "TermsOfServiceUri" /* TermsOfServiceUri */
      });
      resources.push({
        id: this.productService.mcpGallery.reportUrl,
        type: "ReportUri" /* ReportUri */
      });
    }
    if (version2 === "v0") {
      resources.push({
        id: `${serversUrl}/{id}`,
        type: "McpServerIdUriTemplate" /* McpServerIdUri */
      });
    }
    return {
      version: version2,
      url,
      resources
    };
  }
  async getVersion(url) {
    for (const version2 of SUPPORTED_VERSIONS) {
      if (await this.checkVersion(url, version2)) {
        return version2;
      }
    }
    return SUPPORTED_VERSIONS[0];
  }
  async checkVersion(url, version2) {
    try {
      const context2 = await this.requestService.request({
        type: "GET",
        url: `${url}/${version2}/servers?limit=1`,
        callSite: "mcpGalleryManifestService.checkVersion"
      }, CancellationToken.None);
      if (isSuccess(context2)) {
        return true;
      }
      this.logService.info(`The service at ${url} does not support version ${version2}. Service returned status ${context2.res.statusCode}.`);
    } catch (error) {
      this.logService.error(error);
    }
    return false;
  }
};

McpGalleryManifestService = __decorateClass([
  __decorateParam(0, IProductService),
  __decorateParam(1, IRequestService),
  __decorateParam(2, ILogService)
], McpGalleryManifestService);
export { SUPPORTED_VERSIONS, McpGalleryManifestService };
