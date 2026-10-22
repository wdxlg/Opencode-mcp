// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/folding/browser/folding.contribution.ts
import { Disposable } from "./module-0012.mjs";
import { FoldingController } from "./module-0684.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtensionService } from "./module-0889.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { editorConfigurationBaseNode } from "./module-0557.mjs";
import { Extensions10 } from "./module-0872.mjs";


// src/vs/workbench/contrib/folding/browser/folding.contribution.ts
var DefaultFoldingRangeProvider = class extends Disposable {
  constructor(_extensionService, _configurationService) {
    super();
    this._extensionService = _extensionService;
    this._configurationService = _configurationService;
    this._store.add(this._extensionService.onDidChangeExtensions(this._updateConfigValues, this));
    this._store.add(FoldingController.setFoldingRangeProviderSelector(this._selectFoldingRangeProvider.bind(this)));
    this._updateConfigValues();
  }
  static {
    this.configName = "editor.defaultFoldingRangeProvider";
  }
  static {
    this.extensionIds = [];
  }
  static {
    this.extensionItemLabels = [];
  }
  static {
    this.extensionDescriptions = [];
  }
  async _updateConfigValues() {
    await this._extensionService.whenInstalledExtensionsRegistered();
    DefaultFoldingRangeProvider.extensionIds.length = 0;
    DefaultFoldingRangeProvider.extensionItemLabels.length = 0;
    DefaultFoldingRangeProvider.extensionDescriptions.length = 0;
    DefaultFoldingRangeProvider.extensionIds.push(null);
    DefaultFoldingRangeProvider.extensionItemLabels.push(localize(16065, null));
    DefaultFoldingRangeProvider.extensionDescriptions.push(localize(16066, null));
    const languageExtensions = [];
    const otherExtensions = [];
    for (const extension of this._extensionService.extensions) {
      if (extension.main || extension.browser) {
        if (extension.categories?.find((cat) => cat === "Programming Languages")) {
          languageExtensions.push(extension);
        } else {
          otherExtensions.push(extension);
        }
      }
    }
    const sorter3 = (a, b) => a.name.localeCompare(b.name);
    for (const extension of languageExtensions.sort(sorter3)) {
      DefaultFoldingRangeProvider.extensionIds.push(extension.identifier.value);
      DefaultFoldingRangeProvider.extensionItemLabels.push(extension.displayName ?? "");
      DefaultFoldingRangeProvider.extensionDescriptions.push(extension.description ?? "");
    }
    for (const extension of otherExtensions.sort(sorter3)) {
      DefaultFoldingRangeProvider.extensionIds.push(extension.identifier.value);
      DefaultFoldingRangeProvider.extensionItemLabels.push(extension.displayName ?? "");
      DefaultFoldingRangeProvider.extensionDescriptions.push(extension.description ?? "");
    }
  }
  _selectFoldingRangeProvider(providers2, document2) {
    const value2 = this._configurationService.getValue(DefaultFoldingRangeProvider.configName, { overrideIdentifier: document2.getLanguageId() });
    if (value2) {
      return providers2.filter((p) => p.id === value2);
    }
    return void 0;
  }
};

DefaultFoldingRangeProvider = __decorateClass([
  __decorateParam(0, IExtensionService),
  __decorateParam(1, IConfigurationService)
], DefaultFoldingRangeProvider);

Registry.as(Extensions4.Configuration).registerConfiguration({
  ...editorConfigurationBaseNode,
  properties: {
    [DefaultFoldingRangeProvider.configName]: {
      description: localize(16064, null),
      type: ["string", "null"],
      default: null,
      enum: DefaultFoldingRangeProvider.extensionIds,
      enumItemLabels: DefaultFoldingRangeProvider.extensionItemLabels,
      markdownEnumDescriptions: DefaultFoldingRangeProvider.extensionDescriptions
    }
  }
});

Registry.as(Extensions10.Workbench).registerWorkbenchContribution(
  DefaultFoldingRangeProvider,
  3 /* Restored */
);
export { DefaultFoldingRangeProvider };
