// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/url/browser/trustedDomainsValidator.ts
import { Schemas, matchesScheme } from "./module-0033.mjs";
import { URI } from "./module-0032.mjs";
import { severity_default } from "./module-0266.mjs";
import { localize } from "./module-0001.mjs";
import { configureOpenerTrustedDomainsHandler, readStaticTrustedDomains } from "./module-1288.mjs";
import { isURLDomainTrusted } from "./module-1239.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IProductService } from "./module-0873.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IClipboardService } from "./module-0487.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IWorkspaceTrustManagementService } from "./module-0854.mjs";
import { ITrustedDomainService } from "./module-1289.mjs";


// src/vs/workbench/contrib/url/browser/trustedDomainsValidator.ts
var OpenerValidatorContributions = class {
  constructor(_openerService, _storageService, _dialogService, _productService, _quickInputService, _editorService, _clipboardService, _telemetryService, _instantiationService, _configurationService, _workspaceTrustService, _trustedDomainService) {
    this._openerService = _openerService;
    this._storageService = _storageService;
    this._dialogService = _dialogService;
    this._productService = _productService;
    this._quickInputService = _quickInputService;
    this._editorService = _editorService;
    this._clipboardService = _clipboardService;
    this._telemetryService = _telemetryService;
    this._instantiationService = _instantiationService;
    this._configurationService = _configurationService;
    this._workspaceTrustService = _workspaceTrustService;
    this._trustedDomainService = _trustedDomainService;
    this._openerService.registerValidator({ shouldOpen: (uri5, options3) => this.validateLink(uri5, options3) });
  }
  async validateLink(resource, openOptions) {
    if (!matchesScheme(resource, Schemas.http) && !matchesScheme(resource, Schemas.https)) {
      return true;
    }
    if (openOptions?.fromWorkspace && this._workspaceTrustService.isWorkspaceTrusted() && !this._configurationService.getValue("workbench.trustedDomains.promptInTrustedWorkspace")) {
      return true;
    }
    const originalResource = resource;
    let resourceUri;
    if (typeof resource === "string") {
      resourceUri = URI.parse(resource);
    } else {
      resourceUri = resource;
    }
    if (this._trustedDomainService.isValid(resourceUri)) {
      return true;
    } else {
      const { scheme, authority, path, query, fragment } = resourceUri;
      let formattedLink = `${scheme}://${authority}${path}`;
      const linkTail = `${query ? "?" + query : ""}${fragment ? "#" + fragment : ""}`;
      const remainingLength = Math.max(0, 60 - formattedLink.length);
      const linkTailLengthToKeep = Math.min(Math.max(5, remainingLength), linkTail.length);
      if (linkTailLengthToKeep === linkTail.length) {
        formattedLink += linkTail;
      } else {
        formattedLink += linkTail.charAt(0) + "..." + linkTail.substring(linkTail.length - linkTailLengthToKeep + 1);
      }
      const { result } = await this._dialogService.prompt({
        type: severity_default.Info,
        message: localize(
          21583,
          null,
          this._productService.nameShort
        ),
        detail: typeof originalResource === "string" ? originalResource : formattedLink,
        buttons: [
          {
            label: localize(21582, null),
            run: () => true
          },
          {
            label: localize(21581, null),
            run: () => {
              this._clipboardService.writeText(typeof originalResource === "string" ? originalResource : resourceUri.toString(true));
              return false;
            }
          },
          {
            label: localize(21580, null),
            run: async () => {
              const { trustedDomains } = this._instantiationService.invokeFunction(readStaticTrustedDomains);
              const domainToOpen = `${scheme}://${authority}`;
              const pickedDomains = await configureOpenerTrustedDomainsHandler(
                trustedDomains,
                domainToOpen,
                resourceUri,
                this._quickInputService,
                this._storageService,
                this._editorService,
                this._telemetryService
              );
              if (pickedDomains.indexOf("*") !== -1) {
                return true;
              }
              if (isURLDomainTrusted(resourceUri, pickedDomains)) {
                return true;
              }
              return false;
            }
          }
        ],
        cancelButton: {
          run: () => false
        }
      });
      return result;
    }
  }
};

OpenerValidatorContributions = __decorateClass([
  __decorateParam(0, IOpenerService),
  __decorateParam(1, IStorageService),
  __decorateParam(2, IDialogService),
  __decorateParam(3, IProductService),
  __decorateParam(4, IQuickInputService),
  __decorateParam(5, IEditorService),
  __decorateParam(6, IClipboardService),
  __decorateParam(7, ITelemetryService),
  __decorateParam(8, IInstantiationService),
  __decorateParam(9, IConfigurationService),
  __decorateParam(10, IWorkspaceTrustManagementService),
  __decorateParam(11, ITrustedDomainService)
], OpenerValidatorContributions);
export { OpenerValidatorContributions };
