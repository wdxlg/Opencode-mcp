// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/extensions/common/extensionsProposedApi.ts
import { ExtensionIdentifier } from "./module-0688.mjs";
import { allApiProposals } from "./module-0877.mjs";
import { isNonEmptyArray } from "./module-0007.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0095.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { IProductService } from "./module-0875.mjs";
import { Disposable } from "./module-0012.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions11 } from "./module-0879.mjs";
import { localize } from "./module-0001.mjs";
import { SyncDescriptor } from "./module-0134.mjs";


// src/vs/workbench/services/extensions/common/extensionsProposedApi.ts
var ExtensionsProposedApi = class {
  constructor(_logService, _environmentService, productService) {
    this._logService = _logService;
    this._environmentService = _environmentService;
    this._envEnabledExtensions = new Set((_environmentService.extensionEnabledProposedApi ?? []).map((id2) => ExtensionIdentifier.toKey(id2)));
    this._envEnablesProposedApiForAll = !_environmentService.isBuilt || // always allow proposed API when running out of sources
    _environmentService.isExtensionDevelopment && productService.quality !== "stable" || // do not allow proposed API against stable builds when developing an extension
    this._envEnabledExtensions.size === 0 && Array.isArray(_environmentService.extensionEnabledProposedApi);
    this._productEnabledExtensions = /* @__PURE__ */ new Map();
    if (productService.extensionEnabledApiProposals) {
      for (const [k, value2] of Object.entries(productService.extensionEnabledApiProposals)) {
        const key3 = ExtensionIdentifier.toKey(k);
        const proposalNames = value2.filter((name) => {
          if (!allApiProposals[name]) {
            _logService.warn(`Via 'product.json#extensionEnabledApiProposals' extension '${key3}' wants API proposal '${name}' but that proposal DOES NOT EXIST. Likely, the proposal has been finalized (check 'vscode.d.ts') or was abandoned.`);
            return false;
          }
          return true;
        });
        this._productEnabledExtensions.set(key3, proposalNames);
      }
    }
  }
  updateEnabledApiProposals(extensions) {
    for (const extension of extensions) {
      this.doUpdateEnabledApiProposals(extension);
    }
  }
  doUpdateEnabledApiProposals(extension) {
    const key3 = ExtensionIdentifier.toKey(extension.identifier);
    if (isNonEmptyArray(extension.enabledApiProposals)) {
      extension.enabledApiProposals = extension.enabledApiProposals.filter((name) => {
        const result = Boolean(allApiProposals[name]);
        if (!result) {
          this._logService.error(`Extension '${key3}' wants API proposal '${name}' but that proposal DOES NOT EXIST. Likely, the proposal has been finalized (check 'vscode.d.ts') or was abandoned.`);
        }
        return result;
      });
    }
    if (this._productEnabledExtensions.has(key3)) {
      const productEnabledProposals = this._productEnabledExtensions.get(key3);
      const productSet = new Set(productEnabledProposals);
      const extensionSet = new Set(extension.enabledApiProposals);
      const diff4 = new Set([...extensionSet].filter((a) => !productSet.has(a)));
      if (diff4.size > 0) {
        this._logService.error(`Extension '${key3}' appears in product.json but enables LESS API proposals than the extension wants.
package.json (LOSES): ${[...extensionSet].join("\n")}
product.json (WINS): ${[...productSet].join("\n")}
DELTA: ${[...diff4].join("\n")}`);
        if (this._environmentService.isExtensionDevelopment) {
          this._logService.error(`Proceeding with EXTRA proposals (${[...diff4].join(", ")}) because extension is in development mode. Still, this EXTENSION WILL BE BROKEN unless product.json is updated.`);
          productEnabledProposals.push(...diff4);
        }
      }
      extension.enabledApiProposals = productEnabledProposals;
      return;
    }
    if (this._envEnablesProposedApiForAll || this._envEnabledExtensions.has(key3)) {
      return;
    }
    if (!extension.isBuiltin && isNonEmptyArray(extension.enabledApiProposals)) {
      this._logService.error(`Extension '${extension.identifier.value} CANNOT USE these API proposals '${extension.enabledApiProposals?.join(", ") || "*"}'. You MUST start in extension development mode or use the --enable-proposed-api command line flag`);
      extension.enabledApiProposals = [];
    }
  }
};

ExtensionsProposedApi = __decorateClass([
  __decorateParam(0, ILogService),
  __decorateParam(1, IWorkbenchEnvironmentService),
  __decorateParam(2, IProductService)
], ExtensionsProposedApi);

var ApiProposalsMarkdowneRenderer = class extends Disposable {
  constructor() {
    super(...arguments);
    this.type = "markdown";
  }
  shouldRender(manifest) {
    return !!manifest.originalEnabledApiProposals?.length || !!manifest.enabledApiProposals?.length;
  }
  render(manifest) {
    const enabledApiProposals = manifest.originalEnabledApiProposals ?? manifest.enabledApiProposals ?? [];
    const data = new MarkdownString();
    if (enabledApiProposals.length) {
      for (const proposal of enabledApiProposals) {
        data.appendMarkdown(`- \`${proposal}\`
`);
      }
    }
    return {
      data,
      dispose: () => {
      }
    };
  }
};

Registry.as(Extensions11.ExtensionFeaturesRegistry).registerExtensionFeature({
  id: "enabledApiProposals",
  label: localize(23035, null),
  access: {
    canToggle: false
  },
  renderer: new SyncDescriptor(ApiProposalsMarkdowneRenderer)
});
export { ExtensionsProposedApi, ApiProposalsMarkdowneRenderer };
